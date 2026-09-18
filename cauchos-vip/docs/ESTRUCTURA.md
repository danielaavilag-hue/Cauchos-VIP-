# Estructura del proyecto — detalle archivo por archivo

## index.html — 34 KB

Un solo documento HTML que contiene **cinco páginas**, cada una en un `<main>` distinto que se
muestra u oculta con la función `go(pagina)`. No hay recarga: es una SPA hecha a mano, sin
framework.

| `<main>` | Página | Contiene |
|---|---|---|
| `p-home` | Inicio | Hero con buscador dual, "¿Qué tienes tú?", beneficios, cómo funciona, marcas, destacados, red de caucheras, garantía, testimonio, FAQ, CTA caucheras |
| `p-cat` | Catálogo | Filtros (tipo, marca, gama, uso, disponibilidad), buscador por medida, grid de resultados |
| `p-prod` | Ficha de producto | Precio, disponibilidad, barras de desempeño, selector de cantidad, tres vías de entrega, acordeón de información |
| `p-como` | Cómo funciona | Los pasos del proceso explicados al cliente |
| `p-red` | Red de caucheras | Mapa de zonas, listado, formulario para caucheras que quieren afiliarse |

Además hay tres capas superpuestas (overlays):

- `#anOv` — panel de Andrea
- `#ov` — simulador de WhatsApp
- `#mov` — modal "busca por tu vehículo"

Y al inicio, la barra negra `.demo` que declara que es un prototipo. **Quitarla cuando el
sitio sea real.**

---

## css/styles.css — 27 KB

Un solo archivo. Empieza con el bloque `:root` de variables (colores, radios, sombras,
tipografías). Todo lo demás las usa. Cambiar una variable cambia el sitio entero.

Los alias `--orange`, `--orange-d`, `--orange-l` apuntan hoy a los rojos oficiales; quedaron
de la paleta anterior y pueden eliminarse haciendo búsqueda y reemplazo.

Breakpoints: el diseño es mobile-first. Las media queries suben desde `760px` y `1000px`.

---

## js/config.js — configuración

Ver la sección 3 del README. Es el único archivo que un no-programador debería necesitar abrir.

Expone dos ayudas en consola:

```js
VIP.pendientes()      // lista de campos sin completar
VIP.esSimulacion()    // true mientras WhatsApp siga simulado
```

---

## Capa de datos — de dónde salen los productos

Está explicada en detalle en **`ARQUITECTURA.md`** y el contrato del JSON en
**`API-CONTRATO.md`**. En resumen:

| Archivo | Qué hace |
|---|---|
| `js/core/http.js` | `fetch` con timeout y reintento. Sin credenciales, a propósito |
| `js/models/product.model.js` | Qué es un producto: normalizar, validar, estados de stock |
| `js/services/adapters/local.adapter.js` | Lee `data/catalogo.json`, con respaldo embebido para `file://` |
| `js/services/adapters/http.adapter.js` | La futura API. Escrito, probado en forma, **apagado** |
| `js/data/mock-catalogo.js` | Copia del JSON dentro de una variable, para que funcione con doble clic |
| `js/services/catalog.service.js` | La frontera. `listar` · `obtener` · `buscar` · `facetas` · `relacionados` |
| `js/services/cart.service.js` | Carrito. Guarda SKU y cantidad, nada más |

Cambiar de datos locales a API es **una línea** en `js/config.js`:

```js
catalogo: { fuente: 'local' }   →   catalogo: { fuente: 'api', endpoint: '...' }
```

### Diagnóstico en consola

```js
VIP.catalogo.diagnostico()   // fuente, total, descartados, error
VIP.catalogo.facetas()       // marcas, categorías, gamas, usos y medidas del catálogo
VIP.carrito.skus()           // qué SKU hay en el carrito
VIP.pendientes()             // campos de config.js sin completar
```

---

## js/data.js — contenido que todavía no viene de API

Solo dos cosas: las preguntas frecuentes (`FAQ`) y la cauchera aliada del piloto (`CAU`).

El catálogo **ya no vive aquí**. La lista de marcas tampoco: se calcula del propio catálogo
(facetas), así que una marca nueva aparece sola en los filtros y en la fila de marcas del home.

---

## js/vehiculos.js — la base de vehículos

Depurada de la BBDD que entregó VENEGE (57.313 filas). Se eliminaron motos, remolques,
carrocerías, maquinaria, buses y camiones pesados, y se acotó el rango a 1990–2026.
Quedan **111 marcas, 1.611 modelos y 14.185 combinaciones**.

```js
VEH['TOYOTA']['COROLLA']   // → [[1990, 2024]]   rangos de año, no lista
annosDe('TOYOTA','COROLLA')          // → [2024, 2023, ... 1990]
medidaDe('TOYOTA','COROLLA','2018')  // → '195/65R15'
medidaDe('FORD','ECOSPORT','2016')   // → null
```

El script que hizo la limpieza está en `docs/depurar-vehiculos.py`: si VENEGE manda una base
actualizada, se vuelve a correr en un minuto. Las listas de marcas y de modelos a excluir están
arriba del archivo, en claro, para que se puedan ajustar sin saber programar.

### El hueco importante

**La base original no trae la medida del caucho.** Trae marca, modelo y año, y nada más.

`MEDIDAS` es una tabla curada aparte, y hoy tiene **14 modelos**. Para todo lo demás, el sitio
identifica el vehículo y pasa el caso a Andrea en vez de inventar una medida. Es deliberado:
una medida equivocada hace que el cliente pierda el viaje y que la cauchera pierda la mañana.

