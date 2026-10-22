import test from 'node:test';
import assert from 'node:assert/strict';
import {sweepRow,runGapSweep,gapGrid,bands,summarize,brakingBoundary,GAPS} from '../src/gapsweep.js';
import {simulate} from '../src/simulation.js';
const rowsFor=(cfg={},gaps=GAPS)=>runGapSweep(cfg,{gaps});
test('default sweep: unavoidable, then rescue, then braking suffices, in that gap order',async()=>{
 const rows=await rowsFor(),b=bands(rows);assert.deepEqual(b.map(x=>x.cls),['unavoidable','rescue','unneeded']);
 const rescue=b[1];assert.ok(rescue.from>=5.5&&rescue.to<brakingBoundary({})+.01,'rescue window ends where braking starts to work');
});
test('replay and analytical stopping margin agree on contact at every gap',async()=>{
 for(const cfg of [{},{latency:.15},{latency:1.2}])for(const r of await rowsFor(cfg,gapGrid(cfg)))assert.equal(r.groundContact,r.margin<0,`gap ${r.gap} margin ${r.margin}`);
});
test('a flight never causes contact where braking would not, and every rescue respects the gates',async()=>{
 for(const cfg of [{},{mass:2300,impulse:80000},{thrust:40000,latency:.6},{mass:1700,impulse:162500,latency:1.2}])for(const r of await rowsFor(cfg,gapGrid(cfg).filter((_,i)=>i%2===0))){
  assert.notEqual(r.cls,'anomaly',`${JSON.stringify(cfg)} gap ${r.gap}`);
  if(r.cls==='rescue'){const c=simulate({scenario:'brake',gap:r.gap,policy:'coordinated',config:cfg}).config;assert.ok(r.impulse+c.reserve<=c.impulse+1e-6);assert.ok(r.peakLoad<=c.maxLoad&&r.jerk<=c.maxJerk&&r.clearance>=.7-1e-9);}
 }
});
test('the grid follows the assumptions and stays bounded',()=>{
 const base=gapGrid({}),slow=gapGrid({latency:1.2});assert.equal(base[0],4);assert.ok(base.at(-1)>=20);assert.ok(slow.at(-1)>=brakingBoundary({latency:1.2})+9);assert.ok(slow.at(-1)<=100);
});
test('lean replay gives identical outcomes to the full replay',()=>{
 for(const gap of [5,8,12,32])for(const policy of ['ground','coordinated']){const o={scenario:'brake',gap,policy,intent:'emergency'},a=simulate(o),b=simulate({...o,lean:true,horizon:14});
  assert.equal(a.summary.failed,b.summary.failed);assert.equal(a.summary.impulseUsed,b.summary.impulseUsed);assert.equal(a.requests[0]?.duration,b.requests[0]?.duration);}
});
test('findings text is derived from the rows and never claims a rescue that is absent',async()=>{
 const none=summarize([sweepRow(32,{}),sweepRow(30,{})].sort((a,b)=>a.gap-b.gap),{});assert.ok(none.some(t=>/No gap in this sweep is rescued/.test(t)));
 const full=summarize(await rowsFor(),{});assert.ok(full.some(t=>/avoids contact that braking cannot/.test(t)));
});
test('invalid inputs are rejected, not clamped',async()=>{
 await assert.rejects(()=>runGapSweep({mass:-1}),/Invalid positive SI parameter/);
 assert.throws(()=>simulate({scenario:'brake',gap:0.5}),/between 1 and 100/);assert.throws(()=>simulate({scenario:'brake',gap:NaN}),/between 1 and 100/);assert.throws(()=>simulate({scenario:'brake',gap:500}),/between 1 and 100/);
});
test('sweep is deterministic',()=>{assert.deepEqual(sweepRow(8,{},42),sweepRow(8,{},42));});
