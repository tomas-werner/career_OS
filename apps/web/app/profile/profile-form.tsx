'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { CandidateProfile } from '@career-os/db';

interface Props {
  profile: CandidateProfile | null;
}

export default function ProfileForm({ profile }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: profile?.firstName ?? '',
    lastName: profile?.lastName ?? '',
    email: profile?.email ?? '',
    phone: profile?.phone ?? '',
    city: profile?.city ?? '',
    country: profile?.country ?? '',
    headline: profile?.headline ?? '',
    summary: profile?.summary ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? `HTTP ${response.status}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card" onSubmit={onSubmit}>
      <strong>{profile ? 'Edit profile' : 'Create profile'}</strong>
      <div className="form-grid">
        <label>
          First name *
          <input required value={form.firstName} onChange={set('firstName')} maxLength={100} />
        </label>
        <label>
          Last name *
          <input required value={form.lastName} onChange={set('lastName')} maxLength={100} />
        </label>
        <label>
          Email *
          <input required type="email" value={form.email} onChange={set('email')} maxLength={320} />
        </label>
        <label>
          Phone
          <input value={form.phone} onChange={set('phone')} maxLength={50} />
        </label>
        <label>
          City
          <input value={form.city} onChange={set('city')} maxLength={100} />
        </label>
        <label>
          Country
          <input value={form.country} onChange={set('country')} maxLength={100} />
        </label>
        <label className="span2">
          Headline
          <input value={form.headline} onChange={set('headline')} maxLength={300} />
        </label>
        <label className="span2">
          Summary
          <textarea rows={4} value={form.summary} onChange={set('summary')} maxLength={5000} />
        </label>
      </div>
      {error && <p className="err">{error}</p>}
      <button type="submit" disabled={saving}>
        {saving ? 'Saving…' : profile ? 'Update' : 'Create'}
      </button>
    </form>
  );
}
