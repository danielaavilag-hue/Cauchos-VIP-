/* ============================================================
 Cauchos VIP — Andrea — asistente de IA (prototipo por palabras clave)
 ============================================================ */

/* =====================================================================
 ANDREA — asistente de IA de VIP
 Prototipo: guion de demostración con reconocimiento por palabras clave.
 En producción es un LLM conectado al catálogo, al inventario y al CRM.
 ===================================================================== */
let an = { open:false, ctx:{} };

function andrea(intent){
 $('anOv').classList.add('open');
 an.open = true;
 if($('anBody').childElementCount === 0){
 anSay('Hola, soy **Andrea**, la asistente de Cauchos VIP.\n\nTe ayudo a conseguir los cauchos que necesitas, te digo el precio y te consigo dónde montarlos hoy mismo en Caracas.', ()=>{
 if(intent === 'medida'){ anMedida(); }
 else if(intent === 'buscar'){ anSay('Dime qué medida buscas y te digo si la tengo o cuál equivalente te sirve.', ()=>anChips(anBase())); }
 else if(intent === 'prod' && VIP.ui.ficha.actual()){
 const cur = VIP.ui.ficha.actual();
 anSay(`Veo que estás viendo el **${cur.titulo}** en ${cur.medida}, a ${VIP.ui.dinero(cur.precio)} por caucho con montaje incluido.\n\n¿Te ayudo con algo de este caucho?`, ()=>anChips([
 ['¿Sirve para mi carro?', ()=>anAsk('¿Sirve para mi carro?')],
 ['¿Hay algo más económico?', ()=>anAsk('¿Hay algo más económico?')],
 ['Lo quiero comprar', ()=>{anClose(); wa('prod');}]
 ]));
 }
 else { anChips(anBase()); }
 });
 } else {
 if(intent === 'medida') anMedida();
 }
 setTimeout(()=>{ const i=$('anInput'); if(window.innerWidth>760) i.focus(); }, 250);
}
function anClose(){ $('anOv').classList.remove('open'); an.open=false; }

function anBase(){
 return [
 ['No sé mi medida', ()=>anAsk('No sé mi medida')],
 ['Ya sé mi medida', ()=>anAsk('Ya sé mi medida')],
 ['¿Cómo funciona?', ()=>anAsk('¿Cómo funciona?')],
 ['¿Dónde monto?', ()=>anAsk('¿Dónde monto?')]
 ];
}

function anPush(kind, html){
 const d = document.createElement('div');
 d.className = 'anMsg ' + kind;
 d.innerHTML = html.replace(/&/g,'&amp;').replace(/</g,'&lt;')
.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>')
.replace(/\*(.+?)\*/g,'<i>$1</i>')
.replace(/\[\[(.+?)\]\]/g,'<span class="sz">$1</span>');
 $('anBody').appendChild(d);
 $('anBody').scrollTop = $('anBody').scrollHeight;
}
function anSay(txt, done){
 $('anChips').innerHTML = '';
 const t = document.createElement('div');
 t.className = 'anTyping'; t.innerHTML = '<i></i><i></i><i></i>';
 $('anBody').appendChild(t); $('anBody').scrollTop = $('anBody').scrollHeight;
 setTimeout(()=>{ t.remove(); anPush('a', txt); if(done) done(); }, 650);
}
function anChips(list){
 $('anChips').innerHTML = '';
 list.forEach(([label, fn, cls])=>{
 const b = document.createElement('button');
 b.className = 'anChip' + (cls? ' ' + cls: '');
 b.textContent = label;
 b.onclick = ()=>{ $('anChips').innerHTML=''; fn(); };
 $('anChips').appendChild(b);
 });
}
function anCards(items, after){
 const wrap = document.createElement('div');
 wrap.className = 'anCards';
 items.forEach(pr=>{
 const b = document.createElement('button');
 b.className = 'anCard';
 b.innerHTML = `<span class="pi"><img src="${pr.imagenUrl}" alt="" onerror="this.style.visibility='hidden'"></span>
 <span><b>${pr.titulo}</b><span>${pr.medida} · ${pr.estadoStockEtiqueta}</span></span>
 <span class="pr">${VIP.ui.dinero(pr.precio)}</span>`;
 b.onclick = ()=>{ anClose(); abrirProducto(pr.sku); };
 wrap.appendChild(b);
 });
 $('anBody').appendChild(wrap);
 $('anBody').scrollTop = $('anBody').scrollHeight;
 if(after) after();
}

