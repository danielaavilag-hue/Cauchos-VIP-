/* ============================================================
   Cauchos VIP — simulador del flujo de WhatsApp
   ------------------------------------------------------------
   Reproduce la conversación completa: pedido → nombre → zona →
   vía de entrega → cobro → orden confirmada.

   Trabaja siempre con SKU: el pedido que entra aquí es el carrito
   (o un solo SKU desde la ficha), y los precios se leen del
   catálogo en el momento, nunca de una copia guardada.

   Si en js/config.js se carga un número real y se apaga la
   simulación, estos mismos botones abren WhatsApp de verdad.
   ============================================================ */

let ctx = {};
const money2 = v => VIP.ui.dinero(v);

/** Referencia en bolívares para el chat. '' si no hay tasa cargada. */
function refBs(v) {
  const b = VIP.ui.bolivares(v);
  return b ? ' (' + b.replace('Ref. ', 'ref. ') + ')' : '';
}

/* ---------------------------------------------------------------- pedido */

/** Convierte el carrito en el pedido de la conversación. */
async function pedidoDesdeCarrito() {
  const d = await VIP.carrito.detalle();
  return { lineas: d.items.filter(i => i.producto.comprable), total: d.total, unidades: d.unidades };
}

/** Convierte un solo SKU en el pedido de la conversación. */
async function pedidoDeSku(sku, cantidad) {
  const p = await VIP.catalogo.obtener(sku);
  if (!p || !p.comprable) return { lineas: [], total: 0, unidades: 0 };
  const n = Math.max(1, Math.min(cantidad || 2, p.stock));
  return { lineas: [{ sku: p.sku, cantidad: n, producto: p, subtotal: p.precio * n }],
           total: p.precio * n, unidades: n };
}

/** Las líneas del pedido, listas para pegar en un mensaje. */
function resumenPedido(pedido) {
  return pedido.lineas.map(l =>
    `• ${l.producto.titulo} ${l.producto.medida} × ${l.cantidad} — ${money2(l.subtotal)}\n  SKU ${l.sku}`
  ).join('\n');
}

/* ------------------------------------------------------------ entradas */

/** Desde el carrito. */
async function irACobro() {
  const pedido = await pedidoDesdeCarrito();
  if (!pedido.lineas.length) { abrirCatalogo({}); cerrarCarrito(); return; }
  cerrarCarrito();
  abrirChat(pedido);
}

/** Desde la ficha, "comprar ahora". */
async function comprarAhora(sku) {
  const pedido = await pedidoDeSku(sku, cantidadFicha());
  if (!pedido.lineas.length) return;
  abrirChat(pedido);
}

/** Punto de entrada general (botones de WhatsApp del sitio). */
function wa(mode) {
  if (typeof VIP !== 'undefined' && !VIP.esSimulacion()) {
    window.open(VIP.waUrl(mensajeReal(mode)), '_blank', 'noopener');
    return;
  }
  if (mode === 'prod') { comprarAhora(VIP.ui.ficha.actual() && VIP.ui.ficha.actual().sku); return; }
  abrirChat(null, mode);
}

function mensajeReal(mode) {
  const p = VIP.ui.ficha.actual();
  if (mode === 'prod' && p) return `Hola, quiero comprar: ${p.titulo} ${p.medida} (SKU ${p.sku}).`;
  if (mode === 'cauchera') return 'Hola, tengo una cauchera y quiero información sobre la Red VIP.';
  return VIP.cfg.whatsapp.saludo;
}

/* ------------------------------------------------------------ el chat */

