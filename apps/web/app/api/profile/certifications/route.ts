import { NextResponse } from 'next/server';
import { newId } from '@career-os/shared';
import { query } from '@career-os/db';
import { writeAudit } from '@/lib/audit';
import { createCertificationSchema } from '../../schemas';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const certifications = await query(
      `SELECT c.* FROM "Certification" c ORDER BY c."issueDate" DESC LIMIT 100`,
    );
    return NextResponse.json({ certifications });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    console.error('GET /api/profile/certifications failed:', message);
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

  const parsed = createCertificationSchema.safeParse(payload);
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
      `INSERT INTO "Certification"
       (id, "profileId", name, issuer, "issueDate", "expirationDate", "credentialUrl")
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        newId(),
        input.profileId,
        input.name,
        input.issuer,
        new Date(input.issueDate),
        input.expirationDate ? new Date(input.expirationDate) : null,
        input.credentialUrl,
      ],
    );
    const created = rows[0];

    await writeAudit({
      actorType: 'USER',
      action: 'CERTIFICATION_CREATED',
      entityType: 'Certification',
      entityId: created?.id,
      after: { name: input.name, issuer: input.issuer },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    console.error('POST /api/profile/certifications failed:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
