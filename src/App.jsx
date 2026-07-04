import { useState, useEffect } from "react";

const URL = "https://raw.githubusercontent.com/MMesfintefs/wc2026-predictor/main/data/predictions.json";
const C = { bg:"#090614", card:"#1a1630", border:"#2d2648", gold:"#d4a842",
  text:"#ece4d4", dim:"#7a7090", green:"#34d399", red:"#f87171", won:"#d4a84222" };

const W=178,H=70,GAP=70,ROW=80,PAD=12;
const x=r=>PAD+r*(W+GAP);
const y=(r,i)=>PAD+ROW*Math.pow(2,r)*(i+0.5)-H/2;

function Team({name,score,pen,isW,pct}){
  return <div style={{display:"flex",gap:4,alignItems:"center",fontSize:11,
    fontWeight:isW?800:400,color:isW?C.gold:C.text,lineHeight:"16px"}}>
    <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{name||"—"}</span>
    {pct!=null&&<span style={{color:C.dim,fontSize:9}}>{pct}%</span>}
    {score!=null&&<b>{score}{pen!=null?` (${pen})`:""}</b>}
    {isW&&<span style={{color:C.gold}}>➤</span>}
  </div>;
}

function Card({m,r,i,onSel}){
  const done=m.winner!=null;
  const adv=m.winner||m.predicted;
  return <div onClick={()=>m.home&&m.away&&onSel(m)}
    style={{position:"absolute",left:x(r),top:y(r,i),width:W,height:H,
    cursor:m.home&&m.away?"pointer":"default",
    background:done?C.won:C.card,border:`1px solid ${adv?C.gold+"66":C.border}`,
    borderRadius:8,padding:"5px 8px",boxSizing:"border-box"}}>
    <div style={{fontSize:8,color:C.dim,display:"flex",justifyContent:"space-between"}}>
      <span>M{m.id} · {m.date}</span>
      <span style={{color:done?C.green:C.dim}}>{m.status||(done?"FT":"PRED")}</span>
    </div>
    <Team name={m.home} score={m.score?.[0]} pen={m.pens?.[0]}
      isW={adv===m.home} pct={m.pHome}/>
    <Team name={m.away} score={m.score?.[1]} pen={m.pens?.[1]}
      isW={adv===m.away} pct={m.pAway}/>
  </div>;
}

function Bracket({b,onSel}){
  const rounds=[b.r32,b.r16,b.qf,b.sf,[b.final]];
  const totalH=PAD*2+16*ROW, totalW=x(5);
  const lines=[];
  rounds.forEach((ms,r)=>{ if(r===0)return;
    ms.forEach((m,i)=>{
      [2*i,2*i+1].forEach(pi=>{
        const x1=x(r-1)+W, y1=y(r-1,pi)+H/2, x2=x(r), y2=y(r,i)+H/2, mx=(x1+x2)/2;
        const feeder=rounds[r-1][pi], adv=feeder&&(feeder.winner||feeder.predicted);
        const hot=adv&&(adv===m.home||adv===m.away);
        lines.push(<path key={`${r}-${i}-${pi}`}
          d={`M${x1},${y1} H${mx} V${y2} H${x2}`} fill="none"
          stroke={hot?C.gold:C.border} strokeWidth={hot?1.6:1} opacity={hot?0.9:0.6}/>);
      });
    });
  });
  return <div style={{overflow:"auto",border:`1px solid ${C.border}`,borderRadius:10}}>
    <div style={{position:"relative",width:totalW,height:totalH}}>
      <svg width={totalW} height={totalH} style={{position:"absolute",inset:0}}>{lines}</svg>
      {rounds.map((ms,r)=>ms.map((m,i)=><Card key={m.id} m={m} r={r} i={i} onSel={onSel}/>))}
    </div>
  </div>;
}

