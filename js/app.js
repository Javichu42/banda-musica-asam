/* Web de la Asociación Sierense Amigos de la Música (ASAM) */
(function () {
"use strict";
var LOGO_FULL = "img/logo.webp";
var LOGO_MARK = "img/logo-simbolo.webp";
var CFG = window.ASAM_CONFIG || {};
var SB = null, SESSION = null;
function configured() { return /^https:\/\//.test(CFG.supabaseUrl || "") && CFG.supabaseAnonKey && !/PEGA_AQUI/.test(CFG.supabaseAnonKey + CFG.supabaseUrl); }
function isStored(id) { return !!id && !/^img\//.test(id); }
function blobUrl(id) { if (id && /^img\//.test(id)) return id; return id && CFG.supabaseUrl ? String(CFG.supabaseUrl).replace(/\/$/, "") + "/storage/v1/object/public/fotos/" + encodeURI(id) : ""; }
var INSTRUMENTOS = ["Flautín", "Flauta", "Oboe", "Fagot", "Requinto", "Clarinete", "Clarinete bajo", "Saxofón soprano", "Saxofón alto", "Saxofón tenor", "Saxofón barítono", "Trompa", "Trompeta", "Fliscorno", "Trombón", "Bombardino", "Tuba", "Contrabajo", "Percusión", "Piano"];

/* ---------- Datos iniciales (se usan si la base de datos no está disponible) ---------- */
var DEFAULTS = {
  directiva: [
    { id: "presidente", cargo: "Presidente", nombre: "Carlos Presa", orden: 1, foto: "img/personas/carlos-presa.jpg" },
    { id: "jaime-pelaez", cargo: "Vocal", nombre: "Jaime Peláez", orden: 5 }
  ],
  directores: [
    { id: "emilio-huerta", nombre: "Emilio Huerta Villanueva", cargo: "Director de la Banda de Música", color: "azul", orden: 1, foto: "img/personas/emilio-huerta.jpg",
      bio: "Nacido en Traspando (Siero), es flautista de la banda desde su creación en 1984. Dirigió el Bandín entre 2008 y 2012, fue subdirector de la Banda de 2014 a 2021 y desde septiembre de 2021 es su director.",
      trayectoria: "Profesor de Piano, Profesor Superior de Lenguaje Musical y de Órgano por el Conservatorio Superior Eduardo Martínez Torner de Oviedo.\nMaestro especialista en Educación Musical por la Universidad de Oviedo.\nOrganista titular de la parroquia de San Pedro Apóstol de Pola de Siero.\nCompositor y arreglista para banda, órgano, coro, teatro y música infantil.\nMiembro del dúo Nuberu entre 1991 y 2007." },
    { id: "victor-peino", nombre: "Víctor Peinó Ornia", cargo: "Director del Bandín", color: "naranja", orden: 2,
      bio: "Joven clarinetista formado en la casa. Tomó el relevo de la flautista Silvia Ovies, que se dedica en exclusiva a la docencia en la escuela de la ASAM, y debutó al frente del Bandín con bandas sonoras de cine y una obra de Holst.",
      trayectoria: "" }
  ],
  eventos: [
    { id: "carnaval-2025", titulo: "Concierto de Carnaval", fecha: "2025-03-14", hora: "20:00", lugar: "Auditorio de Pola de Siero", formacion: "Banda", descripcion: "" },
    { id: "primavera-2025", titulo: "Concierto de Primavera", fecha: "2025-04-11", hora: "20:00", lugar: "La Fresneda", formacion: "Banda", descripcion: "" },
    { id: "sabadell-2025", titulo: "Intercambio con la banda de Sabadell", fecha: "2025-05-02", hora: "20:00", lugar: "Auditorio de Pola de Siero", formacion: "Banda", descripcion: "" },
    { id: "cosmupa-2025", titulo: "Concierto con la COSMUPA", fecha: "2025-05-16", hora: "20:00", lugar: "Auditorio de Pola de Siero", formacion: "Banda", descripcion: "" },
    { id: "llanera-2025", titulo: "Concierto en Llanera", fecha: "2025-05-23", hora: "19:00", lugar: "Posada de Llanera", formacion: "Banda", descripcion: "" },
    { id: "tardeo-2025", titulo: "Concierto del Tardeo", fecha: "2025-07-04", hora: "20:00", lugar: "El Paraguas, Pola de Siero", formacion: "Banda", descripcion: "" }
  ],
  noticias: [
    { id: "convenio-2025", titulo: "La ASAM y el Ayuntamiento de Siero renuevan su convenio", fecha: "2025-11-03", etiqueta: "Asociación",
      texto: "El acuerdo mantiene el apoyo municipal a la promoción y difusión de la música en el concejo. Al acto acudieron representantes de la junta directiva, la concejala de Cultura y el alcalde." },
    { id: "mecenas", titulo: "Nuevos apoyos para la música en Siero", fecha: "", etiqueta: "Mecenas",
      texto: "Voltaje se suma como mecenas de la Banda y el Bandín, y Ornia&Campal Abogados firma un convenio de colaboración." },
    { id: "santa-cecilia-40", titulo: "Santa Cecilia con sabor a reencuentro", fecha: "", etiqueta: "Banda",
      texto: "Antiguos músicos vuelven a la banda y Alfonso Sánchez Peña, director durante más de treinta años, dirige dos piezas, entre ellas su pasodoble «El mar y la montaña»." },
    { id: "navidad-siero-musical", titulo: "Concierto de Navidad con la Sociedad Siero Musical", fecha: "", etiqueta: "Banda y Bandín",
      texto: "Más de un centenar de músicos y cantantes en el Auditorio, con la Marcha Radetzky como broche y el público marcando el compás." },
    { id: "nuevo-director-bandin", titulo: "Víctor Peinó Ornia, nuevo director del Bandín", fecha: "", etiqueta: "Bandín",
      texto: "El joven clarinetista sustituye a Silvia Ovies, que pasa a dedicarse por completo a la docencia en la escuela." }
  ],
  enlaces: [
    { id: "facebook", nombre: "Facebook", url: "https://www.facebook.com/banda.siero/", orden: 1 },
    { id: "instagram", nombre: "Instagram", url: "https://www.instagram.com/banda_asam/", orden: 2 },
    { id: "youtube", nombre: "YouTube", url: "https://www.youtube.com/@BandadeM%C3%BAsicadeSiero", orden: 3 }
  ],
  fotos: [],
  musicos: [],
  historia: [
    { id: "h-1984", anio: "1984", detalle: "24 de diciembre", titulo: "Nace la Asociación", color: "azul", orden: 10, fotos: [], texto: "Se firma el acta fundacional de la Asociación Sierense Amigos de la Música, con la banda como proyecto central." },
    { id: "h-1985", anio: "1985", detalle: "Febrero", titulo: "Primera actuación", color: "negro", orden: 20, fotos: [], texto: "La banda debuta en el parque de Pola de Siero con un repertorio de pasodobles. La primera partitura que tocó fue «El abanico»." },
    { id: "h-sanchez-pena", anio: "+30 años", detalle: "Una larga etapa", titulo: "La etapa de Alfonso Sánchez Peña", color: "verde", orden: 30, fotos: [], texto: "Durante más de tres décadas dirige la banda y le da su sello. Es autor, entre otras obras, del pasodoble «El mar y la montaña»." },
    { id: "h-2008", anio: "2008", detalle: "Hasta 2012", titulo: "El Bandín coge fuerza", color: "naranja", orden: 40, fotos: [], texto: "Emilio Huerta, flautista de la banda desde su fundación, dirige el Bandín, la cantera de jóvenes músicos." },
    { id: "h-2021", anio: "2021", detalle: "Septiembre", titulo: "Nueva dirección de la Banda", color: "azul", orden: 50, fotos: [], texto: "Emilio Huerta Villanueva, subdirector desde 2014, asume la dirección de la Banda de Música de Siero." },
    { id: "h-2024", anio: "2024", detalle: "40 aniversario", titulo: "Cuarenta años y nueva imagen", color: "verde", orden: 60, fotos: [], texto: "La asociación renueva su identidad: el azul representa la tradición, el verde el futuro en Siero y el naranja el amanecer musical de los más jóvenes." },
    { id: "h-hoy", anio: "Hoy", detalle: "Nueva etapa", titulo: "Relevo en el Bandín", color: "naranja", orden: 70, fotos: [], texto: "El clarinetista Víctor Peinó Ornia toma la batuta del Bandín, una de las pocas formaciones infantojuveniles de Asturias." }
  ],
  contacto: { direccion: "Calle Alcalde Parrondo, 32 · 33510 Pola de Siero (Asturias)", telefono: "628 86 31 68", email: "administracion@bandadesiero.es", mapa: "https://maps.app.goo.gl/ekUwwADRScStcLzo6" },
  pie: { texto: "Asociación sin ánimo de lucro que enseña, toca y comparte música en el concejo de Siero desde 1984.", apoyos: "Con el apoyo del Ayuntamiento de Siero y la Fundación Caja Rural de Asturias", copyright: "© Asociación Sierense Amigos de la Música · Pola de Siero, Asturias" }
};

var COLLECTIONS = ["directiva", "directores", "eventos", "noticias", "enlaces", "fotos", "musicos", "historia"];
var MAPA_DEFECTO = "https://maps.app.goo.gl/ekUwwADRScStcLzo6";
var DATA = JSON.parse(JSON.stringify(DEFAULTS));
var LIVE = false;          // true cuando la base de datos responde
var DB = null, ASSETS = null, IS_ADMIN = false;
var FOTO_FILTER = "todas";
var EDITING = {};          // colección -> id en edición
var app = document.getElementById("app");

/* ---------- Utilidades ---------- */
function h(tag, attrs) {
  var el = document.createElement(tag);
  if (attrs) for (var k in attrs) {
    var v = attrs[k];
    if (v == null || v === false) continue;
    if (k === "text") el.textContent = v;
    else if (k === "html") el.innerHTML = v;
    else if (k === "class") el.className = v;
    else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (var i = 2; i < arguments.length; i++) add(el, arguments[i]);
  return el;
}
function add(el) {
  for (var i = 1; i < arguments.length; i++) addOne(el, arguments[i]);
}
function addOne(el, c) {
  if (c == null || c === false) return;
  if (Array.isArray(c)) { c.forEach(function (x) { addOne(el, x); }); return; }
  el.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
}
var MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
var MES_CORTO = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
function parseDate(s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? { y: +m[1], m: +m[2], d: +m[3] } : null; }
function fmtLong(s) { var p = parseDate(s); return p ? p.d + " de " + MESES[p.m - 1] + " de " + p.y : ""; }
function todayStr() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function initials(n) { return (n || "?").split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0].toUpperCase(); }).join(""); }
function colorVar(c) { return c === "naranja" ? "var(--naranja)" : c === "verde" ? "var(--verde)" : c === "negro" ? "var(--nota)" : "var(--azul)"; }
function safeUrl(u) { return /^https?:\/\//i.test(u || "") ? u : null; }
function byOrden(a, b) { return (Number(a.orden) || 999) - (Number(b.orden) || 999) || String(a.nombre || "").localeCompare(String(b.nombre || "")); }
function sortedNews() { return DATA.noticias.slice().sort(function (a, b) { if (!a.fecha && !b.fecha) return 0; if (!a.fecha) return 1; if (!b.fecha) return -1; return a.fecha < b.fecha ? 1 : -1; }); }
function eventsSplit() {
  var t = todayStr(), up = [], past = [];
  DATA.eventos.forEach(function (e) { (e.fecha >= t ? up : past).push(e); });
  up.sort(function (a, b) { return a.fecha < b.fecha ? -1 : 1; });
  past.sort(function (a, b) { return a.fecha < b.fecha ? 1 : -1; });
  return { up: up, past: past };
}
function photoSrc(f) { return f.asset ? blobUrl(f.asset) : ""; }
function adminLink(tab, label) { return IS_ADMIN ? h("a", { class: "admin-hint", href: "#admin-" + tab, text: "✎ " + label }) : null; }

/* ---------- Componentes públicos ---------- */
function pageHead(eyebrow, title, lead, cls) {
  return h("div", { class: "page-head" }, h("div", { class: "wrap" },
    h("span", { class: "eyebrow " + (cls || ""), text: eyebrow }), h("h1", { text: title }), lead ? h("p", { class: "lead", text: lead }) : null),
    h("div", { class: "staff-lines", "aria-hidden": "true" }));
}
function eventRow(e, past) {
  var p = parseDate(e.fecha);
  var fcls = /bandín|bandin/i.test(e.formacion || "") ? (/banda y/i.test(e.formacion) ? "banda" : "bandin") : /escuela/i.test(e.formacion || "") ? "escuela" : "banda";
  return h("div", { class: "event" + (past ? " past" : "") },
    h("div", { class: "cal" }, h("b", { text: p ? String(p.d) : "—" }), h("span", { text: p ? MES_CORTO[p.m - 1] + " " + String(p.y).slice(2) : "" })),
    h("div", null, h("h3", { text: e.titulo }),
      h("div", { class: "meta" }, e.hora ? h("span", { text: "🕗 " + e.hora }) : null, e.lugar ? h("span", { text: "📍 " + e.lugar }) : null),
      e.descripcion ? h("p", { text: e.descripcion }) : null),
    e.formacion ? h("span", { class: "pill " + fcls, text: e.formacion }) : null);
}
function newsCard(n, i) {
  var colors = ["var(--verde)", "var(--azul)", "var(--naranja)", "var(--nota)"];
  var fotos = Array.isArray(n.fotos) ? n.fotos.filter(Boolean) : [];
  var links = Array.isArray(n.enlaces) ? n.enlaces.filter(function (l) { return l && safeUrl(l.url); }) : [];
  function shot(id) { return { asset: id, titulo: n.titulo }; }
  var top = fotos.length
    ? h("button", { class: "cover", type: "button", "aria-label": "Ver foto de " + (n.titulo || "la noticia"), onclick: function () { openLightbox(shot(fotos[0])); } },
        h("img", { src: blobUrl(fotos[0]), alt: "", loading: "lazy" }))
    : h("div", { class: "bar", style: "background:" + colors[i % 4] });
  return h("article", { class: "post" }, top,
    h("div", { class: "in" }, n.fecha ? h("time", { datetime: n.fecha, text: fmtLong(n.fecha) }) : null,
      n.etiqueta ? h("span", { class: "tag", text: n.etiqueta }) : null, h("h3", { text: n.titulo }), n.texto ? h("p", { text: n.texto }) : null,
      fotos.length > 1 ? h("div", { class: "thumbs" }, fotos.slice(1).map(function (id) {
        return h("button", { type: "button", "aria-label": "Ver otra foto", onclick: function () { openLightbox(shot(id)); } }, h("img", { src: blobUrl(id), alt: "", loading: "lazy" }));
      })) : null,
      links.length ? h("div", { class: "post-links" }, links.map(function (l) {
        return h("a", { href: l.url, target: "_blank", rel: "noopener", text: "↗ " + (l.texto || l.url.replace(/^https?:\/\//, "")) });
      })) : null));
}
function emptyBox(msg, tab) { return h("div", { class: "empty" }, h("p", { text: msg }), adminLink(tab, "Añadir desde Administración")); }
function socialBrand(l) {
  var t = ((l.url || "") + " " + (l.nombre || "")).toLowerCase();
  if (/facebook|fb\.com/.test(t)) return "facebook";
  if (/instagram/.test(t)) return "instagram";
  if (/youtube|youtu\.be/.test(t)) return "youtube";
  if (/whatsapp|wa\.me/.test(t)) return "whatsapp";
  if (/tiktok/.test(t)) return "tiktok";
  if (/twitter|x\.com|(^|\s)x(\s|$)/.test(t)) return "x";
  if (/spotify/.test(t)) return "spotify";
  return "";
}
function linksList() {
  return DATA.enlaces.slice().sort(byOrden).filter(function (l) { return safeUrl(l.url); }).map(function (l) {
    var b = socialBrand(l);
    return h("a", { class: b ? "btn soc soc-" + b : "btn ghost", href: l.url, target: "_blank", rel: "noopener", text: l.nombre });
  });
}

/* ---------- Páginas ---------- */
var PAGES = {};

function yearsSinceFounding() {
  var d = new Date(), y = d.getFullYear() - 1984;
  if (d.getMonth() < 11 || (d.getMonth() === 11 && d.getDate() < 24)) y--;
  return y;
}

function excerpt(t, max) {
  t = String(t || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  var cut = t.slice(0, max); var sp = cut.lastIndexOf(" ");
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut) + "…";
}
function heroNews(n) {
  var foto = Array.isArray(n.fotos) && n.fotos[0];
  return h("article", { class: "hero-news" },
    foto ? h("div", { class: "hn-photo" }, h("img", { src: blobUrl(foto), alt: "" })) : null,
    h("div", { class: "hn-body" },
      h("span", { class: "eyebrow", text: "Última noticia" }),
      n.fecha ? h("time", { datetime: n.fecha, text: fmtLong(n.fecha) }) : null,
      h("h2", { text: n.titulo }),
      n.texto ? h("p", { text: excerpt(n.texto, foto ? 150 : 240) }) : null,
      h("a", { class: "btn primary", href: "#noticias", text: "Ver más" })));
}

PAGES.inicio = function () {
  var allNews = sortedNews(), latest = allNews[0], ev = eventsSplit().up.slice(0, 3), news = allNews.slice(1, 4);
  return [
    h("div", { class: "hero" },
      h("div", { class: "wrap" },
        h("div", null,
          h("span", { class: "eyebrow", text: "Pola de Siero · desde 1984" }),
          h("h1", { html: 'Ponemos <span class="a">música</span> a Siero: la <span class="v">banda</span>, el <span class="o">bandín</span> y la escuela.' }),
          h("p", { class: "lead", text: "La Asociación Sierense Amigos de la Música es una entidad sin ánimo de lucro que enseña, toca y comparte música en el concejo. Conciertos gratuitos, pasacalles en las fiestas y clases para todas las edades." }),
          h("div", { class: "actions" }, h("a", { class: "btn primary", href: "#actuaciones", text: "Ver actuaciones" }), h("a", { class: "btn ghost", href: "#contacto", text: "Apúntate a clase" }))),
        latest ? heroNews(latest) : h("div", { class: "logo-card" }, h("img", { src: LOGO_FULL, alt: "Logotipo de la Asociación Sierense Amigos de la Música" }))),
      h("div", { class: "staff-lines", "aria-hidden": "true" }),
      h("div", { class: "milestone" }, h("div", { class: "wrap ms-grid" },
        h("div", { class: "ms-years" },
          h("b", { text: String(yearsSinceFounding()) }),
          h("div", null, h("span", { class: "ms-big", text: "años poniendo música a Siero" }), h("span", { class: "ms-small", text: "Fundada el 24 de diciembre de 1984" }))),
        h("a", { class: "ms-item", href: "#banda" }, h("i", { class: "dot", style: "background:var(--azul)" }), h("b", { text: "Banda" }), h("span", { text: "Viento y percusión" })),
        h("a", { class: "ms-item", href: "#bandin" }, h("i", { class: "dot", style: "background:var(--naranja)" }), h("b", { text: "Bandín" }), h("span", { text: "Cantera de jóvenes músicos" })),
        h("a", { class: "ms-item", href: "#quienes" }, h("i", { class: "dot", style: "background:var(--verde)" }), h("b", { text: "Escuela" }), h("span", { text: "Clases para todas las edades" }))))),
    h("section", { class: "block" }, h("div", { class: "wrap" },
      h("div", { class: "row-head" }, h("h2", { text: "Tres maneras de vivir la música" })),
      h("div", { class: "doors" },
        h("a", { class: "door", href: "#banda" }, h("h3", null, h("i", { style: "background:var(--azul)" }), "La Banda"), h("p", { text: "Músicos profesionales y aficionados que llenan de música auditorios y fiestas del concejo." }), h("span", { class: "more", text: "Conoce la Banda →" })),
        h("a", { class: "door", href: "#bandin" }, h("h3", null, h("i", { style: "background:var(--naranja)" }), "El Bandín"), h("p", { text: "La cantera: los más jóvenes aprenden a tocar en grupo y preparan el relevo." }), h("span", { class: "more", text: "Conoce el Bandín →" })),
        h("a", { class: "door", href: "#quienes" }, h("h3", null, h("i", { style: "background:var(--verde)" }), "La Escuela"), h("p", { text: "Instrumento, repertorio y práctica en grupo para principiantes y músicos avanzados." }), h("span", { class: "more", text: "Quiénes somos →" }))))),
    h("section", { class: "block alt" }, h("div", { class: "wrap" },
      h("div", { class: "row-head" }, h("h2", { text: "Próximas actuaciones" }), h("a", { class: "btn ghost small", href: "#actuaciones", text: "Ver todas" })),
      ev.length ? h("div", { class: "events" }, ev.map(function (e) { return eventRow(e); })) : emptyBox("Pronto anunciaremos las próximas actuaciones. Síguenos en redes para no perderte nada.", "eventos"))),
    h("section", { class: "block" }, h("div", { class: "wrap" },
      news.length ? h("div", { class: "row-head" }, h("h2", { text: "Más noticias" }), h("a", { class: "btn ghost small", href: "#noticias", text: "Todas las noticias" })) : null,
      news.length ? h("div", { class: "news" }, news.map(function (n, i) { return newsCard(n, i + 1); })) : (latest ? null : emptyBox("Todavía no hay noticias publicadas.", "noticias")),
      h("div", { class: "join", style: "margin-top:40px" },
        h("div", null, h("b", { text: "¿Quieres tocar con nosotros?" }), h("p", { text: "Clases para todas las edades y sitio en el Bandín y la Banda. Hazte socio desde 12 € al año." })),
        h("a", { class: "btn", href: "#contacto", text: "Contacta" }))))
  ];
};

PAGES.quienes = function () {
  return [
    pageHead("Quiénes somos", "Una asociación hecha por y para la gente de Siero", "Entidad sin ánimo de lucro dedicada a promover y difundir la música en el concejo de Siero desde 1984."),
    h("section", { class: "block" }, h("div", { class: "wrap" }, h("div", { class: "two" },
      h("div", { class: "prose" },
        h("p", { html: "La <b>Asociación Sierense Amigos de la Música (ASAM)</b> nació en 1984 para promover y difundir la música en el concejo de Siero. Desde entonces organiza conciertos gratuitos, pone música a los pasacalles de las fiestas locales y forma a nuevas generaciones de músicos." }),
        h("p", { html: "Bajo su paraguas conviven tres proyectos: la <b>Banda de Música de Siero</b>, formada por instrumentistas de viento y percusión; <b>el Bandín</b>, donde los más jóvenes aprenden a tocar en grupo; y la <b>escuela de música</b>, abierta a principiantes y a músicos avanzados." }),
        h("p", { text: "La asociación se sostiene gracias a sus socios, al apoyo institucional del Ayuntamiento de Siero y la Fundación Caja Rural de Asturias, y a empresas mecenas y amigos que comparten nuestra afición." })),
      h("div", null,
        h("div", { class: "aside-card" }, h("h3", { text: "Escuela de música" }), h("p", { text: "Formación impartida por profesorado con experiencia, desde la teoría hasta la práctica instrumental." }),
          h("ul", null, h("li", { text: "Repertorio" }), h("li", { text: "Instrumentos de viento madera y metal" }), h("li", { text: "Percusión" }), h("li", { text: "Práctica de conjunto en el Bandín y la Banda" }))),
        h("div", { class: "socio" }, h("b", { text: "Hazte socio desde 12 € al año" }), h("p", { text: "Personas, empresas e instituciones pueden colaborar con la divulgación de la música en Siero y la Comarca del Nora haciéndose socio o mecenas." })))))),
    h("section", { class: "block alt" }, h("div", { class: "wrap" }, h("div", { class: "pillars" },
      h("div", { class: "pillar" }, h("h3", null, h("i", { style: "background:var(--azul)" }), "Misión"), h("p", { text: "Promover la cultura musical en Siero y en Asturias a través de la educación, la interpretación y la participación de toda la comunidad." })),
      h("div", { class: "pillar" }, h("h3", null, h("i", { style: "background:var(--verde)" }), "Visión"), h("p", { text: "Ser un referente cultural del concejo, con un entorno inclusivo donde personas de cualquier edad desarrollen su talento musical." })),
      h("div", { class: "pillar" }, h("h3", null, h("i", { style: "background:var(--naranja)" }), "Valores"), h("p", { text: "Colaboración, respeto y apoyo mutuo. Creemos que la música une a la gente, y por eso todo el mundo es bienvenido." })))))
  ];
};

PAGES.historia = function () {
  var items = DATA.historia.slice().sort(function (x, y) { return (Number(x.orden) || 999) - (Number(y.orden) || 999); });
  return [
    pageHead("Historia", "Más de cuatro décadas de compases", "Siero tiene una larga tradición bandística. La ASAM tomó el relevo en los años ochenta y desde entonces no ha dejado de sonar.", "negra"),
    h("section", { class: "block" }, h("div", { class: "wrap" },
      IS_ADMIN ? h("div", { class: "row-head" }, h("span"), adminLink("historia", "Editar historia")) : null,
      items.length ? items.map(function (it) {
        var fotos = Array.isArray(it.fotos) ? it.fotos.filter(Boolean) : [];
        return h("div", { class: "tl-item" }, h("div", { class: "tl-year" }, it.anio || "", it.detalle ? h("small", { text: it.detalle }) : null),
          h("div", { class: "tl-dot", style: "background:" + colorVar(it.color) }),
          h("div", { class: "tl-body" }, h("h3", { text: it.titulo }), it.texto ? h("p", { text: it.texto }) : null,
            fotos.length ? h("div", { class: "tl-photos" + (fotos.length === 1 ? " one" : "") }, fotos.map(function (id) {
              return h("button", { type: "button", "aria-label": "Ver foto: " + (it.titulo || ""), onclick: function () { openLightbox({ asset: id, titulo: (it.anio ? it.anio + " · " : "") + (it.titulo || "") }); } },
                h("img", { src: blobUrl(id), alt: "", loading: "lazy" }));
            })) : null));
      }) : emptyBox("Todavía no hay hitos en la historia.", "historia")))
  ];
};

function personAvatar(p, color, cls) {
  if (p.foto) return h("img", { class: (cls || "avatar") + " photo", src: blobUrl(p.foto), alt: "Foto de " + (p.nombre || ""), loading: "lazy" });
  return h("div", { class: cls || "avatar", style: "background:" + colorVar(p.color || color) }, initials(p.nombre));
}
function directorFeature(match, color, label) {
  var d = DATA.directores.filter(function (x) { return match.test(x.cargo || ""); })[0];
  if (!d) return IS_ADMIN ? emptyBox("Añade al director desde Administración para que aparezca aquí.", "directores") : null;
  return h("article", { class: "dfeature" },
    h("div", { class: "dphoto" }, d.foto
      ? h("img", { src: blobUrl(d.foto), alt: "Foto de " + d.nombre })
      : h("div", { class: "initials", style: "background:" + colorVar(d.color || color) }, initials(d.nombre))),
    h("div", { class: "dtext" },
      h("span", { class: "eyebrow" + (color === "naranja" ? "" : " verde"), text: label }),
      h("h2", { text: d.nombre }),
      h("p", { class: "role", text: d.cargo }),
      d.bio ? h("p", { class: "bio", text: d.bio }) : null,
      h("div", { class: "actions", style: "margin-top:6px" },
        h("a", { class: "btn ghost small", href: "#direccion", text: "Ver trayectoria completa" }),
        adminLink("directores", "Editar director"))));
}
function formationEvents(re) {
  var up = eventsSplit().up.filter(function (e) { return re.test(e.formacion || ""); }).slice(0, 3);
  if (!up.length) return null;
  return h("section", { class: "block" }, h("div", { class: "wrap" }, h("div", { class: "row-head" }, h("h2", { text: "Próximas actuaciones" })),
    h("div", { class: "events" }, up.map(function (e) { return eventRow(e); }))));
}

function instIndex(name) { var i = INSTRUMENTOS.indexOf(name); return i < 0 ? 999 : i; }
function isJefe(m) { return /jefe/i.test(m.cargo || ""); }
function musicianSort(a, b) {
  return instIndex(a.instrumento) - instIndex(b.instrumento) || String(a.instrumento || "").localeCompare(String(b.instrumento || "")) ||
    (isJefe(b) ? 1 : 0) - (isJefe(a) ? 1 : 0) || (Number(a.orden) || 999) - (Number(b.orden) || 999) || String(a.nombre || "").localeCompare(String(b.nombre || ""));
}
function groupByInstrument(list) {
  var groups = [], map = {};
  list.slice().sort(musicianSort).forEach(function (m) {
    var k = m.instrumento || "Otros";
    if (!map[k]) { map[k] = { name: k, items: [] }; groups.push(map[k]); }
    map[k].items.push(m);
  });
  return groups;
}
function plantilla(formacion, alt) {
  var list = DATA.musicos.filter(function (m) { return m.formacion === formacion; });
  var groups = groupByInstrument(list);
  return h("section", { class: "block" + (alt ? " alt" : "") }, h("div", { class: "wrap" },
    h("div", { class: "row-head" }, h("div", null, h("h2", { text: "Músicos" + (formacion === "Bandín" ? " promesa" : "") }),
      list.length ? h("p", { class: "count-line", text: list.length + (list.length === 1 ? " músico" : " músicos") + " en " + groups.length + (groups.length === 1 ? " sección" : " secciones") }) : null),
      adminLink("musicos", "Editar músicos")),
    list.length ? h("div", { class: "sections" }, groups.map(function (g) {
      return h("div", { class: "sect" }, h("h3", null, g.name, h("small", { text: String(g.items.length) })),
        h("ul", null, g.items.map(function (m) { return h("li", null, h("span", { text: m.nombre }), isJefe(m) ? h("span", { class: "jefe", text: "Jefe de sección" }) : null); })));
    })) : emptyBox("Pronto publicaremos la plantilla de músicos.", "musicos")));
}

PAGES.banda = function () {
  return [
    pageHead("Banda de Música de Siero", "La banda que suena en las fiestas y auditorios del concejo"),
    h("section", { class: "block" }, h("div", { class: "wrap" },
      directorFeature(/banda/i, "azul", "Director de la Banda"),
      h("div", { class: "prose" },
        h("p", { text: "La Banda de Música de Siero es el corazón de la ASAM. La forman músicos profesionales y aficionados que comparten atril y que interpretan un repertorio amplio y variado, del pasodoble y la zarzuela a las bandas sonoras." }),
        h("p", { text: "Sus conciertos forman parte de la programación cultural y festiva del municipio. En los auditorios municipales la entrada es gratuita, y en las fiestas más señaladas la banda sale a la calle con sus pasacalles." }),
        h("p", { text: "Además de los conciertos propios, organiza intercambios con otras formaciones y colabora con coros como los de la Sociedad Siero Musical." }),
        h("p", { class: "color-note" }, h("span", { class: "dot", style: "background:var(--azul)" }), h("span", { class: "dot", style: "background:var(--verde)" }), "Azul por la tradición, verde por el futuro: los colores del logotipo del 40 aniversario.")))),
    plantilla("Banda", true),
    formationEvents(/banda/i)
  ];
};

PAGES.bandin = function () {
  return [
    pageHead("El Bandín", "La cantera: donde se aprende a tocar en grupo"),
    h("section", { class: "block" }, h("div", { class: "wrap" },
      directorFeature(/bandín|bandin/i, "naranja", "Director del Bandín"),
      h("div", { class: "prose" },
        h("p", { text: "El Bandín reúne a los músicos más jóvenes de la escuela. Mientras mejoran con su instrumento, niños y niñas aprenden algo que pocas enseñanzas musicales ofrecen: tocar en conjunto, escuchar a los demás y subirse a un escenario." }),
        h("p", { text: "Es un ambiente formativo, cercano y con ganas de pasarlo bien. Aquí se prepara el relevo generacional de la Banda de Siero." }),
        h("p", { class: "color-note" }, h("span", { class: "dot", style: "background:var(--naranja)" }), "El naranja de su logotipo representa el amanecer a la música de las jóvenes promesas.")),
      h("div", { class: "join", style: "margin-top:36px" },
        h("div", null, h("b", { text: "¿Tu hijo o tu hija estudia un instrumento?" }), h("p", { text: "Pregúntanos por las clases y por cómo entrar en el Bandín." })),
        h("a", { class: "btn", href: "#contacto", text: "Escríbenos" })))),
    plantilla("Bandín", true),
    formationEvents(/bandín|bandin/i)
  ];
};

PAGES.direccion = function () {
  var dirs = DATA.directores.slice().sort(byOrden), junta = DATA.directiva.slice().sort(byOrden);
  return [
    pageHead("Dirección", "Quién lleva la batuta y quién sostiene la asociación", null, "verde"),
    h("section", { class: "block" }, h("div", { class: "wrap" },
      h("div", { class: "row-head" }, h("h2", { text: "Directores musicales" }), adminLink("directores", "Editar directores")),
      dirs.length ? h("div", { class: "directors" }, dirs.map(function (d) {
        var tray = String(d.trayectoria || "").split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
        return h("article", { class: "dcard" },
          h("header", null, personAvatar(d, "azul"), h("div", null, h("h3", { text: d.nombre }), h("div", { class: "role", text: d.cargo }))),
          d.bio ? h("p", { text: d.bio }) : null,
          tray.length ? h("details", null, h("summary", { text: "Trayectoria" }), h("ul", null, tray.map(function (t) { return h("li", { text: t }); }))) : null);
      })) : emptyBox("Todavía no hay directores añadidos.", "directores"))),
    h("section", { class: "block alt" }, h("div", { class: "wrap" },
      h("div", { class: "row-head" }, h("div", null, h("h2", { text: "Junta Directiva" }), h("p", { class: "muted", text: "Trabajo voluntario y altruista" })), adminLink("directiva", "Editar directiva")),
      junta.length ? h("div", { class: "junta" }, junta.map(function (m) {
        var lead = /presiden/i.test(m.cargo || "") && !/vice/i.test(m.cargo || "");
        return h("div", { class: "member" + (lead ? " lead-m" : "") + (m.foto ? " has-photo" : "") },
          m.foto ? h("img", { class: "mphoto", src: blobUrl(m.foto), alt: "Foto de " + m.nombre, loading: "lazy" }) : null,
          h("div", { class: "mtext" }, h("span", { class: "cargo", text: m.cargo }), h("b", { text: m.nombre })));
      })) : emptyBox("Todavía no hay miembros de la directiva añadidos.", "directiva")))
  ];
};

PAGES.actuaciones = function () {
  var s = eventsSplit();
  return [
    pageHead("Actuaciones", "Una temporada de conciertos a lo largo del año", "Los conciertos en los auditorios municipales son gratuitos hasta completar aforo."),
    h("section", { class: "block" }, h("div", { class: "wrap" },
      h("div", { class: "row-head" }, h("h2", { text: "Próximas actuaciones" }), adminLink("eventos", "Gestionar eventos")),
      s.up.length ? h("div", { class: "events" }, s.up.map(function (e) { return eventRow(e); })) : emptyBox("Pronto anunciaremos las próximas actuaciones.", "eventos"))),
    h("section", { class: "block alt" }, h("div", { class: "wrap" },
      h("div", { class: "row-head" }, h("h2", { text: "Nuestra temporada habitual" })),
      h("div", { class: "season" }, [
        ["Noviembre", "Concierto de Santa Cecilia", "La cita con la patrona de la música en el Auditorio de Pola de Siero."],
        ["Diciembre", "Concierto de Navidad", "Banda y Bandín juntos, a menudo con los coros de la Sociedad Siero Musical."],
        ["Marzo", "Concierto de Carnaval", "Repertorio festivo en el Auditorio de Pola de Siero."],
        ["Primavera", "Conciertos e intercambios", "Visitas de otras bandas y salidas a otros concejos."],
        ["Verano", "Música al aire libre", "Conciertos en la calle, en El Paraguas y otros espacios."],
        ["Fiestas", "Pasacalles", "La banda recorre las calles en las fiestas más señaladas de Siero."]
      ].map(function (g) { return h("div", { class: "gig" }, h("span", { class: "mes", text: g[0] }), h("h3", { text: g[1] }), h("p", { text: g[2] })); })))),
    s.past.length ? h("section", { class: "block" }, h("div", { class: "wrap" },
      h("div", { class: "row-head" }, h("h2", { text: "Actuaciones anteriores" })),
      h("div", { class: "events" }, s.past.slice(0, 12).map(function (e) { return eventRow(e, true); })))) : null
  ];
};

PAGES.noticias = function () {
  var n = sortedNews();
  return [
    pageHead("Noticias", "Lo último de la asociación"),
    h("section", { class: "block" }, h("div", { class: "wrap" },
      IS_ADMIN ? h("div", { class: "row-head" }, h("span"), adminLink("noticias", "Gestionar noticias")) : null,
      n.length ? h("div", { class: "news" }, n.map(newsCard)) : emptyBox("Todavía no hay noticias publicadas.", "noticias")))
  ];
};

PAGES.imagenes = function () {
  var fotos = DATA.fotos.slice().sort(function (a, b) { return (b.creado || "") < (a.creado || "") ? -1 : 1; });
  var cats = ["todas", "Banda", "Bandín", "Escuela", "Asociación"];
  var visible = fotos.filter(function (f) { return FOTO_FILTER === "todas" || f.categoria === FOTO_FILTER; });
  return [
    pageHead("Galería", "Momentos de la Banda, el Bandín y la escuela", "En nuestras redes hay muchas más fotos y vídeos."),
    h("section", { class: "block" }, h("div", { class: "wrap" },
      h("div", { class: "row-head" },
        h("div", { class: "filters", role: "group", "aria-label": "Filtrar galería" }, cats.map(function (c) {
          return h("button", { type: "button", id: "f-" + c.toLowerCase(), "aria-pressed": FOTO_FILTER === c ? "true" : "false", text: c === "todas" ? "Todas" : c,
            onclick: function () { FOTO_FILTER = c; render(); } });
        })), adminLink("fotos", "Subir fotos")),
      visible.length ? h("div", { class: "gallery" }, visible.map(function (f) {
        return h("button", { class: "shot", type: "button", onclick: function () { openLightbox(f); } },
          h("img", { src: photoSrc(f), alt: f.titulo || "Foto de la asociación", loading: "lazy" }), f.titulo ? h("span", { text: f.titulo }) : null);
      })) : emptyBox(fotos.length ? "No hay fotos en esta categoría." : "Todavía no hay fotos en la galería.", "fotos"),
      h("div", { class: "links", style: "margin-top:28px" }, linksList())))
  ];
};

PAGES.galeria = PAGES.imagenes;

PAGES.contacto = function () {
  var c = DATA.contacto || {};
  function kv(k, v, id) {
    if (!v) return null;
    return h("div", { class: "kv" }, h("span", { class: "k", text: k }), h("span", { class: "v" }, h("span", { id: id, text: v }),
      id ? h("button", { class: "copy", type: "button", onclick: function (ev) { copyText(ev.currentTarget, document.getElementById(id)); }, text: "Copiar" }) : null));
  }
  return [
    pageHead("Contacto", "Ven a vernos o escríbenos"),
    h("section", { class: "block" }, h("div", { class: "wrap" },
      IS_ADMIN ? h("div", { class: "row-head" }, h("span"), adminLink("contacto", "Editar datos de contacto")) : null,
      h("div", { class: "contact" },
        h("div", { class: "cbox" }, kv("Sede", c.direccion), kv("Teléfono (WhatsApp)", c.telefono, "c-tel"), kv("Correo electrónico", c.email, "c-mail"),
          h("a", { class: "btn ghost", style: "justify-self:start", href: safeUrl(c.mapa) || MAPA_DEFECTO, target: "_blank", rel: "noopener", text: "Cómo llegar" })),
        h("div", { class: "cbox hl" }, h("h3", { text: "Únete a la música" }),
          h("p", { text: "Si quieres matricularte en la escuela, tocar en la Banda o en el Bandín, o hacerte socio desde 12 € al año, llámanos, escríbenos por WhatsApp o mándanos un correo y te contamos todo: instrumentos, horarios y tarifas." })))))
  ];
};

/* ---------- Administración ---------- */
var SCHEMAS = {
  directiva: { label: "Directiva", singular: "miembro", fields: [
    { k: "cargo", l: "Cargo", req: true, ph: "Presidente, Secretaría, Vocal…" },
    { k: "nombre", l: "Nombre y apellidos", req: true },
    { k: "foto", l: "Foto", type: "images", single: true, help: "Opcional. Mejor una foto vertical en la que se vea bien la cara." },
    { k: "orden", l: "Orden", type: "number", help: "Número para ordenar (1 aparece primero)." }],
    title: function (d) { return d.nombre; }, sub: function (d) { return d.cargo; }, sort: byOrden },
  directores: { label: "Directores", singular: "director", fields: [
    { k: "nombre", l: "Nombre y apellidos", req: true },
    { k: "cargo", l: "Cargo", req: true, ph: "Director de la Banda de Música" },
    { k: "foto", l: "Foto", type: "images", single: true, help: "Se muestra en Dirección y en la página de su formación. Mejor una foto vertical." },
    { k: "bio", l: "Presentación", type: "textarea", help: "Biografía breve. Aparece también en la página de la Banda o del Bandín." },
    { k: "trayectoria", l: "Trayectoria", type: "textarea", help: "Un mérito por línea." },
    { k: "color", l: "Color", type: "select", options: [["azul", "Azul"], ["naranja", "Naranja"], ["verde", "Verde"], ["negro", "Negro"]] },
    { k: "orden", l: "Orden", type: "number" }],
    title: function (d) { return d.nombre; }, sub: function (d) { return d.cargo; }, sort: byOrden },
  eventos: { label: "Eventos", singular: "evento", fields: [
    { k: "titulo", l: "Título", req: true, ph: "Concierto de Santa Cecilia" },
    { k: "fecha", l: "Fecha", type: "date", req: true },
    { k: "hora", l: "Hora", type: "time" },
    { k: "lugar", l: "Lugar", ph: "Auditorio de Pola de Siero" },
    { k: "formacion", l: "Formación", type: "select", options: [["Banda", "Banda"], ["Bandín", "Bandín"], ["Banda y Bandín", "Banda y Bandín"], ["Escuela", "Escuela"], ["Asociación", "Asociación"]] },
    { k: "descripcion", l: "Descripción", type: "textarea" }],
    title: function (d) { return d.titulo; }, sub: function (d) { return [fmtLong(d.fecha), d.hora, d.lugar].filter(Boolean).join(" · "); },
    sort: function (a, b) { return a.fecha < b.fecha ? 1 : -1; } },
  noticias: { label: "Noticias", singular: "noticia", fields: [
    { k: "titulo", l: "Titular", req: true },
    { k: "fecha", l: "Fecha", type: "date" },
    { k: "etiqueta", l: "Etiqueta", ph: "Banda, Bandín, Asociación…" },
    { k: "texto", l: "Texto", type: "textarea" },
    { k: "fotos", l: "Fotos", type: "images", help: "La primera foto se usa como portada de la noticia." },
    { k: "enlaces", l: "Enlaces a otras webs", type: "links", help: "Por ejemplo, el artículo de un periódico o el programa del concierto." }],
    title: function (d) { return d.titulo; }, sub: function (d) { return [fmtLong(d.fecha) || "Sin fecha", d.etiqueta].filter(Boolean).join(" · "); },
    sort: function (a, b) { return sortedNews().indexOf(a) - sortedNews().indexOf(b); } },
  enlaces: { label: "Enlaces", singular: "enlace", fields: [
    { k: "nombre", l: "Nombre", req: true, ph: "Instagram" },
    { k: "url", l: "Dirección web", type: "url", req: true, ph: "https://…" },
    { k: "orden", l: "Orden", type: "number" }],
    title: function (d) { return d.nombre; }, sub: function (d) { return d.url; }, sort: byOrden },
  musicos: { label: "Músicos", singular: "músico", fields: [
    { k: "nombre", l: "Nombre y apellidos", req: true },
    { k: "formacion", l: "Formación", type: "select", req: true, options: [["Banda", "Banda"], ["Bandín", "Bandín"]] },
    { k: "instrumento", l: "Instrumento", type: "datalist", req: true, list: INSTRUMENTOS, help: "Elige de la lista o escribe otro instrumento." },
    { k: "cargo", l: "Cargo", type: "select", options: [["Músico", "Músico"], ["Jefe de sección", "Jefe de sección"]] },
    { k: "orden", l: "Orden dentro de su instrumento", type: "number", help: "Opcional. El jefe de sección aparece siempre el primero." }],
    title: function (d) { return d.nombre; },
    sub: function (d) { return [d.instrumento, isJefe(d) ? "Jefe de sección" : ""].filter(Boolean).join(" · "); },
    sort: function (a, b) { return a.formacion === b.formacion ? musicianSort(a, b) : (a.formacion === "Banda" ? -1 : 1); },
    filter: { k: "formacion", label: "Formación", options: ["Banda", "Bandín"] },
    group: function (d) { return (d.formacion || "") + " · " + (d.instrumento || "Otros"); } }
};
var TABS = [["directiva", "Directiva"], ["directores", "Directores"], ["historia", "Historia"], ["musicos", "Músicos"], ["eventos", "Eventos"], ["noticias", "Noticias"], ["enlaces", "Enlaces y redes"], ["fotos", "Galería"], ["contacto", "Contacto"], ["pie", "Pie de página"], ["usuarios", "Administradores"]];
SCHEMAS.historia = { label: "Historia", singular: "hito", fields: [
    { k: "anio", l: "Año o etiqueta", req: true, ph: "1984" },
    { k: "detalle", l: "Fecha o detalle", ph: "24 de diciembre" },
    { k: "titulo", l: "Título", req: true, ph: "Nace la Asociación" },
    { k: "texto", l: "Texto", type: "textarea" },
    { k: "fotos", l: "Imágenes", type: "images", help: "Opcional. Se pueden ampliar al pulsarlas." },
    { k: "color", l: "Color de la nota", type: "select", options: [["azul", "Azul"], ["naranja", "Naranja"], ["verde", "Verde"], ["negro", "Negro"]] },
    { k: "orden", l: "Orden", type: "number", help: "Los hitos se muestran de menor a mayor. Usa 10, 20, 30… para poder meter otros en medio." }],
  title: function (d) { return (d.anio ? d.anio + " · " : "") + (d.titulo || ""); },
  sub: function (d) { return [d.detalle, (Array.isArray(d.fotos) && d.fotos.length) ? d.fotos.length + (d.fotos.length === 1 ? " imagen" : " imágenes") : ""].filter(Boolean).join(" · "); },
  sort: function (a, b) { return (Number(a.orden) || 999) - (Number(b.orden) || 999); } };
var LIST_FILTER = {};

PAGES.admin = function (tab) {
  tab = tab || "directiva";
  var head = pageHead("Administración", "Panel de administración", "Los cambios que guardes aquí se ven en la web para todas las personas que la visitan.", "negra");
  if (!SB) {
    return [head, h("section", { class: "block" }, h("div", { class: "wrap" }, h("div", { class: "notice" },
      h("h3", { text: "Falta conectar la base de datos" }),
      h("p", { class: "muted", text: "Rellena la dirección y la clave pública de Supabase en el archivo js/config.js (lo explica el README del repositorio)." }))))];
  }
  if (!SESSION) return [head, h("section", { class: "block" }, h("div", { class: "wrap" }, loginForm()))];
  var logout = h("button", { class: "btn ghost small", type: "button", text: "Cerrar sesión", onclick: function () { SB.auth.signOut(); } });
  if (!IS_ADMIN) {
    return [head, h("section", { class: "block" }, h("div", { class: "wrap" }, h("div", { class: "notice" },
      h("h3", { text: "Tu usuario no es administrador" }),
      h("p", { class: "muted", text: "Has entrado como " + ((SESSION.user && SESSION.user.email) || "usuario") + ", pero este usuario no tiene permiso para editar. Pide a otra persona administradora que te dé acceso." }),
      h("div", { class: "form-acts" }, logout))))];
  }
  if (!LIVE) {
    return [head, h("section", { class: "block" }, h("div", { class: "wrap" }, h("div", { class: "notice" },
      h("h3", { text: "Cargando datos…" }), h("p", { class: "muted", text: "Si este mensaje no desaparece, recarga la página." }))))];
  }
  var body;
  if (tab === "fotos") body = adminFotos();
  else if (tab === "contacto") body = adminContacto();
  else if (tab === "pie") body = adminPie();
  else if (tab === "usuarios") body = adminUsuarios();
  else body = adminCrud(tab);
  return [head, h("section", { class: "block" }, h("div", { class: "wrap" },
    h("div", { class: "row-head" }, h("p", { class: "muted", text: "Sesión iniciada como " + ((SESSION.user && SESSION.user.email) || "") }), logout),
    h("nav", { class: "admin-tabs", "aria-label": "Secciones editables" }, TABS.map(function (t) {
      return h("a", { href: "#admin-" + t[0], "aria-current": t[0] === tab ? "page" : null, text: t[1] });
    })), body))];
};

/* ---------- Gestión de administradores (función de Supabase "administradores") ---------- */
var ADMINS = { loaded: false, loading: false, list: [], me: null, error: "" };
function adminFn(body) {
  return SB.functions.invoke("administradores", { body: body }).then(function (r) {
    if (!r.error) return r.data;
    var ctx = r.error.context;
    var fallback = "No se ha podido completar. Comprueba la conexión e inténtalo de nuevo.";
    if (ctx && typeof ctx.json === "function") {
      return ctx.json().then(function (j) { throw new Error((j && j.error) || fallback); }, function () { throw new Error(fallback); });
    }
    throw new Error(fallback);
  });
}
function loadAdmins() {
  ADMINS.loading = true;
  return adminFn({ action: "list" }).then(function (d) {
    ADMINS.list = d.admins || []; ADMINS.me = d.me; ADMINS.error = ""; ADMINS.loaded = true; ADMINS.loading = false;
  }, function (e) { ADMINS.error = e.message; ADMINS.loaded = true; ADMINS.loading = false; });
}
function adminUsuarios() {
  if (!ADMINS.loaded && !ADMINS.loading) loadAdmins().then(render);
  var st = statusEl();
  var email = h("input", { id: "nu-email", type: "email", autocomplete: "off", placeholder: "nombre@correo.com" });
  var pass = h("input", { id: "nu-pass", type: "text", autocomplete: "new-password", placeholder: "Mínimo 8 caracteres" });
  var btn = h("button", { class: "btn primary", type: "submit", text: "Crear administrador" });
  var form = h("form", { class: "aform", novalidate: true }, h("h3", { text: "Nuevo administrador" }),
    h("p", { class: "muted", text: "Crea la cuenta y dale acceso al panel. Después pásale el correo y la contraseña; podrá entrar desde Administración en el menú." }),
    h("div", { class: "field" }, h("label", { for: "nu-email", text: "Correo electrónico *" }), email),
    h("div", { class: "field" }, h("label", { for: "nu-pass", text: "Contraseña *" }), pass,
      h("small", { text: "Si el correo ya tiene cuenta, se le da acceso y se mantiene su contraseña actual." })),
    h("div", { class: "form-acts" }, btn), st);
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var e = email.value.trim(), p = pass.value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { setStatus(st, "Escribe un correo válido.", false); return; }
    if (p.length < 8) { setStatus(st, "La contraseña debe tener al menos 8 caracteres.", false); return; }
    btn.disabled = true; btn.textContent = "Creando…";
    adminFn({ action: "create", email: e, password: p }).then(function (d) {
      FLASH = { col: "usuarios", msg: d && d.existed ? "Ese correo ya tenía cuenta: ahora es administrador." : "Administrador creado: " + e };
      return loadAdmins();
    }).then(render, function (err) { btn.disabled = false; btn.textContent = "Crear administrador"; setStatus(st, err.message, false); });
  });
  if (FLASH && FLASH.col === "usuarios") { setStatus(st, FLASH.msg, true); FLASH = null; }

  var list;
  if (!ADMINS.loaded) list = h("div", { class: "empty" }, h("p", { text: "Cargando administradores…" }));
  else if (ADMINS.error) list = h("div", { class: "notice" }, h("h3", { text: "No se ha podido cargar la lista" }), h("p", { class: "muted", text: ADMINS.error }),
    h("div", { class: "form-acts" }, h("button", { class: "btn ghost small", type: "button", text: "Reintentar", onclick: function () { ADMINS.loaded = false; render(); } })));
  else list = h("div", { class: "alist" }, ADMINS.list.map(function (a) {
    var isMe = a.user_id === ADMINS.me;
    return h("div", { class: "aitem" },
      h("div", { class: "t", style: "flex:1" }, h("b", { text: (a.email || "(sin correo)") + (isMe ? " (tú)" : "") }),
        h("span", { text: a.creado ? "Administrador desde el " + fmtLong(String(a.creado).slice(0, 10)) : "" })),
      isMe ? null : h("div", { class: "acts" }, deleteButton(function (b) {
        adminFn({ action: "remove", user_id: a.user_id }).then(function () {
          FLASH = { col: "usuarios", msg: "Se ha quitado el acceso a " + (a.email || "ese usuario") + "." };
          return loadAdmins();
        }).then(render, function (err) { b.disabled = false; b.textContent = "Borrar"; alertInline(b, err.message); });
      })));
  }));
  return h("div", { class: "admin-grid" },
    h("div", null, h("p", { class: "muted", style: "margin-bottom:12px", text: "Personas que pueden editar la web. Al borrar a alguien se elimina su cuenta y deja de poder entrar." }), list),
    form);
}

function loginForm() {
  var st = statusEl();
  var email = h("input", { id: "login-email", type: "email", autocomplete: "username", required: true });
  var pass = h("input", { id: "login-pass", type: "password", autocomplete: "current-password", required: true });
  var btn = h("button", { class: "btn primary", type: "submit", text: "Entrar" });
  var form = h("form", { class: "aform", style: "position:static;max-width:420px" }, h("h3", { text: "Acceso para administradores" }),
    h("div", { class: "field" }, h("label", { for: "login-email", text: "Correo electrónico" }), email),
    h("div", { class: "field" }, h("label", { for: "login-pass", text: "Contraseña" }), pass),
    h("div", { class: "form-acts" }, btn), st);
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!email.value.trim() || !pass.value) { setStatus(st, "Escribe tu correo y tu contraseña.", false); return; }
    btn.disabled = true; btn.textContent = "Entrando…";
    SB.auth.signInWithPassword({ email: email.value.trim(), password: pass.value }).then(function (r) {
      btn.disabled = false; btn.textContent = "Entrar";
      if (r.error) setStatus(st, "Correo o contraseña incorrectos.", false);
    }, function () { btn.disabled = false; btn.textContent = "Entrar"; setStatus(st, "No se ha podido conectar. Inténtalo de nuevo.", false); });
  });
  return form;
}

function statusEl() { return h("p", { class: "status", role: "status", "aria-live": "polite" }); }
function setStatus(el, msg, ok) { el.textContent = msg; el.className = "status " + (ok ? "ok" : "err"); }
function errMsg(e) {
  var c = e && e.code;
  var m = (e && (e.message || e.error)) || "";
  if (c === "42501" || /row-level security|not authorized|unauthorized|jwt/i.test(m)) return "No tienes permiso para guardar cambios. Vuelve a iniciar sesión.";
  if (/payload too large|exceeded the maximum/i.test(m) || String(e && e.statusCode) === "413") return "La foto pesa demasiado (máximo 10 MB).";
  if (/mime type|invalid_mime/i.test(m)) return "Ese tipo de archivo no se admite. Usa JPG, PNG, WebP o GIF.";
  if (c === "invalid_argument") return "No tienes permiso para guardar cambios, o falta algún dato.";
  if (c === "quota_exceeded") return "Se ha llenado el espacio de datos. Borra elementos antiguos e inténtalo de nuevo.";
  if (c === "too_large") return "La foto pesa demasiado (máximo 10 MB).";
  if (c === "unsupported_type") return "Ese tipo de archivo no se admite. Usa JPG, PNG, WebP o GIF.";
  if (c === "quota_or_state") return "No queda espacio para más fotos. Borra alguna antes de subir otra.";
  if (c === "rate_limited") return "Demasiadas peticiones seguidas. Espera un momento y vuelve a intentarlo.";
  return "No se ha podido guardar. Comprueba la conexión e inténtalo de nuevo.";
}
function deleteButton(onConfirm) {
  var armed = false, timer;
  var b = h("button", { class: "btn danger small", type: "button", text: "Borrar" });
  b.addEventListener("click", function () {
    if (!armed) { armed = true; b.textContent = "¿Seguro? Pulsa otra vez"; b.classList.add("confirm"); timer = setTimeout(function () { armed = false; b.textContent = "Borrar"; b.classList.remove("confirm"); }, 4000); return; }
    clearTimeout(timer); b.disabled = true; b.textContent = "Borrando…"; onConfirm(b);
  });
  return b;
}

function fieldWidget(col, f, val) {
  var id = "fld-" + col + "-" + f.k;
  if (f.type === "links") {
    var rows = h("div", { class: "linkrows" });
    function addRow(l) {
      var t = h("input", { type: "text", placeholder: "Texto del enlace", "aria-label": "Texto del enlace", value: (l && l.texto) || "" });
      var u = h("input", { type: "url", placeholder: "https://…", "aria-label": "Dirección web", value: (l && l.url) || "" });
      var row = h("div", { class: "linkrow" }, t, u, h("button", { class: "x", type: "button", "aria-label": "Quitar enlace", text: "×", onclick: function () { row.remove(); } }));
      rows.appendChild(row);
    }
    (Array.isArray(val) ? val : []).forEach(addRow);
    var el = h("div", { class: "field" }, h("label", { text: f.l }), rows,
      h("button", { class: "btn ghost small", type: "button", style: "justify-self:start", text: "+ Añadir enlace", onclick: function () { addRow(); rows.lastChild.querySelector("input").focus(); } }),
      f.help ? h("small", { text: f.help }) : null);
    return { el: el, get: function () {
      var out = [], bad = false;
      Array.prototype.forEach.call(rows.children, function (r) {
        var ins = r.querySelectorAll("input"), texto = ins[0].value.trim(), url = ins[1].value.trim();
        if (!texto && !url) return;
        if (!safeUrl(url)) bad = true; else out.push({ texto: texto, url: url });
      });
      if (bad) throw new Error("Cada enlace necesita una dirección que empiece por https://");
      return out;
    } };
  }
  if (f.type === "images") {
    var initial = Array.isArray(val) ? val.filter(Boolean) : (val ? [val] : []);
    var keep = initial.slice(), added = [];
    var box = h("div", { class: "imgs" });
    function draw() {
      box.replaceChildren();
      keep.forEach(function (aid, i) {
        box.appendChild(h("figure", null, h("img", { src: blobUrl(aid), alt: "" }),
          h("button", { type: "button", "aria-label": "Quitar foto", text: "×", onclick: function () { keep.splice(i, 1); draw(); } })));
      });
      added.forEach(function (it, i) {
        box.appendChild(h("figure", { class: "new" }, h("img", { src: it.url, alt: "" }),
          h("button", { type: "button", "aria-label": "Quitar foto", text: "×", onclick: function () { URL.revokeObjectURL(it.url); added.splice(i, 1); draw(); } })));
      });
    }
    draw();
    var input = h("input", { type: "file", id: id, accept: "image/jpeg,image/png,image/webp,image/gif", multiple: !f.single });
    input.addEventListener("change", function () {
      if (f.single && input.files.length) { added.forEach(function (a) { URL.revokeObjectURL(a.url); }); added = []; keep = []; }
      Array.prototype.forEach.call(input.files, function (file) { if (/^image\//.test(file.type)) added.push({ file: file, url: URL.createObjectURL(file) }); });
      if (f.single) added = added.slice(-1);
      input.value = ""; draw();
    });
    var el2 = h("div", { class: "field" }, h("label", { for: id, text: f.l }), box,
      ASSETS ? input : h("small", { text: "Para subir fotos tienes que haber iniciado sesión como administrador." }),
      f.help ? h("small", { text: f.help }) : null);
    return { el: el2, original: initial.slice(), get: function () { return { keep: keep.slice(), files: added.map(function (a) { return a.file; }) }; } };
  }
  var input2;
  if (f.type === "textarea") input2 = h("textarea", { id: id, name: f.k, placeholder: f.ph || null });
  else if (f.type === "select") input2 = h("select", { id: id, name: f.k }, f.options.map(function (o) { return h("option", { value: o[0], text: o[1] }); }));
  else if (f.type === "datalist") {
    var dl = h("datalist", { id: id + "-list" }, f.list.map(function (o) { return h("option", { value: o }); }));
    input2 = h("input", { id: id, name: f.k, type: "text", list: id + "-list", autocomplete: "off" });
    input2._extra = dl;
  }
  else input2 = h("input", { id: id, name: f.k, type: f.type || "text", placeholder: f.ph || null });
  if (val != null && val !== "") input2.value = val;
  return { el: h("div", { class: "field" }, h("label", { for: id, text: f.l + (f.req ? " *" : "") }), input2, input2._extra || null, f.help ? h("small", { text: f.help }) : null),
    get: function () { var v = input2.value.trim(); return f.type === "number" ? (v === "" ? null : Number(v)) : v; } };
}

function uploadAll(files, onProgress) {
  var ids = [];
  return files.reduce(function (p, file, i) {
    return p.then(function () { onProgress(i + 1, files.length); return ASSETS.upload(file); }).then(function (r) { ids.push(r.id); });
  }, Promise.resolve()).then(function () { return ids; });
}

function adminCrud(col) {
  var S = SCHEMAS[col]; if (!S) return h("p", { text: "Sección desconocida." });
  var editId = EDITING[col] || null;
  var current = editId ? DATA[col].filter(function (x) { return x.id === editId; })[0] : null;
  if (editId && !current) { editId = null; EDITING[col] = null; }
  var st = statusEl();
  var form = h("form", { class: "aform", novalidate: true });
  add(form, h("h3", { text: current ? "Editar " + S.singular : "Añadir " + S.singular }));
  var widgets = {};
  S.fields.forEach(function (f) {
    var val = current ? current[f.k] : null;
    if (!current && S.filter && f.k === S.filter.k && LIST_FILTER[col]) val = LIST_FILTER[col];
    widgets[f.k] = fieldWidget(col, f, val);
    add(form, widgets[f.k].el);
  });
  var label = current ? "Guardar cambios" : "Añadir";
  var save = h("button", { class: "btn primary", type: "submit", text: label });
  add(form, h("div", { class: "form-acts" }, save,
    current ? h("button", { class: "btn ghost", type: "button", text: "Cancelar", onclick: function () { EDITING[col] = null; render(); } }) : null), st);
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var obj = {}, missing = [], imgs = [];
    try {
      S.fields.forEach(function (f) {
        var v = widgets[f.k].get();
        if (f.type === "images") { imgs.push({ f: f, v: v }); return; }
        if (f.req && (v === "" || v == null)) missing.push(f.l);
        obj[f.k] = v;
      });
    } catch (e) { setStatus(st, e.message, false); return; }
    if (missing.length) { setStatus(st, "Falta: " + missing.join(", ") + ".", false); return; }
    if (S.fields.some(function (f) { return f.type === "url"; }) && obj.url && !safeUrl(obj.url)) { setStatus(st, "La dirección debe empezar por https://", false); return; }
    var pendingFiles = imgs.reduce(function (n, x) { return n + x.v.files.length; }, 0);
    if (pendingFiles && !ASSETS) { setStatus(st, "Solo los administradores pueden subir fotos.", false); return; }
    save.disabled = true; save.textContent = "Guardando…";
    var done = 0;
    var up = imgs.reduce(function (p, x) {
      return p.then(function () {
        return uploadAll(x.v.files, function () { done++; save.textContent = "Subiendo foto " + done + " de " + pendingFiles + "…"; })
          .then(function (newIds) { var all = x.v.keep.concat(newIds); obj[x.f.k] = x.f.single ? (all[0] || "") : all; });
      });
    }, Promise.resolve());
    up.then(function () {
      save.textContent = "Guardando…";
      return current ? DB.collection(col).doc(current.id).set(obj) : DB.collection(col).add(obj);
    }).then(function () {
      if (current && ASSETS) imgs.forEach(function (x) {
        var now = [].concat(obj[x.f.k] || []);
        widgets[x.f.k].original.filter(function (a) { return now.indexOf(a) < 0 && isStored(a); })
          .forEach(function (a) { ASSETS.delete(a).catch(function () {}); });
      });
      EDITING[col] = null; FLASH = { col: col, msg: current ? "Cambios guardados." : "Añadido." }; render();
    }, function (e) { save.disabled = false; save.textContent = label; setStatus(st, errMsg(e), false); });
  });
  if (FLASH && FLASH.col === col) { setStatus(st, FLASH.msg, true); FLASH = null; }

  var all = DATA[col].slice().sort(S.sort);
  var items = S.filter && LIST_FILTER[col] ? all.filter(function (x) { return x[S.filter.k] === LIST_FILTER[col]; }) : all;
  var filterEl = S.filter ? h("div", { class: "list-filter" }, h("label", { for: "lf-" + col, text: S.filter.label + ":" }),
    h("select", { id: "lf-" + col, onchange: function (e) { LIST_FILTER[col] = e.target.value; render(); } },
      h("option", { value: "", text: "Todas (" + all.length + ")" }),
      S.filter.options.map(function (o) {
        var n = all.filter(function (x) { return x[S.filter.k] === o; }).length;
        return h("option", { value: o, text: o + " (" + n + ")", selected: LIST_FILTER[col] === o || null });
      }))) : null;
  var lastGroup = null;
  var rows = [];
  items.forEach(function (it) {
    if (S.group) { var g = S.group(it); if (g !== lastGroup) { rows.push(h("p", { class: "group-h", text: g })); lastGroup = g; } }
    var thumbId = (Array.isArray(it.fotos) && it.fotos[0]) || it.foto;
    var thumb = thumbId ? h("img", { src: blobUrl(thumbId), alt: "" }) : null;
    rows.push(h("div", { class: "aitem" + (it.id === editId ? " editing" : "") }, thumb,
      h("div", { class: "t", style: "flex:1" }, h("b", { text: S.title(it) || "(sin título)" }), h("span", { text: S.sub(it) || "" })),
      h("div", { class: "acts" },
        h("button", { class: "btn ghost small", type: "button", text: "Editar", onclick: function () { EDITING[col] = it.id; render(); var f = document.querySelector(".aform input, .aform textarea"); if (f) f.focus(); } }),
        deleteButton(function (b) {
          DB.collection(col).doc(it.id).delete().then(function () {
            if (ASSETS) [].concat(it.fotos || [], it.foto || []).filter(isStored).forEach(function (a) { ASSETS.delete(a).catch(function () {}); });
            if (EDITING[col] === it.id) EDITING[col] = null; FLASH = { col: col, msg: "Borrado." }; render();
          }, function (e) { b.disabled = false; b.textContent = "Borrar"; alertInline(b, errMsg(e)); });
        }))));
  });
  var list = h("div", null, filterEl, rows.length ? h("div", { class: "alist" }, rows)
    : h("div", { class: "empty" }, h("p", { text: "Todavía no hay nada aquí. Usa el formulario para añadir el primero." })));
  return h("div", { class: "admin-grid" }, list, form);
}
var FLASH = null;
function alertInline(near, msg) { var p = h("p", { class: "status err", text: msg }); near.parentNode.parentNode.appendChild(p); }

function adminFotos() {
  var st = statusEl();
  if (!ASSETS) {
    return h("div", { class: "notice" }, h("h3", { text: "Subida de fotos no disponible" }),
      h("p", { class: "muted", text: "Solo los administradores pueden subir fotos. Vuelve a iniciar sesión si ya lo eres." }));
  }
  var fileInput = h("input", { type: "file", id: "foto-file", accept: "image/jpeg,image/png,image/webp,image/gif", multiple: true });
  var titulo = h("input", { type: "text", id: "foto-titulo", placeholder: "Concierto de Navidad 2026" });
  var cat = h("select", { id: "foto-cat" }, ["Banda", "Bandín", "Escuela", "Asociación"].map(function (c) { return h("option", { value: c, text: c }); }));
  var drop = h("label", { class: "drop", for: "foto-file" }, h("b", { text: "Elige fotos o arrástralas aquí" }), h("span", { text: "JPG, PNG, WebP o GIF · se reducen solas si son muy grandes" }), fileInput);
  var picked = h("p", { class: "muted", text: "" });
  var files = [];
  function setFiles(list) { files = Array.prototype.slice.call(list || []).filter(function (f) { return /^image\//.test(f.type); }); picked.textContent = files.length ? files.length + (files.length === 1 ? " foto seleccionada" : " fotos seleccionadas") : ""; }
  fileInput.addEventListener("change", function () { setFiles(fileInput.files); });
  ["dragover", "dragenter"].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add("over"); }); });
  ["dragleave", "drop"].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove("over"); }); });
  drop.addEventListener("drop", function (e) { setFiles(e.dataTransfer.files); });
  var up = h("button", { class: "btn primary", type: "submit", text: "Subir a la galería" });
  var form = h("form", { class: "aform" }, h("h3", { text: "Subir fotos" }), drop, picked,
    h("div", { class: "field" }, h("label", { for: "foto-titulo", text: "Pie de foto" }), titulo, h("small", { text: "Se aplica a todas las fotos de esta subida." })),
    h("div", { class: "field" }, h("label", { for: "foto-cat", text: "Categoría" }), cat),
    h("div", { class: "form-acts" }, up), st);
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!files.length) { setStatus(st, "Elige al menos una foto.", false); return; }
    up.disabled = true;
    var done = 0, total = files.length, failed = 0;
    (function next(i) {
      if (i >= total) {
        up.disabled = false; up.textContent = "Subir a la galería";
        FLASH = { col: "fotos", msg: failed ? (done + " subidas, " + failed + " con error.") : (done === 1 ? "Foto subida." : done + " fotos subidas.") };
        render(); return;
      }
      up.textContent = "Subiendo " + (i + 1) + " de " + total + "…";
      ASSETS.upload(files[i]).then(function (r) {
        return DB.collection("fotos").add({ asset: r.id, titulo: titulo.value.trim(), categoria: cat.value, creado: new Date().toISOString() });
      }).then(function () { done++; next(i + 1); }, function (e) { failed++; setStatus(st, errMsg(e), false); next(i + 1); });
    })(0);
  });
  if (FLASH && FLASH.col === "fotos") { setStatus(st, FLASH.msg, true); FLASH = null; }
  var fotos = DATA.fotos.slice().sort(function (a, b) { return (b.creado || "") < (a.creado || "") ? -1 : 1; });
  var list = fotos.length ? h("div", { class: "alist" }, fotos.map(function (f) {
    var tIn = h("input", { type: "text", value: f.titulo || "", "aria-label": "Pie de foto", id: "pie-" + f.id });
    var cSel = h("select", { "aria-label": "Categoría", id: "cat-" + f.id }, ["Banda", "Bandín", "Escuela", "Asociación"].map(function (c) { return h("option", { value: c, text: c, selected: f.categoria === c || null }); }));
    var saveB = h("button", { class: "btn ghost small", type: "button", text: "Guardar" });
    saveB.addEventListener("click", function () {
      saveB.disabled = true; saveB.textContent = "Guardando…";
      DB.collection("fotos").doc(f.id).update({ titulo: tIn.value.trim(), categoria: cSel.value }).then(function () { saveB.disabled = false; saveB.textContent = "Guardado ✓"; setTimeout(function () { saveB.textContent = "Guardar"; }, 1500); },
        function (e) { saveB.disabled = false; saveB.textContent = "Guardar"; alertInline(saveB, errMsg(e)); });
    });
    return h("div", { class: "aitem" }, h("img", { src: photoSrc(f), alt: "" }),
      h("div", { class: "t", style: "flex:1;display:grid;gap:6px" }, h("div", { class: "field" }, tIn), h("div", { class: "field" }, cSel)),
      h("div", { class: "acts", style: "flex-direction:column" }, saveB,
        deleteButton(function (b) {
          DB.collection("fotos").doc(f.id).delete().then(function () {
            return f.asset ? ASSETS.delete(f.asset).catch(function () {}) : null;
          }).then(function () { FLASH = { col: "fotos", msg: "Foto borrada." }; render(); }, function (e) { b.disabled = false; b.textContent = "Borrar"; alertInline(b, errMsg(e)); });
        })));
  })) : h("div", { class: "empty" }, h("p", { text: "La galería está vacía. Sube la primera foto con el formulario." }));
  return h("div", { class: "admin-grid" }, list, form);
}

