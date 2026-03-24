import { NextResponse } from 'next/server';
import { fetchVoices } from '@/lib/services/orbit';

export async function GET() {
  try {
    const voices = await fetchVoices();
    return NextResponse.json(Array.isArray(voices) ? voices : []);
  } catch (error: unknown) {
    const { toEburonError, eburonJsonResponse } = await import('@/lib/eburon');
    const eburonErr = toEburonError(error);
    console.error('[orbit/voices]', { code: eburonErr.code, detail: eburonErr.detail });
    return NextResponse.json(...eburonJsonResponse(eburonErr));
  }
}
