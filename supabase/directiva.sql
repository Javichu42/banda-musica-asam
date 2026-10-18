-- =====================================================================
-- Web de la ASAM · Directiva: cargos con permisos, cuentas unificadas
-- y reuniones de la directiva.
-- Ejecútalo después de repertorio.sql. Se puede volver a ejecutar.
--
-- Permisos que puede tener un cargo:
--   web      → editar el contenido público de la web (textos, noticias, fotos…)
--   musica   → Área de músicos: partituras, agenda y eventos, avisos, pase de lista
--   cuentas  → crear y cambiar cuentas, dar accesos y gestionar los cargos
-- Cualquier miembro de la directiva (aunque su cargo no tenga permisos, p. ej.
-- un Vocal) ve las tareas, las reuniones y las sugerencias de los músicos.
-- =====================================================================

-- 1. Cargos de la directiva
create table if not exists public.cargos (
  id          text        primary key,
  nombre      text        not null check (char_length(nombre) between 1 and 60),
  descripcion text        check (descripcion is null or char_length(descripcion) <= 300),
  permisos    text[]      not null default '{}',
  orden       int         not null default 50,
  sistema     boolean     not null default false,
  creado      timestamptz not null default now(),
  constraint cargos_permisos_validos check (permisos <@ array['web', 'musica', 'cuentas']::text[])
);

insert into public.cargos (id, nombre, descripcion, permisos, orden, sistema) values
  ('admin-general', 'Administrador general', 'Acceso completo. No se puede borrar.', array['web', 'musica', 'cuentas'], 0, true),
  ('presidencia', 'Presidente/a', null, array['web', 'musica', 'cuentas'], 10, false),
  ('vicepresidencia', 'Vicepresidente/a', null, array['web', 'musica'], 20, false),
  ('secretaria', 'Secretario/a', null, array['web', 'cuentas'], 30, false),
  ('tesoreria', 'Tesorero/a', null, array[]::text[], 40, false),
  ('direccion-musical', 'Dirección musical', 'Partituras, agenda y avisos del Área de músicos.', array['musica'], 45, false),
  ('vocal', 'Vocal', 'Tareas, reuniones y sugerencias. No edita la web.', array[]::text[], 60, false)
on conflict (id) do nothing;

-- 2. Administradores = miembros de la directiva con cuenta
alter table public.administradores add column if not exists cargo_id text references public.cargos (id) on update cascade;
alter table public.administradores add column if not exists nombre text;
alter table public.administradores add column if not exists usuario text;
create unique index if not exists administradores_usuario on public.administradores (lower(usuario)) where usuario is not null;
-- Quien ya era administrador conserva todo su acceso
update public.administradores set cargo_id = 'admin-general' where cargo_id is null;
alter table public.administradores alter column cargo_id set default 'vocal';
alter table public.administradores alter column cargo_id set not null;

-- 3. Permisos del usuario actual
create or replace function public.mis_permisos_lista()
returns text[]
language sql stable security definer set search_path = public
as $$
  select coalesce((select c.permisos from public.administradores a join public.cargos c on c.id = a.cargo_id where a.user_id = auth.uid()), '{}'::text[]);
