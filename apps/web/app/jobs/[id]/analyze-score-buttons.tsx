'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
  jobId: string;
  hasAnalysis: boolean;
}

export default function AnalyzeScoreButtons({ jobId, hasAnalysis }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<'analyze' | 'score' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAnalyze() {
    setBusy('analyze');
    setError(null);
    try {
      const response = await fetch(`/api/jobs/${jobId}/analyze`, { method: 'POST' });
      const body = (await response.json()) as { error?: string; reason?: string; detail?: string; warnings?: { promptInjectionSuspected: boolean } | null };
      if (!response.ok) {
        throw new Error(`${body.error ?? response.status}${body.reason ? ` (${body.reason})` : ''}`);
      }
      if (body.warnings?.promptInjectionSuspected) {
        setError('Analysis saved, but the job text contained suspected prompt-injection patterns (logged for audit).');
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analyze failed');
    } finally {
      setBusy(null);
    }
  }

  async function runScore() {
    setBusy('score');
    setError(null);
    try {
      const response = await fetch(`/api/jobs/${jobId}/score`, { method: 'POST' });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error ?? `HTTP ${response.status}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scoring failed');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="panel-buttons">
      <button type="button" onClick={runAnalyze} disabled={busy !== null}>
        {busy === 'analyze' ? 'Extracting…' : 'Run AI analysis (NVIDIA)'}
      </button>
      <button type="button" onClick={runScore} disabled={busy !== null || !hasAnalysis}>
        {busy === 'score' ? 'Scoring…' : 'Compute deterministic score'}
      </button>
      {error && <p className="warn" style={{ width: '100%' }}>{error}</p>}
    </div>
  );
}
