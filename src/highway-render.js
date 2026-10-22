import {ROADSTER} from './vehicle-design.js';
import {highwayPose} from './situations.js';
export function highwayView(w,h,camera,ego,zoom=1){return {scale:Math.min(w/(camera==='overhead'?250:150),h/(camera==='overhead'?300:135))*zoom,north:camera==='overhead'?115:ego.x+25,east:22};}
export function drawHighway(canvas,frame,run,camera,time,zoom=1){
 const w=canvas.clientWidth,h=canvas.clientHeight,dpr=Math.min(devicePixelRatio||1,2);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}const c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);
 const side=camera==='side',{scale,north,east}=highwayView(w,h,camera,frame.ego,zoom);
 const p=(n,e,z=0)=>side?{x:w*.5+(n-north)*scale,y:h*.72-z*scale*4-e*scale*.12}:{x:w*.5+(e-east)*scale,y:h*.58-(n-north)*scale-z*scale*.65};
 const line=(a,b,color,width,dash=[])=>{c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.strokeStyle=color;c.lineWidth=width;c.setLineDash(dash);c.stroke();c.setLineDash([]);};
 c.fillStyle='#27331f';c.fillRect(0,0,w,h);for(let n=-160;n<800;n+=24)for(let e=-180;e<220;e+=20){if(Math.abs(e)<12||Math.abs(n-170)<12)continue;const a=p(n,e);if(a.x<0||a.x>w||a.y<0||a.y>h)continue;c.beginPath();c.arc(a.x,a.y,scale*3,0,Math.PI*2);c.fillStyle='#465536';c.fill();}
 line(p(-400,-3.7),p(1200,-3.7),'#9b9d8e',23*scale);line(p(-400,-3.7),p(1200,-3.7),'#303733',21*scale);for(const e of [-9.9,2.6])line(p(-400,e),p(1200,e),'#e4e3ca',Math.max(1,scale*.13));for(const e of [-7.4,-3.7])line(p(-400,e),p(1200,e),'#bfc6b5',1,[10,15]);
 function car(v,ghost=false){const a=p(v.x,-v.y,v.z),angle=v.bridge?0:-Math.PI/2,L=v.length*scale,W=v.width*scale;c.save();c.translate(a.x,a.y);c.rotate(angle);c.globalAlpha=ghost?.52:1;
 const polygon=(shape,fill,stroke)=>{c.beginPath();shape.forEach(([x,y],i)=>i?c.lineTo(x*L/2,y*W/2):c.moveTo(x*L/2,y*W/2));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=.8;c.stroke();}};
 if(v.id==='R'){polygon(ROADSTER.body,ROADSTER.paint,ROADSTER.edge);polygon(ROADSTER.glass,ROADSTER.glassColor);polygon(ROADSTER.hood,ROADSTER.hoodColor);c.strokeStyle='#e9ffff';c.lineWidth=1;for(const sign of [-1,1]){c.beginPath();c.moveTo(L*.37,sign*W*.34);c.lineTo(L*.46,sign*W*.2);c.stroke();}c.strokeStyle='#ffb0a0';c.beginPath();c.moveTo(-L*.43,-W*.3);c.lineTo(-L*.43,W*.3);c.stroke();}
 else{c.fillStyle=ghost?'#e3c791':v.bridge?'#a4bec0':'#d2d8cc';c.fillRect(-L/2,-W/2,L,W);c.strokeStyle='#f4f2df';c.lineWidth=1;c.strokeRect(-L/2,-W/2,L,W);c.fillStyle='#20342e';c.fillRect(-L*.22,-W*.4,L*.35,W*.8);}c.restore();}

 frame.traffic.filter(v=>!v.bridge).forEach(v=>car(v));car(frame.ego);
 // Deck is a distinct elevated occupied volume, not a ramp that grants a transfer.
 line(p(170,-230),p(170,250),'#080d08aa',24*scale);line(p(170,-230,6),p(170,250,6),'#abb09e',22*scale);line(p(170,-230,6),p(170,250,6),'#39403b',20*scale);for(const n of [164,176])line(p(n,-230,6),p(n,250,6),'#e3e1c5',1);line(p(170,-230,6),p(170,250,6),'#d7dcc9',1,[12,16]);frame.traffic.filter(v=>v.bridge).forEach(v=>car(v));
 const proposal=run.proposal;if(proposal){const q=proposal.geometry,o=proposal.origin,pts=proposal.samples.map(v=>p(o.x+v.x,-o.y-v.y,v.z));c.beginPath();pts.forEach((a,i)=>i?c.lineTo(a.x,a.y):c.moveTo(a.x,a.y));c.setLineDash([7,6]);c.lineWidth=2;c.strokeStyle='#efb58a';c.stroke();c.setLineDash([]);if(time>=5){const pose=highwayPose(Math.min(time-5,q.duration),q),a=p(o.x+pose.x,-o.y-pose.y,pose.z);c.beginPath();c.arc(a.x,a.y,7,0,Math.PI*2);c.fillStyle='#edc79c88';c.fill();}const end=p(o.x+q.north,-o.y+q.east,6);c.strokeStyle='#f0c09a';c.strokeRect(end.x-14,end.y-9,28,18);}
 const label=(text,x,y)=>{if(x<-60||x>w+60||y<0||y>h)return;c.font='600 13px -apple-system,sans-serif';const tw=c.measureText(text).width,x0=Math.max(12,Math.min(w-tw-24,x)),y0=Math.max(115,Math.min(h-145,y));c.fillStyle='#10170fe8';c.fillRect(x0-6,y0-18,tw+12,26);c.fillStyle='#f0e9d3';c.fillText(text,x0,y0);};
 const deck=p(170,55,6);label('EASTBOUND HIGHWAY · +6 m',deck.x-85,deck.y-24);const a=p(frame.ego.x,-frame.ego.y);label('ROADSTER · NORTHBOUND',a.x+20,a.y+20);if(proposal)label('DASHED = REJECTED REQUEST · 90° TURN',20,h-120);
 c.font='600 15px -apple-system,sans-serif';c.fillStyle='#efe9d4';c.fillText(side?'HEIGHT VIEW':'N ↑   E →',18,h-80);
}