$$;
create or replace function public.tiene_permiso(p text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select p = any (public.mis_permisos_lista());
$$;
-- Lo que la web necesita saber al entrar
create or replace function public.mis_permisos()
returns jsonb
language sql stable security definer set search_path = public
as $$
  select jsonb_build_object(
    'admin', exists (select 1 from public.administradores where user_id = auth.uid()),
    'cargo', (select c.nombre from public.administradores a join public.cargos c on c.id = a.cargo_id where a.user_id = auth.uid()),
    'cargo_id', (select a.cargo_id from public.administradores a where a.user_id = auth.uid()),
    'permisos', to_jsonb(public.mis_permisos_lista())
  );
$$;
revoke execute on function public.mis_permisos_lista() from anon, public;
revoke execute on function public.tiene_permiso(text) from anon, public;
revoke execute on function public.mis_permisos() from anon, public;
grant execute on function public.mis_permisos_lista() to authenticated;
grant execute on function public.tiene_permiso(text) to authenticated;
grant execute on function public.mis_permisos() to authenticated;

-- 4. Que nunca se quede la web sin nadie que pueda gestionar las cuentas
create or replace function public.comprobar_acceso_cuentas()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if not exists (select 1 from public.administradores a join public.cargos c on c.id = a.cargo_id where 'cuentas' = any (c.permisos)) then
    raise exception 'Tiene que quedar al menos una persona con el permiso «Cuentas y permisos».';
  end if;
  return null;
end;
$$;
drop trigger if exists administradores_acceso_cuentas on public.administradores;
create trigger administradores_acceso_cuentas after update or delete on public.administradores
  for each statement execute function public.comprobar_acceso_cuentas();
drop trigger if exists cargos_acceso_cuentas on public.cargos;
create trigger cargos_acceso_cuentas after update or delete on public.cargos
  for each statement execute function public.comprobar_acceso_cuentas();

-- El cargo "Administrador general" no se puede borrar ni recortar
create or replace function public.proteger_cargo_sistema()
returns trigger
language plpgsql set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    if old.sistema then raise exception 'Este cargo no se puede borrar.'; end if;
    return old;
  end if;
  if old.sistema and (new.permisos is distinct from old.permisos or new.sistema is distinct from old.sistema or new.id is distinct from old.id) then
    raise exception 'Los permisos de este cargo no se pueden cambiar.';
  end if;
  if new.sistema and not old.sistema then raise exception 'No se puede marcar un cargo como de sistema.'; end if;
  return new;
end;
$$;
drop trigger if exists cargos_sistema on public.cargos;
create trigger cargos_sistema before update or delete on public.cargos
  for each row execute function public.proteger_cargo_sistema();

-- 5. Reglas de los cargos y de la lista de la directiva
alter table public.cargos enable row level security;
drop policy if exists "Cargos: lectura directiva" on public.cargos;
drop policy if exists "Cargos: alta con permiso de cuentas" on public.cargos;
drop policy if exists "Cargos: cambio con permiso de cuentas" on public.cargos;
drop policy if exists "Cargos: borrado con permiso de cuentas" on public.cargos;
create policy "Cargos: lectura directiva" on public.cargos for select to authenticated using (public.es_admin());
create policy "Cargos: alta con permiso de cuentas" on public.cargos for insert to authenticated with check (public.tiene_permiso('cuentas') and not sistema);
create policy "Cargos: cambio con permiso de cuentas" on public.cargos for update to authenticated using (public.tiene_permiso('cuentas')) with check (public.tiene_permiso('cuentas'));
create policy "Cargos: borrado con permiso de cuentas" on public.cargos for delete to authenticated using (public.tiene_permiso('cuentas'));

-- La directiva ve quién forma parte de ella (para reuniones y tareas); los cambios
-- se hacen solo desde la función "musicos" (permiso de cuentas)
drop policy if exists "Administradores: la directiva ve la lista" on public.administradores;
create policy "Administradores: la directiva ve la lista" on public.administradores for select to authenticated using (public.es_admin());

-- 6. Contenido público: solo quien tenga permiso "web"
--    (los eventos también los puede crear quien lleve el Área de músicos, y cada
--     miembro de la directiva puede crear o cambiar su propia ficha de músico)
drop policy if exists "Contenido: alta administradores" on public.contenido;
drop policy if exists "Contenido: edición administradores" on public.contenido;
drop policy if exists "Contenido: borrado administradores" on public.contenido;
drop policy if exists "Contenido: alta según permisos" on public.contenido;
drop policy if exists "Contenido: edición según permisos" on public.contenido;
drop policy if exists "Contenido: borrado según permisos" on public.contenido;
create policy "Contenido: alta según permisos" on public.contenido for insert to authenticated with check (
  public.tiene_permiso('web')
  or (coleccion = 'eventos' and public.tiene_permiso('musica'))
  or (coleccion = 'musicos' and (public.tiene_permiso('cuentas') or (public.es_admin() and datos->>'user_id' = auth.uid()::text))));
create policy "Contenido: edición según permisos" on public.contenido for update to authenticated using (
  public.tiene_permiso('web')
  or (coleccion = 'eventos' and public.tiene_permiso('musica'))
  or (coleccion = 'musicos' and (public.tiene_permiso('cuentas') or (public.es_admin() and datos->>'user_id' = auth.uid()::text))))
with check (
  public.tiene_permiso('web')
  or (coleccion = 'eventos' and public.tiene_permiso('musica'))
  or (coleccion = 'musicos' and (public.tiene_permiso('cuentas') or (public.es_admin() and datos->>'user_id' = auth.uid()::text))));
create policy "Contenido: borrado según permisos" on public.contenido for delete to authenticated using (
  public.tiene_permiso('web')
  or (coleccion = 'eventos' and public.tiene_permiso('musica'))
  or (coleccion = 'musicos' and public.tiene_permiso('cuentas')));

-- 7. Área de músicos: partituras, programas y avisos con permiso "musica"
--    (cualquier miembro de la directiva puede publicar avisos)
drop policy if exists "Interno: escritura administradores" on public.interno;
drop policy if exists "Interno: escritura según permisos" on public.interno;
create policy "Interno: escritura según permisos" on public.interno for all to authenticated
  using (public.tiene_permiso('musica') or (coleccion = 'anuncios' and public.es_admin()))
  with check (public.tiene_permiso('musica') or (coleccion = 'anuncios' and public.es_admin()));

drop policy if exists "Pase de lista: administradores" on public.pase_lista;
drop policy if exists "Pase de lista: permiso de música" on public.pase_lista;
create policy "Pase de lista: permiso de música" on public.pase_lista for all to authenticated
  using (public.tiene_permiso('musica')) with check (public.tiene_permiso('musica'));

drop policy if exists "Partituras: subida administradores" on storage.objects;
drop policy if exists "Partituras: cambio administradores" on storage.objects;
drop policy if exists "Partituras: borrado administradores" on storage.objects;
drop policy if exists "Partituras: subida permiso de música" on storage.objects;
drop policy if exists "Partituras: cambio permiso de música" on storage.objects;
drop policy if exists "Partituras: borrado permiso de música" on storage.objects;
create policy "Partituras: subida permiso de música" on storage.objects for insert to authenticated with check (bucket_id = 'partituras' and public.tiene_permiso('musica'));
create policy "Partituras: cambio permiso de música" on storage.objects for update to authenticated using (bucket_id = 'partituras' and public.tiene_permiso('musica'));
create policy "Partituras: borrado permiso de música" on storage.objects for delete to authenticated using (bucket_id = 'partituras' and public.tiene_permiso('musica'));

drop policy if exists "Fotos: subida administradores" on storage.objects;
drop policy if exists "Fotos: cambio administradores" on storage.objects;
drop policy if exists "Fotos: borrado administradores" on storage.objects;
drop policy if exists "Fotos: subida permiso web" on storage.objects;
drop policy if exists "Fotos: cambio permiso web" on storage.objects;
drop policy if exists "Fotos: borrado permiso web" on storage.objects;
create policy "Fotos: subida permiso web" on storage.objects for insert to authenticated with check (bucket_id = 'fotos' and public.tiene_permiso('web'));
create policy "Fotos: cambio permiso web" on storage.objects for update to authenticated using (bucket_id = 'fotos' and public.tiene_permiso('web'));
create policy "Fotos: borrado permiso web" on storage.objects for delete to authenticated using (bucket_id = 'fotos' and public.tiene_permiso('web'));

-- 8. Reuniones de la directiva
create table if not exists public.reuniones (
  id          uuid        primary key default gen_random_uuid(),
  titulo      text        not null check (char_length(titulo) between 1 and 200),
  tipo        text        not null default 'ordinaria' check (tipo in ('ordinaria', 'extraordinaria', 'asamblea')),
  fecha       date        not null,
  hora        text        check (hora is null or char_length(hora) <= 10),
  lugar       text        check (lugar is null or char_length(lugar) <= 200),
  orden_dia   text        check (orden_dia is null or char_length(orden_dia) <= 6000),
  acta        text        check (acta is null or char_length(acta) <= 30000),
  acuerdos    text        check (acuerdos is null or char_length(acuerdos) <= 10000),
  estado      text        not null default 'convocada' check (estado in ('convocada', 'celebrada', 'cancelada')),
  autor       text,
  creado      timestamptz not null default now(),
  actualizado timestamptz not null default now()
);
drop trigger if exists reuniones_actualizado on public.reuniones;
create trigger reuniones_actualizado before update on public.reuniones
  for each row execute function public.tocar_actualizado();
alter table public.reuniones enable row level security;
drop policy if exists "Reuniones: directiva" on public.reuniones;
create policy "Reuniones: directiva" on public.reuniones for all to authenticated using (public.es_admin()) with check (public.es_admin());

create table if not exists public.reunion_asistencias (
  reunion_id  uuid        not null references public.reuniones (id) on delete cascade,
  user_id     uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  nombre      text,
  estado      text        not null check (estado in ('si', 'no', 'duda')),
  actualizado timestamptz not null default now(),
  primary key (reunion_id, user_id)
);
alter table public.reunion_asistencias enable row level security;
drop policy if exists "Asistencia a reuniones: la directiva la ve" on public.reunion_asistencias;
drop policy if exists "Asistencia a reuniones: cada uno la suya" on public.reunion_asistencias;
drop policy if exists "Asistencia a reuniones: cambiar la propia" on public.reunion_asistencias;
drop policy if exists "Asistencia a reuniones: borrar la propia" on public.reunion_asistencias;
create policy "Asistencia a reuniones: la directiva la ve" on public.reunion_asistencias for select to authenticated using (public.es_admin());
create policy "Asistencia a reuniones: cada uno la suya" on public.reunion_asistencias for insert to authenticated with check (user_id = auth.uid() and public.es_admin());
create policy "Asistencia a reuniones: cambiar la propia" on public.reunion_asistencias for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid() and public.es_admin());
create policy "Asistencia a reuniones: borrar la propia" on public.reunion_asistencias for delete to authenticated using (user_id = auth.uid());

-- Las tareas pueden salir de un acuerdo de una reunión
alter table public.tareas add column if not exists reunion_id uuid references public.reuniones (id) on delete set null;
