import {simulate} from './simulation.js';
import {vehicle,stoppingDistance} from './model.js';
// Sweep of the scripted sudden-braking event over the initial bumper gap. Every row is two full
// replays (ground braking, aerial request) through the same engine as the live scene, not a formula.
export const GAPS=Object.freeze(Array.from({length:33},(_,i)=>4+i*.5));
// The range follows the assumptions: slower reactions push the braking boundary outward, so the grid
// always extends at least 10 m beyond it (0.5 m steps up to 20 m of span, 1 m steps beyond), capped at 100 m.
export function gapGrid(config={},speed=22){const edge=brakingBoundary(config,speed),hi=Math.min(100,Math.max(20,Math.ceil(edge+10))),step=hi-4>40?1:.5,out=[];for(let g=4;g<=hi+1e-9;g+=step)out.push(+g.toFixed(2));return out;}
export const CLASSES={
 rescue:{label:'Flight avoids contact',short:'Rescue'},
 unneeded:{label:'Braking suffices; flight also possible',short:'Not needed'},
 braking:{label:'Braking suffices; flight declined',short:'Braking'},
 unavoidable:{label:'Contact in both responses',short:'Unavoidable'},
 anomaly:{label:'Flight causes contact braking would avoid',short:'Anomaly'}
};
export function sweepRow(gap,config={},seed=42,speed=22){
 const base={scenario:'brake',gap,seed,intent:'emergency',emergency:true,consent:true,config,speed,lean:true,horizon:14};
 const g=simulate({...base,policy:'ground'}),a=simulate({...base,policy:'coordinated'});
 const req=a.requests.find(r=>r.kind==='emergency'),approved=!!req?.accepted,aerialFailed=a.summary.failed;
 const groundContact=g.summary.failed,margin=g.study.groundStopMargin;
 const cls=groundContact?(approved&&!aerialFailed?'rescue':'unavoidable'):(approved?(aerialFailed?'anomaly':'unneeded'):'braking');
 return {gap,margin,groundContact,approved,aerialFailed,cls,thin:!groundContact&&margin<2,
  duration:approved?req.duration:null,impulse:approved?req.impulse:null,peakLoad:approved?req.screen.peakLoad:null,transitionStep:approved?req.screen.transitionStep:null,jerk:approved?req.screen.peakJerk:null,
  clearance:approved?req.trafficScreen.minRoofClearance:null,remaining:a.summary.remainingImpulse,
  reason:approved?null:(req?.reasons?.[0]??'No request')};
}
// Cooperative: yields to the event loop between rows so the page stays responsive.
export async function runGapSweep(config={},{gaps,seed=42,speed=22,onProgress,isCancelled}={}){
 vehicle(config);gaps=gaps||gapGrid(config,speed);// reject invalid parameters before any work
 const rows=[];let sliceStart=performance.now();
 for(const gap of gaps){
  if(isCancelled?.())return null;
  rows.push(sweepRow(gap,config,seed,speed));onProgress?.(rows.length,gaps.length);
  if(performance.now()-sliceStart>40){await new Promise(r=>setTimeout(r,0));sliceStart=performance.now();}// time-sliced: stay responsive without paying a timer round trip per row
 }
 return rows;
}
// Contiguous runs of the same outcome class, in gap order.
export function bands(rows){const out=[];for(const r of rows){const last=out.at(-1);if(last&&last.cls===r.cls)last.to=r.gap;else out.push({cls:r.cls,from:r.gap,to:r.gap});}return out;}
export function brakingBoundary(config={},speed=22){const c=vehicle(config);return stoppingDistance(speed,c.latency,c.brake)-speed**2/(2*8);}// gap where the analytical margin is zero
// Plain-language findings derived only from the rows, so the text can never disagree with the chart.
export function summarize(rows,config={},speed=22){
 const b=bands(rows),by=k=>b.filter(x=>x.cls===k),fmt=x=>`${+x.toFixed(1)} m`,range=x=>x.from===x.to?fmt(x.from):`${fmt(x.from)} to ${fmt(x.to)}`;
 const out=[],edge=brakingBoundary(config,speed);
 const contact=rows.filter(r=>r.groundContact).length,rescue=rows.filter(r=>r.cls==='rescue');
 out.push(contact?`Braking alone records contact at gaps up to ${fmt(Math.max(...rows.filter(r=>r.groundContact).map(r=>r.gap)))}. The analytical margin reaches zero at ${fmt(edge)}.`:`Braking alone avoids contact at every gap tested (analytical margin reaches zero at ${fmt(edge)}).`);
 if(rescue.length){const parts=by('rescue').map(range);out.push(`A flight avoids contact that braking cannot at ${parts.join(' and ')}. In that window it uses ${Math.round(Math.min(...rescue.map(r=>r.impulse))/1000)}–${Math.round(Math.max(...rescue.map(r=>r.impulse))/1000)} kN·s over ${Math.min(...rescue.map(r=>r.duration)).toFixed(1)}–${Math.max(...rescue.map(r=>r.duration)).toFixed(1)} s, with at least ${Math.min(...rescue.map(r=>r.clearance)).toFixed(2)} m of roof clearance.`);}
 else out.push('No gap in this sweep is rescued by a flight under these assumptions.');
 if(rescue.length){const lo=Math.min(...rescue.map(r=>r.gap)),hi=Math.max(...rescue.map(r=>r.gap)),t=g=>(g/speed).toFixed(2);out.push(`Read that window as following distance: ${fmt(lo)} to ${fmt(hi)} at ${(speed*2.23694).toFixed(0)} mph is only ${t(lo)} to ${t(hi)} s behind the lead car. The common two-second rule at this speed is ${fmt(2*speed)}. So the flight only helps when a car is already following that closely, which is effectively tailgating. It is not a case for ordinary driving.`);}
 const lost=by('unavoidable');if(lost.length){const why={};for(const r of rows.filter(x=>x.cls==='unavoidable'&&x.reason))why[r.reason]=(why[r.reason]||0)+1;const top=Object.entries(why).sort((x,y)=>y[1]-x[1])[0]?.[0];out.push(`At ${lost.map(range).join(' and ')} neither response avoids contact.${top?` The flight is declined: ${top.charAt(0).toLowerCase()+top.slice(1)}`:''}`);}
 const spare=rows.filter(r=>r.cls==='unneeded').length;if(spare)out.push(`At ${spare} of ${rows.length} gaps a flight is possible but braking already works, so it would spend resources for no modeled benefit.`);
 const thin=rows.filter(r=>r.thin);if(thin.length)out.push(`Braking clears the lead by less than 2 m from ${fmt(thin[0].gap)} to ${fmt(thin.at(-1).gap)}. The model counts that as no contact, but it is a thin margin and ignores real-world variation.`);
 const bad=rows.filter(r=>r.cls==='anomaly');if(bad.length)out.push(`Warning: at ${bad.map(r=>fmt(r.gap)).join(', ')} the flight records contact although braking does not. This indicates a model problem.`);
 return out;
}
