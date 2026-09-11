-- Career OS Database Schema for Neon PostgreSQL
-- DEPRECATED: use `pnpm setup-db` instead (applies prisma/migrations/.../migration.sql).
-- Unquoted camelCase columns in this file fold to lowercase in PostgreSQL and break
-- application SQL that expects quoted camelCase identifiers.

-- Enable UUID extension for CUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Create all tables first (without foreign keys)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "CandidateProfile" (
  id TEXT PRIMARY KEY,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  city TEXT,
  country TEXT,
  headline TEXT,
  summary TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Experience" (
  id TEXT PRIMARY KEY,
  profileId TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  location TEXT,
  startDate TIMESTAMP NOT NULL,
  endDate TIMESTAMP,
  current BOOLEAN DEFAULT FALSE,
  description TEXT
);

CREATE TABLE IF NOT EXISTS "ExperienceTask" (
  id TEXT PRIMARY KEY,
  experienceId TEXT NOT NULL,
  description TEXT NOT NULL,
  importance TEXT
);

CREATE TABLE IF NOT EXISTS "Achievement" (
  id TEXT PRIMARY KEY,
  experienceId TEXT,
  projectId TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  measurableValue TEXT
);

CREATE TABLE IF NOT EXISTS "Education" (
  id TEXT PRIMARY KEY,
  profileId TEXT NOT NULL,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field TEXT NOT NULL,
  startDate TIMESTAMP NOT NULL,
  endDate TIMESTAMP,
  grade TEXT
);

CREATE TABLE IF NOT EXISTS "Skill" (
  id TEXT PRIMARY KEY,
  profileId TEXT NOT NULL,
  name TEXT NOT NULL,
  normalizedName TEXT NOT NULL,
  level TEXT,
  category TEXT
);

CREATE TABLE IF NOT EXISTS "Certification" (
  id TEXT PRIMARY KEY,
  profileId TEXT NOT NULL,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issueDate TIMESTAMP NOT NULL,
  expirationDate TIMESTAMP,
  credentialUrl TEXT
);

CREATE TABLE IF NOT EXISTS "Project" (
  id TEXT PRIMARY KEY,
  profileId TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  technologies TEXT[],
  startDate TIMESTAMP,
  endDate TIMESTAMP,
  url TEXT
);

CREATE TABLE IF NOT EXISTS "Source" (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  uri TEXT,
  createdAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "SourceSnapshot" (
  id TEXT PRIMARY KEY,
  sourceId TEXT NOT NULL,
  contentHash TEXT NOT NULL,
  rawText TEXT,
  storagePath TEXT,
  capturedAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Evidence" (
  id TEXT PRIMARY KEY,
  sourceId TEXT NOT NULL,
  snapshotId TEXT,
  quote TEXT NOT NULL,
  location TEXT,
  metadata JSONB,
  createdAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Claim" (
  id TEXT PRIMARY KEY,
  profileId TEXT NOT NULL,
  subject TEXT NOT NULL,
  predicate TEXT NOT NULL,
  value TEXT NOT NULL,
  status TEXT DEFAULT 'UNVERIFIED',
  confidence FLOAT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "ClaimEvidence" (
  claimId TEXT NOT NULL,
  evidenceId TEXT NOT NULL,
  relationship TEXT NOT NULL,
  PRIMARY KEY (claimId, evidenceId)
);

CREATE TABLE IF NOT EXISTS "Company" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  normalizedName TEXT UNIQUE NOT NULL,
  website TEXT,
  industry TEXT
);

CREATE TABLE IF NOT EXISTS "JobSource" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  baseUrl TEXT
);

CREATE TABLE IF NOT EXISTS "JobOffer" (
  id TEXT PRIMARY KEY,
  companyId TEXT NOT NULL,
  sourceId TEXT NOT NULL,
  externalId TEXT,
  title TEXT NOT NULL,
  normalizedTitle TEXT NOT NULL,
  location TEXT,
  remoteType TEXT,
  description TEXT NOT NULL,
  descriptionHash TEXT NOT NULL,
  publishedAt TIMESTAMP,
  discoveredAt TIMESTAMP DEFAULT NOW(),
  canonicalUrl TEXT
);

