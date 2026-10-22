// Camera framing is presentation only; it never changes the replay.
export function cameraFrame({width:w,height:h,camera='follow',ego,run,zoom=1}){
  const network=camera==='overhead',side=camera==='side',maneuver=camera==='maneuver',exit=run.layout?.type==='interchange';
  let scale=side?w/125:network?Math.min(w/330,h/235):Math.min(w/95,h/68),cx=network?(exit?175:180):ego.x+(side?32:18),cy=exit?10:3.7;
  if(maneuver){const req=run.requests[0],origin=req?.origin||run.frames.find(f=>f.t>=req?.t)?.ego||ego,target=req?.landing;cx=target?ego.x+Math.max(0,Math.min(28,(target.x-ego.x)/2)):ego.x+18;cy=target?(origin.y+target.y)/2:cy;scale=Math.min(w/80,h/68);}
  return {scale:scale*Math.max(.65,Math.min(2,zoom)),cx,cy,theta:network?-.87:-.64,zScale:network?0:scale*Math.max(.65,Math.min(2,zoom))*.85,side,network};
}
