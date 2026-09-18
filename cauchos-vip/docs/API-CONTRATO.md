# Contrato de la API de catálogo — Cauchos VIP

Este documento define **exactamente** qué JSON espera recibir el frontend.
Hoy ese JSON lo sirve `data/catalogo.json`; mañana lo servirá una API real.
Mientras la respuesta cumpla este contrato, **no hay que tocar ni una línea de la interfaz**.

> **Regla de seguridad, sin excepciones:** en el frontend no va ninguna API key, token ni
> secreto. Todo lo que está en el navegador lo puede leer cualquiera. Si la API de inventario
> exige autenticación, se pone un proxy en el servidor de VENEGE que guarde la credencial, y
> el frontend llama a ese proxy.

---

## 1. Endpoints

| Método | Ruta | Obligatorio | Qué devuelve |
|---|---|---|---|
| `GET` | `/productos` | **Sí** | El catálogo. Es el único imprescindible |
| `GET` | `/productos/{sku}` | Opcional | Un producto suelto por SKU |
| `GET` | `/stock?skus=A,B,C` | Opcional | Solo las unidades, para refrescar sin recargar el catálogo |

La URL base se carga en `js/config.js` → `catalogo.endpoint`.
Ejemplo: `https://api.venege.com/vip/v1`

**CORS:** la API debe responder con `Access-Control-Allow-Origin` que incluya el dominio del
sitio. Sin eso el navegador bloquea la respuesta aunque el servidor conteste bien.

---

## 2. Respuesta de `GET /productos`

Siempre dos claves de primer nivel: `meta` y `data`.

```json
{
  "meta": {
    "version": "1.0",
    "generadoEn": "2026-08-28T00:00:00Z",
    "moneda": "USD",
    "total": 21,
    "pagina": 1,
    "porPagina": 100,
    "paginas": 1
  },
  "data": [
    {
      "sku": "MIC-19560R15-ENERGY",
      "marca": "Michelin",
      "nombre": "Energy XM2+",
      "categoria": "Carro",
      "medida": "195/60R15",
      "precio": 112.00,
      "precioAnterior": 128.00,
      "stock": 28,
      "descripcion": "Michelin Energy XM2+ en medida 195/60R15 88H. Pensado para tráfico urbano y piso mojado...",
      "imagenes": [
        { "url": "https://cdn.venege.com/vip/mic-19560r15-energy.jpg",
          "alt": "Michelin Energy XM2+ 195/60R15",
          "principal": true }
      ],
      "vehiculosCompatibles": [
        { "marca": "CHEVROLET", "modelo": "OPTRA", "anioDesde": 2003, "anioHasta": 2018 },
        { "marca": "FORD",      "modelo": "FIESTA", "anioDesde": 1996, "anioHasta": 2019 }
      ],
      "indiceCarga": "88H",
      "gama": "Premium",
      "usos": ["Ciudad", "Lluvia"],
      "desempeno": { "Durabilidad": 85, "Agarre en mojado": 88, "Silencio": 82, "Fuera de asfalto": 15 },
      "etiqueta": "Más vendido",
      "moneda": "USD",
      "montajeIncluido": true,
      "activo": true,
      "actualizadoEn": "2026-08-28T00:00:00Z"
    }
  ]
}
```

---

## 3. Campos del producto

### 3.1 Obligatorios

Si falta cualquiera de estos siete, **el producto se descarta** y se registra el motivo en la
consola. El resto del catálogo sigue funcionando: un producto malo nunca tumba la página.

| Campo | Tipo | Reglas | Para qué se usa |
|---|---|---|---|
| `sku` | texto | Único en todo el catálogo. Se guarda en mayúsculas | Identificador. Carrito, ficha, búsqueda, orden |
| `marca` | texto | | Filtro, título, búsqueda |
| `nombre` | texto | Modelo del caucho | Título, búsqueda |
| `categoria` | texto | `Carro` · `Camioneta` · `Pick-up` · `4x4` · `Carga` | Filtro por tipo de vehículo |
| `medida` | texto | `195/60R15`. Se normaliza sola: acepta `195 60 15`, `195-60-R15`, `1956015` | Búsqueda por medida, alternativas |
| `precio` | número | En dólares, mayor o igual a 0. Sin símbolo, sin separador de miles | Precio publicado (Lista 1) |
| `stock` | número | Entero. `0` = agotado | Traduce a Disponible / Últimas unidades / Agotado |

### 3.2 Opcionales

Si no vienen, el frontend usa un valor por defecto y no se rompe nada.

| Campo | Tipo | Por defecto | Qué pasa si no viene |
|---|---|---|---|
| `precioAnterior` | número | `null` | No se muestra precio tachado ni porcentaje de descuento |
| `descripcion` | texto | `""` | La ficha sale sin párrafo descriptivo |
| `imagenes` | arreglo | `[]` | Se usa la ilustración de marca |
| `vehiculosCompatibles` | arreglo | `[]` | El acordeón invita a preguntarle a Andrea |
| `indiceCarga` | texto | `""` | No aparece junto a la medida |
| `gama` | texto | `""` | No aparece el filtro de gama para ese producto |
| `usos` | arreglo de texto | `[]` | No aparece en el filtro de uso |
| `desempeno` | objeto | `null` | No se dibujan las barras de desempeño |
| `etiqueta` | texto | `null` | Sin distintivo ("Más vendido", "Recomendado"…) |
| `moneda` | texto | `"USD"` | Se asume dólares |
| `montajeIncluido` | booleano | `true` | Se asume que el precio incluye montaje |
| `activo` | booleano | `true` | `false` lo esconde sin borrarlo del catálogo |
| `actualizadoEn` | texto ISO 8601 | `null` | No se muestra fecha de actualización |

