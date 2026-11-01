import {PageHero,SectionHeading} from '@/components/Sections';
import {Heart,ShieldCheck,HandHeart} from 'lucide-react';

export const metadata = { title: 'Donate | Sahajshakti Sarvakalyaan Trust' };

const packages = [
  { amount: '₹18,000', months: '12 months' },
  { amount: '₹9,000', months: '6 months' },
  { amount: '₹6,000', months: '4 months' },
  { amount: '₹4,500', months: '3 months' },
  { amount: '₹3,000', months: '2 months' },
  { amount: '₹1,500', months: '1 month' }
];

const faqs = [
  { q: 'Is my donation tax-deductible?', a: 'Yes, your donation is tax-deductible to the extent allowed by law. You will receive a receipt.' },
  { q: 'How is my donation used?', a: 'Your donation directly supports our programmes in education, healthcare, and skill development, with 95% going to beneficiaries.' },
  { q: 'Can I donate monthly?', a: 'Yes. Choose a recurring donation package or contact us to set up monthly contributions.' }
];

export default function Donate(){
  return <main>
    <PageHero eyebrow="Make a difference" title="Empower change with your donation." description="Your contribution fuels our mission to provide education, healthcare, and sustainable livelihoods to underprivileged communities." image="/images/child8.jpg"/>

    <section className="container content-section">
      <SectionHeading eyebrow="Choose a donation package" title="Sponsor a child's education" description="Support a child's education with a plan that suits you."/>
      <div className="package-grid">{packages.map((plan)=><article className="package-card" key={plan.months}><b>{plan.amount}</b><span>Sponsor a child&apos;s education for</span><strong>{plan.months}</strong></article>)}</div>
    </section>

    <section className="soft-section"><div className="container donate-layout">
      <div>
        <span className="eyebrow">How your donation helps</span>
        <h2>Every rupee reaches <em>a person.</em></h2>
        <div className="donate-points">
          <span><Heart/> <b>Support education</b> — books, uniforms, and tuition for children in need.</span>
          <span><ShieldCheck/> <b>Fund healthcare</b> — medical camps and essential medicines.</span>
          <span><HandHeart/> <b>Enable skills</b> — vocational training for sustainable livelihoods.</span>
        </div>
      </div>
      <div className="donate-panel">
        <span className="eyebrow">Give today</span>
        <h3>Choose an amount</h3>
        <p>Pick one of the amounts below, or talk to us about sponsoring a child&apos;s education for a full year.</p>
        <div className="amount-grid"><button>₹500</button><button>₹1,000</button><button>₹2,000</button><button>₹18,000</button></div>
        <a className="button button-primary full-button" href="mailto:sahajshakti7@gmail.com?subject=Donation%20enquiry">Enquire about donating ↗</a>
        <small>Online card and UPI payments are being set up. Until then, write to <a href="mailto:sahajshakti7@gmail.com">sahajshakti7@gmail.com</a> or call <a href="tel:+918789198272">+91 87891 98272</a> to complete a donation and receive a receipt.</small>
      </div>
    </div></section>

    <section className="container content-section">
      <SectionHeading eyebrow="Questions" title="Frequently asked questions" description="Answers to common questions about donating."/>
      <div className="faq-list">{faqs.map((item)=><article className="faq-item" key={item.q}><h3>{item.q}</h3><p>{item.a}</p></article>)}</div>
    </section>
  </main>;
}
