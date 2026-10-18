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
    aviso: "Para más información, contacte con nosotros o pase por nuestras oficinas.",
    niveles: "Socio | 12 € al año (1 € al mes) | Contribución mínima para apoyar la promoción cultural.\nAmigo | 100 € y más | Recibe el estatus de AMIGO de la asociación.\nMecenas | 500 € y más | Recibe el estatus de MECENAS de la asociación.",
    ventajas: "Exhibición del logotipo | Solo para MECENAS: empresas e instituciones con su logotipo y enlace en nuestra web.\nMención especial en nuestra web | Opcional, para AMIGOS y MECENAS.\nAcceso a conciertos | Acceso preferente a los conciertos de la asociación."
  },
  pie: { texto: "Asociación sin ánimo de lucro que enseña, toca y comparte música en el concejo de Siero desde 1984.", apoyos: "Con el apoyo del Ayuntamiento de Siero y la Fundación Caja Rural de Asturias", copyright: "© Asociación Sierense Amigos de la Música · Pola de Siero, Asturias" }
};

var COLLECTIONS = ["directiva", "directores", "eventos", "noticias", "enlaces", "fotos", "musicos", "historia", "profesores"];
var MAPA_DEFECTO = "https://maps.app.goo.gl/ekUwwADRScStcLzo6";
var DATA = JSON.parse(JSON.stringify(DEFAULTS));
var LIVE = false;          // true cuando la base de datos responde
var DB = null, ASSETS = null, IS_ADMIN = false, PERMS = [], MI_CARGO = "";
function can(p) { return IS_ADMIN && PERMS.indexOf(p) >= 0; }
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
function adminLink(tab, label) { return can("web") ? h("a", { class: "admin-hint", href: "#admin-" + tab, text: "✎ " + label }) : null; }

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
function pipeLines(t) { return String(t || "").split("\n").map(function (l) { return l.split("|").map(function (x) { return x.trim(); }); }).filter(function (p) { return p[0]; }); }
function socioNiveles(S) {
  var niv = pipeLines(S.niveles), ven = pipeLines(S.ventajas);
  var cols = ["verde", "azul", "morado"], icons = ["💶", "🤝", "⭐"], vIcons = ["™", "🏅", "🎫"];
  if (!niv.length && !ven.length) return null;
  return h("div", { class: "socio-niveles" },
    niv.length ? h("div", null, h("h2", { text: "Niveles de membresía" }),
      h("div", { class: "niv-grid" }, niv.map(function (n, i) {
        return h("div", { class: "niv niv-" + cols[i % 3] }, h("span", { class: "niv-ico", "aria-hidden": "true", text: icons[i % 3] }),
          h("span", { class: "niv-name", text: n[0] }), n[1] ? h("b", { text: n[1] }) : null, n[2] ? h("p", { text: n[2] }) : null);
      }))) : null,
    ven.length ? h("div", null, h("h2", { text: "Ventajas de Amigos y Mecenas" }),
      h("ul", { class: "ven-list" }, ven.map(function (v, i) {
        return h("li", null, h("span", { class: "ven-ico", "aria-hidden": "true", text: vIcons[i % 3] }), h("div", null, h("b", { text: v[0] }), v[1] ? h("p", { text: v[1] }) : null));
      }))) : null);
}
PAGES.socio = function () {
  var S = socioData();
  var pasos = String(S.pasos || "").split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
  return [
    pageHead("Hacerse socio", S.titulo || "Hazte socio", S.intro || null, null,
      staffLettering("¡Hazte socio!", { glyphs: MUSIC_CAPS, colors: { 0: "c-azul", 1: "c-verde" }, punct: "c-naranja" })),
    h("section", { class: "block" }, h("div", { class: "wrap" },
      can("web") ? h("div", { class: "row-head" }, h("span"), adminLink("socio", "Editar esta página")) : null,
      h("div", { class: "socio-grid" },
        h("div", { class: "socio-info" },
          h("h2", { text: "¿Cómo hacerse socio?" }),
          S.texto ? h("p", { class: "muted", text: S.texto }) : null,
          pasos.length ? h("ol", { class: "socio-steps" }, pasos.map(function (t) { return h("li", { text: t }); })) : null),
        h("aside", { class: "socio-price" },
          h("span", { class: "eyebrow", text: "Cuota de socio" }),
          h("b", { text: S.cuota || "" }),
          h("a", { class: "btn primary", href: "#socio-hoja", onclick: function (ev) { ev.preventDefault(); var t = document.getElementById("socio-hoja"); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" }); }, text: "Hoja de socio ↓" }))),
      socioNiveles(S),
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
      can("web") ? h("div", { class: "row-head" }, h("span"), adminLink("historia", "Editar historia")) : null,
      items.length ? h("div", { class: "trail" }, list) : emptyBox("Todavía no hay hitos en la historia.", "historia")))
  ];
};

function personAvatar(p, color, cls) {
  if (p.foto) return h("img", { class: (cls || "avatar") + " photo", src: blobUrl(p.foto), alt: "Foto de " + (p.nombre || ""), loading: "lazy" });
  return h("div", { class: cls || "avatar", style: "background:" + colorVar(p.color || color) }, initials(p.nombre));
}
function directorFeature(match, color, label) {
  var d = DATA.directores.filter(function (x) { return match.test(x.cargo || ""); })[0];
  if (!d) return can("web") ? emptyBox("Añade al director desde Administración para que aparezca aquí.", "directores") : null;
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
    var k = m.instrumento || (/director/i.test(m.cargo || "") ? "Dirección" : "Otros");
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
      (function () {
        var isPres = function (m) { return /presiden/i.test(m.cargo || "") && !/vice/i.test(m.cargo || ""); };
        var pres = junta.filter(isPres)[0];
        return pres ? h("div", { class: "pres-card" },
          pres.foto ? h("img", { class: "pres-photo", src: blobUrl(pres.foto), alt: "Foto de " + pres.nombre }) : h("div", { class: "pres-photo pres-ph", text: initials(pres.nombre) }),
          h("div", { class: "pres-text" }, h("span", { class: "eyebrow", text: pres.cargo }), h("h3", { text: pres.nombre }),
            pres.bio ? h("p", { text: pres.bio }) : null)) : null;
      })(),
      junta.length ? h("div", { class: "junta" }, junta.filter(function (m) { return !(/presiden/i.test(m.cargo || "") && !/vice/i.test(m.cargo || "")); }).map(function (m) {
        var lead = false;
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
      can("web") ? h("div", { class: "row-head" }, h("span"), adminLink("escuela", "Editar la escuela")) : null,
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
      can("web") ? h("div", { class: "row-head" }, h("span"), adminLink("contacto", "Editar datos de contacto")) : null,
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
    { k: "hora_fin", l: "Hora de fin", type: "time", help: "Opcional. Se ve en el Área de músicos y al añadirlo al calendario." },
    { k: "lugar", l: "Lugar", ph: "Auditorio de Pola de Siero" },
    { k: "direccion", l: "Dirección para el mapa", ph: "Calle Alcalde Parrondo 32, Pola de Siero", help: "Opcional. Si la pones, el mapa del Área de músicos será más exacto." },
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
    { k: "instrumento", l: "Instrumento", type: "datalist", list: INSTRUMENTOS, help: "Elige de la lista o escribe otro instrumento. Si es el director de la banda y no toca, déjalo vacío." },
    { k: "voz", l: "Voz", ph: "1, 2, 3…", help: "Opcional. Decide qué particella le llega (por ejemplo, Clarinete 2). Vacío: recibe todas las voces de su instrumento." },
    { k: "cargo", l: "Cargo", type: "select", options: [["Músico", "Músico"], ["Jefe de sección", "Jefe de sección"], ["Director", "Director (recibe el guion)"]] },
    { k: "foto", l: "Foto", type: "images", single: true, help: "Opcional. Mejor una foto en la que se vea bien la cara." },
    { k: "orden", l: "Orden dentro de su instrumento", type: "number", help: "Opcional. El jefe de sección aparece siempre el primero." }],
    title: function (d) { return d.nombre; },
    sub: function (d) { return [d.instrumento + (d.voz ? " " + d.voz + "º" : ""), isJefe(d) ? "Jefe de sección" : /director/i.test(d.cargo || "") ? "Director" : "", d.user_id ? "🔑 con cuenta (" + (d.usuario || "") + ")" : ""].filter(Boolean).join(" · "); },
    sort: function (a, b) { return a.formacion === b.formacion ? musicianSort(a, b) : (a.formacion === "Banda" ? -1 : 1); },
    filter: { k: "formacion", label: "Formación", options: ["Banda", "Bandín", "Banda y Bandín"] },
    group: function (d) { return (d.formacion || "") + " · " + (d.instrumento || "Otros"); } }
};
var TABS_JUNTA = [["tareas", "📋 Tareas", null], ["reuniones", "🗓️ Reuniones", null], ["personas", "👥 Personas y accesos", "cuentas"], ["cargos", "🏛️ Cargos", "cuentas"]];
var TABS = [["directiva", "Directiva"], ["directores", "Directores"], ["profesores", "Profesorado"], ["historia", "Historia"], ["musicos", "Músicos"], ["eventos", "Eventos"], ["noticias", "Noticias"], ["enlaces", "Enlaces y redes"], ["fotos", "Galería"], ["escuela", "Escuela"], ["socio", "Hacerse socio"], ["contacto", "Contacto"], ["pie", "Pie de página"]].concat(TABS_JUNTA);
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
  if (debeCambiarClave()) return cambiarClavePage();
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
  if (debeCambiarClave()) return cambiarClavePage();
  if (tab === "cuentas" || tab === "usuarios") tab = "personas";
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
  tab = tab || (can("web") ? "directiva" : "tareas");
  var webTabs = TABS.filter(function (t) { return !TABS_JUNTA.some(function (j) { return j[0] === t[0]; }); });
  var juntaTabs = TABS_JUNTA.filter(function (t) { return !t[2] || can(t[2]); });
  var esJunta = TABS_JUNTA.some(function (j) { return j[0] === tab; });
  var permitido = esJunta ? juntaTabs.some(function (j) { return j[0] === tab; }) : can("web");
  var body;
  if (!permitido) body = h("div", { class: "notice" }, h("h3", { text: "Tu cargo no tiene acceso a esta sección" }),
    h("p", { class: "muted", text: (MI_CARGO ? "Tu cargo es «" + MI_CARGO + "». " : "") + (esJunta ? "Para gestionar cuentas y cargos hace falta el permiso «Cuentas y permisos»." : "Para editar el contenido de la web hace falta el permiso «Editar la web».") + " Si lo necesitas, pídeselo a quien gestiona las cuentas." }),
    h("div", { class: "form-acts" }, h("a", { class: "btn ghost small", href: "#admin-tareas", text: "Ir a las tareas de la directiva" })));
  else if (tab === "fotos") body = adminFotos();
  else if (tab === "contacto") body = adminContacto();
  else if (tab === "pie") body = adminPie();
  else if (tab === "socio") body = adminSocio();
  else if (tab === "escuela") body = adminEscuela();
  else if (tab === "personas") body = adminPersonas();
  else if (tab === "cargos") body = adminCargos();
  else if (tab === "tareas") body = adminTareas();
  else if (tab === "reuniones") body = adminReuniones();
  else body = adminCrud(tab);
  var permsTxt = PERMISOS_DEF.filter(function (p) { return can(p[0]); }).map(function (p) { return p[1].toLowerCase(); });
  return [head, h("section", { class: "block" }, h("div", { class: "wrap" },
    h("div", { class: "row-head" }, h("p", { class: "muted" }, "Sesión iniciada como " + ((SESSION.user && SESSION.user.email) || ""),
      MI_CARGO ? h("span", { class: "mi-cargo", text: " · " + MI_CARGO + (permsTxt.length ? " (" + permsTxt.join(", ") + ")" : " (directiva)") }) : null), logout),
    h("div", { class: "admin-navs" },
      can("web") ? h("div", { class: "admin-nav-group" }, h("span", { class: "ang-label", text: "Contenido de la web" }),
        h("nav", { class: "admin-tabs", "aria-label": "Contenido de la web" }, webTabs.map(function (t) {
          return h("a", { href: "#admin-" + t[0], class: "tab-" + t[0], "aria-current": t[0] === tab ? "page" : null, text: t[1] });
        }))) : null,
      h("div", { class: "admin-nav-group jcuentas" + (can("web") ? "" : " solo") }, h("span", { class: "ang-label", text: "Directiva" }),
        h("nav", { class: "admin-tabs", "aria-label": "Directiva" }, juntaTabs.map(function (t) {
          return h("a", { href: "#admin-" + t[0], class: "tab-" + t[0], "aria-current": t[0] === tab ? "page" : null, text: t[1] });
        }), h("a", { href: "#musicos-agenda", class: "tab-area", text: "🎼 Ir al Área de músicos" })))),
    body))];
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
/* Primera entrada con contraseña provisional: hay que elegir una propia */
function debeCambiarClave() { return !!(SESSION && SESSION.user && SESSION.user.user_metadata && SESSION.user.user_metadata.cambiar_clave); }
function cambiarClavePage() {
  var st = statusEl();
  var p1 = h("input", { id: "nc-1", type: "password", autocomplete: "new-password" });
  var p2 = h("input", { id: "nc-2", type: "password", autocomplete: "new-password" });
  var btn = h("button", { class: "btn primary", type: "submit", text: "Guardar mi contraseña" });
  var f = h("form", { class: "aform", style: "position:static;max-width:440px" }, h("h3", { text: "Elige tu contraseña" }),
    h("p", { class: "muted", text: "Has entrado con una contraseña provisional. Elige una tuya para seguir; la provisional dejará de valer." }),
    h("div", { class: "field" }, h("label", { for: "nc-1", text: "Contraseña nueva" }), p1, h("small", { text: "Mínimo 8 caracteres." })),
    h("div", { class: "field" }, h("label", { for: "nc-2", text: "Repítela" }), p2),
    h("div", { class: "form-acts" }, btn, h("button", { class: "btn ghost", type: "button", text: "Cerrar sesión", onclick: function () { SB.auth.signOut(); } })), st);
  f.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (p1.value.length < 8) { setStatus(st, "La contraseña debe tener al menos 8 caracteres.", false); return; }
    if (p1.value !== p2.value) { setStatus(st, "Las dos contraseñas no coinciden.", false); return; }
    btn.disabled = true;
    SB.auth.updateUser({ password: p1.value, data: { cambiar_clave: false } }).then(function (r) {
      if (r && r.error) throw r.error;
      if (r && r.data && r.data.user) SESSION.user = r.data.user; else if (SESSION.user.user_metadata) SESSION.user.user_metadata.cambiar_clave = false;
      render();
    }).catch(function (e) {
      btn.disabled = false;
      var m = (e && e.message) || "";
      setStatus(st, /different from the old|same/i.test(m) ? "Tiene que ser distinta de la provisional." : /weak|short|characters/i.test(m) ? "Esa contraseña es demasiado débil. Prueba con otra más larga." : "No se ha podido guardar. Inténtalo de nuevo.", false);
    });
  });
  return [pageHead("Bienvenido/a", "Elige tu contraseña", "Un último paso antes de entrar.", "negra"), h("section", { class: "block" }, h("div", { class: "wrap" }, f))];
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
    ["pasos", "Pasos para hacerse socio (uno por línea)", "textarea"],
    ["niveles", "Niveles de membresía (uno por línea: Nombre | Importe | Descripción)", "textarea"],
    ["ventajas", "Ventajas de Amigos y Mecenas (una por línea: Título | Descripción)", "textarea"],
    ["aviso", "Aviso final", "textarea"]];
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
  document.body.classList.toggle("in-area", r.page === "musicos");
  if (r.page !== "musicos" && AREA) AREA.verComo = null;
  var slot = document.getElementById("top-area"); if (slot && (r.page !== "musicos" || !SESSION)) slot.replaceChildren();
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
   ÁREA DE MÚSICOS
   Agenda con asistencia, ficha de cada evento, repertorio con las
   particellas de cada músico, avisos y perfil. La dirección sube las
   partituras y se reparten solas por instrumento y voz.
   ===================================================================== */
var INST = window.ASAM_INST;
var PRIV = { loaded: false, loading: false, anuncios: [], obras: [], partes: [], asist: {}, pase: {}, coments: {}, valor: {}, peticiones: [], error: "" };
var AREA = { abiertos: {}, editAnuncio: null, cuando: "proximos", tipo: "todos", semana: null, mesAbierto: false, dia: null,
  buscar: "", orden: "recientes", filtro: "todas", stage: null, valorando: null, nota: null };

var AREA_REAL_ADMIN = false;
function simulando() { return !!AREA.verComo && AREA_REAL_ADMIN; }
function simBlock() { return false; }
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
function norm(t) { return String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim(); }
function isDirectorM(m) { return !!m && /director/i.test(m.cargo || ""); }
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
function obraParaMi(o, m) {
  if (!m) return true;
  var f = o.formacion || "Banda y Bandín";
  return f === "Banda y Bandín" || m.formacion === "Banda y Bandín" || f === m.formacion;
}

/* ---------- Reparto de particellas ---------- */
function vocesTxt(v) { return (v || []).length ? (v.length > 1 ? v.join("-") : v[0] + "º") : ""; }
function parteNombre(p) {
  if (p.instrumento === "Guion") return "Guion (partitura general)";
  if (p.instrumento === "Todos") return p.etiqueta || "Para todos";
  return p.instrumento + (vocesTxt(p.voces) ? " " + vocesTxt(p.voces) : "");
}
function parteParaMusico(p, m) {
  if (!m) return false;
  if (p.instrumento === "Todos") return true;
  if (p.instrumento === "Guion") return isDirectorM(m);
  var mi = INST.canonical(m.instrumento), pf = INST.family(p.instrumento), mf = INST.family(m.instrumento);
  if (pf === "Percusión" && mf === "Percusión") {
    if (INST.canonical(m.instrumento) !== "Percusión" && INST.canonical(m.instrumento) !== p.instrumento && p.instrumento !== "Percusión") return false;
  } else if (mi !== p.instrumento) return false;
  var mv = INST.normVoz(m.voz), pv = p.voces || [];
  return !mv || !pv.length || pv.indexOf(mv) >= 0;
}
function misPartes(obraId, m) {
  m = m || myMusico();
  return PRIV.partes.filter(function (p) { return p.obra_id === obraId && parteParaMusico(p, m); }).sort(parteSort);
}
// Otras voces del mismo instrumento (por si alguien tiene que doblar)
function otrasVoces(obraId, m) {
  if (!m) return [];
  var mine = misPartes(obraId, m).map(function (p) { return p.id; });
  var mi = INST.canonical(m.instrumento);
  return PRIV.partes.filter(function (p) { return p.obra_id === obraId && p.instrumento === mi && mine.indexOf(p.id) < 0; }).sort(parteSort);
}
function destinatarios(p, obra) {
  return DATA.musicos.filter(function (m) { return (!obra || obraParaMi(obra, m)) && parteParaMusico(p, m); }).sort(musicianSort);
}
var INST_ORDER = ["Guion", "Flautín", "Flauta", "Oboe", "Corno inglés", "Fagot", "Requinto", "Clarinete", "Clarinete bajo", "Saxofón soprano", "Saxofón alto", "Saxofón tenor", "Saxofón barítono", "Trompa", "Fliscorno", "Trompeta", "Trombón", "Trombón bajo", "Bombardino", "Tuba", "Contrabajo", "Timbales", "Láminas", "Caja", "Bombo", "Platos", "Percusión", "Piano", "Guitarra", "Voz", "Todos"];
function parteSort(a, b) {
  var ia = INST_ORDER.indexOf(a.instrumento), ib = INST_ORDER.indexOf(b.instrumento);
  return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || String((a.voces || [])[0] || "").localeCompare(String((b.voces || [])[0] || ""));
}
function instEmoji(name) {
  var f = INST.family(name);
  return { "Flauta": "🪈", "Flautín": "🪈", "Clarinete": "🎷", "Requinto": "🎷", "Clarinete bajo": "🎷", "Oboe": "🎷", "Fagot": "🎷",
    "Saxofón soprano": "🎷", "Saxofón alto": "🎷", "Saxofón tenor": "🎷", "Saxofón barítono": "🎷", "Trompeta": "🎺", "Fliscorno": "🎺",
    "Trompa": "📯", "Trombón": "🎺", "Trombón bajo": "🎺", "Bombardino": "🎺", "Tuba": "🎺", "Percusión": "🥁", "Piano": "🎹",
    "Contrabajo": "🎻", "Guitarra": "🎸", "Guion": "📖", "Voz": "🎤" }[f] || "🎼";
}

/* ---------- Datos privados ---------- */
function optional(q) { return q.then(function (r) { return r && r.error ? { data: [] } : r; }, function () { return { data: [] }; }); }
function loadPrivate() {
  if (!SB || !SESSION) { PRIV = { loaded: false, loading: false, anuncios: [], obras: [], partes: [], asist: {}, pase: {}, coments: {}, valor: {}, peticiones: [], error: "" }; return Promise.resolve(); }
  PRIV.loading = true;
  return Promise.all([
    SB.from("interno").select("coleccion,id,datos"),
    SB.from("asistencias").select("evento_id,user_id,estado,motivo"),
    SB.from("pase_lista").select("evento_id,user_id,presente"),
    SB.from("comentarios").select("id,anuncio_id,user_id,autor,texto,creado").order("creado"),
    optional(SB.from("valoraciones").select("obra_id,user_id,estrellas")),
    optional(SB.from("peticiones").select("id,obra_id,user_id,autor,instrumento,voz,mensaje,creado").order("creado")),
    optional(SB.from("sugerencias").select("id,user_id,autor,anonima,categoria,texto,leida,creado").order("creado"))
  ]).then(function (r) {
    r.slice(0, 4).forEach(check);
    var an = [], ob = [], pa = [], prog = {};
    r[0].data.forEach(function (row) {
      var o = Object.assign({}, row.datos); o.id = row.id;
      if (row.coleccion === "anuncios") an.push(o);
      if (row.coleccion === "obras") ob.push(o);
      if (row.coleccion === "partes") pa.push(o);
      if (row.coleccion === "programas") prog[row.id] = (row.datos && row.datos.orden) || [];
    });
    var asist = {}; r[1].data.forEach(function (a) { (asist[a.evento_id] = asist[a.evento_id] || {})[a.user_id] = a; });
    var pase = {}; r[2].data.forEach(function (p) { (pase[p.evento_id] = pase[p.evento_id] || {})[p.user_id] = p.presente; });
    var com = {}; r[3].data.forEach(function (c) { (com[c.anuncio_id] = com[c.anuncio_id] || []).push(c); });
    var val = {}; (r[4].data || []).forEach(function (v) { (val[v.obra_id] = val[v.obra_id] || {})[v.user_id] = v.estrellas; });
    PRIV = { loaded: true, loading: false, anuncios: an, obras: ob, partes: pa, asist: asist, pase: pase, coments: com, valor: val, peticiones: r[5].data || [], sugerencias: r[6].data || [], programas: prog, error: "" };
  }, function (e) { PRIV.loading = false; PRIV.loaded = true; PRIV.error = (e && e.message) || "No se han podido cargar los datos."; });
}
function reloadPrivate() { return loadPrivate().then(render); }

function areaEvents() {
  var me = myMusico();
  return DATA.eventos.filter(function (e) { return IS_ADMIN || convocado(e, me); })
    .slice().sort(function (a, b) { return (a.fecha + (a.hora || "")) < (b.fecha + (b.hora || "")) ? -1 : 1; });
}
function myAnswer(evId) { return SESSION ? ((PRIV.asist[evId] || {})[SESSION.user.id] || null) : null; }
function obrasDeEvento(evId) {
  var orden = (PRIV.programas || {})[evId] || [];
  function pos(o) { var i = orden.indexOf(o.id); return i < 0 ? 999 : i; }
  return PRIV.obras.filter(function (o) { return (o.eventos || []).indexOf(evId) >= 0; })
    .sort(function (a, b) { return pos(a) - pos(b) || String(a.creado || "").localeCompare(String(b.creado || "")) || String(a.titulo).localeCompare(String(b.titulo)); });
}
function moverEnPrograma(evId, obras, i, d, btn) {
  var ids = obras.map(function (o) { return o.id; }), j = i + d;
  if (j < 0 || j >= ids.length) return;
  var t = ids[i]; ids[i] = ids[j]; ids[j] = t;
  if (btn) btn.disabled = true;
  SB.from("interno").upsert({ coleccion: "programas", id: evId, datos: { orden: ids } }).then(check).then(reloadPrivate, function (e) { if (btn) btn.disabled = false; alert2(btn, errMsg(e)); });
}
function eventosDeObra(o) { return (o.eventos || []).map(function (id) { return DATA.eventos.filter(function (e) { return e.id === id; })[0]; }).filter(Boolean).sort(function (a, b) { return a.fecha < b.fecha ? -1 : 1; }); }
function getObra(id) { return PRIV.obras.filter(function (o) { return o.id === id; })[0] || null; }
function getEvento(id) { return DATA.eventos.filter(function (e) { return e.id === id; })[0] || null; }

/* ---------- Iconos ---------- */
var ICONS = {
  agenda: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  repertorio: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V5.5l11-2.5v12.5"/><ellipse cx="6.5" cy="18" rx="2.6" ry="2"/><ellipse cx="17.5" cy="15.5" rx="2.6" ry="2"/></svg>',
  avisos: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></svg>',
  perfil: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.5" r="4"/><path d="M4.5 20.5c1.2-4 4.2-6 7.5-6s6.3 2 7.5 6"/></svg>',
  gestion: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9.5a2 2 0 0 0-2-2h-6.5L9.5 5H6a2 2 0 0 0-2 2.5z"/><path d="M12 11v6M9 14h6"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/></svg>',
  reloj: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
  ropa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3.5 4 6l1.5 4H8v10.5h8V10h2.5L20 6l-4-2.5c-.5 1.6-2 2.7-4 2.7S8.5 5.1 8 3.5z"/></svg>',
  nota: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5h14v10l-5 5H5z"/><path d="M14 19.5v-5h5M8.5 9h7M8.5 12.5h4"/></svg>',
  descarga: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/></svg>',
  pdf: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h8l4.5 4.5v12.5H6z"/><path d="M14 3.5V8h4.5"/><path d="M8.5 15.5c1.5-.2 4-1.6 4.8-4.4.3-1.1-.9-1.4-1.1-.4-.4 2.2 1.6 4.7 3.6 4.4.9-.1.6-1.2-.4-1.1-2.5.2-5.6 2.1-6.4 2.6-.8.5-.7-.9-.5-1.1z"/></svg>',
  atras: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  chev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
  izq: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
  der: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
  buscar: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg>',
  si: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  no: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/></svg>',
  duda: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 9.2a3 3 0 1 1 4.4 2.6c-.9.5-1.4 1.1-1.4 2.2M12 17.5v.5"/></svg>',
  calendario: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M12 13v5M9.5 15.5h5"/></svg>',
  grupo: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8.5" r="3.3"/><path d="M3 19.5c.8-3.3 3.2-5 6-5s5.2 1.7 6 5"/><circle cx="17" cy="9.5" r="2.6"/><path d="M15.5 14.6c2.6-.3 4.8 1.2 5.5 4.4"/></svg>',
  estrella: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.8l2.5 5.2 5.7.8-4.1 4 1 5.6L12 16.7l-5.1 2.7 1-5.6-4.1-4 5.7-.8z"/></svg>',
  subir: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M5 19.5h14"/></svg>',
  ojo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  sugerencias: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.2h5c0-.8.4-1.6 1.1-2.2A6 6 0 0 0 12 3z"/></svg>',
  ajustes: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M4.2 7.5l2.1 1.2M17.7 15.3l2.1 1.2M4.2 16.5l2.1-1.2M17.7 8.7l2.1-1.2"/><circle cx="12" cy="12" r="6.3"/></svg>'
};
function icon(name, cls) { return h("span", { class: "ico" + (cls ? " " + cls : ""), html: ICONS[name] || "" }); }

/* ---------- Avisos sin leer ---------- */
function vistoAvisos() { try { return localStorage.getItem("asam-avisos-visto") || ""; } catch (e) { return ""; } }
function marcarAvisosVistos() { try { localStorage.setItem("asam-avisos-visto", new Date().toISOString()); } catch (e) {} }
function novedades() {
  var me = myMusico(), visto = vistoAvisos(), hace = new Date(Date.now() - 45 * 864e5).toISOString();
  var out = [];
  PRIV.anuncios.forEach(function (a) { if ((IS_ADMIN || anuncioParaMi(a, me)) && a.creado) out.push({ tipo: "anuncio", fecha: a.creado, a: a }); });
  var porObra = {};
  PRIV.partes.forEach(function (p) {
    if (!p.creado || p.creado < hace) return;
    if (!IS_ADMIN && !parteParaMusico(p, me)) return;
    var o = getObra(p.obra_id); if (!o || (me && !obraParaMi(o, me))) return;
    if (!porObra[p.obra_id] || porObra[p.obra_id].fecha < p.creado) porObra[p.obra_id] = { tipo: "partitura", fecha: p.creado, o: o };
  });
  Object.keys(porObra).forEach(function (k) { out.push(porObra[k]); });
  out.sort(function (a, b) { return a.fecha < b.fecha ? 1 : -1; });
  out.forEach(function (n) { n.nuevo = !visto || n.fecha > visto; });
  return out;
}
function pendientes() {
  var me = myMusico(); if (!me) return [];
  var t = todayStr();
  return areaEvents().filter(function (e) { return e.fecha >= t && !myAnswer(e.id); });
}

/* ---------- Estructura de la página ---------- */
function areaTabs() {
  var t = [["agenda", "Agenda"], ["repertorio", "Repertorio"], ["avisos", "Avisos"], ["sugerencias", "Sugerencias"], ["perfil", "Perfil"]];
  if (can("musica")) t.splice(2, 0, ["gestion", "Partituras"]);
  return t;
}
PAGES.musicos = function (sub) {
  if (debeCambiarClave()) return cambiarClavePage();
  var wasAdmin = IS_ADMIN;
  AREA_REAL_ADMIN = wasAdmin;
  if (!wasAdmin) AREA.verComo = null;
  if (wasAdmin && AREA.verComo) IS_ADMIN = false;
  try { return musicosPage(sub); } finally { IS_ADMIN = wasAdmin; }
};
function musicosPage(sub) {
  var parts = String(sub || "").split("~"), tab = parts[0] || "agenda";
  if (tab === "inicio" || tab === "calendario") tab = "agenda";
  if (tab === "partituras") tab = "repertorio";
  if (tab === "anuncios") tab = "avisos";
  if (tab === "cuenta") tab = "perfil";
  if (!SB) return [pageHead("Área de músicos", "Acceso para músicos", null, "verde"), h("section", { class: "block" }, h("div", { class: "wrap" }, h("div", { class: "notice" }, h("h3", { text: "El área de músicos no está disponible" }))))];
  if (!SESSION) return [pageHead("Área de músicos", "Acceso para músicos", "Convocatorias, asistencia, partituras y avisos de la Banda y el Bandín.", "verde"),
    h("section", { class: "block" }, h("div", { class: "wrap" }, loginForm("Entrar al Área de músicos"),
      h("p", { class: "muted", style: "margin-top:14px;max-width:60ch", text: "Las cuentas las crea la junta. Si no tienes la tuya o has olvidado la contraseña, pídesela a un administrador." })))];
  if (!canArea()) {
    return [pageHead("Área de músicos", "Acceso para músicos", null, "verde"), h("section", { class: "block" }, h("div", { class: "wrap" }, h("div", { class: "notice" },
      h("h3", { text: "Esta cuenta no es de músico" }),
      h("p", { class: "muted", text: "Has entrado como " + ((SESSION.user && SESSION.user.email) || "usuario") + ". Pide a un administrador que te cree una cuenta de músico." }),
      h("div", { class: "form-acts" }, h("button", { class: "btn ghost small", type: "button", text: "Cerrar sesión", onclick: function () { SB.auth.signOut(); } })))))];
  }
  if (!PRIV.loaded) {
    if (!PRIV.loading) reloadPrivate();
    return [areaShell(tab, h("div", { class: "empty" }, h("p", { text: "Cargando…" })), [])];
  }
  var body, crumbs = [];
  if (tab === "evento") { var ev = getEvento(parts[1]); body = ev ? areaEvento(ev, parts[2] || "detalles") : notFound("Este evento ya no existe."); crumbs = [["agenda", "Agenda"], [null, ev ? ev.titulo : "Evento"]]; tab = "agenda"; }
  else if (tab === "obra") { var ob = getObra(parts[1]); body = ob ? areaObra(ob) : notFound("Esta obra ya no existe."); crumbs = [["repertorio", "Repertorio"], [null, ob ? ob.titulo : "Obra"]]; tab = "repertorio"; }
  else if (tab === "editar" && can("musica")) { var eo = parts[1] === "nueva" ? null : getObra(parts[1]); body = obraEditor(eo); crumbs = [["gestion", "Partituras"], [null, eo ? eo.titulo : "Nueva obra"]]; tab = "gestion"; }
  else if (tab === "repertorio") { body = areaRepertorio(); crumbs = [[null, "Repertorio"]]; }
  else if (tab === "avisos") { body = areaAvisos(); crumbs = [[null, "Avisos"]]; }
  else if (tab === "perfil") { body = areaPerfil(); crumbs = [[null, "Perfil"]]; }
  else if (tab === "gestion" && can("musica")) { body = areaGestion(); crumbs = [[null, "Partituras"]]; }
  else if (tab === "sugerencias") { body = areaSugerencias(); crumbs = [[null, "Sugerencias"]]; }
  else { tab = "agenda"; body = areaAgenda(); crumbs = [[null, "Agenda"]]; }
  return [areaShell(tab, body, crumbs)];
}
function notFound(msg) { return h("div", { class: "empty" }, h("p", { text: msg })); }
function areaShell(tab, body, crumbs) {
  var me = myMusico(), nov = PRIV.loaded ? novedades().filter(function (n) { return n.nuevo; }).length : 0;
  var pend = PRIV.loaded ? pendientes().length : 0;
  var verBtn = AREA_REAL_ADMIN ? h("button", { type: "button", class: "ver-como" + (simulando() ? " on" : ""), "aria-pressed": simulando() ? "true" : "false",
    title: simulando() ? "Volver a la vista de administración" : "Ver el área tal como la ve un músico", onclick: function () { AREA.verComo = simulando() ? null : true; AREA.stage = null; render(); } },
    icon("ojo"), h("span", { text: simulando() ? "Salir de la vista de músico" : "Ver como músico" })) : null;
  var top = h("div", { class: "top-area-in" },
    h("nav", { class: "crumbs", "aria-label": "Estás en" }, h("a", { class: "crumb-root", href: "#musicos-agenda", text: "Área de músicos" }),
      crumbs.map(function (c) { return [h("span", { class: "sep", "aria-hidden": "true", text: "›" }), c[0] ? h("a", { href: "#musicos-" + c[0], text: c[1] }) : h("span", { class: "here", text: c[1] })]; })),
    verBtn,
    AREA_REAL_ADMIN && !simulando() ? h("a", { class: "adm-btn", href: "#admin", title: "Panel de administración" }, icon("ajustes"), h("span", { text: "Administración" })) : null,
    h("a", { class: "area-user", href: "#musicos-perfil", title: "Tu perfil" },
      h("span", { class: "u-txt" }, h("b", { text: displayName() }), h("small", { text: me ? [me.instrumento + (me.voz ? " " + vocesTxt([INST.normVoz(me.voz)]) : ""), me.formacion].filter(Boolean).join(" · ") : "Administración" })),
      me ? personAvatar(me, "azul", "u-av") : h("span", { class: "u-av", text: initials(displayName()) })));
  var slot = document.getElementById("top-area"); if (slot) slot.replaceChildren(top);
  return h("section", { class: "area-app" + (simulando() ? " simulating" : "") },
    h("nav", { class: "area-tabs", "aria-label": "Secciones del área de músicos" }, h("div", { class: "wrap" }, areaTabs().map(function (t) {
      var badge = t[0] === "avisos" ? nov : t[0] === "agenda" ? pend : t[0] === "gestion" ? PRIV.peticiones.length
        : (t[0] === "sugerencias" && IS_ADMIN ? (PRIV.sugerencias || []).filter(function (x) { return !x.leida; }).length : 0);
      return h("a", { href: "#musicos-" + t[0], "aria-current": t[0] === tab ? "page" : null },
        icon(t[0]), h("span", { class: "t-label", text: t[1] }), badge ? h("span", { class: "badge-n", "aria-label": badge + " pendientes", text: badge > 99 ? "99+" : String(badge) }) : null);
    }))),
    h("div", { class: "area-main" }, h("div", { class: "wrap" }, PRIV.error ? h("p", { class: "status err", text: PRIV.error }) : null,
      simulando() ? h("div", { class: "sim-banner" }, icon("ojo"), h("span", { text: "Estás viendo el área como la ve un músico, sin las herramientas de administración." + (me ? "" : " Completa tu ficha de músico en Perfil para ver también tus convocatorias y partituras.") }),
        h("button", { type: "button", class: "btn small", text: "Volver a mi vista", onclick: function () { AREA.verComo = null; render(); } })) : null,
      IS_ADMIN && !me && !simulando() && tab !== "perfil" ? h("a", { class: "ag-pend admin-mus", href: "#musicos-perfil" }, icon("perfil"), "Para contar como un músico más (responder convocatorias, salir en la lista y recibir tus partituras), completa tu perfil de músico →") : null,
      body)));
}

/* =====================================================================
   AGENDA
   ===================================================================== */
var DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
var DIAS_LARGO = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
function dateOf(s) { var p = parseDate(s); return p ? new Date(p.y, p.m - 1, p.d) : null; }
function isoOf(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
function mondayOf(d) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); var wd = (x.getDay() + 6) % 7; return addDays(x, -wd); }
function tipoGrupo(e) { var t = norm(e.tipo || "concierto"); return t === "ensayo" ? "ensayos" : (t === "concierto" || t === "actuacion" || t === "pasacalles") ? "actuaciones" : "otros"; }
function fechaLarga(e) {
  var d = dateOf(e.fecha); if (!d) return "";
  var s = DIAS_LARGO[d.getDay()] + ", " + fmtLong(e.fecha).replace(/ de \d{4}$/, "");
  if (d.getFullYear() !== new Date().getFullYear()) s += " de " + d.getFullYear();
  return s + (e.hora ? " a las " + e.hora : "");
}
function semanaLabel(mon) {
  var hoyMon = mondayOf(new Date()), diff = Math.round((mon - hoyMon) / (7 * 864e5));
  if (diff === 0) return "Esta semana";
  if (diff === 1) return "Próxima semana";
  if (diff === -1) return "Semana pasada";
  var sun = addDays(mon, 6);
  return mon.getDate() + (mon.getMonth() !== sun.getMonth() ? " " + MESES[mon.getMonth()] : "") + " – " + sun.getDate() + " " + MESES[sun.getMonth()];
}
function rangoCorto(mon) { var sun = addDays(mon, 6); return mon.getDate() + (mon.getMonth() !== sun.getMonth() ? " " + MES_CORTO[mon.getMonth()] : "") + " – " + sun.getDate() + " " + MES_CORTO[sun.getMonth()]; }

function areaAgenda() {
  var t = todayStr(), all = areaEvents();
  if (!AREA.semana) AREA.semana = isoOf(mondayOf(new Date()));
  var list = all.filter(function (e) { return AREA.cuando === "proximos" ? e.fecha >= t : e.fecha < t; });
  if (AREA.cuando !== "proximos") list.reverse();
  if (AREA.tipo !== "todos") list = list.filter(function (e) { return tipoGrupo(e) === AREA.tipo; });
  var counts = { todos: 0, actuaciones: 0, ensayos: 0, otros: 0 };
  all.filter(function (e) { return AREA.cuando === "proximos" ? e.fecha >= t : e.fecha < t; }).forEach(function (e) { counts.todos++; counts[tipoGrupo(e)]++; });

  // Agrupar por semanas
  var groups = [], map = {};
  list.forEach(function (e) {
    var d = dateOf(e.fecha); if (!d) return;
    var k = isoOf(mondayOf(d));
    if (!map[k]) { map[k] = { mon: mondayOf(d), items: [] }; groups.push(map[k]); }
    map[k].items.push(e);
  });
  var pend = pendientes();
  var main = h("div", { class: "agenda" },
    h("div", { class: "ag-head" },
      h("h1", { text: "Agenda" }),
      can("musica") ? h("button", { type: "button", class: "btn primary small ag-new", "aria-expanded": AREA.nuevoEvento ? "true" : "false", onclick: function () { AREA.nuevoEvento = !AREA.nuevoEvento; render(); } }, AREA.nuevoEvento ? "Cerrar" : "+ Nuevo evento") : null,
      h("div", { class: "seg", role: "tablist", "aria-label": "Qué eventos ver" }, [["anteriores", "Anteriores"], ["proximos", "Próximos"]].map(function (o) {
        return h("button", { type: "button", role: "tab", "aria-selected": AREA.cuando === o[0] ? "true" : "false", text: o[1], onclick: function () { AREA.cuando = o[0]; AREA.dia = null; render(); } });
      }))),
    flashAgenda(),
    simulando() ? null : pushBanner(),
    can("musica") && AREA.nuevoEvento ? eventoForm() : null,
    weekStrip(all),
    h("div", { class: "chips", role: "group", "aria-label": "Filtrar por tipo" }, [["todos", "Todos"], ["actuaciones", "Actuaciones"], ["ensayos", "Ensayos"], ["otros", "Otros"]].map(function (o) {
      return h("button", { type: "button", class: "chip", "aria-pressed": AREA.tipo === o[0] ? "true" : "false", onclick: function () { AREA.tipo = o[0]; render(); } },
        o[1], counts[o[0]] ? h("span", { class: "chip-n", text: String(counts[o[0]]) }) : null);
    })),
    pend.length && AREA.cuando === "proximos" ? h("p", { class: "ag-pend" }, icon("duda"), pend.length === 1 ? "Tienes 1 convocatoria sin responder." : "Tienes " + pend.length + " convocatorias sin responder.") : null,

    groups.length ? groups.map(function (g) {
      return h("div", { class: "ag-week" },
        h("div", { class: "ag-week-h" }, h("span", { text: semanaLabel(g.mon).toUpperCase() }), h("span", { class: "rng", text: rangoCorto(g.mon) })),
        g.items.map(function (e) { return eventCard(e, AREA.cuando !== "proximos"); }));
    }) : h("div", { class: "empty" }, h("p", { text: AREA.cuando === "proximos" ? "No hay convocatorias próximas." : "No hay eventos anteriores." })));
  return h("div", { class: "ag-layout" }, h("aside", { class: "ag-side", "aria-label": "Avisos" }, avisosSide()), main);
}
function flashAgenda() {
  if (!FLASH || FLASH.col !== "agenda") return null;
  var el = h("p", { class: "status ok", role: "status", text: FLASH.msg }); FLASH = null; return el;
}
/* Avisos en la columna izquierda de la agenda (solo en pantallas anchas) */
function avisosSide() {
  var me = myMusico(), nov = novedades();
  var anuncios = PRIV.anuncios.filter(function (a) { return IS_ADMIN || anuncioParaMi(a, me); })
    .sort(function (a, b) { return (b.creado || "") < (a.creado || "") ? -1 : 1; }).slice(0, 4);
  var obras = nov.filter(function (n) { return n.tipo === "partitura"; }).slice(0, 3);
  return h("div", { class: "side-box" },
    h("div", { class: "side-h" }, h("h2", null, icon("avisos"), "Avisos"), h("a", { href: "#musicos-avisos", text: "Ver todos" })),
    obras.length ? h("div", { class: "side-group" }, h("h3", { text: "Partituras nuevas" }), obras.map(function (n) {
      return h("a", { class: "side-item" + (n.nuevo ? " nuevo" : ""), href: "#musicos-obra~" + n.o.id }, obraCover(n.o, "xs"),
        h("span", null, h("b", { text: n.o.titulo }), h("small", { text: fmtLong(String(n.fecha).slice(0, 10)) })));
    })) : null,
    h("div", { class: "side-group" }, h("h3", { text: "Anuncios" }),
      anuncios.length ? anuncios.map(function (a) {
        var nuevo = nov.some(function (n) { return n.a === a && n.nuevo; }), ncom = (PRIV.coments[a.id] || []).length;
        return h("a", { class: "side-item an" + (nuevo ? " nuevo" : ""), href: "#musicos-avisos" },
          h("span", null, h("b", { text: a.titulo }), a.texto ? h("p", { text: excerpt(a.texto, 110) }) : null,
            h("small", { text: (a.creado ? fmtLong(String(a.creado).slice(0, 10)) : "") + (ncom ? " · " + ncom + (ncom === 1 ? " comentario" : " comentarios") : "") })));
      }) : h("p", { class: "muted small", text: "Todavía no hay anuncios." })),
    IS_ADMIN ? h("a", { class: "btn ghost small", href: "#musicos-avisos", text: "+ Publicar un anuncio" }) : null);
}

/* ---------- Crear eventos desde la agenda (también ensayos que se repiten) ---------- */
var DIAS_SEM = [["1", "L"], ["2", "M"], ["3", "X"], ["4", "J"], ["5", "V"], ["6", "S"], ["0", "D"]];
function fechasSerie(f) {
  var start = dateOf(f.fecha); if (!start) return [];
  if (f.repetir === "no") return [f.fecha];
  var hasta = dateOf(f.hasta) || addDays(start, 90), out = [];
  var dias = f.dias.length ? f.dias : [String(start.getDay())];
  var step = f.repetir === "quincenal" ? 14 : 7;
  for (var w = mondayOf(start); w <= hasta && out.length < 150; w = addDays(w, step)) {
    for (var i = 0; i < 7; i++) {
      var d = addDays(w, i);
      if (d < start || d > hasta) continue;
      if (dias.indexOf(String(d.getDay())) >= 0) out.push(isoOf(d));
    }
  }
  return out.sort();
}
/* =====================================================================
   NOTIFICACIONES AL MÓVIL (Web Push)
   ===================================================================== */
var VAPID_PUBLIC = "BEeqQDyQujh58-ZCDyauAz2q5YzHHvvA8YFQCriqLHT643pmVBlIwRwHnga8wlKzXUvDbMnm2UlEzY4G_6atIbA";
var PUSH = { estado: null, ocupado: false, msg: "", ok: true };
function esIOS() { return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); }
function instalada() { return (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true; }
function swReg() {
  if (!("serviceWorker" in navigator)) return Promise.reject(new Error("sin service worker"));
  return navigator.serviceWorker.register("sw.js").then(function () { return navigator.serviceWorker.ready; });
}
function b64uToBytes(s) { var b = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
// "nosoporta" | "ios-instalar" | "bloqueado" | "activo" | "inactivo"
function comprobarPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    PUSH.estado = esIOS() && !instalada() ? "ios-instalar" : "nosoporta"; return Promise.resolve(PUSH.estado);
  }
  if (Notification.permission === "denied") { PUSH.estado = "bloqueado"; return Promise.resolve(PUSH.estado); }
  return swReg().then(function (reg) { return reg.pushManager.getSubscription(); })
    .then(function (sub) { PUSH.estado = sub && Notification.permission === "granted" ? "activo" : "inactivo"; return PUSH.estado; },
      function () { PUSH.estado = "nosoporta"; return PUSH.estado; });
}
function activarPush() {
  PUSH.ocupado = true; PUSH.msg = ""; render();
  return Notification.requestPermission().then(function (perm) {
    if (perm !== "granted") throw new Error(perm === "denied" ? "bloqueado" : "Has cerrado el permiso sin aceptarlo.");
    return swReg();
  }).then(function (reg) {
    return reg.pushManager.getSubscription().then(function (old) {
      return old || reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64uToBytes(VAPID_PUBLIC) });
    });
  }).then(function (sub) {
    var j = sub.toJSON();
    return SB.rpc("registrar_push", { p_endpoint: j.endpoint, p_p256dh: j.keys.p256dh, p_auth: j.keys.auth, p_dispositivo: navigator.userAgent.slice(0, 200) }).then(check);
  }).then(function () {
    PUSH.estado = "activo"; PUSH.ok = true; PUSH.msg = "¡Listo! Te avisaremos en este móvil de las convocatorias y los avisos.";
    try { localStorage.setItem("asam-push-oculto", "1"); } catch (e) {}
  }).catch(function (e) {
    PUSH.ok = false;
    if (e && e.message === "bloqueado") { PUSH.estado = "bloqueado"; PUSH.msg = ""; }
    else PUSH.msg = (e && e.message && !/registrar_push|function/i.test(e.message)) ? e.message : "No se han podido activar los avisos. Inténtalo de nuevo.";
  }).then(function () { PUSH.ocupado = false; render(); });
}
function desactivarPush() {
  PUSH.ocupado = true; render();
  return swReg().then(function (reg) { return reg.pushManager.getSubscription(); }).then(function (sub) {
    if (!sub) return;
    var ep = sub.endpoint;
    return sub.unsubscribe().then(function () { return SB.from("push_suscripciones").delete().eq("endpoint", ep); });
  }).then(function () { PUSH.estado = "inactivo"; PUSH.ok = true; PUSH.msg = "Avisos desactivados en este móvil."; }, function () { PUSH.ok = false; PUSH.msg = "No se han podido desactivar."; })
    .then(function () { PUSH.ocupado = false; render(); });
}
function avisosFn(body) {
  return SB.functions.invoke("avisos", { body: body }).then(function (r) {
    if (!r.error) return r.data;
    var ctx = r.error.context, fb = "No se ha podido enviar la notificación.";
    if (ctx && typeof ctx.json === "function") return ctx.json().then(function (j) { throw new Error((j && j.error) || fb); }, function () { throw new Error(fb); });
    throw new Error(fb);
  });
}
function probarPush() {
  PUSH.ocupado = true; render();
  avisosFn({ action: "prueba" }).then(function (d) {
    PUSH.ok = !!(d && d.enviados); PUSH.msg = d && d.enviados ? "Notificación de prueba enviada. Debería llegarte en unos segundos." : "No hay ningún móvil tuyo con los avisos activados.";
  }, function (e) { PUSH.ok = false; PUSH.msg = e.message; }).then(function () { PUSH.ocupado = false; render(); });
}
// Tarjeta para activar los avisos (perfil y aviso en la agenda)
function pushCard(compacta) {
  if (PUSH.estado === null) { comprobarPush().then(function () { render(); }); return null; }
  var st = PUSH.estado, body;
  var msg = PUSH.msg ? h("p", { class: "status " + (PUSH.ok ? "ok" : "err"), role: "status", text: PUSH.msg }) : null;
  if (st === "activo") {
    if (compacta) return null;
    body = [h("p", null, "✅ Los avisos están ", h("b", { text: "activados en este móvil" }), ". Te llegará una notificación cuando te convoquen a un evento o haya un aviso nuevo."),
      h("div", { class: "form-acts" }, h("button", { class: "btn ghost small", type: "button", disabled: PUSH.ocupado || null, text: "Enviarme una prueba", onclick: probarPush }),
        h("button", { class: "btn ghost small", type: "button", disabled: PUSH.ocupado || null, text: "Desactivar en este móvil", onclick: desactivarPush }))];
  } else if (st === "inactivo") {
    body = [h("p", { text: "Recibe en el móvil las convocatorias nuevas y los avisos de la banda, aunque tengas la web cerrada." }),
      h("div", { class: "form-acts" }, h("button", { class: "btn primary small", type: "button", disabled: PUSH.ocupado || null, text: PUSH.ocupado ? "Activando…" : "🔔 Activar avisos en este móvil", onclick: activarPush }),
        compacta ? h("button", { class: "btn ghost small", type: "button", text: "Ahora no", onclick: function () { try { localStorage.setItem("asam-push-oculto", "1"); } catch (e) {} render(); } }) : null)];
  } else if (st === "ios-instalar") {
    body = [h("p", { text: "En iPhone, los avisos solo funcionan si añades la web a la pantalla de inicio:" }),
      h("ol", { class: "ios-pasos" }, h("li", null, "Ábrela en ", h("b", { text: "Safari" }), " y pulsa el botón ", h("b", { text: "Compartir" }), " (el cuadrado con la flecha hacia arriba)."),
        h("li", null, "Elige ", h("b", { text: "«Añadir a pantalla de inicio»" }), "."),
        h("li", null, "Abre la web desde el icono nuevo, entra con tu usuario y vuelve aquí para activar los avisos.")),
      h("small", { class: "muted", text: "Hace falta iOS 16.4 o posterior." }),
      compacta ? h("div", { class: "form-acts" }, h("button", { class: "btn ghost small", type: "button", text: "Ahora no", onclick: function () { try { localStorage.setItem("asam-push-oculto", "1"); } catch (e) {} render(); } })) : null];
  } else if (st === "bloqueado") {
    if (compacta) return null;
    body = [h("p", { text: "Has bloqueado las notificaciones de esta web. Para activarlas, ve a los ajustes del navegador (el candado junto a la dirección → Notificaciones → Permitir) y vuelve a cargar la página." })];
  } else {
    if (compacta) return null;
    body = [h("p", { class: "muted", text: "Este navegador no permite notificaciones. Prueba con Chrome en Android o con la web añadida a la pantalla de inicio en iPhone." })];
  }
  return h("section", { class: "push-card" + (compacta ? " compacta" : "") }, h("h3", null, icon("avisos"), h("span", { text: "Avisos en el móvil" })), body, msg);
}
function pushBanner() {
  var oculto = false; try { oculto = localStorage.getItem("asam-push-oculto") === "1"; } catch (e) {}
  if (oculto) return null;
  return pushCard(true);
}
function eventoForm() {
  if (!AREA.evForm) AREA.evForm = { titulo: "Ensayo", tipo: "Ensayo", fecha: todayStr(), hora: "", hora_fin: "", lugar: "", direccion: "", formacion: "Banda", publico: "no", indumentaria: "", notas: "", repetir: "no", hasta: isoOf(addDays(new Date(), 90)), dias: [], obras: [] };
  var F = AREA.evForm, st = statusEl();
  function field(id, k, label, type, ph, opts) {
    var el;
    if (opts) { el = h("select", { id: id }, opts.map(function (o) { return h("option", { value: o[0], text: o[1], selected: F[k] === o[0] || null }); })); }
    else if (type === "textarea") el = h("textarea", { id: id, placeholder: ph || null });
    else el = h("input", { id: id, type: type || "text", placeholder: ph || null });
    if (!opts) el.value = F[k] || "";
    el.addEventListener(opts ? "change" : "input", function () {
      F[k] = el.value;
      if (k === "tipo") { F.publico = el.value === "Ensayo" ? "no" : "si"; if (!F.titulo || /^(Ensayo|Concierto|Actuación|Pasacalles)$/.test(F.titulo)) F.titulo = el.value; render(); }
      if (k === "repetir" || k === "fecha" || k === "hasta") render();
    });
    return h("div", { class: "field" }, h("label", { for: id, text: label }), el);
  }
  var fechas = fechasSerie(F);
  var diasBox = F.repetir !== "no" ? h("div", { class: "field" }, h("span", { class: "flabel", text: "Días" }),
    h("div", { class: "dias" }, DIAS_SEM.map(function (d) {
      var start = dateOf(F.fecha), on = F.dias.length ? F.dias.indexOf(d[0]) >= 0 : (start && String(start.getDay()) === d[0]);
      return h("button", { type: "button", class: "dia", "aria-pressed": on ? "true" : "false", "aria-label": DIAS_LARGO[+d[0]], text: d[1], onclick: function () {
        if (!F.dias.length && start) F.dias = [String(start.getDay())];
        var i = F.dias.indexOf(d[0]); if (i >= 0) F.dias.splice(i, 1); else F.dias.push(d[0]); render(); } });
    }))) : null;
  var btn = h("button", { class: "btn primary", type: "submit", text: fechas.length > 1 ? "Crear " + fechas.length + " eventos" : "Crear evento" });
  var form = h("form", { class: "ev-form", novalidate: true },
    h("h2", { text: "Nuevo evento" }),
    h("div", { class: "grid3" },
      field("nf-tipo", "tipo", "Tipo", null, null, [["Ensayo", "Ensayo"], ["Concierto", "Concierto"], ["Actuación", "Actuación"], ["Pasacalles", "Pasacalles"], ["Otro", "Otro"]]),
      field("nf-titulo", "titulo", "Título *", "text", "Ensayo general"),
      field("nf-form", "formacion", "Convocatoria", null, null, [["Banda", "Banda"], ["Bandín", "Bandín"], ["Banda y Bandín", "Banda y Bandín"], ["Escuela", "Escuela"], ["Asociación", "Toda la asociación"]])),
    h("div", { class: "grid3" },
      field("nf-fecha", "fecha", F.repetir === "no" ? "Fecha *" : "Primer día *", "date"),
      field("nf-hora", "hora", "Hora", "time"),
      field("nf-fin", "hora_fin", "Hora de fin", "time")),
    h("div", { class: "grid3" },
      field("nf-rep", "repetir", "¿Se repite?", null, null, [["no", "No, es un solo día"], ["semanal", "Cada semana"], ["quincenal", "Cada dos semanas"]]),
      F.repetir !== "no" ? field("nf-hasta", "hasta", "Hasta el", "date") : h("span"),
      diasBox || h("span")),
    F.repetir !== "no" ? h("p", { class: "serie-info" + (fechas.length ? "" : " warn") }, fechas.length ? "Se crearán " + fechas.length + " eventos: del " + fmtLong(fechas[0]) + " al " + fmtLong(fechas[fechas.length - 1]) + "." : "Con estas fechas no sale ningún día.") : null,
    h("div", { class: "grid2" }, field("nf-lugar", "lugar", "Lugar", "text", "Casa de la Música"), field("nf-dir", "direccion", "Dirección para el mapa", "text", "Opcional")),
    h("div", { class: "grid2" },
      field("nf-pub", "publico", "¿Dónde se ve?", null, null, [["no", "Solo en el Área de músicos"], ["si", "También en la web pública"]]),
      field("nf-ind", "indumentaria", "Indumentaria", "text", "Opcional")),
    field("nf-notas", "notas", "Indicaciones para los músicos", "textarea", "Hora de llegada, atriles, partituras…"),
    h("div", { class: "field" }, h("span", { class: "flabel", text: "Obras que se tocan" }),
      PRIV.obras.length ? h("div", { class: "obra-picks" }, PRIV.obras.slice().sort(function (a, b) { return String(a.titulo).localeCompare(String(b.titulo), "es"); }).map(function (o) {
        var on = F.obras.indexOf(o.id) >= 0;
        return h("button", { type: "button", class: "obra-pick", "aria-pressed": on ? "true" : "false", onclick: function () {
          var i = F.obras.indexOf(o.id); if (i >= 0) F.obras.splice(i, 1); else F.obras.push(o.id); render(); } },
          obraCover(o, "xs"), h("span", null, h("b", { text: o.titulo }), o.compositor ? h("small", { text: o.compositor }) : null), h("i", { class: "pick-mark", text: on ? "✓" : "+" }));
      })) : h("p", { class: "muted small" }, "Todavía no hay obras. ", h("a", { href: "#musicos-editar~nueva", text: "Crea la primera en Partituras" }), "."),
      F.obras.length ? h("small", { text: F.obras.length + (F.obras.length === 1 ? " obra elegida" : " obras elegidas") + (fechas.length > 1 ? " (se añaden a los " + fechas.length + " eventos)" : "") + ". El orden se cambia luego en la pestaña Repertorio del evento." }) : null),
    h("label", { class: "check notif-check", for: "nf-avisar" }, (function () { var cb = h("input", { type: "checkbox", id: "nf-avisar", checked: F.avisar !== false || null }); cb.addEventListener("change", function () { F.avisar = cb.checked; }); return cb; })(),
      h("span", null, h("b", { text: "🔔 Avisar al móvil a los convocados" }), h("small", { text: " Les llega una notificación a quienes tengan los avisos activados." }))),
    h("div", { class: "form-acts" }, btn, h("button", { class: "btn ghost", type: "button", text: "Cancelar", onclick: function () { AREA.nuevoEvento = false; AREA.evForm = null; render(); } })), st);
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!String(F.titulo || "").trim()) { setStatus(st, "Escribe el título.", false); return; }
    if (!fechas.length) { setStatus(st, "Revisa las fechas: no sale ningún día.", false); return; }
    btn.disabled = true; btn.textContent = "Creando…";
    var serie = fechas.length > 1 ? newId() : null;
    var base = { titulo: F.titulo.trim(), tipo: F.tipo, hora: F.hora, hora_fin: F.hora_fin, lugar: F.lugar.trim(), direccion: F.direccion.trim(), formacion: F.formacion, publico: F.publico, indumentaria: F.indumentaria.trim(), notas: F.notas.trim(), descripcion: "" };
    var rows = fechas.map(function (d) { var o = Object.assign({}, base, { fecha: d }); if (serie) o.serie = serie; return { coleccion: "eventos", id: newId(), datos: o }; });
    var newIds = rows.map(function (r) { return r.id; });
    SB.from("contenido").insert(rows).then(check).then(function () {
      return F.obras.reduce(function (p, oid) {
        var o = getObra(oid); if (!o) return p;
        var datos = Object.assign({}, o); delete datos.id;
        datos.eventos = (o.eventos || []).concat(newIds);
        return p.then(function () { return SB.from("interno").upsert({ coleccion: "obras", id: oid, datos: datos }).then(check); });
      }, Promise.resolve());
    }).then(function () {
      FLASH = { col: "agenda", msg: (fechas.length > 1 ? "Creados " + fechas.length + " eventos «" + base.titulo + "»" : "Evento creado") + (F.obras.length ? " con " + F.obras.length + (F.obras.length === 1 ? " obra." : " obras.") : ".") };
      if (F.avisar !== false) {
        var flashRef = FLASH;
        avisosFn({ action: "evento", ids: newIds }).then(function (d) {
          flashRef.msg += d && d.enviados ? " 🔔 Notificación enviada a " + d.personas + (d.personas === 1 ? " músico." : " músicos.") : " (Nadie de los convocados tiene todavía los avisos del móvil activados.)";
          var el = document.querySelector(".agenda .status.ok"); if (el) el.textContent = flashRef.msg;
        }, function (e) { var el = document.querySelector(".agenda .status.ok"); if (el) el.textContent = flashRef.msg + " (No se ha podido avisar al móvil: " + e.message + ")"; });
      }
      if (F.obras.length) PRIV.loaded = false;
      AREA.nuevoEvento = false; AREA.evForm = null;
      return loadAll();
    }).then(render, function (e) { btn.disabled = false; btn.textContent = "Crear evento"; setStatus(st, errMsg(e), false); });
  });
  return form;
}

