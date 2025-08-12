# Calculadora de carrera (PWA)

Pequeña app web para calcular **ritmo, tiempo, distancia y velocidad** en carreras y entrenos. Funciona como **Aplicación Web Progresiva (PWA)**: puedes **instalarla** en tu móvil y usarla **sin conexión**.

> URL recomendada: publícala en GitHub Pages/Vercel/Netlify para servirla por **HTTPS** y habilitar el modo **offline**.

---

## ✨ Características
- Conversión entre **Ritmo (min/km o min/mi)**, **Tiempo (hh:mm:ss)** y **Distancia (km o mi)**.
- Cálculo de **velocidad** (km/h o mph).
- Selector de **unidades**: km ↔ mi.
- Redondeo del ritmo: exacto, al segundo, a 5 s, a 10 s.
- **PWA**: instalable y usable **offline** (service worker + caché).
- Interfaz responsive y accesible, con soporte para introducir formatos flexibles (`4:40`, `00:45:16`, `4'40`).

---

## 📁 Estructura del proyecto
```
.
├─ index.html              # App principal (UI + lógica)
├─ manifest.webmanifest    # Manifest PWA (nombre, iconos, colores)
├─ sw.js                   # Service Worker (caché + offline)
└─ icons/
   ├─ icon-192.png
   └─ icon-512.png
```

---

## 🚀 Uso rápido (web)
1. Sube estos archivos a un hosting **HTTPS** (p. ej., GitHub Pages).
2. Abre la URL en tu navegador. En móvil, añade a **pantalla de inicio** para instalar.

### Despliegue en GitHub Pages
**Opción 1: Web**
1. Crea un repositorio (por ej., `carrera-calc`) y sube `index.html`, `manifest.webmanifest`, `sw.js` e `icons/` (mantén la estructura).
2. En el repo: **Settings → Pages** → *Build and deployment*: **Deploy from a branch** → Branch **main** y carpeta **/(root)** → **Save**.
3. Espera ~1–10 min y abre la URL publicada (HTTPS).

**Opción 2: Terminal**
```bash
git init
git add .
git commit -m "PWA inicial"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/carrera-calc.git
git push -u origin main
```
Luego activa Pages como en la Opción 1 (Settings → Pages).

> Si usas carpetas/archivos que empiecen por `_` o necesitas desactivar Jekyll, añade un archivo vacío llamado `.nojekyll` en la raíz.

---

## 🧪 Desarrollo local
Para probar en tu Mac:
```bash
# dentro de la carpeta del proyecto
python3 -m http.server 8080
```
Abre `http://localhost:8080`.  
> El service worker solo funciona en **http(s)** o **localhost** (no en `file://`).

---

## 📲 Instalar como PWA
- **iPhone (Safari)**: abre la URL **HTTPS** → **Compartir → Añadir a pantalla de inicio** → **Añadir**.  
- **Android (Chrome)**: abre la URL → botón **Instalar** o **Añadir a pantalla de inicio**.  
- **Escritorio**: Chrome/Edge mostrarán “Instalar app” en la barra de direcciones.

Primera carga **online**: abre la app una vez con conexión para que el **service worker** guarde los recursos. Luego podrás usarla **offline**.

---

## 🛠️ Personalización
- **Nombre/colores/iconos**: edita `manifest.webmanifest` (propiedades `name`, `short_name`, `theme_color`, `background_color`) y reemplaza los PNG de `icons/`.
- **Título y tema**: en `index.html`, cambia `<title>` y estilos CSS.
- **Favicon**: apunta `<link rel="icon">` a tu icono.

---

## 🔁 Actualizaciones y caché
El service worker usa caché “app shell”. Tras cambiar archivos, aumenta la versión de caché en `sw.js`:
```js
const CACHE_NAME = 'carrera-calc-v2'; // cambia la versión
```
Sube los cambios. Los navegadores actualizarán el SW automáticamente en el siguiente arranque de la app.

---

## ♿ Accesibilidad y formato de entrada
- Soporta `mm:ss`, `hh:mm:ss` y también `m'ss` (ej.: `4'40`).
- Campos con `inputmode` numérico para facilitar el teclado en móviles.
- Región de resultados con `aria-live="polite"`.

---

## ❗Notas
- iOS exige **HTTPS** para que el service worker funcione fuera de `localhost`.
- Si no ves el botón “Instalar” en iOS, usa **Compartir → Añadir a pantalla de inicio** (comportamiento normal en Safari).

---

## 📄 Licencia
Elige la que prefieras. Recomendación: **MIT** para máxima simplicidad.

---

## 🙌 Créditos
Proyecto generado para @Juanjo como utilidad de cálculo de ritmos/tiempos/distancias en carrera.
