# ESAPA CRM v2 — Confirmación de Entrevistas

## Estructura de archivos
```
esapa-v2/
├── index.html       ← Formulario y estructura
├── css/
│   └── style.css    ← Diseño
├── js/
│   └── app.js       ← Lógica completa (editá CONFIG arriba del todo)
└── README.md
```

---

## PASO 1 — Google Sheets + Apps Script

### 1.1 Crear la planilla
1. Abrí [Google Sheets](https://sheets.google.com)
2. Creá una planilla llamada **"ESAPA - Entrevistas"**
3. La primera fila se autocompleta sola con los headers al primer registro.

### 1.2 Crear el script
1. Extensiones → Apps Script
2. Borrá todo y pegá este código:

```javascript
function doPost(e) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  if (hoja.getLastRow() === 0) {
    hoja.appendRow([
      "Timestamp", "Nombre", "Teléfono", "Edad",
      "Curso", "Ocupación", "Horario", "Promoción", "Asesor"
    ]);
  }

  const d = e.parameter;

  hoja.appendRow([
    d.timestamp  || new Date().toISOString(),
    d.nombre     || "",
    d.telefono   || "",
    d.edad       || "",
    d.curso      || "",
    d.ocupacion  || "",
    d.horario    || "",
    d.promocion  || "",
    d.asesor     || "",
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Guardá (Ctrl+S) → nombrá el proyecto "ESAPA CRM v2"

### 1.3 Publicar
1. Implementar → Nueva implementación
2. Tipo: **Aplicación web**
3. Ejecutar como: **Yo**
4. Quién puede acceder: **Cualquier usuario**
5. Implementar → **Copiá la URL**

### 1.4 Pegar URL en el código
Abrí `js/app.js`, buscá esta línea y reemplazá:
```
GOOGLE_SCRIPT_URL: "https://script.google.com/macros/s/TU_URL_AQUI/exec",
```

---

## PASO 2 — Deploy en Vercel (URL pública gratis)

Vercel es más simple que GitHub Pages y da una URL linda para compartir por WhatsApp.

### 2.1 Crear cuenta
Entrá a [vercel.com](https://vercel.com) → Sign up con tu cuenta de Google o GitHub (gratis).

### 2.2 Subir el proyecto desde VSCode

**Opción A — Sin Git (más fácil):**
1. Instalá la CLI de Vercel:
   ```
   npm install -g vercel
   ```
2. Abrí la terminal en VSCode dentro de la carpeta `esapa-v2`
3. Ejecutá:
   ```
   vercel
   ```
4. Seguí los pasos (te va a preguntar si es un nuevo proyecto → sí, nombre → esapa-crm, directorio → .)
5. Te da una URL tipo: `https://esapa-crm.vercel.app`

**Opción B — Con GitHub (recomendada para actualizaciones):**
1. Subí la carpeta a un repositorio de GitHub
2. En Vercel → Add New Project → importá el repositorio
3. Deploy automático — cada vez que actualizás el código en GitHub, Vercel actualiza la URL solo.

### 2.3 Actualizar la URL en el código
Cada vez que hagas cambios:
- Con CLI: `vercel --prod` desde la carpeta
- Con GitHub: push al repositorio y Vercel se actualiza solo

---

## Cómo funciona la pestaña de WhatsApp

Al tocar "Contactar por WhatsApp":
- **Primera vez:** abre una pestaña nueva llamada internamente `esapa_wsp`
- **Siguientes veces:** el navegador reutiliza esa misma pestaña y carga el nuevo chat directo

> **Importante:** para que funcione necesitás tener WhatsApp Web ya abierto y logueado en esa pestaña. La primera vez que abrís el sistema del día, abrís WhatsApp Web manualmente → de ahí en adelante el sistema la reutiliza.

---

## Personalizar el mensaje de WhatsApp
En `js/app.js`, editá `WSP_MENSAJE`. Variables disponibles:
- `{nombre}` → nombre del candidato
- `{curso}` → curso elegido
- `{horario}` → horario preferido
- `{promocion}` → promoción activa
- `{asesor}` → nombre del asesor

## Agregar/quitar cursos
En `index.html`, buscá `<select id="curso">` y editá las opciones `<option>`.

## Agregar asesores como lista fija (cuando estén definidos)
En `index.html`, reemplazá:
```html
<input class="input" type="text" id="asesor" placeholder="Nombre del asesor" />
```
Por:
```html
<select class="input select" id="asesor">
  <option value="">— Seleccioná un asesor —</option>
  <option value="María García">María García</option>
  <option value="Juan López">Juan López</option>
</select>
```
