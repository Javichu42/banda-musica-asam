// Función de Supabase para las cuentas de músico.
// Acciones públicas: "login" (entrar con usuario o correo).
// Acciones de administrador: "list", "create", "password", "remove".
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

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
        const { data: rows, error } = await admin.from("contenido").select("datos")
          .eq("coleccion", "musicos").filter("datos->>usuario", "eq", ident).limit(1);
        if (error) throw error;
        const uid = rows && rows[0] && rows[0].datos && rows[0].datos.user_id;
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

    // ---------- A partir de aquí, solo administradores ----------
    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Tienes que iniciar sesión." }, 401);
    const userClient = createClient(url, anon, { global: { headers: { Authorization: "Bearer " + token } }, auth: { persistSession: false } });
    const { data: ud, error: uerr } = await userClient.auth.getUser(token);
    if (uerr || !ud?.user) return json({ error: "Tu sesión ha caducado. Vuelve a iniciar sesión." }, 401);
    const { data: isAdmin } = await userClient.rpc("es_admin");
    if (isAdmin !== true) return json({ error: "No tienes permiso de administrador." }, 403);

    if (body.action === "list") {
      const { data: rows, error } = await admin.from("contenido").select("id, datos").eq("coleccion", "musicos");
      if (error) throw error;
      const withAccount = (rows || []).filter((r) => r.datos && r.datos.user_id);
      const out = [];
      for (const r of withAccount) {
        const { data: u } = await admin.auth.admin.getUserById(r.datos.user_id);
        out.push({ id: r.id, ...r.datos, email: u?.user?.email || "", ultimo_acceso: u?.user?.last_sign_in_at || null });
      }
      return json({ cuentas: out });
    }

    if (body.action === "create") {
      const nombre = String(body.nombre || "").trim();
      const usuario = String(body.usuario || "").trim().toLowerCase();
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const formacion = String(body.formacion || "");
      const instrumento = String(body.instrumento || "").trim();
      const cargo = body.cargo === "Jefe de sección" ? "Jefe de sección" : "Músico";
      if (!nombre) return json({ error: "Falta el nombre." }, 400);
      if (!USUARIO_RE.test(usuario)) return json({ error: "El usuario debe tener entre 3 y 30 caracteres: letras minúsculas, números, punto, guion o guion bajo." }, 400);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "El correo no es válido." }, 400);
      if (password.length < 8) return json({ error: "La contraseña debe tener al menos 8 caracteres." }, 400);
      if (!FORMACIONES.includes(formacion)) return json({ error: "Elige Banda, Bandín o ambas." }, 400);
      if (!instrumento) return json({ error: "Falta el instrumento." }, 400);

      const { data: taken } = await admin.from("contenido").select("id").eq("coleccion", "musicos").filter("datos->>usuario", "eq", usuario).limit(1);
      if (taken && taken.length) return json({ error: "Ese nombre de usuario ya existe." }, 400);

      const { data: created, error: ce } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { nombre } });
      if (ce) {
        if (/already|registered|exists/i.test(ce.message)) return json({ error: "Ya existe una cuenta con ese correo." }, 400);
        return json({ error: ce.message }, 400);
      }
      const uid = created.user.id;
      const datos = { nombre, usuario, formacion, instrumento, cargo, user_id: uid };
      const { error: ie } = await admin.from("contenido").insert({ coleccion: "musicos", id: uid, datos });
      if (ie) { await admin.auth.admin.deleteUser(uid); throw ie; }
      return json({ ok: true, id: uid });
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
      if (!uid) return json({ error: "Falta el músico." }, 400);
      if (uid === ud.user.id) return json({ error: "No puedes borrar tu propia cuenta." }, 400);
      await admin.from("contenido").delete().eq("coleccion", "musicos").filter("datos->>user_id", "eq", uid);
      // Si además es administrador, se conserva su cuenta y solo deja de ser músico
      const { data: adm } = await admin.from("administradores").select("user_id").eq("user_id", uid).limit(1);
      if (!adm || !adm.length) await admin.auth.admin.deleteUser(uid);
      return json({ ok: true });
    }

    return json({ error: "Acción desconocida." }, 400);
  } catch (e) {
    console.error(e);
    return json({ error: "Error interno: " + (e instanceof Error ? e.message : String(e)) }, 500);
  }
});
