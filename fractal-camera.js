/* Shared complex-plane coordinates for rendering, markers, and camera travel. */
(function(root){
  const anchors={
    audio:{x:.32222,y:.438005,scale:.0002,label:'AudioDNA'},
    behavior:{x:.90237,y:-.17546,scale:.0002,label:'Behavioral experiments'}
  };
  function overview(width,height){
    return width<=650?{x:.40,y:.90,scale:4.8}:{x:-.45,y:0,scale:2.6};
  }
  function project(point,camera,width,height){
    return {x:width/2+(point.x-camera.x)*height/camera.scale,
      y:height/2-(point.y-camera.y)*height/camera.scale};
  }
  function destination(view,width,height){
    if(!anchors[view])return overview(width,height);
    const a=anchors[view],focusX=width<=650?.5:.32;
    return {x:a.x-(focusX-.5)*width/height*a.scale,y:a.y,scale:a.scale};
  }
  // Smootherstep: continuous acceleration with zero speed and acceleration
  // at both endpoints, and maximum speed at the midpoint.
  function ease(t){
    t=Math.max(0,Math.min(1,t));
    return t*t*t*(t*(6*t-15)+10);
  }
  function zoomInEase(t){return ease(t);}
  function rubberScale(scale,factor,limit){
    const next=Math.max(.0002,scale*factor);
    if(next<=limit||factor<=1)return next;
    return rubberPan(scale,next-scale,limit,limit*.55);
  }
  function panBounds(scale,width,height){
    return {x:Math.max(.55,1.6-scale*width/height*.175),y:Math.max(.95,1.1-scale*.12)};
  }
  function rubberPan(value,delta,limit,band){
    const next=value+delta;
    if(Math.abs(next)<=limit||next*delta<=0)return next;
    const sign=Math.sign(next),over=Math.max(0,sign*value-limit);
    const raw=over>0?-band*Math.log(Math.max(1e-9,1-over/band))+Math.abs(delta):Math.abs(next)-limit;
    return sign*(limit+band*(1-Math.exp(-raw/band)));
  }
  // Lightly underdamped spring: one restrained rebound, then a quiet settle.
  function edgeSpring(seconds){
    if(seconds>=1.8)return 0;
    const damping=.72,frequency=8,decay=damping*frequency;
    const oscillation=frequency*Math.sqrt(1-damping*damping);
    return Math.exp(-decay*seconds)*(Math.cos(oscillation*seconds)+decay/oscillation*Math.sin(oscillation*seconds));
  }
  function interpolate(from,to,anchor,t){
    const progress=Math.max(0,Math.min(1,t));
    const e=ease(progress);
    // Ease across zoom levels so the perceived rate builds and subsides smoothly,
    // even when the journey spans thousands of times magnification.
    const scale=progress===0?from.scale:progress===1?to.scale:
      Math.exp(Math.log(from.scale)+(Math.log(to.scale)-Math.log(from.scale))*e);
    // Interpolate the anchor's screen position, not independent world coordinates.
    // This prevents the focal feature from drifting or flying off-screen as scale changes.
    const qx=(anchor.x-from.x)/from.scale;
    const qy=(anchor.y-from.y)/from.scale;
    const endX=(anchor.x-to.x)/to.scale;
    const endY=(anchor.y-to.y)/to.scale;
    return {x:anchor.x-(qx+(endX-qx)*e)*scale,
      y:anchor.y-(qy+(endY-qy)*e)*scale,scale};
  }
  const api={anchors,overview,project,destination,interpolate,ease,zoomInEase,rubberScale,panBounds,rubberPan,edgeSpring};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.FractalCamera=api;
})(globalThis);
