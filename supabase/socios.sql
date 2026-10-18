-- =====================================================================
-- Web de la ASAM · Hojas de alta de socio enviadas desde la web
-- Cualquiera puede enviar su hoja (sin cuenta). Solo la directiva la ve.
-- Ejecútalo después de perfil.sql. Se puede volver a ejecutar.
-- =====================================================================
create table if not exists public.socios_solicitudes (
  id        uuid        primary key default gen_random_uuid(),
  nombre    text        not null check (char_length(nombre) between 1 and 200),
  email     text        check (email is null or char_length(email) <= 200),
  telefono  text        check (telefono is null or char_length(telefono) <= 40),
  tipo      text        check (tipo in ('socio', 'amigo', 'mecenas')),
  cuota     numeric     check (cuota is null or (cuota >= 0 and cuota <= 1000000)),
  datos     jsonb       not null default '{}'::jsonb check (pg_column_size(datos) <= 8000),
  pdf_path  text        check (pdf_path is null or pdf_path like 'solicitudes/%'),
  estado    text        not null default 'nueva' check (estado in ('nueva', 'tramitada', 'descartada')),
  notas     text        check (notas is null or char_length(notas) <= 2000),
  creado    timestamptz not null default now()
);
alter table public.socios_solicitudes enable row level security;
drop policy if exists "Socios: cualquiera envía su hoja" on public.socios_solicitudes;
drop policy if exists "Socios: la directiva las ve" on public.socios_solicitudes;
drop policy if exists "Socios: la directiva las tramita" on public.socios_solicitudes;
drop policy if exists "Socios: la directiva las borra" on public.socios_solicitudes;
create policy "Socios: cualquiera envía su hoja" on public.socios_solicitudes for insert to anon, authenticated with check (estado = 'nueva' and notas is null);
create policy "Socios: la directiva las ve" on public.socios_solicitudes for select to authenticated using (public.es_admin());
create policy "Socios: la directiva las tramita" on public.socios_solicitudes for update to authenticated using (public.es_admin()) with check (public.es_admin());
create policy "Socios: la directiva las borra" on public.socios_solicitudes for delete to authenticated using (public.es_admin());

-- Almacén privado para los PDF firmados (máximo 3 MB, solo PDF)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('socios', 'socios', false, 3145728, array['application/pdf'])
on conflict (id) do update set public = false, file_size_limit = 3145728, allowed_mime_types = array['application/pdf'];
drop policy if exists "Socios: subir la hoja" on storage.objects;
drop policy if exists "Socios: la directiva lee las hojas" on storage.objects;
drop policy if exists "Socios: la directiva borra las hojas" on storage.objects;
create policy "Socios: subir la hoja" on storage.objects for insert to anon, authenticated with check (bucket_id = 'socios' and name like 'solicitudes/%');
create policy "Socios: la directiva lee las hojas" on storage.objects for select to authenticated using (bucket_id = 'socios' and public.es_admin());
create policy "Socios: la directiva borra las hojas" on storage.objects for delete to authenticated using (bucket_id = 'socios' and public.es_admin());
