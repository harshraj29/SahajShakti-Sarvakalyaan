/**
 * Very small password gate for /admin/media.
 *
 * The password lives in ADMIN_PASSWORD (.env.local) and never reaches the
 * browser. A successful login sets an httpOnly cookie holding an HMAC of the
 * password, so the raw password is never stored in the cookie either.
 */
import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'sahajshakti_admin';

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? '';
}

export function adminConfigured(): boolean {
  return adminPassword().length > 0;
}

/** Derived session value. Changing ADMIN_PASSWORD invalidates every session. */
export function adminToken(): string {
  return createHmac('sha256', adminPassword()).update('sahajshakti-admin-v1').digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a, 'utf8');
  const right = Buffer.from(b, 'utf8');
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function passwordMatches(input: string): boolean {
  const expected = adminPassword();
  if (!expected) return false;
  return safeEqual(input, expected);
}

export function tokenIsValid(token: string | undefined): boolean {
  if (!token || !adminConfigured()) return false;
  return safeEqual(token, adminToken());
}

/** Server components and route handlers only. */
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return tokenIsValid(store.get(ADMIN_COOKIE)?.value);
}
