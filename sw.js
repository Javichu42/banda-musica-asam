/* Service worker de la web de la ASAM: hace que la web se pueda instalar como app y recibe
   las notificaciones. No guarda nada en caché: todo se pide siempre a la red. */
self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener("push", function (e) {
  var d = {}, txt = "";
  try { txt = e.data ? e.data.text() : ""; } catch (err) { txt = ""; }
  try { d = txt ? JSON.parse(txt) : {}; } catch (err) { d = { body: txt }; }
  var base = self.registration.scope;
  var titulo = String(d.title || "Banda de Música de Siero");
  var cuerpo = String(d.body || "Toca para verlo en la app de la banda.");
  e.waitUntil(self.registration.showNotification(titulo, {
    body: cuerpo,
    icon: new URL("img/app/icono-192.png", base).href,
    badge: new URL("img/app/insignia-96.png", base).href,
    tag: d.tag || undefined,
    renotify: !!d.tag,
    silent: false,
    vibrate: [120, 60, 120],
    timestamp: Date.now(),
    lang: "es",
    dir: "ltr",
    data: { url: d.url || "/#musicos-agenda" }
  }));
});

self.addEventListener("notificationclick", function (e) {
  e.notification.close();
  var url = new URL((e.notification.data && e.notification.data.url) || "/#musicos-agenda", self.location.origin).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) {
      var c = list[i];
      if (new URL(c.url).origin === self.location.origin && "focus" in c) {
        return c.focus().then(function (w) { return w && "navigate" in w ? w.navigate(url) : null; });
      }
    }
    return self.clients.openWindow ? self.clients.openWindow(url) : null;
  }));
});

// Necesario para que Android la instale como app (sin la barra del navegador): todo va a la red
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(fetch(e.request).catch(function () {
    return e.request.mode === "navigate"
      ? new Response("<!doctype html><meta charset=utf-8><meta name=viewport content='width=device-width'><body style='font-family:sans-serif;padding:24px'><h2>Sin conexión</h2><p>Conéctate a internet para usar la app de la Banda de Música de Siero.</p>", { headers: { "Content-Type": "text/html; charset=utf-8" } })
      : Response.error();
  }));
});

// Si el navegador renueva la suscripción por su cuenta, se rehace con la misma clave;
// la web la vuelve a guardar en cuanto se abre.
self.addEventListener("pushsubscriptionchange", function (e) {
  var opts = e.oldSubscription && e.oldSubscription.options;
  if (!opts || !opts.applicationServerKey) return;
  e.waitUntil(self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: opts.applicationServerKey }));
});
