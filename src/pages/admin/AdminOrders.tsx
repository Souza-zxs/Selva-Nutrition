import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatBRL } from "../../lib/currency";
import { supabase } from "../../lib/supabase";
import Icon from "../../components/Icon";
import { OrderStatusBadge } from "../../components/admin/StatusBadge";

type OrderRow = {
  id: string;
  status: string;
  subtotal: number;
  created_at: string;
  contact: { name?: string; email?: string } | null;
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("orders")
      .select("id, status, subtotal, created_at, contact")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders((data as OrderRow[]) ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse bg-surface-container-lowest" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="admin-panel flex flex-col items-center gap-4 px-8 py-20 text-center">
        <Icon name="receipt" className="text-4xl text-secondary opacity-60" />
        <p className="text-on-surface-variant">Nenhum pedido ainda.</p>
      </div>
    );
  }

  return (
    <div className="admin-panel overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-outline-variant/15 bg-surface-container/30 text-label-caps text-on-surface-variant uppercase">
            <th className="py-4 pr-4 pl-6">Pedido</th>
            <th className="py-4 pr-4">Cliente</th>
            <th className="py-4 pr-4">Data</th>
            <th className="py-4 pr-4">Total</th>
            <th className="py-4 pr-6">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="admin-row-hover border-b border-outline-variant/10 text-on-surface last:border-0"
            >
              <td className="py-3 pr-4 pl-6">
                <Link
                  to={`/admin/pedidos/${order.id}`}
                  className="text-on-surface hover:text-secondary hover:underline"
                >
                  #{order.id.slice(0, 8)}
                </Link>
              </td>
              <td className="py-3 pr-4">
                {order.contact?.name ?? order.contact?.email ?? "—"}
              </td>
              <td className="py-3 pr-4 text-on-surface-variant">
                {new Date(order.created_at).toLocaleDateString("pt-BR")}
              </td>
              <td className="py-3 pr-4">{formatBRL(order.subtotal)}</td>
              <td className="py-3 pr-6">
                <OrderStatusBadge status={order.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
