import { NextResponse } from 'next/server';
import { newId, normalizeText, validateClaim } from '@career-os/shared';
import type { EvidenceWithSource } from '@career-os/shared';
import { query, transaction } from '@career-os/db';
import { writeAudit } from '@/lib/audit';
import { createSkillSchema } from '../../schemas';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const skills = await query(
      `SELECT s.*, c.status AS "claimStatus", c.confidence AS "claimConfidence",
              COUNT(ce."evidenceId") AS "evidenceCount"
       FROM "Skill" s
       LEFT JOIN "Claim" c ON c.subject = 'candidate' AND c.predicate = 'knows' AND c.value = s."normalizedName"
       LEFT JOIN "ClaimEvidence" ce ON ce."claimId" = c.id
       GROUP BY s.id, c.status, c.confidence
       ORDER BY s.name
       LIMIT 200`,
    );
    return NextResponse.json({ skills });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    console.error('GET /api/profile/skills failed:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = createSkillSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const input = parsed.data;
  const normalizedName = normalizeText(input.name);

  try {
    const profiles = await query('SELECT id FROM "CandidateProfile" WHERE id = $1', [
      input.profileId,
    ]);
    if (!profiles.length) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const evidenceRows: EvidenceWithSource[] = input.evidenceIds.length
      ? await query<EvidenceWithSource>(
          `SELECT e.id, e."sourceId", e.quote, s.type AS "sourceType"
           FROM "Evidence" e
           JOIN "Source" s ON s.id = e."sourceId"
           WHERE e.id = ANY($1::text[])`,
          [input.evidenceIds],
        )
      : [];
    if (input.evidenceIds.length > 0 && evidenceRows.length !== input.evidenceIds.length) {
      return NextResponse.json({ error: 'One or more evidenceIds not found' }, { status: 404 });
    }

    // Deterministic validation — the skill claim is validated by code, not AI (§15)
    const validation = validateClaim(
      { id: 'pending', subject: 'candidate', predicate: 'knows', value: normalizedName },
      evidenceRows,
    );

    const created = await transaction(async (client) => {
      const skillResult = await client.query(
        `INSERT INTO "Skill" (id, "profileId", name, "normalizedName", level, category)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [newId(), input.profileId, input.name, normalizedName, input.level, input.category],
      );
      const skill = skillResult.rows[0];

      // Every skill automatically becomes a claim so the fact-checker governs it (§8)
      const claimResult = await client.query(
        `INSERT INTO "Claim" (id, "profileId", subject, predicate, value, status, confidence, "createdAt", "updatedAt")
         VALUES ($1, $2, 'candidate', 'knows', $3, $4, $5, NOW(), NOW())
         RETURNING *`,
        [newId(), input.profileId, normalizedName, validation.status, validation.confidence],
      );
      const claim = claimResult.rows[0];

      for (const evidenceId of input.evidenceIds) {
        await client.query(
          `INSERT INTO "ClaimEvidence" ("claimId", "evidenceId", relationship)
           VALUES ($1, $2, 'SUPPORTS')`,
          [claim.id, evidenceId],
        );
      }

      return { skill, claim };
    });

    await writeAudit({
      actorType: 'SYSTEM',
      action: 'SKILL_CREATED',
      entityType: 'Skill',
      entityId: created.skill.id,
      after: {
        name: input.name,
        claimStatus: validation.status,
        confidence: validation.confidence,
      },
      correlationId: `SKILL-${created.skill.id.slice(0, 8).toUpperCase()}`,
    });

    return NextResponse.json(
      { skill: created.skill, claim: created.claim, validation },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    console.error('POST /api/profile/skills failed:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
