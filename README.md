# Web de la Banda de Música de Siero (ASAM)

Web de la **Asociación Sierense Amigos de la Música**: portada, quiénes somos, historia, Banda, Bandín, dirección, actuaciones, noticias, galería, contacto y un panel de administración para editarlo todo.

- **Alojamiento:** Vercel (gratis).
- **Datos, fotos y usuarios administradores:** Supabase (gratis).
- **Tecnología:** HTML, CSS y JavaScript sin compilar. No hace falta instalar nada.

## Estructura del proyecto

```
index.html                     Página única: cabecera, contenido y pie
css/estilos.css                Estilos (colores del logo, modo claro y oscuro)
js/config.js                   Dirección y clave pública de Supabase  ← hay que rellenarlo
js/app.js                      Páginas, panel de administración, Área de músicos y conexión con Supabase
js/instrumentos.js             Reconocer el instrumento y la voz de una partitura
js/ast.js                      Textos de la web en asturiano (botón AST)
js/vendor/                     PDF.js, pdf-lib y JSZip (leer, dividir y comprimir partituras)
img/                           Logo y favicon
supabase/esquema.sql           Tablas, reglas de seguridad y almacenamiento de fotos
supabase/datos-iniciales.sql   Contenido de partida (directores, noticias, conciertos…)
supabase/anadir-administrador.sql  Para dar permiso de edición a una persona
supabase/area-musicos.sql      Área de músicos: asistencia, anuncios y partituras privadas
supabase/repertorio.sql        Valoraciones de obras y peticiones de partituras
supabase/directiva.sql         Cargos con permisos, cuentas unificadas y reuniones de la directiva
supabase/notificaciones.sql    Móviles con los avisos activados (notificaciones push)
sw.js, manifest.webmanifest    La web como app instalable y receptor de notificaciones
vercel.json                    Ajustes de Vercel
```

Las páginas se cambian con el menú y la dirección lleva una almohadilla: `/#banda`, `/#noticias`, `/#admin`…

---

## Puesta en marcha (unos 20 minutos)

### 1. Crear el proyecto en Supabase

1. Entra en <https://supabase.com> y crea una cuenta (puedes usar tu cuenta de GitHub).
2. Pulsa **New project**. Ponle un nombre (por ejemplo `banda-siero`), elige una contraseña para la base de datos (guárdala) y la región **Europe (Frankfurt o Paris)**. Espera a que termine de crearse.

### 2. Crear las tablas y cargar el contenido

1. En el menú de la izquierda abre **SQL Editor** → **New query**.
2. Copia todo el contenido de `supabase/esquema.sql`, pégalo y pulsa **Run**. Debe decir *Success*.
3. Abre otra consulta nueva, pega `supabase/datos-iniciales.sql` y pulsa **Run**.

### 3. Crear el primer administrador

1. Ve a **Authentication → Users → Add user → Create new user**.
2. Escribe el correo y una contraseña, marca **Auto Confirm User** y pulsa **Create user**.
3. En el **SQL Editor**, abre `supabase/anadir-administrador.sql`, cambia `correo@ejemplo.com` por ese correo y pulsa **Run**.

Repite estos tres pasos para cada persona que tenga que editar la web.

> Recomendado: en **Authentication → Sign In / Providers → Email**, desactiva **Allow new users to sign up**. Así nadie puede crearse una cuenta por su cuenta. Aunque alguien lo hiciera, no podría editar nada si no está en la tabla de administradores.

### 4. Conectar la web con Supabase

1. En Supabase ve a **Project Settings → API** (en algunos proyectos aparece como **Data API** y **API Keys**).
2. Copia la **Project URL** y la clave pública (**anon public**, o la **publishable** que empieza por `sb_publishable_`).
3. Ábrelas en `js/config.js` y sustituye los textos `PEGA_AQUI…`.

