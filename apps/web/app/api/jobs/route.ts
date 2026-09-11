import { NextResponse } from 'next/server';
import { hashContent, newId, normalizeCompanyName, normalizeTitle } from '@career-os/shared';
import { transaction } from '@career-os/db';
import { createJobSchema } from '../schemas';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = createJobSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const input = parsed.data;

  const normalizedName = normalizeCompanyName(input.company);
  const descriptionHash = hashContent(input.description);
  const normalizedTitle = normalizeTitle(input.title);

  try {
    const job = await transaction(async (client) => {
      // Upsert company
      const companyResult = await client.query(
        `INSERT INTO "Company" (id, "name", "normalizedName")
         VALUES ($1, $2, $3)
         ON CONFLICT ("normalizedName") DO UPDATE SET "name" = EXCLUDED."name"
         RETURNING id, name`,
        [newId(), input.company, normalizedName]
      );
      const company = companyResult.rows[0];

      // Get MANUAL source
      const sourceResult = await client.query(
        `SELECT id FROM "JobSource" WHERE type = 'MANUAL' LIMIT 1`
      );
      if (!sourceResult.rows.length) {
        throw new Error('JobSource MANUAL not seeded — run seed script');
      }
      const source = sourceResult.rows[0];

      // Create job offer
      const externalId = input.externalId ?? descriptionHash.slice(0, 16);
      const jobResult = await client.query(
        `INSERT INTO "JobOffer" 
         (id, "companyId", "sourceId", "externalId", "title", "normalizedTitle", "location", "remoteType", 
          "description", "descriptionHash", "canonicalUrl", "publishedAt", "discoveredAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
         RETURNING id, title, "normalizedTitle", "descriptionHash"`,
        [
          newId(),
          company.id,
          source.id,
          externalId,
          input.title,
          normalizedTitle,
          input.location,
          input.remoteType,
          input.description,
          descriptionHash,
          input.canonicalUrl,
          input.publishedAt ? new Date(input.publishedAt) : null,
        ]
      );

      return {
        ...jobResult.rows[0],
        company: { name: company.name },
      };
    });

    return NextResponse.json(
      {
        id: job.id,
        title: job.title,
        normalizedTitle: job.normalizedTitle,
        company: job.company.name,
        descriptionHash: job.descriptionHash,
        duplicate: false,
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    const isUniqueViolation = message.includes('unique constraint') || message.includes('duplicate key');
    if (isUniqueViolation) {
      return NextResponse.json(
        { error: 'Duplicate job offer (same source + externalId)' },
        { status: 409 },
      );
    }
    console.error('POST /api/jobs failed:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
