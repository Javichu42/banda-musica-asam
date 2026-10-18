/* Reconocimiento de instrumentos y voces a partir de un texto
   (el nombre de un archivo o la cabecera de una particella).
   Entiende castellano, asturiano, inglés, italiano, francés y alemán, y las
   abreviaturas habituales en las partituras de banda.
   Uso: ASAM_INST.detect("Clarinete en Sib 2.pdf") → { instrumento: "Clarinete", familia: "Clarinete", voces: ["2"] } */
(function (root) {
  "use strict";
  // [nombre en la web, familia, palabras que lo identifican]
  var DEF = [
    ["Guion", "Guion", ["guion", "guion director", "score", "full score", "conductor", "conductor score", "director", "partitura general", "partitura completa", "partitura de direccion", "direccion", "partitur", "partitura director", "condensed score"]],
    ["Flautín", "Flautín", ["flautin", "piccolo", "ottavino", "petite flute", "picc", "pic"]],
    ["Flauta", "Flauta", ["flauta", "flautas", "flute", "flutes", "flauto", "flauti", "flote", "floten", "querflote", "fl", "flt"]],
    ["Corno inglés", "Oboe", ["corno ingles", "english horn", "cor anglais", "englischhorn"]],
    ["Oboe", "Oboe", ["oboe", "oboes", "oboi", "hautbois", "ob"]],
    ["Fagot", "Fagot", ["fagot", "fagotes", "bassoon", "bassoons", "fagotto", "fagotti", "basson", "fg", "bsn"]],
    ["Requinto", "Requinto", ["requinto", "clarinete en mib", "clarinete mib", "clarinet in eb", "eb clarinet", "e flat clarinet", "clarinetto piccolo", "clarinetto in mib", "clarinette en mib", "clarinete requinto", "clarinet eb", "cl mib", "cl eb"]],
    ["Clarinete bajo", "Clarinete bajo", ["clarinete bajo", "bass clarinet", "clarinetto basso", "clarinette basse", "bassklarinette", "cl bajo", "b cl", "bcl", "clarinete bajo en sib"]],
    ["Clarinete", "Clarinete", ["clarinete", "clarinetes", "clarinet", "clarinets", "clarinetto", "clarinetti", "clarinette", "clarinettes", "klarinette", "klarinetten", "cl", "clar", "clt"]],
    ["Saxofón soprano", "Saxofón soprano", ["saxofon soprano", "saxo soprano", "soprano sax", "sax soprano", "soprano saxophone", "sopransaxophon", "s sax"]],
    ["Saxofón alto", "Saxofón alto", ["saxofon alto", "saxofones altos", "saxo alto", "saxos altos", "alto sax", "alto saxes", "sax alto", "alto saxophone", "altsaxophon", "altsax", "a sax", "asax", "sax contralto", "saxofon contralto"]],
    ["Saxofón tenor", "Saxofón tenor", ["saxofon tenor", "saxo tenor", "tenor sax", "sax tenor", "tenor saxophone", "tenorsaxophon", "t sax", "tsax"]],
    ["Saxofón barítono", "Saxofón barítono", ["saxofon baritono", "saxo baritono", "baritone sax", "sax baritono", "bari sax", "baritone saxophone", "baritonsaxophon", "sax bar", "b sax", "bsax"]],
    ["Trompa", "Trompa", ["trompa", "trompas", "horn", "horns", "horn in f", "french horn", "corno", "corni", "cor", "cors", "waldhorn", "hn", "hrn", "tpa"]],
    ["Fliscorno", "Fliscorno", ["fliscorno", "fliscornos", "flugelhorn", "flugelhorns", "flicorno", "flicorni", "fiscorno", "flugel", "flghn", "flisc"]],
    ["Trompeta", "Trompeta", ["trompeta", "trompetas", "trumpet", "trumpets", "tromba", "trombe", "trompette", "trompettes", "trompete", "tpt", "tp", "trp", "cornet", "cornets", "corneta", "cornetas", "cornetto"]],
    ["Trombón bajo", "Trombón bajo", ["trombon bajo", "bass trombone", "trombone basso", "bassposaune", "b tbn"]],
    ["Trombón", "Trombón", ["trombon", "trombones", "trombone", "tromboni", "posaune", "posaunen", "tbn", "trb", "tb"]],
    ["Bombardino", "Bombardino", ["bombardino", "bombardinos", "euphonium", "euphoniums", "eufonio", "eufonios", "baritone", "baritono", "baritonos", "bariton", "tenor tuba", "flicorno baritono", "bombardon", "euph"]],
    ["Tuba", "Tuba", ["tuba", "tubas", "bass in bb", "basses", "basso tuba", "bajo tuba", "tuba en do", "tuba en sib", "bajo", "bajos", "bajo en sib", "bajo en mib", "bajo en do", "helicon", "sousafon", "sousaphone"]],
    ["Contrabajo", "Contrabajo", ["contrabajo", "contrabajos", "string bass", "double bass", "contrabbasso", "contrebasse", "kontrabass", "bajo electrico", "bass guitar", "cb"]],
    ["Timbales", "Percusión", ["timbales", "timpani", "timbal", "pauken", "timbales sinfonicos", "timp"]],
    ["Láminas", "Percusión", ["laminas", "mallets", "mallet percussion", "xilofono", "xylophone", "glockenspiel", "vibrafono", "vibraphone", "marimba", "campanas tubulares", "campanolas", "carillon", "lira", "bells", "chimes"]],
    ["Caja", "Percusión", ["caja", "caja clara", "snare", "snare drum", "tamburo", "tamburo militare", "redoblante", "tambor", "tamboril", "kleine trommel"]],
    ["Bombo", "Percusión", ["bombo", "bass drum", "gran cassa", "grosse caisse", "grosse trommel"]],
    ["Platos", "Percusión", ["platos", "cymbals", "cymbal", "piatti", "cymbales", "becken", "plato suspendido", "crash cymbals"]],
    ["Percusión", "Percusión", ["percusion", "percussion", "percussioni", "percusiones", "perc", "bateria", "drum set", "drumset", "drums", "batteria", "accesorios", "pequena percusion"]],
    ["Dulzaina", "Dulzaina", ["dulzaina", "dulzainas", "gaita", "gaitas", "gaita asturiana", "gaita gallega", "bagpipe", "bagpipes", "cornamusa"]],
    ["Piano", "Piano", ["piano", "pianoforte", "teclado", "keyboard", "celesta", "sintetizador", "synth"]],
    ["Guitarra", "Guitarra", ["guitarra", "guitar", "chitarra"]],
    ["Voz", "Voz", ["voz", "voces", "coro", "choir", "vocal", "letra"]]
  ];
  // Palabras que hablan de la afinación y no de la voz (se saltan)
  var KEY_WORDS = { "en": 1, "in": 1, "sib": 1, "mib": 1, "fa": 1, "do": 1, "re": 1, "sol": 1, "la": 1, "bb": 1, "eb": 1, "b": 1, "f": 1, "c": 1, "e": 1, "flat": 1, "es": 1, "si": 1, "mi": 1, "be": 1, "y": 0 };
  var ORD = { "1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "i": "1", "ii": "2", "iii": "3", "iv": "4", "v": "5",
    "1st": "1", "2nd": "2", "3rd": "3", "4th": "4", "1o": "1", "2o": "2", "3o": "3", "4o": "4", "1a": "1", "2a": "2", "3a": "3", "4a": "4",
    "1er": "1", "2eme": "2", "3eme": "3", "primero": "1", "primera": "1", "primer": "1", "segundo": "2", "segunda": "2", "tercero": "3", "tercera": "3", "tercer": "3",
    "cuarto": "4", "cuarta": "4", "first": "1", "second": "2", "third": "3", "fourth": "4", "primo": "1", "secondo": "2", "terzo": "3", "solo": "1", "principal": "1", "pral": "1", "ppal": "1" };
  var SEP = { "y": 1, "and": 1, "e": 1, "et": 1, "und": 1, "&": 1, "+": 1 };

  function norm(t) {
    return " " + String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/\.(pdf|png|jpe?g|mp3|m4a|wav|mscz|musicxml|xml)$/i, " ")
      .replace(/(\d)(st|nd|rd|th)\b/g, "$1$2 ")
      .replace(/([a-z])(\d)/g, "$1 $2").replace(/(\d)([a-z]{3,})/g, "$1 $2")
      .replace(/[º°ª]/g, "o")
      .replace(/[^a-z0-9&+]+/g, " ").replace(/\s+/g, " ").trim() + " ";
  }
  // Índice de patrones, del más largo al más corto
  var PATS = [];
  DEF.forEach(function (d, i) { d[2].forEach(function (p) { PATS.push({ p: " " + p + " ", len: p.length, i: i }); }); });
  PATS.sort(function (a, b) { return b.len - a.len; });

  function readVoices(tokens, from) {
    var v = [], j = from, skipped = 0;
    while (j < tokens.length && j < from + 8) {
      var t = tokens[j];
      if (ORD[t]) { if (v.indexOf(ORD[t]) < 0) v.push(ORD[t]); j++; continue; }
      if (/^[1-5]-[1-5]$/.test(t)) { var a = +t[0], b = +t[2]; for (var k = Math.min(a, b); k <= Math.max(a, b); k++) if (v.indexOf(String(k)) < 0) v.push(String(k)); j++; continue; }
      if (v.length && SEP[t]) { j++; continue; }
      if (!v.length && KEY_WORDS[t] && skipped < 3) { skipped++; j++; continue; }
      break;
    }
    return v;
  }

  // Palabras sueltas (5+ letras) para corregir errores de lectura del OCR ("Fliscofno" → "fliscorno")
  var FUZZ = [];
  DEF.forEach(function (d) { d[2].forEach(function (p) { if (p.length >= 5 && p.indexOf(" ") < 0) FUZZ.push(p); }); });
  function lev(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    var prev = [], cur, i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur = [i]; var best = i;
      for (j = 1; j <= b.length; j++) { cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); if (cur[j] < best) best = cur[j]; }
      if (best > max) return max + 1;
      prev = cur;
    }
    return prev[b.length];
  }
  function fixOcr(n) {
    // "2°" leído como "24", "29", "2a"… justo detrás de una palabra
    n = n.replace(/ ([1-4])[49] /g, " $1 ").replace(/ ([1-4])0[0-9]? /g, " $1 ");
    return " " + n.trim().split(" ").map(function (t) {
      if (t.length < 5 || /\d/.test(t)) return t;
      var max = t.length >= 8 ? 2 : 1, hit = null, hd = max + 1;
      for (var k = 0; k < FUZZ.length; k++) { var dd = lev(t, FUZZ[k], max); if (dd < hd) { hd = dd; hit = FUZZ[k]; if (!dd) break; } }
      return hit && hd <= max ? hit : t;
    }).join(" ") + " ";
  }

  // opts.ocr = el texto viene del reconocimiento de imagen: se ignoran las abreviaturas
  // cortas (dan falsos positivos con el ruido) y se corrigen palabras mal leídas
  function detect(text, opts) {
    var ocr = !!(opts && opts.ocr);
    var n = norm(text).replace(/ (\d) (?:-|\/) (\d) /g, " $1-$2 ");
    if (ocr) n = fixOcr(n);
    if (n.trim() === "") return null;
    var best = null;
    for (var k = 0; k < PATS.length; k++) {
      if (ocr && PATS[k].len < 4) continue;
      var pos = n.indexOf(PATS[k].p);
      if (pos >= 0) {
        if (!best || PATS[k].len > best.len || (PATS[k].len === best.len && pos < best.pos)) best = { len: PATS[k].len, pos: pos, i: PATS[k].i, p: PATS[k].p };
        if (best.len > PATS[k].len) break; // ya no habrá uno más largo
      }
    }
    if (!best) return null;
    var d = DEF[best.i];
    var before = n.slice(0, best.pos).trim().split(" ").filter(Boolean);
    var after = n.slice(best.pos + best.p.length - 1).trim().split(" ").filter(Boolean);
    var voces = readVoices(after, 0);
    if (!ocr && !voces.length && before.length) { var last = before[before.length - 1]; if (ORD[last] && last !== "solo" && last !== "principal" && last !== "i" && last !== "v") voces = [ORD[last]]; }
    // "1-2" pegado al instrumento
    if (!voces.length) { var m = /^ ?([1-4]) ?[-\/] ?([1-4])/.exec(n.slice(best.pos + best.p.length - 1)); if (m) for (var q = +m[1]; q <= +m[2]; q++) voces.push(String(q)); }
    if (d[1] === "Guion" || d[1] === "Percusión" || d[1] === "Piano") voces = d[1] === "Percusión" ? voces : [];
    return { instrumento: d[0], familia: d[1], voces: voces, coincide: best.p.trim() };
  }

  // Nombre del instrumento de un músico (texto libre) → nombre de la web
  function canonical(name) {
    var r = detect(name);
    return r ? r.instrumento : String(name || "").trim();
  }
  function family(name) {
    var r = detect(name);
    return r ? r.familia : String(name || "").trim();
  }
  function normVoz(v) {
    var t = norm(v).trim();
    if (!t) return "";
    var r = ORD[t] || ORD[t.split(" ")[0]];
    return r || t;
  }
  var api = { DEF: DEF, detect: detect, canonical: canonical, family: family, normVoz: normVoz, lista: DEF.map(function (d) { return d[0]; }) };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ASAM_INST = api;
})(typeof window !== "undefined" ? window : this);
