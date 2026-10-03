
(()=>{const groups=[
{en:"SHOPPING",title:"買い物",copy:"食品・日用品を揃えやすい周辺施設。",places:[
{name:"ヤマナカ 松原店",dist:"約165m",note:"スーパー",q:"ヤマナカ 松原店 名古屋"},
{name:"ファミリーマート 松原二丁目店",dist:"約120m",note:"コンビニ",q:"ファミリーマート 松原二丁目店"},
{name:"ドラッグスギヤマ 松原店",dist:"約170m",note:"ドラッグストア",q:"ドラッグスギヤマ 松原店"},
{name:"アミカ 大須店",dist:"約560m",note:"食品店",q:"アミカ 大須店"}
]},
{en:"MEDICAL",title:"医療",copy:"日常の通院や急な体調変化に備えて確認しておきたい医療施設。",places:[
{name:"久野歯科医院",dist:"約50m",note:"歯科",q:"久野歯科医院 名古屋 松原"}
]},
{en:"BANK & POST",title:"金融・郵便",copy:"銀行・郵便局など、生活手続きに関わる施設。",places:[
{name:"名古屋橘郵便局",dist:"約70m",note:"郵便局",q:"名古屋橘郵便局"},
{name:"十六銀行 大須支店",dist:"約490m",note:"銀行",q:"十六銀行 大須支店"}
]},
{en:"PARK & PUBLIC",title:"公園・公共施設",copy:"身近に利用できる公園や公共施設。",places:[
{name:"前塚公園",dist:"約260m",note:"公園",q:"前塚公園 名古屋"}
]},
{en:"OTHER",title:"その他",copy:"日常生活や休日の過ごし方に関わる周辺スポット。",places:[
{name:"大須商店街",dist:"徒歩圏",note:"商業・飲食エリア",q:"大須商店街 名古屋"}
]}
];
const section=document.createElement("section");section.id="hp-neighborhood";section.innerHTML=`
<div class="hp-wrap">
<div class="hp-kicker">NEIGHBORHOOD</div>
<h2>松原で暮らす。</h2>
<p class="hp-lead">毎日の買い物、医療、金融・郵便、公園など、入居後の生活で確認しておきたい周辺施設を分かりやすくまとめています。</p>
<div class="hp-life-grid" id="hp-life-grid"></div>
<div class="hp-bottom-grid">
<div class="hp-map-card">
<div class="hp-kicker">AREA MAP</div>
<h3>周辺を地図で見る</h3>
<p>施設の位置や実際の徒歩経路はGoogle Mapsで確認できます。</p>
<div class="hp-actions"><a class="hp-btn primary" href="https://maps.app.goo.gl/SSWyoZ1xjBk1yrQx9" target="_blank" rel="noopener">Google Mapsで周辺を見る</a></div>
<p class="hp-note">※距離は掲載時点の公開情報等を基にした参考値です。実際の徒歩経路・所要時間、店舗の営業状況は最新情報をご確認ください。</p>
</div>
<div class="hp-hazard">
<div class="hp-kicker">OFFICIAL HAZARD INFORMATION</div>
<h3>防災情報</h3>
<p>独自の安全評価は行わず、行政機関が公開する最新情報へ直接つなぎます。</p>
<div class="hp-hazard-list"><span>洪水</span><span>内水氾濫</span><span>高潮</span><span>地震</span><span>指定避難所</span></div>
<a class="hp-btn secondary" href="https://www.city.nagoya.jp/bousaiportal/hazardmap/1036429/1036295.html" target="_blank" rel="noopener">名古屋市 中区ハザードマップ</a>
<p class="hp-note">※最新情報および詳細は行政機関の公表資料をご確認ください。</p>
</div>
</div>
</div>`;
const footer=document.querySelector("footer");if(footer){footer.parentNode.insertBefore(section,footer)}else{document.body.appendChild(section)}
const grid=section.querySelector("#hp-life-grid");groups.forEach(g=>{const card=document.createElement("article");card.className="hp-life-card";let places=g.places.map(p=>`<a class="hp-place" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.q)}"><div class="hp-place-main"><div class="hp-place-name">${p.name}</div><div class="hp-place-note">${p.note}</div></div><div class="hp-place-dist">${p.dist}</div></a>`).join("");card.innerHTML=`<div class="hp-life-top"><div><div class="hp-en">${g.en}</div><h3>${g.title}</h3></div></div><p class="hp-copy">${g.copy}</p><div class="hp-place-list">${places}</div>`;grid.appendChild(card)});

const access=document.querySelector("#access");
if(access){
  const wrap=access.querySelector(".wrap")||access;
  const bus=document.createElement("div");
  bus.className="hp-bus";
  bus.innerHTML=`
    <div class="hp-kicker">BUS ACCESS</div>
    <div class="hp-bus-grid">
      <div>
        <h3>松原二丁目</h3>
        <p class="hp-bus-meta">名古屋市営バス「中巡回」</p>
        <p class="hp-note">徒歩分数は公開前に現地・地図で最終確認予定です。</p>
      </div>
      <div class="hp-bus-routes">
        <div class="hp-bus-route"><span>栄方面</span><b>大須・上前津を経由して栄へ</b></div>
        <div class="hp-bus-route"><span>金山方面</span><b>古渡町・正木を経由して金山へ</b></div>
      </div>
    </div>
  `;
  wrap.appendChild(bus);
}

const ld=document.createElement("script");ld.type="application/ld+json";ld.textContent=JSON.stringify({"@context":"https://schema.org","@type":"ApartmentComplex","name":"L’Allure松原","url":"https://mr-gyushisama.github.io/branding/","address":{"@type":"PostalAddress","postalCode":"460-0017","addressRegion":"愛知県","addressLocality":"名古屋市中区","streetAddress":"松原3丁目6-28","addressCountry":"JP"},"numberOfAccommodationUnits":19,"yearBuilt":"2019"});document.head.appendChild(ld);
const float=document.createElement("a");float.className="hp-float";float.href="#hp-neighborhood";float.textContent="周辺環境を見る";document.body.appendChild(float);
})();
