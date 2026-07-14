import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type RefObject, useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

type BotanicalMotifProps = {
  className?: string;
  /** When provided, the motif drifts slower than the page while it scrolls past — a subtle parallax. */
  containerRef?: RefObject<HTMLElement | null>;
};

/**
 * The SELVA signature line — a taproot zigzagging edge to edge down the
 * page, throwing off lateral roots that fork into their own sub-branches
 * and fine root hairs, rendered in thin gold strokes. Placeholder
 * hand-drawn artwork standing in for the client's real illustration asset;
 * swap the <path> data below once supplied.
 *
 * Driven by a GSAP ScrollTrigger-scrubbed timeline (stroke-dasharray, not
 * native CSS scroll-timeline — Safari still lacks support for that), so the
 * root tracks the scrollbar directly while it "grows downward" while reading.
 */
export default function BotanicalMotif({
  className = "",
  containerRef,
}: BotanicalMotifProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const trigger = containerRef?.current;
    if (!svg || !trigger) return;

    const ctx = gsap.context(() => {
      const drawPaths =
        svg.querySelectorAll<SVGPathElement>("[data-draw]");
      drawPaths.forEach((path) => {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      });

      const hairs = svg.querySelector<SVGGElement>("[data-hairs]");
      if (hairs) gsap.set(hairs, { opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger,
          start: "top bottom",
          end: "bottom 25%",
          scrub: 1,
        },
      });

      tl.to(svg, { y: -70, ease: "none" }, 0);

      drawPaths.forEach((path) => {
        const start = Number(path.dataset.start);
        const end = Number(path.dataset.end);
        tl.to(
          path,
          { strokeDashoffset: 0, duration: end - start, ease: "power1.in" },
          start,
        );
      });

      if (hairs) {
        tl.to(hairs, { opacity: 1, duration: 0.18, ease: "power1.in" }, 0.82);
      }
    }, svg);

    return () => ctx.revert();
  }, [containerRef]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 1000 3400"
      preserveAspectRatio="none"
      className={className}
      fill="none"
      stroke="var(--color-secondary)"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* taproot — zigzags edge to edge down the full page */}
      <path
        data-draw
        data-start="0"
        data-end="0.82"
        d="M150 0C400 150 750 350 850 620C950 850 300 950 130 1280C-40 1500 700 1650 870 1980C980 2200 250 2350 160 2680C90 2900 480 3150 520 3400"
        strokeWidth={2.6}
      />

      {/* cluster A — around the first swing (right) */}
      <path
        data-draw
        data-start="0.12"
        data-end="0.28"
        d="M850 620C900 700 880 780 800 830"
        strokeWidth={1.7}
      />
      <path
        data-draw
        data-start="0.12"
        data-end="0.28"
        d="M850 620C780 560 700 520 650 460"
        strokeWidth={1.5}
      />
      <path
        data-draw
        data-start="0.22"
        data-end="0.34"
        d="M870 760C910 790 940 830 920 880"
        strokeWidth={1.1}
      />

      {/* cluster B — second swing (left) */}
      <path
        data-draw
        data-start="0.32"
        data-end="0.48"
        d="M130 1280C220 1320 280 1380 340 1340"
        strokeWidth={1.7}
      />
      <path
        data-draw
        data-start="0.32"
        data-end="0.48"
        d="M130 1280C90 1360 60 1440 100 1500"
        strokeWidth={1.5}
      />
      <path
        data-draw
        data-start="0.42"
        data-end="0.54"
        d="M260 1355C300 1330 340 1300 380 1250"
        strokeWidth={1.1}
      />

      {/* cluster C — third swing (right) */}
      <path
        data-draw
        data-start="0.52"
        data-end="0.66"
        d="M870 1980C940 2010 970 2070 930 2130"
        strokeWidth={1.7}
      />
      <path
        data-draw
        data-start="0.52"
        data-end="0.66"
        d="M870 1980C800 1930 740 1900 690 1840"
        strokeWidth={1.5}
      />
      <path
        data-draw
        data-start="0.6"
        data-end="0.72"
        d="M955 2050C990 2080 1000 2130 970 2180"
        strokeWidth={1.1}
      />

      {/* cluster D — fourth swing (left) */}
      <path
        data-draw
        data-start="0.68"
        data-end="0.8"
        d="M160 2680C240 2710 300 2760 350 2720"
        strokeWidth={1.7}
      />
      <path
        data-draw
        data-start="0.68"
        data-end="0.8"
        d="M160 2680C100 2750 70 2820 110 2880"
        strokeWidth={1.5}
      />
      <path
        data-draw
        data-start="0.74"
        data-end="0.84"
        d="M285 2740C330 2720 370 2690 400 2640"
        strokeWidth={1.1}
      />

      {/* fine root hairs near every branch tip and the final root tip */}
      <g data-hairs strokeWidth={0.8}>
        <path d="M800 830 l16 10 M800 830 l-4 20 M800 830 l20 -4" />
        <path d="M650 460 l-14 -10 M650 460 l16 -10 M650 460 l4 -20" />
        <path d="M920 880 l16 8 M920 880 l4 20" />
        <path d="M340 1340 l16 8 M340 1340 l4 20" />
        <path d="M100 1500 l-14 10 M100 1500 l16 8" />
        <path d="M380 1250 l16 -8 M380 1250 l4 -20" />
        <path d="M930 2130 l16 8 M930 2130 l4 20" />
        <path d="M690 1840 l-16 -8 M690 1840 l-4 -20" />
        <path d="M970 2180 l16 8 M970 2180 l4 18" />
        <path d="M350 2720 l16 8 M350 2720 l4 20" />
        <path d="M110 2880 l-14 10 M110 2880 l16 8" />
        <path d="M400 2640 l16 -8 M400 2640 l4 -20" />
        <path d="M520 3400 l-10 16 M520 3400 l14 12 M520 3400 l-4 20 M520 3400 l18 8" />
        <circle cx="520" cy="3400" r="3.5" fill="var(--color-secondary)" stroke="none" />
      </g>
    </svg>
  );
}
