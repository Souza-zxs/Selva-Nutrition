import Icon from "./Icon";

type SectionDividerProps = {
  /** CSS custom property name of the section above, e.g. "--color-surface" */
  from: string;
  /** CSS custom property name of the section below */
  to: string;
};

/**
 * Marks the seam between two sections with a soft color blend instead of a
 * hard cut, plus a small gold flourish — the brand's signature accent — so
 * the transition reads as deliberate rather than accidental.
 */
export default function SectionDivider({ from, to }: SectionDividerProps) {
  return (
    <div
      aria-hidden="true"
      className="relative h-20 w-full md:h-28"
      style={{
        background: `linear-gradient(to bottom, var(${from}), var(${to}))`,
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center gap-4 px-margin-mobile">
        <span className="h-px w-16 bg-gradient-to-r from-transparent to-secondary/50 md:w-32" />
        <Icon name="leaf" className="shrink-0 text-base text-secondary/70" />
        <span className="h-px w-16 bg-gradient-to-l from-transparent to-secondary/50 md:w-32" />
      </div>
    </div>
  );
}
