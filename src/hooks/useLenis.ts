import { useEffect, type MouseEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

let activeLenis: Lenis | null = null;

export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
    });
    activeLenis = lenis;

    // Drive Lenis off GSAP's own ticker (instead of a second, independent
    // rAF loop) and tell ScrollTrigger to re-measure on every Lenis tick —
    // otherwise the two scroll-driven systems drift out of phase and the
    // page stutters whenever a ScrollTrigger-scrubbed animation is active.
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      activeLenis = null;
    };
  }, []);
}

/**
 * Eases the page to an in-page anchor instead of the browser's instant jump.
 * Falls back to native smooth scroll if Lenis hasn't mounted yet.
 */
export function scrollToHash(hash: string) {
  const target = document.querySelector(hash);
  if (!target) return;

  if (activeLenis) {
    activeLenis.scrollTo(target as HTMLElement, {
      offset: -96,
      duration: 1.6,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
    });
  } else {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function handleAnchorNav(
  e: MouseEvent<HTMLAnchorElement>,
  href: string,
) {
  if (!href.startsWith("#") || href.length < 2) return;
  e.preventDefault();
  scrollToHash(href);
}
