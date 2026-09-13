'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function PhoneEventForm({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [form, setForm] = useState({ direction: 'OUTBOUND', outcome: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/applications/${applicationId}/phone-events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          direction: form.direction,
          outcome: form.outcome || undefined,
          notes: form.notes || undefined,
        }),
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? `HTTP ${response.status}`);
      }
      setForm({ direction: 'OUTBOUND', outcome: '', notes: '' });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="form-grid">
        <label>
          Direction
          <select
            value={form.direction}
            onChange={(e) => setForm((f) => ({ ...f, direction: e.target.value }))}
          >
            <option value="OUTBOUND">OUTBOUND (I called)</option>
            <option value="INBOUND">INBOUND (they called)</option>
          </select>
        </label>
        <label>
          Outcome
          <input
            value={form.outcome}
            onChange={(e) => setForm((f) => ({ ...f, outcome: e.target.value }))}
            maxLength={200}
            placeholder="interview scheduled, follow-up needed…"
          />
        </label>
        <label className="span2">
          Notes
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            maxLength={5000}
          />
        </label>
      </div>
      {error && <p className="err">{error}</p>}
      <button type="submit" disabled={saving}>
        {saving ? 'Saving…' : 'Record phone event'}
      </button>
    </form>
  );
}
