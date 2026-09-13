/**
 * Unit tests for the deterministic claim validator (plan.md section 15).
 */
import { describe, expect, it } from 'vitest';
import { computeConfidence, isValueSupportedByQuotes, validateClaim } from '../src/claims';
import type { EvidenceWithSource } from '../src/claims';

const claim = { id: 'claim-1', subject: 'candidate', predicate: 'knows', value: 'React' };

function evidence(id: string, sourceType?: string, quote = 'Used React daily'): EvidenceWithSource {
  return { id, sourceId: `src-${id}`, quote, sourceType };
}

describe('validateClaim (plan.md section 15)', () => {
  it('returns UNVERIFIED when no evidence is linked', () => {
    const result = validateClaim(claim, []);
    expect(result.status).toBe('UNVERIFIED');
    expect(result.confidence).toBe(0);
    expect(result.evidenceIds).toEqual([]);
  });

  it('returns VERIFIED with strong evidence (CV source)', () => {
    const result = validateClaim(claim, [evidence('e1', 'CV')]);
    expect(result.status).toBe('VERIFIED');
    expect(result.confidence).toBeGreaterThanOrEqual(0.5);
    expect(result.evidenceIds).toEqual(['e1']);
  });

  it('returns UNVERIFIED with only weak evidence (manual entry)', () => {
    const result = validateClaim(claim, [evidence('e1', 'MANUAL_ENTRY')]);
    expect(result.status).toBe('UNVERIFIED');
    expect(result.confidence).toBeLessThan(0.5);
  });

  it('returns REJECTED when contradicted', () => {
    const result = validateClaim(claim, [evidence('e1', 'CV')], [
      { claimId: 'claim-1', evidenceId: 'e1' },
    ]);
    expect(result.status).toBe('REJECTED');
    expect(result.confidence).toBe(0);
  });

  it('ignores contradictions for other claims', () => {
    const result = validateClaim(claim, [evidence('e1', 'CV')], [
      { claimId: 'claim-2', evidenceId: 'e1' },
    ]);
    expect(result.status).toBe('VERIFIED');
  });

  it('caps confidence at 1 with many evidence items', () => {
    const many = Array.from({ length: 5 }, (_, i) => evidence(`e${i}`, 'CERTIFICATE'));
    const result = validateClaim(claim, many);
    expect(result.confidence).toBeLessThanOrEqual(1);
    expect(result.status).toBe('VERIFIED');
  });

  it('is deterministic — same input gives same output', () => {
    const evs = [evidence('e1', 'CV'), evidence('e2', 'PORTFOLIO')];
    const a = validateClaim(claim, evs);
    const b = validateClaim(claim, evs);
    expect(a).toEqual(b);
  });
});

describe('computeConfidence', () => {
  it('returns 0 for empty evidence', () => {
    expect(computeConfidence([])).toBe(0);
  });

  it('is additive across evidence and capped at 1', () => {
    expect(computeConfidence([evidence('e1', 'CV')])).toBe(0.5);
    expect(computeConfidence([evidence('e1', 'CV'), evidence('e2', 'CV')])).toBe(1);
    expect(
      computeConfidence([evidence('e1', 'MANUAL_ENTRY'), evidence('e2', 'MANUAL_ENTRY')]),
    ).toBe(0.5);
  });
});

describe('isValueSupportedByQuotes (anti-hallucination, plan.md section 16)', () => {
  it('accepts a value directly present in a quote', () => {
    expect(isValueSupportedByQuotes('React', ['Built dashboards with React'])).toBe(true);
  });

  it('rejects a value absent from all quotes', () => {
    expect(isValueSupportedByQuotes('Spring Boot', ['Built dashboards with React'])).toBe(false);
  });

  it('never infers React from JavaScript (no inference rule)', () => {
    expect(
      isValueSupportedByQuotes('React', ['Solid JavaScript knowledge, ES6+']),
    ).toBe(false);
  });

  it('rejects empty values', () => {
    expect(isValueSupportedByQuotes('  ', ['anything'])).toBe(false);
  });
});
