/* Web de la Asociación Sierense Amigos de la Música (ASAM) */
(function () {
"use strict";
var LOGO_FULL = "img/logo/logo-asam.svg";
var LOGO_MARK = "img/logo/logo-asam-simbolo.svg";
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
  profesores: [
    { id: "silvia-ovies", nombre: "Silvia Ovies", especialidad: "Flauta", color: "verde", orden: 10, bio: "Flautista. Tras dirigir el Bandín, se dedica en exclusiva a la docencia en la escuela de la ASAM." }
  ],
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
  escuela: {
    titulo: "Aprende a tocar desde los 6 años",
    intro: "Clases de instrumento y de repertorio y, desde el principio, práctica en grupo con el Bandín.",
    edad: "Desde los 6 años · También clases para adultos",
    semana: [
      { nombre: "Clase de instrumento", duracion: "45 min", texto: "Clase individual: cada alumno aprende su instrumento con su profesor.", color: "azul" },
      { nombre: "Clase de repertorio", duracion: "60 min", texto: "Clase grupal de teoría musical.", color: "verde" },
      { nombre: "Ensayo del Bandín", duracion: "60 min", texto: "Todo lo aprendido se pone en práctica tocando juntos.", color: "naranja", enlace: "#bandin", boton: "Conoce el Bandín" }
    ],
    sedes: [
      { nombre: "Casa de la Música", lugar: "Pola de Siero", enlace: "https://maps.app.goo.gl/ekUwwADRScStcLzo6", lat: 43.39219, lng: -5.65457, color: "azul" },
      { nombre: "Centro Cultural de La Fresneda", lugar: "La Fresneda", enlace: "https://maps.app.goo.gl/y2AwxYPMYkwN8cir6", lat: 43.41274, lng: -5.79082, color: "naranja" },
      { nombre: "CPI Lugones", lugar: "Lugones", enlace: "https://maps.app.goo.gl/pvGtepy4hUm2UW6V9", lat: 43.40210, lng: -5.80442, color: "verde" }
    ],
    cuotasTitulo: "Cuotas de socio promesa",
    periodo: "trimestre",
    cuotas: [
      { nombre: "Clases de repertorio", precio: "90", color: "azul", destacado: false },
      { nombre: "Clases de instrumento", precio: "120", color: "verde", destacado: false },
      { nombre: "Repertorio + instrumento", precio: "210", color: "naranja", destacado: true }
    ],
    pago: "Cuota trimestral, Domiciliación bancaria"
  },
  socio: {
    titulo: "Hazte socio de la ASAM",
    intro: "La asociación se sostiene gracias a sus socios. Con tu cuota ayudas a que haya conciertos gratuitos, música en las fiestas y una escuela abierta a todas las edades.",
    cuota: "Desde 12 € al año",
    texto: "Personas, empresas e instituciones pueden colaborar con la divulgación de la música en Siero y la Comarca del Nora haciéndose socio o mecenas.",
    pasos: "Rellena la hoja de socio con tus datos.\nEntrégala en nuestras oficinas o envíanosla.\nTe confirmamos el alta y empiezas a formar parte de la asociación.",
    aviso: "Para más información, contacte con nosotros o pase por nuestras oficinas."
  },
  pie: { texto: "Asociación sin ánimo de lucro que enseña, toca y comparte música en el concejo de Siero desde 1984.", apoyos: "Con el apoyo del Ayuntamiento de Siero y la Fundación Caja Rural de Asturias", copyright: "© Asociación Sierense Amigos de la Música · Pola de Siero, Asturias" }
};

var COLLECTIONS = ["directiva", "directores", "eventos", "noticias", "enlaces", "fotos", "musicos", "historia", "profesores"];
var MAPA_DEFECTO = "https://maps.app.goo.gl/ekUwwADRScStcLzo6";
var DATA = JSON.parse(JSON.stringify(DEFAULTS));
var LIVE = false;          // true cuando la base de datos responde
var DB = null, ASSETS = null, IS_ADMIN = false;
var FOTO_FILTER = "todas";
var EDITING = {};          // colección -> id en edición
var app = document.getElementById("app");

/* ---------- Utilidades ---------- */
/* ---------- Idioma: castellano (es) o asturiano (ast) ---------- */
var LANG = "es";
try { if (localStorage.getItem("asam-lang") === "ast") LANG = "ast"; } catch (e) {}
var AST = window.ASAM_AST || { exacto: {}, prefijos: [], reglas: [] };
var TR_ATTRS = { placeholder: 1, "aria-label": 1, title: 1, alt: 1 };
function tr(s) {
  if (LANG !== "ast" || typeof s !== "string" || !s) return s;
  var D = AST.exacto;
  if (Object.prototype.hasOwnProperty.call(D, s)) return D[s];
  var t = s.trim();
  if (t !== s && t && Object.prototype.hasOwnProperty.call(D, t)) return s.replace(t, D[t]);
  for (var i = 0; i < AST.reglas.length; i++) if (AST.reglas[i][0].test(t)) return s.replace(t, t.replace(AST.reglas[i][0], AST.reglas[i][1]));
  for (var j = 0; j < AST.prefijos.length; j++) { var pr = AST.prefijos[j]; if (s.indexOf(pr[0]) === 0) return pr[1] + tr(s.slice(pr[0].length)); }
  // Símbolo o emoji delante ("📍 Auditorio…") o flecha detrás ("Ver más →")
  var m = /^([^A-Za-zÀ-ÿ¡¿«0-9]+)(.+)$/.exec(s);
  if (m) { var r1 = tr(m[2]); if (r1 !== m[2]) return m[1] + r1; }
  m = /^(.+?)(\s*[→↓↗]+)$/.exec(s);
  if (m) { var r2 = tr(m[1]); if (r2 !== m[1]) return r2 + m[2]; }
  return s;
}
function setLang(l) {
  LANG = l === "ast" ? "ast" : "es";
  try { localStorage.setItem("asam-lang", LANG); } catch (e) {}
  applyLangBasics();
  render();
}

function h(tag, attrs) {
  var el = document.createElement(tag);
  if (attrs) for (var k in attrs) {
    var v = attrs[k];
    if (v == null || v === false) continue;
    if (LANG === "ast" && typeof v === "string" && (k === "text" || k === "html" || TR_ATTRS[k])) v = tr(v);
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
  el.appendChild(typeof c === "string" ? document.createTextNode(tr(c)) : c);
}
var MESES_ES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
var MES_CORTO_ES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
var MESES = MESES_ES.slice(), MES_CORTO = MES_CORTO_ES.slice();
function parseDate(s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? { y: +m[1], m: +m[2], d: +m[3] } : null; }
function fmtLong(s) {
  var p = parseDate(s); if (!p) return "";
  var mes = MESES[p.m - 1];
  return p.d + (LANG === "ast" && /^[aeiou]/.test(mes) ? " d'" : " de ") + mes + " de " + p.y;
}
function todayStr() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function initials(n) { return (n || "?").split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0].toUpperCase(); }).join(""); }
function colorVar(c) { return c === "naranja" ? "var(--naranja)" : c === "verde" ? "var(--verde)" : c === "negro" ? "var(--nota)" : "var(--azul)"; }
function safeUrl(u) { return /^https?:\/\//i.test(u || "") ? u : null; }
function byOrden(a, b) { return (Number(a.orden) || 999) - (Number(b.orden) || 999) || String(a.nombre || "").localeCompare(String(b.nombre || "")); }
function sortedNews() { return DATA.noticias.slice().sort(function (a, b) { if (!a.fecha && !b.fecha) return 0; if (!a.fecha) return 1; if (!b.fecha) return -1; return a.fecha < b.fecha ? 1 : -1; }); }
function eventsSplit() {
  var t = todayStr(), up = [], past = [];
  DATA.eventos.forEach(function (e) { if (e.publico === "no") return; (e.fecha >= t ? up : past).push(e); });
  up.sort(function (a, b) { return a.fecha < b.fecha ? -1 : 1; });
  past.sort(function (a, b) { return a.fecha < b.fecha ? 1 : -1; });
  return { up: up, past: past };
}
function photoSrc(f) { return f.asset ? blobUrl(f.asset) : ""; }
function adminLink(tab, label) { return IS_ADMIN ? h("a", { class: "admin-hint", href: "#admin-" + tab, text: "✎ " + label }) : null; }

/* ---------- Componentes públicos ---------- */
function headSize(el, c) {
  el.classList.add(c);
  if (c === "head-photo") {
    var wrap = el.querySelector(":scope > .wrap");
    if (wrap) {
      var box = h("div", { class: "head-box" });
      Array.prototype.slice.call(wrap.children).forEach(function (ch) { if (ch.matches(".eyebrow, h1, .lead")) box.appendChild(ch); });
      wrap.insertBefore(box, wrap.firstChild);
    }
    el.appendChild(h("button", { type: "button", class: "scroll-cue", "aria-label": "Más información abajo",
      onclick: function () { var nx = el.nextElementSibling; if (nx) nx.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }); } },
      h("span", { "aria-hidden": "true" })));
  }
  return el;
}
function pageHead(eyebrow, title, lead, cls, extra, logo, bg) {
  return h("div", { class: "page-head" + (logo ? " with-logo" : "") + (bg ? " has-bg" : "") },
    bg ? h("div", { class: "head-bg", "aria-hidden": "true", style: "background-image:url('" + bg + "')" }) : null,
    h("div", { class: "wrap" },
    h("span", { class: "eyebrow " + (cls || ""), text: eyebrow }), h("h1", { text: title }), lead ? h("p", { class: "lead", text: lead }) : null,
    logo ? (logo.el ? logo.el : h("div", { class: "head-logo" }, h("img", { src: logo.src, alt: logo.alt }))) : null),
    h("div", { class: "staff-lines", "aria-hidden": "true" }), extra || null);
}

/* "¡La Banda de Pola mola!" escrito en el pentagrama con letras hechas de figuras musicales.
   Cada letra se dibuja en una caja de 48 px de alto, que coincide con las cinco líneas del pentagrama
   (la de arriba en y = 12 y la de abajo en y = 60 dentro de la capa). */
