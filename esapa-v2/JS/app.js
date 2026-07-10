/* =============================================
   ESAPA CRM v2 — app.js
   ============================================= */

const CONFIG = {
  GOOGLE_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbyg8NkFyH1fuNLWvkHgolz-taE8MAhj5jxLTBPjoAlR4igkewPzyvgW7UHckqvhuuCD/exec",

  // Dirección fija de ESAPA
  DIRECCION: "Lavalle 174, casi esquina Rioja, ciudad 📍",

  // Mensaje — variables: {nombre}, {diaSemana}, {dia}, {mes}, {hora}, {asistente}
  WSP_MENSAJE:
`CONFIRMACIÓN ENTREVISTA 📆
{diaSemana} {dia}/{mes}
Horario: {hora} hs ⏰
Dirección: Lavalle 174, casi esquina Rioja, ciudad 📍
Asistente: {asistente} 🙋‍♀️
Por favor, confirmá tu asistencia 📝
¡Estamos ansiosos por verte! 🤗`,
};

/* ── Estado ── */
let datosEntrevista = {};
let wspWindow = null;

/* ── Shortcut DOM ── */
const $ = id => document.getElementById(id);

const cardForm    = $("card-form");
const cardConfirm = $("card-confirm");
const cardSuccess = $("card-success");
const stepDots    = [$("step-dot-1"), $("step-dot-2"), $("step-dot-3")];
const stepLines   = document.querySelectorAll(".step-line");
const menuToggle  = $("menu-toggle");
const menuDropdown = $("menu-dropdown");

const CURSOS_INTERES = [
  "Auxiliar de Farmacia",
  "Lengua de Señas",
  "Administrativo de Veterinarias",
  "Secretariado Médico",
  "Auxiliar de Acomp. Terapéutico",
  "Técnico Superior en Farmacia",
  "Técnico Superior en Sanidad Animal",
  "Técnico Sup. en Diseño Multimedial",
  "Instalador de Paneles Solares",
  "Electricidad Domiciliaria",
  "Peluquería Canina",
  "Mecánica de Motos",
  "Reparación de Celulares",
  "Inglés Profesional",
  "Cuidados Infantiles",
  "Barbería",
  "Arte y diseño de uñas",
  "Otro"
];

const cursoInput = $("curso");
const cursoToggle = $("curso-toggle");
const cursoOptions = $("curso-options");
let cursoOpen = false;

function actualizarGrupoOtro() {
  const grupoOtro = $("grupo-otro");
  if (grupoOtro) {
    grupoOtro.classList.toggle("hidden", cursoInput.value !== "Otro");
  }
}

function renderCursos(filter = "") {
  const query = filter.trim().toLowerCase();
  const filtrados = CURSOS_INTERES.filter(curso => curso.toLowerCase().includes(query));

  if (filtrados.length === 0) {
    cursoOptions.innerHTML = '<li class="custom-select-option">No se encontraron cursos</li>';
  } else {
    cursoOptions.innerHTML = filtrados.map(curso => `
      <li class="custom-select-option" data-curso="${curso}">${curso}</li>
    `).join("");
  }

  cursoOptions.classList.toggle("hidden", !cursoOpen || filtrados.length === 0);
  cursoToggle.setAttribute("aria-expanded", String(cursoOpen));
}

function abrirListaCursos() {
  cursoOpen = true;
  renderCursos(cursoInput.value);
}

function cerrarListaCursos() {
  cursoOpen = false;
  cursoOptions.classList.add("hidden");
  cursoToggle.setAttribute("aria-expanded", "false");
}

function seleccionarCurso(curso) {
  cursoInput.value = curso;
  actualizarGrupoOtro();
  cerrarListaCursos();
}

function inicializarCursos() {
  renderCursos("");
  cerrarListaCursos();
  actualizarGrupoOtro();

  cursoInput.addEventListener("focus", () => abrirListaCursos());
  cursoInput.addEventListener("input", () => {
    abrirListaCursos();
    renderCursos(cursoInput.value);
    actualizarGrupoOtro();
  });

  cursoInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      cerrarListaCursos();
      return;
    }

    if (event.key === "Enter" && cursoOpen) {
      event.preventDefault();
      const primerOpcion = cursoOptions.querySelector(".custom-select-option");
      if (primerOpcion && !primerOpcion.textContent.includes("No se encontraron")) {
        seleccionarCurso(primerOpcion.dataset.curso);
      }
    }
  });

  cursoToggle.addEventListener("click", (event) => {
    event.preventDefault();
    if (cursoOpen) {
      cerrarListaCursos();
    } else {
      abrirListaCursos();
    }
  });

  cursoOptions.addEventListener("click", (event) => {
    const opcion = event.target.closest(".custom-select-option");
    if (!opcion) return;
    seleccionarCurso(opcion.dataset.curso);
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".custom-select")) {
      cerrarListaCursos();
    }
  });
}

