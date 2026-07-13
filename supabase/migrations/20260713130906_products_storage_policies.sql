-- Bucket "products" já existe (criado via Storage API) e é público para leitura
-- (a flag public do bucket libera GET sem passar por RLS). Aqui só restringimos
-- quem pode escrever nele: só admins, pelo mesmo critério usado nas outras tabelas.

create policy "products_bucket_admin_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'products'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "products_bucket_admin_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'products'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "products_bucket_admin_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'products'
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
