import { NextResponse } from 'next/server';
import { newId } from '@career-os/shared';
import { query } from '@career-os/db';
import { writeAudit } from '@/lib/audit';
import { createExperienceSchema } from '../../schemas';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const experiences = await query(
      `SELECT e.* FROM "Experience" e ORDER BY e."startDate" DESC LIMIT 100`,
    );
    return NextResponse.json({ experiences });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    console.error('GET /api/profile/experiences failed:', message);
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

  const parsed = createExperienceSchema.safeParse(payload);
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

    const rows = await query<{ id: string }>(
      `INSERT INTO "Experience"
       (id, "profileId", company, role, location, "startDate", "endDate", current, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        newId(),
        input.profileId,
        input.company,
        input.role,
        input.location,
        new Date(input.startDate),
        input.endDate ? new Date(input.endDate) : null,
        input.current,
        input.description,
      ],
    );
    const created = rows[0];

    await writeAudit({
      actorType: 'USER',
      action: 'EXPERIENCE_CREATED',
      entityType: 'Experience',
      entityId: created?.id,
      after: { company: input.company, role: input.role },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    console.error('POST /api/profile/experiences failed:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
