/**
 * Shared low-level primitives used across Career OS packages.
 *
 * Determinism rule: every function in this package must be pure and
 * side-effect free so that hashes, normalized keys and scores remain
 * reproducible (plan.md sections 12, 29, 32).
 */

export * from './hash.js';
export * from './normalize.js';
export * from './ids.js';
export * from './types.js';