function adminContacto() {
  var c = DATA.contacto || {}, st = statusEl();
  var fields = [["direccion", "Dirección de la sede", "text"], ["telefono", "Teléfono (WhatsApp)", "tel"], ["email", "Correo electrónico", "email"], ["mapa", "Enlace del botón Cómo llegar (Google Maps)", "url"]];
  var form = h("form", { class: "aform", style: "position:static;max-width:560px" }, h("h3", { text: "Datos de contacto" }),
    fields.map(function (f) { return h("div", { class: "field" }, h("label", { for: "ct-" + f[0], text: f[1] }), h("input", { id: "ct-" + f[0], name: f[0], type: f[2], value: c[f[0]] || "" })); }));
  var save = h("button", { class: "btn primary", type: "submit", text: "Guardar" });
  add(form, h("div", { class: "form-acts" }, save), st);
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var obj = {}; fields.forEach(function (f) { obj[f[0]] = form.elements[f[0]].value.trim(); });
    save.disabled = true; save.textContent = "Guardando…";
    DB.doc("ajustes/contacto").set(obj).then(function () { save.disabled = false; save.textContent = "Guardar"; setStatus(st, "Datos de contacto guardados.", true); },
      function (e) { save.disabled = false; save.textContent = "Guardar"; setStatus(st, errMsg(e), false); });
  });
  return form;
}