function weekStrip(all) {
  var mon = dateOf(AREA.semana) || mondayOf(new Date()), t = todayStr();
  var byDay = {}; all.forEach(function (e) { (byDay[e.fecha] = byDay[e.fecha] || []).push(e); });
  function dayBtn(d, outMonth) {
    var iso = isoOf(d), evs = byDay[iso] || [];
    return h("button", { type: "button", class: "wd" + (iso === t ? " today" : "") + (AREA.dia === iso ? " sel" : "") + (outMonth ? " out" : "") + (evs.length ? " has" : ""),
      "aria-label": fmtLong(iso) + (evs.length ? ", " + evs.length + (evs.length === 1 ? " evento" : " eventos") : ""),
      onclick: function () { selectDay(iso, all); } },
      h("b", { text: String(d.getDate()) }),
      h("span", { class: "dots" }, evs.slice(0, 3).map(function (e) { return h("i", { class: "dot-" + tipoGrupo(e) }); })));
  }
  var strip = h("div", { class: "week-strip" });
  var nav = h("div", { class: "ws-nav" },
    h("button", { type: "button", class: "ico-btn", "aria-label": AREA.mesAbierto ? "Mes anterior" : "Semana anterior", onclick: function () { AREA.semana = isoOf(AREA.mesAbierto ? mondayOf(new Date(addDays(mon, 3).getFullYear(), addDays(mon, 3).getMonth() - 1, 8)) : addDays(mon, -7)); render(); } }, icon("izq")),
    h("button", { type: "button", class: "ws-month", "aria-expanded": AREA.mesAbierto ? "true" : "false", onclick: function () { AREA.mesAbierto = !AREA.mesAbierto; render(); } },
      h("span", { text: MESES[addDays(mon, 3).getMonth()].replace(/^./, function (c) { return c.toUpperCase(); }) + " " + addDays(mon, 3).getFullYear() }), icon("chev", AREA.mesAbierto ? "flip" : "")),
    h("button", { type: "button", class: "ico-btn", "aria-label": AREA.mesAbierto ? "Mes siguiente" : "Semana siguiente", onclick: function () { AREA.semana = isoOf(AREA.mesAbierto ? mondayOf(new Date(addDays(mon, 3).getFullYear(), addDays(mon, 3).getMonth() + 1, 8)) : addDays(mon, 7)); render(); } }, icon("der")),
    h("button", { type: "button", class: "btn ghost small ws-hoy", text: "Hoy", onclick: function () { AREA.semana = isoOf(mondayOf(new Date())); AREA.dia = null; render(); } }));
  add(strip, nav, h("div", { class: "wd-head" }, DIAS.map(function (d) { return h("span", { text: d }); })));
  if (!AREA.mesAbierto) {
    add(strip, h("div", { class: "wd-row" }, [0, 1, 2, 3, 4, 5, 6].map(function (i) { return dayBtn(addDays(mon, i)); })));
  } else {
    var ref = addDays(mon, 3), first = new Date(ref.getFullYear(), ref.getMonth(), 1), start = mondayOf(first);
    var rows = h("div", { class: "wd-month" });
    for (var w = 0; w < 6; w++) {
      var rowStart = addDays(start, w * 7);
      if (w > 3 && rowStart.getMonth() !== ref.getMonth()) break;
      add(rows, h("div", { class: "wd-row" }, [0, 1, 2, 3, 4, 5, 6].map(function (i) { var d = addDays(rowStart, i); return dayBtn(d, d.getMonth() !== ref.getMonth()); })));
    }
    add(strip, rows);
  }
  return strip;
}
function selectDay(iso, all) {
  AREA.dia = AREA.dia === iso ? null : iso;
  if (AREA.dia) {
    AREA.cuando = iso >= todayStr() ? "proximos" : "anteriores";
    AREA.tipo = "todos";
    AREA.semana = isoOf(mondayOf(dateOf(iso)));
  }
  render();
  if (!AREA.dia) return;
  var list = all.filter(function (e) { return AREA.cuando === "proximos" ? e.fecha >= iso : e.fecha <= iso; });
  var target = AREA.cuando === "proximos" ? list[0] : list[list.length - 1];
  setTimeout(function () {
    var el = target && document.getElementById("ev-" + target.id);
    if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.classList.add("flash"); setTimeout(function () { el.classList.remove("flash"); }, 1600); }
  }, 30);
}

