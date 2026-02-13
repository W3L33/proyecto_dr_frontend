
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

// ===== ELEMENTOS DEL DOM =====
const loginForm = document.getElementById('loginForm');
const uploadForm = document.getElementById('uploadForm');
const buscarForm = document.getElementById('buscarForm');
const resultadosDiv = document.getElementById('resultados');
const adminPanel = document.getElementById('adminPanel');
const adminTitle = document.getElementById('adminTitle');

let token = localStorage.getItem('token') || '';


// ===== FUNCIONES MODALES =====
function abrirModal(modal){
  modal.style.display = 'flex';   // siempre activamos display
  requestAnimationFrame(() => {   // forzar repaint
    modal.classList.add('show');  // agrega clase para fade-in
  });
}

function cerrarModal(modal){
  modal.classList.remove('show'); // fade-out
  modal.addEventListener('transitionend', function handler() {
    if(!modal.classList.contains('show')){
      modal.style.display = 'none'; // ocultamos al terminar transición
    }
    modal.removeEventListener('transitionend', handler);
  });
}

// Cierres específicos (solo para código más legible)
function cerrarBuscarModal(){ cerrarModal(buscarModal); }
function cerrarResultados(){ 
  cerrarModal(resultadosModal);
  resultadosDiv.innerHTML = ''; 
  document.getElementById('dato2').value = ''; 
}
function cerrarLoginModal(){ cerrarModal(loginModal); }
function cerrarSubirModal(){
  // Esperamos a que termine el fade-out para limpiar inputs y colores
  subirModal.classList.remove('show');
  subirModal.addEventListener('transitionend', function handler() {
    if(!subirModal.classList.contains('show')){
      subirModal.style.display = 'none';
      // Limpiar inputs y restaurar color
      pdfInput.value = '';
      xmlInput.value = '';
      actualizarColor(pdfInput, pdfContainer);
      actualizarColor(xmlInput, xmlContainer);
    }
    subirModal.removeEventListener('transitionend', handler);
  });
}

function cerrarFacturasModal(){
  cerrarModal(facturasModal);
  listaFacturasModal.innerHTML = '';
}
function cerrarCrearUsuarioModal(){ cerrarModal(crearUsuarioModal); }
function cerrarUsuariosModal(){
  cerrarModal(usuariosModal);
  listaUsuariosModal.innerHTML = '';
}

// ===== EVENTOS DE MODALES =====
btnLogin.addEventListener('click', () => abrirModal(loginModal));
btnBuscar.addEventListener('click', () => {
  document.getElementById('dato2').value = ''; // Limpiar input
  abrirModal(buscarModal);
});

btnSubir.addEventListener('click', () => abrirModal(subirModal));
btnCrearUsuario.addEventListener('click', () => abrirModal(crearUsuarioModal));

btnCrearUsuarioModal.addEventListener('click', crearUsuarioModalFuncion);

if(btnUsuarios){
  btnUsuarios.addEventListener('click', () => {
    listaUsuariosModal.innerHTML = '';
    cargarUsuariosModal();
    abrirModal(usuariosModal);
  });
}


// ===== FUNCIONES DE UI =====
function aplicarPermisos() {
  if(!token){ 
    // No hay sesión
    btnLogin.style.display = 'inline';
    userInfo.style.display = 'none';
    btnSubir.style.display = 'none';
    adminPanel.style.display = 'none';
    adminTitle.style.display = 'none';
    btnCrearUsuario.style.display = 'none';
    btnUsuarios.style.display = 'none';
    if(btnCargarFacturas) btnCargarFacturas.style.display = 'none';
    return;
  }

  // Hay sesión
  if(btnCargarFacturas) btnCargarFacturas.style.display = 'inline-block';
  const payload = JSON.parse(atob(token.split('.')[1]));
  nombreUsuario.textContent = payload.username;
  btnLogin.style.display = 'none';
  userInfo.style.display = 'inline';

  if(payload.rol === 'admin' || payload.rol === 'editor'){
    btnSubir.style.display = 'inline';
  }

  if(payload.rol === 'admin'){
    adminPanel.style.display = 'block';
    adminTitle.style.display = 'block';
    btnCrearUsuario.style.display = 'inline-block';
    btnUsuarios.style.display = 'inline-block';
    cargarUsuarios();
  } else {
    btnCrearUsuario.style.display = 'none';
    btnUsuarios.style.display = 'none';
  }
}

