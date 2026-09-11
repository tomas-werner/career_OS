import { NextResponse } from 'next/server';
import { healthCheck } from '@career-os/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const start = Date.now();
    const healthy = await healthCheck();
    if (!healthy) {
      throw new Error('Database connection failed');
    }
    return NextResponse.json({
      status: 'ok',
      db: 'connected',
      latencyMs: Date.now() - start,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        db: 'unavailable',
        detail: error instanceof Error ? error.message : 'unknown error',
        checkedAt: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