function abrirChat(pedido, mode) {
  ctx = { mode: mode || (pedido ? 'pedido' : 'general'), pedido: pedido || null };
  $('chat').innerHTML = ''; $('pfoot').innerHTML = '';
  $('ov').classList.add('open');

  if (pedido && pedido.lineas.length) {
    push('out', `Hola, quiero comprar:\n${resumenPedido(pedido)}`);
    bot([`¡Épale! 👋 Soy Andrea, de VIP.\n\nPerfecto, ya veo tu pedido:\n\n${resumenPedido(pedido)}\n\n` +
         `• Total ${money2(pedido.total)}${refBs(pedido.total)}\n• Montaje y balanceo incluidos\n\n` +
         `Te digo dónde te los montan y cuándo. Solo necesito 2 datos.\n\n¿Cómo te llamas?`], askName);
    return;
  }

  if (mode === 'foto') {
    push('out', 'Hola, no sé mi medida. ¿Me ayudan?');
    bot(['¡Épale! Soy Andrea. Tranquilo, eso lo resolvemos rapidito.\n\nMándame una foto del lado del caucho. Que se vean los números, así:\n\n[ejemplo: 195/60R15]'], () => {
      opts([['Mandar la foto', () => {
        push('out', 'foto_caucho.jpg');
        bot(['¡Recibida! Dame un momentico que la reviso.'], () => {
          bot(['Listo, tu medida es **195/60R15**.\n\nTe muestro las opciones que tengo en tu medida.'], () => {
            opts([['Ver mis opciones', () => { closeWa(); abrirCatalogo({ medida: '195/60R15' }); }]]);
          });
        });
      }], ['Mejor busco por mi carro', () => { closeWa(); setTab('b'); window.scrollTo({ top: 0, behavior: 'smooth' }); }]]);
    });

  } else if (mode === 'cauchera') {
    push('out', 'Hola, tengo una cauchera y quiero información');
    bot(['¡Épale! Soy Andrea, de VIP.\n\n¿Tienes una cauchera o taller?\n\nCon la Red VIP recibes clientes que ya compraron y ya pagaron. Nosotros te mandamos el caucho y el cliente; tú lo montas y cobras tu porcentaje. **Sin comprar inventario.**'], () => {
      opts([['Sí, quiero información', () => {
        bot(['Perfecto. ¿En qué zona está tu cauchera?'], () => {
          opts([['Caracas', () => {
            bot(['¡Listo! Ya te registré como prospecto de la Red VIP.\n\nUn ejecutivo te contacta para explicarte las condiciones, el porcentaje y coordinar la visita a tu local.\n\nMientras tanto, aquí puedes ver cómo funciona:'], () => {
              opts([['Ver la página para caucheras', () => { closeWa(); go('red'); }]]);
            });
          }]]);
        });
      }], ['No, soy cliente', () => { closeWa(); wa(); }]]);
    });

  } else if (mode === 'buscar') {
    push('out', 'Hola, no consigo mi medida en la página');
    bot(['¡Épale! Soy Andrea. Dime cuál medida necesitas y te digo en cuánto te la conseguimos.\n\nSi no la sabes, mándame una foto del caucho.'], () => {
      opts([['Escribir mi medida', () => {
        push('out', '195/60R15');
        bot(['Esa la manejo. Te muestro las opciones disponibles.'], () =>
          opts([['Ver opciones', () => { closeWa(); abrirCatalogo({ medida: '195/60R15' }); }]]));
      }], ['Mandar foto', () => { closeWa(); abrirChat(null, 'foto'); }]]);
    });

  } else {
    bot([`¡Épale! 👋 Soy **Andrea**, la asistente de Cauchos VIP.\n\nVendemos tus cauchos al precio de calle, con montaje y balanceo incluidos en una cauchera aliada de Caracas.\n\n¿Qué necesitas hoy?`], () => {
      opts([
        ['1) Ya sé mi medida', () => {
          push('out', 'Ya sé mi medida');
          bot(['Perfecto. ¿Cuál es tu medida?\nEscríbela como aparece en el caucho.\nEjemplo: 195/60R15'], () => {
            opts([['195/60R15', async () => {
              push('out', '195/60R15');
              const ops = (await VIP.catalogo.porMedida('195/60R15')).slice(0, 3);
              bot([`¡Listo! Tengo estas opciones en 195/60R15 (precio por caucho, montaje incluido):\n\n` +
                   ops.map((p, i) => `${i + 1}) ${p.titulo} — ${money2(p.precio)}`).join('\n') +
                   `\n\n¿Cuál te interesa?`], () => {
                opts(ops.map(p => [`${p.marca} ${p.nombre}`, async () => {
                  push('out', `${p.marca} ${p.nombre}`);
                  ctx.pedido = await pedidoDeSku(p.sku, 4);
                  askName();
                }]).concat([['Ver todas en la página', () => { closeWa(); abrirCatalogo({ medida: '195/60R15' }); }]]));
              });
            }]]);
          });
        }],
        ['2) No sé mi medida', () => { closeWa(); abrirChat(null, 'foto'); }],
        ['3) Tengo una cauchera', () => { closeWa(); abrirChat(null, 'cauchera'); }]
      ]);
    });
  }
}

