import { describe, expect, it } from 'vitest';
import { hashContent, hashJson } from '../src/hash.js';

describe('hashContent', () => {
  it('produces stable sha-256 hex', () => {
    expect(hashContent('career-os')).toBe(hashContent('career-os'));
    expect(hashContent('career-os')).toMatch(/^[0-9a-f]{64}$/);
  });

  it('differs per input', () => {
    expect(hashContent('a')).not.toBe(hashContent('b'));
  });

  it('accepts bytes', () => {
    const bytes = new TextEncoder().encode('career-os');
    expect(hashContent(bytes)).toBe(hashContent('career-os'));
  });
});

describe('hashJson', () => {
  it('is key-order independent', () => {
    expect(hashJson({ a: 1, b: 2 })).toBe(hashJson({ b: 2, a: 1 }));
  });

  it('is deep key-order independent', () => {
    expect(hashJson({ x: { a: 1, b: [2, 3] } })).toBe(
      hashJson({ x: { b: [2, 3], a: 1 } }),
    );
  });

  it('distinguishes different values', () => {
    expect(hashJson({ a: 1 })).not.toBe(hashJson({ a: 2 }));
  });
});