/* ════════════════════════
   MENÚ DESPLEGABLE
════════════════════════ */
function closeMenu() {
  if (!menuDropdown || !menuToggle) return;
  menuDropdown.classList.add("hidden");
  menuToggle.setAttribute("aria-expanded", "false");
}

if (menuToggle && menuDropdown) {
  menuToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = !menuDropdown.classList.contains("hidden");
    menuDropdown.classList.toggle("hidden");
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
  });

  menuDropdown.addEventListener("click", (event) => {
    const action = event.target.dataset.action;
    if (!action) return;

    if (action === "new") {
      $("btn-nuevo").click();
    } else if (action === "steps") {
      document.querySelector(".steps-bar").scrollIntoView({ behavior: "smooth", block: "start" });
    }

    closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".header-actions")) closeMenu();
  });
}

/* ════════════════════════
   BARRA DE PASOS
════════════════════════ */
function setStep(n) {
  stepDots.forEach((dot, i) => {
    dot.classList.remove("active", "done");
    if (i + 1 < n)   dot.classList.add("done");
    if (i + 1 === n) dot.classList.add("active");
  });
  stepLines.forEach((line, i) => {
    line.classList.toggle("done", i + 1 < n);
  });
}

/* ── Fecha por calendario: se usará `cita-fecha` (input date) ── */
// Preseleccionar hoy en el input date si existe
(function setDefaultFecha() {
  const el = $("cita-fecha");
  if (!el) return;
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, "0");
  const dd = String(hoy.getDate()).padStart(2, "0");
  el.value = `${yyyy}-${mm}-${dd}`;
})();

/* ════════════════════════
   VALIDACIÓN PASO 1
════════════════════════ */
const CAMPOS_REQ = ["nombre","telefono","edad","curso","ocupacion","horario","asesor"];

function clearErrors() {
  CAMPOS_REQ.forEach(id => {
    const e = $(`err-${id}`); const i = $(id);
    if (e) e.textContent = "";
    if (i) i.classList.remove("error");
  });
}

function showError(campo, msg) {
  const e = $(`err-${campo}`); const i = $(campo);
  if (e) e.textContent = msg;
  if (i) i.classList.add("error");
}

function validarFormulario() {
  clearErrors();
  let ok = true;
  const nombre = $("nombre").value.trim();
  if (!nombre || nombre.length < 3) { showError("nombre", "Ingresá el nombre completo."); ok = false; }
  const tel = $("telefono").value.replace(/\D/g,"");
  if (!tel || tel.length < 8 || tel.length > 13) { showError("telefono", "Número inválido. Ej: 2616123456"); ok = false; }
  const edad = parseInt($("edad").value);
  if (!edad || edad < 14 || edad > 99) { showError("edad", "Ingresá una edad válida."); ok = false; }
  if (!$("curso").value) { showError("curso", "Seleccioná un curso."); ok = false; }
  if (!$("ocupacion").value.trim()) { showError("ocupacion", "La ocupación es requerida."); ok = false; }
  if (!$("horario").value.trim()) { showError("horario", "El horario es requerido."); ok = false; }
  if (!$("asesor").value.trim()) { showError("asesor", "El asesor es requerido."); ok = false; }
  return ok;
}

