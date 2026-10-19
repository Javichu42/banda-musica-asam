// Función de Supabase para las cuentas (músicos y directiva) en un solo sitio.
// Acción pública: "login" (entrar con usuario o correo).
// Acciones con el permiso «Cuentas y permisos»: "list", "create", "update", "password", "remove".
// Una cuenta puede ser músico y/o profesor (ficha en la colección "musicos"),
// miembro de la directiva (fila en "administradores" con su cargo) o varias cosas.
// Un profesor que no toca en la banda tiene la ficha con formacion "Profesorado".
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, SupabaseClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}
const USUARIO_RE = /^[a-z0-9._-]{3,30}$/;
const FORMACIONES = ["Banda", "Bandín", "Banda y Bandín"];
const PUESTOS = ["Músico", "Jefe de sección", "Director"];

type Musico = { formacion: string; instrumento: string; voz?: string; cargo: string };
const SOLO_PROFESOR = { formacion: "Profesorado", instrumento: "", cargo: "Profesor" };
function leerProfesor(p: unknown): { especialidad: string } | null {
  if (!p) return null;
  const o = (typeof p === "object" ? p : {}) as Record<string, unknown>;
  return { especialidad: String(o.especialidad || "").trim().slice(0, 60) };
}

function leerMusico(m: Record<string, unknown> | null | undefined): Musico | string {
  if (!m) return "Faltan los datos de músico.";
  const formacion = String(m.formacion || "");
  const cargo = PUESTOS.includes(String(m.cargo)) ? String(m.cargo) : "Músico";
  let instrumento = String(m.instrumento || "").trim().slice(0, 60);
  const voz = String(m.voz || "").trim().slice(0, 20);
  if (!FORMACIONES.includes(formacion)) return "Elige Banda, Bandín o ambas.";
  if (!instrumento && cargo === "Director") instrumento = "Dirección";
  if (!instrumento) return "Falta el instrumento.";
  return voz ? { formacion, instrumento, voz, cargo } : { formacion, instrumento, cargo };
}


