# Cloudinary setup (no custom backend)

This project includes a browser-side Cloudinary Upload Widget at `/admin/media`.
It uses an **unsigned upload preset** so the browser can upload images without exposing your Cloudinary API secret.

## 1. Create a Cloudinary account

1. Sign up at https://cloudinary.com/users/register/free
2. Open the Cloudinary Console and copy your **Cloud name**.
3. Go to **Settings → Upload → Upload presets**.
4. Create a preset named for example `sahajshakti_unsigned`.
5. Set **Signing Mode** to **Unsigned**.
6. Restrict allowed formats to `jpg,jpeg,png,webp` and maximum file size to 10 MB.
7. Set the asset folder to `sahajshakti` (or use the folder setting in the widget).
8. Save the preset.

Do not put your API Secret in the Next.js app, `.env` file, GitHub, or browser code.

## 2. Configure the project

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=sahajshakti_unsigned
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

`NEXT_PUBLIC_*` values are visible in the browser (they are safe). The `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` are **server-only** — they are used to read the folder back and to save captions, and must never be committed or exposed.

Restart the development server after changing environment variables:

```bash
npm install
npm run dev
```

Open http://localhost:3000/admin/media and upload a test image.

## 3. Photos publish themselves

Uploading is now enough. The media manager writes into the `sahajshakti` folder, and `/gallery` reads that folder from Cloudinary on every request, so a new photo appears on the public gallery immediately — no code change and no redeploy.

- `GET /api/gallery` lists the folder.
- `PUT /api/gallery` saves a caption (stored as the asset's `alt` context field).
- `lib/gallery-images.ts` holds the curated baseline set; anything in Cloudinary is added on top of it.

Add a caption in the media manager so screen readers get a meaningful description. If you skip it, the gallery falls back to the file name.

## 4. Deleting images

Use the trash button in the media manager. It deletes the file from Cloudinary **and** removes it from the gallery in one step.

Deleting in the Cloudinary Media Library also works. The site checks each photo URL before rendering and drops the ones that no longer exist, so a deleted photo stops showing on the next page load even if a stale record is left behind.

Without `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` the trash button can only remove the website entry, and the file stays in Cloudinary — add the keys if you want one-click deletion of the file itself.

## 5. How images are managed

| What | Where it lives | How it reaches the page |
| --- | --- | --- |
| The gallery photos (32, migrated from the old site) | Your Cloudinary account, `sahajshakti` folder | Read live through the Cloudinary Admin API |
| Six fallback photos | `public/images/children_slide1-5.jpg`, `child6.jpg` | Only used when Cloudinary cannot be reached |
| Page artwork (heroes, programme cards, women's section) | `public/images/**` | Copied into the build, served by Next.js |

The gallery no longer reads local files. Everything in `/gallery` and the
"Moments of Joy & Impact" strip on the home page comes from Cloudinary.

`scripts/upload-gallery-to-cloudinary.mjs` performs the one-time migration and is
safe to re-run — it skips assets that already exist.

To keep the photos even if Cloudinary goes away, download the originals from the
Cloudinary Media Library and add them to `public/images/`.

## 6. Important security note

The `/admin/media` page is an upload interface, not an authenticated admin system. Do not deploy it publicly without protecting `/admin` using a hosting access-control feature (for example, Cloudflare Access) or adding a proper authenticated serverless signing endpoint later. Unsigned presets are public by design; restrict the preset to image formats, size, and a dedicated folder.

## Current architecture

- No database or custom server required for image uploads.
- Curated photos live in `public/images`; uploads live in the Cloudinary `sahajshakti` folder.
- The gallery merges the two: uploads first, then anything curated that is not already listed.
- Reading, captions (alt context) and deletion all run through `lib/cloudinary.ts` on the server with the Admin API credentials.
- `data/gallery-uploads.json` only records uploads on machines without those credentials.
