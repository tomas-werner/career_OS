import { query } from '@career-os/db';
import type { Evidence } from '@career-os/db';
import NewClaimForm from './new-claim-form';

export const dynamic = 'force-dynamic';

interface ClaimRow {
  id: string;
  subject: string;
  predicate: string;
  value: string;
  status: string;
  confidence: number;
  updatedAt: Date;
}

interface EvidenceLinkRow extends Evidence {
  claimId: string;
  sourceType: string;
}

export default async function ClaimsPage() {
  const claims = await query<ClaimRow>(
    `SELECT c.id, c.subject, c.predicate, c.value, c.status, c.confidence, c."updatedAt"
     FROM "Claim" c
     ORDER BY c."updatedAt" DESC
     LIMIT 100`,
  );
  const links = await query<EvidenceLinkRow>(
    `SELECT ce."claimId", e.id, e."sourceId", e.quote, e.location, e."createdAt",
            s.type AS "sourceType"
     FROM "ClaimEvidence" ce
     JOIN "Evidence" e ON e.id = ce."evidenceId"
     JOIN "Source" s ON s.id = e."sourceId"`,
  );
  const evidenceOptions = await query<{ id: string; quote: string; sourceType: string }>(
    `SELECT e.id, e.quote, s.type AS "sourceType"
     FROM "Evidence" e
     JOIN "Source" s ON s.id = e."sourceId"
     ORDER BY e."createdAt" DESC
     LIMIT 100`,
  );

  const byClaim = new Map<string, EvidenceLinkRow[]>();
  for (const link of links) {
    const list = byClaim.get(link.claimId) ?? [];
    list.push(link);
    byClaim.set(link.claimId, list);
  }

  return (
    <div>
      <h1>Claims</h1>
      <p className="muted">
        Facts about the candidate (plan.md sections 7 and 43). Status is computed by the
        deterministic fact-checker, never by AI: strong evidence (CV, certificate…) →
        VERIFIED, weak evidence (manual entry) → UNVERIFIED, contradiction → REJECTED.
      </p>
      <NewClaimForm evidenceOptions={evidenceOptions} />
      <div className="card">
        <strong>Claims ({claims.length})</strong>
        <table className="table">
          <thead>
            <tr>
              <th>Claim</th>
              <th>Status</th>
              <th>Confidence</th>
              <th>Evidence</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim) => {
              const evidence = byClaim.get(claim.id) ?? [];
              return (
                <tr key={claim.id}>
                  <td>
                    <code>
                      {claim.subject} {claim.predicate} {claim.value}
                    </code>
                    {evidence.length > 0 && (
                      <details className="evidence-details">
                        <summary className="muted">Evidence ({evidence.length})</summary>
                        <ul>
                          {evidence.map((item) => (
                            <li key={item.id}>
                              <code>{item.sourceType}</code> — “{item.quote}”
                              {item.location ? (
                                <span className="muted"> ({item.location})</span>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </td>
                  <td>
                    <span
                      className={
                        claim.status === 'VERIFIED'
                          ? 'ok'
                          : claim.status === 'REJECTED'
                            ? 'err'
                            : 'warn'
                      }
                    >
                      {claim.status}
                    </span>
                  </td>
                  <td>{claim.confidence.toFixed(2)}</td>
                  <td className="muted">
                    {evidence.length === 0
                      ? 'missing evidence'
                      : evidence.map((item) => item.sourceType).join(', ')}
                  </td>
                </tr>
              );
            })}
            {claims.length === 0 && (
              <tr>
                <td colSpan={4} className="muted">
                  No claims yet — create one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