// ===== RESTAURAR SESIÓN =====
document.addEventListener('DOMContentLoaded', () => {
  aplicarPermisos();
  if(btnCargarFacturas) btnCargarFacturas.addEventListener('click', cargarTodasFacturas);
});

// ===== LOGIN =====
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  const res = await fetch('https://proyecto-dr-backend.onrender.com/login',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({username,password})
  });

  const data = await res.json();
  if(data.token){
    token = data.token;
    localStorage.setItem('token', token);
    cerrarLoginModal();
    aplicarPermisos();
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
  } else alert('Credenciales incorrectas');
});

// ===== LOGOUT =====
function logout(){
  localStorage.removeItem('token');
  token='';
  btnLogin.style.display='inline';
  userInfo.style.display='none';
  btnSubir.style.display='none';
  adminPanel.style.display='none';
  adminTitle.style.display='none';
  btnCrearUsuario.style.display='none';
  btnUsuarios.style.display='none';
  alert('Sesión finalizada');
  aplicarPermisos();
}

// ===== SUBIR ARCHIVOS =====
uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if(!token) return alert('Debes iniciar sesión');

  const pdf = document.getElementById('pdf').files[0];
  const xml = document.getElementById('xml').files[0];

  if(!pdf || pdf.type!=='application/pdf') return alert('Selecciona un PDF válido');
  if(!xml || !xml.name.endsWith('.xml')) return alert('Selecciona un XML válido');

  const formData = new FormData();
  formData.append('pdf', pdf);
  formData.append('xml', xml);

  const res = await fetch('https://proyecto-dr-backend.onrender.com/subir',{
    method:'POST',
    headers:{'Authorization':`Bearer ${token}`},
    body:formData
  });

  const data = await res.json();
  alert(data.ok ? 'Archivos agregados correctamente...' : 'Error al subir');

  document.getElementById('pdf').value = '';
  document.getElementById('xml').value = '';
  cerrarSubirModal();
});

// ===== BÚSQUEDA =====
// ===== VARIABLES GLOBALES =====
let pdfSeleccionado = '';
let xmlSeleccionado = '';

// ===== BÚSQUEDA =====
buscarForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const dato2 = document.getElementById('dato2').value.trim();
  if (!dato2) return;

  resultadosDiv.innerHTML = 'Buscando...';
  resultadosDiv.classList.add('lista-facturas');

  try {
    const res = await fetch(`https://proyecto-dr-backend.onrender.com/buscar/${dato2}`);
    const data = await res.json();

    resultadosDiv.innerHTML = '';

    if (data.length === 0) {
      resultadosDiv.innerHTML = '<p>No se encontraron CFDI.</p>';
    } else {
      // Generamos los resultados con data-attributes
      resultadosDiv.innerHTML = data.map(d => `
        <div class="fila-factura">
          <span>RFC: ${d.dato2}</span>
          <span>${d.created_at}</span>
          <div class="acciones">
            <a href="${d.url_pdf}" target="_blank">PDF</a>
            <a href="${d.url_xml}" target="_blank">XML</a>
            <button class="enviar-btn" data-pdf="${d.url_pdf}" data-xml="${d.url_xml}">Enviar</button>
          </div>
        </div>
      `).join('');
    }
abrirModal(resultadosModal);  // abre modal de resultados con fade
setTimeout(() => cerrarBuscarModal(), 100); // cierra el modal de búsqueda después de 100ms


  } catch (err) {
    console.error(err);
    alert('Error al buscar facturas');
  }
});

// ===== DELEGACIÓN DE EVENTOS PARA BOTONES ENVIAR =====
resultadosDiv.addEventListener('click', (e) => {
  const btn = e.target.closest('.enviar-btn');
  if (!btn) return;

  // Capturamos los datos del botón
  pdfSeleccionado = btn.dataset.pdf;
  xmlSeleccionado = btn.dataset.xml;

  console.log('PDF seleccionado:', pdfSeleccionado, 'XML seleccionado:', xmlSeleccionado);

  const correo = prompt("Email al que se enviará la factura:");
  if (!correo) return;

  enviarCorreoBackend(correo);
});

