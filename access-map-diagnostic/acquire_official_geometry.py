#!/usr/bin/env python3
"""Acquire source-backed road/rail evidence. Does NOT create or approve an advertising map."""
from __future__ import annotations
import concurrent.futures, datetime, hashlib, io, json, math, urllib.request, zipfile
from pathlib import Path
import mapbox_vector_tile

LAT, LON = 35.191603876, 136.879676298
Z = 15
N02_URL = "https://nlftp.mlit.go.jp/ksj/gml/data/N02/N02-25/N02-25_GML.zip"
GSI_URL = "https://cyberjapandata.gsi.go.jp/xyz/experimental_bvmap/{z}/{x}/{y}.pbf"
OUT = Path("official-geometry-output")
OUT.mkdir(exist_ok=True)

def get(url, limit=70000000):
    req = urllib.request.Request(url, headers={"User-Agent": "HomePlanner-SourceBackedAccessMap/0.1"})
    with urllib.request.urlopen(req, timeout=75) as resp:
        if resp.status != 200:
            raise RuntimeError(f"HTTP {resp.status}")
        data=resp.read(limit)
        if not data: raise RuntimeError("empty remote response")
        return data

def tile_origin(lon,lat,z):
    n=2**z
    return int((lon+180)/360*n),int((1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*n)

def geo_xy(x,y,tx,ty,extent=4096):
    n=2**Z
    a=(tx+x/extent)/n
    b=(ty+y/extent)/n
    return [360*a-180,math.degrees(math.atan(math.sinh(math.pi*(1-2*b))))]

def extract_pts(geometry,tx,ty,extent=4096):
    kind=geometry.get("type")
    coords=geometry.get("coordinates",[])
    if kind=="LineString":
        return [[geo_xy(p[0],p[1],tx,ty,extent) for p in coords]]
    if kind=="MultiLineString":
        return [[geo_xy(p[0],p[1],tx,ty,extent) for p in line] for line in coords]
    return []

def intersects_bbox(coords,box):
    west,south,east,north=box
    for p in coords:
        if west<=p[0]<=east and south<=p[1]<=north:return True
    return False

def tile_job(loc):
    tx,ty=loc
    url=GSI_URL.format(z=Z,x=tx,y=ty)
    raw=get(url,limit=3000000)
    layers=mapbox_vector_tile.decode(raw,default_options={"y_coord_down":True})
    roads=[]
    road_layer=layers.get("road",{})
    extent=road_layer.get("extent",4096)
    for index,f in enumerate(road_layer.get("features",[])):
        props=f.get("properties") or {}
        for j,line in enumerate(extract_pts(f.get("geometry") or {},tx,ty,extent)):
            if len(line)<2:continue
            roads.append({"type":"Feature","id":f"{Z}/{tx}/{ty}/{index}/{j}",
                          "properties":{"ftCode":props.get("ftCode"),"rdCtg":props.get("rdCtg"),
                                        "rnkWidth":props.get("rnkWidth"),"Width":props.get("Width"),
                                        "lvOrder":props.get("lvOrder"),"tile":f"{Z}/{tx}/{ty}"},
                          "geometry":{"type":"LineString","coordinates":line}})
    labels=[]
    for f in layers.get("label",{}).get("features",[]):
        p=f.get("properties") or {}
        if p.get("knj")=="名西二丁目":
            c=(f.get("geometry") or {}).get("coordinates")
            if isinstance(c,list) and len(c)>=2 and isinstance(c[0],(float,int)):
                labels.append(geo_xy(c[0],c[1],tx,ty,layers["label"].get("extent",4096)))
    return {"x":tx,"y":ty,"url":url,"sha256":hashlib.sha256(raw).hexdigest(),"roads":roads,"labels":labels}

def in_area(coords,lat_margin=0.039,lon_margin=0.060):
    return intersects_bbox(coords,(LON-lon_margin,LAT-lat_margin,LON+lon_margin,LAT+lat_margin))

def intersects_geom(g):
    kind=g.get("type")
    c=g.get("coordinates") or []
    if kind=="LineString":return in_area(c)
    if kind=="MultiLineString":return any(in_area(line) for line in c)
    if kind=="Point":return in_area([c])
    if kind=="MultiPoint":return in_area(c)
    return False

def acquisition():
    report={
        "source_purpose":"evidence_acquisition_only",
        "advertising_approved":False,
        "retrieved_at_utc":datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "target_evidence":{"address":"愛知県名古屋市西区名西二丁目32番16号","lat":LAT,"lon":LON},
        "gsi":{"dataset":"GSI Vector experimental_bvmap","data_as_of":"2026-07-01",
               "source":"https://github.com/gsi-cyberjapan/gsimaps-vector-experiment",
               "terms":"https://www.gsi.go.jp/kikakuchousei/kikakuchousei40182.html",
               "attribution":"出典：国土地理院ベクトルタイル提供実験（2026年7月1日時点）"},
        "n02":{"dataset":"MLIT N02 2025","data_as_of":"2025-12-31",
               "source":N02_URL,
               "terms":"https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N02-2025.html",
               "attribution":"国土数値情報（鉄道データ）2025年版（国土交通省）を加工して作成"}
    }
    cx,cy=tile_origin(LON,LAT,Z)
    places=[(cx+dx,cy+dy) for dx in range(-2,3) for dy in range(-2,3)]
    raw_roads=[]; tile_rows=[]; errors=[]; labels=[]
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
        futures={pool.submit(tile_job,loc):loc for loc in places}
        for future in concurrent.futures.as_completed(futures):
            loc=futures[future]
            try:
                rec=future.result()
                raw_roads.extend(rec.pop("roads"))
                labels.extend(rec.pop("labels"))
                tile_rows.append(rec)
            except Exception as e:
                errors.append({"tile":list(loc),"error":type(e).__name__+": "+str(e)[:180]})
    report["gsi"]["tile_coverage"]={"z":Z,"center_x":cx,"center_y":cy,"required":len(places),
                                   "received":len(tile_rows),"errors":errors,
                                   "complete":len(tile_rows)==len(places) and not errors,
                                   "all_tile_records":sorted(tile_rows,key=lambda t:(t["x"],t["y"]))}
    report["gsi"]["town_label_points"]=labels[:10]
    report["gsi"]["road_count"]=len(raw_roads)
    report["gsi"]["road_classes"]={}
    for road in raw_roads:
        key=str(road["properties"].get("rnkWidth"))
        report["gsi"]["road_classes"][key]=report["gsi"]["road_classes"].get(key,0)+1
    (OUT/"gsi-road-raw.geojson").write_text(json.dumps({"type":"FeatureCollection","features":raw_roads},ensure_ascii=False),encoding="utf-8")

    try:
        zip_bytes=get(N02_URL,limit=40000000)
        report["n02"]["zip_sha256"]=hashlib.sha256(zip_bytes).hexdigest()
        with zipfile.ZipFile(io.BytesIO(zip_bytes)) as archive:
            names=archive.namelist()
            report["n02"]["files"]=names[:80]
            for role,needle,outname in [
                ("rail","RailroadSection","n02-rail.geojson"),
                ("station","Station","n02-stations.geojson"),
            ]:
                matches=[n for n in names if n.lower().endswith(".geojson") and needle.lower() in n.lower()]
                if len(matches)!=1:raise ValueError(f"Unable to identify unique {role} GeoJSON; found {matches}")
                member=archive.read(matches[0])
                doc=json.loads(member)
                if doc.get("type")!="FeatureCollection":raise ValueError("Bad N02 GeoJSON")
                src=doc.get("features",[])
                sub=[f for f in src if intersects_geom(f.get("geometry") or {})]
                (OUT/outname).write_text(json.dumps({"type":"FeatureCollection","features":sub},ensure_ascii=False),encoding="utf-8")
                report["n02"][role]={"file":matches[0],"total_features":len(src),"local_features":len(sub),
                                    "sample_properties":[f.get("properties",{}) for f in sub[:3]]}
                if not sub:raise ValueError(f"No local N02 {role} geometry")
    except Exception as exc:
        report["n02"]["error"]=type(exc).__name__+": "+str(exc)[:400]
    report["status"]="geometry_acquired_diagnostic" if report["gsi"]["tile_coverage"]["complete"] and "error" not in report["n02"] else "geometry_acquisition_incomplete"
    (OUT/"acquisition-manifest.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
    print("STATUS",report["status"])
    print("GSI_ROADS",len(raw_roads),"TILES",len(tile_rows),"/",len(places))
    print("N02",report["n02"].get("rail",{}).get("local_features"),report["n02"].get("station",{}).get("local_features"),report["n02"].get("error"))
    print("ONLY DIAGNOSTIC SOURCE DATA. No advertising SVG or PNG.")

if __name__=="__main__":acquisition()
