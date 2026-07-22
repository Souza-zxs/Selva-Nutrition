type QtyStepperProps = {
  value: number;
  onChange: (qty: number) => void;
  min?: number;
  max?: number;
};

export default function QtyStepper({
  value,
  onChange,
  min = 1,
  max,
}: QtyStepperProps) {
  return (
    <div className="carved-well flex items-center gap-3 bg-surface-dim px-3 py-2">
      <button
        type="button"
        aria-label="Diminuir quantidade"
        className="text-on-surface-variant hover:text-secondary disabled:cursor-not-allowed disabled:opacity-30"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        −
      </button>
      <span className="w-6 text-center text-sm">{value}</span>
      <button
        type="button"
        aria-label="Aumentar quantidade"
        className="text-on-surface-variant hover:text-secondary disabled:cursor-not-allowed disabled:opacity-30"
        onClick={() => onChange(max != null ? Math.min(max, value + 1) : value + 1)}
        disabled={max != null && value >= max}
      >
        +
      </button>
    </div>
  );
}