La clave pública puede estar en el código: lo que protege los datos son las reglas de `esquema.sql`. **Nunca** pongas la clave `service_role` ni la `secret`.

### 5. Probarla en tu ordenador (opcional)

Abre la carpeta en Visual Studio Code y usa la extensión **Live Server** (botón *Go Live*). Entra en `/#admin` e inicia sesión con el usuario del paso 3.

### 6. Subirla a GitHub

**Desde la web de GitHub:** crea un repositorio nuevo (por ejemplo `web-banda-siero`), pulsa **uploading an existing file**, arrastra todos los archivos y carpetas del proyecto y pulsa **Commit changes**.

**Con la terminal:**

```bash
cd web-banda-siero
git init
git add .
git commit -m "Primera versión de la web de la ASAM"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/web-banda-siero.git
git push -u origin main
```

### 7. Publicarla en Vercel

1. Entra en <https://vercel.com> con tu cuenta de GitHub.
2. **Add New… → Project**, elige el repositorio `web-banda-siero` y pulsa **Import**.
3. En **Framework Preset** deja **Other**. No hace falta *Build Command* ni *Output Directory*.
4. Pulsa **Deploy**. En un minuto tendrás una dirección del tipo `web-banda-siero.vercel.app`.

Cada vez que subas un cambio a GitHub, Vercel publica la nueva versión automáticamente.

### 8. Último ajuste en Supabase

En **Authentication → URL Configuration** pon como **Site URL** la dirección de Vercel. Hace falta para que funcionen los correos de "he olvidado mi contraseña", si algún día los usáis.

---

## Uso del panel de administración

Pulsa **Administración** en el menú de arriba e inicia sesión. Desde ahí se puede editar:

| Pestaña | Qué se edita |
|---|---|
| Directiva | Miembros de la junta directiva y su cargo |
| Directores | Directores con su foto, presentación y trayectoria |
| Historia | Hitos de la historia con texto e imágenes |
| Músicos | Músicos de la Banda y del Bandín, por instrumento, con el cargo de jefe de sección |
| Eventos | Actuaciones: las futuras salen en la portada y las pasadas en "Actuaciones anteriores" |
| Noticias | Noticias con fotos y enlaces a otras webs |
| Enlaces y redes | Redes sociales y enlaces del pie de página |
| Galería | Subir, describir y borrar fotos |
| Contacto | Dirección, teléfono y correo |
| Pie de página | Textos del pie |
| Cuentas de músicos | Crear, cambiar la contraseña o borrar cuentas de músico |
| Administradores | Crear cuentas de administrador y quitar el acceso |

Las fotos grandes del móvil se reducen solas antes de subirse.

La página Quiénes somos y las descripciones de la Banda y el Bandín están escritas directamente en `js/app.js`. Para cambiarlas hay que editar ese archivo.

## Límites del plan gratuito

- **Supabase:** 500 MB de base de datos y 1 GB para fotos, más que suficiente para esta web. Si el proyecto pasa una semana sin ninguna visita, Supabase lo pausa; se reactiva desde su panel con un clic.
- **Vercel:** el plan Hobby es gratuito y está pensado para uso personal y no comercial. Para la web definitiva de la asociación conviene revisar sus condiciones; si hiciera falta, la misma web funciona sin cambios en Netlify, Cloudflare Pages o GitHub Pages.

## Dominio propio

Cuando queráis usar `bandadesiero.es`, se añade en Vercel → proyecto → **Settings → Domains** y se cambian los registros DNS donde esté contratado el dominio, siguiendo lo que indica Vercel.

## Función de Supabase para crear administradores

Crear cuentas necesita la clave secreta de Supabase, que no puede estar en la web. Por eso la pestaña **Administradores** llama a una función de Supabase (`supabase/functions/administradores/index.ts`) que comprueba que quien la usa es administrador y después crea o borra la cuenta.

La función ya está desplegada en el proyecto. Si algún día hay que volver a desplegarla, se puede hacer con la CLI de Supabase:

