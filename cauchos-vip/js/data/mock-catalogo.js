/* ============================================================
   Cauchos VIP — catálogo mock embebido
   ------------------------------------------------------------
   Copia EXACTA de data/catalogo.json. Existe por una sola razón:
   fetch() no puede leer archivos locales cuando la página se abre
   con doble clic (file://). El adaptador local intenta primero el
   JSON y cae aquí si no puede.
   Se regenera con  docs/generar-catalogo.py  — no editar a mano.
   ============================================================ */

window.__VIP_CATALOGO_MOCK__ = {
  "meta": {
    "version": "1.0",
    "generadoEn": "2026-08-28T00:00:00Z",
    "moneda": "USD",
    "fuente": "mock-local",
    "total": 21,
    "pagina": 1,
    "porPagina": 21,
    "paginas": 1
  },
  "data": [
    {
      "sku": "MIC-19560R15-ENERGY",
      "marca": "Michelin",
      "nombre": "Energy XM2+",
      "categoria": "Carro",
      "medida": "195/60R15",
      "precio": 112.0,
      "precioAnterior": 128.0,
      "stock": 28,
      "descripcion": "Michelin Energy XM2+ en medida 195/60R15 88H. Pensado para tráfico urbano, piso mojado. Gama alta: la mejor relación entre duración, silencio y agarre. Producto nuevo, sellado y con garantía de fábrica. El precio publicado incluye montaje y balanceo en la cauchera aliada.",
      "imagenes": [
        {
          "url": "img/productos/mic-19560r15-energy.jpg",
          "alt": "Michelin Energy XM2+ 195/60R15",
          "principal": true
        }
      ],
      "vehiculosCompatibles": [
        {
          "marca": "CHEVROLET",
          "modelo": "OPTRA",
          "anioDesde": 2003,
          "anioHasta": 2018
        },
        {
          "marca": "FORD",
          "modelo": "FIESTA",
          "anioDesde": 1996,
          "anioHasta": 2019
        }
      ],
      "indiceCarga": "88H",
      "gama": "Premium",
      "usos": [
        "Ciudad",
        "Lluvia"
      ],
      "desempeno": {
        "Durabilidad": 85,
        "Agarre en mojado": 88,
        "Silencio": 82,
        "Fuera de asfalto": 15
      },
      "etiqueta": "Más vendido",
      "moneda": "USD",
      "montajeIncluido": true,
      "activo": true,
      "actualizadoEn": "2026-08-28T00:00:00Z"
    },
    {
      "sku": "FIR-19560R15-F700",
      "marca": "Firestone",
      "nombre": "F-700",
      "categoria": "Carro",
      "medida": "195/60R15",
      "precio": 84.0,
      "precioAnterior": 96.0,
      "stock": 22,
      "descripcion": "Firestone F-700 en medida 195/60R15 88H. Pensado para tráfico urbano. Gama media: rendimiento equilibrado a un precio razonable. Producto nuevo, sellado y con garantía de fábrica. El precio publicado incluye montaje y balanceo en la cauchera aliada.",
      "imagenes": [
        {
          "url": "img/productos/fir-19560r15-f700.jpg",
          "alt": "Firestone F-700 195/60R15",
          "principal": true
        }
      ],
      "vehiculosCompatibles": [
        {
          "marca": "CHEVROLET",
          "modelo": "OPTRA",
          "anioDesde": 2003,
          "anioHasta": 2018
        },
        {
          "marca": "FORD",
          "modelo": "FIESTA",
          "anioDesde": 1996,
          "anioHasta": 2019
        }
      ],
      "indiceCarga": "88H",
      "gama": "Media",
      "usos": [
        "Ciudad"
      ],
      "desempeno": {
        "Durabilidad": 70,
        "Agarre en mojado": 68,
        "Silencio": 66,
        "Fuera de asfalto": 12
      },
      "etiqueta": "Mejor precio",
      "moneda": "USD",
      "montajeIncluido": true,
      "activo": true,
      "actualizadoEn": "2026-08-28T00:00:00Z"
    },
    {
      "sku": "GEN-19560R15-ALTIMA",
      "marca": "General Tire",
      "nombre": "Altimax RT43",
      "categoria": "Carro",
      "medida": "195/60R15",
      "precio": 95.0,
      "precioAnterior": null,
      "stock": 4,
      "descripcion": "General Tire Altimax RT43 en medida 195/60R15 88H. Pensado para tráfico urbano, autopista. Gama media: rendimiento equilibrado a un precio razonable. Producto nuevo, sellado y con garantía de fábrica. El precio publicado incluye montaje y balanceo en la cauchera aliada.",
      "imagenes": [
        {
          "url": "img/productos/gen-19560r15-altima.jpg",
          "alt": "General Tire Altimax RT43 195/60R15",
          "principal": true
        }
      ],
      "vehiculosCompatibles": [
        {
          "marca": "CHEVROLET",
          "modelo": "OPTRA",
          "anioDesde": 2003,
          "anioHasta": 2018
        },
        {
          "marca": "FORD",
          "modelo": "FIESTA",
          "anioDesde": 1996,
          "anioHasta": 2019
        }
      ],
      "indiceCarga": "88H",
      "gama": "Media",
      "usos": [
        "Ciudad",
        "Carretera"
      ],
      "desempeno": {
        "Durabilidad": 78,
        "Agarre en mojado": 74,
        "Silencio": 72,
        "Fuera de asfalto": 14
      },
      "etiqueta": null,
      "moneda": "USD",
      "montajeIncluido": true,
      "activo": true,
      "actualizadoEn": "2026-08-28T00:00:00Z"
    },
    {
      "sku": "PIR-20555R16-POWERG",
      "marca": "Pirelli",
      "nombre": "Powergy",
      "categoria": "Carro",
      "medida": "205/55R16",
      "precio": 126.0,
      "precioAnterior": null,
      "stock": 34,
      "descripcion": "Pirelli Powergy en medida 205/55R16 91V. Pensado para tráfico urbano, autopista. Gama alta: la mejor relación entre duración, silencio y agarre. Producto nuevo, sellado y con garantía de fábrica. El precio publicado incluye montaje y balanceo en la cauchera aliada.",
      "imagenes": [
        {
          "url": "img/productos/pir-20555r16-powerg.jpg",
          "alt": "Pirelli Powergy 205/55R16",
          "principal": true
        }
      ],
      "vehiculosCompatibles": [
        {
          "marca": "TOYOTA",
          "modelo": "COROLLA",
          "anioDesde": 2020,
          "anioHasta": 2026
        }
      ],
      "indiceCarga": "91V",
      "gama": "Premium",
      "usos": [
        "Ciudad",
        "Carretera"
      ],
      "desempeno": {
        "Durabilidad": 80,
        "Agarre en mojado": 86,
        "Silencio": 84,
        "Fuera de asfalto": 16
      },
      "etiqueta": null,
      "moneda": "USD",
      "montajeIncluido": true,
      "activo": true,
      "actualizadoEn": "2026-08-28T00:00:00Z"
    },
    {
      "sku": "MIC-20555R16-PRIMAC",
      "marca": "Michelin",
      "nombre": "Primacy 4",
      "categoria": "Carro",
      "medida": "205/55R16",
      "precio": 138.0,
      "precioAnterior": null,
      "stock": 19,
      "descripcion": "Michelin Primacy 4 en medida 205/55R16 91V. Pensado para tráfico urbano, piso mojado. Gama alta: la mejor relación entre duración, silencio y agarre. Producto nuevo, sellado y con garantía de fábrica. El precio publicado incluye montaje y balanceo en la cauchera aliada.",
      "imagenes": [
        {
          "url": "img/productos/mic-20555r16-primac.jpg",
          "alt": "Michelin Primacy 4 205/55R16",
          "principal": true
        }
      ],
      "vehiculosCompatibles": [
        {
          "marca": "TOYOTA",
          "modelo": "COROLLA",
          "anioDesde": 2020,
          "anioHasta": 2026
        }
      ],
      "indiceCarga": "91V",
      "gama": "Premium",
      "usos": [
        "Ciudad",
        "Lluvia"
      ],
      "desempeno": {
        "Durabilidad": 88,
        "Agarre en mojado": 92,
        "Silencio": 88,
        "Fuera de asfalto": 14
      },
      "etiqueta": null,
      "moneda": "USD",
      "montajeIncluido": true,
      "activo": true,
      "actualizadoEn": "2026-08-28T00:00:00Z"
    },
    {
      "sku": "FIR-20555R16-FIREHA",
      "marca": "Firestone",
      "nombre": "Firehawk AS",
      "categoria": "Carro",
      "medida": "205/55R16",
      "precio": 98.0,
      "precioAnterior": null,
      "stock": 26,
      "descripcion": "Firestone Firehawk AS en medida 205/55R16 91H. Pensado para tráfico urbano. Gama media: rendimiento equilibrado a un precio razonable. Producto nuevo, sellado y con garantía de fábrica. El precio publicado incluye montaje y balanceo en la cauchera aliada.",
      "imagenes": [
        {
          "url": "img/productos/fir-20555r16-fireha.jpg",
          "alt": "Firestone Firehawk AS 205/55R16",
          "principal": true
        }
      ],
      "vehiculosCompatibles": [
        {
          "marca": "TOYOTA",
          "modelo": "COROLLA",
          "anioDesde": 2020,
          "anioHasta": 2026
        }
      ],
      "indiceCarga": "91H",
      "gama": "Media",
      "usos": [
        "Ciudad"
      ],
      "desempeno": {
        "Durabilidad": 72,
        "Agarre en mojado": 70,
        "Silencio": 70,
        "Fuera de asfalto": 12
      },
      "etiqueta": null,
      "moneda": "USD",
      "montajeIncluido": true,
      "activo": true,
      "actualizadoEn": "2026-08-28T00:00:00Z"
    },
    {
      "sku": "BFG-21565R16-ADVANT",
      "marca": "BFGoodrich",
      "nombre": "Advantage T/A",
      "categoria": "Camioneta",
      "medida": "215/65R16",
      "precio": 116.0,
      "precioAnterior": null,
      "stock": 31,
      "descripcion": "BFGoodrich Advantage T/A en medida 215/65R16 98H. Pensado para tráfico urbano, autopista. Gama media: rendimiento equilibrado a un precio razonable. Producto nuevo, sellado y con garantía de fábrica. El precio publicado incluye montaje y balanceo en la cauchera aliada.",
      "imagenes": [
        {
          "url": "img/productos/bfg-21565r16-advant.jpg",
          "alt": "BFGoodrich Advantage T/A 215/65R16",
          "principal": true
        }
      ],
      "vehiculosCompatibles": [],
      "indiceCarga": "98H",
      "gama": "Media",
      "usos": [
        "Ciudad",
        "Carretera"
      ],
      "desempeno": {
        "Durabilidad": 80,
        "Agarre en mojado": 76,
        "Silencio": 74,
        "Fuera de asfalto": 30
      },
      "etiqueta": null,
      "moneda": "USD",
      "montajeIncluido": true,
      "activo": true,
      "actualizadoEn": "2026-08-28T00:00:00Z"
    },
    {
      "sku": "MIC-26565R17-LTXFOR",
      "marca": "Michelin",
      "nombre": "LTX Force",
      "categoria": "4x4",
      "medida": "265/65R17",
      "precio": 196.0,
      "precioAnterior": 218.0,
      "stock": 17,
      "descripcion": "Michelin LTX Force en medida 265/65R17 112H. Pensado para autopista, terreno irregular. Gama alta: la mejor relación entre duración, silencio y agarre. Producto nuevo, sellado y con garantía de fábrica. El precio publicado incluye montaje y balanceo en la cauchera aliada.",
      "imagenes": [
        {
          "url": "img/productos/mic-26565r17-ltxfor.jpg",
          "alt": "Michelin LTX Force 265/65R17",
          "principal": true
        }
      ],
      "vehiculosCompatibles": [
        {
          "marca": "TOYOTA",
          "modelo": "FORTUNER",
          "anioDesde": 2005,
          "anioHasta": 2021
        },
        {
          "marca": "TOYOTA",
          "modelo": "HILUX",
          "anioDesde": 2019,
          "anioHasta": 2026
        },
        {
          "marca": "CHEVROLET",
          "modelo": "SILVERADO",
          "anioDesde": 1999,
          "anioHasta": 2026
        },
        {
          "marca": "FORD",
          "modelo": "F 150",
          "anioDesde": 1990,
          "anioHasta": 2026
        }
      ],
      "indiceCarga": "112H",
      "gama": "Premium",
      "usos": [
        "Carretera",
        "Trocha"
      ],
      "desempeno": {
        "Durabilidad": 90,
        "Agarre en mojado": 78,
        "Silencio": 70,
        "Fuera de asfalto": 72
      },
      "etiqueta": "Recomendado",
      "moneda": "USD",
      "montajeIncluido": true,
      "activo": true,
      "actualizadoEn": "2026-08-28T00:00:00Z"
    },
    {
      "sku": "BFG-26565R17-ALLTER",
      "marca": "BFGoodrich",
      "nombre": "All-Terrain KO2",
      "categoria": "4x4",
      "medida": "265/65R17",
      "precio": 224.0,
      "precioAnterior": null,
      "stock": 3,
      "descripcion": "BFGoodrich All-Terrain KO2 en medida 265/65R17 112S. Pensado para terreno irregular, autopista. Gama alta: la mejor relación entre duración, silencio y agarre. Producto nuevo, sellado y con garantía de fábrica. El precio publicado incluye montaje y balanceo en la cauchera aliada.",
      "imagenes": [
        {
          "url": "img/productos/bfg-26565r17-allter.jpg",
          "alt": "BFGoodrich All-Terrain KO2 265/65R17",
          "principal": true
        }
      ],
      "vehiculosCompatibles": [
        {
          "marca": "TOYOTA",
          "modelo": "FORTUNER",
          "anioDesde": 2005,
          "anioHasta": 2021
        },
        {
          "marca": "TOYOTA",
          "modelo": "HILUX",
          "anioDesde": 2019,
          "anioHasta": 2026
        },
        {
          "marca": "CHEVROLET",
          "modelo": "SILVERADO",
          "anioDesde": 1999,
          "anioHasta": 2026
        },
        {
          "marca": "FORD",
          "modelo": "F 150",
          "anioDesde": 1990,
          "anioHasta": 2026
        }
      ],
      "indiceCarga": "112S",
      "gama": "Premium",
      "usos": [
        "Trocha",
        "Carretera"
      ],
      "desempeno": {
        "Durabilidad": 92,
        "Agarre en mojado": 70,
        "Silencio": 52,
        "Fuera de asfalto": 94
      },
      "etiqueta": null,
      "moneda": "USD",
      "montajeIncluido": true,
      "activo": true,
      "actualizadoEn": "2026-08-28T00:00:00Z"
    },
    {
      "sku": "GEN-26565R17-GRABBE",
      "marca": "General Tire",
      "nombre": "Grabber AT/X",
      "categoria": "4x4",
      "medida": "265/65R17",
      "precio": 172.0,
      "precioAnterior": null,
      "stock": 24,
      "descripcion": "General Tire Grabber AT/X en medida 265/65R17 112T. Pensado para terreno irregular. Gama media: rendimiento equilibrado a un precio razonable. Producto nuevo, sellado y con garantía de fábrica. El precio publicado incluye montaje y balanceo en la cauchera aliada.",
      "imagenes": [
        {
          "url": "img/productos/gen-26565r17-grabbe.jpg",
          "alt": "General Tire Grabber AT/X 265/65R17",
          "principal": true
        }
      ],
      "vehiculosCompatibles": [
        {
          "marca": "TOYOTA",
          "modelo": "FORTUNER",
          "anioDesde": 2005,
          "anioHasta": 2021
        },
        {
          "marca": "TOYOTA",
          "modelo": "HILUX",
          "anioDesde": 2019,
          "anioHasta": 2026
        },
        {
          "marca": "CHEVROLET",
          "modelo": "SILVERADO",
          "anioDesde": 1999,
          "anioHasta": 2026
        },
        {
          "marca": "FORD",
          "modelo": "F 150",
          "anioDesde": 1990,
          "anioHasta": 2026
        }
      ],
      "indiceCarga": "112T",
      "gama": "Media",
      "usos": [
        "Trocha"
      ],
      "desempeno": {
        "Durabilidad": 84,
        "Agarre en mojado": 68,
        "Silencio": 56,
        "Fuera de asfalto": 86
      },
      "etiqueta": null,
      "moneda": "USD",
      "montajeIncluido": true,
      "activo": true,
      "actualizadoEn": "2026-08-28T00:00:00Z"
    },
    {
      "sku": "FIR-23570R16-DESTIN",
      "marca": "Firestone",
      "nombre": "Destination LE3",
      "categoria": "Camioneta",
      "medida": "235/70R16",
      "precio": 132.0,
      "precioAnterior": null,
      "stock": 12,
      "descripcion": "Firestone Destination LE3 en medida 235/70R16 106T. Pensado para tráfico urbano, autopista. Gama media: rendimiento equilibrado a un precio razonable. Producto nuevo, sellado y con garantía de fábrica. El precio publicado incluye montaje y balanceo en la cauchera aliada.",
      "imagenes": [
        {
          "url": "img/productos/fir-23570r16-destin.jpg",
          "alt": "Firestone Destination LE3 235/70R16",
          "principal": true
        }
      ],
      "vehiculosCompatibles": [],
      "indiceCarga": "106T",
      "gama": "Media",
      "usos": [
        "Ciudad",
        "Carretera"
      ],
      "desempeno": {
        "Durabilidad": 76,
        "Agarre en mojado": 78,
        "Silencio": 76,
        "Fuera de asfalto": 28
      },
      "etiqueta": null,
      "moneda": "USD",
      "montajeIncluido": true,
      "activo": true,
      "actualizadoEn": "2026-08-28T00:00:00Z"
    },
    {
      "sku": "BFG-24575R16-COMMER",
      "marca": "BFGoodrich",
      "nombre": "Commercial T/A",
      "categoria": "Pick-up",
      "medida": "245/75R16",
      "precio": 158.0,
      "precioAnterior": null,
      "stock": 40,
      "descripcion": "BFGoodrich Commercial T/A en medida 245/75R16 120R. Pensado para trabajo con carga, autopista. Gama media: rendimiento equilibrado a un precio razonable. Producto nuevo, sellado y con garantía de fábrica. El precio publicado incluye montaje y balanceo en la cauchera aliada.",
      "imagenes": [
        {
          "url": "img/productos/bfg-24575r16-commer.jpg",
          "alt": "BFGoodrich Commercial T/A 245/75R16",
          "principal": true
        }
      ],
      "vehiculosCompatibles": [],
      "indiceCarga": "120R",
      "gama": "Media",
      "usos": [
        "Carga",
        "Carretera"
      ],
      "desempeno": {
        "Durabilidad": 90,
        "Agarre en mojado": 66,
        "Silencio": 58,
        "Fuera de asfalto": 60
      },
      "etiqueta": null,
      "moneda": "USD",
      "montajeIncluido": true,
      "activo": true,
      "actualizadoEn": "2026-08-28T00:00:00Z"
    },
    {
      "sku": "PIR-24570R16-SCORPI",
      "marca": "Pirelli",
      "nombre": "Scorpion ATR",
      "categoria": "Pick-up",
      "medida": "245/70R16",
      "precio": 168.0,
      "precioAnterior": null,
      "stock": 0,
      "descripcion": "Pirelli Scorpion ATR en medida 245/70R16 111S. Pensado para terreno irregular, trabajo con carga. Gama alta: la mejor relación entre duración, silencio y agarre. Producto nuevo, sellado y con garantía de fábrica. El precio publicado incluye montaje y balanceo en la cauchera aliada.",
      "imagenes": [
        {
          "url": "img/productos/pir-24570r16-scorpi.jpg",
          "alt": "Pirelli Scorpion ATR 245/70R16",
          "principal": true
        }
      ],
      "vehiculosCompatibles": [
        {
          "marca": "TOYOTA",
          "modelo": "HILUX",
          "anioDesde": 1990,
          "anioHasta": 2018
        }
      ],
      "indiceCarga": "111S",
      "gama": "Premium",
      "usos": [
        "Trocha",
        "Carga"
      ],
      "desempeno": {
        "Durabilidad": 82,
        "Agarre en mojado": 72,
        "Silencio": 62,
        "Fuera de asfalto": 78
      },
      "etiqueta": null,
      "moneda": "USD",
      "montajeIncluido": true,
      "activo": true,
      "actualizadoEn": "2026-08-28T00:00:00Z"
    },
    {
      "sku": "MIC-19575R16-AGILIS",
      "marca": "Michelin",
      "nombre": "Agilis 3",
      "categoria": "Carga",
      "medida": "195/75R16",
      "precio": 148.0,
      "precioAnterior": null,
      "stock": 15,
      "descripcion": "Michelin Agilis 3 en medida 195/75R16 107R. Pensado para trabajo con carga, tráfico urbano. Gama alta: la mejor relación entre duración, silencio y agarre. Producto nuevo, sellado y con garantía de fábrica. El precio publicado incluye montaje y balanceo en la cauchera aliada.",
      "imagenes": [
        {
          "url": "img/productos/mic-19575r16-agilis.jpg",
          "alt": "Michelin Agilis 3 195/75R16",
          "principal": true
        }
      ],
      "vehiculosCompatibles": [],
      "indiceCarga": "107R",
      "gama": "Premium",
      "usos": [
        "Carga",
        "Ciudad"
      ],
      "desempeno": {
        "Durabilidad": 92,
        "Agarre en mojado": 74,
        "Silencio": 64,
        "Fuera de asfalto": 22
      },
      "etiqueta": null,
      "moneda": "USD",
      "montajeIncluido": true,
      "activo": true,
      "actualizadoEn": "2026-08-28T00:00:00Z"
    },
    {
      "sku": "GEN-18565R14-EVERTR",
      "marca": "General Tire",
      "nombre": "Evertrek RT",
      "categoria": "Carro",
      "medida": "185/65R14",
      "precio": 68.0,
      "precioAnterior": 79.0,
      "stock": 21,
      "descripcion": "General Tire Evertrek RT en medida 185/65R14 86H. Pensado para tráfico urbano. Gama de entrada: la opción más accesible sin sacrificar seguridad. Producto nuevo, sellado y con garantía de fábrica. El precio publicado incluye montaje y balanceo en la cauchera aliada.",
      "imagenes": [
        {
          "url": "img/productos/gen-18565r14-evertr.jpg",
          "alt": "General Tire Evertrek RT 185/65R14",
          "principal": true
        }
      ],
      "vehiculosCompatibles": [
        {
          "marca": "TOYOTA",
          "modelo": "YARIS",
          "anioDesde": 1999,
          "anioHasta": 2017
        },
        {
          "marca": "CHEVROLET",
          "modelo": "AVEO",
          "anioDesde": 2003,
          "anioHasta": 2020
        },
        {
          "marca": "HYUNDAI",
          "modelo": "ACCENT",
          "anioDesde": 1995,
          "anioHasta": 2017
        }
      ],
      "indiceCarga": "86H",
      "gama": "Económica",
      "usos": [
        "Ciudad"
      ],
      "desempeno": {
        "Durabilidad": 62,
        "Agarre en mojado": 60,
        "Silencio": 62,
        "Fuera de asfalto": 10
      },
      "etiqueta": "Mejor precio",
      "moneda": "USD",
      "montajeIncluido": true,
      "activo": true,
      "actualizadoEn": "2026-08-28T00:00:00Z"
    },
    {
      "sku": "FIR-18565R14-MULTIH",
      "marca": "Firestone",
      "nombre": "Multihawk 2",
      "categoria": "Carro",
      "medida": "185/65R14",
      "precio": 72.0,
      "precioAnterior": null,
      "stock": 33,
      "descripcion": "Firestone Multihawk 2 en medida 185/65R14 86H. Pensado para tráfico urbano. Gama de entrada: la opción más accesible sin sacrificar seguridad. Producto nuevo, sellado y con garantía de fábrica. El precio publicado incluye montaje y balanceo en la cauchera aliada.",
      "imagenes": [
        {
          "url": "img/productos/fir-18565r14-multih.jpg",
          "alt": "Firestone Multihawk 2 185/65R14",
          "principal": true
        }
      ],
      "vehiculosCompatibles": [
        {
          "marca": "TOYOTA",
          "modelo": "YARIS",
          "anioDesde": 1999,
          "anioHasta": 2017
        },
        {
          "marca": "CHEVROLET",
          "modelo": "AVEO",
          "anioDesde": 2003,
          "anioHasta": 2020
        },
        {
          "marca": "HYUNDAI",
          "modelo": "ACCENT",
          "anioDesde": 1995,
          "anioHasta": 2017
        }
      ],
      "indiceCarga": "86H",
      "gama": "Económica",
      "usos": [
        "Ciudad"
      ],
      "desempeno": {
        "Durabilidad": 64,
        "Agarre en mojado": 64,
        "Silencio": 64,
        "Fuera de asfalto": 10
      },
      "etiqueta": null,
      "moneda": "USD",
      "montajeIncluido": true,
      "activo": true,
      "actualizadoEn": "2026-08-28T00:00:00Z"
    },
    {
      "sku": "PIR-21565R16-SCORPI",
      "marca": "Pirelli",
      "nombre": "Scorpion HT",
      "categoria": "Camioneta",
      "medida": "215/65R16",
      "precio": 142.0,
      "precioAnterior": null,
      "stock": 18,
      "descripcion": "Pirelli Scorpion HT en medida 215/65R16 98H. Pensado para tráfico urbano, autopista. Gama alta: la mejor relación entre duración, silencio y agarre. Producto nuevo, sellado y con garantía de fábrica. El precio publicado incluye montaje y balanceo en la cauchera aliada.",
      "imagenes": [
        {
          "url": "img/productos/pir-21565r16-scorpi.jpg",
          "alt": "Pirelli Scorpion HT 215/65R16",
          "principal": true
        }
      ],
      "vehiculosCompatibles": [],
      "indiceCarga": "98H",
      "gama": "Premium",
      "usos": [
        "Ciudad",
        "Carretera"
      ],
      "desempeno": {
        "Durabilidad": 82,
        "Agarre en mojado": 82,
        "Silencio": 82,
        "Fuera de asfalto": 26
      },
      "etiqueta": null,
      "moneda": "USD",
      "montajeIncluido": true,
      "activo": true,
      "actualizadoEn": "2026-08-28T00:00:00Z"
    },
    {
      "sku": "MIC-23570R16-DEFEND",
      "marca": "Michelin",
      "nombre": "Defender LTX",
      "categoria": "Camioneta",
      "medida": "235/70R16",
      "precio": 164.0,
      "precioAnterior": null,
      "stock": 25,
      "descripcion": "Michelin Defender LTX en medida 235/70R16 106T. Pensado para autopista, piso mojado. Gama alta: la mejor relación entre duración, silencio y agarre. Producto nuevo, sellado y con garantía de fábrica. El precio publicado incluye montaje y balanceo en la cauchera aliada.",
      "imagenes": [
        {
          "url": "img/productos/mic-23570r16-defend.jpg",
          "alt": "Michelin Defender LTX 235/70R16",
          "principal": true
        }
      ],
      "vehiculosCompatibles": [],
      "indiceCarga": "106T",
      "gama": "Premium",
      "usos": [
        "Carretera",
        "Lluvia"
      ],
      "desempeno": {
        "Durabilidad": 90,
        "Agarre en mojado": 86,
        "Silencio": 80,
        "Fuera de asfalto": 30
      },
      "etiqueta": null,
      "moneda": "USD",
      "montajeIncluido": true,
      "activo": true,
      "actualizadoEn": "2026-08-28T00:00:00Z"
    },
    {
      "sku": "MIC-19565R15-ENERGY",
      "marca": "Michelin",
      "nombre": "Energy XM2+",
      "categoria": "Carro",
      "medida": "195/65R15",
      "precio": 118.0,
      "precioAnterior": 132.0,
      "stock": 29,
      "descripcion": "Michelin Energy XM2+ en medida 195/65R15 91H. Pensado para tráfico urbano, piso mojado. Gama alta: la mejor relación entre duración, silencio y agarre. Producto nuevo, sellado y con garantía de fábrica. El precio publicado incluye montaje y balanceo en la cauchera aliada.",
      "imagenes": [
        {
          "url": "img/productos/mic-19565r15-energy.jpg",
          "alt": "Michelin Energy XM2+ 195/65R15",
          "principal": true
        }
      ],
      "vehiculosCompatibles": [
        {
          "marca": "TOYOTA",
          "modelo": "COROLLA",
          "anioDesde": 1990,
          "anioHasta": 2019
        },
        {
          "marca": "HYUNDAI",
          "modelo": "ACCENT",
          "anioDesde": 2018,
          "anioHasta": 2026
        }
      ],
      "indiceCarga": "91H",
      "gama": "Premium",
      "usos": [
        "Ciudad",
        "Lluvia"
      ],
      "desempeno": {
        "Durabilidad": 85,
        "Agarre en mojado": 88,
        "Silencio": 82,
        "Fuera de asfalto": 15
      },
      "etiqueta": "Más vendido",
      "moneda": "USD",
      "montajeIncluido": true,
      "activo": true,
      "actualizadoEn": "2026-08-28T00:00:00Z"
    },
    {
      "sku": "GEN-19565R15-ALTIMA",
      "marca": "General Tire",
      "nombre": "Altimax RT43",
      "categoria": "Carro",
      "medida": "195/65R15",
      "precio": 99.0,
      "precioAnterior": 112.0,
      "stock": 16,
      "descripcion": "General Tire Altimax RT43 en medida 195/65R15 91H. Pensado para tráfico urbano, autopista. Gama media: rendimiento equilibrado a un precio razonable. Producto nuevo, sellado y con garantía de fábrica. El precio publicado incluye montaje y balanceo en la cauchera aliada.",
      "imagenes": [
        {
          "url": "img/productos/gen-19565r15-altima.jpg",
          "alt": "General Tire Altimax RT43 195/65R15",
          "principal": true
        }
      ],
      "vehiculosCompatibles": [
        {
          "marca": "TOYOTA",
          "modelo": "COROLLA",
          "anioDesde": 1990,
          "anioHasta": 2019
        },
        {
          "marca": "HYUNDAI",
          "modelo": "ACCENT",
          "anioDesde": 2018,
          "anioHasta": 2026
        }
      ],
      "indiceCarga": "91H",
      "gama": "Media",
      "usos": [
        "Ciudad",
        "Carretera"
      ],
      "desempeno": {
        "Durabilidad": 78,
        "Agarre en mojado": 74,
        "Silencio": 72,
        "Fuera de asfalto": 14
      },
      "etiqueta": null,
      "moneda": "USD",
      "montajeIncluido": true,
      "activo": true,
      "actualizadoEn": "2026-08-28T00:00:00Z"
    },
    {
      "sku": "FIR-19565R15-F700",
      "marca": "Firestone",
      "nombre": "F-700",
      "categoria": "Carro",
      "medida": "195/65R15",
      "precio": 88.0,
      "precioAnterior": 99.0,
      "stock": 23,
      "descripcion": "Firestone F-700 en medida 195/65R15 91H. Pensado para tráfico urbano. Gama de entrada: la opción más accesible sin sacrificar seguridad. Producto nuevo, sellado y con garantía de fábrica. El precio publicado incluye montaje y balanceo en la cauchera aliada.",
      "imagenes": [
        {
          "url": "img/productos/fir-19565r15-f700.jpg",
          "alt": "Firestone F-700 195/65R15",
          "principal": true
        }
      ],
      "vehiculosCompatibles": [
        {
          "marca": "TOYOTA",
          "modelo": "COROLLA",
          "anioDesde": 1990,
          "anioHasta": 2019
        },
        {
          "marca": "HYUNDAI",
          "modelo": "ACCENT",
          "anioDesde": 2018,
          "anioHasta": 2026
        }
      ],
      "indiceCarga": "91H",
      "gama": "Económica",
      "usos": [
        "Ciudad"
      ],
      "desempeno": {
        "Durabilidad": 70,
        "Agarre en mojado": 68,
        "Silencio": 66,
        "Fuera de asfalto": 12
      },
      "etiqueta": "Mejor precio",
      "moneda": "USD",
      "montajeIncluido": true,
      "activo": true,
      "actualizadoEn": "2026-08-28T00:00:00Z"
    }
  ]
};
