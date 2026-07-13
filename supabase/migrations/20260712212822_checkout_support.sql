-- Suporte ao fluxo de compra: guest orders visíveis por ID, e decremento
-- atômico de estoque usado pelo webhook do Mercado Pago.

drop policy "orders_select_own_or_admin" on public.orders;
create policy "orders_select_own_or_admin" on public.orders
  for select using (
    user_id is null -- guest order: o UUID do pedido funciona como token de acesso
    or auth.uid() = user_id
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

drop policy "order_items_select_own_or_admin" on public.order_items;
create policy "order_items_select_own_or_admin" on public.order_items
  for select using (exists (
    select 1 from public.orders o
    where o.id = order_id
      and (
        o.user_id is null
        or o.user_id = auth.uid()
        or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
      )
  ));

create function public.decrement_stock(p_product_id uuid, p_qty int)
returns void
language sql
security definer set search_path = public
as $$
  update public.products
  set stock = greatest(stock - p_qty, 0)
  where id = p_product_id;
$$;
