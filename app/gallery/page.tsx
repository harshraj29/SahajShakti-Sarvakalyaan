import {PageHero,SectionHeading,CtaBand,ImageTile} from '@/components/Sections';
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
      <div className="gallery-grid">{photos.map((photo,i)=><div className={`gallery-item gallery-${i+1}`} key={photo.publicId ?? photo.src}><ImageTile src={photo.src} alt={photo.alt} width={600}/><span>{photo.caption ?? photo.alt}</span></div>)}</div>
    </section>
    <div className="container"><CtaBand/></div>
  </main>;
}
