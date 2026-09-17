/**
 * Shared enum mirrors of database enums (plan.md sections 6-31).
 *
 * These re-declare the database enums so non-DB code (AI validation, scoring,
 * state machine) can be typed without importing the database client.
 * They MUST stay in sync with the database schema.
 */

export const CLAIM_STATUSES = [
  'VERIFIED',
  'UNVERIFIED',
  'REJECTED',
  'EXPIRED',
  'CONTESTED',
] as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

export const SOURCE_TYPES = [
  'MANUAL_ENTRY',
  'CV',
  'RESUME',
  'CERTIFICATE',
  'DIPLOMA',
  'PROJECT',
  'JOB_DESCRIPTION',
  'EMAIL',
  'SCREENSHOT',
  'PDF',
  'PORTFOLIO',
  'OTHER',
] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export const AUDIT_ACTOR_TYPES = [
  'USER',
  'SYSTEM',
  'AI',
  'N8N',
  'WORKER',
  'EXTERNAL_API',
] as const;
export type AuditActorType = (typeof AUDIT_ACTOR_TYPES)[number];

export const APPLICATION_STATUSES = [
  'A_ANALYSER',
  'A_PREPARER',
  'A_VALIDER',
  'PRETE',
  'ENVOYEE',
  'REPONSE_RECUE',
  'ENTRETIEN',
  'OFFRE',
  'ACCEPTEE',
  'REFUSEE',
  'ARCHIVEE',
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const APPLICATION_TRANSITIONS: Record<ApplicationStatus, readonly ApplicationStatus[]> = {
  A_ANALYSER: ['A_PREPARER', 'ARCHIVEE'],
  A_PREPARER: ['A_VALIDER', 'A_ANALYSER', 'ARCHIVEE'],
  A_VALIDER: ['PRETE', 'A_PREPARER', 'ARCHIVEE'],
  PRETE: ['ENVOYEE', 'A_VALIDER', 'ARCHIVEE'],
  ENVOYEE: ['REPONSE_RECUE', 'ARCHIVEE'],
  REPONSE_RECUE: ['ENTRETIEN', 'REFUSEE', 'ARCHIVEE'],
  ENTRETIEN: ['OFFRE', 'REFUSEE', 'ARCHIVEE'],
  OFFRE: ['ACCEPTEE', 'REFUSEE', 'ARCHIVEE'],
  ACCEPTEE: ['ARCHIVEE'],
  REFUSEE: ['ARCHIVEE'],
  ARCHIVEE: [],
};

export function canTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
  return APPLICATION_TRANSITIONS[from]?.includes(to) ?? false;
}

export const APPROVAL_ACTIONS = [
  'SEND_EMAIL',
  'MARK_APPLICATION_SENT',
  'EXPORT_DOCUMENT',
] as const;
export type ApprovalAction = (typeof APPROVAL_ACTIONS)[number];

export const JOB_REQUIREMENT_CATEGORIES = [
  'EDUCATION',
  'EXPERIENCE',
  'SKILL',
  'TOOL',
  'TECHNOLOGY',
  'LANGUAGE',
  'CERTIFICATION',
  'KEYWORD',
] as const;
export type JobRequirementCategory = (typeof JOB_REQUIREMENT_CATEGORIES)[number];

export const LOCATION_TARGETS = [
  'MAROC',
  'INTERNATIONAL',
  'REMOTE',
  'EUROPE',
  'AFRIQUE',
  'ASIE',
  'AMERIQUE_NORD',
] as const;
export type LocationTarget = (typeof LOCATION_TARGETS)[number];
