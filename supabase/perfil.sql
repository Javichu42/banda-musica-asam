-- =====================================================================
-- Web de la ASAM · Fotos de perfil
-- Cada persona (músico o directiva) puede subir y cambiar su propia foto.
-- Ejecútalo después de notificaciones.sql. Se puede volver a ejecutar.
-- =====================================================================
alter table public.administradores add column if not exists foto text;

-- Las fotos van al almacén público "fotos", en la carpeta perfiles/<id de la cuenta>/
drop policy if exists "Fotos: perfil propio (subir)" on storage.objects;
drop policy if exists "Fotos: perfil propio (cambiar)" on storage.objects;
drop policy if exists "Fotos: perfil propio (borrar)" on storage.objects;
create policy "Fotos: perfil propio (subir)" on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos' and name like 'perfiles/' || auth.uid()::text || '/%' and (public.es_musico() or public.es_admin()));
create policy "Fotos: perfil propio (cambiar)" on storage.objects for update to authenticated
  using (bucket_id = 'fotos' and name like 'perfiles/' || auth.uid()::text || '/%');
create policy "Fotos: perfil propio (borrar)" on storage.objects for delete to authenticated
  using (bucket_id = 'fotos' and name like 'perfiles/' || auth.uid()::text || '/%');

-- Guardar la foto en la ficha de músico y/o en la fila de la directiva de quien llama
create or replace function public.cambiar_mi_foto(p_path text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Tienes que iniciar sesión.'; end if;
  if p_path is not null and p_path not like 'perfiles/' || auth.uid()::text || '/%' then
    raise exception 'Esa foto no es tuya.';
  end if;
  update public.contenido
     set datos = case when p_path is null then datos - 'foto' else jsonb_set(datos, '{foto}', to_jsonb(p_path)) end
   where coleccion = 'musicos' and datos->>'user_id' = auth.uid()::text;
  update public.administradores set foto = p_path where user_id = auth.uid();
end;
$$;
revoke execute on function public.cambiar_mi_foto(text) from anon, public;
grant execute on function public.cambiar_mi_foto(text) to authenticated;

-- La web también recibe la foto de quien entra
create or replace function public.mis_permisos()
returns jsonb
language sql stable security definer set search_path = public
as $$
  select jsonb_build_object(
    'admin', exists (select 1 from public.administradores where user_id = auth.uid()),
    'cargo', (select c.nombre from public.administradores a join public.cargos c on c.id = a.cargo_id where a.user_id = auth.uid()),
    'cargo_id', (select a.cargo_id from public.administradores a where a.user_id = auth.uid()),
    'permisos', to_jsonb(public.mis_permisos_lista()),
    'foto', coalesce((select a.foto from public.administradores a where a.user_id = auth.uid()),
                     (select c.datos->>'foto' from public.contenido c where c.coleccion = 'musicos' and c.datos->>'user_id' = auth.uid()::text limit 1))
  );
$$;
