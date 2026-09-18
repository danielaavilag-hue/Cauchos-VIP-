# -*- coding: utf-8 -*-
"""Depuración de la BBDD de vehículos: deja solo automóviles, SUV, pickups y vans ligeras."""
import openpyxl, collections, json, re

SRC='/root/.claude/uploads/0320702e-b85b-590f-bbae-a024aee1d68e/6b9ac9a8-BBDD_Vehiculos.xlsx'

# ---------------------------------------------------------------- marcas que SÍ van
CAR_BRANDS = {
 'ACURA','ALFA ROMEO','AM GENERAL','AMERICAN MOTORS','ARO','ASTON MARTIN','AUDI','BAIC','BAW',
 'BENTLEY','BESTUNE','BMW','BRILLIANCE','BUICK','BYD AUTOS','CADILLAC','CHANA','CHANGAN','CHANGHE',
 'CHERY','CHEVROLET','CHRYSLER','CITROEN','DACIA','DAEWOO','DAIHATSU','DE_LOREAN','DODGE','DONGFENG',
 'EAGLE','FAW','FERRARI','FIAT','FISKER','FORD','FOTON','GEELY','GENESIS','GEO','GMC','GONOW',
 'GREAT WALL MOTORS','HAFEI','HAIMA','HAWTAI','HONDA','HUMMER','HYUNDAI','INFINITI','ISUZU','JAC',
 'JAGUAR','JEEP','JETOUR','JINBEI','JMC','KAIYI','KARRY','KIA','LADA','LAMBORGHINI','LANCIA',
 'LAND ROVER','LANDWIND','LEXUS','LIFAN','LINCOLN','LOTUS','MASERATI','MAXUS','MAYBACH','MAZDA',
 'MERCEDES BENZ','MERCURY','MG','MINI','MITSUBISHI','NISSAN','OLDSMOBILE','OPEL','PEUGEOT','PLYMOUTH',
 'POLARSUN','PONTIAC','PORSCHE','QINGLING','RAM','RELY','RENAULT','ROLLS ROYCE','ROVER','SAAB',
 'SAIC WULING','SATURN','SCION','SEAT','SHUANGHUAN AUTO','SKODA','SMART','SSANGYONG','SUBARU',
 'SUZUKI','TATA','TESLA','TOYOTA','VENIRAUTO','VENUCIA','VOLKSWAGEN','VOLVO','WULING','XPENG',
 'ZHONGXING','ZOTYE',
}

# Marcas mixtas: solo estos modelos son automóviles
ONLY_MODELS = {
 'HONDA': {'ACCORD','CITY','CIVIC','CONCERTO','CR-V','CROSSTOUR','CRZ','ELEMENT','FIT','HR-V',
           'INSIGHT','INTEGRA','JAZZ','LEGEND','ODYSSEY','PASSPORT','PILOT','PRELUDE','PROLOGUE',
           'RIDGELINE','STREAM','VIGOR','WR-V'},
 'SUZUKI': {'AERIO','ALTO','BALENO','CARRY','CELERIO','CIAZ','DZIRE','EECO','EQUATOR','ERTIGA',
            'ESTEEM','FORENZA','FRONX','GRAND VITARA','IGNIS','JIMNY','KIZASHI','LIANA','RENO',
            'S.PRESSO','SAMURAI','SIDEKICK','SUPER CARRY','SWIFT','SX4','VERONA','VITARA','VIVAX',
            'X 90','XL7'},
}

