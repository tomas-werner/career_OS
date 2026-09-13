/**
 * Controlled document generation domain (plan.md sections 16-17).
 *
 * Allowed transformations: reordering, wording, formatting, summarization,
 * emphasis — selection of VERIFIED claims only.
 * Forbidden: inventing employment, education, skills, metrics, dates,
 * certifications, responsibilities.
 *
 * Every generated statement resolves to Claim -> Evidence -> Source (§8).
 */
import type { ClaimStatus } from './types';
import { hashContent } from './hash';

export interface ClaimForDocument {
  id: string;
  subject: string;
  predicate: string;
  value: string;
  status: ClaimStatus;
}

export interface DocumentClaim {
  claimId: string;
  usage: string;
  statement: string;
}

export interface ProfileIdentity {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
  headline?: string | null;
}

export interface GeneratedDocument {
  identity: ProfileIdentity;
  headline: string | null;
  summaryStatements: DocumentClaim[];
  skillStatements: DocumentClaim[];
  experienceStatements: DocumentClaim[];
  educationStatements: DocumentClaim[];
  content: string;
  contentHash: string;
  claimsUsed: DocumentClaim[];
}

export const TEMPLATE_VERSION = 'cv-template-v1';
export const SUMMARY_PROMPT_VERSION = 'selection-v1';

/** Usable claims for documents: VERIFIED only (§16). */
export function usableClaims(claims: ClaimForDocument[]): ClaimForDocument[] {
  return claims.filter((claim) => claim.status === 'VERIFIED');
}

/**
 * Build a controlled CV model from verified claims. Deterministic:
 * same profile + same claims -> same document. Statements are formulated
 * from claim fields only — nothing is invented.
 */
export function buildCvModel(
  identity: ProfileIdentity,
  claims: ClaimForDocument[],
): GeneratedDocument {
  const verified = usableClaims(claims);

  const skillStatements: DocumentClaim[] = [];
  const experienceStatements: DocumentClaim[] = [];
  const educationStatements: DocumentClaim[] = [];
  const summaryStatements: DocumentClaim[] = [];

  for (const claim of verified) {
    const statement = `${claim.subject} ${claim.predicate} ${claim.value}`;
    const entry: DocumentClaim = { claimId: claim.id, usage: 'STATEMENT', statement };
    if (claim.predicate === 'knows') skillStatements.push(entry);
    else if (claim.predicate === 'worked-at' || claim.predicate === 'worked-at-company')
      experienceStatements.push(entry);
    else if (claim.predicate === 'holds-degree-in' || claim.predicate === 'studied')
      educationStatements.push(entry);
    else summaryStatements.push(entry);
  }

  const content = renderCvContent({
    identity,
    headline: identity.headline ?? null,
    summaryStatements,
    skillStatements,
    experienceStatements,
    educationStatements,
  });

  return {
    identity,
    headline: identity.headline ?? null,
    summaryStatements,
    skillStatements,
    experienceStatements,
    educationStatements,
    content,
    contentHash: hashContent(content),
    claimsUsed: [...summaryStatements, ...skillStatements, ...experienceStatements, ...educationStatements],
  };
}

interface RenderInput extends Omit<GeneratedDocument, 'content' | 'contentHash' | 'claimsUsed'> {}

function renderCvContent(input: RenderInput): string {
  const lines: string[] = [];
  const name = `${input.identity.firstName} ${input.identity.lastName}`.trim();
  lines.push(name.toUpperCase());
  const contactParts = [
    input.identity.email,
    input.identity.phone ?? null,
    input.identity.city ?? null,
    input.identity.country ?? null,
  ].filter((part): part is string => Boolean(part));
  if (contactParts.length) lines.push(contactParts.join(' · '));
  if (input.headline) lines.push('', input.headline);

  if (input.skillStatements.length) {
    lines.push('', 'SKILLS');
    lines.push(input.skillStatements.map((statement) => statement.statement).join(', '));
  }
  if (input.experienceStatements.length) {
    lines.push('', 'EXPERIENCE');
    for (const statement of input.experienceStatements) lines.push(`- ${statement.statement}`);
  }
  if (input.educationStatements.length) {
    lines.push('', 'EDUCATION');
    for (const statement of input.educationStatements) lines.push(`- ${statement.statement}`);
  }
  if (input.summaryStatements.length) {
    lines.push('', 'SUMMARY');
    for (const statement of input.summaryStatements) lines.push(`- ${statement.statement}`);
  }
  return lines.join('\n');
}

/**
 * Post-generation fact check (§15 applied to documents, §16 rule):
 * every statement in the rendered content must be backed by a verified claim.
 * Returns the set of statements that fail the check.
 */
export function factCheckDocument(
  document: GeneratedDocument,
  claims: ClaimForDocument[],
): { passed: boolean; violations: string[] } {
  const verifiedIds = new Set(usableClaims(claims).map((claim) => claim.id));
  const violations: string[] = [];
  for (const used of document.claimsUsed) {
    if (!verifiedIds.has(used.claimId)) {
      violations.push(used.statement);
    }
  }
  return { passed: violations.length === 0, violations };
}
