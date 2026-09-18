/* ============================================================
   Cauchos VIP — adaptador HTTP (la futura API)
   ------------------------------------------------------------
   ESTE ADAPTADOR ESTÁ ESCRITO PERO NO ESTÁ ACTIVO.

   No hay ninguna conexión real, ningún endpoint cargado y ninguna
   credencial. Existe para que el día que la API esté lista el
   cambio sea de UNA línea en js/config.js:

       catalogo: { fuente: 'local' }   →   catalogo: { fuente: 'api' }

   y cargar la URL base en  catalogo.endpoint.

   Contrato que debe cumplir la API: docs/API-CONTRATO.md

   SEGURIDAD — regla que no se negocia:
   aquí no va ninguna API key, token ni secreto. Todo lo que está en
   el frontend lo puede leer cualquiera que abra el navegador. Si la
   API de inventario exige autenticación, se pone un proxy en el
   servidor de VENEGE que guarde la credencial y el frontend llama
   a ese proxy.
   ============================================================ */
(function (VIP) {
  'use strict';

  function base() {
    const c = (VIP.cfg && VIP.cfg.catalogo) || {};
    return String(c.endpoint || '').replace(/\/+$/, '');
  }

  function exigirEndpoint() {
    if (!base()) {
      throw new VIP.http.ErrorHttp(
        'El adaptador de API está seleccionado pero catalogo.endpoint está vacío en js/config.js.',
        'ENDPOINT_NO_CONFIGURADO');
    }
  }

  /** GET {endpoint}/productos?... → { meta, data } */
  async function obtenerCatalogo(consulta) {
    exigirEndpoint();
    const q = new URLSearchParams();
    if (consulta) {
      if (consulta.texto)     q.set('q', consulta.texto);
      if (consulta.medida)    q.set('medida', consulta.medida);
      if (consulta.categoria) q.set('categoria', [].concat(consulta.categoria).join(','));
      if (consulta.marca)     q.set('marca', [].concat(consulta.marca).join(','));
      if (consulta.pagina)    q.set('pagina', consulta.pagina);
      if (consulta.porPagina) q.set('porPagina', consulta.porPagina);
    }
    const url = base() + '/productos' + (q.toString() ? '?' + q : '');
    const payload = await VIP.http.getJSON(url, { timeoutMs: 8000, reintentos: 1 });

    if (!payload || !Array.isArray(payload.data)) {
      throw new VIP.http.ErrorHttp(
        'La API respondió sin el arreglo "data". Ver docs/API-CONTRATO.md',
        'RESPUESTA_INVALIDA');
    }
    payload.meta = Object.assign({}, payload.meta, { fuente: 'api' });
    return payload;
  }

  /** GET {endpoint}/productos/{sku} → { meta, data: {producto} } */
  async function obtenerProducto(sku) {
    exigirEndpoint();
    const payload = await VIP.http.getJSON(base() + '/productos/' + encodeURIComponent(sku));
    return payload && payload.data ? payload.data : null;
  }

  /** GET {endpoint}/stock?skus=A,B → { data: [{sku, stock}] }  (opcional) */
  async function obtenerStock(skus) {
    exigirEndpoint();
    const payload = await VIP.http.getJSON(
      base() + '/stock?skus=' + encodeURIComponent([].concat(skus).join(',')));
    return (payload && payload.data) || [];
  }

  VIP.adaptadores = VIP.adaptadores || {};
  VIP.adaptadores.api = {
    nombre: 'api',
    obtenerCatalogo,
    obtenerProducto,
    obtenerStock,
    soportaConsultaRemota: true
  };
})(window.VIP = window.VIP || {});
