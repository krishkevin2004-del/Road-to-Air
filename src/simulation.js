import {simulateBrake,simulateHighway} from './situations.js';
import {simulateExit} from './interchange.js';
import {BASELINE,DEFAULT,vehicle,resources,consume,clamp,smooth,rng,vertical,lateral,thrustCap,stoppingDistance} from './model.js';
import {feasibility,sweptOverlap} from './physics.js';
export const POLICIES = {ground:'Ground only',coordinated:'Coordinated aerial',optional:'Optional → emergency',reserve:'Reserve first',onboard:'Onboard only'};
export const SCENARIOS = {priorUse:'Recreation now · emergency later',brake:'Sudden lead braking · adequate gap',brakeTight:'Sudden lead braking · critical gap',highway:'North → east · elevated highway',exit:'Missed exit · airport connector',exitBlocked:'Missed exit · blocked connector',early:'Legacy recovery test · early cut-in',late:'Legacy recovery test · late cut-in',clear:'Clear corridor · matched emergency',blocked:'Occupied landing · departure denied',degraded:'Reduced shared thrust'};
const body=(c)=>({length:c.length,width:c.width,height:c.bodyHeight});
function initialTraffic(seed,c,scenario) {
  const random=rng(seed), cars=[];
  // Same random stream and exogenous schedule for all policies. Positions are never cleared for flight.
  for(let lane=0;lane<3;lane++)for(let j=0;j<5;j++) {
    const x=-120+j*100+(lane===1?65:10),truck=lane===2&&j===3;
    cars.push({id:`T${lane}${j}`,x,y:lane*c.laneWidth,z:0,v:20+random()*4,desired:22+random()*3,a:0,length:truck?11:4.7,width:truck?2.5:1.9,height:truck?3.8:1.5,truck,headway:1.2+random()*0.8,reaction:0.4+random()*0.5,next:0,hard:false});
  }
  // Independent lane-change disturbance. Longitudinal position evolves with traffic, not ego position.
  cars.push({id:'CUT',x:20,y:0,z:0,v:18,desired:18,a:0,length:4.7,width:1.9,height:1.5,headway:1.4,reaction:.6,next:0,hard:false});
  if(scenario==='blocked')cars.push({id:'ZONE',x:155,y:c.laneWidth,z:0,v:0,desired:0,a:0,length:5,width:2,height:1.6,headway:1.5,reaction:.5,next:0,static:true});
  return cars;
}
function changeStart(scenario){return scenario==='early'?3.2:scenario==='late'?6.5:Infinity;}
function forecast(car,age,t,c,scenario,knownCut) {
  const p={...car,x:car.x+car.v*age};
  if(car.id==='CUT'&&knownCut)p.y=c.laneWidth*smooth((t+age-changeStart(scenario))/0.9);
  return p;
}
function trafficGate(f,ego,cars,t,c,scenario,knownCut,from=0,origin=null) {
  const o=origin||ego, dt=.04;
  for(let age=from;age<=f.request.duration+0.6;age+=dt) {
    const u=Math.min(age,f.request.duration), z=vertical(u,f.request.duration,f.request.height),y=lateral(u,f.request.duration,f.request.lateral);
    const e={...ego,x:o.x+f.request.speed*age,y:o.y+y.p,z:z.p};
    for(const car of cars){const p=forecast(car,age-from,t,c,scenario,knownCut);if(sweptOverlap(e,e,p,p,c,0.7))return {ok:false,reason:`Predicted occupied corridor / recovery window: ${car.id}.`};}
  }
  const landX=o.x+f.request.speed*f.request.duration,landY=o.y+f.request.lateral;
  for(const car of cars){const p=forecast(car,f.request.duration-from,t,c,scenario,knownCut),gap=p.x-landX-(ego.length+p.length)/2;
    const recovery=2+f.request.speed*c.latency+Math.max(0,(f.request.speed**2-p.v**2)/(2*c.brake));
    if(Math.abs(p.y-landY)<(ego.width+p.width)/2+.3&&p.x>landX&&gap<recovery)return {ok:false,reason:`Post-landing braking envelope occupied by ${car.id}: ${gap.toFixed(1)} m gap < ${recovery.toFixed(1)} m required.`};
  }
  return {ok:true,reason:'Predicted corridor and 0.6 s landing recovery window clear. Forecast is not a reservation.'};
}
export function simulate(options={}) {
  const {seed=42,scenario='early',policy='optional',intent='convenience',emergency=true,consent=true}=options;
  if(!Object.hasOwn(POLICIES,policy)||!Object.hasOwn(SCENARIOS,scenario)||!Number.isInteger(+seed))throw Error('Invalid scenario, policy or seed');
  if(scenario==='brake'||scenario==='brakeTight'||scenario==='priorUse')return simulateBrake({...options,scenario,policy,seed:+seed});
  if(scenario==='highway')return simulateHighway({...options,scenario,policy,seed:+seed});
  if(scenario==='exit'||scenario==='exitBlocked')return simulateExit({...options,scenario,policy,seed:+seed});
  const c=vehicle({...options.config,...(scenario==='degraded'?{thrust:26000,verticalThrust:24000}:{})}),dt=c.dt;
  const r=resources(c), cars=initialTraffic(+seed,c,scenario), ego={id:'R',x:0,y:c.laneWidth,z:0,v:22,vz:0,vy:0,a:0,desired:22,length:c.length,width:c.width,height:c.bodyHeight,headway:1.4,reaction:c.latency,next:0,mode:'ground'};
  let flight=null, optionalDone=false,emergencyDone=false,failed=false,arrival=null,correctionTried=false,denials=0,hardBrakes=0,overlaps=0,cutSeen=false,hazard=false;
  const events=[],frames=[],requests=[],conflicts=new Set();
  const log=(t,type,message)=>events.push({t:+t.toFixed(3),type,message});
  log(0,'baseline','B1 · nitrogen · cumulative 10 s · full refill takes 6 h. Synthetic traffic; no real-world safety conclusion.');
  function attempt(t,kind) {
    const duration=kind==='optional'?4.6:4, q={duration,height:3,speed:ego.v,lateral:0};
    const f=feasibility(q,c,r);const gate=trafficGate(f,ego,cars,t,c,scenario,cutSeen);
    const reasons=[...(!f.ok?f.reasons:[]),...(!gate.ok?[gate.reason]:[])];
    if(kind==='optional'&&policy==='reserve'&&r.impulse-f.impulse-c.reserve<c.futureReserve)reasons.push('Future-event reserve policy declines optional use. Completion reserve remains mandatory.');
    if(kind==='optional'&&policy==='optional'&&!consent)reasons.push('Optional future-allocation consent not enabled.');
    if(ego.mode!=='ground'&&ego.mode!=='recovery')reasons.push('Vehicle is not available for ground departure.');
    const accepted=!reasons.length;
    requests.push({t,kind,accepted,impulse:f.impulse,duration,request:q,origin:{...ego},reasons:accepted?[gate.reason]:reasons,landing:{t:t+duration,x:ego.x+ego.v*duration,y:ego.y,uncertainty:ego.v*c.latency}});
    if(!accepted){denials++;log(t,'denied',`${kind}: ${reasons.join(' ')}`);return false;}
    log(t,'approved',`${kind}: ${(f.impulse/1000).toFixed(1)} kN·s planned; ${(c.reserve/1000).toFixed(0)} kN·s completion reserve held. Landing forecast ±${(ego.v*c.latency).toFixed(1)} m.`);
    flight={start:t,origin:{...ego},f,used:0,correction:null};correctionTried=false;ego.mode='departure';return true;
  }
  function correct(t) {
    if(!flight||correctionTried)return;correctionTried=true;
    const age=t-flight.start,remaining=flight.f.request.duration-age,target=0,d=target-ego.y;
    let cost=0,valid=remaining>0.4,reason=''; const n=Math.max(1,Math.ceil(remaining/.01));
    for(let i=0;i<n;i++){
      const tau=(i+.5)*remaining/n,z=vertical(age+tau,flight.f.request.duration,flight.f.request.height),y=lateral(tau,remaining,d);
      const fz=c.mass*(z.a+c.gravity),fy=c.mass*y.a,f=Math.hypot(fz,fy);cost+=f*remaining/n;
      if(f>thrustCap(c,{impulse:Math.max(0,r.impulse-cost-c.reserve)})||Math.abs(fy)>c.lateralThrust||fz>c.verticalThrust||fz<0||f/c.mass/c.gravity>c.maxLoad||Math.abs(d)*60/remaining**3>c.maxJerk)valid=false;
      const e={...ego,x:ego.x+ego.v*tau,y:ego.y+y.p,z:z.p};
      for(const car of cars){const p=forecast(car,tau,t,c,scenario,true);if(sweptOverlap(e,e,p,p,c,.7))valid=false;}
    }
    if(cost+c.reserve>r.impulse||remaining>r.air)valid=false;
    if(valid){flight.correction={start:t,d,origin:ego.y,duration:remaining};log(t,'correction',`Reachable alternative: lane 1, ${remaining.toFixed(2)} s to touchdown; revised future impulse ${(cost/1000).toFixed(1)} kN·s.`);}
    else {reason='No tested lateral recovery satisfies force, jerk, corridor and reserve gates; nominal path continues, recovery failure recorded.';log(t,'unrecoverable',reason);flight.unrecoverable=true;}
  }
  for(let step=0;step<=Math.round(28/dt);step++) {
    const t=step*dt,prevE={...ego},previous=cars.map(x=>({...x}));
    if(!cutSeen&&t>=changeStart(scenario)+c.latency){cutSeen=true;log(t,'disturbance','Cut-in observed after detection / decision latency. Landing prediction is stale.');if(flight)correct(t);}
    if(!hazard&&emergency&&t>=14){hazard=true;cars.push({id:'HAZARD',x:335,y:c.laneWidth,z:0,v:0,desired:0,a:0,length:4.7,width:1.9,height:1.5,static:true});log(t,'hazard','Scripted stopped car becomes observable at x = 335 m; identical time and location across policies.');}
    if(!optionalDone&&t>=3){optionalDone=true;if(['optional','reserve'].includes(policy))attempt(t,'optional');else if(policy==='onboard')attempt(t,'optional');}
    if(!emergencyDone&&hazard&&!failed&&t>=14+c.latency){emergencyDone=true;
      const gap=335-ego.x-(ego.length+4.7)/2,stop=stoppingDistance(ego.v,0,c.brake);
      const peakSteer=5.773503*c.laneWidth/9; // ground steering alternative screened over complete three-second corridor
      let clear=true;for(let age=0;age<=3;age+=.05){const e={...ego,x:ego.x+ego.v*age,y:ego.y+lateral(age,3,-c.laneWidth).p};for(const car of cars) {const p=forecast(car,age,t,c,scenario,true);if(sweptOverlap(e,e,p,p,c,.7))clear=false;}}
      log(t,'comparison',`Ground braking needs ${stop.toFixed(1)} m after response; measured bumper gap ${gap.toFixed(1)} m. Three-second ground steering: ${clear&&peakSteer<c.brake?'corridor passes screening':'blocked / outside envelope'}. Steering is a bound, not an executed branch.`);
      if(policy!=='ground')attempt(t,'emergency');
    }
    // Per-driver decision intervals are held separately from physics dt. Synchronous update avoids policy-dependent iteration ordering.
    const all=[...cars,...(!flight&&!failed?[ego]:[])],acc=new Map();
    for(const car of all){
      if(car.static){acc.set(car.id,0);continue;}
      if(t+1e-9>=car.next){
        let lead=null,gap=Infinity;
        for(const other of all)if(other.id!==car.id&&other.x>car.x&&Math.abs(other.y-car.y)<(other.width+car.width)/2+.15){const g=other.x-car.x-(other.length+car.length)/2;if(g<gap){gap=g;lead=other;}}
        const aMax=1.5,b=2.5,v0=Math.max(.1,car.desired),dv=lead?car.v-lead.v:0;
        const wanted=2+Math.max(0,car.v*car.headway+car.v*dv/(2*Math.sqrt(aMax*b)));
        let a=aMax*(1-(car.v/v0)**4-(lead?(wanted/Math.max(.2,gap))**2:0));
        if(car.id==='R'&&hazard&&t<14+c.latency)a=car.a; // explicitly model ego detection latency
        car.a=clamp(a,-(car.id==='R'?c.brake:7),aMax);car.next=t+car.reaction;
        if(car.a<-4&&!car.hard){hardBrakes++;car.hard=true;}
      }acc.set(car.id,car.a);
    }
    if(step>0){
      for(const car of cars)if(!car.static){const a=acc.get(car.id)||0,untilStop=a<0?Math.min(dt,car.v/-a):dt;car.x+=car.v*untilStop+.5*a*untilStop**2;car.v=Math.max(0,car.v+a*dt);}
      if(!failed){
        if(flight&&t-flight.start>dt/2){
          const age=t-flight.start,q=flight.f.request,mid=Math.max(0,age-dt/2),z=vertical(mid,q.duration,q.height);
          let ay=0;if(flight.correction)ay=lateral(t-flight.correction.start-dt/2,flight.correction.duration,flight.correction.d).a;
          const force=Math.hypot(c.mass*(z.a+c.gravity),c.mass*ay),cost=force*dt;
          if(cost>r.impulse||dt>r.air||force>thrustCap(c,r)+1){failed=true;ego.mode='failed';log(t,'failure','Runtime physical limit violated; trajectory terminated.');}
          else{
            consume(r,cost,dt,c);flight.used+=cost;
            ego.x+=ego.v*dt;ego.y+=ego.vy*dt+.5*ay*dt**2;ego.vy+=ay*dt;ego.z+=ego.vz*dt+.5*z.a*dt**2;ego.vz+=z.a*dt;
            ego.mode=age<.35?'departure':age>q.duration-.35?'touchdown':'airborne';
            if(age+1e-8>=q.duration){
              if(Math.abs(ego.z)>.04||Math.abs(ego.vz)>.08||Math.abs(ego.vy)>.08||r.impulse<c.reserve-1){failed=true;ego.mode='failed';log(t,'failure','Touchdown state or completion reserve outside limits.');}
              else{log(t,flight.unrecoverable?'recovery-failed':'landed',`Touchdown z error ${ego.z.toFixed(3)} m, vertical speed ${ego.vz.toFixed(3)} m/s; no speed reset. ${flight.unrecoverable?'Recovery failure remains in result.':''}`);ego.z=0;ego.vz=0;ego.vy=0;ego.mode='recovery';ego.next=t;}
              flight=null;
            }
          }
        }else if(!flight){const a=acc.get('R')||0,untilStop=a<0?Math.min(dt,ego.v/-a):dt;ego.x+=ego.v*untilStop+.5*a*untilStop**2;ego.v=Math.max(0,ego.v+a*dt);if(ego.mode==='recovery'&&t-requests.at(-1).landing.t>.6)ego.mode='ground';}
      }
    }
    const cut=cars.find(x=>x.id==='CUT');cut.y=c.laneWidth*smooth((t-changeStart(scenario))/.9);
    // Full 3D check includes airborne ego; removing lane occupancy never removes the conflict volume.
    for(let a=0;a<cars.length;a++)for(let b=a+1;b<cars.length;b++){
      const p=cars[a],q=cars[b],key=[p.id,q.id].sort().join('|');
      if(!conflicts.has(key)&&sweptOverlap(previous.find(x=>x.id===p.id)||p,p,previous.find(x=>x.id===q.id)||q,q,c,0)){conflicts.add(key);overlaps++;log(t,'traffic-conflict',`Background occupied-volume overlap: ${key}; contact dynamics not modeled.`);}
    }
    if(!failed&&step>0)for(const car of cars)if(sweptOverlap(prevE,ego,previous.find(x=>x.id===car.id)||car,car,c,0)){
      failed=true;ego.mode='failed';overlaps++;log(t,'failure',`Occupied-volume contact with ${car.id}; ego trajectory terminated. No manufactured landing gap.`);break;
    }
    if(arrival===null&&!failed&&ego.x>=500)arrival=t;
    if(step%Math.max(1,Math.round(.1/dt))===0||events.at(-1)?.t===+t.toFixed(3))frames.push({t:+t.toFixed(3),ego:{...ego},traffic:cars.map(x=>({...x})),resources:{...r},active:flight?{start:flight.start,origin:flight.origin,request:flight.f.request,correction:flight.correction}:null});
  }
  const recoveries=events.filter(e=>e.type==='unrecoverable').length;
  return {version:'0.1.0',baseline:BASELINE,options:{...options,seed:+seed,scenario,policy,intent,emergency,consent},config:c,frames,events,requests,summary:{policy:POLICIES[policy],arrival,progress:ego.x,failed,recoveryFailures:recoveries,denials,hardBrakes,overlaps,airUsed:r.usedAir,impulseUsed:r.usedImpulse,remainingImpulse:r.impulse,remainingAir:r.air,backgroundDistance:cars.reduce((s,x)=>s+x.x,0)-initialTraffic(+seed,c,scenario).reduce((s,x)=>s+x.x,0)-(hazard?335:0),classification:failed||recoveries||overlaps?'Infeasible within this tested run':'Within translational study assumptions; attitude, plume and real-road safety unresolved'}};
}
export function matched(options={}){return Object.keys(POLICIES).map(policy=>simulate({...options,policy}));}
