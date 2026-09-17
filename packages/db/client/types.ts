/**
 * Database type definitions for Career OS.
 * These mirror the Prisma schema but are used with direct SQL queries.
 */

export type ClaimStatus = 'VERIFIED' | 'UNVERIFIED' | 'REJECTED' | 'EXPIRED' | 'CONTESTED';
export type SourceType = 'MANUAL_ENTRY' | 'CV' | 'RESUME' | 'CERTIFICATE' | 'DIPLOMA' | 'PROJECT' | 'JOB_DESCRIPTION' | 'EMAIL' | 'SCREENSHOT' | 'PDF' | 'PORTFOLIO' | 'OTHER';
export type ApplicationStatus = 'A_ANALYSER' | 'A_PREPARER' | 'A_VALIDER' | 'PRETE' | 'ENVOYEE' | 'REPONSE_RECUE' | 'ENTRETIEN' | 'OFFRE' | 'ACCEPTEE' | 'REFUSEE' | 'ARCHIVEE';
export type ApprovalAction = 'SEND_EMAIL' | 'MARK_APPLICATION_SENT' | 'EXPORT_DOCUMENT';
export type JobRequirementCategory = 'EDUCATION' | 'EXPERIENCE' | 'SKILL' | 'TOOL' | 'TECHNOLOGY' | 'LANGUAGE' | 'CERTIFICATION' | 'KEYWORD';
export type LocationTarget = 'MAROC' | 'INTERNATIONAL' | 'REMOTE' | 'EUROPE' | 'AFRIQUE' | 'ASIE' | 'AMERIQUE_NORD';
export type GapSeverity = 'CRITICAL' | 'MAJOR' | 'MINOR';
export type AuditActorType = 'USER' | 'SYSTEM' | 'AI' | 'N8N' | 'WORKER' | 'EXTERNAL_API';

export interface CandidateProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  city?: string;
  country?: string;
  headline?: string;
  summary?: string;
  locationTarget?: LocationTarget;
  cvTemplate?: 'ANALYSTE' | 'AUDITOR' | 'CONTROLLEUR';
  createdAt: Date;
  updatedAt: Date;
}

export interface Experience {
  id: string;
  profileId: string;
  company: string;
  role: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description?: string;
}

export interface Education {
  id: string;
  profileId: string;
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  grade?: string;
}

export interface Skill {
  id: string;
  profileId: string;
  name: string;
  normalizedName: string;
  level?: string;
  category?: string;
}

export interface Certification {
  id: string;
  profileId: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expirationDate?: Date;
  credentialUrl?: string;
}

export interface Project {
  id: string;
  profileId: string;
  name: string;
  description: string;
  technologies: string[];
  startDate?: Date;
  endDate?: Date;
  url?: string;
}

export interface Source {
  id: string;
  type: SourceType;
  name: string;
  uri?: string;
  createdAt: Date;
}

export interface SourceSnapshot {
  id: string;
  sourceId: string;
  contentHash: string;
  rawText?: string;
  storagePath?: string;
  capturedAt: Date;
}

export interface Evidence {
  id: string;
  sourceId: string;
  snapshotId?: string;
  quote: string;
  location?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface Claim {
  id: string;
  profileId: string;
  subject: string;
  predicate: string;
  value: string;
  status: ClaimStatus;
  confidence: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClaimEvidence {
  claimId: string;
  evidenceId: string;
  relationship: string;
}

export interface Company {
  id: string;
  name: string;
  normalizedName: string;
  website?: string;
  industry?: string;
}

export interface JobSource {
  id: string;
  name: string;
  type: string;
  baseUrl?: string;
}

export interface JobOffer {
  id: string;
  companyId: string;
  sourceId: string;
  externalId?: string;
  title: string;
  normalizedTitle: string;
  location?: string;
  remoteType?: string;
  description: string;
  descriptionHash: string;
  publishedAt?: Date;
  discoveredAt: Date;
  canonicalUrl?: string;
}

export interface JobAnalysis {
  id: string;
  jobOfferId: string;
  title: string;
  seniority?: string;
  requiredSkills: string[];
  preferredSkills: string[];
  tools: string[];
  technologies: string[];
  keywords: string[];
  responsibilities: string[];
  educationRequirements: string[];
  experienceRequirements: string[];
  extractedBy: string;
  promptVersion: string;
  createdAt: Date;
}

export interface JobRequirement {
  id: string;
  jobAnalysisId: string;
  category: JobRequirementCategory;
  normalizedName: string;
  originalText: string;
  importance: RequirementImportance;
  mandatory: boolean;
}

export type RequirementImportance = 'MANDATORY' | 'PREFERRED' | 'OPTIONAL';

export interface ScoreRuleVersion {
  id: string;
  name: string;
  educationWeight: number;
  experienceWeight: number;
  skillsWeight: number;
  toolsWeight: number;
  keywordWeight: number;
  version: number;
  active: boolean;
}

export interface JobScore {
  id: string;
  jobOfferId: string;
  total: number;
  educationScore: number;
  experienceScore: number;
  skillsScore: number;
  toolsScore: number;
  keywordScore: number;
  ruleVersionId: string;
  createdAt: Date;
}

export interface ScoreGap {
  id: string;
  jobScoreId: string;
  requirementId: string;
  severity: GapSeverity;
  reason: string;
}

export interface CvVersion {
  id: string;
  profileId: string;
  applicationId?: string;
  templateVersion: string;
  generationModel: string;
  promptVersion: string;
  contentHash: string;
  createdAt: Date;
}

export interface CvClaim {
  cvVersionId: string;
  claimId: string;
  usage: string;
}

export interface CoverLetterVersion {
  id: string;
  applicationId: string;
  templateVersion: string;
  generationModel: string;
  promptVersion: string;
  contentHash: string;
  createdAt: Date;
}

export interface CoverLetterClaim {
  coverLetterVersionId: string;
  claimId: string;
}

export interface Application {
  id: string;
  jobOfferId: string;
  profileId: string;
  status: ApplicationStatus;
  cvVersionId?: string;
  coverLetterVersionId?: string;
  appliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicationEvent {
  id: string;
  applicationId: string;
  fromStatus?: string;
  toStatus: string;
  actorType: string;
  actorId?: string;
  note?: string;
  correlationId: string;
  createdAt: Date;
}

export interface PhoneEvent {
  id: string;
  applicationId: string;
  date: Date;
  contactId?: string;
  direction: string;
  outcome?: string;
  notes?: string;
}

export interface ResponseObservation {
  id: string;
  applicationId: string;
  observedAt: Date;
  daysSinceLastContact: number;
  classification: string;
}

export interface Contact {
  id: string;
  companyId: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  source?: string;
}

export interface Approval {
  id: string;
  entityType: string;
  entityId: string;
  action: ApprovalAction;
  approvedBy: string;
  approvedAt: Date;
  contentHash: string;
  expiresAt?: Date;
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  actorType: AuditActorType;
  actorId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  source?: string;
  before?: unknown;
  after?: unknown;
  metadata?: Record<string, unknown>;
  correlationId?: string;
}