Completar esa tabla —marca, modelo, año, medida de fábrica— es el activo más valioso de todo
el buscador, y no hay agencia web que lo pueda hacer por VENEGE. Está exportada en
`data/medidas.json` y en la columna E de `data/BBDD_Vehiculos_depurada.xlsx`.

---

## js/agenda.js — el calendario operativo

Traduce a código las reglas de días de VENEGE:

| Día | Cauchera | Delivery | Pickup |
|---|---|---|---|
| Lunes a viernes | Sí | Sí | Sí |
| Sábado | Sí, con stock adelantado | No | No |
| Domingo | No | No | No |

`viasHoy()` devuelve qué está abierto; `avisoDelDia()` devuelve el mensaje que se muestra al
cliente; `proximasFechas(via, n)` alimenta el calendario de programación.

**En producción la fecha tiene que venir del servidor con la hora de Caracas.** El reloj del
visitante es manipulable y puede estar en otro huso: si un cliente en España abre la página un
sábado por la noche, su navegador puede decir domingo.

---

## js/ui/ — los componentes visuales

Solo pintan. Ninguno sabe de dónde salieron los datos.

| Archivo | Qué pinta |
|---|---|
| `ui/product-card.js` | La tarjeta de producto, una sola para todo el sitio: destacados, catálogo, alternativas y sugerencias de Andrea |
| `ui/catalog-view.js` | Filtros, búsqueda, orden y grilla. Los filtros se generan de las facetas del catálogo, no están escritos a mano |
| `ui/product-detail.js` | La ficha, armada entera desde el objeto de producto. El HTML solo aporta contenedores vacíos |
| `ui/cart-ui.js` | Panel lateral del carrito y contador del encabezado |

---

## js/app.js — navegación y buscadores del home

| Función | Qué hace |
|---|---|
| `go(pagina)` | Cambia de página |
| `abrirCatalogo(consulta)` | Abre el catálogo con filtros ya aplicados. Lo usan el hero, las marcas, Andrea y el buscador por vehículo |
| `abrirProducto(sku)` | Abre la ficha. **Recibe SKU**, no un id numérico |
| `searchSize()` | Buscador por ancho / perfil / rin o medida escrita |
| `searchVeh()` | Buscador por marca, modelo y año |
| `normSize(v)` | Normaliza la medida: `195 60 15`, `195/60/15`, `195-60-r15` → `195/60R15` |
| `pintarAvisos()` | Aviso de sábado o domingo y vías de entrega cerradas |

`js/main.js` es el arranque: carga el catálogo por el servicio y de ahí pinta destacados,
marcas, filtros y grilla. Si el catálogo falla, muestra un aviso honesto en vez de dejar la
página en blanco.

---

## js/andrea.js — el asistente

En el prototipo Andrea reconoce **palabras clave** y responde con guiones escritos. Sirve para
demostrar el tono, el flujo y los puntos de escape; no es inteligencia real.

| Función | Camino que cubre |
|---|---|
| `andrea(intencion)` | Abre el panel; intención `'medida'`, `'buscar'` o vacía |
| `anMedida()` | "No sé mi medida" → por vehículo, por foto o por conversación |
| `anRec(uso)` | Recomendación según uso (ciudad, carretera, lluvia, off-road) |
| `anZona(z)` | Qué cauchera atiende esa zona |
| `anAnswer(q)` | Motor de palabras clave |
| `anSend()` | Envío desde el input |

**En producción esto se reemplaza entero.** Andrea pasa a ser un LLM con estas herramientas:
`buscar_producto`, `medida_por_vehiculo`, `leer_medida_de_foto`, `disponibilidad`,
`caucheras_cercanas`, `crear_lead`, `escalar_a_humano`. El *system prompt* y las barreras
duras están descritos en la sección 11 del documento principal.

---

## js/whatsapp.js — el simulador de venta

Reproduce la conversación completa: producto → nombre → zona → vía de entrega → cobro →
datos de pago → orden confirmada.

| Función | Etapa |
|---|---|
| `wa(modo)` | Abre el simulador. Modos: `'prod'`, `'foto'`, `'cauchera'`, general |
| `entrega()` | Las tres vías: cauchera aliada / delivery gratis / retiro en punto VIP. Si el día no las permite, ofrece programar |
| `agendar(via)` | Calendario: el cliente escoge el día de entrega o de montaje |
| `cobro()` | Presenta el total y las formas de pago |
| `datosPago()` | Instrucciones de pago |
| `ordenConfirmada()` | Cierre con código de orden y siguiente paso según la vía elegida |

Si en `config.js` cargas un número real y pones `simular:false`, `wa()` deja de abrir el
simulador y abre WhatsApp de verdad con el mensaje ya escrito. Es el puente más rápido entre
el prototipo y una prueba piloto manual.

---

## Qué NO existe en este proyecto

Vale la pena decirlo explícitamente, porque la pregunta original mencionaba "archivos de
configuración":

- **No hay backend.** Ningún archivo `.env`, ninguna conexión a base de datos, ninguna clave.
- **No hay build.** No hay webpack, vite, ni `node_modules`. `package.json` existe sólo para
  levantar un servidor local.
- **No hay CMS.** El contenido está en el HTML y en los JSON.

Eso es deliberado: un prototipo que necesita instalación no se revisa. Pero significa que
**el sitio de producción no es este código ampliado, es un desarrollo nuevo** que usa este
proyecto como especificación visual y funcional.
