import {PageHero,SectionHeading,CtaBand} from '@/components/Sections';
import GalleryGrid from '@/components/GalleryGrid';
import { getGalleryImages } from '@/lib/gallery';

export const metadata = { title: 'Gallery | Sahajshakti Sarvakalyaan Trust' };

// Read uploads on every visit so a new photo shows up immediately.
export const dynamic = 'force-dynamic';

export default async function Gallery(){
  const { images: photos } = await getGalleryImages();

  return <main>
    <PageHero eyebrow="Gallery" title="Moments that bring us together." description="A glimpse into the people, purpose, and possibilities behind community development." image="/images/children_slide4.jpg"/>
    <section className="container content-section">
      <SectionHeading eyebrow="In pictures" title="A community in motion" description="Photographs from the people, programs, and communities we work alongside."/>
      <GalleryGrid photos={photos}/>
    </section>
    <div className="container"><CtaBand/></div>
  </main>;
}
