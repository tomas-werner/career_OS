/**
 * Shared low-level primitives used across Career OS packages.
 *
 * Determinism rule: every function in this package must be pure and
 * side-effect free so that hashes, normalized keys and scores remain
 * reproducible (plan.md sections 12, 29, 32).
 */

export * from './hash';
export * from './normalize';
export * from './ids';
export * from './types';
export * from './claims';
export * from './scoring';
export * from './dedup';
export * from './documents';
export * from './cv-templates';
