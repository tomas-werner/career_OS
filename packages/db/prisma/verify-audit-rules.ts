/**
 * Verifies AuditLog immutability rules exist in the database (plan section 32)
 * and that an UPDATE attempt is silently blocked (DO INSTEAD NOTHING).
 * Run after migrations: node --experimental-strip-types prisma/verify-audit-rules.ts
 */
import { PrismaClient } from '@prisma/client';
import './load-env.ts';

const prisma = new PrismaClient();

async function main() {
  const rules = await prisma.$queryRawUnsafe<{ rulename: string }[]>(
    "SELECT rulename FROM pg_rules WHERE tablename = 'AuditLog'",
  );
  const names = rules.map((r) => r.rulename).sort();
  console.info('AuditLog rules:', JSON.stringify(names));

  const expected = ['audit_log_no_delete', 'audit_log_no_update'];
  const missing = expected.filter((r) => !names.includes(r));
  if (missing.length > 0) {
    throw new Error(`Missing immutability rules: ${missing.join(', ')}`);
  }

  // Functional check: UPDATE must be a no-op
  const created = await prisma.auditLog.create({
    data: {
      actorType: 'SYSTEM',
      action: 'SECURITY_EVENT',
      entityType: 'AuditRuleVerification',
      metadata: { test: true },
    },
  });
  await prisma.$executeRawUnsafe(
    'UPDATE "AuditLog" SET action = $1 WHERE id = $2',
    'TAMPERED',
    created.id,
  );
  const after = await prisma.auditLog.findUnique({ where: { id: created.id } });
  if (after?.action !== 'SECURITY_EVENT') {
    throw new Error(`Immutability FAILED — action is ${after?.action}`);
  }
  console.info('Immutability verified: UPDATE on AuditLog was blocked.');
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
