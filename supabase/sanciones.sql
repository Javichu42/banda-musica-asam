-- =====================================================================
-- Web de la ASAM · Reglamento de Régimen Interno (RRI) y sanciones
-- Ejecútalo después de notificaciones.sql. Se puede volver a ejecutar.
--
-- Permiso nuevo para los cargos:
--   sanciones → poner, cambiar y ver todas las sanciones, y editar el RRI
-- Cada músico ve solo sus sanciones (y puede presentar una alegación).
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

-- 2. Sanciones
create table if not exists public.sanciones (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references auth.users (id) on delete cascade,
  nombre            text        not null check (char_length(nombre) between 1 and 120),
  gravedad          text        not null default 'Leve' check (gravedad in ('Leve', 'Grave', 'Muy grave')),
  motivo            text        not null check (char_length(motivo) between 1 and 3000),
  medida            text        not null check (char_length(medida) between 1 and 500),
  articulo          text        check (articulo is null or char_length(articulo) <= 200),
  fecha_hechos      date,
  fecha             date        not null default current_date,
  hasta             date,
  estado            text        not null default 'Vigente' check (estado in ('Vigente', 'Cumplida', 'Anulada')),
  visto             timestamptz,
  alegacion         text        check (alegacion is null or char_length(alegacion) <= 3000),
  alegacion_fecha   timestamptz,
  respuesta         text        check (respuesta is null or char_length(respuesta) <= 3000),
  respuesta_fecha   timestamptz,
  autor             uuid        default auth.uid() references auth.users (id) on delete set null,
  autor_nombre      text        check (autor_nombre is null or char_length(autor_nombre) <= 120),
  creado            timestamptz not null default now(),
  actualizado       timestamptz not null default now(),
  constraint sanciones_hasta check (hasta is null or hasta >= fecha)
);
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

-- 3. Lo que puede hacer la persona sancionada: marcarla como vista y presentar una alegación
create or replace function public.sancion_vista(p_id uuid)
returns void
language sql security definer set search_path = public
as $$
  update public.sanciones set visto = now() where id = p_id and user_id = auth.uid() and visto is null;
$$;
create or replace function public.alegar_sancion(p_id uuid, p_texto text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if char_length(coalesce(trim(p_texto), '')) < 3 then raise exception 'Escribe tu alegación.'; end if;
  update public.sanciones set alegacion = left(trim(p_texto), 3000), alegacion_fecha = now(), visto = coalesce(visto, now())
    where id = p_id and user_id = auth.uid() and alegacion is null and estado <> 'Anulada';
  if not found then raise exception 'No se puede presentar la alegación (ya la habías enviado o la sanción está anulada).'; end if;
end;
$$;
revoke execute on function public.sancion_vista(uuid) from anon, public;
revoke execute on function public.alegar_sancion(uuid, text) from anon, public;
grant execute on function public.sancion_vista(uuid) to authenticated;
grant execute on function public.alegar_sancion(uuid, text) to authenticated;

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
