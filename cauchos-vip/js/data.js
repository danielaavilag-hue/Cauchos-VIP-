/* ============================================================
   Cauchos VIP — contenido que todavía no viene de una API
   ------------------------------------------------------------
   Aquí quedan solo dos cosas: las preguntas frecuentes y la
   cauchera aliada del plan piloto.

   El catálogo de productos YA NO vive aquí. Vive en
   data/catalogo.json y se consume por VIP.catalogo. La lista de
   marcas tampoco: se calcula del propio catálogo (facetas), así
   que una marca nueva aparece sola.
   ============================================================ */

/* La base de vehículos vive ahora en js/vehiculos.js */

const FAQ = [
  ['¿Ustedes venden los cauchos o me mandan a otro lado?','Nosotros te vendemos y te facturamos, al precio de calle. El montaje lo hace nuestra cauchera aliada, que ya tiene tus cauchos apartados cuando llegas.'],
  ['¿Me sale más caro comprar por aquí?','No. El precio que ves es el precio de calle, y ya incluye el montaje y el balanceo. Ni más, ni menos.'],
  ['¿El precio incluye la instalación?','Sí: montaje y balanceo incluidos en la cauchera aliada. Cuando llegues allá no pagas nada adicional por eso.'],
  ['¿Cómo pago?','Nos pagas a nosotros por WhatsApp, por el medio que prefieras, antes de ir a montar. Te emitimos factura y te damos tu código de orden al momento.'],
  ['¿Y si pago y no me llegan?','Te damos factura y tu número de orden desde el primer momento, y te decimos el nombre y la dirección de la cauchera donde vas a montar antes de que pagues. Si por alguna razón no podemos cumplir, te devolvemos tu dinero.'],
  ['No sé qué medida usa mi carro.','Tranquilo, es lo más común. Búscala por tu vehículo, mándanos una foto del caucho por WhatsApp, o mira nuestra guía de dónde está la medida.'],
  ['¿En cuánto tiempo me los montan?','Si está disponible en tu zona, el mismo día o al día siguiente. Te decimos la hora exacta antes de que pagues.'],
  ['¿Y si no puedo ir a la cauchera?','Tienes dos opciones: te hacemos delivery gratis en Caracas, o los retiras en nuestro punto VIP cuando te quede cómodo. En esas dos vías el montaje no va incluido, porque lo hace la cauchera. Si después quieres montarlos, te conseguimos cita en la cauchera aliada. Ojo: los sábados no hay delivery ni retiro, porque nuestro almacén no despacha, y los domingos la entrega se programa.'],
  ['¿El delivery tiene costo?','No, el delivery en Caracas es gratis. **[REQUIERE VENEGE: definir si aplica un mínimo de compra y el radio de cobertura.]**'],
  ['¿Cómo escogen la cauchera que me atiende?','Por cercanía a tu zona, si tiene tu medida disponible, su horario y su calificación de servicio. Si prefieres una en particular, dínoslo.'],
  ['¿Los cauchos son originales?','Sí. Todos vienen de VENEGE, distribuidor autorizado. Producto nuevo, sellado y con garantía de fábrica.']
];

/* Plan piloto: una sola Cauchera Aliada.
   [REQUIERE VENEGE] dirección exacta, teléfono, horario confirmado y coordenadas. */
const CAU = [
  { n:'Cauchera Nueva Caracas',
    z:'Los Chaguaramos',
    dir:'Los Chaguaramos, Caracas',
    hor:'Lunes a viernes 8:00 am – 5:00 pm · Sábados 8:00 am – 1:00 pm',
    tel:'' }
];
