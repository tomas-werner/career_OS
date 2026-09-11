import { NextResponse } from 'next/server';
import { query, transaction } from '@career-os/db';
import { canTransition, newId } from '@career-os/shared';
import { createApplicationSchema, transitionSchema } from '../schemas';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = createApplicationSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { jobOfferId, profileId } = parsed.data;

  const [job, profile] = await Promise.all([
    query('SELECT * FROM "JobOffer" WHERE id = $1', [jobOfferId]),
    query('SELECT * FROM "CandidateProfile" WHERE id = $1', [profileId]),
  ]);
  
  if (!job.length) return NextResponse.json({ error: 'Job offer not found' }, { status: 404 });
  if (!profile.length) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const application = await transaction(async (client) => {
    const applicationId = newId();
    const result = await client.query(
      `INSERT INTO "Application" (id, "jobOfferId", "profileId", "status", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, 'A_ANALYSER', NOW(), NOW())
       RETURNING id, status`,
      [applicationId, jobOfferId, profileId]
    );
    const app = result.rows[0];
    const correlationId = `APP-${app.id.slice(0, 8).toUpperCase()}`;
    
    await client.query(
      `INSERT INTO "ApplicationEvent" (id, "applicationId", "fromStatus", "toStatus", "actorType", "note", "correlationId", "createdAt")
       VALUES ($1, $2, NULL, 'A_ANALYSER', 'USER', 'Application created', $3, NOW())`,
      [newId(), app.id, correlationId]
    );
    
    await client.query(
      `INSERT INTO "AuditLog" (id, "actorType", "action", "entityType", "entityId", "after", "correlationId", "timestamp")
       VALUES ($1, 'USER', 'APPLICATION_CREATED', 'Application', $2, $3::jsonb, $4, NOW())`,
      [newId(), app.id, JSON.stringify({ status: 'A_ANALYSER', jobOfferId, profileId }), correlationId]
    );
    
    return { ...app, correlationId };
  });

  return NextResponse.json(
    { id: application.id, status: application.status, correlationId: application.correlationId },
    { status: 201 },
  );
}

export async function PATCH(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = transitionSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const { applicationId, toStatus, note } = parsed.data;

  const applications = await query('SELECT * FROM "Application" WHERE id = $1', [applicationId]);
  if (!applications.length) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  const application = applications[0];
  const fromStatus = application.status;
  if (!canTransition(fromStatus, toStatus)) {
    return NextResponse.json(
      {
        error: 'Invalid state transition',
        fromStatus,
        toStatus,
        hint: 'See plan.md section 20 — the state machine is enforced server-side.',
      },
      { status: 422 },
    );
  }

  const updated = await transaction(async (client) => {
    const appliedAt = toStatus === 'ENVOYEE' ? new Date() : application.appliedAt;
    const result = await client.query(
      `UPDATE "Application" 
       SET status = $1, "appliedAt" = $2, "updatedAt" = NOW()
       WHERE id = $3
       RETURNING id, status`,
      [toStatus, appliedAt, applicationId]
    );
    
    const correlationId = `APP-${applicationId.slice(0, 8).toUpperCase()}`;
    
    await client.query(
      `INSERT INTO "ApplicationEvent" (id, "applicationId", "fromStatus", "toStatus", "actorType", "note", "correlationId", "createdAt")
       VALUES ($1, $2, $3, $4, 'USER', $5, $6, NOW())`,
      [newId(), applicationId, fromStatus, toStatus, note, correlationId]
    );
    
    await client.query(
      `INSERT INTO "AuditLog" (id, "actorType", "action", "entityType", "entityId", "before", "after", "correlationId", "metadata", "timestamp")
       VALUES ($1, 'USER', 'APPLICATION_STATUS_CHANGED', 'Application', $2, $3::jsonb, $4::jsonb, $5, $6::jsonb, NOW())`,
      [
        newId(),
        applicationId,
        JSON.stringify({ status: fromStatus }),
        JSON.stringify({ status: toStatus }),
        correlationId,
        note ? JSON.stringify({ note }) : null
      ]
    );
    
    return result.rows[0];
  });

  return NextResponse.json({ id: updated.id, status: updated.status });
}

export const runtime = 'nodejs';
