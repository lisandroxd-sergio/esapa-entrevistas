/* =============================================
   ESAPA CRM v2 — app.js
   ============================================= */

/* ════════════════════════════════════════
   USUARIOS — agregá o quitá acá
   Contraseñas: cambialas cuando quieras
════════════════════════════════════════ */
const USUARIOS = [
  { nombre: "Martina",  password: "esapa2025",  color: "#2563eb", emoji: "👩‍💼" },
  { nombre: "Valeria",  password: "valeria123", color: "#7c3aed", emoji: "👩‍💻" },
  { nombre: "Mely", password: "mely2025",   color: "#059669", emoji: "🧑‍🏫" },
  { nombre: "Admin",    password: "admin2025",  color: "#0d1f3c", emoji: "🔑" },
];

/* ════════════════════════════════════════
   LOGIN
════════════════════════════════════════ */
let usuarioActivo = null;

function iniciarLogin() {
  const loginScreen = document.getElementById("login-screen");
  const appScreen   = document.getElementById("app-screen");

  // Si ya hay sesión activa, ir directo a la app
  const sesion = sessionStorage.getItem("esapa_user");
  if (sesion) {
    usuarioActivo = JSON.parse(sesion);
    loginScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");
    aplicarUsuario(usuarioActivo);
    return;
  }

  // Generar avatares
  const grid = document.getElementById("user-grid");
  USUARIOS.forEach(u => {
    const btn = document.createElement("button");
    btn.className = "user-avatar-btn";
    btn.type = "button";
    btn.dataset.nombre = u.nombre;
    btn.innerHTML = `
      <div class="user-avatar-circle" style="background:${u.color}">${u.emoji}</div>
      <span class="user-avatar-name">${u.nombre}</span>
    `;
    btn.addEventListener("click", () => seleccionarUsuario(u, btn));
    grid.appendChild(btn);
  });

  // Mostrar/ocultar contraseña
  document.getElementById("pass-toggle").addEventListener("click", () => {
    const input = document.getElementById("login-pass");
    input.type = input.type === "password" ? "text" : "password";
  });

  // Enter en el campo de contraseña
  document.getElementById("login-pass").addEventListener("keydown", e => {
    if (e.key === "Enter") intentarLogin();
  });

  document.getElementById("btn-login").addEventListener("click", intentarLogin);
}

function seleccionarUsuario(usuario, btnEl) {
  // Resaltar avatar seleccionado
  document.querySelectorAll(".user-avatar-btn").forEach(b => b.classList.remove("selected"));
  btnEl.classList.add("selected");

  usuarioActivo = usuario;

  // Mostrar campo de contraseña
  const passGroup = document.getElementById("login-pass-group");
  passGroup.classList.remove("hidden");
  document.getElementById("login-user-label").textContent = usuario.nombre;
  document.getElementById("login-pass").value = "";
  document.getElementById("login-error").textContent = "";
  document.getElementById("btn-login").classList.remove("hidden");

  // Foco en contraseña
  setTimeout(() => document.getElementById("login-pass").focus(), 100);
}

function intentarLogin() {
  const pass  = document.getElementById("login-pass").value;
  const error = document.getElementById("login-error");

  if (!usuarioActivo) return;

  if (pass === usuarioActivo.password) {
    // Login correcto
    sessionStorage.setItem("esapa_user", JSON.stringify(usuarioActivo));

    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("app-screen").classList.remove("hidden");
    aplicarUsuario(usuarioActivo);
  } else {
    error.textContent = "Contraseña incorrecta. Intentá de nuevo.";
    document.getElementById("login-pass").classList.add("error");
    document.getElementById("login-pass").value = "";
    document.getElementById("login-pass").focus();

    // Animación de error
    document.getElementById("login-pass").style.animation = "none";
    setTimeout(() => {
      document.getElementById("login-pass").style.animation = "";
    }, 10);
  }
}

function aplicarUsuario(usuario) {
  // Saludo en el header
  document.getElementById("header-welcome").textContent = `Hola, ${usuario.nombre} 👋`;

  // Pre-completar asesor con el usuario logueado (si está en la lista)
  if (asesorInput && ASESOR_OPTIONS.includes(usuario.nombre)) {
    asesorInput.value = usuario.nombre;
  }
}

