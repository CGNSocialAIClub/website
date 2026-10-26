// Match the carousel's cubic Bezier without restarting easing per keyframe.
export function carouselProgress(time) {
  let low=0,high=1;
  const bezier=(t,a,b)=>3*(1-t)*(1-t)*t*a+3*(1-t)*t*t*b+t*t*t;
  for(let i=0;i<22;i++){const mid=(low+high)/2;if(bezier(mid,.65,.35)<time)low=mid;else high=mid;}
  return bezier((low+high)/2,0,1);
}
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export function textAroundCover(from,to,entering,steps=80) {
  const left=[],top=[],times=[];
  const beside = entering ? to : from;
  const gap = Math.max(0, beside.info.x - beside.cover.x - beside.cover.width);
  for(let i=0;i<=steps;i++){
    const time=i/steps,p=i===0?0:i===steps?1:carouselProgress(time);
    const edge=mix(from.cover.x+from.cover.width,to.cover.x+to.cover.width,p)+gap;
    const bottom=mix(from.cover.y+from.cover.height,to.cover.y+to.cover.height,p)+22;
    if(entering){
      left.push(mix(from.info.x,edge,smooth(p*2)));
      top.push(mix(bottom,to.info.y,smooth((p-.5)*2)));
    }else{
      left.push(mix(edge,to.info.x,smooth((p-.5)*2)));
      top.push(mix(from.info.y,bottom,smooth(p*2)));
    }
    times.push(time);
  }
  left[0]=from.info.x;top[0]=from.info.y;
  left[steps]=to.info.x;top[steps]=to.info.y;
  return {left,top,times};
}
