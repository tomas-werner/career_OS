import { notFound } from 'next/navigation';
import { query } from '@career-os/db';
import AnalyzeScoreButtons from './analyze-score-buttons';

export const dynamic = 'force-dynamic';

interface JobDetail {
  id: string;
  title: string;
  normalizedTitle: string;
  location: string | null;
  remoteType: string | null;
  description: string;
  canonicalUrl: string | null;
  discoveredAt: Date;
  descriptionHash: string;
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
  responsibilities: string[];
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
  createdAt: Date;
}

interface GapRow {
  severity: string;
  reason: string;
  requirement: string;
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const jobs = await query<JobDetail>(
    `SELECT j.id, j.title, j."normalizedTitle", j.location, j."remoteType", j.description,
            j."canonicalUrl", j."discoveredAt", j."descriptionHash",
            c.name AS company, s.name AS "sourceName"
     FROM "JobOffer" j
     JOIN "Company" c ON c.id = j."companyId"
     JOIN "JobSource" s ON s.id = j."sourceId"
     WHERE j.id = $1`,
    [id],
  );
  const job = jobs[0];
  if (!job) notFound();

  const [analyses, scores] = await Promise.all([
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

  const chips = (items: string[]) =>
    items.map((item) => (
      <span key={item} className="chip">
        {item}
      </span>
    ));

  return (
    <div>
      <h1>{job.title}</h1>
      <p className="muted">
        {job.company} — {job.location ?? 'location n/a'}
        {job.remoteType ? ` (${job.remoteType})` : ''} · source {job.sourceName} ·
        discovered {new Date(job.discoveredAt).toISOString().slice(0, 10)}
      </p>
      <p className="muted">
        description hash <code>{job.descriptionHash.slice(0, 16)}…</code>
      </p>

      <div className="card">
        <strong>AI analysis + deterministic score</strong>
        <p className="muted">
          Extraction via NVIDIA (untrusted data, §14) then deterministic scoring
          (§12): profile snapshot + analysis + rule version → reproducible score.
        </p>
        <AnalyzeScoreButtons jobId={job.id} hasAnalysis={Boolean(analysis)} />
        {analysis && (
          <div>
            <p className="muted">
              extracted by <code>{analysis.extractedBy}</code> · prompt{' '}
              <code>{analysis.promptVersion}</code> ·{' '}
              {new Date(analysis.createdAt).toISOString().slice(0, 16).replace('T', ' ')}
              {analysis.seniority ? ` · seniority: ${analysis.seniority}` : ''}
            </p>
            {analysis.requiredSkills.length > 0 && (
              <p>
                <strong>Required skills:</strong> {chips(analysis.requiredSkills)}
              </p>
            )}
            {analysis.preferredSkills.length > 0 && (
              <p>
                <strong>Preferred:</strong> {chips(analysis.preferredSkills)}
              </p>
            )}
            {analysis.tools.length > 0 && (
              <p>
                <strong>Tools:</strong> {chips(analysis.tools)}
              </p>
            )}
            {analysis.technologies.length > 0 && (
              <p>
                <strong>Technologies:</strong> {chips(analysis.technologies)}
              </p>
            )}
            {analysis.keywords.length > 0 && (
              <p>
                <strong>Keywords:</strong> {chips(analysis.keywords)}
              </p>
            )}
            {analysis.educationRequirements.length > 0 && (
              <p>
                <strong>Education:</strong> {chips(analysis.educationRequirements)}
              </p>
            )}
            {analysis.experienceRequirements.length > 0 && (
              <p>
                <strong>Experience:</strong> {chips(analysis.experienceRequirements)}
              </p>
            )}
          </div>
        )}
      </div>

      {score && (
        <div className="card">
          <strong>
            Score: {(score.total * 100).toFixed(0)}/100{' '}
            <span className="muted">
              (rule {score.ruleName} v{score.ruleVersion})
            </span>
          </strong>
          <table className="table">
            <thead>
              <tr>
                <th>Dimension</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Education (×0.2)</td><td>{(score.educationScore * 100).toFixed(0)}%</td></tr>
              <tr><td>Experience (×0.3)</td><td>{(score.experienceScore * 100).toFixed(0)}%</td></tr>
              <tr><td>Skills (×0.3)</td><td>{(score.skillsScore * 100).toFixed(0)}%</td></tr>
              <tr><td>Tools (×0.1)</td><td>{(score.toolsScore * 100).toFixed(0)}%</td></tr>
              <tr><td>Keywords (×0.1)</td><td>{(score.keywordScore * 100).toFixed(0)}%</td></tr>
            </tbody>
          </table>
          {gaps.length > 0 && (
            <div>
              <strong>Gaps ({gaps.length}) — explain without inventing (§42)</strong>
              <ul>
                {gaps.map((gap, index) => (
                  <li key={index}>
                    <span
                      className={
                        gap.severity === 'CRITICAL' ? 'err' : gap.severity === 'MAJOR' ? 'warn' : 'muted'
                      }
                    >
                      {gap.severity}
                    </span>{' '}
                    <code>{gap.requirement}</code> — <span className="muted">{gap.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <strong>Description (untrusted data)</strong>
        <pre className="job-description">{job.description}</pre>
      </div>
    </div>
  );
}
