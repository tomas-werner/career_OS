'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
  applicationId: string;
  currentStatus: string;
  validTransitions: string[];
}

export default function TransitionControls({ applicationId, currentStatus, validTransitions }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function transition(toStatus: string) {
    setBusy(toStatus);
    setError(null);
    try {
      const response = await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          toStatus,
          note: note || undefined,
        }),
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? `HTTP ${response.status}`);
      }
      setNote('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transition failed');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="panel-buttons">
        {validTransitions.length > 0 ? (
          validTransitions.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => transition(status)}
              disabled={busy !== null}
            >
              {busy === status ? 'Applying…' : `→ ${status}`}
            </button>
          ))
        ) : (
          <span className="muted">Terminal state — no transitions available.</span>
        )}
      </div>
      <label>
        Note (optional, stored with the event)
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={2000}
          placeholder="Context for this transition…"
        />
      </label>
      {error && <p className="err">{error}</p>}
    </div>
  );
}
