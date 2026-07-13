create policy "debug_permissive_insert" on storage.objects
  for insert to authenticated
  with check (true);
