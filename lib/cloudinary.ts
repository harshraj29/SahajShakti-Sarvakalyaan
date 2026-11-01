/**
 * Server-side Cloudinary helpers for the public gallery.
 *
 * The upload widget runs in the browser with an unsigned preset, so no secret is
 * exposed. Reading the folder back (and writing captions) happens here, on the
 * server, with the Cloudinary Admin API credentials from the environment.
 */

import { createHash } from 'crypto';

export type GalleryImage = {
  src: string;
  alt: string;
  /** Shown as the gallery tile label. Falls back to `alt` when absent. */
  caption?: string;
  publicId?: string;
  /** True when Cloudinary already holds a real alt/caption for this asset. */
  hasSavedAlt?: boolean;
  width?: number;
  height?: number;
  createdAt?: string;
};

type CloudinaryResource = {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  created_at?: string;
  context?: { custom?: Record<string, string> };
};

const cloudName =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_CLOUD_NAME ?? '';
const apiKey = process.env.CLOUDINARY_API_KEY ?? '';
const apiSecret = process.env.CLOUDINARY_API_SECRET ?? '';

/** Folder that the upload widget writes into. Must match the widget's `folder` option. */
export const galleryFolder = (process.env.CLOUDINARY_GALLERY_FOLDER ?? 'sahajshakti').replace(
  /\/+$/,
  ''
);

export function isCloudinaryConfigured(): boolean {
  return Boolean(cloudName && apiKey && apiSecret);
}

function authHeader(): string {
  return `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`;
}

/**
 * Cloudinary signs the alphabetically sorted request parameters with the API
 * secret appended. Parameters that are sent but not signed make the request fail.
 */
function signParams(params: Record<string, string>): string {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return createHash('sha1').update(`${sorted}${apiSecret}`).digest('hex');
}

/** Pulls Cloudinary's own error message out of a failed response. */
async function responseError(response: Response): Promise<string> {
  try {
    const text = await response.text();
    try {
      const parsed = JSON.parse(text) as { error?: { message?: string } };
      return parsed.error?.message ?? text.slice(0, 200) ?? response.statusText;
    } catch {
      return text.slice(0, 200) || response.statusText;
    }
  } catch {
    return response.statusText;
  }
}

/** "sahajshakti/IMG-2024-11-01" -> "IMG 2024 11 01" so a raw upload still reads sensibly. */
function altFromPublicId(publicId: string): string {
  const file = publicId.split('/').pop() ?? publicId;
  const words = file
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[-_]+/g, ' ')
    .trim();
  if (!words) return 'Photograph from our programmes';
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function mapResource(resource: CloudinaryResource): GalleryImage {
  const custom = resource.context?.custom ?? {};
  const savedAlt = custom.alt?.trim();
  const caption = custom.caption?.trim();
  return {
    src: resource.secure_url,
    alt: savedAlt || altFromPublicId(resource.public_id),
    caption: caption || undefined,
    hasSavedAlt: Boolean(savedAlt),
    publicId: resource.public_id,
    width: resource.width,
    height: resource.height,
    createdAt: resource.created_at
  };
}

/** Newest first. Throws when Cloudinary rejects the request so callers can fall back. */
export async function listGalleryImages(): Promise<GalleryImage[]> {
  if (!isCloudinaryConfigured()) return [];

  const resources: CloudinaryResource[] = [];
  let cursor: string | undefined;

  // The Admin API returns at most 500 assets per call, so walk the pages.
  for (let page = 0; page < 20; page += 1) {
    const url = new URL(`https://api.cloudinary.com/v1_1/${cloudName}/resources/image`);
    // `type` is mandatory whenever `context` is requested, otherwise Cloudinary returns
    // 400 "Missing required parameter - type".
    url.searchParams.set('type', 'upload');
    url.searchParams.set('prefix', `${galleryFolder}/`);
    url.searchParams.set('max_results', '500');
    url.searchParams.set('direction', 'desc');
    url.searchParams.set('context', 'true');
    if (cursor) url.searchParams.set('next_cursor', cursor);

    const response = await fetch(url, {
      headers: { Authorization: authHeader() },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Cloudinary list request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as {
      resources?: CloudinaryResource[];
      next_cursor?: string;
    };

    resources.push(...(payload.resources ?? []));
    cursor = payload.next_cursor;
    if (!cursor) break;
  }

  return resources
    .map(mapResource)
    .sort((a, b) => String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')));
}

/**
 * Stores a caption/alt text on the asset so it survives reloads and page visits.
 * Uses the Upload API context endpoint, which authenticates with a signature.
 */
export async function setImageAlt(publicId: string, alt: string): Promise<void> {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary Admin API credentials are not configured.');
  }

  const safeAlt = alt.replace(/[|=]/g, ' ').trim();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const base = { command: 'add', context: `alt=${safeAlt}`, timestamp };

  // Cloudinary signs array parameters by bare name, but some setups expect the
  // literal `public_ids[]`. Try both rather than guessing wrong.
  const attempts: Record<string, string>[] = [
    { ...base, public_ids: publicId },
    { ...base, 'public_ids[]': publicId }
  ];

  let lastError = 'Saving the caption failed.';
  for (const params of attempts) {
    const body = new URLSearchParams();
    body.append('command', params.command);
    body.append('context', params.context);
    body.append('public_ids[]', publicId);
    body.append('timestamp', params.timestamp);
    body.append('api_key', apiKey);
    body.append('signature', signParams(params));

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/context`, {
      method: 'POST',
      body,
      cache: 'no-store'
    });

    if (response.ok) return;
    lastError = `Cloudinary rejected the caption (${response.status}): ${await responseError(response)}`;
  }

  throw new Error(lastError);
}

/**
 * Permanently deletes the asset from Cloudinary.
 * Uses the Upload API destroy endpoint, which authenticates with a signature.
 */
export async function destroyImage(publicId: string): Promise<void> {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary Admin API credentials are not configured, so the file cannot be deleted from Cloudinary.');
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  // invalidate also clears the CDN copy, so the photo really disappears.
  const params = { invalidate: 'true', public_id: publicId, timestamp };
  const body = new URLSearchParams({ ...params, api_key: apiKey, signature: signParams(params) });

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: 'POST',
    body,
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Cloudinary could not delete the file (${response.status}): ${await responseError(response)}`);
  }

  const payload = (await response.json()) as { result?: string };
  // "not found" means it was already deleted, which is the outcome we want.
  if (payload.result !== 'ok' && payload.result !== 'not found') {
    throw new Error(`Cloudinary refused the delete (${payload.result ?? 'unknown result'}).`);
  }
}

/** True when the delivered image URL still resolves. Used to spot assets deleted in Cloudinary. */
export async function imageIsReachable(src: string): Promise<boolean> {
  try {
    const response = await fetch(src, { method: 'HEAD', cache: 'no-store' });
    return response.ok;
  } catch {
    return false;
  }
}
