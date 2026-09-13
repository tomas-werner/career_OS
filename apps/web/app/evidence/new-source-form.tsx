'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SOURCE_TYPES } from '@career-os/shared/types';

const SOURCE_TYPE_OPTIONS = SOURCE_TYPES.map((type) => (
  <option key={type} value={type}>
    {type}
  </option>
));

export default function NewSourceForm() {
  const router = useRouter();
  const [form, setForm] = useState({ type: 'CV', name: '', uri: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body = { ...form, uri: form.uri || undefined };
      const response = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? `HTTP ${response.status}`);
      }
      setForm({ type: 'CV', name: '', uri: '' });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card" onSubmit={onSubmit}>
      <strong>New source</strong>
      <div className="form-grid">
        <label>
          Type
          <select
            value={form.type}
            onChange={(event) => setForm((f) => ({ ...f, type: event.target.value }))}
          >
            {SOURCE_TYPE_OPTIONS}
          </select>
        </label>
        <label>
          Name *
          <input
            required
            value={form.name}
            onChange={(event) => setForm((f) => ({ ...f, name: event.target.value }))}
            maxLength={200}
            placeholder="CV 2026, Certificate XYZ…"
          />
        </label>
        <label className="span2">
          URI (optional, must be a valid URL)
          <input
            value={form.uri}
            onChange={(event) => setForm((f) => ({ ...f, uri: event.target.value }))}
            placeholder="https://…"
          />
        </label>
      </div>
      {error && <p className="err">{error}</p>}
      <button type="submit" disabled={saving}>
        {saving ? 'Saving…' : 'Add source'}
      </button>
    </form>
  );
}