var ESTADOS = { si: "Asistiré", no: "No asistiré", duda: "Duda" };
var ESTADO_CORTO = { si: "Iré", no: "No iré", duda: "Duda" };
function confirmados(e) {
  var a = PRIV.asist[e.id] || {};
  return DATA.musicos.filter(function (m) { return m.user_id && a[m.user_id] && a[m.user_id].estado === "si"; });
}
function nombresTxt(list) {
  var n = list.map(function (m) { return String(m.nombre || "").split(" ")[0]; });
  if (!n.length) return "";
  if (n.length === 1) return n[0] + " ha confirmado";
  if (n.length === 2) return n[0] + " y " + n[1] + " han confirmado";
  return n[0] + ", " + n[1] + " y " + (n.length - 2) + (n.length - 2 === 1 ? " más" : " más") + " han confirmado";
}
function avatarStack(list) {
  return h("span", { class: "av-stack", "aria-hidden": "true" }, list.slice(0, 3).map(function (m) { return personAvatar(m, "azul", "av-mini"); }));
}
function eventCard(e, past) {
  var ans = myAnswer(e.id), me = myMusico(), conf = confirmados(e);
  var card = h("article", { class: "ev-card tipo-" + tipoGrupo(e) + (ans ? " mine-" + ans.estado : "") + (past ? " past" : "") + (e.publico === "no" ? " interno" : ""), id: "ev-" + e.id });
  var link = h("a", { class: "ev-link", href: "#musicos-evento~" + e.id },
    h("span", { class: "ev-when", text: fechaLarga(e).toUpperCase() }),
    h("h3", { text: e.titulo }),
    h("span", { class: "ev-where" }, e.lugar || "", e.publico === "no" ? h("span", { class: "tag-int", text: "Interno" }) : null, e.formacion ? h("span", { class: "tag-form", text: e.formacion === "Asociación" ? "Todos" : e.formacion }) : null));
  var foot = h("div", { class: "ev-foot" },
    h("div", { class: "ev-who" }, conf.length ? avatarStack(conf) : null, h("span", { class: "who-txt", text: conf.length ? nombresTxt(conf) : (past ? "" : "Nadie ha confirmado todavía") })));
  if (me && !past) add(foot, rsvpControl(e, ans, "card"));
  else if (me && past) {
    var pres = (PRIV.pase[e.id] || {})[SESSION.user.id];
    add(foot, h("span", { class: "ans-past", text: (ans ? ESTADOS[ans.estado] : "Sin responder") + (pres === true ? " · Asististe" : pres === false ? " · No asististe" : "") }));
  }
  if (IS_ADMIN) add(foot, asistMini(e));
  add(card, link, foot);
  return card;
}
function rsvpControl(e, ans, mode) {
  if (ans && mode === "card") {
    var box = h("div", { class: "rsvp-done" });
    var pill = h("button", { type: "button", class: "ans-pill ans-" + ans.estado, "aria-haspopup": "true", "aria-expanded": "false", title: "Cambiar respuesta" },
      icon(ans.estado), ESTADO_CORTO[ans.estado].toUpperCase());
    var menu = h("div", { class: "ans-menu", hidden: true }, ["si", "duda", "no"].filter(function (k) { return k !== ans.estado; }).map(function (k) {
      return h("button", { type: "button", class: "ans-opt ans-" + k, onclick: function (ev) { ev.stopPropagation(); setRSVP(e.id, k, ans.motivo, ev.currentTarget); } }, icon(k), ESTADOS[k]);
    }));
    pill.addEventListener("click", function (ev) { ev.stopPropagation(); var open = menu.hidden; menu.hidden = !open; pill.setAttribute("aria-expanded", open ? "true" : "false"); });
    add(box, pill, menu);
    return box;
  }
  return h("div", { class: "rsvp-round", role: "group", "aria-label": "¿Vas a ir?" },
    h("button", { type: "button", class: "rb rb-no", "aria-label": "No asistiré", title: "No asistiré", onclick: function (ev) { setRSVP(e.id, "no", null, ev.currentTarget); } }, icon("no")),
    h("button", { type: "button", class: "rb rb-duda", "aria-label": "Duda", title: "Duda", onclick: function (ev) { setRSVP(e.id, "duda", null, ev.currentTarget); } }, icon("duda")),
    h("button", { type: "button", class: "rb rb-si", "aria-label": "Asistiré", title: "Asistiré", onclick: function (ev) { setRSVP(e.id, "si", null, ev.currentTarget); } }, icon("si")));
}
document.addEventListener("click", function () { Array.prototype.forEach.call(document.querySelectorAll(".ans-menu:not([hidden])"), function (m) { m.hidden = true; }); });
function setRSVP(evId, estado, motivo, btn) {
  if (simBlock(btn)) return;
  if (btn) btn.disabled = true;
  SB.from("asistencias").upsert({ evento_id: evId, user_id: SESSION.user.id, estado: estado, motivo: motivo || null })
    .then(check).then(reloadPrivate, function (e) { if (btn) btn.disabled = false; alert2(btn, errMsg(e)); });
}
function alert2(near, msg) { if (near && near.parentNode) near.parentNode.appendChild(h("p", { class: "status err", text: msg })); }
function convocadosDe(e) { return DATA.musicos.filter(function (m) { return m.user_id && convocado(e, m); }); }
function cuentaAsist(e) {
  var conv = convocadosDe(e), a = PRIV.asist[e.id] || {}, c = { si: 0, no: 0, duda: 0, nada: 0 };
  conv.forEach(function (m) { var r = a[m.user_id]; c[r ? r.estado : "nada"]++; });
  return c;
}
function asistMini(e) {
  var c = cuentaAsist(e);
  return h("a", { class: "asist-mini", href: "#musicos-evento~" + e.id + "~miembros", title: "Ver asistencia" },
    h("span", { class: "st st-si", text: "✓ " + c.si }), h("span", { class: "st st-no", text: "✗ " + c.no }), h("span", { class: "st st-duda", text: "? " + c.duda }), h("span", { class: "st st-nada", text: "— " + c.nada }));
}

/* =====================================================================
   FICHA DEL EVENTO
   ===================================================================== */
function areaEvento(e, tab) {
  var conv = convocadosDe(e), obras = obrasDeEvento(e.id), me = myMusico(), ans = myAnswer(e.id), past = e.fecha < todayStr();
  var tabs = [["detalles", "Detalles"], ["repertorio", "Repertorio", obras.length], ["miembros", "Miembros", conv.length]];
  var body;
  if (tab === "repertorio") body = eventoRepertorio(e, obras);
  else if (tab === "miembros") body = eventoMiembros(e, conv);
  else { tab = "detalles"; body = eventoDetalles(e); }
  return h("div", { class: "ev-detail" },
    h("a", { class: "back", href: "#musicos-agenda" }, icon("atras"), "Agenda"),
    h("div", { class: "evd-head tipo-" + tipoGrupo(e) },
      h("span", { class: "evd-tipo", text: (e.tipo || "Concierto") + (e.publico === "no" ? " · interno" : "") }),
      h("h1", { text: e.titulo }),
      h("p", { class: "evd-when", text: fechaLarga(e).replace(/^./, function (c) { return c.toUpperCase(); }) })),
    h("nav", { class: "subtabs", "aria-label": "Partes del evento" }, tabs.map(function (t) {
      return h("a", { href: "#musicos-evento~" + e.id + "~" + t[0], "aria-current": t[0] === tab ? "page" : null }, t[1], t[2] ? h("span", { class: "count", text: String(t[2]) }) : null);
    })),
    h("div", { class: "evd-grid" }, h("div", null, body),
      me && !past ? myAnswerBar(e, ans) : (me && past ? h("p", { class: "muted small", style: "margin-top:16px", text: "Tu respuesta: " + (ans ? ESTADOS[ans.estado] : "sin responder") }) : null)));
}
function detRow(ic, color, main, sub, action) {
  return h("div", { class: "det-row" }, h("span", { class: "det-ic", style: "background:" + color }, icon(ic)),
    h("div", { class: "det-txt" }, main, sub ? h("small", { text: sub }) : null), action || null);
}
function mapQuery(e) { var q = e.direccion || e.lugar || ""; if (q && !/asturias|siero|pola|lugones|oviedo|gij/i.test(q)) q += ", Siero, Asturias"; return q; }
function eventoDetalles(e) {
  var q = mapQuery(e);
  var fin = e.hora_fin || "";
  var rows = h("div", { class: "det-card" },
    detRow("grupo", "var(--azul)", h("b", { text: e.formacion === "Asociación" ? "Toda la asociación" : (e.formacion || "Banda") }), "Convocatoria"),
    detRow("calendario", "#e8505b", h("b", { text: fechaLarga(Object.assign({}, e, { hora: "" })).replace(/^./, function (c) { return c.toUpperCase(); }) }), null,
      h("button", { type: "button", class: "det-act", onclick: function () { descargarICS(e); }, text: "Añadir" })),
    e.hora ? detRow("reloj", "#d64fa3", h("b", { text: e.hora + (fin ? " – " + fin : "") }), fin ? null : "Hora de comienzo") : null,
    e.lugar ? detRow("pin", "#5aa7e8", h("b", { text: e.lugar }), e.direccion && e.direccion !== e.lugar ? e.direccion : null,
      h("a", { class: "det-act", href: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q), target: "_blank", rel: "noopener", text: "Cómo llegar" })) : null,
    e.lugar ? h("div", { class: "det-map" }, h("iframe", { title: "Mapa: " + e.lugar, loading: "lazy", referrerpolicy: "no-referrer-when-downgrade", src: "https://maps.google.com/maps?q=" + encodeURIComponent(q) + "&z=15&output=embed" })) : null,
    e.indumentaria ? detRow("ropa", "#8a63d2", h("b", { text: e.indumentaria }), "Indumentaria") : null);
  return h("div", { class: "evd-body" }, rows,
    e.notas ? h("div", { class: "det-notes" }, h("h3", null, icon("nota"), "Indicaciones"), h("p", { text: e.notas })) : null,
    e.descripcion ? h("div", { class: "det-notes" }, h("h3", { text: "Descripción" }), h("p", { text: e.descripcion })) : null,
    can("musica") ? eventoAdminBox(e) : null);
}
function eventoAdminBox(e) {
  var serie = e.serie ? DATA.eventos.filter(function (x) { return x.serie === e.serie && x.fecha >= e.fecha; }) : [];
  function borrar(ids, b) {
    ids.reduce(function (p, id) { return p.then(function () { return SB.from("contenido").delete().eq("coleccion", "eventos").eq("id", id).then(check); }); }, Promise.resolve())
      .then(function () { FLASH = { col: "agenda", msg: ids.length > 1 ? ids.length + " eventos borrados." : "Evento borrado." }; return loadAll(); })
      .then(function () { location.hash = "#musicos-agenda"; render(); }, function (err) { b.disabled = false; b.textContent = "Borrar"; alert2(b, errMsg(err)); });
  }
  var b1 = deleteButton(function (b) { borrar([e.id], b); }); b1.textContent = "Borrar este evento";
  var b2 = serie.length > 1 ? deleteButton(function (b) { borrar(serie.map(function (x) { return x.id; }), b); }) : null;
  if (b2) b2.textContent = "Borrar este y los " + (serie.length - 1) + " siguientes de la serie";
  return h("div", { class: "ev-admin" }, h("a", { class: "btn ghost small", href: "#admin-eventos", text: "✎ Editar en Administración" }), b1, b2,
    e.serie ? h("p", { class: "muted small", text: "Este evento forma parte de una serie que se repite." }) : null);
}
function myAnswerBar(e, ans) {
  var bar = h("div", { class: "answer-bar ans-" + (ans ? ans.estado : "nada") });
  var editing = AREA.nota === e.id;
  var noteIn = h("input", { type: "text", id: "nota-" + e.id, maxlength: "300", placeholder: "Ej.: llego un poco tarde", value: (ans && ans.motivo) || "" });
  add(bar, h("span", { class: "ab-mark", "aria-hidden": "true" }),
    h("div", { class: "ab-txt" },
      h("b", { text: ans ? ESTADOS[ans.estado] : "¿Vas a ir?" }),
      editing ? h("form", { class: "ab-note-form", onsubmit: function (ev) { ev.preventDefault(); AREA.nota = null; setRSVP(e.id, (ans && ans.estado) || "duda", noteIn.value.trim(), ev.target.querySelector("button")); } },
        noteIn, h("button", { class: "btn primary small", type: "submit", text: "Guardar" }))
        : (ans ? h("button", { type: "button", class: "linkish", text: ans.motivo ? "«" + ans.motivo + "» · cambiar nota" : "Añadir nota", onclick: function () { AREA.nota = e.id; render(); setTimeout(function () { var i = document.getElementById("nota-" + e.id); if (i) i.focus(); }, 30); } })
          : h("small", { text: "Responde para que la dirección sepa con quién cuenta." }))),
    h("div", { class: "ab-btns", role: "group", "aria-label": "Tu respuesta" }, ["no", "duda", "si"].map(function (k) {
      return h("button", { type: "button", class: "rb rb-" + k + (ans && ans.estado === k ? " on" : ""), "aria-pressed": ans && ans.estado === k ? "true" : "false", "aria-label": ESTADOS[k], title: ESTADOS[k],
        onclick: function (ev) { setRSVP(e.id, k, ans ? ans.motivo : null, ev.currentTarget); } }, icon(k));
    })));
  return bar;
}
function icsEsc(t) { return String(t || "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1"); }
function descargarICS(e) {
  var d = String(e.fecha || "").replace(/-/g, ""), lines;
  var stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  if (e.hora) {
    var hi = e.hora.replace(":", "") + "00";
    var fin = e.hora_fin;
    if (!fin) { var p = e.hora.split(":"), mins = +p[0] * 60 + (+p[1]) + (tipoGrupo(e) === "ensayos" ? 60 : 120); fin = String(Math.floor(mins / 60) % 24).padStart(2, "0") + ":" + String(mins % 60).padStart(2, "0"); }
    lines = ["DTSTART;TZID=Europe/Madrid:" + d + "T" + hi, "DTEND;TZID=Europe/Madrid:" + d + "T" + fin.replace(":", "") + "00"];
  } else {
    var next = isoOf(addDays(dateOf(e.fecha), 1)).replace(/-/g, "");
    lines = ["DTSTART;VALUE=DATE:" + d, "DTEND;VALUE=DATE:" + next];
  }
  var ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ASAM//Agenda de músicos//ES", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
    "UID:" + e.id + "@bandadesiero.es", "DTSTAMP:" + stamp].concat(lines, [
    "SUMMARY:" + icsEsc(e.titulo), e.lugar ? "LOCATION:" + icsEsc(e.lugar) : "", "DESCRIPTION:" + icsEsc([e.formacion, e.indumentaria ? "Indumentaria: " + e.indumentaria : "", e.notas].filter(Boolean).join("\n")),
    "END:VEVENT", "END:VCALENDAR"]).filter(Boolean).join("\r\n");
  saveBlob(new Blob([ics], { type: "text/calendar;charset=utf-8" }), slug(e.titulo) + ".ics");
}
function saveBlob(blob, name) {
  var url = URL.createObjectURL(blob), a = h("a", { href: url, download: name, style: "display:none" });
  document.body.appendChild(a); a.click();
  setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 2000);
}
function eventoRepertorio(e, obras) {
  if (!obras.length) return h("div", { class: "empty" }, h("p", { text: "Todavía no se ha publicado el repertorio de este evento." }),
    can("musica") ? h("a", { class: "admin-hint", href: "#musicos-gestion", text: "✎ Añadir obras desde Partituras" }) : null);
  return h("div", { class: "evd-body" },
    h("div", { class: "row-head" }, h("p", { class: "muted", text: obras.length + (obras.length === 1 ? " obra" : " obras") + " en el programa" }), descargarBtn(obras, e.titulo)),
    h("div", { class: "covers" }, obras.map(function (o, i) {
      var c = h("div", { class: "prog-item" }, h("a", { class: "cover-link", href: "#musicos-obra~" + o.id }, h("span", { class: "cover-n", text: String(i + 1) }), obraCover(o, "md")));
      if (can("musica") && obras.length > 1) add(c, h("div", { class: "prog-move" },
        h("button", { type: "button", class: "ico-btn", "aria-label": "Mover «" + o.titulo + "» antes", title: "Antes", disabled: i === 0 || null, onclick: function (ev) { moverEnPrograma(e.id, obras, i, -1, ev.currentTarget); } }, icon("izq")),
        h("button", { type: "button", class: "ico-btn", "aria-label": "Mover «" + o.titulo + "» después", title: "Después", disabled: i === obras.length - 1 || null, onclick: function (ev) { moverEnPrograma(e.id, obras, i, 1, ev.currentTarget); } }, icon("der"))));
      return c;
    })),
    can("musica") ? h("p", { class: "muted small", text: obras.length > 1 ? "Usa las flechas para poner las obras en el orden del concierto." : "" }) : null);
}
function eventoMiembros(e, conv) {
  var a = PRIV.asist[e.id] || {}, pase = PRIV.pase[e.id] || {}, c = cuentaAsist(e);
  if (!conv.length) return h("div", { class: "empty" }, h("p", { text: "No hay músicos con cuenta convocados a este evento." }));
  return h("div", { class: "evd-body" },
    h("div", { class: "asist-sum big" },
      h("span", { class: "st st-si", text: "Asistirán: " + c.si }), h("span", { class: "st st-no", text: "No: " + c.no }),
      h("span", { class: "st st-duda", text: "Duda: " + c.duda }), h("span", { class: "st st-nada", text: "Sin responder: " + c.nada })),
    can("musica") ? h("p", { class: "muted small", text: "Marca «Presente» el día del evento para pasar lista." }) : null,
    h("div", { class: "members" }, groupByInstrument(conv).map(function (g) {
      return h("div", { class: "mem-group" }, h("h4", null, h("span", { text: g.name }), h("small", { text: g.items.filter(function (m) { return a[m.user_id] && a[m.user_id].estado === "si"; }).length + "/" + g.items.length })),
        g.items.map(function (m) {
          var r = a[m.user_id], est = r ? r.estado : "nada";
          var row = h("div", { class: "mem-row" }, personAvatar(m, "azul", "av-mid"),
            h("div", { class: "mem-txt" }, h("b", { text: m.nombre + (isJefe(m) ? " · jefe" : "") }), r && r.motivo ? h("small", { text: "«" + r.motivo + "»" }) : (m.voz ? h("small", { text: "Voz " + vocesTxt([INST.normVoz(m.voz)]) }) : null)),
            h("span", { class: "mem-st st-" + est, text: est === "nada" ? "Sin responder" : ESTADOS[est] }));
          if (can("musica")) {
            var cb = h("input", { type: "checkbox", id: "pl-" + e.id + "-" + m.user_id, checked: pase[m.user_id] === true || null });
            cb.addEventListener("change", function () {
              cb.disabled = true;
              SB.from("pase_lista").upsert({ evento_id: e.id, user_id: m.user_id, presente: cb.checked }).then(check)
                .then(function () { (PRIV.pase[e.id] = PRIV.pase[e.id] || {})[m.user_id] = cb.checked; cb.disabled = false; },
                  function (err) { cb.disabled = false; cb.checked = !cb.checked; alert2(cb.parentNode, errMsg(err)); });
            });
            add(row, h("label", { class: "pl", for: "pl-" + e.id + "-" + m.user_id }, cb, h("span", { text: "Presente" })));
          }
          return row;
        }));
    })));
}

