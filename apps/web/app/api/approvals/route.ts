import { NextResponse } from 'next/server';
import { recordApproval, checkApproval, guardSend } from '@/lib/approval';
import { query } from '@career-os/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { correlationId, approved, actor } = payload as {
    correlationId: string;
    approved: boolean;
    actor: 'USER' | 'SYSTEM';
  };

  if (!correlationId) {
    return NextResponse.json({ error: 'correlationId required' }, { status: 400 });
  }

  try {
    await recordApproval({ correlationId, approved, actor });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('approval record failed:', error);
    return NextResponse.json({ error: 'Failed to record approval' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const correlationId = searchParams.get('correlationId');

  if (!correlationId) {
    return NextResponse.json({ error: 'correlationId query param required' }, { status: 400 });
  }

  const status = await checkApproval(correlationId);
  return NextResponse.json({ approved: status?.approved ?? null, detail: status });
}