function adminPie() {
  var p = DATA.pie || {}, st = statusEl();
  var fields = [["texto", "Texto de presentación", "textarea"], ["apoyos", "Apoyos y colaboradores", "textarea"], ["copyright", "Línea inferior (©)", "text"]];
  var form = h("form", { class: "aform", style: "position:static;max-width:620px" }, h("h3", { text: "Pie de página" }),
    h("p", { class: "muted", text: "Las redes sociales del pie salen de la pestaña Enlaces y redes, y el teléfono y el correo de la pestaña Contacto." }),
    fields.map(function (f) {
      var inp = f[2] === "textarea" ? h("textarea", { id: "pie-" + f[0], name: f[0], style: "min-height:80px" }) : h("input", { id: "pie-" + f[0], name: f[0], type: "text" });
      inp.value = p[f[0]] || "";
      return h("div", { class: "field" }, h("label", { for: "pie-" + f[0], text: f[1] }), inp);
    }));
  var save = h("button", { class: "btn primary", type: "submit", text: "Guardar" });
  add(form, h("div", { class: "form-acts" }, save), st);
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var obj = {}; fields.forEach(function (f) { obj[f[0]] = form.elements[f[0]].value.trim(); });
    save.disabled = true; save.textContent = "Guardando…";
    DB.doc("ajustes/pie").set(obj).then(function () { save.disabled = false; save.textContent = "Guardar"; setStatus(st, "Pie de página guardado.", true); },
      function (e) { save.disabled = false; save.textContent = "Guardar"; setStatus(st, errMsg(e), false); });
  });
  return form;
}

