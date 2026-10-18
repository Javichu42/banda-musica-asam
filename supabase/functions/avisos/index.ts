// Notificaciones al móvil de los músicos (Web Push).
// Acciones:
//   "clave"   → devuelve la clave pública VAPID (sin sesión: no es secreta)
//   "prueba"  → manda una notificación de prueba a los móviles de quien llama
//   "evento"  → avisa a los convocados de uno o varios eventos nuevos (permiso «Área de músicos»)
//   "anuncio" → avisa de un anuncio nuevo a sus destinatarios (cualquier miembro de la directiva)
// Secretos: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY y, opcional, VAPID_CONTACT (mailto:…).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { enviarPush, Suscripcion } from "./webpush.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}
type Musico = { user_id?: string; formacion?: string; nombre?: string };
type Evento = { id: string; titulo?: string; fecha?: string; hora?: string; lugar?: string; tipo?: string; formacion?: string };

function convocado(e: Evento, m: Musico) {
  const f = e.formacion || "Banda";
  if (f === "Asociación" || f === "Escuela") return true;
  if (m.formacion === "Banda y Bandín" || f === "Banda y Bandín") return true;
  return f === m.formacion;
}
function paraAnuncio(dest: string, m: Musico) {
  const d = dest || "Todos";
  return d === "Todos" || m.formacion === "Banda y Bandín" || m.formacion === d;
}
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
function fechaLarga(iso?: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return DIAS[dt.getUTCDay()] + " " + d + " de " + MESES[m - 1];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método no permitido." }, 405);
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapid = { publicKey: Deno.env.get("VAPID_PUBLIC_KEY") || "", privateKey: Deno.env.get("VAPID_PRIVATE_KEY") || "", contacto: Deno.env.get("VAPID_CONTACT") || "mailto:administracion@bandadesiero.es" };
    const body = await req.json().catch(() => ({}));
    // La clave pública no es secreta: se da sin sesión
    if (body.action === "clave") return json({ publicKey: vapid.publicKey || null });

    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Tienes que iniciar sesión." }, 401);
    const userClient = createClient(url, anon, { global: { headers: { Authorization: "Bearer " + token } }, auth: { persistSession: false } });
    const { data: ud, error: uerr } = await userClient.auth.getUser(token);
    if (uerr || !ud?.user) return json({ error: "Tu sesión ha caducado. Vuelve a iniciar sesión." }, 401);

    if (!vapid.publicKey || !vapid.privateKey) return json({ error: "Las notificaciones no están configuradas (faltan las claves VAPID)." }, 503);

    const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });

    // Envía a una lista de usuarios y limpia los móviles que ya no existen
    async function enviarA(userIds: string[], datos: Record<string, unknown>) {
      if (!userIds.length) return { personas: 0, moviles: 0, enviados: 0 };
      const { data: subs, error } = await admin.from("push_suscripciones").select("id, user_id, endpoint, p256dh, auth").in("user_id", userIds);
      if (error) throw error;
      let enviados = 0;
      const muertas: string[] = [];
      const errores: { servicio: string; estado: number; detalle: string }[] = [];
      await Promise.all((subs || []).map(async (s) => {
        const servicio = new URL(s.endpoint).host;
        try {
          const r = await enviarPush(s as Suscripcion, datos, vapid);
          if (r.status >= 200 && r.status < 300) enviados++;
          else if (r.status === 404 || r.status === 410) muertas.push(s.id);
          else { console.error("push", r.status, servicio, r.texto); errores.push({ servicio, estado: r.status, detalle: r.texto }); }
        } catch (e) { console.error("push", servicio, e); errores.push({ servicio, estado: 0, detalle: String(e) }); }
      }));
      if (muertas.length) await admin.from("push_suscripciones").delete().in("id", muertas);
      const conEnvio = new Set((subs || []).filter((s) => !muertas.includes(s.id)).map((s) => s.user_id));
      return { personas: conEnvio.size, moviles: (subs || []).length - muertas.length, enviados, caducados: muertas.length, errores };
    }

    if (body.action === "prueba") {
      const r = await enviarA([ud.user.id], { title: "🔔 Avisos activados", body: "Así te llegarán las convocatorias de la Banda de Música de Siero.", url: "/#musicos-agenda", tag: "prueba" });
      return json({ ok: true, ...r });
    }

    const { data: musRows, error: me } = await admin.from("contenido").select("datos").eq("coleccion", "musicos");
    if (me) throw me;
    const musicos: Musico[] = (musRows || []).map((r) => r.datos as Musico).filter((m) => m && m.user_id);

    if (body.action === "evento") {
      const { data: puede } = await userClient.rpc("tiene_permiso", { p: "musica" });
      if (puede !== true) return json({ error: "Tu cargo no puede avisar de eventos." }, 403);
      const ids: string[] = (Array.isArray(body.ids) ? body.ids : [body.id]).filter(Boolean).map(String).slice(0, 200);
      if (!ids.length) return json({ error: "Falta el evento." }, 400);
      const { data: evRows, error: ee } = await admin.from("contenido").select("id, datos").eq("coleccion", "eventos").in("id", ids);
      if (ee) throw ee;
      const evs: Evento[] = (evRows || []).map((r) => ({ id: r.id, ...(r.datos as Evento) })).sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));
      if (!evs.length) return json({ error: "No se encuentra el evento." }, 404);
      const e = evs[0];
      const quien = musicos.filter((m) => convocado(e, m) && m.user_id !== ud.user.id).map((m) => String(m.user_id));
      const tipo = e.tipo ? e.tipo.toLowerCase() : "convocatoria";
      const title = evs.length > 1 ? "📅 " + evs.length + " " + (e.tipo === "Ensayo" ? "ensayos" : "convocatorias") + " nuevas: " + (e.titulo || "") : "📅 Nueva " + (["ensayo", "concierto", "pasacalles", "desfile"].includes(tipo) ? "convocatoria" : tipo) + ": " + (e.titulo || "");
      const cuando = fechaLarga(e.fecha) + (e.hora ? " a las " + e.hora : "");
      const text = evs.length > 1 ? "Desde el " + cuando + (e.lugar ? " · " + e.lugar : "") + ". ¿Vas a ir? Responde en la agenda." : cuando + (e.lugar ? " · " + e.lugar : "") + ". ¿Vas a ir? Toca para responder.";
      const r = await enviarA(quien, { title: title.slice(0, 120), body: text.slice(0, 240), url: evs.length > 1 ? "/#musicos-agenda" : "/#musicos-evento~" + e.id, tag: "evento-" + e.id });
      return json({ ok: true, ...r });
    }

    if (body.action === "anuncio") {
      const { data: esAdmin } = await userClient.rpc("es_admin");
      if (esAdmin !== true) return json({ error: "Solo la directiva puede avisar de anuncios." }, 403);
      const { data: an, error: ae } = await admin.from("interno").select("id, datos").eq("coleccion", "anuncios").eq("id", String(body.id || "")).limit(1);
      if (ae) throw ae;
      const a = an && an[0];
      if (!a) return json({ error: "No se encuentra el anuncio." }, 404);
      const d = a.datos as { titulo?: string; texto?: string; destinatarios?: string };
      const quien = musicos.filter((m) => paraAnuncio(d.destinatarios || "Todos", m) && m.user_id !== ud.user.id).map((m) => String(m.user_id));
      const r = await enviarA(quien, { title: "📣 " + (d.titulo || "Nuevo aviso").slice(0, 110), body: (d.texto || "Toca para leerlo.").slice(0, 240), url: "/#musicos-avisos", tag: "anuncio-" + a.id });
      return json({ ok: true, ...r });
    }

    return json({ error: "Acción desconocida." }, 400);
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : (e && typeof e === "object" && "message" in e ? String((e as { message: unknown }).message) : String(e));
    return json({ error: "Error interno: " + msg }, 500);
  }
});
