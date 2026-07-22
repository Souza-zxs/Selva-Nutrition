import type { ButtonHTMLAttributes } from "react";

type Variant = "filled" | "outline";

const VARIANTS: Record<Variant, string> = {
  filled:
    "relative overflow-hidden bg-secondary text-primary-container hover:shadow-[0_0_25px_rgba(201,162,39,0.35)] before:absolute before:inset-0 before:-translate-x-full before:bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,0.4)_50%,transparent_65%)] before:transition-transform before:duration-700 before:ease-out hover:before:translate-x-full",
  outline: "metallic-border text-secondary hover:bg-secondary/10",
};

/**
 * Same classes the <Button> component applies — exported separately for
 * <a>/<Link> elements that need identical styling but can't be a <button>.
 */
export function buttonClass(variant: Variant = "filled", className = "") {
  return `text-label-caps uppercase transition-all disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${className}`;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export default function Button({
  variant = "filled",
  className = "",
  ...props
}: ButtonProps) {
  return <button className={buttonClass(variant, className)} {...props} />;
}
