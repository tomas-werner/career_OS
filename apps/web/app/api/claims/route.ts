import { NextResponse } from 'next/server';
import { newId, validateClaim } from '@career-os/shared';
import type { EvidenceWithSource } from '@career-os/shared';
import { query, transaction } from '@career-os/db';
import { writeAudit } from '@/lib/audit';
import { createClaimSchema } from '../schemas';

export const dynamic = 'force-dynamic';

interface ClaimRow {
  id: string;
  profileId: string;
  subject: string;
  predicate: string;
  value: string;
  status: string;
  confidence: number;
  createdAt: Date;
  updatedAt: Date;
}

interface EvidenceJoinRow extends EvidenceWithSource {
  claimId: string;
}

export async function GET() {
  try {
    const claims = await query<ClaimRow>(
      `SELECT c.*,
              COUNT(ce."evidenceId") AS "evidenceCount"
       FROM "Claim" c
       LEFT JOIN "ClaimEvidence" ce ON ce."claimId" = c.id
       GROUP BY c.id
       ORDER BY c."updatedAt" DESC
       LIMIT 200`,
    );
    const links = await query<EvidenceJoinRow>(
      `SELECT ce."claimId", e.id, e."sourceId", e.quote, s.type AS "sourceType"
       FROM "ClaimEvidence" ce
       JOIN "Evidence" e ON e.id = ce."evidenceId"
       JOIN "Source" s ON s.id = e."sourceId"`,
    );
    const byClaim = new Map<string, EvidenceWithSource[]>();
    for (const link of links) {
      const list = byClaim.get(link.claimId) ?? [];
      list.push({ id: link.id, sourceId: link.sourceId, quote: link.quote, sourceType: link.sourceType });
      byClaim.set(link.claimId, list);
    }

    return NextResponse.json({
      claims: claims.map((claim) => ({
        ...claim,
        evidence: byClaim.get(claim.id) ?? [],
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    console.error('GET /api/claims failed:', message);
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

  const parsed = createClaimSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const input = parsed.data;

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
      return NextResponse.json(
        { error: 'One or more evidenceIds not found' },
        { status: 404 },
      );
    }

    // Deterministic validation — never AI (plan.md section 15)
    const validation = validateClaim(
      { id: 'pending', subject: input.subject, predicate: input.predicate, value: input.value },
      evidenceRows,
    );

    const created = await transaction(async (client) => {
      const claimResult = await client.query(
        `INSERT INTO "Claim" (id, "profileId", subject, predicate, value, status, confidence, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING *`,
        [
          newId(),
          input.profileId,
          input.subject,
          input.predicate,
          input.value,
          validation.status,
          validation.confidence,
        ],
      );
      const claim = claimResult.rows[0] as ClaimRow;

      for (const evidenceId of input.evidenceIds) {
        await client.query(
          `INSERT INTO "ClaimEvidence" ("claimId", "evidenceId", relationship)
           VALUES ($1, $2, 'SUPPORTS')`,
          [claim.id, evidenceId],
        );
      }

      return claim;
    });

    await writeAudit({
      actorType: 'SYSTEM',
      action: 'CLAIM_CREATED',
      entityType: 'Claim',
      entityId: created.id,
      after: {
        subject: input.subject,
        predicate: input.predicate,
        value: input.value,
        status: validation.status,
        confidence: validation.confidence,
      },
      correlationId: `CLAIM-${created.id.slice(0, 8).toUpperCase()}`,
    });

    return NextResponse.json(
      { claim: created, validation },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    console.error('POST /api/claims failed:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
