/* ============================================================
   Cauchos VIP — vista de catálogo
   ------------------------------------------------------------
   Filtros, búsqueda, orden y grilla de resultados.

   Todo lo que pinta viene de VIP.catalogo. Los filtros no están
   escritos a mano: se generan a partir de las facetas que el
   propio catálogo reporta, así que si mañana la API trae una
   marca nueva, aparece sola.
   ============================================================ */
(function (VIP) {
  'use strict';

  const $ = id => document.getElementById(id);
  const esc = s => VIP.ui.esc(s);

  /* Estado de la consulta. Es lo único mutable de esta vista. */
  let F = {
    texto: '', medida: '',
    categoria: [], marca: [], gama: [], uso: [],
    soloDisponibles: false, orden: 'relevancia'
  };

  const GRUPOS = [
    { clave: 'categoria', id: 'fTipo',  titulo: 'Tipo de vehículo' },
    { clave: 'marca',     id: 'fMarca', titulo: 'Marca' },
    { clave: 'gama',      id: 'fGama',  titulo: 'Gama' },
    { clave: 'uso',       id: 'fUso',   titulo: 'Uso' }
  ];

  /* ------------------------------------------------------------- filtros */
  async function montarFiltros() {
    const fac = await VIP.catalogo.facetas();
    GRUPOS.forEach(g => {
      const cont = $(g.id);
      if (!cont) return;
      cont.innerHTML = (fac[g.clave] || []).map(o =>
        `<button class="chip" data-k="${g.clave}" data-v="${esc(o.valor)}" onclick="alternarFiltro(this)">
           ${esc(o.valor)} <span class="chipn">${o.n}</span></button>`).join('');
    });
    sincronizarChips();
  }

  function alternarFiltro(btn) {
    const k = btn.dataset.k, v = btn.dataset.v;
    if (k === 'dispo') { F.soloDisponibles = !F.soloDisponibles; btn.classList.toggle('on'); return pintar(); }
    const i = F[k].indexOf(v);
    if (i > -1) F[k].splice(i, 1); else F[k].push(v);
    btn.classList.toggle('on');
    pintar();
  }

  function sincronizarChips() {
    document.querySelectorAll('.filters .chip').forEach(b => {
      if (b.dataset.k === 'dispo') { b.classList.toggle('on', F.soloDisponibles); return; }
      const lista = F[b.dataset.k];
      b.classList.toggle('on', !!lista && lista.includes(b.dataset.v));
    });
  }

  function limpiar() {
    F = { texto: '', medida: '', categoria: [], marca: [], gama: [], uso: [],
          soloDisponibles: false, orden: F.orden };
    if ($('fQ')) $('fQ').value = '';
    if ($('fSize')) $('fSize').value = '';
    $('crumbCat').textContent = 'Cauchos';
    sincronizarChips();
    pintar();
  }

  /** Abre el catálogo con una consulta ya aplicada (hero, marcas, Andrea, vehículo). */
  function abrirCatalogo(consulta) {
    const c = consulta || {};
    F = { texto: c.texto || '', medida: c.medida || '',
          categoria: c.categoria ? [].concat(c.categoria) : [],
          marca: c.marca ? [].concat(c.marca) : [],
          gama: [], uso: c.uso ? [].concat(c.uso) : [],
          soloDisponibles: !!c.soloDisponibles, orden: c.orden || 'relevancia' };
    if ($('fQ')) $('fQ').value = F.texto;
    if ($('fSize')) $('fSize').value = F.medida;
    $('crumbCat').textContent =
      c.etiqueta || F.medida || F.categoria[0] || F.marca[0] || F.uso[0] || F.texto || 'Cauchos';
    sincronizarChips();
    go('cat');
    pintar();
  }

  /* -------------------------------------------------------------- pintar */
  let ultimaPeticion = 0;

  async function pintar() {
    const mia = ++ultimaPeticion;
    const cont = $('results');
    if (!cont) return;

    F.texto  = $('fQ') ? $('fQ').value.trim() : F.texto;
    F.medida = $('fSize') ? $('fSize').value.trim() : F.medida;
    F.orden  = $('fOrden') ? $('fOrden').value : F.orden;

    try {
      const r = await VIP.catalogo.listar(F);
      if (mia !== ultimaPeticion) return;   // llegó una consulta más nueva

      cont.innerHTML = VIP.ui.grid(r.items);
      $('cnt').textContent = r.total + (r.total === 1 ? ' opción' : ' opciones');
      $('empty').classList.toggle('hide', r.total > 0);
      const eq = $('emptyQ');
      if (eq) eq.textContent = F.texto || F.medida || '';
    } catch (e) {
      if (mia !== ultimaPeticion) return;
      cont.innerHTML = '';
      $('cnt').textContent = '';
      $('empty').classList.remove('hide');
      console.error('[catálogo] no se pudo listar:', e);
    }
  }

  /* Búsqueda con pequeño retardo, para no filtrar en cada tecla. */
  let temporizador;
  function buscarConRetardo() {
    clearTimeout(temporizador);
    temporizador = setTimeout(pintar, 180);
  }

  VIP.ui.catalogo = { montarFiltros, pintar, limpiar, abrirCatalogo, alternarFiltro, buscarConRetardo,
                      filtros: () => F };

  /* Nombres cortos para los onclick del HTML */
  window.abrirCatalogo   = abrirCatalogo;
  window.alternarFiltro  = alternarFiltro;
  window.limpiarFiltros  = limpiar;
  window.pintarCatalogo  = pintar;
  window.buscarCatalogo  = buscarConRetardo;
})(window.VIP = window.VIP || {});