```bash
supabase functions deploy administradores --no-verify-jwt
```

## Área de músicos

Desde **🔒 Acceso privado** cada músico entra con su **usuario** (o su correo) y su contraseña. Funciona igual en el móvil (con una barra de pestañas abajo, como una app) y en el ordenador.

- **Cuentas:** las crean los administradores en Administración → **Cuentas de músicos**: nombre, usuario, correo, contraseña, formación (Banda, Bandín o ambas), **instrumento**, **voz** (1, 2, 3…) y cargo (*Músico*, *Jefe de sección* o *Director*). El instrumento y la voz deciden qué partituras le llegan; se pueden cambiar después en Administración → Músicos.
- **Agenda:** semana o mes con puntos en los días con eventos, *Anteriores / Próximos* y filtros *Todos, Actuaciones, Ensayos, Otros*. Cada tarjeta muestra quién ha confirmado y los botones ✗ / ✓ para responder. Los eventos se crean en Administración → Eventos (con hora de fin y dirección para el mapa, opcionales).
- **Ficha del evento:** pestañas *Detalles* (convocatoria, fecha con botón **Añadir** al calendario del móvil, horario, lugar con **Cómo llegar** y mapa, indumentaria e indicaciones), *Repertorio* (las obras en el orden del concierto y botón para descargarlas) y *Miembros* (quién va, quién no y quién no ha respondido, por instrumento; los administradores pasan lista). Cada músico responde *Asistiré / Duda / No asistiré* y puede añadir una nota.
- **Repertorio:** el próximo evento con sus portadas y el botón **Descargar** (un .zip con las partituras de tu instrumento), y todas las obras con buscador, orden y filtros. Cada obra tiene vídeo de referencia, notas de la dirección, **solo los archivos de tu instrumento y tu voz** (con las otras voces de tu instrumento aparte, por si tienes que doblar), valoración con estrellas, los eventos en los que se toca y un botón para **reclamar** la partitura si falta.
- **Partituras (solo administradores):** se crea la obra y se suben las particellas:
  - varios archivos sueltos («Clarinete 1.pdf», «Trumpet in Bb 2.pdf», «Saxo alto 1º.pdf»…): el instrumento y la voz salen del nombre, o de la cabecera del PDF si el nombre no dice nada;
  - **un solo PDF con todas las particellas**: la web lee la cabecera de cada página, encuentra dónde empieza cada particella y lo divide. Si el PDF está escaneado (sin texto), la web lee la imagen de cada página con reconocimiento de texto (Tesseract.js, en el navegador; prueba también las páginas giradas) y propone los cortes. Al leer imágenes puede equivocarse, así que hay que revisarlos; también se puede saltar y marcar los cortes a mano sobre las miniaturas.
  
  Antes de guardar se ve a quién llega cada archivo y qué músicos se quedarían sin partitura. Reconoce los nombres en castellano, asturiano, inglés, italiano, francés y alemán, y las abreviaturas habituales (Cl., Tpt., Hn., Tbn.…). La percusión recibe todas las partes de percusión y quien tiene el cargo *Director* recibe el guion.
- **Avisos:** partituras nuevas y el tablón de anuncios (para todos, solo Banda o solo Bandín) con comentarios. La campana muestra cuántos avisos no has visto.
- **Perfil:** tus datos, tu porcentaje de asistencia, las convocatorias respondidas y el cambio de contraseña.

Archivos: `supabase/area-musicos.sql` y `supabase/repertorio.sql` (tablas y seguridad: ejecuta los dos en el SQL Editor, en ese orden), `supabase/functions/musicos/index.ts` (crear cuentas y entrar con usuario), `js/instrumentos.js` (reconocimiento de instrumentos y voces) y `js/vendor/` (librerías para leer y dividir PDF y hacer los .zip).

## Directiva: personas, cargos y reuniones

