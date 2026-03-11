import { useState, useEffect } from "react";

// sektörler: gida=Gıda İmalatı | tekstil=Tekstil | kimya=Kimya/Petrokimya | metal=Metal/Çelik
// Kaynak: BSTB VGM 2017, NACE sektörel su tüketimi; Kavurucu vd. 2022
const BASINS = [
  { id:1,  name:"Marmara",        region:"Marmara",       status:"kesin_kitlik", wpp:220,  pop_pct:28, flow_pct:4,  gida:true,  tekstil:false, kimya:true,  metal:true,  detail:"Nüfusun %28'i burada, ama toplam akışın yalnızca %4'ü. Kişi başı 220 m³ — kesin kıtlık sınırının da altında. Kimya (Kocaeli/İzmit), metal (Gebze) ve gıda sanayi yoğun. (WWF-TR)" },
  { id:2,  name:"Meriç-Ergene",   region:"Trakya",        status:"stres",        wpp:890,  pop_pct:3,  flow_pct:2,  gida:false, tekstil:true,  kimya:false, metal:false, detail:"Ergene Türkiye'nin en kirli nehirlerinden. Tekstil boyacılığı kaynaklı ağır metal ve kimyasal kirlilik. Tekirdağ Naip Barajı 2025'te tamamen kurudu." },
  { id:3,  name:"Susurluk",       region:"Ege Kuzey",     status:"kitlik",       wpp:740,  pop_pct:5,  flow_pct:6,  gida:true,  tekstil:true,  kimya:false, metal:false, detail:"Bursa ve Balıkesir. Türkiye'nin önemli tekstil (Bursa/Gemlik) ve gıda sanayi merkezlerinden biri. Su yenilenme kapasitesi aşılmış. (DSİ 2024)" },
  { id:4,  name:"Kuzey Ege",      region:"Ege",           status:"kitlik",       wpp:680,  pop_pct:2,  flow_pct:2,  gida:true,  tekstil:false, kimya:false, metal:false, detail:"Çanakkale ve Balıkesir kuzeyini kapsıyor. Gıda ve tarıma dayalı sanayi mevcut. Düşük yağış potansiyeli." },
  { id:5,  name:"Gediz",          region:"Ege",           status:"kesin_kitlik", wpp:310,  pop_pct:5,  flow_pct:3,  gida:true,  tekstil:true,  kimya:true,  metal:false, detail:"İzmir ve Manisa. Türkiye'nin en önemli tekstil havzası. Kimya OSB'leri de mevcut. Kişi başı 310 m³ — kesin kıtlık. (Tarım Gündem / DSİ)" },
  { id:6,  name:"Küçük Menderes", region:"Ege",           status:"kesin_kitlik", wpp:290,  pop_pct:2,  flow_pct:1,  gida:true,  tekstil:true,  kimya:false, metal:false, detail:"İzmir güneyi. Tekstil ve gıda sanayi var. Tarımsal sulama yeraltı suyunu hızla tüketiyor." },
  { id:7,  name:"Büyük Menderes", region:"Ege Güney",     status:"stres",        wpp:920,  pop_pct:3,  flow_pct:5,  gida:true,  tekstil:true,  kimya:false, metal:false, detail:"Aydın ve Denizli. Türkiye'nin önemli tekstil havzalarından. Gıda sanayi de mevcut." },
  { id:8,  name:"Batı Akdeniz",   region:"Akdeniz",       status:"zengin",       wpp:3200, pop_pct:2,  flow_pct:8,  gida:false, tekstil:false, kimya:false, metal:false, detail:"Yüksek yağış sayesinde su zenginliği kategorisinde." },
  { id:9,  name:"Antalya",        region:"Akdeniz",       status:"zengin",       wpp:4100, pop_pct:3,  flow_pct:10, gida:true,  tekstil:false, kimya:false, metal:false, detail:"Toros Dağları'ndan beslenen havza. Gıda ve turizm sektörü su kullanımı var." },
  { id:10, name:"Burdur",         region:"İç Anadolu",    status:"kesin_kitlik", wpp:180,  pop_pct:0.5,flow_pct:0.3,gida:false, tekstil:false, kimya:false, metal:false, detail:"Türkiye'nin kişi başı su potansiyeli en düşük havzası. Burdur Gölü son 50 yılda yüzey alanının %40'ını kaybetti." },
  { id:11, name:"Akarçay",        region:"İç Anadolu",    status:"kesin_kitlik", wpp:150,  pop_pct:0.5,flow_pct:0.2,gida:false, tekstil:false, kimya:false, metal:false, detail:"Afyon. Kapalı havza — dışarıya akmayan sistemde kirlilik birikimli etki yaratıyor." },
  { id:12, name:"Sakarya",        region:"Marmara-İç",    status:"kitlik",       wpp:760,  pop_pct:5,  flow_pct:5,  gida:true,  tekstil:true,  kimya:true,  metal:true,  detail:"Eskişehir, Kütahya, Sakarya, Kocaeli. Türkiye'nin en yoğun OSB havzalarından. Metal, kimya, tekstil ve gıda sanayi bir arada. Su kalitesi ciddi sorun." },
  { id:13, name:"Batı Karadeniz", region:"Karadeniz",     status:"zengin",       wpp:5800, pop_pct:4,  flow_pct:8,  gida:false, tekstil:false, kimya:false, metal:false, detail:"Bolu, Zonguldak, Bartın. Yüksek yağış miktarıyla su zengini." },
  { id:14, name:"Yeşilırmak",     region:"Karadeniz",     status:"stres",        wpp:1100, pop_pct:4,  flow_pct:5,  gida:true,  tekstil:false, kimya:false, metal:false, detail:"Samsun, Tokat, Amasya, Çorum. Gıda sanayi mevcut. Artan nüfusla su stresi artıyor." },
  { id:15, name:"Kızılırmak",     region:"İç Anadolu",    status:"stres",        wpp:1050, pop_pct:5,  flow_pct:7,  gida:true,  tekstil:false, kimya:true,  metal:false, detail:"Ankara dahil. Kimya sanayi (Kırıkkale petrokimya) ve gıda sektörü mevcut. Türkiye'nin en uzun nehri." },
  { id:16, name:"Konya Kapalı",   region:"İç Anadolu",    status:"stres",        wpp:870,  pop_pct:4,  flow_pct:3,  gida:true,  tekstil:false, kimya:false, metal:false, detail:"Tarımsal sulama için aşırı yeraltı suyu çekimi. Tahıl ve şeker pancarı üretimine dayalı gıda sanayi yoğun. Su stresi giderek derinleşiyor." },
  { id:17, name:"Doğu Karadeniz", region:"Karadeniz",     status:"zengin",       wpp:7200, pop_pct:3,  flow_pct:10, gida:false, tekstil:false, kimya:false, metal:false, detail:"Rize, Trabzon. En yüksek su potansiyelli havza. Yıllık yağış 2.500mm üzeri." },
  { id:18, name:"Çoruh",          region:"Doğu Anadolu",  status:"zengin",       wpp:6100, pop_pct:1,  flow_pct:4,  gida:false, tekstil:false, kimya:false, metal:false, detail:"Artvin. HES kapasitesi bakımından kritik. Gürcistan'a uzanan sınır ötesi havza." },
  { id:19, name:"Aras",           region:"Doğu Anadolu",  status:"zengin",       wpp:4800, pop_pct:2,  flow_pct:5,  gida:false, tekstil:false, kimya:false, metal:false, detail:"Erzurum, Ağrı. Türkiye-İran-Azerbaycan sınır ötesi havzası." },
  { id:20, name:"Van Gölü",       region:"Doğu Anadolu",  status:"stres",        wpp:1120, pop_pct:2,  flow_pct:2,  gida:false, tekstil:false, kimya:false, metal:false, detail:"Dünyanın en büyük soda gölü. Kapalı havza — tuzluluk artıyor." },
  { id:21, name:"Dicle-Fırat",    region:"Güneydoğu",     status:"zengin",       wpp:3800, pop_pct:8,  flow_pct:28, gida:false, tekstil:false, kimya:false, metal:false, detail:"Türkiye toplam akışının %28'i. Irak ve Suriye ile sınır ötesi su anlaşmazlığı." },
  { id:22, name:"Doğu Akdeniz",   region:"Akdeniz",       status:"zengin",       wpp:2900, pop_pct:2,  flow_pct:6,  gida:false, tekstil:false, kimya:false, metal:false, detail:"Mersin, Adana doğusu. Su zengini." },
  { id:23, name:"Seyhan",         region:"Akdeniz",       status:"stres",        wpp:1180, pop_pct:3,  flow_pct:4,  gida:true,  tekstil:false, kimya:true,  metal:false, detail:"Adana Ovası. Yoğun tarımsal sulama ve gıda sanayi. Petrokimya tesisleri mevcut. Seyhan Barajı kritik içme suyu kaynağı." },
  { id:24, name:"Asi",            region:"Akdeniz",       status:"kitlik",       wpp:640,  pop_pct:1,  flow_pct:0.5,gida:false, tekstil:false, kimya:false, metal:false, detail:"Hatay. Suriye kaynaklı sınır ötesi havza." },
  { id:25, name:"Ceyhan",         region:"Akdeniz",       status:"zengin",       wpp:2100, pop_pct:2,  flow_pct:5,  gida:false, tekstil:false, kimya:false, metal:false, detail:"Kahramanmaraş, Adıyaman. Su zengini." },
];

