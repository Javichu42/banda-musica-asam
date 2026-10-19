-- =====================================================================
-- Web de la ASAM · Recordatorio del mismo día
-- Cada mañana (07:00 UTC = 9:00 en verano y 8:00 en invierno, hora de
-- Asturias) llama a la función "avisos", que manda una notificación a los
-- convocados de los eventos de hoy que tengan activado «Recordatorio el
-- mismo día» (menos a quien dijo que no va). Cada evento se recuerda una vez.
-- Ejecútalo una vez en el SQL Editor. Se puede volver a ejecutar.
-- =====================================================================
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.unschedule(jobid) from cron.job where jobname = 'asam-recordatorios';
select cron.schedule('asam-recordatorios', '0 7 * * *', $$
  select net.http_post(
    url     := 'https://zcrubsidorkdbvmzanzw.supabase.co/functions/v1/avisos',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body    := '{"action": "recordatorios"}'::jsonb
  );
$$);

-- Para comprobarlo: select * from cron.job;  ·  historial: select * from cron.job_run_details order by start_time desc limit 5;
