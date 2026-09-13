import { notFound } from 'next/navigation';
import { query } from '@career-os/db';

export const dynamic = 'force-dynamic';

interface CvDetail {
  id: string;
  content: string;
  contentHash: string;
  templateVersion: string;
  generationModel: string;
  promptVersion: string;
  createdAt: Date;
}

interface ProvenanceRow {
  claimId: string;
  usage: string;
  subject: string;
  predicate: string;
  value: string;
  status: string;
  evidenceTypes: string[] | null;
}

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const cvs = await query<CvDetail>('SELECT * FROM "CvVersion" WHERE id = $1', [id]);
  const cv = cvs[0];
  if (!cv) notFound();

  const provenance = await query<ProvenanceRow>(
    `SELECT cc."claimId", cc.usage, c.subject, c.predicate, c.value, c.status,
            (SELECT array_agg(DISTINCT s.type)
             FROM "ClaimEvidence" ce
             JOIN "Evidence" e ON e.id = ce."evidenceId"
             JOIN "Source" s ON s.id = e."sourceId"
             WHERE ce."claimId" = c.id) AS "evidenceTypes"
     FROM "CvClaim" cc
     JOIN "Claim" c ON c.id = cc."claimId"
     WHERE cc."cvVersionId" = $1
     ORDER BY c.predicate, c.value`,
    [id],
  );

  return (
    <div>
      <h1>CV version {cv.id.slice(0, 8)}…</h1>
      <p className="muted">
        template <code>{cv.templateVersion}</code> · model{' '}
        <code>{cv.generationModel}</code> · prompt <code>{cv.promptVersion}</code> ·
        hash <code>{cv.contentHash.slice(0, 16)}…</code> ·{' '}
        {new Date(cv.createdAt).toISOString().slice(0, 16).replace('T', ' ')}
      </p>

      <div className="card">
        <strong>Provenance — claims used in this CV (§17)</strong>
        <table className="table">
          <thead>
            <tr>
              <th>Claim</th>
              <th>Status</th>
              <th>Evidence sources</th>
              <th>Usage</th>
            </tr>
          </thead>
          <tbody>
            {provenance.map((row) => (
              <tr key={row.claimId}>
                <td>
                  <code>
                    {row.subject} {row.predicate} {row.value}
                  </code>
                </td>
                <td>
                  <span className={row.status === 'VERIFIED' ? 'ok' : 'err'}>{row.status}</span>
                </td>
                <td className="muted">
                  {row.evidenceTypes ? row.evidenceTypes.join(', ') : '—'}
                </td>
                <td className="muted">{row.usage}</td>
              </tr>
            ))}
            {provenance.length === 0 && (
              <tr>
                <td colSpan={4} className="muted">
                  No claims linked.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card">
        <strong>Generated content</strong>
        <pre className="job-description">{cv.content}</pre>
      </div>
    </div>
  );
}