function anSend(){
 const v = $('anInput').value.trim();
 if(!v) return;
 $('anInput').value = '';
 anAsk(v);
}
function anAsk(txt){
 anPush('u', txt);
 setTimeout(()=>anAnswer(txt.toLowerCase()), 120);
}

/* ---- motor de respuestas (demo) ---- */
function anAnswer(q){
 const has = (...ws)=>ws.some(w=>q.includes(w));

 // medida escrita directamente
 const m = q.replace(/\s/g,'').match(/(\d{3})[\/\-]?(\d{2})[\/\-]?r?(\d{2})/);
 if(m){
 const size = `${m[1]}/${m[2]}R${m[3]}`;
 VIP.catalogo.porMedida(size).then(found=>{
 if(found.length){
 an.ctx.size = size;
 anSay(`Perfecto, [[${size}]] la tengo ✅\n\nEstas son tus opciones, todas con montaje y balanceo incluidos:`, ()=>{
 anCards(found.slice(0,3), ()=>anChips([
 ['Ver todas en el catálogo', ()=>{anClose(); abrirCatalogo({medida:size});}],
 ['¿Cuál me recomiendas?', ()=>anAsk('¿Cuál me recomiendas?')],
 ['Seguir por WhatsApp', ()=>{anClose(); wa();}, 'go']
 ]));
 });
 } else {
 anSay(`Esa medida no la tengo montada ahorita, pero te consigo equivalentes que le sirven a tu carro.\n\n¿Me dices qué carro tienes para verificarlo bien?`, ()=>anChips(anBase()));
 }
 });
 return;
 }

  // vehículo mencionado
  for(const mk of Object.keys(VEH)){
    for(const mo of Object.keys(VEH[mk])){
      if(mo.length < 3) continue;
      if(!q.includes(mo.toLowerCase())) continue;
      const years = annosDe(mk, mo);
      const yMatch = years.map(String).find(y => q.includes(y));
      if(yMatch){
        const size = medidaDe(mk, mo, yMatch);
        an.ctx.veh = `${mk} ${mo} ${yMatch}`;
        if(!size){
          anSay(`Ya tengo tu **${mk} ${mo} ${yMatch}** anotado.\n\nEsa medida de fábrica todavía no la tengo publicada, y prefiero no decirte una al azar: si te mando la medida equivocada, pierdes el viaje. Déjame verificarla con el equipo y te la confirmo por WhatsApp en unos minutos.`, ()=>anChips([
            ['Confírmamela por WhatsApp', ()=>{anClose(); wa();}, 'go'],
            ['Mejor te mando una foto del caucho', ()=>anAsk('foto')],
            ['Ya sé mi medida', ()=>anAsk('ya sé mi medida')]
          ]));
          return;
        }
        an.ctx.size = size;
        VIP.catalogo.porMedida(size).then(found=>{
        anSay(`Tu **${mk} ${mo} ${yMatch}** usa [[${size}]] de fábrica.` +
          (found.length ? `\n\nEstas son las opciones que tengo en esa medida:` : `\n\nEsa medida no la tengo ahorita, pero te consigo una equivalente. ¿Te escribo cuando entre?`), ()=>{
          if(found.length) anCards(found.slice(0,3), ()=>anChips([
            ['¿Cuál me recomiendas?', ()=>anAsk('¿Cuál me recomiendas?')],
            ['Ver todas', ()=>{anClose(); abrirCatalogo({medida:size});}],
            ['Seguir por WhatsApp', ()=>{anClose(); wa();}, 'go']
          ]));
          else anChips(anBase());
        });
        });
      } else {
        anSay(`El **${mk} ${mo}** vino en varios años y la medida cambia. ¿De qué año es el tuyo?`, ()=>{
          anChips(years.slice(0,8).map(y=>[String(y), ()=>anAsk(`${mo} ${y}`)]));
        });
      }
      return;
    }
  }

 if(has('no sé mi medida','no se mi medida','no sé cuál','no se cual','qué medida','que medida','cuál es mi medida')){
 anMedida(); return;
 }
 if(has('ya sé mi medida','ya se mi medida')){
 anSay('Dale. Escríbemela como aparece en el caucho.\n\nPor ejemplo: **195/60R15**', ()=>anChips([
 ['195/60R15', ()=>anAsk('195/60R15')],
 ['265/65R17', ()=>anAsk('265/65R17')],
 ['205/55R16', ()=>anAsk('205/55R16')]
 ]));
 return;
 }
 if(has('foto')){
 anSay('Mándame una foto del lado del caucho, donde se ven los números\n\nYo te leo la medida y te digo qué opciones tengo.', ()=>anChips([
 ['Enviar foto', ()=>{
 anPush('u','foto_caucho.jpg');
 anSay('Déjame verla un momento.', ()=>{
 setTimeout(()=>anAsk('195/60R15'), 700);
 });
 }],
 ['Mejor por mi carro', ()=>anMedida()]
 ]));
 return;
 }
 if(has('recomiend','cuál me conviene','cual me conviene','mejor opción','cuál es mejor','cual es mejor','diferencia')){
 anSay('Depende de para qué lo usas más. Te lo pongo simple:\n\n• **Si andas casi todo en ciudad** y quieres gastar menos → la gama económica te rinde bien.\n• **Si haces carretera o manejas bajo lluvia** → vale la pena la gama media o premium: agarran mejor en mojado y duran más.\n• **Si te metes en trocha** → necesitas un todoterreno, no un caucho de ciudad.\n\n¿Cómo usas tú el carro?', ()=>anChips([
 ['Casi todo ciudad', ()=>anRec('Ciudad')],
 ['Carretera', ()=>anRec('Carretera')],
 ['Trocha / 4x4', ()=>anRec('Trocha')]
 ]));
 return;
 }
 if(has('sirve para mi carro','me sirve','compatible','le queda')){
 anSay('Dime marca, modelo y año de tu carro y lo verifico al momento.\n\nPor ejemplo: *Toyota Corolla 2018*', ()=>anChips([
 ['Toyota Corolla 2018', ()=>anAsk('Corolla 2018')],
 ['Toyota Fortuner 2019', ()=>anAsk('Fortuner 2019')],
 ['Chevrolet Aveo 2017', ()=>anAsk('Aveo 2017')]
 ]));
 return;
 }
 if(has('cómo funciona','como funciona','cómo es','como compro','proceso')){
 anSay('Es sencillo, son cuatro pasos:\n\n**1.** Escoges tus cauchos aquí y ves el precio real.\n**2.** Te digo en qué cauchera aliada los montas y a qué hora.\n**3.** Pagas por WhatsApp, por el medio que prefieras. Te emitimos factura.\n**4.** Vas con tu código, te los montan y te los balancean. **No pagas nada adicional allá.**', ()=>anChips([
 ['¿Y si pago y no me llegan?', ()=>anAsk('¿Y si pago y no me llegan?')],
 ['Ver cómo funciona', ()=>{anClose(); go('como');}],
 ['Buscar mis cauchos', ()=>anMedida()]
 ]));
 return;
 }
 if(has('pago y no','estafa','confianza','seguro','y si no me llegan','devuelv','reembols')){
 anSay('Es una duda muy válida y te la respondo de frente.\n\n• Te digo **el nombre y la dirección de la cauchera** donde vas a montar **antes** de que pagues nada.\n• Te emitimos **factura** y te damos el número de tu orden al momento.\n• Somos **VENEGE**, distribuidor autorizado, con oficinas y RIF.\n• Y si por lo que sea no podemos cumplir, **te devolvemos tu dinero**.', ()=>anChips([
 ['Ver la cauchera aliada', ()=>{anClose(); go('red');}],
 ['Listo, quiero comprar', ()=>{anClose(); wa();}, 'go']
 ]));
 return;
 }
 if(has('pago','pagar','transferen','zelle','efectivo','cuotas','financia')){
 anSay('Nos pagas a nosotros por WhatsApp antes de ir a montar, por el medio que te quede más cómodo. Te emitimos factura y te doy tu código de orden al momento.\n\nCuando llegues a la cauchera **no pagas nada más**: el montaje y el balanceo ya van incluidos.', ()=>anChips([
 ['¿Qué medios aceptan?', ()=>anSay('En el piloto trabajamos con los medios más usados en Caracas. El equipo te pasa los datos exactos en el momento del cierre.\n\n*(En el prototipo esta lista es de ejemplo — la define VENEGE.)*', ()=>anChips(anBase()))],
 ['Quiero comprar', ()=>{anClose(); wa();}, 'go']
 ]));
 return;
 }
 if(has('delivery','envío','envio','me lo llevan','a domicilio','pickup','retirar','retiro','buscar yo','no puedo ir')){
 anSay('Claro que sí. Tienes tres formas de recibirlos:\n\n• **Montar en cauchera aliada** — montaje y balanceo incluidos, el mismo día. Es la que te recomiendo.\n• **Delivery gratis** — te los llevamos a donde estés en Caracas.\n• **Retiro en punto VIP** — pasas y los recoges.\n\nEn el delivery y el retiro **el montaje no va incluido**, porque lo hace la cauchera. Te lo digo para que decidas con todo claro.', ()=>anChips([
 ['Buscar mis cauchos', ()=>anMedida()],
 ['¿Dónde está el punto VIP?', ()=>anSay('El punto VIP queda en Caracas. Te paso la dirección exacta y el horario cuando cierres tu compra.\n\n*(En el prototipo la dirección es de ejemplo — la define VENEGE.)*', ()=>anChips(anBase()))]
 ]));
 return;
 }
 if(has('dónde monto','donde monto','cauchera','taller','instal','montaje','balanceo')){
 anSay('En el plan piloto el montaje lo hace **' + CAU[0].n + '**, en ' + CAU[0].z + '. Te digo el nombre, la dirección y la hora antes de que pagues, nunca después.\n\nLa red se va abriendo por zonas. ¿En cuál estás tú?', ()=>anChips([
 ['Chacao', ()=>anZona('Chacao')],
 ['La Trinidad', ()=>anZona('La Trinidad')],
 ['Baruta', ()=>anZona('Baruta')],
 ['Ver todas', ()=>{anClose(); go('red');}]
 ]));
 return;
 }
 if(has('precio','cuánto cuesta','cuanto cuesta','cuánto sale','barato','económic','oferta','descuento')){
 anSay('Los precios están publicados en la página, en dólares, y **ya incluyen montaje y balanceo**. Es el mismo precio de calle: ni más caro por comprar online, ni más barato que las caucheras.\n\nDime tu medida o tu carro y te digo exactamente cuánto te sale.', ()=>anChips(anBase()));
 return;
 }
 if(has('garantía','garantia','original','falso','pirata')){
 anSay('Todos los cauchos son **originales, nuevos y sellados**, con garantía de fábrica. Vienen de VENEGE, que es distribuidor autorizado.\n\nSi alguna vez tienes un problema, escribes con tu código de orden y nosotros lo canalizamos — no te dejamos solo con la cauchera.', ()=>anChips(anBase()));
 return;
 }
 if(has('cuánto tarda','cuanto tarda','cuándo','cuando me','hoy','rápido','demora','entrega')){
 anSay('Si tu medida está disponible en tu zona, **montas hoy mismo o mañana temprano**. Te digo la hora exacta antes de que pagues, no después.\n\nLas medidas de mayor rotación las mantenemos adelantadas en la cauchera aliada, y por eso los sábados también se puede montar.', ()=>anChips(anBase()));
 return;
 }
 if(has('tengo una cauchera','soy cauchera','aliado','unirme','mayorista','vender')){
 anSay('¿Tienes una cauchera?\n\nCon la Red VIP recibes clientes que **ya compraron y ya pagaron**. Nosotros te mandamos el caucho y el cliente; tú lo montas y cobras tu porcentaje. **Sin comprar inventario.**', ()=>anChips([
 ['Quiero información', ()=>{anClose(); go('red');}],
 ['No, soy cliente', ()=>anChips(anBase())]
 ]));
 return;
 }
 if(has('hola','buenas','buenos días','buenas tardes','épale','epale','saludos')){
 anSay('¿En qué te ayudo?', ()=>anChips(anBase()));
 return;
 }
 if(has('gracias','listo','ok','perfecto','dale')){
 anSay('¡A la orden! Aquí estoy si necesitas algo más.', ()=>anChips(anBase()));
 return;
 }
 // fallback honesto
 anSay('Esa no te la sé responder bien, y prefiero no inventarte nada.\n\nTe paso con una persona del equipo por WhatsApp, o dime qué medida o qué carro tienes y arrancamos por ahí.', ()=>anChips([
 ['Hablar con una persona', ()=>{anClose(); wa();}, 'go'],
 ['No sé mi medida', ()=>anMedida()],
 ['Ya sé mi medida', ()=>anAsk('Ya sé mi medida')]
 ]));
}

