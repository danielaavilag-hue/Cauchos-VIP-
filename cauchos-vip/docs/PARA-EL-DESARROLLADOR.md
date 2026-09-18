# Brief técnico — Cauchos VIP

Documento para entregar al proveedor o al equipo de desarrollo junto con esta carpeta.
Se puede copiar y pegar tal cual en un correo o en una licitación.

---

## Qué se entrega

Un prototipo navegable, funcional y responsive del e-commerce de Cauchos VIP: cinco páginas,
flujo de compra completo, asistente conversacional y simulador de WhatsApp. Está construido en
HTML, CSS y JavaScript plano, sin build.

**El prototipo es la especificación.** No es el código base del sitio de producción. Se entrega
para que el desarrollador vea exactamente qué comportamiento se espera, no para que lo amplíe.

---

## Qué se pide construir

Un e-commerce B2C que:

1. Vende cauchos a cliente final en Caracas, a precio de calle (Lista 1), en dólares.
2. **Cobra en la plataforma.** VIP factura. El cliente paga antes del montaje.
3. Asigna cada orden a una **Cauchera Aliada** que hace el montaje y el balanceo y recibe un
   porcentaje **k** sobre el precio de venta, sin comprar inventario.
4. Ofrece dos vías alternativas cuando el cliente no quiere ir a la cauchera: **delivery gratis**
   en Caracas o **retiro en punto VIP**. En ambas, el montaje **no** va incluido.
5. Usa WhatsApp como canal central de acompañamiento, no como formulario de contacto.

---

## Stack recomendado

| Capa | Herramienta | Por qué |
|---|---|---|
| E-commerce | WordPress + WooCommerce | Operable desde Venezuela, hay talento local, costo bajo |
| CRM | Kommo | Integración nativa con WhatsApp, pipeline visual, precio razonable |
| WhatsApp | WhatsApp Business Platform (API) vía BSP | WhatsApp Business App **no** sirve: no escala ni se integra |
| Automatización | n8n o Make | Ruteo de leads, SLA, escalamiento |
| Medición | GTM + GA4 + Meta Pixel/CAPI + Google Ads | Conversiones offline con valor real |
| Tableros | Looker Studio + Google Sheets | Sin licencias adicionales |

No se pide una aplicación a medida. Si el proveedor propone construir el e-commerce desde cero
en React/Next sin razón fuerte, es una señal de alarma: multiplica el costo y el tiempo sin
beneficio para este caso.

---

## Alcance funcional mínimo (Fase 1)

**Catálogo y búsqueda**
- Búsqueda por medida con normalizador tolerante (ver `normSize()` en `js/app.js`)
- Búsqueda por vehículo: marca → modelo → año → medida
- Filtros: tipo, marca, gama, uso, disponibilidad
- Ficha de producto con disponibilidad real y barras de desempeño

**Compra**
- Carrito y checkout con pago en línea y/o pago reportado con comprobante
- Selección de vía de entrega, con la cauchera aliada siempre primero
- Confirmación con código de orden formato `VIP-AAMM-secuencial`

**Asignación**
- Ruteo automático de la orden a una cauchera: filtros duros (zona, stock, activa) y luego
  puntaje ponderado (proximidad, producto en stock, desempeño histórico, equidad,
  especialización, disponibilidad)
- Cascada con SLA: si la cauchera no acepta en X minutos, pasa a la siguiente
- El cliente puede sobrescribir la asignación y elegir otra cauchera

**WhatsApp**
- Plantillas aprobadas por Meta para: confirmación de orden, asignación de cauchera,
  recordatorio de montaje, recuperación de carrito
- Bandeja compartida conectada al CRM

**Medición**
- Cada orden pagada conserva su origen (UTM, gclid, fbclid) desde la primera visita
- Conversiones offline subidas a Meta CAPI y Google Ads con el valor real de la orden

**Panel de cauchera**
- Ver órdenes asignadas, aceptar/rechazar, marcar montaje realizado, ver liquidación

---

## Lo que NO se puede negociar en la implementación

Estas reglas sostienen el modelo de negocio. Si se rompen, el proyecto repite el fracaso anterior.

1. **Una sola lista de precio pública.** No hay precio distinto por canal, ni descuentos que
   dejen a VIP por debajo de lo que una cauchera puede ofrecer.
2. **La cauchera aliada se ofrece siempre primero** en el selector de entrega, con montaje
   incluido. Delivery y pickup aparecen debajo, con la advertencia de que no incluyen montaje.
3. **El sistema debe medir y reportar el % de órdenes sin cauchera.** Es el indicador de salud
   de la relación con la red.
4. **Andrea nunca cita precio, stock ni compatibilidad de memoria.** Siempre consulta.
5. **Andrea nunca gestiona el paso de pago ni valida comprobantes.** Eso lo hace un humano o
   la pasarela.
6. **La orden pagada es la única fuente de verdad para atribución.** No el lead, no el clic.
7. **El cobro es en dólares.** El bolívar es referencia informativa a tasa BCV con su fecha, nunca el monto que se cobra. La tasa se actualiza a diario desde una fuente automática.
8. **Sábado:** el almacén de VENEGE no despacha. El sitio no puede ofrecer delivery ni pickup ese día; sí montaje en la cauchera aliada contra el stock adelantado que tenga en su local. Requiere que el inventario en consignación esté reflejado por separado del almacén central.
9. **Domingo:** no abre nadie. El sitio vende y cobra, pero obliga a escoger fecha de entrega y la orden entra al CRM con fecha comprometida.
10. **La fecha operativa la define el servidor, con hora de Caracas.** Nunca el navegador del cliente.

---

## Criterios de aceptación

El sitio se considera entregado cuando:

- Un cliente que no sabe su medida llega a comprar en menos de 5 pasos, en móvil
- El normalizador de medidas acepta al menos: `195/60R15`, `195 60 15`, `195/60/15`, `1956015`, `195-60-r15`
- Una orden pagada aparece en el CRM en menos de 60 segundos con su origen intacto
- La asignación a cauchera ocurre automáticamente y el SLA de cascada funciona
- Las plantillas de WhatsApp están aprobadas por Meta y se disparan solas
- El tablero muestra órdenes, ticket, tasa de cierre, % sin cauchera y CAC
- El sitio pasa Core Web Vitals en móvil con conexión 3G simulada
- Un sábado, la página no ofrece delivery ni pickup, y un domingo obliga a agendar
- El precio en bolívares cambia solo cuando cambia la tasa, y muestra su fecha
- El panel de cauchera funciona en un teléfono de gama media

---

## Advertencia sobre la ruta crítica

**El sitio web no es el cuello de botella.** Lo son, en este orden:

1. Las decisiones pendientes de VENEGE (el valor de k, la política de instalación, quién factura)
2. El acuerdo legal con las caucheras aliadas
3. Reclutar y capacitar la red inicial
4. La aprobación de las plantillas de Meta, que toma semanas y no depende de nadie aquí
5. El stock adelantado, si se decide colocarlo

Contratar el desarrollo antes de resolver el punto 1 garantiza retrabajo.

El detalle completo — rutas de ejecución, equipo mínimo, cronograma de 12 semanas, presupuesto,
cómo elegir proveedor y qué no se delega — está en `VIP_Plan_de_Produccion.docx`.
