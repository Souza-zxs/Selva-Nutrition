-- Recuperação de carrinho abandonado: rascunho salvo no checkout + agendamento
-- via pg_cron/pg_net para disparar lembretes por e-mail (Resend), sem
-- depender de um servidor/agendador externo.

create table public.abandoned_carts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  lines jsonb not null,
  recovered boolean not null default false,
  reminder_stage int not null default 0 check (reminder_stage in (0, 1, 2)),
  first_reminder_at timestamptz,
  second_reminder_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index abandoned_carts_pending_idx
  on public.abandoned_carts (reminder_stage, created_at)
  where not recovered;

alter table public.abandoned_carts enable row level security;
-- Sem policies de propósito: só as Edge Functions (service role) leem/escrevem
-- aqui — mesmo padrão de orders/order_items, o client nunca acessa direto.

-- ---------------------------------------------------------------------------
-- Agendamento do lembrete de carrinho abandonado.
--
-- Este arquivo é commitado no git, então os dois secrets abaixo entram como
-- placeholders — depois de rodar esta migration, popule os valores reais UMA
-- VEZ (via SQL editor do painel Supabase, nunca em outra migration):
--
--   select vault.update_secret(
--     (select id from vault.secrets where name = 'cron_project_url'),
--     'https://<project-ref>.supabase.co'
--   );
--   select vault.update_secret(
--     (select id from vault.secrets where name = 'cron_secret'),
--     '<mesmo valor do secret CRON_SECRET setado na function via `supabase secrets set`>'
--   );
--
-- Sem isso, o cron roda a cada 15 min mas as chamadas falham silenciosamente
-- (URL/segredo ainda são o placeholder abaixo).
-- ---------------------------------------------------------------------------
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select vault.create_secret('CHANGE_ME', 'cron_project_url')
where not exists (select 1 from vault.secrets where name = 'cron_project_url');

select vault.create_secret('CHANGE_ME', 'cron_secret')
where not exists (select 1 from vault.secrets where name = 'cron_secret');

select cron.schedule(
  'cart-recovery-emails',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'cron_project_url')
      || '/functions/v1/send-cart-recovery-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);
