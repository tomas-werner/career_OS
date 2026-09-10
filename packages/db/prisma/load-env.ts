/**
 * Loads the repo-root .env into process.env (idempotent, safe to require
 * from any package script). The db package has no .env of its own.
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const rootEnv = resolve(here, '..', '..', '..', '.env');

export function loadRootEnv(): void {
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
    console.warn(`[db] WARNING: could not read ${rootEnv}`);
  }
}

loadRootEnv();
