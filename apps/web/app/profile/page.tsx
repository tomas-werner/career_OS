import { query } from '@career-os/db';
import type { CandidateProfile } from '@career-os/db';
import ProfileForm from './profile-form';
import SubEntitiesSection from './sub-entities-section';

export const dynamic = 'force-dynamic';

interface ExperienceRow {
  id: string;
  company: string;
  role: string;
  location: string | null;
  startDate: Date;
  endDate: Date | null;
  current: boolean;
  description: string | null;
}

interface EducationRow {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate: Date | null;
  grade: string | null;
}

interface SkillRow {
  id: string;
  name: string;
  normalizedName: string;
  level: string | null;
  category: string | null;
  claimStatus: string | null;
  claimConfidence: number | null;
  evidenceCount: string;
}

interface CertificationRow {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expirationDate: Date | null;
  credentialUrl: string | null;
}

function fmtDate(date: Date | null): string {
  if (!date) return '—';
  return new Date(date).toISOString().slice(0, 10);
}

export default async function ProfilePage() {
  const profiles = await query<CandidateProfile>(
    'SELECT * FROM "CandidateProfile" ORDER BY "createdAt" LIMIT 1',
  );
  const profile = profiles[0] ?? null;

  const [experiences, educations, skills, certifications] = profile
    ? await Promise.all([
        query<ExperienceRow>(
          `SELECT id, company, role, location, "startDate", "endDate", current, description
           FROM "Experience" WHERE "profileId" = $1 ORDER BY "startDate" DESC`,
          [profile.id],
        ),
        query<EducationRow>(
          `SELECT id, institution, degree, field, "startDate", "endDate", grade
           FROM "Education" WHERE "profileId" = $1 ORDER BY "startDate" DESC`,
          [profile.id],
        ),
        query<SkillRow>(
          `SELECT s.id, s.name, s."normalizedName", s.level, s.category,
                  c.status AS "claimStatus", c.confidence AS "claimConfidence",
                  COUNT(ce."evidenceId") AS "evidenceCount"
           FROM "Skill" s
           LEFT JOIN "Claim" c
             ON c.subject = 'candidate' AND c.predicate = 'knows' AND c.value = s."normalizedName"
           LEFT JOIN "ClaimEvidence" ce ON ce."claimId" = c.id
           WHERE s."profileId" = $1
           GROUP BY s.id, c.status, c.confidence
           ORDER BY s.name`,
          [profile.id],
        ),
        query<CertificationRow>(
          `SELECT id, name, issuer, "issueDate", "expirationDate", "credentialUrl"
           FROM "Certification" WHERE "profileId" = $1 ORDER BY "issueDate" DESC`,
          [profile.id],
        ),
      ])
    : [[], [], [], []];

  return (
    <div>
      <h1>Master Profile</h1>
      <p className="muted">
        Sections per plan.md §41: identity, experience, education, skills, certifications.
        Every skill automatically becomes a claim validated by the deterministic
        fact-checker — Verified / Unverified / Missing evidence.
      </p>
      <ProfileForm profile={profile} />

      {profile ? (
        <>
          <div className="card">
            <strong>Experience ({experiences.length})</strong>
            <ul>
              {experiences.map((item) => (
                <li key={item.id}>
                  <strong>{item.role}</strong> — {item.company}
                  <span className="muted">
                    {' '}
                    ({fmtDate(item.startDate)} → {item.current ? 'present' : fmtDate(item.endDate)})
                    {item.location ? `, ${item.location}` : ''}
                  </span>
                  {item.description && <p className="muted">{item.description}</p>}
                </li>
              ))}
              {experiences.length === 0 && <li className="muted">None yet.</li>}
            </ul>
          </div>

          <div className="card">
            <strong>Education ({educations.length})</strong>
            <ul>
              {educations.map((item) => (
                <li key={item.id}>
                  <strong>{item.degree}</strong> in {item.field} — {item.institution}
                  <span className="muted">
                    {' '}
                    ({fmtDate(item.startDate)} → {fmtDate(item.endDate)})
                    {item.grade ? `, grade ${item.grade}` : ''}
                  </span>
                </li>
              ))}
              {educations.length === 0 && <li className="muted">None yet.</li>}
            </ul>
          </div>

          <div className="card">
            <strong>Skills ({skills.length})</strong>
            <table className="table">
              <thead>
                <tr>
                  <th>Skill</th>
                  <th>Level</th>
                  <th>Category</th>
                  <th>Verification</th>
                  <th>Evidence</th>
                </tr>
              </thead>
              <tbody>
                {skills.map((skill) => (
                  <tr key={skill.id}>
                    <td>{skill.name}</td>
                    <td className="muted">{skill.level ?? '—'}</td>
                    <td className="muted">{skill.category ?? '—'}</td>
                    <td>
                      {skill.claimStatus === 'VERIFIED' && <span className="ok">Verified</span>}
                      {skill.claimStatus === 'REJECTED' && <span className="err">Rejected</span>}
                      {skill.claimStatus === 'UNVERIFIED' && <span className="warn">Unverified</span>}
                      {!skill.claimStatus && <span className="warn">no claim</span>}
                      {skill.claimConfidence !== null && (
                        <span className="muted"> ({skill.claimConfidence.toFixed(2)})</span>
                      )}
                    </td>
                    <td className="muted">{skill.evidenceCount}</td>
                  </tr>
                ))}
                {skills.length === 0 && (
                  <tr>
                    <td colSpan={5} className="muted">
                      None yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="card">
            <strong>Certifications ({certifications.length})</strong>
            <ul>
              {certifications.map((item) => (
                <li key={item.id}>
                  <strong>{item.name}</strong> — {item.issuer}
                  <span className="muted"> (issued {fmtDate(item.issueDate)})</span>
                </li>
              ))}
              {certifications.length === 0 && <li className="muted">None yet.</li>}
            </ul>
          </div>

          <SubEntitiesSection profileId={profile.id} />
        </>
      ) : (
        <div className="card">
          <p className="muted">Create your profile above to add experiences, skills, etc.</p>
        </div>
      )}
    </div>
  );
}
