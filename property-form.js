
const STORAGE_KEY="hpPropertyDraft";
const categories=["買い物","医療","金融・郵便","公園・公共施設","その他"];
const defaults={
  propertyName:"L’Allure 松原",propertyNameEn:"L’ALLURE MATSUBARA",slug:"lallure-matsubara",areaLabel:"名古屋市中区松原",
  metaDescription:"L’Allure松原の建物・住戸・アクセス・周辺環境・防災情報をまとめた管理物件ブランディングページ。",
  heroCatch:"街の近さと、住まいの落ち着きを。",heroSub:"都市生活を軽やかに整えるレジデンス。",
  heroImage:"",conceptHeading:"共用部から室内まで、ひとつの世界観でつながる。",
  conceptBody:"白いタイル、木目、ブラックを組み合わせた共用部と、明るい住空間。建物そのものの魅力を、募集条件とは切り分けて丁寧に紹介します。",
  conceptImage:"",
  building:[["所在地","名古屋市中区松原"],["構造","鉄筋コンクリート造"],["階数","地上10階建"],["竣工","2019年"],["間取り例","1LDK"],["主な設備","オートロック、エレベーター、宅配ボックス、防犯カメラ 等"]],
  features:[{title:"オートロック",body:"共用エントランスにオートロック設備を設置。",image:""},{title:"宅配設備",body:"集合郵便受けと宅配ボックスを共用部に集約。",image:""},{title:"防犯設備",body:"共用部の防犯カメラ等を確認できます。",image:""}],
  gallery:[{caption:"外観",image:""},{caption:"エントランス",image:""},{caption:"LDK",image:""},{caption:"洋室",image:""}],
  roomTitle:"明るさと余白を活かした1LDK。",roomLabel:"201 / 1LDK",roomBody:"LDKと洋室を分けた1LDK。収納、独立洗面、浴室、バルコニーなど、日常生活に必要な機能をコンパクトにまとめた住戸例です。",roomNote:"※住戸により間取り・内装・設備仕様が異なる場合があります。",
  roomMainImage:"",roomSubImage1:"",roomSubImage2:"",floorplanImage:"",
  accessLead:"複数駅・複数路線を生活圏に。目的地に合わせて交通手段を選べる立地です。",mapUrl:"",
  stations:[{name:"大須観音駅",line:"地下鉄鶴舞線",walk:"徒歩圏"},{name:"東別院駅",line:"地下鉄名城線",walk:"徒歩圏"},{name:"山王駅",line:"名鉄名古屋本線",walk:"徒歩圏"}],
  buses:[{stop:"松原二丁目",route:"名古屋市営バス",destinations:"主な行先は公開前に確認",walk:"徒歩分数確認"}],
  neighborhoodTitle:"松原で暮らす。",neighborhoodLead:"毎日の買い物、医療、金融・郵便、公園など、入居後の生活で確認しておきたい周辺施設を分かりやすくまとめています。",
  neighborhood:{
    "買い物":[{name:"ヤマナカ 松原店",type:"スーパー",distance:"約165m",note:""},{name:"ファミリーマート 松原二丁目店",type:"コンビニ",distance:"約120m",note:""}],
    "医療":[{name:"久野歯科医院",type:"歯科",distance:"約50m",note:""}],
    "金融・郵便":[{name:"名古屋橘郵便局",type:"郵便局",distance:"約70m",note:""}],
    "公園・公共施設":[{name:"前塚公園",type:"公園",distance:"約260m",note:""}],
    "その他":[{name:"大須商店街",type:"商業・飲食エリア",distance:"徒歩圏",note:""}]
  },
  hazardUrl:"",hazardBody:"独自の安全評価は行わず、行政機関が公開する情報を事実として案内します。",hazardNote:"※最新情報および詳細は行政機関の公表資料をご確認ください。",
  managedBy:"株式会社ホームプランナー",managementHeading:"この建物を、長く心地よく。",managementBody:"本物件は株式会社ホームプランナーが管理しています。物件の魅力を丁寧に伝えることも、建物を長く維持していく管理サービスの一部と考えています。",managementImage:"",ctaLabel:"ホームプランナーの賃貸管理を見る",ctaUrl:"https://hp-shueki.jp/"
};
let state=JSON.parse(JSON.stringify(defaults));
const imageOverrides={};
const form=document.getElementById("propertyForm");
const frame=document.getElementById("previewFrame");
const statusEl=document.createElement("div");statusEl.className="status";document.body.appendChild(statusEl);
function toast(t){statusEl.textContent=t;statusEl.classList.add("show");setTimeout(()=>statusEl.classList.remove("show"),1600)}
function field(name){return form.elements[name]}
function setSimple(data){
  Object.keys(data).forEach(k=>{if(field(k)&&typeof data[k]!=="object")field(k).value=data[k]??""});
}
function rowInput(name,value,placeholder=""){return '<label>'+name+'<input value="'+escAttr(value||"")+'" placeholder="'+escAttr(placeholder)+'"></label>'}
function escAttr(v){return String(v).replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;")}
function removeBtn(){return '<button type="button" class="remove-row">削除</button>'}
function renderBuilding(){
  const c=document.getElementById("buildingRows");c.innerHTML="";
  state.building.forEach((r,i)=>{const d=document.createElement("div");d.className="repeat-row";d.innerHTML=rowInput("項目名",r[0])+rowInput("内容",r[1])+removeBtn();d.querySelectorAll("input")[0].oninput=e=>{state.building[i][0]=e.target.value;updatePreview()};d.querySelectorAll("input")[1].oninput=e=>{state.building[i][1]=e.target.value;updatePreview()};d.querySelector(".remove-row").onclick=()=>{state.building.splice(i,1);renderBuilding();updatePreview()};c.appendChild(d)})
}
function renderFeatures(){
  const c=document.getElementById("featureRows");c.innerHTML="";
  state.features.forEach((r,i)=>{const d=document.createElement("div");d.className="repeat-row gallery";d.innerHTML=rowInput("見出し",r.title)+rowInput("説明",r.body)+rowInput("画像パス",r.image)+'<label class="file-label">画像を選択<input type="file" accept="image/*"></label>'+removeBtn();const ins=d.querySelectorAll("input");ins[0].oninput=e=>{r.title=e.target.value;updatePreview()};ins[1].oninput=e=>{r.body=e.target.value;updatePreview()};ins[2].oninput=e=>{r.image=e.target.value;updatePreview()};ins[3].onchange=e=>handleObjectImage(e,r,"image","feature:"+i);d.querySelector(".remove-row").onclick=()=>{state.features.splice(i,1);renderFeatures();updatePreview()};c.appendChild(d)})
}
function renderGallery(){
  const c=document.getElementById("galleryRows");c.innerHTML="";
  state.gallery.forEach((r,i)=>{const d=document.createElement("div");d.className="repeat-row gallery";d.innerHTML=rowInput("キャプション",r.caption)+rowInput("画像パス",r.image)+'<label class="file-label">画像を選択<input type="file" accept="image/*"></label>'+removeBtn();const ins=d.querySelectorAll("input");ins[0].oninput=e=>{r.caption=e.target.value;updatePreview()};ins[1].oninput=e=>{r.image=e.target.value;updatePreview()};ins[2].onchange=e=>handleArrayImage(e,r,"image");d.querySelector(".remove-row").onclick=()=>{state.gallery.splice(i,1);renderGallery();updatePreview()};c.appendChild(d)})
}
function renderStations(){
  const c=document.getElementById("stationRows");c.innerHTML="";
  state.stations.forEach((r,i)=>{const d=document.createElement("div");d.className="repeat-row station";d.innerHTML=rowInput("駅名",r.name)+rowInput("路線",r.line)+rowInput("徒歩",r.walk)+removeBtn();const ins=d.querySelectorAll("input");["name","line","walk"].forEach((k,j)=>ins[j].oninput=e=>{r[k]=e.target.value;updatePreview()});d.querySelector(".remove-row").onclick=()=>{state.stations.splice(i,1);renderStations();updatePreview()};c.appendChild(d)})
}
function renderBuses(){
  const c=document.getElementById("busRows");c.innerHTML="";
  state.buses.forEach((r,i)=>{const d=document.createElement("div");d.className="repeat-row bus";d.innerHTML=rowInput("バス停",r.stop)+rowInput("系統・事業者",r.route)+rowInput("主な行先",r.destinations)+rowInput("徒歩",r.walk)+removeBtn();const ins=d.querySelectorAll("input");["stop","route","destinations","walk"].forEach((k,j)=>ins[j].oninput=e=>{r[k]=e.target.value;updatePreview()});d.querySelector(".remove-row").onclick=()=>{state.buses.splice(i,1);renderBuses();updatePreview()};c.appendChild(d)})
}
function renderNeighborhood(){
  const root=document.getElementById("neighborhoodGroups");root.innerHTML="";
  categories.forEach(cat=>{state.neighborhood[cat]??=[];const box=document.createElement("div");box.className="ngroup";box.innerHTML='<div class="ngroup-head"><h4>'+cat+'</h4><button type="button" class="add-row">＋ 施設追加</button></div><div class="facilities"></div>';const list=box.querySelector(".facilities");
    state.neighborhood[cat].forEach((r,i)=>{const d=document.createElement("div");d.className="facility-row";d.innerHTML=rowInput("施設名",r.name)+rowInput("種別",r.type)+rowInput("距離",r.distance)+rowInput("補足",r.note)+removeBtn();const ins=d.querySelectorAll("input");["name","type","distance","note"].forEach((k,j)=>ins[j].oninput=e=>{r[k]=e.target.value;updatePreview()});d.querySelector(".remove-row").onclick=()=>{state.neighborhood[cat].splice(i,1);renderNeighborhood();updatePreview()};list.appendChild(d)});
    box.querySelector(".add-row").onclick=()=>{state.neighborhood[cat].push({name:"",type:"",distance:"",note:""});renderNeighborhood()};root.appendChild(box)
  })
}
function hydrate(data){
  state=Object.assign(JSON.parse(JSON.stringify(defaults)),data||{});
  state.building=data?.building||defaults.building.map(x=>[...x]);state.features=data?.features||JSON.parse(JSON.stringify(defaults.features));state.gallery=data?.gallery||JSON.parse(JSON.stringify(defaults.gallery));state.stations=data?.stations||JSON.parse(JSON.stringify(defaults.stations));state.buses=data?.buses||JSON.parse(JSON.stringify(defaults.buses));state.neighborhood=Object.assign(JSON.parse(JSON.stringify(defaults.neighborhood)),data?.neighborhood||{});
  setSimple(state);renderBuilding();renderFeatures();renderGallery();renderStations();renderBuses();renderNeighborhood();updatePreview()
}
function collectSimple(){
  const names=["propertyName","propertyNameEn","slug","areaLabel","metaDescription","heroCatch","heroSub","heroImage","conceptHeading","conceptBody","conceptImage","roomTitle","roomLabel","roomBody","roomNote","roomMainImage","roomSubImage1","roomSubImage2","floorplanImage","accessLead","mapUrl","neighborhoodTitle","neighborhoodLead","hazardUrl","hazardBody","hazardNote","managedBy","managementHeading","managementBody","managementImage","ctaLabel","ctaUrl"];
  names.forEach(n=>{if(field(n))state[n]=field(n).value.trim()});
}
function previewData(){
  collectSimple();const d=JSON.parse(JSON.stringify(state));
  Object.entries(imageOverrides).forEach(([key,val])=>{if(key.startsWith("gallery:")){const i=+key.split(":")[1];if(d.gallery[i])d.gallery[i].image=val}else if(key.startsWith("feature:")){const i=+key.split(":")[1];if(d.features[i])d.features[i].image=val}else d[key]=val});
  return d
}
function updatePreview(){
  collectSimple();localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
  const data=previewData();try{frame.contentWindow.postMessage({type:"property-preview",data},"*")}catch(e){}
}
form.addEventListener("input",e=>{if(!e.target.closest(".repeater,.neighborhood-groups"))updatePreview()});
document.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>{const k=b.dataset.add;if(k==="building")state.building.push(["",""]);if(k==="feature")state.features.push({title:"",body:"",image:""});if(k==="gallery")state.gallery.push({caption:"",image:""});if(k==="station")state.stations.push({name:"",line:"",walk:""});if(k==="bus")state.buses.push({stop:"",route:"",destinations:"",walk:""});({building:renderBuilding,feature:renderFeatures,gallery:renderGallery,station:renderStations,bus:renderBuses}[k])();updatePreview()});
function handleFile(file,key,pathSetter){
  if(!file)return;const slug=field("slug").value.trim()||"property";const path="assets/"+slug+"/"+file.name;pathSetter(path);const fr=new FileReader();fr.onload=()=>{imageOverrides[key]=fr.result;updatePreview()};fr.readAsDataURL(file)
}
document.querySelectorAll(".image-picker").forEach(p=>p.onchange=e=>{const target=e.target.dataset.target;handleFile(e.target.files[0],target,path=>{field(target).value=path;state[target]=path})});
function handleArrayImage(e,obj,key){const idx=state.gallery.indexOf(obj);handleFile(e.target.files[0],"gallery:"+idx,path=>{obj[key]=path;renderGallery()})}
function handleObjectImage(e,obj,key,overrideKey){handleFile(e.target.files[0],overrideKey,path=>{obj[key]=path;renderFeatures()})}
function download(name,text,type){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
document.getElementById("saveLocal").onclick=()=>{collectSimple();localStorage.setItem(STORAGE_KEY,JSON.stringify(state));toast("ブラウザに保存しました")};
document.getElementById("loadLocal").onclick=()=>{const raw=localStorage.getItem(STORAGE_KEY);if(raw){hydrate(JSON.parse(raw));toast("保存データを読み込みました")}else toast("保存データがありません")};
document.getElementById("exportJson").onclick=()=>{collectSimple();download((state.slug||"property")+".json",JSON.stringify(state,null,2),"application/json");toast("JSONを書き出しました")};
document.getElementById("importJson").onchange=e=>{const f=e.target.files[0];if(!f)return;const fr=new FileReader();fr.onload=()=>{try{hydrate(JSON.parse(fr.result));toast("JSONを読み込みました")}catch(err){toast("JSON形式を確認してください")}};fr.readAsText(f)};
const htmlBtn=document.createElement("button");htmlBtn.type="button";htmlBtn.className="btn primary";htmlBtn.textContent="HTMLを書き出す";document.querySelector(".top-actions").appendChild(htmlBtn);
htmlBtn.onclick=()=>{collectSimple();const data=JSON.stringify(state).replaceAll("</script>","<\\/script>");const doc='<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="'+escAttr(state.metaDescription||"")+'"><title>'+escAttr(state.propertyName||"物件")+'｜HOME PLANNER 管理物件</title><link rel="stylesheet" href="property-template.css"></head><body><div id="propertyApp"></div><script>window.PROPERTY_DATA='+data+';<\\/script><script src="property-template.js"><\\/script></body></html>';download((state.slug||"property")+".html",doc,"text/html");toast("HTMLを書き出しました")};
document.getElementById("openPreview").href="property-template.html?preview=1";
frame.addEventListener("load",updatePreview);
const raw=localStorage.getItem(STORAGE_KEY);hydrate(raw?JSON.parse(raw):defaults);
