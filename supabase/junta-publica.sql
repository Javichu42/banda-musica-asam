-- =====================================================================
-- Web de la ASAM · Junta Directiva pública
-- La página Dirección muestra a las personas que tienen un cargo en
-- Administración → Personas y accesos (menos el «Administrador general»).
-- Solo se publica el nombre, el cargo y la foto de perfil; nunca el correo
-- ni el usuario. Ejecútalo después de perfil.sql. Se puede volver a ejecutar.
-- =====================================================================
create or replace function public.directiva_publica()
returns table (user_id uuid, nombre text, cargo text, orden int, foto text)
language sql stable security definer set search_path = public
as $$
  select a.user_id,
         coalesce(nullif(m.datos->>'nombre', ''), nullif(a.nombre, ''), 'Sin nombre') as nombre,
         c.nombre as cargo,
         c.orden,
         coalesce(nullif(a.foto, ''), nullif(m.datos->>'foto', '')) as foto
  from public.administradores a
  join public.cargos c on c.id = a.cargo_id
  left join lateral (
    select x.datos from public.contenido x
    where x.coleccion = 'musicos' and x.datos->>'user_id' = a.user_id::text
    limit 1
  ) m on true
  where c.id <> 'admin-general'
  order by c.orden, 2;
$$;
revoke execute on function public.directiva_publica() from public;
grant execute on function public.directiva_publica() to anon, authenticated;
