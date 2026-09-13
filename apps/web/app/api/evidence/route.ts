import { NextResponse } from 'next/server';
import { newId } from '@career-os/shared';
import { query } from '@career-os/db';
import { writeAudit } from '@/lib/audit';
import { createEvidenceSchema } from '../schemas';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const evidence = await query(
      `SELECT e.id, e.quote, e.location, e."createdAt", e."sourceId",
              s.type AS "sourceType", s.name AS "sourceName"
       FROM "Evidence" e
       JOIN "Source" s ON s.id = e."sourceId"
       ORDER BY e."createdAt" DESC
       LIMIT 200`,
    );
    return NextResponse.json({ evidence });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    console.error('GET /api/evidence failed:', message);
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

  const parsed = createEvidenceSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const input = parsed.data;

  try {
    const sources = await query('SELECT id, type FROM "Source" WHERE id = $1', [input.sourceId]);
    if (!sources.length) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }

    const rows = await query<{ id: string; sourceId: string; snapshotId: string | null; quote: string; location: string | null; createdAt: Date }>(
      `INSERT INTO "Evidence" (id, "sourceId", "snapshotId", quote, location)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, "sourceId", "snapshotId", quote, location, "createdAt"`,
      [newId(), input.sourceId, input.snapshotId, input.quote, input.location],
    );
    const created = rows[0];

    await writeAudit({
      actorType: 'USER',
      action: 'EVIDENCE_CREATED',
      entityType: 'Evidence',
      entityId: created?.id,
      after: { sourceId: input.sourceId, quoteLength: input.quote.length },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    console.error('POST /api/evidence failed:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
