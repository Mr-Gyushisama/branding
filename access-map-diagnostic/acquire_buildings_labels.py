#!/usr/bin/env python3
"""Acquire, without altering, georeferenced GSI building polygons and official map labels."""
import concurrent.futures, datetime, hashlib, json, math, urllib.request
from pathlib import Path
import mapbox_vector_tile

ROOT=Path("access-map-building-evidence")
ROOT.mkdir(exist_ok=True)
Z=15
TARGET=(136.879676298,35.191603876)
BBOX=(136.86775,35.18130,136.8973,35.1950)
BASE="https://cyberjapandata.gsi.go.jp/xyz/experimental_bvmap/{z}/{x}/{y}.pbf"

def tile_xy(lon,lat):
    n=2**Z
    return int((lon+180)/360*n),int((1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*n)
def lnglat(x,y,tx,ty,extent):
    a=(tx+x/extent)/2**Z
    b=(ty+y/extent)/2**Z
    return [round(a*360-180,10),round(math.degrees(math.atan(math.sinh(math.pi*(1-2*b)))),10)]
def trans(obj,tx,ty,extent):
    if isinstance(obj,(list,tuple)) and len(obj)==2 and all(isinstance(z,(int,float)) for z in obj):
        return lnglat(obj[0],obj[1],tx,ty,extent)
    return [trans(v,tx,ty,extent) for v in obj]
def positions(x):
    if isinstance(x,list) and len(x)==2 and all(isinstance(v,(int,float)) for v in x):
        yield x
    elif isinstance(x,list):
        for v in x: yield from positions(v)
def inside(g):
    w,s,e,n=BBOX
    return any(w<=p[0]<=e and s<=p[1]<=n for p in positions(g))
def worker(pair):
    tx,ty=pair;url=BASE.format(z=Z,x=tx,y=ty)
    req=urllib.request.Request(url,headers={"User-Agent":"HomePlanner-cartography-source-check/1.0"})
    with urllib.request.urlopen(req,timeout=60) as resp:
        if resp.status!=200: raise RuntimeError(str(resp.status))
        raw=resp.read(9_000_000)
    if len(raw)>8_500_000:raise ValueError("Unexpectedly large tile")
    layers=mapbox_vector_tile.decode(raw,default_options={"y_coord_down":True})
    buildings=[]; labels=[]
    for family,output in (("building",buildings),("label",labels)):
        layer=layers.get(family,{})
        extent=layer.get("extent",4096)
        for index,f in enumerate(layer.get("features",[])):
            geom=f.get("geometry") or {}
            if family=="building" and geom.get("type") not in ("Polygon","MultiPolygon"):
                continue
            if family=="label" and geom.get("type") not in ("Point","MultiPoint"):
                continue
            coords=trans(geom.get("coordinates",[]),tx,ty,extent)
            if not inside(coords):continue
            props=f.get("properties") or {}
            if family=="label" and not props.get("knj"):continue
            if family=="building":
                props={k:props.get(k) for k in ("ftCode","orgGILvl","lvOrder") if k in props}
            output.append({"type":"Feature","id":f"{Z}/{tx}/{ty}/{index}",
                "properties":props,
                "geometry":{"type":geom["type"],"coordinates":coords}})
    return {"x":tx,"y":ty,"url":url,"sha256":hashlib.sha256(raw).hexdigest(),"buildings":buildings,"labels":labels}

cx,cy=tile_xy(*TARGET)
pairs=[(cx+dx,cy+dy) for dx in range(-2,3) for dy in range(-2,3)]
allb=[];alll=[];errors=[];evidence=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    futures={pool.submit(worker,p):p for p in pairs}
    for future in concurrent.futures.as_completed(futures):
        try:
            x=future.result()
            allb.extend(x.pop("buildings"));alll.extend(x.pop("labels"))
            evidence.append(x)
        except Exception as exc:
            errors.append({"tile":futures[future],"error":type(exc).__name__+": "+str(exc)[:200]})
if errors or len(evidence)!=len(pairs):
    raise RuntimeError("Missing source tiles: "+str(errors))
for name,features in (("gsi-buildings.geojson",allb),("gsi-labels.geojson",alll)):
    (ROOT/name).write_text(json.dumps({"type":"FeatureCollection","features":features},ensure_ascii=False,separators=(",",":")),encoding="utf-8")
labels=[{"name":f["properties"].get("knj"),"category":f["properties"].get("annoCtg"),
         "ftCode":f["properties"].get("ftCode"),"coordinates":f["geometry"]["coordinates"]}
        for f in alll]
(ROOT/"facility-name-candidates.json").write_text(json.dumps(labels,ensure_ascii=False,indent=2),encoding="utf-8")
manifest={"source":"国土地理院ベクトルタイル提供実験","source_edition":"2026-07-01","attribution":"出典：国土地理院ベクトルタイル提供実験（2026年7月1日時点）／加工：建物形状・注記を抽出",
 "source_url":"https://github.com/gsi-cyberjapan/gsimaps-vector-experiment",
 "terms_url":"https://www.gsi.go.jp/kikakuchousei/kikakuchousei40182.html",
 "retrieved_utc":datetime.datetime.now(datetime.timezone.utc).isoformat(),
 "tile_count":len(evidence),"tile_expected":len(pairs),"tile_coverage_complete":True,
 "tiles":sorted(evidence,key=lambda a:(a["x"],a["y"])),
 "building_count":len(allb),"label_count":len(alll),"bbox":BBOX,"diagnostic_acquisition":True,
 "geometry_inferred":False}
(ROOT/"manifest.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding="utf-8")
print("GSI BUILDINGS",len(allb),"OFFICIAL LABELS",len(alll),"COMPLETE TILES",len(evidence))
print("LANDMARK NAMES",json.dumps([x for x in labels if any(t in str(x["name"]) for t in ["ヨシヅ","学校","高等","中学","郵便","公園","スポーツ","警察","区役所","病院"])][:35],ensure_ascii=False))