# Modelos que NO van, por marca (camiones pesados, buses, maquinaria)
DROP_MODELS = {
 'BMW': {'C','C1','F','G','HP','K','R','S'},                      # BMW Motorrad
 'MERCEDES BENZ': {'ACCELO','ACTROS','ATEGO','AXOR','L','LA','LK','LN','LO','LS','O405GT','OF','OH',
                   'UNIMOG','VARIO','1218','1418','1718','1720/48','2320','2423','L 1319','L1924',
                   'L2213 42','MB 800','RSD','SCL','SDL'},
 'CHEVROLET': {'C 40','KODIAK','ARGOSY','BRIGADIER','CHASIS','CONDOR','SUPER BRIGADIER','WAYNE TRANSETTE','FSR','FVR',
               'NHR','NKR','NLR','NPR','T6500','T7500','T8500','C 5500','C 6500','C 7000','C 7500',
               'C 8500','C 600','C 50','C 60','C 70','EXR','EXZ','CHR 660','LV','W','R','6200'},
 'FORD': {'B 600','B 750','CARGO','F 4000','F 500','F 600','F 650','F 700','F 7000','F 750','F 800',
          'F 8000','F 900','F5000','F 70','F 47','L','A'},
 'VOLVO': {'F','FH','FL','FM','N','NL','VNL','B'},
 'TOYOTA': {'COASTER','DYNA','GTM','T100'},
 'NISSAN': {'ATLEON','CABSTAR','CONDOR','DIESEL','ECO-T','UD'},
 'ISUZU': {'FTR','FVR','NPR','NKR','NQR','FSR'},
 'JAC': {'HFC','1040','1063','1083'},
 'FOTON': {'AUMARK','AUMAN','OLLIN'},
 'GMC': {'ASTRO','BRIGADIER','GENERAL','TOPKICK','W','B','C 5500','C 6500','C 7000','C 7500'},
 'DODGE': {'D 600','D 700','L 600','L 700','S 600'},
 'HYUNDAI': {'HD','COUNTY','AERO','CHORUS','UNIVERSE','GOLD','SUPER AERO','GLOBAL'},
 'MITSUBISHI': {'BUS','CANTER','FUSO','ROSA','FE','FH','FK','FM','FP','FV','FN','GREAT'},
 'MERCURY': {'BUS'},
 'CHANA': {'BUS'},
 'MAXUS': {'BUS'},
 'KIA': {'COMBI','GRANBIRD','KM','TRADE','COSMOS','ENTERPRISE','CAPITAL','AM','ASIA'},
}

# Modelos basura en cualquier marca
DROP_ANY = {'CAR CARRIER','LOWBOY','REMOLQUE','SEMIREMOLQUE','TANQUE','CHASIS','TANQUE PARA GAS',
            'CISTERNA','BATEA','PLATAFORMA','JAULA','VOLTEO','MIGHTY','TRAGO','SUPER AERO CITY',
            'MINIBUS','BUS','MICROBUS','AUTOBUS','CAMION','GRUA'}

def limpiar():
    wb = openpyxl.load_workbook(SRC, read_only=True, data_only=True)
    ws = wb['Hoja1']
    pares = collections.defaultdict(set)
    total = fuera = 0
    for marca, modelo, anno in ws.iter_rows(min_row=2, values_only=True):
        if not marca or not modelo or not anno: continue
        total += 1
        marca  = str(marca).strip().upper()
        modelo = str(modelo).strip().upper()
        try: anno = int(str(anno).strip())
        except ValueError: continue
        if marca not in CAR_BRANDS:                        fuera += 1; continue
        if modelo in DROP_ANY:                             fuera += 1; continue
        if marca in ONLY_MODELS and modelo not in ONLY_MODELS[marca]: fuera += 1; continue
        if modelo in DROP_MODELS.get(marca, set()):        fuera += 1; continue
        if len(modelo) == 1 and marca not in ('MERCEDES BENZ',):  fuera += 1; continue
        if anno < 1990 or anno > 2026:                     fuera += 1; continue   # parque relevante
        pares[(marca, modelo)].add(anno)
    return pares, total, fuera

def rangos(years):
    ys = sorted(years); out = []; ini = prev = ys[0]
    for y in ys[1:]:
        if y == prev + 1: prev = y
        else: out.append([ini, prev]); ini = prev = y
    out.append([ini, prev]); return out

pares, total, fuera = limpiar()
db = collections.defaultdict(dict)
for (ma, mo), ys in pares.items():
    db[ma][mo] = rangos(ys)
db = {k: dict(sorted(v.items())) for k, v in sorted(db.items())}

n_mod = sum(len(v) for v in db.values())
n_com = sum(sum(b - a + 1 for a, b in r) for v in db.values() for r in v.values())
print(f'Filas originales : {total:,}')
print(f'Descartadas      : {fuera:,}')
print(f'Marcas           : {len(db)}')
print(f'Modelos          : {n_mod:,}')
print(f'Combinaciones    : {n_com:,}')

json.dump(db, open('/home/claude/cauchos-vip/data/vehiculos.json','w',encoding='utf-8'),
          ensure_ascii=False, separators=(',',':'))
print('\nJSON escrito.')
