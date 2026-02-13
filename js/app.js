// === NOTA ===
// Este archivo es el mismo app.js ORIGINAL
//

// ===== ELEMENTOS SUPERIORES =====
const btnLogin = document.getElementById('btnLogin');
const loginModal = document.getElementById('loginModal');
const userInfo = document.getElementById('userInfo');
const nombreUsuario = document.getElementById('nombreUsuario');
const btnBuscar = document.getElementById('btnBuscar');
const btnSubir = document.getElementById('btnSubir');
const btnCargarFacturas = document.getElementById('btnCargarFacturas');
const btnCrearUsuario = document.getElementById('btnCrearUsuario');
const btnUsuarios = document.getElementById('btnUsuarios');

const buscarModal = document.getElementById('buscarModal');
const resultadosModal = document.getElementById('resultadosModal');
const subirModal = document.getElementById('subirModal');
const facturasModal = document.getElementById('facturasModal');
const crearUsuarioModal = document.getElementById('crearUsuarioModal');
const usuariosModal = document.getElementById('usuariosModal');

const listaFacturasModal = document.getElementById('listaFacturasModal');
const listaUsuariosModal = document.getElementById('listaUsuariosModal');
const btnCrearUsuarioModal = document.getElementById('btnCrearUsuarioModal');

// ===== VARIABLES GLOBALES =====
let token = localStorage.getItem('token') || '';
let pdfSeleccionado = '';
let xmlSeleccionado = '';

// ===== FUNCIONES MODALES =====
function abrirModal(modal){
  modal.style.display = 'flex';
  requestAnimationFrame(() => modal.classList.add('show'));
}

function cerrarModal(modal){
  modal.classList.remove('show');
  modal.addEventListener('transitionend', function handler() {
    if(!modal.classList.contains('show')) modal.style.display = 'none';
    modal.removeEventListener('transitionend', handler);
  });
}

function cerrarBuscarModal(){ cerrarModal(buscarModal); }
function cerrarResultados(){ 
  cerrarModal(resultadosModal);
  document.getElementById('resultados').innerHTML = '';
  document.getElementById('dato2').value = ''; 
}
function cerrarLoginModal(){ cerrarModal(loginModal); }
function cerrarFacturasModal(){
  cerrarModal(facturasModal);
  listaFacturasModal.innerHTML = '';
}
function cerrarCrearUsuarioModal(){ cerrarModal(crearUsuarioModal); }
function cerrarUsuariosModal(){
  cerrarModal(usuariosModal);
  listaUsuariosModal.innerHTML = '';
}

// ===== ENVÍO DE CORREO (ÚNICA FUNCIÓN VÁLIDA) =====
async function enviarCorreoBackend(correoDestino){
  if(!pdfSeleccionado || !xmlSeleccionado || !correoDestino){
    return alert('Faltan datos para enviar el correo');
  }

  try {
    const res = await fetch('https://proyecto-dr-backend.onrender.com/api/enviarCorreo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pdfUrl: pdfSeleccionado,
        xmlUrl: xmlSeleccionado,
        correoDestino
      })
    });

    const data = await res.json();
    alert(data.mensaje || 'Correo enviado correctamente');

    pdfSeleccionado = '';
    xmlSeleccionado = '';

  } catch(e) {
    console.error(e);
    alert('Error al enviar correo');
  }
}

// ===== EXPOSICIONES ÚNICAS AL HTML =====
function cargarFacturas() { return cargarTodasFacturas(); }
window.cargarFacturas = cargarFacturas;
window.cargarTodasFacturas = cargarTodasFacturas;
window.eliminarFactura = eliminarFactura;
window.eliminarUsuario = eliminarUsuario;
window.crearUsuario = crearUsuarioModalFuncion;

// ===== SUBIR ARCHIVOS COLORES (ÚNICO) =====
const pdfContainer = document.getElementById('pdf-container');
const xmlContainer = document.getElementById('xml-container');
const pdfInput = document.getElementById('pdf');
const xmlInput = document.getElementById('xml');

function actualizarColor(input, container){
  if(input.files.length > 0) container.classList.add('selected');
  else container.classList.remove('selected');
}

pdfInput.addEventListener('change', () => actualizarColor(pdfInput, pdfContainer));
xmlInput.addEventListener('change', () => actualizarColor(xmlInput, xmlContainer));