function renderFooter() {
  var p = DATA.pie || {}, c = DATA.contacto || {};
  var socials = DATA.enlaces.slice().sort(byOrden).filter(function (l) { return safeUrl(l.url); });
  var pages = [["inicio", "Inicio"], ["quienes", "Quiénes somos"], ["banda", "Banda"], ["bandin", "Bandín"], ["actuaciones", "Actuaciones"], ["galeria", "Galería"], ["contacto", "Contacto"]];
  var el = document.getElementById("footer");
  el.replaceChildren(
    h("div", { class: "foot" },
      h("div", { class: "foot-brand" }, h("span", { class: "badge" }, h("img", { src: LOGO_MARK, alt: "ASAM" })),
        p.texto ? h("p", { text: p.texto }) : null, p.apoyos ? h("p", { text: p.apoyos }) : null),
      h("div", null, h("h4", { text: "La web" }), h("ul", null, pages.map(function (x) { return h("li", null, h("a", { href: "#" + x[0], text: x[1] })); }))),
      h("div", null, h("h4", { text: "Síguenos" }),
        socials.length ? h("div", { class: "socials" }, socials.map(function (l) { var b = socialBrand(l); return h("a", { class: b ? "soc soc-" + b : "", href: l.url, target: "_blank", rel: "noopener", text: l.nombre }); })) : null,
        h("div", { class: "foot-contact" }, c.direccion ? h("span", { text: c.direccion }) : null, c.telefono ? h("span", { text: "Tel. " + c.telefono + " (WhatsApp)" }) : null, c.email ? h("span", { text: c.email }) : null))),
    h("div", { class: "foot-bottom" }, h("span", { text: p.copyright || "" }),
      h("a", { href: "#admin", text: IS_ADMIN ? "Administración" : "Acceso administradores" })));
}

