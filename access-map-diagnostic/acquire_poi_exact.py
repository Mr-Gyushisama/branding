#!/usr/bin/env python3
import json,csv,io,hashlib,urllib.parse,urllib.request,datetime
from pathlib import Path
base="https://japanese-addresses-v2.geoloniamaps.com/api/ja/"
municipality=urllib.parse.quote("愛知県")+"/"+urllib.parse.quote("名古屋市西区")
def fetch(u,a=None,b=None):
    headers={"User-Agent":"HomePlannerPOIEvidence/1.0"}
    if a is not None:headers["Range"]=f"bytes={a}-{a+b-1}"
    with urllib.request.urlopen(urllib.request.Request(u,headers=headers),timeout=35) as r:
        raw=r.read(15_000_000);status=r.status
    if a is not None:
        if status==200:raw=raw[a:a+b]
        if len(raw)!=b:raise ValueError("wrong byte range")
    return raw
out={"source":"Geolonia V2 / Digital Agency ABR",
     "name":"ヨシヅヤ 名古屋名西店","official_address":"愛知県名古屋市西区名西2丁目33-8",
     "identity_url":"https://www.yoshizuya.com/store/nagoyameisei/",
     "candidate_only":True,"reviewed_utc":datetime.datetime.now(datetime.timezone.utc).isoformat()}
try:
    city=json.loads(fetch(base+municipality+".json"))
    town=next(x for x in city["data"] if x.get("oaza_cho")=="名西" and x.get("chome")=="二丁目")
    ran=town["csv_ranges"]["住居表示"]
    url=base+municipality+"-"+urllib.parse.quote("住居表示")+".txt"
    data=fetch(url,int(ran["start"]),int(ran["length"]))
    lines=data.decode("utf-8-sig").splitlines()
    if lines[0]!="住居表示,名西二丁目":raise ValueError("wrong town")
    rows=list(csv.DictReader(io.StringIO("\n".join(lines[1:]))))
    found=[r for r in rows if int(r.get("blk_num") or -1)==33 and int(r.get("rsdt_num") or -1)==8 and r.get("lng") and r.get("lat")]
    out["matches"]=len(found)
    out["source_url"]=url
    out["source_sha256"]=hashlib.sha256(data).hexdigest()
    out["coordinates"]=[[float(x["lng"]),float(x["lat"])] for x in found]
    out["status"]="exact_candidate" if len(found)==1 else "missing_or_ambiguous"
except Exception as e:
    out["status"]="error"
    out["error"]=type(e).__name__+": "+str(e)[:200]
Path("poi-geocoder-evidence.json").write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding="utf-8")
print("YOSHIZUYA",out["status"],"MATCHES",out.get("matches"),"POINTS",out.get("coordinates"))
