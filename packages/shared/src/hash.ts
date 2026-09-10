import { createHash } from 'node:crypto';

/**
 * Deterministic SHA-256 content hash, hex-encoded.
 *
 * Used for SourceSnapshot.contentHash, JobOffer.descriptionHash,
 * CvVersion.contentHash, Approval.contentHash and AuditLog comparisons.
 * Always called on server/worker code only (node:crypto).
 */
export function hashContent(content: string | Uint8Array): string {
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Stable hash for arbitrary JSON-serializable values.
 * Keys are sorted recursively so object key order never changes the result.
 */
export function hashJson(value: unknown): string {
  return hashContent(JSON.stringify(stabilize(value)));
}

function stabilize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stabilize);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return Object.keys(record)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = stabilize(record[key]);
        return acc;
      }, {});
  }
  return value;
}