// ===== ENVÍO DE CORREO =====
async function enviarCorreoBackend(correoDestino){
  // Verificación estricta antes de enviar
  if(!pdfSeleccionado || !xmlSeleccionado || !correoDestino){
    return alert('Faltan datos para enviar el correo');
  }

  console.log('Enviando correo con:', { pdf: pdfSeleccionado, xml: xmlSeleccionado, correo: correoDestino });

  try {
    const res = await fetch('https://proyecto-dr-backend.onrender.com/enviar-correo', {
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

    // Limpiar selección
    pdfSeleccionado = '';
    xmlSeleccionado = '';

  } catch(e) {
    console.error(e);
    alert('Error al enviar correo');
  }
}



// ===== FUNCIONES ADMIN =====
async function cargarUsuarios(){
  const res = await fetch('https://proyecto-dr-backend.onrender.com/usuarios', {
    headers: {'Authorization': `Bearer ${token}`}
  });
  const data = await res.json();

  const listaUsuariosElem = document.getElementById('listaUsuarios');
  if(listaUsuariosElem){
    listaUsuariosElem.innerHTML = data.map(u => `
      <div style="border:1px solid #ccc; margin:5px; padding:5px;">
        <strong>${u.username}</strong> - ${u.rol}
        <select onchange="cambiarRol('${u.id}', this.value)">
          <option value="user" ${u.rol==='user'?'selected':''}>user</option>
          <option value="editor" ${u.rol==='editor'?'selected':''}>editor</option>
          <option value="admin" ${u.rol==='admin'?'selected':''}>admin</option>
        </select>
        <button onclick="eliminarUsuario('${u.id}')">Eliminar</button>
      </div>
    `).join('');
  }
}


// ===== FUNCIONES USUARIOS MODAL =====
async function cargarUsuariosModal(){
  const res = await fetch('https://proyecto-dr-backend.onrender.com/usuarios',{headers:{'Authorization':`Bearer ${token}`}});
  const data = await res.json();
  listaUsuariosModal.innerHTML = data.map(u=>`
    <div style="border:1px solid #ccc; margin:5px; padding:5px;">
      <strong>${u.username}</strong> - ${u.rol}

      <button onclick="eliminarUsuario('${u.id}', cargarUsuariosModal)">Eliminar</button>
    </div>
  `).join('');
}

// ===== CREAR USUARIO (MODAL) =====
async function crearUsuarioModalFuncion(){
  const username = document.getElementById('newUser').value.trim();
  const password = document.getElementById('newPass').value.trim();
  const rol = document.getElementById('newRol').value;

  if(!username || !password) return alert('Completa todos los campos');

  const res = await fetch('https://proyecto-dr-backend.onrender.com/usuarios', {
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ username, password, rol })
  });

  const data = await res.json();

  if(data.ok){
    alert('Usuario creado correctamente');
    document.getElementById('newUser').value='';
    document.getElementById('newPass').value='';
    document.getElementById('newRol').value='user';
    cargarUsuarios();
    cargarUsuariosModal();
    cerrarCrearUsuarioModal();
  } else {
    alert(data.error || 'Error al crear usuario');
  }
}

