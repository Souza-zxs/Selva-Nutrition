import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useShippingQuote } from "../hooks/useShippingQuote";
import { formatBRL } from "../lib/currency";
import { effectivePrice } from "../lib/pricing";
import { supabase } from "../lib/supabase";
import { resolveErrorMessage } from "../lib/supabaseErrors";
import { lookupCep } from "../lib/viacep";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

type AppliedCoupon = {
  code: string;
  discountAmount: number;
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
  const [cepLookupError, setCepLookupError] = useState<string | null>(null);

  const {
    quotes: shippingQuotes,
    selectedId: selectedShippingId,
    setSelectedId: setSelectedShippingId,
    selected: selectedShipping,
    loading: calculatingShipping,
    error: shippingError,
  } = useShippingQuote(zip, totalWeightKg, subtotal);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(
    null,
  );
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Autofill de endereço a partir do CEP (ViaCEP) — o cliente já digita o
  // CEP pra calcular o frete, então evitamos fazer ele digitar rua/bairro/
  // cidade/UF de novo na mão. Continua editável depois de preenchido.
  useEffect(() => {
    const digits = zip.replace(/\D/g, "");
    if (digits.length !== 8) {
      setCepLookupError(null);
      return;
    }

    let cancelled = false;
    lookupCep(digits).then((address) => {
      if (cancelled) return;
      if (!address) {
        setCepLookupError("CEP não encontrado, preencha o endereço manualmente.");
        return;
      }
      setCepLookupError(null);
      setStreet(address.street);
      setNeighborhood(address.neighborhood);
      setCity(address.city);
      setState(address.state);
    });

    return () => {
      cancelled = true;
    };
  }, [zip]);

  // Se o carrinho muda depois de aplicar o cupom, o desconto precisa ser
  // revalidado contra o novo subtotal — mais simples soltar o cupom aplicado
  // e deixar o cliente reaplicar do que arriscar mostrar um valor que o
  // servidor vai recusar no create-order.
  useEffect(() => {
    setAppliedCoupon(null);
  }, [subtotal]);

  if (lines.length === 0) {
    return <Navigate to="/" replace />;
  }

  // Silent draft save when the customer types their email but hasn't
  // finished checking out yet — powers the abandoned-cart recovery email.
  // Fire-and-forget: it must never affect the checkout flow itself.
  function captureAbandonedCart() {
    if (!isValidEmail(email) || lines.length === 0) return;
    supabase.functions
      .invoke("save-abandoned-cart", {
        body: {
          email,
          name: name || undefined,
          lines: lines.map((l) => ({ product_id: l.product.id, qty: l.qty })),
        },
      })
      .catch(() => {});
  }

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    setCouponError(null);

    const { data, error: invokeError } = await supabase.functions.invoke(
      "validate-coupon",
      { body: { code: couponInput.trim(), subtotal } },
    );

    setApplyingCoupon(false);
    if (invokeError || data?.error) {
      setAppliedCoupon(null);
      setCouponError(await resolveErrorMessage(data, invokeError));
      return;
    }

    setAppliedCoupon({ code: data.code, discountAmount: data.discount_amount });
    setCouponInput("");
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponError(null);
  }

  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const total = subtotal + (selectedShipping?.price ?? 0) - discountAmount;

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
          coupon_code: appliedCoupon?.code,
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
    <section className="min-h-screen bg-background px-margin-mobile pt-28 pb-20 md:px-margin-desktop md:pt-40 md:pb-32">
      <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-[1.4fr_1fr]">
        <div>
          <span className="mb-4 block text-label-caps tracking-widest text-secondary uppercase">
            Finalizar Compra
          </span>
          <h1 className="font-serif mb-10 text-headline-lg-mobile text-on-surface uppercase md:text-headline-lg">
            Endereço &amp; Contato
          </h1>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={captureAbandonedCart}
                required
              />
              <Input
                placeholder="Telefone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                placeholder="CEP"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                required
              />
              {cepLookupError && (
                <p className="mt-2 text-xs text-on-surface-variant">
                  {cepLookupError}
                </p>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
              <Input
                placeholder="Rua"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                required
              />
              <Input
                placeholder="Número"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
              />
            </div>
            <Input
              placeholder="Complemento (opcional)"
              value={complement}
              onChange={(e) => setComplement(e.target.value)}
            />
            <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
              <Input
                placeholder="Bairro"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                required
              />
              <Input
                placeholder="Cidade"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
              <Input
                placeholder="UF"
                maxLength={2}
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase())}
                required
              />
            </div>
            {error && <p className="text-sm text-error">{error}</p>}
            <Button
              type="submit"
              disabled={submitting || calculatingShipping || !selectedShipping}
              className="mt-2 py-4"
            >
              {submitting ? "Processando..." : "Ir para o pagamento"}
            </Button>
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

          <div className="mt-6 border-t border-outline-variant/20 pt-6">
            <span className="mb-3 block text-label-caps text-on-surface-variant uppercase">
              Cupom de desconto
            </span>
            {appliedCoupon ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-variant">
                  {appliedCoupon.code} aplicado
                </span>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-xs text-on-surface-variant/60 hover:text-error"
                >
                  Remover
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Código do cupom"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-grow"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon || !couponInput.trim()}
                  className="px-5"
                >
                  {applyingCoupon ? "..." : "Aplicar"}
                </Button>
              </div>
            )}
            {couponError && (
              <p className="mt-2 text-sm text-error">{couponError}</p>
            )}
          </div>

          {discountAmount > 0 && (
            <div className="mt-6 flex justify-between text-sm text-secondary">
              <span className="uppercase">Desconto ({appliedCoupon?.code})</span>
              <span>-{formatBRL(discountAmount)}</span>
            </div>
          )}

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


