import { describe, expect, it } from 'vitest';
import {
  createJobSchema,
  createApplicationSchema,
  transitionSchema,
  createExperienceSchema,
  createEducationSchema,
  createSkillSchema,
  createCertificationSchema,
  upsertProfileSchema,
  createSourceSchema,
  createEvidenceSchema,
  createClaimSchema,
} from '../app/api/schemas';

describe('createJobSchema', () => {
  it('accepts a valid job', () => {
    const result = createJobSchema.safeParse({
      title: 'Financial Analyst',
      company: 'Acme Ltd',
      description: 'A job description.',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing title', () => {
    const result = createJobSchema.safeParse({ company: 'Acme', description: 'x' });
    expect(result.success).toBe(false);
  });

  it('rejects oversized descriptions (50k limit)', () => {
    const result = createJobSchema.safeParse({
      title: 'T',
      company: 'C',
      description: 'a'.repeat(50_001),
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid canonicalUrl', () => {
    const result = createJobSchema.safeParse({
      title: 'T',
      company: 'C',
      description: 'x',
      canonicalUrl: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });
});

describe('createApplicationSchema', () => {
  it('requires both ids', () => {
    expect(createApplicationSchema.safeParse({ jobOfferId: 'a' }).success).toBe(false);
    expect(
      createApplicationSchema.safeParse({ jobOfferId: 'a', profileId: 'b' }).success,
    ).toBe(true);
  });
});

describe('transitionSchema', () => {
  it('accepts valid statuses and rejects unknown ones', () => {
    expect(transitionSchema.safeParse({ applicationId: 'x', toStatus: 'PRETE' }).success).toBe(true);
    expect(transitionSchema.safeParse({ applicationId: 'x', toStatus: 'NOPE' }).success).toBe(
      false,
    );
  });
});

describe('upsertProfileSchema', () => {
  it('requires names and valid email', () => {
    expect(
      upsertProfileSchema.safeParse({ firstName: 'A', lastName: 'B', email: 'nope' }).success,
    ).toBe(false);
    expect(
      upsertProfileSchema.safeParse({ firstName: 'A', lastName: 'B', email: 'a@b.co' }).success,
    ).toBe(true);
  });
});

describe('createSourceSchema', () => {
  it('rejects unknown source types and bad URIs', () => {
    expect(createSourceSchema.safeParse({ type: 'WEIRD', name: 'x' }).success).toBe(false);
    expect(createSourceSchema.safeParse({ type: 'CV', name: 'x', uri: 'nope' }).success).toBe(
      false,
    );
    expect(
      createSourceSchema.safeParse({ type: 'CV', name: 'x', uri: 'https://a.co' }).success,
    ).toBe(true);
  });
});

describe('createEvidenceSchema', () => {
  it('requires sourceId and non-empty quote', () => {
    expect(createEvidenceSchema.safeParse({ sourceId: 's1', quote: '' }).success).toBe(false);
    expect(createEvidenceSchema.safeParse({ sourceId: 's1', quote: 'quoted text' }).success).toBe(
      true,
    );
  });
});

describe('createClaimSchema', () => {
  it('defaults evidenceIds to empty array', () => {
    const result = createClaimSchema.safeParse({
      profileId: 'p1',
      subject: 'candidate',
      predicate: 'knows',
      value: 'React',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.evidenceIds).toEqual([]);
  });
  it('caps evidence list at 50', () => {
    const ids = Array.from({ length: 51 }, (_, i) => `e${i}`);
    expect(
      createClaimSchema.safeParse({
        profileId: 'p1',
        subject: 'candidate',
        predicate: 'knows',
        value: 'React',
        evidenceIds: ids,
      }).success,
    ).toBe(false);
  });
});

describe('createExperienceSchema', () => {
  const base = { profileId: 'p1', company: 'Acme', role: 'Dev', startDate: '2024-01-01' };

  it('requires endDate when not current', () => {
    expect(createExperienceSchema.safeParse(base).success).toBe(false);
  });

  it('accepts current position without endDate', () => {
    expect(createExperienceSchema.safeParse({ ...base, current: true }).success).toBe(true);
  });

  it('rejects endDate before startDate', () => {
    expect(
      createExperienceSchema.safeParse({ ...base, endDate: '2023-01-01' }).success,
    ).toBe(false);
  });

  it('rejects malformed dates', () => {
    expect(createExperienceSchema.safeParse({ ...base, current: true, startDate: '01/2024/01' }).success).toBe(false);
  });
});

describe('createEducationSchema', () => {
  const base = {
    profileId: 'p1',
    institution: 'X',
    degree: 'MSc',
    field: 'CS',
    startDate: '2020-09-01',
  };

  it('accepts valid education and rejects bad date order', () => {
    expect(createEducationSchema.safeParse(base).success).toBe(true);
    expect(
      createEducationSchema.safeParse({ ...base, endDate: '2019-01-01' }).success,
    ).toBe(false);
  });
});

describe('createSkillSchema', () => {
  it('requires name, defaults evidenceIds', () => {
    const result = createSkillSchema.safeParse({ profileId: 'p1', name: 'React' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.evidenceIds).toEqual([]);
  });
});

describe('createCertificationSchema', () => {
  const base = {
    profileId: 'p1',
    name: 'AWS SAA',
    issuer: 'Amazon',
    issueDate: '2024-06-01',
  };

  it('accepts valid cert and rejects expiration before issue', () => {
    expect(createCertificationSchema.safeParse(base).success).toBe(true);
    expect(
      createCertificationSchema.safeParse({ ...base, expirationDate: '2024-01-01' }).success,
    ).toBe(false);
  });
  it('rejects invalid credential URL', () => {
    expect(
      createCertificationSchema.safeParse({ ...base, credentialUrl: 'nope' }).success,
    ).toBe(false);
  });
});
