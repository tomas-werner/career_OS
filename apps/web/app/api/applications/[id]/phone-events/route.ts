import { NextResponse } from 'next/server';
import { z } from 'zod';
import { newId } from '@career-os/shared';
import { query } from '@career-os/db';
import { writeAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

const phoneEventSchema = z.object({
  direction: z.enum(['INBOUND', 'OUTBOUND']),
  outcome: z.string().max(200).optional(),
  notes: z.string().max(5000).optional(),
  contactId: z.string().min(1).optional(),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = phoneEventSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const input = parsed.data;

  try {
    const applications = await query('SELECT id FROM "Application" WHERE id = $1', [id]);
    if (!applications.length) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    if (input.contactId) {
      const contacts = await query('SELECT id FROM "Contact" WHERE id = $1', [input.contactId]);
      if (!contacts.length) {
        return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
      }
    }

    const rows = await query<{ id: string }>(
      `INSERT INTO "PhoneEvent" (id, "applicationId", "contactId", date, direction, outcome, notes)
       VALUES ($1, $2, $3, NOW(), $4, $5, $6)
       RETURNING *`,
      [newId(), id, input.contactId, input.direction, input.outcome, input.notes],
    );

    await writeAudit({
      actorType: 'USER',
      action: 'PHONE_EVENT_RECORDED',
      entityType: 'PhoneEvent',
      entityId: rows[0]?.id,
      after: { applicationId: id, direction: input.direction, outcome: input.outcome },
      correlationId: `APP-${id.slice(0, 8).toUpperCase()}`,
    });

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    console.error('POST /api/applications/[id]/phone-events failed:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
