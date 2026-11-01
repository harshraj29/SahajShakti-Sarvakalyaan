import { fallbackGalleryImages } from '@/lib/gallery-images';
import { imageIsReachable, isCloudinaryConfigured, listGalleryImages, type GalleryImage } from '@/lib/cloudinary';
import { listStoredUploads, replaceStoredUploads } from '@/lib/gallery-store';

export type GalleryResult = {
  /** Gallery photos, newest upload first. */
  images: GalleryImage[];
  /** Where the photos were read from, so the admin screen can explain the state. */
  mode: 'cloudinary' | 'local-manifest' | 'curated-only';
  /** Populated when Cloudinary was configured but the request failed. */
  warning?: string;
};

/**
 * Reads the local manifest and throws away entries whose Cloudinary asset has
 * been deleted, so a photo removed in the Cloudinary Media Library stops showing
 * on the website even when the Admin API keys are not configured.
 */
async function liveManifestUploads(): Promise<GalleryImage[]> {
  const stored = await listStoredUploads();
  if (stored.length === 0) return [];

  const checked = await Promise.all(
    stored.map(async (item) => ({ item, alive: await imageIsReachable(item.src) }))
  );
  const alive = checked.filter((entry) => entry.alive).map((entry) => entry.item);

  if (alive.length !== stored.length) {
    try {
      await replaceStoredUploads(alive);
    } catch {
      // Read-only filesystem (serverless): still hide the dead entries for this request.
    }
  }

  return alive.map(({ src, alt, publicId }) => ({ src, alt, publicId }));
}

/**
 * Photos uploaded through the media manager, newest first.
 *
 * Cloudinary is the single source of truth whenever the Admin API credentials
 * exist — including when the folder is empty, so deleting every photo really does
 * empty the gallery. The local manifest is only a fallback for machines without
 * those credentials.
 */
export async function getGalleryUploads(): Promise<GalleryResult> {
  if (isCloudinaryConfigured()) {
    try {
      const [images, stored] = await Promise.all([listGalleryImages(), listStoredUploads()]);
      // Prefer a caption saved on this server when Cloudinary has none yet, so a
      // rejected context update never loses the text the user typed.
      const localAlt = new Map(
        stored.filter((item) => item.alt.trim()).map((item) => [item.publicId, item.alt.trim()])
      );
      const merged = images.map((image) => {
        if (image.hasSavedAlt || !image.publicId) return image;
        const fallbackAlt = localAlt.get(image.publicId);
        return fallbackAlt ? { ...image, alt: fallbackAlt } : image;
      });
      return { images: merged, mode: 'cloudinary' };
    } catch (error) {
      const images = await liveManifestUploads();
      return {
        images,
        mode: images.length > 0 ? 'local-manifest' : 'curated-only',
        warning: error instanceof Error ? error.message : 'Cloudinary request failed.'
      };
    }
  }

  const images = await liveManifestUploads();
  return { images, mode: images.length > 0 ? 'local-manifest' : 'curated-only' };
}

/**
 * Everything on /gallery.
 *
 * Cloudinary is the source of truth. The six local photos are used only when the
 * folder cannot be read, so the page degrades instead of going blank.
 */
export async function getGalleryImages(): Promise<GalleryResult> {
  const uploads = await getGalleryUploads();
  if (uploads.images.length > 0) return uploads;
  return { ...uploads, images: fallbackGalleryImages };
}