CREATE TABLE IF NOT EXISTS "JobAnalysis" (
  id TEXT PRIMARY KEY,
  jobOfferId TEXT NOT NULL,
  title TEXT NOT NULL,
  seniority TEXT,
  requiredSkills TEXT[],
  preferredSkills TEXT[],
  tools TEXT[],
  technologies TEXT[],
  keywords TEXT[],
  responsibilities TEXT[],
  educationRequirements TEXT[],
  experienceRequirements TEXT[],
  extractedBy TEXT NOT NULL,
  promptVersion TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "JobRequirement" (
  id TEXT PRIMARY KEY,
  jobAnalysisId TEXT NOT NULL,
  category TEXT NOT NULL,
  normalizedName TEXT NOT NULL,
  originalText TEXT NOT NULL,
  importance TEXT NOT NULL,
  mandatory BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS "ScoreRuleVersion" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  educationWeight FLOAT NOT NULL,
  experienceWeight FLOAT NOT NULL,
  skillsWeight FLOAT NOT NULL,
  toolsWeight FLOAT NOT NULL,
  keywordWeight FLOAT NOT NULL,
  version INT UNIQUE NOT NULL,
  active BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "JobScore" (
  id TEXT PRIMARY KEY,
  jobOfferId TEXT NOT NULL,
  total FLOAT NOT NULL,
  educationScore FLOAT NOT NULL,
  experienceScore FLOAT NOT NULL,
  skillsScore FLOAT NOT NULL,
  toolsScore FLOAT NOT NULL,
  keywordScore FLOAT NOT NULL,
  ruleVersionId TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "ScoreGap" (
  id TEXT PRIMARY KEY,
  jobScoreId TEXT NOT NULL,
  requirementId TEXT NOT NULL,
  severity TEXT NOT NULL,
  reason TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "CvVersion" (
  id TEXT PRIMARY KEY,
  profileId TEXT NOT NULL,
  applicationId TEXT UNIQUE,
  templateVersion TEXT NOT NULL,
  generationModel TEXT NOT NULL,
  promptVersion TEXT NOT NULL,
  contentHash TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "CvClaim" (
  cvVersionId TEXT NOT NULL,
  claimId TEXT NOT NULL,
  usage TEXT NOT NULL,
  PRIMARY KEY (cvVersionId, claimId)
);

CREATE TABLE IF NOT EXISTS "CoverLetterVersion" (
  id TEXT PRIMARY KEY,
  applicationId TEXT UNIQUE NOT NULL,
  templateVersion TEXT NOT NULL,
  generationModel TEXT NOT NULL,
  promptVersion TEXT NOT NULL,
  contentHash TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "CoverLetterClaim" (
  coverLetterVersionId TEXT NOT NULL,
  claimId TEXT NOT NULL,
  PRIMARY KEY (coverLetterVersionId, claimId)
);

CREATE TABLE IF NOT EXISTS "Application" (
  id TEXT PRIMARY KEY,
  jobOfferId TEXT NOT NULL,
  profileId TEXT NOT NULL,
  status TEXT DEFAULT 'A_ANALYSER',
  cvVersionId TEXT,
  coverLetterVersionId TEXT,
  appliedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "ApplicationEvent" (
  id TEXT PRIMARY KEY,
  applicationId TEXT NOT NULL,
  fromStatus TEXT,
  toStatus TEXT NOT NULL,
  actorType TEXT NOT NULL,
  actorId TEXT,
  note TEXT,
  correlationId TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "PhoneEvent" (
  id TEXT PRIMARY KEY,
  applicationId TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
  contactId TEXT,
  direction TEXT NOT NULL,
  outcome TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS "ResponseObservation" (
  id TEXT PRIMARY KEY,
  applicationId TEXT NOT NULL,
  observedAt TIMESTAMP NOT NULL,
  daysSinceLastContact INT NOT NULL,
  classification TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "Contact" (
  id TEXT PRIMARY KEY,
  companyId TEXT NOT NULL,
  firstName TEXT,
  lastName TEXT,
  role TEXT,
  email TEXT,
  phone TEXT,
  linkedinUrl TEXT,
  source TEXT
);

CREATE TABLE IF NOT EXISTS "Approval" (
  id TEXT PRIMARY KEY,
  entityType TEXT NOT NULL,
  entityId TEXT NOT NULL,
  action TEXT NOT NULL,
  approvedBy TEXT NOT NULL,
  approvedAt TIMESTAMP DEFAULT NOW(),
  contentHash TEXT NOT NULL,
  expiresAt TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "AuditLog" (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT NOW(),
  actorType TEXT NOT NULL,
  actorId TEXT,
  action TEXT NOT NULL,
  entityType TEXT NOT NULL,
  entityId TEXT,
  source TEXT,
  before JSONB,
  after JSONB,
  metadata JSONB,
  correlationId TEXT
);

-- ---------------------------------------------------------------------------
-- Add indexes
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS "Experience_profileId_idx" ON "Experience"(profileId);
CREATE INDEX IF NOT EXISTS "ExperienceTask_experienceId_idx" ON "ExperienceTask"(experienceId);
CREATE INDEX IF NOT EXISTS "Achievement_experienceId_idx" ON "Achievement"(experienceId);
CREATE INDEX IF NOT EXISTS "Achievement_projectId_idx" ON "Achievement"(projectId);
CREATE INDEX IF NOT EXISTS "Education_profileId_idx" ON "Education"(profileId);
CREATE INDEX IF NOT EXISTS "Skill_profileId_idx" ON "Skill"(profileId);
CREATE INDEX IF NOT EXISTS "Certification_profileId_idx" ON "Certification"(profileId);
CREATE INDEX IF NOT EXISTS "Project_profileId_idx" ON "Project"(profileId);
CREATE INDEX IF NOT EXISTS "SourceSnapshot_sourceId_idx" ON "SourceSnapshot"(sourceId);
CREATE INDEX IF NOT EXISTS "Evidence_sourceId_idx" ON "Evidence"(sourceId);
CREATE INDEX IF NOT EXISTS "Evidence_snapshotId_idx" ON "Evidence"(snapshotId);
CREATE INDEX IF NOT EXISTS "Claim_profileId_idx" ON "Claim"(profileId);
CREATE INDEX IF NOT EXISTS "Claim_profileId_status_idx" ON "Claim"(profileId, status);
CREATE INDEX IF NOT EXISTS "JobOffer_normalizedTitle_idx" ON "JobOffer"(normalizedTitle);
CREATE INDEX IF NOT EXISTS "JobOffer_descriptionHash_idx" ON "JobOffer"(descriptionHash);
CREATE INDEX IF NOT EXISTS "JobOffer_companyId_idx" ON "JobOffer"(companyId);
CREATE INDEX IF NOT EXISTS "JobAnalysis_jobOfferId_idx" ON "JobAnalysis"(jobOfferId);
CREATE INDEX IF NOT EXISTS "JobRequirement_jobAnalysisId_idx" ON "JobRequirement"(jobAnalysisId);
CREATE INDEX IF NOT EXISTS "JobScore_jobOfferId_idx" ON "JobScore"(jobOfferId);
CREATE INDEX IF NOT EXISTS "ScoreGap_jobScoreId_idx" ON "ScoreGap"(jobScoreId);
CREATE INDEX IF NOT EXISTS "CvVersion_profileId_idx" ON "CvVersion"(profileId);
CREATE INDEX IF NOT EXISTS "CvVersion_applicationId_idx" ON "CvVersion"(applicationId);
CREATE INDEX IF NOT EXISTS "Application_status_idx" ON "Application"(status);
CREATE INDEX IF NOT EXISTS "Application_jobOfferId_idx" ON "Application"(jobOfferId);
CREATE INDEX IF NOT EXISTS "Application_profileId_idx" ON "Application"(profileId);
CREATE INDEX IF NOT EXISTS "ApplicationEvent_applicationId_idx" ON "ApplicationEvent"(applicationId);
CREATE INDEX IF NOT EXISTS "ApplicationEvent_correlationId_idx" ON "ApplicationEvent"(correlationId);
CREATE INDEX IF NOT EXISTS "PhoneEvent_applicationId_idx" ON "PhoneEvent"(applicationId);
CREATE INDEX IF NOT EXISTS "ResponseObservation_applicationId_idx" ON "ResponseObservation"(applicationId);
CREATE INDEX IF NOT EXISTS "Contact_companyId_idx" ON "Contact"(companyId);
CREATE INDEX IF NOT EXISTS "Approval_entityType_entityId_idx" ON "Approval"(entityType, entityId);
CREATE INDEX IF NOT EXISTS "AuditLog_timestamp_idx" ON "AuditLog"(timestamp);
CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"(action);
CREATE INDEX IF NOT EXISTS "AuditLog_entityType_entityId_idx" ON "AuditLog"(entityType, entityId);
CREATE INDEX IF NOT EXISTS "AuditLog_correlationId_idx" ON "AuditLog"(correlationId);

-- ---------------------------------------------------------------------------
-- Add unique constraints
-- ---------------------------------------------------------------------------

ALTER TABLE "Skill" ADD CONSTRAINT "Skill_profileId_normalizedName_key" UNIQUE (profileId, normalizedName);
ALTER TABLE "JobOffer" ADD CONSTRAINT "JobOffer_sourceId_externalId_key" UNIQUE (sourceId, externalId);
ALTER TABLE "JobRequirement" ADD CONSTRAINT "JobRequirement_jobAnalysisId_category_normalizedName_key" UNIQUE (jobAnalysisId, category, normalizedName);
ALTER TABLE "JobScore" ADD CONSTRAINT "JobScore_jobOfferId_ruleVersionId_key" UNIQUE (jobOfferId, ruleVersionId);
ALTER TABLE "ScoreGap" ADD CONSTRAINT "ScoreGap_jobScoreId_requirementId_key" UNIQUE (jobScoreId, requirementId);
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_entityType_entityId_action_key" UNIQUE (entityType, entityId, action);
ALTER TABLE "SourceSnapshot" ADD CONSTRAINT "SourceSnapshot_sourceId_contentHash_key" UNIQUE (sourceId, contentHash);

-- ---------------------------------------------------------------------------
-- Add foreign key constraints
-- ---------------------------------------------------------------------------

ALTER TABLE "Experience" ADD CONSTRAINT "Experience_profileId_fkey" 
  FOREIGN KEY (profileId) REFERENCES "CandidateProfile"(id) ON DELETE CASCADE;

ALTER TABLE "ExperienceTask" ADD CONSTRAINT "ExperienceTask_experienceId_fkey" 
  FOREIGN KEY (experienceId) REFERENCES "Experience"(id) ON DELETE CASCADE;

ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_experienceId_fkey" 
  FOREIGN KEY (experienceId) REFERENCES "Experience"(id) ON DELETE CASCADE;

ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_projectId_fkey" 
  FOREIGN KEY (projectId) REFERENCES "Project"(id) ON DELETE CASCADE;

ALTER TABLE "Education" ADD CONSTRAINT "Education_profileId_fkey" 
  FOREIGN KEY (profileId) REFERENCES "CandidateProfile"(id) ON DELETE CASCADE;

ALTER TABLE "Skill" ADD CONSTRAINT "Skill_profileId_fkey" 
  FOREIGN KEY (profileId) REFERENCES "CandidateProfile"(id) ON DELETE CASCADE;

ALTER TABLE "Certification" ADD CONSTRAINT "Certification_profileId_fkey" 
  FOREIGN KEY (profileId) REFERENCES "CandidateProfile"(id) ON DELETE CASCADE;

ALTER TABLE "Project" ADD CONSTRAINT "Project_profileId_fkey" 
  FOREIGN KEY (profileId) REFERENCES "CandidateProfile"(id) ON DELETE CASCADE;

ALTER TABLE "SourceSnapshot" ADD CONSTRAINT "SourceSnapshot_sourceId_fkey" 
  FOREIGN KEY (sourceId) REFERENCES "Source"(id) ON DELETE CASCADE;

ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_sourceId_fkey" 
  FOREIGN KEY (sourceId) REFERENCES "Source"(id) ON DELETE CASCADE;

ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_snapshotId_fkey" 
  FOREIGN KEY (snapshotId) REFERENCES "SourceSnapshot"(id);

ALTER TABLE "Claim" ADD CONSTRAINT "Claim_profileId_fkey" 
  FOREIGN KEY (profileId) REFERENCES "CandidateProfile"(id) ON DELETE CASCADE;

ALTER TABLE "ClaimEvidence" ADD CONSTRAINT "ClaimEvidence_claimId_fkey" 
  FOREIGN KEY (claimId) REFERENCES "Claim"(id) ON DELETE CASCADE;

ALTER TABLE "ClaimEvidence" ADD CONSTRAINT "ClaimEvidence_evidenceId_fkey" 
  FOREIGN KEY (evidenceId) REFERENCES "Evidence"(id) ON DELETE CASCADE;

ALTER TABLE "JobOffer" ADD CONSTRAINT "JobOffer_companyId_fkey" 
  FOREIGN KEY (companyId) REFERENCES "Company"(id);

ALTER TABLE "JobAnalysis" ADD CONSTRAINT "JobAnalysis_jobOfferId_fkey" 
  FOREIGN KEY (jobOfferId) REFERENCES "JobOffer"(id) ON DELETE CASCADE;

ALTER TABLE "JobRequirement" ADD CONSTRAINT "JobRequirement_jobAnalysisId_fkey" 
  FOREIGN KEY (jobAnalysisId) REFERENCES "JobAnalysis"(id) ON DELETE CASCADE;

ALTER TABLE "JobScore" ADD CONSTRAINT "JobScore_jobOfferId_fkey" 
  FOREIGN KEY (jobOfferId) REFERENCES "JobOffer"(id) ON DELETE CASCADE;

ALTER TABLE "JobScore" ADD CONSTRAINT "JobScore_ruleVersionId_fkey" 
  FOREIGN KEY (ruleVersionId) REFERENCES "ScoreRuleVersion"(id);

ALTER TABLE "ScoreGap" ADD CONSTRAINT "ScoreGap_jobScoreId_fkey" 
  FOREIGN KEY (jobScoreId) REFERENCES "JobScore"(id) ON DELETE CASCADE;

ALTER TABLE "ScoreGap" ADD CONSTRAINT "ScoreGap_requirementId_fkey" 
  FOREIGN KEY (requirementId) REFERENCES "JobRequirement"(id) ON DELETE CASCADE;

ALTER TABLE "CvVersion" ADD CONSTRAINT "CvVersion_profileId_fkey" 
  FOREIGN KEY (profileId) REFERENCES "CandidateProfile"(id) ON DELETE CASCADE;

ALTER TABLE "CvClaim" ADD CONSTRAINT "CvClaim_cvVersionId_fkey" 
  FOREIGN KEY (cvVersionId) REFERENCES "CvVersion"(id) ON DELETE CASCADE;

ALTER TABLE "CvClaim" ADD CONSTRAINT "CvClaim_claimId_fkey" 
  FOREIGN KEY (claimId) REFERENCES "Claim"(id) ON DELETE CASCADE;

ALTER TABLE "CoverLetterVersion" ADD CONSTRAINT "CoverLetterVersion_applicationId_fkey" 
  FOREIGN KEY (applicationId) REFERENCES "Application"(id) ON DELETE CASCADE;

ALTER TABLE "CoverLetterClaim" ADD CONSTRAINT "CoverLetterClaim_coverLetterVersionId_fkey" 
  FOREIGN KEY (coverLetterVersionId) REFERENCES "CoverLetterVersion"(id) ON DELETE CASCADE;

ALTER TABLE "CoverLetterClaim" ADD CONSTRAINT "CoverLetterClaim_claimId_fkey" 
  FOREIGN KEY (claimId) REFERENCES "Claim"(id) ON DELETE CASCADE;

ALTER TABLE "Application" ADD CONSTRAINT "Application_jobOfferId_fkey" 
  FOREIGN KEY (jobOfferId) REFERENCES "JobOffer"(id);

ALTER TABLE "Application" ADD CONSTRAINT "Application_profileId_fkey" 
  FOREIGN KEY (profileId) REFERENCES "CandidateProfile"(id);

ALTER TABLE "Application" ADD CONSTRAINT "Application_cvVersionId_fkey" 
  FOREIGN KEY (cvVersionId) REFERENCES "CvVersion"(id);

ALTER TABLE "Application" ADD CONSTRAINT "Application_coverLetterVersionId_fkey" 
  FOREIGN KEY (coverLetterVersionId) REFERENCES "CoverLetterVersion"(id);

ALTER TABLE "ApplicationEvent" ADD CONSTRAINT "ApplicationEvent_applicationId_fkey" 
  FOREIGN KEY (applicationId) REFERENCES "Application"(id) ON DELETE CASCADE;

ALTER TABLE "PhoneEvent" ADD CONSTRAINT "PhoneEvent_applicationId_fkey" 
  FOREIGN KEY (applicationId) REFERENCES "Application"(id) ON DELETE CASCADE;

ALTER TABLE "PhoneEvent" ADD CONSTRAINT "PhoneEvent_contactId_fkey" 
  FOREIGN KEY (contactId) REFERENCES "Contact"(id);

ALTER TABLE "ResponseObservation" ADD CONSTRAINT "ResponseObservation_applicationId_fkey" 
  FOREIGN KEY (applicationId) REFERENCES "Application"(id) ON DELETE CASCADE;

ALTER TABLE "Contact" ADD CONSTRAINT "Contact_companyId_fkey" 
  FOREIGN KEY (companyId) REFERENCES "Company"(id);

-- ---------------------------------------------------------------------------
-- Create triggers for updatedAt timestamps
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_candidate_profile_updated_at ON "CandidateProfile";
CREATE TRIGGER update_candidate_profile_updated_at
BEFORE UPDATE ON "CandidateProfile"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_claim_updated_at ON "Claim";
CREATE TRIGGER update_claim_updated_at
BEFORE UPDATE ON "Claim"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_application_updated_at ON "Application";
CREATE TRIGGER update_application_updated_at
BEFORE UPDATE ON "Application"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- Create audit immutability function and trigger
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'AuditLog is append-only: UPDATE/DELETE not allowed';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_log_update_trigger ON "AuditLog";
CREATE TRIGGER audit_log_update_trigger
BEFORE UPDATE ON "AuditLog"
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();

DROP TRIGGER IF EXISTS audit_log_delete_trigger ON "AuditLog";
CREATE TRIGGER audit_log_delete_trigger
BEFORE DELETE ON "AuditLog"
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();