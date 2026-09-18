/* ============================================================
   Cauchos VIP — cliente HTTP
   ------------------------------------------------------------
   Envoltura mínima sobre fetch. La usan los adaptadores; ningún
   componente visual la llama directamente.

   No maneja credenciales a propósito: en el frontend no va ninguna
   API key ni ningún secreto. Si la API de inventario necesita
   autenticación, va detrás de un proxy en el servidor, y el
   frontend llama a ese proxy.
   ============================================================ */
(function (VIP) {
  'use strict';

  const POR_DEFECTO = { timeoutMs: 8000, reintentos: 1, reintentoEsperaMs: 600 };

  class ErrorHttp extends Error {
    constructor(mensaje, codigo, status) {
      super(mensaje);
      this.name = 'ErrorHttp';
      this.codigo = codigo || 'ERROR_RED';
      this.status = status || 0;
    }
  }

  const dormir = ms => new Promise(r => setTimeout(r, ms));

  /**
   * GET que devuelve JSON.
   * @param {string} url
   * @param {{timeoutMs?:number, reintentos?:number, headers?:object, signal?:AbortSignal}} opts
   */
  async function getJSON(url, opts) {
    const o = Object.assign({}, POR_DEFECTO, opts || {});
    let ultimo;

    for (let intento = 0; intento <= o.reintentos; intento++) {
      const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const t = ctrl ? setTimeout(() => ctrl.abort(), o.timeoutMs) : null;
      try {
        const res = await fetch(url, {
          method: 'GET',
          headers: Object.assign({ 'Accept': 'application/json' }, o.headers || {}),
          credentials: 'omit',
          signal: ctrl ? ctrl.signal : undefined
        });
        if (t) clearTimeout(t);

        if (!res.ok) {
          // 4xx no se reintenta: el problema es la petición, no la red
          const err = new ErrorHttp(`HTTP ${res.status} en ${url}`, 'HTTP_' + res.status, res.status);
          if (res.status >= 400 && res.status < 500) throw err;
          ultimo = err;
        } else {
          return await res.json();
        }
      } catch (e) {
        if (t) clearTimeout(t);
        if (e instanceof ErrorHttp && e.status >= 400 && e.status < 500) throw e;
        ultimo = e.name === 'AbortError'
          ? new ErrorHttp(`Tiempo agotado (${o.timeoutMs} ms) en ${url}`, 'TIMEOUT')
          : new ErrorHttp(e.message || 'Fallo de red', 'ERROR_RED');
      }
      if (intento < o.reintentos) await dormir(o.reintentoEsperaMs * (intento + 1));
    }
    throw ultimo;
  }

  VIP.http = { getJSON, ErrorHttp };
})(window.VIP = window.VIP || {});
