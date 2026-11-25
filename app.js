const canvas=document.getElementById('fractal');
const gl=canvas.getContext('webgl',{antialias:false,alpha:false,powerPreference:'low-power'});
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const {anchors,overview,project,destination,interpolate,rubberScale,panBounds,rubberPan,edgeSpring}=FractalCamera;
let noMotion=reduce.matches, current='home', animation=0, flight=null;
const camera={...overview(innerWidth,innerHeight)};
const destinations={home:true,work:true,free:true,about:true,contact:true,...anchors};
let renderFractal=()=>{};
function positionMarkers(){
  document.querySelectorAll('.portal').forEach(marker=>{
    const point=project(anchors[marker.dataset.view],camera,innerWidth,innerHeight);
    marker.style.left=point.x+'px';marker.style.top=point.y+'px';
    marker.classList.toggle('tracked',!!flight&&marker.dataset.view===flight.view);
    marker.classList.toggle('offscreen',point.x<20||point.x>innerWidth-20||point.y<90||point.y>innerHeight-95);
    const label=marker.querySelector('.portal-label');
    const width=label.offsetWidth;
    const preferred=point.x+31+width>innerWidth-20?point.x-31-width:point.x+31;
    const left=Math.max(12,Math.min(innerWidth-width-12,preferred));
    label.style.left=(left-point.x+17)+'px';label.style.right='auto';
  });
}
function render(){renderFractal();positionMarkers();
  const zoom=(overview(innerWidth,innerHeight).scale/camera.scale).toFixed(1)+'×';
  document.getElementById('zoom-readout').textContent='ZOOM '+zoom;
  document.getElementById('free-zoom').textContent=zoom;
  if(flight)document.getElementById('journey-label').textContent=(anchors[flight.view]?.label||(flight.view==='home'?'Returning to overview':'Selected work'))+' · '+zoom;
}
if(gl){
const vertex='attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
const fragment=`precision highp float;uniform vec2 resolution;uniform vec2 center;uniform float scale;
void main(){vec2 uv=(gl_FragCoord.xy/resolution-.5);uv.x*=resolution.x/resolution.y;
vec2 z=uv*scale+center;vec2 c=vec2(-.745,.186);float n=0.;float trap=10.;
for(int i=0;i<900;i++){z=vec2(z.x*z.x-z.y*z.y,2.*z.x*z.y)+c;trap=min(trap,abs(length(z)-.55));if(dot(z,z)>256.)break;n+=1.;}
float smoothN=n+1.-log2(max(1.,log2(max(dot(z,z),1.))));
float t=smoothN*.047;vec3 col=vec3(.055,.072,.052);
if(n<899.){float band=.5+.5*cos(t*6.2831);float light=pow(band,2.5);vec3 dark=vec3(.075,.105,.065);vec3 gold=vec3(.76,.50,.24);vec3 cream=vec3(.97,.89,.66);col=mix(dark,gold,light);col=mix(col,cream,pow(band,14.)*.85);float detail=exp(-trap*25.);col+=vec3(.12,.14,.055)*detail;float outer=smoothstep(1.,10.,smoothN);col=mix(vec3(.055,.07,.052),col,outer);}
float vignette=1.-.22*length(uv);gl_FragColor=vec4(col*vignette,1.);}`;
function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
try{const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Fractal shader could not link');gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const a=gl.getAttribLocation(program,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);const res=gl.getUniformLocation(program,'resolution'),center=gl.getUniformLocation(program,'center'),scale=gl.getUniformLocation(program,'scale');
renderFractal=()=>{const ratio=Math.min(devicePixelRatio,1.25);const w=Math.round(innerWidth*ratio),h=Math.round(innerHeight*ratio);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}gl.uniform2f(res,w,h);gl.uniform2f(center,camera.x,camera.y);gl.uniform1f(scale,camera.scale);gl.drawArrays(gl.TRIANGLES,0,6);};render();
}catch(e){canvas.style.display='none';}
}
const tags=a=>'<div class="tags">'+a.map(x=>'<span>'+x+'</span>').join('')+'</div>';
const panels={
contact:`<div class="panel-kicker">LET’S CONNECT</div><h2 id="panel-title">Reach out.</h2><p class="panel-lead">Interested in working together? I’d love to hear about student opportunities and collaborations in data science, machine learning, and audio.</p><a class="contact-link" href="mailto:shahar.lando@gmail.com"><span><small>EMAIL</small><strong>shahar.lando@gmail.com</strong></span><b aria-hidden="true">↗</b></a><a class="contact-link" href="https://github.com/shoohi" target="_blank" rel="noopener noreferrer"><span><small>GITHUB</small><strong>shoohi</strong><em>Code, projects, and experiments</em></span><b aria-hidden="true">↗</b></a><a class="contact-link" href="https://www.linkedin.com/in/shahar-lando" target="_blank" rel="noopener noreferrer"><span><small>LINKEDIN</small><strong>Shahar Lando</strong><em>Professional background and connections</em></span><b aria-hidden="true">↗</b></a><a class="contact-link" href="./shahar-lando-cv.pdf" target="_blank" rel="noopener noreferrer"><span><small>CV / PDF</small><strong>Shahar Lando - CV</strong><em>Experience, skills, and selected projects</em></span><b aria-hidden="true">↗</b></a><p class="contact-note">Based in Israel · Data Science student at Afeka · Background in sound design</p>`,
audio:`<div class="panel-kicker">01 / MACHINE LEARNING · AUDIO</div><h2 id="panel-title">AudioDNA</h2><p class="panel-lead">Teaching machines to listen.<br>A sound effect classifier and similarity search engine.</p><div class="metrics"><div><strong>~900</strong><span>Audio samples</span></div><div><strong>0.77</strong><span>Reported accuracy</span></div><div><strong>0.73</strong><span>Reported F1 score</span></div></div><h3>From sound to searchable features</h3><p>An end-to-end pipeline for classifying sound effects across six categories. Acoustic features - including MFCCs, spectral features, and zero-crossing rate - turn audio into a representation a model can learn from.</p><h3>Classification meets discovery</h3><p>Random Forest classification pairs with cosine-similarity retrieval. A Streamlit interface lets users upload a sound, predict its category, and find related samples.</p>${tags(['Python','scikit-learn','librosa','SQLite','Streamlit'])}<a class="panel-link" href="https://github.com/shoohi/AudioDNA" target="_blank" rel="noopener noreferrer">Explore the repository ↗</a>`,
behavior:`<div class="panel-kicker">02 / EXPERIMENTAL DESIGN · STATISTICS</div><h2 id="panel-title">Behavioral<br>experiments</h2><p class="panel-lead">From a question about human decisions to a controlled experiment.</p><div class="metrics"><div><strong>03</strong><span>Behavioral effects</span></div><div><strong>A/B</strong><span>Random assignment</span></div><div><strong>CI</strong><span>Uncertainty estimates</span></div></div><h3>Designing the data, then analyzing it</h3><p>A behavioral economics experimentation platform exploring anchoring, framing, and the decoy effect, with randomized treatment assignment, anonymized data collection, consent, and debriefing.</p><h3>Looking beyond a p-value</h3><p>Analysis brings together hypothesis tests, effect sizes, confidence intervals, bootstrap methods, and power analysis to investigate how experimental conditions influence decisions.</p>${tags(['Experimental design','Statistical inference','Bootstrap','Power analysis'])}`,
about:`<div class="panel-kicker">THE PERSON BEHIND THE WORK</div><h2 id="panel-title">Shahar Lando</h2><p class="panel-lead">I’m Shahar Lando, a Data Science student at Afeka in Israel, with a background in sound design.</p><h3>What I’m drawn to</h3><p>I enjoy the space where mathematics, statistics, and code meet: building models, designing experiments, and finding useful structure in complex data. My audio background also brings a particular interest in sound and machine learning.</p><h3>What I’m looking for</h3><p>Student opportunities in data science, data analysis, and machine learning, with room to learn, contribute, and work on meaningful problems.</p>${tags(['Python','SQL','R','scikit-learn','Tableau','Git'])}<a class="panel-link" href="https://github.com/shoohi" target="_blank" rel="noopener noreferrer">Find me on GitHub ↗</a><a class="panel-link cv-link" href="./shahar-lando-cv.pdf" target="_blank" rel="noopener noreferrer">View my CV (PDF) ↗</a>`,
work:`<div class="panel-kicker">SELECTED WORK / 02 PROJECTS</div><h2 id="panel-title">Ideas into<br>experiments.</h2><p class="panel-lead">A closer look at my work in machine learning and statistical inference.</p><button class="work-item" data-view="audio"><strong>01 &nbsp; AudioDNA ↗</strong><span>Audio classification & similarity search</span></button><button class="work-item" data-view="behavior"><strong>02 &nbsp; Behavioral experiments ↗</strong><span>Experimental design & statistical analysis</span></button>`
};
const panel=document.getElementById('window');
const journey=document.getElementById('journey');
function showDestination(focus){
  document.body.classList.remove('traveling','deep-flight');
  journey.hidden=true;
  panel.hidden=current==='home'||current==='free';
  if(current!=='home'&&current!=='free'){
    const content=document.getElementById('panel-content');
    content.innerHTML=panels[current];
    fitPanel();
    content.style.animation='none';void content.offsetHeight;content.style.animation='';
    if(focus)document.getElementById('back').focus({preventScroll:true});
  }else if(focus&&current==='free'){canvas.focus({preventScroll:true});
  }else if(focus){
    document.querySelector('header [data-view="home"]').focus({preventScroll:true});
  }
  document.getElementById('intro').inert=current!=='home';
  document.getElementById('portals').inert=current!=='home';
  render();
}
function finishFlight(){
  if(!flight)return;
  const focus=flight.focus,revealed=flight.revealed;
  cancelAnimationFrame(animation);
  Object.assign(camera,destination(current,innerWidth,innerHeight));
  flight=null;
  if(revealed)render();else showDestination(focus);
}
function fly(view,previous,focus){
  cancelAnimationFrame(animation);
  const from={...camera},home=overview(innerWidth,innerHeight);
  const to=destination(view,innerWidth,innerHeight);
  const target=anchors[view]||anchors[previous]||{x:from.x,y:from.y};
  // When changing projects, first leave the old location before approaching the new one.
  const viaHome=!!anchors[view]&&from.scale<home.scale*.7;
  const legs=[];
  if(viaHome)legs.push({from,to:home,anchor:anchors[previous]||from,duration:2000});
  legs.push({from:viaHome?home:from,to,anchor:target,duration:2000});
  flight={view,focus,legs,leg:0,start:performance.now()};
  if(noMotion||!gl||(Math.abs(from.scale-to.scale)<1e-10&&Math.abs(from.x-to.x)<1e-10&&Math.abs(from.y-to.y)<1e-10)){finishFlight();return;}
  document.body.classList.add('traveling');journey.hidden=false;
  function frame(now){
    if(!flight)return;
    const leg=flight.legs[flight.leg];
    const t=Math.min((now-flight.start)/leg.duration,1);
    if(!flight.revealed)document.body.classList.toggle('deep-flight',leg.to.scale<leg.from.scale&&t>.18);
    Object.assign(camera,interpolate(leg.from,leg.to,leg.anchor,t));render();
    if(!flight.revealed&&flight.leg===flight.legs.length-1&&(panels[view]||view==='home')&&(now-flight.start)>=leg.duration-1000){
      flight.revealed=true;showDestination(flight.focus);
    }
    if(t===1){
      if(++flight.leg>=flight.legs.length){finishFlight();return;}
      flight.start=now;
    }
    animation=requestAnimationFrame(frame);
  }
  animation=requestAnimationFrame(frame);
}
function navigate(view,focus=true,immediate=false){
  if(!destinations[view])view='home';
  const previous=current;current=view;
  stopZoomReturn();
  document.body.classList.toggle('about-mode',view==='about');
  document.body.classList.toggle('contact-mode',view==='contact');
  document.getElementById('about-photo').hidden=view!=='about';
  pointers.clear();document.body.classList.remove('dragging');
  document.body.classList.toggle('free-mode',view==='free');
  document.getElementById('free-controls').hidden=view!=='free';
  canvas.tabIndex=view==='free'?0:-1;
  if(view==='free'){cancelAnimationFrame(animation);flight=null;document.body.classList.add('inside');showDestination(focus);return;}
  window.scrollTo({top:0,behavior:'instant'});
  document.body.classList.toggle('inside',view!=='home');
  panel.hidden=true;
  document.getElementById('intro').inert=true;
  document.getElementById('portals').inert=true;
  document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
  if(immediate){cancelAnimationFrame(animation);flight=null;Object.assign(camera,destination(view,innerWidth,innerHeight));showDestination(focus);}
  else fly(view,previous,focus);
}
function requestView(view){
  const hash=view==='home'?'':'#'+view;
  if(location.hash!==hash)location.hash=hash;
  else if(view!==current)navigate(view);
}
document.addEventListener('click',e=>{
  const button=e.target.closest('[data-view]');
  if(button){e.preventDefault();requestView(button.dataset.view);}
});
document.querySelector('.brand').addEventListener('click',e=>{e.preventDefault();requestView('home');});
document.getElementById('back').onclick=()=>requestView('home');

