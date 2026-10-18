-- =====================================================================
-- Web de la ASAM · Repertorio del Área de músicos
-- Valoraciones de obras, peticiones de partituras ("reclamar") y
-- confirmaciones visibles para todos los músicos.
-- Ejecútalo después de area-musicos.sql. Se puede volver a ejecutar.
-- (Las obras y sus particellas se guardan en la tabla "interno",
--  colecciones "obras" y "partes", y los archivos en el almacén privado
--  "partituras", que ya existen.)
-- =====================================================================

-- 1. Valoraciones de las obras (1 a 5 estrellas, una por músico y obra)
create table if not exists public.valoraciones (
  obra_id     text        not null,
  user_id     uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  estrellas   smallint    not null check (estrellas between 1 and 5),
  actualizado timestamptz not null default now(),
  primary key (obra_id, user_id)
);
drop trigger if exists valoraciones_actualizado on public.valoraciones;
create trigger valoraciones_actualizado before update on public.valoraciones
  for each row execute function public.tocar_actualizado();
alter table public.valoraciones enable row level security;

drop policy if exists "Valoraciones: lectura músicos y administradores" on public.valoraciones;
drop policy if exists "Valoraciones: cada uno la suya" on public.valoraciones;
drop policy if exists "Valoraciones: cambiar la propia" on public.valoraciones;
drop policy if exists "Valoraciones: borrar la propia" on public.valoraciones;
create policy "Valoraciones: lectura músicos y administradores" on public.valoraciones
  for select to authenticated using (public.es_admin() or public.es_musico());
create policy "Valoraciones: cada uno la suya" on public.valoraciones
  for insert to authenticated with check (user_id = auth.uid() and (public.es_musico() or public.es_admin()));
create policy "Valoraciones: cambiar la propia" on public.valoraciones
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Valoraciones: borrar la propia" on public.valoraciones
  for delete to authenticated using (user_id = auth.uid());

-- 2. Peticiones de partitura: un músico avisa de que le falta su papel
create table if not exists public.peticiones (
  id          uuid        primary key default gen_random_uuid(),
  obra_id     text        not null,
  user_id     uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  autor       text        not null,
  instrumento text,
  voz         text,
  mensaje     text        check (mensaje is null or char_length(mensaje) <= 1000),
  creado      timestamptz not null default now()
);
create index if not exists peticiones_obra on public.peticiones (obra_id, creado);
alter table public.peticiones enable row level security;

drop policy if exists "Peticiones: ver las propias o todas si eres admin" on public.peticiones;
drop policy if exists "Peticiones: pedir como uno mismo" on public.peticiones;
drop policy if exists "Peticiones: borrar la propia o admin" on public.peticiones;
create policy "Peticiones: ver las propias o todas si eres admin" on public.peticiones
  for select to authenticated using (user_id = auth.uid() or public.es_admin());
create policy "Peticiones: pedir como uno mismo" on public.peticiones
  for insert to authenticated with check (user_id = auth.uid() and (public.es_musico() or public.es_admin()));
create policy "Peticiones: borrar la propia o admin" on public.peticiones
  for delete to authenticated using (user_id = auth.uid() or public.es_admin());

-- 3. Los músicos ven quién ha confirmado en cada convocatoria
drop policy if exists "Asistencias: los músicos ven las de todos" on public.asistencias;
create policy "Asistencias: los músicos ven las de todos" on public.asistencias
  for select to authenticated using (public.es_musico() or public.es_admin());
