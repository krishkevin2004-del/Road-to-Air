import {DEFAULT, vehicle,resources,vertical,lateral,requestLateral,thrustCap,stoppingDistance} from './model.js';
export function feasibility(request={}, config=DEFAULT, ledger=resources(config)) {
  const c=vehicle(config), q={speed:22,duration:4,height:2.2,lateral:0,...request}, reasons=[];
  for(const k of ['speed','duration','height','lateral']) if(!Number.isFinite(q[k])) throw Error('Request must contain finite SI values');
  if(q.duration<=0||q.height<=0||q.speed<0) return {ok:false,reasons:['Duration and height must be positive; speed cannot be negative.'],samples:[],impulse:0,request:q};
  if(!Number.isFinite(q.lateralInset??0)||(q.lateralInset??0)<0||2*(q.lateralInset??0)>=q.duration) return {ok:false,reasons:['Lateral staging inset must be non-negative and shorter than half the duration.'],samples:[],impulse:0,request:q};
  let impulse=0,peak=0,peakVertical=0,peakLateral=0,peakLoad=0,peakJerk=0,forceOK=true,previous=null;
  const samples=[],n=Math.ceil(q.duration/0.01),dt=q.duration/n;
  for(let i=0;i<n;i++) {
    const t=(i+0.5)*dt,z=vertical(t,q.duration,q.height),y=requestLateral(t,q);
    const fz=c.mass*(z.a+c.gravity),fy=c.mass*y.a,f=Math.hypot(fz,fy);
    impulse+=f*dt;peak=Math.max(peak,f);peakVertical=Math.max(peakVertical,fz);peakLateral=Math.max(peakLateral,Math.abs(fy));peakLoad=Math.max(peakLoad,f/c.mass/c.gravity);
    if(previous!==null)peakJerk=Math.max(peakJerk,Math.hypot(z.a-previous.a,y.a-previous.b)/dt);previous={a:z.a,b:y.a};
    const cap=thrustCap(c,{impulse:Math.max(0,ledger.impulse-impulse-c.reserve)});
    if(f>cap||fz<0||fz>c.verticalThrust||Math.abs(fy)>c.lateralThrust)forceOK=false;
    samples.push({t,x:q.speed*t,y:y.p,z:z.p,force:f});
  }
  // Midpoint samples miss the endpoints, where this profile's force peaks; evaluate them exactly.
  for(const [te,spent] of [[0,0],[q.duration,impulse]]){const z=vertical(te,q.duration,q.height),y=requestLateral(te,q),fz=c.mass*(z.a+c.gravity),fy=c.mass*y.a,f=Math.hypot(fz,fy);peak=Math.max(peak,f);peakVertical=Math.max(peakVertical,fz);peakLateral=Math.max(peakLateral,Math.abs(fy));peakLoad=Math.max(peakLoad,f/c.mass/c.gravity);if(f>thrustCap(c,{impulse:Math.max(0,ledger.impulse-spent-c.reserve)})||fz<0||fz>c.verticalThrust||Math.abs(fy)>c.lateralThrust)forceOK=false;}
  {const e=1e-4,acc=t=>{const z=vertical(t,q.duration,q.height),y=requestLateral(t,q);return [z.a,y.a];},j=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1])/e;peakJerk=Math.max(peakJerk,j(acc(0),acc(e)),j(acc(q.duration-e),acc(q.duration)));}
  // Within-flight jerk only: the profile starts and ends with a nonzero vertical acceleration, so joining it to ground travel is an acceleration step.
  const transitionStep=Math.max(Math.hypot(vertical(0,q.duration,q.height).a,requestLateral(0,q).a),Math.hypot(vertical(q.duration,q.duration,q.height).a,requestLateral(q.duration,q).a));
  if(!forceOK)reasons.push('Shared thrust / directional allocation exceeded (including bounded end-of-maneuver derating).');
  if(peakLoad>c.maxLoad)reasons.push('Occupant specific-force limit exceeded.');
  if(peakJerk>c.maxJerk)reasons.push('Within-flight jerk limit exceeded.');
  if(q.duration>ledger.air+1e-8)reasons.push('Cumulative airborne allowance exceeded.');
  if(impulse+c.reserve>ledger.impulse+1e-8)reasons.push('Insufficient impulse after mandatory completion reserve.');
  if(ledger.refillStart!==null)reasons.push('Vehicle unavailable during refill.');
  const touchdown=vertical(q.duration,q.duration,q.height);
  return {ok:reasons.length===0,reasons:reasons.length?reasons:['Point-mass force, impulse, duration and nominal touchdown checks pass; traffic gate still required.'],request:q,impulse,gas:impulse/c.exhaustVelocity,reserve:c.reserve,peak,peakVertical,peakLateral,peakLoad,peakJerk,transitionStep,distance:q.speed*q.duration,landingTime:q.duration,verticalTouchdown:touchdown.v,groundStoppingDistance:stoppingDistance(q.speed,c.latency,c.brake),samples};
}
// Swept occupied boxes over each physics step. Returns conservative overlap including buffer.
export function sweptOverlap(a0,a1,b0,b1,c=DEFAULT,buffer=c.buffer) {
  const half=[(a0.length+b0.length)/2+buffer,(a0.width+b0.width)/2+buffer,(a0.height+b0.height)/2+buffer];
  const r0=[a0.x-b0.x,a0.y-b0.y,a0.z+a0.height/2-b0.z-b0.height/2];
  const r1=[a1.x-b1.x,a1.y-b1.y,a1.z+a1.height/2-b1.z-b1.height/2];let lo=0,hi=1;
  for(let k=0;k<3;k++){const d=r1[k]-r0[k];if(Math.abs(d)<1e-12){if(Math.abs(r0[k])>half[k])return false;}else{let t0=(-half[k]-r0[k])/d,t1=(half[k]-r0[k])/d;lo=Math.max(lo,Math.min(t0,t1));hi=Math.min(hi,Math.max(t0,t1));if(lo>hi)return false;}}
  return hi>=0&&lo<=1;
}
export function sweep(c=DEFAULT) {const out=[];for(const mass of [1700,1900,2300])for(const speed of [13.4,22,31.3])for(const duration of [2,4,6,10]){const cc={...c,mass};const f=feasibility({speed,duration},cc,resources(cc));out.push({mass,speed,duration,feasible:f.ok,impulse:f.impulse,distance:f.distance,reasons:f.reasons.join(' ')});}return out;}
