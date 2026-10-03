
const app=document.getElementById("propertyApp");
const $=(s,r=document)=>r.querySelector(s);
const esc=v=>String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
const nl=v=>esc(v).replaceAll("\n","<br>");
function media(src,alt="",cls=""){return src?'<div class="media '+cls+'"><img src="'+esc(src)+'" alt="'+esc(alt)+'"></div>':'<div class="media placeholder '+cls+'">IMAGE</div>'}
function render(data){
  document.title=(data.propertyName||"物件")+"｜HOME PLANNER 管理物件";
  const building=(data.building||[]).map(r=>'<dt>'+esc(r[0])+'</dt><dd>'+esc(r[1])+'</dd>').join("");
  const features=(data.features||[]).map(f=>'<article class="feature">'+media(f.image,f.title)+'<div class="featureBody"><h3>'+esc(f.title)+'</h3><p>'+nl(f.body)+'</p></div></article>').join("");
  const gallery=(data.gallery||[]).map((g,i)=>'<figure class="galleryItem" data-full="'+esc(g.image)+'">'+(g.image?'<img src="'+esc(g.image)+'" alt="'+esc(g.caption)+'">':'<div class="placeholder">IMAGE</div>')+'<figcaption class="galleryCaption">'+esc(g.caption)+'</figcaption></figure>').join("");
  const stations=(data.stations||[]).map(s=>'<div class="transportRow"><div><strong>'+esc(s.name)+'</strong><small>'+esc(s.line)+'</small></div><b>'+esc(s.walk)+'</b></div>').join("");
  const buses=(data.buses||[]).map(b=>'<div class="transportRow"><div><strong>'+esc(b.stop)+'</strong><small>'+esc(b.route)+'｜'+esc(b.destinations)+'</small></div><b>'+esc(b.walk)+'</b></div>').join("");
  const cats=["買い物","医療","金融・郵便","公園・公共施設","その他"].map(cat=>{const rows=(data.neighborhood?.[cat]||[]).map(p=>'<div class="place"><div><strong>'+esc(p.name)+'</strong><small>'+esc(p.type)+(p.note?'｜'+esc(p.note):'')+'</small></div><div class="dist">'+esc(p.distance)+'</div></div>').join("");return rows?'<article class="catCard"><div class="kicker">'+esc(cat)+'</div><h3>'+esc(cat)+'</h3>'+rows+'</article>':""}).join("");
  const heroStyle=data.heroImage?' style="background-image:url(\''+esc(data.heroImage)+'\')"':"";
  const managementStyle=data.conceptImage?' style="background-image:url(\''+esc(data.conceptImage)+'\')"':"";
  app.innerHTML=`
<header class="mini-head"><div class="wrap nav"><div class="brand">HOME PLANNER<small>株式会社ホームプランナー</small></div><nav class="navlinks"><a href="#concept">CONCEPT</a><a href="#gallery">GALLERY</a><a href="#access">ACCESS</a><a href="#neighborhood">NEIGHBORHOOD</a></nav></div></header>
<main>
<section class="hero"${heroStyle}><div class="wrap heroInner"><span class="tag">HOME PLANNER 管理物件</span><div class="roman">${esc(data.propertyNameEn)}</div><h1 class="serif">${esc(data.propertyName)}</h1><div class="heroCatch serif">${nl(data.heroCatch)}</div><div class="heroSub">${esc(data.heroSub)}</div><div class="area">${esc(data.areaLabel)}</div></div></section>
<section id="concept"><div class="wrap concept"><div><div class="kicker">PROPERTY CONCEPT</div><h2 class="serif">${nl(data.conceptHeading)}</h2><p>${nl(data.conceptBody)}</p></div>${media(data.conceptImage,"物件コンセプト")}</div></section>
<section class="features"><div class="wrap"><div class="head"><div><div class="kicker">BUILDING FEATURES</div><h2 class="serif">建物の特徴</h2></div></div><div class="featureGrid">${features}</div></div></section>
<section id="gallery"><div class="wrap"><div class="head"><div><div class="kicker">GALLERY</div><h2 class="serif">建物の表情を、写真で。</h2></div></div><div class="galleryGrid">${gallery}</div></div></section>
<section><div class="wrap"><div class="head"><div><div class="kicker">BUILDING INFORMATION</div><h2 class="serif">建物概要</h2></div></div><div class="buildingGrid"><div class="panel"><dl class="spec">${building}</dl></div><div class="panel"><div class="kicker">PROPERTY NOTE</div><p>${nl(data.metaDescription)}</p></div></div></div></section>
<section class="rooms"><div class="wrap"><div class="head"><div><div class="kicker">ROOM DESIGN</div><h2 class="serif">${esc(data.roomTitle)}</h2></div></div><div class="roomGrid"><div><div class="roomImages">${media(data.roomMainImage,"住戸写真","main")}${media(data.roomSubImage1,"住戸写真")}${media(data.roomSubImage2,"住戸写真")}</div>${data.floorplanImage?'<div class="floorplan"><img src="'+esc(data.floorplanImage)+'" alt="間取り図"></div>':""}</div><div class="roomCopy"><div class="kicker">${esc(data.roomLabel)}</div><h3 class="serif">${esc(data.roomTitle)}</h3><p>${nl(data.roomBody)}</p><p class="note">${nl(data.roomNote)}</p></div></div></div></section>
<section class="access" id="access"><div class="wrap"><div class="head"><div><div class="kicker">LOCATION / ACCESS</div><h2 class="serif">アクセス</h2></div><p>${nl(data.accessLead)}</p></div><div class="accessGrid"><div class="transport"><h3>TRAIN</h3>${stations}<div class="busBox"><h3>BUS</h3>${buses||'<p class="note">バス情報未登録</p>'}</div></div><div class="mapCard"><div><div class="kicker">AREA MAP</div><h3 class="serif">周辺を地図で確認</h3><p>実際の徒歩経路や周辺施設は地図で確認できます。</p></div>${data.mapUrl?'<a class="btn" href="'+esc(data.mapUrl)+'" target="_blank" rel="noopener">Google Mapsで確認</a>':""}</div></div></div></section>
<section class="neighborhood" id="neighborhood"><div class="wrap"><div class="head"><div><div class="kicker">NEIGHBORHOOD</div><h2 class="serif">${esc(data.neighborhoodTitle)}</h2></div><p>${nl(data.neighborhoodLead)}</p></div><div class="categoryGrid">${cats}</div></div></section>
<section class="hazard"><div class="wrap"><div class="head"><div><div class="kicker">HAZARD / DISASTER INFORMATION</div><h2 class="serif">防災情報</h2></div><p>評価ではなく、公的情報への導線を明確に。</p></div><div class="hazardGrid"><div class="panel"><div class="hazardFlags"><span>洪水</span><span>内水</span><span>高潮</span><span>地震</span><span>指定避難所</span></div><p>${nl(data.hazardBody)}</p>${data.hazardUrl?'<a class="btn" href="'+esc(data.hazardUrl)+'" target="_blank" rel="noopener">公的ハザードマップを確認</a>':""}</div><div class="panel"><h3>掲載時の考え方</h3><p>独自に「安全」「危険」と評価せず、公的機関の公表内容・出典・確認日を整理して掲載します。</p><p class="note">${nl(data.hazardNote)}</p></div></div></div></section>
<section class="management"${managementStyle}><div class="wrap"><div class="manage"><span class="tag">Managed by HOME PLANNER</span><h2 class="serif">${esc(data.managementHeading)}</h2><p>${nl(data.managementBody)}</p>${data.ctaUrl?'<a class="btn" href="'+esc(data.ctaUrl)+'" target="_blank" rel="noopener">'+esc(data.ctaLabel)+'</a>':""}</div></div></section>
</main><footer><div class="wrap">${esc(data.propertyName)}｜${esc(data.managedBy)} 管理物件ページ</div></footer>
<div class="lightbox" id="lightbox"><button type="button">×</button><img alt="拡大写真"></div>`;
  const lb=$("#lightbox");document.querySelectorAll(".galleryItem").forEach(x=>x.onclick=()=>{const src=x.dataset.full;if(!src)return;lb.querySelector("img").src=src;lb.classList.add("open")});lb.onclick=()=>lb.classList.remove("open");
  const ld=document.createElement("script");ld.type="application/ld+json";ld.textContent=JSON.stringify({"@context":"https://schema.org","@type":"ApartmentComplex","name":data.propertyName||"","description":data.metaDescription||"","address":{"@type":"PostalAddress","addressLocality":data.areaLabel||"","addressCountry":"JP"}});document.head.appendChild(ld)
}
async function init(){
  const p=new URLSearchParams(location.search);
  if(window.PROPERTY_DATA){render(window.PROPERTY_DATA);return}
  if(p.get("data")){try{const r=await fetch(p.get("data"));render(await r.json());return}catch(e){}}
  if(p.get("preview")==="1"){try{const raw=localStorage.getItem("hpPropertyDraft");if(raw){render(JSON.parse(raw));return}}catch(e){}}
  render({propertyName:"物件ページプレビュー",propertyNameEn:"PROPERTY",areaLabel:"",metaDescription:"入力フォームから物件情報を設定してください。",heroCatch:"物件情報を入力すると、ここにプレビューされます。",heroSub:"",conceptHeading:"物件コンセプト",conceptBody:"",building:[],features:[],gallery:[],stations:[],buses:[],neighborhood:{},neighborhoodTitle:"周辺環境",neighborhoodLead:"",hazardBody:"",hazardNote:"",managedBy:"株式会社ホームプランナー",managementHeading:"Managed by HOME PLANNER",managementBody:""})
}
window.addEventListener("message",e=>{if(e.data?.type==="property-preview"&&e.data.data)render(e.data.data)});
init();
