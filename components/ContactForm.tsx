'use client';

import { useState } from 'react';

type Status = 'idle' | 'sending' | 'sent' | 'error';

/**
 * Web3Forms answers server-to-server requests with a Cloudflare challenge, so the
 * browser posts to it directly. That access key is public by design — it is the
 * same key their own embeddable snippet exposes.
 */
const ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ?? '';
const ENDPOINT = 'https://api.web3forms.com/submit';

type Fields = {
  name: string;
  email: string;
  subject: string;
  message: string;
  botcheck: string;
};

async function postToWeb3Forms(fields: Fields) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: ACCESS_KEY,
      subject: `Website enquiry: ${fields.subject}`,
      from_name: `${fields.name} (website)`,
      replyto: fields.email,
      name: fields.name,
      email: fields.email,
      enquiry_type: fields.subject,
      message: fields.message,
      botcheck: fields.botcheck ? true : false
    })
  });

  const raw = await response.text();
  let payload: { success?: boolean; message?: string } = {};
  try {
    payload = JSON.parse(raw) as { success?: boolean; message?: string };
  } catch {
    throw new Error('The mail service blocked the request. Please email sahajshakti7@gmail.com directly.');
  }
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message ?? 'The mail service rejected the message.');
  }
}

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const raw = Object.fromEntries(new FormData(form).entries());
    const fields: Fields = {
      name: String(raw.name ?? '').trim(),
      email: String(raw.email ?? '').trim(),
      subject: String(raw.subject ?? 'General enquiry'),
      message: String(raw.message ?? '').trim(),
      botcheck: String(raw.botcheck ?? '')
    };

    setStatus('sending');
    setError('');

    try {
      if (!ACCESS_KEY) {
        throw new Error(
          'The contact form is not connected yet. Add NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY to .env.local and restart.'
        );
      }
      await postToWeb3Forms(fields);
      form.reset();
      setStatus('sent');
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : 'Could not send your message. Please email sahajshakti7@gmail.com.'
      );
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="contact-form contact-sent">
        <h3>Message sent</h3>
        <p>Thank you for getting in touch. We will reply to your email address as soon as we can.</p>
        <button className="button button-primary" type="button" onClick={() => setStatus('idle')}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <h3>Send us a message</h3>
      <p>Tell us how we can help and we will reply by email.</p>

      {/* Stops most spam bots without a captcha. */}
      <input type="checkbox" name="botcheck" className="hidden-honeypot" tabIndex={-1} autoComplete="off" />

      <label>Your name<input name="name" placeholder="Full name" required /></label>
      <label>Email address<input type="email" name="email" placeholder="you@example.com" required /></label>
      <label>
        How can we help?
        <select name="subject">
          <option>General enquiry</option>
          <option>Volunteer</option>
          <option>Partnership</option>
          <option>Donation</option>
        </select>
      </label>
      <label>Your message<textarea name="message" rows={5} placeholder="Write your message..." required /></label>

      {status === 'error' && <p className="contact-error">{error}</p>}

      <button className="button button-primary" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send message ↗'}
      </button>
    </form>
  );
}
