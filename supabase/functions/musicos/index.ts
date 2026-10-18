// Función de Supabase para las cuentas (músicos y directiva) en un solo sitio.
// Acción pública: "login" (entrar con usuario o correo).
// Acciones con el permiso «Cuentas y permisos»: "list", "create", "update", "password", "remove".
// Una cuenta puede ser músico (ficha en la colección "musicos"), miembro de la
// directiva (fila en "administradores" con su cargo) o las dos cosas.
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
        admin.from("administradores").select("user_id, email, nombre, usuario, cargo_id, creado"),
        admin.from("cargos").select("*").order("orden"),
      ]);
      if (me1 || me2 || me3) throw me1 || me2 || me3;
      const map = new Map<string, Record<string, unknown>>();
      for (const r of mus || []) {
        const d = r.datos || {};
        if (!d.user_id) continue;
        map.set(d.user_id, { user_id: d.user_id, nombre: d.nombre || "", usuario: d.usuario || "", musico: { id: r.id, formacion: d.formacion, instrumento: d.instrumento, voz: d.voz || "", cargo: d.cargo || "Músico" }, directiva: null });
      }
      for (const a of adm || []) {
        const cur = map.get(a.user_id) || { user_id: a.user_id, nombre: "", usuario: "", musico: null };
        cur.nombre = cur.nombre || a.nombre || "";
        cur.usuario = cur.usuario || a.usuario || "";
        cur.directiva = { cargo_id: a.cargo_id, desde: a.creado };
        map.set(a.user_id, cur);
      }
      const out = [];
      for (const c of map.values()) {
        const { data: u } = await admin.auth.admin.getUserById(String(c.user_id));
        out.push({ ...c, email: u?.user?.email || "", ultimo_acceso: u?.user?.last_sign_in_at || null });
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
      if (!body.musico && !body.directiva) return json({ error: "Marca al menos un acceso: músico o directiva." }, 400);
      let mus: Musico | null = null;
      if (body.musico) { const r = leerMusico(body.musico); if (typeof r === "string") return json({ error: r }, 400); mus = r; }
      let cargoId: string | null = null;
      if (body.directiva) {
        cargoId = String(body.directiva.cargo_id || "");
        const { data: c } = await admin.from("cargos").select("id").eq("id", cargoId).limit(1);
        if (!c || !c.length) return json({ error: "Elige un cargo de la directiva." }, 400);
      }
      if (!(await usuarioLibre(admin, usuario))) return json({ error: "Ese nombre de usuario ya existe." }, 400);

      const { data: created, error: ce } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { nombre } });
      if (ce) {
        if (/already|registered|exists/i.test(ce.message)) return json({ error: "Ya existe una cuenta con ese correo. Búscala en la lista y añádele el acceso." }, 400);
        return json({ error: ce.message }, 400);
      }
      const uid = created.user.id;
      try {
        if (mus) {
          const { error } = await admin.from("contenido").insert({ coleccion: "musicos", id: uid, datos: { nombre, usuario, ...mus, user_id: uid } });
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
      return json({ ok: true, id: uid });
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
      const quiereMusico = body.musico !== undefined ? !!body.musico : !!ficha;
      const quiereDirectiva = body.directiva !== undefined ? !!body.directiva : !!adm;
      if (!quiereMusico && !quiereDirectiva) return json({ error: "La cuenta tiene que tener al menos un acceso. Si ya no lo necesita, bórrala." }, 400);
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
      // Músico
      if (quiereMusico) {
        const r = leerMusico(body.musico ? body.musico : ficha?.datos);
        if (typeof r === "string") return json({ error: r }, 400);
        const prev = (ficha?.datos || {}) as Record<string, unknown>;
        const datos: Record<string, unknown> = { ...prev, nombre, usuario, ...r, user_id: uid };
        if (!r.voz) delete datos.voz;
        const { error } = await admin.from("contenido").upsert({ coleccion: "musicos", id: ficha ? ficha.id : uid, datos });
        if (error) return json({ error: error.message }, 400);
      } else if (ficha) {
        await admin.from("contenido").delete().eq("coleccion", "musicos").eq("id", ficha.id);
      }
      await admin.auth.admin.updateUserById(uid, { user_metadata: { nombre } });
      return json({ ok: true });
    }

    if (body.action === "password") {
      const uid = String(body.user_id || "");
      const password = String(body.password || "");
      if (password.length < 8) return json({ error: "La contraseña debe tener al menos 8 caracteres." }, 400);
      const { error } = await admin.auth.admin.updateUserById(uid, { password });
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
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
