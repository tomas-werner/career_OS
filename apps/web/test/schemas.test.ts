import { describe, expect, it } from 'vitest';
import {
  createJobSchema,
  createApplicationSchema,
  transitionSchema,
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