// ===== ELIMINAR USUARIO =====
async function eliminarUsuario(id, callback){
  if(!confirm('¿Seguro que deseas eliminar este usuario?')) return;

  try {
    const res = await fetch(`https://proyecto-dr-backend.onrender.com/usuarios/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();
    if(data.ok){
      alert('Usuario eliminado correctamente');
      if(callback && typeof callback === 'function') callback();
      else cargarUsuarios();
    } else {
      alert(data.error || 'Error al eliminar usuario');
    }
  } catch(err){
    console.error(err);
    alert('Error al eliminar usuario');
  }
}


// ===== FUNCIONES FACTURAS =====
// ===== FUNCIONES FACTURAS =====
async function cargarTodasFacturas(){
  if(!token) return alert('Debes iniciar sesión');

  try {
    const res = await fetch('https://proyecto-dr-backend.onrender.com/facturas', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    listaFacturasModal.classList.add('lista-facturas'); // aplica scroll y gap

    if(!data.length){
      listaFacturasModal.innerHTML = '<p>No hay facturas disponibles.</p>';
    } else {
      listaFacturasModal.innerHTML = data.map(f => `
        <div class="fila-factura">
          <span>RFC: ${f.dato2}</span>
          <span>${f.created_at}</span>
          <div class="acciones">
            <a href="${f.url_pdf}" target="_blank" class="pdf">PDF</a>
            <a href="${f.url_xml}" target="_blank" class="xml">XML</a>
            <button class="eliminar" onclick="eliminarFactura('${f.id}', cargarTodasFacturas)">Eliminar</button>
          </div>
        </div>
      `).join('');
    }

    // Abrimos modal con efecto fade
    abrirModal(facturasModal);

  } catch(err){
    console.error(err);
    alert('Error al cargar facturas');
  }
}



async function eliminarFactura(id, callback){
  if(!confirm('¿Seguro que deseas eliminar esta factura?')) return;

  try {
    const res = await fetch(`https://proyecto-dr-backend.onrender.com/facturas/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();
    if(data.ok){
      alert('Factura eliminada');
      if(callback && typeof callback === 'function') callback();
      else cargarFacturas();
    } else {
      alert('Error al eliminar factura');
    }
  } catch(err){
    console.error(err);
    alert('Error al eliminar factura');
  }
}

// ===== EXPOSE AL HTML =====
window.cargarFacturas = cargarFacturas;
window.cargarTodasFacturas = cargarTodasFacturas;
window.eliminarFactura = eliminarFactura;
window.eliminarUsuario = eliminarUsuario;
window.crearUsuario = crearUsuarioModalFuncion;

function cargarFacturas() {
  return cargarTodasFacturas();
}

window.cargarFacturas = cargarFacturas;


function abrirEnviarCorreo(pdf, xml){
  pdfSeleccionado = pdf;
  xmlSeleccionado = xml;

  const correo = prompt("Correo destino:");
  if(!correo) return;

  enviarCorreoBackend(correo);
}

async function enviarCorreoBackend(correoDestino){
  try{
    const res = await fetch('https://proyecto-dr-backend.onrender.com/enviar-correo',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        pdfUrl: pdfSeleccionado,
        xmlUrl: xmlSeleccionado,
        correoDestino
      })
    });

    const data = await res.json();
    alert(data.mensaje || 'Correo enviado');
  }catch(e){
    console.error(e);
    alert('Error al enviar correo');
  }

}
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape'){
    [loginModal, buscarModal, resultadosModal, subirModal, facturasModal, crearUsuarioModal, usuariosModal]
      .forEach(modal => modal.classList.contains('show') && cerrarModal(modal));
  }
});

// Cerrar al dar clic fuera del contenido
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if(e.target === modal){ // clic en fondo
      cerrarModal(modal);
    }
  });
});



// ===== SUBIR ARCHIVOS (modificado) =====
const pdfContainer = document.getElementById('pdf-container');
const xmlContainer = document.getElementById('xml-container');
const pdfInput = document.getElementById('pdf');
const xmlInput = document.getElementById('xml');

// Cambiar color al seleccionar archivo
function actualizarColor(input, container){
  if(input.files.length > 0){
    container.classList.add('selected');
  } else {
    container.classList.remove('selected');
  }
}

// Listeners
pdfInput.addEventListener('change', () => actualizarColor(pdfInput, pdfContainer));
xmlInput.addEventListener('change', () => actualizarColor(xmlInput, xmlContainer));



// Al cerrar modal, limpiar inputs y color
function cerrarSubirModal(){
  cerrarModal(subirModal); // tu función fade
  pdfInput.value = '';
  xmlInput.value = '';
  actualizarColor(pdfInput, pdfContainer);
  actualizarColor(xmlInput, xmlContainer);
}

document.addEventListener('mousemove', (e) => {
  const moveX = (e.clientX * -0.05) / 8;
  const moveY = (e.clientY * -0.05) / 8;
  
  document.querySelector('.hex-container').style.transform = 
    `translate(${moveX}px, ${moveY}px)`;
  
  document.querySelector('.cross').style.transform = 
    `translate(${-moveX}px, ${-moveY}px)`;
});

