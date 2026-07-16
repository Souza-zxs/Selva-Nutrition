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
 *
 * Each root-hair cluster reveals itself at its own branch's finish time
 * (via data-reveal), rather than every hair on the page popping in together
 * at the very end — that reads as the root actually growing past each point.
 *
 * On top of the scroll-scrubbed growth, four free-running loops give the
 * motif a pulse of its own rather than a static decal: the growing tip
 * breathes, each hair cluster blooms in with a little spring overshoot
 * (via svgOrigin, anchored at data-origin), a slow shimmer drifts through
 * the shared gold gradient, and the whole root sways almost imperceptibly
 * like it's rooted in a light breeze.
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

      const hairGroups = svg.querySelectorAll<SVGGElement>("[data-hairs]");
      hairGroups.forEach((g) => {
        const [ox, oy] = (g.dataset.origin ?? "0 0").split(" ").map(Number);
        gsap.set(g, { opacity: 0, scale: 0.55, svgOrigin: `${ox} ${oy}` });
      });

      const tip = svg.querySelector<SVGCircleElement>("[data-tip]");
      const mainPath = drawPaths[0];
      const mainLength = mainPath?.getTotalLength() ?? 0;
      const mainEnd = Number(mainPath?.dataset.end ?? 0);
      if (tip) gsap.set(tip, { opacity: 0 });

      // Static blurred twin of the taproot — glow lives here instead of on the
      // scroll-scrubbed group. Its geometry never changes (no dash animation),
      // so the feGaussianBlur filter only costs a repaint once, during the
      // brief fade-in below, not on every scroll tick.
      const mainGlow = svg.querySelector<SVGPathElement>("[data-main-glow]");
      if (mainGlow) gsap.set(mainGlow, { opacity: 0 });

      // Free-running loops — independent of scroll, they give the motif a pulse of its own.
      // Created paused and only played while the motif is actually in view (see
      // ScrollTrigger below) so they don't burn CPU/GPU while scrolled past.
      const loopTweens: gsap.core.Tween[] = [];

      if (tip) {
        loopTweens.push(
          gsap.to(tip, {
            attr: { r: 8.5 },
            duration: 1.1,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            paused: true,
          }),
        );
      }

      const gradient = svg.querySelector<SVGLinearGradientElement>("#rootGradient");
      if (gradient) {
        loopTweens.push(
          gsap.to(gradient, {
            attr: { y1: "-0.3", y2: "0.7" },
            duration: 7,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            paused: true,
          }),
        );
      }

      loopTweens.push(
        gsap.to(svg, {
          rotation: 0.6,
          transformOrigin: "50% 0%",
          duration: 9,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          paused: true,
        }),
      );

      ScrollTrigger.create({
        trigger,
        start: "top bottom",
        end: "bottom top",
        onEnter: () => loopTweens.forEach((t) => t.play()),
        onEnterBack: () => loopTweens.forEach((t) => t.play()),
        onLeave: () => loopTweens.forEach((t) => t.pause()),
        onLeaveBack: () => loopTweens.forEach((t) => t.pause()),
      });

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

      hairGroups.forEach((g) => {
        const reveal = Number(g.dataset.reveal);
        tl.to(
          g,
          { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2.4)" },
          reveal,
        );
      });

      if (mainGlow) {
        tl.to(
          mainGlow,
          { opacity: 1, duration: 0.05, ease: "power1.out" },
          Math.max(0, mainEnd - 0.05),
        );
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
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="tipGlow" x="-300%" y="-300%" width="700%" height="700%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      {/* Static glow twin of the taproot, faded in once the line finishes
          drawing (see mainGlow tween above) — sits behind the crisp line
          below, which is why it comes first in the DOM. */}
      <path
        data-main-glow
        d="M150 0C400 150 750 350 850 620C950 850 300 950 130 1280C-40 1500 700 1650 870 1980C980 2200 250 2350 160 2680C90 2900 480 3150 520 3400"
        strokeWidth={3.6}
        filter="url(#rootGlow)"
      />

      {/* No filter on the group below on purpose: a feGaussianBlur across this
          whole scroll-scrubbed group forced a full repaint of its entire
          (huge) bounding box on every scroll tick. The static glow twin above
          and the small tip/root glows keep the effect where it's cheap. */}
      <g>
      {/* taproot — zigzags edge to edge down the full page */}
      <path
        data-draw
        data-start="0"
        data-end="0.82"
        d="M150 0C400 150 750 350 850 620C950 850 300 950 130 1280C-40 1500 700 1650 870 1980C980 2200 250 2350 160 2680C90 2900 480 3150 520 3400"
        strokeWidth={3.6}
      />

      {/* cluster A — around the first swing (right) */}
      <path
        data-draw
        data-start="0.12"
        data-end="0.28"
        d="M850 620C900 700 880 780 800 830"
        strokeWidth={2.1}
      />
      <path
        data-draw
        data-start="0.12"
        data-end="0.28"
        d="M850 620C780 560 700 520 650 460"
        strokeWidth={1.9}
      />
      <path
        data-draw
        data-start="0.22"
        data-end="0.34"
        d="M870 760C910 790 940 830 920 880"
        strokeWidth={1.35}
      />
      {/* tertiary fork off cluster A's first branch — a root branching off a root */}
      <path
        data-draw
        data-start="0.2"
        data-end="0.3"
        d="M874 736C912 754 934 786 918 822"
        strokeWidth={1.05}
      />

      {/* filler cluster E — fills the long quiet stretch between swing 1 and 2 */}
      <path
        data-draw
        data-start="0.23"
        data-end="0.35"
        d="M591 913C648 946 676 994 638 1044"
        strokeWidth={1.6}
      />
      <path
        data-draw
        data-start="0.23"
        data-end="0.35"
        d="M591 913C542 880 504 850 472 802"
        strokeWidth={1.35}
      />

      {/* cluster B — second swing (left) */}
      <path
        data-draw
        data-start="0.32"
        data-end="0.48"
        d="M130 1280C220 1320 280 1380 340 1340"
        strokeWidth={2.1}
      />
      <path
        data-draw
        data-start="0.32"
        data-end="0.48"
        d="M130 1280C90 1360 60 1440 100 1500"
        strokeWidth={1.9}
      />
      <path
        data-draw
        data-start="0.42"
        data-end="0.54"
        d="M260 1355C300 1330 340 1300 380 1250"
        strokeWidth={1.35}
      />
      {/* tertiary fork off cluster B's first branch */}
      <path
        data-draw
        data-start="0.38"
        data-end="0.48"
        d="M246 1340C280 1362 300 1396 276 1424"
        strokeWidth={1.05}
      />

      {/* cluster C — third swing (right) */}
      <path
        data-draw
        data-start="0.52"
        data-end="0.66"
        d="M870 1980C940 2010 970 2070 930 2130"
        strokeWidth={2.1}
      />
      <path
        data-draw
        data-start="0.52"
        data-end="0.66"
        d="M870 1980C800 1930 740 1900 690 1840"
        strokeWidth={1.9}
      />
      <path
        data-draw
        data-start="0.6"
        data-end="0.72"
        d="M955 2050C990 2080 1000 2130 970 2180"
        strokeWidth={1.35}
      />
      {/* tertiary fork off cluster C's first branch */}
      <path
        data-draw
        data-start="0.58"
        data-end="0.68"
        d="M941 2044C978 2062 1000 2096 978 2130"
        strokeWidth={1.05}
      />

      {/* filler cluster F — fills the quiet stretch between swing 3 and 4 */}
      <path
        data-draw
        data-start="0.56"
        data-end="0.68"
        d="M590 2289C647 2322 675 2370 637 2420"
        strokeWidth={1.6}
      />
      <path
        data-draw
        data-start="0.56"
        data-end="0.68"
        d="M590 2289C541 2256 503 2226 471 2178"
        strokeWidth={1.35}
      />

      {/* cluster D — fourth swing (left) */}
      <path
        data-draw
        data-start="0.68"
        data-end="0.8"
        d="M160 2680C240 2710 300 2760 350 2720"
        strokeWidth={2.1}
      />
      <path
        data-draw
        data-start="0.68"
        data-end="0.8"
        d="M160 2680C100 2750 70 2820 110 2880"
        strokeWidth={1.9}
      />
      <path
        data-draw
        data-start="0.74"
        data-end="0.84"
        d="M285 2740C330 2720 370 2690 400 2640"
        strokeWidth={1.35}
      />
      {/* tertiary fork off cluster D's first branch */}
      <path
        data-draw
        data-start="0.72"
        data-end="0.82"
        d="M266 2726C300 2748 322 2782 298 2810"
        strokeWidth={1.05}
      />

      {/* fine root hairs + gold buds, each cluster's group reveals itself right as
          that cluster finishes drawing — not all at once at the very end. */}
      <g data-hairs data-reveal="0.34" data-origin="820 760" strokeWidth={0.95}>
        <path d="M800 830 q10 3 16 10 M800 830 q-7 8 -4 20 M800 830 q13 -9 20 -4" />
        <path d="M650 460 q-9 -4 -14 -10 M650 460 q11 -13 16 -10 M650 460 q6 -14 4 -20" />
        <path d="M920 880 q10 2 16 8 M920 880 q6 12 4 20" />
        <path d="M918 822 q8 4 12 10 M918 822 q-6 8 -2 16" />
        <circle cx="918" cy="822" r="2" fill="var(--color-secondary)" stroke="none" />
        <circle cx="920" cy="880" r="1.6" fill="var(--color-secondary)" stroke="none" />
      </g>

      <g data-hairs data-reveal="0.35" data-origin="555 923" strokeWidth={0.95}>
        <path d="M638 1044 q10 3 14 10 M638 1044 q-6 9 -2 18" />
        <path d="M472 802 q-9 -3 -14 -8 M472 802 q10 -10 15 -6" />
        <circle cx="638" cy="1044" r="2" fill="var(--color-secondary)" stroke="none" />
        <circle cx="472" cy="802" r="1.6" fill="var(--color-secondary)" stroke="none" />
      </g>

      <g data-hairs data-reveal="0.54" data-origin="275 1380" strokeWidth={0.95}>
        <path d="M340 1340 q10 2 16 8 M340 1340 q6 12 4 20" />
        <path d="M100 1500 q-9 3 -14 10 M100 1500 q11 1 16 8" />
        <path d="M380 1250 q10 -2 16 -8 M380 1250 q6 -12 4 -20" />
        <path d="M276 1424 q9 2 14 9 M276 1424 q-4 10 2 18" />
        <circle cx="276" cy="1424" r="2" fill="var(--color-secondary)" stroke="none" />
        <circle cx="340" cy="1340" r="1.6" fill="var(--color-secondary)" stroke="none" />
      </g>

      <g data-hairs data-reveal="0.72" data-origin="890 2070" strokeWidth={0.95}>
        <path d="M930 2130 q10 2 16 8 M930 2130 q6 12 4 20" />
        <path d="M690 1840 q-10 -2 -16 -8 M690 1840 q-6 -12 -4 -20" />
        <path d="M970 2180 q10 2 16 8 M970 2180 q6 10 4 18" />
        <path d="M978 2130 q9 3 13 10 M978 2130 q-5 9 0 17" />
        <circle cx="978" cy="2130" r="2" fill="var(--color-secondary)" stroke="none" />
        <circle cx="930" cy="2130" r="1.6" fill="var(--color-secondary)" stroke="none" />
      </g>

      <g data-hairs data-reveal="0.68" data-origin="555 2300" strokeWidth={0.95}>
        <path d="M637 2420 q10 3 14 10 M637 2420 q-6 9 -2 18" />
        <path d="M471 2178 q-9 -3 -14 -8 M471 2178 q10 -10 15 -6" />
        <circle cx="637" cy="2420" r="2" fill="var(--color-secondary)" stroke="none" />
        <circle cx="471" cy="2178" r="1.6" fill="var(--color-secondary)" stroke="none" />
      </g>

      <g data-hairs data-reveal="0.84" data-origin="290 2760" strokeWidth={0.95}>
        <path d="M350 2720 q10 2 16 8 M350 2720 q6 12 4 20" />
        <path d="M110 2880 q-9 3 -14 10 M110 2880 q11 1 16 8" />
        <path d="M400 2640 q10 -2 16 -8 M400 2640 q6 -12 4 -20" />
        <path d="M298 2810 q9 3 13 10 M298 2810 q-5 9 -1 17" />
        <circle cx="298" cy="2810" r="2" fill="var(--color-secondary)" stroke="none" />
        <circle cx="350" cy="2720" r="1.6" fill="var(--color-secondary)" stroke="none" />
      </g>

      <g data-hairs data-reveal="0.82" data-origin="520 3400" strokeWidth={0.95}>
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
