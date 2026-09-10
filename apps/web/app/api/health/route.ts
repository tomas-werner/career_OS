import { NextResponse } from 'next/server';
import { getHealth } from '@/lib/health';

export const dynamic = 'force-dynamic';

export async function GET() {
  const health = await getHealth();
  return NextResponse.json(
    {
      status: health.ok ? 'ok' : 'degraded',
      service: 'career-os-web',
      db: health.db,
      checkedAt: health.checkedAt.toISOString(),
    },
    { status: health.ok ? 200 : 503 },
  );
}
