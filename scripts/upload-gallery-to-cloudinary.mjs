/**
 * One-off helper: uploads the curated gallery photos in public/images to Cloudinary
 * so the live gallery no longer depends on local files.
 *
 * Usage:  node scripts/upload-gallery-to-cloudinary.mjs
 * Reads credentials from .env.local. Safe to re-run: already-uploaded assets are skipped.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

function loadEnv(file = '.env.local') {
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '').trim();
    }
  }
}

loadEnv();

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const folder = process.env.CLOUDINARY_GALLERY_FOLDER ?? 'sahajshakti';

if (!cloudName || !apiKey || !apiSecret) {
  console.error('Missing Cloudinary credentials in .env.local');
  process.exit(1);
}

const captioned = [
  ['children_slide1.jpg', 'Learning & Laughter', 'Happy children learning in a classroom'],
  ['children_slide2.jpg', 'Caring for Health', 'A community health check-up'],
  ['children_slide3.jpg', 'Empowering Skills', 'Participants in a skill development workshop'],
  ['children_slide4.jpg', 'Dedicated Volunteers', 'Volunteers interacting with children'],
  ['children_slide5.jpg', 'Stronger Together', 'Community gathering and celebration'],
  ['child6.jpg', 'Hope Delivered', 'A child receiving educational materials'],
  ['child7.jpg', 'Dedicated Volunteers', 'Volunteers interacting with children'],
  ['child8.jpg', 'Stronger Together', 'Community gathering and celebration'],
  ['ngo1.jpeg', 'New Moments', 'More moments from our work in the community'],
  ['ngo2.jpg', 'Community Focus', 'Community empowerment in action'],
  ['ngo3.jpg', 'Learning Together', 'Children learning together'],
  ['ngo4.jpeg', 'Health for All', 'Health and wellbeing support for families']
];

const files = [
  ...captioned.map(([name, caption, alt]) => ({ rel: name, caption, alt })),
  ...Array.from({ length: 20 }, (_, index) => ({
    rel: `g${index + 1}.jpg`,
    caption: '',
    alt: `Photograph from our programmes (${index + 1})`
  }))
];

function sign(params) {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return createHash('sha1').update(`${sorted}${apiSecret}`).digest('hex');
}

let uploaded = 0;
let skipped = 0;
const failed = [];

for (const file of files) {
  const absolute = path.join('public', 'images', file.rel);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const context = [`alt=${file.alt}`, file.caption ? `caption=${file.caption}` : '']
    .filter(Boolean)
    .join('|');
  const params = { context, folder, timestamp };

  const body = new FormData();
  body.append('file', new Blob([readFileSync(absolute)]), path.basename(file.rel));
  body.append('folder', folder);
  body.append('context', context);
  body.append('timestamp', timestamp);
  body.append('api_key', apiKey);
  body.append('signature', sign(params));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body
  });
  const payload = await response.json();

  if (response.ok) {
    uploaded += 1;
    console.log(`uploaded  ${payload.public_id}`);
  } else if (payload?.error?.message?.includes('already exists')) {
    skipped += 1;
    console.log(`exists    ${folder}/${path.parse(file.rel).name}`);
  } else {
    failed.push(`${file.rel}: ${payload?.error?.message ?? response.status}`);
    console.log(`FAILED    ${file.rel} -> ${payload?.error?.message ?? response.status}`);
  }
}

console.log(`\nuploaded=${uploaded} skipped=${skipped} failed=${failed.length}`);
if (failed.length) {
  console.log(failed.join('\n'));
  process.exit(1);
}