function MatchPage({m,onBack}){
  const d=m.detail||{};
  const Bar=({l,v,c})=><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,fontSize:12}}>
    <span style={{width:120,color:C.dim,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l}</span>
    <div style={{flex:1,height:9,background:C.card,borderRadius:4}}>
      <div style={{width:`${Math.min(v,100)}%`,height:"100%",background:c,borderRadius:4}}/></div>
    <b style={{width:44,textAlign:"right",color:c}}>{v}%</b></div>;
  return <div style={{maxWidth:680}}>
    <button onClick={onBack} style={{background:C.card,color:C.text,border:`1px solid ${C.border}`,
      borderRadius:6,padding:"5px 12px",cursor:"pointer",marginBottom:12}}>← Back to bracket</button>
    <h2 style={{color:C.gold,margin:"0 0 2px"}}>M{m.id} · {m.home} vs {m.away}</h2>
    <div style={{fontSize:11,color:C.dim,marginBottom:12}}>{m.date} · {m.status}
      {m.score&&<b style={{color:C.green}}> · FT {m.score[0]}-{m.score[1]}{m.pens?` (${m.pens[0]}-${m.pens[1]} pens)`:""}</b>}</div>

    {m.pHome!=null&&<>
      <div style={{color:C.gold,fontWeight:800,fontSize:11,margin:"10px 0 6px"}}>WIN PROBABILITY</div>
      <Bar l={m.home} v={m.pHome} c={C.green}/>
      <Bar l={m.away} v={m.pAway} c={C.red}/></>}

    {d.xgHome!=null&&<div style={{color:C.gold,fontWeight:800,fontSize:11,margin:"14px 0 6px"}}>
      EXPECTED GOALS — {m.home} {d.xgHome} · {d.xgAway} {m.away}</div>}

    {d.topScorelines&&<>
      <div style={{color:C.gold,fontWeight:800,fontSize:11,margin:"14px 0 6px"}}>MOST LIKELY SCORELINES</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {d.topScorelines.map((s,i)=><div key={i} style={{background:i===0?C.won:C.card,
          border:`1px solid ${i===0?C.gold:C.border}`,borderRadius:8,padding:"8px 14px",textAlign:"center"}}>
          <div style={{fontSize:16,fontWeight:800,color:i===0?C.gold:C.text}}>{s.h}–{s.a}</div>
          <div style={{fontSize:10,color:C.dim}}>{s.p}%</div></div>)}
      </div></>}

    {d.over25!=null&&<div style={{display:"flex",gap:20,margin:"12px 0",fontSize:12,flexWrap:"wrap"}}>
      <span>Over 2.5 goals: <b style={{color:C.gold}}>{d.over25}%</b></span>
      <span>Both teams score: <b style={{color:C.gold}}>{d.btts}%</b></span>
      <span style={{color:C.dim}}>Elo {d.eloHome} vs {d.eloAway}</span>
    </div>}

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      {[["scorersHome",m.home],["scorersAway",m.away]].map(([k,t])=>
        <div key={k}>
          <div style={{color:C.gold,fontWeight:800,fontSize:11,marginBottom:6}}>LIKELY SCORERS — {t}</div>
          {(!d[k]||d[k].length===0)&&<div style={{fontSize:11,color:C.dim}}>No player data (enable Kaggle secret)</div>}
          {(d[k]||[]).map(p=><Bar key={p.player} l={p.player} v={p.pScore} c={C.gold}/>)}
        </div>)}
    </div>
  </div>;
}