document.getElementById('skip-zoom').onclick=finishFlight;
addEventListener('keydown',e=>{if(e.key==='Escape')requestView('home');});
addEventListener('hashchange',()=>navigate(location.hash.slice(1)||'home'));
function updateMotion(){const b=document.getElementById('motion');b.textContent=noMotion?'Motion off':'Motion on';b.setAttribute('aria-pressed',String(noMotion));}
document.getElementById('motion').onclick=()=>{noMotion=!noMotion;updateMotion();if(noMotion)finishFlight();};
reduce.addEventListener('change',e=>{noMotion=e.matches;updateMotion();if(noMotion)finishFlight();});
addEventListener('resize',()=>{
  stopZoomReturn();
  if(flight){const focus=flight.focus;cancelAnimationFrame(animation);flight=null;Object.assign(camera,destination(current,innerWidth,innerHeight));showDestination(focus);}
  else{if(current!=='free')Object.assign(camera,destination(current,innerWidth,innerHeight));render();}
  if(!panel.hidden)fitPanel();
  if(current==='free')scheduleZoomReturn();
});
// Free exploration: the complex-plane point under the pointer stays fixed during zoom.
const pointers=new Map();
canvas.setAttribute('aria-label','Julia fractal. Drag to pan. Use arrow keys to move, plus and minus to zoom, and Escape to exit.');
let returnFrame=0,returnTimer=0,lastZoomPoint={x:innerWidth/2,y:innerHeight/2};
function stopZoomReturn(){cancelAnimationFrame(returnFrame);clearTimeout(returnTimer);}
function setScaleAt(next,x,y){
  const old=camera.scale;
  camera.x+=(x-innerWidth/2)*(old-next)/innerHeight;
  camera.y-=(y-innerHeight/2)*(old-next)/innerHeight;
  camera.scale=next;render();
}
function scheduleZoomReturn(delay=110){
  clearTimeout(returnTimer);
  if(current!=='free'||pointers.size)return;
  returnTimer=setTimeout(()=>{
    if(current!=='free'||pointers.size)return;
    const from={...camera},limit=overview(innerWidth,innerHeight).scale;
    const scale=Math.min(from.scale,limit),bounds=panBounds(scale,innerWidth,innerHeight);
    const x=from.x+(lastZoomPoint.x-innerWidth/2)*(from.scale-scale)/innerHeight;
    const y=from.y-(lastZoomPoint.y-innerHeight/2)*(from.scale-scale)/innerHeight;
    const to={scale,x:Math.max(-bounds.x,Math.min(bounds.x,x)),y:Math.max(-bounds.y,Math.min(bounds.y,y))};
    if(from.scale===to.scale&&from.x===to.x&&from.y===to.y)return;
    const start=performance.now();
    if(noMotion){Object.assign(camera,to);render();return;}
    function settle(now){
      if(current!=='free')return;
      const seconds=(now-start)/1000;
      const residual=edgeSpring(seconds);
      for(const key of ['x','y','scale'])camera[key]=to[key]+(from[key]-to[key])*residual;
      render();
      if(seconds<1.8)returnFrame=requestAnimationFrame(settle);
    }
    returnFrame=requestAnimationFrame(settle);
  },delay);
}
function panBy(dx,dy){
  stopZoomReturn();
  const bounds=panBounds(camera.scale,innerWidth,innerHeight),band=camera.scale*.42;
  camera.x=rubberPan(camera.x,dx,bounds.x,band);
  camera.y=rubberPan(camera.y,dy,bounds.y,band);
  render();scheduleZoomReturn();
}
function zoomAt(factor,x=innerWidth/2,y=innerHeight/2){
  stopZoomReturn();lastZoomPoint={x,y};
  const next=rubberScale(camera.scale,factor,overview(innerWidth,innerHeight).scale);
  setScaleAt(next,x,y);scheduleZoomReturn();
}
canvas.addEventListener('wheel',e=>{if(current!=='free')return;e.preventDefault();zoomAt(Math.exp(Math.max(-150,Math.min(150,e.deltaY))*.003),e.clientX,e.clientY);},{passive:false});
canvas.addEventListener('pointerdown',e=>{if(current!=='free')return;stopZoomReturn();canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});document.body.classList.add('dragging');});
canvas.addEventListener('pointermove',e=>{
  if(current!=='free'||!pointers.has(e.pointerId))return;
  const old=[...pointers.values()];
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const next=[...pointers.values()];
  const midpoint=a=>({x:a.reduce((s,p)=>s+p.x,0)/a.length,y:a.reduce((s,p)=>s+p.y,0)/a.length});
  const before=midpoint(old),after=midpoint(next);
  panBy(-(after.x-before.x)*camera.scale/innerHeight,(after.y-before.y)*camera.scale/innerHeight);
  if(next.length===2){const distance=a=>Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);zoomAt(Math.max(1,distance(old))/Math.max(1,distance(next)),after.x,after.y);}else render();
});
for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,e=>{pointers.delete(e.pointerId);if(!pointers.size){document.body.classList.remove('dragging');scheduleZoomReturn(0);}});
canvas.addEventListener('keydown',e=>{if(current!=='free')return;const step=camera.scale*.08;
  if(e.key==='+'||e.key==='=')zoomAt(.7);else if(e.key==='-')zoomAt(1/.7);
  else if(e.key==='ArrowLeft')panBy(-step,0);else if(e.key==='ArrowRight')panBy(step,0);
  else if(e.key==='ArrowUp')panBy(0,step);else if(e.key==='ArrowDown')panBy(0,-step);else return;
  e.preventDefault();render();
});
document.getElementById('free-plus').onclick=()=>zoomAt(.65);
document.getElementById('free-minus').onclick=()=>zoomAt(1/.65);
document.getElementById('free-reset').onclick=()=>{stopZoomReturn();Object.assign(camera,overview(innerWidth,innerHeight));render();};
let panelPages=[],pageIndex=0;
function showPage(index){
  pageIndex=Math.max(0,Math.min(panelPages.length-1,index));
  const content=document.getElementById('panel-content');content.replaceChildren(...panelPages[pageIndex]);
  if(!content.querySelector('#panel-title')){panel.removeAttribute('aria-labelledby');panel.setAttribute('aria-label',anchors[current]?.label||(current==='contact'?'Reach out':'Selected work'));}else{panel.setAttribute('aria-labelledby','panel-title');panel.removeAttribute('aria-label');}
  document.getElementById('page-count').textContent=(pageIndex+1)+' / '+panelPages.length;
  document.getElementById('page-prev').disabled=pageIndex===0;
  document.getElementById('page-next').disabled=pageIndex===panelPages.length-1;
}
function fitPanel(){
  const content=document.getElementById('panel-content'),controls=document.getElementById('page-controls');
  content.innerHTML=panels[current];controls.hidden=true;panel.setAttribute('aria-labelledby','panel-title');panel.removeAttribute('aria-label');
  if(content.scrollHeight<=content.clientHeight+1){panelPages=[[...content.children]];pageIndex=0;return;}
  controls.hidden=false;
  const nodes=[...content.children];content.replaceChildren();panelPages=[];let group=[];
  for(const node of nodes){content.append(node);
    if(content.scrollHeight>content.clientHeight+1&&group.length){node.remove();panelPages.push(group);group=[];content.replaceChildren(node);}
    group.push(node);
  }
  if(group.length)panelPages.push(group);showPage(0);
}
document.getElementById('page-prev').onclick=()=>showPage(pageIndex-1);
document.getElementById('page-next').onclick=()=>showPage(pageIndex+1);
document.fonts.ready.then(()=>{if(!panel.hidden)fitPanel();});
updateMotion();navigate(location.hash.slice(1)||'home',false,true);

