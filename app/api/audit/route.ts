import { NextResponse } from 'next/server';
import { runAudit } from '../../../lib/audit';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = body?.url;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid `url` in request body' }, { status: 400 });
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const result = await runAudit(url);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 500 });
  }
}
