create function public.debug_storage_policies()
returns jsonb
language sql
stable
security definer set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'policyname', policyname,
    'cmd', cmd,
    'roles', roles,
    'qual', qual,
    'with_check', with_check
  )), '[]'::jsonb)
  from pg_policies
  where schemaname = 'storage' and tablename = 'objects';
$$;
