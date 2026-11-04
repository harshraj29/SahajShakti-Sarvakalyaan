import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const endpoint = process.env.CONTACT_FORM_ENDPOINT ?? 'https://api.web3forms.com/submit';
const accessKey = process.env.WEB3FORMS_ACCESS_KEY ?? '';

function clean(value: unknown, max = 4000): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function POST(request: Request) {
  if (!accessKey) {
    return NextResponse.json(
      {
        error:
          'The contact form is not connected yet. Add WEB3FORMS_ACCESS_KEY to .env.local so messages reach your inbox.'
      },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  // Honeypot: real people never fill this in.
  if (clean(body.botcheck)) {
    return NextResponse.json({ ok: true });
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const message = clean(body.message);
  const subject = clean(body.subject, 120) || 'General enquiry';

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Name, email and message are all required.' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: accessKey,
        subject: `Website enquiry: ${subject}`,
        from_name: `${name} (website)`,
        replyto: email,
        name,
        email,
        enquiry_type: subject,
        message
      }),
      cache: 'no-store'
    });

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json(
        { error: `The mail service rejected the message (${response.status}). ${detail.slice(0, 120)}` },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Could not reach the mail service. Please try again.' }, { status: 502 });
  }
}
