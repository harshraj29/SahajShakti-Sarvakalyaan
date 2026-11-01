# Sahajshakti Sarvakalyaan Trust — Next.js recreation

A responsive, multi-page Next.js recreation of the public-facing Sahajshakti Sarvakalyaan Trust website.

## Pages
- `/` Home
- `/our-story` Our Story
- `/our-work` Our Work
- `/impact` Impact
- `/stories` Stories
- `/gallery` Gallery (curated photos + everything uploaded to Cloudinary)
- `/contact` Contact
- `/donate` Donate
- `/privacy` Privacy Policy
- `/terms` Terms of Use
- `/admin/media` Media manager (not linked, add access control before deploying)

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Before production
- All gallery photography now lives in Cloudinary; only six local photos remain as an offline fallback.
- Contact details are live: sahajshakti7@gmail.com, +91 87891 98272, China Kothi, Buddh Marg, Lodipur, Patna, Bihar 800001.
- Connect the contact and newsletter forms to a real backend/email service. Current contact action is a mailto placeholder.
- Add verified impact figures and approved beneficiary stories; none have been fabricated here.
- Wire up Razorpay so the donation packages collect payment online; until then the donate page routes enquiries to email/phone.
- Protect `/admin` before deploying it publicly.

## Stack
Next.js 15, React 19, TypeScript, Lucide React, custom responsive CSS.

## Cloudinary image management

See [`CLOUDINARY-SETUP.md`](./CLOUDINARY-SETUP.md) for account setup and configuration. The media uploader is at `/admin/media`. Uploads land in the Cloudinary `sahajshakti` folder and appear on `/gallery` immediately — no redeploy. Add `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` to `.env.local` so the server can read the folder back; without them uploads succeed but the gallery stays on the curated `lib/gallery-images.ts` list.
