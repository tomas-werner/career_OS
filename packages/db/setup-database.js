/**
 * Apply schema.sql and seed baseline reference data against Neon PostgreSQL.
 * Idempotent for seeds; schema DDL is skipped when core tables already exist.
 */
const { readFileSync } = require('node:fs');
const { resolve, join } = require('node:path');
const { randomUUID } = require('node:crypto');
const { Pool } = require('pg');
const { migrateLegacyColumns } = require('./migrate-legacy-columns');

const rootEnv = resolve(__dirname, '..', '..', '.env');

function loadRootEnv() {
  if (process.env.POSTGRES_URL) return;
  try {
    const raw = readFileSync(rootEnv, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!match || line.trim().startsWith('#')) continue;
      const key = match[1];
      let value = match[2];
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    console.warn(`[setup-db] WARNING: could not read ${rootEnv}`);
  }
}

async function tableExists(client, tableName) {
  const result = await client.query(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = $1
     ) AS exists`,
    [tableName],
  );
  return result.rows[0]?.exists === true;
}

async function applySchema(client) {
  const schemaPath = join(__dirname, 'prisma', 'migrations', '20260910130006_init', 'migration.sql');
  const auditRulesPath = join(__dirname, 'prisma', 'audit-rule.sql');
  const schema = readFileSync(schemaPath, 'utf8');
  await client.query(schema);
  console.info('[setup-db] Applied Prisma migration schema');

  try {
    const auditRules = readFileSync(auditRulesPath, 'utf8');
    await client.query(auditRules);
    console.info('[setup-db] Applied audit immutability rules');
  } catch {
    console.warn('[setup-db] audit-rule.sql not applied (optional)');
  }
}

async function seedBaseline(client) {
  const scoreRule = await client.query(
    `INSERT INTO "ScoreRuleVersion"
       (id, name, "educationWeight", "experienceWeight", "skillsWeight", "toolsWeight", "keywordWeight", version, active)
     SELECT $1, 'baseline-v1', 0.2, 0.3, 0.3, 0.1, 0.1, 1, true
     WHERE NOT EXISTS (SELECT 1 FROM "ScoreRuleVersion" WHERE version = 1)
     RETURNING id, name, version`,
    [randomUUID()],
  );
  if (scoreRule.rowCount) {
    const row = scoreRule.rows[0];
    console.info(`[setup-db] Seeded ScoreRuleVersion ${row.name} v${row.version}`);
  }

  const manualSource = await client.query(
    `INSERT INTO "JobSource" (id, name, type)
     SELECT $1, 'manual-entry', 'MANUAL'
     WHERE NOT EXISTS (SELECT 1 FROM "JobSource" WHERE type = 'MANUAL')
     RETURNING id, name`,
    [randomUUID()],
  );
  if (manualSource.rowCount) {
    console.info(`[setup-db] Seeded JobSource ${manualSource.rows[0].name}`);
  }

  const fixtureSources = [
    { name: 'local-html-fixture', type: 'FIXTURE_HTML' },
    { name: 'local-pdf-fixture', type: 'FIXTURE_PDF' },
    { name: 'json-fixture', type: 'FIXTURE_JSON' },
    { name: 'mock-api', type: 'MOCK_API' },
  ];

  for (const source of fixtureSources) {
    const inserted = await client.query(
      `INSERT INTO "JobSource" (id, name, type)
       SELECT $1, $2, $3
       WHERE NOT EXISTS (SELECT 1 FROM "JobSource" WHERE name = $2)
       RETURNING name`,
      [randomUUID(), source.name, source.type],
    );
    if (inserted.rowCount) {
      console.info(`[setup-db] Seeded JobSource ${inserted.rows[0].name}`);
    }
  }
}

async function main() {
  loadRootEnv();
  if (!process.env.POSTGRES_URL) {
    console.error('[setup-db] POSTGRES_URL is required. Copy .env.example to .env and fill it in.');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
  const client = await pool.connect();

  try {
    if (!(await tableExists(client, 'CandidateProfile'))) {
      await applySchema(client);
    } else {
      console.info('[setup-db] Schema already present — skipping DDL');
    }

    const renamed = await migrateLegacyColumns(client);
    if (renamed > 0) {
      console.info(`[setup-db] Migrated ${renamed} legacy column name(s) to camelCase`);
    }

    await seedBaseline(client);
    console.info('[setup-db] Done');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('[setup-db] Failed:', error);
  process.exit(1);
});