function askName() {
  opts([['Jesús', () => {
    push('out', 'Jesús'); ctx.nombre = 'Jesús';
    bot(['Un placer, Jesús.\n¿En qué zona estás?'], () => {
      opts([['Mandar mi ubicación', () => { push('out', 'Ubicación compartida'); ctx.zona = 'Chacao'; urgencia(); }],
            ['Chacao', () => { push('out', 'Chacao'); ctx.zona = 'Chacao'; urgencia(); }],
            ['Los Chaguaramos', () => { push('out', 'Los Chaguaramos'); ctx.zona = 'Los Chaguaramos'; urgencia(); }]]);
    });
  }]]);
}

function urgencia() {
  bot(['¿Para cuándo los necesitas?'], () => {
    opts([['Hoy o mañana', () => urg('caliente')],
          ['Esta semana', () => urg('tibio')],
          ['Estoy averiguando', () => urg('frio')]]);
  });
}

function urg(u) {
  push('out', u === 'caliente' ? 'Hoy o mañana' : u === 'tibio' ? 'Esta semana' : 'Estoy averiguando');
  const pedido = ctx.pedido;

  if (u === 'frio') {
    const med = pedido && pedido.lineas.length ? pedido.lineas[0].producto.medida : 'tu medida';
    bot([`Dale, sin apuro.\n\nTe dejo anotado que estás viendo ${med} para avisarte si baja de precio o si entra algo bueno.\n\nY si te decides, escríbeme y en 5 minutos te digo dónde montarlos.`], () => {
      note('En el modelo real este lead NO genera orden ni reserva producto: entra a nutrición. Así se evita bloquear inventario y consumir la atención de una cauchera con alguien que todavía no va a comprar.');
    });
    return;
  }

  const v = viasHoy();
  bot([`Listo ${ctx.nombre}. Esto es lo que llevas:\n\n${resumenPedido(pedido)}\n\n` +
       `• Total ${money2(pedido.total)}${refBs(pedido.total)}\n• Montaje y balanceo incluidos\n\nDéjame ver dónde te lo montamos.`], () => {
    const c = CAU[0];
    ctx.cau = c;
    const cuando = v.tipo === 'habil'  ? '• Hoy desde las 3:00 pm o mañana en la mañana'
                 : v.tipo === 'sabado' ? '• Hoy hasta la 1:00 pm, con el inventario que ya está en su local'
                 :                       '• El próximo día hábil: tú eliges cuál';
    bot([`Te los montan en:\n\n• **${c.n}**\n• ${c.dir}\n${cuando}\n\n¿Te sirve?`], () => {
      const o = [];
      if (v.cauchera) o.push(['Sí, ahí mismo', () => { push('out', 'Sí, ahí mismo'); ctx.entrega = 'cauchera'; ctx.fecha = null; cobro(); }]);
      o.push(['Prefiero otro día', () => { push('out', 'Prefiero otro día'); ctx.entrega = 'cauchera'; agendar('cauchera'); }]);
      o.push(['No puedo ir a una cauchera', () => { push('out', 'No puedo ir a una cauchera'); entrega(); }]);
      opts(o);
      if (v.tipo === 'sabado') notaInline('Sábado: VENEGE no despacha. La venta solo se puede cerrar con el stock que ya está adelantado en la cauchera aliada. Por eso la decisión de colocar inventario en consignación no es logística, es lo que abre o cierra el mejor día de venta de la semana.');
      if (v.tipo === 'domingo') notaInline('Domingo: no abre ni VENEGE ni la cauchera. El sitio sigue vendiendo y cobrando, pero la entrega se agenda. En el modelo real la orden entra al CRM con fecha comprometida y la cauchera la recibe el lunes a primera hora.');
    });
  });
}

/* Calendario: el cliente escoge el día de entrega o de montaje. */
function agendar(via) {
  const fechas = proximasFechas(via, 4);
  bot([via === 'cauchera' ? 'Dale. ¿Qué día te viene bien para montarlos?'
                          : 'Sin problema. ¿Qué día te los mandamos?'], () => {
    opts(fechas.map(f => [etiquetaFecha(f, true), () => {
      ctx.fecha = etiquetaFecha(f, true).toLowerCase();
      push('out', etiquetaFecha(f, true));
      cobro();
    }]));
  });
}

