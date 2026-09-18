# Cauchos VIP — prototipo del e-commerce B2C

Prototipo navegable de la nueva plataforma de **Cauchos VIP** (unidad de negocio de VENEGE):
un e-commerce B2C que cobra al cliente final a precio de calle (Lista 1) y remunera con un
porcentaje **k** a la Cauchera Aliada que hace el montaje, sin que ésta compre inventario.

> **Frontend completo con datos locales.** El catálogo, la búsqueda, los filtros, la ficha
> y el carrito funcionan de verdad, sobre una capa de servicio diseñada para que una API
> externa reemplace los datos sin tocar la interfaz.
> Los precios, el stock y la cauchera son datos de ejemplo. Todavía no hay pasarela de pago,
> ni CRM, ni WhatsApp real conectado.

---

## 1. Cómo abrirlo

**Opción A — doble clic.** Abre `index.html` en Chrome. Funciona sin servidor.

**Opción B — servidor local** (recomendado, evita advertencias del navegador):

```bash
npx serve .          # o:  python3 -m http.server 3000
```

Luego abre `http://localhost:3000`.

**Opción C — hosting tradicional (cPanel, Plesk, hosting compartido).** Sube la carpeta
completa a `public_html/` por FTP o por el administrador de archivos. **No hace falta Node,
ni build, ni instalar nada**: son HTML, CSS y JavaScript planos. El `.htaccess` incluido ya
resuelve los tipos MIME, la compresión y la caché.

