import { NextResponse } from 'next/server';
import { isCloudinaryConfigured, setImageAlt, destroyImage } from '@/lib/cloudinary';
import { getGalleryUploads } from '@/lib/gallery';
import { addStoredUpload, removeStoredUpload, updateStoredAlt } from '@/lib/gallery-store';

// Always read live so a fresh upload appears without a redeploy.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await getGalleryUploads();
    return NextResponse.json({ configured: isCloudinaryConfigured(), ...result });
  } catch (error) {
    return NextResponse.json(
      {
        configured: isCloudinaryConfigured(),
        mode: 'curated-only',
        images: [],
        error: error instanceof Error ? error.message : 'The gallery could not be loaded.'
      },
      { status: 502 }
    );
  }
}

/** Called by the upload widget so the photo is remembered even without Admin API keys. */
export async function POST(request: Request) {
  let payload: { publicId?: string; src?: string; alt?: string };
  try {
    payload = (await request.json()) as { publicId?: string; src?: string; alt?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const publicId = payload.publicId?.trim();
  const src = payload.src?.trim();
  if (!publicId || !src) {
    return NextResponse.json({ error: 'Both publicId and src are required.' }, { status: 400 });
  }

  try {
    await addStoredUpload({
      publicId,
      src,
      alt: payload.alt?.trim() || 'Photograph from our programmes',
      addedAt: new Date().toISOString()
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not record the upload.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  let payload: { publicId?: string; alt?: string; src?: string };
  try {
    payload = (await request.json()) as { publicId?: string; alt?: string; src?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const publicId = payload.publicId?.trim();
  const alt = payload.alt?.trim();
  if (!publicId || !alt) {
    return NextResponse.json({ error: 'Both publicId and alt are required.' }, { status: 400 });
  }

  // Always keep a copy on this server first, so the caption is never lost.
  try {
    await updateStoredAlt(publicId, alt, payload.src?.trim() ?? '');
  } catch {
    // Read-only filesystem: Cloudinary is still the primary store below.
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json({ ok: true, saved: 'local' });
  }

  try {
    await setImageAlt(publicId, alt);
    return NextResponse.json({ ok: true, saved: 'cloudinary' });
  } catch (error) {
    // The caption already shows on the site; Cloudinary just could not store it.
    return NextResponse.json({
      ok: true,
      saved: 'local',
      warning: `Saved on this server, but Cloudinary rejected the update: ${
        error instanceof Error ? error.message : 'unknown error'
      }`
    });
  }
}

export async function DELETE(request: Request) {
  const publicId = new URL(request.url).searchParams.get('publicId')?.trim();
  if (!publicId) {
    return NextResponse.json({ error: 'A publicId query parameter is required.' }, { status: 400 });
  }

  // Delete the actual file in Cloudinary first. If that fails we leave the record
  // alone, so the website never hides a photo that still exists in the account.
  if (isCloudinaryConfigured()) {
    try {
      await destroyImage(publicId);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Cloudinary could not delete the file.' },
        { status: 502 }
      );
    }
  }

  try {
    const remaining = await removeStoredUpload(publicId);
    return NextResponse.json({
      ok: true,
      deletedFromCloudinary: isCloudinaryConfigured(),
      warning: isCloudinaryConfigured()
        ? undefined
        : 'Removed from the website list. The file still exists in Cloudinary — delete it there too, or add the Admin API keys so this button can delete it for you.',
      images: remaining.length
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not remove the entry.' },
      { status: 500 }
    );
  }
}
