import { prisma } from '@career-os/db';

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
    value === undefined ? undefined : (value as object);
  try {
    await prisma.auditLog.create({
      data: {
        actorType: input.actorType,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        source: input.source,
        before: toNullableJson(input.before),
        after: toNullableJson(input.after),
        metadata: toNullableJson(input.metadata),
        correlationId: input.correlationId,
      },
    });
  } catch (error) {
    console.error('audit write failed:', error);
    throw error;
  }
}
