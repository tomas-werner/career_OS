/**
 * Unit tests for three-level job deduplication (plan.md section 37).
 */
import { describe, expect, it } from 'vitest';
import { deduplicateJob } from '../src/dedup';
import { hashContent } from '../src/hash';

const existing = [
  {
    id: 'job-1',
    company: 'Acme Ltd',
    title: 'Data Engineer (H/F) — CDI',
    location: 'Paris, France',
    description: 'Build data pipelines with Python and SQL for analytics.',
    descriptionHash: hashContent('Build data pipelines with Python and SQL for analytics.'),
  },
];

describe('deduplicateJob (plan.md section 37)', () => {
  it('classifies a different job as UNIQUE', () => {
    const result = deduplicateJob(
      {
        company: 'Other Corp',
        title: 'Financial Analyst',
        description: 'Totally different content about finance.',
      },
      existing,
    );
    expect(result.classification).toBe('UNIQUE');
  });

  it('detects level 2 duplicates via identical description hash', () => {
    const result = deduplicateJob(
      {
        company: 'Acme Inc.',
        title: 'Data Engineer',
        location: 'Paris',
        description: 'Build data pipelines with Python and SQL for analytics.',
        descriptionHash: hashContent('Build data pipelines with Python and SQL for analytics.'),
      },
      existing,
    );
    expect(result.classification).toBe('DUPLICATE');
    expect(result.level).toBe(2);
    expect(result.matchedJobId).toBe('job-1');
  });

  it('normalizes company/title for level 1 matching (Inc vs Ltd, H/F, CDI)', () => {
    const result = deduplicateJob(
      {
        company: 'ACME inc',
        title: 'data engineer',
        location: 'Paris, France',
        description: 'Completely rewritten posting with new sentences.',
      },
      existing,
    );
    // Same identity, different description -> REVIEW
    expect(result.classification).toBe('REVIEW');
    expect(result.level).toBe(1);
  });

  it('detects near-identical descriptions as DUPLICATE at level 3', () => {
    const result = deduplicateJob(
      {
        company: 'Acme',
        title: 'Data Engineer',
        location: 'Paris',
        description:
          'Build data pipelines with Python and SQL for analytics teams. Build data pipelines with Python and SQL for analytics.',
      },
      existing,
    );
    expect(result.classification).toBe('DUPLICATE');
    expect(result.level).toBe(3);
    expect(result.similarity).toBeGreaterThanOrEqual(0.85);
  });

  it('is deterministic', () => {
    const job = {
      company: 'Acme',
      title: 'Data Engineer',
      description: 'Build data pipelines with Python and SQL for analytics.',
    };
    const a = deduplicateJob(job, existing);
    const b = deduplicateJob(job, existing);
    expect(a).toEqual(b);
  });
});
