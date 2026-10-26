import {BASELINE,DEFAULT,vehicle,resources,consume,rng,smooth,lateral,requestLateral,vertical,clamp,thrustCap} from './model.js';
import {feasibility,sweptOverlap} from './physics.js';
// A synthetic connector, not a reconstruction of the supplied interchange photograph.
export const EXIT = Object.freeze({requestTime:5, missedMarker:80, rampY:19, lane:7.4, duration:4.6, apex:3, destinationX:500, detourMeters:1800});
export function rampY(x){return 7.4+11.6*smooth((x+30)/100);}
export function interchangeObstacles(){return [
  {id:'MAIN-RAIL',x:230,y:9.45,z:0,length:300,width:.4,height:1},
  {id:'RAMP-RAIL',x:230,y:16.95,z:0,length:300,width:.4,height:1},
  {id:'BRIDGE-DECK',x:300,y:0,z:5.4,length:10,width:220,height:.6},
  {id:'PIER-A',x:300,y:-13,z:0,length:2,width:2,height:5.4},
  {id:'PIER-B',x:300,y:31,z:0,length:2,width:2,height:5.4}
];}
function population(seed,c,blocked){const random=rng(seed),cars=[];for(let lane=0;lane<4;lane++)for(let j=0;j<5;j++){
  const x=-140+j*135+(lane===3?35:lane*14),truck=lane===1&&j===3;
  const spawn=!(lane===3&&j===0);// the first ramp car would start on the mainline lane-2 centreline, 7 m ahead of I2-0, and be run into
  const car={id:`I${lane}-${j}`,x,y:lane===3?rampY(x):lane*c.laneWidth,z:0,v:21+random()*2,desired:22+random()*2,a:0,lane,truck,length:truck?11:4.7,width:truck?2.5:1.9,height:truck?3.8:1.5,next:0,reaction:.4+random()*.4,headway:1.3+random()*.5,hard:false};if(spawn)cars.push(car);
}if(blocked)cars.push({id:'BLOCKED-RAMP',x:211.2,y:19,z:0,v:0,desired:0,a:0,lane:3,length:7,width:2.1,height:2.3,static:true});return cars;}
function future(car,dt){if(car.bridge)return {...car,y:car.y+car.v*dt};return {...car,x:car.x+car.v*dt,y:car.lane===3?rampY(car.x+car.v*dt):car.y};}
export function exitGate(q,origin,cars,c,obstacles=interchangeObstacles()){
  const state=(age)=>{const u=Math.min(age,q.duration);return {...origin,x:origin.x+q.speed*age,y:origin.y+requestLateral(u,q).p,z:vertical(u,q.duration,q.height).p};};
  let previous=state(0);
  for(let age=.02;age<=q.duration+.6+1e-7;age+=.02){const e=state(age);
    for(const car of cars)if(sweptOverlap(previous,e,future(car,age-.02),future(car,age),c,.7))return {ok:false,reason:`Exit connector occupied by ${car.id}; forecast gate denies transfer.`};
    for(const obstacle of obstacles)if(sweptOverlap(previous,e,obstacle,obstacle,c,.3))return {ok:false,reason:`Trajectory intersects ${obstacle.id}; geometry gate denies transfer.`};previous=e;
  }
  const land=state(q.duration);
  for(const car of cars){const p=future(car,q.duration);if(Math.abs(p.y-land.y)<2.5&&p.x>land.x){const gap=p.x-land.x-(p.length+land.length)/2,need=2+q.speed*c.latency+Math.max(0,(q.speed**2-p.v**2)/(2*c.brake));if(gap<need)return {ok:false,reason:`Exit recovery braking envelope occupied by ${car.id}.`};}}
  return {ok:true,reason:'Connector, median barriers, overhead deck and landing recovery envelope pass the modeled checks. Traffic remains independent.'};
}
export function simulateExit(options={}){
  const {seed=42,policy='optional',scenario='exit',consent=true}=options,c=vehicle(options.config),r=resources(c),cars=population(+seed,c,scenario==='exitBlocked'),obstacles=interchangeObstacles();
  const ego={id:'R',x:0,y:EXIT.lane,z:0,v:22,vz:0,vy:0,a:0,desired:22,lane:2,length:c.length,width:c.width,height:c.bodyHeight,headway:1.4,reaction:c.latency,next:0,mode:'ground'};
  const deckSeed=rng((+seed)^0x73fa9);const bridgeCars=[];for(let lane=0;lane<3;lane++)for(let j=0;j<8;j++)bridgeCars.push({id:`B${lane}-${j}`,bridge:true,x:296.7+lane*3.3,y:-460+j*80+lane*17,z:6,v:20+deckSeed()*2,length:j===3?10:4.7,width:j===3?2.4:1.9,height:j===3?3:1.5,truck:j===3});
  const bridgeAt=t=>bridgeCars.map(car=>({...car,y:car.y+car.v*t}));
  const frames=[],events=[],requests=[],conflicts=new Set();let flight=null,requested=false,missed=false,failed=false,arrival=null,denials=0,hardBrakes=0,overlaps=0,onExit=false;
  const log=(t,type,message)=>events.push({t:+t.toFixed(3),type,message});
  log(0,'baseline','B1 unchanged. Exit 17 serves airport access. Mainline and connector are parallel at the proposed touchdown; no attitude change is assumed.');
  for(let step=0;step<=Math.round(28/c.dt);step++){
    const t=step*c.dt,dt=c.dt,prior={...ego},previous=cars.map(v=>({...v}));
    if(!missed&&ego.x>=EXIT.missedMarker){missed=true;log(t,'missed-exit','Exit 17 passed. Ground route continues to the next exit; assumed additional route distance 1.8 km. Time sensitivity does not relax maneuver gates.');}
    if(!requested&&t>=EXIT.requestTime){requested=true;
      if(policy==='ground'){log(t,'ground-route','Remain on mainline and use the next legal exit. The detour is outside this local simulation.');}
      else{
        const q={speed:ego.v,duration:EXIT.duration,height:EXIT.apex,lateralInset:.5,lateral:EXIT.rampY-ego.y},f=feasibility(q,c,r),gate=exitGate(q,ego,[...cars,...bridgeAt(t)],c,obstacles),reasons=[...(!f.ok?f.reasons:[]),...(!gate.ok?[gate.reason]:[])];
        if(policy==='reserve'&&r.impulse-f.impulse-c.reserve<c.futureReserve)reasons.push('Future-event reserve policy preserves the later allocation and declines this convenience transfer.');
        if(policy==='optional'&&!consent)reasons.push('Optional future-allocation consent not enabled.');
        const accepted=!reasons.length;
        requests.push({t,kind:'missed-exit transfer',accepted,impulse:f.impulse,duration:q.duration,request:q,origin:{...ego},reasons:accepted?[gate.reason]:reasons,landing:{t:t+q.duration,x:ego.x+ego.v*q.duration,y:EXIT.rampY,uncertainty:ego.v*c.latency}});
        log(t,accepted?'approved':'denied',accepted?`Exit 17 transfer: ${q.lateral.toFixed(1)} m lateral, ${q.duration.toFixed(1)} s airborne, ${(f.impulse/1000).toFixed(1)} kN·s plus ${(c.reserve/1000).toFixed(0)} kN·s completion reserve. ${gate.reason}`:reasons.join(' '));
        if(accepted){flight={start:t,origin:{...ego},request:q};ego.mode='departure';}else denials++;
      }
    }
    const all=[...cars,...(!flight&&!failed?[ego]:[])];
    for(const car of all){if(car.static)continue;if(t+1e-8>=car.next){let lead=null,gap=Infinity;for(const other of all)if(other!==car&&other.lane===car.lane&&other.x>car.x){const d=other.x-car.x-(other.length+car.length)/2;if(d<gap){gap=d;lead=other;}}const dv=lead?car.v-lead.v:0,wanted=2+Math.max(0,car.v*car.headway+car.v*dv/(2*Math.sqrt(1.5*2.5)));car.a=clamp(1.5*(1-(car.v/car.desired)**4-(lead?(wanted/Math.max(.2,gap))**2:0)),-(car.id==='R'?c.brake:7),1.5);car.next=t+car.reaction;if(car.a<-4&&!car.hard){hardBrakes++;car.hard=true;}}}
    if(step>0){for(const car of cars){if(car.static)continue;const sub=car.a<0?Math.min(dt,car.v/-car.a):dt;car.x+=car.v*sub+.5*car.a*sub**2;car.v=Math.max(0,car.v+car.a*dt);if(car.lane===3)car.y=rampY(car.x);}
      if(!failed){if(flight&&t-flight.start>dt/2){const age=t-flight.start,q=flight.request,mid=age-dt/2,az=vertical(mid,q.duration,q.height).a,ay=requestLateral(mid,q).a,Fz=c.mass*(az+c.gravity),Fy=c.mass*ay,force=Math.hypot(Fz,Fy),cost=force*dt;
        if(cost>r.impulse||dt>r.air+1e-8||force>thrustCap(c,r)+1||Fz>c.verticalThrust||Math.abs(Fy)>c.lateralThrust){failed=true;ego.mode='failed';log(t,'failure','Runtime force or resource limit exceeded; transfer terminated.');}
        else{consume(r,cost,dt,c);ego.x+=ego.v*dt;ego.y+=ego.vy*dt+.5*ay*dt**2;ego.vy+=ay*dt;ego.z+=ego.vz*dt+.5*az*dt**2;ego.vz+=az*dt;ego.mode=age<.35?'departure':age>q.duration-.35?'touchdown':'airborne';
          if(age+1e-8>=q.duration){if(Math.abs(ego.z)>.04||Math.abs(ego.vz)>.08||Math.abs(ego.vy)>.08||Math.abs(ego.y-EXIT.rampY)>.04||r.impulse<c.reserve){failed=true;ego.mode='failed';log(t,'failure','Connector touchdown state or completion reserve outside limits.');}
            else{onExit=true;ego.lane=3;ego.z=0;ego.vz=0;ego.vy=0;ego.mode='recovery';ego.next=t;log(t,'landed',`Exit 17 connector reached at ${ego.v.toFixed(1)} m/s; lateral and vertical speeds within touchdown limits. No forward speed reset.`);}flight=null;}
        }
      }else if(!flight){const sub=ego.a<0?Math.min(dt,ego.v/-ego.a):dt;ego.x+=ego.v*sub+.5*ego.a*sub**2;ego.v=Math.max(0,ego.v+ego.a*dt);if(onExit)ego.y=rampY(ego.x);if(ego.mode==='recovery'&&t-requests.at(-1).landing.t>.6)ego.mode='ground';}else ego.x+=ego.v*dt;}// request tick: keep cruising with the traffic (the screen used the same tick's state for ego and cars)
    }
    for(let i=0;i<cars.length;i++)for(let j=i+1;j<cars.length;j++){const a=cars[i],b=cars[j],key=[a.id,b.id].join('|');if(!conflicts.has(key)&&sweptOverlap(previous[i],a,previous[j],b,c,0)){conflicts.add(key);overlaps++;log(t,'traffic-conflict',`Background overlap: ${key}; contact response unresolved.`);}}
    if(!failed&&step>0)for(const other of [...cars,...obstacles,...bridgeAt(t)]){const prev=other.bridge?{...other,y:other.y-other.v*dt}:previous.find(x=>x.id===other.id)||other;if(sweptOverlap(prior,ego,prev,other,c,0)){failed=true;ego.mode='failed';overlaps++;log(t,'failure',`Occupied-volume contact with ${other.id}; transfer terminated.`);break;}}
    if(arrival===null&&!failed&&onExit&&ego.x>=EXIT.destinationX){arrival=t;log(t,'destination','Airport connector destination reached. The modeled road segment ends here.');}
    if(step%Math.max(1,Math.round(.1/dt))===0||events.at(-1)?.t===+t.toFixed(3))frames.push({t:+t.toFixed(3),ego:{...ego},traffic:[...cars.map(v=>({...v})),...bridgeAt(t)],resources:{...r},active:flight?{...flight,correction:null}:null});
  }
  return {version:'0.2.0',baseline:BASELINE,options:{...options,scenario,policy,seed:+seed,emergency:false},config:c,layout:{type:'interchange',exit:EXIT,obstacles},frames,events,requests,summary:{policy:{ground:'Ground route / next exit',coordinated:'Forecast-assisted transfer',optional:'Optional exit transfer',reserve:'Reserve first',onboard:'Onboard-only transfer'}[policy],arrival,progress:ego.x,failed,recoveryFailures:0,denials,hardBrakes,overlaps,airUsed:r.usedAir,impulseUsed:r.usedImpulse,remainingImpulse:r.impulse,remainingAir:r.air,backgroundDistance:cars.reduce((sum,v)=>sum+v.x,0)-population(+seed,c,scenario==='exitBlocked').reduce((sum,v)=>sum+v.x,0),route:onExit?'Exit 17 connector':'Mainline · next exit required',additionalGroundRouteMeters:onExit?0:EXIT.detourMeters,classification:failed||overlaps?'Infeasible within this tested run':'Translational screening only; attitude, jets and public-road permission unresolved'}};
}
