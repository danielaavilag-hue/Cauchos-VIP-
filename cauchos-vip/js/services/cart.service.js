/* ============================================================
   Cauchos VIP — carrito
   ------------------------------------------------------------
   El carrito guarda SKU y cantidad. Nada más.

   Precio, nombre, stock e imagen NUNCA se guardan aquí: se piden
   al catálogo cada vez que hace falta. Así, si un precio cambia
   entre que el cliente agrega y que paga, el carrito muestra el
   precio correcto y no uno viejo guardado en el navegador.

   Persiste en localStorage para que el cliente no pierda su
   selección al recargar. Si el navegador lo bloquea, el carrito
   sigue funcionando en memoria.
   ============================================================ */
(function (VIP) {
  'use strict';

  const CLAVE = 'vip.carrito.v1';
  const MAX_POR_SKU = 8;

  let lineas = [];              // [{sku, cantidad}]
  const oyentes = new Set();

  /* ---------------------------------------------------------- persistencia */
  function leerGuardado() {
    try {
      const s = window.localStorage.getItem(CLAVE);
      const v = s ? JSON.parse(s) : null;
      return Array.isArray(v)
        ? v.filter(l => l && l.sku).map(l => ({ sku: String(l.sku).toUpperCase(), cantidad: Math.max(1, +l.cantidad || 1) }))
        : [];
    } catch (e) { return []; }
  }
  function guardar() {
    try { window.localStorage.setItem(CLAVE, JSON.stringify(lineas)); } catch (e) { /* modo privado */ }
  }

  lineas = leerGuardado();

  /* ------------------------------------------------------------- avisos */
  function avisar() {
    guardar();
    oyentes.forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
  }
  function suscribir(fn) { oyentes.add(fn); return () => oyentes.delete(fn); }

  /* ------------------------------------------------------------ consultas */
  function lineaDe(sku) { return lineas.find(l => l.sku === String(sku).toUpperCase()); }
  function cantidadDe(sku) { const l = lineaDe(sku); return l ? l.cantidad : 0; }
  function unidades() { return lineas.reduce((n, l) => n + l.cantidad, 0); }
  function vacio() { return lineas.length === 0; }
  function skus() { return lineas.map(l => l.sku); }

  /**
   * Contenido del carrito con el producto ya resuelto.
   * Descarta en silencio los SKU que ya no existen en el catálogo.
   * @returns {Promise<{items:Array, unidades:number, total:number, moneda:string, avisos:Array}>}
   */
  async function detalle() {
    const items = [], avisos = [];
    for (const l of lineas) {
      const p = await VIP.catalogo.obtener(l.sku);
      if (!p) { avisos.push({ sku: l.sku, tipo: 'no_existe' }); continue; }
      let cantidad = l.cantidad;
      if (p.stock > 0 && cantidad > p.stock) {
        cantidad = p.stock;
        avisos.push({ sku: l.sku, tipo: 'ajustado_a_stock', disponible: p.stock });
      }
      if (p.estadoStock === 'agotado') avisos.push({ sku: l.sku, tipo: 'agotado' });
      items.push({ sku: p.sku, cantidad, producto: p, subtotal: +(p.precio * cantidad).toFixed(2) });
    }
    const total = items
      .filter(i => i.producto.comprable)
      .reduce((s, i) => s + i.subtotal, 0);
    return {
      items,
      unidades: items.reduce((n, i) => n + i.cantidad, 0),
      total: +total.toFixed(2),
      moneda: 'USD',
      avisos
    };
  }

  /* ----------------------------------------------------------- mutaciones */
  /**
   * Agrega unidades de un SKU. Valida contra el stock del catálogo.
   * @returns {Promise<{ok:boolean, motivo?:string, cantidad?:number}>}
   */
  async function agregar(sku, cantidad) {
    const s = String(sku || '').toUpperCase();
    const p = await VIP.catalogo.obtener(s);
    if (!p) return { ok: false, motivo: 'no_existe' };
    if (!p.comprable) return { ok: false, motivo: 'agotado' };

    const n = Math.max(1, Math.trunc(+cantidad || 1));
    const l = lineaDe(s);
    const tope = Math.min(MAX_POR_SKU, p.stock);
    const nueva = Math.min(tope, (l ? l.cantidad : 0) + n);

    if (l) l.cantidad = nueva; else lineas.push({ sku: s, cantidad: nueva });
    avisar();
    return { ok: true, cantidad: nueva, tope };
  }

  /** Fija la cantidad exacta. 0 quita la línea. */
  async function fijar(sku, cantidad) {
    const s = String(sku || '').toUpperCase();
    const n = Math.trunc(+cantidad || 0);
    if (n <= 0) return quitar(s), { ok: true, cantidad: 0 };
    const p = await VIP.catalogo.obtener(s);
    if (!p) return { ok: false, motivo: 'no_existe' };
    const nueva = Math.min(n, MAX_POR_SKU, Math.max(1, p.stock));
    const l = lineaDe(s);
    if (l) l.cantidad = nueva; else lineas.push({ sku: s, cantidad: nueva });
    avisar();
    return { ok: true, cantidad: nueva };
  }

  function quitar(sku) {
    const s = String(sku || '').toUpperCase();
    const antes = lineas.length;
    lineas = lineas.filter(l => l.sku !== s);
    if (lineas.length !== antes) avisar();
  }

  function vaciar() { lineas = []; avisar(); }

  VIP.carrito = {
    MAX_POR_SKU,
    suscribir, detalle, agregar, fijar, quitar, vaciar,
    cantidadDe, unidades, vacio, skus
  };
})(window.VIP = window.VIP || {});
