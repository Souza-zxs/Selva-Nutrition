-- Avaliações de produto: prova social pública, com moderação simples.
-- Qualquer visitante pode enviar uma avaliação, mas ela nasce não aprovada —
-- só aparece na loja depois que um admin aprova pelo painel.

create table public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  author_name text not null,
  rating int not null check (rating between 1 and 5),
  comment text,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.product_reviews enable row level security;

create policy "product_reviews_select_approved_or_admin" on public.product_reviews
  for select using (
    approved or exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "product_reviews_insert_public" on public.product_reviews
  for insert with check (approved = false);

create policy "product_reviews_admin_update" on public.product_reviews
  for update using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

create policy "product_reviews_admin_delete" on public.product_reviews
  for delete using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

create index product_reviews_product_id_idx on public.product_reviews (product_id);
