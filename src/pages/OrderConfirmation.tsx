import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatBRL } from "../lib/currency";
import { supabase } from "../lib/supabase";

type OrderItem = {
  qty: number;
  unit_price: number;
  products: { name: string } | null;
};

type Order = {
  id: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  shipping_service: string | null;
  created_at: string;
  order_items: OrderItem[];
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Aguardando pagamento",
  paid: "Pagamento confirmado",
  failed: "Pagamento recusado",
  cancelled: "Cancelado",
  shipped: "Enviado",
};

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function load() {
      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, status, subtotal, shipping_cost, shipping_service, created_at, order_items(qty, unit_price, products(name))",
        )
        .eq("id", id)
        .single();

      if (cancelled) return;
      if (error) setError(error.message);
      else setOrder(data as unknown as Order);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <section className="min-h-screen bg-background px-margin-mobile pt-40 pb-32 md:px-margin-desktop">
      <div className="mx-auto max-w-xl text-center">
        {loading && (
          <p className="text-on-surface-variant">Carregando pedido...</p>
        )}
        {!loading && (error || !order) && (
          <p className="text-error">Pedido não encontrado.</p>
        )}
        {order && (
          <>
            <span className="mb-4 block text-label-caps tracking-widest text-secondary uppercase">
              Pedido #{order.id.slice(0, 8)}
            </span>
            <h1 className="font-serif mb-6 text-headline-lg-mobile text-on-surface uppercase md:text-headline-lg">
              {STATUS_LABEL[order.status] ?? order.status}
            </h1>
            <ul className="mb-8 flex flex-col gap-3 text-left">
              {order.order_items.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between text-sm text-on-surface-variant"
                >
                  <span>
                    {item.qty}x {item.products?.name ?? "Produto"}
                  </span>
                  <span>{formatBRL(item.qty * item.unit_price)}</span>
                </li>
              ))}
            </ul>
            <div className="mb-3 flex justify-between text-sm text-on-surface-variant">
              <span className="uppercase">Subtotal</span>
              <span>{formatBRL(order.subtotal)}</span>
            </div>
            <div className="mb-6 flex justify-between text-sm text-on-surface-variant">
              <span className="uppercase">
                Frete{order.shipping_service ? ` (${order.shipping_service})` : ""}
              </span>
              <span>
                {order.shipping_cost === 0
                  ? "Grátis"
                  : formatBRL(order.shipping_cost)}
              </span>
            </div>
            <div className="mb-10 flex justify-between border-t border-outline-variant/20 pt-6 text-body-lg text-on-surface">
              <span className="uppercase">Total</span>
              <span className="text-secondary">
                {formatBRL(order.subtotal + order.shipping_cost)}
              </span>
            </div>
          </>
        )}
        <Link
          to="/"
          className="inline-block bg-secondary px-10 py-4 text-label-caps text-primary-container uppercase transition-all hover:brightness-110"
        >
          Voltar à loja
        </Link>
      </div>
    </section>
  );
}
