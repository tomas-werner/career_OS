import Link from 'next/link';
import { query } from '@career-os/db';
import ScoreRing from '@/components/ui/ScoreRing';
import EmptyState from '@/components/ui/EmptyState';
import NewJobForm from './new-job-form';

export const dynamic = 'force-dynamic';

interface JobCardRow {
  id: string;
  title: string;
  company: string;
  location: string | null;
  remoteType: string | null;
  sourceName: string;
  total: number | null;
  hasAnalysis: boolean;
  criticalGaps: number;
  totalGaps: number;
}

export default async function JobsPage() {
  const jobs = await query<JobCardRow>(
    `SELECT j.id, j.title, c.name AS company, j.location, j."remoteType", s.name AS "sourceName",
            sc.total,
            (SELECT COUNT(*) > 0 FROM "JobAnalysis" a WHERE a."jobOfferId" = j.id) AS "hasAnalysis",
            (SELECT COUNT(*)::int FROM "ScoreGap" g
             JOIN "JobScore" s2 ON s2.id = g."jobScoreId"
             WHERE s2."jobOfferId" = j.id AND g.severity = 'CRITICAL'
             AND s2."createdAt" = (SELECT MAX("createdAt") FROM "JobScore" WHERE "jobOfferId" = j.id)) AS "criticalGaps",
            (SELECT COUNT(*)::int FROM "ScoreGap" g
             JOIN "JobScore" s2 ON s2.id = g."jobScoreId"
             WHERE s2."jobOfferId" = j.id
             AND s2."createdAt" = (SELECT MAX("createdAt") FROM "JobScore" WHERE "jobOfferId" = j.id)) AS "totalGaps"
     FROM "JobOffer" j
     JOIN "Company" c ON c.id = j."companyId"
     JOIN "JobSource" s ON s.id = j."sourceId"
     LEFT JOIN LATERAL (
       SELECT total FROM "JobScore" sc WHERE sc."jobOfferId" = j.id
       ORDER BY sc."createdAt" DESC LIMIT 1
     ) sc ON true
     ORDER BY COALESCE(sc.total, -1) DESC, j."discoveredAt" DESC
     LIMIT 100`,
  );

  return (
    <div>
      <h1>Opportunities</h1>
      <p className="muted">
        Every score is deterministic and explained — open a job to see the
        breakdown, gaps and evidence-based recommendation.
      </p>
      <NewJobForm />
      {jobs.length > 0 ? (
        jobs.map((job) => (
          <div className="card job-card" key={job.id}>
            <div className="job-main">
              <div className="job-head">
                <Link href={`/jobs/${job.id}`}>{job.title}</Link>
              </div>
              <div className="job-meta">
                {job.company}
                {job.location ? ` · ${job.location}` : ''}
                {job.remoteType ? ` · ${job.remoteType}` : ''} · via {job.sourceName}
              </div>
              <div className="job-dims">
                <span>
                  analysis: <b>{job.hasAnalysis ? 'yes' : 'pending'}</b>
                </span>
                {job.totalGaps > 0 && (
                  <span>
                    gaps: <b className={job.criticalGaps > 0 ? 'err' : ''}>{job.totalGaps}</b>
                    {job.criticalGaps > 0 ? ` (${job.criticalGaps} critical)` : ''}
                  </span>
                )}
              </div>
            </div>
            <div className="job-side">
              {job.total !== null ? (
                <>
                  <ScoreRing score={job.total} size={80} />
                  <Link href={`/jobs/${job.id}`} className="muted">
                    View →
                  </Link>
                </>
              ) : (
                <Link href={`/jobs/${job.id}`} className="button">
                  Analyze
                </Link>
              )}
            </div>
          </div>
        ))
      ) : (
        <EmptyState
          title="No opportunities yet"
          description="Career OS hasn't found any opportunities matching your current setup. Ingest your first job offer to start matching."
        />
      )}
    </div>
  );
}
