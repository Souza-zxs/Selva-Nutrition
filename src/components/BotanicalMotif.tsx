import { motion, useScroll, useTransform } from "framer-motion";
import { type RefObject, useMemo } from "react";

type BotanicalMotifProps = {
  className?: string;
  /** When provided, the motif drifts slower than the page while it scrolls past — a subtle parallax. */
  containerRef?: RefObject<HTMLElement | null>;
};

/**
 * The SELVA signature line — a single continuous botanical branch rendered in
 * thin gold strokes. Placeholder hand-drawn artwork standing in for the
 * client's real illustration asset; swap the <path> data below once supplied.
 */
export default function BotanicalMotif({
  className = "",
  containerRef,
}: BotanicalMotifProps) {
  const { scrollYProgress } = useScroll(
    containerRef
      ? { target: containerRef, offset: ["start start", "end start"] }
      : undefined,
  );
  const y = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const style = useMemo(
    () => (containerRef ? { y } : undefined),
    [containerRef, y],
  );

  return (
    <motion.svg
      style={style}
      viewBox="0 0 640 900"
      className={className}
      fill="none"
      stroke="var(--color-secondary)"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M60 30c120 90 90 220 170 300s60 250 190 330c70 44 120 96 150 170" />
      <path d="M230 330c-40-16-88-8-128 22" />
      <path d="M230 330c8-42-6-86-46-118" />
      <path d="M340 520c-42-6-86 10-114 46" />
      <path d="M340 520c22-36 22-82 2-124" />
      <path d="M430 690c-38 6-70 34-84 74" />
      <path d="M430 690c34-14 58-46 64-88" />
      <ellipse cx="98" cy="66" rx="34" ry="14" transform="rotate(48 98 66)" />
      <ellipse cx="146" cy="248" rx="30" ry="12" transform="rotate(-30 146 248)" />
      <ellipse cx="470" cy="560" rx="30" ry="12" transform="rotate(52 470 560)" />
      <ellipse cx="560" cy="760" rx="26" ry="11" transform="rotate(-24 560 760)" />
      <circle cx="558" cy="822" r="5" fill="var(--color-secondary)" stroke="none" />
    </motion.svg>
  );
}