/* =====================================================================
   REPERTORIO
   ===================================================================== */
var COVER_COLORS = ["#d7263d", "#e3b505", "#5a1846", "#1f6f8b", "#2e8b57", "#e07a1f", "#5b4bb7", "#b8336a", "#00897b", "#34495e", "#8d6e63", "#3f51b5"];
function obraColor(o) {
  if (o.color && /^#[0-9a-f]{6}$/i.test(o.color)) return o.color;
  var s = 0, t = String(o.titulo || o.id || ""); for (var i = 0; i < t.length; i++) s = (s * 31 + t.charCodeAt(i)) >>> 0;
  return COVER_COLORS[s % COVER_COLORS.length];
}
function lightColor(hex) { var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; return (r * 299 + g * 587 + b * 114) / 1000 > 165; }
function obraCover(o, size) {
  var c = obraColor(o);
  return h("div", { class: "cover cover-" + (size || "md") + (lightColor(c) ? " light" : ""), style: "--cc:" + c, "aria-hidden": size === "sm" ? "true" : null },
    h("span", { class: "cv-staff", "aria-hidden": "true" }),
    h("span", { class: "cv-title", text: o.titulo }),
    h("span", { class: "cv-rule", "aria-hidden": "true" }),
    o.compositor ? h("span", { class: "cv-comp", text: o.compositor }) : null);
}
function valoracion(o) {
  var v = PRIV.valor[o.id] || {}, arr = Object.keys(v).map(function (k) { return v[k]; });
  var avg = arr.length ? arr.reduce(function (a, b) { return a + b; }, 0) / arr.length : 0;
  return { n: arr.length, avg: avg, mine: SESSION ? v[SESSION.user.id] || 0 : 0 };
}
function starsWidget(o) {
  var r = valoracion(o), open = AREA.valorando === o.id;
  var wrap = h("div", { class: "rate" + (open ? " open" : "") });
  var btn = h("button", { type: "button", class: "rate-btn" + (r.mine ? " mine" : ""), "aria-expanded": open ? "true" : "false",
    onclick: function (ev) { ev.preventDefault(); ev.stopPropagation(); AREA.valorando = open ? null : o.id; render(); } },
    icon("estrella"), r.n ? h("span", { text: r.avg.toFixed(1).replace(".", ",") + " (" + r.n + ")" }) : h("span", { text: "Valorar" }));
  add(wrap, btn);
  if (open) {
    add(wrap, h("div", { class: "rate-pop", role: "group", "aria-label": "Tu valoración" },
      [1, 2, 3, 4, 5].map(function (n) {
        return h("button", { type: "button", class: "star" + (n <= r.mine ? " on" : ""), "aria-label": n + (n === 1 ? " estrella" : " estrellas"),
          onclick: function (ev) { ev.preventDefault(); ev.stopPropagation(); rate(o, n, ev.currentTarget); } }, icon("estrella"));
      }),
      r.mine ? h("button", { type: "button", class: "linkish", text: "Quitar", onclick: function (ev) { ev.preventDefault(); ev.stopPropagation(); rate(o, 0, ev.currentTarget); } }) : null));
  }
  return wrap;
}
function rate(o, n, btn) {
  if (simBlock(btn)) return;
  if (btn) btn.disabled = true;
  var q = n ? SB.from("valoraciones").upsert({ obra_id: o.id, user_id: SESSION.user.id, estrellas: n })
    : SB.from("valoraciones").delete().eq("obra_id", o.id).eq("user_id", SESSION.user.id);
  q.then(check).then(function () { AREA.valorando = null; return reloadPrivate(); }, function (e) { if (btn) btn.disabled = false; alert2(btn, errMsg(e)); });
}
function proximoEventoConObras() {
  var t = todayStr();
  return areaEvents().filter(function (e) { return e.fecha >= t && obrasDeEvento(e.id).length; })[0] || null;
}
function enDias(fecha) {
  var d = Math.round((dateOf(fecha) - dateOf(todayStr())) / 864e5);
  if (d <= 0) return "hoy"; if (d === 1) return "mañana"; if (d < 14) return "en " + d + " días";
  if (d < 45) return "en " + Math.round(d / 7) + " semanas"; var m = Math.round(d / 30); return m <= 1 ? "en 1 mes" : "en " + m + " meses";
}
function eventosFuturos(o) { var t = todayStr(); return eventosDeObra(o).filter(function (e) { return e.fecha >= t; }); }
function areaRepertorio() {
  var me = myMusico(), prox = proximoEventoConObras();
  var obras = PRIV.obras.filter(function (o) { return IS_ADMIN || obraParaMi(o, me); });
  var q = norm(AREA.buscar);
  var list = obras.filter(function (o) { return !q || norm(o.titulo + " " + (o.compositor || "") + " " + (o.arreglista || "")).indexOf(q) >= 0; });
  if (AREA.filtro === "mias") list = list.filter(function (o) { return misPartes(o.id, me).length; });
  if (AREA.filtro === "programadas") list = list.filter(function (o) { return eventosFuturos(o).length; });
  if (AREA.filtro === "Banda" || AREA.filtro === "Bandín") list = list.filter(function (o) { var f = o.formacion || "Banda y Bandín"; return f === AREA.filtro || f === "Banda y Bandín"; });
  list.sort(function (a, b) {
    if (AREA.orden === "titulo") return String(a.titulo).localeCompare(String(b.titulo), "es");
    if (AREA.orden === "compositor") return String(a.compositor || "~").localeCompare(String(b.compositor || "~"), "es") || String(a.titulo).localeCompare(String(b.titulo), "es");
    if (AREA.orden === "valoracion") return valoracion(b).avg - valoracion(a).avg;
    return (b.creado || "") < (a.creado || "") ? -1 : 1;
  });
  var search = h("input", { type: "search", id: "rep-buscar", placeholder: "Buscar por título o compositor", value: AREA.buscar, "aria-label": "Buscar obras" });
  var timer;
  search.addEventListener("input", function () { clearTimeout(timer); timer = setTimeout(function () { AREA.buscar = search.value; render(); var s = document.getElementById("rep-buscar"); if (s) { s.focus(); s.setSelectionRange(s.value.length, s.value.length); } }, 220); });
  return h("div", { class: "repertorio" },
    prox ? h("section", { class: "rep-next" },
      h("div", { class: "row-head" }, h("div", null, h("h2", { text: "Próximo evento" }),
        h("p", { class: "muted" }, h("a", { href: "#musicos-evento~" + prox.id, text: prox.titulo }), " · " + enDias(prox.fecha))), descargarBtn(obrasDeEvento(prox.id), prox.titulo)),
      h("div", { class: "covers scroll" }, obrasDeEvento(prox.id).map(function (o) { return h("a", { class: "cover-link", href: "#musicos-obra~" + o.id }, obraCover(o, "md")); }))) : null,
    h("section", { class: "rep-all" },
      h("div", { class: "rep-title" }, h("h2", { text: "Todas las obras" }), h("span", { class: "role-badge" }, icon("perfil"), can("musica") ? "DIRECCIÓN" : "MIEMBRO"),
        can("musica") ? h("a", { class: "btn primary small", href: "#musicos-editar~nueva", style: "margin-left:auto" }, "+ Nueva obra") : null),
      h("p", { class: "muted", text: IS_ADMIN ? "Ves todas las obras y todas las particellas." : "Ves el repertorio de tu formación. En cada obra aparecen solo las partituras de tu instrumento" + (me && me.voz ? " y tu voz." : ".") }),
      h("div", { class: "rep-tools" },
        h("label", { class: "search" }, icon("buscar"), search),
        h("select", { "aria-label": "Ordenar", onchange: function (ev) { AREA.orden = ev.target.value; render(); } },
          [["recientes", "Más recientes"], ["titulo", "Título (A-Z)"], ["compositor", "Compositor"], ["valoracion", "Mejor valoradas"]].map(function (o) { return h("option", { value: o[0], text: o[1], selected: AREA.orden === o[0] || null }); }))),
      h("div", { class: "chips" }, [["todas", "Todas"], ["mias", "Con mis partituras"], ["programadas", "Programadas"], ["Banda", "Banda"], ["Bandín", "Bandín"]].map(function (f) {
        return h("button", { type: "button", class: "chip", "aria-pressed": AREA.filtro === f[0] ? "true" : "false", text: f[1], onclick: function () { AREA.filtro = f[0]; render(); } });
      })),
      list.length ? h("div", { class: "obra-list" }, list.map(function (o) { return obraRow(o, me); }))
        : h("div", { class: "empty" }, h("p", { text: obras.length ? "Ninguna obra coincide con la búsqueda." : (can("musica") ? "Todavía no hay obras. Crea la primera con «+ Nueva obra»." : "Todavía no hay obras en el repertorio.") }))));
}
function obraRow(o, me) {
  var fut = eventosFuturos(o), mine = me ? misPartes(o.id, me) : [];
  var nPartes = PRIV.partes.filter(function (p) { return p.obra_id === o.id; }).length;
  return h("a", { class: "obra-row", href: "#musicos-obra~" + o.id },
    obraCover(o, "sm"),
    h("div", { class: "or-body" },
      h("div", { class: "or-top" }, h("h3", { text: o.titulo }), starsWidget(o)),
      o.compositor || o.arreglista ? h("p", { class: "or-comp", text: [o.compositor, o.arreglista ? "arr. " + o.arreglista : ""].filter(Boolean).join(" · ") }) : null,
      h("div", { class: "or-tags" },
        fut.length ? h("span", { class: "pill-soft", text: "Disponible en " + fut.length + (fut.length === 1 ? " evento" : " eventos") }) : null,
        me ? (mine.length ? h("span", { class: "pill-ok" }, icon("pdf"), mine.map(parteNombre).join(", ")) : h("span", { class: "pill-warn", text: "Sin partitura para ti" })) : null,
        IS_ADMIN ? h("span", { class: "pill-soft", text: nPartes + (nPartes === 1 ? " particella" : " particellas") }) : null)));
}

/* ---------- Ficha de la obra ---------- */
function areaObra(o) {
  var me = myMusico(), evs = eventosDeObra(o), t = todayStr(), next = evs.filter(function (e) { return e.fecha >= t; })[0];
  var yt = youtubeId(o.youtube);
  var todas = PRIV.partes.filter(function (p) { return p.obra_id === o.id; }).sort(parteSort);
  var mine = me ? misPartes(o.id, me) : (IS_ADMIN ? todas : []);
  var otras = me ? otrasVoces(o.id, me) : [];
  var misPet = PRIV.peticiones.filter(function (p) { return p.obra_id === o.id && SESSION && p.user_id === SESSION.user.id; });
  return h("div", { class: "obra-page" },
    h("a", { class: "back", href: "#musicos-repertorio" }, icon("atras"), "Repertorio"),
    h("div", { class: "op-head" }, obraCover(o, "lg"),
      h("div", { class: "op-info" },
        h("h1", { text: o.titulo }),
        o.compositor ? h("p", { class: "op-comp", text: o.compositor }) : null,
        o.arreglista ? h("p", { class: "muted", text: "Arreglo: " + o.arreglista }) : null,
        h("div", { class: "op-tags" }, h("span", { class: "pill-soft", text: o.formacion || "Banda y Bandín" }), o.duracion ? h("span", { class: "pill-soft", text: "⏱ " + o.duracion }) : null),
        h("div", { class: "op-rate" }, h("span", { class: "muted small", text: "¿Quieres valorar esta obra?" }), starsWidget(o)),
        can("musica") ? h("a", { class: "btn ghost small", href: "#musicos-editar~" + o.id, text: "✎ Editar obra y partituras" }) : null)),
    yt ? h("section", { class: "op-sec" }, videoEmbed(yt, o.titulo)) : (safeUrl(o.youtube) ? h("p", null, h("a", { href: o.youtube, target: "_blank", rel: "noopener", text: "↗ Escuchar una grabación de referencia" })) : null),
    o.notas ? h("section", { class: "op-sec det-notes" }, h("h3", null, icon("nota"), "Notas de la dirección"), h("p", { text: o.notas })) : null,
    h("section", { class: "op-sec" },
      h("div", { class: "row-head" }, h("h2", { text: "Archivos" }), mine.length > 1 ? descargarBtn([o], o.titulo, mine) : null),
      mine.length ? h("div", { class: "files" }, mine.map(fileRow)) : h("div", { class: "empty" }, h("p", { text: "Todavía no hay ningún archivo para tu instrumento" + (me && me.voz ? " y tu voz." : ".") })),
      me ? h("p", { class: "muted small", text: "Se muestran los archivos de tu instrumento" + (me.voz ? " y tu voz" : "") + ". Si falta el tuyo, puedes reclamarlo." }) : null,
      otras.length ? h("details", { class: "otras" }, h("summary", { text: "Otras voces de " + INST.canonical(me.instrumento) + " (" + otras.length + ")" }), h("div", { class: "files" }, otras.map(fileRow))) : null,
      me ? reclamarBox(o, me, misPet) : null,
      IS_ADMIN && me && todas.length ? h("details", { class: "otras" }, h("summary", { text: "Todas las particellas de la obra (" + todas.length + ")" }), h("div", { class: "files" }, todas.map(fileRow))) : null,
      can("musica") ? obraPeticiones(o) : null),
    h("section", { class: "op-sec" },
      h("h2", { text: "Eventos" }),
      evs.length ? h("div", { class: "op-events" },
        h("p", { class: "muted small", text: "Se interpretará en " + evs.filter(function (e) { return e.fecha >= t; }).length + " " + (evs.filter(function (e) { return e.fecha >= t; }).length === 1 ? "evento" : "eventos") }),
        evs.map(function (e) {
          return h("a", { class: "op-ev" + (e.fecha < t ? " past" : ""), href: "#musicos-evento~" + e.id },
            h("div", null, h("b", { text: e.titulo }), h("small", { text: fmtLong(e.fecha) + (e.lugar ? " · " + e.lugar : "") })),
            next && e.id === next.id ? h("span", { class: "next-tag", text: "Próxima interpretación" }) : (e.fecha < t ? h("span", { class: "muted small", text: "Ya interpretada" }) : null));
        })) : h("p", { class: "muted", text: "Esta obra todavía no está programada en ningún evento." })));
}
function fileRow(p) {
  var isAudio = /^audio\//.test(p.tipo || ""), isImg = /^image\//.test(p.tipo || "");
  return h("div", { class: "file-row" },
    h("span", { class: "f-ic", "aria-hidden": "true", text: instEmoji(p.instrumento) }),
    h("div", { class: "f-txt" }, h("b", { text: parteNombre(p) }), h("small", { text: [p.paginas ? p.paginas + (p.paginas === 1 ? " página" : " páginas") : "", isAudio ? "Audio" : isImg ? "Imagen" : "PDF"].filter(Boolean).join(" · ") })),
    h("button", { type: "button", class: "ico-btn", "aria-label": (isAudio ? "Escuchar " : "Abrir ") + parteNombre(p), title: isAudio ? "Escuchar" : "Abrir", onclick: function (ev) { openParte(p, ev.currentTarget); } }, icon(isAudio ? "ojo" : "pdf")),
    h("button", { type: "button", class: "ico-btn", "aria-label": "Descargar " + parteNombre(p), title: "Descargar", onclick: function (ev) { downloadParte(p, ev.currentTarget); } }, icon("descarga")));
}
function signed(p, download) {
  return SB.storage.from("partituras").createSignedUrl(p.path, 3600, download ? { download: download } : undefined).then(function (r) {
    if (r.error || !r.data) throw new Error("No se ha podido abrir el archivo.");
    return r.data.signedUrl;
  });
}
function openParte(p, btn) {
  var w = window.open("about:blank", "_blank");
  if (btn) btn.disabled = true;
  signed(p).then(function (u) { if (btn) btn.disabled = false; if (w) w.location.href = u; else location.href = u; },
    function (e) { if (btn) btn.disabled = false; if (w) w.close(); alert2(btn, e.message); });
}
function fileName(o, p) {
  var ext = (String(p.archivo || p.path).split(".").pop() || "pdf").toLowerCase();
  return (o ? o.titulo + " - " : "") + parteNombre(p) + "." + ext;
}
function downloadParte(p, btn) {
  if (btn) btn.disabled = true;
  signed(p, fileName(getObra(p.obra_id), p).replace(/[\\/:*?"<>|]/g, "-")).then(function (u) { if (btn) btn.disabled = false; location.href = u; },
    function (e) { if (btn) btn.disabled = false; alert2(btn, e.message); });
}
function loadScript(src) {
  return new Promise(function (res, rej) { var s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = function () { rej(new Error("No se ha podido cargar " + src)); }; document.head.appendChild(s); });
}
function descargarBtn(obras, nombre, partes) {
  var me = myMusico();
  var list = partes || [];
  if (!partes) obras.forEach(function (o) { list = list.concat(me ? misPartes(o.id, me) : PRIV.partes.filter(function (p) { return p.obra_id === o.id; })); });
  if (!list.length) return null;
  var b = h("button", { type: "button", class: "btn ghost small dl-btn" }, icon("descarga"), list.length === 1 ? "Descargar" : "Descargar (" + list.length + ")");
  b.addEventListener("click", function () {
    if (list.length === 1) { downloadParte(list[0], b); return; }
    b.disabled = true; var lbl = b.lastChild; lbl.textContent = "Preparando…";
    (window.JSZip ? Promise.resolve() : loadScript("js/vendor/jszip.min.js")).then(function () {
      var zip = new window.JSZip(), done = 0;
      return list.reduce(function (pr, p) {
        return pr.then(function () {
          return signed(p).then(function (u) { return fetch(u); }).then(function (r) { if (!r.ok) throw new Error("No se ha podido descargar " + parteNombre(p)); return r.blob(); })
            .then(function (blob) { var o = getObra(p.obra_id); zip.file((obras.length > 1 && o ? o.titulo.replace(/[\\/:*?"<>|]/g, "-") + "/" : "") + fileName(o, p).replace(/[\\/:*?"<>|]/g, "-"), blob); done++; lbl.textContent = "Descargando " + done + " de " + list.length + "…"; });
        });
      }, Promise.resolve()).then(function () { return zip.generateAsync({ type: "blob" }); });
    }).then(function (blob) {
      saveBlob(blob, String(nombre || "partituras").replace(/[\\/:*?"<>|]/g, "-") + (me ? " - " + INST.canonical(me.instrumento) : "") + ".zip");
      b.disabled = false; lbl.textContent = "Descargar (" + list.length + ")";
    }, function (e) { b.disabled = false; lbl.textContent = "Descargar (" + list.length + ")"; alert2(b, e.message || "No se ha podido descargar."); });
  });
  return b;
}
function reclamarBox(o, me, misPet) {
  if (!me) return null;
  if (misPet.length) return h("p", { class: "claim-done" }, icon("si"), "Pediste tu partitura el " + fmtLong(String(misPet[misPet.length - 1].creado).slice(0, 10)) + ". La dirección ya está avisada.");
  var open = AREA.reclamando === o.id;
  if (!open) return h("button", { type: "button", class: "btn ghost small claim-btn", text: misPartes(o.id, me).length ? "¿Te falta algo? Avisar a la dirección" : "Reclamar mi partitura", onclick: function () { AREA.reclamando = o.id; render(); } });
  var msg = h("textarea", { id: "claim-msg", maxlength: "1000", placeholder: "Opcional: qué te falta (por ejemplo, «la voz 2» o «la página 3 está cortada»)" });
  var st = statusEl();
  var send = h("button", { class: "btn primary small", type: "submit", text: "Enviar a la dirección" });
  var f = h("form", { class: "claim-form" }, h("label", { for: "claim-msg", text: "Reclamar partitura de " + INST.canonical(me.instrumento) + (me.voz ? " " + vocesTxt([INST.normVoz(me.voz)]) : "") }), msg,
    h("div", { class: "form-acts" }, send, h("button", { class: "btn ghost small", type: "button", text: "Cancelar", onclick: function () { AREA.reclamando = null; render(); } })), st);
  f.addEventListener("submit", function (ev) {
    ev.preventDefault(); if (simBlock(send)) return; send.disabled = true;
    SB.from("peticiones").insert({ obra_id: o.id, user_id: SESSION.user.id, autor: displayName(), instrumento: INST.canonical(me.instrumento), voz: me.voz || null, mensaje: msg.value.trim() || null })
      .then(check).then(function () { AREA.reclamando = null; return reloadPrivate(); }, function (e) { send.disabled = false; setStatus(st, errMsg(e), false); });
  });
  return f;
}
function obraPeticiones(o) {
  var pet = PRIV.peticiones.filter(function (p) { return p.obra_id === o.id; });
  if (!pet.length) return null;
  return h("div", { class: "claims" }, h("h3", { text: "Partituras reclamadas (" + pet.length + ")" }), pet.map(peticionRow));
}
function peticionRow(p) {
  var o = getObra(p.obra_id);
  return h("div", { class: "claim-row" },
    h("div", null, h("b", { text: p.autor + " · " + [p.instrumento, p.voz ? "voz " + p.voz : ""].filter(Boolean).join(" ") }),
      h("small", { text: (o ? o.titulo + " · " : "") + fmtLong(String(p.creado).slice(0, 10)) }), p.mensaje ? h("p", { text: "«" + p.mensaje + "»" }) : null),
    h("div", { class: "acts" }, o ? h("a", { class: "btn ghost small", href: "#musicos-editar~" + o.id, text: "Subir" }) : null,
      h("button", { class: "btn ghost small", type: "button", text: "Resuelta ✓", onclick: function (ev) {
        ev.currentTarget.disabled = true;
        SB.from("peticiones").delete().eq("id", p.id).then(check).then(reloadPrivate);
      } })));
}

/* =====================================================================
   PARTITURAS (dirección): obras, subida y reparto automático
   ===================================================================== */
function slug(t) { return norm(t).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "obra"; }
function cobertura(o, extra) {
  // Quién recibe partitura y quién se queda sin ella
  var partes = PRIV.partes.filter(function (p) { return p.obra_id === (o && o.id); }).concat(extra || []);
  var musicos = DATA.musicos.filter(function (m) { return obraParaMi(o || {}, m) && !isDirectorM(m); });
  var sin = musicos.filter(function (m) { return !partes.some(function (p) { return parteParaMusico(p, m); }); });
  return { total: musicos.length, con: musicos.length - sin.length, sin: sin.sort(musicianSort) };
}
function areaGestion() {
  var obras = PRIV.obras.slice().sort(function (a, b) { return (b.actualizado || b.creado || "") < (a.actualizado || a.creado || "") ? -1 : 1; });
  var sinVoz = DATA.musicos.filter(function (m) {
    if (m.voz || isDirectorM(m) || INST.family(m.instrumento) === "Percusión") return false;
    var ci = INST.canonical(m.instrumento);
    return DATA.musicos.filter(function (x) { return INST.canonical(x.instrumento) === ci && x.formacion === m.formacion; }).length > 1;
  });
  return h("div", { class: "gestion" },
    h("div", { class: "ag-head" }, h("h1", { text: "Partituras" }), h("a", { class: "btn primary", href: "#musicos-editar~nueva" }, "+ Nueva obra")),
    h("div", { class: "how" },
      h("div", null, h("b", { text: "1. Crea la obra" }), h("p", { text: "Título, compositor, vídeo de referencia y en qué conciertos se toca." })),
      h("div", null, h("b", { text: "2. Sube las particellas" }), h("p", { text: "Varios PDF a la vez («Clarinete 1.pdf», «Trumpet in Bb 2.pdf»…) o un único PDF con todas: la web lo lee y lo divide." })),
      h("div", null, h("b", { text: "3. Se reparten solas" }), h("p", { text: "Cada músico ve solo la de su instrumento y su voz. Revisa antes de guardar quién recibe cada una." }))),
    PRIV.peticiones.length ? h("section", { class: "claims" }, h("h2", { text: "Partituras reclamadas (" + PRIV.peticiones.length + ")" }), PRIV.peticiones.slice().reverse().map(peticionRow)) : null,
    sinVoz.length ? h("p", { class: "hint-warn" }, "Hay " + sinVoz.length + (sinVoz.length === 1 ? " músico" : " músicos") + " sin voz asignada en secciones con varias voces (" + sinVoz.slice(0, 4).map(function (m) { return m.nombre.split(" ")[0] + " · " + m.instrumento; }).join(", ") + (sinVoz.length > 4 ? "…" : "") + "). Recibirán todas las voces de su instrumento. Puedes ponerles la voz en ", h("a", { href: "#admin-musicos", text: "Administración → Músicos" }), ".") : null,
    obras.length ? h("div", { class: "g-list" }, obras.map(function (o) {
      var n = PRIV.partes.filter(function (p) { return p.obra_id === o.id; }).length, cov = cobertura(o), fut = eventosFuturos(o);
      return h("div", { class: "g-row" },
        h("a", { href: "#musicos-obra~" + o.id, class: "g-cover", "aria-label": "Ver " + o.titulo }, obraCover(o, "sm")),
        h("div", { class: "g-body" },
          h("a", { class: "g-title", href: "#musicos-obra~" + o.id, text: o.titulo }),
          h("small", { text: [o.compositor, o.formacion || "Banda y Bandín", n + (n === 1 ? " particella" : " particellas"), fut.length ? "Próximo: " + fut[0].titulo : ""].filter(Boolean).join(" · ") }),
          cov.total ? h("div", { class: "cov" }, h("span", { class: "cov-bar" }, h("i", { style: "width:" + Math.round(100 * cov.con / cov.total) + "%" })),
            h("span", { class: cov.sin.length ? "cov-txt warn" : "cov-txt ok", text: cov.sin.length ? cov.sin.length + " sin partitura: " + uniqInst(cov.sin).join(", ") : "Todos tienen su partitura" })) : null),
        h("a", { class: "btn ghost small", href: "#musicos-editar~" + o.id, text: "Editar" }));
    })) : h("div", { class: "empty" }, h("p", { text: "Todavía no hay obras. Empieza con «+ Nueva obra»." })));
}
function uniqInst(list) { var s = []; list.forEach(function (m) { var k = INST.canonical(m.instrumento) + (m.voz ? " " + vocesTxt([INST.normVoz(m.voz)]) : ""); if (s.indexOf(k) < 0) s.push(k); }); return s; }

/* ---------- PDF: lectura (PDF.js) y división (pdf-lib) ---------- */
var PDFJS_P = null;
function getPdfjs() {
  if (!PDFJS_P) PDFJS_P = import(new URL("js/vendor/pdf.min.mjs", location.href).href).then(function (m) {
    m.GlobalWorkerOptions.workerSrc = new URL("js/vendor/pdf.worker.min.mjs", location.href).href; return m;
  }, function (e) { PDFJS_P = null; throw e; });
  return PDFJS_P;
}
function getPdfLib() { return window.PDFLib ? Promise.resolve(window.PDFLib) : loadScript("js/vendor/pdf-lib.min.js").then(function () { return window.PDFLib; }); }
function readAsBuffer(file) { return file.arrayBuffer ? file.arrayBuffer() : new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(r.result); }; r.onerror = rej; r.readAsArrayBuffer(file); }); }
function pageHeaderDetect(page) {
  return page.getTextContent().then(function (tc) {
    var vp = page.getViewport({ scale: 1 }), H = vp.height;
    var items = tc.items.filter(function (it) { return it.str && it.str.trim(); }).map(function (it) {
      return { s: it.str, x: it.transform[4], y: it.transform[5], f: Math.hypot(it.transform[0], it.transform[1]) || it.height || 0 };
    });
    if (!items.length) return { det: null, texto: false };
    // ¿Es una página de guion? (muchos instrumentos distintos en el margen)
    var distintos = {};
    items.forEach(function (it) { if (it.s.length < 40) { var d = INST.detect(it.s); if (d && d.familia !== "Guion") distintos[d.instrumento] = 1; } });
    var top = items.filter(function (it) { return it.y > H * 0.7; }).sort(function (a, b) { return b.y - a.y || a.x - b.x; });
    var topTxt = top.map(function (it) { return it.s; }).join(" ");
    var det = INST.detect(topTxt);
    if (Object.keys(distintos).length >= 4) {
      var g = INST.detect(topTxt);
      return { det: g && g.familia === "Guion" ? g : { instrumento: "Guion", familia: "Guion", voces: [] }, texto: true, guion: true };
    }
    if (!det) {
      var fs = items.map(function (it) { return it.f; }).sort(function (a, b) { return a - b; }), p85 = fs[Math.floor(fs.length * 0.85)] || 0;
      det = INST.detect(items.filter(function (it) { return it.f >= p85 && it.s.length < 60; }).map(function (it) { return it.s; }).join(" "));
    }
    return { det: det, texto: true };
  });
}
function renderThumb(page) {
  var vp0 = page.getViewport({ scale: 1 }), scale = 150 / vp0.width, vp = page.getViewport({ scale: scale });
  var c = document.createElement("canvas"); c.width = Math.ceil(vp.width); c.height = Math.ceil(vp.height);
  return page.render({ canvasContext: c.getContext("2d"), viewport: vp }).promise.then(function () { return c.toDataURL("image/jpeg", 0.72); });
}
/* ---------- Lectura de PDF escaneados (OCR con Tesseract.js, en el navegador) ---------- */
var TESS_VER = "5.1.1", TESS_P = null;
function getOcr() {
  if (!TESS_P) TESS_P = (window.Tesseract ? Promise.resolve() : loadScript("https://cdn.jsdelivr.net/npm/tesseract.js@" + TESS_VER + "/dist/tesseract.min.js"))
    .then(function () { return window.Tesseract.createWorker("spa", 1); })
    .then(function (w) { return w.setParameters({ tessedit_pageseg_mode: "11" }).then(function () { return w; }); })
    .catch(function (e) { TESS_P = null; throw e; });
  return TESS_P;
}
// Recorta el borde de la página donde suele ir el nombre del instrumento y lo deja en horizontal.
// "arriba": cabecera normal · "der"/"izq": página girada, con el nombre en vertical en un margen
function ocrStrip(src, lado) {
  var W = src.width, H = src.height, c = document.createElement("canvas"), x = c.getContext("2d");
  if (lado === "arriba") { var hh = Math.round(H * 0.17); c.width = W; c.height = hh; x.fillStyle = "#fff"; x.fillRect(0, 0, W, hh); x.drawImage(src, 0, 0, W, hh, 0, 0, W, hh); return c; }
  var cw = Math.round(W * 0.17); c.width = H; c.height = cw; x.fillStyle = "#fff"; x.fillRect(0, 0, H, cw);
  if (lado === "der") { x.translate(0, cw); x.rotate(-Math.PI / 2); x.drawImage(src, W - cw, 0, cw, H, 0, 0, cw, H); }
  else { x.translate(H, 0); x.rotate(Math.PI / 2); x.drawImage(src, 0, 0, cw, H, 0, 0, cw, H); }
  return c;
}
function ocrText(worker, canvas) {
  return worker.recognize(canvas).then(function (r) {
    var d = r.data || {}, words = d.words || [];
    if (!words.length) return d.text || "";
    return words.filter(function (w) { return w.confidence >= 45 && /[A-Za-zÀ-ÿ0-9]/.test(w.text); }).map(function (w) { return w.text; }).join(" ");
  });
}
// Devuelve la detección de una página escaneada (o null). item.ocrLado recuerda qué borde funcionó.
function ocrPage(worker, page, item) {
  var vp0 = page.getViewport({ scale: 1 }), scale = 1800 / Math.max(vp0.width, vp0.height), vp = page.getViewport({ scale: scale });
  var c = document.createElement("canvas"); c.width = Math.ceil(vp.width); c.height = Math.ceil(vp.height);
  var ctx = c.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
  return page.render({ canvasContext: ctx, viewport: vp }).promise.then(function () {
    var lados = ["arriba", "der", "izq"];
    if (item.ocrLado) lados = [item.ocrLado].concat(lados.filter(function (l) { return l !== item.ocrLado; }));
    var k = 0;
    function next() {
      if (k >= lados.length || item.ocrSkip) return null;
      var lado = lados[k++];
      return ocrText(worker, ocrStrip(c, lado)).then(function (txt) {
        var d = INST.detect(txt, { ocr: true });
        if (d) { item.ocrLado = lado; d.ocr = true; return d; }
        return next();
      });
    }
    return next();
  });
}
function setProgreso(item, txt) {
  item.progreso = txt;
  var el = document.getElementById("si-p-" + item.id); if (el) el.textContent = txt;
}
function sameDet(a, b) { return a && b && a.instrumento === b.instrumento && (a.voces || []).join() === (b.voces || []).join(); }
function analyzeFile(item) {
  var file = item.file, g = INST.detect(file.name);
  item.instrumento = g ? g.instrumento : ""; item.voces = g ? g.voces : []; item.origen = g ? "nombre" : "";
  if (!/pdf$/i.test(file.type) && !/\.pdf$/i.test(file.name)) { item.status = "listo"; return Promise.resolve(); }
  return readAsBuffer(file).then(function (buf) {
    item.buf = buf;
    return getPdfjs().then(function (pdfjs) { return pdfjs.getDocument({ data: buf.slice(0), wasmUrl: new URL("js/vendor/wasm/", location.href).href }).promise; });
  }).then(function (doc) {
    item.paginas = doc.numPages;
    var n = Math.min(doc.numPages, 120), dets = [], thumbs = [], conTexto = false;
    var chain = Promise.resolve();
    for (var i = 1; i <= n; i++) (function (i) {
      chain = chain.then(function () { return doc.getPage(i); }).then(function (page) {
        return pageHeaderDetect(page).then(function (r) { dets[i - 1] = r.det; if (r.texto) conTexto = true; if (r.guion) dets[i - 1].guion = true; })
          .then(function () { return doc.numPages > 1 ? renderThumb(page).then(function (t) { thumbs[i - 1] = t; }, function () {}) : null; });
      }).then(function () { item.progreso = i + "/" + n; });
    })(i);
    return chain.then(function () {
      if (conTexto || !n) return;
      // PDF escaneado: se intenta leer el nombre de cada particella en la imagen
      item.ocr = true; setProgreso(item, "Preparando la lectura de la imagen…");
      if (AREA.stage) render();
      return getOcr().then(function (worker) {
        var c2 = Promise.resolve();
        for (var i = 1; i <= n; i++) (function (i) {
          c2 = c2.then(function () { if (item.ocrSkip) return; setProgreso(item, "Leyendo la imagen de la página " + i + " de " + n + "…");
            return doc.getPage(i).then(function (page) { return ocrPage(worker, page, item); }).then(function (d) { dets[i - 1] = d; }); });
        })(i);
        return c2.then(function () { item.ocrHecho = !item.ocrSkip; });
      }).catch(function (e) { item.ocrError = (e && e.message) || "error"; });
    }).then(function () {
      item.thumbs = thumbs; item.dets = dets; item.conTexto = conTexto;
      // Cortes: empieza una particella nueva cuando cambia el instrumento o la voz de la cabecera
      var segs = [];
      dets.forEach(function (d, idx) {
        var cur = segs[segs.length - 1];
        if (!cur) segs.push({ start: idx, instrumento: d ? d.instrumento : item.instrumento, voces: d ? d.voces : item.voces });
        else if (d && d.ocr) segs.push({ start: idx, instrumento: d.instrumento, voces: d.voces }); // en un escaneo, cada cabecera leída abre particella
        else if (d && !d.guion && !sameDet(d, cur)) segs.push({ start: idx, instrumento: d.instrumento, voces: d.voces });
        else if (d && d.guion && cur.instrumento !== "Guion") segs.push({ start: idx, instrumento: "Guion", voces: [] });
      });
      if (segs.length > 1) { item.kind = "split"; item.segments = segs; item.origen = item.ocr ? "imagen" : "contenido"; }
      else {
        item.kind = "single";
        if (!item.instrumento && segs[0] && segs[0].instrumento) { item.instrumento = segs[0].instrumento; item.voces = segs[0].voces || []; item.origen = item.ocr ? "imagen" : "contenido"; }
        item.segments = [{ start: 0, instrumento: item.instrumento, voces: item.voces }];
      }
      item.status = "listo";
    });
  }).catch(function (e) { item.status = "listo"; item.kind = "single"; item.aviso = "No se ha podido leer el PDF por dentro (" + ((e && e.message) || "error") + "). Se subirá tal cual."; });
}
function segEnd(item, k) { return k + 1 < item.segments.length ? item.segments[k + 1].start - 1 : (item.paginas || 1) - 1; }
// Lista plana de particellas que saldrán de lo que hay preparado
function stagedParts(st) {
  var out = [];
  st.items.forEach(function (it) {
    if (it.status !== "listo") return;
    if (it.kind === "split") it.segments.forEach(function (s, k) { out.push({ item: it, seg: k, instrumento: s.instrumento, voces: s.voces || [], desde: s.start + 1, hasta: segEnd(it, k) + 1 }); });
    else out.push({ item: it, seg: -1, instrumento: it.instrumento, voces: it.voces || [] });
  });
  return out;
}

function obraEditor(o) {
  var key = o ? o.id : "nueva";
  if (!AREA.stage || AREA.stage.key !== key) {
    AREA.stage = { key: key, items: [], form: o ? { titulo: o.titulo || "", compositor: o.compositor || "", arreglista: o.arreglista || "", formacion: o.formacion || "Banda y Bandín",
      duracion: o.duracion || "", youtube: o.youtube || "", notas: o.notas || "", color: o.color || "", eventos: (o.eventos || []).slice() }
      : { titulo: "", compositor: "", arreglista: "", formacion: "Banda y Bandín", duracion: "", youtube: "", notas: "", color: "", eventos: [] } };
  }
  var st = AREA.stage, F = st.form;
  function inp(id, k, label, ph, type, help) {
    var el = type === "textarea" ? h("textarea", { id: id, placeholder: ph || null }) : h("input", { id: id, type: type || "text", placeholder: ph || null });
    el.value = F[k] || "";
    el.addEventListener("input", function () { F[k] = el.value; if (k === "titulo" || k === "compositor") { var cv = document.querySelector(".ed-cover"); if (cv) cv.replaceWith(edCover()); } });
    return h("div", { class: "field" }, h("label", { for: id, text: label }), el, help ? h("small", { text: help }) : null);
  }
  function edCover() { var c = obraCover({ titulo: F.titulo || "Título de la obra", compositor: F.compositor, color: F.color, id: key }, "md"); c.classList.add("ed-cover"); return c; }
  var formSel = h("select", { id: "ed-form" }, ["Banda y Bandín", "Banda", "Bandín"].map(function (f) { return h("option", { value: f, text: f === "Banda y Bandín" ? "Banda y Bandín (todos)" : "Solo " + f, selected: F.formacion === f || null }); }));
  formSel.addEventListener("change", function () { F.formacion = formSel.value; render(); });
  var t = todayStr(), lim = isoOf(addDays(new Date(), -120));
  var evs = DATA.eventos.filter(function (e) { return e.fecha >= lim || F.eventos.indexOf(e.id) >= 0; }).sort(function (a, b) { return a.fecha < b.fecha ? -1 : 1; });
  var colors = h("div", { class: "swatches", role: "radiogroup", "aria-label": "Color de la portada" }, [""].concat(COVER_COLORS).map(function (c) {
    return h("button", { type: "button", role: "radio", class: "sw" + (c ? "" : " auto"), style: c ? "background:" + c : null, "aria-checked": F.color === c ? "true" : "false", title: c ? c : "Automático",
      text: c ? "" : "A", onclick: function () { F.color = c; render(); } });
  }));
  var details = h("div", { class: "ed-card" },
    h("div", { class: "ed-top" }, edCover(),
      h("div", { class: "ed-fields" },
        inp("ed-titulo", "titulo", "Título *", "Intrada"),
        h("div", { class: "two" }, inp("ed-comp", "compositor", "Compositor", "Lorenzo Pusceddu"), inp("ed-arr", "arreglista", "Arreglo", "Opcional")),
        h("div", { class: "two" }, h("div", { class: "field" }, h("label", { for: "ed-form", text: "¿Quién la toca?" }), formSel), inp("ed-dur", "duracion", "Duración", "4:30")))),
    h("div", { class: "field" }, h("span", { class: "flabel", text: "Color de la portada" }), colors),
    inp("ed-yt", "youtube", "Vídeo o grabación de referencia", "https://www.youtube.com/watch?v=…", "url", "Si es de YouTube se verá dentro de la obra."),
    inp("ed-notas", "notas", "Notas de la dirección", "Tempo, repeticiones, cortes…", "textarea"),
    h("div", { class: "field" }, h("span", { class: "flabel", text: "Se toca en" }),
      evs.length ? h("div", { class: "ev-checks" }, evs.map(function (e) {
        var cb = h("input", { type: "checkbox", id: "ed-ev-" + e.id, checked: F.eventos.indexOf(e.id) >= 0 || null });
        cb.addEventListener("change", function () { var i = F.eventos.indexOf(e.id); if (cb.checked && i < 0) F.eventos.push(e.id); if (!cb.checked && i >= 0) F.eventos.splice(i, 1); });
        return h("label", { class: "ev-check" + (e.fecha < t ? " past" : ""), for: "ed-ev-" + e.id }, cb, h("span", null, h("b", { text: e.titulo }), h("small", { text: fmtLong(e.fecha) + (e.tipo ? " · " + e.tipo : "") })));
      })) : h("p", { class: "muted small" }, "No hay eventos. Créalos en ", h("a", { href: "#admin-eventos", text: "Administración → Eventos" }), ".")));

  // Particellas ya subidas
  var saved = o ? PRIV.partes.filter(function (p) { return p.obra_id === o.id; }).sort(parteSort) : [];
  var savedBox = o ? h("div", { class: "ed-card" }, h("h2", { text: "Particellas subidas (" + saved.length + ")" }),
    saved.length ? h("div", { class: "parts-table" }, saved.map(function (p) { return savedPartRow(p, o); })) : h("p", { class: "muted", text: "Todavía no hay ninguna." })) : null;

  // Subida
  var fileIn = h("input", { type: "file", id: "ed-files", multiple: true, accept: "application/pdf,image/jpeg,image/png,audio/*", class: "sr-only" });
  fileIn.addEventListener("change", function () { addFiles(Array.prototype.slice.call(fileIn.files || [])); fileIn.value = ""; });
  var drop = h("label", { class: "dropzone", for: "ed-files" }, icon("subir"), h("b", { text: "Arrastra aquí las particellas o pulsa para elegirlas" }),
    h("span", { text: "PDF (sueltos o uno con todas las particellas), imágenes o audio · hasta 25 MB por archivo" }), fileIn);
  ["dragenter", "dragover"].forEach(function (evn) { drop.addEventListener(evn, function (ev) { ev.preventDefault(); drop.classList.add("over"); }); });
  ["dragleave", "drop"].forEach(function (evn) { drop.addEventListener(evn, function (ev) { ev.preventDefault(); drop.classList.remove("over"); }); });
  drop.addEventListener("drop", function (ev) { addFiles(Array.prototype.slice.call((ev.dataTransfer && ev.dataTransfer.files) || [])); });

  var staged = stagedParts(st);
  var cov = cobertura(o || { formacion: F.formacion }, staged.map(function (s) { return { instrumento: s.instrumento, voces: s.voces }; }));
  var stBox = statusEl();
  var saveBtn = h("button", { class: "btn primary", type: "button", text: staged.length ? "Guardar y subir " + staged.length + (staged.length === 1 ? " particella" : " particellas") : (o ? "Guardar cambios" : "Crear obra") });
  saveBtn.addEventListener("click", function () { saveObra(o, saveBtn, stBox); });
  var analizando = st.items.some(function (it) { return it.status !== "listo"; });
  if (analizando) saveBtn.disabled = true;

  var upload = h("div", { class: "ed-card" }, h("h2", { text: o ? "Añadir particellas" : "Particellas" }), drop,
    st.items.length ? h("div", { class: "staged" }, st.items.map(function (it, idx) { return stagedItem(it, idx, o, F); })) : null,
    h("div", { class: "cov-box" + (cov.sin.length ? " warn" : " ok") },
      h("b", { text: cov.total ? (cov.sin.length ? cov.con + " de " + cov.total + " músicos tendrán su partitura" : "Los " + cov.total + " músicos tendrán su partitura") : "Todavía no hay músicos en la plantilla de esta formación." }),
      cov.sin.length ? h("p", null, "Sin partitura: ", cov.sin.map(function (m) { return m.nombre.split(" ")[0] + " (" + m.instrumento + (m.voz ? " " + vocesTxt([INST.normVoz(m.voz)]) : "") + ")"; }).join(", "), ".") : null));

  var flash = null;
  if (FLASH && FLASH.col === "obra") { flash = h("p", { class: "status ok", role: "status", text: FLASH.msg }); FLASH = null; }
  return h("div", { class: "editor" },
    h("a", { class: "back", href: "#musicos-gestion" }, icon("atras"), "Partituras"), flash,
    h("div", { class: "ag-head" }, h("h1", { text: o ? "Editar obra" : "Nueva obra" }), o ? h("a", { class: "btn ghost small", href: "#musicos-obra~" + o.id, text: "Ver como músico" }) : null),
    details, savedBox, upload,
    o ? obraPeticiones(o) : null,
    h("div", { class: "ed-actions" }, saveBtn, o ? h("div", { class: "danger-zone" }, deleteButton(function (b) { deleteObra(o, b); })) : null, stBox));
}
function addFiles(files) {
  var st = AREA.stage; if (!st || !files.length) return;
  files.forEach(function (f) {
    if (f.size > 25 * 1024 * 1024) { st.items.push({ id: newId(), file: f, status: "listo", kind: "single", instrumento: "", voces: [], error: "Pesa más de 25 MB y no se puede subir." }); return; }
    var it = { id: newId(), file: f, status: "analizando", kind: "single", instrumento: "", voces: [] };
    st.items.push(it);
    analyzeFile(it).then(function () { if (AREA.stage === st) render(); });
  });
  render();
}
function instSelect(id, value, onchange) {
  var s = h("select", { id: id, "aria-label": "Instrumento" }, h("option", { value: "", text: "— Elige instrumento —" }),
    INST.lista.concat(["Todos"]).map(function (n) { return h("option", { value: n, text: n === "Guion" ? "Guion (dirección)" : n === "Todos" ? "Para todos" : n, selected: value === n || null }); }));
  s.addEventListener("change", function () { onchange(s.value); });
  return s;
}
function vozInput(id, voces, onchange) {
  var i = h("input", { id: id, type: "text", class: "voz-in", placeholder: "Todas", "aria-label": "Voz", value: (voces || []).join(", "), title: "Voz: 1, 2, 3… Varias separadas por comas. Vacío = todas las voces" });
  i.addEventListener("change", function () { onchange(i.value.split(/[,y\s\-\/]+/).map(function (x) { return INST.normVoz(x); }).filter(Boolean)); });
  return i;
}
function recipientsChips(part, F) {
  var obra = { formacion: F ? F.formacion : "Banda y Bandín" };
  if (!part.instrumento) return h("span", { class: "rcp warn", text: "Elige el instrumento" });
  if (part.instrumento === "Guion") return h("span", { class: "rcp", text: "Dirección" });
  var list = destinatarios(part, obra);
  if (!list.length) return h("span", { class: "rcp warn", text: "Nadie de la plantilla toca esto" });
  return h("span", { class: "rcp ok", title: list.map(function (m) { return m.nombre; }).join(", ") }, "→ ", list.slice(0, 4).map(function (m) { return m.nombre.split(" ")[0]; }).join(", ") + (list.length > 4 ? " y " + (list.length - 4) + " más" : ""));
}
function stagedItem(it, idx, o, F) {
  var st = AREA.stage;
  var remove = h("button", { type: "button", class: "ico-btn", "aria-label": "Quitar " + it.file.name, title: "Quitar", onclick: function () { st.items.splice(idx, 1); render(); } }, icon("no"));
  var head = h("div", { class: "si-head" }, h("span", { class: "f-ic", "aria-hidden": "true", text: it.kind === "split" ? "📚" : instEmoji(it.instrumento) }),
    h("div", { class: "si-name" }, h("b", { text: it.file.name }), h("small", { text: [Math.round(it.file.size / 1024) + " KB", it.paginas ? it.paginas + (it.paginas === 1 ? " página" : " páginas") : "",
      it.status !== "listo" ? null : it.kind === "split" ? "Contiene " + it.segments.length + " particellas" : it.origen === "nombre" ? "Reconocido por el nombre" : it.origen === "contenido" ? "Reconocido por el contenido" : it.origen === "imagen" ? "Reconocido leyendo la imagen" : "No reconocido: elige el instrumento"].filter(Boolean).join(" · ") }),
      it.status !== "listo" ? h("small", { class: "si-prog", id: "si-p-" + it.id, text: it.progreso || "Leyendo el PDF…" }) : null),
    remove);
  var box = h("div", { class: "staged-item" + (it.status !== "listo" ? " loading" : "") + (it.error ? " bad" : "") }, head);
  if (it.error) { add(box, h("p", { class: "status err", text: it.error })); return box; }
  if (it.aviso) add(box, h("p", { class: "muted small", text: it.aviso }));
  if (it.status !== "listo") {
    if (it.ocr) add(box, h("div", { class: "ocr-run" }, h("span", { class: "spin", "aria-hidden": "true" }),
      h("p", { class: "muted small", text: "Este PDF está escaneado (no tiene texto), así que la web está leyendo la imagen de cada página para encontrar el nombre de cada particella. Puede tardar un par de segundos por página." }),
      h("button", { type: "button", class: "btn ghost small", text: "Saltar y marcar a mano", onclick: function (ev) { it.ocrSkip = true; ev.currentTarget.disabled = true; ev.currentTarget.textContent = "Parando…"; } })));
    return box;
  }
  if (it.ocrError) add(box, h("p", { class: "muted small", text: "No se ha podido leer la imagen (" + it.ocrError + "). Marca las particellas a mano." }));
  if (it.kind !== "split") {
    add(box, h("div", { class: "si-assign" },
      instSelect("si-i-" + it.id, it.instrumento, function (v) { it.instrumento = v; it.segments = [{ start: 0, instrumento: v, voces: it.voces }]; render(); }),
      vozInput("si-v-" + it.id, it.voces, function (v) { it.voces = v; render(); }),
      recipientsChips(it, F),
      it.paginas > 1 && it.thumbs ? h("button", { type: "button", class: "linkish", text: "Dividir por páginas…", onclick: function () {
        it.kind = "split"; it.segments = [{ start: 0, instrumento: it.instrumento, voces: it.voces }]; render(); } }) : null));
    return box;
  }
  // PDF con varias particellas: páginas con su corte
  add(box, h("p", { class: "muted small", text: it.conTexto ? "La web ha leído la cabecera de cada página y ha encontrado dónde empieza cada particella. Revisa los cortes: pulsa «✂» en una página para empezar ahí otra particella."
    : it.ocrHecho ? "Este PDF está escaneado: la web ha leído la imagen de cada página y ha propuesto estos cortes. Al leer imágenes puede equivocarse, así que revisa bien cada instrumento y su voz. Pulsa «✂» para empezar otra particella en una página o «Unir con la anterior» para quitar un corte."
    : "Este PDF no tiene texto (está escaneado). Marca con «✂» la primera página de cada particella y elige su instrumento." }));
  var startMap = {}; it.segments.forEach(function (s, k) { startMap[s.start] = k; });
  var grid = h("div", { class: "pages" });
  var curSeg = -1;
  for (var p = 0; p < (it.paginas || 0); p++) (function (p) {
    if (startMap[p] !== undefined) curSeg = startMap[p];
    var k = curSeg, s = it.segments[k], isStart = startMap[p] !== undefined;
    var card = h("div", { class: "pg" + (isStart ? " start" : "") + " seg-" + (k % 6) },
      h("div", { class: "pg-thumb" }, it.thumbs && it.thumbs[p] ? h("img", { src: it.thumbs[p], alt: "Página " + (p + 1) }) : h("span", { text: "Pág. " + (p + 1) }), h("span", { class: "pg-n", text: String(p + 1) })),
      isStart ? h("div", { class: "pg-seg" },
        instSelect("pg-i-" + it.id + "-" + p, s.instrumento, function (v) { s.instrumento = v; render(); }),
        vozInput("pg-v-" + it.id + "-" + p, s.voces, function (v) { s.voces = v; render(); }),
        p > 0 ? h("button", { type: "button", class: "linkish", text: "Unir con la anterior", onclick: function () { it.segments.splice(k, 1); render(); } }) : null)
        : h("div", { class: "pg-cont" }, h("span", { class: "muted small", text: "↳ " + (s.instrumento ? parteNombre(s) : "sigue") }),
          h("button", { type: "button", class: "cut", title: "Empieza aquí otra particella", "aria-label": "Empieza en la página " + (p + 1) + " otra particella", onclick: function () {
            var d = it.dets && it.dets[p];
            it.segments.push({ start: p, instrumento: d ? d.instrumento : "", voces: d ? d.voces : [] });
            it.segments.sort(function (a, b) { return a.start - b.start; }); render(); } }, "✂")));
    add(grid, card);
  })(p);
  add(box, grid, h("div", { class: "seg-summary" }, it.segments.map(function (s, k) {
    var e = segEnd(it, k);
    return h("div", { class: "seg-line seg-" + (k % 6) }, h("span", { class: "seg-dot" }), h("b", { text: s.instrumento ? parteNombre(s) : "Sin instrumento" }),
      h("small", { text: "Páginas " + (s.start + 1) + (e > s.start ? "–" + (e + 1) : "") }), recipientsChips(s, F));
  })), h("button", { type: "button", class: "linkish", text: "No dividir: subir el PDF entero como un solo archivo", onclick: function () { it.kind = "single"; render(); } }));
  return box;
}
function savedPartRow(p, o) {
  var st = statusEl();
  function save(patch) {
    var datos = Object.assign({}, p, patch); delete datos.id;
    SB.from("interno").upsert({ coleccion: "partes", id: p.id, datos: datos }).then(check).then(function () { Object.assign(p, patch); setStatus(st, "Guardado", true); render(); }, function (e) { setStatus(st, errMsg(e), false); });
  }
  return h("div", { class: "pt-row" },
    h("span", { class: "f-ic", "aria-hidden": "true", text: instEmoji(p.instrumento) }),
    h("div", { class: "pt-file" }, h("b", { text: parteNombre(p) }), h("small", { text: [p.archivo, p.paginas ? p.paginas + " pág." : ""].filter(Boolean).join(" · ") })),
    instSelect("pt-i-" + p.id, p.instrumento, function (v) { save({ instrumento: v }); }),
    vozInput("pt-v-" + p.id, p.voces, function (v) { save({ voces: v }); }),
    recipientsChips(p, o),
    h("div", { class: "acts" },
      h("button", { type: "button", class: "ico-btn", "aria-label": "Abrir " + parteNombre(p), title: "Abrir", onclick: function (ev) { openParte(p, ev.currentTarget); } }, icon("pdf")),
      deleteButton(function (b) {
        SB.storage.from("partituras").remove([p.path]).then(function () { return SB.from("interno").delete().eq("coleccion", "partes").eq("id", p.id).then(check); })
          .then(reloadPrivate, function (e) { b.disabled = false; b.textContent = "Borrar"; alert2(b, errMsg(e)); });
      })), st);
}
function saveObra(o, btn, stBox) {
  var st = AREA.stage, F = st.form;
  if (!String(F.titulo || "").trim()) { setStatus(stBox, "Escribe el título de la obra.", false); var ti = document.getElementById("ed-titulo"); if (ti) ti.focus(); return; }
  if (F.youtube && !safeUrl(F.youtube.trim())) { setStatus(stBox, "El enlace del vídeo debe empezar por https://", false); return; }
  var parts = stagedParts(st);
  var falta = parts.filter(function (p) { return !p.instrumento; });
  if (falta.length) { setStatus(stBox, "Elige el instrumento de: " + falta.map(function (p) { return p.item.file.name + (p.seg >= 0 ? " (pág. " + p.desde + ")" : ""); }).join(", ") + ".", false); return; }
  var id = o ? o.id : newId(), now = new Date().toISOString();
  var datos = { titulo: F.titulo.trim(), compositor: (F.compositor || "").trim(), arreglista: (F.arreglista || "").trim(), formacion: F.formacion, duracion: (F.duracion || "").trim(),
    youtube: (F.youtube || "").trim(), notas: (F.notas || "").trim(), color: F.color || "", eventos: F.eventos.slice(), creado: (o && o.creado) || now, actualizado: now };
  btn.disabled = true; btn.textContent = "Guardando la obra…";
  var subidas = 0;
  SB.from("interno").upsert({ coleccion: "obras", id: id, datos: datos }).then(check).then(function () {
    var splitDocs = {};
    return parts.reduce(function (pr, part, n) {
      return pr.then(function () {
        btn.textContent = "Subiendo " + (n + 1) + " de " + parts.length + "…";
        var it = part.item, blobP, paginas = it.paginas || null;
        if (part.seg >= 0) {
          blobP = getPdfLib().then(function (PDFLib) {
            if (!splitDocs[it.id]) splitDocs[it.id] = PDFLib.PDFDocument.load(it.buf.slice(0), { ignoreEncryption: true });
            return splitDocs[it.id].then(function (src) {
              return PDFLib.PDFDocument.create().then(function (out) {
                var idxs = []; for (var q = part.desde - 1; q <= part.hasta - 1; q++) idxs.push(q);
                return out.copyPages(src, idxs).then(function (pages) { pages.forEach(function (pg) { out.addPage(pg); }); out.setTitle(datos.titulo + " - " + parteNombre(part)); return out.save(); });
              });
            });
          }).then(function (bytes) { paginas = part.hasta - part.desde + 1; return new Blob([bytes], { type: "application/pdf" }); });
        } else blobP = Promise.resolve(it.file);
        return blobP.then(function (blob) {
          var ext = part.seg >= 0 ? "pdf" : ((String(it.file.name).split(".").pop() || "pdf").toLowerCase().replace(/[^a-z0-9]/g, "") || "pdf");
          var path = "obras/" + id + "/" + newId() + "." + ext;
          var tipo = part.seg >= 0 ? "application/pdf" : (it.file.type || "");
          return SB.storage.from("partituras").upload(path, blob, { contentType: tipo || undefined, upsert: false }).then(function (r) {
            if (r.error) throw r.error;
            return SB.from("interno").insert({ coleccion: "partes", id: newId(), datos: {
              obra_id: id, instrumento: part.instrumento, voces: part.voces || [], path: path,
              archivo: part.seg >= 0 ? it.file.name.replace(/\.pdf$/i, "") + " (" + parteNombre(part) + ").pdf" : it.file.name,
              etiqueta: part.instrumento === "Todos" ? it.file.name.replace(/\.[a-z0-9]+$/i, "") : "",
              tipo: tipo, paginas: paginas, tam: blob.size, creado: new Date().toISOString() } });
          }).then(check).then(function () { subidas++; });
        });
      });
    }, Promise.resolve());
  }).then(function () {
    AREA.stage = null;
    FLASH = { col: "obra", msg: subidas ? "Obra guardada y " + subidas + (subidas === 1 ? " particella subida." : " particellas subidas y repartidas.") : "Obra guardada." };
    return loadPrivate().then(function () { if (!o) location.hash = "#musicos-editar~" + id; else render(); });
  }, function (e) {
    btn.disabled = false; btn.textContent = "Reintentar";
    // Lo ya subido no se repite
    if (subidas) { var done = parts.slice(0, subidas); st.items = st.items.filter(function (it) { return !done.some(function (d) { return d.item === it && d.seg < 0; }); }); }
    setStatus(stBox, (subidas ? subidas + " subidas. " : "") + errMsg(e), false);
    loadPrivate();
  });
}
function deleteObra(o, b) {
  var partes = PRIV.partes.filter(function (p) { return p.obra_id === o.id; });
  var paths = partes.map(function (p) { return p.path; });
  (paths.length ? SB.storage.from("partituras").remove(paths) : Promise.resolve()).then(function () {
    return Promise.all(partes.map(function (p) { return SB.from("interno").delete().eq("coleccion", "partes").eq("id", p.id).then(check); }));
  }).then(function () { return SB.from("interno").delete().eq("coleccion", "obras").eq("id", o.id).then(check); })
    .then(function () { AREA.stage = null; return loadPrivate(); }).then(function () { location.hash = "#musicos-gestion"; },
      function (e) { b.disabled = false; b.textContent = "Borrar"; alert2(b, errMsg(e)); });
}

/* =====================================================================
   AVISOS (anuncios y novedades)
   ===================================================================== */
function areaAvisos() {
  var me = myMusico(), nov = novedades();
  var list = PRIV.anuncios.filter(function (a) { return IS_ADMIN || anuncioParaMi(a, me); })
    .sort(function (a, b) { return (b.creado || "") < (a.creado || "") ? -1 : 1; });
  setTimeout(marcarAvisosVistos, 1500);
  var obrasNuevas = nov.filter(function (n) { return n.tipo === "partitura"; });
  var main = h("div", null,
    h("div", { class: "ag-head" }, h("h1", { text: "Avisos" })),
    obrasNuevas.length ? h("section", { class: "nov" }, h("h2", { text: "Partituras nuevas" }), obrasNuevas.slice(0, 8).map(function (n) {
      return h("a", { class: "nov-row" + (n.nuevo ? " nuevo" : ""), href: "#musicos-obra~" + n.o.id }, obraCover(n.o, "xs"),
        h("div", null, h("b", { text: n.o.titulo }), h("small", { text: (IS_ADMIN ? "Subida el " : "Ya tienes tu partitura · ") + fmtLong(String(n.fecha).slice(0, 10)) })), n.nuevo ? h("span", { class: "new-dot", text: "Nuevo" }) : null);
    })) : null,
    h("section", null, h("h2", { text: "Anuncios" }),
      list.length ? h("div", { class: "anuncios" }, list.map(function (a) { var c = anuncioCard(a, false); if (nov.some(function (n) { return n.a === a && n.nuevo; })) c.classList.add("nuevo"); return c; }))
        : h("div", { class: "empty" }, h("p", { text: "Todavía no hay anuncios." }))));
  if (!IS_ADMIN) return main;
  return h("div", { class: "admin-grid" }, main, anuncioForm());
}
function anuncioCard(a, compact) {
  var com = PRIV.coments[a.id] || [];
  var card = h("article", { class: "anuncio" },
    h("div", { class: "an-meta" },
      h("span", { class: "pill", text: a.destinatarios && a.destinatarios !== "Todos" ? "Solo " + a.destinatarios : "Para todos" }),
      h("span", { text: (a.creado ? fmtLong(String(a.creado).slice(0, 10)) : "") + (a.autor ? " · " + a.autor : "") })),
    h("h3", { text: a.titulo }),
    a.texto ? h("p", { class: "an-text", text: compact ? excerpt(a.texto, 220) : a.texto }) : null);
  if (compact) { add(card, h("a", { class: "small-link", href: "#musicos-avisos", text: com.length ? com.length + (com.length === 1 ? " comentario" : " comentarios") + " →" : "Comentar →" })); return card; }
  if (IS_ADMIN) add(card, h("div", { class: "acts", style: "margin-top:4px" },
    h("button", { class: "btn ghost small", type: "button", text: "Editar", onclick: function () { AREA.editAnuncio = a.id; render(); window.scrollTo(0, 0); } }),
    deleteButton(function (b) {
      SB.from("interno").delete().eq("coleccion", "anuncios").eq("id", a.id).then(check).then(reloadPrivate, function (e) { b.disabled = false; b.textContent = "Borrar"; alert2(b, errMsg(e)); });
    })));
  var input = h("input", { type: "text", id: "com-" + a.id, placeholder: "Escribe un comentario…", maxlength: "2000", "aria-label": "Comentario" });
  var send = h("button", { class: "btn primary small", type: "submit", text: "Enviar" });
  var f = h("form", { class: "com-form" }, input, send);
  f.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var t = input.value.trim(); if (!t) return;
    if (simBlock(send)) return;
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
function anuncioForm() {
  var cur = AREA.editAnuncio ? PRIV.anuncios.filter(function (a) { return a.id === AREA.editAnuncio; })[0] : null;
  var st = statusEl();
  var titulo = h("input", { id: "an-titulo", type: "text", value: (cur && cur.titulo) || "" });
  var texto = h("textarea", { id: "an-texto" }); texto.value = (cur && cur.texto) || "";
  var dest = h("select", { id: "an-dest" }, ["Todos", "Banda", "Bandín"].map(function (d) { return h("option", { value: d, text: d === "Todos" ? "Todos los músicos" : "Solo " + d, selected: cur && cur.destinatarios === d || null }); }));
  var avisarCb = h("input", { type: "checkbox", id: "an-avisar", checked: true });
  var btn = h("button", { class: "btn primary", type: "submit", text: cur ? "Guardar cambios" : "Publicar anuncio" });
  var form = h("form", { class: "aform", novalidate: true }, h("h3", { text: cur ? "Editar anuncio" : "Nuevo anuncio" }),
    h("div", { class: "field" }, h("label", { for: "an-titulo", text: "Título *" }), titulo),
    h("div", { class: "field" }, h("label", { for: "an-texto", text: "Texto" }), texto),
    h("div", { class: "field" }, h("label", { for: "an-dest", text: "Para" }), dest),
    cur ? null : h("label", { class: "check notif-check", for: "an-avisar" }, avisarCb, h("span", null, h("b", { text: "🔔 Avisar al móvil" }), h("small", { text: " A quien tenga los avisos activados." }))),
    h("div", { class: "form-acts" }, btn, cur ? h("button", { class: "btn ghost", type: "button", text: "Cancelar", onclick: function () { AREA.editAnuncio = null; render(); } }) : null), st);
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!titulo.value.trim()) { setStatus(st, "Escribe un título.", false); return; }
    btn.disabled = true;
    var datos = { titulo: titulo.value.trim(), texto: texto.value.trim(), destinatarios: dest.value,
      autor: (cur && cur.autor) || displayName(), creado: (cur && cur.creado) || new Date().toISOString() };
    var aid = cur ? cur.id : newId();
    SB.from("interno").upsert({ coleccion: "anuncios", id: aid, datos: datos }).then(check)
      .then(function () {
        if (!cur && avisarCb.checked) avisosFn({ action: "anuncio", id: aid }).then(function (d) { if (d && d.enviados) console.info("Aviso enviado a", d.personas); }, function (e) { console.warn(e.message); });
        AREA.editAnuncio = null; return reloadPrivate();
      }, function (e) { btn.disabled = false; setStatus(st, errMsg(e), false); });
  });
  return form;
}

/* =====================================================================
   SUGERENCIAS (solo las leen los administradores)
   ===================================================================== */
var SUG_CATS = ["General", "Ensayos", "Repertorio", "Conciertos y salidas", "Escuela", "Instalaciones y material", "Otro"];
function areaSugerencias() {
  var st = statusEl(), me = myMusico();
  var cat = h("select", { id: "sg-cat" }, SUG_CATS.map(function (c) { return h("option", { value: c, text: c }); }));
  var txt = h("textarea", { id: "sg-txt", maxlength: "3000", placeholder: "Cuéntanos tu idea, propuesta o queja…" });
  var anon = h("input", { type: "checkbox", id: "sg-anon" });
  var btn = h("button", { class: "btn primary", type: "submit", text: "Enviar sugerencia" });
  var form = h("form", { class: "aform sg-form", style: "position:static", novalidate: true },
    h("h3", { text: "Envía una sugerencia" }),
    h("p", { class: "sg-priv" }, icon("ojo"), "Solo la leen los administradores de la asociación. No la ve ningún otro músico."),
    h("div", { class: "field" }, h("label", { for: "sg-cat", text: "Tema" }), cat),
    h("div", { class: "field" }, h("label", { for: "sg-txt", text: "Tu sugerencia *" }), txt),
    h("label", { class: "check", for: "sg-anon" }, anon, h("span", { text: "No mostrar mi nombre" })),
    h("div", { class: "form-acts" }, btn), st);
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!txt.value.trim()) { setStatus(st, "Escribe tu sugerencia.", false); return; }
    if (simBlock(btn)) return;
    btn.disabled = true;
    SB.from("sugerencias").insert({ user_id: SESSION.user.id, autor: anon.checked ? "Anónimo" : displayName(), anonima: anon.checked, categoria: cat.value, texto: txt.value.trim() })
      .then(check).then(function () { FLASH = { col: "sug", msg: "¡Gracias! Tu sugerencia ha llegado a la directiva." }; return reloadPrivate(); },
        function (e) { btn.disabled = false; setStatus(st, errMsg(e), false); });
  });
  if (FLASH && FLASH.col === "sug") { setStatus(st, FLASH.msg, true); FLASH = null; }
  var all = (PRIV.sugerencias || []).slice().reverse();
  var mias = all.filter(function (x) { return SESSION && x.user_id === SESSION.user.id && !simulando(); });
  function sugCard(x, admin) {
    return h("article", { class: "sug" + (admin && !x.leida ? " nueva" : "") },
      h("div", { class: "sug-meta" }, h("span", { class: "pill", text: x.categoria || "General" }),
        h("span", { text: (admin ? (x.anonima ? "Anónimo" : x.autor) + " · " : "") + fmtLong(String(x.creado).slice(0, 10)) }),
        admin && !x.leida ? h("span", { class: "new-dot", text: "Nueva" }) : null),
      h("p", { text: x.texto }),
      h("div", { class: "acts" },
        admin && !x.leida ? h("button", { class: "btn ghost small", type: "button", text: "Marcar como leída", onclick: function (ev) {
          ev.currentTarget.disabled = true; SB.from("sugerencias").update({ leida: true }).eq("id", x.id).then(check).then(reloadPrivate); } }) : null,
        !admin ? h("small", { class: "muted", text: x.leida ? "✓ Leída por la directiva" : "Enviada" }) : null,
        deleteButton(function (b) { SB.from("sugerencias").delete().eq("id", x.id).then(check).then(reloadPrivate, function (e) { b.disabled = false; b.textContent = "Borrar"; alert2(b, errMsg(e)); }); })));
  }
  var left;
  if (IS_ADMIN) {
    var f = AREA.sugFiltro || "nuevas";
    var list = all.filter(function (x) { return f === "todas" || !x.leida; });
    left = h("div", null,
      h("div", { class: "ag-head" }, h("h1", { text: "Sugerencias recibidas" })),
      h("div", { class: "chips" }, [["nuevas", "Sin leer"], ["todas", "Todas"]].map(function (o) {
        return h("button", { type: "button", class: "chip", "aria-pressed": f === o[0] ? "true" : "false", text: o[1] + (o[0] === "nuevas" ? " (" + all.filter(function (x) { return !x.leida; }).length + ")" : " (" + all.length + ")"), onclick: function () { AREA.sugFiltro = o[0]; render(); } });
      })),
      list.length ? h("div", { class: "sugs" }, list.map(function (x) { return sugCard(x, true); })) : h("div", { class: "empty" }, h("p", { text: f === "nuevas" ? "No hay sugerencias sin leer." : "Todavía no ha llegado ninguna sugerencia." })));
  } else {
    left = h("div", null, h("div", { class: "ag-head" }, h("h1", { text: "Sugerencias" })),
      h("p", { class: "muted", style: "margin-bottom:16px", text: "¿Tienes una idea para los ensayos, el repertorio o la asociación? Escríbela aquí: llega directamente a la directiva." }),
      mias.length ? h("div", null, h("h2", { text: "Tus sugerencias", style: "margin-bottom:10px" }), h("div", { class: "sugs" }, mias.map(function (x) { return sugCard(x, false); }))) : null);
  }
  return h("div", { class: "admin-grid" }, left, me || !IS_ADMIN ? form : h("div"));
}

