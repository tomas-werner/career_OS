/**
 * Seed: baseline reference data.
 * - default ScoreRuleVersion (deterministic scoring, plan section 12)
 * - default JobSource entries for the test fixture adapters (section 36)
 *
 * Idempotent: safe to run repeatedly.
 */
import { PrismaClient } from '@prisma/client';
import './load-env.ts';

const prisma = new PrismaClient();

async function main() {
  const rule = await prisma.scoreRuleVersion.upsert({
    where: { version: 1 },
    update: {},
    create: {
      name: 'baseline-v1',
      educationWeight: 0.2,
      experienceWeight: 0.3,
      skillsWeight: 0.3,
      toolsWeight: 0.1,
      keywordWeight: 0.1,
      version: 1,
      active: true,
    },
  });
  console.info(`Seeded ScoreRuleVersion ${rule.name} v${rule.version} (active)`);

  const sources = [
    { name: 'local-html-fixture', type: 'FIXTURE_HTML' },
    { name: 'local-pdf-fixture', type: 'FIXTURE_PDF' },
    { name: 'json-fixture', type: 'FIXTURE_JSON' },
    { name: 'mock-api', type: 'MOCK_API' },
  ];
  for (const s of sources) {
    const existing = await prisma.jobSource.findFirst({ where: { name: s.name } });
    if (!existing) {
      await prisma.jobSource.create({ data: s });
      console.info(`Seeded JobSource ${s.name}`);
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
