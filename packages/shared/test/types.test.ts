import { describe, expect, it } from 'vitest';
import {
  APPROVAL_ACTIONS,
  APPLICATION_STATUSES,
  AUDIT_ACTOR_TYPES,
  CLAIM_STATUSES,
  JOB_REQUIREMENT_CATEGORIES,
  SOURCE_TYPES,
} from '../src/types.js';

describe('shared enums', () => {
  it('contain the canonical plan.md values', () => {
    expect(CLAIM_STATUSES).toEqual([
      'VERIFIED',
      'UNVERIFIED',
      'REJECTED',
      'EXPIRED',
      'CONTESTED',
    ]);
    expect(APPLICATION_STATUSES).toHaveLength(11);
    expect(APPLICATION_STATUSES).toContain('ENTRETIEN');
    expect(SOURCE_TYPES).toContain('CV');
    expect(AUDIT_ACTOR_TYPES).toContain('N8N');
    expect(APPROVAL_ACTIONS).toContain('SEND_EMAIL');
    expect(JOB_REQUIREMENT_CATEGORIES).toContain('CERTIFICATION');
  });
});
