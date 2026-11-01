/**
 * Offline fallback only.
 *
 * The live gallery is read from Cloudinary. These six local files are what the
 * site shows if Cloudinary is unreachable or the folder is empty, so the page
 * never renders without photographs.
 */
export type { GalleryImage } from '@/lib/cloudinary';
import type { GalleryImage } from '@/lib/cloudinary';

export const fallbackGalleryImages: GalleryImage[] = [
  { src: '/images/children_slide1.jpg', alt: 'Happy children learning in a classroom', caption: 'Learning & Laughter' },
  { src: '/images/children_slide2.jpg', alt: 'A community health check-up', caption: 'Caring for Health' },
  { src: '/images/children_slide3.jpg', alt: 'Participants in a skill development workshop', caption: 'Empowering Skills' },
  { src: '/images/children_slide4.jpg', alt: 'Volunteers interacting with children', caption: 'Dedicated Volunteers' },
  { src: '/images/children_slide5.jpg', alt: 'Community gathering and celebration', caption: 'Stronger Together' },
  { src: '/images/child6.jpg', alt: 'A child receiving educational materials', caption: 'Hope Delivered' }
];
