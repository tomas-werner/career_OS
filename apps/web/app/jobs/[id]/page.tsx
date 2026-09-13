import { notFound } from 'next/navigation';
import Link from 'next/link';
import { query } from '@career-os/db';
import ScoreRing from '@/components/ui/ScoreRing';
import MatchBreakdown from '@/components/ui/MatchBreakdown';
import StatusBadge from '@/components/ui/StatusBadge';
import AnalyzeScoreButtons from './analyze-score-buttons';

export const dynamic = 'force-dynamic';

interface JobDetail {
  id: string;
  title: string;
  location: string | null;
  remoteType: string | null;
  description: string;
  descriptionHash: string;
  discoveredAt: Date;
  company: string;
  sourceName: string;
}

interface AnalysisDetail {
  id: string;
  title: string;
  seniority: string | null;
  requiredSkills: string[];
  preferredSkills: string[];
  tools: string[];
  technologies: string[];
  keywords: string[];
  educationRequirements: string[];
  experienceRequirements: string[];
  extractedBy: string;
  promptVersion: string;
  createdAt: Date;
}

interface ScoreDetail {
  id: string;
  total: number;
  educationScore: number;
  experienceScore: number;
  skillsScore: number;
  toolsScore: number;
  keywordScore: number;
  ruleVersion: number;
  ruleName: string;
}

interface GapRow {
  severity: string;
  reason: string;
  requirement: string;
}

interface ProfileSkillsRow {
  normalizedName: string;
}

