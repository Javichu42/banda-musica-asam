// Función antigua para gestionar administradores. Desde que existen los cargos de la
// directiva, las cuentas se gestionan todas con la función "musicos" (Personas y accesos).
// Se deja solo para mostrar la lista a quien tenga el permiso «Cuentas y permisos».
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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Método no permitido." }, 405);
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Tienes que iniciar sesión." }, 401);
    const userClient = createClient(url, anon, { global: { headers: { Authorization: "Bearer " + token } }, auth: { persistSession: false } });
    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    if (userError || !userData?.user) return json({ error: "Tu sesión ha caducado. Vuelve a iniciar sesión." }, 401);
    const { data: puede } = await userClient.rpc("tiene_permiso", { p: "cuentas" });
    if (puede !== true) return json({ error: "Tu cargo no tiene el permiso «Cuentas y permisos»." }, 403);
    const body = await req.json().catch(() => ({}));
    if (body.action === "list") {
      const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
      const { data, error } = await admin.from("administradores").select("user_id, email, nombre, cargo_id, creado").order("creado");
      if (error) throw error;
      return json({ admins: data, me: userData.user.id });
    }
    return json({ error: "Las cuentas se gestionan ahora en Administración → Personas y accesos." }, 400);
  } catch (e) {
    console.error(e);
    return json({ error: "Error interno: " + (e instanceof Error ? e.message : String(e)) }, 500);
  }
});
