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
import { generateCoverLetterSchema } from '../../schemas';

export const dynamic = 'force-dynamic';

const LETTER_TEMPLATE_VERSION = 'cover-letter-v1';

interface ApplicationRow {
  id: string;
  jobOfferId: string;
  profileId: string;
  jobTitle: string;
  company: string;
}

interface ProfileRow {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  city: string | null;
  country: string | null;
  headline: string | null;
}

/**
 * Controlled cover-letter generation (plan.md sections 16, 18).
 * Statements come exclusively from VERIFIED claims; the letter introduces the
 * job target (from the Application/JobOffer, which is system data, not
 * invented) and claims selected for relevance.
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = generateCoverLetterSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const input = parsed.data;

  try {
    const applications = await query<ApplicationRow>(
      `SELECT a.id, a."jobOfferId", a."profileId", j.title AS "jobTitle", c.name AS company
       FROM "Application" a
       JOIN "JobOffer" j ON j.id = a."jobOfferId"
       JOIN "Company" c ON c.id = j."companyId"
       WHERE a.id = $1`,
      [input.applicationId],
    );
    const application = applications[0];
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const profiles = await query<ProfileRow>(
      `SELECT "firstName", "lastName", email, phone, city, country, headline
       FROM "CandidateProfile" WHERE id = $1`,
      [application.profileId],
    );
    const profile = profiles[0];
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const claims = await query<ClaimForDocument>(
      `SELECT id, subject, predicate, value, status FROM "Claim" WHERE "profileId" = $1`,
      [application.profileId],
    );
    const selected = input.claimIds
      ? claims.filter((claim) => input.claimIds!.includes(claim.id))
      : claims;

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

    const factCheck = factCheckDocument(cv, selected);
    if (!factCheck.passed) {
      return NextResponse.json(
        { error: 'Fact-check failed', violations: factCheck.violations },
        { status: 422 },
      );
    }

    // Letter assembly: only the job target (system data) + verified claims.
    const skillValues = cv.skillStatements.map((statement) => statement.statement.replace('candidate knows ', ''));
    const lines = [
      `Dear hiring team,`,
      ``,
      `I am applying for the position of ${application.jobTitle} at ${application.company}.`,
    ];
    if (skillValues.length) {
      lines.push(
        ``,
        `My verified professional background demonstrates the following: ${skillValues.join(', ')}.`,
      );
    }
    if (cv.experienceStatements.length) {
      lines.push(``, `Professional experience:`);
      for (const statement of cv.experienceStatements) lines.push(`- ${statement.statement}`);
    }
    if (cv.educationStatements.length) {
      lines.push(``, `Education:`);
      for (const statement of cv.educationStatements) lines.push(`- ${statement.statement}`);
    }
    lines.push(
      ``,
      `I would welcome the opportunity to discuss how my background fits this role.`,
      ``,
      `Best regards,`,
      `${profile.firstName} ${profile.lastName}`,
    );
    const content = lines.join('\n');
    const contentHash = (await import('@career-os/shared')).hashContent(content);

    const saved = await transaction(async (client) => {
      const letterResult = await client.query(
        `INSERT INTO "CoverLetterVersion"
         (id, "applicationId", "templateVersion", "generationModel", "promptVersion", "contentHash", "content")
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          newId(),
          application.id,
          LETTER_TEMPLATE_VERSION,
          'deterministic-selector',
          SUMMARY_PROMPT_VERSION,
          contentHash,
          content,
        ],
      );
      const letterRow = letterResult.rows[0] as { id: string };

      for (const used of [...cv.skillStatements, ...cv.experienceStatements, ...cv.educationStatements, ...cv.summaryStatements]) {
        await client.query(
          `INSERT INTO "CoverLetterClaim" ("coverLetterVersionId", "claimId")
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [letterRow.id, used.claimId],
        );
      }

      await client.query(
        `UPDATE "Application" SET "coverLetterVersionId" = $1 WHERE id = $2`,
        [letterRow.id, application.id],
      );

      return { id: letterRow.id };
    });

    await writeAudit({
      actorType: 'SYSTEM',
      action: 'COVER_LETTER_GENERATED',
      entityType: 'CoverLetterVersion',
      entityId: saved.id,
      after: { contentHash, claimsUsed: cv.claimsUsed.length, applicationId: application.id },
      correlationId: `EMAIL-${saved.id.slice(0, 8).toUpperCase()}`,
    });

    return NextResponse.json(
      {
        letter: {
          id: saved.id,
          content,
          contentHash,
          claimsUsed: cv.claimsUsed,
          templateVersion: LETTER_TEMPLATE_VERSION,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    console.error('POST /api/documents/cover-letter failed:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
