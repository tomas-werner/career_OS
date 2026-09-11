import { query } from '@career-os/db';
import { newId } from '@career-os/shared';

export type AuditInput = {
  actorType: 'USER' | 'SYSTEM' | 'AI' | 'N8N' | 'WORKER' | 'EXTERNAL_API';
  action: string;
  entityType: string;
  entityId?: string;
  source?: string;
  before?: unknown;
  after?: unknown;
  metadata?: unknown;
  correlationId?: string;
};

/**
 * Append-only audit writer (plan.md section 30).
 * Never call update/delete on AuditLog — append only.
 */
export async function writeAudit(input: AuditInput): Promise<void> {
  const toNullableJson = (value: unknown) =>
    value === undefined ? null : JSON.stringify(value);
  try {
    await query(
      `INSERT INTO "AuditLog" (id, "actorType", "action", "entityType", "entityId", "source", "before", "after", "metadata", "correlationId")
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9::jsonb, $10)`,
      [
        newId(),
        input.actorType,
        input.action,
        input.entityType,
        input.entityId,
        input.source,
        toNullableJson(input.before),
        toNullableJson(input.after),
        toNullableJson(input.metadata),
        input.correlationId,
      ]
    );
  } catch (error) {
    console.error('audit write failed:', error);
    throw error;
  }
}
