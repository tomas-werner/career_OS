# ADR-004: Audit and Immutability

Status: Accepted
Date: 2026-09-10

## Context

Every significant system action must be traceable (plan.md sections 29-32).
Audit records must be immutable through normal application APIs.

## Decision

- `AuditLog` is append-only. The application layer uses an `writeAudit()`
  helper that only inserts; no update/delete helpers exist.
- Database-level enforcement: Postgres `CREATE RULE ... DO INSTEAD NOTHING`
  rules block UPDATE/DELETE on `AuditLog` (see `packages/db/prisma/audit-rule.sql`,
  applied via migration).
- Every event carries `actorType` (USER, SYSTEM, AI, N8N, WORKER, EXTERNAL_API),
  `action`, `entityType`, `entityId`, `correlationId`.
- `correlationId` (e.g. JOB-2026-000123) propagates across API logs, AI logs,
  ApplicationEvent and n8n execution metadata.

## Consequences

- Controlled maintenance requires explicitly dropping the rule, performing
  the change, re-creating the rule and recording a SECURITY_EVENT.
- Audit queries must filter, never mutate. The audit UI is read-only.
