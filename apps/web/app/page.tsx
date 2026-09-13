import Link from 'next/link';
import { query } from '@career-os/db';
import ScoreRing from '@/components/ui/ScoreRing';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';

export const dynamic = 'force-dynamic';

interface HealthRow {
  profile: number;
  evidence: number;
  documents: number;
  applications: number;
  verifiedClaims: number;
  totalClaims: number;
}

interface OpportunityRow {
  id: string;
  title: string;
  company: string;
  location: string | null;
  total: number;
}

interface GapRow {
  requirement: string;
  severity: string;
}

interface KpiRow {
  activeOpportunities: number;
  applications: number;
  interviewRate: number;
}

interface ActivityRow {
  action: string;
  actorType: string;
  entityType: string;
  timestamp: Date;
}

const APPLICATION_STATUSES_ACTIVE = 8;

function pct(value: number, total: number): number {
  return total === 0 ? 0 : value / total;
}

export default async function DashboardPage() {
  const [healthRows, opportunities, gaps, kpiRows, activities, profiles] = await Promise.all([
    query<HealthRow>(
      `SELECT
         (SELECT COUNT(*)::int FROM "CandidateProfile") AS profile,
         (SELECT COUNT(*)::int FROM "Evidence") AS evidence,
         (SELECT COUNT(*)::int FROM "CvVersion") AS documents,
         (SELECT COUNT(*)::int FROM "Application" WHERE status NOT IN ('REFUSEE','ARCHIVEE','ACCEPTEE')) AS applications,
         (SELECT COUNT(*)::int FROM "Claim" WHERE status = 'VERIFIED') AS "verifiedClaims",
         (SELECT COUNT(*)::int FROM "Claim") AS "totalClaims"`,
    ),
    query<OpportunityRow>(
      `SELECT j.id, j.title, c.name AS company, j.location, s.total
       FROM "JobScore" s
       JOIN "JobOffer" j ON j.id = s."jobOfferId"
       JOIN "Company" c ON c.id = j."companyId"
       ORDER BY s.total DESC
       LIMIT 4`,
    ),
    query<GapRow>(
      `SELECT r."originalText" AS requirement, g.severity
       FROM "ScoreGap" g
       JOIN "JobRequirement" r ON r.id = g."requirementId"
       ORDER BY CASE g.severity WHEN 'CRITICAL' THEN 0 WHEN 'MAJOR' THEN 1 ELSE 2 END, r."originalText"
       LIMIT 5`,
    ),
    query<KpiRow>(
      `SELECT
         (SELECT COUNT(*)::int FROM "JobScore") AS "activeOpportunities",
         (SELECT COUNT(*)::int FROM "Application") AS applications,
         (SELECT COUNT(*)::int FROM "Application" WHERE status IN ('ENTRETIEN','OFFRE','ACCEPTEE')) AS "interviewRate"`,
    ),
    query<ActivityRow>(
      `SELECT action, "actorType", "entityType", timestamp
       FROM "AuditLog"
       ORDER BY timestamp DESC
       LIMIT 6`,
    ),
    query<{ id: string }>('SELECT id FROM "CandidateProfile" LIMIT 1'),
  ]);

  const health = healthRows[0] ?? {
    profile: 0,
    evidence: 0,
    documents: 0,
    applications: 0,
    verifiedClaims: 0,
    totalClaims: 0,
  };
  const hasProfile = health.profile > 0;

  // Career Health (§11.3) — explainable sub-scores
  const profileScore = hasProfile ? 0.9 : 0;
  const evidenceScore = Math.min(1, health.evidence / 5);
  const documentsScore = Math.min(1, health.documents / 2);
  const applicationsScore = Math.min(1, health.applications / APPLICATION_STATUSES_ACTIVE);
  const claimScore = pct(health.verifiedClaims, health.totalClaims || 1);
  const careerHealth = Math.round(
    ((profileScore + evidenceScore + documentsScore + applicationsScore + claimScore) / 5) * 100,
  );

  const kpi = kpiRows[0] ?? { activeOpportunities: 0, applications: 0, interviewRate: 0 };
  const interviewRatePct = kpi.applications > 0 ? kpi.interviewRate / kpi.applications : 0;

  const healthBars: { label: string; value: number }[] = [
    { label: 'Profile', value: profileScore },
    { label: 'Evidence', value: evidenceScore },
    { label: 'Documents', value: documentsScore },
    { label: 'Applications', value: applicationsScore },
    { label: 'Claims', value: claimScore },
  ];

  // Recommended actions (§15) — derived from real data
  const actions: { label: string; href: string }[] = [];
  if (!hasProfile) actions.push({ label: 'Create your master profile', href: '/profile' });
  if (health.totalClaims > health.verifiedClaims)
    actions.push({
      label: `Add evidence for ${health.totalClaims - health.verifiedClaims} unverified claim(s)`,
      href: '/claims',
    });
  if (opportunities.length > 0)
    actions.push({ label: `Review ${opportunities.length} scored job(s)`, href: '/jobs' });
  if (gaps.some((gap) => gap.severity === 'CRITICAL'))
    actions.push({ label: 'Address critical skill gaps', href: '/jobs' });
  if (health.documents === 0 && hasProfile)
    actions.push({ label: 'Generate your first CV from verified claims', href: '/documents' });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      <h1>{greeting}</h1>
      <p className="muted">Your career command center — evidence first, decisions explained.</p>

      <div className="dash-grid">
        <div className="dash-kpis">
          <div className="card kpi">
            <strong>{careerHealth}%</strong>
            <span className="muted">Career Health</span>
          </div>
          <div className="card kpi">
            <strong>{kpi.activeOpportunities}</strong>
            <span className="muted">Scored Opportunities</span>
          </div>
          <div className="card kpi">
            <strong>{kpi.applications}</strong>
            <span className="muted">Applications</span>
          </div>
          <div className="card kpi">
            <strong>{(interviewRatePct * 100).toFixed(0)}%</strong>
            <span className="muted">Interview Rate</span>
          </div>
        </div>

        <div className="card dash-card wide">
          <h3>Opportunity radar — top matches</h3>
          {opportunities.length > 0 ? (
            opportunities.map((job) => (
              <div className="opportunity-item" key={job.id}>
                <ScoreRing score={job.total} size={64} />
                <div className="opp-info">
                  <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                  <span className="muted">
                    {job.company}
                    {job.location ? ` · ${job.location}` : ''}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              title="No scored opportunities yet"
              description="Ingest a job offer and run AI analysis + deterministic scoring to see matches."
              action={{ label: 'Open jobs', href: '/jobs' }}
            />
          )}
        </div>

        <div className="card dash-card">
          <h3>Career health</h3>
          <div className="health-bars">
            {healthBars.map((bar) => (
              <div className="health-bar" key={bar.label}>
                <span>{bar.label}</span>
                <div className="health-track">
                  <div
                    className={`health-fill ${bar.value >= 0.75 ? 'high' : bar.value < 0.4 ? 'low' : ''}`}
                    style={{ width: `${Math.max(2, bar.value * 100)}%` }}
                  />
                </div>
                <span className="muted">{Math.round(bar.value * 100)}%</span>
              </div>
            ))}
          </div>
          <p className="muted" style={{ marginTop: 'var(--sp-2)' }}>
            {health.verifiedClaims}/{health.totalClaims || 0} claims verified ·{' '}
            {health.evidence} evidence items
          </p>
        </div>

        <div className="card dash-card wide">
          <h3>Skill gap radar</h3>
          {gaps.length > 0 ? (
            gaps.map((gap, index) => (
              <div className="gap-item" key={index}>
                <StatusBadge
                  kind={
                    gap.severity === 'CRITICAL' ? 'ERROR' : gap.severity === 'MAJOR' ? 'WARNING' : 'INFO'
                  }
                  label={gap.severity}
                />
                <span>{gap.requirement}</span>
                <span className="muted">— required by scored jobs, missing from profile</span>
              </div>
            ))
          ) : (
            <p className="muted">No gaps detected — run analysis on job offers to surface gaps.</p>
          )}
        </div>

        <div className="card dash-card">
          <h3>Next best actions</h3>
          {actions.length > 0 ? (
            actions.map((action) => (
              <div className="action-item" key={action.label}>
                <span aria-hidden>→</span>
                <Link href={action.href}>{action.label}</Link>
              </div>
            ))
          ) : (
            <p className="muted">All caught up — your career system is in good shape.</p>
          )}
        </div>

        <div className="card dash-card wide">
          <h3>Recent activity</h3>
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <div className="activity-item" key={index}>
                <span className="activity-time">
                  {new Date(activity.timestamp).toISOString().slice(11, 16)}
                </span>
                <span>{activity.action.replace(/_/g, ' ').toLowerCase()}</span>
                <span className="muted">({activity.entityType})</span>
              </div>
            ))
          ) : (
            <p className="muted">No activity recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