export default function App(){
  const [d,setD]=useState(null);
  const [tab,setTab]=useState("bracket");
  const [sel,setSel]=useState(null);
  useEffect(()=>{
    const go=()=>fetch(URL+"?t="+Date.now()).then(r=>r.json()).then(setD).catch(console.error);
    go(); const id=setInterval(go,60000); return ()=>clearInterval(id);
  },[]);
  if(!d) return <div style={{background:C.bg,color:C.text,minHeight:"100vh",
    display:"grid",placeItems:"center"}}>Loading model output…</div>;
  const meta=d.methodology;
  return <div style={{background:C.bg,color:C.text,minHeight:"100vh",fontFamily:"system-ui",padding:16}}>
    <h1 style={{color:C.gold,fontSize:20,margin:"0 0 2px"}}>⚽ WORLD CUP 2026 — LIVE MODEL</h1>
    <div style={{fontSize:10,color:C.dim,marginBottom:10}}>
      {meta.selected_model} · holdout log-loss {meta.candidates_compared.find(c=>c.model===meta.selected_model)?.log_loss} · updated {new Date(d.generated_at).toLocaleString()}
    </div>
    <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
      {["bracket","groups","champions","model"].map(t=>
        <button key={t} onClick={()=>{setTab(t);setSel(null);}} style={{padding:"6px 14px",borderRadius:6,border:"none",
          cursor:"pointer",fontWeight:700,background:tab===t?C.gold:C.card,
          color:tab===t?C.bg:C.text}}>{t.toUpperCase()}</button>)}
    </div>

    {tab==="bracket"&&(sel
      ? <MatchPage m={sel} onBack={()=>setSel(null)}/>
      : <>
        <div style={{fontSize:10,color:C.dim,marginBottom:6}}>
          Gold path ➤ = team advancing (actual result if FT/PENS, model pick if PRED). Click any match for full prediction detail.
        </div>
        <Bracket b={d.bracket} onSel={setSel}/></>)}

    {tab==="groups"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:10}}>
      {Object.entries(d.standings).map(([g,rows])=>
        <div key={g} style={{background:C.card,borderRadius:8,border:`1px solid ${C.border}`,padding:10}}>
          <div style={{color:C.gold,fontWeight:800,marginBottom:6}}>GROUP {g}</div>
          {rows.map((r,i)=><div key={r.team} style={{display:"flex",fontSize:12,padding:"3px 0 3px 6px",
            borderLeft:i<2?`3px solid ${C.gold}`:"3px solid transparent"}}>
            <span style={{flex:1}}>{r.team}</span>
            <span style={{color:C.dim,width:80}}>MP{r.mp} GD{r.gd>0?"+":""}{r.gd} E{r.elo}</span>
            <b style={{color:C.gold,width:22,textAlign:"right"}}>{r.pts}</b></div>)}
        </div>)}
    </div>}

    {tab==="champions"&&<div style={{maxWidth:430}}>
      {Object.entries(d.champion_probs).slice(0,15).map(([t,p])=>
        <div key={t} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,fontSize:13}}>
          <span style={{width:150}}>{t}</span>
          <div style={{flex:1,height:10,background:C.card,borderRadius:5}}>
            <div style={{width:`${Math.min(p*3.5,100)}%`,height:"100%",background:C.gold,borderRadius:5}}/></div>
          <b style={{color:C.gold,width:44,textAlign:"right"}}>{p}%</b></div>)}
      <div style={{fontSize:10,color:C.dim,marginTop:8}}>5,000 Monte Carlo sims from the CURRENT bracket state — actual results locked in, undecided matches sampled from model probabilities.</div>
    </div>}

    {tab==="model"&&<div style={{maxWidth:640,fontSize:12,lineHeight:1.7}}>
      <div style={{color:C.gold,fontWeight:800,marginBottom:4}}>HONEST EVALUATION — 2026 WC group stage was held out of training</div>
      <table style={{borderCollapse:"collapse",width:"100%",marginBottom:10}}>
        <thead><tr style={{color:C.dim,fontSize:10,textAlign:"left"}}>
          <th>Model</th><th>Accuracy</th><th>Log-loss ↓</th><th>Brier ↓</th></tr></thead>
        <tbody>{meta.candidates_compared.map(c=>
          <tr key={c.model} style={{background:c.model===meta.selected_model?C.won:"transparent"}}>
            <td style={{padding:"4px 6px",fontWeight:c.model===meta.selected_model?800:400,
              color:c.model===meta.selected_model?C.gold:C.text}}>{c.model}</td>
            <td>{c.accuracy}%</td><td>{c.log_loss}</td><td>{c.brier}</td></tr>)}
        </tbody></table>
      <div style={{color:C.dim}}>Features: {meta.features.join(" · ")}</div>
      <div style={{color:C.dim,marginTop:6}}>Player availability: {meta.player_adjustment}</div>
      <div style={{color:C.dim}}>StatsBomb xG: {meta.statsbomb_xg}</div>
      <div style={{color:C.dim,marginTop:6}}>{meta.selection_rule}. Train window: {meta.train_window}.</div>
    </div>}
  </div>;
}