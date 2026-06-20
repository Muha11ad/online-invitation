'use client';

import { useEffect } from 'react';

export function RevealObserver(): null {
  useEffect(() => {
    const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Hero entrance sequence
    const heroEls: (Element | null)[] = [
      document.querySelector('[data-hero="monogram"]'),
      document.querySelector('[data-hero="rule"]'),
      document.querySelector('[data-hero="eyebrow"]'),
      document.querySelector('[data-hero="names"]'),
      document.querySelector('[data-hero="meta"]'),
      document.querySelector('[data-hero="scroll-cue"]'),
    ];

    if (!noMotion) {
      heroEls.forEach((el) => el?.classList.add('hero-enter'));
      const delays = [80, 400, 500, 650, 820, 1100];
      heroEls.forEach((el, i) => {
        if (!el) return;
        setTimeout(() => el.classList.add('visible'), delays[i]);
      });
    }

    // Scroll reveals
    const reveals = document.querySelectorAll('.reveal');

    if (noMotion) {
      reveals.forEach((el) => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -48px 0px' },
    );

    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
