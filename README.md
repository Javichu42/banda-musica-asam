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
js/app.js                      Páginas, panel de administración y conexión con Supabase
img/                           Logo y favicon
supabase/esquema.sql           Tablas, reglas de seguridad y almacenamiento de fotos
supabase/datos-iniciales.sql   Contenido de partida (directores, noticias, conciertos…)
supabase/anadir-administrador.sql  Para dar permiso de edición a una persona
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
