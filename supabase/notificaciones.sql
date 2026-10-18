-- =====================================================================
-- Web de la ASAM · Notificaciones al móvil (Web Push)
-- Guarda los móviles en los que cada persona ha activado los avisos.
-- Ejecútalo después de directiva.sql. Se puede volver a ejecutar.
-- =====================================================================
create table if not exists public.push_suscripciones (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  endpoint   text        not null unique check (char_length(endpoint) <= 1000),
  p256dh     text        not null check (char_length(p256dh) <= 200),
  auth       text        not null check (char_length(auth) <= 100),
  dispositivo text       check (dispositivo is null or char_length(dispositivo) <= 200),
  creado     timestamptz not null default now()
);
create index if not exists push_suscripciones_user on public.push_suscripciones (user_id);
alter table public.push_suscripciones enable row level security;

-- Cada persona ve, añade y quita solo sus móviles. El envío lo hace la función "avisos".
drop policy if exists "Push: ver los propios" on public.push_suscripciones;
drop policy if exists "Push: añadir los propios" on public.push_suscripciones;
drop policy if exists "Push: cambiar los propios" on public.push_suscripciones;
drop policy if exists "Push: quitar los propios" on public.push_suscripciones;
create policy "Push: ver los propios" on public.push_suscripciones for select to authenticated using (user_id = auth.uid());
create policy "Push: añadir los propios" on public.push_suscripciones for insert to authenticated with check (user_id = auth.uid() and (public.es_musico() or public.es_admin()));
create policy "Push: cambiar los propios" on public.push_suscripciones for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Push: quitar los propios" on public.push_suscripciones for delete to authenticated using (user_id = auth.uid());

-- Registrar el móvil de quien ha iniciado sesión. Si ese móvil estaba a nombre de otra
-- persona (alguien que antes entró en el mismo teléfono), pasa a ser de quien está ahora.
create or replace function public.registrar_push(p_endpoint text, p_p256dh text, p_auth text, p_dispositivo text default null)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is null or not (public.es_musico() or public.es_admin()) then
    raise exception 'No tienes acceso al Área de músicos.';
  end if;
  delete from public.push_suscripciones where endpoint = p_endpoint;
  insert into public.push_suscripciones (user_id, endpoint, p256dh, auth, dispositivo)
  values (auth.uid(), left(p_endpoint, 1000), left(p_p256dh, 200), left(p_auth, 100), left(p_dispositivo, 200));
end;
$$;
revoke execute on function public.registrar_push(text, text, text, text) from anon, public;
grant execute on function public.registrar_push(text, text, text, text) to authenticated;
