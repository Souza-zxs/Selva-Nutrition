type ReviewStarsProps = {
  rating: number;
  size?: string;
  interactive?: boolean;
  onChange?: (rating: number) => void;
};

export default function ReviewStars({
  rating,
  size = "text-base",
  interactive = false,
  onChange,
}: ReviewStarsProps) {
  return (
    <div className={`flex items-center gap-0.5 ${size} leading-none`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          aria-label={interactive ? `Nota ${n}` : undefined}
          onClick={() => interactive && onChange?.(n)}
          className={`${interactive ? "cursor-pointer" : "cursor-default"} ${
            n <= Math.round(rating)
              ? "text-secondary"
              : "text-on-surface-variant/30"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