function cerrarSesion() {
  sessionStorage.removeItem("esapa_user");
  usuarioActivo = null;
  location.reload();
}

/* ════════════════════════
   CONFIG
════════════════════════ */
const CONFIG = {
  GOOGLE_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbyg8NkFyH1fuNLWvkHgolz-taE8MAhj5jxLTBPjoAlR4igkewPzyvgW7UHckqvhuuCD/exec",
  DIRECCION: "Lavalle 174, casi esquina Rioja, ciudad 📍",
  WSP_MENSAJE:
`CONFIRMACIÓN ENTREVISTA 📆
{diaSemana} {dia}/{mes}
Horario: {hora} hs ⏰
Dirección: Lavalle 174, casi esquina Rioja, ciudad 📍
Asesor: {asistente} 🙋‍♀️
Por favor, confirmá tu asistencia 📝
¡Estamos ansiosos por verte! 🤗`,
};

/* ── Estado ── */
let datosEntrevista = {};
let wspWindow = null;

/* ── Shortcut DOM ── */
const $ = id => document.getElementById(id);

const cardForm     = $("card-form");
const cardConfirm  = $("card-confirm");
const cardSuccess  = $("card-success");
const stepDots     = [$("step-dot-1"), $("step-dot-2"), $("step-dot-3")];
const stepLines    = document.querySelectorAll(".step-line");
const menuToggle   = $("menu-toggle");
const menuDropdown = $("menu-dropdown");

const CURSOS_INTERES = [
  "Auxiliar de Farmacia","Lengua de Señas","Administrativo de Veterinarias",
  "Secretariado Médico","Auxiliar de Acomp. Terapéutico","Técnico Superior en Farmacia",
  "Técnico Superior en Sanidad Animal","Técnico Sup. en Diseño Multimedial",
  "Instalador de Paneles Solares","Electricidad Domiciliaria","Peluquería Canina",
  "Mecánica de Motos","Reparación de Celulares","Inglés Profesional",
  "Cuidados Infantiles","Barbería","Arte y diseño de uñas","Otro"
];

const ASESOR_OPTIONS = USUARIOS.map(u => u.nombre);
const OCUPACIONES    = ["Empleado","Estudiante","Desempleado","Independiente","Freelance","Otro"];

const cursoInput      = $("curso");
const cursoToggle     = $("curso-toggle");
const cursoOptions    = $("curso-options");
const ocupacionInput  = $("ocupacion");
const ocupacionToggle = $("ocupacion-toggle");
const ocupacionOptions= $("ocupacion-options");
const asesorInput     = $("asesor");
const asesorToggle    = $("asesor-toggle");
const asesorOptions   = $("asesor-options");

let cursoOpen = false, ocupacionOpen = false, asesorOpen = false;

/* ════════════════════════
   SELECTS CUSTOM
════════════════════════ */
function actualizarGrupoOtro() {
  const g = $("grupo-otro");
  if (g) g.classList.toggle("hidden", cursoInput.value !== "Otro");
}

function renderSelectOptions(items, filter) {
  const q = filter.trim().toLowerCase();
  const f = items.filter(i => i.toLowerCase().includes(q));
  return f.length
    ? f.map(i => `<li class="custom-select-option" data-value="${i}">${i}</li>`).join("")
    : '<li class="custom-select-option">No se encontraron opciones</li>';
}

function isValidOption(val, items) {
  return items.some(i => i.toLowerCase() === val.trim().toLowerCase());
}

function cerrarTodosLosSelects() {
  if (cursoOpen)    cerrarListaCursos();
  if (ocupacionOpen) cerrarListaOcupacion();
  if (asesorOpen)   cerrarListaAsesor();
}

function abrirListaCursos() {
  cursoOpen = true;
  cursoOptions.innerHTML = renderSelectOptions(CURSOS_INTERES, cursoInput.value);
  cursoOptions.classList.remove("hidden");
}
function cerrarListaCursos() {
  cursoOpen = false; cursoOptions.classList.add("hidden");
}
function seleccionarCurso(v) {
  cursoInput.value = v; actualizarGrupoOtro(); cerrarListaCursos();
}

