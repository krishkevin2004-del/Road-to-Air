// SI throughout. B1 is intentionally not configurable by the scenario editor.
export const BASELINE = Object.freeze({version:'B1', medium:'Compressed nitrogen', airborneSeconds:10, refillSeconds:21600, tankLiters:600});
export const DEFAULT = Object.freeze({mass:1900, thrust:80000, verticalThrust:55000, lateralThrust:18000, impulse:125000, exhaustVelocity:500, reserve:12000, futureReserve:72000, latency:0.35, gravity:9.81, maxLoad:3, maxJerk:35, brake:7.5, length:4.8, width:2, bodyHeight:1.25, buffer:0.3, laneWidth:3.7, dt:0.02});
export const RANGES = {mass:[1700,2300], thrust:[25000,80000], verticalThrust:[20000,65000], lateralThrust:[5000,25000], impulse:[80000,162500], latency:[0.15,1.2]};
export function vehicle(overrides={}) {
  const c={...DEFAULT,...overrides};
  for(const k of Object.keys(DEFAULT)) if(!Number.isFinite(c[k]) || c[k]<=0) throw Error(`Invalid positive SI parameter: ${k}`);
  return c;
}
export function resources(c=DEFAULT) {return {air:BASELINE.airborneSeconds, impulse:c.impulse, gas:c.impulse/c.exhaustVelocity, usedImpulse:0, usedAir:0, refillStart:null};}
export function consume(r, impulse, seconds, c=DEFAULT) {
  if(!Number.isFinite(impulse)||!Number.isFinite(seconds)||impulse<0||seconds<0||impulse>r.impulse+1e-6||seconds>r.air+1e-6) throw Error('Resource budget exceeded');
  r.impulse=Math.max(0,r.impulse-impulse); r.air=Math.max(0,r.air-seconds);r.gas=r.impulse/c.exhaustVelocity;r.usedImpulse+=impulse;r.usedAir+=seconds;
}
export function startRefill(r,now) {if(!Number.isFinite(now)||now<0)throw Error('Invalid clock'); if(r.refillStart===null) r.refillStart=now;}
export function refill(r,now,c=DEFAULT) {if(r.refillStart!==null&&now-r.refillStart>=BASELINE.refillSeconds) {Object.assign(r,resources(c));return true;}return false;}
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const smooth=u=>{u=clamp(u,0,1);return u*u*u*(10+u*(-15+6*u));};
// Smooth finite-displacement correction, no instantaneous velocity change.
export function lateral(t,T,d) {let u=clamp(t/T,0,1);return {p:d*smooth(u),v:d*30*u*u*(1-u)*(1-u)/T,a:d*60*u*(1-u)*(1-2*u)/(T*T)};}
export function vertical(t,T,h) {const u=clamp(t/T,0,1);return {p:16*h*u*u*(1-u)*(1-u),v:32*h*u*(1-u)*(1-2*u)/T,a:32*h*(1-6*u+6*u*u)/(T*T)};}
export function thrustCap(c,r) {return c.thrust*(0.6+0.4*clamp(r.impulse/c.impulse,0,1));} // bounded derating assumption, not a gas thermodynamic model
export function stoppingDistance(v,latency,brake) {return v*latency+v*v/(2*brake);}
export function rng(seed) {let a=seed>>>0;return ()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}

export function requestLateral(t,q){const inset=q.lateralInset??0;return lateral(t-inset,q.duration-2*inset,q.lateral);}
