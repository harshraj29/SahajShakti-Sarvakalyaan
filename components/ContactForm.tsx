'use client';

import { useState } from 'react';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    setStatus('sending');
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) throw new Error(payload.error ?? 'Could not send your message.');
      form.reset();
      setStatus('sent');
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Could not send your message.');
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