/* ════════════════════════
   PASO 1 → 2
════════════════════════ */
$("btn-continuar").addEventListener("click", () => {
  if (!validarFormulario()) return;
  const cursoSel = $("curso").value;
  const cursoFinal = cursoSel === "Otro" ? ($("otro-curso").value.trim() || "Otro") : cursoSel;

  datosEntrevista = {
    nombre:    $("nombre").value.trim(),
    telefono:  $("telefono").value.replace(/\D/g,""),
    edad:      $("edad").value.trim(),
    curso:     cursoFinal,
    ocupacion: $("ocupacion").value.trim(),
    horario:   $("horario").value.trim(),
    promocion: $("promocion").value.trim() || "Sin promoción",
    asesor:    $("asesor").value.trim(),
    timestamp: new Date().toISOString(),
  };

  const filas = [
    ["Nombre",    datosEntrevista.nombre],
    ["Teléfono",  "+54 " + datosEntrevista.telefono],
    ["Edad",      datosEntrevista.edad + " años"],
    ["Curso",     datosEntrevista.curso],
    ["Ocupación", datosEntrevista.ocupacion],
    ["Horario",   datosEntrevista.horario],
    ["Promoción", datosEntrevista.promocion],
    ["Asesor",    datosEntrevista.asesor],
  ];

  $("confirm-table").innerHTML = filas.map(([k,v]) => `
    <div class="confirm-row">
      <span class="confirm-key">${k}</span>
      <span class="confirm-val">${v}</span>
    </div>`).join("");

  cardForm.classList.add("hidden");
  cardConfirm.classList.remove("hidden");
  setStep(2);
  window.scrollTo({ top: 0, behavior: "smooth" });
});

$("btn-volver").addEventListener("click", () => {
  cardConfirm.classList.add("hidden");
  cardForm.classList.remove("hidden");
  setStep(1);
  window.scrollTo({ top: 0, behavior: "smooth" });
});

inicializarCursos();

$("curso").addEventListener("change", function () {
  actualizarGrupoOtro();
});

/* ════════════════════════
   PASO 2 → 3
════════════════════════ */
$("btn-guardar").addEventListener("click", async () => {
  const btn   = $("btn-guardar");
  const texto = $("btn-guardar-text");
  const spin  = $("spinner");
  btn.disabled = true;
  texto.textContent = "Guardando...";
  spin.classList.remove("hidden");

  try {
    await enviarASheets(datosEntrevista);

    // Chip del candidato
    $("success-nombre").textContent = datosEntrevista.nombre;
    $("chip-tel").textContent = "+54 " + datosEntrevista.telefono;

    // Pre-completar asistente con el del formulario
    $("cita-asistente").value = datosEntrevista.asesor || "";

    actualizarPreview();

    cardConfirm.classList.add("hidden");
    cardSuccess.classList.remove("hidden");
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
    showToast("✅ Entrevista registrada. Completá la cita para contactar.", "success");

  } catch (err) {
    showToast("⚠️ Error al guardar. Verificá la conexión.", "error");
    console.error(err);
  } finally {
    btn.disabled = false;
    texto.textContent = "Guardar y contactar";
    spin.classList.add("hidden");
  }
});

/* ════════════════════════
   PREVIEW EN TIEMPO REAL
════════════════════════ */
["cita-fecha","cita-horario","cita-asistente"].forEach(id => {
  const el = $(id);
  if (!el) return;
  el.addEventListener("change", actualizarPreview);
  el.addEventListener("input",  actualizarPreview);
});

function actualizarPreview() {
  const fechaVal   = $("cita-fecha") ? $("cita-fecha").value : "";
  const horarioRaw = $("cita-horario").value;   // "19:00"
  const asistente  = $("cita-asistente").value.trim();

  if (!fechaVal || !horarioRaw || !asistente) {
    $("wsp-preview").textContent = "Completá todos los campos para ver el mensaje...";
    return;
  }

  // fechaVal formato YYYY-MM-DD
  const [anioStr, mesStr, diaStr] = fechaVal.split("-");
  const anio = parseInt(anioStr, 10);
  const mesNum = parseInt(mesStr, 10);
  const dia = String(parseInt(diaStr, 10)).padStart(2, "0");
  const fecha = new Date(anio, mesNum - 1, parseInt(diaStr, 10));
  const diasSemana = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  const diaSemana  = diasSemana[fecha.getDay()];

  // Formatear hora a "19:00"
  const [h, m] = horarioRaw.split(":");
  const horaFmt = `${h}:${m}`;

  const mesNum2 = String(mesNum).padStart(2, "0");

  const mensaje = CONFIG.WSP_MENSAJE
    .replace("{nombre}",    datosEntrevista.nombre || "")
    .replace("{diaSemana}", diaSemana)
    .replace("{dia}",       dia)
    .replace("{mes}",       mesNum2)
    .replace("{hora}",      horaFmt)
    .replace("{asistente}", asistente);

  $("wsp-preview").textContent = mensaje;
}

