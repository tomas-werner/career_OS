import { NextResponse } from 'next/server';
import { hashContent, normalizeCompanyName, normalizeTitle } from '@career-os/shared';
import { prisma } from '@career-os/db';
import { createJobSchema } from '../schemas';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = createJobSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const input = parsed.data;

  const normalizedName = normalizeCompanyName(input.company);
  const descriptionHash = hashContent(input.description);
  const normalizedTitle = normalizeTitle(input.title);

  try {
    const company = await prisma.company.upsert({
      where: { normalizedName },
      update: {},
      create: { name: input.company, normalizedName },
    });
    const source = await prisma.jobSource.findFirst({
      where: { type: 'MANUAL' },
    });
    if (!source) {
      return NextResponse.json(
        { error: 'JobSource MANUAL not seeded — run pnpm db:seed' },
        { status: 503 },
      );
    }

    const job = await prisma.jobOffer.create({
      data: {
        companyId: company.id,
        sourceId: source.id,
        externalId: input.externalId ?? descriptionHash.slice(0, 16),
        title: input.title,
        normalizedTitle,
        location: input.location,
        remoteType: input.remoteType,
        description: input.description,
        descriptionHash,
        canonicalUrl: input.canonicalUrl,
        publishedAt: input.publishedAt ? new Date(input.publishedAt) : undefined,
      },
      select: {
        id: true,
        title: true,
        normalizedTitle: true,
        company: { select: { name: true } },
        descriptionHash: true,
      },
    });

    return NextResponse.json(
      {
        id: job.id,
        title: job.title,
        normalizedTitle: job.normalizedTitle,
        company: job.company.name,
        descriptionHash: job.descriptionHash,
        duplicate: false,
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    const isUniqueViolation = message.includes('Unique constraint');
    if (isUniqueViolation) {
      return NextResponse.json(
        { error: 'Duplicate job offer (same source + externalId)' },
        { status: 409 },
      );
    }
    console.error('POST /api/jobs failed:', message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