/* =====================================================================
   PERFIL
   ===================================================================== */
function areaPerfil() {
  var me = myMusico(), st = statusEl(), t = todayStr();
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
  var stats = null;
  if (me) {
    var evs = areaEvents(), past = evs.filter(function (e) { return e.fecha < t; }), up = evs.filter(function (e) { return e.fecha >= t; });
    var marc = past.filter(function (e) { var v = (PRIV.pase[e.id] || {})[SESSION.user.id]; return v === true || v === false; });
    var pres = marc.filter(function (e) { return (PRIV.pase[e.id] || {})[SESSION.user.id] === true; }).length;
    var resp = up.filter(function (e) { return myAnswer(e.id); }).length;
    var nObras = PRIV.obras.filter(function (o) { return misPartes(o.id, me).length; }).length;
    stats = h("div", { class: "stats" },
      h("div", { class: "stat" }, h("b", { text: marc.length ? Math.round(100 * pres / marc.length) + "%" : "—" }), h("span", { text: "Asistencia" }), h("small", { text: marc.length ? pres + " de " + marc.length + " eventos con lista" : "Todavía sin datos" })),
      h("div", { class: "stat" }, h("b", { text: resp + "/" + up.length }), h("span", { text: "Respondidas" }), h("small", { text: "Próximas convocatorias" })),
      h("div", { class: "stat" }, h("b", { text: String(nObras) }), h("span", { text: "Obras" }), h("small", { text: "con tu partitura" })));
  }
  function kv(k, v) { return v ? h("div", { class: "kv" }, h("span", { class: "k", text: k }), h("span", { class: "v", text: v })) : null; }
  var musForm = IS_ADMIN ? perfilMusicoForm(me) : null;
  return h("div", { class: "perfil" },
    h("div", { class: "pf-head" }, me ? personAvatar(me, "azul", "pf-av") : h("span", { class: "pf-av", text: initials(displayName()) }),
      h("div", null, h("h1", { text: me ? me.nombre : displayName() }),
        h("p", { class: "muted", text: me ? [INST.canonical(me.instrumento) + (me.voz ? " " + vocesTxt([INST.normVoz(me.voz)]) : ""), me.formacion, isJefe(me) ? "Jefe de sección" : isDirectorM(me) ? "Dirección" : ""].filter(Boolean).join(" · ") : "Administración: ves todas las convocatorias y partituras" })),
      h("button", { class: "btn ghost small", type: "button", style: "margin-left:auto", text: "Cerrar sesión", onclick: function () { SB.auth.signOut(); } })),
    stats,
    h("div", { class: "admin-grid" },
      h("div", { class: "cbox" },
        kv("Usuario", me && me.usuario), kv("Correo", SESSION.user && SESSION.user.email), kv("Formación", me && me.formacion),
        kv("Instrumento", me && me.instrumento), kv("Voz", me && me.voz ? vocesTxt([INST.normVoz(me.voz)]) : (me ? "Todas las de tu instrumento" : "")),
        IS_ADMIN ? null : h("p", { class: "muted small", text: "Tu instrumento y tu voz deciden qué partituras ves. Si algo no es correcto, pídeselo a la junta." }),
        musForm),
      h("div", { class: "pf-side" }, pushCard(false), form)));
}
/* Un administrador también es músico: puede crear o cambiar su propia ficha */
function perfilMusicoForm(me) {
  var st = statusEl();
  var nombre = h("input", { id: "pm-nombre", type: "text", value: (me && me.nombre) || "" });
  var formSel = h("select", { id: "pm-form" }, ["Banda", "Bandín", "Banda y Bandín"].map(function (f) { return h("option", { value: f, text: f, selected: (me ? me.formacion === f : f === "Banda") || null }); }));
  var inst = h("input", { id: "pm-inst", type: "text", list: "pm-insts", autocomplete: "off", value: (me && me.instrumento) || "", placeholder: "Vacío si diriges y no tocas" });
  var dl = h("datalist", { id: "pm-insts" }, INSTRUMENTOS.map(function (o) { return h("option", { value: o }); }));
  var voz = h("input", { id: "pm-voz", type: "text", value: (me && me.voz) || "", placeholder: "1, 2, 3… (opcional)" });
  var cargo = h("select", { id: "pm-cargo" }, ["Músico", "Jefe de sección", "Director"].map(function (c) { return h("option", { value: c, text: c === "Director" ? "Director (recibe el guion)" : c, selected: (me && (me.cargo || "Músico") === c) || null }); }));
  var btn = h("button", { class: "btn primary", type: "submit", text: me ? "Guardar mi ficha de músico" : "Crear mi ficha de músico" });
  var form = h("form", { class: "pm-form" }, h("h3", { text: me ? "Tu ficha de músico" : "Cuenta también como músico" }),
    me ? null : h("p", { class: "muted small", text: "Así podrás responder a las convocatorias, salir en la lista de asistencia y en la plantilla, y recibir las partituras de tu instrumento." }),
    h("div", { class: "field" }, h("label", { for: "pm-nombre", text: "Nombre y apellidos *" }), nombre),
    h("div", { class: "two" }, h("div", { class: "field" }, h("label", { for: "pm-form", text: "Toca en" }), formSel), h("div", { class: "field" }, h("label", { for: "pm-cargo", text: "Cargo" }), cargo)),
    h("div", { class: "two" }, h("div", { class: "field" }, h("label", { for: "pm-inst", text: "Instrumento" }), inst, dl), h("div", { class: "field" }, h("label", { for: "pm-voz", text: "Voz" }), voz)),
    h("div", { class: "form-acts" }, btn), st);
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!inst.value.trim() && cargo.value === "Director") inst.value = "Dirección";
    if (!nombre.value.trim() || !inst.value.trim()) { setStatus(st, "Escribe tu nombre y tu instrumento (si diriges y no tocas, elige el cargo Director).", false); return; }
    btn.disabled = true;
    var datos = Object.assign({}, me || {}, { nombre: nombre.value.trim(), formacion: formSel.value, instrumento: inst.value.trim(), voz: voz.value.trim(), cargo: cargo.value, user_id: SESSION.user.id });
    delete datos.id;
    if (!datos.voz) delete datos.voz;
    SB.from("contenido").upsert({ coleccion: "musicos", id: me ? me.id : SESSION.user.id, datos: datos }).then(check)
      .then(function () { return loadAll(); }).then(function () { return reloadPrivate(); }, function (e) { btn.disabled = false; setStatus(st, errMsg(e), false); });
  });
  return form;
}

