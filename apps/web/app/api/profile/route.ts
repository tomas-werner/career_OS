import { NextResponse } from 'next/server';
import { newId } from '@career-os/shared';
import { query, transaction } from '@career-os/db';
import { writeAudit } from '@/lib/audit';
import { upsertProfileSchema } from '../schemas';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const profiles = await query(
      'SELECT * FROM "CandidateProfile" ORDER BY "createdAt" LIMIT 1',
    );
    return NextResponse.json({ profile: profiles[0] ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    console.error('GET /api/profile failed:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = upsertProfileSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const input = parsed.data;

  try {
    const saved = await transaction(async (client) => {
      const existing = await client.query('SELECT id FROM "CandidateProfile" LIMIT 1');
      const isNew = existing.rows.length === 0;
      const existingId = isNew ? null : existing.rows[0]!.id;

      const result = isNew
        ? await client.query(
            `INSERT INTO "CandidateProfile"
             (id, "firstName", "lastName", "email", "phone", "city", "country", "headline", "summary", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
             RETURNING *`,
            [
              newId(),
              input.firstName,
              input.lastName,
              input.email,
              input.phone,
              input.city,
              input.country,
              input.headline,
              input.summary,
            ],
          )
        : await client.query(
            `UPDATE "CandidateProfile"
             SET "firstName" = $1, "lastName" = $2, "email" = $3, "phone" = $4,
                 "city" = $5, "country" = $6, "headline" = $7, "summary" = $8, "updatedAt" = NOW()
             WHERE id = $9
             RETURNING *`,
            [
              input.firstName,
              input.lastName,
              input.email,
              input.phone,
              input.city,
              input.country,
              input.headline,
              input.summary,
              existingId,
            ],
          );

      return { profile: result.rows[0], action: isNew ? 'PROFILE_CREATED' : 'PROFILE_UPDATED' };
    });

    await writeAudit({
      actorType: 'USER',
      action: saved.action,
      entityType: 'CandidateProfile',
      entityId: saved.profile.id,
      after: { email: input.email },
    });

    return NextResponse.json(saved.profile, { status: isNewResponse(saved.action) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    console.error('PUT /api/profile failed:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function isNewResponse(action: string): 200 | 201 {
  return action === 'PROFILE_CREATED' ? 201 : 200;
}
