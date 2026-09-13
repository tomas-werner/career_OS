/**
 * Claim validation — deterministic fact-checker (plan.md sections 8 and 15).
 *
 * AI proposes. Deterministic code validates and decides.
 *
 * Rules (plan.md section 15):
 *   claim exists + evidence exists  -> VERIFIED
 *   claim exists + weak evidence     -> UNVERIFIED
 *   claim contradicted               -> REJECTED
 *   claim absent                     -> UNVERIFIED
 *
 * Never infer JavaScript -> React or React -> Next.js without evidence.
 */
import type { ClaimStatus } from './types';

export interface ClaimLike {
  id: string;
  subject: string;
  predicate: string;
  value: string;
}

export interface EvidenceLike {
  id: string;
  sourceId: string;
  quote: string;
}

export interface ContradictionLike {
  claimId: string;
  evidenceId: string;
}

export interface ClaimValidationResult {
  claimId: string;
  status: ClaimStatus;
  confidence: number;
  evidenceIds: string[];
  reason: string;
}

/** Sources that count as strong (independent, hard) evidence. */
const STRONG_EVIDENCE_SOURCE_TYPES: ReadonlySet<string> = new Set([
  'CERTIFICATE',
  'DIPLOMA',
  'CV',
  'RESUME',
  'PROJECT',
]);

/** Source types that are treated as weak (self-declared) evidence. */
const WEAK_EVIDENCE_SOURCE_TYPES: ReadonlySet<string> = new Set([
  'MANUAL_ENTRY',
  'OTHER',
]);

export interface EvidenceWithSource extends EvidenceLike {
  sourceType?: string;
}

/**
 * Compute the confidence for a claim given its linked evidence.
 * Deterministic: same inputs -> same confidence.
 */
export function computeConfidence(evidence: EvidenceWithSource[]): number {
  if (evidence.length === 0) return 0;
  let score = 0;
  for (const item of evidence) {
    const sourceType = item.sourceType ?? 'OTHER';
    if (STRONG_EVIDENCE_SOURCE_TYPES.has(sourceType)) score += 0.5;
    else if (WEAK_EVIDENCE_SOURCE_TYPES.has(sourceType)) score += 0.25;
    else score += 0.35;
  }
  return Math.min(1, Number(score.toFixed(2)));
}

/**
 * Deterministic claim validation (plan.md section 15 — validateClaim).
 *
 * - No evidence                       -> UNVERIFIED (confidence 0)
 * - Any CONTRADICTS relationship      -> REJECTED
 * - Strong evidence present           -> VERIFIED (confidence >= 0.5)
 * - Only weak evidence                -> UNVERIFIED
 */
export function validateClaim(
  claim: ClaimLike,
  evidence: EvidenceWithSource[],
  contradictions: ContradictionLike[] = [],
): ClaimValidationResult {
  const evidenceIds = evidence.map((item) => item.id);

  if (evidence.length === 0) {
    return {
      claimId: claim.id,
      status: 'UNVERIFIED',
      confidence: 0,
      evidenceIds: [],
      reason: 'No evidence linked to this claim',
    };
  }

  const contradicted = contradictions.some(
    (item) => item.claimId === claim.id && evidenceIds.includes(item.evidenceId),
  );
  if (contradicted) {
    return {
      claimId: claim.id,
      status: 'REJECTED',
      confidence: 0,
      evidenceIds,
      reason: 'Claim contradicted by linked evidence (plan.md section 15)',
    };
  }

  const confidence = computeConfidence(evidence);
  const hasStrong = evidence.some((item) => {
    const sourceType = item.sourceType ?? 'OTHER';
    return STRONG_EVIDENCE_SOURCE_TYPES.has(sourceType);
  });

  if (hasStrong && confidence >= 0.5) {
    return {
      claimId: claim.id,
      status: 'VERIFIED',
      confidence,
      evidenceIds,
      reason: `Supported by ${evidence.length} evidence item(s) including strong source(s)`,
    };
  }

  return {
    claimId: claim.id,
    status: 'UNVERIFIED',
    confidence,
    evidenceIds,
    reason: `Only weak evidence linked (${evidence.length} item(s), max confidence ${confidence})`,
  };
}

/**
 * Check that a candidate value is actually supported by the evidence quotes.
 * Deterministic substring/trigram check — no AI inference.
 * Used to prevent "AI invents a skill" style failures (plan.md section 16).
 */
export function isValueSupportedByQuotes(
  value: string,
  quotes: string[],
  similarityThreshold = 0.4,
): boolean {
  if (value.trim().length === 0) return false;
  const normalizedValue = value.trim().toLowerCase();
  for (const quote of quotes) {
    const normalizedQuote = quote.toLowerCase();
    if (normalizedQuote.includes(normalizedValue)) return true;
    if (
      normalizedValue.length >= 3 &&
      quote.includes(value.trim()) &&
      trigramSimilarityLocal(normalizedValue, normalizedQuote) >= similarityThreshold
    ) {
      return true;
    }
  }
  return false;
}

function trigramSimilarityLocal(a: string, b: string): number {
  const grams = (input: string): Set<string> => {
    const set = new Set<string>();
    const padded = `  ${input}  `;
    for (let i = 0; i < padded.length - 2; i += 1) {
      set.add(padded.slice(i, i + 3));
    }
    return set;
  };
  const ga = grams(a);
  const gb = grams(b);
  if (ga.size === 0 || gb.size === 0) return 0;
  let intersection = 0;
  for (const gram of ga) {
    if (gb.has(gram)) intersection += 1;
  }
  return intersection / (ga.size + gb.size - intersection);
}