/* ---------- Panel: tareas de la directiva ---------- */
var TAREAS = { loaded: false, loading: false, list: [], error: "", edit: null, aviso: null, nueva: false };
var T_ESTADOS = [["pendiente", "Pendiente"], ["estudio", "En estudio"], ["curso", "En curso"], ["hecha", "Completada"]];
var T_PRIO = [["urgente", "Urgente"], ["alta", "Alta"], ["media", "Media"], ["baja", "Baja"]];
function loadTareas() {
  TAREAS.loading = true;
  return SB.from("tareas").select("*").then(function (r) {
    if (r.error) throw r.error;
    TAREAS.list = r.data || []; TAREAS.loaded = true; TAREAS.loading = false; TAREAS.error = "";
  }).catch(function (e) { TAREAS.loaded = true; TAREAS.loading = false; TAREAS.error = errMsg(e); });
}
function prioIdx(p) { for (var i = 0; i < T_PRIO.length; i++) if (T_PRIO[i][0] === p) return i; return 9; }
function tareaForm(t) {
  var st = statusEl();
  var nombres = DATA.directiva.map(function (d) { return d.nombre; }).filter(Boolean);
  var titulo = h("input", { id: "ta-titulo", type: "text", maxlength: "200", value: (t && t.titulo) || "" });
  var desc = h("textarea", { id: "ta-desc", maxlength: "4000" }); desc.value = (t && t.descripcion) || "";
  var prio = h("select", { id: "ta-prio" }, T_PRIO.map(function (p) { return h("option", { value: p[0], text: p[1], selected: ((t && t.prioridad) || "media") === p[0] || null }); }));
  var est = h("select", { id: "ta-est" }, T_ESTADOS.map(function (p) { return h("option", { value: p[0], text: p[1], selected: ((t && t.estado) || "pendiente") === p[0] || null }); }));
  var resp = h("input", { id: "ta-resp", type: "text", list: "ta-resps", value: (t && t.responsable) || "", placeholder: "Quién se encarga" });
  var dl = h("datalist", { id: "ta-resps" }, nombres.map(function (n) { return h("option", { value: n }); }));
  var lim = h("input", { id: "ta-lim", type: "date", value: (t && t.fecha_limite) || "" });
  var btn = h("button", { class: "btn primary", type: "submit", text: t ? "Guardar cambios" : "Añadir tarea" });
  var form = h("form", { class: "aform", novalidate: true }, h("h3", { text: t ? "Editar tarea" : "Nueva tarea" }),
    h("div", { class: "field" }, h("label", { for: "ta-titulo", text: "Tarea *" }), titulo),
    h("div", { class: "field" }, h("label", { for: "ta-desc", text: "Detalles" }), desc),
    h("div", { class: "two" }, h("div", { class: "field" }, h("label", { for: "ta-prio", text: "Prioridad" }), prio), h("div", { class: "field" }, h("label", { for: "ta-est", text: "Estado" }), est)),
    h("div", { class: "two" }, h("div", { class: "field" }, h("label", { for: "ta-resp", text: "Responsable" }), resp, dl), h("div", { class: "field" }, h("label", { for: "ta-lim", text: "Fecha límite" }), lim)),
    h("div", { class: "form-acts" }, btn, h("button", { class: "btn ghost", type: "button", text: "Cancelar", onclick: function () { TAREAS.edit = null; TAREAS.nueva = false; render(); } })), st);
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!titulo.value.trim()) { setStatus(st, "Escribe la tarea.", false); return; }
    btn.disabled = true;
    var datos = { titulo: titulo.value.trim(), descripcion: desc.value.trim() || null, prioridad: prio.value, estado: est.value, responsable: resp.value.trim() || null, fecha_limite: lim.value || null };
    if (datos.estado === "hecha" && !(t && t.completada)) datos.completada = new Date().toISOString();
    if (datos.estado !== "hecha") datos.completada = null;
    var q = t ? SB.from("tareas").update(datos).eq("id", t.id) : SB.from("tareas").insert(Object.assign(datos, { autor: displayName() }));
    q.then(check).then(function () { TAREAS.edit = null; TAREAS.nueva = false; return loadTareas(); }).then(render, function (e) { btn.disabled = false; setStatus(st, errMsg(e), false); });
  });
  return form;
}
function setEstadoTarea(t, estado, el) {
  el.disabled = true;
  var datos = { estado: estado, completada: estado === "hecha" ? (t.completada || new Date().toISOString()) : null };
  SB.from("tareas").update(datos).eq("id", t.id).then(check).then(function () { if (estado === "hecha" && !t.aviso_id) TAREAS.aviso = t.id; return loadTareas(); }).then(render, function (e) { el.disabled = false; alert2(el, errMsg(e)); });
}
function avisoTareaForm(t) {
  var st = statusEl();
  var titulo = h("input", { id: "av-t-" + t.id, type: "text", value: "✅ " + t.titulo });
  var texto = h("textarea", { id: "av-x-" + t.id }); texto.value = (t.descripcion ? t.descripcion + "\n\n" : "") + "La directiva ha completado esta tarea.";
  var dest = h("select", { id: "av-d-" + t.id }, ["Todos", "Banda", "Bandín"].map(function (d) { return h("option", { value: d, text: d === "Todos" ? "Todos los músicos" : "Solo " + d }); }));
  var btn = h("button", { class: "btn primary small", type: "submit", text: "Publicar en Avisos" });
  var f = h("form", { class: "aviso-form" }, h("b", { text: "Enviar a los avisos de los músicos" }),
    h("div", { class: "field" }, h("label", { for: "av-t-" + t.id, text: "Título" }), titulo),
    h("div", { class: "field" }, h("label", { for: "av-x-" + t.id, text: "Texto" }), texto),
    h("div", { class: "field" }, h("label", { for: "av-d-" + t.id, text: "Para" }), dest),
    h("div", { class: "form-acts" }, btn, h("button", { class: "btn ghost small", type: "button", text: "Ahora no", onclick: function () { TAREAS.aviso = null; render(); } })), st);
  f.addEventListener("submit", function (ev) {
    ev.preventDefault(); btn.disabled = true;
    var id = newId();
    SB.from("interno").upsert({ coleccion: "anuncios", id: id, datos: { titulo: titulo.value.trim() || t.titulo, texto: texto.value.trim(), destinatarios: dest.value, autor: displayName(), creado: new Date().toISOString() } }).then(check)
      .then(function () { return SB.from("tareas").update({ aviso_id: id }).eq("id", t.id).then(check); })
      .then(function () { TAREAS.aviso = null; PRIV.loaded = false; return loadTareas(); }).then(render, function (e) { btn.disabled = false; setStatus(st, errMsg(e), false); });
  });
  return f;
}
function tareaCard(t) {
  var hoy = todayStr(), vencida = t.fecha_limite && t.fecha_limite < hoy && t.estado !== "hecha";
  var est = h("select", { "aria-label": "Estado de " + t.titulo, class: "t-estado" }, T_ESTADOS.map(function (p) { return h("option", { value: p[0], text: p[1], selected: t.estado === p[0] || null }); }));
  est.addEventListener("change", function () { setEstadoTarea(t, est.value, est); });
  return h("article", { class: "tarea prio-" + t.prioridad + (t.estado === "hecha" ? " hecha" : "") },
    h("div", { class: "t-top" }, h("span", { class: "t-prio", text: (T_PRIO[prioIdx(t.prioridad)] || [0, ""])[1] }), t.estado === "curso" ? h("span", { class: "t-doing", text: "● Haciéndose" }) : null),
    h("h4", { text: t.titulo }),
    t.descripcion ? h("p", { text: excerpt(t.descripcion, 180) }) : null,
    h("div", { class: "t-meta" },
      t.responsable ? h("span", { text: "👤 " + t.responsable }) : h("span", { class: "muted", text: "Sin responsable" }),
      t.fecha_limite ? h("span", { class: vencida ? "late" : "", text: "📅 " + fmtLong(t.fecha_limite) + (vencida ? " (vencida)" : "") }) : null),
    h("div", { class: "t-acts" }, est,
      h("button", { class: "btn ghost small", type: "button", text: "Editar", onclick: function () { TAREAS.edit = t.id; render(); window.scrollTo(0, 0); } }),
      deleteButton(function (b) { SB.from("tareas").delete().eq("id", t.id).then(check).then(loadTareas).then(render, function (e) { b.disabled = false; b.textContent = "Borrar"; alert2(b, errMsg(e)); }); })),
    t.estado === "hecha" ? (t.aviso_id ? h("p", { class: "t-pub", text: "📣 Publicada en los avisos de los músicos" })
      : (TAREAS.aviso === t.id ? avisoTareaForm(t) : h("button", { class: "btn small t-send", type: "button", text: "📣 Enviar a avisos de músicos", onclick: function () { TAREAS.aviso = t.id; render(); } }))) : null,
    h("small", { class: "t-foot", text: "Creada por " + (t.autor || "—") + " · " + fmtLong(String(t.creado).slice(0, 10)) + (t.completada ? " · Completada el " + fmtLong(String(t.completada).slice(0, 10)) : "") }));
}
function adminTareas() {
  if (!TAREAS.loaded && !TAREAS.loading) loadTareas().then(render);
  if (!TAREAS.loaded) return h("div", { class: "empty" }, h("p", { text: "Cargando tareas…" }));
  if (TAREAS.error) return h("div", { class: "notice" }, h("h3", { text: "No se han podido cargar las tareas" }), h("p", { class: "muted", text: TAREAS.error + " Si es la primera vez, ejecuta supabase/repertorio.sql en Supabase." }));
  var edit = TAREAS.edit ? TAREAS.list.filter(function (t) { return t.id === TAREAS.edit; })[0] : null;
  var counts = {};
  var board = h("div", { class: "board" }, T_ESTADOS.map(function (e) {
    var items = TAREAS.list.filter(function (t) { return t.estado === e[0]; }).sort(function (a, b) {
      return e[0] === "hecha" ? String(b.completada || "").localeCompare(String(a.completada || "")) : prioIdx(a.prioridad) - prioIdx(b.prioridad) || String(a.fecha_limite || "9999").localeCompare(String(b.fecha_limite || "9999"));
    });
    counts[e[0]] = items.length;
    return h("section", { class: "b-col col-" + e[0] }, h("h3", null, h("span", { text: e[1] }), h("span", { class: "b-n", text: String(items.length) })),
      items.length ? items.map(tareaCard) : h("p", { class: "muted small b-empty", text: "Nada por aquí." }));
  }));
  return h("div", { class: "tareas" },
    h("div", { class: "row-head" }, h("div", null, h("h2", { text: "Tareas de la directiva" }), h("p", { class: "muted", text: "Cualquier miembro de la directiva con acceso de administración puede añadir tareas y cambiar su estado. Cuando una se completa, puedes anunciarla en los avisos de los músicos." }))),
    h("div", { class: "admin-grid tareas-grid" }, board,
      edit || TAREAS.nueva ? tareaForm(edit) : h("div", { class: "tareas-new" }, h("button", { class: "btn primary", type: "button", text: "+ Nueva tarea", onclick: function () { TAREAS.nueva = true; render(); } }))));
}

