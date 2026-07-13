import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatBRL } from "../../lib/currency";
import { supabase } from "../../lib/supabase";
import Icon from "../../components/Icon";
import { OrderStatusBadge } from "../../components/admin/StatusBadge";

type OrderItem = {
  qty: number;
  unit_price: number;
  products: { name: string; image?: string | null } | null;
};

type Order = {
  id: string;
  status: string;
  subtotal: number;
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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("orders")
      .select(
        "id, status, subtotal, created_at, shipping_address, contact, order_items(qty, unit_price, products(name, image))",
      )
      .eq("id", id)
      .single()
      .then(({ data }) => {
        const o = data as unknown as Order;
        setOrder(o);
        setStatus(o?.status ?? "");
        setLoading(false);
      });
  }, [id]);

  async function handleSave() {
    if (!id) return;
    setSaving(true);
    await supabase.from("orders").update({ status }).eq("id", id);
    setSaving(false);
    setSaved(true);
    setOrder((o) => (o ? { ...o, status } : o));
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
          <div className="flex justify-between border-t border-outline-variant/15 pt-4 text-body-lg text-on-surface">
            <span className="uppercase">Total</span>
            <span className="text-secondary">{formatBRL(order.subtotal)}</span>
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
            <button
              onClick={handleSave}
              disabled={saving || status === order.status}
              className="bg-secondary px-6 py-3 text-label-caps text-primary-container uppercase transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
            {saved && (
              <span className="text-xs text-secondary">Atualizado ✓</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
