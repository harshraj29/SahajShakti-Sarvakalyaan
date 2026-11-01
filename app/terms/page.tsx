import { PageHero } from '@/components/Sections';

export const metadata = { title: 'Terms of Use | Sahajshakti Sarvakalyaan Trust' };

const sections: { heading: string; paragraphs?: string[]; bullets?: string[] }[] = [
  {
    heading: '1. Agreement to Terms',
    paragraphs: [
      'By accessing or using our website (sahajshaktisarvakalyaan.org), you agree to be bound by these Terms of Use ("Terms"). If you do not agree to these Terms, please do not use our website.'
    ]
  },
  {
    heading: '2. Use of Website',
    paragraphs: ['You may use our website for informational and non-commercial purposes only. You agree not to:'],
    bullets: [
      'Use the site for any illegal purpose.',
      'Attempt to gain unauthorized access to any part of the site.',
      'Interfere with the proper working of the site.',
      'Copy, reproduce, or distribute any content without our express written permission.'
    ]
  },
  {
    heading: '3. Intellectual Property',
    paragraphs: [
      'All content on this website, including text, graphics, logos, and images, is the property of Sahajshakti Sarvakalyaan Trust or its content suppliers and is protected by copyright and other intellectual property laws. You may not use our logo or other proprietary graphics without permission.'
    ]
  },
  {
    heading: '4. Donations',
    paragraphs: [
      'All donations made through our website are voluntary and non-refundable. We use a third-party payment processor (Razorpay) to handle all transactions securely. We are not responsible for any errors or issues caused by the payment processor.',
      'Sahajshakti Sarvakalyaan Trust is a registered trust, and donations may be eligible for tax deductions as per applicable laws. Please consult a tax professional for advice.'
    ]
  },
  {
    heading: '5. Links to Other Websites',
    paragraphs: [
      'Our website may contain links to third-party websites, such as our social media partners (Facebook, Instagram, etc.). We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party sites.'
    ]
  },
  {
    heading: '6. Disclaimer of Warranties',
    paragraphs: [
      'This website is provided on an "AS IS" and "AS AVAILABLE" basis. We make no representations or warranties of any kind, express or implied, as to the operation of this site or the information, content, or materials included on it.'
    ]
  },
  {
    heading: '7. Limitation of Liability',
    paragraphs: [
      'Sahajshakti Sarvakalyaan Trust, its directors, employees, or volunteers will not be liable for any damages of any kind arising from the use of this site, including, but not limited to, direct, indirect, incidental, punitive, and consequential damages.'
    ]
  },
  {
    heading: '8. Governing Law',
    paragraphs: [
      'These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions. You agree to submit to the exclusive jurisdiction of the courts located in Patna, Bihar, India to resolve any legal matter arising from these Terms.'
    ]
  },
  {
    heading: '9. Changes to These Terms',
    paragraphs: [
      'We reserve the right to modify these Terms at any time. We will post the revised Terms on this page. Your continued use of the website after any such changes constitutes your acceptance of the new Terms.'
    ]
  },
  {
    heading: '10. Contact Us',
    paragraphs: [
      'If you have any questions about these Terms, please contact us:',
      'By Email: sahajshakti7@gmail.com',
      'By Mail: China Kothi, Buddh Marg, Lodipur, Patna, Bihar 800001, India'
    ]
  }
];

export default function Terms() {
  return (
    <main>
      <PageHero eyebrow="Legal" title="Terms of Use" description="The terms that apply when you use this website or make a donation." image="/images/children_slide5.jpg" />
      <section className="container content-section legal-body">
        <p className="legal-updated">Last updated: 11 November 2025</p>
        {sections.map((section) => (
          <article key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs?.map((text) => <p key={text}>{text}</p>)}
            {section.bullets && (
              <ul>
                {section.bullets.map((item) => <li key={item}>{item}</li>)}
              </ul>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
