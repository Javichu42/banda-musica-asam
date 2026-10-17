// Función de Supabase para gestionar administradores desde el panel de la web.
// Acciones: "list" (ver administradores), "create" (crear uno nuevo), "remove" (quitar el acceso).
// Solo responde a usuarios que ya son administradores.
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

async function findUserIdByEmail(admin: ReturnType<typeof createClient>, email: string): Promise<string | null> {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => (u.email || "").toLowerCase() === email);
    if (hit) return hit.id;
    if (data.users.length < 200) return null;
  }
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método no permitido." }, 405);

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // 1. Comprobar quién llama y que sea administrador
    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Tienes que iniciar sesión." }, 401);
    const userClient = createClient(url, anon, { global: { headers: { Authorization: "Bearer " + token } }, auth: { persistSession: false } });
    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    if (userError || !userData?.user) return json({ error: "Tu sesión ha caducado. Vuelve a iniciar sesión." }, 401);
    const me = userData.user;
    const { data: isAdmin, error: adminError } = await userClient.rpc("es_admin");
    if (adminError || isAdmin !== true) return json({ error: "No tienes permiso de administrador." }, 403);

    const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
    const body = await req.json().catch(() => ({}));

    // 2. Acciones
    if (body.action === "list") {
      const { data, error } = await admin.from("administradores").select("user_id, email, creado").order("creado");
      if (error) throw error;
      return json({ admins: data, me: me.id });
    }

    if (body.action === "create") {
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "El correo no es válido." }, 400);
      if (password.length < 8) return json({ error: "La contraseña debe tener al menos 8 caracteres." }, 400);

      let userId: string | null = null;
      let existed = false;
      const { data: created, error: createError } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
      if (createError) {
        if (/already|registered|exists/i.test(createError.message)) {
          userId = await findUserIdByEmail(admin, email);
          existed = true;
          if (!userId) return json({ error: "Ese correo ya existe pero no se ha podido encontrar." }, 400);
        } else {
          return json({ error: createError.message }, 400);
        }
      } else {
        userId = created.user.id;
      }

      const { error: insertError } = await admin.from("administradores").upsert({ user_id: userId, email }, { onConflict: "user_id" });
      if (insertError) throw insertError;
      return json({ ok: true, existed });
    }

    if (body.action === "remove") {
      const target = String(body.user_id || "");
      if (!target) return json({ error: "Falta el usuario." }, 400);
      if (target === me.id) return json({ error: "No puedes quitarte el acceso a ti mismo." }, 400);
      // Borra la cuenta; su fila de administradores se borra sola (on delete cascade)
      const { error } = await admin.auth.admin.deleteUser(target);
      if (error) {
        const { error: delError } = await admin.from("administradores").delete().eq("user_id", target);
        if (delError) throw delError;
      }
      return json({ ok: true });
    }

    return json({ error: "Acción desconocida." }, 400);
  } catch (e) {
    console.error(e);
    return json({ error: "Error interno: " + (e instanceof Error ? e.message : String(e)) }, 500);
  }
});
