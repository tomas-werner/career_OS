/**
 * AI Regression Suite (plan.md section 47).
 *
 * Runs structural invariant checks against the running Career OS API.
 * All checks use the live HTTP API — no direct DB imports needed.
 */

const BASE = 'http://localhost:3000';

async function call(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(120_000),
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, json };
}

/** Invariant 2: CV excludes UNVERIFIED claims */
async function cvExcludesUnverified() {
  const r = await call('POST', '/api/sources', { title: 'Reg Source', url: 'http://example.com' });
  const source = r.json;

  const er = await call('POST', '/api/evidence', { sourceId: source.sourceId, content: 'Reg evidence', type: 'article' });
  const evidence = er.json;

  // Claim with evidence → VERIFIED
  await call('POST', '/api/claims', { text: 'Claim with evidence', evidenceId: evidence.evidenceId, status: 'test' });

  // Claim without evidence → UNVERIFIED
  const noEvClaim = await call('POST', '/api/claims', { text: 'Claim no evidence', status: 'test' });

  // Get CV
  const cv = await call('POST', '/api/documents/cv', { includeSkills: true, includeExperience: true });
  const unverified = cv.json.claims.filter(c => c.status === 'UNVERIFIED');
  if (unverified.length > 0) {
    throw new Error(`INVARIANT FAIL: CV contains ${unverified.length} UNVERIFIED claim(s)`);
  }
  return { name: 'cvExcludesUnverified', passed: true, detail: `CV has ${cv.json.claims.length} claims, all verified` };
}

/** Invariant 4: Fact-checker determinism */
async function factCheckerDeterminism() {
  const c1 = await call('POST', '/api/claims', { text: 'Det test claim', status: 'test' } );
  const c2 = await call('POST', '/api/claims', { text: 'Det test claim', status: 'test' } );
  if (c1.json.status !== c2.json.status) {
    throw new Error(`INVARIANT FAIL: Same claim text → ${c1.json.status} vs ${c2.json.status}`);
  }
  return { name: 'factCheckerDeterminism', passed: true, detail: `Both status=${c1.json.status}` };
}

/** Invariant 3: Dedup idempotency */
async function dedupIdempotent() {
  const job = {
    title: 'Dedup Reg ' + Date.now(),
    company: 'Dedup Corp',
    location: 'Remote',
    description: 'Role requiring Python and SQL.',
  };
  const r1 = await call('POST', '/api/jobs', job );
  const r2 = await call('POST', '/api/jobs', job );
  if (r2.status !== 409) {
    throw new Error(`INVARIANT FAIL: Second job returned ${r2.status}, expected 409`);
  }
  return { name: 'dedupIdempotent', passed: true, detail: 'Second ingestion → 409' };
}

/** Run suite */
const invariants = [
  { name: 'cvExcludesUnverified', fn: cvExcludesUnverified },
  { name: 'factCheckerDeterminism', fn: factCheckerDeterminism },
  { name: 'dedupIdempotent', fn: dedupIdempotent },
];

const results = [];
for (const inv of invariants) {
  try {
    const r = await inv.fn();
    results.push({ ...inv, passed: r.passed, detail: r.detail });
    console.log(`✅ ${inv.name}: ${r.detail}`);
  } catch (err) {
    results.push({ ...inv, passed: false, detail: err.message });
    console.error(`❌ ${inv.name}: ${err.message}`);
  }
}

console.log('\n--- AI REGRESSION SUITE §47 SUMMARY ---');
let allPassed = true;
for (const r of results) {
  const status = r.passed ? 'PASS' : 'FAIL';
  if (!r.passed) allPassed = false;
  console.log(`[${status}] ${r.name}: ${r.detail}`);
}
console.log(`${allPassed ? '✅ ALL INVARIANTS PASSED' : '❌ SOME INVARIANTS FAILED'}`);
process.exit(allPassed ? 0 : 1);