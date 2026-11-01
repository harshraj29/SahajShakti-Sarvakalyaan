import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
export const metadata: Metadata = { title: 'Sahajshakti Sarvakalyaan Trust | Empowering Futures', description: 'Igniting hope and transforming lives through education, healthcare and sustainable community development.' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body><Header />{children}<Footer /><ScrollReveal /><noscript><style>{'.reveal{opacity:1!important;transform:none!important}'}</style></noscript></body></html>; }
