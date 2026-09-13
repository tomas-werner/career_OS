/**
 * Job deduplication at three levels (plan.md section 37).
 *
 * Level 1: normalizedCompany + normalizedTitle + normalizedLocation
 * Level 2: descriptionHash
 * Level 3: descriptionSimilarity (trigram)
 *
 * Classification: DUPLICATE / PROBABLE_DUPLICATE / UNIQUE / REVIEW.
 * Never silently delete records — duplicates are flagged, not removed.
 */
import { normalizeCompanyName, normalizeText, normalizeTitle, trigramSimilarity } from './normalize';

export type DeduplicationClassification = 'DUPLICATE' | 'PROBABLE_DUPLICATE' | 'UNIQUE' | 'REVIEW';

export interface JobLike {
  company: string;
  title: string;
  location?: string;
  description: string;
  descriptionHash?: string;
}

export interface ExistingJobLike extends JobLike {
  id: string;
}

export interface DeduplicationResult {
  classification: DeduplicationClassification;
  matchedJobId?: string;
  level: 0 | 1 | 2 | 3;
  similarity?: number;
}

/** Similarity above which two different-hash descriptions are duplicates. */
export const DUPLICATE_SIMILARITY_THRESHOLD = 0.85;
/** Similarity range needing human review. */
export const REVIEW_SIMILARITY_THRESHOLD = 0.7;

function level1Key(job: JobLike): string {
  return [
    normalizeCompanyName(job.company),
    normalizeTitle(job.title),
    normalizeText(job.location ?? ''),
  ].join('|');
}

/**
 * Classify a new job against existing jobs (plan.md section 37).
 * Deterministic: same inputs -> same classification.
 */
export function deduplicateJob(newJob: JobLike, existing: ExistingJobLike[]): DeduplicationResult {
  if (existing.length === 0) {
    return { classification: 'UNIQUE', level: 0 };
  }

  const newKey = level1Key(newJob);

  // Level 1 — same normalized company + title + location
  const level1Match = existing.find((job) => level1Key(job) === newKey);
  if (level1Match) {
    // Same identity: check description to separate re-post from true duplicate.
    const newHash = newJob.descriptionHash ?? '';
    const oldHash = level1Match.descriptionHash ?? '';
    if (newHash && oldHash && newHash === oldHash) {
      return { classification: 'DUPLICATE', matchedJobId: level1Match.id, level: 2 };
    }
    const similarity = trigramSimilarity(newJob.description, level1Match.description);
    if (similarity >= DUPLICATE_SIMILARITY_THRESHOLD) {
      return {
        classification: 'DUPLICATE',
        matchedJobId: level1Match.id,
        level: 3,
        similarity,
      };
    }
    if (similarity >= REVIEW_SIMILARITY_THRESHOLD) {
      return {
        classification: 'PROBABLE_DUPLICATE',
        matchedJobId: level1Match.id,
        level: 3,
        similarity,
      };
    }
    // Same company+title but clearly different description -> needs review.
    return { classification: 'REVIEW', matchedJobId: level1Match.id, level: 1 };
  }

  // Level 2 — identical description hash anywhere
  const newHash = newJob.descriptionHash;
  if (newHash) {
    const hashMatch = existing.find((job) => job.descriptionHash === newHash);
    if (hashMatch) {
      return { classification: 'DUPLICATE', matchedJobId: hashMatch.id, level: 2 };
    }
  }

  // Level 3 — trigram similarity against every existing description
  let best: { job: ExistingJobLike; similarity: number } | null = null;
  for (const job of existing) {
    const similarity = trigramSimilarity(newJob.description, job.description);
    if (!best || similarity > best.similarity) best = { job, similarity };
  }
  if (best && best.similarity >= DUPLICATE_SIMILARITY_THRESHOLD) {
    return {
      classification: 'DUPLICATE',
      matchedJobId: best.job.id,
      level: 3,
      similarity: best.similarity,
    };
  }
  if (best && best.similarity >= REVIEW_SIMILARITY_THRESHOLD) {
    return {
      classification: 'REVIEW',
      matchedJobId: best.job.id,
      level: 3,
      similarity: best.similarity,
    };
  }

  return { classification: 'UNIQUE', level: 0 };
}
