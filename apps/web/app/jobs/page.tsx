import Link from 'next/link';
import { query } from '@career-os/db';

export const dynamic = 'force-dynamic';

interface JobListRow {
  id: string;
  title: string;
  location: string | null;
  remoteType: string | null;
  company: string;
  discoveredAt: Date;
  totalScore: number | null;
  hasAnalysis: boolean;
}

export default async function JobsPage() {
  const jobs = await query<JobListRow>(
    `SELECT j.id, j.title, j.location, j."remoteType", c.name AS company,
            j."discoveredAt",
            s.total AS "totalScore",
            (SELECT COUNT(*) FROM "JobAnalysis" a WHERE a."jobOfferId" = j.id) > 0 AS "hasAnalysis"
     FROM "JobOffer" j
     JOIN "Company" c ON c.id = j."companyId"
     LEFT JOIN LATERAL (
       SELECT total FROM "JobScore" sc WHERE sc."jobOfferId" = j.id
       ORDER BY sc."createdAt" DESC LIMIT 1
     ) s ON true
     ORDER BY j."discoveredAt" DESC
     LIMIT 100`,
  );

  return (
    <div>
      <h1>Jobs</h1>
      <p className="muted">
        Ingested job offers (plan.md sections 9-12). Analysis and scoring are run
        from the job detail page; scores are deterministic and reproducible.
      </p>
      <div className="card">
        <strong>Job offers ({jobs.length})</strong>
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Company</th>
              <th>Location</th>
              <th>Analysis</th>
              <th>Score</th>
              <th>Discovered</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>
                  <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                </td>
                <td>{job.company}</td>
                <td className="muted">
                  {job.location ?? '—'} {job.remoteType ? `(${job.remoteType})` : ''}
                </td>
                <td>{job.hasAnalysis ? <span className="ok">analyzed</span> : <span className="muted">—</span>}</td>
                <td>
                  {job.totalScore !== null ? (
                    <strong>{(job.totalScore * 100).toFixed(0)}/100</strong>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
                <td className="muted">{new Date(job.discoveredAt).toISOString().slice(0, 10)}</td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">
                  No jobs ingested yet — POST /api/jobs.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
