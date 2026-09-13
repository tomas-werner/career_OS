import Link from 'next/link';
import { query } from '@career-os/db';
import type { ApplicationStatus } from '@career-os/db';
import NewApplicationForm from './new-application-form';

export const dynamic = 'force-dynamic';

interface ApplicationListRow {
  id: string;
  status: ApplicationStatus;
  createdAt: Date;
  appliedAt: Date | null;
  jobTitle: string;
  company: string;
  jobId: string;
  scoreTotal: number | null;
}

const STATUS_CLASS: Record<string, string> = {
  A_ANALYSER: 'warn',
  A_PREPARER: 'warn',
  A_VALIDER: 'warn',
  PRETE: 'ok',
  ENVOYEE: 'ok',
  REPONSE_RECUE: 'ok',
  ENTRETIEN: 'ok',
  OFFRE: 'ok',
  ACCEPTEE: 'ok',
  REFUSEE: 'err',
  ARCHIVEE: 'muted',
};

export default async function ApplicationsPage() {
  const [applications, jobs, profiles] = await Promise.all([
    query<ApplicationListRow>(
      `SELECT a.id, a.status, a."createdAt", a."appliedAt",
              j.title AS "jobTitle", c.name AS company, j.id AS "jobId",
              sc.total AS "scoreTotal"
       FROM "Application" a
       JOIN "JobOffer" j ON j.id = a."jobOfferId"
       JOIN "Company" c ON c.id = j."companyId"
       LEFT JOIN LATERAL (
         SELECT total FROM "JobScore" s WHERE s."jobOfferId" = j.id
         ORDER BY s."createdAt" DESC LIMIT 1
       ) sc ON true
       ORDER BY a."createdAt" DESC
       LIMIT 100`,
    ),
    query<{ id: string; title: string; company: string }>(
      `SELECT j.id, j.title, c.name AS company
       FROM "JobOffer" j JOIN "Company" c ON c.id = j."companyId"
       ORDER BY j."discoveredAt" DESC LIMIT 100`,
    ),
    query<{ id: string }>('SELECT id FROM "CandidateProfile" ORDER BY "createdAt" LIMIT 1'),
  ]);
  const profile = profiles[0] ?? null;

  return (
    <div>
      <h1>Applications</h1>
      <p className="muted">
        Pipeline tracked through the enforced state machine (plan.md sections
        19-21): A_ANALYSER → A_PREPARER → A_VALIDER → PRETE → ENVOYEE → …
        Invalid transitions are rejected server-side (422).
      </p>

      {profile ? (
        <NewApplicationForm profileId={profile.id} jobs={jobs} />
      ) : (
        <div className="card">
          <p className="muted">Create a profile first to track applications.</p>
        </div>
      )}

      <div className="card">
        <strong>Applications ({applications.length})</strong>
        <table className="table">
          <thead>
            <tr>
              <th>Job</th>
              <th>Company</th>
              <th>Status</th>
              <th>Score</th>
              <th>Applied</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <tr key={application.id}>
                <td>
                  <Link href={`/applications/${application.id}`}>{application.jobTitle}</Link>
                </td>
                <td>{application.company}</td>
                <td>
                  <span className={STATUS_CLASS[application.status] ?? 'muted'}>
                    {application.status}
                  </span>
                </td>
                <td>
                  {application.scoreTotal !== null ? (
                    <strong>{(application.scoreTotal * 100).toFixed(0)}</strong>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
                <td className="muted">
                  {application.appliedAt
                    ? new Date(application.appliedAt).toISOString().slice(0, 10)
                    : '—'}
                </td>
                <td className="muted">
                  {new Date(application.createdAt).toISOString().slice(0, 10)}
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">
                  No applications yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
