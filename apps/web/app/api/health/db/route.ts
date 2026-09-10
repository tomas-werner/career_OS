import { NextResponse } from 'next/server';
import { prisma } from '@career-os/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
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
