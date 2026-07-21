-- Fecha o ciclo de vida do pedido, que hoje termina em "shipped" sem nenhum
-- efeito colateral: sem código de rastreio, sem devolução de estoque quando
-- um pedido pago é cancelado/recusado depois do fato, e sem limpeza de
-- pedidos "pending" que nunca foram pagos (o cliente fecha a aba na tela do
-- Mercado Pago e o pedido fica pendurado pra sempre na fila do admin).

alter table public.orders
  add column tracking_code text;

-- Espelha decrement_stock (usado no webhook do MP), mas para o caso inverso:
-- devolver ao estoque todos os itens de um pedido de uma vez, chamado pelo
-- admin-update-order quando um pedido "paid" vira "cancelled"/"failed".
create function public.restock_order(p_order_id uuid)
returns void
language sql
security definer set search_path = public
as $$
  update public.products p
  set stock = p.stock + oi.qty
  from public.order_items oi
  where oi.order_id = p_order_id and oi.product_id = p.id;
$$;

-- 7 dias cobre até o meio de pagamento mais lento do Checkout Pro (boleto,
-- que pode levar ~3 dias úteis pra compensar). Isso só afeta a exibição do
-- pedido no admin: se o webhook do Mercado Pago confirmar o pagamento depois
-- do "cancelled" automático, ele ainda vira "paid" normalmente (a checagem
-- de idempotência do webhook é `status !== 'paid'`, não `status === 'pending'`).
create function public.expire_stale_pending_orders()
returns void
language sql
security definer set search_path = public
as $$
  update public.orders
  set status = 'cancelled'
  where status = 'pending'
    and created_at < now() - interval '7 days';
$$;

select cron.schedule(
  'expire-stale-pending-orders',
  '0 * * * *',
  $$ select public.expire_stale_pending_orders(); $$
);
