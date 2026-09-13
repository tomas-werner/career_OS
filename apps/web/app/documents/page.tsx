import Link from 'next/link';
import { query } from '@career-os/db';
import GenerateCvForm from './generate-cv-form';

export const dynamic = 'force-dynamic';

interface CvListRow {
  id: string;
  contentHash: string;
  templateVersion: string;
  createdAt: Date;
  claimsUsed: string;
}

interface ClaimOption {
  id: string;
  value: string;
  status: string;
}

export default async function DocumentsPage() {
  const [cvs, profiles, claims] = await Promise.all([
    query<CvListRow>(
      `SELECT v.id, v."contentHash", v."templateVersion", v."createdAt",
              (SELECT COUNT(*) FROM "CvClaim" cc WHERE cc."cvVersionId" = v.id) AS "claimsUsed"
       FROM "CvVersion" v ORDER BY v."createdAt" DESC LIMIT 50`,
    ),
    query<{ id: string }>(
      'SELECT id FROM "CandidateProfile" ORDER BY "createdAt" LIMIT 1',
    ),
    query<ClaimOption>(
      `SELECT id, value, status FROM "Claim" ORDER BY "updatedAt" DESC LIMIT 200`,
    ),
  ]);
  const profile = profiles[0] ?? null;
  const verifiedClaims = claims.filter((claim) => claim.status === 'VERIFIED');

  return (
    <div>
      <h1>Documents</h1>
      <p className="muted">
        Controlled generation (plan.md sections 16-18): statements are built from
        VERIFIED claims only, fact-checked server-side, and every version carries
        full provenance (CvClaim → Claim → Evidence → Source).
      </p>

      {profile ? (
        <GenerateCvForm profileId={profile.id} claimOptions={verifiedClaims} />
      ) : (
        <div className="card">
          <p className="muted">Create a profile first (Profile page) to generate documents.</p>
        </div>
      )}

      <div className="card">
        <strong>CV versions ({cvs.length})</strong>
        <table className="table">
          <thead>
            <tr>
              <th>Version</th>
              <th>Claims used</th>
              <th>Content hash</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {cvs.map((cv) => (
              <tr key={cv.id}>
                <td>
                  <Link href={`/documents/${cv.id}`}>{cv.id.slice(0, 8)}…</Link>
                </td>
                <td>{cv.claimsUsed}</td>
                <td>
                  <code>{cv.contentHash.slice(0, 12)}…</code>
                </td>
                <td className="muted">{new Date(cv.createdAt).toISOString().slice(0, 16).replace('T', ' ')}</td>
              </tr>
            ))}
            {cvs.length === 0 && (
              <tr>
                <td colSpan={4} className="muted">
                  No CV generated yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
