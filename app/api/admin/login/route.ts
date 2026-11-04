import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminConfigured, adminToken, passwordMatches } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!adminConfigured()) {
    return NextResponse.json(
      { error: 'ADMIN_PASSWORD is not set. Add it to .env.local and restart the server.' },
      { status: 503 }
    );
  }

  let payload: { password?: string };
  try {
    payload = (await request.json()) as { password?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!passwordMatches(payload.password ?? '')) {
    return NextResponse.json({ error: 'That password is not correct.' }, { status: 401 });
  }

  // Mark the cookie Secure only when the request itself arrived over HTTPS,
  // otherwise browsers drop it on http://localhost during local testing.
  const isHttps = new URL(request.url).protocol === 'https:';

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, adminToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: isHttps,
    path: '/',
    maxAge: 60 * 60 * 12
  });
  return response;
}
