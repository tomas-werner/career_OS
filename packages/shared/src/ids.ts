import { randomUUID } from 'node:crypto';

/** RFC 4122 v4 UUID — used for most entity ids (cuid strings in DB layer). */
export function newId(): string {
  return randomUUID();
}

/**
 * Human-readable correlation id, e.g. JOB-2026-000123 (plan.md section 29).
 * Must be used in API logs, AI logs, AuditLog, ApplicationEvent and n8n
 * execution metadata so a single logical action is traceable end-to-end.
 */
export function correlationId(
  domain: 'JOB' | 'APP' | 'CV' | 'EMAIL' | 'WORKFLOW' | 'AUDIT',
  sequence: number,
  date = new Date(),
): string {
  const year = date.getUTCFullYear();
  return `${domain}-${year}-${String(sequence).padStart(6, '0')}`;
}
