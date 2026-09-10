import { NextResponse } from 'next/server';
import { getFullHealth } from '@/lib/health';

export const dynamic = 'force-dynamic';

export async function GET() {
  const health = await getFullHealth();
  return NextResponse.json(
    {
      status: health.ok ? 'ok' : 'degraded',
      service: 'career-os-web',
      db: health.db,
      n8n: health.n8n,
      checkedAt: health.checkedAt.toISOString(),
    },
    { status: health.ok ? 200 : 503 },
  );
}