var MUSIC_GLYPHS = (function () {
  function E(tag, a) { return { tag: tag, a: a }; }
  function head(cx, cy, open) { return E("ellipse", { cx: cx, cy: cy, rx: 6, ry: 4.4, transform: "rotate(-20 " + cx + " " + cy + ")", "class": open ? "g-open" : "g-fill" }); }
  function stem(x, y1, y2) { return E("line", { x1: x, y1: y1, x2: x, y2: y2, "class": "g-stroke" }); }
  function beam(x1, x2, y) { return E("polygon", { points: x1 + "," + (y + 3) + " " + x2 + "," + (y - 1) + " " + x2 + "," + (y + 4) + " " + x1 + "," + (y + 8), "class": "g-fill" }); }
  function path(d, cls) { return E("path", { d: d, "class": cls || "g-stroke" }); }
  return {
    "¡": { w: 10, els: [E("circle", { cx: 5, cy: 18, r: 3, "class": "g-fill" }), stem(5, 26, 46)] },
    "!": { w: 10, els: [stem(5, 2, 28), head(5, 40)] },
    " ": { w: 12, els: [] },
    // Mayúsculas: trazo doble, como la plica de una nota escrita a mano
    "L": { w: 22, els: [stem(4, 2, 46), stem(9, 2, 41), beam(4, 21, 38)] },
    "B": { w: 24, els: [stem(4, 2, 46), stem(9, 2, 46), path("M9 3 C22 4 23 20 9 22"), path("M9 22 C24 22 25 45 9 45")] },
    "P": { w: 22, els: [stem(4, 2, 46), stem(9, 2, 46), E("ellipse", { cx: 14, cy: 12, rx: 7, ry: 7.5, "class": "g-open" })] },
    // Minúsculas: notas
    "a": { w: 20, els: [E("ellipse", { cx: 9, cy: 35, rx: 6.5, ry: 7, "class": "g-open" }), stem(15.6, 22, 46)] },
    "d": { w: 20, els: [E("ellipse", { cx: 9, cy: 35, rx: 6.5, ry: 7, "class": "g-open" }), stem(15.6, 2, 46)] },
    "o": { w: 20, els: [E("ellipse", { cx: 10, cy: 34, rx: 7.5, ry: 6, transform: "rotate(-20 10 34)", "class": "g-open" })] },
    "e": { w: 20, els: [path("M3.5 33 H17 C17 25 4 23 3.5 33 C3.5 42 13 44 17 39")] },
    "l": { w: 13, els: [stem(4, 2, 46), path("M4 2 C12 8 13 13 10 20")] },
    "n": { w: 22, els: [stem(4, 22, 46), stem(18, 18, 46), beam(4, 18, 16)] },
    "m": { w: 32, els: [stem(4, 22, 46), stem(16, 20, 46), stem(28, 18, 46), beam(4, 28, 14), beam(4, 28, 22)] }
  };
})();
/* Segundo estilo, para el Bandín: mayúsculas cursivas con cabezas de nota en los extremos */
var MUSIC_CAPS = (function () {
  function E(tag, a) { return { tag: tag, a: a }; }
  function head(cx, cy) { return E("ellipse", { cx: cx, cy: cy, rx: 5.2, ry: 3.8, transform: "rotate(-25 " + cx + " " + cy + ")", "class": "g-fill" }); }
  function p(d, w) { return E("path", { d: d, "class": "g-stroke", style: w ? "stroke-width:" + w : null }); }
  function sk(w, els) { return { w: w, els: [E("g", { transform: "skewX(-12) translate(8 0)", _children: els })] }; }
  var G = {
    " ": { w: 14, els: [] },
    "¡": sk(10, [head(5, 9), p("M5 17 L5 44", 3.6)]),
    "!": sk(10, [p("M5 4 L5 30", 3.6), head(5, 40)]),
    "E": sk(22, [p("M8 6 L8 44", 4.2), p("M8 6 C14 3 19 4 22 8"), p("M8 24 L18 24"), p("M8 44 L19 44 C22 44 23 41 22 38"), head(22, 10)]),
    "L": sk(20, [p("M8 4 L8 44 L20 44", 4.2), p("M8 4 C4 4 3 8 5 10"), head(20, 41)]),
    "B": sk(22, [p("M6 6 L6 44", 4.2), p("M6 6 C21 4 22 23 6 24 C24 23 25 45 6 44"), head(4, 44)]),
    "A": sk(26, [p("M3 44 L13 6 L23 44", 3.6), p("M7.5 30 L19 30"), head(3, 42), p("M13 6 C16 2 19 3 20 6")]),
    "N": sk(24, [p("M4 44 L4 6", 3.2), p("M4 6 L20 44", 4.4), p("M20 44 L20 6", 3.2), head(4, 42), p("M20 6 C21 2 24 2 25 5")]),
    "D": sk(26, [p("M6 6 L6 44", 4.2), p("M6 6 C30 4 30 46 6 44"), head(4, 44)]),
    "I": sk(12, [p("M6 8 L6 44", 4.2), p("M2 8 L10 8"), head(6, 44)]),
    "Í": sk(12, [p("M6 10 L6 44", 4.2), p("M3 10 L10 10"), p("M7 5 L12 -2", 3), head(6, 44)]),
    "O": sk(24, [E("ellipse", { cx: 12, cy: 25, rx: 10, ry: 19, "class": "g-open", style: "stroke-width:3.8" }), head(20, 8)]),
    "P": sk(22, [p("M6 6 L6 44", 4.2), p("M6 6 C24 4 24 27 6 26"), head(4, 44)]),
    "M": sk(30, [p("M3 44 L5 6", 3.2), p("M5 6 L15 32", 4.4), p("M15 32 L25 6", 3.2), p("M25 6 L27 44", 4.2), head(27, 43)])
  };
  // Resto del alfabeto, en el mismo estilo (cabeza de nota al final del trazo)
  var C = G;
  function acc(base, x, y) { var g = C[base]; return { w: g.w, els: [E("g", { transform: g.els[0].a.transform, _children: g.els[0].a._children.concat([p("M" + x + " " + y + " L" + (x + 5) + " " + (y - 6), 3)]) })] }; }
  Object.assign(C, {
    "C": sk(22, [p("M21 10 C16 3 4 4 4 25 C4 46 17 46 21 39", 3.8), head(21, 40)]),
    "F": sk(22, [p("M8 6 L8 44", 4.2), p("M8 6 C14 3 19 4 22 8"), p("M8 24 L17 24"), head(22, 10)]),
    "G": sk(24, [p("M21 10 C16 3 4 4 4 25 C4 46 20 46 21 30 L14 30", 3.8), head(14, 30)]),
    "H": sk(24, [p("M4 6 L4 44", 4.2), p("M20 6 L20 44", 4.2), p("M4 25 L20 25"), head(20, 44)]),
    "J": sk(18, [p("M14 6 L14 35 C14 46 3 46 3 38", 4.2), p("M9 6 L18 6"), head(3, 38)]),
    "K": sk(22, [p("M5 6 L5 44", 4.2), p("M20 6 L6 27 L20 44", 3.4), head(20, 44)]),
    "Q": sk(26, [E("ellipse", { cx: 12, cy: 25, rx: 10, ry: 19, "class": "g-open", style: "stroke-width:3.8" }), p("M14 34 L24 46", 3.6), head(24, 45)]),
    "R": sk(22, [p("M6 6 L6 44", 4.2), p("M6 6 C24 4 24 27 6 26 L20 44", 3.4), head(20, 44)]),
    "S": sk(20, [p("M19 10 C15 3 4 4 4 14 C4 25 19 22 19 34 C19 45 6 46 3 39", 3.8), head(3, 40)]),
    "T": sk(22, [p("M2 6 C8 3 16 8 22 5"), p("M12 6 L12 44", 4.2), head(12, 44)]),
    "U": sk(22, [p("M3 6 L3 32 C3 46 19 46 19 32 L19 6", 3.8), head(19, 7)]),
    "V": sk(24, [p("M2 6 L12 44 L22 6", 3.6), head(22, 7)]),
    "W": sk(32, [p("M2 6 L9 44 L16 16 L23 44 L30 6", 3.4), head(30, 7)]),
    "X": sk(22, [p("M3 6 L19 44", 3.8), p("M19 6 L3 44", 3.4), head(19, 44)]),
    "Y": sk(22, [p("M3 6 L11 24 L19 6", 3.4), p("M11 24 L11 44", 4.2), head(11, 44)]),
    "Z": sk(22, [p("M3 6 L19 6 L3 44 L19 44", 3.6), head(19, 44)]),
    "?": sk(16, [p("M3 12 C3 2 15 2 15 12 C15 20 8 20 8 30", 3.4), head(8, 40)]),
    "¿": sk(16, [head(8, 9), p("M8 18 C8 28 1 28 1 36 C1 46 13 46 13 36", 3.4)]),
    ",": sk(8, [head(4, 40), p("M6 41 L2 48", 2.6)]),
    ".": sk(8, [head(4, 42)]),
    "0": sk(20, [E("ellipse", { cx: 10, cy: 25, rx: 8.5, ry: 19, "class": "g-open", style: "stroke-width:3.6" }), head(17, 9)]),
    "1": sk(14, [p("M3 14 L10 6 L10 44", 4.2), head(10, 44)]),
    "2": sk(20, [p("M3 13 C4 3 19 3 18 14 C17 24 3 34 3 44 L19 44", 3.8), head(19, 44)]),
    "3": sk(20, [p("M3 10 C7 3 18 4 18 14 C18 22 9 24 8 24 C20 24 21 44 9 44 C5 44 3 42 3 40", 3.6), head(3, 40)]),
    "4": sk(22, [p("M15 44 L15 6 L2 32 L21 32", 3.6), head(15, 44)]),
    "5": sk(20, [p("M18 6 L5 6 L4 22 C12 18 19 24 19 33 C19 46 5 46 3 39", 3.6), head(3, 40)]),
    "6": sk(20, [p("M17 8 C8 3 3 14 3 30 C3 46 18 46 18 33 C18 22 5 22 3 30", 3.6), head(17, 9)]),
    "7": sk(20, [p("M2 6 L19 6 L8 44", 3.8), head(8, 44)]),
    "8": sk(20, [p("M10 24 C2 22 3 6 10 6 C17 6 18 22 10 24 C1 26 2 44 10 44 C19 44 19 26 10 24", 3.4), head(17, 8)]),
    "9": sk(20, [p("M17 18 C17 4 3 4 3 15 C3 26 17 26 17 18 L17 34 C17 45 6 46 4 40", 3.6), head(4, 40)])
  });
  C["Á"] = acc("A", 14, 1); C["É"] = acc("E", 12, 1); C["Ó"] = acc("O", 13, 1); C["Ú"] = acc("U", 11, 1);
  C["Ñ"] = { w: C.N.w, els: [E("g", { transform: C.N.els[0].a.transform, _children: C.N.els[0].a._children.concat([p("M4 -1 C8 -5 12 1 18 -3", 2.6)]) })] };
  return C;
})();
function staffLettering(text, opts) {
  opts = opts || {};
  text = tr(text);
  var SET = opts.glyphs || MUSIC_GLYPHS;
  var wordColors = opts.colors || { 1: "c-azul", 4: "c-verde" };
  var punct = opts.punct || "c-naranja";
  opts.center = opts.center !== false; opts.noBar = !opts.bar;
  var NS = "http://www.w3.org/2000/svg";
  function el(tag, attrs) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  var GAP = 4, x = 0, glyphs = [];
  // Colores: "Banda" en azul, "mola" en verde y las exclamaciones en naranja
  Array.from(text).forEach(function (ch) {
    var g = SET[ch] || SET[ch.toUpperCase()] || SET[ch.toLowerCase()] || SET[" "];
    glyphs.push({ ch: ch, g: g, x: x });
    x += g.w + GAP;
  });
  var W = x - GAP;
  var avail = Math.max(200, Math.min(window.innerWidth, 1120) - 40);
  var sc = Math.min(1, (avail * (window.innerWidth < 700 ? 1 : 0.62)) / W);
  var svg = el("svg", { role: "img", "aria-label": text });
  var anchor = el("svg", { x: opts.center ? "50%" : "100%", y: "0", overflow: "visible" });
  var dx = opts.center ? -(W * sc) / 2 : -(W * sc) - 26;
  var g = el("g", { transform: "translate(" + dx + " " + (12 + (48 - 48 * sc) / 2) + ") scale(" + sc + ")", "class": "lettering" });
  var word = 0;
  glyphs.forEach(function (it) {
    if (it.ch === " ") { word++; return; }
    var cls = (it.ch === "¡" || it.ch === "!") ? punct : (wordColors[word] || "");
    var gg = el("g", { transform: "translate(" + it.x + " 0)", "class": cls });
    (function addAll(parent, list) {
      list.forEach(function (e) {
        var attrs = {}; for (var k in e.a) if (k !== "_children" && e.a[k] != null) attrs[k] = e.a[k];
        var node = el(e.tag, attrs);
        if (e.a._children) addAll(node, e.a._children);
        parent.appendChild(node);
      });
    })(gg, it.g.els);
    g.appendChild(gg);
  });
  anchor.appendChild(g);
  if (!opts.noBar) {
    // doble barra final
    anchor.appendChild(el("line", { "class": "bar", x1: "-9", y1: "12", x2: "-9", y2: "60" }));
    anchor.appendChild(el("line", { "class": "bar thick", x1: "-3", y1: "12", x2: "-3", y2: "60" }));
  }
  svg.appendChild(anchor);
  return h("div", { class: "staff-notes" }, h("div", { class: "wrap" }, svg));
}
function eventRow(e, past) {
  var p = parseDate(e.fecha);
  var fcls = /bandín|bandin/i.test(e.formacion || "") ? (/banda y/i.test(e.formacion) ? "banda" : "bandin") : /escuela/i.test(e.formacion || "") ? "escuela" : "banda";
  return h("div", { class: "event" + (past ? " past" : "") },
    h("div", { class: "cal" }, h("b", { text: p ? String(p.d) : "—" }), h("span", { text: p ? MES_CORTO[p.m - 1] + " " + String(p.y).slice(2) : "" })),
    h("div", null, h("h3", { text: e.titulo }),
      h("div", { class: "meta" }, e.hora ? h("span", { text: "🕗 " + e.hora }) : null, e.lugar ? h("span", { text: "📍 " + e.lugar }) : null),
      e.descripcion ? h("p", { text: e.descripcion }) : null,
      repertorioList(e, past)),
    e.formacion ? h("span", { class: "pill " + fcls, text: e.formacion }) : null,
    !past && e.cartel ? h("button", { type: "button", class: "event-cartel", "aria-label": "Ver el cartel de " + e.titulo,
      onclick: function () { openLightbox({ asset: e.cartel, titulo: "Cartel · " + e.titulo }); } },
      h("img", { src: blobUrl(e.cartel), alt: "Cartel de " + e.titulo, loading: "lazy" }), h("span", { text: "Ver cartel" })) : null);
}
function repertorioList(e, past) {
  var obras = String(e.repertorio || "").split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
  if (!obras.length) return null;
  var d = h("details", { class: "repertorio" }, h("summary", { text: "🎼 Repertorio (" + obras.length + (obras.length === 1 ? " obra)" : " obras)") }),
    h("ol", null, obras.map(function (o) { return h("li", { text: o }); })));
  if (!past) d.open = obras.length <= 8;
  return d;
}
function youtubeId(url) {
  var m = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([A-Za-z0-9_-]{11})/.exec(url || "");
  return m ? m[1] : null;
}
function videoEmbed(id, title) {
  var box = h("div", { class: "video" });
  var play = h("button", { type: "button", class: "video-play", "aria-label": "Reproducir vídeo: " + (title || "YouTube") },
    h("img", { src: "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg", alt: "", loading: "lazy" }),
    h("span", { class: "play-icon", "aria-hidden": "true" }));
  play.addEventListener("click", function () {
    box.replaceChildren(h("iframe", { src: "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0", title: title || "Vídeo de YouTube",
      allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share", allowfullscreen: true, referrerpolicy: "strict-origin-when-cross-origin" }));
  });
  box.appendChild(play);
  return box;
}

function newsCard(n, i) {
  var colors = ["var(--verde)", "var(--azul)", "var(--naranja)", "var(--nota)"];
  var fotos = Array.isArray(n.fotos) ? n.fotos.filter(Boolean) : [];
  var allLinks = Array.isArray(n.enlaces) ? n.enlaces.filter(function (l) { return l && safeUrl(l.url); }) : [];
  var videos = allLinks.filter(function (l) { return youtubeId(l.url); });
  var links = allLinks.filter(function (l) { return !youtubeId(l.url); });
  function shot(id) { return { asset: id, titulo: n.titulo }; }
  var firstVideo = videos[0];
  var top = firstVideo
    ? h("div", { class: "cover-video" }, videoEmbed(youtubeId(firstVideo.url), firstVideo.texto || n.titulo))
    : fotos.length
    ? h("button", { class: "cover", type: "button", "aria-label": "Ver foto de " + (n.titulo || "la noticia"), onclick: function () { openLightbox(shot(fotos[0])); } },
        h("img", { src: blobUrl(fotos[0]), alt: "", loading: "lazy" }))
    : h("div", { class: "bar", style: "background:" + colors[i % 4] });
  return h("article", { class: "post" }, top,
    h("div", { class: "in" }, n.fecha ? h("time", { datetime: n.fecha, text: fmtLong(n.fecha) }) : null,
      n.etiqueta ? h("span", { class: "tag", text: n.etiqueta }) : null, h("h3", { text: n.titulo }), n.texto ? h("p", { text: n.texto }) : null,
      (firstVideo ? fotos : fotos.slice(1)).length ? h("div", { class: "thumbs" }, (firstVideo ? fotos : fotos.slice(1)).map(function (id) {
        return h("button", { type: "button", "aria-label": "Ver otra foto", onclick: function () { openLightbox(shot(id)); } }, h("img", { src: blobUrl(id), alt: "", loading: "lazy" }));
      })) : null,
      videos.slice(1).map(function (l) { return videoEmbed(youtubeId(l.url), l.texto || n.titulo); }),
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
  var yt = (Array.isArray(n.enlaces) ? n.enlaces : []).filter(function (l) { return l && youtubeId(l.url); })[0];
  return h("article", { class: "hero-news" },
    yt ? h("div", { class: "hn-video" }, videoEmbed(youtubeId(yt.url), yt.texto || n.titulo))
      : foto ? h("div", { class: "hn-photo" }, h("img", { src: blobUrl(foto), alt: "" })) : null,
    h("div", { class: "hn-body" },
      h("span", { class: "eyebrow", text: "Última noticia" }),
      n.fecha ? h("time", { datetime: n.fecha, text: fmtLong(n.fecha) }) : null,
      h("h2", { text: n.titulo }),
      n.texto ? h("p", { text: excerpt(n.texto, (foto || yt) ? 150 : 240) }) : null,
      h("a", { class: "btn primary", href: "#noticias", text: "Ver más" })));
}

PAGES.inicio = function () {
  var allNews = sortedNews(), latest = allNews[0], ev = eventsSplit().up.slice(0, 3), news = allNews.slice(1, 4);
  return [
    h("div", { class: "hero" },
      h("div", { class: "wrap" },
        h("div", null,
          h("h1", { html: 'Ponemos <span class="a">música</span> a Siero: la <span class="v">banda</span>, el <span class="o">bandín</span> y la escuela.' }),
          h("p", { class: "lead", text: "La Asociación Sierense Amigos de la Música es una entidad sin ánimo de lucro que enseña, toca y comparte música en el concejo. Conciertos gratuitos, pasacalles en las fiestas y clases para todas las edades." }),
          h("div", { class: "actions" }, h("a", { class: "btn primary", href: "#actuaciones", text: "Ver actuaciones" }), h("a", { class: "btn ghost", href: "#contacto", text: "Apúntate a clase" }))),
        latest ? heroNews(latest) : h("div", { class: "logo-card" }, h("img", { src: LOGO_FULL, alt: "Logotipo de la Asociación Sierense Amigos de la Música" }))),
      h("div", { class: "milestone" }, h("div", { class: "wrap ms-grid" },
        h("div", { class: "ms-years" },
          h("b", { text: String(yearsSinceFounding()) }),
          h("div", null, h("span", { class: "ms-big", text: "años poniendo música a Siero" }), h("span", { class: "ms-small", text: "Fundada el 24 de diciembre de 1984" }))),
        h("a", { class: "ms-item", href: "#banda" }, h("i", { class: "dot", style: "background:var(--azul)" }), h("b", { text: "Banda" }), h("span", { text: "Viento y percusión" })),
        h("a", { class: "ms-item", href: "#bandin" }, h("i", { class: "dot", style: "background:var(--naranja)" }), h("b", { text: "Bandín" }), h("span", { text: "Cantera de jóvenes músicos" })),
        h("a", { class: "ms-item", href: "#escuela" }, h("i", { class: "dot", style: "background:var(--verde)" }), h("b", { text: "Escuela" }), h("span", { text: "Clases desde los 6 años" })),
        h("a", { class: "ms-item ms-socio", href: "#socio" }, h("i", { class: "dot", style: "background:var(--nota)" }), h("b", { text: "Hacerse socio" }), h("span", { text: socioCuota() }))))),
    h("section", { class: "block" }, h("div", { class: "wrap" },
      h("div", { class: "row-head" }, h("h2", { text: "Tres maneras de vivir la música" })),
      h("div", { class: "doors" },
        h("a", { class: "door", href: "#banda" }, h("h3", null, h("i", { style: "background:var(--azul)" }), "La Banda"), h("p", { text: "Músicos profesionales y aficionados que llenan de música auditorios y fiestas del concejo." }), h("span", { class: "more", text: "Conoce la Banda →" })),
        h("a", { class: "door", href: "#bandin" }, h("h3", null, h("i", { style: "background:var(--naranja)" }), "El Bandín"), h("p", { text: "La cantera: los más jóvenes aprenden a tocar en grupo y preparan el relevo." }), h("span", { class: "more", text: "Conoce el Bandín →" })),
        h("a", { class: "door", href: "#escuela" }, h("h3", null, h("i", { style: "background:var(--verde)" }), "La Escuela"), h("p", { text: "Clases de instrumento y de repertorio y ensayo con el Bandín, desde los 6 años." }), h("span", { class: "more", text: "Conoce la Escuela →" }))))),
    h("section", { class: "block alt" }, h("div", { class: "wrap" },
      h("div", { class: "row-head" }, h("h2", { text: "Próximas actuaciones" }), h("a", { class: "btn ghost small", href: "#actuaciones", text: "Ver todas" })),
      ev.length ? h("div", { class: "events" }, ev.map(function (e) { return eventRow(e); })) : emptyBox("Pronto anunciaremos las próximas actuaciones. Síguenos en redes para no perderte nada.", "eventos"))),
    h("section", { class: "block" }, h("div", { class: "wrap" },
      news.length ? h("div", { class: "row-head" }, h("h2", { text: "Más noticias" }), h("a", { class: "btn ghost small", href: "#noticias", text: "Todas las noticias" })) : null,
      news.length ? h("div", { class: "news" }, news.map(function (n, i) { return newsCard(n, i + 1); })) : (latest ? null : emptyBox("Todavía no hay noticias publicadas.", "noticias")),
      h("div", { class: "join", style: "margin-top:40px" },
        h("div", null, h("b", { text: "¿Quieres tocar con nosotros?" }), h("p", { text: "Clases para todas las edades y sitio en el Bandín y la Banda. Hazte socio " + socioCuota().toLowerCase() + "." })),
        h("a", { class: "btn", href: "#contacto", text: "Contacta" }))))
  ];
};

function socioData() { return Object.assign({}, DEFAULTS.socio, DATA.socio || {}); }
function socioCuota() { return socioData().cuota || "Desde 12 € al año"; }
PAGES.socio = function () {
  var S = socioData();
  var pasos = String(S.pasos || "").split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
  return [
    pageHead("Hacerse socio", S.titulo || "Hazte socio", S.intro || null, null,
      staffLettering("¡Hazte socio!", { glyphs: MUSIC_CAPS, colors: { 0: "c-azul", 1: "c-verde" }, punct: "c-naranja" })),
    h("section", { class: "block" }, h("div", { class: "wrap" },
      IS_ADMIN ? h("div", { class: "row-head" }, h("span"), adminLink("socio", "Editar esta página")) : null,
      h("div", { class: "socio-grid" },
        h("div", { class: "socio-info" },
          h("h2", { text: "¿Cómo hacerse socio?" }),
          S.texto ? h("p", { class: "muted", text: S.texto }) : null,
          pasos.length ? h("ol", { class: "socio-steps" }, pasos.map(function (t) { return h("li", { text: t }); })) : null),
        h("aside", { class: "socio-price" },
          h("span", { class: "eyebrow", text: "Cuota de socio" }),
          h("b", { text: S.cuota || "" }),
          h("a", { class: "btn primary", href: "#socio-hoja", onclick: function (ev) { ev.preventDefault(); var t = document.getElementById("socio-hoja"); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" }); }, text: "Hoja de socio ↓" }))),
      h("div", { class: "socio-hoja", id: "socio-hoja" },
        h("div", null, h("span", { class: "eyebrow", text: "Hoja de socio" }),
          h("h3", { text: "Muy pronto podrás rellenarla aquí" }),
          h("p", { class: "muted", text: "Estamos preparando la hoja de inscripción para que puedas completarla desde la web. Mientras tanto, puedes pedirla en nuestras oficinas." }))),
      S.aviso ? h("p", { class: "socio-aviso" }, h("span", { "aria-hidden": "true", text: "ℹ️ " }), S.aviso + " ", h("a", { href: "#contacto", text: "Ver datos de contacto →" })) : null))
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
          h("ul", null, h("li", { text: "Repertorio" }), h("li", { text: "Instrumentos de viento madera y metal" }), h("li", { text: "Percusión" }), h("li", { text: "Práctica de conjunto en el Bandín y la Banda" })),
          h("a", { class: "btn small", href: "#escuela", style: "background:#fff;color:#2a63b3;justify-self:start", text: "Horarios y cuotas →" })),
        h("div", { class: "socio" }, h("b", { text: "Hazte socio desde 12 € al año" }), h("p", { text: "Personas, empresas e instituciones pueden colaborar con la divulgación de la música en Siero y la Comarca del Nora haciéndose socio o mecenas." }),
          h("a", { class: "btn ghost small", href: "#socio", style: "justify-self:start;margin-top:6px", text: "Cómo hacerse socio →" })))))),
    h("section", { class: "block alt" }, h("div", { class: "wrap" }, h("div", { class: "pillars" },
      h("div", { class: "pillar" }, h("h3", null, h("i", { style: "background:var(--azul)" }), "Misión"), h("p", { text: "Promover la cultura musical en Siero y en Asturias a través de la educación, la interpretación y la participación de toda la comunidad." })),
      h("div", { class: "pillar" }, h("h3", null, h("i", { style: "background:var(--verde)" }), "Visión"), h("p", { text: "Ser un referente cultural del concejo, con un entorno inclusivo donde personas de cualquier edad desarrollen su talento musical." })),
      h("div", { class: "pillar" }, h("h3", null, h("i", { style: "background:var(--naranja)" }), "Valores"), h("p", { text: "Colaboración, respeto y apoyo mutuo. Creemos que la música une a la gente, y por eso todo el mundo es bienvenido." })))))
  ];
};

PAGES.historia = function () {
  var items = DATA.historia.slice().sort(function (x, y) { return (Number(x.orden) || 999) - (Number(y.orden) || 999); });
  var NS = "http://www.w3.org/2000/svg";
  function trailSvg(side, first, last) {
    // Tramo del sendero: baja serpenteando hacia el lado del año
    var x = side === "left" ? 22 : 78;
    var d = (first ? "M" + x + " 50" : "M50 0 C50 22 " + x + " 26 " + x + " 50") + (last ? "" : " C" + x + " 74 50 78 50 100");
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 100 100"); svg.setAttribute("preserveAspectRatio", "none"); svg.setAttribute("class", "trail-svg"); svg.setAttribute("aria-hidden", "true");
    ["trail-road", "trail-dash"].forEach(function (c) {
      var p = document.createElementNS(NS, "path"); p.setAttribute("d", d); p.setAttribute("class", c); p.setAttribute("vector-effect", "non-scaling-stroke"); svg.appendChild(p);
    });
    return svg;
  }
  var list = items.map(function (it, i) {
    var side = i % 2 ? "right" : "left";
    var fotos = Array.isArray(it.fotos) ? it.fotos.filter(Boolean) : [];
    return h("div", { class: "trail-item " + side, style: "--c:" + colorVar(it.color) },
      trailSvg(side, i === 0, i === items.length - 1),
      h("div", { class: "trail-year" }, h("b", { text: it.anio || "" }), it.detalle ? h("small", { text: it.detalle }) : null),
      h("div", { class: "trail-dot", style: "--c:" + colorVar(it.color) }),
      h("div", { class: "trail-card", style: "--c:" + colorVar(it.color) }, h("h3", { text: it.titulo }), it.texto ? h("p", { text: it.texto }) : null,
        fotos.length ? h("div", { class: "tl-photos" + (fotos.length === 1 ? " one" : "") }, fotos.map(function (id) {
          return h("button", { type: "button", "aria-label": "Ver foto: " + (it.titulo || ""), onclick: function () { openLightbox({ asset: id, titulo: (it.anio ? it.anio + " · " : "") + (it.titulo || "") }); } },
            h("img", { src: blobUrl(id), alt: "", loading: "lazy" }));
        })) : null));
  });
  // Los hitos aparecen al bajar por el sendero
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(function (entries) { entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }); }, { rootMargin: "0px 0px -10% 0px" });
    list.forEach(function (el) { el.classList.add("reveal"); io.observe(el); });
  }
  return [
    pageHead("Historia", "Más de cuatro décadas de compases", "Siero tiene una larga tradición bandística. La ASAM tomó el relevo en los años ochenta y desde entonces no ha dejado de sonar.", "negra", staffLettering(yearsSinceFounding() + " años haciendo música", { glyphs: MUSIC_CAPS, colors: { 0: "c-naranja", 3: "c-azul" }, punct: "c-naranja" })),
    h("section", { class: "block" }, h("div", { class: "wrap" },
      IS_ADMIN ? h("div", { class: "row-head" }, h("span"), adminLink("historia", "Editar historia")) : null,
      items.length ? h("div", { class: "trail" }, list) : emptyBox("Todavía no hay hitos en la historia.", "historia")))
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
  var list = DATA.musicos.filter(function (m) { return m.formacion === formacion || m.formacion === "Banda y Bandín"; });
  var groups = groupByInstrument(list);
  return h("section", { class: "block" + (alt ? " alt" : "") }, h("div", { class: "wrap" },
    h("div", { class: "row-head" }, h("div", null, h("h2", { text: "Músicos" + (formacion === "Bandín" ? " promesa" : "") }),
      list.length ? h("p", { class: "count-line", text: list.length + (list.length === 1 ? " músico" : " músicos") + " en " + groups.length + (groups.length === 1 ? " sección" : " secciones") }) : null),
      adminLink("musicos", "Editar músicos")),
    list.length ? h("div", { class: "sections" }, groups.map(function (g) {
      return h("div", { class: "sect" }, h("h3", null, g.name, h("small", { text: String(g.items.length) })),
        h("ul", null, g.items.map(function (m) {
          var av = m.foto
            ? h("button", { type: "button", class: "mus-av", "aria-label": "Ver foto de " + m.nombre, onclick: function () { openLightbox({ asset: m.foto, titulo: m.nombre + (m.instrumento ? " · " + m.instrumento : "") }); } },
                h("img", { src: blobUrl(m.foto), alt: "", loading: "lazy" }))
            : h("span", { class: "mus-av", "aria-hidden": "true", text: initials(m.nombre) });
          return h("li", null, av, h("div", { class: "mus-name" }, h("span", { text: m.nombre }), isJefe(m) ? h("span", { class: "jefe", text: "Jefe de sección" }) : null));
        })));
    })) : emptyBox("Pronto publicaremos la plantilla de músicos.", "musicos")));
}

PAGES.banda = function () {
  return [
    headSize(pageHead("Banda de Música de Siero", "La banda que suena en las fiestas y auditorios del concejo", null, null, staffLettering("¡La Banda de Pola mola!", { glyphs: MUSIC_CAPS, colors: { 1: "c-azul", 4: "c-verde" }, punct: "c-naranja", center: true, noBar: true }), { src: "img/logo/logo-banda.webp", alt: "Logotipo de la Banda de Música de Siero" }, "img/fondos/banda.jpg"), "head-base"),
    h("section", { class: "block" }, h("div", { class: "wrap" },
      directorFeature(/banda/i, "azul", "Director de la Banda"),
      h("div", { class: "prose" },
        h("p", { text: "La Banda de Música de Siero es el corazón de la ASAM. La forman músicos profesionales y amateurs que comparten atril e interpretan un repertorio variado, del pasodoble a las bandas sonoras." }),
        h("p", { text: "Sus conciertos forman parte de la programación cultural del municipio, en el auditorio municipal la entrada es gratuita, y en las fiestas más señaladas de Pola de Siero la banda sale a tocar a la calle." }),
        h("p", { text: "Además de los conciertos propios, organiza intercambios con otras formaciones y colabora con coros como los de Siero Musical." }),
        h("p", { class: "color-note" }, h("span", { class: "dot", style: "background:var(--azul)" }), h("span", { class: "dot", style: "background:var(--verde)" }), "Azul por la tradición, verde por el futuro: los colores del logotipo del 40 aniversario.")))),
    plantilla("Banda", true),
    formationEvents(/banda/i)
  ];
};

PAGES.bandin = function () {
  return [
    headSize(pageHead("El Bandín", "La cantera: donde se aprende a tocar en grupo", null, null, staffLettering("¡El Bandín de Pola mola!", { glyphs: MUSIC_CAPS, colors: { 1: "c-naranja", 4: "c-verde" }, punct: "c-azul" }), null, "img/fondos/bandin.jpg"), "head-mid"),
    h("section", { class: "block" }, h("div", { class: "wrap" },
      directorFeature(/bandín|bandin/i, "naranja", "Director del Bandín"),
      h("div", { class: "prose" },
        h("p", { text: "El Bandín reúne a los músicos más jóvenes de la escuela. Mientras mejoran con su instrumento, niños y niñas aprenden algo que pocas enseñanzas musicales ofrecen: tocar en conjunto, escuchar a los demás y subirse a un escenario." }),
        h("p", { text: "Es un ambiente formativo, cercano y con ganas de pasarlo bien. Aquí se prepara el relevo generacional de la Banda de Siero." }),
        h("p", { class: "color-note" }, h("span", { class: "dot", style: "background:var(--naranja)" }), "El naranja de su logotipo representa el amanecer a la música de las jóvenes promesas.")),
      h("div", { class: "join", style: "margin-top:36px" },
        h("div", null, h("b", { text: "¿Tu hijo/a quiere aprender a tocar un instrumento?" }), h("p", { text: "Pregúntanos por las clases y por cómo entrar en el Bandín." })),
        h("a", { class: "btn", href: "#contacto", text: "Escríbenos" })))),
    plantilla("Bandín", true),
    formationEvents(/bandín|bandin/i)
  ];
};

PAGES.direccion = function () {
  var dirs = DATA.directores.slice().sort(byOrden), junta = DATA.directiva.slice().sort(byOrden);
  return [
    headSize(pageHead("Dirección", "Quién lleva la batuta y quién sostiene la asociación", null, "verde", staffLettering("Al frente de la música", { glyphs: MUSIC_CAPS, colors: { 1: "c-verde", 4: "c-azul" }, punct: "c-naranja" })), "head-base"),
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
      })) : emptyBox("Todavía no hay miembros de la directiva añadidos.", "directiva"))),
    h("section", { class: "block" }, h("div", { class: "wrap" },
      h("div", { class: "row-head" }, h("div", null, h("h2", { text: "Profesorado" }), h("p", { class: "muted", text: "Las clases de la escuela de música" })), adminLink("profesores", "Editar profesorado")),
      teacherGrid()))
  ];
};

