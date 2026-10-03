
(()=>{const groups=[
{key:"buy",en:"SHOP",title:"買う",copy:"毎日の買い物を、できるだけ近くで。食品・日用品を揃えやすい周辺環境です。",places:[
{name:"ヤマナカ 松原店",dist:"約165m",note:"スーパー",q:"ヤマナカ 松原店 名古屋"},
{name:"ファミリーマート 松原二丁目店",dist:"約120m",note:"コンビニ",q:"ファミリーマート 松原二丁目店"},
{name:"ドラッグスギヤマ 松原店",dist:"約170m",note:"ドラッグストア",q:"ドラッグスギヤマ 松原店"}
]},
{key:"support",en:"SUPPORT",title:"整える",copy:"郵便・金融・医療など、暮らしを支える施設も身近に。",places:[
{name:"名古屋橘郵便局",dist:"約70m",note:"郵便局",q:"名古屋橘郵便局"},
{name:"十六銀行 大須支店",dist:"約490m",note:"銀行",q:"十六銀行 大須支店"},
{name:"久野歯科医院",dist:"約50m",note:"医療",q:"久野歯科医院 名古屋 松原"}
]},
{key:"spend",en:"LIFE",title:"過ごす",copy:"身近な公園や大須エリアなど、日常の外出先にも選択肢があります。",places:[
{name:"前塚公園",dist:"約260m",note:"公園",q:"前塚公園 名古屋"},
{name:"大須商店街",dist:"徒歩圏",note:"商業・飲食エリア",q:"大須商店街 名古屋"},
{name:"アミカ 大須店",dist:"約560m",note:"食品店",q:"アミカ 大須店"}
]},
{key:"move",en:"ACCESS",title:"移動する",copy:"複数駅・複数路線を使い分け、都心方面へ動きやすい立地です。",places:[
{name:"大須観音駅",dist:"徒歩圏",note:"地下鉄鶴舞線",q:"大須観音駅"},
{name:"東別院駅",dist:"徒歩圏",note:"地下鉄名城線",q:"東別院駅"},
{name:"山王駅",dist:"徒歩圏",note:"名鉄名古屋本線",q:"山王駅 名古屋"}
]}
];
const section=document.createElement("section");section.id="hp-neighborhood";section.innerHTML=`
<div class="hp-wrap">
<div class="hp-kicker">NEIGHBORHOOD</div>
<h2>松原で暮らす。</h2>
<p class="hp-lead">建物だけでなく、その周辺も住まいの一部。毎日の買い物や移動、生活に必要な施設まで、この場所での暮らしをイメージできる情報をまとめました。</p>
<div class="hp-life-grid" id="hp-life-grid"></div>
<div class="hp-bottom-grid">
<div class="hp-map-card">
<div class="hp-kicker">AREA MAP</div>
<h3>周辺を地図で見る</h3>
<p>物件周辺の施設や街並みは、Google Mapsでまとめて確認できます。実際の徒歩経路や営業状況は現地・各施設の最新情報をご確認ください。</p>
<div class="hp-actions"><a class="hp-btn primary" href="https://maps.app.goo.gl/SSWyoZ1xjBk1yrQx9" target="_blank" rel="noopener">Google Mapsで周辺を見る</a></div>
<p class="hp-note">※距離は掲載時点の公開情報等を基にした参考値です。実際の徒歩経路・所要時間とは異なる場合があります。</p>
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
const ld=document.createElement("script");ld.type="application/ld+json";ld.textContent=JSON.stringify({"@context":"https://schema.org","@type":"ApartmentComplex","name":"L’Allure松原","url":"https://mr-gyushisama.github.io/branding/","address":{"@type":"PostalAddress","postalCode":"460-0017","addressRegion":"愛知県","addressLocality":"名古屋市中区","streetAddress":"松原3丁目6-28","addressCountry":"JP"},"numberOfAccommodationUnits":19,"yearBuilt":"2019"});document.head.appendChild(ld);
const float=document.createElement("a");float.className="hp-float";float.href="#hp-neighborhood";float.textContent="周辺環境を見る";document.body.appendChild(float);
})();
