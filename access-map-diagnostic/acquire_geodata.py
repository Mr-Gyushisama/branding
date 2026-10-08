#!/usr/bin/env python3
"""Acquire official, real geometry near a verified address; NEVER render approximations."""
import hashlib, io, json, math, urllib.request, zipfile
from datetime import datetime, timezone
from pathlib import Path
import mapbox_vector_tile

OUT = Path("access-map-diagnostic/acquired")
OUT.mkdir(parents=True,exist_ok=True)
LON, LAT = 136.879676298, 35.191603876
N02 = "https://nlftp.mlit.go.jp/ksj/gml/data/N02/N02-25/N02-25_GML.zip"
GSI = "https://cyberjapandata.gsi.go.jp/xyz/experimental_bvmap/{z}/{x}/{y}.pbf"
Z = 15

def fetch(url,limit):
    request=urllib.request.Request(url,headers={"User-Agent":"HomePlannerOfficialGeoAcquisition/1.0"})
    with urllib.request.urlopen(request,timeout=60) as resp:
        if resp.status!=200:raise ValueError("Expected HTTP 200")
        data=resp.read(limit+1)
    if len(data)>limit:raise ValueError("Download exceeded byte limit")
    return data

def box_coords(geometry):
    typ=geometry.get("type")
    c=geometry.get("coordinates",[])
    if typ=="LineString":return [c]
    if typ=="MultiLineString":return c
    return []

def mean_station(geometry):
    pts=[p for part in box_coords(geometry) for p in part]
    if not pts:return None
    return (sum(p[0] for p in pts)/len(pts),sum(p[1] for p in pts)/len(pts))

def tile_xy(lon,lat):
    x=int((lon+180)/360*(2**Z))
    y=int((1-math.asinh(math.tan(math.radians(lat)))/math.pi)/2*(2**Z))
    return x,y

def latlon_from_tile(tx,ty,cx,cy,extent):
    x=(tx+cx/extent)/2**Z
    y=(ty+cy/extent)/2**Z
    lon=x*360-180
    lat=math.degrees(math.atan(math.sinh(math.pi*(1-2*y))))
    return lon,lat

def save(name,value):
    (OUT/name).write_text(json.dumps(value,ensure_ascii=False,indent=2),encoding="utf-8")

def fc(rows):
    return {"type":"FeatureCollection","features":rows}

