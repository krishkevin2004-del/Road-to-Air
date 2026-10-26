import {BASELINE,vehicle,resources,consume,vertical,lateral,thrustCap,rng} from './model.js';
import {feasibility,sweptOverlap} from './physics.js';
// Synthetic, repeatable events. No claim about human motives or real brake-check frequency.
export const BRAKE_EVENT=Object.freeze({onset:5,leadBrake:8,entrySpeed:22,normalGap:32,tightGap:8,duration:4,apex:3});
export const HIGHWAY=Object.freeze({requestTime:5,north:170,east:60,deck:6,duration:4.6,entrySpeed:22});
const names={ground:'Ground braking / route',coordinated:'Request aerial assistance',optional:'Use now, then face emergency',reserve:'Preserve future capability',onboard:'Onboard forecast comparator'};
const body=(c,speed=22)=>({id:'R',x:0,y:3.7,z:0,v:speed,vz:0,vy:0,a:0,length:c.length,width:c.width,height:c.bodyHeight,mode:'ground'});
function advance(v,a,dt){const sub=a<0?Math.min(dt,v.v/-a):dt;v.x+=v.v*sub+.5*a*sub**2;v.v=Math.max(0,v.v+a*dt);}
export function leadPose(t,c,gap,onset=BRAKE_EVENT.onset,v0=22){const age=Math.max(0,t-onset),sub=Math.min(age,v0/BRAKE_EVENT.leadBrake);return {id:'LEAD',x:(c.length+4.7)/2+gap+v0*Math.min(t,onset)+v0*sub-.5*BRAKE_EVENT.leadBrake*sub**2,y:3.7,z:0,v:Math.max(0,v0-8*age),length:4.7,width:1.9,height:1.5};}
export function emergencyGate(q,origin,t,c,gap,onset=5){
 let prior={...origin},conflict=null,minRoofClearance=Infinity;
 const STEP=.0025;// fine enough that the swept boxes follow the curved climb (chord error < 1 mm) and the reported clearance is effectively continuous
 for(let k=1;k*STEP<=q.duration+.6+1e-8;k++){const a=k*STEP;
  const next={...origin,x:origin.x+q.speed*a,z:vertical(Math.min(a,q.duration),q.duration,q.height).p},lead=leadPose(t+a,c,gap,onset,origin.v);
  if(Math.abs(next.x-lead.x)<(origin.length+lead.length)/2&&Math.abs(next.y-lead.y)<(origin.width+lead.width)/2)minRoofClearance=Math.min(minRoofClearance,next.z-lead.height);
  if(!conflict&&sweptOverlap(prior,next,leadPose(t+a-STEP,c,gap,onset,origin.v),lead,c,.7))conflict={t:t+a,age:a,bottom:next.z};
  prior=next;
 }
 const details={requiredClearance:.7,minRoofClearance:Number.isFinite(minRoofClearance)?minRoofClearance:null,firstConflict:conflict};
 if(conflict)return {ok:false,reason:'Lead vehicle occupies the climb, flight or 0.6 s recovery corridor (0.70 m clearance buffer).',...details};
 const landX=origin.x+q.speed*q.duration,lead=leadPose(t+q.duration,c,gap,onset,origin.v),distance=lead.x-landX-(origin.length+lead.length)/2,need=2+q.speed*c.latency+Math.max(0,(q.speed**2-lead.v**2)/(2*c.brake));
 if(lead.x>landX&&distance<need)return {ok:false,reason:`Landing recovery gap ${distance.toFixed(1)} m is below ${need.toFixed(1)} m required.`,...details};
 return {ok:true,reason:'Script-conditioned lead forecast clears the flight and landing recovery corridor; uncertainty is not modeled.',...details};
}
// Gentle hops (4.0-5.0 s) are tried first. Only when none passes does the search escalate to
// shorter, higher-acceleration climbs (still within the 3 g, jerk, thrust and impulse gates), which
// is what a tight following gap needs: the car must be above the lead roof before it arrives.
export const RAPID_CLIMB=Object.freeze([3.8,3.6,3.4,3.2,3,2.8,2.6,2.4]);
// Bounded candidate search, not an optimal controller. Keep the 3 m apex, speed,
// vehicle limits, resources, external traffic and 0.70 m buffer fixed.
export function selectBrakeCandidate(origin,t,c,ledger,gap,onset=5,kind='emergency'){
 const attempts=[];let selected;
 for(const duration of kind==='optional'?[4.6]:[4,4.2,4.4,4.6,4.8,5,...RAPID_CLIMB]){
  const q={speed:origin.v,duration,height:3,lateral:0},screen=feasibility(q,c,ledger),gate=emergencyGate(q,origin,t,c,gap,onset);
  const reasons=[...(!screen.ok?screen.reasons:[]),...(!gate.ok?[gate.reason]:[])];
  const candidate={q,screen,gate,reasons};attempts.push({duration,apex:3,accepted:!reasons.length,impulse:screen.impulse,clearance:gate.minRoofClearance,reasons});
  if(!selected)selected=candidate;
  if(!reasons.length){selected=candidate;break;}
 }
 return {...selected,attempts};
}
// A sweep may override the scripted following gap; anything outside a sane range is rejected, not clamped.
function checkedSpeed(v){if(!Number.isFinite(+v)||+v<10||+v>40)throw Error('Travel speed must be between 10 and 40 m/s');return +v;}
function checkedGap(g){if(!Number.isFinite(+g)||+g<1||+g>100)throw Error('Following gap must be between 1 and 100 m');return +g;}
export function simulateBrake(options={}){
 const {scenario='brake',seed=42,policy='coordinated',intent='emergency',consent=true}=options,c=vehicle(options.config),speed=options.speed===undefined?22:checkedSpeed(options.speed),r=resources(c),ego=body(c,speed),gap=options.gap!==undefined?checkedGap(options.gap):scenario==='priorUse'?20:scenario==='brakeTight'?8:32,eventTime=scenario==='priorUse'?14:5,random=rng(+seed),events=[],frames=[],requests=[];
 const adjacent=[];for(let lane of [0,7.4])for(let i=0;i<7;i++)adjacent.push({id:`ADJ${lane}-${i}`,x:-150+i*65+random()*12,y:lane,z:0,v:20+random()*3,length:4.7,width:1.9,height:1.5});
 const leadAt=t=>leadPose(t,c,gap,eventTime,speed),traffic=t=>[leadAt(t),...adjacent.map(v=>({...v,x:v.x+v.v*t}))];let steering=null;let flight=null,failed=false,arrival=null,requested=false,onset=false,observed=false,denials=0,overlaps=0,airFailure=false,optionalDone=false;
 const log=(t,type,message)=>events.push({t:+t.toFixed(4),type,message});log(0,'baseline',`Synthetic sudden-braking event: ${gap} m initial bumper gap, both cars ${speed.toFixed(1)} m/s (${(speed/.44704).toFixed(0)} mph). B1 unchanged.`);
 function attempt(t,kind){// The loop decides before this tick's motion, so ego still holds its t−dt state while the lead pose is exact at t.
  // Advance the cruising ego to time t first; screening from the stale position gave the flight one free step (v·dt) of room.
  const tick=t;t=kind==='emergency'?eventTime+c.latency:t;// decide at the exact observation instant, not the next 20 ms tick
  const here={...ego,x:ego.x+ego.v*(t-(tick-c.dt))};const candidate=selectBrakeCandidate(here,t,c,r,gap,eventTime,kind),q=candidate.q,f=candidate.screen,gate=candidate.gate,reasons=[...candidate.reasons];if(kind==='optional'&&!consent)reasons.push('Consent to spend future allocation is disabled.');if(kind==='optional'&&policy==='reserve'&&r.impulse-f.impulse-c.reserve<c.futureReserve)reasons.push('Preserve the future emergency allocation.');if(flight)reasons.push('Already airborne; a second departure cannot be stacked.');
 const accepted=!reasons.length;requests.push({t,kind,accepted,impulse:f.impulse,duration:q.duration,request:q,origin:{...here},reasons:accepted?[gate.reason]:reasons,landing:{t:t+q.duration,x:here.x+q.speed*q.duration,y:here.y,uncertainty:q.speed*c.latency},screen:f,trafficScreen:gate,candidateSearch:candidate.attempts,groundGap:leadAt(t).x-here.x-(here.length+4.7)/2});log(t,accepted?'approved':'denied',`${kind}: ${accepted?`Selected ${q.duration.toFixed(2)} s / 3 m apex from ${candidate.attempts.length} candidate(s). ${gate.reason}`:reasons.join(' ')}`);if(accepted){flight={start:t,origin:{...here},request:q};ego.mode='departure';}else denials++;}
 const horizon=options.horizon===undefined?28:Math.min(28,Math.max(12,+options.horizon)),lean=options.lean===true;// lean: no replay frames, shorter horizon; outcomes are decided well before 12 s
 for(let step=0;step<=Math.round(horizon/c.dt);step++){const t=step*c.dt,prev={...ego};
  if(!onset&&t>=eventTime){onset=true;log(t,'hazard-onset','Lead vehicle begins 8 m/s² braking; no instantaneous stopped-car insertion.');}
  if(!optionalDone&&t>=1){optionalDone=true;if(['optional','reserve'].includes(policy))attempt(t,'optional');}
  if(!observed&&t>=eventTime+c.latency){observed=true;log(eventTime+c.latency,'disturbance',`Braking is observed after the ${c.latency.toFixed(2)} s configured response latency.`);}
  if(observed&&!requested){requested=true;const lead=leadAt(t),bumper=lead.x-ego.x-(ego.length+lead.length)/2;
   const choices=[-3.7,3.7].map(d=>{let blocked=false,peak=0,prior={...ego,z:0};for(let age=.02;age<=3;age+=.02){const y=lateral(age,3,d),pose={...ego,x:ego.x+ego.v*age,y:ego.y+y.p,z:0};peak=Math.max(peak,Math.abs(y.a));for(const car of traffic(t+age))if(sweptOverlap(prior,pose,traffic(t+age-.02).find(v=>v.id===car.id),car,c,.3))blocked=true;prior=pose;}return {lateral:d,duration:3,peakAcceleration:peak,ok:!blocked&&peak<=c.brake,reason:blocked?'Occupied steering corridor':'Lateral acceleration / corridor screen only'};});steering={ok:choices.some(x=>x.ok),candidates:choices};
   log(t,'comparison',`Current bumper gap ${bumper.toFixed(2)} m. Ego stop distance after response ${((ego.v**2)/(2*c.brake)).toFixed(2)} m; lead remaining stop distance ${(lead.v**2/16).toFixed(2)} m. Three-second steering ${steering.ok?'passes a corridor screen':'is blocked'}; it is not an executed branch.`);if(policy!=='ground'&&!failed)attempt(t,'emergency');}
  if(step&&!failed){if(flight){// exact-time flight: integrate only the part of this tick after the (possibly off-grid) departure instant
   const q=flight.request,age=Math.min(t-flight.start,q.duration),prevAge=Math.min(q.duration,Math.max(0,t-c.dt-flight.start)),h=age-prevAge,force=c.mass*(c.gravity+vertical((age+prevAge)/2,q.duration,q.height).a),cost=force*h;
   if(h>1e-12&&(force<0||force>c.verticalThrust||force>thrustCap(c,r)||cost>r.impulse+1e-6||h>r.air+1e-8)){failed=airFailure=true;ego.mode='failed';log(t,'failure','Runtime support force or resource limit exceeded.');}
   else{if(h>1e-12)consume(r,cost,h,c);ego.x=flight.origin.x+flight.origin.v*(t-flight.start);const z=vertical(age,q.duration,q.height);ego.z=z.p;ego.vz=z.v;ego.mode=age<.35?'departure':age>q.duration-.35?'touchdown':'airborne';if(t-flight.start+1e-9>=q.duration){ego.z=0;ego.vz=0;ego.mode='recovery';log(flight.start+q.duration,'landed','Nominal vertical touchdown reached; forward speed is continuous.');flight=null;}}}
   else if(!flight){if(observed&&leadAt(t).x>ego.x){const coast=Math.max(0,Math.min(c.dt,eventTime+c.latency-(t-c.dt)));// braking begins exactly one configured latency after onset, not at the next 20 ms tick
    if(coast>1e-12)ego.x+=ego.v*coast;advance(ego,-c.brake,c.dt-coast);}else advance(ego,0,c.dt);ego.mode='ground';}
   for(const car of traffic(t))if(sweptOverlap(prev,ego,traffic(Math.max(0,t-c.dt)).find(v=>v.id===car.id),car,c,0)){failed=true;ego.mode='failed';overlaps++;log(t,'failure',`Occupied-volume contact with ${car.id}; no traffic was cleared.`);break;}
  }
  if(!failed&&arrival===null&&ego.x>=500){arrival=t;log(t,'destination','Local x=500 m destination reached.');}
  if(!lean&&(step%Math.max(1,Math.round(.1/c.dt))===0||events.at(-1)?.t===+t.toFixed(4)))frames.push({t:+t.toFixed(4),ego:{...ego},traffic:traffic(t),resources:{...r},active:flight?{...flight,correction:null}:null});
 }
 return {version:'0.8.0',baseline:BASELINE,config:c,options:{...options,scenario,seed:+seed,policy,intent,emergency:true},frames,events,requests,study:{type:'brake',onset:eventTime,leadBrake:8,initialGap:gap,entrySpeed:speed,observationTime:events.find(e=>e.type==='disturbance')?.t,groundStopMargin:gap+speed**2/(2*8)-(speed*c.latency+speed**2/(2*c.brake)),steering},summary:{policy:names[policy],arrival,progress:ego.x,failed,recoveryFailures:airFailure?1:0,denials,hardBrakes:observed?2:0,overlaps,airUsed:r.usedAir,impulseUsed:r.usedImpulse,remainingImpulse:r.impulse,remainingAir:r.air,backgroundDistance:traffic(28).reduce((s,v)=>s+v.x,0)-traffic(0).reduce((s,v)=>s+v.x,0),classification:failed?'Failed occupied-volume run':'Synthetic translational comparison; safety unresolved'}};
}
// Quintic Hermite boundary-value profile: specified positions, velocities and zero endpoint acceleration.
export function boundary(t,T,d,v0=0,v1=0){const u=Math.max(0,Math.min(1,t/T)),a1=v0*T,A=d-a1,B=v1*T-a1,a3=10*A-4*B,a4=-15*A+7*B,a5=6*A-3*B;return {p:a1*u+a3*u**3+a4*u**4+a5*u**5,v:(a1+3*a3*u*u+4*a4*u**3+5*a5*u**4)/T,a:(6*a3*u+12*a4*u*u+20*a5*u**3)/T**2};}
export function highwayPose(t,q){const n=boundary(t,q.duration,q.north,q.speed,0),e=boundary(t,q.duration,q.east,0,q.speed),up=boundary(t,q.duration,q.deck),bump=vertical(t,q.duration,2);return {x:n.p,y:-e.p,z:up.p+bump.p,vx:n.v,vy:-e.v,vz:up.v+bump.v,ax:n.a,ay:-e.a,az:up.a+bump.a};}
export function screenHighway(q,c,ledger=resources(c)){
 const samples=[];let impulse=0,peak=0,peakVertical=0,peakLateral=0,peakJerk=0,prior=null;const failures=new Set();
 for(let i=0;i<=460;i++){const t=q.duration*i/460,p=highwayPose(t,q),Fz=c.mass*(c.gravity+p.az),horizontal=c.mass*Math.hypot(p.ax,p.ay),F=Math.hypot(Fz,horizontal);if(i)impulse+=F*q.duration/460;peak=Math.max(peak,F);peakVertical=Math.max(peakVertical,Fz);peakLateral=Math.max(peakLateral,horizontal);if(prior)peakJerk=Math.max(peakJerk,Math.hypot(p.ax-prior.ax,p.ay-prior.ay,p.az-prior.az)/(q.duration/460));prior=p;
  if(Fz<0||Fz>c.verticalThrust||horizontal>c.lateralThrust||F>thrustCap(c,{impulse:Math.max(0,ledger.impulse-impulse-c.reserve)}))failures.add('Shared or directional thrust bound exceeded.');if(F/(c.mass*c.gravity)>c.maxLoad)failures.add('Specific-force limit exceeded.');samples.push({t,...p,force:F});}
 if(peakJerk>c.maxJerk)failures.add('Jerk bound exceeded.');if(q.duration>ledger.air)failures.add('Airborne allowance exceeded.');if(impulse+c.reserve>ledger.impulse)failures.add('Insufficient impulse including completion reserve.');
 return {ok:!failures.size,reasons:[...failures],request:q,impulse,peak,peakVertical,peakLateral,peakJerk,peakLoad:peak/(c.mass*c.gravity),samples};
}
export function simulateHighway(options={}){
 const c=vehicle(options.config),r=resources(c),ego=body(c),random=rng(+options.seed||42),frames=[],events=[],requests=[],policy=options.policy||'coordinated',q={speed:22,duration:4.6,north:60,east:60,deck:6,geometry:'north-east'};let requested=false;
 const bridge=[];for(let j=0;j<10;j++)bridge.push({id:`EAST-${j}`,bridge:true,x:170,y:210-j*65,z:6,v:20+random()*3,length:4.7,width:1.9,height:1.5});
 const ground=[];for(let lane of [0,7.4])for(let j=0;j<8;j++)ground.push({id:`NORTH-${lane}-${j}`,x:-180+j*80,y:lane,z:0,v:21+random()*2,length:4.7,width:1.9,height:1.5});
 const traffic=t=>[...ground.map(v=>({...v,x:v.x+v.v*t})),...bridge.map(v=>({...v,y:v.y-v.v*t}))];let proposal;
 events.push({t:0,type:'baseline',message:'Northbound ground highway crosses below an eastbound deck at 6 m. A 90° heading-changing request is assessed; attitude control remains unresolved.'});
 for(let step=0;step<=Math.round(28/c.dt);step++){const t=step*c.dt;ego.x=22*t;
  if(!requested&&t>=5){requested=true;const origin={...ego},screen=screenHighway(q,c),reasons=[...screen.reasons,`Peak horizontal force ${(screen.peakLateral/1000).toFixed(1)} kN vs ${(c.lateralThrust/1000).toFixed(0)} kN lateral allocation; peak total ${(screen.peak/1000).toFixed(1)} kN vs ${(c.thrust/1000).toFixed(0)} kN shared ceiling.`,'A 90° heading change requires a validated yaw/nozzle controller, absent from this model.'];let infrastructure=false,occupied=false;
   for(let i=1;i<screen.samples.length;i++){const a=screen.samples[i-1],b=screen.samples[i],aa={...ego,x:origin.x+a.x,y:origin.y+a.y,z:a.z},bb={...ego,x:origin.x+b.x,y:origin.y+b.y,z:b.z};const deck={x:170,y:-10,z:5.4,length:10,width:240,height:.6};if(sweptOverlap(aa,bb,deck,deck,c,.3))infrastructure=true;for(const car of traffic(t+b.t).filter(v=>v.bridge))if(sweptOverlap(aa,bb,{...car,y:car.y+car.v*(b.t-a.t)},car,c,.7))occupied=true;}
   if(infrastructure)reasons.push('Candidate intersects the elevated deck / its required clearance buffer before touchdown.');if(occupied)reasons.push('Independent eastbound traffic intersects the proposed corridor.');
   proposal={...screen,origin,geometry:q,infrastructureClear:!infrastructure,trafficClear:!occupied};if(policy!=='ground')requests.push({t,kind:'elevated highway transfer',accepted:false,duration:q.duration,impulse:screen.impulse,request:q,origin,reasons,screen,landing:{t:t+q.duration,x:origin.x+q.north,y:origin.y-q.east,z:6,uncertainty:22*c.latency}});
   events.push({t,type:'request',message:'North → east request: 60 m north, 60 m east, +6 m deck elevation and a 90° heading change.'},{t,type:policy==='ground'?'ground-route':'denied',message:policy==='ground'?'Continue north to a conventional interchange. Route length beyond this segment is not modeled.':reasons.join(' ')});
  }
  if(step%Math.max(1,Math.round(.1/c.dt))===0||events.at(-1)?.t===t)frames.push({t:+t.toFixed(4),ego:{...ego},traffic:traffic(t),resources:{...r},active:null});
 }
 return {version:'0.8.0',baseline:BASELINE,config:c,options:{...options,scenario:'highway',policy,emergency:false},frames,events,requests,proposal,layout:{type:'highway',...HIGHWAY},study:{type:'highway',onset:5,requiredHeadingDegrees:90,groundAlternative:'Continue north to a conventional interchange; detour time and length not modeled.'},summary:{policy:names[policy],arrival:null,progress:ego.x,failed:false,recoveryFailures:0,denials:requests.length,hardBrakes:0,overlaps:0,airUsed:0,impulseUsed:0,remainingAir:r.air,remainingImpulse:r.impulse,backgroundDistance:traffic(28).reduce((s,v)=>s+(v.bridge?-v.y:v.x),0)-traffic(0).reduce((s,v)=>s+(v.bridge?-v.y:v.x),0),route:'Northbound; eastbound destination not reached',classification:'Departure denied; heading-changing flight not validated'}};
}