// ---------- Correo con los datos de acceso ----------
// Se envía con Brevo (BREVO_API_KEY) o con Resend (RESEND_API_KEY), lo que esté configurado
// en los secretos de las funciones de Supabase. MAIL_FROM = remitente ("Banda de Siero <correo@…>").
// WEB_URL = dirección de la web (para el enlace del correo).
function esc(t: string) { return t.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)); }
async function enviarAcceso(to: string, nombre: string, usuario: string, password: string, motivo: "nueva" | "clave") {
  const brevo = Deno.env.get("BREVO_API_KEY"), resend = Deno.env.get("RESEND_API_KEY");
  if (!brevo && !resend) return { enviado: false, error: "no-configurado" };
  const from = Deno.env.get("MAIL_FROM") || "";
  const web = (Deno.env.get("WEB_URL") || "").replace(/\/$/, "");
  const m = /^(.*)<([^>]+)>\s*$/.exec(from);
  const fromName = (m ? m[1].trim().replace(/^"|"$/g, "") : "") || "Banda de Música de Siero";
  const fromEmail = m ? m[2].trim() : from.trim();
  if (!fromEmail) return { enviado: false, error: "Falta el secreto MAIL_FROM (remitente)." };
  const asunto = motivo === "nueva" ? "Tu cuenta en la web de la Banda de Música de Siero" : "Tu nueva contraseña de la web de la Banda de Música de Siero";
  const enlace = web ? web + "/#privado" : "";
  const texto = `Hola, ${nombre}:\n\n${motivo === "nueva" ? "Ya tienes cuenta en la web de la Asociación Sierense Amigos de la Música." : "Te hemos puesto una contraseña nueva para entrar en la web."}\n\nUsuario: ${usuario}\nContraseña provisional: ${password}\n\n${enlace ? "Entra aquí: " + enlace + "\n\n" : ""}La primera vez que entres te pediremos que elijas una contraseña tuya.\n\nUn saludo,\nAsociación Sierense Amigos de la Música`;
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#1a1f2b;max-width:520px">
<p>Hola, ${esc(nombre)}:</p>
<p>${motivo === "nueva" ? "Ya tienes cuenta en la web de la <b>Asociación Sierense Amigos de la Música</b>." : "Te hemos puesto una contraseña nueva para entrar en la web de la <b>Asociación Sierense Amigos de la Música</b>."}</p>
<table style="border-collapse:collapse;margin:14px 0;background:#f2f5fa;border-radius:10px"><tr><td style="padding:10px 16px;color:#5b6475">Usuario</td><td style="padding:10px 16px;font-weight:bold">${esc(usuario)}</td></tr>
<tr><td style="padding:10px 16px;color:#5b6475">Contraseña provisional</td><td style="padding:10px 16px;font-weight:bold;font-family:monospace;font-size:16px">${esc(password)}</td></tr></table>
${enlace ? `<p><a href="${esc(enlace)}" style="display:inline-block;background:#3f7fd6;color:#fff;text-decoration:none;padding:11px 20px;border-radius:10px;font-weight:bold">Entrar en la web</a></p>` : ""}
<p>La primera vez que entres te pediremos que elijas una contraseña tuya.</p>
<p style="color:#5b6475;font-size:13px">Si no esperabas este correo, puedes ignorarlo.</p></div>`;
  try {
    let r: Response;
    if (brevo) {
      r = await fetch("https://api.brevo.com/v3/smtp/email", { method: "POST", headers: { "api-key": brevo, "Content-Type": "application/json", accept: "application/json" },
        body: JSON.stringify({ sender: { name: fromName, email: fromEmail }, to: [{ email: to, name: nombre }], subject: asunto, htmlContent: html, textContent: texto }) });
    } else {
      r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: "Bearer " + resend, "Content-Type": "application/json" },
        body: JSON.stringify({ from: `${fromName} <${fromEmail}>`, to: [to], subject: asunto, html, text: texto }) });
    }
    if (!r.ok) { const t = await r.text(); console.error("correo", r.status, t); return { enviado: false, error: "El servicio de correo respondió con un error (" + r.status + ")." }; }
    return { enviado: true };
  } catch (e) {
    console.error("correo", e);
    return { enviado: false, error: "No se ha podido conectar con el servicio de correo." };
  }
}

async function usuarioLibre(admin: SupabaseClient, usuario: string, salvo?: string) {
  const { data: m } = await admin.from("contenido").select("datos").eq("coleccion", "musicos").filter("datos->>usuario", "eq", usuario).limit(5);
  if ((m || []).some((r) => r.datos && r.datos.user_id !== salvo)) return false;
  const { data: a } = await admin.from("administradores").select("user_id").ilike("usuario", usuario).limit(5);
  if ((a || []).some((r) => r.user_id !== salvo)) return false;
  return true;
}

async function fichaMusico(admin: SupabaseClient, uid: string) {
  const { data } = await admin.from("contenido").select("id, datos").eq("coleccion", "musicos").filter("datos->>user_id", "eq", uid).limit(1);
  return data && data[0] ? data[0] : null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método no permitido." }, 405);
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
    const body = await req.json().catch(() => ({}));

    // ---------- Entrar con usuario o correo ----------
    if (body.action === "login") {
      const ident = String(body.usuario || "").trim().toLowerCase();
      const password = String(body.password || "");
      const fail = () => json({ error: "Usuario o contraseña incorrectos." }, 400);
      if (!ident || !password) return fail();
      let email = ident;
      if (!ident.includes("@")) {
        let uid: string | null = null;
        const { data: rows } = await admin.from("contenido").select("datos").eq("coleccion", "musicos").filter("datos->>usuario", "eq", ident).limit(1);
        uid = rows && rows[0] && rows[0].datos && rows[0].datos.user_id || null;
        if (!uid) {
          const { data: ad } = await admin.from("administradores").select("user_id").ilike("usuario", ident).limit(1);
          uid = ad && ad[0] ? ad[0].user_id : null;
        }
        if (!uid) return fail();
        const { data: u, error: ue } = await admin.auth.admin.getUserById(uid);
        if (ue || !u?.user?.email) return fail();
        email = u.user.email;
      }
      const pub = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
      const { data, error } = await pub.auth.signInWithPassword({ email, password });
      if (error || !data.session) return fail();
      return json({ session: { access_token: data.session.access_token, refresh_token: data.session.refresh_token } });
    }

    // ---------- A partir de aquí, permiso «Cuentas y permisos» ----------
    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Tienes que iniciar sesión." }, 401);
    const userClient = createClient(url, anon, { global: { headers: { Authorization: "Bearer " + token } }, auth: { persistSession: false } });
    const { data: ud, error: uerr } = await userClient.auth.getUser(token);
    if (uerr || !ud?.user) return json({ error: "Tu sesión ha caducado. Vuelve a iniciar sesión." }, 401);
    const { data: puede } = await userClient.rpc("tiene_permiso", { p: "cuentas" });
    if (puede !== true) return json({ error: "Tu cargo no tiene el permiso «Cuentas y permisos»." }, 403);
    const meId = ud.user.id;

    if (body.action === "list") {
      const [{ data: mus, error: me1 }, { data: adm, error: me2 }, { data: cargos, error: me3 }] = await Promise.all([
        admin.from("contenido").select("id, datos").eq("coleccion", "musicos"),
        admin.from("administradores").select("*"),
        admin.from("cargos").select("*").order("orden"),
      ]);
      if (me1 || me2 || me3) throw me1 || me2 || me3;
      const map = new Map<string, Record<string, unknown>>();
      for (const r of mus || []) {
        const d = r.datos || {};
        if (!d.user_id) continue;
        const esMusico = FORMACIONES.includes(d.formacion);
        map.set(d.user_id, { user_id: d.user_id, nombre: d.nombre || "", usuario: d.usuario || "", foto: d.foto || "",
          musico: esMusico ? { id: r.id, formacion: d.formacion, instrumento: d.instrumento, voz: d.voz || "", cargo: d.cargo || "Músico" } : null,
          profesor: d.profesor ? { especialidad: d.especialidad || "" } : null, directiva: null });
      }
      for (const a of adm || []) {
        const cur: Record<string, unknown> = map.get(a.user_id) || { user_id: a.user_id, nombre: "", usuario: "", musico: null, profesor: null };
        cur.nombre = cur.nombre || a.nombre || "";
        cur.usuario = cur.usuario || a.usuario || "";
        cur.foto = cur.foto || a.foto || "";
        cur.directiva = { cargo_id: a.cargo_id, desde: a.creado };
        map.set(a.user_id, cur);
      }
      // Correos y últimos accesos de todas las cuentas en pocas peticiones (de 1000 en 1000)
      const usuarios = new Map<string, { email?: string; last_sign_in_at?: string | null }>();
      for (let page = 1; page <= 20; page++) {
        const { data: lu, error: le } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
        if (le) throw le;
        for (const u of lu.users) usuarios.set(u.id, u);
        if (lu.users.length < 1000) break;
      }
      const out = [];
      for (const c of map.values()) {
        const u = usuarios.get(String(c.user_id));
        out.push({ ...c, email: u?.email || "", ultimo_acceso: u?.last_sign_in_at || null });
      }
      return json({ cuentas: out, cargos: cargos || [], me: meId });
    }

    if (body.action === "create") {
      const nombre = String(body.nombre || "").trim().slice(0, 100);
      const usuario = String(body.usuario || "").trim().toLowerCase();
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      if (!nombre) return json({ error: "Falta el nombre." }, 400);
      if (!USUARIO_RE.test(usuario)) return json({ error: "El usuario debe tener entre 3 y 30 caracteres: letras minúsculas, números, punto, guion o guion bajo." }, 400);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "El correo no es válido." }, 400);
      if (password.length < 8) return json({ error: "La contraseña debe tener al menos 8 caracteres." }, 400);
      const prof = leerProfesor(body.profesor);
      if (!body.musico && !body.directiva && !prof) return json({ error: "Marca al menos un acceso: músico, profesor o directiva." }, 400);
      let mus: Musico | null = null;
      if (body.musico) { const r = leerMusico(body.musico); if (typeof r === "string") return json({ error: r }, 400); mus = r; }
      let cargoId: string | null = null;
      if (body.directiva) {
        cargoId = String(body.directiva.cargo_id || "");
        const { data: c } = await admin.from("cargos").select("id").eq("id", cargoId).limit(1);
        if (!c || !c.length) return json({ error: "Elige un cargo de la directiva." }, 400);
      }
      if (!(await usuarioLibre(admin, usuario))) return json({ error: "Ese nombre de usuario ya existe." }, 400);

      const { data: created, error: ce } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { nombre, cambiar_clave: true } });
      if (ce) {
        if (/already|registered|exists/i.test(ce.message)) return json({ error: "Ya existe una cuenta con ese correo. Búscala en la lista y añádele el acceso." }, 400);
        return json({ error: ce.message }, 400);
      }
      const uid = created.user.id;
      try {
        if (mus || prof) {
          const { error } = await admin.from("contenido").insert({ coleccion: "musicos", id: uid, datos: { nombre, usuario, ...(mus || SOLO_PROFESOR), ...(prof ? { profesor: true, especialidad: prof.especialidad } : {}), user_id: uid } });
          if (error) throw error;
        }
        if (cargoId) {
          const { error } = await admin.from("administradores").insert({ user_id: uid, email, nombre, usuario, cargo_id: cargoId });
          if (error) throw error;
        }
      } catch (e) {
        await admin.from("contenido").delete().eq("coleccion", "musicos").eq("id", uid);
        await admin.auth.admin.deleteUser(uid);
        throw e;
      }
      const correo = body.enviar === false ? { enviado: false, error: "no-pedido" } : await enviarAcceso(email, nombre, usuario, password, "nueva");
      return json({ ok: true, id: uid, correo });
    }

    if (body.action === "update") {
      const uid = String(body.user_id || "");
      if (!uid) return json({ error: "Falta la cuenta." }, 400);
      const { data: u, error: ue } = await admin.auth.admin.getUserById(uid);
      if (ue || !u?.user) return json({ error: "No se encuentra esa cuenta." }, 404);
      const ficha = await fichaMusico(admin, uid);
      const { data: admRows } = await admin.from("administradores").select("*").eq("user_id", uid).limit(1);
      const adm = admRows && admRows[0];
      const nombre = String(body.nombre ?? (ficha?.datos?.nombre || adm?.nombre || "")).trim().slice(0, 100);
      const usuario = String(body.usuario ?? (ficha?.datos?.usuario || adm?.usuario || "")).trim().toLowerCase();
      if (!nombre) return json({ error: "Falta el nombre." }, 400);
      if (!USUARIO_RE.test(usuario)) return json({ error: "El usuario debe tener entre 3 y 30 caracteres: letras minúsculas, números, punto, guion o guion bajo." }, 400);
      if (!(await usuarioLibre(admin, usuario, uid))) return json({ error: "Ese nombre de usuario ya existe." }, 400);
      const eraMusico = !!ficha && FORMACIONES.includes(String(ficha.datos?.formacion));
      const quiereMusico = body.musico !== undefined ? !!body.musico : eraMusico;
      const prof = body.profesor !== undefined ? leerProfesor(body.profesor) : (ficha?.datos?.profesor ? { especialidad: String(ficha.datos.especialidad || "") } : null);
      const quiereDirectiva = body.directiva !== undefined ? !!body.directiva : !!adm;
      if (!quiereMusico && !quiereDirectiva && !prof) return json({ error: "La cuenta tiene que tener al menos un acceso. Si ya no lo necesita, bórrala." }, 400);
      if (uid === meId && !quiereDirectiva) return json({ error: "No puedes quitarte a ti mismo el acceso de la directiva." }, 400);

      // Directiva
      if (quiereDirectiva) {
        const cargoId = String((body.directiva && body.directiva.cargo_id) || adm?.cargo_id || "vocal");
        const { data: c } = await admin.from("cargos").select("id").eq("id", cargoId).limit(1);
        if (!c || !c.length) return json({ error: "Elige un cargo de la directiva." }, 400);
        const { error } = await admin.from("administradores").upsert({ user_id: uid, email: u.user.email, nombre, usuario, cargo_id: cargoId }, { onConflict: "user_id" });
        if (error) return json({ error: error.message }, 400);
      } else if (adm) {
        const { error } = await admin.from("administradores").delete().eq("user_id", uid);
        if (error) return json({ error: error.message }, 400);
      }
      // Músico y/o profesor (una sola ficha)
      if (quiereMusico || prof) {
        let r: Musico = SOLO_PROFESOR;
        if (quiereMusico) { const lm = leerMusico(body.musico ? body.musico : ficha?.datos); if (typeof lm === "string") return json({ error: lm }, 400); r = lm; }
        const prev = (ficha?.datos || {}) as Record<string, unknown>;
        const datos: Record<string, unknown> = { ...prev, nombre, usuario, ...r, user_id: uid };
        if (!r.voz) delete datos.voz;
        if (prof) { datos.profesor = true; datos.especialidad = prof.especialidad; } else { delete datos.profesor; delete datos.especialidad; }
        const { error } = await admin.from("contenido").upsert({ coleccion: "musicos", id: ficha ? ficha.id : uid, datos });
        if (error) return json({ error: error.message }, 400);
      } else if (ficha) {
        await admin.from("contenido").delete().eq("coleccion", "musicos").eq("id", ficha.id);
      }
      await admin.auth.admin.updateUserById(uid, { user_metadata: { ...(u.user.user_metadata || {}), nombre } });
      return json({ ok: true });
    }

    if (body.action === "password") {
      const uid = String(body.user_id || "");
      const password = String(body.password || "");
      if (password.length < 8) return json({ error: "La contraseña debe tener al menos 8 caracteres." }, 400);
      const { data: u } = await admin.auth.admin.getUserById(uid);
      if (!u?.user) return json({ error: "No se encuentra esa cuenta." }, 404);
      const { error } = await admin.auth.admin.updateUserById(uid, { password, user_metadata: { ...(u.user.user_metadata || {}), cambiar_clave: true } });
      if (error) return json({ error: error.message }, 400);
      let correo = { enviado: false, error: "no-pedido" } as { enviado: boolean; error?: string };
      if (body.enviar) {
        const ficha = await fichaMusico(admin, uid);
        const { data: ad } = await admin.from("administradores").select("nombre, usuario").eq("user_id", uid).limit(1);
        const nombre = String(ficha?.datos?.nombre || ad?.[0]?.nombre || u.user.user_metadata?.nombre || "");
        const usuario = String(ficha?.datos?.usuario || ad?.[0]?.usuario || u.user.email || "");
        correo = await enviarAcceso(u.user.email || "", nombre, usuario, password, "clave");
      }
      return json({ ok: true, correo });
    }

    if (body.action === "correo") {
      return json({ configurado: !!(Deno.env.get("BREVO_API_KEY") || Deno.env.get("RESEND_API_KEY")) && !!Deno.env.get("MAIL_FROM") });
    }

    if (body.action === "remove") {
      const uid = String(body.user_id || "");
      if (!uid) return json({ error: "Falta la cuenta." }, 400);
      if (uid === meId) return json({ error: "No puedes borrar tu propia cuenta." }, 400);
      // Primero la directiva: si era la última persona con «Cuentas y permisos», la base de datos lo impide
      const { error: de } = await admin.from("administradores").delete().eq("user_id", uid);
      if (de) return json({ error: de.message }, 400);
      await admin.from("contenido").delete().eq("coleccion", "musicos").filter("datos->>user_id", "eq", uid);
      const { error } = await admin.auth.admin.deleteUser(uid);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    return json({ error: "Acción desconocida." }, 400);
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : (e && typeof e === "object" && "message" in e ? String((e as { message: unknown }).message) : String(e));
    return json({ error: "Error interno: " + msg }, 500);
  }
});
