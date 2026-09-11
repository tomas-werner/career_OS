/**
 * Server-side health helpers (plan.md section 50).
 * Used by /health API routes, the dashboard and the smoke test script.
 */
import { healthCheck } from '@career-os/db';

export interface HealthStatus {
  ok: boolean;
  db: boolean;
  n8n?: { ok: boolean; detail?: string };
  checkedAt: Date;
}

async function checkDb(): Promise<boolean> {
  return healthCheck();
}

function checkN8n(): Promise<{ ok: boolean; detail?: string }> {
  const base = process.env.N8N_BASE_URL ?? 'http://n8n:5678';
  const timeoutMs = Number(process.env.HEALTH_TIMEOUT_MS ?? 5000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(`${base}/healthz`, { signal: controller.signal, cache: 'no-store' })
    .then(async (res) => ({ ok: res.ok, detail: `HTTP ${res.status}` }))
    .catch((e: unknown) => ({ ok: false, detail: e instanceof Error ? e.message : 'error' }))
    .finally(() => clearTimeout(timer));
}

export async function getHealth(): Promise<HealthStatus> {
  const db = await checkDb();
  return { ok: db, db, checkedAt: new Date() };
}

export async function getFullHealth(): Promise<HealthStatus> {
  const db = await checkDb();
  const n8n = await checkN8n();
  return { ok: db && n8n.ok, db, n8n, checkedAt: new Date() };
}
