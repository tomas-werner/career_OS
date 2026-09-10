-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('MANUAL_ENTRY', 'CV', 'RESUME', 'CERTIFICATE', 'DIPLOMA', 'PROJECT', 'JOB_DESCRIPTION', 'EMAIL', 'SCREENSHOT', 'PDF', 'PORTFOLIO', 'OTHER');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('VERIFIED', 'UNVERIFIED', 'REJECTED', 'EXPIRED', 'CONTESTED');

-- CreateEnum
CREATE TYPE "JobRequirementCategory" AS ENUM ('EDUCATION', 'EXPERIENCE', 'SKILL', 'TOOL', 'TECHNOLOGY', 'LANGUAGE', 'CERTIFICATION', 'KEYWORD');

-- CreateEnum
CREATE TYPE "RequirementImportance" AS ENUM ('MANDATORY', 'PREFERRED', 'OPTIONAL');

-- CreateEnum
CREATE TYPE "GapSeverity" AS ENUM ('CRITICAL', 'MAJOR', 'MINOR');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('A_ANALYSER', 'A_PREPARER', 'A_VALIDER', 'PRETE', 'ENVOYEE', 'REPONSE_RECUE', 'ENTRETIEN', 'OFFRE', 'ACCEPTEE', 'REFUSEE', 'ARCHIVEE');

-- CreateEnum
CREATE TYPE "ApprovalAction" AS ENUM ('SEND_EMAIL', 'MARK_APPLICATION_SENT', 'EXPORT_DOCUMENT');

-- CreateEnum
CREATE TYPE "AuditActorType" AS ENUM ('USER', 'SYSTEM', 'AI', 'N8N', 'WORKER', 'EXTERNAL_API');

