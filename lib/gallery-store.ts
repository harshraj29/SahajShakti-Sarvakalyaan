/**
 * Fallback store for gallery uploads.
 *
 * When Cloudinary Admin API credentials are present, the gallery is read straight
 * from Cloudinary and this file is only a safety net. When they are not present
 * (for example a quick local run), this file remembers what was uploaded so the
 * photos still appear on /gallery.
 *
 * Note: serverless hosts such as Vercel reset this file between deployments, so
 * add CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET for production.
 */
import { promises as fs } from 'fs';
import path from 'path';

export type StoredUpload = {
  src: string;
  alt: string;
  publicId: string;
  addedAt: string;
};

const file = path.join(process.cwd(), 'data', 'gallery-uploads.json');

async function readAll(): Promise<StoredUpload[]> {
  try {
    const raw = await fs.readFile(file, 'utf8');
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredUpload[]) : [];
  } catch {
    return [];
  }
}

export async function listStoredUploads(): Promise<StoredUpload[]> {
  return readAll();
}

export async function addStoredUpload(upload: StoredUpload): Promise<StoredUpload[]> {
  const current = await readAll();
  const next = [upload, ...current.filter((item) => item.publicId !== upload.publicId)].slice(0, 500);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  return next;
}

/**
 * Records a caption. Creates the entry when the asset was uploaded outside this
 * dashboard, so captions always have somewhere to live.
 */
export async function updateStoredAlt(publicId: string, alt: string, src = ''): Promise<StoredUpload[]> {
  const current = await readAll();
  const exists = current.some((item) => item.publicId === publicId);
  const next = exists
    ? current.map((item) => (item.publicId === publicId ? { ...item, alt } : item))
    : [{ publicId, src, alt, addedAt: new Date().toISOString() }, ...current];
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  return next;
}

export async function removeStoredUpload(publicId: string): Promise<StoredUpload[]> {
  const current = await readAll();
  const next = current.filter((item) => item.publicId !== publicId);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  return next;
}

/** Used to drop entries whose Cloudinary asset no longer exists. */
export async function replaceStoredUploads(uploads: StoredUpload[]): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(uploads, null, 2)}\n`, 'utf8');
}
