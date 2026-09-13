import { query } from '@career-os/db';
import type { Source } from '@career-os/db';
import NewSourceForm from './new-source-form';

export const dynamic = 'force-dynamic';

interface SourceWithCount extends Source {
  evidenceCount: string;
}

export default async function EvidencePage() {
  const sources = await query<SourceWithCount>(
    `SELECT s.*, COUNT(e.id) AS "evidenceCount"
     FROM "Source" s
     LEFT JOIN "Evidence" e ON e."sourceId" = s.id
     GROUP BY s.id
     ORDER BY s."createdAt" DESC
     LIMIT 100`,
  );

  return (
    <div>
      <h1>Evidence</h1>
      <p className="muted">
        Sources are the anti-hallucination root (plan.md sections 7–8): every claim must
        resolve to Evidence, and every Evidence must resolve to a Source.
      </p>
      <NewSourceForm />
      <div className="card">
        <strong>Sources ({sources.length})</strong>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Evidence</th>
              <th>URI</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source) => (
              <tr key={source.id}>
                <td>{source.name}</td>
                <td>
                  <code>{source.type}</code>
                </td>
                <td>{source.evidenceCount}</td>
                <td className="muted">{source.uri ?? '—'}</td>
              </tr>
            ))}
            {sources.length === 0 && (
              <tr>
                <td colSpan={4} className="muted">
                  No sources yet — create one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
