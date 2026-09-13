'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ClaimOption {
  id: string;
  value: string;
  status: string;
}

export default function GenerateCvForm({ profileId, claimOptions }: { profileId: string; claimOptions: ClaimOption[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/documents/cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, claimIds: selected.length ? selected : undefined }),
      });
      const body = (await response.json()) as { error?: string; violations?: string[] };
      if (!response.ok) {
        throw new Error(body.violations?.length ? `${body.error}: ${body.violations.join('; ')}` : body.error ?? `HTTP ${response.status}`);
      }
      setSelected([]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card" onSubmit={onSubmit}>
      <strong>Generate a CV version</strong>
      <p className="muted">
        Only VERIFIED claims are eligible ({claimOptions.length} available).
        Selection is optional — leaving all unchecked uses every verified claim.
      </p>
      {claimOptions.length === 0 ? (
        <p className="warn">No verified claims yet — add evidence-backed skills on the Profile page.</p>
      ) : (
        <ul className="evidence-list">
          {claimOptions.map((claim) => (
            <li key={claim.id}>
              <label>
                <input
                  type="checkbox"
                  checked={selected.includes(claim.id)}
                  onChange={() => toggle(claim.id)}
                />{' '}
                <code>{claim.value}</code>{' '}
                <span className="muted">({claim.id.slice(0, 8)}…)</span>
              </label>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="err">{error}</p>}
      <button type="submit" disabled={saving || claimOptions.length === 0}>
        {saving ? 'Generating + fact-checking…' : 'Generate (deterministic + fact-check)'}
      </button>
    </form>
  );
}
