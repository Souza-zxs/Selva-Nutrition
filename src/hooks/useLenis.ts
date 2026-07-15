import { useEffect, type MouseEvent } from "react";
import Lenis from "lenis";

let activeLenis: Lenis | null = null;

export function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
    });
    activeLenis = lenis;

    let frame: number;
    function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    }
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
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