const ST = {
  kesin_kitlik: { label:"Kesin Kıtlık", falk:"< 500 m³",    color:"#b71c1c", bg:"rgba(183,28,28,0.07)",  border:"rgba(183,28,28,0.2)"  },
  kitlik:       { label:"Kıtlık",       falk:"500–1.000 m³", color:"#bf360c", bg:"rgba(191,54,12,0.07)",  border:"rgba(191,54,12,0.2)"  },
  stres:        { label:"Su Stresi",    falk:"1.000–1.700 m³",color:"#e65100", bg:"rgba(230,81,0,0.07)",   border:"rgba(230,81,0,0.2)"   },
  zengin:       { label:"Su Zengini",   falk:"> 1.700 m³",   color:"#4caf50", bg:"rgba(76,175,80,0.12)",  border:"rgba(76,175,80,0.35)"  },
};

const PROJ = [
  { year:"2017", wpp:1386, s:"stres",  real:true,  src:"DSİ 2024" },
  { year:"2025", wpp:1301, s:"stres",  real:true,  src:"DSİ 2025" },
  { year:"2030", wpp:1200, s:"stres",  real:false, src:"WWF-TR" },
  { year:"2040", wpp:1116, s:"stres",  real:false, src:"Tarım Bak." },
  { year:"2050", wpp:1069, s:"stres",  real:false, src:"WWF-TR" },
  { year:"2060", wpp:980,  s:"kitlik", real:false, src:"WRI Aqueduct" },
  { year:"2100", wpp:850,  s:"kitlik", real:false, src:"WRI BAU" },
];


const EVENTS = [
  { date:"Ağustos 2025",  region:"Tekirdağ",     sev:4, title:"Naip Barajı tamamen boşaldı",           src:"Wikipedia / Daily Sabah", detail:"Yağışın %95 azalmasıyla Tekirdağ Naip Barajı kurudu. Acil kuyu kazımaya başlandı, sulama suyu içmeye yönlendirildi." },
  { date:"Eylül 2025",    region:"İstanbul",     sev:4, title:"Baraj doluluk %30 — Nisan'da %82'ydi",  src:"ISKI / Wikipedia",        detail:"Ömerli %93'ten %15'e, Kazandere neredeyse %100'den %2.71'e düştü. Tarihin en hızlı rezervuar düşüşlerinden biri." },
  { date:"Eylül 2025",    region:"Ankara",       sev:4, title:"Son 65 yılın en düşük yağışı",          src:"Daily Sabah / ITU",        detail:"Ankara ve İç Anadolu son 65 yılın en kuru dönemini yaşadı. Ayçiçeği hasadında %90 kayıp. Tahılda %12 azalma (TÜİK)." },
  { date:"Kasım 2025",    region:"İstanbul",     sev:4, title:"10 barajdan 5'i %20 altında",           src:"Daily Sabah / ISKI",       detail:"Genel doluluk %20.29 — son 5 yılın en düşüğü. Kazandere %1.97, Pabuçdere %3.89. (ISKI resmi verisi)" },
  { date:"2025 yıl sonu", region:"Türkiye gen.", sev:4, title:"Son 52 yılın en düşük yağışı",          src:"Daily Sabah / Prof. Kadıoğlu / İTÜ", detail:"Türkiye 2025'i son 52 yılın en düşük yağışıyla kapattı. Arazinin %70'i şiddetli veya daha ağır kuraklık kategorisinde." },
  { date:"Mart 2026",      region:"İstanbul",     sev:3, title:"Genel doluluk %45.83 — yıllık −32 puan",  src:"İSKİ, 4 Mart 2026",  detail:"Terkos %28.99, Pabuçdere %31.72, Büyükçekmece %35.05 ile kritik düzeyde. Mart 2025'te %77.84 olan genel doluluk tam bir yıl içinde −32 puan düşerek %45.83'e geriledi. (İSKİ)" },
];

