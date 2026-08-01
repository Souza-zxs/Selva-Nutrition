import type { InputHTMLAttributes } from "react";

export default function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`carved-well w-full border-none bg-surface-dim px-4 py-3 text-label-caps focus:ring-1 focus:ring-secondary/50 ${className}`}
      {...props}
    />
  );
}