/* ---------- Panel: cuentas de músicos ---------- */
function musicosFn(body) {
  return SB.functions.invoke("musicos", { body: body }).then(function (r) {
    if (!r.error) return r.data;
    var ctx = r.error.context, fb = "No se ha podido completar. Inténtalo de nuevo.";
    if (ctx && typeof ctx.json === "function") return ctx.json().then(function (j) { throw new Error((j && j.error) || fb); }, function () { throw new Error(fb); });
    throw new Error(fb);
  });
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
/* ---------- Panel: personas y accesos (cuentas de músicos y de la directiva en un solo sitio) ---------- */
var PERMISOS_DEF = [["web", "Editar la web", "Textos, noticias, eventos, fotos y demás contenido público."],
  ["musica", "Área de músicos", "Partituras, agenda y eventos, avisos y pase de lista."],
  ["cuentas", "Cuentas y permisos", "Crear cuentas, dar accesos y cambiar los cargos."]];
var CUENTAS = { loaded: false, loading: false, list: [], cargos: [], me: null, error: "", edit: null, filtro: "todos", buscar: "" };
function loadCuentas() {
  CUENTAS.loading = true;
  return musicosFn({ action: "list" }).then(function (d) {
    // Compatibilidad con la función antigua (solo músicos, sin cargos)
    var list = (d.cuentas || []).map(function (c) {
      if ("musico" in c || "directiva" in c) return c;
      return { user_id: c.user_id, nombre: c.nombre, usuario: c.usuario, email: c.email, ultimo_acceso: c.ultimo_acceso, directiva: null,
        musico: { id: c.id, formacion: c.formacion, instrumento: c.instrumento, voz: c.voz || "", cargo: c.cargo || "Músico" } };
    });
    var cargos = d.cargos || (CARGOS.loaded ? CARGOS.list : []);
    if (!cargos.length) cargos = [{ id: "admin-general", nombre: "Administrador general", permisos: ["web", "musica", "cuentas"] }];
    Object.assign(CUENTAS, { loaded: true, loading: false, list: list, cargos: cargos, me: d.me || (SESSION && SESSION.user.id) || null, error: "" });
  }, function (e) { Object.assign(CUENTAS, { loaded: true, loading: false, list: [], error: e.message }); });
}
function cargoNombre(id, cargos) { var c = (cargos || CARGOS.list || []).filter(function (x) { return x.id === id; })[0]; return c ? c.nombre : (id || ""); }
function permChips(perms) {
  if (!perms || !perms.length) return h("span", { class: "perm none", text: "Solo directiva" });
  return PERMISOS_DEF.filter(function (p) { return perms.indexOf(p[0]) >= 0; }).map(function (p) { return h("span", { class: "perm p-" + p[0], text: p[1] }); });
}
// Bloque de campos de músico (crear o editar)
function musicoFields(pre, m) {
  m = m || {};
  var form_ = h("select", { id: pre + "-form" }, ["Banda", "Bandín", "Banda y Bandín"].map(function (f) { return h("option", { value: f, text: f, selected: (m.formacion || "Banda") === f || null }); }));
  var inst = h("input", { id: pre + "-inst", type: "text", list: pre + "-insts", autocomplete: "off", value: m.instrumento && m.instrumento !== "Dirección" ? m.instrumento : "" });
  var dl = h("datalist", { id: pre + "-insts" }, INSTRUMENTOS.map(function (o) { return h("option", { value: o }); }));
  var voz = h("input", { id: pre + "-voz", type: "text", placeholder: "1, 2, 3… (opcional)", value: m.voz || "" });
  var puesto = h("select", { id: pre + "-puesto" }, ["Músico", "Jefe de sección", "Director"].map(function (c) { return h("option", { value: c, text: c === "Director" ? "Director (recibe el guion)" : c, selected: (m.cargo || "Músico") === c || null }); }));
  var box = h("div", { class: "role-fields" },
    h("div", { class: "two" }, h("div", { class: "field" }, h("label", { for: pre + "-form", text: "Toca en" }), form_), h("div", { class: "field" }, h("label", { for: pre + "-puesto", text: "Puesto en la banda" }), puesto)),
    h("div", { class: "two" }, h("div", { class: "field" }, h("label", { for: pre + "-inst", text: "Instrumento" }), inst, dl), h("div", { class: "field" }, h("label", { for: pre + "-voz", text: "Voz" }), voz)),
    h("small", { class: "muted", text: "El instrumento y la voz deciden qué partituras recibe. El director puede no tocar ninguno." }));
  return { el: box, value: function () { return { formacion: form_.value, instrumento: inst.value.trim() || (puesto.value === "Director" ? "Dirección" : ""), voz: voz.value.trim(), cargo: puesto.value }; } };
}
function cargoSelect(id, value, cargos) {
  return h("select", { id: id }, cargos.map(function (c) { return h("option", { value: c.id, text: c.nombre + (c.permisos && c.permisos.length ? "" : " (sin permisos de edición)"), selected: (value || "vocal") === c.id || null }); }));
}
function roleToggle(id, label, checked, body, onchange) {
  var cb = h("input", { type: "checkbox", id: id, checked: checked || null });
  var wrap = h("div", { class: "role-box" + (checked ? " on" : "") }, h("label", { class: "role-head", for: id }, cb, h("span", null, label[0], h("small", { text: label[1] }))), body);
  cb.addEventListener("change", function () { wrap.classList.toggle("on", cb.checked); if (onchange) onchange(cb.checked); });
  return { el: wrap, checked: function () { return cb.checked; } };
}
// Datos de acceso para mandar a la persona (si el correo automático no está configurado o ha fallado)
function textoAcceso(a, nueva) {
  var web = location.origin + location.pathname.replace(/index\.html$/, "") + "#privado";
  return "Hola, " + a.nombre + ":\n\n" + (nueva ? "Ya tienes cuenta en la web de la Asociación Sierense Amigos de la Música." : "Te hemos puesto una contraseña nueva para entrar en la web de la Asociación Sierense Amigos de la Música.") +
    "\n\nUsuario: " + a.usuario + "\nContraseña provisional: " + a.password + "\n\nEntra aquí: " + web + "\n\nLa primera vez que entres te pediremos que elijas una contraseña tuya.\n\nUn saludo.";
}
function accesoBox(a, correo, nueva) {
  var ok = correo && correo.enviado;
  var txt = textoAcceso(a, nueva);
  var mail = "mailto:" + encodeURIComponent(a.email || "") + "?subject=" + encodeURIComponent(nueva ? "Tu cuenta en la web de la Banda de Música de Siero" : "Tu nueva contraseña de la web de la Banda") + "&body=" + encodeURIComponent(txt);
  var copy = h("button", { class: "btn ghost small", type: "button", text: "Copiar el mensaje" });
  copy.addEventListener("click", function () {
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () { copy.textContent = "Copiado ✓"; }, function () { copy.textContent = "No se ha podido copiar"; });
  });
  var motivo = !correo || correo.error === "no-pedido" ? "" : correo.error === "no-configurado" ? "El envío automático de correos todavía no está configurado (lo explica el README). " : (correo.error || "") + " ";
  return h("div", { class: "acceso-box" + (ok ? " ok" : "") }, ok
    ? h("p", null, "✉️ Le hemos enviado a ", h("b", { text: a.email }), " su usuario «" + a.usuario + "» y la contraseña provisional. Al entrar por primera vez tendrá que elegir una suya.")
    : h("div", null,
      h("p", null, motivo + "Mándale estos datos tú: ", h("b", { text: "usuario «" + a.usuario + "»" }), " y contraseña provisional ", h("code", { text: a.password }), "."),
      h("div", { class: "form-acts" }, h("a", { class: "btn primary small", href: mail, text: "✉️ Enviárselo desde mi correo" }), copy),
      h("small", { class: "muted", text: "Al entrar por primera vez tendrá que elegir una contraseña suya." })));
}
function cuentaForm(c) {
  var nuevo = !c, pre = nuevo ? "pn" : "pe-" + String(c.user_id).replace(/[^a-zA-Z0-9]/g, "").slice(0, 12);
  var st = statusEl();
  var nombre = h("input", { id: pre + "-nombre", type: "text", value: c ? c.nombre : "" });
  var usuario = h("input", { id: pre + "-usuario", type: "text", autocapitalize: "none", spellcheck: "false", placeholder: "nombre.apellido", value: c ? c.usuario : "" });
  var email = nuevo ? h("input", { id: pre + "-email", type: "email", placeholder: "nombre@correo.com" }) : null;
  var pass = nuevo ? h("input", { id: pre + "-pass", type: "text", autocomplete: "off", value: randomPass() }) : null;
  var userTouched = !nuevo;
  usuario.addEventListener("input", function () { userTouched = true; });
  nombre.addEventListener("input", function () { if (!userTouched) usuario.value = suggestUser(nombre.value); });
  var mf = musicoFields(pre + "-m", c && c.musico);
  var csel = cargoSelect(pre + "-cargo", c && c.directiva ? c.directiva.cargo_id : "vocal", CUENTAS.cargos);
  var permBox = h("div", { class: "perm-row" });
  function showPerms() { var cg = CUENTAS.cargos.filter(function (x) { return x.id === csel.value; })[0]; permBox.replaceChildren(h("span", { class: "muted small", text: "Puede: " }), permChips(cg ? cg.permisos : [])); }
  csel.addEventListener("change", showPerms); showPerms();
  var rMus = roleToggle(pre + "-esmus", ["🎷 Músico", "Entra en el Área de músicos, responde a las convocatorias y recibe sus partituras."], nuevo ? true : !!c.musico, mf.el);
  var rDir = roleToggle(pre + "-esdir", ["🏛️ Directiva", "Tareas, reuniones y sugerencias, y lo que permita su cargo."], nuevo ? false : !!c.directiva,
    h("div", { class: "role-fields" }, h("div", { class: "field" }, h("label", { for: pre + "-cargo", text: "Cargo en la directiva" }), csel), permBox));
  var enviarCb = nuevo ? h("input", { type: "checkbox", id: "pn-enviar", checked: true }) : null;
  var btn = h("button", { class: "btn primary", type: "submit", text: nuevo ? "Crear cuenta" : "Guardar cambios" });
  var form = h("form", { class: "aform cuenta-form", novalidate: true }, h("h3", { text: nuevo ? "Nueva cuenta" : "Editar a " + (c.nombre || c.email) }),
    nuevo ? h("p", { class: "muted small", text: "Una sola cuenta por persona. Marca lo que es: músico, miembro de la directiva o las dos cosas." }) : null,
    h("div", { class: "field" }, h("label", { for: pre + "-nombre", text: "Nombre y apellidos *" }), nombre),
    h("div", { class: "two" },
      h("div", { class: "field" }, h("label", { for: pre + "-usuario", text: "Usuario *" }), usuario, h("small", { text: "Con esto (o con el correo) entra en la web." })),
      nuevo ? h("div", { class: "field" }, h("label", { for: pre + "-email", text: "Correo *" }), email) : h("div", { class: "field" }, h("span", { class: "flabel", text: "Correo" }), h("p", { class: "plain", text: c.email || "—" }))),
    nuevo ? h("div", { class: "field" }, h("label", { for: pre + "-pass", text: "Contraseña inicial *" }), pass,
      h("button", { class: "btn ghost small", type: "button", style: "justify-self:start", text: "Generar otra", onclick: function () { pass.value = randomPass(); } })) : null,
    h("span", { class: "flabel", text: "Accesos" }), rMus.el, rDir.el,
    nuevo ? h("label", { class: "perm-check send-check", for: "pn-enviar" }, enviarCb, h("span", null, h("b", { text: "✉️ Enviarle por correo su usuario y contraseña" }), h("small", { text: "Le llegan los datos para entrar y, la primera vez, la web le pide que elija una contraseña suya." }))) : null,
    h("div", { class: "form-acts" }, btn, nuevo ? null : h("button", { class: "btn ghost", type: "button", text: "Cancelar", onclick: function () { CUENTAS.edit = null; render(); } })), st);
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var body = { action: nuevo ? "create" : "update", nombre: nombre.value.trim(), usuario: usuario.value.trim().toLowerCase(),
      musico: rMus.checked() ? mf.value() : null, directiva: rDir.checked() ? { cargo_id: csel.value } : null };
    if (nuevo) { body.email = email.value.trim(); body.password = pass.value; body.enviar = enviarCb.checked; } else body.user_id = c.user_id;
    if (body.musico) Object.assign(body, { formacion: body.musico.formacion, instrumento: body.musico.instrumento, voz: body.musico.voz, cargo: body.musico.cargo }); // función antigua
    if (!body.nombre || !body.usuario || (nuevo && !body.email)) { setStatus(st, "Rellena el nombre, el usuario" + (nuevo ? " y el correo." : "."), false); return; }
    if (!body.musico && !body.directiva) { setStatus(st, "Marca al menos un acceso: músico o directiva.", false); return; }
    if (body.musico && !body.musico.instrumento) { setStatus(st, "Escribe el instrumento (o elige el puesto Director si no toca).", false); return; }
    btn.disabled = true; btn.textContent = nuevo ? "Creando…" : "Guardando…";
    musicosFn(body).then(function (d) {
      FLASH = { col: "personas", msg: nuevo ? "Cuenta de " + body.nombre + " creada." : "Cambios guardados." };
      if (nuevo) FLASH.acceso = { a: { nombre: body.nombre, usuario: body.usuario, email: body.email, password: body.password }, correo: (d && d.correo) || (body.enviar ? { enviado: false, error: "no-configurado" } : { enviado: false, error: "no-pedido" }), nueva: true };
      CUENTAS.edit = null;
      return Promise.all([loadCuentas(), loadAll(), refreshAdmin()]);
    }).then(function () { render(); var fl = document.querySelector(".pp-flash"); if (fl && fl.scrollIntoView) fl.scrollIntoView({ block: "center" }); }, function (e) { btn.disabled = false; btn.textContent = nuevo ? "Crear cuenta" : "Guardar cambios"; setStatus(st, e.message, false); });
  });
  return form;
}
function cuentaRow(c) {
  var isMe = c.user_id === CUENTAS.me;
  var pw = h("input", { type: "text", id: "npw-" + c.user_id, placeholder: "Nueva contraseña", "aria-label": "Nueva contraseña para " + c.nombre });
  var pwBtn = h("button", { class: "btn ghost small", type: "button", text: "Cambiar" });
  pwBtn.addEventListener("click", function () {
    if (pw.value.length < 8) { alert2(pwBtn, "Mínimo 8 caracteres."); return; }
    pwBtn.disabled = true;
    musicosFn({ action: "password", user_id: c.user_id, password: pw.value }).then(function () { pwBtn.disabled = false; pwBtn.textContent = "Cambiada ✓"; },
      function (e) { pwBtn.disabled = false; alert2(pwBtn, e.message); });
  });
  var m = c.musico, d = c.directiva, cg = d ? CUENTAS.cargos.filter(function (x) { return x.id === d.cargo_id; })[0] : null;
  return h("article", { class: "persona" + (CUENTAS.edit === c.user_id ? " editing" : "") },
    h("div", { class: "p-main" },
      h("span", { class: "u-av", text: initials(c.nombre || c.email) }),
      h("div", { class: "p-txt" },
        h("b", { text: (c.nombre || "(sin nombre)") + (isMe ? " (tú)" : "") }),
        h("small", { text: [c.usuario, c.email].filter(Boolean).join(" · ") }),
        h("div", { class: "p-roles" },
          m ? h("span", { class: "role r-mus", text: "🎷 " + [m.instrumento === "Dirección" ? "Dirección musical" : m.instrumento, m.voz ? vocesTxt([INST.normVoz(m.voz)]) : "", m.formacion].filter(Boolean).join(" · ") + (m.cargo && m.cargo !== "Músico" ? " · " + m.cargo : "") }) : null,
          d ? h("span", { class: "role r-dir", text: "🏛️ " + (cg ? cg.nombre : d.cargo_id) }) : null,
          d && cg ? permChips(cg.permisos) : null),
        h("small", { class: "muted", text: c.ultimo_acceso ? "Último acceso: " + fmtLong(String(c.ultimo_acceso).slice(0, 10)) : "Todavía no ha entrado" }))),
    h("div", { class: "p-acts" },
      h("button", { class: "btn ghost small", type: "button", text: "Editar accesos", onclick: function () { CUENTAS.edit = c.user_id; render(); } }),
      h("button", { class: "btn ghost small", type: "button", text: "✉️ Enviar acceso nuevo", title: "Le pone una contraseña provisional nueva y se la manda por correo", onclick: function (ev) {
        var b = ev.currentTarget, np = randomPass(); b.disabled = true; b.textContent = "Enviando…";
        musicosFn({ action: "password", user_id: c.user_id, password: np, enviar: true }).then(function (d) {
          FLASH = { col: "personas", msg: "Contraseña provisional nueva para " + (c.nombre || c.email) + ".", acceso: { a: { nombre: c.nombre, usuario: c.usuario || c.email, email: c.email, password: np }, correo: (d && d.correo) || { enviado: false, error: "no-configurado" }, nueva: false } };
          render(); var fl = document.querySelector(".pp-flash"); if (fl && fl.scrollIntoView) fl.scrollIntoView({ block: "center" });
        }, function (e) { b.disabled = false; b.textContent = "✉️ Enviar acceso nuevo"; alert2(b, e.message); });
      } }),
      h("span", { class: "pw-mini" }, pw, pwBtn),
      isMe ? null : deleteButton(function (b) {
        musicosFn({ action: "remove", user_id: c.user_id }).then(function () {
          FLASH = { col: "personas", msg: "Cuenta de " + (c.nombre || c.email) + " borrada." };
          return Promise.all([loadCuentas(), loadAll()]);
        }).then(render, function (e) { b.disabled = false; b.textContent = "Borrar"; alert2(b, e.message); });
      })),
    CUENTAS.edit === c.user_id ? cuentaForm(c) : null);
}
function adminPersonas() {
  if (!CUENTAS.loaded && !CUENTAS.loading) loadCuentas().then(render);
  var flash = null;
  if (FLASH && FLASH.col === "personas") {
    flash = h("div", { class: "pp-flash" }, h("p", { class: "status ok", role: "status", text: FLASH.msg }), FLASH.acceso ? accesoBox(FLASH.acceso.a, FLASH.acceso.correo, FLASH.acceso.nueva) : null);
    FLASH = null;
  }
  var list;
  if (!CUENTAS.loaded) list = h("div", { class: "empty" }, h("p", { text: "Cargando cuentas…" }));
  else if (CUENTAS.error) list = h("div", { class: "notice" }, h("h3", { text: "No se han podido cargar las cuentas" }), h("p", { class: "muted", text: CUENTAS.error }),
    h("div", { class: "form-acts" }, h("button", { class: "btn ghost small", type: "button", text: "Reintentar", onclick: function () { CUENTAS.loaded = false; render(); } })));
  else {
    var q = norm(CUENTAS.buscar || "");
    var items = CUENTAS.list.filter(function (c) {
      if (CUENTAS.filtro === "musicos" && !c.musico) return false;
      if (CUENTAS.filtro === "directiva" && !c.directiva) return false;
      return !q || norm([c.nombre, c.usuario, c.email, c.musico && c.musico.instrumento].join(" ")).indexOf(q) >= 0;
    }).sort(function (a, b) { return (b.directiva ? 1 : 0) - (a.directiva ? 1 : 0) || String(a.nombre).localeCompare(String(b.nombre)); });
    var nM = CUENTAS.list.filter(function (c) { return c.musico; }).length, nD = CUENTAS.list.filter(function (c) { return c.directiva; }).length;
    var search = h("input", { type: "search", id: "pp-buscar", placeholder: "Buscar por nombre, usuario o instrumento", value: CUENTAS.buscar || "", "aria-label": "Buscar cuentas" });
    search.addEventListener("input", function () { CUENTAS.buscar = search.value; var pos = search.selectionStart; render(); var s = document.getElementById("pp-buscar"); if (s) { s.focus(); try { s.setSelectionRange(pos, pos); } catch (e) {} } });
    list = h("div", null,
      h("div", { class: "pp-tools" },
        h("div", { class: "seg", role: "group", "aria-label": "Filtrar" }, [["todos", "Todas (" + CUENTAS.list.length + ")"], ["musicos", "Músicos (" + nM + ")"], ["directiva", "Directiva (" + nD + ")"]].map(function (f) {
          return h("button", { type: "button", "aria-pressed": CUENTAS.filtro === f[0] ? "true" : "false", text: f[1], onclick: function () { CUENTAS.filtro = f[0]; render(); } });
        })), search),
      items.length ? h("div", { class: "personas" }, items.map(cuentaRow)) : h("div", { class: "empty" }, h("p", { text: "No hay cuentas con ese filtro." })));
  }
  return h("div", { class: "personas-panel" },
    h("div", { class: "row-head" }, h("div", null, h("h2", { text: "Personas y accesos" }),
      h("p", { class: "muted", text: "Todas las cuentas en un solo sitio. Una persona puede ser músico, estar en la directiva o las dos cosas; lo que puede hacer en la directiva depende de su cargo (los cargos se cambian en la pestaña Cargos)." }))),
    flash,
    h("div", { class: "admin-grid" }, list, CUENTAS.loaded && !CUENTAS.error ? cuentaForm(null) : h("div")));
}