function teacherGrid() {
  var list = DATA.profesores.slice().sort(byOrden);
  if (!list.length) return emptyBox("Todavía no hay profesores añadidos.", "profesores");
  return h("div", { class: "teachers" }, list.map(function (p) {
    return h("article", { class: "tcard" },
      h("div", { class: "tphoto" }, p.foto ? h("img", { src: blobUrl(p.foto), alt: "Foto de " + p.nombre, loading: "lazy" })
        : h("div", { class: "initials", style: "background:" + colorVar(p.color || "verde") }, initials(p.nombre))),
      h("div", { class: "tbody" },
        p.especialidad ? h("span", { class: "tspec", text: p.especialidad }) : null,
        h("h3", { text: p.nombre }),
        p.bio ? h("p", { text: p.bio }) : null));
  }));
}

function sedeColor(c, i) { return c || ["azul", "naranja", "verde", "negro"][i % 4]; }
function normSedes(v) {
  if (Array.isArray(v)) return v.filter(function (x) { return x && x.nombre; });
  // formato antiguo: un lugar por línea
  return String(v || "").split(/\n|;/).map(function (x) { return x.trim(); }).filter(Boolean).map(function (n) { return { nombre: n }; });
}
function sedeHref(sd) { return safeUrl(sd.enlace) || ("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(sd.nombre + " " + (sd.lugar || "") + ", Asturias")); }
function sedesCard(sedes) {
  return h("aside", { class: "sedes-card" },
    h("h2", { text: "¿Dónde se dan las clases?" }),
    h("ul", { class: "sedes-ul" }, sedes.map(function (sd, i) {
      return h("li", null, h("i", { class: "dot", style: "background:" + colorVar(sedeColor(sd.color, i)) }),
        h("span", { class: "sede-txt" }, h("b", { text: sd.nombre }), sd.lugar ? h("span", { text: sd.lugar }) : null),
        h("a", { href: sedeHref(sd), target: "_blank", rel: "noopener", text: "Cómo llegar" }));
    })));
}

PAGES.escuela = function () {
  var E = Object.assign({}, DEFAULTS.escuela, DATA.escuela || {});
  var semana = Array.isArray(E.semana) ? E.semana : [];
  var cuotas = Array.isArray(E.cuotas) ? E.cuotas : [];
  var pago = String(E.pago || "").split(",").map(function (x) { return x.trim(); }).filter(Boolean);
  var periodo = E.periodo || "trimestre";
  var sedes = normSedes(E.sedes);
  return [
    headSize(pageHead("Escuela de música", E.titulo || "Escuela de música", E.intro || null, null, staffLettering("Anímate a tocar con nosotros", { glyphs: MUSIC_CAPS, colors: { 0: "c-naranja", 2: "c-azul", 4: "c-verde" }, punct: "c-naranja" }), null, "img/fondos/escuela.jpg"), "head-photo"),
    h("section", { class: "block escuela-first" }, h("div", { class: "wrap" },
      IS_ADMIN ? h("div", { class: "row-head" }, h("span"), adminLink("escuela", "Editar la escuela")) : null,
      sedes.length ? h("div", { class: "sedes-wide" }, sedesCard(sedes)) : null,
      h("div", { class: "row-head" }, h("div", null, h("h2", { text: "Clases semanales" })),
        E.edad ? h("span", { class: "age-badge", text: E.edad }) : null),
      h("div", { class: "week" }, semana.map(function (w) {
        return h("div", { class: "wk" }, h("span", { class: "wk-time", style: "color:" + colorVar(w.color) }, w.duracion || ""),
          h("h3", null, h("i", { class: "dot", style: "background:" + colorVar(w.color) }), w.nombre || ""), w.texto ? h("p", { text: w.texto }) : null,
          (w.enlace && (/^#[a-z]+$/.test(w.enlace) || safeUrl(w.enlace))) ? h("a", { class: "btn ghost small wk-link", href: w.enlace, target: /^#/.test(w.enlace) ? null : "_blank", rel: /^#/.test(w.enlace) ? null : "noopener", text: (w.boton || "Saber más") + " →" }) : null);
      })),
      )),
    cuotas.length ? h("section", { class: "block alt" }, h("div", { class: "wrap" },
      h("div", { class: "row-head" }, h("div", null, h("h2", { text: E.cuotasTitulo || "Cuotas" }), h("p", { class: "muted", text: "Precios por " + periodo }))),
      h("div", { class: "prices" }, cuotas.map(function (c) {
        return h("div", { class: "price" + (c.destacado ? " featured" : ""), style: "--c:" + colorVar(c.color) },
          c.destacado ? h("span", { class: "price-tag", text: "Recomendado" }) : null,
          h("h3", { text: c.nombre || "" }),
          h("div", { class: "amount" }, h("b", { text: (c.precio || "") + " €" }), h("span", { text: "/ " + periodo })));
      })),
      pago.length ? h("div", { class: "pay" }, h("b", { text: "Forma de pago" }), pago.map(function (p) { return h("span", { class: "chip", text: p }); })) : null)) : null,
    h("section", { class: "block" }, h("div", { class: "wrap" },
      h("div", { class: "row-head" }, h("h2", { text: "Profesorado" }), adminLink("profesores", "Editar profesorado")),
      teacherGrid(),
      h("div", { class: "join", style: "margin-top:36px" },
        h("div", null, h("b", { text: "¿Quieres apuntarte?" }), h("p", { text: "Escríbenos o llámanos y te contamos los horarios y qué instrumento encaja contigo." })),
        h("a", { class: "btn", href: "#contacto", text: "Contacta" }))))
  ];
};

function upcomingCard(up) {
  var list = up.slice(0, 4);
  return h("aside", { class: "sedes-card up-card" },
    h("h2", { text: "Próximos conciertos" }),
    list.length ? h("ul", { class: "up-list" }, list.map(function (e) {
      var p = parseDate(e.fecha);
      return h("li", null,
        h("span", { class: "up-date" }, h("b", { text: p ? String(p.d) : "—" }), h("span", { text: p ? MES_CORTO[p.m - 1] : "" })),
        h("span", { class: "up-txt" }, h("b", { text: e.titulo }),
          h("span", { text: [e.hora, tr(e.lugar)].filter(Boolean).join(" · ") })));
    })) : h("p", { class: "muted", text: "Pronto anunciaremos nuevos conciertos." }),
    list.length ? h("a", { class: "up-more", href: "#actuaciones", onclick: function (ev) { ev.preventDefault(); var t = document.getElementById("proximas"); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" }); }, text: "Ver todos los detalles ↓" }) : null);
}
function staffDivider(text, opts) {
  return h("div", { class: "staff-divider", "aria-hidden": null },
    h("div", { class: "staff-lines", "aria-hidden": "true" }),
    staffLettering(text, Object.assign({ glyphs: MUSIC_CAPS }, opts || {})));
}
PAGES.actuaciones = function (sub) {
  var s = eventsSplit(), n = sortedNews();
  if (sub === "noticias") setTimeout(function () { var t = document.getElementById("noticias-sec"); if (t) t.scrollIntoView({ block: "start" }); }, 0);
  return [
    headSize(pageHead("Actuaciones y noticias", "Una temporada de conciertos a lo largo del año", "Los conciertos en los auditorios municipales son gratuitos hasta completar aforo.", null, staffLettering("¡Nos vemos en el concierto!", { glyphs: MUSIC_CAPS, colors: { 1: "c-azul", 4: "c-verde" }, punct: "c-naranja" }), null, "img/fondos/actuaciones.jpg"), "head-photo"),
    h("section", { class: "block act-news" }, h("div", { class: "wrap" },
      h("div", { class: "row-head", id: "proximas" }, h("h2", { text: "Próximas actuaciones" }), adminLink("eventos", "Gestionar eventos")),
      s.up.length ? h("div", { class: "events" }, s.up.map(function (e) { return eventRow(e); })) : emptyBox("Pronto anunciaremos las próximas actuaciones.", "eventos")),
      staffDivider("Lo último de la banda", { colors: { 1: "c-naranja", 4: "c-azul" }, punct: "c-naranja" }),
      h("div", { class: "wrap", id: "noticias-sec" },
        h("div", { class: "row-head" }, h("h2", { text: "Noticias" }), adminLink("noticias", "Gestionar noticias")),
        n.length ? h("div", { class: "news" }, n.map(newsCard)) : emptyBox("Todavía no hay noticias publicadas.", "noticias"))),
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

PAGES.imagenes = function () {
  var fotos = DATA.fotos.slice().sort(function (a, b) { return (b.creado || "") < (a.creado || "") ? -1 : 1; });
  var cats = ["todas", "Banda", "Bandín", "Escuela", "Asociación"];
  var visible = fotos.filter(function (f) { return FOTO_FILTER === "todas" || f.categoria === FOTO_FILTER; });
  return [
    pageHead("Galería", "Momentos de la Banda, el Bandín y la escuela", "En nuestras redes hay muchas más fotos y vídeos.", null, staffLettering("Momentos para recordar", { glyphs: MUSIC_CAPS, colors: { 0: "c-azul", 2: "c-verde" }, punct: "c-naranja" })),
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
    pageHead("Contacto", "Ven a vernos o escríbenos", null, null, staffLettering("Anímate", { glyphs: MUSIC_CAPS, colors: { 0: "c-azul" }, punct: "c-naranja" })),
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
    { k: "tipo", l: "Tipo", type: "select", options: [["Concierto", "Concierto"], ["Ensayo", "Ensayo"], ["Actuación", "Actuación"], ["Pasacalles", "Pasacalles"], ["Otro", "Otro"]] },
    { k: "formacion", l: "Convocatoria", type: "select", options: [["Banda", "Banda"], ["Bandín", "Bandín"], ["Banda y Bandín", "Banda y Bandín"], ["Escuela", "Escuela"], ["Asociación", "Toda la asociación"]], help: "Quién está convocado. En el Área de músicos solo lo verán ellos." },
    { k: "publico", l: "¿Dónde se ve?", type: "select", options: [["si", "En la web pública y en el Área de músicos"], ["no", "Solo en el Área de músicos (ensayos, avisos internos…)"]] },
    { k: "descripcion", l: "Descripción", type: "textarea" },
    { k: "cartel", l: "Cartel del concierto", type: "images", single: true, help: "Opcional. El cartel con el programa o repertorio; se muestra en Próximas actuaciones y se amplía al pulsarlo." },
    { k: "repertorio", l: "Repertorio", type: "textarea", ph: "Una obra por línea, por ejemplo:\nEl Gato Montés — M. Penella\nAsturias, patria querida", help: "Opcional. Una obra por línea. Se muestra en la web junto al evento." },
    { k: "indumentaria", l: "Indumentaria", ph: "Uniforme de gala, ropa negra…", help: "Solo se muestra a los músicos." },
    { k: "notas", l: "Indicaciones para los músicos", type: "textarea", help: "Hora de llegada, atriles, partituras… Solo se muestra en el Área de músicos." }],
    title: function (d) { return d.titulo; }, sub: function (d) { return [d.publico === "no" ? "🔒 Interno" : "", d.tipo, fmtLong(d.fecha), d.hora, d.lugar].filter(Boolean).join(" · "); },
    sort: function (a, b) { return a.fecha < b.fecha ? 1 : -1; } },
  noticias: { label: "Noticias", singular: "noticia", fields: [
    { k: "titulo", l: "Titular", req: true },
    { k: "fecha", l: "Fecha", type: "date" },
    { k: "etiqueta", l: "Etiqueta", ph: "Banda, Bandín, Asociación…" },
    { k: "texto", l: "Texto", type: "textarea" },
    { k: "fotos", l: "Fotos", type: "images", help: "La primera foto se usa como portada de la noticia." },
    { k: "enlaces", l: "Enlaces a otras webs", type: "links", help: "Por ejemplo, el artículo de un periódico o el programa del concierto. Si pegas un enlace de YouTube, el vídeo se verá dentro de la noticia." }],
    title: function (d) { return d.titulo; }, sub: function (d) { return [fmtLong(d.fecha) || "Sin fecha", d.etiqueta].filter(Boolean).join(" · "); },
    sort: function (a, b) { return sortedNews().indexOf(a) - sortedNews().indexOf(b); } },
  enlaces: { label: "Enlaces", singular: "enlace", fields: [
    { k: "nombre", l: "Nombre", req: true, ph: "Instagram" },
    { k: "url", l: "Dirección web", type: "url", req: true, ph: "https://…" },
    { k: "orden", l: "Orden", type: "number" }],
    title: function (d) { return d.nombre; }, sub: function (d) { return d.url; }, sort: byOrden },
  musicos: { label: "Músicos", singular: "músico", fields: [
    { k: "nombre", l: "Nombre y apellidos", req: true },
    { k: "formacion", l: "Formación", type: "select", req: true, options: [["Banda", "Banda"], ["Bandín", "Bandín"], ["Banda y Bandín", "Banda y Bandín"]] },
    { k: "instrumento", l: "Instrumento", type: "datalist", req: true, list: INSTRUMENTOS, help: "Elige de la lista o escribe otro instrumento." },
    { k: "cargo", l: "Cargo", type: "select", options: [["Músico", "Músico"], ["Jefe de sección", "Jefe de sección"]] },
    { k: "foto", l: "Foto", type: "images", single: true, help: "Opcional. Mejor una foto en la que se vea bien la cara." },
    { k: "orden", l: "Orden dentro de su instrumento", type: "number", help: "Opcional. El jefe de sección aparece siempre el primero." }],
    title: function (d) { return d.nombre; },
    sub: function (d) { return [d.instrumento, isJefe(d) ? "Jefe de sección" : "", d.user_id ? "🔑 con cuenta (" + (d.usuario || "") + ")" : ""].filter(Boolean).join(" · "); },
    sort: function (a, b) { return a.formacion === b.formacion ? musicianSort(a, b) : (a.formacion === "Banda" ? -1 : 1); },
    filter: { k: "formacion", label: "Formación", options: ["Banda", "Bandín", "Banda y Bandín"] },
    group: function (d) { return (d.formacion || "") + " · " + (d.instrumento || "Otros"); } }
};
var TABS = [["directiva", "Directiva"], ["directores", "Directores"], ["profesores", "Profesorado"], ["historia", "Historia"], ["musicos", "Músicos"], ["eventos", "Eventos"], ["noticias", "Noticias"], ["enlaces", "Enlaces y redes"], ["fotos", "Galería"], ["escuela", "Escuela"], ["socio", "Hacerse socio"], ["contacto", "Contacto"], ["pie", "Pie de página"], ["cuentas", "Cuentas de músicos"], ["usuarios", "Administradores"]];
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
SCHEMAS.profesores = { label: "Profesorado", singular: "profesor", fields: [
    { k: "nombre", l: "Nombre y apellidos", req: true },
    { k: "especialidad", l: "Especialidad", ph: "Flauta, Clarinete, Lenguaje musical…" },
    { k: "foto", l: "Foto", type: "images", single: true, help: "Opcional. Mejor una foto vertical." },
    { k: "bio", l: "Presentación", type: "textarea", help: "Unas líneas sobre su formación o experiencia." },
    { k: "color", l: "Color (si no hay foto)", type: "select", options: [["verde", "Verde"], ["azul", "Azul"], ["naranja", "Naranja"], ["negro", "Negro"]] },
    { k: "orden", l: "Orden", type: "number" }],
  title: function (d) { return d.nombre; }, sub: function (d) { return d.especialidad || ""; }, sort: byOrden };
var LIST_FILTER = {};

/* Acceso privado: un único botón para músicos y administradores */
PAGES.privado = function () {
  var head = pageHead("Acceso privado", "Área de músicos y administración", SESSION ? null : "Entra con tu usuario o tu correo y tu contraseña.", "negra");
  if (!SB) {
    return [head, h("section", { class: "block" }, h("div", { class: "wrap" }, h("div", { class: "notice" },
      h("h3", { text: "Falta conectar la base de datos" }),
      h("p", { class: "muted", text: "Rellena la dirección y la clave pública de Supabase en el archivo js/config.js (lo explica el README del repositorio)." }))))];
  }
  if (!SESSION) return [head, h("section", { class: "block" }, h("div", { class: "wrap" }, loginForm("Acceso privado")))];
  var esMusico = !!myMusico();
  // Si solo es músico, va directo a su área
  if (esMusico && !IS_ADMIN) { setTimeout(function () { if (location.hash.indexOf("#privado") === 0) location.hash = "#musicos"; }, 0); }
  var logout = h("button", { class: "btn ghost small", type: "button", text: "Cerrar sesión", onclick: function () { SB.auth.signOut(); } });
  var cards = [];
  if (IS_ADMIN || esMusico) cards.push(h("a", { class: "priv-card", href: "#musicos" }, h("i", { style: "background:var(--azul)" }),
    h("b", { text: "Área de músicos" }), h("span", { text: "Convocatorias, asistencia, partituras y anuncios." })));
  if (IS_ADMIN) cards.push(h("a", { class: "priv-card", href: "#admin" }, h("i", { style: "background:var(--naranja)" }),
    h("b", { text: "Administración" }), h("span", { text: "Edita los contenidos de la web, las cuentas y los administradores." })));
  return [head, h("section", { class: "block" }, h("div", { class: "wrap" },
    cards.length ? h("div", { class: "priv-cards" }, cards) : h("div", { class: "notice" },
      h("h3", { text: "Tu usuario no tiene acceso" }),
      h("p", { class: "muted", text: "Has entrado como " + ((SESSION.user && SESSION.user.email) || "usuario") + ", pero no tienes cuenta de músico ni permiso de administrador." })),
    h("div", { class: "form-acts", style: "margin-top:18px" }, logout)))];
};
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
  else if (tab === "socio") body = adminSocio();
  else if (tab === "escuela") body = adminEscuela();
  else if (tab === "usuarios") body = adminUsuarios();
  else if (tab === "cuentas") body = adminCuentas();
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

function loginForm(title) {
  var st = statusEl();
  var email = h("input", { id: "login-email", type: "text", autocomplete: "username", autocapitalize: "none", spellcheck: "false", required: true });
  var pass = h("input", { id: "login-pass", type: "password", autocomplete: "current-password", required: true });
  var btn = h("button", { class: "btn primary", type: "submit", text: "Entrar" });
  var form = h("form", { class: "aform", style: "position:static;max-width:420px" }, h("h3", { text: title || "Acceso para administradores" }),
    h("div", { class: "field" }, h("label", { for: "login-email", text: "Correo o nombre de usuario" }), email),
    h("div", { class: "field" }, h("label", { for: "login-pass", text: "Contraseña" }), pass),
    h("div", { class: "form-acts" }, btn), st);
  function fail(msg) { btn.disabled = false; btn.textContent = "Entrar"; setStatus(st, msg, false); }
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var ident = email.value.trim();
    if (!ident || !pass.value) { setStatus(st, "Escribe tu usuario o correo y tu contraseña.", false); return; }
    btn.disabled = true; btn.textContent = "Entrando…";
    if (ident.indexOf("@") >= 0) {
      SB.auth.signInWithPassword({ email: ident, password: pass.value }).then(function (r) {
        if (r.error) fail("Usuario o contraseña incorrectos."); else { btn.disabled = false; btn.textContent = "Entrar"; }
      }, function () { fail("No se ha podido conectar. Inténtalo de nuevo."); });
    } else {
      SB.functions.invoke("musicos", { body: { action: "login", usuario: ident, password: pass.value } }).then(function (r) {
        if (r.error || !r.data || !r.data.session) { fail("Usuario o contraseña incorrectos."); return; }
        return SB.auth.setSession(r.data.session).then(function (s2) { if (s2.error) fail("No se ha podido iniciar la sesión."); });
      }, function () { fail("No se ha podido conectar. Inténtalo de nuevo."); });
    }
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
    if (current) { var base = Object.assign({}, current); delete base.id; obj = Object.assign(base, obj); }
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
        (col === "musicos" && it.user_id) ? h("a", { class: "btn ghost small", href: "#admin-cuentas", text: "Gestionar cuenta" }) : deleteButton(function (b) {
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


function adminEscuela() {
  var E = JSON.parse(JSON.stringify(Object.assign({}, DEFAULTS.escuela, DATA.escuela || {})));
  var st = statusEl();
  var COLORS = [["azul", "Azul"], ["verde", "Verde"], ["naranja", "Naranja"], ["negro", "Negro"]];
  function input(id, val, ph, type) { var i = h("input", { id: id, type: type || "text", placeholder: ph || null }); i.value = val == null ? "" : val; return i; }
  function colorSel(id, val) { return h("select", { id: id }, COLORS.map(function (c) { return h("option", { value: c[0], text: c[1], selected: val === c[0] || null }); })); }
  function field(id, label, el, help) { return h("div", { class: "field" }, h("label", { for: id, text: label }), el, help ? h("small", { text: help }) : null); }

  var titulo = input("es-titulo", E.titulo), intro = h("textarea", { id: "es-intro", style: "min-height:70px" }); intro.value = E.intro || "";
  var edad = input("es-edad", E.edad, "Abierto a partir de 6 años");
  var cuotasTitulo = input("es-ctit", E.cuotasTitulo), periodo = input("es-per", E.periodo, "trimestre, mes, curso…");
  var pago = input("es-pago", E.pago, "Cuota trimestral, Domiciliación bancaria");
  var sedBox = h("div", { class: "rep-rows" });

  var semBox = h("div", { class: "rep-rows" }), cuoBox = h("div", { class: "rep-rows" });
  var n = 0;
  function semRow(w) {
    var k = "s" + (n++);
    var r = h("div", { class: "rep-row" },
      field(k + "-n", "Actividad", input(k + "-n", w.nombre, "Clase de instrumento")),
      field(k + "-d", "Duración", input(k + "-d", w.duracion, "45 min")),
      field(k + "-c", "Color", colorSel(k + "-c", w.color)),
      field(k + "-t", "Descripción", input(k + "-t", w.texto)),
      h("button", { class: "btn danger small", type: "button", text: "Quitar", onclick: function () { r.remove(); } }),
      h("div", { class: "rep-extra" },
        field(k + "-b", "Texto del botón (opcional)", input(k + "-b", w.boton, "Conoce el Bandín")),
        field(k + "-e", "Enlace del botón", input(k + "-e", w.enlace, "#bandin o https://…"), "Una página de la web (#bandin, #banda…) o una dirección web.")));
    r._get = function () { return { nombre: r.querySelector("#" + k + "-n").value.trim(), duracion: r.querySelector("#" + k + "-d").value.trim(), color: r.querySelector("#" + k + "-c").value, texto: r.querySelector("#" + k + "-t").value.trim(),
      boton: r.querySelector("#" + k + "-b").value.trim(), enlace: r.querySelector("#" + k + "-e").value.trim() }; };
    semBox.appendChild(r);
  }
  function cuoRow(c) {
    var k = "c" + (n++);
    var dest = h("input", { id: k + "-x", type: "checkbox", checked: c.destacado ? true : null });
    var r = h("div", { class: "rep-row" },
      field(k + "-n", "Concepto", input(k + "-n", c.nombre, "Clases de instrumento")),
      field(k + "-p", "Precio (€)", input(k + "-p", c.precio, "120", "text")),
      field(k + "-c", "Color", colorSel(k + "-c", c.color)),
      h("label", { class: "check", for: k + "-x" }, dest, " Recomendado"),
      h("button", { class: "btn danger small", type: "button", text: "Quitar", onclick: function () { r.remove(); } }));
    r._get = function () { return { nombre: r.querySelector("#" + k + "-n").value.trim(), precio: r.querySelector("#" + k + "-p").value.trim().replace(/\s*€$/, ""), color: r.querySelector("#" + k + "-c").value, destacado: dest.checked }; };
    cuoBox.appendChild(r);
  }
  function sedRow(sd) {
    var k = "d" + (n++);
    var r = h("div", { class: "rep-row" },
      field(k + "-n", "Nombre", input(k + "-n", sd.nombre, "Casa de la Música")),
      field(k + "-l", "Localidad", input(k + "-l", sd.lugar, "Pola de Siero")),
      field(k + "-c", "Color", colorSel(k + "-c", sd.color)),
      h("button", { class: "btn danger small", type: "button", text: "Quitar", onclick: function () { r.remove(); } }),
      h("div", { class: "rep-extra" }, field(k + "-e", "Enlace de Google Maps", input(k + "-e", sd.enlace, "https://maps.app.goo.gl/…"))));
    r._get = function () {
      var o = { nombre: r.querySelector("#" + k + "-n").value.trim(), lugar: r.querySelector("#" + k + "-l").value.trim(), color: r.querySelector("#" + k + "-c").value, enlace: r.querySelector("#" + k + "-e").value.trim() };
      return o;
    };
    sedBox.appendChild(r);
  }
  normSedes(E.sedes).forEach(sedRow);
  (E.semana || []).forEach(semRow);
  (E.cuotas || []).forEach(cuoRow);

  var save = h("button", { class: "btn primary", type: "submit", text: "Guardar la escuela" });
  var form = h("form", { class: "aform", style: "position:static;max-width:900px", novalidate: true },
    h("h3", { text: "Página de la Escuela" }),
    field("es-titulo", "Título", titulo), field("es-intro", "Presentación", intro), field("es-edad", "Edad / etiqueta", edad),
    h("h3", { text: "Clases semanales", style: "margin-top:10px" }), semBox,
    h("button", { class: "btn ghost small", type: "button", style: "justify-self:start", text: "+ Añadir actividad", onclick: function () { semRow({ color: "azul" }); } }),
    h("h3", { text: "¿Dónde se dan las clases?", style: "margin-top:10px" }), sedBox,
    h("button", { class: "btn ghost small", type: "button", style: "justify-self:start", text: "+ Añadir sede", onclick: function () { sedRow({ color: "azul" }); } }),
    h("h3", { text: "Cuotas", style: "margin-top:10px" }),
    field("es-ctit", "Título de las cuotas", cuotasTitulo), field("es-per", "Periodo de los precios", periodo, "Se muestra como «90 € / trimestre»."),
    cuoBox,
    h("button", { class: "btn ghost small", type: "button", style: "justify-self:start", text: "+ Añadir cuota", onclick: function () { cuoRow({ color: "azul" }); } }),
    field("es-pago", "Forma de pago", pago, "Separa las opciones con comas."),
    h("div", { class: "form-acts" }, save), st);
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var obj = { titulo: titulo.value.trim(), intro: intro.value.trim(), edad: edad.value.trim(),
      semana: Array.prototype.map.call(semBox.children, function (r) { return r._get(); }).filter(function (w) { return w.nombre; }),
      cuotasTitulo: cuotasTitulo.value.trim(), periodo: periodo.value.trim() || "trimestre",
      cuotas: Array.prototype.map.call(cuoBox.children, function (r) { return r._get(); }).filter(function (c) { return c.nombre; }),
      pago: pago.value.trim(),
      sedes: Array.prototype.map.call(sedBox.children, function (r) { return r._get(); }).filter(function (x) { return x.nombre; }) };
    save.disabled = true; save.textContent = "Guardando…";
    DB.doc("ajustes/escuela").set(obj).then(function () { save.disabled = false; save.textContent = "Guardar la escuela"; setStatus(st, "Escuela guardada.", true); },
      function (e) { save.disabled = false; save.textContent = "Guardar la escuela"; setStatus(st, errMsg(e), false); });
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

function adminSocio() {
  var S = socioData(), st = statusEl();
  var fields = [["titulo", "Título", "text"], ["intro", "Presentación", "textarea"], ["cuota", "Cuota", "text"], ["texto", "Quién puede hacerse socio", "textarea"],
    ["pasos", "Pasos para hacerse socio (uno por línea)", "textarea"], ["aviso", "Aviso final", "textarea"]];
  var form = h("form", { class: "aform", style: "position:static;max-width:620px" }, h("h3", { text: "Página Hacerse socio" }),
    h("p", { class: "muted", text: "La cuota también se muestra en el recuadro de la página de inicio." }),
    fields.map(function (f) {
      var inp = f[2] === "textarea" ? h("textarea", { id: "so-" + f[0], name: f[0], style: "min-height:80px" }) : h("input", { id: "so-" + f[0], name: f[0], type: "text" });
      inp.value = S[f[0]] || "";
      return h("div", { class: "field" }, h("label", { for: "so-" + f[0], text: f[1] }), inp);
    }));
  var save = h("button", { class: "btn primary", type: "submit", text: "Guardar" });
  add(form, h("div", { class: "form-acts" }, save), st);
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var obj = Object.assign({}, DATA.socio || {}); fields.forEach(function (f) { obj[f[0]] = form.elements[f[0]].value.trim(); });
    save.disabled = true; save.textContent = "Guardando…";
    DB.doc("ajustes/socio").set(obj).then(function () { save.disabled = false; save.textContent = "Guardar"; setStatus(st, "Página de socios guardada.", true); },
      function (e) { save.disabled = false; save.textContent = "Guardar"; setStatus(st, errMsg(e), false); });
  });
  return form;
}

function renderFooter() {
  var p = DATA.pie || {}, c = DATA.contacto || {};
  var socials = DATA.enlaces.slice().sort(byOrden).filter(function (l) { return safeUrl(l.url); });
  var pages = [["inicio", "Inicio"], ["quienes", "Quiénes somos"], ["banda", "Banda"], ["bandin", "Bandín"], ["escuela", "Escuela"], ["actuaciones", "Actuaciones y noticias"], ["galeria", "Galería"], ["socio", "Hacerse socio"], ["contacto", "Contacto"]];
  var el = document.getElementById("footer");
  el.replaceChildren(
    h("div", { class: "foot" },
      h("div", { class: "foot-brand" }, h("span", { class: "foot-logo" }, h("img", { src: "img/logo/logo-asam-simbolo-liso.svg", alt: "ASAM" })),
        p.texto ? h("p", { text: p.texto }) : null, p.apoyos ? h("p", { text: p.apoyos }) : null),
      h("div", null, h("h4", { text: "La web" }), h("ul", null, pages.map(function (x) { return h("li", null, h("a", { href: "#" + x[0], text: x[1] })); }))),
      h("div", null, h("h4", { text: "Síguenos" }),
        socials.length ? h("div", { class: "socials" }, socials.map(function (l) { var b = socialBrand(l); return h("a", { class: b ? "soc soc-" + b : "", href: l.url, target: "_blank", rel: "noopener", text: l.nombre }); })) : null,
        h("div", { class: "foot-contact" }, c.direccion ? h("span", { text: c.direccion }) : null, c.telefono ? h("span", { text: "Tel. " + c.telefono + " (WhatsApp)" }) : null, c.email ? h("span", { text: c.email }) : null))),
    h("div", { class: "foot-bottom" }, h("span", { text: p.copyright || "" }),
      h("a", { href: "#privado", text: "Acceso privado" })));
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
  function ok() { btn.textContent = tr("Copiado"); setTimeout(function () { btn.textContent = tr("Copiar"); }, 1600); }
  function fb() { var r = document.createRange(); r.selectNodeContents(el); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = tr("Seleccionado"); }
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
  if (page === "noticias") { page = "actuaciones"; sub = "noticias"; }
  if (!PAGES[page]) { page = "inicio"; sub = ""; }
  return { page: page, sub: sub, key: page + "-" + sub };
}
function applyLangBasics() {
  var ast = LANG === "ast";
  document.documentElement.lang = ast ? "ast" : "es";
  MESES = ast && AST.meses ? AST.meses.slice() : MESES_ES.slice();
  MES_CORTO = ast && AST.mesesCorto ? AST.mesesCorto.slice() : MES_CORTO_ES.slice();
  Array.prototype.forEach.call(document.querySelectorAll("[data-tr]"), function (el) {
    if (el.dataset.es == null) el.dataset.es = el.textContent;
    el.textContent = tr(el.dataset.es);
  });
  if (navEl) { if (navEl.dataset.es == null) navEl.dataset.es = navEl.getAttribute("aria-label"); navEl.setAttribute("aria-label", tr(navEl.dataset.es)); }
  var lb = document.getElementById("lang-btn");
  if (lb) {
    lb.textContent = ast ? "ES" : "AST";
    lb.setAttribute("aria-label", ast ? "Ver la web en castellano" : tr("Ver la web en asturiano"));
    lb.setAttribute("title", ast ? "Ver la web en castellano" : "Ver la web en asturiano");
    lb.setAttribute("lang", ast ? "es" : "ast");
  }
}
(function () {
  var lb = document.getElementById("lang-btn");
  if (lb) lb.addEventListener("click", function () { navEl.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); setLang(LANG === "ast" ? "es" : "ast"); });
  applyLangBasics();
})();

function render() {
  var r = route();
  var focusId = document.activeElement && document.activeElement.id;
  var scroll = window.scrollY;
  app.replaceChildren();
  var page = h("div", { class: "page" });
  add(page, PAGES[r.page](r.sub));
  app.appendChild(page);
  var navPage = (r.page === "admin" || r.page === "musicos") ? "privado" : r.page;
  Array.prototype.forEach.call(navEl.querySelectorAll("a"), function (a) { a.setAttribute("aria-current", a.getAttribute("data-p") === navPage ? "page" : "false"); });
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

/* =====================================================================
   ÁREA DE MÚSICOS: calendario con asistencia, partituras y anuncios
   ===================================================================== */
var PRIV = { loaded: false, loading: false, anuncios: [], partituras: [], asist: {}, pase: {}, coments: {}, error: "" };
var AREA = { abiertos: {}, filtroInst: "", editAnuncio: null, verPasados: false };
var AREA_TABS = [["inicio", "Inicio"], ["calendario", "Calendario"], ["partituras", "Partituras"], ["anuncios", "Anuncios"], ["cuenta", "Mi cuenta"]];

function myMusico() {
  if (!SESSION || !SESSION.user) return null;
  var id = SESSION.user.id;
  return DATA.musicos.filter(function (m) { return m.user_id === id; })[0] || null;
}
function canArea() { return !!SESSION && (IS_ADMIN || !!myMusico()); }
function displayName() {
  var m = myMusico();
  if (m && m.nombre) return m.nombre;
  var e = (SESSION && SESSION.user && SESSION.user.email) || "";
  return e ? e.split("@")[0] : "Administración";
}
function norm(t) { return String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim(); }
function convocado(e, m) {
  var f = e.formacion || "Banda";
  if (!m) return true;
  if (f === "Asociación" || f === "Escuela") return true;
  if (m.formacion === "Banda y Bandín" || f === "Banda y Bandín") return true;
  return f === m.formacion;
}
function anuncioParaMi(a, m) {
  var d = a.destinatarios || "Todos";
  if (d === "Todos" || !m) return true;
  return m.formacion === "Banda y Bandín" || m.formacion === d;
}
function partituraParaMi(p, m) {
  if (!m) return true;
  var pi = norm(p.instrumento);
  if (!pi || pi === "todos" || pi === "director") return pi !== "director";
  var mi = norm(m.instrumento);
  return pi === mi || mi.indexOf(pi) === 0 || pi.indexOf(mi) === 0;
}

function loadPrivate() {
  if (!SB || !SESSION) { PRIV = { loaded: false, loading: false, anuncios: [], partituras: [], asist: {}, pase: {}, coments: {}, error: "" }; return Promise.resolve(); }
  PRIV.loading = true;
  return Promise.all([
    SB.from("interno").select("coleccion,id,datos"),
    SB.from("asistencias").select("evento_id,user_id,estado,motivo"),
    SB.from("pase_lista").select("evento_id,user_id,presente"),
    SB.from("comentarios").select("id,anuncio_id,user_id,autor,texto,creado").order("creado")
  ]).then(function (r) {
    r.forEach(check);
    var an = [], pa = [];
    r[0].data.forEach(function (row) {
      var o = Object.assign({}, row.datos); o.id = row.id;
      if (row.coleccion === "anuncios") an.push(o);
      if (row.coleccion === "partituras") pa.push(o);
    });
    var asist = {}; r[1].data.forEach(function (a) { (asist[a.evento_id] = asist[a.evento_id] || {})[a.user_id] = a; });
    var pase = {}; r[2].data.forEach(function (p) { (pase[p.evento_id] = pase[p.evento_id] || {})[p.user_id] = p.presente; });
    var com = {}; r[3].data.forEach(function (c) { (com[c.anuncio_id] = com[c.anuncio_id] || []).push(c); });
    PRIV = { loaded: true, loading: false, anuncios: an, partituras: pa, asist: asist, pase: pase, coments: com, error: "" };
  }, function (e) { PRIV.loading = false; PRIV.loaded = true; PRIV.error = (e && e.message) || "No se han podido cargar los datos."; });
}
function reloadPrivate() { return loadPrivate().then(render); }

function areaEvents() {
  var me = myMusico();
  return DATA.eventos.filter(function (e) { return IS_ADMIN || convocado(e, me); })
    .slice().sort(function (a, b) { return (a.fecha + (a.hora || "")) < (b.fecha + (b.hora || "")) ? -1 : 1; });
}
function myAnswer(evId) { return SESSION ? ((PRIV.asist[evId] || {})[SESSION.user.id] || null) : null; }

/* ---------- Página ---------- */
PAGES.musicos = function (tab) {
  tab = tab || "inicio";
  var head = pageHead("Área de músicos", SESSION && canArea() ? "Hola, " + displayName().split(" ")[0] : "Acceso para músicos",
    SESSION && canArea() ? null : "Convocatorias, asistencia, partituras y anuncios de la Banda y el Bandín.", "verde");
  if (!SB) return [head, h("section", { class: "block" }, h("div", { class: "wrap" }, h("div", { class: "notice" }, h("h3", { text: "El área de músicos no está disponible" }))))];
  if (!SESSION) return [head, h("section", { class: "block" }, h("div", { class: "wrap" }, loginForm("Entrar al Área de músicos"),
    h("p", { class: "muted", style: "margin-top:14px;max-width:60ch", text: "Las cuentas las crea la junta. Si no tienes la tuya o has olvidado la contraseña, pídesela a un administrador." })))];
  var logout = h("button", { class: "btn ghost small", type: "button", text: "Cerrar sesión", onclick: function () { SB.auth.signOut(); } });
  if (!canArea()) {
    return [head, h("section", { class: "block" }, h("div", { class: "wrap" }, h("div", { class: "notice" },
      h("h3", { text: "Esta cuenta no es de músico" }),
      h("p", { class: "muted", text: "Has entrado como " + ((SESSION.user && SESSION.user.email) || "usuario") + ". Pide a un administrador que te cree una cuenta de músico." }),
      h("div", { class: "form-acts" }, logout))))];
  }
  if (!PRIV.loaded) {
    if (!PRIV.loading) reloadPrivate();
    return [head, h("section", { class: "block" }, h("div", { class: "wrap" }, h("div", { class: "empty" }, h("p", { text: "Cargando…" }))))];
  }
  var me = myMusico();
  var body;
  if (tab === "calendario") body = areaCalendario();
  else if (tab === "partituras") body = areaPartituras();
  else if (tab === "anuncios") body = areaAnuncios();
  else if (tab === "cuenta") body = areaCuenta();
  else { tab = "inicio"; body = areaInicio(); }
  return [head, h("section", { class: "block area" }, h("div", { class: "wrap" },
    h("div", { class: "row-head" },
      h("p", { class: "muted", text: me ? [me.formacion, me.instrumento, isJefe(me) ? "Jefe de sección" : ""].filter(Boolean).join(" · ") : "Administración · ves todas las convocatorias" }),
      logout),
    h("nav", { class: "admin-tabs", "aria-label": "Secciones del área de músicos" }, AREA_TABS.map(function (t) {
      return h("a", { href: "#musicos-" + t[0], "aria-current": t[0] === tab ? "page" : null, text: t[1] });
    })),
    PRIV.error ? h("p", { class: "status err", text: PRIV.error }) : null,
    body))];
};

/* ---------- Inicio ---------- */
function areaInicio() {
  var me = myMusico(), t = todayStr();
  var up = areaEvents().filter(function (e) { return e.fecha >= t; });
  var pend = me ? up.filter(function (e) { return !myAnswer(e.id); }) : [];
  var anuncios = PRIV.anuncios.filter(function (a) { return IS_ADMIN || anuncioParaMi(a, me); })
    .sort(function (a, b) { return (b.creado || "") < (a.creado || "") ? -1 : 1; }).slice(0, 2);
  return h("div", { class: "area-home" },
    pend.length ? h("a", { class: "pending", href: "#musicos-calendario" },
      h("b", { text: pend.length === 1 ? "Tienes 1 convocatoria sin responder" : "Tienes " + pend.length + " convocatorias sin responder" }),
      h("span", { text: "Responder →" })) : null,
    h("div", { class: "row-head" }, h("h2", { text: "Próximas convocatorias" }), h("a", { class: "btn ghost small", href: "#musicos-calendario", text: "Ver calendario" })),
    up.length ? h("div", { class: "mevents" }, up.slice(0, 3).map(function (e) { return areaEvent(e, false); }))
      : h("div", { class: "empty" }, h("p", { text: "No hay convocatorias próximas." })),
    h("div", { class: "row-head", style: "margin-top:36px" }, h("h2", { text: "Últimos anuncios" }), h("a", { class: "btn ghost small", href: "#musicos-anuncios", text: "Ver anuncios" })),
    anuncios.length ? h("div", { class: "anuncios" }, anuncios.map(function (a) { return anuncioCard(a, true); }))
      : h("div", { class: "empty" }, h("p", { text: "Todavía no hay anuncios." })));
}

/* ---------- Calendario y asistencia ---------- */
function areaCalendario() {
  var t = todayStr(), all = areaEvents();
  var up = all.filter(function (e) { return e.fecha >= t; });
  var past = all.filter(function (e) { return e.fecha < t; }).reverse();
  return h("div", null,
    IS_ADMIN ? h("div", { class: "row-head" }, h("p", { class: "muted", text: "Los eventos se crean en Administración → Eventos. Los ensayos pueden marcarse como internos para que solo salgan aquí." }), h("a", { class: "admin-hint", href: "#admin-eventos", text: "✎ Crear evento" })) : null,
    up.length ? h("div", { class: "mevents" }, up.map(function (e) { return areaEvent(e, false); }))
      : h("div", { class: "empty" }, h("p", { text: "No hay convocatorias próximas." })),
    past.length ? h("div", { style: "margin-top:28px" },
      h("button", { class: "btn ghost small", type: "button", text: AREA.verPasados ? "Ocultar eventos pasados" : "Ver eventos pasados (" + past.length + ")", onclick: function () { AREA.verPasados = !AREA.verPasados; render(); } }),
      AREA.verPasados ? h("div", { class: "mevents", style: "margin-top:14px" }, past.slice(0, 30).map(function (e) { return areaEvent(e, true); })) : null) : null);
}

var ESTADOS = { si: "Asistiré", no: "No asistiré", duda: "Duda" };
function areaEvent(e, past) {
  var me = myMusico(), p = parseDate(e.fecha), ans = myAnswer(e.id);
  var card = h("article", { class: "mev" + (past ? " past" : "") + (e.publico === "no" ? " interno" : "") });
  var rsvp = null;
  if (me && !past) {
    var motivoIn = h("input", { type: "text", class: "motivo", id: "motivo-" + e.id, placeholder: "Motivo (opcional)", value: (ans && ans.motivo) || "" });
    rsvp = h("div", { class: "rsvp" },
      h("div", { class: "rsvp-btns", role: "group", "aria-label": "Tu respuesta" }, ["si", "no", "duda"].map(function (k) {
        return h("button", { type: "button", class: "rsvp-" + k + (ans && ans.estado === k ? " on" : ""), "aria-pressed": ans && ans.estado === k ? "true" : "false", text: ESTADOS[k],
          onclick: function (ev) { setRSVP(e.id, k, k === "si" ? null : motivoIn.value.trim(), ev.currentTarget); } });
      })),
      ans && ans.estado !== "si" ? h("div", { class: "motivo-row" }, motivoIn,
        h("button", { class: "btn ghost small", type: "button", text: "Guardar motivo", onclick: function (ev) { setRSVP(e.id, ans.estado, motivoIn.value.trim(), ev.currentTarget); } })) : null);
  } else if (me && past) {
    var pres = (PRIV.pase[e.id] || {})[SESSION.user.id];
    rsvp = h("p", { class: "muted small", text: "Tu respuesta: " + (ans ? ESTADOS[ans.estado] : "sin responder") + (pres === true ? " · Asististe" : pres === false ? " · No asististe" : "") });
  }
  add(card,
    h("div", { class: "cal" }, h("b", { text: p ? String(p.d) : "—" }), h("span", { text: p ? MES_CORTO[p.m - 1] + " " + String(p.y).slice(2) : "" })),
    h("div", { class: "mev-body" },
      h("div", { class: "mev-tags" },
        h("span", { class: "pill tipo-" + norm(e.tipo || "concierto"), text: e.tipo || "Concierto" }),
        e.formacion ? h("span", { class: "pill", text: e.formacion === "Asociación" ? "Todos" : e.formacion }) : null,
        e.publico === "no" ? h("span", { class: "pill", text: "🔒 Interno" }) : null),
      h("h3", { text: e.titulo }),
      h("div", { class: "meta" }, e.hora ? h("span", { text: "🕗 " + e.hora }) : null, e.lugar ? h("span", { text: "📍 " + e.lugar }) : null,
        e.indumentaria ? h("span", { text: "👔 " + e.indumentaria }) : null),
      e.notas ? h("p", { class: "notas", text: e.notas }) : (e.descripcion ? h("p", { class: "notas", text: e.descripcion }) : null),
      rsvp,
      IS_ADMIN ? asistResumen(e) : null));
  return card;
}

function setRSVP(evId, estado, motivo, btn) {
  if (btn) btn.disabled = true;
  SB.from("asistencias").upsert({ evento_id: evId, user_id: SESSION.user.id, estado: estado, motivo: motivo || null })
    .then(check).then(reloadPrivate, function (e) { if (btn) btn.disabled = false; alert2(btn, errMsg(e)); });
}
function alert2(near, msg) { if (near && near.parentNode) near.parentNode.appendChild(h("p", { class: "status err", text: msg })); }

function convocadosDe(e) { return DATA.musicos.filter(function (m) { return m.user_id && convocado(e, m); }); }
function asistResumen(e) {
  var conv = convocadosDe(e), a = PRIV.asist[e.id] || {};
  var c = { si: 0, no: 0, duda: 0, nada: 0 };
  conv.forEach(function (m) { var r = a[m.user_id]; c[r ? r.estado : "nada"]++; });
  var open = !!AREA.abiertos[e.id];
  return h("div", { class: "asist" },
    h("div", { class: "asist-sum" },
      h("span", { class: "st st-si", text: "✓ " + c.si }), h("span", { class: "st st-no", text: "✗ " + c.no }),
      h("span", { class: "st st-duda", text: "? " + c.duda }), h("span", { class: "st st-nada", text: "Sin responder: " + c.nada }),
      h("button", { class: "btn ghost small", type: "button", text: open ? "Ocultar asistencia" : "Ver asistencia y pasar lista", onclick: function () { AREA.abiertos[e.id] = !open; render(); } })),
    open ? asistPanel(e, conv, a) : null);
}
function asistPanel(e, conv, a) {
  if (!conv.length) return h("p", { class: "muted small", text: "No hay músicos con cuenta convocados a este evento." });
  var pase = PRIV.pase[e.id] || {};
  return h("div", { class: "asist-panel" }, groupByInstrument(conv).map(function (g) {
    return h("div", { class: "asist-group" }, h("h4", { text: g.name }), g.items.map(function (m) {
      var r = a[m.user_id], est = r ? r.estado : "nada";
      var cb = h("input", { type: "checkbox", id: "pl-" + e.id + "-" + m.user_id, checked: pase[m.user_id] === true || null });
      cb.addEventListener("change", function () {
        cb.disabled = true;
        SB.from("pase_lista").upsert({ evento_id: e.id, user_id: m.user_id, presente: cb.checked }).then(check)
          .then(function () { (PRIV.pase[e.id] = PRIV.pase[e.id] || {})[m.user_id] = cb.checked; cb.disabled = false; },
                function (err) { cb.disabled = false; cb.checked = !cb.checked; alert2(cb.parentNode, errMsg(err)); });
      });
      return h("div", { class: "asist-row" },
        h("span", { class: "st st-" + est, text: est === "nada" ? "—" : est === "si" ? "✓" : est === "no" ? "✗" : "?" }),
        h("span", { class: "an", text: m.nombre + (isJefe(m) ? " (jefe)" : "") }),
        r && r.motivo ? h("span", { class: "motivo-txt", text: "«" + r.motivo + "»" }) : null,
        h("label", { class: "pl", for: "pl-" + e.id + "-" + m.user_id }, cb, " Presente"));
    }));
  }));
}

/* ---------- Partituras ---------- */
function guessInstrument(filename) {
  var n = norm(filename).replace(/[_\-.]+/g, " ");
  var best = "";
  INSTRUMENTOS.concat(["Saxofón", "Bombo", "Caja", "Platos", "Timbales", "Director"]).forEach(function (i) {
    var k = norm(i);
    if (n.indexOf(k) >= 0 && k.length > best.length) best = i;
  });
  if (/(^| )(guion|guión|score|director)( |$)/.test(n)) best = "Director";
  var voz = (/(?:^| )([1-4])(?:o|º|ª)?(?: |$)/.exec(n) || [])[1];
  return { instrumento: best || "Todos", voz: voz ? voz + "º" : "" };
}
function slug(t) { return norm(t).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "obra"; }
function openPartitura(p, btn) {
  var w = window.open("about:blank", "_blank");
  if (btn) btn.disabled = true;
  SB.storage.from("partituras").createSignedUrl(p.path, 3600).then(function (r) {
    if (btn) btn.disabled = false;
    if (r.error || !r.data) { if (w) w.close(); alert2(btn, "No se ha podido abrir el archivo."); return; }
    if (w) w.location.href = r.data.signedUrl; else location.href = r.data.signedUrl;
  });
}
function areaPartituras() {
  var me = myMusico();
  var list = PRIV.partituras.filter(function (p) { return IS_ADMIN ? (!AREA.filtroInst || norm(p.instrumento) === norm(AREA.filtroInst)) : partituraParaMi(p, me); });
  var obras = {};
  list.forEach(function (p) { (obras[p.obra || "Sin título"] = obras[p.obra || "Sin título"] || []).push(p); });
  var names = Object.keys(obras).sort(function (a, b) { return a.localeCompare(b, "es"); });
  var instAll = {}; PRIV.partituras.forEach(function (p) { if (p.instrumento) instAll[p.instrumento] = 1; });
  var listEl = names.length ? h("div", { class: "obras" }, names.map(function (o) {
    var items = obras[o].sort(function (a, b) { return instIndex(a.instrumento) - instIndex(b.instrumento) || String(a.voz || "").localeCompare(String(b.voz || "")); });
    var ref = items.filter(function (p) { return safeUrl(p.enlace); })[0];
    return h("div", { class: "obra" },
      h("h3", { text: o }),
      ref ? (youtubeId(ref.enlace) ? videoEmbed(youtubeId(ref.enlace), o) : h("a", { href: ref.enlace, target: "_blank", rel: "noopener", text: "↗ Grabación de referencia" })) : null,
      h("div", { class: "pfiles" }, items.map(function (p) {
        var open = h("button", { class: "btn ghost small", type: "button", text: /^audio\//.test(p.tipo || "") ? "Escuchar" : "Abrir", onclick: function (ev) { openPartitura(p, ev.currentTarget); } });
        return h("div", { class: "pfile" },
          h("span", { class: "pinst", text: (p.instrumento || "Todos") + (p.voz ? " " + p.voz : "") }),
          h("span", { class: "pname", text: p.archivo || "" }),
          h("div", { class: "acts" }, open, IS_ADMIN ? deleteButton(function (b) {
            SB.storage.from("partituras").remove([p.path]).then(function () {
              return SB.from("interno").delete().eq("coleccion", "partituras").eq("id", p.id).then(check);
            }).then(reloadPrivate, function (e) { b.disabled = false; b.textContent = "Borrar"; alert2(b, errMsg(e)); });
          }) : null));
      })));
  })) : h("div", { class: "empty" }, h("p", { text: IS_ADMIN ? "Todavía no hay partituras. Súbelas con el formulario." : "Todavía no hay partituras para tu instrumento." }));
  if (!IS_ADMIN) return h("div", null, h("p", { class: "muted", style: "margin-bottom:16px", text: "Partituras de " + ((me && me.instrumento) || "tu instrumento") + " y las comunes a toda la banda." }), listEl);

  var filter = h("div", { class: "list-filter" }, h("label", { for: "pf-inst", text: "Instrumento:" }),
    h("select", { id: "pf-inst", onchange: function (e) { AREA.filtroInst = e.target.value; render(); } },
      h("option", { value: "", text: "Todos los instrumentos" }),
      Object.keys(instAll).sort(function (a, b) { return instIndex(a) - instIndex(b); }).map(function (i) { return h("option", { value: i, text: i, selected: AREA.filtroInst === i || null }); })));
  return h("div", { class: "admin-grid" }, h("div", null, filter, listEl), partituraForm(names));
}
function partituraForm(obras) {
  var st = statusEl();
  var obra = h("input", { id: "pt-obra", type: "text", list: "pt-obras", autocomplete: "off", placeholder: "El abanico" });
  var dl = h("datalist", { id: "pt-obras" }, obras.map(function (o) { return h("option", { value: o }); }));
  var inst = h("input", { id: "pt-inst", type: "text", list: "pt-insts", autocomplete: "off", placeholder: "Déjalo vacío para detectarlo por el nombre del archivo" });
  var dl2 = h("datalist", { id: "pt-insts" }, ["Todos", "Director"].concat(INSTRUMENTOS).map(function (o) { return h("option", { value: o }); }));
  var voz = h("input", { id: "pt-voz", type: "text", placeholder: "1º, 2º…" });
  var enlace = h("input", { id: "pt-enlace", type: "url", placeholder: "https://youtube.com/…" });
  var files = h("input", { id: "pt-files", type: "file", multiple: true, accept: "application/pdf,image/jpeg,image/png,audio/*" });
  var btn = h("button", { class: "btn primary", type: "submit", text: "Subir" });
  var form = h("form", { class: "aform", novalidate: true }, h("h3", { text: "Subir partituras" }),
    h("div", { class: "field" }, h("label", { for: "pt-obra", text: "Obra *" }), obra, dl),
    h("div", { class: "field" }, h("label", { for: "pt-files", text: "Archivos (PDF, imagen o audio) *" }), files,
      h("small", { text: "Puedes subir todas las partes de una obra a la vez. Si los archivos se llaman como el instrumento (\"Clarinete 1.pdf\", \"Trompeta 2.pdf\"…), se reparten solos." })),
    h("div", { class: "field" }, h("label", { for: "pt-inst", text: "Instrumento" }), inst, dl2),
    h("div", { class: "field" }, h("label", { for: "pt-voz", text: "Voz" }), voz),
    h("div", { class: "field" }, h("label", { for: "pt-enlace", text: "Grabación de referencia" }), enlace, h("small", { text: "Opcional. Un enlace de YouTube se verá dentro de la obra." })),
    h("div", { class: "form-acts" }, btn), st);
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var o = obra.value.trim(), list = Array.prototype.slice.call(files.files || []);
    if (!o) { setStatus(st, "Escribe el nombre de la obra.", false); return; }
    if (!list.length) { setStatus(st, "Elige al menos un archivo.", false); return; }
    if (enlace.value.trim() && !safeUrl(enlace.value.trim())) { setStatus(st, "El enlace debe empezar por https://", false); return; }
    btn.disabled = true;
    var done = 0;
    list.reduce(function (p, file, i) {
      return p.then(function () {
        btn.textContent = "Subiendo " + (i + 1) + " de " + list.length + "…";
        var g = guessInstrument(file.name);
        var ext = (String(file.name).split(".").pop() || "pdf").toLowerCase().replace(/[^a-z0-9]/g, "");
        var path = slug(o) + "/" + newId() + "." + ext;
        return SB.storage.from("partituras").upload(path, file, { contentType: file.type || undefined, upsert: false }).then(function (r) {
          if (r.error) throw r.error;
          return SB.from("interno").insert({ coleccion: "partituras", id: newId(), datos: {
            obra: o, instrumento: inst.value.trim() || g.instrumento, voz: voz.value.trim() || g.voz,
            enlace: enlace.value.trim(), path: path, archivo: file.name, tipo: file.type || "", creado: new Date().toISOString() } });
        }).then(check).then(function () { done++; });
      });
    }, Promise.resolve()).then(function () {
      return reloadPrivate();
    }, function (e) {
      btn.disabled = false; btn.textContent = "Subir";
      setStatus(st, (done ? done + " subidos. " : "") + errMsg(e), false);
    });
  });
  return form;
}

/* ---------- Anuncios ---------- */
function anuncioCard(a, compact) {
  var com = PRIV.coments[a.id] || [];
  var card = h("article", { class: "anuncio" },
    h("div", { class: "an-meta" },
      h("span", { class: "pill", text: a.destinatarios && a.destinatarios !== "Todos" ? "Solo " + a.destinatarios : "Para todos" }),
      h("span", { text: (a.creado ? fmtLong(String(a.creado).slice(0, 10)) : "") + (a.autor ? " · " + a.autor : "") })),
    h("h3", { text: a.titulo }),
    a.texto ? h("p", { class: "an-text", text: compact ? excerpt(a.texto, 220) : a.texto }) : null);
  if (compact) { add(card, h("a", { class: "small-link", href: "#musicos-anuncios", text: com.length ? com.length + (com.length === 1 ? " comentario" : " comentarios") + " →" : "Comentar →" })); return card; }
  if (IS_ADMIN) add(card, h("div", { class: "acts", style: "margin-top:4px" },
    h("button", { class: "btn ghost small", type: "button", text: "Editar", onclick: function () { AREA.editAnuncio = a.id; render(); window.scrollTo(0, 0); } }),
    deleteButton(function (b) {
      SB.from("interno").delete().eq("coleccion", "anuncios").eq("id", a.id).then(check).then(reloadPrivate, function (e) { b.disabled = false; b.textContent = "Borrar"; alert2(b, errMsg(e)); });
    })));
  var input = h("input", { type: "text", id: "com-" + a.id, placeholder: "Escribe un comentario…", maxlength: "2000" });
  var send = h("button", { class: "btn primary small", type: "submit", text: "Enviar" });
  var f = h("form", { class: "com-form" }, input, send);
  f.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var t = input.value.trim(); if (!t) return;
    send.disabled = true;
    SB.from("comentarios").insert({ anuncio_id: a.id, user_id: SESSION.user.id, autor: displayName(), texto: t }).then(check)
      .then(reloadPrivate, function (e) { send.disabled = false; alert2(send, errMsg(e)); });
  });
  add(card, h("div", { class: "coments" }, com.map(function (c) {
    var mine = SESSION && c.user_id === SESSION.user.id;
    return h("div", { class: "coment" },
      h("div", { class: "c-head" }, h("b", { text: c.autor }), h("span", { text: fmtLong(String(c.creado).slice(0, 10)) }),
        (mine || IS_ADMIN) ? h("button", { class: "linkish", type: "button", text: "Borrar", onclick: function () {
          SB.from("comentarios").delete().eq("id", c.id).then(check).then(reloadPrivate);
        } }) : null),
      h("p", { text: c.texto }));
  }), f));
  return card;
}
function areaAnuncios() {
  var me = myMusico();
  var list = PRIV.anuncios.filter(function (a) { return IS_ADMIN || anuncioParaMi(a, me); })
    .sort(function (a, b) { return (b.creado || "") < (a.creado || "") ? -1 : 1; });
  var listEl = list.length ? h("div", { class: "anuncios" }, list.map(function (a) { return anuncioCard(a, false); }))
    : h("div", { class: "empty" }, h("p", { text: "Todavía no hay anuncios." }));
  if (!IS_ADMIN) return listEl;
  return h("div", { class: "admin-grid" }, listEl, anuncioForm());
}
function anuncioForm() {
  var cur = AREA.editAnuncio ? PRIV.anuncios.filter(function (a) { return a.id === AREA.editAnuncio; })[0] : null;
  var st = statusEl();
  var titulo = h("input", { id: "an-titulo", type: "text", value: (cur && cur.titulo) || "" });
  var texto = h("textarea", { id: "an-texto" }); texto.value = (cur && cur.texto) || "";
  var dest = h("select", { id: "an-dest" }, ["Todos", "Banda", "Bandín"].map(function (d) { return h("option", { value: d, text: d === "Todos" ? "Todos los músicos" : "Solo " + d, selected: cur && cur.destinatarios === d || null }); }));
  var btn = h("button", { class: "btn primary", type: "submit", text: cur ? "Guardar cambios" : "Publicar anuncio" });
  var form = h("form", { class: "aform", novalidate: true }, h("h3", { text: cur ? "Editar anuncio" : "Nuevo anuncio" }),
    h("div", { class: "field" }, h("label", { for: "an-titulo", text: "Título *" }), titulo),
    h("div", { class: "field" }, h("label", { for: "an-texto", text: "Texto" }), texto),
    h("div", { class: "field" }, h("label", { for: "an-dest", text: "Para" }), dest),
    h("div", { class: "form-acts" }, btn, cur ? h("button", { class: "btn ghost", type: "button", text: "Cancelar", onclick: function () { AREA.editAnuncio = null; render(); } }) : null), st);
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!titulo.value.trim()) { setStatus(st, "Escribe un título.", false); return; }
    btn.disabled = true;
    var datos = { titulo: titulo.value.trim(), texto: texto.value.trim(), destinatarios: dest.value,
      autor: (cur && cur.autor) || displayName(), creado: (cur && cur.creado) || new Date().toISOString() };
    SB.from("interno").upsert({ coleccion: "anuncios", id: cur ? cur.id : newId(), datos: datos }).then(check)
      .then(function () { AREA.editAnuncio = null; return reloadPrivate(); }, function (e) { btn.disabled = false; setStatus(st, errMsg(e), false); });
  });
  return form;
}

/* ---------- Mi cuenta ---------- */
function areaCuenta() {
  var me = myMusico(), st = statusEl();
  var p1 = h("input", { id: "pw1", type: "password", autocomplete: "new-password" });
  var p2 = h("input", { id: "pw2", type: "password", autocomplete: "new-password" });
  var btn = h("button", { class: "btn primary", type: "submit", text: "Cambiar contraseña" });
  var form = h("form", { class: "aform", style: "position:static" }, h("h3", { text: "Cambiar contraseña" }),
    h("div", { class: "field" }, h("label", { for: "pw1", text: "Nueva contraseña" }), p1, h("small", { text: "Al menos 8 caracteres." })),
    h("div", { class: "field" }, h("label", { for: "pw2", text: "Repite la contraseña" }), p2),
    h("div", { class: "form-acts" }, btn), st);
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (p1.value.length < 8) { setStatus(st, "La contraseña debe tener al menos 8 caracteres.", false); return; }
    if (p1.value !== p2.value) { setStatus(st, "Las dos contraseñas no coinciden.", false); return; }
    btn.disabled = true;
    SB.auth.updateUser({ password: p1.value }).then(function (r) {
      btn.disabled = false;
      if (r.error) setStatus(st, "No se ha podido cambiar: " + r.error.message, false);
      else { p1.value = ""; p2.value = ""; setStatus(st, "Contraseña cambiada.", true); }
    });
  });
  function kv(k, v) { return v ? h("div", { class: "kv" }, h("span", { class: "k", text: k }), h("span", { class: "v", text: v })) : null; }
  return h("div", { class: "admin-grid" },
    h("div", { class: "cbox" },
      me ? personAvatar(me, "azul") : null,
      kv("Nombre", me ? me.nombre : displayName()),
      kv("Usuario", me && me.usuario),
      kv("Correo", SESSION.user && SESSION.user.email),
      kv("Formación", me && me.formacion),
      kv("Instrumento", me && me.instrumento),
      me && isJefe(me) ? kv("Cargo", "Jefe de sección") : null,
      h("p", { class: "muted small", text: "Si algún dato no es correcto, pídeselo a la junta." })),
    form);
}

/* ---------- Panel: cuentas de músicos ---------- */
var CUENTAS = { loaded: false, loading: false, list: [], error: "" };
function musicosFn(body) {
  return SB.functions.invoke("musicos", { body: body }).then(function (r) {
    if (!r.error) return r.data;
    var ctx = r.error.context, fb = "No se ha podido completar. Inténtalo de nuevo.";
    if (ctx && typeof ctx.json === "function") return ctx.json().then(function (j) { throw new Error((j && j.error) || fb); }, function () { throw new Error(fb); });
    throw new Error(fb);
  });
}
function loadCuentas() {
  CUENTAS.loading = true;
  return musicosFn({ action: "list" }).then(function (d) { CUENTAS = { loaded: true, loading: false, list: d.cuentas || [], error: "" }; },
    function (e) { CUENTAS = { loaded: true, loading: false, list: [], error: e.message }; });
}
function suggestUser(nombre) {
  var p = norm(nombre).replace(/[^a-z ]/g, "").split(/\s+/).filter(Boolean);
  return p.length ? (p[0] + (p[1] ? "." + p[1] : "")).slice(0, 30) : "";
}
function randomPass() {
  var c = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789", out = "";
  var arr = new Uint32Array(10); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(arr) : arr.forEach(function (v, i) { arr[i] = Math.random() * 1e9; });
  for (var i = 0; i < 10; i++) out += c[arr[i] % c.length];
  return out;
}
function adminCuentas() {
  if (!CUENTAS.loaded && !CUENTAS.loading) loadCuentas().then(render);
  var st = statusEl();
  var nombre = h("input", { id: "cu-nombre", type: "text" });
  var usuario = h("input", { id: "cu-usuario", type: "text", autocapitalize: "none", spellcheck: "false", placeholder: "nombre.apellido" });
  var email = h("input", { id: "cu-email", type: "email", placeholder: "nombre@correo.com" });
  var pass = h("input", { id: "cu-pass", type: "text", autocomplete: "off", value: randomPass() });
  var form_ = h("select", { id: "cu-form" }, ["Banda", "Bandín", "Banda y Bandín"].map(function (f) { return h("option", { value: f, text: f }); }));
  var inst = h("input", { id: "cu-inst", type: "text", list: "cu-insts", autocomplete: "off" });
  var dl = h("datalist", { id: "cu-insts" }, INSTRUMENTOS.map(function (o) { return h("option", { value: o }); }));
  var cargo = h("select", { id: "cu-cargo" }, ["Músico", "Jefe de sección"].map(function (c) { return h("option", { value: c, text: c }); }));
  var userTouched = false;
  usuario.addEventListener("input", function () { userTouched = true; });
  nombre.addEventListener("input", function () { if (!userTouched) usuario.value = suggestUser(nombre.value); });
  var btn = h("button", { class: "btn primary", type: "submit", text: "Crear cuenta" });
  var form = h("form", { class: "aform", novalidate: true }, h("h3", { text: "Nueva cuenta de músico" }),
    h("p", { class: "muted small", text: "El músico aparecerá solo en la plantilla de la Banda o el Bandín y podrá entrar en el Área de músicos." }),
    h("div", { class: "field" }, h("label", { for: "cu-nombre", text: "Nombre y apellidos *" }), nombre),
    h("div", { class: "field" }, h("label", { for: "cu-usuario", text: "Usuario *" }), usuario, h("small", { text: "Minúsculas, números, punto o guion. Con esto entrará." })),
    h("div", { class: "field" }, h("label", { for: "cu-email", text: "Correo *" }), email),
    h("div", { class: "field" }, h("label", { for: "cu-pass", text: "Contraseña inicial *" }), pass,
      h("button", { class: "btn ghost small", type: "button", style: "justify-self:start", text: "Generar otra", onclick: function () { pass.value = randomPass(); } })),
    h("div", { class: "field" }, h("label", { for: "cu-form", text: "Toca en *" }), form_),
    h("div", { class: "field" }, h("label", { for: "cu-inst", text: "Instrumento *" }), inst, dl),
    h("div", { class: "field" }, h("label", { for: "cu-cargo", text: "Cargo" }), cargo),
    h("div", { class: "form-acts" }, btn), st);
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var body = { action: "create", nombre: nombre.value.trim(), usuario: usuario.value.trim().toLowerCase(), email: email.value.trim(),
      password: pass.value, formacion: form_.value, instrumento: inst.value.trim(), cargo: cargo.value };
    if (!body.nombre || !body.usuario || !body.email || !body.instrumento) { setStatus(st, "Rellena nombre, usuario, correo e instrumento.", false); return; }
    btn.disabled = true; btn.textContent = "Creando…";
    musicosFn(body).then(function () {
      FLASH = { col: "cuentas", msg: "Cuenta creada. Pásale a " + body.nombre + " su usuario «" + body.usuario + "» y la contraseña «" + body.password + "»." };
      return Promise.all([loadCuentas(), loadAll()]);
    }).then(render, function (e) { btn.disabled = false; btn.textContent = "Crear cuenta"; setStatus(st, e.message, false); });
  });
  if (FLASH && FLASH.col === "cuentas") { setStatus(st, FLASH.msg, true); FLASH = null; }

  var list;
  if (!CUENTAS.loaded) list = h("div", { class: "empty" }, h("p", { text: "Cargando cuentas…" }));
  else if (CUENTAS.error) list = h("div", { class: "notice" }, h("h3", { text: "No se han podido cargar las cuentas" }), h("p", { class: "muted", text: CUENTAS.error }),
    h("div", { class: "form-acts" }, h("button", { class: "btn ghost small", type: "button", text: "Reintentar", onclick: function () { CUENTAS.loaded = false; render(); } })));
  else if (!CUENTAS.list.length) list = h("div", { class: "empty" }, h("p", { text: "Todavía no hay cuentas de músico." }));
  else {
    var sorted = CUENTAS.list.slice().sort(function (a, b) { return a.formacion === b.formacion ? musicianSort(a, b) : String(a.formacion).localeCompare(String(b.formacion)); });
    list = h("div", { class: "alist" }, sorted.map(function (c) {
      var pw = h("input", { type: "text", id: "npw-" + c.user_id, placeholder: "Nueva contraseña", "aria-label": "Nueva contraseña para " + c.nombre });
      var pwBtn = h("button", { class: "btn ghost small", type: "button", text: "Cambiar contraseña" });
      pwBtn.addEventListener("click", function () {
        if (pw.value.length < 8) { alert2(pwBtn, "Mínimo 8 caracteres."); return; }
        pwBtn.disabled = true;
        musicosFn({ action: "password", user_id: c.user_id, password: pw.value }).then(function () { pwBtn.disabled = false; pwBtn.textContent = "Cambiada ✓"; },
          function (e) { pwBtn.disabled = false; alert2(pwBtn, e.message); });
      });
      return h("div", { class: "aitem", style: "flex-wrap:wrap" },
        h("div", { class: "t", style: "flex:1;min-width:220px" },
          h("b", { text: c.nombre + (isJefe(c) ? " · jefe de sección" : "") }),
          h("span", { text: [c.usuario, c.email].filter(Boolean).join(" · ") }),
          h("span", { text: [c.formacion, c.instrumento].filter(Boolean).join(" · ") + " · " + (c.ultimo_acceso ? "Último acceso: " + fmtLong(String(c.ultimo_acceso).slice(0, 10)) : "Todavía no ha entrado") })),
        h("div", { class: "acts", style: "flex-wrap:wrap" }, pw, pwBtn, deleteButton(function (b) {
          musicosFn({ action: "remove", user_id: c.user_id }).then(function () {
            FLASH = { col: "cuentas", msg: "Cuenta de " + c.nombre + " borrada." };
            return Promise.all([loadCuentas(), loadAll()]);
          }).then(render, function (e) { b.disabled = false; b.textContent = "Borrar"; alert2(b, e.message); });
        })));
    }));
  }
  return h("div", { class: "admin-grid" },
    h("div", null, h("p", { class: "muted", style: "margin-bottom:12px", text: "Para cambiar la foto, el instrumento o el cargo de un músico, usa la pestaña Músicos." }), list),
    form);
}


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
        if (r.id === "escuela") DATA.escuela = r.datos || {};
        if (r.id === "socio") DATA.socio = r.datos || {};
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
function updateNav() {}
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
    .then(loadPrivate)
    .then(render, function (e) { console.error("No se han podido cargar los datos:", e); render(); });
  SB.auth.onAuthStateChange(function (event, session) {
    if (event === "INITIAL_SESSION") return;
    SESSION = session || null;
    ADMINS.loaded = false; ADMINS.list = [];
    CUENTAS.loaded = false; CUENTAS.list = [];
    PRIV.loaded = false; PRIV.loading = true;
    // Se sale del callback antes de llamar de nuevo a Supabase
    setTimeout(function () { refreshAdmin().then(loadPrivate).then(render); }, 0);
  });
  // Recarga los datos al volver a la pestaña, por si otro administrador ha cambiado algo
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible" && LIVE) loadAll().then(function () { return SESSION ? loadPrivate() : null; }).then(softRender, function () {});
  });
}
})();
