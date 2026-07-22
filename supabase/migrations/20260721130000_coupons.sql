-- Cupons de desconto. A tabela não tem policy de select pública — cupons só
-- são lidos e validados pela edge function validate-coupon (service role),
-- pra não expor a lista de códigos via API. Uso é contado só na confirmação
-- de pagamento (webhook do MP), o mesmo momento em que o estoque é
-- decrementado — pedido "pending" nunca chegou a consumir o cupom.

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value numeric(10, 2) not null check (discount_value > 0),
  min_subtotal numeric(10, 2) not null default 0 check (min_subtotal >= 0),
  active boolean not null default true,
  expires_at timestamptz,
  usage_limit int check (usage_limit is null or usage_limit > 0),
  used_count int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.coupons enable row level security;

create policy "coupons_admin_all" on public.coupons
  for all using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

alter table public.orders
  add column coupon_code text,
  add column discount_amount numeric(10, 2) not null default 0 check (discount_amount >= 0);

create function public.increment_coupon_usage(p_code text)
returns void
language sql
security definer set search_path = public
as $$
  update public.coupons
  set used_count = used_count + 1
  where code = p_code;
$$;
