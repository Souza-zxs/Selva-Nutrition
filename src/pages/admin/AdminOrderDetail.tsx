import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatBRL } from "../../lib/currency";
import { supabase } from "../../lib/supabase";
import { resolveErrorMessage } from "../../lib/supabaseErrors";
import Icon from "../../components/Icon";
import { OrderStatusBadge } from "../../components/admin/StatusBadge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

type OrderItem = {
  qty: number;
  unit_price: number;
  products: { name: string; image?: string | null } | null;
};

type Order = {
  id: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  shipping_service: string | null;
  coupon_code: string | null;
  discount_amount: number;
  tracking_code: string | null;
  created_at: string;
  shipping_address: Record<string, string>;
  contact: { name?: string; email?: string; phone?: string };
  order_items: OrderItem[];
};

const STATUSES = ["pending", "paid", "failed", "cancelled", "shipped"];
const STATUS_LABEL: Record<string, string> = {
  pending: "Aguardando pagamento",
  paid: "Pago",
  failed: "Falhou",
  cancelled: "Cancelado",
  shipped: "Enviado",
};

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("orders")
      .select(
        "id, status, subtotal, shipping_cost, shipping_service, coupon_code, discount_amount, tracking_code, created_at, shipping_address, contact, order_items(qty, unit_price, products(name, image))",
      )
      .eq("id", id)
      .single()
      .then(({ data }) => {
        const o = data as unknown as Order;
        setOrder(o);
        setStatus(o?.status ?? "");
        setTrackingCode(o?.tracking_code ?? "");
        setLoading(false);
      });
  }, [id]);

  async function handleSave() {
    if (!id) return;
    setSaving(true);
    setError(null);
    const { data, error: invokeError } = await supabase.functions.invoke(
      "admin-update-order",
      { body: { orderId: id, status, tracking_code: trackingCode || null } },
    );
    setSaving(false);

    if (invokeError || data?.error) {
      setError(await resolveErrorMessage(data, invokeError));
      return;
    }

    setSaved(true);
    setOrder((o) => (o ? { ...o, status, tracking_code: trackingCode || null } : o));
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <p className="text-on-surface-variant">Carregando...</p>;
  if (!order) return <p className="text-error">Pedido não encontrado.</p>;

  const addr = order.shipping_address;

  return (
    <div className="max-w-4xl">
      <Link
        to="/admin/pedidos"
        className="mb-8 inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-secondary"
      >
        <Icon name="arrow_back" /> Voltar aos pedidos
      </Link>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-label-caps text-on-surface-variant uppercase">
            Pedido
          </span>
          <h2 className="font-serif text-xl text-on-surface">
            #{order.id.slice(0, 8)}
          </h2>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="metallic-border bg-surface-container-lowest p-6">
          <h3 className="font-serif mb-5 text-lg text-on-surface uppercase">
            Itens
          </h3>
          <ul className="mb-5 flex flex-col gap-4">
            {order.order_items.map((item, index) => (
              <li key={index} className="flex items-center gap-4 text-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden bg-on-surface">
                  {item.products?.image ? (
                    <img
                      src={item.products.image}
                      alt=""
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Icon
                      name="spa"
                      className="text-lg text-primary-container opacity-40"
                    />
                  )}
                </div>
                <span className="flex-1 text-on-surface-variant">
                  {item.qty}x {item.products?.name ?? "Produto"}
                </span>
                <span className="text-on-surface">
                  {formatBRL(item.qty * item.unit_price)}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between pt-4 text-sm text-on-surface-variant">
            <span className="uppercase">Subtotal</span>
            <span>{formatBRL(order.subtotal)}</span>
          </div>
          <div className="mb-2 flex justify-between text-sm text-on-surface-variant">
            <span className="uppercase">
              Frete{order.shipping_service ? ` (${order.shipping_service})` : ""}
            </span>
            <span>
              {order.shipping_cost === 0
                ? "Grátis"
                : formatBRL(order.shipping_cost)}
            </span>
          </div>
          {order.discount_amount > 0 && (
            <div className="mb-4 flex justify-between text-sm text-secondary">
              <span className="uppercase">
                Desconto{order.coupon_code ? ` (${order.coupon_code})` : ""}
              </span>
              <span>-{formatBRL(order.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-outline-variant/15 pt-4 text-body-lg text-on-surface">
            <span className="uppercase">Total</span>
            <span className="text-secondary">
              {formatBRL(
                order.subtotal + order.shipping_cost - order.discount_amount,
              )}
            </span>
          </div>

          <h3 className="font-serif mt-8 mb-3 text-lg text-on-surface uppercase">
            Cliente
          </h3>
          <p className="text-sm text-on-surface-variant">
            {order.contact?.name}
            <br />
            {order.contact?.email} · {order.contact?.phone}
          </p>
        </div>

        <div className="metallic-border bg-surface-container-lowest p-6">
          <h3 className="font-serif mb-5 text-lg text-on-surface uppercase">
            Endereço de entrega
          </h3>
          <p className="mb-8 text-sm text-on-surface-variant">
            {addr?.street}, {addr?.number} {addr?.complement}
            <br />
            {addr?.neighborhood} — {addr?.city}/{addr?.state}
            <br />
            CEP {addr?.zip}
          </p>

          <h3 className="font-serif mb-3 text-lg text-on-surface uppercase">
            Atualizar status
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="carved-well border-none bg-surface-dim px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-secondary/50"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
            <Input
              placeholder="Código de rastreio (opcional)"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              className="min-w-[220px] flex-1"
            />
            <Button
              onClick={handleSave}
              disabled={
                saving ||
                (status === order.status &&
                  trackingCode === (order.tracking_code ?? ""))
              }
              className="px-6 py-3"
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
            {saved && (
              <span className="text-xs text-secondary">Atualizado ✓</span>
            )}
          </div>
          {error && <p className="mt-3 text-sm text-error">{error}</p>}
          <p className="mt-4 text-xs text-on-surface-variant">
            Mudar o status para "Enviado" envia um e-mail ao cliente com o
            código de rastreio. Cancelar ou recusar um pedido já pago devolve
            o estoque automaticamente e avisa o cliente por e-mail.
          </p>
        </div>
      </div>
    </div>
  );
}
