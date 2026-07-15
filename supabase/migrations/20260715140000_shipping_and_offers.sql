-- Frete (calculadora própria por CEP + peso do produto) e oferta/promoção.

alter table public.products
  add column weight_kg numeric(6, 3) not null default 0.3 check (weight_kg > 0),
  add column is_featured boolean not null default false,
  add column sale_price numeric(10, 2) check (sale_price is null or sale_price >= 0);

alter table public.products
  add constraint sale_price_below_price check (sale_price is null or sale_price < price);

alter table public.orders
  add column shipping_cost numeric(10, 2) not null default 0 check (shipping_cost >= 0),
  add column shipping_service text;
