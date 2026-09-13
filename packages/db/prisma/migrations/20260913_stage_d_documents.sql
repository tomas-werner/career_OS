-- Stage D (plan.md sections 17-18): store generated document content.
ALTER TABLE "CvVersion" ADD COLUMN IF NOT EXISTS "content" TEXT NOT NULL DEFAULT '';
ALTER TABLE "CoverLetterVersion" ADD COLUMN IF NOT EXISTS "content" TEXT NOT NULL DEFAULT '';
