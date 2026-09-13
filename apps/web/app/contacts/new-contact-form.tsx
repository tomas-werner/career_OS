'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface CompanyOption {
  id: string;
  name: string;
}

export default function NewContactForm({ companies }: { companies: CompanyOption[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    companyId: '',
    firstName: '',
    lastName: '',
    role: '',
    email: '',
    phone: '',
    linkedinUrl: '',
    source: 'manual',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set =
    (key: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((current) => ({ ...current, [key]: event.target.value }));

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body = {
        companyId: form.companyId,
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
        role: form.role || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        linkedinUrl: form.linkedinUrl || undefined,
        source: form.source || undefined,
      };
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? `HTTP ${response.status}`);
      }
      setForm({ companyId: '', firstName: '', lastName: '', role: '', email: '', phone: '', linkedinUrl: '', source: 'manual' });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card" onSubmit={onSubmit}>
      <strong>New contact</strong>
      <div className="form-grid">
        <label>
          Company *
          <select required value={form.companyId} onChange={set('companyId')}>
            <option value="" disabled>
              Select a company…
            </option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          First name
          <input value={form.firstName} onChange={set('firstName')} maxLength={100} />
        </label>
        <label>
          Last name
          <input value={form.lastName} onChange={set('lastName')} maxLength={100} />
        </label>
        <label>
          Role
          <input value={form.role} onChange={set('role')} maxLength={200} placeholder="Recruiter, Hiring manager…" />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={set('email')} maxLength={320} />
        </label>
        <label>
          Phone
          <input value={form.phone} onChange={set('phone')} maxLength={50} />
        </label>
        <label className="span2">
          LinkedIn URL
          <input type="url" value={form.linkedinUrl} onChange={set('linkedinUrl')} placeholder="https://linkedin.com/in/…" />
        </label>
      </div>
      {companies.length === 0 && (
        <p className="warn">No companies yet — ingest a job first to create one.</p>
      )}
      {error && <p className="err">{error}</p>}
      <button type="submit" disabled={saving || !form.companyId}>
        {saving ? 'Saving…' : 'Add contact'}
      </button>
    </form>
  );
}
