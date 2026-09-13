'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
  profileId: string;
}

type Panel = 'experience' | 'education' | 'skill' | 'certification';

const PANELS: { key: Panel; label: string }[] = [
  { key: 'experience', label: '+ Experience' },
  { key: 'education', label: '+ Education' },
  { key: 'skill', label: '+ Skill' },
  { key: 'certification', label: '+ Certification' },
];

export default function SubEntitiesSection({ profileId }: Props) {
  const router = useRouter();
  const [panel, setPanel] = useState<Panel | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [experience, setExperience] = useState({
    company: '',
    role: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
  });
  const [education, setEducation] = useState({
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    grade: '',
  });
  const [skill, setSkill] = useState({ name: '', level: '', category: '', evidenceIds: '' });
  const [certification, setCertification] = useState({
    name: '',
    issuer: '',
    issueDate: '',
    expirationDate: '',
    credentialUrl: '',
  });

  async function submit(path: string, body: unknown) {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? `HTTP ${response.status}`);
      }
      setPanel(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (panel === 'experience') {
      void submit('/api/profile/experiences', {
        profileId,
        company: experience.company,
        role: experience.role,
        location: experience.location || undefined,
        startDate: experience.startDate,
        endDate: experience.current ? undefined : experience.endDate || undefined,
        current: experience.current,
        description: experience.description || undefined,
      });
    } else if (panel === 'education') {
      void submit('/api/profile/education', {
        profileId,
        institution: education.institution,
        degree: education.degree,
        field: education.field,
        startDate: education.startDate,
        endDate: education.endDate || undefined,
        grade: education.grade || undefined,
      });
    } else if (panel === 'skill') {
      const evidenceIds = skill.evidenceIds
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      void submit('/api/profile/skills', {
        profileId,
        name: skill.name,
        level: skill.level || undefined,
        category: skill.category || undefined,
        evidenceIds,
      });
    } else if (panel === 'certification') {
      void submit('/api/profile/certifications', {
        profileId,
        name: certification.name,
        issuer: certification.issuer,
        issueDate: certification.issueDate,
        expirationDate: certification.expirationDate || undefined,
        credentialUrl: certification.credentialUrl || undefined,
      });
    }
  }

  return (
    <div className="card">
      <div className="panel-buttons">
        {PANELS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setPanel(panel === item.key ? null : item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {error && <p className="err">{error}</p>}
      {panel && (
        <form onSubmit={onSubmit}>
          {panel === 'experience' && (
            <div className="form-grid">
              <label>
                Company *
                <input
                  required
                  value={experience.company}
                  onChange={(e) => setExperience((f) => ({ ...f, company: e.target.value }))}
                  maxLength={300}
                />
              </label>
              <label>
                Role *
                <input
                  required
                  value={experience.role}
                  onChange={(e) => setExperience((f) => ({ ...f, role: e.target.value }))}
                  maxLength={300}
                />
              </label>
              <label>
                Location
                <input
                  value={experience.location}
                  onChange={(e) => setExperience((f) => ({ ...f, location: e.target.value }))}
                />
              </label>
              <label>
                Start date *
                <input
                  required
                  type="date"
                  value={experience.startDate}
                  onChange={(e) => setExperience((f) => ({ ...f, startDate: e.target.value }))}
                />
              </label>
              <label>
                End date
                <input
                  type="date"
                  value={experience.endDate}
                  disabled={experience.current}
                  onChange={(e) => setExperience((f) => ({ ...f, endDate: e.target.value }))}
                />
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={experience.current}
                  onChange={(e) => setExperience((f) => ({ ...f, current: e.target.checked }))}
                />
                Current position
              </label>
              <label className="span2">
                Description
                <textarea
                  rows={3}
                  value={experience.description}
                  onChange={(e) => setExperience((f) => ({ ...f, description: e.target.value }))}
                  maxLength={10_000}
                />
              </label>
            </div>
          )}

          {panel === 'education' && (
            <div className="form-grid">
              <label>
                Institution *
                <input
                  required
                  value={education.institution}
                  onChange={(e) => setEducation((f) => ({ ...f, institution: e.target.value }))}
                  maxLength={300}
                />
              </label>
              <label>
                Degree *
                <input
                  required
                  value={education.degree}
                  onChange={(e) => setEducation((f) => ({ ...f, degree: e.target.value }))}
                  maxLength={300}
                />
              </label>
              <label>
                Field *
                <input
                  required
                  value={education.field}
                  onChange={(e) => setEducation((f) => ({ ...f, field: e.target.value }))}
                  maxLength={300}
                />
              </label>
              <label>
                Grade
                <input
                  value={education.grade}
                  onChange={(e) => setEducation((f) => ({ ...f, grade: e.target.value }))}
                  maxLength={100}
                />
              </label>
              <label>
                Start date *
                <input
                  required
                  type="date"
                  value={education.startDate}
                  onChange={(e) => setEducation((f) => ({ ...f, startDate: e.target.value }))}
                />
              </label>
              <label>
                End date
                <input
                  type="date"
                  value={education.endDate}
                  onChange={(e) => setEducation((f) => ({ ...f, endDate: e.target.value }))}
                />
              </label>
            </div>
          )}

          {panel === 'skill' && (
            <div className="form-grid">
              <label>
                Name *
                <input
                  required
                  value={skill.name}
                  onChange={(e) => setSkill((f) => ({ ...f, name: e.target.value }))}
                  maxLength={200}
                  placeholder="React, SQL, Excel…"
                />
              </label>
              <label>
                Level
                <input
                  value={skill.level}
                  onChange={(e) => setSkill((f) => ({ ...f, level: e.target.value }))}
                  maxLength={100}
                  placeholder="intermediate, expert…"
                />
              </label>
              <label>
                Category
                <input
                  value={skill.category}
                  onChange={(e) => setSkill((f) => ({ ...f, category: e.target.value }))}
                  maxLength={100}
                  placeholder="frontend, data…"
                />
              </label>
              <label>
                Evidence IDs (comma-separated, optional)
                <input
                  value={skill.evidenceIds}
                  onChange={(e) => setSkill((f) => ({ ...f, evidenceIds: e.target.value }))}
                  placeholder="evidence uuid(s) from the Evidence page"
                />
              </label>
              <p className="muted span2">
                A claim <code>candidate knows &lt;skill&gt;</code> is created automatically
                and validated deterministically: strong evidence (CV, certificate…) →
                Verified, weak/none → Unverified.
              </p>
            </div>
          )}

          {panel === 'certification' && (
            <div className="form-grid">
              <label>
                Name *
                <input
                  required
                  value={certification.name}
                  onChange={(e) => setCertification((f) => ({ ...f, name: e.target.value }))}
                  maxLength={300}
                />
              </label>
              <label>
                Issuer *
                <input
                  required
                  value={certification.issuer}
                  onChange={(e) => setCertification((f) => ({ ...f, issuer: e.target.value }))}
                  maxLength={300}
                />
              </label>
              <label>
                Issue date *
                <input
                  required
                  type="date"
                  value={certification.issueDate}
                  onChange={(e) => setCertification((f) => ({ ...f, issueDate: e.target.value }))}
                />
              </label>
              <label>
                Expiration date
                <input
                  type="date"
                  value={certification.expirationDate}
                  onChange={(e) =>
                    setCertification((f) => ({ ...f, expirationDate: e.target.value }))
                  }
                />
              </label>
              <label className="span2">
                Credential URL
                <input
                  type="url"
                  value={certification.credentialUrl}
                  onChange={(e) =>
                    setCertification((f) => ({ ...f, credentialUrl: e.target.value }))
                  }
                  placeholder="https://…"
                />
              </label>
            </div>
          )}

          <button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      )}
    </div>
  );
}
