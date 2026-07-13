const ORDER_STATUS: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Aguardando pagamento",
    className: "border-secondary/40 text-secondary",
  },
  paid: {
    label: "Pago",
    className: "border-primary-fixed-dim/50 text-primary-fixed-dim",
  },
  shipped: {
    label: "Enviado",
    className: "border-on-surface-variant/40 text-on-surface-variant",
  },
  failed: {
    label: "Falhou",
    className: "border-error/50 text-error",
  },
  cancelled: {
    label: "Cancelado",
    className: "border-error/50 text-error",
  },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const entry = ORDER_STATUS[status] ?? {
    label: status,
    className: "border-outline-variant/40 text-on-surface-variant",
  };
  return (
    <span
      className={`inline-block rounded-full border px-3 py-1 text-[11px] tracking-wide uppercase ${entry.className}`}
    >
      {entry.label}
    </span>
  );
}

export function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <span className="inline-block rounded-full border border-error/50 px-3 py-1 text-[11px] tracking-wide text-error uppercase">
        Sem estoque
      </span>
    );
  }
  if (stock <= 10) {
    return (
      <span className="inline-block rounded-full border border-secondary/40 px-3 py-1 text-[11px] tracking-wide text-secondary uppercase">
        {stock} un.
      </span>
    );
  }
  return (
    <span className="inline-block rounded-full border border-on-surface-variant/30 px-3 py-1 text-[11px] tracking-wide text-on-surface-variant uppercase">
      {stock} un.
    </span>
  );
}
