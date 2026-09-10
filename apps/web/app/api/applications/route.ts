import { NextResponse } from 'next/server';
import { prisma } from '@career-os/db';
import { canTransition } from '@career-os/shared';
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
    prisma.jobOffer.findUnique({ where: { id: jobOfferId } }),
    prisma.candidateProfile.findUnique({ where: { id: profileId } }),
  ]);
  if (!job) return NextResponse.json({ error: 'Job offer not found' }, { status: 404 });
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const application = await prisma.application.create({
    data: { jobOfferId, profileId, status: 'A_ANALYSER' },
  });

  const correlationId = `APP-${application.id.slice(0, 8).toUpperCase()}`;
  await prisma.applicationEvent.create({
    data: {
      applicationId: application.id,
      fromStatus: null,
      toStatus: 'A_ANALYSER',
      actorType: 'USER',
      note: 'Application created',
      correlationId,
    },
  });
  await prisma.auditLog.create({
    data: {
      actorType: 'USER',
      action: 'APPLICATION_CREATED',
      entityType: 'Application',
      entityId: application.id,
      after: { status: 'A_ANALYSER', jobOfferId, profileId },
      correlationId,
    },
  });

  return NextResponse.json(
    { id: application.id, status: application.status, correlationId },
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

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });
  if (!application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

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

  const updated = await prisma.$transaction(async (tx) => {
    const app = await tx.application.update({
      where: { id: applicationId },
      data: {
        status: toStatus,
        appliedAt: toStatus === 'ENVOYEE' ? new Date() : application.appliedAt,
      },
    });
    await tx.applicationEvent.create({
      data: {
        applicationId,
        fromStatus,
        toStatus,
        actorType: 'USER',
        note,
        correlationId: `APP-${applicationId.slice(0, 8).toUpperCase()}`,
      },
    });
    await tx.auditLog.create({
      data: {
        actorType: 'USER',
        action: 'APPLICATION_STATUS_CHANGED',
        entityType: 'Application',
        entityId: applicationId,
        before: { status: fromStatus },
        after: { status: toStatus },
        correlationId: `APP-${applicationId.slice(0, 8).toUpperCase()}`,
        metadata: note ? { note } : undefined,
      },
    });
    return app;
  });

  return NextResponse.json({ id: updated.id, status: updated.status });
}

export const runtime = 'nodejs';
