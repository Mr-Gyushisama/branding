
(()=>{const facilities=[
{cat:"買い物",name:"ヤマナカ 松原店",dist:"約165m",desc:"食品・日用品の買い物に使いやすい近隣スーパー。",q:"ヤマナカ 松原店 名古屋"},
{cat:"コンビニ",name:"ファミリーマート 松原二丁目店",dist:"約120m",desc:"日常のちょっとした買い物やATM利用に。",q:"ファミリーマート 松原二丁目店"},
{cat:"ドラッグストア",name:"ドラッグスギヤマ 松原店",dist:"約170m",desc:"医薬品・日用品を近隣で揃えやすい立地。",q:"ドラッグスギヤマ 松原店"},
{cat:"郵便・金融",name:"名古屋橘郵便局",dist:"約70m",desc:"郵便・各種手続きに便利な近隣郵便局。",q:"名古屋橘郵便局"},
{cat:"郵便・金融",name:"十六銀行 大須支店",dist:"約490m",desc:"銀行窓口・ATM利用の選択肢。",q:"十六銀行 大須支店"},
{cat:"医療",name:"久野歯科医院",dist:"約50m",desc:"近隣の歯科医療施設。",q:"久野歯科医院 名古屋 松原"},
{cat:"公園",name:"前塚公園",dist:"約260m",desc:"身近に立ち寄れる公園。",q:"前塚公園 名古屋"},
{cat:"買い物",name:"アミカ 大須店",dist:"約560m",desc:"食料品の買い足しにも使える周辺店舗。",q:"アミカ 大須店"}
];
const section=document.createElement("section");section.id="hp-lifestyle";section.innerHTML=`
<div class="hp-wrap">
<div class="hp-kicker">NEIGHBORHOOD & DAILY LIFE</div>
<h2>住んだ後の暮らしまで、見える物件情報へ。</h2>
<p class="hp-lead">建物だけでなく、日々の買い物・交通・医療・金融・公園など、実際の生活に関わる周辺環境をまとめました。現地内覧後の比較検討や、空室に掲示するQRコードからの情報確認にも使える構成です。</p>
<div class="hp-scene-grid">
<div class="hp-scene"><div class="hp-scene-label">DAILY SHOPPING</div><h3>日常の買い物を近隣で。</h3><p>スーパー・コンビニ・ドラッグストアが周辺にあり、食品や日用品を近場で揃えやすい環境です。</p></div>
<div class="hp-scene"><div class="hp-scene-label">CITY ACCESS</div><h3>都心と生活圏をつなぐ。</h3><p>大須観音・東別院など複数方面へアクセスしやすく、目的地に合わせて移動手段を選べます。</p></div>
<div class="hp-scene"><div class="hp-scene-label">EVERYDAY SUPPORT</div><h3>生活施設もまとめて確認。</h3><p>郵便局・金融機関・医療施設・公園など、入居後に知りたい情報を物件ページ内で確認できます。</p></div>
</div>
<div class="hp-facility-panel">
<div class="hp-panel-head"><div><div class="hp-kicker">AROUND THE PROPERTY</div><h3>周辺施設</h3></div><p>距離は公開情報等を基にした参考値です。</p></div>
<div class="hp-filters" id="hp-filters"></div><div class="hp-facility-grid" id="hp-facilities"></div>
<div class="hp-actions"><a class="hp-btn primary" href="https://maps.app.goo.gl/SSWyoZ1xjBk1yrQx9" target="_blank" rel="noopener">Google Mapsで周辺を見る</a><a class="hp-btn secondary" href="#hp-qr">現地掲示用QRを見る</a></div>
<p class="hp-note">※距離は掲載時点の周辺施設情報等を基にした参考値で、実際の徒歩経路・所要時間とは異なる場合があります。店舗・施設の営業状況は変更されることがあります。</p>
</div>
<div class="hp-info-grid">
<div class="hp-hazard"><div class="hp-kicker">OFFICIAL HAZARD INFORMATION</div><h3>防災情報は公的情報へ直接つなぐ。</h3><p>独自の安全評価は行わず、名古屋市が公開する中区ハザードマップで最新情報を確認できるようにしています。</p><div class="hp-hazard-list"><span>洪水</span><span>内水氾濫</span><span>高潮</span><span>地震</span><span>指定避難所</span></div><a class="hp-btn primary" href="https://www.city.nagoya.jp/bousaiportal/hazardmap/1036429/1036295.html" target="_blank" rel="noopener">名古屋市 中区ハザードマップ</a><p class="hp-note">※最新情報および詳細は行政機関の公表資料をご確認ください。</p></div>
<div class="hp-qr" id="hp-qr"><div class="hp-kicker">ON-SITE QR GUIDE</div><h3>現地から、このページへ。</h3><div class="hp-qr-inner"><div id="hp-qr-box"></div><div><p>空室の玄関・室内・共用部などにQRコードを掲示し、内覧者が建物設備、周辺環境、アクセス、防災情報をスマートフォンで確認できる運用を想定しています。</p><div class="hp-url" id="hp-current-url"></div><div class="hp-actions"><button class="hp-btn secondary" type="button" id="hp-print">QR案内を印刷</button></div></div></div></div>
</div></div>`;
const footer=document.querySelector("footer");if(footer){footer.parentNode.insertBefore(section,footer)}else{document.body.appendChild(section)}
const cats=["すべて",...new Set(facilities.map(x=>x.cat))],filters=section.querySelector("#hp-filters"),grid=section.querySelector("#hp-facilities");
function render(cat){grid.innerHTML="";facilities.filter(x=>cat==="すべて"||x.cat===cat).forEach(x=>{const a=document.createElement("a");a.className="hp-facility";a.target="_blank";a.rel="noopener";a.href="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(x.q);a.innerHTML=`<div class="hp-facility-top"><span class="hp-cat">${x.cat}</span><span class="hp-dist">${x.dist}</span></div><h4>${x.name}</h4><p>${x.desc}</p>`;grid.appendChild(a)})}
cats.forEach((c,i)=>{const b=document.createElement("button");b.type="button";b.className="hp-filter"+(i===0?" active":"");b.textContent=c;b.onclick=()=>{filters.querySelectorAll(".hp-filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");render(c)};filters.appendChild(b)});render("すべて");
const current="https://mr-gyushisama.github.io/branding/";section.querySelector("#hp-current-url").textContent=current;section.querySelector("#hp-print").onclick=()=>window.print();
const ld=document.createElement("script");ld.type="application/ld+json";ld.textContent=JSON.stringify({"@context":"https://schema.org","@type":"ApartmentComplex","name":"L’Allure松原","url":current,"address":{"@type":"PostalAddress","postalCode":"460-0017","addressRegion":"愛知県","addressLocality":"名古屋市中区","streetAddress":"松原3丁目6-28","addressCountry":"JP"},"numberOfAccommodationUnits":19,"yearBuilt":"2019"});document.head.appendChild(ld);
const q=document.createElement("script");q.src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js";q.onload=()=>{try{new QRCode(document.getElementById("hp-qr-box"),{text:current,width:140,height:140,colorDark:"#0e1d17",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.M})}catch(e){document.getElementById("hp-qr-box").textContent="QR";}};q.onerror=()=>{document.getElementById("hp-qr-box").innerHTML='<a href="'+current+'">サイトを開く</a>'};document.head.appendChild(q);
const float=document.createElement("a");float.className="hp-float";float.href="#hp-lifestyle";float.textContent="周辺環境を見る";document.body.appendChild(float);
})();
