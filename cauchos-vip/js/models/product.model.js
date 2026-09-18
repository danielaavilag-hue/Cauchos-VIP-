/* ============================================================
   Cauchos VIP — modelo de Producto
   ------------------------------------------------------------
   Única definición de qué es un producto en el frontend.

   Todo lo que entra al sistema —del JSON local hoy, de la API
   mañana— pasa por normalizar(). Así, si la API cambia un nombre
   de campo, se ajusta AQUÍ y en ningún otro sitio.

   El identificador único es el SKU. No hay ids numéricos.
   ============================================================ */
(function (VIP) {
  'use strict';

  /* ---- campos del contrato ---- */
  const OBLIGATORIOS = ['sku', 'marca', 'nombre', 'categoria', 'medida', 'precio', 'stock'];
  const OPCIONALES = ['precioAnterior', 'descripcion', 'imagenes', 'vehiculosCompatibles',
                      'indiceCarga', 'gama', 'usos', 'desempeno', 'etiqueta', 'moneda',
                      'montajeIncluido', 'activo', 'actualizadoEn'];

  /* Imagen que se usa cuando el producto no trae ninguna, o cuando el
     archivo todavía no existe en el servidor. */
  const IMAGEN_FALLBACK = 'img/hero-caucho.svg';

  /** Normaliza una medida escrita de cualquier forma: 195 60 15 → 195/60R15 */
  function normalizarMedida(v) {
    if (!v) return '';
    const m = String(v).replace(/\s/g, '').match(/(\d{3})[\/\-]?(\d{2})[\/\-]?[rR]?(\d{2})/);
    return m ? `${m[1]}/${m[2]}R${m[3]}` : String(v).toUpperCase();
  }

  /** Quita acentos y pasa a minúsculas, para comparar texto sin sorpresas. */
  function plano(s) {
    return String(s == null ? '' : s)
      .normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  /* ---- estado de stock ----------------------------------------------------
     El umbral vive en config.js para que Marketing lo pueda mover sin tocar
     código. Si no está definido, se usa 5.                                    */
  function umbral() {
    const c = VIP.cfg && VIP.cfg.stock;
    return (c && typeof c.umbralUltimasUnidades === 'number') ? c.umbralUltimasUnidades : 5;
  }

  const ESTADOS = {
    disponible: { clave: 'disponible', etiqueta: 'Disponible',        clase: 'd-ok',   comprable: true },
    ultimas:    { clave: 'ultimas',    etiqueta: 'Últimas unidades',  clase: 'd-warn', comprable: true },
    agotado:    { clave: 'agotado',    etiqueta: 'Agotado',           clase: 'd-bad',  comprable: false }
  };

  /** Estado de stock a partir del número de unidades. */
  function estadoStock(unidades) {
    const n = Number(unidades);
    if (!isFinite(n) || n <= 0) return ESTADOS.agotado;
    if (n <= umbral()) return ESTADOS.ultimas;
    return ESTADOS.disponible;
  }

  /* ---- validación --------------------------------------------------------- */
  /** Devuelve [] si el objeto cumple el contrato; si no, la lista de problemas. */
  function validar(raw) {
    const fallas = [];
    if (!raw || typeof raw !== 'object') return ['no es un objeto'];
    OBLIGATORIOS.forEach(c => {
      const v = raw[c];
      if (v === undefined || v === null || v === '') fallas.push(`falta "${c}"`);
    });
    if (raw.precio !== undefined && !(Number(raw.precio) >= 0)) fallas.push('"precio" no es un número válido');
    if (raw.stock !== undefined && !Number.isFinite(Number(raw.stock))) fallas.push('"stock" no es un número');
    if (raw.imagenes && !Array.isArray(raw.imagenes)) fallas.push('"imagenes" debe ser un arreglo');
    if (raw.vehiculosCompatibles && !Array.isArray(raw.vehiculosCompatibles))
      fallas.push('"vehiculosCompatibles" debe ser un arreglo');
    return fallas;
  }

  /* ---- normalización ------------------------------------------------------ */
  /**
   * Convierte un objeto crudo (JSON local o respuesta de API) en un producto
   * del frontend, con los derivados ya calculados.
   * Devuelve null si el objeto no cumple el contrato.
   */
  function normalizar(raw) {
    if (validar(raw).length) return null;

    const imagenes = (Array.isArray(raw.imagenes) ? raw.imagenes : [])
      .map(i => (typeof i === 'string' ? { url: i, alt: '', principal: false } : i))
      .filter(i => i && i.url);

    const p = {
      /* obligatorios */
      sku: String(raw.sku).trim().toUpperCase(),
      marca: String(raw.marca).trim(),
      nombre: String(raw.nombre).trim(),
      categoria: String(raw.categoria).trim(),
      medida: normalizarMedida(raw.medida),
      precio: Number(raw.precio),
      stock: Math.max(0, Math.trunc(Number(raw.stock))),

      /* opcionales, siempre con un valor por defecto sensato */
      precioAnterior: raw.precioAnterior != null ? Number(raw.precioAnterior) : null,
      descripcion: raw.descripcion || '',
      imagenes: imagenes,
      vehiculosCompatibles: Array.isArray(raw.vehiculosCompatibles) ? raw.vehiculosCompatibles : [],
      indiceCarga: raw.indiceCarga || '',
      gama: raw.gama || '',
      usos: Array.isArray(raw.usos) ? raw.usos : [],
      desempeno: raw.desempeno && typeof raw.desempeno === 'object' ? raw.desempeno : null,
      etiqueta: raw.etiqueta || null,
      moneda: raw.moneda || 'USD',
      montajeIncluido: raw.montajeIncluido !== false,
      activo: raw.activo !== false,
      actualizadoEn: raw.actualizadoEn || null
    };

    /* ---- derivados: los calcula el frontend, la API no los manda ---- */
    const est = estadoStock(p.stock);
    p.estadoStock = est.clave;
    p.estadoStockEtiqueta = est.etiqueta;
    p.estadoStockClase = est.clase;
    p.comprable = est.comprable && p.activo;
    p.enPromocion = p.precioAnterior != null && p.precioAnterior > p.precio;
    p.descuentoPct = p.enPromocion
      ? Math.round((1 - p.precio / p.precioAnterior) * 100) : 0;
    p.titulo = `${p.marca} ${p.nombre}`;
    p.imagenPrincipal = (imagenes.find(i => i.principal) || imagenes[0] || null);
    /* imagenesDisponibles:false mientras VENEGE no cargue las fotos oficiales de marca.
       El campo "imagenes" se conserva intacto —es parte del contrato— pero la interfaz
       usa la ilustración, para no pedir 21 archivos que todavía no existen. */
    const hayFotos = !(VIP.cfg && VIP.cfg.catalogo && VIP.cfg.catalogo.imagenesDisponibles === false);
    p.imagenUrl = (hayFotos && p.imagenPrincipal) ? p.imagenPrincipal.url : IMAGEN_FALLBACK;
    p.imagenAlt = (p.imagenPrincipal && p.imagenPrincipal.alt) || `${p.titulo} ${p.medida}`;

    /* Texto sobre el que corre la búsqueda: SKU, marca, nombre, medida,
       categoría, gama, usos y los vehículos compatibles. */
    p.textoBusqueda = plano([
      p.sku, p.sku.replace(/-/g, ' '), p.marca, p.nombre, p.medida,
      p.medida.replace(/[^0-9]/g, ''), p.categoria, p.gama, p.usos.join(' '),
      p.vehiculosCompatibles.map(v => `${v.marca} ${v.modelo}`).join(' ')
    ].join(' '));

    return p;
  }

  /** ¿Este producto le sirve a este vehículo? */
  function sirveA(producto, marca, modelo, anio) {
    const a = parseInt(anio, 10);
    return producto.vehiculosCompatibles.some(v =>
      plano(v.marca) === plano(marca) &&
      plano(v.modelo) === plano(modelo) &&
      (!a || (a >= v.anioDesde && a <= v.anioHasta)));
  }

  VIP.Producto = {
    OBLIGATORIOS, OPCIONALES, IMAGEN_FALLBACK, ESTADOS,
    normalizar, validar, estadoStock, normalizarMedida, plano, sirveA
  };
})(window.VIP = window.VIP || {});