**Opción D — publicarlo en un minuto.** Arrastra la carpeta completa a
[app.netlify.com/drop](https://app.netlify.com/drop). Ya trae `netlify.toml` y `vercel.json`.

> `robots.txt` está en **Disallow** a propósito, para que Google no indexe el prototipo.
> Hay que cambiarlo al publicar el sitio real.

---

## 2. Estructura de archivos

```
cauchos-vip/
├── index.html                     Las 5 páginas + carrito. Solo contenedores, sin datos
│
├── css/
│   └── styles.css                 Todos los estilos. Paleta oficial del brandbook
│
├── js/
│   ├── config.js                  ÚNICO archivo a editar. Aquí está el interruptor local → API
│   │
│   ├── core/
│   │   └── http.js                fetch con timeout y reintento. Sin credenciales
│   │
│   ├── models/
│   │   └── product.model.js       Qué es un producto: normalizar, validar, estados de stock
│   │
│   ├── services/
│   │   ├── catalog.service.js     LA FRONTERA. listar · obtener · buscar · facetas
│   │   ├── cart.service.js        Carrito por SKU
│   │   └── adapters/
│   │       ├── local.adapter.js   data/catalogo.json  (activo)
│   │       └── http.adapter.js    la futura API       (escrito y apagado)
│   │
│   ├── data/
│   │   └── mock-catalogo.js       Copia del catálogo, para que funcione con doble clic
│   │
│   ├── ui/
│   │   ├── product-card.js        Tarjeta de producto (una sola para todo el sitio)
│   │   ├── catalog-view.js        Filtros, búsqueda, orden, grilla
│   │   ├── product-detail.js      Ficha generada desde el objeto de producto
│   │   └── cart-ui.js             Panel del carrito
│   │
│   ├── data.js                    FAQ y cauchera aliada (lo que aún no viene de API)
│   ├── vehiculos.js               111 marcas · 1.611 modelos · 14.185 combinaciones
│   ├── agenda.js                  Reglas de sábado y domingo
│   ├── app.js                     Navegación y buscadores del home
│   ├── andrea.js                  Andrea — asistente de IA (versión demo)
│   ├── whatsapp.js                Simulador del flujo de venta
│   └── main.js                    Arranque
│
├── img/
│   ├── hero-caucho.svg            Ilustración de caucho (hero y productos)
│   ├── productos/                 Aquí van las fotos reales, nombradas por SKU
│   ├── logo-color.png · logo-blanco.png · cauchito.png
│   └── originales/                Los mismos activos en alta resolución
│
├── data/
│   ├── catalogo.json              ← EL CATÁLOGO. Con la forma exacta de la futura API
│   ├── vehiculos.json · medidas.json · caucheras.json · faq.json
│   └── BBDD_Vehiculos_depurada.xlsx
│
├── .htaccess                      Hosting Apache tradicional: MIME, caché, compresión
├── package.json · netlify.toml · vercel.json · robots.txt · sitemap.xml · .gitignore
├── prototipo-standalone.html      El sitio entero en UN archivo (para enviar por correo)
└── docs/
    ├── API-CONTRATO.md            ← El JSON que el frontend espera de la API
    ├── ARQUITECTURA.md            ← Las capas y el interruptor local → API
    ├── ESTRUCTURA.md              Qué hace cada archivo
    ├── PARA-EL-DESARROLLADOR.md   Brief técnico copiable
    ├── generar-catalogo.py        Regenera data/catalogo.json y la copia embebida
    └── depurar-vehiculos.py       Limpia la BBDD de vehículos de VENEGE
```

**Sin dependencias

**Sin dependencias, sin build, sin framework.** HTML + CSS + JavaScript plano.
La única llamada externa es la hoja de fuentes de Google (Montserrat y Poppins).

---

## 3. Qué hay que tocar para ir a producción

Todo lo configurable está en **`js/config.js`**. Ábrelo: cada campo vacío o marcado
`[REQUIERE VENEGE]` es una decisión pendiente.

Para ver la lista de pendientes sin leer el archivo, abre la consola del navegador (F12) y escribe:

```js
VIP.pendientes()
```

Los bloques principales:

| Bloque | Qué define |
|---|---|
| `whatsapp` | Número real, BSP, plantillas aprobadas por Meta. `simular:false` cambia el botón del simulador a WhatsApp real. |
| `bcv` | Tasa de referencia en bolívares y su fecha. Hoy está fija; en producción se actualiza a diario. |
| `andrea` | Endpoint del LLM, horario de escalamiento a humano |
| `catalogo` | **`fuente: 'local'` o `'api'`.** Es el interruptor: cambiarlo es todo lo que hace falta para pasar a la API |
| `stock` | Umbral de "Últimas unidades". Hoy: 5 o menos |
| `entrega` | Cauchera aliada / delivery / pickup y qué incluye cada vía |
| `crm` | Webhooks de lead y de orden |
| `tracking` | GTM, GA4, Meta Pixel, Google Ads |
| `legal` | RIF, razón social, términos, devoluciones |

---

## 4. Reglas de negocio que están cableadas en el diseño

No son detalles estéticos. Si el desarrollador las rompe, el modelo se rompe.

1. **La cauchera aliada siempre se ofrece primero.** Delivery y pickup son alternativas, nunca la opción por defecto.
2. **Montaje y balanceo van incluidos únicamente por la vía de la cauchera.** Es lo que sostiene el incentivo de la red.
3. **Precios en dólares, en una sola lista (Lista 1).** No hay precio distinto por canal.
4. **Andrea nunca cita precio, stock ni compatibilidad de memoria** — siempre consulta el catálogo. Y nunca gestiona el pago ni valida comprobantes.
5. **El cliente no sabe su medida.** Todo el buscador está diseñado alrededor de eso: búsqueda por vehículo, por foto y por conversación con Andrea.
6. **Mobile primero.** El sitio se diseñó a 390px y luego se expandió.
7. **El precio se cobra en dólares.** El bolívar aparece solo como referencia a tasa BCV, con su fecha. Nunca es el monto de cobro.
8. **Sábado:** VENEGE no despacha. Solo se vende por la vía cauchera y solo con stock adelantado en su local. Delivery y pickup quedan cerrados.
9. **Domingo:** no abre nadie. El sitio vende y cobra, pero la entrega se agenda para un día hábil.

---

## 5. Las imágenes

El hero muestra hoy una **ilustración vectorial** (`img/hero-caucho.svg`), no una fotografía.
Está pensada para que la reemplaces sin tocar código:

> Guarda tu foto como **`img/hero-cauchos.jpg`** y la página la toma sola.
> Si el archivo no existe, vuelve a la ilustración.

Las fotos de producto van en `img/productos/`, nombradas por SKU en minúsculas
(`mic-19560r15-energy.jpg`). El nombre ya está declarado en cada producto del catálogo.
Cuando las cargues, pon `imagenesDisponibles: true` en `js/config.js` y aparecen todas.
Mientras esté en `false`, todas las tarjetas usan la ilustración y no se piden 21 archivos
que no existen.

Para las fotos de producto reales, la vía correcta no es bajar imágenes de internet —
casi todas tienen derechos y usar una foto de catálogo ajena es un riesgo legal innecesario.
VENEGE es distribuidor: **Michelin, Firestone, General Tire y BFGoodrich entregan kits de
imágenes oficiales a sus distribuidores**, en alta resolución y con permiso de uso. Pídelos
por el canal comercial. Es gratis, es legal y la calidad es mejor que cualquier cosa que
se consiga suelta.

---

## 6. El catálogo y la futura API

Los productos salen de **`data/catalogo.json`**, que ya tiene la forma exacta que devolverá la
API de inventario: `{ meta, data }` con el esquema completo del producto.

Ningún componente visual sabe de dónde vienen. Todos le preguntan a `VIP.catalogo`. Por eso,
pasar de datos locales a la API es **una línea** en `js/config.js`:

```js
catalogo: { fuente: 'local' }   →   catalogo: { fuente: 'api', endpoint: 'https://…' }
```

El contrato completo —campos obligatorios, opcionales, errores, paginación— está en
**`docs/API-CONTRATO.md`**. La arquitectura, en **`docs/ARQUITECTURA.md`**.

Para agregar o cambiar productos hoy: edita `data/catalogo.json` y corre
`python3 docs/generar-catalogo.py` para regenerar la copia embebida.

Diagnóstico rápido, en la consola del navegador:

```js
VIP.catalogo.diagnostico()   // de dónde salieron los datos y si algo se descartó
VIP.carrito.skus()           // qué hay en el carrito
```

---

## 7. Lo que este frontend NO tiene todavía

- Pasarela de pago y facturación
- Inventario en vivo (el stock es un número fijo en el JSON)
- Andrea real (aquí responde por palabras clave; en producción es un LLM con acceso al catálogo, al inventario y al CRM)
- WhatsApp Business Platform conectado
- Panel de caucheras ni de administración
- Backend de ningún tipo

Cómo construir todo eso, con qué stack, con qué equipo y en qué orden está en
**`VIP_Plan_de_Produccion.docx`**.

---

## 8. Marca

Paleta del *BrandBook Cauchos VIP 2025*:

| Elemento | Valor |
|---|---|
| Rojo VIP | `#C20000` |
| Rojo oscuro | `#9C0000` |
| Negro | `#000000` |
| Gris medio | `#4F4F4F` |
| Gris claro | `#C4C4C4` |
| Títulos | **Montserrat** 700 / 800 |
| Texto | Poppins 400 / 500 / 600 / 700 |

Están declaradas como variables CSS al inicio de `css/styles.css`. Cambiarlas ahí las cambia
en todo el sitio.

**Cambio respecto al brandbook:** los títulos pasaron de Chakra Petch a **Montserrat Bold**.
Es un cambio deliberado, no un descuido — pero hay que reflejarlo en el brandbook, para que la
web, las piezas de redes y el material impreso no terminen hablando con dos tipografías distintas.

**Pendiente de decisión:** el brandbook le asigna a *Cauchito* el rol de guía conversacional,
que es exactamente el rol de *Andrea*. La recomendación es Cauchito = imagen de marca,
Andrea = voz de servicio. Está desarrollado en la sección 17.10 del documento principal.
Cauchito ya no aparece en el hero: su lugar lo ocupa la imagen del producto. El archivo sigue
en `img/` para las piezas donde sí corresponde.
