import { FunctionsHttpError } from "@supabase/supabase-js";
import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatBRL } from "../lib/currency";
import { supabase } from "../lib/supabase";

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
  const { lines, subtotal, clear } = useCart();

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

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (lines.length === 0) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
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
              disabled={submitting}
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
                <span>{formatBRL(line.qty * line.product.price)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex justify-between border-t border-outline-variant/20 pt-6 text-body-lg text-on-surface">
            <span className="uppercase">Subtotal</span>
            <span className="text-secondary">{formatBRL(subtotal)}</span>
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
