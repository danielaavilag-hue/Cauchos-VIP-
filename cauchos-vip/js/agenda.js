/* ============================================================
   Cauchos VIP — calendario operativo
   ------------------------------------------------------------
   Regla de negocio, no detalle técnico:

   · Lunes a viernes  → las tres vías funcionan (cauchera, delivery, pickup).
   · Sábado           → VENEGE no despacha. La cauchera SÍ abre, así que
                        solo se vende por la vía cauchera y únicamente con
                        el stock adelantado que ya está en su local.
                        Delivery y pickup quedan cerrados.
   · Domingo          → no abre nadie. El sitio sigue vendiendo y cobrando,
                        pero la entrega se programa para un día hábil.

   En producción la fecha debe venir del servidor con la hora de Caracas,
   nunca del reloj del visitante, que es manipulable y puede estar en
   otro huso horario.
   ============================================================ */

const DIAS   = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const DIAS_C = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const MESES  = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

/** Fecha operativa. [REQUIERE VENEGE] en producción: hora de Caracas del servidor. */
function ahora(){ return new Date(); }

/** Qué vías están abiertas un día dado. */
function viasDe(fecha){
  const d = fecha.getDay();
  if(d === 0) return { cauchera:false, delivery:false, pickup:false, tipo:'domingo' };
  if(d === 6) return { cauchera:true,  delivery:false, pickup:false, tipo:'sabado'  };
  return             { cauchera:true,  delivery:true,  pickup:true,  tipo:'habil'   };
}

/** Vías abiertas hoy. */
function viasHoy(){ return viasDe(ahora()); }

/** Etiqueta corta de una fecha: "Sáb 30 ago". */
function etiquetaFecha(f, incluirHoy){
  const hoy = ahora();
  const mismo = f.toDateString() === hoy.toDateString();
  const man = new Date(hoy); man.setDate(man.getDate() + 1);
  if(incluirHoy && mismo) return 'Hoy';
  if(incluirHoy && f.toDateString() === man.toDateString()) return 'Mañana';
  return `${DIAS_C[f.getDay()]} ${f.getDate()} ${MESES[f.getMonth()]}`;
}

/**
 * Próximos días en los que se puede entregar por una vía dada.
 * @param {string} via  'cauchera' | 'delivery' | 'pickup'
 * @param {number} n    cuántas fechas devolver
 */
function proximasFechas(via, n){
  const out = [], f = new Date(ahora());
  let guard = 0;
  while(out.length < (n || 4) && guard++ < 20){
    if(viasDe(f)[via]) out.push(new Date(f));
    f.setDate(f.getDate() + 1);
  }
  return out;
}

/** Aviso que se muestra al cliente según el día. Devuelve null los días hábiles. */
function avisoDelDia(){
  const v = viasHoy();
  if(v.tipo === 'domingo') return {
    clase: 'av-dom',
    titulo: 'Hoy es domingo: compra ahora y programa tu entrega',
    texto:  'Los domingos no abrimos nosotros ni la cauchera aliada. Puedes comprar y pagar ' +
            'ahora mismo — al elegir cómo lo quieres recibir, escoges el día.'
  };
  if(v.tipo === 'sabado') return {
    clase: 'av-sab',
    titulo: 'Hoy es sábado: montaje en la cauchera aliada',
    texto:  'Los sábados nuestro almacén no despacha, así que hoy no hay delivery ni retiro en ' +
            'punto VIP. Sí puedes montar en la cauchera aliada con el inventario que ya está en ' +
            'su local. Si tu medida no está allá, la programamos para el lunes.'
  };
  return null;
}

if(typeof window !== 'undefined'){
  window.viasHoy = viasHoy; window.viasDe = viasDe;
  window.proximasFechas = proximasFechas; window.avisoDelDia = avisoDelDia;
  window.etiquetaFecha = etiquetaFecha;
}