function anMedida(){
 anSay('Tranquilo, eso lo resolvemos rapidito.\n\n¿Cómo prefieres?', ()=>anChips([
 ['Te digo qué carro tengo', ()=>anSay('Dale, dime marca, modelo y año.\n\nPor ejemplo: *Toyota Corolla 2018*', ()=>anChips([
 ['Toyota Corolla 2018', ()=>anAsk('Corolla 2018')],
 ['Toyota Fortuner 2019', ()=>anAsk('Fortuner 2019')],
 ['Ford Fiesta 2018', ()=>anAsk('Fiesta 2018')],
 ['Otro', ()=>anSay('Escríbeme cuál es —marca, modelo y año— y lo busco.\n\nSi no lo consigo, te lo verifico con una foto del caucho.', ()=>anChips([
 ['Mejor te mando foto', ()=>anAsk('Te mando una foto')]
 ]))]
 ]))],
 ['Te mando una foto', ()=>anAsk('Te mando una foto')],
 ['¿Dónde veo la medida?', ()=>anSay('Está escrita en **el lado del caucho**, en números tipo [[195/60R15]].\n\n• **195** es el ancho en milímetros\n• **60** es el perfil, la altura\n• **15** es el rin, en pulgadas\n\nCon esos tres números ya te consigo lo que necesitas.', ()=>anChips([
 ['Ya la vi, es 195/60R15', ()=>anAsk('195/60R15')],
 ['Mejor te mando foto', ()=>anAsk('Te mando una foto')]
 ]))]
 ]));
}
async function anRec(uso){
 anPush('u', uso);
 const r = await VIP.catalogo.listar({uso:[uso], soloDisponibles:true, porPagina:3});
 const found = r.items;
 anSay(`Para ${uso.toLowerCase()} te recomiendo estas:`, ()=>{
 anCards(found, ()=>anChips([
 ['Ver todo el catálogo', ()=>{anClose(); abrirCatalogo({uso:uso});}],
 ['Seguir por WhatsApp', ()=>{anClose(); wa();}, 'go']
 ]));
 });
}
function anZona(z){
 anPush('u', z);
 const c = CAU[0];
 anSay(`En el plan piloto el montaje lo hace **${c.n}** — ${c.dir}.\n\n${z && z!=='Los Chaguaramos' ? 'Queda a unos minutos de '+z+'. ' : ''}Si prefieres no ir hasta allá, también tenemos delivery gratis o retiro en punto VIP, de lunes a viernes.`, ()=>anChips([
 ['Buscar mis cauchos', ()=>anMedida()],
 ['Ver todas las caucheras', ()=>{anClose(); go('red');}]
 ]));
}


/** Recibe el vehículo que el cliente eligió en el buscador y sigue desde ahí. */
function anVeh(v){
  const size = medidaDe(v.m, v.mo, v.a);
  an.ctx.veh = `${v.m} ${v.mo} ${v.a}`;
  anPush('u', `Tengo un ${v.m} ${v.mo} ${v.a}`);
  if(size){
    an.ctx.size = size;
    setTimeout(()=>anAsk(`${v.mo} ${v.a}`), 400);
    return;
  }
  setTimeout(()=>anSay(
    `Listo, ya tengo tu **${v.m} ${v.mo} ${v.a}**.\n\nLa medida de fábrica de ese modelo todavía no la tengo publicada y no te la voy a inventar: si te mando la equivocada, pierdes el viaje. Te la confirmo con el equipo.\n\n¿Cómo prefieres que sigamos?`,
    ()=>anChips([
      ['Confírmamela por WhatsApp', ()=>{anClose(); wa();}, 'go'],
      ['Te mando una foto del caucho', ()=>anAsk('foto')],
      ['Ya sé mi medida', ()=>anAsk('ya sé mi medida')]
    ])), 500);
}
if(typeof window !== 'undefined') window.anVeh = anVeh;
