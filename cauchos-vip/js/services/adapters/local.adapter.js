/* ============================================================
   Cauchos VIP — adaptador LOCAL
   ------------------------------------------------------------
   Devuelve el catálogo desde datos locales. Es el adaptador
   activo mientras no exista la API.

   Estrategia en dos pasos:
     1. fetch('data/catalogo.json')  → funciona servido por HTTP
     2. window.__VIP_CATALOGO_MOCK__ → funciona con doble clic (file://),
        donde fetch de archivos locales está bloqueado por el navegador

   Devuelve exactamente la misma forma que devolverá la API:
       { meta: {...}, data: [ ...productos... ] }
   ============================================================ */
(function (VIP) {
  'use strict';

  const RUTA = 'data/catalogo.json';

  async function obtenerCatalogo() {
    // 1) el JSON, que es la fuente de verdad
    try {
      const payload = await VIP.http.getJSON(RUTA, { timeoutMs: 5000, reintentos: 0 });
      if (payload && Array.isArray(payload.data)) {
        payload.meta = Object.assign({}, payload.meta, { fuente: 'local:json' });
        return payload;
      }
    } catch (e) {
      /* silencio a propósito: en file:// esto SIEMPRE falla y no es un error */
    }

    // 2) la copia embebida
    const mock = window.__VIP_CATALOGO_MOCK__;
    if (mock && Array.isArray(mock.data)) {
      return { meta: Object.assign({}, mock.meta, { fuente: 'local:embebido' }), data: mock.data };
    }

    throw new VIP.http.ErrorHttp(
      'No se pudo cargar el catálogo local (ni data/catalogo.json ni la copia embebida).',
      'CATALOGO_NO_DISPONIBLE');
  }

  VIP.adaptadores = VIP.adaptadores || {};
  VIP.adaptadores.local = {
    nombre: 'local',
    obtenerCatalogo,
    /* El adaptador local no pagina ni filtra en el servidor: entrega todo
       y el servicio hace el trabajo en memoria. La API sí podrá paginar. */
    soportaConsultaRemota: false
  };
})(window.VIP = window.VIP || {});
