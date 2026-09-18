/* ============================================================
   Cauchos VIP — arranque
   ------------------------------------------------------------
   Único punto de inicio del sitio. Carga el catálogo por el
   servicio y de ahí pinta todo lo que depende de datos.

   Si el catálogo falla, la página NO se queda en blanco: muestra
   un aviso honesto y deja funcionando lo que no depende de él
   (cómo funciona, la red de caucheras, WhatsApp).
   ============================================================ */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);

  async function arrancar() {
    /* ---- lo que no depende del catálogo, primero ---- */
    fillSelects();
    $('hoy').textContent = new Date().toLocaleDateString('es-VE', { day: '2-digit', month: 'short' });
    $('faq').innerHTML = FAQ.map(([q, a]) =>
      `<div class="qa"><button onclick="this.parentNode.classList.toggle('open')">${q}</button><div class="ans">${a}</div></div>`).join('');
    $('nCau').textContent = CAU.length;
    $('pins').innerHTML = CAU.map(c =>
      `<div class="pin"><b>${c.n}</b> <span class="st">${c.dir} · ${c.hor}</span></div>`).join('');
    pintarAvisos();

    $('ov').addEventListener('click', e => { if (e.target.id === 'ov') closeWa(); });
    $('anOv').addEventListener('click', e => { if (e.target.id === 'anOv') anClose(); });
    $('mov').addEventListener('click', e => { if (e.target.id === 'mov') e.currentTarget.classList.remove('open'); });
    $('cartOv').addEventListener('click', e => { if (e.target.id === 'cartOv') cerrarCarrito(); });
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      cerrarCarrito(); closeWa(); anClose();
      $('mov').classList.remove('open');
    });

    /* ---- lo que sí depende del catálogo ---- */
    try {
      await VIP.catalogo.cargar();
      const fac = await VIP.catalogo.facetas();

      $('brandRow').innerHTML = fac.marca.map(m =>
        `<button class="brand" onclick="abrirCatalogo({marca:'${m.valor}'})">${m.valor}</button>`).join('');

      const destacados = await VIP.catalogo.listar({ orden: 'relevancia', porPagina: 4, soloDisponibles: true });
      $('featured').innerHTML = VIP.ui.grid(destacados.items);

      $('fSizes').innerHTML = fac.medida.slice(0, 6).map(m =>
        `<a href="#" onclick="abrirCatalogo({medida:'${m.valor}'});return false">Cauchos ${m.valor}</a>`).join('');

      await VIP.ui.catalogo.montarFiltros();
      await VIP.ui.catalogo.pintar();
      await VIP.ui.carrito.pintar();

      const d = VIP.catalogo.diagnostico();
      console.info(`[Cauchos VIP] catálogo cargado — fuente: ${d.fuente} · ${d.total} productos` +
        (d.descartados ? ` · ${d.descartados} descartados` : ''));
    } catch (e) {
      console.error('[Cauchos VIP] el catálogo no cargó:', e);
      fallaCatalogo(e);
    }
  }

  /** Degradación honesta: se dice que el catálogo no está, no se finge que está vacío. */
  function fallaCatalogo(e) {
    const msg = `<div class="aviso av-err"><div class="wrap">
      <b>El catálogo no está disponible en este momento</b>
      <p>Estamos resolviéndolo. Mientras tanto, escríbenos por WhatsApp con tu medida
         o con la marca y el modelo de tu carro, y te atendemos igual.</p></div></div>`;
    $('avisoDia').innerHTML = msg + $('avisoDia').innerHTML;
    ['featured', 'results'].forEach(id => { if ($(id)) $(id).innerHTML = ''; });
    const cnt = $('cnt'); if (cnt) cnt.textContent = '';
    const vacio = $('empty'); if (vacio) vacio.classList.remove('hide');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
