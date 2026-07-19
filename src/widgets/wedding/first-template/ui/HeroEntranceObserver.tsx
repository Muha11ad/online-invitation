"use client";
import { useEffect } from "react";

export function HeroEntranceObserver(): null {
  useEffect(() => {
    const noMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (noMotion) return;
    const heroEls: (Element | null)[] = [
      document.querySelector('[data-hero="wreath"]'),
      document.querySelector('[data-hero="names"]'),
      document.querySelector('[data-hero="date"]'),
      document.querySelector('[data-hero="scroll-cue"]'),
    ];
    heroEls.forEach((el) => el?.classList.add("hero-enter"));
    const delays = [80, 450, 700, 950];
    heroEls.forEach((el, i) => {
      if (!el) return;
      setTimeout(() => el.classList.add("visible"), delays[i]);
    });
  }, []);
  return null;
}
