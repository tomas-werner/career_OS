import { NextResponse } from 'next/server';
import { newId } from '@career-os/shared';
import { query } from '@career-os/db';
import { writeAudit } from '@/lib/audit';
import { createContactSchema } from '../schemas';

export const dynamic = 'force-dynamic';

interface ContactListRow {
  id: string;
  companyId: string;
  companyName: string;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  email: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  source: string | null;
  phoneEventCount: string;
}

export async function GET() {
  try {
    const contacts = await query<ContactListRow>(
      `SELECT ct.id, ct."companyId", c.name AS "companyName",
              ct."firstName", ct."lastName", ct.role, ct.email, ct.phone,
              ct."linkedinUrl", ct.source,
              (SELECT COUNT(*) FROM "PhoneEvent" pe WHERE pe."contactId" = ct.id) AS "phoneEventCount"
       FROM "Contact" ct
       JOIN "Company" c ON c.id = ct."companyId"
       ORDER BY ct."lastName" NULLS LAST, ct."firstName" NULLS LAST
       LIMIT 200`,
    );
    return NextResponse.json({ contacts });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    console.error('GET /api/contacts failed:', message);
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

  const parsed = createContactSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const input = parsed.data;

  if (!input.firstName && !input.lastName && !input.email) {
    return NextResponse.json(
      { error: 'At least one of firstName, lastName or email is required' },
      { status: 400 },
    );
  }

  try {
    const companies = await query('SELECT id FROM "Company" WHERE id = $1', [input.companyId]);
    if (!companies.length) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const rows = await query<{ id: string }>(
      `INSERT INTO "Contact"
       (id, "companyId", "firstName", "lastName", role, email, phone, "linkedinUrl", source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        newId(),
        input.companyId,
        input.firstName,
        input.lastName,
        input.role,
        input.email,
        input.phone,
        input.linkedinUrl,
        input.source,
      ],
    );

    await writeAudit({
      actorType: 'USER',
      action: 'CONTACT_CREATED',
      entityType: 'Contact',
      entityId: rows[0]?.id,
      after: { companyId: input.companyId, email: input.email },
    });

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    console.error('POST /api/contacts failed:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
