import { query } from '@career-os/db';
import { newId } from '@career-os/shared';

export type ApprovalInput = {
  correlationId: string; // e.g. APP-<uuid> linking to an application
  approved: boolean;
  actor: 'USER' | 'SYSTEM';
};

export type ApprovalStatus = {
  approved: boolean | null;
  approvedBy?: string;
  approvedAt?: string;
  reason?: string;
};

/**
 * Record a human approval (or rejection) for a draft action.
 * Creates an Approval record that subsequent "send" actions must check before proceeding.
 */
export async function recordApproval(input: ApprovalInput): Promise<void> {
  await query(
    `INSERT INTO "Approval" (id, "correlationId", "approved", "actor", "createdAt")
     VALUES ($1, $2, $3, $4, $5)`,
    [newId(), input.correlationId, input.approved, input.actor, new Date().toISOString()],
  );
}

/**
 * Check whether a draft identified by correlationId has been approved.
 * Returns null if no record exists, otherwise the approval status.
 */
export async function checkApproval(correlationId: string): Promise<ApprovalStatus | null> {
  const rows = await query<
    { approved: boolean; actor: string; created_at: string }[]
  >(
    `SELECT "approved", "actor", "createdAt" FROM "Approval" WHERE "correlationId" = $1 ORDER BY "createdAt" DESC LIMIT 1`,
    [correlationId],
  );
  if (rows.length === 0) return null;
  const r = rows[rows.length - 1] as { approved: boolean; actor: string; created_at: string };
  return { approved: r.approved, approvedBy: r.actor, approvedAt: r.created_at };
}

/**
 * Guard: before any "send" action (email, API call, external), verify that
 * an approval record exists for the given correlationId and that it is `approved === true`.
 * Throws 403 if not approved, 404 if no record.
 */
export async function guardSend(correlationId: string): Promise<void> {
  const status = await checkApproval(correlationId);
  if (!status) {
    const err = new Error('No approval record found for this draft');
    ;(err as any).status = 404;
    throw err;
  }
  if (status.approved !== true) {
    const err = new Error('Draft not approved yet');
    ;(err as any).status = 403;
    throw err;
  }
}