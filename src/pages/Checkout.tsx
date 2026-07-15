import { FunctionsHttpError } from "@supabase/supabase-js";
import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatBRL } from "../lib/currency";
import { effectivePrice } from "../lib/pricing";
import { supabase } from "../lib/supabase";

type ShippingQuote = {
  id: string;
  name: string;
  price: number;
  etaDays: number;
};

const inputClass =
  "carved-well border-none bg-surface-dim px-4 py-3 text-label-caps focus:ring-1 focus:ring-secondary/50";

async function resolveErrorMessage(
  data: { error?: string } | null,
  invokeError: unknown,
): Promise<string> {
  if (data?.error) return data.error;
  if (invokeError instanceof FunctionsHttpError) {
    try {
      const body = await invokeError.context.json();
      if (body?.error) return body.error as string;
    } catch {
      // fall through to the generic message below
    }
  }
  return invokeError instanceof Error
    ? invokeError.message
    : "Erro inesperado ao processar o pedido.";
}

export default function Checkout() {
  const { user } = useAuth();
  const { lines, subtotal, totalWeightKg, clear } = useCart();

  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  const [shippingQuotes, setShippingQuotes] = useState<ShippingQuote[] | null>(
    null,
  );
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(
    null,
  );
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const digits = zip.replace(/\D/g, "");
    if (digits.length !== 8) {
      setShippingQuotes(null);
      setSelectedShippingId(null);
      setShippingError(null);
      return;
    }

    let cancelled = false;
    setCalculatingShipping(true);
    setShippingError(null);

    const timeout = setTimeout(async () => {
      const { data, error: invokeError } = await supabase.functions.invoke(
        "calculate-shipping",
        { body: { cep: digits, weight_kg: totalWeightKg, subtotal } },
      );
      if (cancelled) return;
      setCalculatingShipping(false);

      if (invokeError || data?.error) {
        setShippingQuotes(null);
        setSelectedShippingId(null);
        setShippingError(await resolveErrorMessage(data, invokeError));
        return;
      }

      setShippingQuotes(data.quotes);
      setSelectedShippingId((prev) =>
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
  }, [zip, totalWeightKg, subtotal]);

  if (lines.length === 0) {
    return <Navigate to="/" replace />;
  }

  const selectedShipping =
    shippingQuotes?.find((q) => q.id === selectedShippingId) ?? null;
  const total = subtotal + (selectedShipping?.price ?? 0);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!selectedShipping) {
      setError("Informe um CEP válido e escolha uma opção de frete.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const { data, error: invokeError } = await supabase.functions.invoke(
      "create-order",
      {
        body: {
          lines: lines.map((l) => ({ product_id: l.product.id, qty: l.qty })),
          contact: { name, email, phone },
          shipping_address: {
            street,
            number,
            complement,
            neighborhood,
            city,
            state,
            zip,
          },
          shipping: { service_id: selectedShipping.id },
        },
      },
    );

    if (invokeError || data?.error) {
      setSubmitting(false);
      setError(await resolveErrorMessage(data, invokeError));
      return;
    }

    clear();
    const redirectUrl = data.initPoint ?? data.sandboxInitPoint;
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      window.location.href = `/pedido/${data.orderId}`;
    }
  }

  return (
    <section className="min-h-screen bg-background px-margin-mobile pt-40 pb-32 md:px-margin-desktop">
      <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-[1.4fr_1fr]">
        <div>
          <span className="mb-4 block text-label-caps tracking-widest text-secondary uppercase">
            Finalizar Compra
          </span>
          <h1 className="font-serif mb-10 text-headline-lg-mobile text-on-surface uppercase md:text-headline-lg">
            Endereço &amp; Contato
          </h1>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <input
              className={inputClass}
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div className="grid gap-4 md:grid-cols-2">
              <input
                className={inputClass}
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                className={inputClass}
                placeholder="Telefone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
              <input
                className={inputClass}
                placeholder="Rua"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                required
              />
              <input
                className={inputClass}
                placeholder="Número"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
              />
            </div>
            <input
              className={inputClass}
              placeholder="Complemento (opcional)"
              value={complement}
              onChange={(e) => setComplement(e.target.value)}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <input
                className={inputClass}
                placeholder="Bairro"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                required
              />
              <input
                className={inputClass}
                placeholder="CEP"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
              <input
                className={inputClass}
                placeholder="Cidade"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
              <input
                className={inputClass}
                placeholder="UF"
                maxLength={2}
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase())}
                required
              />
            </div>
            {error && <p className="text-sm text-error">{error}</p>}
            <button
              type="submit"
              disabled={submitting || calculatingShipping || !selectedShipping}
              className="mt-2 bg-secondary py-4 text-label-caps text-primary-container uppercase transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Processando..." : "Ir para o pagamento"}
            </button>
          </form>
        </div>

        <div className="h-fit bg-surface-container-lowest p-8">
          <h2 className="font-serif mb-6 text-xl text-on-surface uppercase">
            Seu Pedido
          </h2>
          <ul className="flex flex-col gap-4">
            {lines.map((line) => (
              <li
                key={line.product.id}
                className="flex justify-between text-sm text-on-surface-variant"
              >
                <span>
                  {line.qty}x {line.product.name}
                </span>
                <span>{formatBRL(line.qty * effectivePrice(line.product))}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex justify-between text-sm text-on-surface-variant">
            <span className="uppercase">Subtotal</span>
            <span>{formatBRL(subtotal)}</span>
          </div>

          <div className="mt-6 border-t border-outline-variant/20 pt-6">
            <span className="mb-3 block text-label-caps text-on-surface-variant uppercase">
              Frete
            </span>
            {zip.replace(/\D/g, "").length !== 8 && (
              <p className="text-sm text-on-surface-variant">
                Informe o CEP para calcular o frete.
              </p>
            )}
            {calculatingShipping && (
              <p className="text-sm text-on-surface-variant">
                Calculando frete...
              </p>
            )}
            {shippingError && (
              <p className="text-sm text-error">{shippingError}</p>
            )}
            {shippingQuotes && (
              <div className="flex flex-col gap-2">
                {shippingQuotes.map((quote) => (
                  <label
                    key={quote.id}
                    className={`carved-well flex cursor-pointer items-center justify-between gap-3 bg-surface-dim px-4 py-3 text-sm transition-colors ${
                      selectedShippingId === quote.id
                        ? "ring-1 ring-secondary/60"
                        : ""
                    }`}
                  >
                    <span className="flex items-center gap-2 text-on-surface-variant">
                      <input
                        type="radio"
                        name="shipping"
                        checked={selectedShippingId === quote.id}
                        onChange={() => setSelectedShippingId(quote.id)}
                      />
                      <span>
                        {quote.name}
                        <span className="block text-xs opacity-70">
                          até {quote.etaDays} dias úteis
                        </span>
                      </span>
                    </span>
                    <span className="text-secondary">
                      {quote.price === 0 ? "Grátis" : formatBRL(quote.price)}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-between border-t border-outline-variant/20 pt-6 text-body-lg text-on-surface">
            <span className="uppercase">Total</span>
            <span className="text-secondary">{formatBRL(total)}</span>
          </div>
          <Link
            to="/"
            className="mt-6 block text-center text-sm text-on-surface-variant hover:text-secondary"
          >
            Voltar à loja
          </Link>
        </div>
      </div>
    </section>
  );
}
