/**
 * Cloudinary delivery helper.
 *
 * Photos are stored at full resolution. Letting Cloudinary resize and negotiate
 * the format on delivery (f_auto + q_auto) is what actually cuts bandwidth — a
 * 1600px PNG becomes a ~40KB WebP for a 600px tile.
 */
export function optimizedImageUrl(src: string, width = 800): string {
  if (!src.includes('res.cloudinary.com') || !src.includes('/image/upload/')) {
    return src;
  }

  const marker = '/image/upload/';
  const index = src.indexOf(marker);
  const head = src.slice(0, index + marker.length);
  const tail = src.slice(index + marker.length);

  // Already transformed (or a versioned path we should not touch twice).
  if (/^(f_auto|q_auto|c_limit|c_fill|w_\d)/.test(tail)) {
    return src;
  }

  return `${head}f_auto,q_auto,c_limit,w_${width}/${tail}`;
}
