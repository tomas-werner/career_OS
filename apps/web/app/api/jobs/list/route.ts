import { NextResponse } from 'next/server';
import { prisma } from '@career-os/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const jobs = await prisma.jobOffer.findMany({
    orderBy: { discoveredAt: 'desc' },
    take: 50,
    select: {
      id: true,
      title: true,
      location: true,
      discoveredAt: true,
      company: { select: { name: true } },
    },
  });
  return NextResponse.json({ count: jobs.length, jobs });
}
