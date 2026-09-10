-- AuditLog immutability (plan.md section 32).
-- Blocks UPDATE and DELETE on the AuditLog table at the database level.
-- Applied automatically at the end of `prisma migrate deploy` via the
-- migration SQL. To lift it temporarily for controlled maintenance,
-- drop the rule, perform maintenance, re-create the rule, and record a
-- SECURITY_EVENT audit entry.

CREATE RULE audit_log_no_update AS ON UPDATE TO "AuditLog" DO INSTEAD NOTHING;
CREATE RULE audit_log_no_delete AS ON DELETE TO "AuditLog" DO INSTEAD NOTHING;
