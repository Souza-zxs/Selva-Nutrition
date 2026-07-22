import { useState } from "react";
import { useShippingQuote } from "../hooks/useShippingQuote";
import { formatBRL } from "../lib/currency";
import Input from "./ui/Input";

type ShippingEstimateProps = {
  weightKg: number;
  subtotal: number;
};

export default function ShippingEstimate({
  weightKg,
  subtotal,
}: ShippingEstimateProps) {
  const [zip, setZip] = useState("");
  const { quotes, loading, error } = useShippingQuote(zip, weightKg, subtotal);

  return (
    <div className="carved-well bg-surface-dim p-5">
      <span className="mb-3 block text-label-caps text-on-surface-variant uppercase">
        Calcular frete e prazo
      </span>
      <Input
        placeholder="Digite seu CEP"
        value={zip}
        onChange={(e) => setZip(e.target.value)}
        maxLength={9}
        className="w-full max-w-[220px]"
      />
      {loading && (
        <p className="mt-3 text-sm text-on-surface-variant">Calculando...</p>
      )}
      {error && <p className="mt-3 text-sm text-error">{error}</p>}
      {quotes && (
        <ul className="mt-4 flex flex-col gap-2">
          {quotes.map((q) => (
            <li
              key={q.id}
              className="flex justify-between gap-4 text-sm text-on-surface-variant"
            >
              <span>
                {q.name}{" "}
                <span className="opacity-70">— até {q.etaDays} dias úteis</span>
              </span>
              <span className="shrink-0 text-secondary">
                {q.price === 0 ? "Grátis" : formatBRL(q.price)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
