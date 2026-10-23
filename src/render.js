import {vertical,lateral,requestLateral,clamp} from './model.js';
import {ROADSTER} from './vehicle-design.js';
import {drawHighway} from './highway-render.js';
import {cameraFrame} from './camera.js';
import {rampY} from './interchange.js';
function surface(canvas){const dpr=Math.min(devicePixelRatio||1,canvas.clientWidth<600?1.5:2),w=canvas.clientWidth,h=canvas.clientHeight;if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);return {ctx,w,h,dpr};}
const sceneryCache=new WeakMap();
const altitudeCache=new WeakMap();
export const renderStats={sceneryBuilds:0,sceneFrames:0,lastFrameMs:0,maxFrameMs:0};
const hash=(x,y)=>{let a=Math.sin(x*127.1+y*311.7)*43758.5453;return a-Math.floor(a);};
export function drawScene(canvas,frame,run,camera,time,zoom=1){
  if(run.layout?.type==='highway'){const t=performance.now();drawHighway(canvas,frame,run,camera,time,zoom);renderStats.lastFrameMs=performance.now()-t;renderStats.sceneFrames++;return;}
  const started=performance.now();const surf=surface(canvas);let {ctx}=surf;const {w,h,dpr}=surf,ego=frame.ego,isExit=run.layout?.type==='interchange',side=camera==='side',overhead=camera==='overhead';
  const view=cameraFrame({width:w,height:h,camera,ego,run,zoom}),{scale,cx,cy,theta,zScale}=view;
  let projectCx=cx,pad=0;
  const cos=Math.cos(theta),sin=Math.sin(theta);
  const p=(x,y,z=0)=>side?({x:pad+w*.5+(x-projectCx)*scale,y:pad+h*.64+(y-cy)*.35-z*18}):({x:pad+w*.5+((x-projectCx)*cos-(y-cy)*sin)*scale,y:pad+h*.52+((x-projectCx)*sin+(y-cy)*cos)*scale-z*zScale});
  const poly=(v,fill,stroke,width=1)=>{ctx.beginPath();v.forEach((a,i)=>i?ctx.lineTo(a.x,a.y):ctx.moveTo(a.x,a.y));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}};
  const path=(arr,color,width=1,dashes=[])=>{ctx.beginPath();arr.forEach((a,i)=>i?ctx.lineTo(a.x,a.y):ctx.moveTo(a.x,a.y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dashes);ctx.stroke();ctx.setLineDash([]);};
  const text=(str,x,y,z=0,color='#bec5ac',size=12)=>{const a=p(x,y,z);ctx.font=`${size}px ui-monospace,monospace`;ctx.fillStyle=color;ctx.fillText(str,a.x,a.y);};
  function terrain(){
  ctx.fillStyle='#293322';ctx.fillRect(0,0,w+2*pad,h+2*pad);
  // Deterministic visual context only; it consumes no traffic or aerial RNG draws.
  const start=Math.floor((projectCx-320)/10)*10;
  for(let x=start;x<projectCx+360;x+=10)for(let y=-110;y<110;y+=10){const a=p(x,y),v=hash(x,y);if(a.x<-40||a.x>w+2*pad+40||a.y<-40||a.y>h+2*pad+40)continue;ctx.fillStyle=v>.4?'#343e2a':'#2d3726';ctx.beginPath();ctx.ellipse(a.x,a.y,scale*8,scale*4,theta,0,Math.PI*2);ctx.fill();}
  // Concrete / asphalt surfaces share the same world coordinates as the simulation.
  function road(center,halfWidth,z=0,lanes=3){const points=center.map(([x,y])=>p(x,y,z));if(z){path(center.map(([x,y])=>p(x+1.3,y+1.3,0)),'#08100877',(halfWidth*2+2)*scale);}
    path(points,'#74796c',(halfWidth*2+1.2)*scale);path(points,'#292f2d',halfWidth*2*scale);
    for(const sign of [-1,1])path(center.map(([x,y])=>p(x,y+sign*(halfWidth-.65),z+.01)),'#c7c8b8',Math.max(.65,.13*scale));
    for(let k=1;k<lanes;k++){const offset=-halfWidth+halfWidth*2*k/lanes;for(let i=0;i<center.length-1;i+=3){path(center.slice(i,Math.min(center.length,i+2)).map(([x,y])=>p(x,y+offset,z+.02)),'#c3c8bd',Math.max(.65,.12*scale));}}
  }
  const main=[];for(let x=projectCx-450;x<=projectCx+450;x+=5)main.push([x,3.7]);road(main,6.65,0,3);
  if(isExit){const ramp=[];for(let x=-140;x<750;x+=4)ramp.push([x,rampY(x)]);road(ramp,2.3,0,1);
    // A visible gore and rails; these rails also exist in the authoritative 3D obstacle list.
    const gore=[];for(let x=35;x<75;x+=5)gore.push(p(x,9.4));for(let x=75;x>=35;x-=5)gore.push(p(x,rampY(x)-2.3));poly(gore,'#b0b29b');
    for(const y of [9.45,16.95]){const base=[p(80,y),p(380,y)],top=[p(80,y,1),p(380,y,1)];poly([base[0],base[1],top[1],top[0]],'#969c8b');path(top,'#d6d8c6',Math.max(1,scale*.15));}
    if(!overhead&&camera!=='maneuver')text('MAINLINE / CONTINUE',80,-5,0,'#d1d3c2',12);text('EXIT 17 / AIRPORT',150,27,0,'#d5c298',12);
    if(!overhead&&camera!=='maneuver')text('MISSED SPLIT',80,5.6,0,'#e7be8b',12);
  }
  // Vegetation: shadows and several crown sizes read as a landscape, rather than an engineering grid.
  for(let x=start;x<projectCx+360;x+=8)for(let y=-85;y<85;y+=8){let v=hash(x+3,y+17);const vx=x+hash(x+19,y+2)*7,vy=y+hash(x+4,y+31)*7;if(v<.36||vy>-6&&vy<13||isExit&&Math.abs(vy-rampY(vx))<6||isExit&&Math.abs(vx-300)<10)continue;const a=p(vx,vy);if(a.x<-30||a.x>w+2*pad+30||a.y<-30||a.y>h+2*pad+30)continue;const radius=scale*(1.3+v*1.7);ctx.fillStyle='#080f0a55';ctx.beginPath();ctx.ellipse(a.x+radius*.45,a.y+radius*.5,radius*1.3,radius*.7,theta,0,Math.PI*2);ctx.fill();ctx.fillStyle=v>.72?'#58623b':v>.5?'#444f30':'#36492d';ctx.beginPath();for(let l=0;l<5;l++){const angle=l*Math.PI*2/5,dist=radius*.26;ctx.moveTo(a.x+Math.cos(angle)*dist+radius*.76,a.y+Math.sin(angle)*dist);ctx.arc(a.x+Math.cos(angle)*dist,a.y+Math.sin(angle)*dist,radius*.76,0,Math.PI*2);}ctx.fill();ctx.fillStyle='#7e835342';ctx.beginPath();ctx.arc(a.x-radius*.2,a.y-radius*.2,radius*.55,0,Math.PI*2);ctx.fill();}
  // Directional pavement markings, scaled with the actual road plane.
  function arrow(x,y,z=0,heading=0){const local=(dx,dy)=>p(x+dx*Math.cos(heading)-dy*Math.sin(heading),y+dx*Math.sin(heading)+dy*Math.cos(heading),z);poly([local(-2,-.12),local(.6,-.12),local(.1,-.6),local(1.4,0),local(.1,.6),local(.6,.12),local(-2,.12)],'#d6d8c5bb');}
  for(let x=Math.floor((projectCx-220)/60)*60;x<projectCx+220;x+=60){for(const y of [0,3.7,7.4])arrow(x,y);if(isExit)arrow(x,19);}
  }
  function car(v){const isEgo=v.id==='R',s=hash(v.id.length,v.id.charCodeAt(v.id.length-1)),color=isEgo?'#d45f43':v.static?'#c7a35b':v.truck?'#d9ddd2':s>.8?'#cbaa42':s>.45?'#c5cec5':'#828d8b';
    const angle=v.bridge?Math.PI/2:v.lane===3&&v.x<70?Math.atan((rampY(v.x+.1)-rampY(v.x-.1))/.2):0,co=Math.cos(angle),si=Math.sin(angle),L=v.length/2,W=v.width/2;
    const point=(a,b,z=v.z)=>p(v.x+a*co-b*si,v.y+a*si+b*co,z);
    // Actual airborne position, with a displaced ground shadow. No animated substitute trajectory.
    const shadow=[point(-L,-W,0),point(L,-W,0),point(L,W,0),point(-L,W,0)];poly(shadow,'#090e0a66');
    if(isEgo){
      const z=v.z+v.height*.5,mesh=(shape,height=z)=>shape.map(([a,b])=>point(a*L,b*W,height));
      const lower=mesh(ROADSTER.body,v.z+.12),upper=mesh(ROADSTER.body);
      poly([...lower.slice(5),lower[0],upper[0],...upper.slice(5).reverse()],'#753b30');
      poly(upper,ROADSTER.paint,ROADSTER.edge,.8);
      for(const b of [-.95,.95])for(const a of [-.65,.56])poly([point((a-.17)*L,b*W,v.z+.12),point((a+.17)*L,b*W,v.z+.12),point((a+.17)*L,b*W,v.z+.36),point((a-.17)*L,b*W,v.z+.36)],'#0a141c');
      poly(mesh(ROADSTER.glass,v.z+v.height*.78),ROADSTER.glassColor,'#a4bfc3',.7);
      poly(mesh(ROADSTER.hood,z+.02),ROADSTER.hoodColor);
      path([point(.1*L,-.66*W,v.z+v.height*.79),point(.1*L,.66*W,v.z+v.height*.79)],'#6c969f',Math.max(.6,scale*.1));
      path([point(-.86*L,-.57*W,z+.03),point(-.86*L,.57*W,z+.03)],'#ffb0a0',Math.max(1,scale*.16));
      for(const b of [-1,1]){path([point(.75*L,b*.7*W,z+.04),point(.92*L,b*.4*W,z+.04)],'#e9ffff',Math.max(1,scale*.15));path([point(-.3*L,b*.87*W,z),point(.2*L,b*.92*W,z)],'#f7c4a0',.6);}
    }else{
    const bottom=[point(-L,-W),point(L,-W),point(L,W),point(-L,W)],top=[point(-L,-W,v.z+v.height*.65),point(L,-W,v.z+v.height*.65),point(L,W,v.z+v.height*.65),point(-L,W,v.z+v.height*.65)];
    poly([bottom[1],bottom[2],top[2],top[1]],isEgo?'#7d3428':'#59625c');poly([bottom[2],bottom[3],top[3],top[2]],isEgo?'#a34330':'#6c756c');
    poly(top,color,'#eceddb55',.6);const z=v.z+v.height*.65+.04;
    for(const side of [-1,1])for(const a of [-L*.65,L*.6])poly([point(a-.38,side*(W-.05),v.z+.15),point(a+.38,side*(W-.05),v.z+.15),point(a+.38,side*(W+.12),v.z+.15),point(a-.38,side*(W+.12),v.z+.15)],'#0b100d');
    poly([point(-L*.42,-W*.86,z),point(L*.33,-W*.86,z),point(L*.47,W*.86,z),point(-L*.48,W*.86,z)],'#1a2926');
    path([point(-L*.05,-W*.85,z+.02),point(-L*.05,W*.85,z+.02)],isEgo?'#c77552':'#87958a',Math.max(.6,scale*.1));
    for(const b of [-W*.65,W*.65]){path([point(L*.86,b-.14,z),point(L*.86,b+.14,z)],'#f0eed6',Math.max(.7,scale*.2));path([point(-L*.92,b-.15,z),point(-L*.92,b+.15,z)],'#c06149',Math.max(.7,scale*.17));}
    }
    if(!isEgo&&(v.id==='CUT'||v.id==='HAZARD'||v.id==='LEAD'||v.static)&&scale>3){const a=p(v.x,v.y,v.z+v.height),label=v.id==='CUT'?'CUT-IN':v.id==='LEAD'?(time>=(run.study?.onset??5)?'BRAKING LEAD':'LEAD VEHICLE'):v.id==='HAZARD'?'STOPPED VEHICLE':'OCCUPIED';ctx.font='bold 12px ui-monospace,monospace';const tw=ctx.measureText(label).width;ctx.fillStyle='#24140ef0';ctx.fillRect(a.x-tw/2-7,a.y-30,tw+14,19);ctx.fillStyle='#ffd0a3';ctx.fillText(label,a.x-tw/2,a.y-17);}
    if(isEgo){const a=p(v.x,v.y,v.z+v.height);ctx.fillStyle='#ece5cf';ctx.font='bold 12px ui-monospace,monospace';ctx.fillText('ROADSTER',a.x-26,a.y-18);if(v.z>.1){path([p(v.x,v.y),p(v.x,v.y,v.z)],'#ebc98b77',1,[3,4]);for(const x of [-L*.7,L*.7]){const a=point(x,0,v.z),b=point(x,0,Math.max(0,v.z-.6));path([a,b],'#dce9d688',2);}}}
  }
  function bridgeGeometry(){
  if(isExit){
    for(const y of [-13,31]){const v=run.layout.obstacles.find(o=>o.id===(y===-13?'PIER-A':'PIER-B'));poly([p(v.x-1,y-1),p(v.x+1,y-1),p(v.x+1,y-1,5.4),p(v.x-1,y-1,5.4)],'#676f62');}
    const deck=[];for(let y=-110;y<=110;y+=4)deck.push([300,y]);
    const a=deck.map(([x,y])=>p(x,y,6));path(deck.map(([x,y])=>p(x+2,y+2,0)),'#030b08aa',13*scale);path(a,'#9a9f8e',11*scale);path(a,'#303632',10*scale);
    for(const dx of [-4.4,4.4])path(deck.map(([x,y])=>p(x+dx,y,6.02)),'#d5d7c4',Math.max(.7,scale*.13));
    for(const dx of [-1.65,1.65])for(let y=-110;y<110;y+=11)path([p(300+dx,y,6.02),p(300+dx,y+4,6.02)],'#c3c8b9',Math.max(.7,scale*.12));
    text('CROSSING / +6.0 m',300,-33,6,'#d1d5bb',12);
  }
  }
  const rootCtx=ctx,baseCx=overhead?cx:Math.round(cx/20)*20;
  const key=[w,h,dpr,camera,zoom,isExit,baseCx,cy].join('|');
  let cache=sceneryCache.get(canvas);
  if(!cache||cache.key!==key){
    if(cache){cache.land.width=0;cache.bridge.width=0;}
    const makeLayer=draw=>{const layer=document.createElement('canvas');const padding=overhead?0:Math.max(140,Math.ceil(scale*12));layer.width=Math.round((w+padding*2)*dpr);layer.height=Math.round((h+padding*2)*dpr);ctx=layer.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);projectCx=baseCx;pad=padding;draw();ctx=rootCtx;projectCx=cx;pad=0;return layer;};
    cache={key,padding:overhead?0:Math.max(140,Math.ceil(scale*12)),baseCx,land:makeLayer(terrain),bridge:makeLayer(bridgeGeometry)};sceneryCache.set(canvas,cache);renderStats.sceneryBuilds++;
  }
  const delta=cx-cache.baseCx,dx=side?-delta*scale:-delta*cos*scale,dy=side?0:-delta*sin*scale;
  function drawLayer(layer){ctx.drawImage(layer,dx-cache.padding,dy-cache.padding,w+2*cache.padding,h+2*cache.padding);}
  ctx.clearRect(0,0,w,h);drawLayer(cache.land);
  // Draw the bridge after lower traffic, so occlusion is consistent with deck elevation.
  const groundTraffic=[...frame.traffic,ego].filter(v=>!v.bridge).sort((a,b)=>p(a.x,a.y,a.z).y-p(b.x,b.y,b.z).y);groundTraffic.forEach(car);
  drawLayer(cache.bridge);
  if(isExit)frame.traffic.filter(v=>v.bridge).forEach(car);
  const req=run.requests.filter(r=>r.t<=time).at(-1)||run.requests[0];let active=frame.active;
  if(!active&&req){const source=req.origin||run.frames.reduce((a,f)=>Math.abs(f.t-req.t)<Math.abs(a.t-req.t)?f:a).ego;active={start:req.t,origin:source,request:req.request||{duration:req.duration,height:3,speed:source.v,lateral:0}};}
  if(active){const q=active.request,o=active.origin,ly=active.correction?active.correction.origin+active.correction.d:o.y+q.lateral,lx=o.x+q.speed*q.duration,unc=q.speed*run.config.latency,col=req&&!req.accepted?'#dd977d':'#e6d2a0';
    poly([p(lx-unc,ly-1.25),p(lx+unc,ly-1.25),p(lx+unc,ly+1.25),p(lx-unc,ly+1.25)],`${col}20`,col,.9);
    const trajectory=[];for(let i=0;i<=120;i++){const t=q.duration*i/120;let y=o.y+requestLateral(t,q).p;if(active.correction&&active.start+t>=active.correction.start)y=active.correction.origin+lateral(active.start+t-active.correction.start,active.correction.duration,active.correction.d).p;trajectory.push(p(o.x+q.speed*t,y,vertical(t,q.duration,q.height).p));}
    path(trajectory,'#11180cc9',3.5);path(trajectory,col,1.4,[5,5]);
    for(const [x,y,name] of [[o.x,o.y,'DEPARTURE'],[lx,ly,req&&!req.accepted?'LANDING BLOCKED':'PREDICTED LANDING']]){const a=p(x,y);ctx.beginPath();ctx.arc(a.x,a.y,4,0,Math.PI*2);ctx.strokeStyle=col;ctx.lineWidth=1;ctx.stroke();ctx.font='12px ui-monospace,monospace';const textWidth=ctx.measureText(name).width;ctx.fillStyle='#11180fe8';ctx.fillRect(a.x-8,a.y+14,textWidth+16,20);ctx.fillStyle=col;ctx.fillText(name,a.x,a.y+28);}
    if(!overhead){const history=run.frames.filter(f=>f.t<=time&&f.ego.z>.03).map(f=>p(f.ego.x,f.ego.y,f.ego.z));if(history.length>1)path(history,'#e59067',1.5);}
  }
  // A subtle vignette keeps overlays readable without obscuring the modeled road.
  const vignette=ctx.createRadialGradient(w/2,h/2,h*.2,w/2,h/2,Math.max(w,h)*.7);vignette.addColorStop(0,'#080e0700');vignette.addColorStop(1,'#070c0870');ctx.fillStyle=vignette;ctx.fillRect(0,0,w,h);
  renderStats.sceneFrames++;renderStats.lastFrameMs=performance.now()-started;renderStats.maxFrameMs=Math.max(renderStats.maxFrameMs,renderStats.lastFrameMs);
  if(ego.mode==='failed'){ctx.fillStyle='#1a100df0';ctx.fillRect(0,h-85,w,36);ctx.fillStyle='#ebad91';ctx.font='12px -apple-system,sans-serif';ctx.fillText('RUN TERMINATED / CONTACT OR PHYSICAL LIMIT',20,h-63);}
}
export function drawAltitude(canvas,run,time,win={start:0,end:28}){
  const {ctx,w,h,dpr}=surface(canvas);const px=t=>24+(t-win.start)/(win.end-win.start)*(w-31),py=z=>h-15-z/4*(h-23);
  let cache=altitudeCache.get(canvas);
  if(!cache||cache.run!==run||cache.win?.start!==win.start||cache.win?.end!==win.end||cache.w!==w||cache.h!==h||cache.dpr!==dpr){const layer=document.createElement('canvas');layer.width=canvas.width;layer.height=canvas.height;const c=layer.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.font='12px ui-monospace,monospace';for(const z of [0,2,4]){c.fillStyle='#8a947c';c.fillText(`${z}`,2,py(z)+2);c.strokeStyle='#313a29';c.beginPath();c.moveTo(23,py(z));c.lineTo(w,py(z));c.stroke();}c.strokeStyle='#d9c08d';c.lineWidth=1.5;c.beginPath();run.frames.forEach((f,i)=>i?c.lineTo(px(f.t),py(f.ego.z)):c.moveTo(px(f.t),py(f.ego.z)));c.stroke();{const span=win.end-win.start,stepT=span<=10?1:span<=20?2:5;for(let t=Math.ceil(win.start/stepT)*stepT;t<=win.end+1e-9;t+=stepT){c.fillStyle='#8e987f';c.fillText(`${t}s`,px(t)-5,h-1);}}cache={run,win:{...win},w,h,dpr,layer};altitudeCache.set(canvas,cache);}
  ctx.clearRect(0,0,w,h);ctx.drawImage(cache.layer,0,0,w,h);ctx.strokeStyle='#e6e8d6';ctx.beginPath();ctx.moveTo(px(time),0);ctx.lineTo(px(time),h-11);ctx.stroke();
}
