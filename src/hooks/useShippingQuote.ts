import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { resolveErrorMessage } from "../lib/supabaseErrors";

export type ShippingQuote = {
  id: string;
  name: string;
  price: number;
  etaDays: number;
};

export function useShippingQuote(
  zip: string,
  weightKg: number,
  subtotal: number,
) {
  const [quotes, setQuotes] = useState<ShippingQuote[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const digits = zip.replace(/\D/g, "");
    if (digits.length !== 8) {
      setQuotes(null);
      setSelectedId(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const timeout = setTimeout(async () => {
      const { data, error: invokeError } = await supabase.functions.invoke(
        "calculate-shipping",
        { body: { cep: digits, weight_kg: weightKg, subtotal } },
      );
      if (cancelled) return;
      setLoading(false);

      if (invokeError || data?.error) {
        setQuotes(null);
        setSelectedId(null);
        setError(await resolveErrorMessage(data, invokeError));
        return;
      }

      setQuotes(data.quotes);
      setSelectedId((prev) =>
        data.quotes.some((q: ShippingQuote) => q.id === prev)
          ? prev
          : (data.quotes[0]?.id ?? null),
      );
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zip, weightKg, subtotal]);

  const selected = quotes?.find((q) => q.id === selectedId) ?? null;

  return { quotes, selectedId, setSelectedId, selected, loading, error };
}
