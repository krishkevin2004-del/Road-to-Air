import test from 'node:test';
import assert from 'node:assert/strict';
import {cameraFrame} from '../src/camera.js';
test('close camera makes vehicles readable and leaves network view available',()=>{for(const [width,height] of [[630,580],[350,300],[850,510]]){const input={width,height,ego:{x:140,y:7.4},run:{}};const close=cameraFrame(input),network=cameraFrame({...input,camera:'overhead'});assert.ok(close.scale>network.scale*2);assert.ok(close.scale*4.6>16);}});
test('zoom is bounded and camera framing does not mutate the replay',()=>{const run={frames:[{t:5,ego:{x:100,y:7.4}}],requests:[{t:5,landing:{x:192,y:19}}]},before=JSON.stringify(run);const input={width:630,height:580,camera:'maneuver',ego:{x:160,y:13},run};const view=cameraFrame(input);assert.equal(view.cx,176);assert.equal(view.cy,13.2);assert.equal(cameraFrame({...input,zoom:100}).scale,view.scale*2);assert.equal(cameraFrame({...input,zoom:0}).scale,view.scale*.65);assert.equal(JSON.stringify(run),before);});
