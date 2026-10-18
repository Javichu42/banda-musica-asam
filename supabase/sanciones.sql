-- =====================================================================
-- Web de la ASAM · Reglamento de Régimen Interno (RRI) y sanciones
-- Ejecútalo después de notificaciones.sql. Se puede volver a ejecutar.
--
-- Permiso nuevo para los cargos:
--   sanciones → poner, cambiar y ver todas las sanciones, y editar el RRI
-- Cada músico ve solo sus sanciones. Las sanciones no caducan.
-- =====================================================================

-- 1. Permiso «Reglamento y sanciones»
alter table public.cargos drop constraint if exists cargos_permisos_validos;
alter table public.cargos add constraint cargos_permisos_validos
  check (permisos <@ array['web', 'musica', 'cuentas', 'sanciones']::text[]);

-- El Administrador general lo tiene todo; la Presidencia también lo recibe.
-- (Para dárselo a otro cargo: Administración → Cargos → Editar.)
alter table public.cargos disable trigger cargos_sistema;
update public.cargos set permisos = array_append(permisos, 'sanciones')
  where id in ('admin-general', 'presidencia') and not ('sanciones' = any (permisos));
alter table public.cargos enable trigger cargos_sistema;

-- 2. Sanciones (no caducan: quedan siempre en el historial de la persona)
create table if not exists public.sanciones (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references auth.users (id) on delete cascade,
  nombre            text        not null check (char_length(nombre) between 1 and 120),
  gravedad          text        not null default 'Leve' check (gravedad in ('Leve', 'Grave', 'Muy grave')),
  motivo            text        not null check (char_length(motivo) between 1 and 3000),
  articulo          text        check (articulo is null or char_length(articulo) <= 200),
  fecha_hechos      date,
  fecha             date        not null default current_date,
  visto             timestamptz,
  autor             uuid        default auth.uid() references auth.users (id) on delete set null,
  autor_nombre      text        check (autor_nombre is null or char_length(autor_nombre) <= 120),
  creado            timestamptz not null default now(),
  actualizado       timestamptz not null default now()
);
-- Por si se ejecutó una versión anterior de este archivo (con medidas, duración y alegaciones)
alter table public.sanciones drop constraint if exists sanciones_hasta;
alter table public.sanciones drop column if exists medida;
alter table public.sanciones drop column if exists hasta;
alter table public.sanciones drop column if exists estado;
alter table public.sanciones drop column if exists alegacion;
alter table public.sanciones drop column if exists alegacion_fecha;
alter table public.sanciones drop column if exists respuesta;
alter table public.sanciones drop column if exists respuesta_fecha;
drop function if exists public.alegar_sancion(uuid, text);

create index if not exists sanciones_user on public.sanciones (user_id);
create index if not exists sanciones_fecha on public.sanciones (fecha desc);
drop trigger if exists sanciones_actualizado on public.sanciones;
create trigger sanciones_actualizado before update on public.sanciones
  for each row execute function public.tocar_actualizado();
alter table public.sanciones enable row level security;

drop policy if exists "Sanciones: cada uno las suyas" on public.sanciones;
drop policy if exists "Sanciones: lectura con permiso" on public.sanciones;
drop policy if exists "Sanciones: alta con permiso" on public.sanciones;
drop policy if exists "Sanciones: cambio con permiso" on public.sanciones;
drop policy if exists "Sanciones: borrado con permiso" on public.sanciones;
create policy "Sanciones: cada uno las suyas" on public.sanciones for select to authenticated using (user_id = auth.uid());
create policy "Sanciones: lectura con permiso" on public.sanciones for select to authenticated using (public.tiene_permiso('sanciones'));
create policy "Sanciones: alta con permiso" on public.sanciones for insert to authenticated with check (public.tiene_permiso('sanciones'));
create policy "Sanciones: cambio con permiso" on public.sanciones for update to authenticated using (public.tiene_permiso('sanciones')) with check (public.tiene_permiso('sanciones'));
create policy "Sanciones: borrado con permiso" on public.sanciones for delete to authenticated using (public.tiene_permiso('sanciones'));

-- 3. La persona sancionada solo puede marcarla como vista (así la directiva sabe que le ha llegado)
create or replace function public.sancion_vista(p_id uuid)
returns void
language sql security definer set search_path = public
as $$
  update public.sanciones set visto = now() where id = p_id and user_id = auth.uid() and visto is null;
$$;
revoke execute on function public.sancion_vista(uuid) from anon, public;
grant execute on function public.sancion_vista(uuid) to authenticated;

-- 4. RRI: lo editan quienes tienen el permiso «sanciones» (además de «musica», como el resto del área)
drop policy if exists "Interno: escritura según permisos" on public.interno;
create policy "Interno: escritura según permisos" on public.interno for all to authenticated
  using (public.tiene_permiso('musica') or (coleccion = 'anuncios' and public.es_admin()) or (coleccion = 'rri' and public.tiene_permiso('sanciones')))
  with check (public.tiene_permiso('musica') or (coleccion = 'anuncios' and public.es_admin()) or (coleccion = 'rri' and public.tiene_permiso('sanciones')));

-- PDF del reglamento (carpeta rri/ del almacén de partituras, que solo ven músicos y directiva)
drop policy if exists "RRI: subida con permiso" on storage.objects;
drop policy if exists "RRI: cambio con permiso" on storage.objects;
drop policy if exists "RRI: borrado con permiso" on storage.objects;
create policy "RRI: subida con permiso" on storage.objects for insert to authenticated
  with check (bucket_id = 'partituras' and name like 'rri/%' and public.tiene_permiso('sanciones'));
create policy "RRI: cambio con permiso" on storage.objects for update to authenticated
  using (bucket_id = 'partituras' and name like 'rri/%' and public.tiene_permiso('sanciones'));
create policy "RRI: borrado con permiso" on storage.objects for delete to authenticated
  using (bucket_id = 'partituras' and name like 'rri/%' and public.tiene_permiso('sanciones'));