/* ---------- Lightbox y copiar ---------- */
function openLightbox(f) {
  var box = h("div", { class: "lightbox", role: "dialog", "aria-modal": "true", "aria-label": f.titulo || "Foto" });
  function close() { box.remove(); document.removeEventListener("keydown", onKey); }
  function onKey(e) { if (e.key === "Escape") close(); }
  add(box, h("button", { type: "button", text: "Cerrar ✕", onclick: close }),
    h("figure", null, h("img", { src: photoSrc(f), alt: f.titulo || "" }), f.titulo ? h("figcaption", { text: f.titulo + (f.categoria ? " · " + f.categoria : "") }) : null));
  box.addEventListener("click", function (e) { if (e.target === box) close(); });
  document.addEventListener("keydown", onKey);
  document.body.appendChild(box);
  box.querySelector("button").focus();
}
function copyText(btn, el) {
  var text = el.textContent.trim();
  function ok() { btn.textContent = "Copiado"; setTimeout(function () { btn.textContent = "Copiar"; }, 1600); }
  function fb() { var r = document.createRange(); r.selectNodeContents(el); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = "Seleccionado"; }
  try { navigator.clipboard.writeText(text).then(ok, fb); } catch (e) { fb(); }
}

/* ---------- Navegación ---------- */
var navEl = document.getElementById("nav"), menuBtn = document.getElementById("menu-btn");
menuBtn.addEventListener("click", function () { var o = navEl.classList.toggle("open"); menuBtn.setAttribute("aria-expanded", o ? "true" : "false"); });
navEl.addEventListener("click", function (e) { if (e.target.tagName === "A") { navEl.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); } });