### 3.3 Estructura de los objetos anidados

**`imagenes[]`** — también se acepta un arreglo de textos (`["url1","url2"]`), que se convierte solo.

| Campo | Tipo | Obligatorio |
|---|---|---|
| `url` | texto | Sí. Absoluta o relativa a la raíz del sitio |
| `alt` | texto | No. Si falta se arma con marca, nombre y medida |
| `principal` | booleano | No. Si ninguna la trae, se usa la primera |

**`vehiculosCompatibles[]`**

| Campo | Tipo | Obligatorio |
|---|---|---|
| `marca` | texto | Sí. En mayúsculas, igual que `data/vehiculos.json` |
| `modelo` | texto | Sí. Igual que `data/vehiculos.json` |
| `anioDesde` | número | Sí |
| `anioHasta` | número | Sí |

Que los nombres coincidan con `data/vehiculos.json` **no es un detalle**: es lo que permite que
el buscador "no sé mi medida" conecte el carro del cliente con los cauchos que le sirven.

### 3.4 Campos que la API NO debe mandar

Estos los calcula el frontend a partir de los anteriores. Si la API los manda, se ignoran:

`estadoStock` · `estadoStockEtiqueta` · `comprable` · `enPromocion` · `descuentoPct` ·
`titulo` · `imagenUrl` · `textoBusqueda`

---

## 4. Estado de stock

El frontend traduce el número de unidades. El umbral está en `js/config.js` → `stock.umbralUltimasUnidades` (hoy 5).

| `stock` | Se muestra | ¿Se puede comprar? |
|---|---|---|
| `0` o menos | **Agotado** | No. El botón se desactiva y el carrito lo rechaza |
| `1` a `5` | **Últimas unidades** (con el número) | Sí, hasta el máximo disponible |
| `6` o más | **Disponible** | Sí |

**Importante para VENEGE:** `stock` debe ser el disponible **real y comprometible**, no el
teórico del ERP. Si el sistema dice "Disponible" y no lo está, ya cobraste algo que no puedes
entregar — y en este modelo el cliente paga antes de montar.

---

## 5. Respuesta de `GET /productos/{sku}`

```json
{ "meta": { "version": "1.0" }, "data": { /* un producto, mismo esquema */ } }
```

SKU inexistente: HTTP `404` con el cuerpo de error de la sección 7.

---

## 6. Respuesta de `GET /stock?skus=A,B,C` (opcional pero recomendado)

Pensado para refrescar la disponibilidad sin volver a bajar el catálogo completo.

```json
{ "meta": { "generadoEn": "2026-08-28T14:05:00Z" },
  "data": [ { "sku": "MIC-19560R15-ENERGY", "stock": 26 },
            { "sku": "FIR-19560R15-F700",   "stock": 0 } ] }
```

---

## 7. Errores

Código HTTP correcto **y** cuerpo con esta forma:

```json
{ "error": { "codigo": "CATALOGO_NO_DISPONIBLE",
             "mensaje": "El servicio de inventario no responde." } }
```

| Situación | HTTP | Qué hace el frontend |
|---|---|---|
| SKU inexistente | `404` | La ficha vuelve al catálogo |
| Parámetro inválido | `400` | No reintenta |
| Error del servidor | `5xx` | Reintenta una vez, y si falla muestra el aviso de catálogo no disponible |
| Sin respuesta / timeout | — | Igual que `5xx`. El timeout está en 8 segundos |

Cuando el catálogo no carga, el sitio **no se queda en blanco**: muestra un aviso honesto y
deja funcionando WhatsApp, "cómo funciona" y la página de caucheras.

---

## 8. Paginación

El adaptador local entrega todo de una y filtra en memoria. La API puede paginar:

`GET /productos?pagina=2&porPagina=50`

Parámetros que el adaptador HTTP sabe mandar hoy: `q`, `medida`, `categoria`, `marca`,
`pagina`, `porPagina`. Con un catálogo de unos pocos miles de SKU conviene entregarlo completo
y filtrar en el navegador: es más rápido para el cliente y menos carga para el servidor.

---

## 9. Cómo se prueba antes de tener la API

1. Copia `data/catalogo.json`, edítalo (cambia un `stock` a `0`, quita un campo obligatorio, agrega un producto).
2. Recarga el sitio.
3. Abre la consola del navegador: `VIP.catalogo.diagnostico()` dice de dónde salieron los datos, cuántos productos entraron y cuántos se descartaron.

Ese mismo archivo es la especificación viva. Si la API devuelve algo que este JSON no
contempla, la API está fuera de contrato.

---

## 10. Checklist para quien construya la API

- [ ] `GET /productos` devuelve `{ meta, data }` con `data` como arreglo
- [ ] Cada producto trae los siete campos obligatorios
- [ ] Los SKU son únicos y estables en el tiempo (no cambian al reindexar el ERP)
- [ ] `precio` es número, no texto, y no trae símbolo de moneda
- [ ] `stock` es el disponible real comprometible
- [ ] `medida` viene en formato `195/60R15`
- [ ] `vehiculosCompatibles` usa los mismos nombres de marca y modelo que `data/vehiculos.json`
- [ ] Las URL de imagen responden por HTTPS y con CORS abierto
- [ ] Los errores devuelven código HTTP correcto y el cuerpo `{ error: { codigo, mensaje } }`
- [ ] CORS permite el dominio del sitio
- [ ] Ninguna credencial viaja al navegador
