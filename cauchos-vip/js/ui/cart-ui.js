/* ============================================================
   Cauchos VIP — interfaz del carrito
   ------------------------------------------------------------
   Panel lateral + contador en el encabezado. Solo pinta: toda la
   lógica está en VIP.carrito, y el carrito solo guarda SKU y
   cantidad.
   ============================================================ */
(function (VIP) {
  'use strict';

  const $ = id => document.getElementById(id);
  const esc = s => VIP.ui.esc(s);

  function abrir()  { $('cartOv').classList.add('open'); pintar(); }
  function cerrar() { $('cartOv').classList.remove('open'); }

  async function agregar(sku, cantidad) {
    const r = await VIP.carrito.agregar(sku, cantidad);
    if (!r.ok) {
      aviso(r.motivo === 'agotado'
        ? 'Ese caucho está agotado ahorita. Escríbele a Andrea y te avisamos cuando entre.'
        : 'No conseguimos ese producto.');
      return r;
    }
    abrir();
    return r;
  }

  function aviso(txt) {
    const el = $('cartAviso');
    if (!el) return;
    el.textContent = txt;
    el.classList.add('on');
    setTimeout(() => el.classList.remove('on'), 4000);
  }

  async function pintar() {
    const badge = $('cartN');
    if (badge) {
      const n = VIP.carrito.unidades();
      badge.textContent = n;
      badge.classList.toggle('hide', n === 0);
    }
    const cont = $('cartBody');
    if (!cont) return;

    const d = await VIP.carrito.detalle();

    if (!d.items.length) {
      cont.innerHTML = `<div class="cart-vacio">
        <p><b>Tu carrito está vacío.</b></p>
        <p>Busca tu medida o dinos qué carro tienes y te decimos cuál te sirve.</p>
        <button class="btn btn-ink" onclick="cerrarCarrito();abrirCatalogo({})">Ver el catálogo</button></div>`;
      $('cartPie').innerHTML = '';
      return;
    }

    cont.innerHTML = d.items.map(i => {
      const p = i.producto;
      /* El tope es lo que haya en inventario, nunca más. Se listan todas las
         cantidades hasta ese tope para que la selección siempre coincida con
         la cantidad real de la línea. */
      const tope = Math.max(1, Math.min(VIP.carrito.MAX_POR_SKU, p.stock || 1));
      const opciones = Array.from({ length: tope }, (_, k) => k + 1)
        .map(n => `<option value="${n}"${n === i.cantidad ? ' selected' : ''}>${n}</option>`).join('');
      return `<div class="cart-linea">
        ${VIP.ui.imagen(p, 'cart-foto')}
        <div class="cart-info">
          <b>${esc(p.titulo)}</b>
          <span class="cart-med">${esc(p.medida)} ${esc(p.indiceCarga)}</span>
          <span class="cart-sku">SKU ${esc(p.sku)}</span>
          ${p.estadoStock !== 'disponible'
            ? `<span class="cart-alerta">${esc(p.estadoStockEtiqueta)}</span>` : ''}
        </div>
        <div class="cart-num">
          <select onchange="fijarCantidadCarrito('${esc(p.sku)}', this.value)" aria-label="Cantidad">${opciones}</select>
          <b>${VIP.ui.dinero(i.subtotal)}</b>
          <button class="cart-x" onclick="quitarDelCarrito('${esc(p.sku)}')" aria-label="Quitar">×</button>
        </div>
      </div>`;
    }).join('');

    const bs = VIP.ui.bolivares(d.total);
    $('cartPie').innerHTML = `
      <div class="cart-total"><span>Total (${d.unidades} ${d.unidades === 1 ? 'caucho' : 'cauchos'})</span>
        <b>${VIP.ui.dinero(d.total)}</b></div>
      ${bs ? `<div class="refbcv" style="text-align:right">${esc(bs)}</div>` : ''}
      <div class="cart-nota">Montaje y balanceo incluidos si montas en la cauchera aliada.</div>
      <button class="btn btn-wa" onclick="irACobro()">
        <svg class="ic"><use href="#i-wa"/></svg> CONTINUAR POR WHATSAPP</button>
      <button class="btn btn-gh" onclick="vaciarCarrito()">Vaciar carrito</button>`;
  }

  VIP.ui.carrito = { abrir, cerrar, pintar, agregar };

  window.abrirCarrito  = abrir;
  window.cerrarCarrito = cerrar;
  window.agregarAlCarrito = agregar;
  window.quitarDelCarrito = sku => { VIP.carrito.quitar(sku); };
  window.fijarCantidadCarrito = (sku, n) => VIP.carrito.fijar(sku, n);
  window.vaciarCarrito = () => VIP.carrito.vaciar();

  VIP.carrito.suscribir(pintar);
})(window.VIP = window.VIP || {});
