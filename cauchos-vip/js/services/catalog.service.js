/* ============================================================
   Cauchos VIP — servicio de catálogo
   ------------------------------------------------------------
   LA FRONTERA. Ningún componente visual sabe de dónde salen los
   productos: le preguntan a este servicio y punto.

   El servicio elige el adaptador según  VIP.cfg.catalogo.fuente:
       'local'  → data/catalogo.json  (o la copia embebida)
       'api'    → la API de inventario

   Todos los métodos son asíncronos aunque hoy los datos estén en
   memoria. Es deliberado: así el día que la respuesta venga por red
   no hay que tocar ni una llamada.
   ============================================================ */
(function (VIP) {
  'use strict';

  const M = VIP.Producto;

  const estado = {
    cargado: false,
    cargando: null,     // promesa en vuelo, para no cargar dos veces
    fuente: null,
    items: [],
    porSku: new Map(),
    meta: null,
    error: null,
    descartados: []     // productos que no cumplieron el contrato
  };

  function adaptador() {
    const fuente = ((VIP.cfg && VIP.cfg.catalogo && VIP.cfg.catalogo.fuente) || 'local').toLowerCase();
    const a = VIP.adaptadores[fuente];
    if (!a) throw new Error(`Fuente de catálogo desconocida: "${fuente}". Use 'local' o 'api'.`);
    return a;
  }

  /* ---------------------------------------------------------------- carga */
  async function cargar(forzar) {
    if (estado.cargado && !forzar) return estado.items;
    if (estado.cargando) return estado.cargando;

    estado.cargando = (async () => {
      const a = adaptador();
      try {
        const payload = await a.obtenerCatalogo();
        const buenos = [], malos = [];
        payload.data.forEach(raw => {
          const p = M.normalizar(raw);
          if (p) buenos.push(p);
          else malos.push({ raw: raw, problemas: M.validar(raw) });
        });
        // un SKU repetido gana el último: la API es la fuente de verdad
        const mapa = new Map();
        buenos.forEach(p => mapa.set(p.sku, p));

        estado.items = Array.from(mapa.values());
        estado.porSku = mapa;
        estado.meta = payload.meta || null;
        estado.fuente = (payload.meta && payload.meta.fuente) || a.nombre;
        estado.descartados = malos;
        estado.error = null;
        estado.cargado = true;

        if (malos.length) {
          console.warn(`[catálogo] ${malos.length} producto(s) descartados por no cumplir el contrato:`, malos);
        }
        return estado.items;
      } catch (e) {
        estado.error = e;
        estado.cargado = false;
        throw e;
      } finally {
        estado.cargando = null;
      }
    })();

    return estado.cargando;
  }

  /* ------------------------------------------------------------- consultas */

  /** Coincidencia de texto libre: SKU, marca, nombre, medida, categoría, modelo de vehículo. */
  function coincideTexto(p, texto) {
    if (!texto) return true;
    const t = M.plano(texto).trim();
    if (!t) return true;
    // solo se interpreta como medida si TODO el texto es una medida
    // ("195 60 15", "195/60R15", "1956015"), nunca si es un SKU que la contiene
    if (/^[\d\s\/\-rR]+$/.test(t)) {
      const comoMedida = M.normalizarMedida(t);
      if (/^\d{3}\/\d{2}R\d{2}$/.test(comoMedida)) return p.medida === comoMedida;
    }
    // todas las palabras deben aparecer
    return t.split(/\s+/).every(w => p.textoBusqueda.includes(w));
  }

  function coincide(p, f) {
    f = f || {};
    if (f.soloActivos !== false && !p.activo) return false;
    if (f.texto && !coincideTexto(p, f.texto)) return false;
    if (f.medida) {
      const m = M.normalizarMedida(f.medida);
      if (p.medida !== m && !p.medida.startsWith(m)) return false;
    }
    if (f.sku && p.sku !== String(f.sku).toUpperCase()) return false;
    const enLista = (campo, valores) =>
      !valores || !valores.length || valores.map(M.plano).includes(M.plano(p[campo]));
    if (!enLista('categoria', f.categoria)) return false;
    if (!enLista('marca', f.marca)) return false;
    if (!enLista('gama', f.gama)) return false;
    if (f.uso && f.uso.length && !p.usos.some(u => f.uso.map(M.plano).includes(M.plano(u)))) return false;
    if (f.soloDisponibles && p.estadoStock === 'agotado') return false;
    if (f.precioMin != null && p.precio < f.precioMin) return false;
    if (f.precioMax != null && p.precio > f.precioMax) return false;
    if (f.vehiculo) {
      const v = f.vehiculo;
      if (!M.sirveA(p, v.marca, v.modelo, v.anio)) return false;
    }
    return true;
  }

  const ORDENES = {
    relevancia:    (a, b) => (b.etiqueta ? 1 : 0) - (a.etiqueta ? 1 : 0) || a.precio - b.precio,
    precioAsc:     (a, b) => a.precio - b.precio,
    precioDesc:    (a, b) => b.precio - a.precio,
    marca:         (a, b) => a.marca.localeCompare(b.marca) || a.precio - b.precio,
    disponibilidad:(a, b) => b.stock - a.stock
  };

  /**
   * Lista productos con filtros, orden y paginación.
   * @returns {Promise<{items:Array, total:number, pagina:number, porPagina:number, paginas:number, facetas:object}>}
   */
  async function listar(filtros) {
    await cargar();
    const f = filtros || {};
    const filtrados = estado.items.filter(p => coincide(p, f));
    const orden = ORDENES[f.orden] || ORDENES.relevancia;
    filtrados.sort(orden);

    const porPagina = f.porPagina || filtrados.length || 1;
    const pagina = Math.max(1, f.pagina || 1);
    const desde = (pagina - 1) * porPagina;

    return {
      items: filtrados.slice(desde, desde + porPagina),
      total: filtrados.length,
      pagina,
      porPagina,
      paginas: Math.max(1, Math.ceil(filtrados.length / porPagina)),
      facetas: calcularFacetas(filtrados)
    };
  }

  /** Un producto por SKU. null si no existe. */
  async function obtener(sku) {
    await cargar();
    if (!sku) return null;
    const p = estado.porSku.get(String(sku).toUpperCase());
    if (p) return p;

    // la API sí puede resolver un SKU que no vino en la primera página
    const a = adaptador();
    if (a.obtenerProducto) {
      try {
        const crudo = await a.obtenerProducto(sku);
        const norm = crudo ? M.normalizar(crudo) : null;
        if (norm) { estado.porSku.set(norm.sku, norm); return norm; }
      } catch (e) { console.warn('[catálogo] no se pudo resolver el SKU', sku, e); }
    }
    return null;
  }

  /** Búsqueda rápida para el buscador y para Andrea. */
  async function buscar(texto, limite) {
    const r = await listar({ texto: texto, orden: 'relevancia' });
    return limite ? r.items.slice(0, limite) : r.items;
  }

  async function porMedida(medida) {
    return (await listar({ medida: medida })).items;
  }

  async function porVehiculo(marca, modelo, anio) {
    return (await listar({ vehiculo: { marca, modelo, anio } })).items;
  }

  /** Alternativas al producto: misma medida primero, luego misma categoría. */
  async function relacionados(sku, limite) {
    await cargar();
    const p = await obtener(sku);
    if (!p) return [];
    const n = limite || 4;
    const out = [], vistos = new Set([p.sku]);
    const meter = lista => lista.forEach(x => {
      if (out.length < n && !vistos.has(x.sku)) { vistos.add(x.sku); out.push(x); }
    });
    meter(estado.items.filter(x => x.medida === p.medida));                    // misma medida
    meter(estado.items.filter(x => x.categoria === p.categoria));              // mismo tipo de vehículo
    meter(estado.items.filter(x => x.marca === p.marca));                      // misma marca
    meter(estado.items.filter(x => x.estadoStock !== 'agotado'));              // relleno
    return out;
  }

  /** Valores disponibles para armar los filtros. Salen del catálogo, no están escritos a mano. */
  function calcularFacetas(lista) {
    const cuenta = campo => {
      const m = new Map();
      lista.forEach(p => {
        const vs = Array.isArray(p[campo]) ? p[campo] : [p[campo]];
        vs.filter(Boolean).forEach(v => m.set(v, (m.get(v) || 0) + 1));
      });
      return Array.from(m, ([valor, n]) => ({ valor, n })).sort((a, b) => b.n - a.n || String(a.valor).localeCompare(b.valor));
    };
    return {
      categoria: cuenta('categoria'),
      marca: cuenta('marca'),
      gama: cuenta('gama'),
      uso: cuenta('usos'),
      medida: cuenta('medida'),
      disponibles: lista.filter(p => p.estadoStock !== 'agotado').length
    };
  }

  /** Facetas de todo el catálogo (sin filtros aplicados). */
  async function facetas() {
    await cargar();
    return calcularFacetas(estado.items);
  }

  /** Diagnóstico: de dónde salieron los datos y si algo se descartó. */
  function diagnostico() {
    return {
      fuente: estado.fuente,
      cargado: estado.cargado,
      total: estado.items.length,
      descartados: estado.descartados.length,
      meta: estado.meta,
      error: estado.error ? { codigo: estado.error.codigo, mensaje: estado.error.message } : null
    };
  }

  VIP.catalogo = {
    cargar, listar, obtener, buscar, porMedida, porVehiculo,
    relacionados, facetas, diagnostico
  };
})(window.VIP = window.VIP || {});
