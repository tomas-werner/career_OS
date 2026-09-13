import { query } from '@career-os/db';

export const dynamic = 'force-dynamic';

interface KpiRow {
  jobsDiscovered: number;
  jobsAnalyzed: number;
  jobsScored: number;
  applicationsTotal: number;
  applicationsSent: number;
  responsesReceived: number;
  interviews: number;
  offers: number;
  accepted: number;
  rejected: number;
}

interface MonthlyRow {
  month: string;
  applications: number;
  sent: number;
  interviews: number;
  offers: number;
}

interface TopScoreRow {
  title: string;
  company: string;
  total: number;
}

function rate(numerator: number, denominator: number): string {
  if (denominator === 0) return '—';
  return `${((numerator / denominator) * 100).toFixed(0)}%`;
}

export default async function AnalyticsPage() {
  const [kpiRows, monthly, topScored] = await Promise.all([
    query<KpiRow>(
      `SELECT
         (SELECT COUNT(*)::int FROM "JobOffer") AS "jobsDiscovered",
         (SELECT COUNT(*)::int FROM "JobAnalysis") AS "jobsAnalyzed",
         (SELECT COUNT(DISTINCT "jobOfferId")::int FROM "JobScore") AS "jobsScored",
         (SELECT COUNT(*)::int FROM "Application") AS "applicationsTotal",
         (SELECT COUNT(*)::int FROM "Application" WHERE status IN ('ENVOYEE','REPONSE_RECUE','ENTRETIEN','OFFRE','ACCEPTEE','REFUSEE')) AS "applicationsSent",
         (SELECT COUNT(*)::int FROM "Application" WHERE status IN ('REPONSE_RECUE','ENTRETIEN','OFFRE','ACCEPTEE','REFUSEE')) AS "responsesReceived",
         (SELECT COUNT(*)::int FROM "Application" WHERE status IN ('ENTRETIEN','OFFRE','ACCEPTEE')) AS "interviews",
         (SELECT COUNT(*)::int FROM "Application" WHERE status IN ('OFFRE','ACCEPTEE')) AS "offers",
         (SELECT COUNT(*)::int FROM "Application" WHERE status = 'ACCEPTEE') AS "accepted",
         (SELECT COUNT(*)::int FROM "Application" WHERE status = 'REFUSEE') AS "rejected"`,
    ),
    query<MonthlyRow>(
      `SELECT
         to_char("createdAt", 'YYYY-MM') AS month,
         COUNT(*)::int AS applications,
         COUNT(*) FILTER (WHERE status IN ('ENVOYEE','REPONSE_RECUE','ENTRETIEN','OFFRE','ACCEPTEE','REFUSEE'))::int AS sent,
         COUNT(*) FILTER (WHERE status IN ('ENTRETIEN','OFFRE','ACCEPTEE'))::int AS interviews,
         COUNT(*) FILTER (WHERE status IN ('OFFRE','ACCEPTEE'))::int AS offers
       FROM "Application"
       GROUP BY month
       ORDER BY month DESC
       LIMIT 12`,
    ),
    query<TopScoreRow>(
      `SELECT j.title, c.name AS company, s.total
       FROM "JobScore" s
       JOIN "JobOffer" j ON j.id = s."jobOfferId"
       JOIN "Company" c ON c.id = j."companyId"
       ORDER BY s.total DESC
       LIMIT 10`,
    ),
  ]);

  const kpi = kpiRows[0] ?? {
    jobsDiscovered: 0,
    jobsAnalyzed: 0,
    jobsScored: 0,
    applicationsTotal: 0,
    applicationsSent: 0,
    responsesReceived: 0,
    interviews: 0,
    offers: 0,
    accepted: 0,
    rejected: 0,
  };

  const cards: { label: string; value: string }[] = [
    { label: 'Jobs discovered', value: String(kpi.jobsDiscovered) },
    { label: 'Jobs analyzed', value: String(kpi.jobsAnalyzed) },
    { label: 'Jobs scored', value: String(kpi.jobsScored) },
    { label: 'Applications', value: String(kpi.applicationsTotal) },
    { label: 'Sent', value: String(kpi.applicationsSent) },
    { label: 'Response rate', value: rate(kpi.responsesReceived, kpi.applicationsSent) },
    { label: 'Interview rate', value: rate(kpi.interviews, kpi.applicationsSent) },
    { label: 'Offer rate', value: rate(kpi.offers, kpi.applicationsSent) },
    { label: 'Acceptances', value: String(kpi.accepted) },
    { label: 'Rejections', value: String(kpi.rejected) },
  ];

  return (
    <div>
      <h1>Analytics</h1>
      <p className="muted">
        KPIs per plan.md section 39. Rates derive from the enforced application
        state machine — no response is ever inferred from silence (section 26).
      </p>

      <div className="kpi-grid">
        {cards.map((card) => (
          <div className="card kpi" key={card.label}>
            <strong>{card.value}</strong>
            <span className="muted">{card.label}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <strong>Applications by month</strong>
        <table className="table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Applications</th>
              <th>Sent</th>
              <th>Interviews</th>
              <th>Offers</th>
            </tr>
          </thead>
          <tbody>
            {monthly.map((row) => (
              <tr key={row.month}>
                <td>{row.month}</td>
                <td>{row.applications}</td>
                <td>{row.sent}</td>
                <td>{row.interviews}</td>
                <td>{row.offers}</td>
              </tr>
            ))}
            {monthly.length === 0 && (
              <tr>
                <td colSpan={5} className="muted">
                  No applications yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card">
        <strong>Top scored jobs</strong>
        <table className="table">
          <thead>
            <tr>
              <th>Job</th>
              <th>Company</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {topScored.map((row) => (
              <tr key={`${row.title}-${row.company}`}>
                <td>{row.title}</td>
                <td className="muted">{row.company}</td>
                <td>
                  <strong>{(row.total * 100).toFixed(0)}</strong>
                </td>
              </tr>
            ))}
            {topScored.length === 0 && (
              <tr>
                <td colSpan={3} className="muted">
                  No scored jobs yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
