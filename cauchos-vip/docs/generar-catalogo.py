# -*- coding: utf-8 -*-
"""Convierte el catálogo de ejemplo al esquema de producto definitivo
   y genera el payload con la forma exacta que devolverá la API."""
import json, re, datetime, unicodedata

P = json.load(open('/home/claude/cauchos-vip/data/productos.json', encoding='utf-8'))
MED = json.load(open('/home/claude/cauchos-vip/data/medidas.json', encoding='utf-8'))

ABR = {'Michelin': 'MIC', 'BFGoodrich': 'BFG', 'Firestone': 'FIR',
       'General Tire': 'GEN', 'Pirelli': 'PIR'}

def slug_modelo(n):
    s = unicodedata.normalize('NFKD', n).encode('ascii', 'ignore').decode()
    s = re.sub(r'[^A-Za-z0-9]', '', s).upper()
    return s[:6]

def sku(p):
    med = p['s'].replace('/', '').replace('R', 'R')
    return f"{ABR[p['b']]}-{med}-{slug_modelo(p['n'])}"

# medida → vehículos compatibles (se deriva de la tabla de medidas de fábrica)
compat = {}
for clave, rangos in MED.items():
    marca, modelo = clave.split('|')
    for desde, hasta, medida in rangos:
        compat.setdefault(medida, []).append(
            {'marca': marca, 'modelo': modelo, 'anioDesde': desde, 'anioHasta': hasta})

# stock de ejemplo, determinista
STOCK = {'ok': [28, 22, 34, 19, 26, 31, 17, 24, 12, 40, 15, 21, 33, 18, 25, 29, 16, 23, 27, 20, 36],
         'warn': [4, 3, 5, 2], 'bad': [0]}
ci = {'ok': 0, 'warn': 0, 'bad': 0}

USO_TXT = {
    'Ciudad': 'tráfico urbano', 'Carretera': 'autopista', 'Lluvia': 'piso mojado',
    'Trocha': 'terreno irregular', 'Carga': 'trabajo con carga'
}
GAMA_TXT = {
    'Premium': 'Gama alta: la mejor relación entre duración, silencio y agarre.',
    'Media': 'Gama media: rendimiento equilibrado a un precio razonable.',
    'Económica': 'Gama de entrada: la opción más accesible sin sacrificar seguridad.'
}
# precio anterior de ejemplo, solo en los productos en promoción
PROMO = {1: 128, 2: 96, 8: 218, 15: 79, 19: 132, 20: 112, 21: 99}

hoy = '2026-08-28T00:00:00Z'
out = []
for p in P:
    s = sku(p)
    ests = STOCK[p['st']]
    stock = ests[ci[p['st']] % len(ests)]; ci[p['st']] += 1
    usos = ', '.join(USO_TXT.get(u, u.lower()) for u in p['u'])
    desc = (f"{p['b']} {p['n']} en medida {p['s']} {p['li']}. "
            f"Pensado para {usos}. {GAMA_TXT[p['g']]} "
            f"Producto nuevo, sellado y con garantía de fábrica. "
            f"El precio publicado incluye montaje y balanceo en la cauchera aliada.")
    prod = {
        'sku': s,
        'marca': p['b'],
        'nombre': p['n'],
        'categoria': p['t'],
        'medida': p['s'],
        'precio': float(p['px']),
        'precioAnterior': float(PROMO[p['id']]) if p['id'] in PROMO else None,
        'stock': stock,
        'descripcion': desc,
        'imagenes': [
            {'url': f"img/productos/{s.lower()}.jpg",
             'alt': f"{p['b']} {p['n']} {p['s']}", 'principal': True}
        ],
        'vehiculosCompatibles': compat.get(p['s'], []),
        # ---- opcionales ----
        'indiceCarga': p['li'],
        'gama': p['g'],
        'usos': p['u'],
        'desempeno': p['perf'],
        'etiqueta': p.get('tag'),
        'moneda': 'USD',
        'montajeIncluido': True,
        'activo': True,
        'actualizadoEn': hoy
    }
    out.append(prod)

skus = [x['sku'] for x in out]
assert len(skus) == len(set(skus)), 'SKU duplicado: ' + str([x for x in skus if skus.count(x) > 1])

payload = {
    'meta': {
        'version': '1.0',
        'generadoEn': hoy,
        'moneda': 'USD',
        'fuente': 'mock-local',
        'total': len(out),
        'pagina': 1,
        'porPagina': len(out),
        'paginas': 1
    },
    'data': out
}

RUTA = '/home/claude/cauchos-vip/data/catalogo.json'
json.dump(payload, open(RUTA, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)

# copia embebida, para que el sitio también funcione abierto con doble clic (file://)
js = ('/* ============================================================\n'
      '   Cauchos VIP — catálogo mock embebido\n'
      '   ------------------------------------------------------------\n'
      '   Copia EXACTA de data/catalogo.json. Existe por una sola razón:\n'
      '   fetch() no puede leer archivos locales cuando la página se abre\n'
      '   con doble clic (file://). El adaptador local intenta primero el\n'
      '   JSON y cae aquí si no puede.\n'
      '   Se regenera con  docs/generar-catalogo.py  — no editar a mano.\n'
      '   ============================================================ */\n\n'
      'window.__VIP_CATALOGO_MOCK__ = ' +
      json.dumps(payload, ensure_ascii=False, indent=2) + ';\n')
open('/home/claude/cauchos-vip/js/data/mock-catalogo.js', 'w', encoding='utf-8').write(js)

con = sum(1 for x in out if x['vehiculosCompatibles'])
print(f'productos: {len(out)} · con vehículos compatibles: {con} · con precio anterior: {len(PROMO)}')
print('ejemplo de SKU:', skus[0], '|', skus[8])