function abrirListaOcupacion() {
  ocupacionOpen = true;
  ocupacionOptions.innerHTML = renderSelectOptions(OCUPACIONES, ocupacionInput.value);
  ocupacionOptions.classList.remove("hidden");
}
function cerrarListaOcupacion() {
  ocupacionOpen = false; ocupacionOptions.classList.add("hidden");
}
function seleccionarOcupacion(v) {
  ocupacionInput.value = v; cerrarListaOcupacion();
}

function abrirListaAsesor() {
  asesorOpen = true;
  asesorOptions.innerHTML = renderSelectOptions(ASESOR_OPTIONS, asesorInput.value);
  asesorOptions.classList.remove("hidden");
}
function cerrarListaAsesor() {
  asesorOpen = false; asesorOptions.classList.add("hidden");
}
function seleccionarAsesor(v) {
  asesorInput.value = v; cerrarListaAsesor();
}

function inicializarSelects() {
  cerrarListaCursos(); cerrarListaOcupacion(); cerrarListaAsesor(); actualizarGrupoOtro();

  cursoInput.addEventListener("focus", abrirListaCursos);
  cursoInput.addEventListener("input", () => { abrirListaCursos(); actualizarGrupoOtro(); });
  cursoInput.addEventListener("keydown", e => {
    if (e.key === "Escape") { cerrarListaCursos(); return; }
    if (e.key === "Enter" && cursoOpen) {
      e.preventDefault();
      const p = cursoOptions.querySelector(".custom-select-option[data-value]");
      if (p) seleccionarCurso(p.dataset.value);
    }
  });
  cursoToggle.addEventListener("click", e => {
    e.preventDefault(); cursoOpen ? cerrarListaCursos() : abrirListaCursos();
  });
  cursoOptions.addEventListener("click", e => {
    const o = e.target.closest(".custom-select-option[data-value]");
    if (o) seleccionarCurso(o.dataset.value);
  });

  ocupacionInput.addEventListener("focus", abrirListaOcupacion);
  ocupacionInput.addEventListener("input", abrirListaOcupacion);
  ocupacionInput.addEventListener("keydown", e => {
    if (e.key === "Escape") { cerrarListaOcupacion(); return; }
    if (e.key === "Enter" && ocupacionOpen) {
      e.preventDefault();
      const p = ocupacionOptions.querySelector(".custom-select-option[data-value]");
      if (p) seleccionarOcupacion(p.dataset.value);
    }
  });
  ocupacionToggle.addEventListener("click", e => {
    e.preventDefault(); ocupacionOpen ? cerrarListaOcupacion() : abrirListaOcupacion();
  });
  ocupacionOptions.addEventListener("click", e => {
    const o = e.target.closest(".custom-select-option[data-value]");
    if (o) seleccionarOcupacion(o.dataset.value);
  });

  asesorInput.addEventListener("focus", abrirListaAsesor);
  asesorInput.addEventListener("input", abrirListaAsesor);
  asesorInput.addEventListener("keydown", e => {
    if (e.key === "Escape") { cerrarListaAsesor(); return; }
    if (e.key === "Enter" && asesorOpen) {
      e.preventDefault();
      const p = asesorOptions.querySelector(".custom-select-option[data-value]");
      if (p) seleccionarAsesor(p.dataset.value);
    }
  });
  asesorToggle.addEventListener("click", e => {
    e.preventDefault(); asesorOpen ? cerrarListaAsesor() : abrirListaAsesor();
  });
  asesorOptions.addEventListener("click", e => {
    const o = e.target.closest(".custom-select-option[data-value]");
    if (o) seleccionarAsesor(o.dataset.value);
  });

  document.addEventListener("click", e => {
    if (!e.target.closest(".custom-select")) cerrarTodosLosSelects();
  });
}