def main():
    report={"status":"incomplete","evidence_only":True,
        "generated_at_utc":datetime.now(timezone.utc).isoformat(),
        "address":"愛知県名古屋市西区名西二丁目32番16号",
        "target_coordinate_source":"Geolonia V2 exact residence 32-16, snapshot SHA256 99b117cfd3d38e41bba217eb14c90414c911dfef584a13119c33d4e94c0bb8f5",
        "source_editions":{"n02":"2025-12-31","gsi":"2026-07-01"},
        "production_approval":"pending reconciliation and validation"}
    try:
        archive=fetch(N02,25000000)
        report["n02_sha256"]=hashlib.sha256(archive).hexdigest()
        zf=zipfile.ZipFile(io.BytesIO(archive))
        def read_geo(name):
            matches=[n for n in zf.namelist() if n.endswith(name) and "/UTF-8/" in n]
            if len(matches)!=1:raise ValueError("Expected one official UTF8 "+name)
            return json.loads(zf.read(matches[0]))
        station_data=read_geo("N02-25_Station.geojson")
        rail_data=read_geo("N02-25_RailroadSection.geojson")
        selected={}
        for feature in station_data["features"]:
            p=feature.get("properties") or {}
            name=str(p.get("N02_005") or "").replace("駅","").strip()
            if name in ("浄心","栄生"):
                position=mean_station(feature.get("geometry") or {})
                if position:
                    selected.setdefault(name,[]).append((position,feature))
        if any(not selected.get(k) for k in ("浄心","栄生")):
            raise ValueError("Required station missing in N02")
        stations=[]
        points=[(LON,LAT)]
        for name in ("浄心","栄生"):
            candidates=selected[name]
            if len(candidates)!=1:
                raise ValueError("Required station ambiguously represented: "+name)
            position,feature=candidates[0]
            if not (136.7<position[0]<137.1 and 35.0<position[1]<35.4):
                raise ValueError("Station outside Nagoya source area")
            stations.append(feature)
            points.append(position)
            report[name+"_station_coordinate"]={"lon":position[0],"lat":position[1]}
        xmin=min(p[0] for p in points)-.011
        xmax=max(p[0] for p in points)+.011
        ymin=min(p[1] for p in points)-.009
        ymax=max(p[1] for p in points)+.009
        def geometry_in_bbox(feature):
            for part in box_coords(feature.get("geometry") or {}):
                for c in part:
                    if xmin<=c[0]<=xmax and ymin<=c[1]<=ymax:return True
            return False
        rail_features=[f for f in rail_data["features"] if geometry_in_bbox(f)]
        if not rail_features:raise ValueError("No N02 rails inside requested window")
        save("n02-stations.geojson",fc(stations))
        save("n02-rails.geojson",fc(rail_features))
        report["n02_station_count"]=len(stations)
        report["n02_rail_feature_count"]=len(rail_features)
        west,north=tile_xy(xmin,ymax)
        east,south=tile_xy(xmax,ymin)
        count=(east-west+1)*(south-north+1)
        if count<=0 or count>140:raise ValueError("Unexpected tile coverage: "+str(count))
        roads=[]
        roads_ftcodes={}
        for x in range(west,east+1):
            for y in range(north,south+1):
                url=GSI.format(z=Z,x=x,y=y)
                blob=fetch(url,6000000)
                decoded=mapbox_vector_tile.decode(blob,default_options={"y_coord_down":True})
                layer=decoded.get("road") or {}
                extent=layer.get("extent",4096)
                for f in layer.get("features",[]):
                    props=f.get("properties",{})
                    code=props.get("ftCode")
                    roads_ftcodes[str(code)]=roads_ftcodes.get(str(code),0)+1
                    if code!=2701:continue
                    geo=f.get("geometry") or {}
                    for n,part in enumerate(box_coords(geo)):
                        coords=[latlon_from_tile(x,y,float(p[0]),float(p[1]),extent) for p in part]
                        if len(coords)<2:continue
                        if not any(xmin<=p[0]<=xmax and ymin<=p[1]<=ymax for p in coords):
                            continue
                        road_id=f"GSI-bvmap-{Z}-{x}-{y}-{f.get('id',n)}-{n}"
                        roads.append({"id":road_id,"name":"",
                            "class":"major" if int(props.get("rnkWidth",0) or 0)>=3 else "local",
                            "geometry":[[lat,lon] for lon,lat in coords],
                            "source":"Geospatial Information Authority of Japan GSI Vector",
                            "source_url":url,"source_id":road_id,"verified":True,"usage_ok":True,
                            "evidence_kind":"official_vector_tile","properties":props})
        if not roads:raise ValueError("No GSI official road centerline features extracted")
        report.update({"road_count":len(roads),"gsi_road_ftcodes":roads_ftcodes,
            "gsi_requested_tile_count":count,
            "gsi_tile_bounds":{"z":Z,"west":west,"east":east,"north":north,"south":south},
            "geographic_coverage":{"west":xmin,"east":xmax,"south":ymin,"north":ymax}})
        evidence={
            "meta":{"providers":["GSI / Geospatial Information Authority of Japan"],
                "attribution":["国土地理院 地理院地図Vector（加工）"],
                "source_family":"gsi_current_vector",
                "provider_class":"detailed_geometry","operational_tier":"production",
                "source_edition":"GSI Vector 2026-07-01","source_data_date":"2026-07-01",
                "source_current":True,"currency_reviewed_at":"2026-10-08",
                "terms_url":"https://www.gsi.go.jp/kikakuchousei/kikakuchousei40182.html",
                "terms_reviewed_at":"2026-10-08",
                "coverage_complete_by_kind":{"roads":True,"rails":False,"stations":False,"pois":False}},
            "roads":roads,"rails":[],"stations":[],"pois":[]}
        save("gsi-provider-evidence.json",evidence)
        report["status"]="geometry_sources_extracted_pending_production_QA"
        print("ROAD_COUNT",len(roads),"N02_RAIL_COUNT",len(rail_features),"N02_STATIONS",len(stations))
        print("TILES",count,"STATION_COORDS",report["浄心_station_coordinate"],report["栄生_station_coordinate"])
    except Exception as e:
        report["status"]="failed"
        report["error"]=type(e).__name__+": "+str(e)[:400]
        print("ACQUISITION_FAILED",report["error"])
    save("acquisition-report.json",report)
    print("STATUS",report["status"],"NO_MAP_GENERATED")

if __name__=="__main__":
    main()
