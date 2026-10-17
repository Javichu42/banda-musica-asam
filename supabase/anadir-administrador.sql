-- Da permiso de administrador a un usuario.
-- Antes, crea el usuario en Supabase → Authentication → Users → Add user.
-- Cambia el correo de abajo por el suyo y pulsa Run.

insert into public.administradores (user_id, email)
select id, email from auth.users
where email = 'correo@ejemplo.com'
on conflict (user_id) do nothing;

-- Para ver quién es administrador:
-- select email, creado from public.administradores order by creado;

-- Para quitar a alguien:
-- delete from public.administradores where email = 'correo@ejemplo.com';
