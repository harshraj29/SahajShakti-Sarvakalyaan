'use client';

import { useEffect, useRef } from 'react';

type Props = {
  value: number;
  suffix?: string;
  duration?: number;
};

/**
 * Counts up to `value` the first time it scrolls into view.
 * The final value is rendered on the server, so the page is correct without JS.
 */
export default function Counter({ value, suffix = '', duration = 1600 }: Props) {
  const node = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = node.current;
    if (!element) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutCubic keeps the ramp feeling natural instead of linear.
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = `${Math.round(value * eased)}${suffix}`;
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        element.textContent = `0${suffix}`;
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, suffix, duration]);

  return (
    <span ref={node} className="counter-value">
      {value}
      {suffix}
    </span>
  );
}