/* Entrega alternativa: delivery o pickup. */
function entrega() {
  const v = viasHoy();
  if (!v.delivery && !v.pickup) {
    const dia = v.tipo === 'sabado' ? 'Los sábados' : 'Los domingos';
    bot([`${dia} nuestro almacén no despacha, así que hoy no puedo mandarte delivery ni tenerte los cauchos en el punto VIP.\n\nTe puedo hacer dos cosas:`], () => {
      opts([
        ['Programar delivery', () => {
          push('out', 'Programar delivery'); ctx.entrega = 'delivery';
          bot(['Perfecto. ¿A qué dirección te los llevo?'], () => {
            opts([['Av. Principal, Chacao', () => { push('out', 'Av. Principal, Chacao'); ctx.dir = 'Av. Principal, Chacao'; agendar('delivery'); }]]);
          });
        }],
        ['Montar en la cauchera', () => {
          push('out', 'Montar en la cauchera'); ctx.entrega = 'cauchera';
          viasHoy().cauchera ? cobro() : agendar('cauchera');
        }]
      ]);
      notaInline('Aquí el sitio no pierde la venta por un tema de horario: cobra igual y compromete una fecha. Lo que no puede hacer nunca es prometer una entrega que la operación no va a poder cumplir.');
    });
    return;
  }
  bot(['Sin problema, tenemos otras dos formas:\n\n• **Delivery gratis** — te los llevamos a donde estés en Caracas.\n• **Retiro en punto VIP** — pasas cuando quieras y los recoges.\n\nOjo con una cosa, para que decidas bien: por estas dos vías **el montaje y el balanceo no van incluidos**, porque los hace la cauchera. ¿Cuál prefieres?'], () => {
    opts([
      ['Delivery gratis', () => {
        push('out', 'Delivery gratis'); ctx.entrega = 'delivery';
        bot(['Perfecto. ¿A qué dirección te los llevo?'], () => {
          opts([['Av. Principal, Chacao', () => { push('out', 'Av. Principal, Chacao'); ctx.dir = 'Av. Principal, Chacao'; cobro(); }]]);
        });
      }],
      ['Retiro en punto VIP', () => { push('out', 'Retiro en punto VIP'); ctx.entrega = 'pickup'; cobro(); }],
      ['Mejor sí voy a la cauchera', () => { push('out', 'Mejor voy a la cauchera'); ctx.entrega = 'cauchera'; cobro(); }]
    ]);
  });
}

/* MOMENTO 2 — cobro */
function cobro() {
  const total = ctx.pedido.total;
  const linea = ctx.entrega === 'delivery' ? '• Delivery gratis a tu dirección\n• Montaje no incluido'
              : ctx.entrega === 'pickup'   ? '• Retiras en el punto VIP\n• Montaje no incluido'
              :                              '• Montaje y balanceo incluidos';
  const cuando = ctx.fecha ? `\n• Entrega: ${ctx.fecha}` : '';
  bot([`Perfecto. Te confirmo:\n\n• Total a pagar: **${money2(total)}**${refBs(total)}\n${linea}${cuando}\n• Te emitimos factura\n• Este precio te lo respeto por las próximas horas\n\n¿Cómo prefieres pagar?`], () => {
    opts([['Pago móvil', () => datosPago('Pago móvil')],
          ['Transferencia', () => datosPago('Transferencia')],
          ['Otra forma', () => datosPago('Otra forma')]]);
  });
}

function datosPago(metodo) {
  push('out', metodo);
  bot([`Dale. Te paso los datos para ${metodo.toLowerCase()}:\n\n[ datos de pago de VENEGE ]\n\nEl cobro es en dólares; el monto en bolívares es solo referencia a tasa BCV del día.\n\nCuando pagues, mándame el comprobante por aquí mismo y te confirmo de una.`], () => {
    opts([['Enviar comprobante', () => {
      push('out', 'comprobante_pago.jpg');
      bot(['¡Recibido! Dame un momentico que lo verifico.'], () => { setTimeout(ordenConfirmada, 900); });
    }], ['Todavía no puedo pagar', () => {
      bot([`Sin problema. Te dejo la orden apartada y el precio te lo respeto por las próximas horas.\n\nTe escribo más tarde por si te decides.`], () => {
        note('En el modelo real esta oportunidad queda en la etapa "Esperando pago" del CRM, con seguimiento automático a las 2h y 24h. Es la etapa donde más se cae la venta y donde más rinde intervenir.');
      });
    }]]);
  });
}