/* ---------- Panel: cargos de la directiva ---------- */
var CARGOS = { loaded: false, loading: false, list: [], error: "", edit: null };
function loadCargos() {
  CARGOS.loading = true;
  return SB.from("cargos").select("*").order("orden").then(function (r) {
    if (r.error) throw r.error;
    CARGOS.list = r.data || []; CARGOS.loaded = true; CARGOS.loading = false; CARGOS.error = "";
  }).catch(function (e) { CARGOS.loaded = true; CARGOS.loading = false; CARGOS.error = errMsg(e); });
}
function slugCargo(n) { return norm(n).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "cargo"; }
function cargoForm(c) {
  var st = statusEl(), pre = c ? "cg-" + c.id : "cg-nuevo";
  var nombre = h("input", { id: pre + "-n", type: "text", maxlength: "60", value: c ? c.nombre : "" });
  var desc = h("input", { id: pre + "-d", type: "text", maxlength: "300", value: (c && c.descripcion) || "", placeholder: "Opcional" });
  var checks = PERMISOS_DEF.map(function (p) {
    var cb = h("input", { type: "checkbox", id: pre + "-p-" + p[0], checked: c && c.permisos.indexOf(p[0]) >= 0 || null, disabled: c && c.sistema || null });
    return { k: p[0], cb: cb, el: h("label", { class: "perm-check", for: pre + "-p-" + p[0] }, cb, h("span", null, h("b", { text: p[1] }), h("small", { text: p[2] }))) };
  });
  var btn = h("button", { class: "btn primary small", type: "submit", text: c ? "Guardar" : "Añadir cargo" });
  var f = h("form", { class: c ? "cargo-edit" : "aform", novalidate: true }, c ? null : h("h3", { text: "Nuevo cargo" }),
    h("div", { class: "field" }, h("label", { for: pre + "-n", text: "Nombre *" }), nombre),
    h("div", { class: "field" }, h("label", { for: pre + "-d", text: "Descripción" }), desc),
    h("span", { class: "flabel", text: "Permisos" }), h("div", { class: "perm-checks" }, checks.map(function (x) { return x.el; })),
    h("small", { class: "muted", text: "Sin ninguna casilla, el cargo solo ve lo de la directiva (tareas, reuniones y sugerencias), como un Vocal." }),
    h("div", { class: "form-acts" }, btn, c ? h("button", { class: "btn ghost small", type: "button", text: "Cancelar", onclick: function () { CARGOS.edit = null; render(); } }) : null), st);
  f.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!nombre.value.trim()) { setStatus(st, "Escribe el nombre del cargo.", false); return; }
    var datos = { nombre: nombre.value.trim(), descripcion: desc.value.trim() || null };
    if (!(c && c.sistema)) datos.permisos = checks.filter(function (x) { return x.cb.checked; }).map(function (x) { return x.k; });
    btn.disabled = true;
    var q;
    if (c) q = SB.from("cargos").update(datos).eq("id", c.id);
    else {
      var id = slugCargo(datos.nombre);
      if (CARGOS.list.some(function (x) { return x.id === id; })) id += "-" + Math.random().toString(36).slice(2, 6);
      q = SB.from("cargos").insert(Object.assign(datos, { id: id, orden: 50 + CARGOS.list.length }));
    }
    q.then(check).then(function () { CARGOS.edit = null; CUENTAS.loaded = false; return Promise.all([loadCargos(), refreshAdmin()]); }).then(render, function (e) { btn.disabled = false; setStatus(st, errMsg(e), false); });
  });
  return f;
}
function adminCargos() {
  if (!CARGOS.loaded && !CARGOS.loading) loadCargos().then(render);
  if (!DIRECTIVA.loaded && !DIRECTIVA.loading) loadDirectiva().then(render);
  if (!CARGOS.loaded) return h("div", { class: "empty" }, h("p", { text: "Cargando cargos…" }));
  if (CARGOS.error) return h("div", { class: "notice" }, h("h3", { text: "No se han podido cargar los cargos" }), h("p", { class: "muted", text: CARGOS.error + " Si es la primera vez, ejecuta supabase/directiva.sql en Supabase." }));
  var list = h("div", { class: "cargos" }, CARGOS.list.map(function (c) {
    var gente = DIRECTIVA.list.filter(function (a) { return a.cargo_id === c.id; });
    if (CARGOS.edit === c.id) return h("article", { class: "cargo editing" }, cargoForm(c));
    return h("article", { class: "cargo" + (c.sistema ? " sistema" : "") },
      h("div", { class: "cg-top" }, h("h3", { text: c.nombre }), c.sistema ? h("span", { class: "pill-soft", text: "Fijo" }) : null),
      c.descripcion ? h("p", { class: "muted small", text: c.descripcion }) : null,
      h("div", { class: "perm-row" }, permChips(c.permisos)),
      h("p", { class: "small cg-people", text: gente.length ? "👤 " + gente.map(function (a) { return a.nombre || a.email; }).join(", ") : "Nadie tiene este cargo." }),
      h("div", { class: "form-acts" },
        h("button", { class: "btn ghost small", type: "button", text: "Editar", onclick: function () { CARGOS.edit = c.id; render(); } }),
        c.sistema ? null : deleteButton(function (b) {
          if (gente.length) { b.disabled = false; b.textContent = "Borrar"; alert2(b, "Antes cambia de cargo a quien lo tiene."); return; }
          SB.from("cargos").delete().eq("id", c.id).then(check).then(loadCargos).then(render, function (e) { b.disabled = false; b.textContent = "Borrar"; alert2(b, errMsg(e)); });
        })));
  }));
  return h("div", { class: "cargos-panel" },
    h("div", { class: "row-head" }, h("div", null, h("h2", { text: "Cargos de la directiva" }),
      h("p", { class: "muted", text: "Cada cargo decide qué puede hacer quien lo tiene. Para asignar un cargo a alguien, ve a Personas y accesos → Editar accesos." }))),
    h("div", { class: "admin-grid" }, list, cargoForm(null)));
}

/* ---------- Lista de la directiva (para reuniones y cargos) ---------- */
var DIRECTIVA = { loaded: false, loading: false, list: [] };
function loadDirectiva() {
  DIRECTIVA.loading = true;
  return SB.from("administradores").select("user_id,email,nombre,cargo_id").then(function (r) {
    DIRECTIVA.list = r.error ? [] : (r.data || []); DIRECTIVA.loaded = true; DIRECTIVA.loading = false;
  }, function () { DIRECTIVA.loaded = true; DIRECTIVA.loading = false; });
}

/* ---------- Panel: reuniones de la directiva ---------- */
var REUN = { loaded: false, loading: false, list: [], asist: [], error: "", open: null, edit: null, nueva: false, ver: "proximas" };
var R_TIPOS = [["ordinaria", "Ordinaria"], ["extraordinaria", "Extraordinaria"], ["asamblea", "Asamblea de socios"]];
function loadReuniones() {
  REUN.loading = true;
  return Promise.all([SB.from("reuniones").select("*").order("fecha"), optional(SB.from("reunion_asistencias").select("*"))]).then(function (rs) {
    if (rs[0].error) throw rs[0].error;
    REUN.list = rs[0].data || []; REUN.asist = (rs[1] && rs[1].data) || []; REUN.loaded = true; REUN.loading = false; REUN.error = "";
  }).catch(function (e) { REUN.loaded = true; REUN.loading = false; REUN.error = errMsg(e); });
}
function reunionForm(r) {
  var st = statusEl(), pre = r ? "re-" + r.id.slice(0, 8) : "re-n";
  var titulo = h("input", { id: pre + "-t", type: "text", maxlength: "200", value: r ? r.titulo : "Reunión de la directiva" });
  var tipo = h("select", { id: pre + "-ti" }, R_TIPOS.map(function (t) { return h("option", { value: t[0], text: t[1], selected: (r ? r.tipo : "ordinaria") === t[0] || null }); }));
  var fecha = h("input", { id: pre + "-f", type: "date", value: r ? r.fecha : "" });
  var hora = h("input", { id: pre + "-h", type: "time", value: (r && r.hora) || "20:00" });
  var lugar = h("input", { id: pre + "-l", type: "text", value: r ? (r.lugar || "") : "Casa de la Música", placeholder: "Sede, local…" });
  var orden = h("textarea", { id: pre + "-o", placeholder: "1. Lectura y aprobación del acta anterior\n2. …\n3. Ruegos y preguntas" }); orden.value = (r && r.orden_dia) || "";
  var btn = h("button", { class: "btn primary", type: "submit", text: r ? "Guardar" : "Convocar reunión" });
  var f = h("form", { class: "aform", novalidate: true }, h("h3", { text: r ? "Editar convocatoria" : "Nueva reunión" }),
    h("div", { class: "field" }, h("label", { for: pre + "-t", text: "Título *" }), titulo),
    h("div", { class: "two" }, h("div", { class: "field" }, h("label", { for: pre + "-f", text: "Fecha *" }), fecha), h("div", { class: "field" }, h("label", { for: pre + "-h", text: "Hora" }), hora)),
    h("div", { class: "two" }, h("div", { class: "field" }, h("label", { for: pre + "-ti", text: "Tipo" }), tipo), h("div", { class: "field" }, h("label", { for: pre + "-l", text: "Lugar" }), lugar)),
    h("div", { class: "field" }, h("label", { for: pre + "-o", text: "Orden del día" }), orden, h("small", { text: "Un punto por línea." })),
    h("div", { class: "form-acts" }, btn, h("button", { class: "btn ghost", type: "button", text: "Cancelar", onclick: function () { REUN.nueva = false; REUN.edit = null; render(); } })), st);
  f.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!titulo.value.trim() || !fecha.value) { setStatus(st, "Pon el título y la fecha.", false); return; }
    btn.disabled = true;
    var datos = { titulo: titulo.value.trim(), tipo: tipo.value, fecha: fecha.value, hora: hora.value || null, lugar: lugar.value.trim() || null, orden_dia: orden.value.trim() || null };
    var q = r ? SB.from("reuniones").update(datos).eq("id", r.id) : SB.from("reuniones").insert(Object.assign(datos, { autor: displayName() })).select();
    q.then(check).then(function (res) {
      REUN.nueva = false; REUN.edit = null;
      if (!r && res && res.data && res.data[0]) REUN.open = res.data[0].id;
      return loadReuniones();
    }).then(render, function (e) { btn.disabled = false; setStatus(st, errMsg(e), false); });
  });
  return f;
}
function reunionAsist(r) { return REUN.asist.filter(function (a) { return a.reunion_id === r.id; }); }
function rsvpReunion(r) {
  var uid = SESSION && SESSION.user && SESSION.user.id, mine = reunionAsist(r).filter(function (a) { return a.user_id === uid; })[0];
  return h("div", { class: "r-rsvp", role: "group", "aria-label": "¿Vas a ir?" }, [["si", "✓ Voy"], ["duda", "? No sé"], ["no", "✗ No puedo"]].map(function (o) {
    return h("button", { type: "button", class: "rr rr-" + o[0], "aria-pressed": mine && mine.estado === o[0] ? "true" : "false", text: o[1], onclick: function (ev) {
      ev.currentTarget.disabled = true;
      SB.from("reunion_asistencias").upsert({ reunion_id: r.id, user_id: uid, nombre: displayName(), estado: o[0], actualizado: new Date().toISOString() }).then(check)
        .then(loadReuniones).then(render, function (e) { alert2(ev.target, errMsg(e)); });
    } });
  }));
}
function reunionCard(r) {
  var as = reunionAsist(r), si = as.filter(function (a) { return a.estado === "si"; }).length;
  var pasada = r.fecha < todayStr();
  return h("article", { class: "reunion est-" + r.estado + (pasada ? " pasada" : "") },
    h("a", { class: "r-date", href: "#admin-reuniones", onclick: function (ev) { ev.preventDefault(); REUN.open = r.id; render(); window.scrollTo(0, 0); } },
      h("b", { text: String(+r.fecha.slice(8, 10)) }), h("span", { text: MES_CORTO[+r.fecha.slice(5, 7) - 1] })),
    h("div", { class: "r-body" },
      h("h4", null, h("a", { href: "#admin-reuniones", text: r.titulo, onclick: function (ev) { ev.preventDefault(); REUN.open = r.id; render(); window.scrollTo(0, 0); } })),
      h("p", { class: "muted small", text: [fmtLong(r.fecha), r.hora, r.lugar, (R_TIPOS.filter(function (t) { return t[0] === r.tipo; })[0] || [0, ""])[1]].filter(Boolean).join(" · ") }),
      h("p", { class: "small", text: r.estado === "cancelada" ? "Cancelada" : r.estado === "celebrada" ? (r.acta ? "Celebrada · acta redactada" : "Celebrada · falta el acta") : si + " de " + (DIRECTIVA.list.length || "?") + " confirman que van" })),
    r.estado === "convocada" && !pasada ? rsvpReunion(r) : null);
}
function reunionDetalle(r) {
  var st = statusEl();
  var as = reunionAsist(r);
  var acta = h("textarea", { id: "ra-acta", class: "acta", placeholder: "Asistentes, temas tratados, votaciones…" }); acta.value = r.acta || "";
  var acuerdos = h("textarea", { id: "ra-acu", placeholder: "Un acuerdo por línea" }); acuerdos.value = r.acuerdos || "";
  var estado = h("select", { id: "ra-est" }, [["convocada", "Convocada"], ["celebrada", "Celebrada"], ["cancelada", "Cancelada"]].map(function (e) { return h("option", { value: e[0], text: e[1], selected: r.estado === e[0] || null }); }));
  var save = h("button", { class: "btn primary", type: "button", text: "Guardar acta y acuerdos" });
  save.addEventListener("click", function () {
    save.disabled = true;
    SB.from("reuniones").update({ acta: acta.value.trim() || null, acuerdos: acuerdos.value.trim() || null, estado: estado.value }).eq("id", r.id).then(check)
      .then(loadReuniones).then(function () { FLASH = { col: "reunion", msg: "Guardado." }; render(); }, function (e) { save.disabled = false; setStatus(st, errMsg(e), false); });
  });
  if (FLASH && FLASH.col === "reunion") { setStatus(st, FLASH.msg, true); FLASH = null; }
  var tareasDe = TAREAS.loaded ? TAREAS.list.filter(function (t) { return t.reunion_id === r.id; }) : [];
  var lineas = (r.acuerdos || "").split(/\n+/).map(function (x) { return x.replace(/^\s*[-•\d.)]+\s*/, "").trim(); }).filter(Boolean);
  var personas = DIRECTIVA.list.map(function (d) {
    var a = as.filter(function (x) { return x.user_id === d.user_id; })[0];
    return h("li", { class: "ra-" + (a ? a.estado : "nada") }, h("span", { class: "dot", "aria-hidden": "true" }), h("span", { text: (d.nombre || d.email) }), h("small", { text: cargoNombre(d.cargo_id) + " · " + (a ? { si: "Va", no: "No puede", duda: "No lo sabe" }[a.estado] : "Sin responder") }));
  });
  return h("div", { class: "reunion-det" },
    h("button", { class: "back linkish", type: "button", onclick: function () { REUN.open = null; render(); } }, "‹ Todas las reuniones"),
    REUN.edit === r.id ? reunionForm(r) : h("div", { class: "rd-head" },
      h("div", null, h("span", { class: "eyebrow-s", text: (R_TIPOS.filter(function (t) { return t[0] === r.tipo; })[0] || [0, ""])[1] + " · " + { convocada: "Convocada", celebrada: "Celebrada", cancelada: "Cancelada" }[r.estado] }),
        h("h2", { text: r.titulo }), h("p", { class: "muted", text: [fmtLong(r.fecha), r.hora, r.lugar].filter(Boolean).join(" · ") + (r.autor ? " · Convoca " + r.autor : "") })),
      h("div", { class: "form-acts" }, h("button", { class: "btn ghost small", type: "button", text: "Editar convocatoria", onclick: function () { REUN.edit = r.id; render(); } }),
        deleteButton(function (b) { SB.from("reuniones").delete().eq("id", r.id).then(check).then(function () { REUN.open = null; return loadReuniones(); }).then(render, function (e) { b.disabled = false; b.textContent = "Borrar"; alert2(b, errMsg(e)); }); }))),
    h("div", { class: "rd-grid" },
      h("section", { class: "cbox" }, h("h3", { text: "Orden del día" }),
        r.orden_dia ? h("ol", { class: "orden" }, r.orden_dia.split(/\n+/).map(function (x) { return x.replace(/^\s*\d+[.)]\s*/, "").trim(); }).filter(Boolean).map(function (x) { return h("li", { text: x }); })) : h("p", { class: "muted", text: "Sin orden del día." }),
        r.estado === "convocada" && r.fecha >= todayStr() ? h("div", null, h("h3", { text: "¿Vas a ir?" }), rsvpReunion(r)) : null),
      h("section", { class: "cbox" }, h("h3", { text: "Asistencia" }), personas.length ? h("ul", { class: "ra-list" }, personas) : h("p", { class: "muted", text: "Cargando la directiva…" }))),
    h("section", { class: "cbox rd-acta" }, h("h3", { text: "Acta y acuerdos" }),
      h("div", { class: "field" }, h("label", { for: "ra-est", text: "Estado" }), estado),
      h("div", { class: "field" }, h("label", { for: "ra-acta", text: "Acta" }), acta),
      h("div", { class: "field" }, h("label", { for: "ra-acu", text: "Acuerdos" }), acuerdos, h("small", { text: "Después de guardar, cada acuerdo se puede convertir en una tarea de la directiva." })),
      h("div", { class: "form-acts" }, save), st,
      lineas.length ? h("div", { class: "acuerdos" }, h("h4", { text: "Acuerdos" }), lineas.map(function (l) {
        var hecha = tareasDe.filter(function (t) { return t.titulo === l; })[0];
        return h("div", { class: "acuerdo" }, h("span", { text: l }), hecha ? h("a", { class: "pill-soft", href: "#admin-tareas", text: "📋 Tarea: " + (T_ESTADOS.filter(function (e) { return e[0] === hecha.estado; })[0] || [0, ""])[1] })
          : h("button", { class: "btn ghost small", type: "button", text: "＋ Convertir en tarea", onclick: function (ev) {
            var b = ev.currentTarget; b.disabled = true;
            SB.from("tareas").insert({ titulo: l.slice(0, 200), descripcion: "Acuerdo de la reunión «" + r.titulo + "» del " + fmtLong(r.fecha) + ".", estado: "pendiente", prioridad: "media", autor: displayName(), reunion_id: r.id })
              .then(check).then(loadTareas).then(render, function (e) { b.disabled = false; alert2(b, errMsg(e)); });
          } }));
      })) : null));
}
function adminReuniones() {
  if (!REUN.loaded && !REUN.loading) loadReuniones().then(render);
  if (!DIRECTIVA.loaded && !DIRECTIVA.loading) loadDirectiva().then(render);
  if (!TAREAS.loaded && !TAREAS.loading) loadTareas().then(render);
  if (!REUN.loaded) return h("div", { class: "empty" }, h("p", { text: "Cargando reuniones…" }));
  if (REUN.error) return h("div", { class: "notice" }, h("h3", { text: "No se han podido cargar las reuniones" }), h("p", { class: "muted", text: REUN.error + " Si es la primera vez, ejecuta supabase/directiva.sql en Supabase." }));
  var open = REUN.open ? REUN.list.filter(function (r) { return r.id === REUN.open; })[0] : null;
  if (open) return reunionDetalle(open);
  var hoy = todayStr();
  var prox = REUN.list.filter(function (r) { return r.fecha >= hoy && r.estado !== "cancelada"; });
  var past = REUN.list.filter(function (r) { return r.fecha < hoy || r.estado === "cancelada"; }).reverse();
  var lista = REUN.ver === "proximas" ? prox : past;
  return h("div", { class: "reuniones" },
    h("div", { class: "row-head" }, h("div", null, h("h2", { text: "Reuniones de la directiva" }), h("p", { class: "muted", text: "Convoca reuniones con su orden del día, confirma si vas, y después redacta el acta. Los acuerdos se pueden pasar a tareas." })),
      REUN.nueva ? null : h("button", { class: "btn primary", type: "button", text: "+ Convocar reunión", onclick: function () { REUN.nueva = true; render(); } })),
    REUN.nueva ? reunionForm(null) : null,
    h("div", { class: "seg", role: "group", "aria-label": "Ver" }, [["proximas", "Próximas (" + prox.length + ")"], ["pasadas", "Anteriores (" + past.length + ")"]].map(function (v) {
      return h("button", { type: "button", "aria-pressed": REUN.ver === v[0] ? "true" : "false", text: v[1], onclick: function () { REUN.ver = v[0]; render(); } });
    })),
    lista.length ? h("div", { class: "r-list" }, lista.map(reunionCard)) : h("div", { class: "empty" }, h("p", { text: REUN.ver === "proximas" ? "No hay reuniones convocadas." : "Todavía no hay reuniones anteriores." })));
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
  if (!SESSION) { IS_ADMIN = false; PERMS = []; MI_CARGO = ""; ASSETS = null; updateNav(); return Promise.resolve(); }
  function done() { ASSETS = can("web") ? ASSETS_ADAPTER : null; updateNav(); }
  return SB.rpc("mis_permisos").then(function (r) {
    if (!r.error && r.data) { IS_ADMIN = r.data.admin === true; PERMS = IS_ADMIN ? (r.data.permisos || []) : []; MI_CARGO = r.data.cargo || ""; return done(); }
    // Base de datos sin cargos todavía (falta supabase/directiva.sql): todo administrador puede todo
    return SB.rpc("es_admin").then(function (r2) { IS_ADMIN = !r2.error && r2.data === true; PERMS = IS_ADMIN ? ["web", "musica", "cuentas"] : []; MI_CARGO = ""; done(); });
  }).catch(function () { IS_ADMIN = false; PERMS = []; ASSETS = null; updateNav(); });
}

// Service worker: hace que la web se pueda instalar en el móvil y recibe las notificaciones
if ("serviceWorker" in navigator && location.protocol !== "file:") window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });

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
    ADMINS.loaded = false; ADMINS.list = []; CUENTAS.loaded = false; CARGOS.loaded = false; REUN.loaded = false; REUN.open = null; DIRECTIVA.loaded = false; TAREAS.loaded = false;
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
