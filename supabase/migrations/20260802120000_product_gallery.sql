-- Galeria de fotos por produto (até 3), usada pelo carrossel do catálogo.
-- `image` continua existindo e é mantido como a primeira foto da galeria
-- (capa), pra não quebrar telas que ainda leem só esse campo (ex: página de
-- produto individual).

alter table public.products
  add column images text[] not null default '{}';
