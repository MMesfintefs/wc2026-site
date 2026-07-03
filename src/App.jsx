import { useState, useEffect } from "react";

const URL = "https://raw.githubusercontent.com/MMesfintefs/wc2026-predictor/main/data/predictions.json";

const C = { bg:"#090614", card:"#1a1630", border:"#2d2648", gold:"#d4a842",
  text:"#ece4d4", dim:"#7a7090", green:"#34d399", red:"#f87171" };

function Match({ m }) {
  return (
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,
      padding:8,minWidth:170,fontSize:12}}>
      <div style={{color:C.dim,fontSize:9}}>M{m.id} · {m.date}</div>
      <div style={{fontWeight:m.winner===m.home?800:400,
        color:m.winner===m.home?C.gold:C.text}}>{m.home} <span style={{color:C.green,fontSize:10}}>{m.pHome}%</span></div>
      <div style={{fontWeight:m.winner===m.away?800:400,
        color:m.winner===m.away?C.gold:C.text}}>{m.away} <span style={{color:C.red,fontSize:10}}>{m.pAway}%</span></div>
    </div>
  );
}

export default function App() {
  const [d, setD] = useState(null);
  const [tab, setTab] = useState("groups");
  useEffect(() => {
    const load = () => fetch(URL + "?t=" + Date.now())
      .then(r => r.json()).then(setD).catch(console.error);
    load();
    const id = setInterval(load, 60000);   // refresh every 60s
    return () => clearInterval(id);
  }, []);
  if (!d) return <div style={{background:C.bg,color:C.text,minHeight:"100vh",
    display:"grid",placeItems:"center"}}>Loading model output…</div>;

  return (
    <div style={{background:C.bg,color:C.text,minHeight:"100vh",fontFamily:"system-ui",padding:16}}>
      <h1 style={{color:C.gold,fontSize:20}}>⚽ WORLD CUP 2026 — LIVE MODEL</h1>
      <div style={{fontSize:10,color:C.dim,marginBottom:10}}>
        Updated {new Date(d.generated_at).toLocaleString()} · backtest {d.backtest_group_accuracy}% on {d.matches_played} matches
      </div>
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {["groups","bracket","champions"].map(t =>
          <button key={t} onClick={()=>setTab(t)} style={{padding:"6px 14px",borderRadius:6,
            border:"none",cursor:"pointer",fontWeight:700,
            background:tab===t?C.gold:C.card,color:tab===t?C.bg:C.text}}>{t.toUpperCase()}</button>)}
      </div>

      {tab==="groups" && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10}}>
          {Object.entries(d.standings).map(([g, rows]) => (
            <div key={g} style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,padding:10}}>
              <div style={{color:C.gold,fontWeight:800,marginBottom:6}}>GROUP {g}</div>
              {rows.map((r,i)=>(
                <div key={r.team} style={{display:"flex",fontSize:12,padding:"3px 0",
                  borderLeft:i<2?`3px solid ${C.gold}`:"3px solid transparent",paddingLeft:6}}>
                  <span style={{flex:1}}>{r.team}</span>
                  <span style={{color:C.dim,width:60}}>MP {r.mp} GD {r.gd>0?"+":""}{r.gd}</span>
                  <span style={{color:C.gold,fontWeight:800,width:24,textAlign:"right"}}>{r.pts}</span>
                </div>))}
            </div>))}
        </div>)}

      {tab==="bracket" && (
        <div style={{display:"flex",gap:10,overflowX:"auto",alignItems:"center"}}>
          {[["R32",d.bracket.r32],["R16",d.bracket.r16],["QF",d.bracket.qf],
            ["SF",d.bracket.sf],["FINAL",[d.bracket.final]]].map(([label,ms])=>(
            <div key={label} style={{display:"flex",flexDirection:"column",gap:8,
              justifyContent:"space-around"}}>
              <div style={{color:C.gold,fontSize:10,textAlign:"center",fontWeight:800}}>{label}</div>
              {ms.map(m=><Match key={m.id} m={m}/>)}
            </div>))}
        </div>)}

      {tab==="champions" && (
        <div style={{maxWidth:420}}>
          {Object.entries(d.champion_probs).slice(0,15).map(([t,p])=>(
            <div key={t} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,fontSize:13}}>
              <span style={{width:150}}>{t}</span>
              <div style={{flex:1,height:10,background:C.card,borderRadius:5}}>
                <div style={{width:`${Math.min(p*4,100)}%`,height:"100%",background:C.gold,borderRadius:5}}/>
              </div>
              <span style={{color:C.gold,fontWeight:700,width:44,textAlign:"right"}}>{p}%</span>
            </div>))}
          <div style={{fontSize:10,color:C.dim,marginTop:8}}>From 5,000 Monte Carlo tournament simulations</div>
        </div>)}
    </div>
  );
}