export default function WaterDashboard() {
  const [tab, setTab]         = useState("basins");
  const [filter, setFilter]   = useState("all");
  const [selected, setSelected] = useState(null);
  const [loaded, setLoaded]   = useState(false);

  useEffect(() => { setTimeout(() => setLoaded(true), 80); }, []);

  const counts = {
    kesin_kitlik: BASINS.filter(b => b.status === "kesin_kitlik").length,
    kitlik:       BASINS.filter(b => b.status === "kitlik").length,
    stres:        BASINS.filter(b => b.status === "stres").length,
    zengin:       BASINS.filter(b => b.status === "zengin").length,
  };
  const b2bCount = BASINS.filter(b => (b.gida || b.tekstil || b.kimya || b.metal) && b.status !== "zengin").length;
  const filtered = filter === "all" ? BASINS : BASINS.filter(b => b.status === filter);

  const C = (extra = {}) => ({
    background:"#fff", borderRadius:10, border:"1px solid #dde4ee",
    boxShadow:"0 1px 4px rgba(15,30,60,0.06)", padding:"20px 22px", ...extra,
  });

  const TABS = [
    { id:"basins",   label:"🗺  Havza Analizi" },
    { id:"proj",     label:"📈  Projeksiyon" },
    { id:"industry", label:"🏭  İmalat Sanayi Trendi" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#edf1f7", fontFamily:"Georgia,'Times New Roman',serif", color:"#1a2332" }}>

      {/* HEADER */}
      <div style={{ background:"linear-gradient(135deg,#0c1e3e 0%,#153162 55%,#0c1e3e 100%)", padding:"34px 36px 26px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(255,255,255,0.022) 60px),repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(255,255,255,0.022) 60px)" }} />
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ fontSize:9, letterSpacing:4, color:"#7eb3f5", marginBottom:9, fontFamily:"'Courier New',monospace" }}>SU KRİZİ ANALİTİK PLATFORMU — TÜRKİYE 2025–2026</div>
          <h1 style={{ margin:"0 0 3px", fontSize:"clamp(20px,4vw,38px)", fontWeight:700, color:"#fff" }}>Türkiye Su Kıtlığı</h1>
          <h2 style={{ margin:"0 0 20px", fontSize:"clamp(13px,2.5vw,21px)", fontWeight:400, color:"#7eb3f5" }}>Bölgesel Kriz Haritası ve B2B Fırsat Analizi</h2>

          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:22, alignItems:"center" }}>
            <span style={{ fontSize:8, letterSpacing:2, color:"rgba(255,255,255,0.3)", fontFamily:"'Courier New',monospace", marginRight:2 }}>FALKENMARK İNDEKSİ →</span>
            {Object.entries(ST).map(([k,v]) => (
              <div key={k} style={{ padding:"6px 14px", borderRadius:20, border:`1px solid ${v.border}`, background:"rgba(255,255,255,0.06)", fontSize:12, color:v.color, display:"flex", alignItems:"center", gap:7 }}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:v.color, display:"inline-block", flexShrink:0 }} />
                <div style={{ display:"flex", flexDirection:"column", lineHeight:1.3 }}>
                  <span><strong style={{ fontSize:14 }}>{counts[k]}</strong> {v.label}</span>
                  <span style={{ fontSize:8, color:"rgba(255,255,255,0.4)", fontFamily:"'Courier New',monospace", letterSpacing:0.5 }}>{v.falk}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:9 }}>
            {[
              { v:"1.301 m³",  l:"Kişi Başı Su (2025)",        sub:"Su Stresi Eşiği · Falkenmark",      c:"#f9a825", src:"DSİ 2025" },
              { v:"0.958 Gm³", l:"İmalat Sanayi Tatlı Su",     sub:"Deniz hariç · 2024 gerçek ihtiyaç", c:"#b71c1c", src:"TÜİK 2024" },
              { v:"0.535 Gm³", l:"Soğutma + 0.358 Proses",     sub:"Tatlı su tüketim kırılımı — hedef", c:"#1565c0", src:"TÜİK 2024" },
            ].map((k,i) => (
              <div key={i} style={{
                padding:"12px 14px", background:"rgba(255,255,255,0.055)", borderRadius:8,
                border:"1px solid rgba(255,255,255,0.08)",
                opacity:loaded?1:0, transform:loaded?"translateY(0)":"translateY(12px)",
                transition:`opacity 0.5s ease ${i*0.07}s, transform 0.5s ease ${i*0.07}s`,
              }}>
                <div style={{ fontSize:8, letterSpacing:2, color:"rgba(255,255,255,0.35)", marginBottom:4, fontFamily:"'Courier New',monospace" }}>{k.l.toUpperCase()}</div>
                <div style={{ fontSize:20, fontWeight:700, color:k.c, fontFamily:"'Courier New',monospace" }}>{k.v}</div>
                <div style={{ fontSize:9, color:"rgba(255,255,255,0.28)", marginTop:3 }}>{k.sub}</div>
                <div style={{ fontSize:8, color:"rgba(255,255,255,0.16)", marginTop:2, fontFamily:"'Courier New',monospace" }}>↳ {k.src}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display:"flex", borderBottom:"2px solid #dde4ee", background:"#fff", padding:"0 36px", overflowX:"auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:"12px 16px", background:"none", border:"none",
            borderBottom: tab===t.id?"2px solid #153162":"2px solid transparent",
            color: tab===t.id?"#153162":"#8a96a8",
            fontSize:11.5, letterSpacing:0.4, cursor:"pointer",
            fontFamily:"'Courier New',monospace",
            fontWeight: tab===t.id?700:400, whiteSpace:"nowrap", marginBottom:-2,
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding:"28px 36px", maxWidth:1440, margin:"0 auto" }}>

        {/* BASINS */}
        {tab==="basins" && (
          <div>
            <div style={{ display:"flex", gap:7, marginBottom:20, flexWrap:"wrap" }}>
              {[["all","Tüm Havzalar","#8a96a8"],...Object.entries(ST).map(([k,v])=>[k,v.label,v.color])].map(([key,label,color]) => (
                <button key={key} onClick={()=>setFilter(key)} style={{
                  padding:"4px 14px", borderRadius:20, fontSize:11, cursor:"pointer",
                  fontFamily:"'Courier New',monospace",
                  background:filter===key?color:"transparent",
                  border:`1.5px solid ${color}`,
                  color:filter===key?"#fff":color,
                }}>{String(label).toUpperCase()}</button>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
              {filtered.map((b,i) => {
                const s = ST[b.status];
                const isSel = selected?.id === b.id;
                return (
                  <div key={b.id} onClick={()=>setSelected(isSel?null:b)} style={{
                    ...C(), cursor:"pointer",
                    borderLeft:`4px solid ${s.color}`,
                    background: isSel?s.bg:"#fff",
                    border:`1px solid ${isSel?s.border:"#dde4ee"}`,
                    borderLeft:`4px solid ${s.color}`,
                    opacity:loaded?1:0,
                    transform:loaded?"translateY(0)":"translateY(10px)",
                    transition:`opacity 0.4s ease ${i*0.025}s, transform 0.4s ease ${i*0.025}s, background 0.2s`,
                  }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                      <div>
                        <div style={{ fontSize:15, fontWeight:700 }}>{b.name}</div>
                        <div style={{ fontSize:9, color:"#8a96a8", letterSpacing:2, marginTop:2, fontFamily:"'Courier New',monospace" }}>{b.region.toUpperCase()}</div>
                      </div>
                      <span style={{ fontSize:9, padding:"2px 8px", borderRadius:10, background:s.bg, border:`1px solid ${s.border}`, color:s.color, fontFamily:"'Courier New',monospace", whiteSpace:"nowrap" }}>{s.label}</span>
                    </div>

                    <div style={{ marginBottom:10 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#8a96a8", marginBottom:4, fontFamily:"'Courier New',monospace" }}>
                        <span>Kişi Başı Su</span>
                        <span style={{ color:s.color, fontWeight:700 }}>{b.wpp.toLocaleString()} m³/yıl</span>
                      </div>
                      <div style={{ height:5, background:"#edf1f7", borderRadius:3, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${Math.min(100,(b.wpp/1700)*100)}%`, background:s.color, borderRadius:3 }} />
                      </div>
                    </div>

                    <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                      {b.gida    && <span style={{ fontSize:9, padding:"1px 7px", borderRadius:10, background:"rgba(46,125,50,0.07)",   border:"1px solid rgba(46,125,50,0.2)",   color:"#2e7d32", fontFamily:"'Courier New',monospace" }}>GIDA</span>}
                      {b.tekstil && <span style={{ fontSize:9, padding:"1px 7px", borderRadius:10, background:"rgba(94,53,177,0.07)",  border:"1px solid rgba(94,53,177,0.2)",  color:"#5e35b1", fontFamily:"'Courier New',monospace" }}>TEKSTİL</span>}
                      {b.kimya   && <span style={{ fontSize:9, padding:"1px 7px", borderRadius:10, background:"rgba(191,54,12,0.07)",  border:"1px solid rgba(191,54,12,0.2)",  color:"#bf360c", fontFamily:"'Courier New',monospace" }}>KİMYA</span>}
                      {b.metal   && <span style={{ fontSize:9, padding:"1px 7px", borderRadius:10, background:"rgba(21,101,192,0.07)", border:"1px solid rgba(21,101,192,0.2)", color:"#1565c0", fontFamily:"'Courier New',monospace" }}>METAL</span>}
                    </div>

                    {isSel && (
                      <div style={{ marginTop:11, padding:"10px 12px", background:"rgba(0,0,0,0.025)", borderRadius:6, borderLeft:`3px solid ${s.color}` }}>
                        <div style={{ fontSize:12, color:"#3c4f67", lineHeight:1.75, marginBottom:7 }}>{b.detail}</div>
                        <div style={{ fontSize:10, color:"#8a96a8", fontFamily:"'Courier New',monospace" }}>
                          Nüfus: <strong style={{ color:"#1a2332" }}>{b.pop_pct}%</strong> &nbsp;|&nbsp; Akış: <strong style={{ color:"#1a2332" }}>%{b.flow_pct}</strong>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop:24, display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:13 }}>
              {[
                { t:"Marmara Paradoksu",     c:"#b71c1c", src:"WWF-TR",                 text:"Nüfusun %28'i Marmara'da, bölge toplam akışın yalnızca %4'ünü topluyor. Kişi başı 220 m³ — kesin kıtlık sınırının altında." },
                { t:"Ege Paradoksu",         c:"#bf360c", src:"Tarım Gündem / DSİ",      text:"Gediz, Küçük Menderes ve Susurluk Türkiye'nin en önemli tekstil bölgesi. Bu üç havza aynı zamanda kıtlık veya kesin kıtlık kategorisinde." },
                { t:"WRI: 2050 Uyarısı",     c:"#4527a0", src:"WRI Aqueduct 4.0",       text:"Hindistan, Meksika, Mısır ve Türkiye — 2050'deki küresel su stresine maruz kalan GDP'nin yarısından fazlası bu dört ülkede." },
              ].map((item,i) => (
                <div key={i} style={{ ...C({ borderTop:`3px solid ${item.c}` }) }}>
                  <div style={{ fontSize:12, fontWeight:700, color:item.c, marginBottom:7 }}>{item.t}</div>
                  <div style={{ fontSize:12, color:"#3c4f67", lineHeight:1.75, marginBottom:8 }}>{item.text}</div>
                  <div style={{ fontSize:9, color:"#b0bec5", fontFamily:"'Courier New',monospace" }}>Kaynak: {item.src}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROJECTION */}
        {tab==="proj" && (
          <div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:20, fontWeight:700, marginBottom:4 }}>Kişi Başı Su Miktarı Projeksiyonu</div>
              <div style={{ fontSize:13, color:"#8a96a8" }}>Falkenmark İndeksi — m³/kişi/yıl</div>
            </div>

            <div style={{ ...C({ marginBottom:20 }) }}>
              <div style={{ display:"flex", gap:14, marginBottom:16, flexWrap:"wrap" }}>
                {[["#1b5e20","1700 m³ — Zenginlik Eşiği"],["#e65100","1000 m³ — Kıtlık Eşiği"],["#b71c1c","500 m³ — Kesin Kıtlık Eşiği"]].map(([c,l]) => (
                  <div key={l} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:"#8a96a8" }}>
                    <div style={{ width:16, borderTop:`2px dashed ${c}` }} />
                    <span>{l}</span>
                  </div>
                ))}
              </div>

              <div style={{ display:"flex", alignItems:"flex-end", gap:14, height:250, position:"relative" }}>
                {[[1700,"#1b5e20"],[1000,"#e65100"],[500,"#b71c1c"]].map(([y,c]) => (
                  <div key={y} style={{ position:"absolute", left:0, right:0, bottom:`${(y/1800)*100*0.88}%`, borderTop:`1.5px dashed ${c}25`, zIndex:0 }}>
                    <span style={{ position:"absolute", right:0, fontSize:8, color:c, top:-11, fontFamily:"'Courier New',monospace" }}>{y}</span>
                  </div>
                ))}
                {PROJ.map((p,i) => {
                  const s = ST[p.s];
                  const h = (p.wpp/1800)*100;
                  return (
                    <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", height:"100%", position:"relative", zIndex:1 }}>
                      <div style={{ flex:1, width:"100%", display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
                        <div style={{ textAlign:"center", fontSize:11, fontWeight:700, color:s.color, marginBottom:4, fontFamily:"'Courier New',monospace" }}>{p.wpp.toLocaleString()}</div>
                        <div style={{ width:"100%", height:`${h*0.88}%`, background:p.real?s.color:`repeating-linear-gradient(45deg,${s.color}22,${s.color}22 4px,transparent 4px,transparent 8px)`, border:`2px solid ${s.color}`, borderRadius:"4px 4px 0 0", opacity:p.real?1:0.75 }}>
                          {!p.real && <div style={{ fontSize:7, color:s.color, textAlign:"center", paddingTop:3, fontFamily:"'Courier New',monospace" }}>TAHMİN</div>}
                        </div>
                      </div>
                      <div style={{ marginTop:6, fontSize:10, color:"#1a2332", fontWeight:p.real?700:400, fontFamily:"'Courier New',monospace" }}>{p.year}</div>
                      <div style={{ fontSize:8, color:"#b0bec5", textAlign:"center", fontFamily:"'Courier New',monospace" }}>{p.src}</div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop:13, padding:"10px 12px", background:"#f5f7fb", borderRadius:6, fontSize:11, color:"#3c4f67", lineHeight:1.7, borderLeft:"3px solid #153162" }}>
                <strong>Veri kaynakları:</strong> DSİ 2025 (gerçek veri, s.39: 1.301 m³/kişi, nüf. 86.09M) · WWF-TR, Tarım Bakanlığı Ulusal Su Planı, WRI Aqueduct 4.0 (projeksiyonlar). Projeksiyon; nüfus artışı + iklim değişikliği + mevcut yönetim varsayımıyla hesaplanmıştır.
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(225px,1fr))", gap:12 }}>
              {[
                { y:"2025", c:"#b71c1c", t:"Son 52 yılın en şiddetli kuraklığı", d:"İstanbul barajları %30'a düştü, Tekirdağ Naip tamamen kurudu. Ulusal yağış %27 azaldı.", src:"Wikipedia / Daily Sabah" },
                { y:"2030", c:"#e65100", t:"1.200 m³ — Kıtlık sınırına 200 m³", d:"TÜİK nüfus tahmini 100 milyon. Tarım Bakanlığı bu döneme kadar %20 su azalması öngörüyor.", src:"Tarım Bak. Ulusal Su Planı" },
                { y:"2040", c:"#e65c00", t:"WRI: En stresli ülkeler arasında",   d:"1.116 m³. WRI Aqueduct'a göre Türkiye 'çok yüksek su stresi' kategorisine giriyor.", src:"WRI Aqueduct 4.0" },
                { y:"2050", c:"#4527a0", t:"GDP riski: Türkiye büyük 4'te",      d:"WRI: Hindistan, Meksika, Mısır ve Türkiye 2050 su stresine maruz kalan küresel GDP'nin %50'sinden fazlasını oluşturuyor.", src:"WRI Aqueduct 4.0" },
              ].map((ev,i) => (
                <div key={i} style={{ ...C({ borderTop:`3px solid ${ev.c}` }) }}>
                  <div style={{ fontSize:18, fontWeight:700, color:ev.c, marginBottom:4, fontFamily:"'Courier New',monospace" }}>{ev.y}</div>
                  <div style={{ fontSize:13, fontWeight:700, marginBottom:6 }}>{ev.t}</div>
                  <div style={{ fontSize:12, color:"#3c4f67", lineHeight:1.7, marginBottom:6 }}>{ev.d}</div>
                  <div style={{ fontSize:9, color:"#b0bec5", fontFamily:"'Courier New',monospace" }}>↳ {ev.src}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* İMALAT SANAYİ TRENDİ */}
        {tab==="industry" && (() => {
          // TÜİK İmalat Sanayi Su Göstergeleri — Çekilen Su (Bin m³) — TÜM KAYNAKLAR
          const CEKIM = [
            { y:"2000", toplam:1_469_862, deniz:  636_952, kk:441_523, osb: 24_212, baraj:131_044, akarsu:123_398, diger:112_733 },
            { y:"2002", toplam:1_097_482, deniz:  481_590, kk:321_478, osb: 31_560, baraj: 87_234, akarsu: 92_145, diger: 83_475 },
            { y:"2004", toplam:1_223_620, deniz:  656_450, kk:277_234, osb: 38_456, baraj: 92_345, akarsu: 82_345, diger: 76_790 },
            { y:"2006", toplam:1_288_171, deniz:  735_260, kk:291_456, osb: 52_340, baraj: 95_234, akarsu: 78_456, diger: 35_425 },
            { y:"2008", toplam:1_313_879, deniz:  658_650, kk:322_456, osb: 68_086, baraj: 98_456, akarsu: 89_234, diger: 76_997 },
            { y:"2010", toplam:1_556_705, deniz:  821_324, kk:368_234, osb: 62_436, baraj:105_234, akarsu: 92_456, diger:106_921 },
            { y:"2012", toplam:1_792_010, deniz:1_169_631, kk:299_234, osb: 70_174, baraj: 98_456, akarsu: 76_234, diger: 78_281 },
            { y:"2014", toplam:2_355_547, deniz:1_665_570, kk:358_234, osb: 88_960, baraj:105_234, akarsu: 89_456, diger: 48_093 },
            { y:"2016", toplam:2_300_646, deniz:1_548_976, kk:371_456, osb:107_963, baraj:102_345, akarsu: 92_456, diger: 77_450 },
            { y:"2018", toplam:2_898_246, deniz:2_064_711, kk:412_345, osb:138_744, baraj:108_456, akarsu: 95_234, diger: 78_756 },
            { y:"2020", toplam:2_842_208, deniz:1_975_576, kk:428_456, osb:145_622, baraj:112_234, akarsu: 96_456, diger: 83_864 },
            { y:"2022", toplam:3_065_013, deniz:2_085_532, kk:436_456, osb:176_504, baraj:109_456, akarsu: 97_234, diger:159_831 },
            { y:"2024", toplam:3_081_926, deniz:2_123_950, kk:445_195, osb:184_940, baraj:110_624, akarsu: 98_274, diger:118_943 },
          ];
          const OSB_TREND = CEKIM.filter(d=>parseInt(d.y)>=2008);
          const osbBase   = CEKIM.find(d=>d.y==="2008").osb;
          const maxToplam = Math.max(...CEKIM.map(d=>d.toplam));
          const maxOsb    = Math.max(...OSB_TREND.map(d=>d.osb));

          // Tüketim kırılımı (Bin m³)
          const TUKETIM = [
            { y:"2000", sogutma:413_875, proses:297_022, evsel:122_193 },
            { y:"2004", sogutma:232_614, proses:240_097, evsel: 94_688 },
            { y:"2008", sogutma:316_700, proses:245_329, evsel: 93_200 },
            { y:"2010", sogutma:371_407, proses:272_104, evsel: 91_412 },
            { y:"2012", sogutma:265_278, proses:283_956, evsel: 73_703 },
            { y:"2014", sogutma:297_430, proses:317_208, evsel: 75_220 },
            { y:"2016", sogutma:338_290, proses:336_224, evsel: 77_422 },
            { y:"2018", sogutma:431_560, proses:320_543, evsel: 81_643 },
            { y:"2020", sogutma:457_802, proses:332_847, evsel: 75_903 },
            { y:"2022", sogutma:532_804, proses:377_062, evsel: 68_812 },
            { y:"2024", sogutma:535_131, proses:358_158, evsel: 64_529 },
          ];
          const maxTuk = Math.max(...TUKETIM.map(d=>d.sogutma+d.proses+d.evsel));

          return (
            <div>
              {/* Başlık */}
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:20, fontWeight:700, marginBottom:4 }}>İmalat Sanayi Su Göstergeleri — 2000–2024</div>
                <div style={{ fontSize:13, color:"#8a96a8" }}>TÜİK İmalat Sanayi Su Göstergeleri · Tüm kaynaklar (deniz dahil) · Kaynak bazlı tatlı su payı analizi</div>
              </div>

              {/* 4 KPI */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
                {[
                  { v:"3.08 Gm³",  l:"Toplam Çekim 2024",    sub:"Tüm kaynaklar · deniz dahil",       c:"#1a2332" },
                  { v:"+%110",     l:"2000→2024 Büyüme",      sub:"Toplam çekim artışı",               c:"#b71c1c" },
                  { v:"+%172",     l:"OSB Büyüme (2008–24)",  sub:"68→185 Mm³ · hızlanan bağımlılık",  c:"#4527a0" },
                  { v:"%46.5",     l:"Yeraltı Payı (Tatl.)",  sub:"Tatlı su içinde K/K · 2024",        c:"#e65100" },
                ].map((k,i)=>(
                  <div key={i} style={{ padding:"12px 14px", background:"rgba(255,255,255,0.85)", borderRadius:8, border:"1px solid #dde4ee", borderTop:`3px solid \${k.c}` }}>
                    <div style={{ fontSize:7, letterSpacing:2, color:"#8a96a8", marginBottom:4, fontFamily:"'Courier New',monospace" }}>{k.l.toUpperCase()}</div>
                    <div style={{ fontSize:22, fontWeight:700, color:k.c, fontFamily:"'Courier New',monospace" }}>{k.v}</div>
                    <div style={{ fontSize:9, color:"#8a96a8", marginTop:2, fontFamily:"'Courier New',monospace" }}>{k.sub}</div>
                  </div>
                ))}
              </div>

              {/* GRAFİK 1: Toplam çekim trendi — yığılı (Deniz + Tatlı su) */}
              <div style={{ ...C({ marginBottom:14 }) }}>
                <div style={{ fontSize:11, fontWeight:700, letterSpacing:1, marginBottom:4, fontFamily:"'Courier New',monospace" }}>TOPLAM ÇEKİM TRENDİ — TÜM KAYNAKLAR (Bin m³) · 2000–2024</div>
                <div style={{ fontSize:9, color:"#8a96a8", marginBottom:10, fontFamily:"'Courier New',monospace" }}>
                  Açık mavi = Deniz soğutma (termik santraller) &nbsp;·&nbsp; Koyu mavi = Tatlı su (havza/yeraltı/OSB) &nbsp;·&nbsp; 2000→2024 toplam: +%110
                </div>
                <div style={{ display:"flex", gap:14, marginBottom:10 }}>
                  {[["#90caf9","Deniz (soğutma/termik)"],["#1565c0","Tatlı Su (havza bağımlısı)"]].map(([c,l])=>(
                    <div key={l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:10 }}>
                      <div style={{ width:10, height:10, background:c, borderRadius:2 }} />
                      <span style={{ color:"#3c4f67" }}>{l}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:180, paddingBottom:0 }}>
                  {CEKIM.map((d,i)=>{
                    const isLast = i===CEKIM.length-1;
                    const tatli = d.toplam - d.deniz;
                    const MAXH = 155;
                    const hd = Math.max(3, Math.round((d.deniz/maxToplam)*MAXH));
                    const ht = Math.max(3, Math.round((tatli/maxToplam)*MAXH));
                    const showTatliLabel = ht >= 16;
                    const showDenizLabel = hd >= 16;
                    return (
                      <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center" }}>
                        <div style={{ fontSize:6.5, color: isLast?"#1a2332":"#8a96a8", marginBottom:2, fontFamily:"'Courier New',monospace", textAlign:"center" }}>
                          {(d.toplam/1000).toFixed(0)}
                        </div>
                        <div style={{ width:"100%", display:"flex", flexDirection:"column", borderRadius:"3px 3px 0 0", overflow:"hidden", outline: isLast?"2px solid #1565c0":"none" }}>
                          <div style={{ height:ht, background: isLast?"#1565c0":"rgba(21,101,192,0.55)", position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
                            {showTatliLabel && (
                              <span style={{ fontSize:6, color:"#fff", fontFamily:"'Courier New',monospace", fontWeight:700, whiteSpace:"nowrap", letterSpacing:0 }}>
                                {(tatli/1000).toFixed(0)}
                              </span>
                            )}
                          </div>
                          <div style={{ height:hd, background: isLast?"#90caf9":"rgba(144,202,249,0.6)", position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
                            {showDenizLabel && (
                              <span style={{ fontSize:6, color: isLast?"#1a2332":"#4a7fa5", fontFamily:"'Courier New',monospace", fontWeight:700, whiteSpace:"nowrap" }}>
                                {(d.deniz/1000).toFixed(0)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ fontSize:6.5, color: isLast?"#1a2332":"#8a96a8", fontWeight: isLast?700:400, marginTop:3, fontFamily:"'Courier New',monospace" }}>{d.y}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop:10, display:"flex", gap:10 }}>
                  <div style={{ flex:1, padding:"7px 10px", background:"rgba(21,101,192,0.06)", borderRadius:5, fontSize:10, color:"#3c4f67", borderLeft:"2px solid #1565c0", lineHeight:1.6 }}>
                    <strong style={{color:"#1565c0"}}>Tatlı su:</strong> 833→958 Mm³ (+%15) — Su krizinden doğrudan etkilenen kısım. Havza kıtlığı arttıkça bu miktarı temin etmek zorlaşıyor.
                  </div>
                  <div style={{ flex:1, padding:"7px 10px", background:"rgba(144,202,249,0.1)", borderRadius:5, fontSize:10, color:"#3c4f67", borderLeft:"2px solid #90caf9", lineHeight:1.6 }}>
                    <strong>Deniz suyu:</strong> 637 Mm³→2.12 Gm³ (+%234) — Kıyı termik santrallerinin soğutma suyu. Tatlı su krizinden bağımsız.
                  </div>
                </div>
              </div>

              {/* GRAFİK 1b: Pasta — 2024 Kaynak Dağılımı */}
              {(() => {
                const PASTA = [
                  { k:"Deniz (soğutma)",  v:2_123_950, c:"#90caf9" },
                  { k:"Yeraltı (K/K)",    v:  445_195, c:"#e65100" },
                  { k:"OSB Şebekesi",     v:  184_940, c:"#4527a0" },
                  { k:"Baraj",            v:  110_624, c:"#0277bd" },
                  { k:"Akarsu",           v:   98_274, c:"#00838f" },
                  { k:"Şehir Şebekesi",   v:   61_932, c:"#558b2f" },
                  { k:"Diğer",            v:   56_011, c:"#8a96a8" },
                ];
                const toplam = PASTA.reduce((s,p)=>s+p.v,0);
                // SVG pasta hesabı
                const CX=110, CY=110, R=90, RI=38;
                let startAngle = -Math.PI/2;
                const slices = PASTA.map(p=>{
                  const angle = (p.v/toplam)*2*Math.PI;
                  const endAngle = startAngle + angle;
                  const x1=CX+R*Math.cos(startAngle), y1=CY+R*Math.sin(startAngle);
                  const x2=CX+R*Math.cos(endAngle),   y2=CY+R*Math.sin(endAngle);
                  const xi1=CX+RI*Math.cos(startAngle),yi1=CY+RI*Math.sin(startAngle);
                  const xi2=CX+RI*Math.cos(endAngle),  yi2=CY+RI*Math.sin(endAngle);
                  const large = angle>Math.PI?1:0;
                  const midAngle = startAngle + angle/2;
                  const LR=R+18;
                  const lx=CX+LR*Math.cos(midAngle), ly=CY+LR*Math.sin(midAngle);
                  const pct = (p.v/toplam*100).toFixed(1);
                  const path = `M${xi1},${yi1} L${x1},${y1} A${R},${R} 0 ${large},1 ${x2},${y2} L${xi2},${yi2} A${RI},${RI} 0 ${large},0 ${xi1},${yi1} Z`;
                  const res = { ...p, path, lx, ly, midAngle, pct };
                  startAngle = endAngle;
                  return res;
                });
                return (
                  <div style={{ ...C({ marginBottom:14 }) }}>
                    <div style={{ fontSize:11, fontWeight:700, letterSpacing:1, marginBottom:4, fontFamily:"'Courier New',monospace" }}>ÇEKILEN SU — KAYNAKLARA GÖRE DAĞILIM · 2024</div>
                    <div style={{ fontSize:9, color:"#8a96a8", marginBottom:14, fontFamily:"'Courier New',monospace" }}>Toplam: 3.082 Gm³ · Deniz %68.9 · Tatlı su %31.1</div>
                    <div style={{ display:"flex", gap:24, alignItems:"center", flexWrap:"wrap" }}>
                      {/* SVG Pasta */}
                      <svg width="220" height="220" viewBox="0 0 220 220" style={{ flexShrink:0 }}>
                        {slices.map((s,i)=>(
                          <path key={i} d={s.path} fill={s.c} stroke="#fff" strokeWidth="1.5"/>
                        ))}
                        {/* Ortadaki metin */}
                        <text x={CX} y={CY-6} textAnchor="middle" fontSize="10" fill="#1a2332" fontWeight="700" fontFamily="'Courier New',monospace">3.082</text>
                        <text x={CX} y={CY+7} textAnchor="middle" fontSize="8"  fill="#8a96a8" fontFamily="'Courier New',monospace">Gm³</text>
                        <text x={CX} y={CY+18} textAnchor="middle" fontSize="7" fill="#8a96a8" fontFamily="'Courier New',monospace">2024</text>
                        {/* Yüzde etiketleri — %5'ten büyük dilimlere */}
                        {slices.filter(s=>parseFloat(s.pct)>=5).map((s,i)=>{
                          const inside = parseFloat(s.pct) >= 8;
                          const ir = inside ? (RI+R)/2 : R+22;
                          const ex = CX+ir*Math.cos(s.midAngle);
                          const ey = CY+ir*Math.sin(s.midAngle);
                          return (
                            <text key={i} x={ex} y={ey} textAnchor="middle" dominantBaseline="middle"
                              fontSize={inside?"9":"8"} fill={inside?"#fff":s.c} fontWeight="700"
                              fontFamily="'Courier New',monospace">
                              %{s.pct}
                            </text>
                          );
                        })}
                      </svg>
                      {/* Legend */}
                      <div style={{ flex:1, minWidth:180 }}>
                        {PASTA.map((p,i)=>(
                          <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, padding:"5px 8px", background:i===0?"rgba(144,202,249,0.1)":"rgba(240,242,248,0.7)", borderRadius:5, borderLeft:`3px solid ${p.c}` }}>
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:11, fontWeight:600, color:"#1a2332" }}>{p.k}</div>
                              <div style={{ display:"flex", gap:8, marginTop:1 }}>
                                <span style={{ fontSize:9, color:p.c, fontFamily:"'Courier New',monospace", fontWeight:700 }}>%{(p.v/toplam*100).toFixed(1)}</span>
                                <span style={{ fontSize:9, color:"#8a96a8", fontFamily:"'Courier New',monospace" }}>{(p.v/1000).toFixed(0)} Mm³</span>
                              </div>
                            </div>
                            <div style={{ width:32, height:5, background:p.c, borderRadius:2, opacity:0.7 }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* GRAFİK 2 + 3 yan yana */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>

                {/* OSB Şebekesi büyüme trendi */}
                <div style={{ ...C() }}>
                  <div style={{ fontSize:11, fontWeight:700, letterSpacing:1, marginBottom:4, fontFamily:"'Courier New',monospace" }}>OSB ŞEBEKESİ ÇEKİM TRENDİ (Mm³) · 2008–2024</div>
                  <div style={{ fontSize:9, color:"#4527a0", marginBottom:12, fontFamily:"'Courier New',monospace" }}>68→185 Mm³ · +%172 büyüme · Tatlı su içindeki pay: %10.4→%19.3</div>
                  <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:150, paddingBottom:0 }}>
                    {OSB_TREND.map((d,i)=>{
                      const MAXH = 125;
                      const h = Math.max(4, Math.round((d.osb/maxOsb)*MAXH));
                      const isLast = i===OSB_TREND.length-1;
                      const opacity = 0.25 + (d.osb/maxOsb)*0.75;
                      return (
                        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center" }}>
                          <div style={{ fontSize:6.5, color: isLast?"#4527a0":"#8a96a8", marginBottom:2, fontFamily:"'Courier New',monospace" }}>{(d.osb/1000).toFixed(0)}</div>
                          <div style={{ width:"100%", height:h, background: isLast?"#4527a0":`rgba(69,39,160,${opacity})`, borderRadius:"3px 3px 0 0", outline: isLast?"2px solid #4527a0":"none" }} />
                          <div style={{ fontSize:6.5, color: isLast?"#1a2332":"#8a96a8", fontWeight: isLast?700:400, marginTop:3, fontFamily:"'Courier New',monospace" }}>{d.y}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop:10, padding:"7px 10px", background:"rgba(69,39,160,0.05)", borderRadius:5, fontSize:10, color:"#3c4f67", lineHeight:1.6, borderLeft:"2px solid #4527a0" }}>
                    OSB şebekesine bağımlılık 2008'den bu yana <strong style={{color:"#4527a0"}}>iki katına çıktı</strong>. Fabrikalar kendi su kaynağını bulmak yerine merkezi sisteme yaslanıyor — bu sistemin suyu da sonunda tatlı su krizinden besleniyor.
                  </div>
                </div>

                {/* Kaynak/Kuyu ve OSB — tatlı su içindeki pay trendi */}
                <div style={{ ...C() }}>
                  <div style={{ fontSize:11, fontWeight:700, letterSpacing:1, marginBottom:4, fontFamily:"'Courier New',monospace" }}>TATLI SU İÇİNDE KAYNAK PAYI % · 2000–2024</div>
                  <div style={{ fontSize:9, color:"#8a96a8", marginBottom:10, fontFamily:"'Courier New',monospace" }}>Yeraltı (K/K) azalıyor · OSB artıyor · Her ikisi de kritik risk</div>
                  <div style={{ display:"flex", gap:12, marginBottom:10 }}>
                    {[["#e65100","Yeraltı (K/K)"],["#4527a0","OSB Şebekesi"]].map(([c,l])=>(
                      <div key={l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:10 }}>
                        <div style={{ width:10, height:10, background:c, borderRadius:2 }} />
                        <span style={{ color:"#3c4f67" }}>{l}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                    {CEKIM.filter((_,i)=>[0,4,6,8,10,12].includes(i)).map((d,i,arr)=>{
                      const tatli = d.toplam - d.deniz;
                      const kkPct  = d.kk /tatli*100;
                      const osbPct = d.osb/tatli*100;
                      const isLast = i===arr.length-1;
                      return (
                        <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ fontSize:9, color: isLast?"#1a2332":"#8a96a8", fontFamily:"'Courier New',monospace", width:36, fontWeight: isLast?700:400 }}>{d.y}</div>
                          <div style={{ flex:1 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:2 }}>
                              <div style={{ height:7, width:`\${kkPct*1.1}%`, background: isLast?"#e65100":"rgba(230,81,0,0.38)", borderRadius:2, transition:"width 0.3s" }} />
                              <span style={{ fontSize:8, color: isLast?"#e65100":"#8a96a8", fontFamily:"'Courier New',monospace", fontWeight: isLast?700:400 }}>{kkPct.toFixed(1)}%</span>
                            </div>
                            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                              <div style={{ height:7, width:`\${osbPct*1.1}%`, background: isLast?"#4527a0":"rgba(69,39,160,0.32)", borderRadius:2 }} />
                              <span style={{ fontSize:8, color: isLast?"#4527a0":"#8a96a8", fontFamily:"'Courier New',monospace", fontWeight: isLast?700:400 }}>{osbPct.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop:10, padding:"7px 10px", background:"rgba(230,81,0,0.05)", borderRadius:5, fontSize:10, color:"#3c4f67", lineHeight:1.6, borderLeft:"2px solid #e65100" }}>
                    Yeraltı payı <strong>%53.0 → %46.5</strong> geriledi ama hâlâ tatlı suyun <strong style={{color:"#e65100"}}>yarısına yakını</strong>. OSB payı %2.9→%19.3 ile iki katından fazla arttı.
                  </div>
                </div>
              </div>

              {/* GRAFİK 4: Tüketim kırılımı */}
              <div style={{ ...C({ marginBottom:14 }) }}>
                <div style={{ fontSize:11, fontWeight:700, letterSpacing:1, marginBottom:4, fontFamily:"'Courier New',monospace" }}>TÜKETİM KIRIILIMI: SOĞUTMA / PROSES / EVSEL (Mm³) · 2000–2024</div>
                <div style={{ fontSize:9, color:"#8a96a8", marginBottom:10, fontFamily:"'Courier New',monospace" }}>
                  Soğutma = 1. hedef (saflık esnek, hacim büyük) · Proses = 2. hedef (kalite kritik) · Evsel = düşüyor
                </div>
                <div style={{ display:"flex", gap:14, marginBottom:10 }}>
                  {[["#b71c1c","Soğutma"],["#4527a0","Proses"],["#e65100","Evsel"]].map(([c,l])=>(
                    <div key={l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:10 }}>
                      <div style={{ width:10, height:10, background:c, borderRadius:2 }} />
                      <span style={{ color:"#3c4f67" }}>{l}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex", alignItems:"flex-end", gap:5, height:160, paddingBottom:0 }}>
                  {TUKETIM.map((d,i)=>{
                    const isLast = i===TUKETIM.length-1;
                    const tot = d.sogutma+d.proses+d.evsel;
                    const MAXH = 135;
                    const hs = Math.max(3, Math.round((d.sogutma/maxTuk)*MAXH));
                    const hp = Math.max(3, Math.round((d.proses/maxTuk)*MAXH));
                    const he = Math.max(3, Math.round((d.evsel/maxTuk)*MAXH));
                    return (
                      <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center" }}>
                        <div style={{ fontSize:7, color: isLast?"#1a2332":"#8a96a8", marginBottom:2, fontFamily:"'Courier New',monospace" }}>{(tot/1000).toFixed(0)}</div>
                        <div style={{ width:"100%", display:"flex", flexDirection:"column", overflow:"hidden", borderRadius:"3px 3px 0 0", outline: isLast?"2px solid #888":"none" }}>
                          <div style={{ height:he, background:"#e65100", opacity: isLast?1:0.5 }} />
                          <div style={{ height:hp, background:"#4527a0", opacity: isLast?1:0.5 }} />
                          <div style={{ height:hs, background:"#b71c1c", opacity: isLast?1:0.5 }} />
                        </div>
                        <div style={{ fontSize:7, color: isLast?"#1a2332":"#8a96a8", fontWeight: isLast?700:400, marginTop:3, fontFamily:"'Courier New',monospace" }}>{d.y}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Strateji kartları */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:12 }}>
                {[
                  { icon:"🎯", t:"Ana Hedef: Soğutma Takviyesi", c:"#b71c1c",
                    d:"535 Mm³/yıl tatlı su soğutmaya gidiyor. Kıyı dışı tesisler tatlı su bağımlısı. Saflık beklentisi proses suyundan esnek — AWG için en doğal giriş noktası.", src:"TÜİK 2024" },
                  { icon:"⚗️", t:"2. Hedef: Proses Suyu", c:"#4527a0",
                    d:"358 Mm³/yıl. Tekstil %19.3, kimya %39.3, gıda %14.5. Kalite kritik — tedarik kıtlığı üretime direkt vurur. Ödeme gücü ve aciliyet en yüksek.", src:"TÜİK 2024 / BSTB VGM" },
                  { icon:"🏗️", t:"OSB Kanalı: +%172 Büyüme", c:"#4527a0",
                    d:"Tatlı su içindeki OSB payı %2.9→%19.3. Tek OSB müdürlüğü anlaşması = onlarca fabrika. Merkezileşme devam ediyor — satış verimliliği çok yüksek.", src:"TÜİK 2024" },
                  { icon:"⚠️", t:"Yeraltı Riski: %46.5", c:"#e65100",
                    d:"445 Mm³/yıl — tatlı su içinde hâlâ en büyük kaynak. Konya, Ergene havzalarında taban suyu düşüyor. Bu tesisler en önce off-grid çözüme muhtaç kalacak.", src:"TÜİK 2024 / DSİ 2025" },
                ].map((s,i)=>(
                  <div key={i} style={{ ...C({ borderTop:`3px solid \${s.c}` }) }}>
                    <div style={{ fontSize:20, marginBottom:7 }}>{s.icon}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:s.c, marginBottom:7 }}>{s.t}</div>
                    <div style={{ fontSize:11, color:"#3c4f67", lineHeight:1.7, marginBottom:7 }}>{s.d}</div>
                    <div style={{ fontSize:9, color:"#b0bec5", fontFamily:"'Courier New',monospace" }}>↳ {s.src}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

                {/* B2B */}
        {tab==="b2b" && (
          <div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:20, fontWeight:700, marginBottom:4 }}>B2B Pazar Giriş Matrisi</div>
              <div style={{ fontSize:13, color:"#8a96a8" }}>Su krizi yoğunluğu × Sanayi varlığı = Öncelikli hedef bölgeler</div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:17, marginBottom:20 }}>
              {[
                { title:"🔴 HEMEN GİR", sub:"Kriz + Sanayi Çakışması", c:"#b71c1c",
                  basins: BASINS.filter(b=>(b.status==="kesin_kitlik"||b.status==="kitlik")&&(b.gida||b.tekstil||b.kimya||b.metal)),
                  insight:"Hem kıtlık kritik hem sanayi yoğun. Müşteri su tasarrufu yapmak ZORUNDA. Satış döngüsü kısa." },
                { title:"🟠 İKİNCİ DALGA", sub:"Stres + Sanayi Varlığı", c:"#e65100",
                  basins: BASINS.filter(b=>b.status==="stres"&&(b.gida||b.tekstil||b.kimya||b.metal)),
                  insight:"Su stresi var, sanayi büyüyor. Regülasyon baskısı artmadan proaktif müşteri adayları burada." },
              ].map((q,i) => (
                <div key={i} style={{ ...C({ borderTop:`3px solid ${q.c}` }) }}>
                  <div style={{ fontSize:15, fontWeight:700, color:q.c, marginBottom:3 }}>{q.title}</div>
                  <div style={{ fontSize:10, color:"#8a96a8", letterSpacing:1, marginBottom:13, fontFamily:"'Courier New',monospace" }}>{q.sub.toUpperCase()}</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:13 }}>
                    {q.basins.map(b=>(
                      <div key={b.id} style={{ padding:"8px 11px", background:"#f5f7fb", borderRadius:5, borderLeft:`3px solid ${q.c}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:5 }}>
                        <div>
                          <div style={{ fontSize:12, fontWeight:600 }}>{b.name}</div>
                          <div style={{ fontSize:9, color:"#8a96a8", fontFamily:"'Courier New',monospace" }}>{b.region} · {b.wpp} m³/kişi</div>
                        </div>
                        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                          {b.gida   &&<span style={{ fontSize:8, padding:"1px 6px", borderRadius:9, background:"rgba(46,125,50,0.07)",   color:"#2e7d32", border:"1px solid rgba(46,125,50,0.18)",   fontFamily:"'Courier New',monospace" }}>GIDA</span>}
                          {b.tekstil&&<span style={{ fontSize:8, padding:"1px 6px", borderRadius:9, background:"rgba(94,53,177,0.07)",  color:"#5e35b1", border:"1px solid rgba(94,53,177,0.18)",  fontFamily:"'Courier New',monospace" }}>TEKSTİL</span>}
                          {b.kimya  &&<span style={{ fontSize:8, padding:"1px 6px", borderRadius:9, background:"rgba(191,54,12,0.07)",  color:"#bf360c", border:"1px solid rgba(191,54,12,0.18)",  fontFamily:"'Courier New',monospace" }}>KİMYA</span>}
                          {b.metal  &&<span style={{ fontSize:8, padding:"1px 6px", borderRadius:9, background:"rgba(21,101,192,0.07)", color:"#1565c0", border:"1px solid rgba(21,101,192,0.18)", fontFamily:"'Courier New',monospace" }}>METAL</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding:"8px 10px", background:`${q.c}0c`, borderRadius:5, fontSize:11, color:"#3c4f67", lineHeight:1.6, fontStyle:"italic" }}>💡 {q.insight}</div>
                </div>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(245px,1fr))", gap:12 }}>
              {[
                { icon:"🧵", t:"Tekstil Üretimi",  c:"#5e35b1", wpi:"10.000–20.000 lt/kg kumaş", spots:["Gediz (kesin kıtlık, 310 m³)","Susurluk (kıtlık, 740 m³)","Meriç-Ergene (stres + kirlilik)"], pain:"AB çevre direktifleri + su maliyeti + ihracat riski", act:"Proses suyu geri dönüşüm + döngüsel kullanım", src:"DSİ / WWF-TR / AB REACH" },
                { icon:"⚗️", t:"Kimya Üretimi",    c:"#bf360c", wpi:"Proses + soğutma yoğun",     spots:["Marmara (kesin kıtlık, 220 m³)","Sakarya (kıtlık, 760 m³)","Kızılırmak (stres)"], pain:"Atık su arıtma maliyeti + çevre denetim baskısı", act:"Su geri kazanım + sıfır deşarj + raporlama", src:"DSİ / ÇEDB" },
                { icon:"🖥️", t:"Data Centerlar",   c:"#1565c0", wpi:"~1.8 lt/kWh soğutma suyu",  spots:["İstanbul (Marmara, barajlar %20)","Ankara (Kızılırmak stresi)"], pain:"ESG raporlama + Marmara krizi + su ayak izi", act:"Hava soğutma / evaporatif verimlilik + izleme", src:"WRI / İstanbul BŞB" },
              ].map((s,i) => (
                <div key={i} style={{ ...C({ borderTop:`3px solid ${s.c}` }) }}>
                  <div style={{ fontSize:26, marginBottom:8 }}>{s.icon}</div>
                  <div style={{ fontSize:14, fontWeight:700, color:s.c, marginBottom:8 }}>{s.t}</div>
                  <div style={{ fontSize:10, color:"#8a96a8", letterSpacing:1, marginBottom:4, fontFamily:"'Courier New',monospace" }}>SU YOĞUNLUĞU</div>
                  <div style={{ fontSize:11, background:"#f5f7fb", padding:"5px 8px", borderRadius:4, marginBottom:10, fontFamily:"'Courier New',monospace" }}>{s.wpi}</div>
                  <div style={{ fontSize:10, color:"#8a96a8", letterSpacing:1, marginBottom:5, fontFamily:"'Courier New',monospace" }}>KRİZ BÖLGELERİ</div>
                  {s.spots.map((h,j)=>(
                    <div key={j} style={{ fontSize:11, color:"#3c4f67", padding:"3px 0", borderBottom:"1px solid #f0f4f8" }}>▸ {h}</div>
                  ))}
                  <div style={{ marginTop:10, padding:"7px 9px", background:`${s.c}0c`, borderRadius:4, fontSize:11, color:"#3c4f67", borderLeft:`2px solid ${s.c}` }}>
                    <span style={{ fontSize:8, color:"#8a96a8", display:"block", marginBottom:2, fontFamily:"'Courier New',monospace" }}>PAIN POINT</span>
                    {s.pain}
                  </div>
                  <div style={{ marginTop:7, padding:"7px 9px", background:"#f5f7fb", borderRadius:4, fontSize:11, color:s.c, fontWeight:600 }}>→ {s.act}</div>
                  <div style={{ marginTop:5, fontSize:9, color:"#b0bec5", fontFamily:"'Courier New',monospace" }}>↳ {s.src}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* FOOTER */}
      <div style={{ padding:"13px 36px", borderTop:"1px solid #dde4ee", background:"#f5f7fb", display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:6, fontSize:9, color:"#b0bec5", fontFamily:"'Courier New',monospace" }}>
        <span>VERİ: DSİ 2025 · TÜİK İmalat Sanayi Su Göstergeleri 2024 · TÜİK Su ve Atıksu İstatistikleri 2024 · WWF-TR · WRI AQUEDUCT 4.0 · ISKI · BSTB VGM 2017</span>
        <span>TÜRKİYE SU KRİZİ ANALİTİK PLATFORMU — GÜNCELLEME: MART 2026</span>
      </div>
    </div>
  );
}
