import { NextResponse } from 'next/server';
import { APPLICATION_TRANSITIONS } from '@career-os/shared/types';
import type { ApplicationStatus } from '@career-os/db';
import { query } from '@career-os/db';

export const dynamic = 'force-dynamic';

interface ApplicationRow {
  id: string;
  status: ApplicationStatus;
  appliedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  cvVersionId: string | null;
  coverLetterVersionId: string | null;
}

interface JobRow {
  title: string;
  company: string;
  jobId: string;
}

interface EventRow {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  actorType: string;
  note: string | null;
  correlationId: string;
  createdAt: Date;
}

interface PhoneEventRow {
  id: string;
  date: Date;
  direction: string;
  outcome: string | null;
  notes: string | null;
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const applications = await query<ApplicationRow>(
      `SELECT id, status, "appliedAt", "createdAt", "updatedAt", "cvVersionId", "coverLetterVersionId"
       FROM "Application" WHERE id = $1`,
      [id],
    );
    const application = applications[0];
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const [jobs, events, phoneEvents] = await Promise.all([
      query<JobRow>(
        `SELECT j.title, c.name AS company, j.id AS "jobId"
         FROM "Application" a
         JOIN "JobOffer" j ON j.id = a."jobOfferId"
         JOIN "Company" c ON c.id = j."companyId"
         WHERE a.id = $1`,
        [id],
      ),
      query<EventRow>(
        `SELECT id, "fromStatus", "toStatus", "actorType", note, "correlationId", "createdAt"
         FROM "ApplicationEvent" WHERE "applicationId" = $1
         ORDER BY "createdAt" ASC`,
        [id],
      ),
      query<PhoneEventRow>(
        `SELECT id, date, direction, outcome, notes
         FROM "PhoneEvent" WHERE "applicationId" = $1
         ORDER BY date DESC`,
        [id],
      ),
    ]);

    // Valid transitions computed from the shared state machine — the UI
    // uses this to render allowed actions; the server re-validates on PATCH.
    const validTransitions: readonly string[] = APPLICATION_TRANSITIONS[application.status] ?? [];

    return NextResponse.json({
      application: {
        ...application,
        job: jobs[0] ?? null,
      },
      events,
      phoneEvents,
      validTransitions,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    console.error('GET /api/applications/[id] failed:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