/* ════════════════════════════════════════════
   WHATSAPP — PESTAÑA ÚNICA REUTILIZABLE
   Se reutiliza la misma ventana de WhatsApp Web.
   Si la ventana ya existe, se actualiza la URL.
   Si se cerró, se vuelve a abrir.
════════════════════════════════════════════ */
function abrirWhatsApp(url) {
  // 1. Delegamos el control al navegador usando el nombre "esapa_wsp"
  // Esto fuerza a que recicle siempre la misma pestaña en lugar de abrir nuevas
  wspWindow = window.open(url, "esapa_wsp");

  // 2. Mantenemos tu validación por si el navegador bloquea los pop-ups
  if (!wspWindow || wspWindow.closed || typeof wspWindow.closed === "undefined") {
    showToast("⚠️ Permití las ventanas emergentes para usar la misma pestaña de WhatsApp.", "error");
  } else {
    // Si todo sale bien, hace que la pestaña de WhatsApp parpadee o pase al frente
    wspWindow.focus();
  }
}

$("btn-wsp").addEventListener("click", () => {
  // 1. Validaciones
  let ok = true;
  [["cita-fecha","err-cita-fecha","Seleccioná la fecha"],
   ["cita-horario","err-cita-horario","Ingresá el horario"],
   ["cita-asistente","err-cita-asistente","Ingresá el asistente"]
  ].forEach(([id, errId, msg]) => {
    const el = $(id);
    const val = el ? el.value.trim() : "";
    const err = $(errId);
    if (!val) {
      if (err) err.textContent = msg;
      if (el) el.classList.add("error");
      ok = false;
    } else {
      if (err) err.textContent = "";
      if (el) el.classList.remove("error");
    }
  });
  if (!ok) { showToast("Completá todos los campos de la cita.", "error"); return; }

  // 2. Armamos el mensaje y el teléfono
  const mensaje = $("wsp-preview").textContent;
  const tel     = "54" + datosEntrevista.telefono;

  // 3. EL CAMBIO MAGICO: Usamos whatsapp:// en lugar de https://
  const url = `whatsapp://send?phone=${tel}&text=${encodeURIComponent(mensaje)}`;
  
  // 4. Redirigimos la orden sin abrir pestañas nuevas
  window.location.href = url;
});

/* ── Nueva entrevista ── */
$("btn-nuevo").addEventListener("click", () => {
  ["nombre","telefono","edad","ocupacion","horario","promocion","asesor","otro-curso",
   "cita-fecha","cita-horario","cita-asistente"].forEach(id => {
    const el = $(id); if (el) el.value = "";
  });
  cursoInput.value = "";
  actualizarGrupoOtro();
  renderCursos("");
  cerrarListaCursos();
  $("wsp-preview").textContent = "Completá los campos para ver el mensaje...";
  clearErrors();
  datosEntrevista = {};

  // Resetear fecha a hoy
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, "0");
  const dd = String(hoy.getDate()).padStart(2, "0");
  if ($("cita-fecha")) $("cita-fecha").value = `${yyyy}-${mm}-${dd}`;

  cardSuccess.classList.add("hidden");
  cardForm.classList.remove("hidden");
  setStep(1);
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ════════════════════════
   GOOGLE SHEETS
════════════════════════ */
async function enviarASheets(datos) {
  if (CONFIG.GOOGLE_SCRIPT_URL.includes("TU_URL_AQUI")) {
    console.warn("⚠️ MODO DEMO");
    await new Promise(r => setTimeout(r, 900));
    return { demo: true };
  }
  const params = new URLSearchParams();
  Object.entries(datos).forEach(([k,v]) => params.append(k,v));
  await fetch(CONFIG.GOOGLE_SCRIPT_URL, { method:"POST", mode:"no-cors", body: params });
  return { ok: true };
}

/* Chatbot removed */

/* ════════════════════════
   UTILIDADES
════════════════════════ */
function showToast(msg, tipo = "") {
  const t = $("toast");
  t.textContent = msg;
  t.className = `toast ${tipo}`;
  t.classList.remove("hidden");
  setTimeout(() => t.classList.add("hidden"), 3500);
}

$("year").textContent = new Date().getFullYear();
setStep(1);