-- Cleanup: the storage-api service doesn't resolve auth.uid() reliably inside
-- RLS for object writes (confirmed by testing a permissive debug policy vs the
-- admin-check one). Uploads now go through the admin-upload-image Edge
-- Function, which checks role='admin' itself and writes with the service
-- role — so these table-driven write policies and debug helpers are removed.

drop policy if exists "debug_permissive_insert" on storage.objects;
drop policy if exists "products_bucket_admin_insert" on storage.objects;
drop policy if exists "products_bucket_admin_update" on storage.objects;
drop policy if exists "products_bucket_admin_delete" on storage.objects;

drop function if exists public.debug_is_admin();
drop function if exists public.debug_storage_policies();
