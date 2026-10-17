-- =====================================================================
-- Web de la ASAM · Área de músicos (asistencia, partituras y anuncios)
-- Ejecútalo después de esquema.sql. Se puede volver a ejecutar.
-- =====================================================================

-- ¿El usuario actual es un músico con cuenta?
-- Las cuentas de músico son filas de la colección "musicos" con su user_id.
create or replace function public.es_musico()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.contenido
    where coleccion = 'musicos' and datos->>'user_id' = auth.uid()::text
  );
$$;
grant execute on function public.es_musico() to anon, authenticated;

-- 1. Contenido interno (anuncios, partituras): solo lo ven músicos y administradores
create table if not exists public.interno (
  coleccion   text        not null,
  id          text        not null,
  datos       jsonb       not null default '{}'::jsonb,
  actualizado timestamptz not null default now(),
  primary key (coleccion, id)
);
drop trigger if exists interno_actualizado on public.interno;
create trigger interno_actualizado before update on public.interno
  for each row execute function public.tocar_actualizado();
alter table public.interno enable row level security;

drop policy if exists "Interno: lectura músicos y administradores" on public.interno;
drop policy if exists "Interno: escritura administradores" on public.interno;
create policy "Interno: lectura músicos y administradores" on public.interno
  for select to authenticated using (public.es_admin() or public.es_musico());
create policy "Interno: escritura administradores" on public.interno
  for all to authenticated using (public.es_admin()) with check (public.es_admin());

-- 2. Respuestas de asistencia: cada músico gestiona la suya
create table if not exists public.asistencias (
  evento_id   text        not null,
  user_id     uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  estado      text        not null check (estado in ('si', 'no', 'duda')),
  motivo      text,
  actualizado timestamptz not null default now(),
  primary key (evento_id, user_id)
);
drop trigger if exists asistencias_actualizado on public.asistencias;
create trigger asistencias_actualizado before update on public.asistencias
  for each row execute function public.tocar_actualizado();
alter table public.asistencias enable row level security;

drop policy if exists "Asistencias: ver la propia o todas si eres admin" on public.asistencias;
drop policy if exists "Asistencias: el músico responde por sí mismo" on public.asistencias;
drop policy if exists "Asistencias: el músico cambia su respuesta" on public.asistencias;
drop policy if exists "Asistencias: borrar la propia o admin" on public.asistencias;
create policy "Asistencias: ver la propia o todas si eres admin" on public.asistencias
  for select to authenticated using (user_id = auth.uid() or public.es_admin());
create policy "Asistencias: el músico responde por sí mismo" on public.asistencias
  for insert to authenticated with check (user_id = auth.uid() and (public.es_musico() or public.es_admin()));
create policy "Asistencias: el músico cambia su respuesta" on public.asistencias
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Asistencias: borrar la propia o admin" on public.asistencias
  for delete to authenticated using (user_id = auth.uid() or public.es_admin());

-- 3. Pase de lista: solo administradores
create table if not exists public.pase_lista (
  evento_id   text        not null,
  user_id     uuid        not null references auth.users (id) on delete cascade,
  presente    boolean     not null,
  actualizado timestamptz not null default now(),
  primary key (evento_id, user_id)
);
alter table public.pase_lista enable row level security;
drop policy if exists "Pase de lista: administradores" on public.pase_lista;
drop policy if exists "Pase de lista: el músico ve el suyo" on public.pase_lista;
create policy "Pase de lista: administradores" on public.pase_lista
  for all to authenticated using (public.es_admin()) with check (public.es_admin());
create policy "Pase de lista: el músico ve el suyo" on public.pase_lista
  for select to authenticated using (user_id = auth.uid());

-- 4. Comentarios en los anuncios
create table if not exists public.comentarios (
  id          uuid        primary key default gen_random_uuid(),
  anuncio_id  text        not null,
  user_id     uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  autor       text        not null,
  texto       text        not null check (char_length(texto) between 1 and 2000),
  creado      timestamptz not null default now()
);
create index if not exists comentarios_anuncio on public.comentarios (anuncio_id, creado);
alter table public.comentarios enable row level security;
drop policy if exists "Comentarios: lectura músicos y administradores" on public.comentarios;
drop policy if exists "Comentarios: escribir como uno mismo" on public.comentarios;
drop policy if exists "Comentarios: borrar el propio o admin" on public.comentarios;
create policy "Comentarios: lectura músicos y administradores" on public.comentarios
  for select to authenticated using (public.es_admin() or public.es_musico());
create policy "Comentarios: escribir como uno mismo" on public.comentarios
  for insert to authenticated with check (user_id = auth.uid() and (public.es_admin() or public.es_musico()));
create policy "Comentarios: borrar el propio o admin" on public.comentarios
  for delete to authenticated using (user_id = auth.uid() or public.es_admin());

-- 5. Partituras: almacenamiento privado
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('partituras', 'partituras', false, 26214400,
        array['application/pdf', 'image/jpeg', 'image/png', 'audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/wav'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Partituras: lectura músicos y administradores" on storage.objects;
drop policy if exists "Partituras: subida administradores" on storage.objects;
drop policy if exists "Partituras: cambio administradores" on storage.objects;
drop policy if exists "Partituras: borrado administradores" on storage.objects;
create policy "Partituras: lectura músicos y administradores" on storage.objects
  for select to authenticated using (bucket_id = 'partituras' and (public.es_admin() or public.es_musico()));
create policy "Partituras: subida administradores" on storage.objects
  for insert to authenticated with check (bucket_id = 'partituras' and public.es_admin());
create policy "Partituras: cambio administradores" on storage.objects
  for update to authenticated using (bucket_id = 'partituras' and public.es_admin());
create policy "Partituras: borrado administradores" on storage.objects
  for delete to authenticated using (bucket_id = 'partituras' and public.es_admin());
