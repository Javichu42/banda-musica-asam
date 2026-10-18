/* Service worker de la web de la ASAM: hace que la web se pueda instalar como app y recibe
   las notificaciones. No guarda nada en caché: todo se pide siempre a la red. */
self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener("push", function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { title: "Banda de Música de Siero", body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "Banda de Música de Siero", {
    body: d.body || "",
    icon: "img/app/icono-192.png",
    badge: "img/app/insignia-96.png",
    tag: d.tag || undefined,
    renotify: !!d.tag,
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
