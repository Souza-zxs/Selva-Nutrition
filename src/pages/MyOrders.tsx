import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatBRL } from "../lib/currency";
import { supabase } from "../lib/supabase";
import Icon from "../components/Icon";
import { OrderStatusBadge } from "../components/admin/StatusBadge";
import Button from "../components/ui/Button";

type OrderRow = {
  id: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  created_at: string;
};

export default function MyOrders() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("id, status, subtotal, shipping_cost, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders((data as OrderRow[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  if (!authLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <section className="min-h-screen bg-background px-margin-mobile pt-40 pb-32 md:px-margin-desktop">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="mb-4 block text-label-caps tracking-widest text-secondary uppercase">
              Minha Conta
            </span>
            <h1 className="font-serif text-headline-lg-mobile text-on-surface uppercase md:text-headline-lg">
              Meus Pedidos
            </h1>
            {user?.email && (
              <p className="mt-2 text-sm text-on-surface-variant">
                {user.email}
              </p>
            )}
          </div>
          <Button variant="outline" onClick={() => signOut()} className="px-6 py-3">
            Sair
          </Button>
        </div>

        {(authLoading || loading) && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse bg-surface-container-lowest" />
            ))}
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="metallic-border flex flex-col items-center gap-4 bg-surface-container-lowest px-8 py-20 text-center">
            <Icon name="receipt" className="text-4xl text-secondary opacity-60" />
            <p className="text-on-surface-variant">
              Você ainda não fez nenhum pedido.
            </p>
            <Link to="/" className="text-secondary hover:underline">
              Ir às compras
            </Link>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <ul className="metallic-border flex flex-col divide-y divide-outline-variant/10 bg-surface-container-lowest">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  to={`/pedido/${order.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 transition-colors hover:bg-surface-dim"
                >
                  <div>
                    <span className="block text-sm text-secondary">
                      Pedido #{order.id.slice(0, 8)}
                    </span>
                    <span className="block text-xs text-on-surface-variant">
                      {new Date(order.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <span className="text-sm text-on-surface">
                    {formatBRL(order.subtotal + order.shipping_cost)}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