Ejecuta `supabase/directiva.sql` en el SQL Editor (después de `repertorio.sql`) y despliega de nuevo la función `musicos`.

- **Personas y accesos** (Administración → Directiva): una sola cuenta por persona. Se le marca si es **músico** (instrumento, voz, formación) y/o si está en la **directiva** (con su cargo). Quien está en la directiva y no toca no necesita ficha de músico. Puede entrar con su usuario o con su correo.
- **Cargos**: cada cargo tiene tres permisos que se marcan desde la web:
  - *Editar la web*: textos, noticias, eventos, fotos…
  - *Área de músicos*: partituras, agenda y eventos, avisos y pase de lista.
  - *Cuentas y permisos*: crear cuentas, dar accesos y cambiar los cargos.
  Un cargo sin ninguna casilla (por ejemplo **Vocal**) solo ve lo de la directiva: tareas, reuniones y sugerencias. Se pueden crear, cambiar y borrar cargos. El cargo «Administrador general» no se puede borrar, y la base de datos no deja que se quede nadie con el permiso «Cuentas y permisos».
- **Reuniones**: convocatoria con orden del día, confirmación de asistencia de cada miembro, acta y acuerdos; cada acuerdo se puede convertir en una tarea.

Los permisos se comprueban en la base de datos (reglas de seguridad de Supabase), no solo en la web.

### Correo automático con el usuario y la contraseña

Al crear una cuenta (o al pulsar «✉️ Enviar acceso nuevo»), la función `musicos` le manda a la persona un correo con su usuario y una contraseña provisional. La primera vez que entra, la web le obliga a elegir una contraseña suya.

Para que los correos salgan hay que configurarlo una vez (si no, la web enseña los datos y un botón para enviarlos desde tu propio correo):

1. Crea una cuenta gratuita en [Brevo](https://www.brevo.com) (300 correos al día).
2. En **Senders, domains & dedicated IPs → Senders**, añade el correo que enviará los mensajes (por ejemplo `administracion@bandadesiero.es`) y confírmalo con el enlace que te llega.
3. En **SMTP & API → API keys**, crea una clave.
4. En Supabase → **Edge Functions → Secrets**, añade:
   - `BREVO_API_KEY` = la clave de Brevo
   - `MAIL_FROM` = `Banda de Música de Siero <administracion@bandadesiero.es>`
   - `WEB_URL` = la dirección de la web (por ejemplo `https://bandadesiero.es`)

También funciona con [Resend](https://resend.com) poniendo `RESEND_API_KEY` en lugar de `BREVO_API_KEY` (Resend pide verificar el dominio). Las claves van solo en los secretos de Supabase, nunca en `js/config.js`.

## Notificaciones al móvil

Los músicos pueden activar en su móvil los avisos de la web (Área de músicos → aviso en la Agenda o en Perfil). Al crear un evento desde la Agenda, o al publicar un anuncio, se marca «🔔 Avisar al móvil» y les llega una notificación aunque tengan la web cerrada. En iPhone hace falta añadir antes la web a la pantalla de inicio (iOS 16.4 o posterior); la propia web lo explica.

Puesta en marcha (una vez):
1. Ejecuta `supabase/notificaciones.sql` en el SQL Editor.
2. En Supabase → Edge Functions → Secrets añade `VAPID_PUBLIC_KEY` y `VAPID_PRIVATE_KEY` (el par de claves de las notificaciones; la pública es la que aparece como `VAPID_PUBLIC` en `js/app.js`). Opcional: `VAPID_CONTACT` = `mailto:correo-de-la-asociacion`.
3. La función `avisos` (`supabase/functions/avisos/`) es la que envía las notificaciones.

La clave privada no se guarda nunca en el repositorio. Si se pierde, genera un par nuevo, cambia `VAPID_PUBLIC` en `js/app.js` y los músicos tendrán que volver a activar los avisos.
