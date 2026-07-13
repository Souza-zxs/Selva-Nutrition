type IconProps = {
  name: string;
  className?: string;
};

const SHARED = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/**
 * Hand-drawn thin-line icon set — deliberately not a system icon font.
 * Every glyph shares the same stroke weight/cap style as the botanical
 * signature motif so icons read as part of the same brand language.
 */
const PATHS: Record<string, React.ReactNode> = {
  verified: (
    <>
      <path d="M12 3.5c1.4 1.4 3 1.9 5 1.9 0 6.6-1.8 10.4-5 13.1-3.2-2.7-5-6.5-5-13.1 2 0 3.6-.5 5-1.9Z" />
      <path d="M8.7 12.2l2.2 2.2 4.4-4.6" />
    </>
  ),
  bolt: <path d="M13 2 5.5 14h5.2L10 22l8.5-12.4h-5.3z" />,
  dangerous: (
    <>
      <path d="M12 3 2.5 20h19L12 3Z" />
      <path d="M12 10v4.2" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  shield_heart: (
    <>
      <path d="M12 3.4 5 6v5.4c0 4.6 2.9 8.1 7 9.6 4.1-1.5 7-5 7-9.6V6l-7-2.6Z" />
      <path d="M12 15.5c-2.6-1.5-4-3-4-4.7a2 2 0 0 1 3.6-1.2 2 2 0 0 1 3.6 1.2c0 1.7-1.4 3.2-3.2 4.7Z" />
    </>
  ),
  check_circle: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M8.5 12.3l2.3 2.3 4.7-4.9" />
    </>
  ),
  expand_more: <path d="M5 9l7 7 7-7" />,
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </>
  ),
  shopping_bag: (
    <>
      <path d="M7 8h10l1 12.5H6L7 8Z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </>
  ),
  groups: (
    <>
      <circle cx="8.5" cy="9" r="2.6" />
      <circle cx="15.7" cy="9" r="2.6" />
      <path d="M3.5 19c.6-3 2.6-4.6 5-4.6s4.4 1.6 5 4.6" />
      <path d="M12.5 14.5c2.2.2 3.9 1.8 4.4 4.5" />
    </>
  ),
  menu_book: (
    <>
      <path d="M12 6.2c-1.7-1-3.9-1.4-6.5-1.2v12.4c2.6-.2 4.8.2 6.5 1.2 1.7-1 3.9-1.4 6.5-1.2V5c-2.6-.2-4.8.2-6.5 1.2Z" />
      <path d="M12 6.2v12.4" />
    </>
  ),
  science: (
    <>
      <path d="M10 3.5h4" />
      <path d="M10.8 3.5v6.2L6.3 18a2 2 0 0 0 1.8 2.9h7.8a2 2 0 0 0 1.8-2.9l-4.5-8.3V3.5" />
      <path d="M8.3 15.5h7.4" />
    </>
  ),
  arrow_outward: (
    <>
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </>
  ),
  public: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M3.8 12h16.4" />
      <path d="M12 3.8c2.2 2.2 3.4 5 3.4 8.2s-1.2 6-3.4 8.2c-2.2-2.2-3.4-5-3.4-8.2s1.2-6 3.4-8.2Z" />
    </>
  ),
  podcasts: (
    <>
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <path d="M9 9.2a4 4 0 0 0 0 5.6" />
      <path d="M15 9.2a4 4 0 0 1 0 5.6" />
      <path d="M6.2 6.4a8 8 0 0 0 0 11.2" />
      <path d="M17.8 6.4a8 8 0 0 1 0 11.2" />
    </>
  ),
  spa: (
    <path d="M12 21c-4.5-1-7-4.6-7-9.4C5 7 7.4 4 12 3c4.6 1 7 4 7 8.6 0 4.8-2.5 8.4-7 9.4Zm0 0V9M12 9c0-3-1.6-5-4-6M12 9c0-3 1.6-5 4-6" />
  ),
  person: (
    <>
      <circle cx="12" cy="8.2" r="3.4" />
      <path d="M4.8 20c.9-4 3.6-6 7.2-6s6.3 2 7.2 6" />
    </>
  ),
  history_edu: (
    <>
      <path d="M6 4.5h9.5L19 8v11.5H6V4.5Z" />
      <path d="M15 4.5V8h4" />
      <path d="M9 12.5c1.8-1.4 3.6-1.4 6 0" />
      <path d="M9 15.5c1.8-1.4 3.6-1.4 6 0" />
    </>
  ),
};

export default function Icon({ name, className = "" }: IconProps) {
  const glyph = PATHS[name];

  return (
    <svg
      viewBox="0 0 24 24"
      className={`inline-block h-[1em] w-[1em] align-[-0.15em] ${className}`}
      {...SHARED}
    >
      {glyph ?? <circle cx="12" cy="12" r="8" />}
    </svg>
  );
}