-- CreateTable
CREATE TABLE "CandidateProfile" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "city" TEXT,
    "country" TEXT,
    "headline" TEXT,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experience" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "location" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "current" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExperienceTask" (
    "id" TEXT NOT NULL,
    "experienceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "importance" TEXT,

    CONSTRAINT "ExperienceTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "experienceId" TEXT,
    "projectId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "measurableValue" TEXT,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Education" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "grade" TEXT,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "level" TEXT,
    "category" TEXT,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expirationDate" TIMESTAMP(3),
    "credentialUrl" TEXT,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "technologies" TEXT[],
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "url" TEXT,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "type" "SourceType" NOT NULL,
    "name" TEXT NOT NULL,
    "uri" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceSnapshot" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "rawText" TEXT,
    "storagePath" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SourceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "snapshotId" TEXT,
    "quote" TEXT NOT NULL,
    "location" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "predicate" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimEvidence" (
    "claimId" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,

    CONSTRAINT "ClaimEvidence_pkey" PRIMARY KEY ("claimId","evidenceId")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "website" TEXT,
    "industry" TEXT,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "baseUrl" TEXT,

    CONSTRAINT "JobSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobOffer" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "externalId" TEXT,
    "title" TEXT NOT NULL,
    "normalizedTitle" TEXT NOT NULL,
    "location" TEXT,
    "remoteType" TEXT,
    "description" TEXT NOT NULL,
    "descriptionHash" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "discoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canonicalUrl" TEXT,

    CONSTRAINT "JobOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobAnalysis" (
    "id" TEXT NOT NULL,
    "jobOfferId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "seniority" TEXT,
    "requiredSkills" TEXT[],
    "preferredSkills" TEXT[],
    "tools" TEXT[],
    "technologies" TEXT[],
    "keywords" TEXT[],
    "responsibilities" TEXT[],
    "educationRequirements" TEXT[],
    "experienceRequirements" TEXT[],
    "extractedBy" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRequirement" (
    "id" TEXT NOT NULL,
    "jobAnalysisId" TEXT NOT NULL,
    "category" "JobRequirementCategory" NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "originalText" TEXT NOT NULL,
    "importance" "RequirementImportance" NOT NULL,
    "mandatory" BOOLEAN NOT NULL,

    CONSTRAINT "JobRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreRuleVersion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "educationWeight" DOUBLE PRECISION NOT NULL,
    "experienceWeight" DOUBLE PRECISION NOT NULL,
    "skillsWeight" DOUBLE PRECISION NOT NULL,
    "toolsWeight" DOUBLE PRECISION NOT NULL,
    "keywordWeight" DOUBLE PRECISION NOT NULL,
    "version" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ScoreRuleVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobScore" (
    "id" TEXT NOT NULL,
    "jobOfferId" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "educationScore" DOUBLE PRECISION NOT NULL,
    "experienceScore" DOUBLE PRECISION NOT NULL,
    "skillsScore" DOUBLE PRECISION NOT NULL,
    "toolsScore" DOUBLE PRECISION NOT NULL,
    "keywordScore" DOUBLE PRECISION NOT NULL,
    "ruleVersionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreGap" (
    "id" TEXT NOT NULL,
    "jobScoreId" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "severity" "GapSeverity" NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "ScoreGap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CvVersion" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "applicationId" TEXT,
    "templateVersion" TEXT NOT NULL,
    "generationModel" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CvVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CvClaim" (
    "cvVersionId" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "usage" TEXT NOT NULL,

    CONSTRAINT "CvClaim_pkey" PRIMARY KEY ("cvVersionId","claimId")
);

-- CreateTable
CREATE TABLE "CoverLetterVersion" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "templateVersion" TEXT NOT NULL,
    "generationModel" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoverLetterVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoverLetterClaim" (
    "coverLetterVersionId" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,

    CONSTRAINT "CoverLetterClaim_pkey" PRIMARY KEY ("coverLetterVersionId","claimId")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "jobOfferId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'A_ANALYSER',
    "cvVersionId" TEXT,
    "coverLetterVersionId" TEXT,
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationEvent" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorId" TEXT,
    "note" TEXT,
    "correlationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhoneEvent" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "contactId" TEXT,
    "direction" TEXT NOT NULL,
    "outcome" TEXT,
    "notes" TEXT,

    CONSTRAINT "PhoneEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResponseObservation" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "daysSinceLastContact" INTEGER NOT NULL,
    "classification" TEXT NOT NULL,

    CONSTRAINT "ResponseObservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "linkedinUrl" TEXT,
    "source" TEXT,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" "ApprovalAction" NOT NULL,
    "approvedBy" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contentHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorType" "AuditActorType" NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "source" TEXT,
    "before" JSONB,
    "after" JSONB,
    "metadata" JSONB,
    "correlationId" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CandidateProfile_email_key" ON "CandidateProfile"("email");

-- CreateIndex
CREATE INDEX "Experience_profileId_idx" ON "Experience"("profileId");

-- CreateIndex
CREATE INDEX "ExperienceTask_experienceId_idx" ON "ExperienceTask"("experienceId");

-- CreateIndex
CREATE INDEX "Achievement_experienceId_idx" ON "Achievement"("experienceId");

-- CreateIndex
CREATE INDEX "Achievement_projectId_idx" ON "Achievement"("projectId");

-- CreateIndex
CREATE INDEX "Education_profileId_idx" ON "Education"("profileId");

-- CreateIndex
CREATE INDEX "Skill_profileId_idx" ON "Skill"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_profileId_normalizedName_key" ON "Skill"("profileId", "normalizedName");

-- CreateIndex
CREATE INDEX "Certification_profileId_idx" ON "Certification"("profileId");

-- CreateIndex
CREATE INDEX "Project_profileId_idx" ON "Project"("profileId");

-- CreateIndex
CREATE INDEX "SourceSnapshot_sourceId_idx" ON "SourceSnapshot"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "SourceSnapshot_sourceId_contentHash_key" ON "SourceSnapshot"("sourceId", "contentHash");

-- CreateIndex
CREATE INDEX "Evidence_sourceId_idx" ON "Evidence"("sourceId");

-- CreateIndex
CREATE INDEX "Evidence_snapshotId_idx" ON "Evidence"("snapshotId");

-- CreateIndex
CREATE INDEX "Claim_profileId_idx" ON "Claim"("profileId");

-- CreateIndex
CREATE INDEX "Claim_profileId_status_idx" ON "Claim"("profileId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Company_normalizedName_key" ON "Company"("normalizedName");

-- CreateIndex
CREATE INDEX "JobOffer_normalizedTitle_idx" ON "JobOffer"("normalizedTitle");

-- CreateIndex
CREATE INDEX "JobOffer_descriptionHash_idx" ON "JobOffer"("descriptionHash");

-- CreateIndex
CREATE INDEX "JobOffer_companyId_idx" ON "JobOffer"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "JobOffer_sourceId_externalId_key" ON "JobOffer"("sourceId", "externalId");

-- CreateIndex
CREATE INDEX "JobAnalysis_jobOfferId_idx" ON "JobAnalysis"("jobOfferId");

-- CreateIndex
CREATE INDEX "JobRequirement_jobAnalysisId_idx" ON "JobRequirement"("jobAnalysisId");

-- CreateIndex
CREATE UNIQUE INDEX "JobRequirement_jobAnalysisId_category_normalizedName_key" ON "JobRequirement"("jobAnalysisId", "category", "normalizedName");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreRuleVersion_version_key" ON "ScoreRuleVersion"("version");

-- CreateIndex
CREATE INDEX "JobScore_jobOfferId_idx" ON "JobScore"("jobOfferId");

-- CreateIndex
CREATE UNIQUE INDEX "JobScore_jobOfferId_ruleVersionId_key" ON "JobScore"("jobOfferId", "ruleVersionId");

-- CreateIndex
CREATE INDEX "ScoreGap_jobScoreId_idx" ON "ScoreGap"("jobScoreId");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreGap_jobScoreId_requirementId_key" ON "ScoreGap"("jobScoreId", "requirementId");

-- CreateIndex
CREATE UNIQUE INDEX "CvVersion_applicationId_key" ON "CvVersion"("applicationId");

-- CreateIndex
CREATE INDEX "CvVersion_profileId_idx" ON "CvVersion"("profileId");

-- CreateIndex
CREATE INDEX "CvVersion_applicationId_idx" ON "CvVersion"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "CoverLetterVersion_applicationId_key" ON "CoverLetterVersion"("applicationId");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE INDEX "Application_jobOfferId_idx" ON "Application"("jobOfferId");

-- CreateIndex
CREATE INDEX "Application_profileId_idx" ON "Application"("profileId");

-- CreateIndex
CREATE INDEX "ApplicationEvent_applicationId_idx" ON "ApplicationEvent"("applicationId");

-- CreateIndex
CREATE INDEX "ApplicationEvent_correlationId_idx" ON "ApplicationEvent"("correlationId");

-- CreateIndex
CREATE INDEX "PhoneEvent_applicationId_idx" ON "PhoneEvent"("applicationId");

-- CreateIndex
CREATE INDEX "ResponseObservation_applicationId_idx" ON "ResponseObservation"("applicationId");

-- CreateIndex
CREATE INDEX "Contact_companyId_idx" ON "Contact"("companyId");

-- CreateIndex
CREATE INDEX "Approval_entityType_entityId_idx" ON "Approval"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "Approval_entityType_entityId_action_key" ON "Approval"("entityType", "entityId", "action");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_correlationId_idx" ON "AuditLog"("correlationId");

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExperienceTask" ADD CONSTRAINT "ExperienceTask_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceSnapshot" ADD CONSTRAINT "SourceSnapshot_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "SourceSnapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimEvidence" ADD CONSTRAINT "ClaimEvidence_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimEvidence" ADD CONSTRAINT "ClaimEvidence_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobOffer" ADD CONSTRAINT "JobOffer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobOffer" ADD CONSTRAINT "JobOffer_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "JobSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobAnalysis" ADD CONSTRAINT "JobAnalysis_jobOfferId_fkey" FOREIGN KEY ("jobOfferId") REFERENCES "JobOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRequirement" ADD CONSTRAINT "JobRequirement_jobAnalysisId_fkey" FOREIGN KEY ("jobAnalysisId") REFERENCES "JobAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobScore" ADD CONSTRAINT "JobScore_jobOfferId_fkey" FOREIGN KEY ("jobOfferId") REFERENCES "JobOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobScore" ADD CONSTRAINT "JobScore_ruleVersionId_fkey" FOREIGN KEY ("ruleVersionId") REFERENCES "ScoreRuleVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreGap" ADD CONSTRAINT "ScoreGap_jobScoreId_fkey" FOREIGN KEY ("jobScoreId") REFERENCES "JobScore"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreGap" ADD CONSTRAINT "ScoreGap_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "JobRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvVersion" ADD CONSTRAINT "CvVersion_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvVersion" ADD CONSTRAINT "CvVersion_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvClaim" ADD CONSTRAINT "CvClaim_cvVersionId_fkey" FOREIGN KEY ("cvVersionId") REFERENCES "CvVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvClaim" ADD CONSTRAINT "CvClaim_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoverLetterVersion" ADD CONSTRAINT "CoverLetterVersion_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoverLetterClaim" ADD CONSTRAINT "CoverLetterClaim_coverLetterVersionId_fkey" FOREIGN KEY ("coverLetterVersionId") REFERENCES "CoverLetterVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoverLetterClaim" ADD CONSTRAINT "CoverLetterClaim_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobOfferId_fkey" FOREIGN KEY ("jobOfferId") REFERENCES "JobOffer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "CandidateProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationEvent" ADD CONSTRAINT "ApplicationEvent_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneEvent" ADD CONSTRAINT "PhoneEvent_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneEvent" ADD CONSTRAINT "PhoneEvent_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResponseObservation" ADD CONSTRAINT "ResponseObservation_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AuditLog immutability (plan.md section 32): block UPDATE/DELETE at the database level.
CREATE RULE "audit_log_no_update" AS ON UPDATE TO "AuditLog" DO INSTEAD NOTHING;
CREATE RULE "audit_log_no_delete" AS ON DELETE TO "AuditLog" DO INSTEAD NOTHING;

