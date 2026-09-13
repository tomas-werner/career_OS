import { notFound } from 'next/navigation';
import Link from 'next/link';
import { query } from '@career-os/db';
import type { ApplicationStatus } from '@career-os/db';
import { APPLICATION_TRANSITIONS } from '@career-os/shared/types';
import TransitionControls from './transition-controls';
import PhoneEventForm from './phone-event-form';

export const dynamic = 'force-dynamic';

interface ApplicationRow {
  id: string;
  status: ApplicationStatus;
  appliedAt: Date | null;
  createdAt: Date;
  cvVersionId: string | null;
  coverLetterVersionId: string | null;
}

interface JobRow {
  jobId: string;
  jobTitle: string;
  company: string;
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

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const applications = await query<ApplicationRow>(
    `SELECT id, status, "appliedAt", "createdAt", "cvVersionId", "coverLetterVersionId"
     FROM "Application" WHERE id = $1`,
    [id],
  );
  const application = applications[0];
  if (!application) notFound();

  const [jobs, events, phoneEvents] = await Promise.all([
    query<JobRow>(
      `SELECT j.id AS "jobId", j.title AS "jobTitle", c.name AS company
       FROM "Application" a
       JOIN "JobOffer" j ON j.id = a."jobOfferId"
       JOIN "Company" c ON c.id = j."companyId"
       WHERE a.id = $1`,
      [id],
    ),
    query<EventRow>(
      `SELECT id, "fromStatus", "toStatus", "actorType", note, "correlationId", "createdAt"
       FROM "ApplicationEvent" WHERE "applicationId" = $1 ORDER BY "createdAt" ASC`,
      [id],
    ),
    query<PhoneEventRow>(
      `SELECT id, date, direction, outcome, notes
       FROM "PhoneEvent" WHERE "applicationId" = $1 ORDER BY date DESC`,
      [id],
    ),
  ]);
  const job = jobs[0];
  const validTransitions: readonly string[] = APPLICATION_TRANSITIONS[application.status] ?? [];

  return (
    <div>
      <h1>{job?.jobTitle ?? 'Application'}</h1>
      <p className="muted">
        {job ? (
          <>
            <Link href={`/jobs/${job.jobId}`}>{job.company}</Link> ·{' '}
          </>
        ) : null}
        status <strong>{application.status}</strong> · created{' '}
        {new Date(application.createdAt).toISOString().slice(0, 10)}
        {application.appliedAt
          ? ` · applied ${new Date(application.appliedAt).toISOString().slice(0, 10)}`
          : ''}
      </p>

      <div className="card">
        <strong>State machine actions (§20)</strong>
        <p className="muted">
          Only valid transitions are offered; the server re-validates every
          PATCH with the shared state machine — the UI is never the enforcement
          mechanism.
        </p>
        <TransitionControls applicationId={id} currentStatus={application.status} validTransitions={[...validTransitions]} />
      </div>

      <div className="card">
        <strong>Timeline — ApplicationEvents ({events.length})</strong>
        <table className="table">
          <thead>
            <tr>
              <th>When</th>
              <th>Transition</th>
              <th>Actor</th>
              <th>Note</th>
              <th>Correlation</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td className="muted">
                  {new Date(event.createdAt).toISOString().slice(0, 16).replace('T', ' ')}
                </td>
                <td>
                  {event.fromStatus ? (
                    <>
                      {event.fromStatus} → <strong>{event.toStatus}</strong>
                    </>
                  ) : (
                    <strong>{event.toStatus}</strong>
                  )}
                </td>
                <td>
                  <code>{event.actorType}</code>
                </td>
                <td className="muted">{event.note ?? '—'}</td>
                <td>
                  <code>{event.correlationId}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <strong>Phone events ({phoneEvents.length}) — §22</strong>
        <ul>
          {phoneEvents.map((event) => (
            <li key={event.id}>
              <code>{event.direction}</code>{' '}
              <span className="muted">
                {new Date(event.date).toISOString().slice(0, 16).replace('T', ' ')}
                {event.outcome ? ` · ${event.outcome}` : ''}
              </span>
              {event.notes && <p className="muted">{event.notes}</p>}
            </li>
          ))}
          {phoneEvents.length === 0 && <li className="muted">None recorded.</li>}
        </ul>
        <PhoneEventForm applicationId={id} />
      </div>
    </div>
  );
}