/* ════════════════════════
   MENÚ HEADER
════════════════════════ */
function closeMenu() {
  if (!menuDropdown || !menuToggle) return;
  menuDropdown.classList.add("hidden");
  menuToggle.setAttribute("aria-expanded", "false");
}

if (menuToggle && menuDropdown) {
  menuToggle.addEventListener("click", e => {
    e.stopPropagation();
    const isOpen = !menuDropdown.classList.contains("hidden");
    menuDropdown.classList.toggle("hidden");
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
  });

  menuDropdown.addEventListener("click", e => {
    const action = e.target.dataset.action;
    if (!action) return;
    if (action === "new")    $("btn-nuevo").click();
    if (action === "steps")  document.querySelector(".steps-bar").scrollIntoView({ behavior: "smooth" });
    if (action === "logout") cerrarSesion();
    closeMenu();
  });

  document.addEventListener("click", e => {
    if (!e.target.closest(".header-actions")) closeMenu();
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
  stepLines.forEach((line, i) => line.classList.toggle("done", i + 1 < n));
}

/* ── Fecha por defecto = hoy ── */
(function setDefaultFecha() {
  const el = $("cita-fecha");
  if (!el) return;
  const h = new Date();
  el.value = `${h.getFullYear()}-${String(h.getMonth()+1).padStart(2,"0")}-${String(h.getDate()).padStart(2,"0")}`;
})();

/* ════════════════════════
   VALIDACIÓN
════════════════════════ */
const CAMPOS_REQ = ["nombre","telefono","edad","curso","ocupacion","horario","asesor"];

function clearErrors() {
  CAMPOS_REQ.forEach(id => {
    const e = $(`err-${id}`); const i = $(id);
    if (e) e.textContent = ""; if (i) i.classList.remove("error");
  });
}

function showError(campo, msg) {
  const e = $(`err-${campo}`); const i = $(campo);
  if (e) e.textContent = msg; if (i) i.classList.add("error");
}

function validarFormulario() {
  clearErrors(); let ok = true;
  const nombre = $("nombre").value.trim();
  if (!nombre || nombre.length < 3) { showError("nombre", "Ingresá el nombre completo."); ok = false; }
  const tel = $("telefono").value.replace(/\D/g,"");
  if (!tel || tel.length < 8 || tel.length > 13) { showError("telefono", "Número inválido."); ok = false; }
  const edad = parseInt($("edad").value, 10);
  if (!edad || edad < 14 || edad > 99) { showError("edad", "Ingresá una edad válida."); ok = false; }
  const cursoVal = $("curso").value.trim();
  if (!cursoVal) { showError("curso", "Seleccioná un curso."); ok = false; }
  else if (cursoVal !== "Otro" && !isValidOption(cursoVal, CURSOS_INTERES)) { showError("curso", "Seleccioná un curso válido."); ok = false; }
  if (cursoVal === "Otro" && !$("otro-curso").value.trim()) { showError("otro-curso", "Ingresá el curso."); ok = false; }
  const ocVal = $("ocupacion").value.trim();
  if (!ocVal) { showError("ocupacion", "La ocupación es requerida."); ok = false; }
  else if (!isValidOption(ocVal, OCUPACIONES)) { showError("ocupacion", "Seleccioná una ocupación válida."); ok = false; }
  if (!$("horario").value.trim()) { showError("horario", "El horario es requerido."); ok = false; }
  const asesorVal = $("asesor").value.trim();
  if (!asesorVal) { showError("asesor", "El asesor es requerido."); ok = false; }
  else if (!isValidOption(asesorVal, ASESOR_OPTIONS)) { showError("asesor", "Seleccioná un asesor válido."); ok = false; }
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

inicializarSelects();

/* ════════════════════════
   PASO 2 → 3
════════════════════════ */
$("btn-guardar").addEventListener("click", async () => {
  const btn = $("btn-guardar"), texto = $("btn-guardar-text"), spin = $("spinner");
  btn.disabled = true; texto.textContent = "Guardando..."; spin.classList.remove("hidden");

  try {
    await enviarASheets(datosEntrevista);
    $("success-nombre").textContent = datosEntrevista.nombre;
    $("chip-tel").textContent = "+54 " + datosEntrevista.telefono;
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
    btn.disabled = false; texto.textContent = "Guardar y contactar"; spin.classList.add("hidden");
  }
});

/* ════════════════════════
   PREVIEW EN TIEMPO REAL
════════════════════════ */
["cita-fecha","cita-horario"].forEach(id => {
  const el = $(id); if (!el) return;
  el.addEventListener("change", actualizarPreview);
  el.addEventListener("input",  actualizarPreview);
});

function actualizarPreview() {
  const fechaVal   = $("cita-fecha")   ? $("cita-fecha").value   : "";
  const horarioRaw = $("cita-horario") ? $("cita-horario").value : "";
  const asistente  = datosEntrevista.asesor || "";

  if (!fechaVal || !horarioRaw || !asistente) {
    $("wsp-preview").textContent = "Completá todos los campos para ver el mensaje...";
    return;
  }

  const [anioStr, mesStr, diaStr] = fechaVal.split("-");
  const dia     = String(parseInt(diaStr, 10)).padStart(2, "0");
  const mesNum  = parseInt(mesStr, 10);
  const fecha   = new Date(parseInt(anioStr), mesNum - 1, parseInt(diaStr));
  const dias    = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  const diaSem  = dias[fecha.getDay()];
  const [h, m]  = horarioRaw.split(":");
  const mesNum2 = String(mesNum).padStart(2, "0");

  const mensaje = CONFIG.WSP_MENSAJE
    .replace("{diaSemana}", diaSem)
    .replace("{dia}",       dia)
    .replace("{mes}",       mesNum2)
    .replace("{hora}",      `${h}:${m}`)
    .replace("{asistente}", asistente);

  $("wsp-preview").textContent = mensaje;
}

/* ════════════════════════
   WHATSAPP
════════════════════════ */
$("btn-wsp").addEventListener("click", () => {
  let ok = true;
  [["cita-fecha","err-cita-fecha","Seleccioná la fecha"],
   ["cita-horario","err-cita-horario","Ingresá el horario"]
  ].forEach(([id, errId, msg]) => {
    const el = $(id), err = $(errId), val = el ? el.value.trim() : "";
    if (!val) { if (err) err.textContent = msg; if (el) el.classList.add("error"); ok = false; }
    else      { if (err) err.textContent = ""; if (el) el.classList.remove("error"); }
  });
  if (!ok) { showToast("Completá todos los campos de la cita.", "error"); return; }

  const mensaje = $("wsp-preview").textContent;
  const tel     = "54" + datosEntrevista.telefono;
  const url     = `whatsapp://send?phone=${tel}&text=${encodeURIComponent(mensaje)}`;
  window.location.href = url;
});

/* ── Nueva entrevista ── */
$("btn-nuevo").addEventListener("click", () => {
  ["nombre","telefono","edad","ocupacion","horario","promocion","asesor","otro-curso",
   "cita-fecha","cita-horario"].forEach(id => { const el=$(id); if(el) el.value=""; });
  cursoInput.value = "";
  actualizarGrupoOtro(); cerrarListaCursos();
  $("wsp-preview").textContent = "Completá los campos para ver el mensaje...";
  clearErrors();
  datosEntrevista = {};

  // Restaurar asesor al usuario logueado
  if (usuarioActivo && ASESOR_OPTIONS.includes(usuarioActivo.nombre)) {
    asesorInput.value = usuarioActivo.nombre;
  }

  // Resetear fecha a hoy
  const h = new Date();
  if ($("cita-fecha")) $("cita-fecha").value =
    `${h.getFullYear()}-${String(h.getMonth()+1).padStart(2,"0")}-${String(h.getDate()).padStart(2,"0")}`;

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
    await new Promise(r => setTimeout(r, 900)); return { demo: true };
  }
  const params = new URLSearchParams();
  Object.entries(datos).forEach(([k,v]) => params.append(k,v));
  await fetch(CONFIG.GOOGLE_SCRIPT_URL, { method:"POST", mode:"no-cors", body: params });
  return { ok: true };
}

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

/* ── Arrancar login al cargar ── */
iniciarLogin();