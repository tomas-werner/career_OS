/**
 * Smoke test: verifies Stage A acceptance criteria without Docker.
 * Checks /health, /health/db and (optionally) /health/n8n endpoints.
 *
 * Usage: node infra/scripts/smoke.mjs [baseUrl]
 *   baseUrl defaults to http://localhost:3000
 */
const baseUrl = process.argv[2] ?? 'http://localhost:3000';

let failures = 0;

async function check(path, expectOk = true) {
  const url = `${baseUrl}${path}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    let body = '';
    try {
      body = JSON.stringify(await res.json());
    } catch {
      /* non-JSON body is fine for some endpoints */
    }
    const pass = expectOk ? res.ok : !res.ok;
    console.info(`${pass ? 'PASS' : 'FAIL'} ${path} -> HTTP ${res.status} ${body}`);
    if (!pass) failures++;
    return res.ok;
  } catch (error) {
    console.error(`FAIL ${path} -> ${error.message}`);
    failures++;
    return false;
  }
}

console.info(`Smoke test against ${baseUrl}`);
const webOk = await check('/api/health');
const dbOk = await check('/api/health/db');
const n8nOk = await check('/api/health/n8n');
await check('/'); // dashboard should render

console.info('---');
console.info(`web: ${webOk ? 'OK' : 'FAIL'} | db: ${dbOk ? 'OK' : 'FAIL'} | n8n: ${n8nOk ? 'OK' : 'FAIL (optional if n8n not running)'}`);
if (failures > 0) {
  console.error(`${failures} check(s) failed`);
  process.exit(1);
}
console.info('All required checks passed');
