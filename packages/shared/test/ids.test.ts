import { describe, expect, it } from 'vitest';
import { correlationId, newId } from '../src/ids.js';
import { canTransition } from '../src/types.js';

describe('correlationId', () => {
  it('formats domain-year-sequence', () => {
    expect(correlationId('JOB', 123, new Date('2026-01-05T00:00:00Z'))).toBe(
      'JOB-2026-000123',
    );
  });

  it('zero-pads beyond six digits unchanged', () => {
    expect(correlationId('APP', 1234567)).toMatch(/^APP-\d{4}-1234567$/);
  });
});

describe('newId', () => {
  it('returns unique uuids', () => {
    const a = newId();
    const b = newId();
    expect(a).not.toBe(b);
    expect(a).toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
  });
});

describe('canTransition (state machine guard used by the API layer)', () => {
  it('allows the happy path', () => {
    expect(canTransition('A_ANALYSER', 'A_PREPARER')).toBe(true);
    expect(canTransition('A_PREPARER', 'A_VALIDER')).toBe(true);
    expect(canTransition('A_VALIDER', 'PRETE')).toBe(true);
    expect(canTransition('PRETE', 'ENVOYEE')).toBe(true);
    expect(canTransition('ENVOYEE', 'REPONSE_RECUE')).toBe(true);
    expect(canTransition('REPONSE_RECUE', 'ENTRETIEN')).toBe(true);
    expect(canTransition('ENTRETIEN', 'OFFRE')).toBe(true);
    expect(canTransition('OFFRE', 'ACCEPTEE')).toBe(true);
    expect(canTransition('OFFRE', 'REFUSEE')).toBe(true);
  });

  it('rejects invalid transitions', () => {
    expect(canTransition('A_ANALYSER', 'ENVOYEE')).toBe(false);
    expect(canTransition('ENVOYEE', 'A_ANALYSER')).toBe(false);
    expect(canTransition('ARCHIVEE', 'A_ANALYSER')).toBe(false);
  });

  it('allows archiving from active states', () => {
    expect(canTransition('A_PREPARER', 'ARCHIVEE')).toBe(true);
    expect(canTransition('ENTRETIEN', 'ARCHIVEE')).toBe(true);
  });
});
