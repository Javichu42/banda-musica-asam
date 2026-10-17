-- =====================================================================
-- Web de la ASAM · Estructura de la base de datos en Supabase
-- Ejecútalo entero en Supabase → SQL Editor → New query → Run.
-- Se puede volver a ejecutar sin perder datos.
-- =====================================================================

-- 1. Contenido de la web --------------------------------------------------
-- Cada fila es un elemento de una colección: directiva, directores, músicos,
-- eventos, noticias, enlaces, fotos, o los ajustes (contacto y pie de página).
create table if not exists public.contenido (
  coleccion   text        not null,
  id          text        not null,
  datos       jsonb       not null default '{}'::jsonb,
  actualizado timestamptz not null default now(),
  primary key (coleccion, id)
);

create or replace function public.tocar_actualizado()
returns trigger language plpgsql as $$
begin
  new.actualizado := now();
  return new;
end;
$$;

drop trigger if exists contenido_actualizado on public.contenido;
create trigger contenido_actualizado
  before update on public.contenido
  for each row execute function public.tocar_actualizado();

-- 2. Administradores ------------------------------------------------------
-- Solo los usuarios que estén en esta tabla pueden editar la web.
create table if not exists public.administradores (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email   text,
  creado  timestamptz not null default now()
);

create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.administradores where user_id = auth.uid());
$$;

grant execute on function public.es_admin() to anon, authenticated;

-- 3. Reglas de seguridad (RLS) ---------------------------------------------
alter table public.contenido enable row level security;
alter table public.administradores enable row level security;

drop policy if exists "Contenido: lectura pública"      on public.contenido;
drop policy if exists "Contenido: alta administradores" on public.contenido;
drop policy if exists "Contenido: edición administradores" on public.contenido;
drop policy if exists "Contenido: borrado administradores" on public.contenido;

create policy "Contenido: lectura pública"
  on public.contenido for select
  to anon, authenticated
  using (true);

create policy "Contenido: alta administradores"
  on public.contenido for insert
  to authenticated
  with check (public.es_admin());

create policy "Contenido: edición administradores"
  on public.contenido for update
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());

create policy "Contenido: borrado administradores"
  on public.contenido for delete
  to authenticated
  using (public.es_admin());

drop policy if exists "Administradores: ver su propia fila" on public.administradores;
create policy "Administradores: ver su propia fila"
  on public.administradores for select
  to authenticated
  using (user_id = auth.uid());
-- No hay reglas de escritura: los administradores se añaden desde el SQL Editor.

-- 4. Almacenamiento de fotos ---------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Fotos: lectura pública"        on storage.objects;
drop policy if exists "Fotos: subida administradores" on storage.objects;
drop policy if exists "Fotos: cambio administradores" on storage.objects;
drop policy if exists "Fotos: borrado administradores" on storage.objects;

create policy "Fotos: lectura pública"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'fotos');

create policy "Fotos: subida administradores"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'fotos' and public.es_admin());

create policy "Fotos: cambio administradores"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'fotos' and public.es_admin());

create policy "Fotos: borrado administradores"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'fotos' and public.es_admin());
