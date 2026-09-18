/* ============================================================
   Cauchos VIP — navegación y buscadores del home
   ------------------------------------------------------------
   Lo que queda aquí es lo que no pertenece a ninguna vista
   concreta: el ruteo entre páginas, el buscador del hero
   (por medida y por vehículo) y los avisos del calendario.

   El catálogo, la ficha y el carrito viven en js/ui/ y hablan
   solo con los servicios.
   ============================================================ */

/* ===================== helpers ===================== */
const $ = id => document.getElementById(id);
const money = v => VIP.ui.dinero(v);
const bs = v => VIP.ui.bolivares(v);
function mclose(){ document.querySelector('.mmenu').classList.remove('open'); }

/* ===================== ruteo ===================== */
function go(p){
  ['home','cat','prod','como','red'].forEach(k => $('p-'+k).classList.add('hide'));
  $('p-'+p).classList.remove('hide');
  document.querySelectorAll('nav.desk a').forEach(a => a.classList.toggle('on', a.dataset.nav === p));
  $('fabTxt').textContent = p === 'cat'  ? 'Te ayudo a filtrar'
                          : p === 'prod' ? '¿Dudas con este caucho?'
                          :                '¿Te ayudo a conseguir tus cauchos?';
  window.scrollTo({ top: 0 });
}

/* Compatibilidad: goCat() era el nombre viejo de abrirCatalogo(). */
function goCat(f){
  const c = f || {};
  abrirCatalogo({ medida: c.size || c.medida, categoria: c.tipo || c.categoria,
                  marca: c.marca, uso: c.uso, texto: c.texto });
}

/* ===================== buscador por medida ===================== */
const ANCHOS   = [165,175,185,195,205,215,225,235,245,255,265,275];
const PERFILES = [45,50,55,60,65,70,75,80];
const RINES    = [13,14,15,16,17,18,20];

function normSize(v){ return VIP.Producto.normalizarMedida(v); }

function searchSize(){
  let s = normSize($('freeSize').value);
  if(!s && $('sAncho').value && $('sPerfil').value && $('sRin').value)
    s = `${$('sAncho').value}/${$('sPerfil').value}R${$('sRin').value}`;
  if(!s){ alert('Elige ancho, perfil y rin — o escribe tu medida (ej: 195/60R15).'); return; }
  abrirCatalogo({ medida: s });
}

/* ===================== buscador por vehículo ===================== */
function fillSelects(){
  const mk = (el, arr, ph) => { el.innerHTML = `<option value="">${ph}</option>` + arr.map(v => `<option>${v}</option>`).join(''); };
  mk($('sAncho'), ANCHOS, 'Ancho'); mk($('sPerfil'), PERFILES, 'Perfil'); mk($('sRin'), RINES, 'Rin');
  ['vMarca','fitMarca'].forEach(id => {
    $(id).innerHTML = '<option value="">Marca</option>' +
      Object.keys(VEH).map(v => `<option>${v}</option>`).join('');
  });
  fillModelo(); fillModelo('fit');
}
function fillModelo(pfx){
  const p = pfx === 'fit' ? 'fit' : 'v';
  const m = $(p+'Marca').value, el = $(p+'Modelo');
  el.innerHTML = '<option value="">Modelo</option>' +
    (m ? Object.keys(VEH[m]).map(x => `<option>${x}</option>`).join('') : '');
  fillAno(pfx);
}
function fillAno(pfx){
  const p = pfx === 'fit' ? 'fit' : 'v';
  const m = $(p+'Marca').value, mo = $(p+'Modelo').value;
  $(p+'Ano').innerHTML = '<option value="">Año</option>' +
    ((m && mo) ? annosDe(m, mo).map(x => `<option>${x}</option>`).join('') : '');
}
function setTab(t){
  $('tabA').classList.toggle('on', t === 'a'); $('tabB').classList.toggle('on', t === 'b');
  $('boxA').classList.toggle('hide', t !== 'a'); $('boxB').classList.toggle('hide', t !== 'b');
}

let mvVeh = null, mvMedida = '';

/**
 * El cliente eligió marca, modelo y año. Tres desenlaces:
 *   1. Sabemos la medida y hay productos    → al catálogo filtrado
 *   2. Sabemos la medida y no hay productos → al catálogo, que muestra el vacío útil
 *   3. No tenemos la medida de ese modelo   → a Andrea, sin inventar nada
 */
async function searchVeh(){
  const m = $('vMarca').value, mo = $('vModelo').value, a = $('vAno').value;
  if(!m || !mo || !a){ alert('Elige marca, modelo y año de tu vehículo.'); return; }
  mvVeh = { m, mo, a };
  mvMedida = medidaDe(m, mo, a);
  const btn = $('mvBtn');

  if(mvMedida){
    const encontrados = await VIP.catalogo.porMedida(mvMedida);
    $('mvT').textContent = 'Ya sabemos tu medida';
    $('mvP').textContent = `Tu ${m} ${mo} ${a} usa esta medida de fábrica:`;
    $('mvR').classList.remove('hide');
    $('mvSize').textContent = mvMedida;
    $('mvNote').textContent = encontrados.length
      ? `Tenemos ${encontrados.length} ${encontrados.length === 1 ? 'opción' : 'opciones'} en esa medida. ` +
        'Si tu carro ya trae otra medida montada, escríbenos y verificamos las equivalencias.'
      : 'Ahorita no tenemos esa medida publicada, pero te la conseguimos. Escríbenos y te decimos en cuánto.';
    btn.textContent = encontrados.length ? 'Ver mis opciones' : 'Consultar disponibilidad';
    btn.onclick = encontrados.length ? mvGo : mvAndrea;
  } else {
    $('mvT').textContent = 'Tenemos tu vehículo, nos falta la medida';
    $('mvP').textContent = `Identificamos tu ${m} ${mo} ${a}, pero todavía no tenemos publicada la medida de fábrica de este modelo.`;
    $('mvR').classList.add('hide');
    btn.textContent = 'Que Andrea me diga mi medida';
    btn.onclick = mvAndrea;
  }
  $('mov').classList.add('open');
}
function mvGo(){
  $('mov').classList.remove('open');
  abrirCatalogo({ medida: mvMedida, etiqueta: `${mvVeh.m} ${mvVeh.mo} ${mvVeh.a}` });
}
function mvAndrea(){
  $('mov').classList.remove('open');
  andrea('medida');
  if(mvVeh && typeof anVeh === 'function') anVeh(mvVeh);
}

/* ===================== calendario operativo ===================== */
function pintarAvisos(){
  const av = avisoDelDia();
  $('avisoDia').innerHTML = av
    ? `<div class="aviso ${av.clase}"><div class="wrap"><b>${av.titulo}</b><p>${av.texto}</p></div></div>` : '';
  $('avisoFicha').innerHTML = av
    ? `<div class="aviso mini ${av.clase}"><b>${av.titulo}</b><p>${av.texto}</p></div>` : '';

  const v = viasHoy();
  [['via-cauchera','cauchera'],['via-delivery','delivery'],['via-pickup','pickup']].forEach(([id,k]) => {
    const el = $(id); if(!el) return;
    el.classList.toggle('via-off', !v[k]);
    let tag = el.querySelector('.via-tag');
    if(!v[k]){
      if(!tag){ tag = document.createElement('span'); tag.className = 'via-tag';
                el.querySelector('span:last-child').appendChild(tag); }
      tag.textContent = v.tipo === 'domingo' ? 'Se programa para el próximo día hábil'
                                             : 'Los sábados no despachamos: se programa para el lunes';
    } else if(tag){ tag.remove(); }
  });
}
