import { NextResponse } from 'next/server';
import {
  newId,
  buildCvModel,
  factCheckDocument,
  TEMPLATE_VERSION,
  SUMMARY_PROMPT_VERSION,
} from '@career-os/shared';
import type { ClaimForDocument } from '@career-os/shared';
import { query, transaction } from '@career-os/db';
import { writeAudit } from '@/lib/audit';
import { generateCvSchema } from '../../schemas';

export const dynamic = 'force-dynamic';

interface ProfileRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  city: string | null;
  country: string | null;
  headline: string | null;
}

interface ClaimRow extends ClaimForDocument {}

/**
 * Controlled CV generation (plan.md sections 16-17).
 * The model is built deterministically from VERIFIED claims only; the
 * fact-check (§15/§8) runs server-side and the generation is aborted when any
 * statement resolves to a non-verified claim.
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = generateCvSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const input = parsed.data;

  try {
    const profiles = await query<ProfileRow>(
      `SELECT id, "firstName", "lastName", email, phone, city, country, headline
       FROM "CandidateProfile" WHERE id = $1`,
      [input.profileId],
    );
    const profile = profiles[0];
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const claims = await query<ClaimRow>(
      `SELECT id, subject, predicate, value, status FROM "Claim" WHERE "profileId" = $1`,
      [input.profileId],
    );

    const selected = input.claimIds
      ? claims.filter((claim) => input.claimIds!.includes(claim.id))
      : claims;

    // Deterministic controlled generation — VERIFIED claims only (§16).
    const cv = buildCvModel(
      {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        city: profile.city,
        country: profile.country,
        headline: profile.headline,
      },
      selected,
    );

    // Fact-check gate: refuse to persist any document with a violation (§8).
    const factCheck = factCheckDocument(cv, selected);
    if (!factCheck.passed) {
      await writeAudit({
        actorType: 'SYSTEM',
        action: 'AI_ERROR',
        entityType: 'CvVersion',
        entityId: 'pending',
        metadata: { violations: factCheck.violations, stage: 'cv-fact-check' },
      });
      return NextResponse.json(
        { error: 'Fact-check failed — document would contain unsupported claims', violations: factCheck.violations },
        { status: 422 },
      );
    }

    const saved = await transaction(async (client) => {
      const cvResult = await client.query(
        `INSERT INTO "CvVersion"
         (id, "profileId", "applicationId", "templateVersion", "generationModel", "promptVersion", "contentHash", "content")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, "contentHash", "createdAt"`,
        [
          newId(),
          input.profileId,
          null,
          TEMPLATE_VERSION,
          'deterministic-selector',
          SUMMARY_PROMPT_VERSION,
          cv.contentHash,
          cv.content,
        ],
      );
      const cvRow = cvResult.rows[0] as { id: string };

      // Provenance (§17): CvClaim links each used statement back to its claim.
      for (const used of cv.claimsUsed) {
        await client.query(
          `INSERT INTO "CvClaim" ("cvVersionId", "claimId", usage)
           VALUES ($1, $2, $3)
           ON CONFLICT DO NOTHING`,
          [cvRow.id, used.claimId, used.usage],
        );
      }

      return { id: cvRow.id, contentHash: cv.contentHash };
    });

    await writeAudit({
      actorType: 'SYSTEM',
      action: 'CV_GENERATED',
      entityType: 'CvVersion',
      entityId: saved.id,
      after: {
        contentHash: saved.contentHash,
        claimsUsed: cv.claimsUsed.length,
        verifiedPool: selected.filter((claim) => claim.status === 'VERIFIED').length,
      },
      correlationId: `CV-${saved.id.slice(0, 8).toUpperCase()}`,
    });

    return NextResponse.json(
      {
        cv: {
          id: saved.id,
          contentHash: saved.contentHash,
          content: cv.content,
          claimsUsed: cv.claimsUsed,
          templateVersion: TEMPLATE_VERSION,
          promptVersion: SUMMARY_PROMPT_VERSION,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    console.error('POST /api/documents/cv failed:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const versions = await query(
      `SELECT v.id, v."contentHash", v."templateVersion", v."generationModel", v."promptVersion",
              v."createdAt", v."content",
              (SELECT COUNT(*) FROM "CvClaim" cc WHERE cc."cvVersionId" = v.id) AS "claimsUsed"
       FROM "CvVersion" v
       ORDER BY v."createdAt" DESC
       LIMIT 100`,
    );
    return NextResponse.json({ cvs: versions });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    console.error('GET /api/documents/cv failed:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
