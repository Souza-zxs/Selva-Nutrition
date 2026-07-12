-- Selva Nutrition — schema inicial: perfis, produtos, pedidos

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

-- Auto-cria profile no signup
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  tag text,
  name text not null,
  body text,
  price numeric(10, 2) not null check (price >= 0),
  image text,
  icon text,
  narrative text,
  specs text[],
  stock int not null default 0 check (stock >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "products_select_active" on public.products
  for select using (active or exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

create policy "products_admin_write" on public.products
  for all using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

-- ---------------------------------------------------------------------------
-- orders / order_items
-- ---------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'cancelled', 'shipped')),
  subtotal numeric(10, 2) not null,
  shipping_address jsonb not null,
  contact jsonb not null,
  mp_preference_id text,
  mp_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id),
  qty int not null check (qty > 0),
  unit_price numeric(10, 2) not null
);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "orders_select_own_or_admin" on public.orders
  for select using (
    auth.uid() = user_id or exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "orders_admin_update" on public.orders
  for update using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

create policy "order_items_select_own_or_admin" on public.order_items
  for select using (exists (
    select 1 from public.orders o
    where o.id = order_id
      and (o.user_id = auth.uid() or exists (
        select 1 from public.profiles where id = auth.uid() and role = 'admin'
      ))
  ));

-- orders/order_items INSERT is intentionally not allowed for anon/authenticated —
-- only the create-order Edge Function (service role) creates them, so price/stock
-- can't be spoofed from the client.
