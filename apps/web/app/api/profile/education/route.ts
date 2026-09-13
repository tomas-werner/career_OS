import { NextResponse } from 'next/server';
import { newId } from '@career-os/shared';
import { query } from '@career-os/db';
import { writeAudit } from '@/lib/audit';
import { createEducationSchema } from '../../schemas';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const educations = await query(
      `SELECT e.* FROM "Education" e ORDER BY e."startDate" DESC LIMIT 100`,
    );
    return NextResponse.json({ educations });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    console.error('GET /api/profile/education failed:', message);
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

  const parsed = createEducationSchema.safeParse(payload);
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
      `INSERT INTO "Education"
       (id, "profileId", institution, degree, field, "startDate", "endDate", grade)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        newId(),
        input.profileId,
        input.institution,
        input.degree,
        input.field,
        new Date(input.startDate),
        input.endDate ? new Date(input.endDate) : null,
        input.grade,
      ],
    );
    const created = rows[0];

    await writeAudit({
      actorType: 'USER',
      action: 'EDUCATION_CREATED',
      entityType: 'Education',
      entityId: created?.id,
      after: { institution: input.institution, degree: input.degree },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    console.error('POST /api/profile/education failed:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
