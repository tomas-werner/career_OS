import { describe, expect, it } from 'vitest';
import {
  normalizeCompanyName,
  normalizeText,
  normalizeTitle,
  trigramSimilarity,
} from '../src/normalize.js';

describe('normalizeText', () => {
  it('strips accents and lowercases', () => {
    expect(normalizeText('École Polytechnique Fédérale')).toBe(
      'ecole polytechnique federale',
    );
  });

  it('collapses whitespace', () => {
    expect(normalizeText('  a   b ')).toBe('a b');
  });

  it('handles empty input', () => {
    expect(normalizeText('')).toBe('');
    expect(normalizeText('   ')).toBe('');
  });
});

describe('normalizeCompanyName', () => {
  it('removes legal suffixes', () => {
    expect(normalizeCompanyName('Acme Ltd')).toBe('acme');
    expect(normalizeCompanyName('Airbus SAS')).toBe('airbus');
    expect(normalizeCompanyName('Foo Bar GmbH')).toBe('foo bar');
  });

  it('keeps the name when it is only a suffix', () => {
    expect(normalizeCompanyName('Inc')).toBe('inc');
  });

  it('is stable across accents', () => {
    expect(normalizeCompanyName('Crédit Agricole SA')).toBe(
      normalizeCompanyName('Credit Agricole'),
    );
  });
});

describe('normalizeTitle', () => {
  it('removes seniority and gender markers', () => {
    expect(normalizeTitle('Senior Financial Analyst H/F')).toBe('financial analyst');
    expect(normalizeTitle('Junior Contrôleur de Gestion (CDI)')).toBe(
      'controleur de gestion',
    );
  });

  it('returns empty for empty input', () => {
    expect(normalizeTitle('')).toBe('');
  });
});

describe('trigramSimilarity', () => {
  it('is 1 for identical strings', () => {
    expect(trigramSimilarity('financial analyst', 'financial analyst')).toBe(1);
  });

  it('is 0 for disjoint strings', () => {
    expect(trigramSimilarity('abc', 'xyz')).toBe(0);
  });

  it('is symmetric and in [0,1]', () => {
    const a = 'data analyst';
    const b = 'data engineer';
    const ab = trigramSimilarity(a, b);
    expect(ab).toBeGreaterThan(0);
    expect(ab).toBeLessThan(1);
    expect(trigramSimilarity(b, a)).toBe(ab);
  });

  it('handles empty strings', () => {
    expect(trigramSimilarity('', 'anything')).toBe(0);
  });
});
