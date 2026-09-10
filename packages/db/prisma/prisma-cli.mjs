#!/usr/bin/env node
/**
 * Prisma CLI wrapper that loads the repo-root .env before exec'ing.
 * Usage: node prisma/prisma-cli.mjs <prisma args...>
 * e.g. node prisma/prisma-cli.mjs migrate deploy
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const rootEnv = resolve(here, '..', '..', '..', '.env');

try {
  const raw = readFileSync(rootEnv, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    if (line.trim().startsWith('#')) continue;
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match) continue;
    let value = match[2];
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (process.env[match[1]] === undefined) process.env[match[1]] = value;
  }
} catch {
  console.warn(`[db] WARNING: could not read ${rootEnv}`);
}

// prisma is a devDependency of this package -> bin lives in packages/db/node_modules
const candidates = [
  resolve(here, '..', 'node_modules', '.bin', process.platform === 'win32' ? 'prisma.cmd' : 'prisma'),
  resolve(here, '..', '..', '..', 'node_modules', '.bin', process.platform === 'win32' ? 'prisma.cmd' : 'prisma'),
];
const bin = candidates.find((p) => existsSync(p));
if (!bin) {
  console.error('prisma CLI not found. Run pnpm install first.');
  process.exit(1);
}

const result = spawnSync(`"${bin}"`, process.argv.slice(2), {
  stdio: 'inherit',
  env: process.env,
  shell: true,
});
process.exit(result.status ?? 1);