/* MOMENTO 3 — orden confirmada */
function ordenConfirmada() {
  const pedido = ctx.pedido;
  const c = ctx.cau || CAU[0];
  const cuando = ctx.fecha ? ctx.fecha.charAt(0).toUpperCase() + ctx.fecha.slice(1) : 'Hoy desde las 3:00 pm';
  let bloque, nota;

  if (ctx.entrega === 'delivery') {
    bloque = `• **Delivery gratis**\n• ${ctx.dir || 'tu dirección'}\n• ${cuando}\n\nCuando llegue el motorizado, das tu código **VIP-2608-0417**.\n\nSi después quieres montarlos, te consigo cita en la cauchera aliada.`;
    nota = 'Esta orden NO pasa por la cauchera aliada: nadie de la red cobra por ella. En el modelo real esta vía existe solo cuando el cliente la pide, nunca se ofrece de primera, y su porcentaje sobre el total se mide y se reporta al Consejo de Aliados.';
  } else if (ctx.entrega === 'pickup') {
    bloque = `• **Retiro en punto VIP**\n• [dirección del punto]\n• ${cuando}\n• Lunes a viernes 8:00 am – 5:00 pm\n\nCuando pases, das tu código **VIP-2608-0417**.\n\nSi después quieres montarlos, te consigo cita en la cauchera aliada.`;
    nota = 'Igual que el delivery: esta orden no genera ingreso para la red. En el modelo real se mide como "órdenes sin cauchera" y tiene un umbral de alerta.';
  } else {
    bloque = `• Montas en: **${c.n}**\n• ${c.dir}\n• ${cuando}\n• ${c.hor}\n\nCuando llegues, das tu código **VIP-2608-0417**. Ellos ya tienen tus cauchos apartados.`;
    nota = 'En este punto el modelo real ya hizo cuatro cosas: verificó el pago, emitió la factura, generó la orden con su código, y se la ofreció a la cauchera por WhatsApp con botones ACEPTAR / NO PUEDO — incluyendo cuánto va a cobrar ella por atenderla.';
  }

  bot([`¡Listo ${ctx.nombre}! ✅ Compra confirmada.\n\n• **Orden VIP-2608-0417**\n${resumenPedido(pedido)}\n• Pagado: ${money2(pedido.total)}${refBs(pedido.total)}\n\n${bloque}\n\nTu factura te llega en un momento. Cualquier cosa, aquí estoy.`], () => {
    VIP.carrito.vaciar();
    note(nota);
  });
}

/* ------------------------------------------------------- pintado del chat */
function push(k, t) {
  const d = document.createElement('div');
  d.className = 'msg ' + k;
  d.innerHTML = t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    + `<span class="tm">${nowT()}</span>`;
  $('chat').appendChild(d); scrollChat();
}
function nowT(){ const d = new Date(); return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'); }
function scrollChat(){ const c = $('chat'); c.scrollTop = c.scrollHeight; }

function bot(msgs, done) {
  $('pfoot').innerHTML = '';
  const t = document.createElement('div'); t.className = 'typing'; t.innerHTML = '<i></i><i></i><i></i>';
  $('chat').appendChild(t); scrollChat();
  setTimeout(() => { t.remove(); msgs.forEach(m => push('in', m)); if (done) done(); }, 750);
}
function opts(list) {
  $('pfoot').innerHTML = '';
  list.forEach(([label, fn]) => {
    const b = document.createElement('button'); b.className = 'qr'; b.textContent = label;
    b.onclick = () => { $('pfoot').innerHTML = ''; fn(); };
    $('pfoot').appendChild(b);
  });
  const n = document.createElement('div'); n.className = 'note'; n.textContent = 'Simulación — toca una opción';
  $('pfoot').appendChild(n);
}
/** Nota explicativa que NO borra las opciones activas (uso a mitad de flujo). */
function notaInline(txt) {
  const n = document.createElement('div'); n.className = 'note';
  n.style.cssText = 'text-align:left;line-height:1.45;padding:8px 4px';
  n.textContent = txt; $('pfoot').appendChild(n);
}
function note(txt) {
  $('pfoot').innerHTML = `<div class="note" style="text-align:left;line-height:1.45;padding:8px 4px">${txt}</div>`;
  const b = document.createElement('button'); b.className = 'qr'; b.textContent = 'Empezar de nuevo';
  b.onclick = () => wa(); $('pfoot').appendChild(b);
  const c = document.createElement('button'); c.className = 'qr'; c.textContent = 'Cerrar';
  c.onclick = closeWa; $('pfoot').appendChild(c);
}
function closeWa(){ $('ov').classList.remove('open'); }