function fmtDate(date: Date | null): string {
  return date ? new Date(date).toISOString().slice(0, 10) : '—';
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const jobs = await query<JobDetail>(
    `SELECT j.id, j.title, j.location, j."remoteType", j.description, j."descriptionHash",
            j."discoveredAt", c.name AS company, s.name AS "sourceName"
     FROM "JobOffer" j
     JOIN "Company" c ON c.id = j."companyId"
     JOIN "JobSource" s ON s.id = j."sourceId"
     WHERE j.id = $1`,
    [id],
  );
  const job = jobs[0];
  if (!job) notFound();

  const [analyses, scores, profileSkills] = await Promise.all([
    query<AnalysisDetail>(
      `SELECT * FROM "JobAnalysis" WHERE "jobOfferId" = $1 ORDER BY "createdAt" DESC LIMIT 1`,
      [id],
    ),
    query<ScoreDetail>(
      `SELECT sc.*, sr.version AS "ruleVersion", sr.name AS "ruleName"
       FROM "JobScore" sc
       JOIN "ScoreRuleVersion" sr ON sr.id = sc."ruleVersionId"
       WHERE sc."jobOfferId" = $1
       ORDER BY sc."createdAt" DESC LIMIT 1`,
      [id],
    ),
    query<ProfileSkillsRow>('SELECT "normalizedName" FROM "Skill"'),
  ]);
  const analysis = analyses[0] ?? null;
  const score = scores[0] ?? null;

  const gaps = score
    ? await query<GapRow>(
        `SELECT g.severity, g.reason, r."originalText" AS requirement
         FROM "ScoreGap" g
         JOIN "JobRequirement" r ON r.id = g."requirementId"
         WHERE g."jobScoreId" = $1
         ORDER BY CASE g.severity WHEN 'CRITICAL' THEN 0 WHEN 'MAJOR' THEN 1 ELSE 2 END`,
        [score.id],
      )
    : [];

  // Why this job? (§20) — strengths and concerns derived from real data
  const ownedSkills = new Set(profileSkills.map((skill) => skill.normalizedName));
  const matchedSkills = analysis
    ? analysis.requiredSkills.filter((skill) => ownedSkills.has(skill.toLowerCase().trim()))
    : [];
  const missingSkills = analysis
    ? analysis.requiredSkills.filter((skill) => !ownedSkills.has(skill.toLowerCase().trim()))
    : [];

  const strengths: string[] = matchedSkills.map((skill) => `Verified skill: ${skill}`);
  if (score && score.experienceScore >= 0.9) strengths.push('Experience requirement met');
  if (score && score.educationScore >= 1 && analysis?.educationRequirements.length)
    strengths.push('Education requirement met');

  const concerns: string[] = missingSkills.map((skill) => `Missing skill: ${skill} (no verified evidence)`);
  if (score && score.experienceScore < 1)
    concerns.push(`Experience gap: ${(score.experienceScore * 100).toFixed(0)}% of required years`);
  const criticalGaps = gaps.filter((gap) => gap.severity === 'CRITICAL').length;

  const chips = (items: string[]) =>
    items.map((item) => (
      <span key={item} className="chip">
        {item}
      </span>
    ));

  return (
    <div>
      <p className="muted">
        <Link href="/jobs">← Opportunities</Link>
      </p>
      <h1>{job.title}</h1>
      <p className="muted">
        {job.company} — {job.location ?? 'location n/a'}
        {job.remoteType ? ` (${job.remoteType})` : ''} · via {job.sourceName} · discovered{' '}
        {fmtDate(job.discoveredAt)} · hash <code>{job.descriptionHash.slice(0, 12)}…</code>
      </p>

      <AnalyzeScoreButtons jobId={job.id} hasAnalysis={Boolean(analysis)} />

      {score && (
        <div className="dash-grid">
          <div className="card dash-card wide" style={{ display: 'flex', gap: 'var(--sp-6)', alignItems: 'center', flexWrap: 'wrap' }}>
            <ScoreRing score={score.total} size={120} />
            <div style={{ flex: 1, minWidth: 240 }}>
              <h3 style={{ marginBottom: 'var(--sp-2)' }}>Score breakdown — rule {score.ruleName} v{score.ruleVersion}</h3>
              <MatchBreakdown
                dimensions={[
                  { key: 'education', label: 'Education', weight: 0.2, score: score.educationScore },
                  { key: 'experience', label: 'Experience', weight: 0.3, score: score.experienceScore },
                  { key: 'skills', label: 'Skills', weight: 0.3, score: score.skillsScore },
                  { key: 'tools', label: 'Tools', weight: 0.1, score: score.toolsScore },
                  { key: 'keywords', label: 'Keywords', weight: 0.1, score: score.keywordScore },
                ]}
              />
              <p className="muted">
                Reproducible: same profile snapshot + analysis + rule version → identical score.
              </p>
            </div>
          </div>

          <div className="card dash-card">
            <h3>Why this opportunity?</h3>
            {strengths.length > 0 && (
              <div className="gap-item">
                <StatusBadge kind="VERIFIED" label="STRENGTHS" />
              </div>
            )}
            {strengths.map((strength) => (
              <div className="gap-item" key={strength}>
                <span className="ok" aria-hidden>
                  +
                </span>
                <span>{strength}</span>
              </div>
            ))}
            {concerns.length > 0 && (
              <div className="gap-item" style={{ marginTop: 'var(--sp-2)' }}>
                <StatusBadge kind="WARNING" label="CONCERNS" />
              </div>
            )}
            {concerns.map((concern) => (
              <div className="gap-item" key={concern}>
                <span className="warn" aria-hidden>
                  −
                </span>
                <span>{concern}</span>
              </div>
            ))}
            {strengths.length === 0 && concerns.length === 0 && (
              <p className="muted">Run the analysis to get an explanation.</p>
            )}
          </div>

          <div className="card dash-card wide">
            <h3>
              Gap intelligence ({gaps.length}
              {criticalGaps > 0 ? `, ${criticalGaps} critical` : ''})
            </h3>
            {gaps.length > 0 ? (
              gaps.map((gap, index) => (
                <div className="gap-item" key={index}>
                  <StatusBadge
                    kind={
                      gap.severity === 'CRITICAL' ? 'ERROR' : gap.severity === 'MAJOR' ? 'WARNING' : 'INFO'
                    }
                    label={gap.severity}
                  />
                  <span>
                    <strong>{gap.requirement}</strong>
                  </span>
                  <span className="muted">— {gap.reason}</span>
                </div>
              ))
            ) : (
              <p className="muted">No gaps — profile satisfies every detected requirement.</p>
            )}
          </div>
        </div>
      )}

      {analysis && (
        <div className="card">
          <h3>AI analysis — validated deterministically</h3>
          <p className="muted">
            Extracted by <code>{analysis.extractedBy}</code> · prompt <code>{analysis.promptVersion}</code>{' '}
            · {new Date(analysis.createdAt).toISOString().slice(0, 16).replace('T', ' ')}
            {analysis.seniority ? ` · seniority: ${analysis.seniority}` : ''}
          </p>
          {analysis.requiredSkills.length > 0 && <p><strong>Required skills:</strong> {chips(analysis.requiredSkills)}</p>}
          {analysis.preferredSkills.length > 0 && <p><strong>Preferred:</strong> {chips(analysis.preferredSkills)}</p>}
          {analysis.tools.length > 0 && <p><strong>Tools:</strong> {chips(analysis.tools)}</p>}
          {analysis.technologies.length > 0 && <p><strong>Technologies:</strong> {chips(analysis.technologies)}</p>}
          {analysis.keywords.length > 0 && <p><strong>Keywords:</strong> {chips(analysis.keywords)}</p>}
          {analysis.educationRequirements.length > 0 && <p><strong>Education:</strong> {chips(analysis.educationRequirements)}</p>}
          {analysis.experienceRequirements.length > 0 && <p><strong>Experience:</strong> {chips(analysis.experienceRequirements)}</p>}
        </div>
      )}

      <div className="card">
        <h3>Job description — untrusted data</h3>
        <pre className="job-description">{job.description}</pre>
      </div>
    </div>
  );
}
