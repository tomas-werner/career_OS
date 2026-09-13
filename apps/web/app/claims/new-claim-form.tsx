'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface EvidenceOption {
  id: string;
  quote: string;
  sourceType: string;
}

export default function NewClaimForm({ evidenceOptions }: { evidenceOptions: EvidenceOption[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ subject: '', predicate: 'knows', value: '' });
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleEvidence(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const profileId = await resolveProfileId();
    if (!profileId) {
      setError('Create your profile first on the Profile page.');
      setSaving(false);
      return;
    }
    try {
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          subject: form.subject,
          predicate: form.predicate,
          value: form.value,
          evidenceIds: selected,
        }),
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? `HTTP ${response.status}`);
      }
      setForm({ subject: '', predicate: 'knows', value: '' });
      setSelected([]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card" onSubmit={onSubmit}>
      <strong>New claim</strong>
      <div className="form-grid">
        <label>
          Subject *
          <input
            required
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            placeholder="candidate"
            maxLength={200}
          />
        </label>
        <label>
          Predicate *
          <input
            required
            value={form.predicate}
            onChange={(e) => setForm((f) => ({ ...f, predicate: e.target.value }))}
            placeholder="knows / worked-at / holds-degree-in"
            maxLength={200}
          />
        </label>
        <label className="span2">
          Value *
          <input
            required
            value={form.value}
            onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
            placeholder="React, BCG, Data Engineering…"
            maxLength={500}
          />
        </label>
      </div>
      {evidenceOptions.length > 0 && (
        <div>
          <strong className="muted">Linked evidence ({selected.length} selected)</strong>
          <ul className="evidence-list">
            {evidenceOptions.map((item) => (
              <li key={item.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={selected.includes(item.id)}
                    onChange={() => toggleEvidence(item.id)}
                  />{' '}
                  <code>{item.sourceType}</code> — {item.quote.slice(0, 80)}
                  {item.quote.length > 80 ? '…' : ''}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
      {error && <p className="err">{error}</p>}
      <button type="submit" disabled={saving}>
        {saving ? 'Validating…' : 'Create claim (deterministic validation)'}
      </button>
    </form>
  );
}

async function resolveProfileId(): Promise<string | null> {
  const response = await fetch('/api/profile');
  if (!response.ok) return null;
  const body = (await response.json()) as { profile: { id: string } | null };
  return body.profile?.id ?? null;
}
