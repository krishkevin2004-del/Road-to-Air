import {runGapSweep,summarize,brakingBoundary,CLASSES} from './gapsweep.js';
const $=id=>document.getElementById(id);
const COLORS={ok:'#8fb07a',contact:'#d9825f',denied:'#5d6355',rescue:'#e3cfa5',neutral:'#3a4332'};
const f=(x,d=1)=>Number.isFinite(x)?x.toFixed(d):'—';
const kn=x=>f(x/1000,1);
const flightCell=r=>r.approved?(r.aerialFailed?'Admitted, contact recorded':'Admitted'):'Declined';
const outcomeColor=cls=>cls==='rescue'?COLORS.rescue:cls==='unavoidable'||cls==='anomaly'?COLORS.contact:COLORS.neutral;
function chart(rows,edge,selected){
 const W=1000,L=150,R=20,T=44,rowH=42,gapY=14,n=rows.length,step=n>1?rows[1].gap-rows[0].gap:1,g0=rows[0].gap,span=rows.at(-1).gap-g0+step,pw=W-L-R;
 const x=g=>L+(g-g0)/span*pw,w=pw/n,rowsDef=[['Braking alone',r=>r.groundContact?COLORS.contact:COLORS.ok,r=>r.groundContact?'Contact':r.thin?'Clears by under 2 m':'No contact'],['Aerial request',r=>r.approved?(r.aerialFailed?COLORS.contact:COLORS.ok):COLORS.denied,r=>flightCell(r)],['Outcome',r=>outcomeColor(r.cls),r=>CLASSES[r.cls].short]];
 const H=T+rowsDef.length*(rowH+gapY)+46;let svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Outcome of braking and of an aerial request for each initial following gap from ${f(g0)} to ${f(rows.at(-1).gap)} metres. A data table follows." xmlns="http://www.w3.org/2000/svg">`;
 rowsDef.forEach(([label,color,tip],i)=>{const y=T+i*(rowH+gapY);svg+=`<text x="${L-14}" y="${y+rowH/2+4}" text-anchor="end" fill="#c9d0bd" font-size="14">${label}</text>`;
  rows.forEach((r,k)=>{svg+=`<rect x="${(x(r.gap)+.5).toFixed(1)}" y="${y}" width="${(w-1).toFixed(1)}" height="${rowH}" fill="${color(r)}" ${i===0&&r.thin?'fill-opacity=".55" stroke="#8fb07a" stroke-dasharray="3 2"':''} data-k="${k}"><title>${f(r.gap)} m · ${tip(r)}</title></rect>`;});});
 const axisY=T+rowsDef.length*(rowH+gapY)-4;
 const every=span>25?5:2;for(let g=Math.ceil(g0/every)*every;g<=rows.at(-1).gap+1e-9;g+=every)svg+=`<line x1="${x(g)+w/2}" x2="${x(g)+w/2}" y1="${axisY}" y2="${axisY+6}" stroke="#7d8872"/><text x="${x(g)+w/2}" y="${axisY+22}" text-anchor="middle" fill="#a2a79b" font-size="13">${g}</text>`;
 svg+=`<text x="${L+pw/2}" y="${H-4}" text-anchor="middle" fill="#a2a79b" font-size="13">Initial bumper gap to the lead vehicle (m) · both cars at 22 m/s · lead brakes at 8 m/s²</text>`;
 if(edge>=g0&&edge<=rows.at(-1).gap+step)svg+=`<line x1="${x(edge)+w/2}" x2="${x(edge)+w/2}" y1="${T-10}" y2="${axisY-4}" stroke="#f1f1eb" stroke-dasharray="4 4"/><text x="${x(edge)+w/2}" y="${T-18}" text-anchor="middle" fill="#f1f1eb" font-size="13">braking margin = 0 at ${f(edge)} m</text>`;
 const sx=x(rows[selected].gap);svg+=`<rect id="gap-marker" x="${sx-1.5}" y="${T-6}" width="${w+3}" height="${rowsDef.length*(rowH+gapY)}" fill="none" stroke="#f1f1eb" stroke-width="2" pointer-events="none"/>`;
 return svg+'</svg>';
}
function detail(r){
 const ground=r.groundContact?`Braking alone: stopping margin ${f(r.margin)} m, so contact is recorded.`:`Braking alone: stopping margin ${f(r.margin)} m, no contact${r.thin?' (a thin margin)':''}.`;
 const air=r.approved?`Aerial request: ${r.aerialFailed?'admitted, but the replay records contact. ':'admitted. '}A ${f(r.duration)} s, 3 m climb using ${kn(r.impulse)} kN·s plus the completion reserve; peak ${f(r.peakLoad,2)} g and ${f(r.jerk)} m/s³ jerk; ${f(r.clearance,2)} m roof clearance; ${kn(r.remaining)} kN·s left afterwards.`:`Aerial request: declined. ${r.reason}`;
 return `<b>${f(r.gap)} m gap · ${CLASSES[r.cls].label}</b><span>${ground}</span><span>${air}</span>`;
}
function table(rows){return `<table><thead><tr><th>Gap (m)</th><th>Braking margin (m)</th><th>Braking</th><th>Aerial request</th><th>Duration (s)</th><th>Impulse (kN·s)</th><th>Peak load (g)</th><th>Roof clearance (m)</th><th>Outcome</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${f(r.gap)}</td><td>${f(r.margin)}</td><td>${r.groundContact?'Contact':'No contact'}</td><td>${flightCell(r)}</td><td>${r.approved?f(r.duration):'—'}</td><td>${r.approved?kn(r.impulse):'—'}</td><td>${r.approved?f(r.peakLoad,2):'—'}</td><td>${r.approved?f(r.clearance,2):'—'}</td><td>${CLASSES[r.cls].short}</td></tr>`).join('')}</tbody></table>`;}
export function initGapSweep({getConfig,validate,getSeed}){
 const root=$('gap-sweep');if(!root)return {notify(){}};
 let rows=null,used=null,token=0,selected=0,ranOnce=false;
 const key=c=>JSON.stringify([c.mass,c.thrust,c.impulse,c.latency]);
 const describe=c=>`mass ${c.mass} kg · shared thrust ${f(c.thrust/1000,0)} kN · usable impulse ${f(c.impulse/1000,1)} kN·s · latency ${f(c.latency,2)} s`;
 const status=(t,err=false)=>{const el=$('gap-status');el.textContent=t;el.classList.toggle('error',err);};
 function staleNote(){const el=$('gap-stale');if(!rows||!validate()){el.hidden=true;return;}el.hidden=key(getConfig())===used;}
 function paint(){
  const cfg=rows.cfg,edge=brakingBoundary(cfg);selected=Math.min(selected,rows.length-1);
  $('gap-chart').innerHTML=chart(rows,edge,selected);
  $('gap-findings').innerHTML=summarize(rows,cfg).map(t=>`<li>${t}</li>`).join('');
  $('gap-detail').innerHTML=detail(rows[selected]);
  $('gap-table').innerHTML=table(rows);
  const s=$('gap-select');s.max=rows.length-1;s.value=selected;s.disabled=false;
  $('gap-config').textContent=`Assumptions used: ${describe(cfg)}.`;staleNote();
 }
 async function run(){
  if(!validate()){status('Fix the highlighted engineering assumption first, then re-run.',true);return;}
  const cfg=getConfig(),mine=++token;ranOnce=true;$('gap-run').disabled=true;$('gap-select').disabled=true;status('Replaying every gap through the full simulation…');
  try{const out=await runGapSweep(cfg,{seed:getSeed(),isCancelled:()=>mine!==token,onProgress:(i,n)=>{if(mine===token)status(`Replaying gap ${i} of ${n}…`);}});
   if(!out||mine!==token)return;rows=out;rows.cfg=cfg;used=key(cfg);
   const g=rows.find(r=>r.gap>=8)||rows[0];selected=rows.indexOf(g);paint();
   status(`${rows.length} gaps × 2 full replays complete. Each cell is a simulation result, not a formula.`);
  }catch(e){if(mine===token){rows=null;$('gap-chart').innerHTML='';$('gap-findings').innerHTML='';$('gap-detail').innerHTML='';$('gap-table').innerHTML='';status(`Gap sweep unavailable: ${e.message}`,true);}}
  finally{if(mine===token){$('gap-run').disabled=false;$('gap-select').disabled=!rows;}}
 }
 $('gap-run').onclick=run;
 $('gap-select').oninput=e=>{if(!rows)return;selected=+e.target.value;paint();};
 $('gap-chart').addEventListener('click',e=>{const k=e.target?.dataset?.k;if(rows&&k!==undefined){selected=+k;paint();}});
 for(const id of ['mass','thrust','impulse','latency'])$(id)?.addEventListener('input',staleNote);
 if('IntersectionObserver'in window){const io=new IntersectionObserver(es=>{if(es.some(x=>x.isIntersecting)&&!ranOnce){io.disconnect();run();}},{rootMargin:'300px'});io.observe(root);}else run();
 return {notify(){if(ranOnce)run();else staleNote();}};
}
