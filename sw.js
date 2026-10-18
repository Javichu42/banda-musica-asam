/* Service worker de la web de la ASAM: solo recibe las notificaciones al móvil.
   No guarda nada en caché, así que la web siempre se carga actualizada. */
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
