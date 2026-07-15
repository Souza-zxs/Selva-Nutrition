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

      const tip = svg.querySelector<SVGCircleElement>("[data-tip]");
      const mainPath = drawPaths[0];
      const mainLength = mainPath?.getTotalLength() ?? 0;
      if (tip) gsap.set(tip, { opacity: 0 });

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
        const isMain = path === mainPath;
        tl.to(
          path,
          {
            strokeDashoffset: 0,
            duration: end - start,
            ease: "power1.in",
            onUpdate: isMain
              ? () => {
                  if (!tip) return;
                  const offset = Number(
                    gsap.getProperty(mainPath, "strokeDashoffset"),
                  );
                  const drawn = mainLength - offset;
                  if (drawn <= 0 || drawn >= mainLength - 1) {
                    gsap.set(tip, { opacity: 0 });
                    return;
                  }
                  const point = mainPath.getPointAtLength(drawn);
                  gsap.set(tip, {
                    opacity: 1,
                    attr: { cx: point.x, cy: point.y },
                  });
                }
              : undefined,
          },
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
      stroke="url(#rootGradient)"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="rootGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e9c176" />
          <stop offset="45%" stopColor="var(--color-secondary)" />
          <stop offset="100%" stopColor="#8a6a1a" />
        </linearGradient>
        <filter id="rootGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="tipGlow" x="-300%" y="-300%" width="700%" height="700%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      <g filter="url(#rootGlow)">
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

      {/* fine root hairs near every branch tip — soft curved tendrils rather than rigid ticks */}
      <g data-hairs strokeWidth={0.8}>
        <path d="M800 830 q10 3 16 10 M800 830 q-7 8 -4 20 M800 830 q13 -9 20 -4" />
        <path d="M650 460 q-9 -4 -14 -10 M650 460 q11 -13 16 -10 M650 460 q6 -14 4 -20" />
        <path d="M920 880 q10 2 16 8 M920 880 q6 12 4 20" />
        <path d="M340 1340 q10 2 16 8 M340 1340 q6 12 4 20" />
        <path d="M100 1500 q-9 3 -14 10 M100 1500 q11 1 16 8" />
        <path d="M380 1250 q10 -2 16 -8 M380 1250 q6 -12 4 -20" />
        <path d="M930 2130 q10 2 16 8 M930 2130 q6 12 4 20" />
        <path d="M690 1840 q-10 -2 -16 -8 M690 1840 q-6 -12 -4 -20" />
        <path d="M970 2180 q10 2 16 8 M970 2180 q6 10 4 18" />
        <path d="M350 2720 q10 2 16 8 M350 2720 q6 12 4 20" />
        <path d="M110 2880 q-9 3 -14 10 M110 2880 q11 1 16 8" />
        <path d="M400 2640 q10 -2 16 -8 M400 2640 q6 -12 4 -20" />
        <path d="M520 3400 q-7 9 -10 16 M520 3400 q9 5 14 12 M520 3400 q-2 12 -4 20 M520 3400 q11 2 18 8" />
      </g>
      </g>

      <circle
        cx="520"
        cy="3400"
        r="4"
        fill="var(--color-secondary)"
        stroke="none"
        filter="url(#rootGlow)"
      />
      <circle
        data-tip
        r="6"
        fill="var(--color-secondary)"
        stroke="none"
        filter="url(#tipGlow)"
      />
    </svg>
  );
}
