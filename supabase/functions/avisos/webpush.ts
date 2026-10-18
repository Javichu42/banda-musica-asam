// Notificaciones push de la web (Web Push) hechas solo con Web Crypto, sin librerías.
// Cifrado del mensaje: RFC 8291 (aes128gcm, RFC 8188). Firma del servidor: VAPID (RFC 8292).

export type Suscripcion = { endpoint: string; p256dh: string; auth: string };

const te = new TextEncoder();

export function b64uDecode(s: string): Uint8Array {
  const b = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4));
  const out = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
  return out;
}
export function b64uEncode(buf: ArrayBuffer | Uint8Array): string {
  const u = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function concat(...parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}
async function hmac(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const k = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", k, data));
}
// HKDF con una sola vuelta (la salida pedida es siempre ≤ 32 bytes)
async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, len: number): Promise<Uint8Array> {
  const prk = await hmac(salt, ikm);
  const okm = await hmac(prk, concat(info, new Uint8Array([1])));
  return okm.slice(0, len);
}

// Clave pública P-256 sin comprimir (65 bytes) → CryptoKey
async function importPublicRaw(raw: Uint8Array): Promise<CryptoKey> {
  return await crypto.subtle.importKey("raw", raw, { name: "ECDH", namedCurve: "P-256" }, true, []);
}
// Par de claves a partir de la privada (32 bytes) y la pública (65 bytes)
async function importPrivate(d: Uint8Array, pub: Uint8Array, usage: "ECDH" | "ECDSA"): Promise<CryptoKey> {
  const jwk: JsonWebKey = { kty: "EC", crv: "P-256", d: b64uEncode(d), x: b64uEncode(pub.slice(1, 33)), y: b64uEncode(pub.slice(33, 65)), ext: true };
  return await crypto.subtle.importKey("jwk", jwk, usage === "ECDH" ? { name: "ECDH", namedCurve: "P-256" } : { name: "ECDSA", namedCurve: "P-256" }, false,
    usage === "ECDH" ? ["deriveBits"] : ["sign"]);
}

/** Cifra el mensaje para una suscripción (RFC 8291). Se pueden fijar la sal y las claves para las pruebas. */
export async function cifrar(texto: string, sub: Suscripcion, fijo?: { salt: Uint8Array; asPrivate: Uint8Array; asPublic: Uint8Array }): Promise<Uint8Array> {
  const uaPublic = b64uDecode(sub.p256dh);
  const authSecret = b64uDecode(sub.auth);
  const salt = fijo ? fijo.salt : crypto.getRandomValues(new Uint8Array(16));
  let asPublic: Uint8Array, asKey: CryptoKey;
  if (fijo) { asPublic = fijo.asPublic; asKey = await importPrivate(fijo.asPrivate, fijo.asPublic, "ECDH"); }
  else {
    const kp = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]) as CryptoKeyPair;
    asKey = kp.privateKey;
    asPublic = new Uint8Array(await crypto.subtle.exportKey("raw", kp.publicKey));
  }
  const ecdh = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: await importPublicRaw(uaPublic) }, asKey, 256));
  const ikm = await hkdf(authSecret, ecdh, concat(te.encode("WebPush: info\0"), uaPublic, asPublic), 32);
  const cek = await hkdf(salt, ikm, te.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, te.encode("Content-Encoding: nonce\0"), 12);
  const plain = concat(te.encode(texto), new Uint8Array([2])); // delimitador del último registro
  const key = await crypto.subtle.importKey("raw", cek, { name: "AES-GCM" }, false, ["encrypt"]);
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, key, plain));
  const rs = new Uint8Array([0, 0, 16, 0]); // tamaño de registro 4096
  return concat(salt, rs, new Uint8Array([asPublic.length]), asPublic, cipher);
}

/** Cabecera Authorization de VAPID para el servicio push del endpoint */
export async function vapidAuth(endpoint: string, publicKey: string, privateKey: string, contacto: string): Promise<string> {
  const aud = new URL(endpoint).origin;
  const header = b64uEncode(te.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const claims = b64uEncode(te.encode(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: contacto })));
  const key = await importPrivate(b64uDecode(privateKey), b64uDecode(publicKey), "ECDSA");
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, te.encode(header + "." + claims));
  return "vapid t=" + header + "." + claims + "." + b64uEncode(sig) + ", k=" + publicKey;
}

/** Envía una notificación. Devuelve el código HTTP (404/410 = la suscripción ya no existe). */
export async function enviarPush(sub: Suscripcion, datos: unknown, vapid: { publicKey: string; privateKey: string; contacto: string }, ttl = 86400): Promise<number> {
  const body = await cifrar(JSON.stringify(datos), sub);
  const r = await fetch(sub.endpoint, {
    method: "POST",
    headers: {
      Authorization: await vapidAuth(sub.endpoint, vapid.publicKey, vapid.privateKey, vapid.contacto),
      "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream",
      TTL: String(ttl),
      Urgency: "normal",
    },
    body,
  });
  await r.arrayBuffer().catch(() => null);
  return r.status;
}
