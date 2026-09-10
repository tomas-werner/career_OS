/**
 * Zod request schemas shared by API routes and unit tests.
 * External input is ALWAYS validated here before touching the database
 * (plan.md sections 13, 33).
 */
import { z } from 'zod';
import { APPLICATION_STATUSES } from '@career-os/shared';

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
