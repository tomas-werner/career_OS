/**
 * Unit tests for controlled document generation (plan.md sections 16-17).
 */
import { describe, expect, it } from 'vitest';
import {
  buildCvModel,
  factCheckDocument,
  usableClaims,
} from '../src/documents';
import type { ClaimForDocument } from '../src/documents';

const identity = {
  firstName: 'Jean',
  lastName: 'Test',
  email: 'jean@example.com',
  phone: '+33 6 00 00 00 00',
  city: 'Paris',
  country: 'France',
  headline: 'Data Engineer',
};

const claims: ClaimForDocument[] = [
  { id: 'c1', subject: 'candidate', predicate: 'knows', value: 'SQL', status: 'VERIFIED' },
  { id: 'c2', subject: 'candidate', predicate: 'knows', value: 'React', status: 'VERIFIED' },
  { id: 'c3', subject: 'candidate', predicate: 'knows', value: 'Spring Boot', status: 'UNVERIFIED' },
  { id: 'c4', subject: 'candidate', predicate: 'worked-at', value: 'BCG', status: 'VERIFIED' },
  { id: 'c5', subject: 'candidate', predicate: 'holds-degree-in', value: 'Computer Science', status: 'VERIFIED' },
];

describe('usableClaims (§16 — VERIFIED only)', () => {
  it('keeps only VERIFIED claims', () => {
    const usable = usableClaims(claims);
    expect(usable.map((claim) => claim.id)).toEqual(['c1', 'c2', 'c4', 'c5']);
  });
});

describe('buildCvModel (§16-17)', () => {
  it('builds statements only from verified claims', () => {
    const cv = buildCvModel(identity, claims);
    expect(cv.skillStatements.map((statement) => statement.statement)).toEqual([
      'candidate knows SQL',
      'candidate knows React',
    ]);
    expect(cv.experienceStatements.map((statement) => statement.statement)).toEqual([
      'candidate worked-at BCG',
    ]);
    expect(cv.educationStatements.map((statement) => statement.statement)).toEqual([
      'candidate holds-degree-in Computer Science',
    ]);
    // Unverified Spring Boot must NOT appear anywhere.
    expect(cv.content).not.toContain('Spring Boot');
  });

  it('is deterministic — same inputs give identical content and hash', () => {
    const a = buildCvModel(identity, claims);
    const b = buildCvModel(identity, claims);
    expect(a.content).toBe(b.content);
    expect(a.contentHash).toBe(b.contentHash);
  });

  it('renders identity and sections', () => {
    const cv = buildCvModel(identity, claims);
    expect(cv.content).toContain('JEAN TEST');
    expect(cv.content).toContain('SKILLS');
    expect(cv.content).toContain('EXPERIENCE');
    expect(cv.content).toContain('EDUCATION');
  });

  it('links every statement back to its claim (provenance §17)', () => {
    const cv = buildCvModel(identity, claims);
    expect(cv.claimsUsed.length).toBe(4);
    for (const used of cv.claimsUsed) {
      expect(used.claimId).toMatch(/^c\d$/);
      expect(used.statement.length).toBeGreaterThan(0);
    }
  });
});

describe('factCheckDocument (§8 — no claim without evidence)', () => {
  it('passes when every used claim is verified', () => {
    const cv = buildCvModel(identity, claims);
    const result = factCheckDocument(cv, claims);
    expect(result.passed).toBe(true);
    expect(result.violations).toEqual([]);
  });

  it('fails when a used claim lost its verified status', () => {
    const cv = buildCvModel(identity, claims);
    const revoked = claims.map((claim) =>
      claim.id === 'c1' ? { ...claim, status: 'REJECTED' as const } : claim,
    );
    const result = factCheckDocument(cv, revoked);
    expect(result.passed).toBe(false);
    expect(result.violations).toContain('candidate knows SQL');
  });
});
