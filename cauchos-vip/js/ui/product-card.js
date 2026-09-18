/* ============================================================
   Cauchos VIP — tarjeta de producto
   ------------------------------------------------------------
   Una sola función arma la tarjeta en todo el sitio: destacados
   del home, resultados del catálogo, alternativas de la ficha y
   las sugerencias de Andrea.

   Recibe un producto ya normalizado. No sabe de dónde salió.
   ============================================================ */
(function (VIP) {
  'use strict';

  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const dinero = v => '$ ' + Number(v).toLocaleString('es-VE',
    { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  /** Referencia en bolívares a tasa BCV. '' si no hay tasa cargada. */
  function bolivares(v) {
    const c = VIP.cfg && VIP.cfg.bcv;
    if (!c || !c.mostrar || !c.tasa) return '';
    return 'Ref. Bs. ' + (v * c.tasa).toLocaleString('es-VE',
      { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /** <img> del producto, con respaldo si el archivo todavía no existe. */
  function imagen(p, clase) {
    return `<img class="${clase || 'pimg-foto'}" src="${esc(p.imagenUrl)}" alt="${esc(p.imagenAlt)}"
      loading="lazy" onerror="this.onerror=null;this.src='${VIP.Producto.IMAGEN_FALLBACK}'">`;
  }

  /** Píldora de disponibilidad: Disponible / Últimas unidades / Agotado. */
  function pildoraStock(p, conUnidades) {
    const u = (conUnidades && p.estadoStock === 'ultimas') ? ` · quedan ${p.stock}` : '';
    return `<span class="stock"><i class="dot ${p.estadoStockClase}"></i>${esc(p.estadoStockEtiqueta)}${u}</span>`;
  }

  function tarjeta(p) {
    const promo = p.enPromocion
      ? `<span class="pantes">${dinero(p.precioAnterior)}</span><span class="pdesc">-${p.descuentoPct}%</span>` : '';
    const etiqueta = p.etiqueta ? `<span class="badge">${esc(p.etiqueta)}</span>` : '';
    const agotado = !p.comprable;

    return `<article class="pcard${agotado ? ' pcard-off' : ''}" data-sku="${esc(p.sku)}">
      <button class="pcard-go" onclick="abrirProducto('${esc(p.sku)}')" aria-label="Ver ${esc(p.titulo)}">
        <div class="pimg">${imagen(p)}${etiqueta}</div>
        <div class="pbody">
          <div class="pbrand">${esc(p.marca)}</div>
          <div class="pname">${esc(p.nombre)}</div>
          <div class="psize">${esc(p.medida)} ${esc(p.indiceCarga)}</div>
          <div class="psku">SKU ${esc(p.sku)}</div>
          <div class="price">${dinero(p.precio)} ${promo}</div>
          <div class="pbs">por caucho${p.montajeIncluido ? ' · montaje incluido' : ''}</div>
          <div class="refbcv">${esc(bolivares(p.precio))}</div>
          ${pildoraStock(p, true)}
        </div>
      </button>
      <div class="pcta">
        ${agotado
          ? `<button class="btn btn-gh" disabled>Agotado</button>`
          : `<button class="btn btn-wa" onclick="agregarAlCarrito('${esc(p.sku)}',2)">
               <svg class="ic"><use href="#i-cart"/></svg> Agregar</button>`}
      </div>
    </article>`;
  }

  function grid(lista) {
    return lista.map(tarjeta).join('');
  }

  VIP.ui = VIP.ui || {};
  Object.assign(VIP.ui, { tarjeta, grid, imagen, pildoraStock, dinero, bolivares, esc });
})(window.VIP = window.VIP || {});
