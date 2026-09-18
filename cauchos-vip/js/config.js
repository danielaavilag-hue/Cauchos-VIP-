/* ============================================================
   Cauchos VIP — configuración del sitio
   ------------------------------------------------------------
   Este es el ÚNICO archivo que hay que tocar para pasar del
   prototipo a producción. Todo lo que aquí aparece como null,
   "" o [REQUIERE VENEGE] debe ser completado por VENEGE antes
   de publicar.
   ============================================================ */

const VIP_CONFIG = {

  /* ---------- Identidad ---------- */
  marca: 'Cauchos VIP',
  unidad: 'Unidad de negocio de VENEGE',
  dominio: '',                       // [REQUIERE VENEGE] ej: 'cauchosvip.com.ve'
  ciudades: ['Caracas'],             // por ahora solo Caracas

  /* ---------- WhatsApp ----------
     simular:true  → usa el simulador incluido (prototipo, no envía nada)
     simular:false → abre WhatsApp real con wa.me/<numero>
     En producción, el canal debe ser WhatsApp Business Platform (API)
     contratada a través de un BSP, no WhatsApp Business App. */
  whatsapp: {
    simular: true,
    numero: '',                      // [REQUIERE VENEGE] formato internacional sin '+', ej: '58412XXXXXXX'
    saludo: 'Hola, vengo de la web de Cauchos VIP.',
    bsp: '',                         // [REQUIERE VENEGE] proveedor elegido
    plantillas: {                    // nombres de las plantillas aprobadas por Meta
      confirmacionOrden: '',
      asignacionCauchera: '',
      recordatorioMontaje: '',
      recuperacionCarrito: ''
    }
  },

  /* ---------- Andrea (asistente de IA) ----------
     En el prototipo Andrea responde por palabras clave (js/andrea.js).
     En producción es un LLM con tool-calling contra catálogo, inventario y CRM.
     Reglas duras: Andrea NUNCA cita precio, stock ni compatibilidad de memoria,
     y NUNCA gestiona el paso de pago ni valida comprobantes. */
  andrea: {
    modo: 'demo',                    // 'demo' | 'api'
    endpoint: '',                    // [REQUIERE VENEGE] ej: '/api/andrea'
    escalarAHumanoTrasIntentos: 2,
    horarioHumano: 'L-V 8:00-17:00, S 8:00-13:00'   // [REQUIERE VENEGE]
  },

  /* ---------- Catálogo / precios ----------
     Precio de venta = Lista 1 (precio de calle). La cauchera aliada recibe
     un porcentaje k sobre ese precio. NO fijar k aquí sin decisión formal. */
  catalogo: {
    fuente: 'local',                 // 'local' = data/catalogo.json  |  'api' = la API de inventario
    endpoint: '',                    // [REQUIERE VENEGE] URL base de la API, ej: 'https://api.venege.com/v1'
                                     // NUNCA poner aquí una API key: ver docs/API-CONTRATO.md
    moneda: 'USD',
    listaDePrecio: 'Lista 1',
    /* Poner en true cuando estén cargadas las fotos de img/productos/.
       Mientras sea false, todas las tarjetas usan la ilustración de marca. */
    imagenesDisponibles: false
  },

  /* ---------- Estados de stock ----------
     El frontend traduce el número de unidades a Disponible /
     Últimas unidades / Agotado. Marketing puede mover este umbral
     sin tocar código. */
  stock: {
    umbralUltimasUnidades: 5      // 1..5 unidades → "Últimas unidades"
  },

  /* ---------- Referencia en bolívares ----------
     El precio de venta es en dólares. El bolívar se muestra SOLO como
     referencia informativa a tasa BCV, nunca como precio de cobro.
     En producción la tasa debe actualizarse a diario desde el BCV
     (o desde el ERP de VENEGE), nunca escribirse a mano en este archivo. */
  bcv: {
    mostrar: true,
    tasa: 785.00,                    // [REQUIERE VENEGE] valor de ejemplo; conectar a fuente diaria
    fecha: '26/08/2026',             // fecha de la tasa mostrada
    fuente: 'Banco Central de Venezuela',
    endpoint: ''                     // [REQUIERE VENEGE] servicio que devuelve la tasa del día
  },

  /* ---------- Vías de entrega ----------
     Regla fija: la cauchera aliada SIEMPRE se ofrece primero.
     Montaje y balanceo solo van incluidos por esa vía. */
  entrega: {
    caucheraAliada: { activa: true,  montajeIncluido: true },
    delivery:       { activa: true,  montajeIncluido: false, costo: 0, cobertura: 'Caracas' },
    pickup:         { activa: true,  montajeIncluido: false, punto: '' }  // [REQUIERE VENEGE] dirección
  },

  /* ---------- CRM ---------- */
  crm: {
    proveedor: 'Kommo',              // recomendado en el plan de producción
    webhookLead: '',                 // [REQUIERE VENEGE]
    webhookOrden: '',                // [REQUIERE VENEGE]
    prefijoCodigo: 'VIP'             // código de orden: VIP-AAMM-secuencial
  },

  /* ---------- Medición ---------- */
  tracking: {
    gtmId: '',                       // [REQUIERE VENEGE] GTM-XXXXXXX
    ga4Id: '',                       // G-XXXXXXXXXX
    metaPixelId: '',
    metaCapiToken: '',               // NUNCA en el front: va en el servidor
    googleAdsId: '',
    conversionesOffline: true        // subir 'orden pagada' a Meta CAPI y Google Ads
  },

  /* ---------- Legales ---------- */
  legal: {
    rif: '',                         // [REQUIERE VENEGE]
    razonSocial: '',                 // [REQUIERE VENEGE]
    politicaDevoluciones: '',        // URL
    terminos: ''                     // URL
  }
};

/* ------------------------------------------------------------
   Helpers públicos
   ------------------------------------------------------------ */
const VIP = {
  cfg: VIP_CONFIG,

  /** URL de WhatsApp real. Devuelve null si todavía no hay número cargado. */
  waUrl(mensaje) {
    const n = VIP_CONFIG.whatsapp.numero;
    if (!n) return null;
    const txt = encodeURIComponent(mensaje || VIP_CONFIG.whatsapp.saludo);
    return `https://wa.me/${n}?text=${txt}`;
  },

  /** true mientras el sitio siga usando el simulador incluido. */
  esSimulacion() {
    return VIP_CONFIG.whatsapp.simular !== false || !VIP_CONFIG.whatsapp.numero;
  },

  /** Lista de campos sin completar. Útil como checklist antes de publicar. */
  pendientes(obj = VIP_CONFIG, ruta = '') {
    let out = [];
    for (const k in obj) {
      const v = obj[k], p = ruta ? `${ruta}.${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) out = out.concat(this.pendientes(v, p));
      else if (v === '' || v === null) out.push(p);
    }
    return out;
  }
};

if (typeof window !== 'undefined') { window.VIP = VIP; window.VIP_CONFIG = VIP_CONFIG; }
