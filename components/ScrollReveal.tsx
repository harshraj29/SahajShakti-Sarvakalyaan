'use client';

import { useEffect, useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Sections and cards that fade/slide in as they enter the viewport.
 * Kept dependency-free so the bundle stays small; the markup stays server-rendered.
 */
const SELECTOR = [
  '.section-heading',
  '.program-card',
  '.purpose-grid article',
  '.impact-cards article',
  '.involved-card',
  '.gallery-item',
  '.moment',
  '.package-card',
  '.faq-item',
  '.contact-method',
  '.contact-form',
  '.donate-panel',
  '.story-placeholder',
  '.legal-body article',
  '.intro-copy',
  '.intro-visual',
  '.women-copy',
  '.women-images',
  '.two-col > div',
  '.wide-image',
  '.cta-band'
].join(',');

export default function ScrollReveal() {
  const pathname = usePathname();

  useIsomorphicLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
    if (nodes.length === 0) return;

    nodes.forEach((node) => node.classList.add('reveal'));

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    nodes.forEach((node, index) => {
      // Stagger items that sit side by side, then reveal the rest normally.
      node.style.transitionDelay = `${(index % 3) * 90}ms`;
      observer.observe(node);
    });

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
