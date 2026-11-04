'use client';

import { useState } from 'react';
import { Lock, AlertCircle } from 'lucide-react';

export default function AdminLogin({ configured }: { configured: boolean }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true);
    setError('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) throw new Error(payload.error ?? 'Could not sign in.');
      // Full reload so the server component re-renders with the session cookie.
      window.location.reload();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Could not sign in.');
      setSending(false);
    }
  };

  return (
    <div className="admin-media-page">
      <div className="admin-media-top">
        <div className="admin-media-brand">
          <span className="admin-media-mark">
            <img src="/images/logo-mark.png" alt="Sahajshakti Sarvakalyaan Trust logo" width={24} height={29} />
          </span>
          <div><strong>Sahajshakti</strong><small>MEDIA MANAGER</small></div>
        </div>
        <a className="admin-back-link" href="/">View website</a>
      </div>

      <main className="admin-login">
        <div className="admin-login-card">
          <span className="admin-upload-icon"><Lock size={24} /></span>
          <h1>Media manager</h1>
          <p>Enter the admin password to manage gallery photos.</p>

          {!configured && (
            <div className="admin-notice admin-error">
              <AlertCircle size={18} />
              <span>No password is set yet. Add <code>ADMIN_PASSWORD=your-password</code> to <code>.env.local</code> and restart the server.</span>
            </div>
          )}

          {error && <div className="admin-notice admin-error"><AlertCircle size={18} /><span>{error}</span></div>}

          <form onSubmit={submit}>
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter admin password"
              autoComplete="current-password"
              required
            />
            <button className="button button-primary full-width" type="submit" disabled={sending || !configured}>
              {sending ? 'Checking…' : 'Open media manager'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
