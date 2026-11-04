'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { GalleryImage } from '@/lib/cloudinary';
import { optimizedImageUrl } from '@/lib/image-url';

export default function GalleryGrid({ photos }: { photos: GalleryImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpenIndex(null), []);

  const step = useCallback(
    (delta: number) => {
      setOpenIndex((current) =>
        current === null ? null : (current + delta + photos.length) % photos.length
      );
    },
    [photos.length]
  );

  useEffect(() => {
    if (openIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };

    // Stop the page behind the overlay from scrolling.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openIndex, close, step]);

  const active = openIndex === null ? null : photos[openIndex];

  return (
    <>
      <div className="gallery-grid">
        {photos.map((photo, index) => (
          <button
            key={photo.publicId ?? photo.src}
            type="button"
            className={`gallery-item gallery-${index + 1}`}
            onClick={() => setOpenIndex(index)}
            aria-label={`View larger: ${photo.caption ?? photo.alt}`}
          >
            <img
              className="image-tile"
              src={optimizedImageUrl(photo.src, 600)}
              alt={photo.alt}
              loading="lazy"
              decoding="async"
            />
            <span>{photo.caption ?? photo.alt}</span>
          </button>
        ))}
      </div>

      {active && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={active.alt}
          onClick={close}
        >
          <button ref={closeRef} type="button" className="lightbox-close" onClick={close} aria-label="Close">
            ×
          </button>
          <button
            type="button"
            className="lightbox-nav prev"
            aria-label="Previous photo"
            onClick={(event) => {
              event.stopPropagation();
              step(-1);
            }}
          >
            ‹
          </button>

          <figure className="lightbox-figure" onClick={(event) => event.stopPropagation()}>
            <img src={optimizedImageUrl(active.src, 1600)} alt={active.alt} />
            <figcaption className="lightbox-caption">{active.caption ?? active.alt}</figcaption>
          </figure>

          <button
            type="button"
            className="lightbox-nav next"
            aria-label="Next photo"
            onClick={(event) => {
              event.stopPropagation();
              step(1);
            }}
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}
