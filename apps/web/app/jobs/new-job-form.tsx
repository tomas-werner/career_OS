'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewJobForm() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', company: '', location: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          company: form.company,
          location: form.location || undefined,
          description: form.description,
        }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error ?? `HTTP ${response.status}`);
      setForm({ title: '', company: '', location: '', description: '' });
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ingest failed');
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <div className="panel-buttons">
        <button type="button" onClick={() => setOpen(true)}>
          + Import a job offer
        </button>
      </div>
    );
  }

  return (
    <form className="card" onSubmit={onSubmit}>
      <strong>Import job offer</strong>
      <div className="form-grid">
        <label>
          Title *
          <input
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            maxLength={300}
          />
        </label>
        <label>
          Company *
          <input
            required
            value={form.company}
            onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
            maxLength={300}
          />
        </label>
        <label>
          Location
          <input
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            maxLength={200}
          />
        </label>
        <label className="span2">
          Description * (untrusted data — treated as data, never instructions)
          <textarea
            required
            rows={6}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            maxLength={50_000}
          />
        </label>
      </div>
      {error && <p className="err">{error}</p>}
      <div className="panel-buttons">
        <button type="submit" disabled={saving}>
          {saving ? 'Ingesting…' : 'Import job'}
        </button>
        <button type="button" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
