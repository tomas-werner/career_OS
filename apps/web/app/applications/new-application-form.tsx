'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface JobOption {
  id: string;
  title: string;
  company: string;
}

export default function NewApplicationForm({ profileId, jobs }: { profileId: string; jobs: JobOption[] }) {
  const router = useRouter();
  const [jobOfferId, setJobOfferId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobOfferId, profileId }),
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? `HTTP ${response.status}`);
      }
      setJobOfferId('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Creation failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card" onSubmit={onSubmit}>
      <strong>Track a new application</strong>
      <div className="form-grid">
        <label className="span2">
          Job offer *
          <select required value={jobOfferId} onChange={(e) => setJobOfferId(e.target.value)}>
            <option value="" disabled>
              Select a job…
            </option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} — {job.company}
              </option>
            ))}
          </select>
        </label>
      </div>
      {jobs.length === 0 && (
        <p className="warn">No job offers ingested yet — add jobs first (POST /api/jobs).</p>
      )}
      {error && <p className="err">{error}</p>}
      <button type="submit" disabled={saving || !jobOfferId}>
        {saving ? 'Creating…' : 'Create (status A_ANALYSER)'}
      </button>
    </form>
  );
}
