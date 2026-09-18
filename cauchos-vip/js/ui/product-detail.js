/* ============================================================
   Cauchos VIP — ficha de producto
   ------------------------------------------------------------
   La ficha se arma entera desde el objeto de producto. No hay
   texto ni imagen escritos en el HTML de la página: el HTML solo
   aporta los contenedores vacíos.

   Cambiar un campo del producto cambia la ficha. Agregar un
   producto nuevo no requiere tocar ni una línea de HTML.
   ============================================================ */
(function (VIP) {
  'use strict';

  const $ = id => document.getElementById(id);
  const esc = s => VIP.ui.esc(s);

  let actual = null;     // producto abierto
  let cantidad = 2;

  function acordeon(titulo, contenido) {
    return `<div class="qa"><button onclick="this.parentNode.classList.toggle('open')">${esc(titulo)}</button>
            <div class="ans">${contenido}</div></div>`;
  }

  function bloqueCompatibles(p) {
    if (!p.vehiculosCompatibles.length) {
      return `Todavía no tenemos publicada la lista de vehículos para esta medida.
              <a href="#" onclick="andrea('medida');return false">Pregúntale a Andrea</a> y te confirma si le sirve al tuyo.`;
    }
    return '<ul class="compat">' + p.vehiculosCompatibles.map(v =>
      `<li><b>${esc(v.marca)} ${esc(v.modelo)}</b> <span>${v.anioDesde}–${v.anioHasta}</span></li>`).join('') + '</ul>';
  }

  function bloqueFicha(p) {
    const filas = [
      ['SKU', p.sku],
      ['Medida', p.medida],
      ['Índice de carga y velocidad', p.indiceCarga],
      ['Tipo de vehículo', p.categoria],
      ['Gama', p.gama],
      ['Uso recomendado', p.usos.join(', ')],
      ['Unidades en inventario', p.stock],
      ['Actualizado', p.actualizadoEn ? p.actualizadoEn.slice(0, 10) : '—']
    ].filter(f => f[1] !== '' && f[1] != null);
    return '<table class="fichat">' + filas.map(f =>
      `<tr><th>${esc(f[0])}</th><td>${esc(f[1])}</td></tr>`).join('') + '</table>';
  }

  /** Abre la ficha de un SKU. Es la única puerta de entrada. */
  async function abrir(sku) {
    const p = await VIP.catalogo.obtener(sku);
    if (!p) {
      console.warn('[ficha] SKU no encontrado:', sku);
      if (typeof abrirCatalogo === 'function') abrirCatalogo({ etiqueta: 'Cauchos' });
      return null;
    }
    actual = p;
    cantidad = p.comprable ? Math.min(2, Math.max(1, p.stock)) : 0;

    $('crumbProd').textContent = p.titulo;
    $('dImg').innerHTML = VIP.ui.imagen(p, 'pmain-foto') +
      (p.etiqueta ? `<span class="badge">${esc(p.etiqueta)}</span>` : '');
    $('dBrand').textContent = p.marca;
    $('dName').textContent = p.nombre;
    $('dSku').textContent = 'SKU ' + p.sku;
    $('dMeta').textContent = [p.medida, p.indiceCarga, p.categoria, p.gama && 'Gama ' + p.gama]
      .filter(Boolean).join('  ·  ');

    const vh = (typeof viasHoy === 'function') ? viasHoy() : { tipo: 'habil' };
    const cuando = p.estadoStock === 'agotado' ? ''
      : vh.tipo === 'habil' ? ' · Instalación hoy o mañana'
      : vh.tipo === 'sabado' ? ' · Instalación hoy hasta la 1:00 pm'
      : ' · Instalación desde mañana';
    $('dStock').innerHTML = VIP.ui.pildoraStock(p, true) +
      `<span class="stock-extra">${cuando}</span>`;

    $('dPrice').textContent = VIP.ui.dinero(p.precio);
    $('dAntes').innerHTML = p.enPromocion
      ? `<span class="pantes">${VIP.ui.dinero(p.precioAnterior)}</span><span class="pdesc">-${p.descuentoPct}%</span>` : '';
    $('dBs').textContent = 'por caucho' + (p.montajeIncluido ? ' · montaje y balanceo incluidos' : '');
    $('dBcv').textContent = VIP.ui.bolivares(p.precio);
    $('dDesc').textContent = p.descripcion;

    $('dUso').innerHTML = p.usos.map(u => `<span class="chip on">${esc(u)}</span>`).join('');
    $('dPerf').innerHTML = p.desempeno
      ? Object.entries(p.desempeno).map(([k, v]) =>
          `<div class="bar"><span class="nm">${esc(k)}</span><span class="tk"><i style="width:${v}%"></i></span></div>`).join('')
      : '';

    $('dAcc').innerHTML =
      acordeon('Ficha técnica', bloqueFicha(p)) +
      acordeon('¿Le sirve a mi carro?', bloqueCompatibles(p)) +
      acordeon('Garantía e instalación',
        'Garantía de fábrica del producto. La instalación la realiza una Cauchera Aliada VIP, con montaje y balanceo. ' +
        'La política de cargo por instalación debe definirla VENEGE y publicarse de forma única para toda la red.') +
      acordeon('Dónde te lo montan',
        CAU.map(c => `<b>${esc(c.n)}</b><br>${esc(c.dir)}<br>${esc(c.hor)}`).join('<br><br>'));

    /* cantidad y botones */
    $('dQty').innerHTML = [1, 2, 4].map(n =>
      `<button class="qbtn${n === cantidad ? ' on' : ''}" ${p.stock && n > p.stock ? 'disabled' : ''}
        onclick="fijarCantidad(${n})">${n}</button>`).join('');
    $('dAdd').innerHTML = p.comprable
      ? `<button class="btn btn-wa" onclick="agregarAlCarrito('${esc(p.sku)}', cantidadFicha())">
           <svg class="ic"><use href="#i-cart"/></svg> AGREGAR AL CARRITO</button>
         <button class="btn btn-gh" onclick="comprarAhora('${esc(p.sku)}')">Comprar ahora por WhatsApp</button>`
      : `<button class="btn btn-gh" disabled>Agotado por ahora</button>
         <button class="btn btn-ink" onclick="andrea('buscar')">Avísame cuando entre</button>`;

    fijarCantidad(cantidad);
    $('alts').innerHTML = VIP.ui.grid(await VIP.catalogo.relacionados(p.sku, 4));
    $('fitRes').className = 'fitres';
    $('fitRes').textContent = '';
    go('prod');
    return p;
  }

  function fijarCantidad(n) {
    if (!actual) return;
    cantidad = Math.max(1, Math.min(n, actual.stock || 1));
    document.querySelectorAll('#dQty .qbtn').forEach(b =>
      b.classList.toggle('on', b.textContent.trim() === String(cantidad)));
    const total = actual.precio * cantidad;
    $('dTotal').textContent = VIP.ui.dinero(total);
    $('dTotalBs').textContent = VIP.ui.bolivares(total);
    $('sTotal').textContent = VIP.ui.dinero(total) + ' · x' + cantidad;
  }

  /** ¿Le sirve al vehículo que el cliente eligió en la ficha? */
  function verificarCompatibilidad() {
    const m = $('fitMarca').value, mo = $('fitModelo').value, a = $('fitAno').value;
    const el = $('fitRes');
    if (!actual) return;
    if (!m || !mo || !a) { el.className = 'fitres no'; el.textContent = 'Elige marca, modelo y año.'; return; }

    if (VIP.Producto.sirveA(actual, m, mo, a)) {
      el.className = 'fitres ok';
      el.textContent = `Sí. Este caucho está listado como compatible con tu ${m} ${mo} ${a}.`;
      return;
    }
    const medida = (typeof medidaDe === 'function') ? medidaDe(m, mo, a) : null;
    if (!medida) {
      el.className = 'fitres warn';
      el.innerHTML = `Todavía no tenemos publicada la medida de fábrica del ${esc(m)} ${esc(mo)} ${esc(a)}. ` +
                     `<a href="#" onclick="andrea('medida');return false">Pregúntale a Andrea</a> y te la confirma.`;
    } else if (medida === actual.medida) {
      el.className = 'fitres ok';
      el.textContent = `Sí. La medida ${medida} es la original para tu ${m} ${mo} ${a}.`;
    } else {
      el.className = 'fitres no';
      el.innerHTML = `Tu ${esc(m)} ${esc(mo)} ${esc(a)} usa <b>${esc(medida)}</b> de fábrica, no ${esc(actual.medida)}. ` +
                     `<a href="#" onclick="abrirCatalogo({medida:'${esc(medida)}'});return false">Ver los de tu medida</a>.`;
    }
  }

  VIP.ui.ficha = { abrir, fijarCantidad, verificarCompatibilidad, actual: () => actual,
                   cantidad: () => cantidad };

  window.abrirProducto = abrir;
  window.fijarCantidad = fijarCantidad;
  window.cantidadFicha = () => cantidad;
  window.checkFit = verificarCompatibilidad;
})(window.VIP = window.VIP || {});
