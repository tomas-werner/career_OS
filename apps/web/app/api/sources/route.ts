import { NextResponse } from 'next/server';
import { newId } from '@career-os/shared';
import { query } from '@career-os/db';
import { writeAudit } from '@/lib/audit';
import { createSourceSchema } from '../schemas';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sources = await query(
      `SELECT s.*, COUNT(e.id) AS "evidenceCount"
       FROM "Source" s
       LEFT JOIN "Evidence" e ON e."sourceId" = s.id
       GROUP BY s.id
       ORDER BY s."createdAt" DESC
       LIMIT 200`,
    );
    return NextResponse.json({ sources });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    console.error('GET /api/sources failed:', message);
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

  const parsed = createSourceSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const input = parsed.data;

  try {
    const rows = await query<{ id: string; type: string; name: string; uri: string | null; createdAt: Date }>(
      `INSERT INTO "Source" (id, type, name, uri)
       VALUES ($1, $2, $3, $4)
       RETURNING id, type, name, uri, "createdAt"`,
      [newId(), input.type, input.name, input.uri],
    );
    const source = rows[0];

    await writeAudit({
      actorType: 'USER',
      action: 'SOURCE_CREATED',
      entityType: 'Source',
      entityId: source?.id,
      after: { type: input.type, name: input.name },
    });

    return NextResponse.json(source, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    console.error('POST /api/sources failed:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
