import { NextResponse } from 'next/server';
import { query } from '@career-os/db';

export const dynamic = 'force-dynamic';

type JobListRow = {
  id: string;
  title: string;
  location: string | null;
  discoveredAt: Date;
  companyId: string;
  companyName: string;
};

export async function GET() {
  const jobs = await query<JobListRow>(
    `SELECT
      jo.id,
      jo.title,
      jo.location,
      jo."discoveredAt",
      c.id as "companyId",
      c.name as "companyName"
     FROM "JobOffer" jo
     JOIN "Company" c ON jo."companyId" = c.id
     ORDER BY jo."discoveredAt" DESC
     LIMIT 50`
  );

  const formattedJobs = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    location: job.location,
    discoveredAt: job.discoveredAt,
    company: { id: job.companyId, name: job.companyName },
  }));
  
  return NextResponse.json({ count: formattedJobs.length, jobs: formattedJobs });
}
