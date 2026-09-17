/**
 * Zod request schemas shared by API routes and unit tests.
 * External input is ALWAYS validated here before touching the database
 * (plan.md sections 13, 33).
 */
import { z } from 'zod';
import { APPLICATION_STATUSES, SOURCE_TYPES, LOCATION_TARGETS } from '@career-os/shared';

export const createJobSchema = z.object({
  title: z.string().min(1).max(300),
  company: z.string().min(1).max(300),
  location: z.string().max(200).optional(),
  remoteType: z.string().max(50).optional(),
  description: z.string().min(1).max(50_000),
  externalId: z.string().max(200).optional(),
  canonicalUrl: z.string().url().max(2000).optional(),
  publishedAt: z.string().datetime().optional(),
});

export const createApplicationSchema = z.object({
  jobOfferId: z.string().min(1),
  profileId: z.string().min(1),
});

export const transitionSchema = z.object({
  applicationId: z.string().min(1),
  toStatus: z.enum(APPLICATION_STATUSES),
  note: z.string().max(2000).optional(),
});

// --- Stage B: Knowledge layer (plan.md sections 6, 7, 43) ---

export const upsertProfileSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(320),
  phone: z.string().max(50).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  headline: z.string().max(300).optional(),
  summary: z.string().max(5000).optional(),
  locationTarget: z.enum(LOCATION_TARGETS).optional(),
  cvTemplate: z.enum(['ANALYSTE', 'AUDITOR', 'CONTROLLEUR']).optional(),
});

export const createSourceSchema = z.object({
  type: z.enum(SOURCE_TYPES),
  name: z.string().min(1).max(200),
  uri: z.string().url().max(2000).optional(),
});

export const createEvidenceSchema = z.object({
  sourceId: z.string().min(1),
  quote: z.string().min(1).max(10_000),
  location: z.string().max(200).optional(),
  snapshotId: z.string().min(1).optional(),
});

export const createClaimSchema = z.object({
  profileId: z.string().min(1),
  subject: z.string().min(1).max(200),
  predicate: z.string().min(1).max(200),
  value: z.string().min(1).max(500),
  evidenceIds: z.array(z.string().min(1)).max(50).default([]),
});

export const linkClaimEvidenceSchema = z.object({
  claimId: z.string().min(1),
  evidenceId: z.string().min(1),
  relationship: z.string().min(1).max(100),
});

// --- Stage B sub-entities (plan.md section 6: Experience/Education/Skill/...) ---

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD')
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date');

export const createExperienceSchema = z
  .object({
    profileId: z.string().min(1),
    company: z.string().min(1).max(300),
    role: z.string().min(1).max(300),
    location: z.string().max(200).optional(),
    startDate: isoDate,
    endDate: isoDate.optional(),
    current: z.boolean().default(false),
    description: z.string().max(10_000).optional(),
  })
  .refine((data) => data.current || data.endDate !== undefined, {
    message: 'endDate is required when current is false',
    path: ['endDate'],
  })
  .refine(
    (data) => !data.endDate || Date.parse(data.endDate) >= Date.parse(data.startDate),
    { message: 'endDate must be after startDate', path: ['endDate'] },
  );

export const createEducationSchema = z
  .object({
    profileId: z.string().min(1),
    institution: z.string().min(1).max(300),
    degree: z.string().min(1).max(300),
    field: z.string().min(1).max(300),
    startDate: isoDate,
    endDate: isoDate.optional(),
    grade: z.string().max(100).optional(),
  })
  .refine(
    (data) => !data.endDate || Date.parse(data.endDate) >= Date.parse(data.startDate),
    { message: 'endDate must be after startDate', path: ['endDate'] },
  );

export const createSkillSchema = z.object({
  profileId: z.string().min(1),
  name: z.string().min(1).max(200),
  level: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  evidenceIds: z.array(z.string().min(1)).max(50).default([]),
});

export const createCertificationSchema = z
  .object({
    profileId: z.string().min(1),
    name: z.string().min(1).max(300),
    issuer: z.string().min(1).max(300),
    issueDate: isoDate,
    expirationDate: isoDate.optional(),
    credentialUrl: z.string().url().max(2000).optional(),
  })
  .refine(
    (data) =>
      !data.expirationDate || Date.parse(data.expirationDate) >= Date.parse(data.issueDate),
    { message: 'expirationDate must be after issueDate', path: ['expirationDate'] },
  );

// --- Stage D: Documents (plan.md sections 16-18) ---

export const generateCvSchema = z.object({
  profileId: z.string().min(1),
  jobOfferId: z.string().min(1).optional(),
  claimIds: z.array(z.string().min(1)).max(200).optional(),
});

export const generateCoverLetterSchema = z.object({
  applicationId: z.string().min(1),
  claimIds: z.array(z.string().min(1)).max(200).optional(),
});

// --- Contacts (plan.md section 23) ---

export const createContactSchema = z.object({
  companyId: z.string().min(1),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  role: z.string().max(200).optional(),
  email: z.string().email().max(320).optional(),
  phone: z.string().max(50).optional(),
  linkedinUrl: z.string().url().max(2000).optional(),
  source: z.string().max(200).optional(),
});