var lastRoute = "";
function route() {
  var hash = (location.hash || "").replace(/^#/, "") || "inicio";
  var parts = hash.split("-"), page = parts[0], sub = parts.slice(1).join("-");
  if (page === "imagenes") page = "galeria";
  if (!PAGES[page]) { page = "inicio"; sub = ""; }
  return { page: page, sub: sub, key: page + "-" + sub };
}
function render() {
  var r = route();
  var focusId = document.activeElement && document.activeElement.id;
  var scroll = window.scrollY;
  app.replaceChildren();
  var page = h("div", { class: "page" });
  add(page, PAGES[r.page](r.sub));
  app.appendChild(page);
  Array.prototype.forEach.call(navEl.querySelectorAll("a"), function (a) { a.setAttribute("aria-current", a.getAttribute("data-p") === r.page ? "page" : "false"); });
  renderFooter();
  if (r.key !== lastRoute) { window.scrollTo(0, 0); lastRoute = r.key; }
  else { window.scrollTo(0, scroll); page.style.animation = "none"; if (focusId) { var f = document.getElementById(focusId); if (f) f.focus({ preventScroll: true }); } }
  document.title = "Banda de Música de Siero";
}
window.addEventListener("hashchange", render);
render();

/* ---------- Conexión con los datos compartidos ---------- */
function isFormBusy() {
  var a = document.activeElement;
  return a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && a.closest(".aform") && a.value;
}
var pending = false;
function softRender() {
  if (route().page === "admin" && isFormBusy()) { pending = true; return; }
  render();
}
document.addEventListener("focusout", function () { if (pending) setTimeout(function () { if (!isFormBusy()) { pending = false; render(); } }, 200); });

/* ---------- Conexión con Supabase ---------- */
function newId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}
function check(res) { if (res && res.error) throw res.error; return res; }
function loadAll() {
  return SB.from("contenido").select("coleccion,id,datos").then(function (res) {
    check(res);
    var next = {};
    COLLECTIONS.forEach(function (c) { next[c] = []; });
    (res.data || []).forEach(function (r) {
      if (r.coleccion === "ajustes") {
        if (r.id === "contacto") DATA.contacto = r.datos || {};
        if (r.id === "pie") DATA.pie = r.datos || {};
        return;
      }
      if (next[r.coleccion]) { var o = Object.assign({}, r.datos); o.id = r.id; next[r.coleccion].push(o); }
    });
    COLLECTIONS.forEach(function (c) { DATA[c] = next[c]; });
    LIVE = true;
  });
}
function docRef(col, id) {
  var ref = {
    set: function (obj) {
      var datos = Object.assign({}, obj); delete datos.id;
      return SB.from("contenido").upsert({ coleccion: col, id: id, datos: datos }).then(check).then(loadAll);
    },
    update: function (part) {
      var cur = (DATA[col] || []).filter(function (x) { return x.id === id; })[0] || {};
      return ref.set(Object.assign({}, cur, part));
    },
    delete: function () {
      return SB.from("contenido").delete().eq("coleccion", col).eq("id", id).then(check).then(loadAll);
    }
  };
  return ref;
}
var DB_ADAPTER = {
  collection: function (col) {
    return { doc: function (id) { return docRef(col, id || newId()); }, add: function (obj) { return docRef(col, newId()).set(obj); } };
  },
  doc: function (path) { var p = path.split("/"); return docRef(p[0], p[1]); }
};
/* Reduce las fotos grandes (por ejemplo, las del móvil) antes de subirlas */
function shrinkImage(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return Promise.resolve(file);
  return new Promise(function (resolve) {
    var url = URL.createObjectURL(file), img = new Image();
    img.onload = function () {
      var max = 2000, w = img.naturalWidth, hh = img.naturalHeight, k = Math.min(1, max / Math.max(w, hh));
      if (k === 1 && file.size < 1500000) { URL.revokeObjectURL(url); resolve(file); return; }
      var c = document.createElement("canvas");
      c.width = Math.round(w * k); c.height = Math.round(hh * k);
      var ctx = c.getContext("2d");
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob(function (b) {
        resolve(b && b.size < file.size ? new File([b], String(file.name || "foto").replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }) : file);
      }, "image/jpeg", 0.85);
    };
    img.onerror = function () { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}
var ASSETS_ADAPTER = {
  upload: function (original) {
    return shrinkImage(original).then(function (file) {
    var ext = (String(file.name || "").split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    var path = new Date().getFullYear() + "/" + newId() + "." + ext;
    return SB.storage.from("fotos").upload(path, file, { contentType: file.type || undefined, cacheControl: "31536000", upsert: false })
      .then(function (r) { if (r.error) throw r.error; return { id: path }; });
    });
  },
  delete: function (id) {
    return SB.storage.from("fotos").remove([id]).then(function (r) { if (r.error) throw r.error; return { deleted: true }; });
  }
};
function updateNav() { var a = document.getElementById("nav-admin"); a.hidden = false; a.textContent = "Administración"; }
function refreshAdmin() {
  if (!SESSION) { IS_ADMIN = false; ASSETS = null; updateNav(); return Promise.resolve(); }
  return SB.rpc("es_admin").then(function (r) {
    IS_ADMIN = !r.error && r.data === true;
    ASSETS = IS_ADMIN ? ASSETS_ADAPTER : null;
    updateNav();
  }, function () { IS_ADMIN = false; ASSETS = null; updateNav(); });
}

if (configured() && window.supabase && window.supabase.createClient) {
  SB = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey);
  DB = DB_ADAPTER;
  SB.auth.getSession().then(function (r) { SESSION = (r && r.data && r.data.session) || null; return refreshAdmin(); })
    .then(loadAll)
    .then(render, function (e) { console.error("No se han podido cargar los datos:", e); render(); });
  SB.auth.onAuthStateChange(function (event, session) {
    if (event === "INITIAL_SESSION") return;
    SESSION = session || null;
    ADMINS.loaded = false; ADMINS.list = [];
    // Se sale del callback antes de llamar de nuevo a Supabase
    setTimeout(function () { refreshAdmin().then(render); }, 0);
  });
  // Recarga los datos al volver a la pestaña, por si otro administrador ha cambiado algo
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible" && LIVE) loadAll().then(softRender, function () {});
  });
}
})();
