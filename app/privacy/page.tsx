import { PageHero } from '@/components/Sections';

export const metadata = { title: 'Privacy Policy | Sahajshakti Sarvakalyaan Trust' };

const sections: { heading: string; paragraphs?: string[]; bullets?: string[] }[] = [
  {
    heading: '1. Introduction',
    paragraphs: [
      'Welcome to Sahajshakti Sarvakalyaan Trust. We are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you visit our website (sahajshaktisarvakalyaan.org) or make a donation.'
    ]
  },
  {
    heading: '2. Information We Collect',
    paragraphs: ['We may collect personal information that you voluntarily provide to us:'],
    bullets: [
      'Contact Information: When you use our contact form, we collect your name and email address.',
      'Donation Information: When you make a donation, we collect your full name, email address, phone number, country, and optionally your address. This information is required to process your donation and issue receipts.',
      'Newsletter Subscription: We collect your email address if you subscribe to our newsletter.',
      'Payment Information: We do not collect or store your credit card, debit card, or other payment details. All payments are processed securely through our third-party payment gateway, Razorpay. We recommend you read their privacy policy.'
    ]
  },
  {
    heading: '3. How We Use Your Information',
    paragraphs: ['We use the information we collect for the following purposes:'],
    bullets: [
      'To process and record your donations.',
      'To respond to your inquiries and requests.',
      'To send you newsletters and updates (if you opt-in).',
      'To send you receipts and tax-exemption certificates (if applicable).',
      'To maintain our internal records.',
      'To improve our website and services.'
    ]
  },
  {
    heading: '4. How We Share Your Information',
    paragraphs: [
      'We do not sell, trade, or rent your personal information to others. We may share your information only in the following limited circumstances:'
    ],
    bullets: [
      'Payment Processors: With third-party payment gateways (like Razorpay) to securely process your donations.',
      'Legal Requirements: If required by law, court order, or government regulation.'
    ]
  },
  {
    heading: '5. Data Security',
    paragraphs: [
      'We use reasonable administrative, technical, and physical security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.'
    ]
  },
  {
    heading: '6. Cookies and Third-Party Links',
    paragraphs: [
      'Our website may use cookies to enhance user experience. Our site also contains links to other websites, such as our social media pages (Facebook, Instagram, etc.). We are not responsible for the privacy practices of these other sites.'
    ]
  },
  {
    heading: '7. Your Rights',
    paragraphs: [
      'You have the right to request access to, correction of, or deletion of your personal data. To do so, please contact us using the information below.'
    ]
  },
  {
    heading: '8. Changes to This Policy',
    paragraphs: [
      'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page. We encourage you to review this page periodically.'
    ]
  },
  {
    heading: '9. Contact Us',
    paragraphs: [
      'If you have any questions about this Privacy Policy, please contact us:',
      'By Email: sahajshakti7@gmail.com',
      'By Mail: China Kothi, Buddh Marg, Lodipur, Patna, Bihar 800001, India'
    ]
  }
];

export default function Privacy() {
  return (
    <main>
      <PageHero eyebrow="Legal" title="Privacy Policy" description="How we collect, use, and safeguard the information you share with us." image="/images/children_slide2.jpg" />
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
