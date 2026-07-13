create function public.debug_is_admin()
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'uid', auth.uid(),
    'is_admin', exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
$$;
