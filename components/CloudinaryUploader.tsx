'use client';

import Script from 'next/script';
import { useCallback, useEffect, useState } from 'react';
import { ExternalLink, ImagePlus, CheckCircle2, AlertCircle, RefreshCw, Save, Info, Trash2 } from 'lucide-react';

type CloudinaryAsset = {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
};

type PublishedImage = {
  src: string;
  alt: string;
  publicId?: string;
};

type CloudinaryWidget = {
  open: () => void;
};

declare global {
  interface Window {
    cloudinary?: {
      createUploadWidget: (
        options: Record<string, unknown>,
        callback: (error: unknown, result: { event?: string; info?: CloudinaryAsset }) => void
      ) => CloudinaryWidget;
    };
  }
}

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export default function CloudinaryUploader() {
  const [widgetReady, setWidgetReady] = useState(false);
  const [published, setPublished] = useState<PublishedImage[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [mode, setMode] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onScriptLoad = useCallback(() => setWidgetReady(true), []);

  const loadGallery = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gallery', { cache: 'no-store' });
      const payload = (await response.json()) as {
        configured?: boolean;
        mode?: string;
        images?: PublishedImage[];
      };
      setConfigured(payload.configured ?? false);
      setMode(payload.mode ?? '');
      setPublished(payload.images ?? []);
    } catch {
      setConfigured(null);
      setError('Could not reach the gallery endpoint.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Remembers the upload so it shows even when Cloudinary Admin API keys are absent.
  const recordUpload = useCallback(
    async (publicId: string, src: string) => {
      try {
        await fetch('/api/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId, src })
        });
      } catch {
        // The photo is already safe in Cloudinary; only the local record failed.
      }
      await loadGallery();
    },
    [loadGallery]
  );

  useEffect(() => {
    void loadGallery();
  }, [loadGallery]);

  const openUploader = () => {
    setError('');
    setMessage('');
    if (!cloudName || !uploadPreset) {
      setError('Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to your .env.local file, then restart the dev server.');
      return;
    }
    if (!window.cloudinary) {
      setError('Cloudinary uploader is still loading. Please try again in a moment.');
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName,
        uploadPreset,
        folder: 'sahajshakti',
        sources: ['local', 'camera', 'url'],
        multiple: true,
        maxFiles: 30,
        maxFileSize: 10_000_000,
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        showAdvancedOptions: false,
        cropping: false,
        resourceType: 'image',
        tags: ['sahajshakti-website'],
        styles: { palette: { window: '#FFFFFF', windowBorder: '#244d3c', tabIcon: '#244d3c', menuIcons: '#244d3c', textDark: '#26352e', textLight: '#FFFFFF', link: '#244d3c', action: '#244d3c', inactiveTabIcon: '#8a968d', error: '#b42318', inProgress: '#244d3c', complete: '#23865b', sourceBg: '#f4f5f0' } }
      },
      (widgetError, result) => {
        if (widgetError) {
          setError('Upload failed. Check your Cloudinary upload preset and try again.');
          return;
        }
        if (result?.event === 'success' && result.info?.secure_url && result.info.public_id) {
          setMessage('Uploaded and published. The photo is now live on the Gallery page.');
          void recordUpload(result.info.public_id, result.info.secure_url);
        }
      }
    );
    widget.open();
  };

  const saveCaption = async (publicId: string, src: string) => {
    const alt = (drafts[publicId] ?? '').trim();
    if (!alt) {
      setError('Write a short description before saving.');
      return;
    }
    setSavingId(publicId);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId, alt, src })
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string; warning?: string };
      if (!response.ok || !payload.ok) throw new Error(payload.error ?? 'Saving the caption failed.');
      setDrafts((current) => {
        const next = { ...current };
        delete next[publicId];
        return next;
      });
      if (payload.warning) {
        setError(payload.warning);
      } else {
        setMessage('Caption saved to Cloudinary.');
      }
      await loadGallery();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Saving the caption failed.');
    } finally {
      setSavingId('');
    }
  };

  const deleteImage = async (publicId: string, label: string) => {
    const confirmed = window.confirm(
      `Delete "${label}"?\n\nThis removes the file from Cloudinary and from the website. It cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(publicId);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`/api/gallery?publicId=${encodeURIComponent(publicId)}`, {
        method: 'DELETE'
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string; warning?: string };
      if (!response.ok || !payload.ok) throw new Error(payload.error ?? 'Delete failed.');
      setMessage(payload.warning ?? 'Photo deleted from Cloudinary and removed from the gallery.');
      await loadGallery();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Delete failed.');
    } finally {
      setDeletingId('');
    }
  };

  const signOut = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.reload();
  };

  return (
    <>
      <Script src="https://upload-widget.cloudinary.com/global/all.js" strategy="afterInteractive" onLoad={onScriptLoad} />
      <div className="admin-media-page">
        <div className="admin-media-top">
          <div className="admin-media-brand"><span className="admin-media-mark"><img src="/images/logo-mark.png" alt="Sahajshakti Sarvakalyaan Trust logo" width={24} height={29}/></span><div><strong>Sahajshakti</strong><small>MEDIA MANAGER</small></div></div>
          <div className="admin-top-actions"><a className="admin-back-link" href="/">View website <ExternalLink size={15}/></a><button className="admin-signout" type="button" onClick={signOut}>Sign out</button></div>
        </div>

        <main className="admin-media-main">
          <span className="eyebrow">Website administration</span>
          <h1>Manage your images</h1>
          <p className="admin-media-intro">Photographs uploaded here are stored in Cloudinary and appear on the public Gallery page straight away — no code change, no redeploy.</p>

          <section className="admin-upload-card">
            <div className="admin-upload-icon"><ImagePlus size={25}/></div>
            <h2>Upload images</h2>
            <p>Choose one or more photos. Use JPG, PNG or WebP files up to 10 MB each.</p>
            <button className="button button-primary" type="button" onClick={openUploader} disabled={!widgetReady}>
              <ImagePlus size={17}/> {widgetReady ? 'Choose images to upload' : 'Loading uploader…'}
            </button>
            <small>Uploads go into the <code>sahajshakti</code> folder.</small>
          </section>

          {error && <div className="admin-notice admin-error"><AlertCircle size={18}/>{error}</div>}
          {message && <div className="admin-notice admin-success"><CheckCircle2 size={18}/>{message}</div>}
          {configured === false && <div className="admin-notice admin-info"><Info size={18}/><span>Cloudinary Admin API keys are not set, so uploads are tracked in <code>data/gallery-uploads.json</code>. Add <code>CLOUDINARY_API_KEY</code> and <code>CLOUDINARY_API_SECRET</code> to <code>.env.local</code> to read the folder directly from Cloudinary.</span></div>}
          {configured === true && mode === 'cloudinary' && <div className="admin-notice admin-info"><Info size={18}/><span>Reading the <code>sahajshakti</code> folder straight from Cloudinary. Anything you upload appears on the gallery immediately.</span></div>}

          <section className="admin-results">
            <div className="admin-results-heading">
              <div><span className="eyebrow">Live on the website</span><h2>Published images ({published.length})</h2></div>
              <div className="admin-results-actions">
                <button className="button button-secondary" type="button" onClick={() => void loadGallery()}><RefreshCw size={16}/>Refresh</button>
                <a className="button button-secondary" href="/gallery" target="_blank" rel="noreferrer">Open gallery <ExternalLink size={15}/></a>
              </div>
            </div>

            {loading && <p className="admin-help">Loading images…</p>}
            {!loading && published.length === 0 && <p className="admin-help">No images in the <code>sahajshakti</code> folder yet. Upload your first photo above.</p>}

            <div className="admin-asset-grid">{published.map((image) => <article className="admin-asset" key={image.publicId ?? image.src}>
              <img src={image.src} alt={image.alt} />
              <div>
                <strong>{image.publicId?.split('/').pop() ?? 'Image'}</strong>
                <small>{image.alt}</small>
                <div className="admin-caption-form">
                  <input
                    type="text"
                    aria-label="Photo description"
                    placeholder="Short description for the gallery"
                    defaultValue={image.alt}
                    onChange={(event) => setDrafts((current) => ({ ...current, [image.publicId ?? '']: event.target.value }))}
                  />
                  <button type="button" onClick={() => image.publicId && void saveCaption(image.publicId, image.src)} disabled={savingId === image.publicId}>
                    <Save size={14}/>{savingId === image.publicId ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    type="button"
                    className="admin-delete"
                    aria-label="Delete this photo"
                    title="Delete from Cloudinary and the website"
                    onClick={() => image.publicId && void deleteImage(image.publicId, image.alt)}
                    disabled={deletingId === image.publicId}
                  >
                    <Trash2 size={14}/>{deletingId === image.publicId ? '…' : ''}
                  </button>
                </div>
              </div>
            </article>)}</div>
          </section>

          <section className="admin-help-card">
            <h2>Deleting an image</h2>
            <p>The trash button deletes the photo from Cloudinary <strong>and</strong> removes it from the gallery in one step. Deleting it in the Cloudinary Media Library also works — the site checks every photo link before showing it and drops the ones that no longer exist.</p>
            <a className="text-link" href="https://console.cloudinary.com/console/media_library" target="_blank" rel="noreferrer">Open Cloudinary Media Library <ExternalLink size={15}/></a>
          </section>

          <p className="admin-security-note"><strong>Before publishing:</strong> this upload page is not password-protected. Keep it local while testing, or put an access-control layer in front of <code>/admin</code> before deploying it publicly. The unsigned upload preset should also restrict file types, size and folder.</p>
        </main>
      </div>
    </>
  );
}
