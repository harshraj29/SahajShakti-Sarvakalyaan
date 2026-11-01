import Link from 'next/link';
import { ArrowUpRight, HeartHandshake, BookOpen, Heart, Users } from 'lucide-react';
import { SectionHeading, ProgramGrid, CtaBand, ImageTile } from '@/components/Sections';
import Counter from '@/components/Counter';
import { getGalleryImages } from '@/lib/gallery';

// The mini gallery reads the newest Cloudinary uploads on each request.
export const dynamic = 'force-dynamic';

export default async function Home() {
  const { images } = await getGalleryImages();
  const moments = images.slice(0, 6);

  return (
    <main>
      <section className="hero">
        <div className="hero-image" />
        <div className="hero-content container">
          <span className="eyebrow light"><i /> A future filled with possibility</span>
          <h1>Igniting hope.<br /><em>Transforming lives.</em></h1>
          <p>Sahajshakti Sarvakalyaan Trust is dedicated to empowering underprivileged children and communities through holistic education, comprehensive healthcare, and sustainable development initiatives.</p>
          <div className="hero-actions">
            <Link href="/donate" className="button button-primary">Donate now <ArrowUpRight size={18} /></Link>
            <Link href="/our-story" className="button button-ghost">Discover our story <span>→</span></Link>
          </div>
          <div className="hero-note">
            <span className="note-icon"><HeartHandshake size={19} /></span>
            <span><b>Compassion into action</b><small>Building stronger communities, together.</small></span>
          </div>
        </div>
        <div className="hero-stamp">CARE <span>✳</span> HOPE <span>✳</span> ACTION</div>
      </section>

      <section className="intro-section container">
        <div className="intro-visual">
          <ImageTile src="/images/child6.jpg" alt="A child receiving educational materials" className="intro-main" />
          <ImageTile src="/images/children_slide1.jpg" alt="Children learning together in a classroom" className="intro-small" />
          <div className="since-card"><b>2023</b><span>Rooted in compassion<br />Driven by purpose</span></div>
        </div>
        <div className="intro-copy">
          <span className="eyebrow">Who we are</span>
          <h2>A journey of compassion, <em>a promise of change.</em></h2>
          <p>Founded in 2023, SahajShakti SarvaKalyaan is a community-focused trust dedicated to uplifting underprivileged individuals. We believe every person deserves the opportunity to thrive, with access to health, education, and overall wellbeing.</p>
          <p>Driven by empathy and fueled by action, we work towards lasting positive change for children, adolescents, women, and communities.</p>
          <Link href="/our-story" className="text-link">Read our story <ArrowUpRight size={17} /></Link>
          <div className="values-row">
            <div><BookOpen /><b>Education</b><small>Opportunity for all</small></div>
            <div><Heart /><b>Wellbeing</b><small>Care with dignity</small></div>
            <div><Users /><b>Community</b><small>Progress together</small></div>
          </div>
        </div>
      </section>

      <section className="program-section">
        <div className="container">
          <SectionHeading eyebrow="What drives us" title="Our pillars of change" description="We focus on integrated initiatives that respond to the needs of vulnerable children and communities." />
          <ProgramGrid />
          <div className="section-bottom">
            <span>One shared purpose. Many ways to make a difference.</span>
            <Link href="/our-work" className="text-link">Explore all our work <ArrowUpRight size={17} /></Link>
          </div>
        </div>
      </section>

      <section className="impact-strip">
        <div className="container impact-inner">
          <div><span className="eyebrow light">Our commitment</span><h2>Measuring success<br /><em>through lives changed.</em></h2></div>
          <div className="impact-stat"><b><Counter value={150} /></b><span>Children Educated &amp; Supported</span></div>
          <div className="impact-stat"><b><Counter value={30} /></b><span>Women Empowered</span></div>
          <div className="impact-stat"><b><Counter value={98} suffix="%" /></b><span>Funds Directly Impacting Beneficiaries</span></div>
        </div>
      </section>

      <section className="women-section container">
        <div className="women-copy">
          <span className="eyebrow">Skills create possibilities</span>
          <h2>Weaving futures.<br /><em>Empowering women.</em></h2>
          <p>We believe in the power of a single skill. Stitching and tailoring training can become a pathway to financial independence, dignity, and a more secure future.</p>
          <p>Our vision is to help women build confidence, develop practical skills, and explore opportunities to earn and contribute to their families.</p>
          <Link href="/our-work" className="text-link">Discover our initiatives <ArrowUpRight size={17} /></Link>
        </div>
        <div className="women-images">
          <ImageTile src="/images/women-empowerment/wi1.jpg" alt="Women in a stitching and tailoring training session" className="women-main" />
          <ImageTile src="/images/women-empowerment/wi3.jpg" alt="Participants practising tailoring skills" className="women-secondary" />
          <div className="women-caption">A skill. A livelihood. A future.</div>
        </div>
      </section>

      <section className="moments-section">
        <div className="container">
          <div className="moments-head">
            <div>
              <span className="eyebrow">From our gallery</span>
              <h2>Moments of Joy &amp; Impact</h2>
              <p>A glimpse into the lives we touch and the communities we serve. These are the smiles and stories that fuel our passion.</p>
            </div>
            <Link href="/gallery" className="button button-primary">View more <ArrowUpRight size={17} /></Link>
          </div>
          <div className="moments-grid">
            {moments.map((photo) => (
              <Link className="moment" href="/gallery" key={photo.publicId ?? photo.src}>
                <ImageTile src={photo.src} alt={photo.alt} width={600} />
                <span>{photo.caption ?? photo.alt}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="involved-section">
        <div className="container">
          <SectionHeading eyebrow="Your role matters" title="Get involved. Make a difference." description="Your contribution fuels our mission and helps transform lives." center />
          <div className="involved-grid">
            <Link href="/donate" className="involved-card"><span>01 / GIVE</span><HeartHandshake /><h3>Donate today</h3><p>Every contribution supports education, healthcare, and community development.</p><b>Make a contribution ↗</b></Link>
            <Link href="/contact" className="involved-card"><span>02 / JOIN</span><Users /><h3>Become a volunteer</h3><p>Lend your time, skills, and energy to bring community initiatives to life.</p><b>Join our community ↗</b></Link>
            <Link href="/stories" className="involved-card"><span>03 / SHARE</span><Heart /><h3>Spread the word</h3><p>Help more people discover our mission and the change we can create together.</p><b>Share our mission ↗</b></Link>
          </div>
        </div>
      </section>

      <div className="container"><CtaBand /></div>
    </main>
  );
}
