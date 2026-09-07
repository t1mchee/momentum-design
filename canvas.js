// Shared canvas engine for the design views. A page sets window.CANVAS before loading this file:
//   {spec:'spec.yaml', groups:'groups.yaml', changelog:'changelog.yaml', simple:false, other:{label,href}}
// Steps (groups) are bands; data feeds are tags on their consumers unless "data lines" is on;
// click traces upstream (blue) and downstream (green); line style is the edge's mode.
(function(){
const C=Object.assign({spec:'spec.yaml',groups:'groups.yaml',changelog:'changelog.yaml',simple:false,other:[]},window.CANVAS||{});
const SPEC=new URLSearchParams(location.search).get('spec')||C.spec;
const NODE_W=210, SUM_W=290;
let spec=null, groups=null, changelog=null, fullSpec=null, lastKey='';
let bands=[], nodeBand={}, nodeSub={};
let expanded=new Set(), showData=false, showRetired=false, sel=null, selBand=null, layout=null, view={x:20,y:20,k:1}, firstFit=true;
const world=document.getElementById('world'), stage=document.getElementById('stage'), svg=document.getElementById('edges');
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const GLYPH={data:'▤',deterministic:'ƒ',model:'✱',human:'☺',output:'▣'};

// ---------- loading
async function loadText(p){const r=await fetch(p+'?t='+Date.now(),{cache:'no-store'}); if(!r.ok) throw new Error(p+' '+r.status); return r.text();}
function mergeSpec(over,base){ if(!base) return over; const dropN=new Set(over.drop_nodes||[]); const dropE=new Set((over.drop_edges||[]).map(e=>e.from+'>'+e.to));
  const nodes=(base.nodes||[]).filter(n=>!dropN.has(n.id)).map(n=>({...n})); const byId=Object.fromEntries(nodes.map(n=>[n.id,n]));
  (over.nodes||[]).forEach(n=>{ if(byId[n.id]) Object.assign(byId[n.id],n); else {nodes.push(n); byId[n.id]=n;} });
  const ids=new Set(nodes.map(n=>n.id)); const edges=(base.edges||[]).filter(e=>ids.has(e.from)&&ids.has(e.to)&&!dropE.has(e.from+'>'+e.to)).concat(over.edges||[]);
  return {meta:over.meta||base.meta,lanes:over.lanes||base.lanes,nodes,edges}; }
async function poll(){
  try{
    const st=await loadText(SPEC); let doc=jsyaml.load(st); let key=st;
    if(doc&&doc.base){const bt=await loadText(doc.base); key+=bt; doc=mergeSpec(doc,jsyaml.load(bt));}
    let gt=''; try{ gt=await loadText(C.groups); }catch(e){}
    let ct=''; try{ ct=await loadText(C.changelog); }catch(e){}
    key+=gt+ct;
    if(C.simple&&!fullSpec){ try{ fullSpec=jsyaml.load(await loadText('spec.yaml')); }catch(e){} }
    if(key!==lastKey){ lastKey=key; spec=doc; groups=gt?jsyaml.load(gt):null; changelog=ct?jsyaml.load(ct):null; buildBands(); if(!expanded.size&&firstFit) bands.filter(b=>!b.retired).forEach(b=>expanded.add(b.id)); render(); renderLeft(); $('status').textContent='updated '+new Date().toLocaleTimeString(); if(firstFit){fit();firstFit=false;} }
  }catch(e){ $('status').textContent='error: '+e.message; }
  setTimeout(poll,1500);
}

// ---------- bands: the seven steps (groups.yaml) or the lanes of the simple map
function buildBands(){
  bands=[]; nodeBand={}; nodeSub={};
  const byId=Object.fromEntries((spec.nodes||[]).map(n=>[n.id,n]));
  const topGroups=(groups&&groups.groups)||[];
  if(!C.simple&&topGroups.length){
    let num=0;
    topGroups.forEach(g=>{
      const b={id:g.id,name:g.name,short:g.short||g.name,brief:g.brief||'',synthesis:g.synthesis||'',subs:[],leaves:[],retired:!!g.hidden};
      b.num=b.retired?'':String(++num);
      (g.children||[]).forEach(c=>{ if(typeof c==='string'){ if(byId[c]){b.leaves.push(c); nodeBand[c]=b.id;} }
        else { const s={id:c.id,name:c.name,short:c.short||c.name,synthesis:c.synthesis||'',leaves:[]}; (c.children||[]).forEach(x=>{ if(typeof x==='string'&&byId[x]){ s.leaves.push(x); b.leaves.push(x); nodeBand[x]=b.id; nodeSub[x]=s.id; } }); b.subs.push(s); } });
      bands.push(b);
    });
    // retired nodes not listed by any group still go to the retired band
    const rb=bands.find(b=>b.retired); (spec.nodes||[]).forEach(n=>{ if(n.status==='retired'&&!nodeBand[n.id]&&rb){ rb.leaves.push(n.id); nodeBand[n.id]=rb.id; } });
  } else {
    const lanes=(spec.lanes||[]); const live=topGroups.filter(g=>!g.hidden); let num=0;
    lanes.forEach((l,i)=>{ const leaves=(spec.nodes||[]).filter(n=>n.lane===l.id).map(n=>n.id); if(!leaves.length) return;
      const retired=/retired/i.test(l.id)||leaves.every(x=>byId[x].status==='retired');
      const g=(!retired&&live[num])||null;
      const b={id:'lane_'+l.id,name:l.name,short:l.name,brief:g?g.brief:'',synthesis:g?g.synthesis:'',subs:[],leaves,retired,num:retired?'':String(++num)};
      leaves.forEach(x=>nodeBand[x]=b.id); bands.push(b); });
  }
}
const bandOf=id=>bands.find(b=>b.id===nodeBand[id]);
function rep(id){ const b=bandOf(id); if(!b) return null; if(b.retired&&!showRetired) return null; return expanded.has(b.id)?id:'sum_'+b.id; }
const isData=n=>n&&n.kind==='data';
function edgeMode(e){ const m=(e.mode||'').toLowerCase(); if(/live only/.test(m)) return 'live'; if(/backtest only/.test(m)) return 'bt'; return 'both'; }

// ---------- cards
function ruleSummary(rule,n){ const s=String(rule||'').replace(/\s+/g,' '); let out='',len=0,cut=s.length>n;
  for(const p of splitMath(s)){ const t=p.type==='text'?p.data:p.raw; if(len+t.length>n){ if(p.type==='text') out+=t.slice(0,n-len); cut=true; break; } out+=t; len+=t.length; }
  return esc(out)+(cut?'…':''); }
function cardHTML(n,feeds){
  const kind=n.kind||'deterministic';
  const laHide=(kind==='human'&&n.lookahead==='human')||(kind==='model'&&n.lookahead==='model')||n.status==='retired';
  const chips=(n.validation?`<span class="chip val">validation</span>`:'')+(kind!=='deterministic'?`<span class="chip kind-${kind}">${kind==='model'?'LLM':kind==='data'?'data in':kind}</span>`:'')+((n.lookahead&&!laHide)?`<span class="chip la-${n.lookahead}" title="${esc(n.mitigation||'')}">${esc(n.lookahead)}</span>`:'');
  const sm=n.status==='retired'?'':`<div class="sm">${ruleSummary(n.rule,C.simple?150:95)}</div>`;
  const tags=(feeds&&feeds.length&&!showData)?`<div class="tags"><b>from</b> ${feeds.map(f=>`<span class="t" data-src="${esc(f.id)}">${esc(f.name)}</span>`).join('')}</div>`:'';
  const nopen=(n.open||[]).length;
  return `<div class="nm">${esc(n.name)}</div><span class="gl" title="${esc(kind)}">${GLYPH[kind]||''}</span>${sm}<div>${chips}</div>${tags}`+(nopen?`<div class="badge" title="open questions">${nopen}</div>`:'');
}
function summaryHTML(b,byId){
  const c={}; b.leaves.forEach(id=>{const n=byId[id]; if(n) c[n.kind]=(c[n.kind]||0)+1;});
  const chips=Object.entries(c).map(([k,v])=>`<span class="chip kind-${k}">${v} ${k==='model'?'LLM':k}</span>`).join('');
  const syn=(b.synthesis||'').replace(/\s+/g,' ');
  return `<div class="nm"><span class="num">${esc(b.num)}</span>${esc(b.name.replace(/^\d+\.\s*/,''))}</div><div class="sm">${esc(syn.slice(0,220))}${syn.length>220?'…':''}</div><div>${chips}</div><div class="cnt">▸ ${b.leaves.length} components · click to open</div>`;
}

// ---------- render: each step is a band laid out left to right on its own; bands stack in reading order;
// edges between steps run down the page (up, for the few that go back), so the picture reads top to bottom.
const BAND_GAP=44, PAD=18, HDR=34, SUB_HDR=26, BLOCK_GAP=36, LEFT=24;
function layoutBlock(ids,edges,byId,els){ // dagre LR over one block of components; returns {w,h,pos:{id:{x,y}},paths:[{from,to,pts}]}
  const g=new dagre.graphlib.Graph({multigraph:true}); g.setGraph({rankdir:'LR',nodesep:22,ranksep:46,edgesep:10,marginx:0,marginy:0,ranker:'network-simplex'}); g.setDefaultEdgeLabel(()=>({}));
  ids.forEach(id=>g.setNode(id,{width:NODE_W,height:els[id].offsetHeight}));
  const inner=edges.filter(e=>ids.includes(e.from)&&ids.includes(e.to)&&e.from!==e.to);
  if(!inner.length){ // no flow inside the block: a grid, four to a row
    const per=Math.min(4,ids.length), rows=[]; ids.forEach((id,i)=>{ (rows[Math.floor(i/per)]??=[]).push(id); });
    const pos={}; let yy=0, w=0; rows.forEach(r=>{ let xx=0, rh=0; r.forEach(id=>{ pos[id]={x:xx,y:yy}; xx+=NODE_W+22; rh=Math.max(rh,els[id].offsetHeight); }); w=Math.max(w,xx-22); yy+=rh+22; });
    return {w,h:yy-22,pos,paths:[]}; }
  inner.forEach((e,i)=>g.setEdge(e.from,e.to,{weight:2,minlen:1},'i'+i));
  dagre.layout(g);
  const pos={}; ids.forEach(id=>{const n=g.node(id); pos[id]={x:n.x-n.width/2,y:n.y-n.height/2};});
  const paths=inner.map((e,i)=>({from:e.from,to:e.to,pts:(g.edge(e.from,e.to,'i'+i)||{}).points||[],e}));
  return {w:g.graph().width||NODE_W,h:g.graph().height||0,pos,paths};
}
function render(){
  if(!spec) return;
  const m=spec.meta||{}; $('title').textContent=m.title||'System design';
  const upd=m.updated instanceof Date?m.updated.toISOString().slice(0,10):m.updated; $('version').textContent=[m.version,upd].filter(Boolean).join(' · ');
  world.querySelectorAll('.node,.elabel,.band').forEach(e=>e.remove());
  const byId=Object.fromEntries(spec.nodes.map(n=>[n.id,n]));
  const edges=(spec.edges||[]).filter(e=>!e.hidden);
  const feeds={}; edges.forEach(e=>{ if(isData(byId[e.from])&&!e.feedback){ (feeds[e.to]??=[]); if(!feeds[e.to].some(f=>f.id===e.from)) feeds[e.to].push({id:e.from,name:byId[e.from].name}); } });
  const drawn=edges.filter(e=>!e.feedback&&(showData||!isData(byId[e.from])));
  const els={}, geo={}; // geo[id]={x,y,w,h}
  const vis=bands.filter(b=>!(b.retired&&!showRetired));
  // cards first (heights are needed)
  vis.forEach(b=>{ if(expanded.has(b.id)){ b.leaves.forEach(id=>{ const n=byId[id]; if(!n) return; if(n.status==='retired'&&!b.retired&&!showRetired) return;
        const d=document.createElement('div'); d.className=`node kind-${n.kind||'deterministic'} status-${n.status||'settled'}`+(n.validation?' val':''); d.dataset.id=id; d.innerHTML=cardHTML(n,feeds[id]); renderMath(d,{inline:true}); world.appendChild(d); els[id]=d;
        d.onclick=ev=>{ev.stopPropagation(); select(id);}; d.onmouseenter=()=>{ if(!sel) hover(id); }; d.onmouseleave=()=>{ if(!sel) clearFocus(); }; }); }
    else { const d=document.createElement('div'); d.className='node summary'; d.dataset.id='sum_'+b.id; d.dataset.band=b.id; d.innerHTML=summaryHTML(b,byId); world.appendChild(d); els['sum_'+b.id]=d; d.onclick=ev=>{ev.stopPropagation(); expanded.add(b.id); render(); openStep(b.id);}; } });
  // band layouts
  let y=PAD, W=0; const bandGeo={}, innerPaths=[];
  vis.forEach(b=>{
    if(!expanded.has(b.id)){ const d=els['sum_'+b.id]; d.style.width=Math.min(760,Math.max(SUM_W,W||760))+'px'; const h=d.offsetHeight; geo['sum_'+b.id]={x:LEFT,y,w:d.offsetWidth,h}; d.style.left=LEFT+'px'; d.style.top=y+'px'; W=Math.max(W,d.offsetWidth+LEFT*2); y+=h+BAND_GAP; return; }
    const blocks=[]; const inSub=new Set();
    b.subs.forEach(s=>{ const ids=s.leaves.filter(id=>els[id]); if(!ids.length) return; ids.forEach(id=>inSub.add(id)); blocks.push({sub:s,ids}); });
    const rest=b.leaves.filter(id=>els[id]&&!inSub.has(id)); if(rest.length) blocks.unshift({sub:null,ids:rest});
    let bx=LEFT+PAD, bh=0; const placed=[];
    blocks.forEach(bl=>{ const L=layoutBlock(bl.ids,drawn,byId,els); const top=y+HDR+PAD+(bl.sub?SUB_HDR:0); bl.ids.forEach(id=>{ const p=L.pos[id]; const x=bx+p.x, yy=top+p.y; els[id].style.left=x+'px'; els[id].style.top=yy+'px'; geo[id]={x,y:yy,w:NODE_W,h:els[id].offsetHeight}; });
      L.paths.forEach(pp=>innerPaths.push({...pp,pts:pp.pts.map(q=>({x:bx+q.x,y:top+q.y}))}));
      placed.push({bl,x:bx,w:L.w,h:L.h+(bl.sub?SUB_HDR:0)}); bh=Math.max(bh,L.h+(bl.sub?SUB_HDR:0)); bx+=L.w+BLOCK_GAP; });
    const bw=Math.max(bx-BLOCK_GAP+PAD-LEFT, 420), bhh=HDR+PAD*2+bh;
    bandGeo[b.id]={x:LEFT,y,w:bw,h:bhh,placed}; W=Math.max(W,bw+LEFT*2); y+=bhh+BAND_GAP;
  });
  const H=y;
  // draw bands
  vis.forEach(b=>{ const bg=bandGeo[b.id]; if(!bg) return;
    const c=document.createElement('div'); c.className='band'; c.dataset.band=b.id; c.style.left=bg.x+'px'; c.style.top=bg.y+'px'; c.style.width=bg.w+'px'; c.style.height=bg.h+'px';
    c.innerHTML=`<div class="bh"><span class="num">${esc(b.num||'R')}</span><span>${esc(b.name.replace(/^\d+\.\s*/,''))}</span><span class="brief">${esc(b.brief||'')}</span><span class="act">explain ▸</span><span class="act" data-act="collapse">collapse ▾</span></div>`;
    c.querySelector('.bh').onclick=ev=>{ev.stopPropagation(); if(ev.target.dataset.act==='collapse'){ expanded.delete(b.id); render(); } else openStep(b.id); };
    world.insertBefore(c,svg.nextSibling);
    bg.placed.forEach(pl=>{ if(!pl.bl.sub) return; const d=document.createElement('div'); d.className='band sub'; d.style.left=(pl.x-8)+'px'; d.style.top=(bg.y+HDR+PAD-6)+'px'; d.style.width=(pl.w+16)+'px'; d.style.height=(pl.h+12)+'px'; d.innerHTML=`<div class="bh"><span>${esc(pl.bl.sub.name)}</span></div>`; d.querySelector('.bh').onclick=ev=>{ev.stopPropagation(); openStep(b.id,pl.bl.sub.id);}; world.insertBefore(d,svg.nextSibling); });
  });
  // edges
  svg.setAttribute('width',W); svg.setAttribute('height',H);
  svg.innerHTML=`<defs>${[['ah','#8a8a8a'],['ahk','#1f2328'],['ahu','#2b6cb0'],['ahd','#2f7d5a'],['ahf','#b08a3c']].map(([id,col])=>`<marker id="${id}" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0,0 L8,4 L0,8 z" fill="${col}"/></marker>`).join('')}</defs>`;
  let li=0;
  const drawPath=(d,cls,ae,mid,labelHTML)=>{ const p=document.createElementNS('http://www.w3.org/2000/svg','path'); p.setAttribute('d',d); p.setAttribute('class','e '+cls); p.setAttribute('marker-end','url(#ah)'); p.dataset.from=ae.from; p.dataset.to=ae.to; p.dataset.edges=JSON.stringify(ae.items.map(e=>e.from+'>'+e.to)); svg.appendChild(p);
    const h=document.createElementNS('http://www.w3.org/2000/svg','path'); h.setAttribute('d',d); h.setAttribute('class','hit'); svg.appendChild(h);
    const lab=document.createElement('div'); lab.className='elabel'; lab.id='lab'+(li++); lab.innerHTML=labelHTML; lab.style.left=mid.x+'px'; lab.style.top=mid.y+'px'; world.appendChild(lab);
    h.onmouseenter=()=>{lab.classList.add('show'); p.classList.add('on'); svg.classList.add('focus');};
    h.onmouseleave=()=>{ if(!lab.classList.contains('pin')) lab.classList.remove('show'); p.classList.remove('on'); if(!sel) svg.classList.remove('focus'); else applyTrace(); };
    h.onclick=ev=>{ev.stopPropagation(); const was=lab.classList.contains('pin'); world.querySelectorAll('.elabel.pin').forEach(l=>l.classList.remove('pin','show')); if(!was) lab.classList.add('pin','show');}; };
  const labelOf=items=>items.slice(0,7).map(e=>`<b>${esc(byId[e.from].name)}</b> → <b>${esc(byId[e.to].name)}</b>: ${esc(e.sends||e.carries||'')}${(e.when||e.mode)?` <span style="color:#6b7280">(${esc([e.when,e.mode].filter(Boolean).join(', '))})</span>`:''}`).join('<br>')+(items.length>7?`<br>… ${items.length-7} more`:'');
  const clsOf=items=>{ const modes=new Set(items.map(edgeMode)); return modes.size===1?(modes.has('live')?'live':modes.has('bt')?'bt':''):''; };
  // within a band: dagre's own paths
  innerPaths.forEach(pp=>{ if(pp.pts.length<2) return; const ae={from:pp.from,to:pp.to,items:[pp.e]}; drawPath(smooth(pp.pts),(isData(byId[pp.from])?'data ':'')+clsOf([pp.e]),ae,pp.pts[Math.floor(pp.pts.length/2)],labelOf([pp.e])); });
  // between bands: aggregated, anchored bottom-to-top with anchors spread across the card
  const agg={}; drawn.forEach(e=>{ const a=rep(e.from), b=rep(e.to); if(!a||!b||a===b) return; if(rep(e.from)===e.from&&rep(e.to)===e.to&&nodeBand[e.from]===nodeBand[e.to]) return; const k=a+'>'+b; (agg[k]??={from:a,to:b,items:[],data:isData(byId[e.from])}).items.push(e); });
  const outs={}, ins={}; Object.values(agg).forEach(ae=>{ (outs[ae.from]??=[]).push(ae); (ins[ae.to]??=[]).push(ae); });
  const anchor=(id,list,ae,side)=>{ const gg=geo[id]; const i=list.indexOf(ae), n=list.length; const x=gg.x+gg.w*(n===1?0.5:(0.2+0.6*i/(n-1))); return {x,y:side==='bottom'?gg.y+gg.h:gg.y}; };
  Object.values(agg).forEach(ae=>{ const A=geo[ae.from], B=geo[ae.to]; if(!A||!B) return; const down=B.y>=A.y+A.h;
    let d,mid; if(down){ const s=anchor(ae.from,outs[ae.from],ae,'bottom'), t=anchor(ae.to,ins[ae.to],ae,'top'); const dy=Math.max(30,(t.y-s.y)/2); d=`M${s.x},${s.y} C${s.x},${s.y+dy} ${t.x},${t.y-dy} ${t.x},${t.y}`; mid={x:(s.x+t.x)/2,y:(s.y+t.y)/2}; }
    else { const s={x:A.x,y:A.y+A.h/2}, t={x:B.x,y:B.y+B.h/2}; const bulge=60+Math.abs(s.y-t.y)/8; d=`M${s.x},${s.y} C${s.x-bulge},${s.y} ${t.x-bulge},${t.y} ${t.x},${t.y}`; mid={x:Math.min(s.x,t.x)-bulge*0.75,y:(s.y+t.y)/2}; }
    const bi=id=>vis.findIndex(b=>b.id===(nodeBand[id]||(id.startsWith('sum_')?id.slice(4):''))); const skip=Math.abs(bi(ae.to)-bi(ae.from))>1;
    drawPath(d,(ae.data?'data ':'')+clsOf(ae.items)+(down?(skip?' skip':''):' back'),ae,mid,labelOf(ae.items)); });
  // feedback arcs on the left
  edges.filter(e=>e.feedback).forEach(e=>{ const a=rep(e.from), b=rep(e.to); if(!a||!b||a===b) return; const A=geo[a], B=geo[b]; if(!A||!B) return; const s={x:A.x,y:A.y+A.h/2}, t={x:B.x,y:B.y+B.h/2}; const bulge=90+Math.abs(s.y-t.y)/8;
    drawPath(`M${s.x},${s.y} C${s.x-bulge},${s.y} ${t.x-bulge},${t.y} ${t.x},${t.y}`,'fb',{from:a,to:b,items:[e]},{x:Math.min(s.x,t.x)-bulge*0.75,y:(s.y+t.y)/2},labelOf([e])+'<br><span style="color:#6b7280">feedback: the reader acts on the page</span>'); });
  // a feed lights its consumers
  world.querySelectorAll('.node.kind-data').forEach(d=>{ d.onmouseenter=()=>{ if(sel) return; world.querySelectorAll(`.tags .t[data-src="${d.dataset.id}"]`).forEach(t=>t.classList.add('hi')); hover(d.dataset.id); }; d.onmouseleave=()=>{ if(sel) return; world.querySelectorAll('.tags .t.hi').forEach(t=>t.classList.remove('hi')); clearFocus(); }; });
  layout={gw:W,gh:H}; applyView();
  if(sel&&!els[sel]) sel=null;
  if(sel) applyTrace();
}
function smooth(pts){ if(pts.length<3) return `M${pts[0].x},${pts[0].y} L${pts[pts.length-1].x},${pts[pts.length-1].y}`; let d=`M${pts[0].x},${pts[0].y}`; for(let i=1;i<pts.length-1;i++){const a=pts[i],b=pts[i+1]; d+=` Q${a.x},${a.y} ${(a.x+b.x)/2},${(a.y+b.y)/2}`;} const l=pts[pts.length-1]; return d+` L${l.x},${l.y}`; }

// ---------- focus, hover, trace
function reach(id,dir){ const out=new Set(); const q=[id]; const E=(spec.edges||[]).filter(e=>!e.hidden); while(q.length){ const x=q.shift(); E.forEach(e=>{ const nxt=dir==='up'?(e.to===x?e.from:null):(e.from===x?e.to:null); if(nxt&&!out.has(nxt)&&nxt!==id){ out.add(nxt); q.push(nxt); } }); } return out; }
function clearFocus(){ svg.classList.remove('focus'); svg.querySelectorAll('path.e').forEach(p=>{p.classList.remove('up','down','on'); p.setAttribute('marker-end','url(#ah)');}); world.querySelectorAll('.node').forEach(c=>c.classList.remove('dim','up','down','sel')); world.querySelectorAll('.tags .t.hi').forEach(t=>t.classList.remove('hi')); world.querySelectorAll('.band.hi').forEach(b=>b.classList.remove('hi')); }
function hover(id){ // neighbours only
  const nb=new Set([id]); svg.classList.add('focus');
  svg.querySelectorAll('path.e').forEach(p=>{ const on=p.dataset.from===id||p.dataset.to===id; p.classList.toggle('on',on); if(on){nb.add(p.dataset.from); nb.add(p.dataset.to);} });
  (spec.edges||[]).forEach(e=>{ if(e.from===id) nb.add(rep(e.to)); if(e.to===id) nb.add(rep(e.from)); });
  world.querySelectorAll('.node').forEach(c=>c.classList.toggle('dim',!nb.has(c.dataset.id)));
}
function applyTrace(){ if(!sel) return clearFocus(); const up=reach(sel,'up'), down=reach(sel,'down'); const repUp=new Set([...up].map(rep).filter(Boolean)), repDown=new Set([...down].map(rep).filter(Boolean));
  svg.classList.add('focus');
  svg.querySelectorAll('path.e').forEach(p=>{ const pairs=JSON.parse(p.dataset.edges||'[]'); const isUp=pairs.some(k=>{const [a,b]=k.split('>'); return (up.has(a)||a===sel)&&(up.has(b)||b===sel)&&b!==sel?false:(up.has(a)&&(b===sel||up.has(b)));}); const isDown=pairs.some(k=>{const [a,b]=k.split('>'); return (a===sel||down.has(a))&&down.has(b);});
    p.classList.toggle('up',isUp&&!isDown); p.classList.toggle('down',isDown); p.classList.remove('on'); p.setAttribute('marker-end',isDown?'url(#ahd)':isUp?'url(#ahu)':'url(#ah)'); });
  world.querySelectorAll('.node').forEach(c=>{ const id=c.dataset.id; const isSel=id===sel; const u=repUp.has(id)&&!isSel, d=repDown.has(id)&&!isSel; c.classList.toggle('sel',isSel); c.classList.toggle('up',u&&!d); c.classList.toggle('down',d); c.classList.toggle('dim',!(isSel||u||d)); });
  // feeds of the selected node and of its ancestors: light the tags
  world.querySelectorAll('.tags .t').forEach(t=>t.classList.toggle('hi',up.has(t.dataset.src)));
}
function select(id){ sel=id; const n=spec.nodes.find(x=>x.id===id); showNode(n); applyTrace(); }
function deselect(){ sel=null; clearFocus(); $('right').classList.remove('open'); }

// ---------- drawers
function openLeft(tab){ $('left').classList.add('open'); ['step','story','key','history'].forEach(t=>{ $('tab_'+t).classList.toggle('on',t===tab); $('pane_'+t).hidden=t!==tab; }); }
function renderLeft(){
  if(!spec) return;
  const m=spec.meta||{};
  // story
  const live=bands.filter(b=>!b.retired);
  $('pane_story').innerHTML=`<h2>The system in ${live.length} steps</h2><div class="muted">Read top to bottom. Click a step to open it on the canvas.</div>`+live.map(b=>`<div class="stepline" data-band="${esc(b.id)}"><div class="n">${esc(b.num)}. ${esc(b.name.replace(/^\d+\.\s*/,''))}</div><div class="s">${esc(b.synthesis||'')}</div></div>`).join('');
  $('pane_story').querySelectorAll('.stepline').forEach(el=>el.onclick=()=>openStep(el.dataset.band));
  // key
  const L=m.legend||{}, SY=m.symbols||{}, P=m.proof_of_concept||null, Q=m.problem||null;
  let h='<h2>Key</h2>';
  h+=`<div class="k">Shapes, by kind</div><ul><li><span class="chip kind-data">data in</span> pill: a feed, dated when it became public</li><li><b>ƒ</b> box with a blue edge: a deterministic rule, no model</li><li><span class="chip kind-model">LLM</span> rounded, orange: a language-model step, always beside a comparator</li><li><span class="chip kind-human">human</span> hexagon: a person's task</li><li><span class="chip kind-output">output</span> double border: the page</li><li><span class="chip val">validation</span> notched: a step that scores another and feeds nothing to the page</li></ul>`;
  h+=`<div class="k">Lines, by mode</div><ul><li>solid: runs in the backtest and live</li><li>dashed: live only, no backtest claim depends on it</li><li>dotted: backtest only, the scoring</li><li>amber arc: feedback, the reader acting on the page</li><li>grey tag "from": a data feed, drawn as a tag on its consumer rather than a line; hover a feed to see who reads it; the "data lines" button draws them</li></ul>`;
  h+=`<div class="k">Chips, by look-ahead</div><ul>${Object.entries(L).filter(([k])=>k==='lookahead').map(([k,v])=>`<li>${esc(String(v))}</li>`).join('')}</ul>`;
  h+=`<div class="k">On click</div><ul><li>a component: its rule opens on the right; everything upstream turns <b style="color:var(--up)">blue</b> and everything downstream <b style="color:var(--down)">green</b></li><li>a step header: the step's explanation opens here</li><li>a line: its label pins</li><li>keys 1 to ${live.length} open a step; Esc clears; F fits</li></ul>`;
  if(Q) h+='<div class="k">Problem</div><ul>'+Object.entries(Q).map(([k,v])=>`<li><b>${esc(k)}</b>: ${esc(String(v))}</li>`).join('')+'</ul>';
  if(m.note) h+=`<div class="k">Assumption</div><div class="rule">${esc(m.note)}</div>`;
  const rest=Object.entries(L).filter(([k])=>k!=='lookahead'); if(rest.length) h+='<div class="k">Terms</div><ul>'+rest.map(([k,v])=>`<li><b>${esc(k)}</b>: ${esc(String(v))}</li>`).join('')+'</ul>';
  if(Object.keys(SY).length) h+='<div class="k">Symbols</div><ul>'+Object.entries(SY).map(([k,v])=>`<li><span class="sym">${esc(k)}</span>: ${esc(String(v))}</li>`).join('')+'</ul>';
  if(P){ const notes=P.path_notes||{}; h+=`<div class="k">Proof of concept</div>${P.status?`<div>${esc(P.status)}</div>`:''}<div style="margin-top:6px"><b>Produces:</b> ${esc(P.produces||'')}</div><div style="margin-top:6px"><b>Built:</b> ${(P.path||[]).map(id=>notes[id]?`${esc(id)} <span class="muted">(${esc(notes[id])})</span>`:esc(id)).join(', ')}</div><div style="margin-top:6px"><b>Deferred:</b> ${esc((P.deferred||[]).join(', '))}</div>${P.described_only?`<div style="margin-top:6px"><b>Described only:</b> ${esc(P.described_only.join(', '))}</div>`:''}`; }
  $('pane_key').innerHTML=h; renderMath($('pane_key'));
  // history
  const cur=m.version||'';
  $('pane_history').innerHTML='<h2>History</h2><div class="muted">Click a version to load that snapshot.</div>'+((changelog&&changelog.entries)||[]).map(e=>`<div class="ce${e.version===cur?' cur':''}"><div class="cv"><a href="?spec=${esc(e.file)}">${esc(e.version)}</a> <span class="cd">${esc(e.date)}${e.status==='current'?' · current':''}</span></div><div class="cs">${esc(e.summary)}</div><div class="k">What changed</div>${list(e.changes)}<div class="k">Why</div><div class="cr">${esc(e.reasoning)}</div></div>`).join('');
  renderMath($('pane_history'));
  if(selBand) openStep(selBand.id,selBand.sub,true);
  // step buttons
  $('stepbtns').innerHTML=live.map(b=>`<button title="${esc(b.name)}" data-band="${esc(b.id)}">${esc(b.num)}</button>`).join('');
  $('stepbtns').querySelectorAll('button').forEach(bt=>bt.onclick=()=>openStep(bt.dataset.band));
}
function list(a){return (a&&a.length)?'<ul>'+a.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'<span class="muted">none</span>';}
function openStep(bandId,subId,quiet){
  const b=bands.find(x=>x.id===bandId); if(!b) return; selBand={id:bandId,sub:subId};
  const byId=Object.fromEntries(spec.nodes.map(n=>[n.id,n]));
  const live=bands.filter(x=>!x.retired); const idx=live.indexOf(b);
  const inB=id=>nodeBand[id]===b.id;
  const E=(spec.edges||[]).filter(e=>!e.hidden);
  const recv={}, send={};
  E.forEach(e=>{ if(inB(e.to)&&!inB(e.from)){ const src=bandOf(e.from); const k=src?src.num+'. '+src.name.replace(/^\d+\.\s*/,''):'?'; (recv[k]??=[]).push(e);} if(inB(e.from)&&!inB(e.to)){ const dst=bandOf(e.to); const k=dst?dst.num+'. '+dst.name.replace(/^\d+\.\s*/,''):'?'; (send[k]??=[]).push(e);} });
  const io=obj=>Object.keys(obj).length?Object.entries(obj).map(([k,es])=>`<li><b>${esc(k)}</b><ul>${[...new Set(es.map(e=>(e.sends||e.carries||'')+(e.mode&&/only/.test(e.mode)?' ('+e.mode+')':'')))].map(t=>`<li>${esc(t)}</li>`).join('')}</ul></li>`).join(''):'<li class="muted">nothing</li>';
  const comps=b.leaves.filter(id=>byId[id]&&(showRetired||byId[id].status!=='retired')).map(id=>{const n=byId[id]; return `<div class="comp" data-id="${esc(id)}"><span class="chip kind-${n.kind||'deterministic'}">${n.kind==='model'?'LLM':n.kind==='deterministic'?'rule':n.kind}</span>${n.validation?'<span class="chip val">validation</span>':''} ${esc(n.name)}${nodeSub[id]?` <span class="muted">· ${esc((b.subs.find(s=>s.id===nodeSub[id])||{}).short||'')}</span>`:''}</div>`;}).join('');
  $('pane_step').innerHTML=`<h2>${esc(b.num?b.num+'. ':'')}${esc(b.name.replace(/^\d+\.\s*/,''))}</h2>${b.brief?`<div class="brief">${esc(b.brief)}</div>`:''}
    <div class="k">What this step does</div><div class="rule">${esc(b.synthesis||'')}</div>
    ${b.subs.length?`<div class="k">In three parts</div><ul>${b.subs.map(s=>`<li${s.id===subId?' style="background:#f3f6f9"':''}><b>${esc(s.name)}</b>: ${esc(s.synthesis||'')}</li>`).join('')}</ul>`:''}
    <div class="k">Receives from other steps</div><ul class="io">${io(recv)}</ul>
    <div class="k">Sends to other steps</div><ul class="io">${io(send)}</ul>
    <div class="k">Components (${b.leaves.length})</div>${comps}
    <div class="nav">${idx>0?`<button data-go="${esc(live[idx-1].id)}">◂ ${esc(live[idx-1].num)}. ${esc(live[idx-1].short)}</button>`:''}${idx<live.length-1?`<button data-go="${esc(live[idx+1].id)}">${esc(live[idx+1].num)}. ${esc(live[idx+1].short)} ▸</button>`:''}</div>`;
  renderMath($('pane_step'));
  $('pane_step').querySelectorAll('.comp').forEach(el=>el.onclick=()=>{ if(!expanded.has(b.id)){expanded.add(b.id); render();} select(el.dataset.id); scrollTo(el.dataset.id); });
  $('pane_step').querySelectorAll('[data-go]').forEach(bt=>bt.onclick=()=>openStep(bt.dataset.go));
  if(quiet) return;
  openLeft('step');
  if(!expanded.has(b.id)){ expanded.add(b.id); render(); }
  world.querySelectorAll('.band.hi').forEach(x=>x.classList.remove('hi')); const bd=world.querySelector(`.band[data-band="${b.id}"]`); if(bd){ bd.classList.add('hi'); scrollToEl(bd); }
}
function showNode(n){
  const byId=Object.fromEntries(spec.nodes.map(x=>[x.id,x]));
  const ins=(spec.edges||[]).filter(e=>e.to===n.id&&!e.hidden), outs=(spec.edges||[]).filter(e=>e.from===n.id&&!e.hidden);
  const io=(arr,dir)=>arr.length?'<ul class="io">'+arr.map(e=>`<li><b>${esc((byId[dir==='in'?e.from:e.to]||{}).name||'')}</b>: ${esc(e.sends||e.carries||'')}${(e.when||e.mode)?` <span class="muted">(${esc([e.when,e.mode].filter(Boolean).join(', '))})</span>`:''}</li>`).join('')+'</ul>':'<span class="muted">none</span>';
  const b=bandOf(n.id); const fullById=fullSpec?Object.fromEntries((fullSpec.nodes||[]).map(x=>[x.id,x])):{};
  const abs=(n.absorbs||[]).map(id=>{const f=fullById[id]; return f?`<li><b>${esc(f.name)}</b> <span class="muted">(${esc(id)})</span></li>`:`<li>${esc(id)}</li>`;}).join('');
  $('rbody').innerHTML=`<h2>${esc(n.name)}</h2><div class="muted">${b?esc(b.num?b.num+'. '+b.short:b.short)+' · ':''}${esc(n.kind==='model'?'language model':n.kind||'rule')}${n.status==='retired'?' · retired':''}${n.origin?' · '+esc(n.origin):''}</div>
    ${n.lookahead?`<div class="k">Look-ahead</div><div><span class="chip la-${esc(n.lookahead)}">${esc(n.lookahead)}</span> ${esc(n.mitigation||'')}</div>`:''}
    ${n.access?`<div class="k">Access</div><div><span class="chip ac-${esc(n.access)}">${esc(n.access)}</span> feeds are labelled PUBLIC, LICENSED or DESK-ONLY in the rule</div>`:''}
    <div class="k">Rule</div><div class="rule">${esc(n.rule)}</div>
    ${n.comparator?`<div class="k">Comparator</div><div>${esc(n.comparator)}</div>`:''}
    <div class="k">Receives</div>${io(ins,'in')}<div class="k">Sends</div>${io(outs,'out')}
    ${(n.checks||n.check)?`<div class="k">Checks</div>${n.check?`<div>${esc(n.check)}</div>`:list(n.checks)}`:''}
    ${n.on_failure?`<div class="k">On failure</div><div>${esc(n.on_failure)}</div>`:''}
    ${abs?`<div class="k">In the full view</div><ul>${abs}</ul>`:''}
    ${(n.open||[]).length?`<div class="k">Open</div><div class="open">${list(n.open)}</div>`:''}`;
  renderMath($('rbody')); $('right').classList.add('open');
}

// ---------- view
function applyView(){ world.style.transform=`translate(${view.x}px,${view.y}px) scale(${view.k})`; }
function fit(){ if(!layout) return; const r=stage.getBoundingClientRect(); view.k=Math.min(1.0,(r.width-24)/layout.gw); view.x=(r.width-layout.gw*view.k)/2; view.y=12; applyView(); }
function fitAll(){ if(!layout) return; const r=stage.getBoundingClientRect(); view.k=Math.min(1.0,(r.width-24)/layout.gw,(r.height-24)/layout.gh); view.x=(r.width-layout.gw*view.k)/2; view.y=12; applyView(); }
function scrollToEl(el){ const r=stage.getBoundingClientRect(); const x=parseFloat(el.style.left), y=parseFloat(el.style.top), w=el.offsetWidth, h=el.offsetHeight; const k=Math.min(1,Math.max(view.k,(r.height-80)/Math.max(h,1)*0.9)); view.k=Math.min(k,1); view.x=(r.width-w*view.k)/2-x*view.k; view.y=40-y*view.k; applyView(); }
function scrollTo(id){ const el=world.querySelector(`.node[data-id="${id}"]`); if(el) scrollToEl(el); }
let drag=null;
stage.addEventListener('mousedown',e=>{drag={x:e.clientX-view.x,y:e.clientY-view.y,moved:false}; stage.classList.add('drag');});
window.addEventListener('mousemove',e=>{ if(drag){ view.x=e.clientX-drag.x; view.y=e.clientY-drag.y; drag.moved=true; applyView(); } });
window.addEventListener('mouseup',()=>{drag=null; stage.classList.remove('drag');});
stage.addEventListener('wheel',e=>{e.preventDefault(); const k=Math.min(3,Math.max(.12,view.k*(e.deltaY<0?1.1:0.9))); const r=stage.getBoundingClientRect(); const mx=e.clientX-r.left,my=e.clientY-r.top; view.x=mx-(mx-view.x)*k/view.k; view.y=my-(my-view.y)*k/view.k; view.k=k; applyView();},{passive:false});
stage.addEventListener('click',()=>{ world.querySelectorAll('.elabel.pin').forEach(l=>l.classList.remove('pin','show')); if(sel) deselect(); });
window.addEventListener('keydown',e=>{ if(e.target.tagName==='INPUT') return; const live=bands.filter(b=>!b.retired); if(/^[1-9]$/.test(e.key)&&live[+e.key-1]) openStep(live[+e.key-1].id); else if(e.key==='Escape'){ deselect(); $('left').classList.remove('open'); } else if(e.key==='f'||e.key==='F') fit(); });

// ---------- buttons
$('b_fit').onclick=()=>{ const r=stage.getBoundingClientRect(); const kw=Math.min(1,(r.width-24)/layout.gw); if(Math.abs(view.k-kw)<1e-6) fitAll(); else fit(); };
$('b_open').onclick=()=>{ bands.forEach(b=>{ if(!b.retired||showRetired) expanded.add(b.id); }); render(); fit(); };
$('b_close').onclick=()=>{ expanded.clear(); render(); fit(); };
$('b_data').onclick=()=>{ showData=!showData; $('b_data').classList.toggle('on',showData); render(); };
$('b_ret').onclick=()=>{ showRetired=!showRetired; $('b_ret').classList.toggle('on',showRetired); if(showRetired) bands.filter(b=>b.retired).forEach(b=>expanded.add(b.id)); render(); };
$('b_story').onclick=()=>openLeft('story'); $('b_key').onclick=()=>openLeft('key'); $('b_hist').onclick=()=>openLeft('history');
['step','story','key','history'].forEach(t=>$('tab_'+t).onclick=()=>openLeft(t));
$('left_close').onclick=()=>$('left').classList.remove('open'); $('right_close').onclick=deselect;
if(document.fonts) document.fonts.addEventListener('loadingdone',()=>{ if(spec) render(); });
poll();
})();
