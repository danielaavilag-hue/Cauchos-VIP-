# Arquitectura del frontend — Cauchos VIP

## La idea en una frase

Ningún componente visual sabe de dónde salen los datos. Todos le preguntan a un servicio,
y el servicio decide si responde con un archivo local o con una API.

```
    ┌──────────────────────────────────────────────────────────────┐
    │  COMPONENTES VISUALES            js/ui/                      │
    │  tarjeta · catálogo · ficha · carrito                        │
    │  Solo pintan. No saben qué es una URL.                       │
    └───────────────────────────┬──────────────────────────────────┘
                                │  VIP.catalogo.listar({...})
                                │  VIP.catalogo.obtener(sku)
                                │  VIP.carrito.agregar(sku, n)
    ┌───────────────────────────▼──────────────────────────────────┐
    │  SERVICIOS                       js/services/                │
    │  catalog.service.js  ← la frontera                           │
    │  cart.service.js     ← guarda SKU y cantidad, nada más       │
    └───────────────────────────┬──────────────────────────────────┘
                                │  elige según config.catalogo.fuente
                ┌───────────────┴───────────────┐
                ▼                               ▼
    ┌───────────────────────┐      ┌────────────────────────────┐
    │  local.adapter.js     │      │  http.adapter.js           │
    │  ACTIVO               │      │  ESCRITO Y APAGADO         │
    │  data/catalogo.json   │      │  GET {endpoint}/productos  │
    │  + copia embebida     │      │                            │
    └───────────────────────┘      └────────────────────────────┘
                └───────────────┬───────────────┘
                                ▼
    ┌──────────────────────────────────────────────────────────────┐
    │  MODELO                          js/models/product.model.js  │
    │  normalizar() · validar() · estadoStock()                    │
    │  Todo lo que entra pasa por aquí. Una sola definición de     │
    │  qué es un producto.                                         │
    └──────────────────────────────────────────────────────────────┘
```

---

## El interruptor local → API

Es **una línea** en `js/config.js`:

```js
catalogo: {
  fuente: 'local',                              // cambiar a 'api'
  endpoint: 'https://api.venege.com/vip/v1'     // y cargar la URL base
}
```

Nada más. No se toca ningún componente visual, ninguna vista, ningún HTML.

Lo que la interfaz nunca supo, y por eso no hay que cambiarlo:

- si los datos vinieron de un archivo o de la red
- si vinieron paginados o completos
- cómo se llaman los campos en el ERP de VENEGE

Ese desacople no es gratis: obliga a que **todos los métodos del servicio sean asíncronos**
aunque hoy los datos ya estén en memoria. Es a propósito. Si fueran síncronos, el día que
la respuesta venga por red habría que reescribir cada llamada de la interfaz.

---

## Por qué el modelo existe

`product.model.js` es el único lugar donde está escrito qué campos tiene un producto.

Si mañana el ERP manda `codigo_articulo` en vez de `sku`, o `existencia` en vez de `stock`,
se ajusta `normalizar()` **en un solo archivo** y todo el sitio sigue funcionando. Sin el
modelo, ese cambio obligaría a buscar y reemplazar en cada componente.

El modelo también decide qué hacer con la basura: un producto que no cumple el contrato se
descarta y se anota en la consola, pero **el resto del catálogo sigue vivo**. Un SKU mal
cargado en el ERP no puede tumbar la tienda.

Y calcula los derivados, que la API no debe mandar:

| Derivado | De dónde sale |
|---|---|
| `estadoStock` | del número de `stock` contra el umbral de `config.js` |
| `comprable` | `estadoStock !== 'agotado'` y `activo` |
| `enPromocion`, `descuentoPct` | de `precio` contra `precioAnterior` |
| `imagenUrl` | de `imagenes[]`, con respaldo si no hay foto |
| `textoBusqueda` | de SKU, marca, nombre, medida, categoría, gama, usos y vehículos |

---

## Por qué el carrito guarda solo SKU y cantidad

Podría guardar el producto completo y ahorrarse consultas. No lo hace, por una razón concreta:

> Si el cliente agrega un caucho el lunes y vuelve el jueves, y en el medio cambió el precio o
> se agotó, un carrito que guardó el precio le mostraría un precio que ya no existe.

Guardando solo el SKU, cada vez que se pinta el carrito se le pide el producto al catálogo y
se muestra el precio y el stock de ese momento. `detalle()` además ajusta la cantidad si ya no
hay tantas unidades y avisa cuál línea cambió.

Persiste en `localStorage` bajo la clave `vip.carrito.v1`. Si el navegador lo bloquea (modo
privado), el carrito funciona igual, solo que no sobrevive a la recarga.

---

## Orden de carga de los scripts

Sin build, sin módulos ES: son scripts clásicos y **el orden importa**. Está declarado y
comentado al final de `index.html`:

1. `config.js` — crea `window.VIP`
2. `core/http.js`, `models/product.model.js`
3. adaptadores (`local`, `api`) y `data/mock-catalogo.js`
4. servicios (`catalog`, `cart`)
5. contenido que todavía no viene de API (`data.js`, `vehiculos.js`, `agenda.js`)
6. componentes visuales (`ui/*.js`)
7. `app.js`, `andrea.js`, `whatsapp.js` y `main.js`

**¿Por qué no módulos ES (`import`/`export`)?** Porque `type="module"` no funciona al abrir el
archivo con doble clic (`file://`): el navegador lo bloquea por CORS. El sitio tiene que poder
abrirse sin servidor para revisarlo. Cuando exista un backend y un proceso de build, migrar a
módulos es directo: cada archivo ya es un módulo con una responsabilidad clara.

---

## La copia embebida del catálogo

`js/data/mock-catalogo.js` es una copia byte a byte de `data/catalogo.json` dentro de una
variable de JavaScript. Existe por una sola razón: `fetch()` de archivos locales está
bloqueado en `file://`, así que sin ella el sitio abierto con doble clic se quedaría sin
productos.

El adaptador local intenta primero el JSON y cae en la copia si no puede. En producción,
servido por HTTP, siempre gana el JSON.

Se regenera con `docs/generar-catalogo.py`. **No editarla a mano**: se desincroniza.

---

## Qué hacer cuando llegue la API

1. Levantar el endpoint cumpliendo `docs/API-CONTRATO.md`.
2. Cargar la URL en `config.js` y poner `fuente: 'api'`.
3. Abrir la consola y verificar `VIP.catalogo.diagnostico()` → `fuente: "api"`.
4. Si la API pide autenticación, montar el proxy en el servidor. **Nunca** poner la clave aquí.
5. Borrar `js/data/mock-catalogo.js` y `data/catalogo.json`, o dejarlos como respaldo de
   desarrollo con `fuente: 'local'`.
