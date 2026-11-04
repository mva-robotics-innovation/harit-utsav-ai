// HARIT UTSAV AI v2 — 3D scenes (Three.js), UI polish, pledge certificate
(()=>{
const T=window.THREE,$=id=>document.getElementById(id);
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
function mount(id,build){
 const cv=$(id);if(!cv)return;
 if(!T){cv.replaceWith(Object.assign(document.createElement('div'),{className:'nogl',textContent:'3D preview unavailable offline'}));return;}
 let r;try{r=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true});}catch(e){cv.replaceWith(Object.assign(document.createElement('div'),{className:'nogl',textContent:'3D preview needs WebGL'}));return;}
 r.setPixelRatio(Math.min(devicePixelRatio,2));
 const s=new T.Scene(),c=new T.PerspectiveCamera(40,1,.1,100);c.position.set(0,.8,8);c.lookAt(0,.4,0);
 s.add(new T.AmbientLight(0x8899cc,.6));
 const l1=new T.PointLight(0xffc86b,2.2,40);l1.position.set(4,5,6);s.add(l1);
 const l2=new T.PointLight(0x3ad69a,1.6,40);l2.position.set(-5,-2,4);s.add(l2);
 const root=new T.Group();s.add(root);let tick=()=>{};const ret=build(root,s);if(typeof ret==='function')tick=ret;else if(ret&&ret.isGroup){root.add(ret);tick=ret.userData.tick;}
 let rx=0,ry=0,drag=false,px=0,py=0,vis=true;
 cv.addEventListener('pointerdown',e=>{drag=true;px=e.clientX;py=e.clientY;cv.setPointerCapture(e.pointerId);cv.style.cursor='grabbing'});
 cv.addEventListener('pointermove',e=>{if(!drag)return;ry+=(e.clientX-px)*.01;rx=Math.max(-1,Math.min(1,rx+(e.clientY-py)*.006));px=e.clientX;py=e.clientY});
 const up=()=>{drag=false;cv.style.cursor='grab'};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
 new IntersectionObserver(e=>vis=e[0].isIntersecting).observe(cv);
 const size=()=>{const w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;r.setSize(w,h,false);c.aspect=w/h;c.updateProjectionMatrix();};
 new ResizeObserver(size).observe(cv);size();
 const clk=new T.Clock();
 (function loop(){requestAnimationFrame(loop);if(!vis)return;const t=clk.getElapsedTime();if(!drag&&!reduce)ry+=.005;root.rotation.y=ry;root.rotation.x=rx;tick(t);r.render(s,c);})();
}
const std=(color,o={})=>new T.MeshStandardMaterial(Object.assign({color,roughness:.5,metalness:.3},o));
function ring(n,rad,col,size){const p=new Float32Array(n*3);for(let i=0;i<n;i++){const a=Math.random()*6.283,r=rad+(Math.random()-.5)*.5;p.set([Math.cos(a)*r,(Math.random()-.5)*.35,Math.sin(a)*r],i*3);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(p,3));return new T.Points(g,new T.PointsMaterial({color:col,size,transparent:true,opacity:.85}));}

window.HU_mount=mount;window.HU_std=std;
// 1 — Hero: Earth + diya + orbiting particles
mount('heroScene',g=>{
 g.add(new T.Mesh(new T.SphereGeometry(1.5,48,32),std(0x0f6b50,{roughness:.7,emissive:0x052a20})));
 g.add(new T.Mesh(new T.IcosahedronGeometry(1.58,2),new T.MeshBasicMaterial({color:0x7dddb2,wireframe:true,transparent:true,opacity:.3})));
 const bowl=new T.Mesh(new T.SphereGeometry(.6,32,16,0,6.283,1.5708,1.5708),std(0xc2622d,{roughness:.8,side:T.DoubleSide}));bowl.position.y=2.05;g.add(bowl);
 const flame=new T.Mesh(new T.ConeGeometry(.15,.55,16),new T.MeshBasicMaterial({color:0xffd27a}));flame.position.y=2.35;g.add(flame);
 const fl=new T.PointLight(0xffb84d,2.5,6);fl.position.y=2.4;g.add(fl);
 const gold=ring(500,2.6,0xf0bd69,.05),green=ring(500,3.1,0x63e5a6,.045);green.rotation.x=.6;g.add(gold,green);
 return t=>{const k=1+Math.sin(t*9)*.08+Math.sin(t*13)*.05;flame.scale.set(k,1+(k-1)*2,k);fl.intensity=2.2+Math.sin(t*11)*.5;gold.rotation.y=t*.3;green.rotation.y=-t*.2;};
});

// 2 — IoT sensor node
mount('nodeScene',g=>{
 const box=new T.Mesh(new T.BoxGeometry(2.6,1.7,1.5),std(0x1b3340,{metalness:.6,roughness:.35}));g.add(box);
 for(let i=0;i<5;i++){const v=new T.Mesh(new T.BoxGeometry(1.4,.05,.05),std(0x0a1822));v.position.set(-.4,.5-i*.2,.76);g.add(v);}
 const fan=new T.Group();for(let i=0;i<4;i++){const b=new T.Mesh(new T.BoxGeometry(.55,.12,.02),std(0x8be4ba));b.position.x=.28;const h=new T.Group();h.add(b);h.rotation.z=i*1.5708;fan.add(h);}fan.position.set(.85,-.35,.77);g.add(fan);
 const lens=new T.Mesh(new T.CylinderGeometry(.28,.28,.2,24),std(0x07101a));lens.rotation.x=1.5708;lens.position.set(.85,.45,.8);g.add(lens);
 const lr=new T.Mesh(new T.TorusGeometry(.3,.04,12,32),new T.MeshBasicMaterial({color:0xf0bd69}));lr.position.set(.85,.45,.9);g.add(lr);
 const led=new T.Mesh(new T.SphereGeometry(.08,16,16),new T.MeshBasicMaterial({color:0x63e5a6}));led.position.set(-1.05,-.6,.78);g.add(led);
 const ant=new T.Mesh(new T.CylinderGeometry(.04,.04,1.1,10),std(0xc3d5d7));ant.position.set(-1,1.4,-.4);g.add(ant);
 const pm=ring(260,1.9,0x9bb0b6,.04);g.add(pm);g.position.y=-.1;
 return t=>{fan.rotation.z=t*8;led.scale.setScalar(1+Math.sin(t*4)*.35);pm.rotation.y=t*.4;};
});

// 3 — Conventional vs green burst
mount('burstScene',g=>{
 const N=420,mk=(col,size,spread)=>{const d=[],p=new Float32Array(N*3);for(let i=0;i<N;i++){const u=Math.random()*2-1,a=Math.random()*6.283,s=Math.sqrt(1-u*u);d.push([s*Math.cos(a),u,s*Math.sin(a),.4+Math.random()*spread]);}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(p,3));const pts=new T.Points(geo,new T.PointsMaterial({color:col,size,transparent:true,opacity:.8}));return{pts,d,p,geo};};
 const a=mk(0x9a8f86,.1,1.9),b=mk(0x63e5a6,.06,.9);a.pts.position.x=-2.1;b.pts.position.x=2.1;g.add(a.pts,b.pts);
 const upd=(o,ph)=>{for(let i=0;i<N;i++){const d=o.d[i],r=d[3]*ph*1.6;o.p.set([d[0]*r,d[1]*r,d[2]*r],i*3);}o.geo.attributes.position.needsUpdate=true;o.pts.material.opacity=.9*(1-ph*.7);};
 return t=>{const ph=(t%4)/4;upd(a,ph);upd(b,ph);};
});

// 4 — Thermal hotspot map (8x8 array like MLX90640-class sensors, illustrative)
mount('thermalScene',g=>{const cells=[];for(let x=0;x<8;x++)for(let z=0;z<8;z++){const m=new T.Mesh(new T.BoxGeometry(.44,1,.44),std(0x2266aa,{metalness:.1}));m.position.set((x-3.5)*.5,0,(z-3.5)*.5);g.add(m);cells.push([m,x,z]);}g.rotation.x=.1;
 return t=>{const hx=3.5+Math.sin(t*.8)*2.6,hz=3.5+Math.cos(t*.6)*2.6;cells.forEach(([m,x,z])=>{const k=Math.max(0,1-Math.hypot(x-hx,z-hz)/3);m.scale.y=.2+k*2.4;m.position.y=m.scale.y/2-.6;m.material.color.setHSL(.62-k*.62,.9,.5);});};});

// UI polish
const bar=document.createElement('div');bar.className='progress';document.body.prepend(bar);
const top=document.createElement('button');top.className='to-top';top.setAttribute('aria-label','Back to top');top.textContent='↑';top.onclick=()=>scrollTo({top:0,behavior:'smooth'});document.body.append(top);
addEventListener('scroll',()=>{const h=document.documentElement;bar.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';top.classList.toggle('show',h.scrollTop>700);},{passive:true});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.08});
document.querySelectorAll('.section').forEach(s=>io.observe(s));
const links=[...document.querySelectorAll('#nav a')];
const spy=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id));}),{rootMargin:'-45% 0px -50% 0px'});
links.forEach(a=>{const s=document.querySelector(a.getAttribute('href'));if(s)spy.observe(s);});
if(!reduce&&matchMedia('(pointer:fine)').matches)document.querySelectorAll('.card,.research-card,.team-card,.scene-card').forEach(el=>{
 el.addEventListener('pointermove',e=>{const b=el.getBoundingClientRect(),x=(e.clientX-b.left)/b.width-.5,y=(e.clientY-b.top)/b.height-.5;el.style.transform=`perspective(900px) rotateY(${x*6}deg) rotateX(${-y*6}deg) translateZ(4px)`;});
 el.addEventListener('pointerleave',()=>el.style.transform='');});
document.querySelectorAll('.stats strong').forEach(el=>{const m=el.textContent.match(/^(\d+)(.*)$/);if(!m)return;const end=+m[1];new IntersectionObserver((e,o)=>{if(!e[0].isIntersecting)return;o.disconnect();const t0=performance.now();(function f(n){const k=Math.min(1,(n-t0)/1200);el.textContent=Math.round(end*k)+m[2];if(k<1)requestAnimationFrame(f);})(t0);}).observe(el);});

// Live demo stream (re-uses the demo loader; clearly labelled DEMO DATA in the UI)
let streamT=null;const sb=$('streamDemo');
if(sb)sb.addEventListener('click',()=>{if(streamT){clearInterval(streamT);streamT=null;sb.textContent='Stream demo (live)';sb.classList.remove('live');return;}$('demoSensor').click();streamT=setInterval(()=>$('demoSensor').click(),2000);sb.textContent='Stop demo stream';sb.classList.add('live');});

// Pledge: persistence + downloadable certificate
const checks=[...document.querySelectorAll('.pledgeCheck')],nameIn=$('pledgeName'),cert=$('certBtn');
const store={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
const sync=()=>{const n=checks.filter(c=>c.checked).length;cert.disabled=n===0||!nameIn.value.trim();store.set('hu_pledge',JSON.stringify({n:nameIn.value,c:checks.map(c=>c.checked)}));};
try{const s=JSON.parse(store.get('hu_pledge')||'null');if(s){nameIn.value=s.n||'';checks.forEach((c,i)=>{c.checked=!!s.c[i];});checks[0].dispatchEvent(new Event('change'));}}catch(e){}
checks.forEach(c=>c.addEventListener('change',sync));nameIn.addEventListener('input',sync);sync();
cert.addEventListener('click',()=>{const c=document.createElement('canvas');c.width=1400;c.height=900;const g=c.getContext('2d');
 const bg=g.createLinearGradient(0,0,1400,900);bg.addColorStop(0,'#07131d');bg.addColorStop(1,'#0f3a30');g.fillStyle=bg;g.fillRect(0,0,1400,900);
 g.strokeStyle='#8be4ba';g.lineWidth=4;g.strokeRect(40,40,1320,820);g.strokeStyle='#f0bd69';g.lineWidth=1.5;g.strokeRect(58,58,1284,784);
 g.textAlign='center';g.fillStyle='#8be4ba';g.font='600 24px sans-serif';g.fillText('HARIT UTSAV AI  ·  GREEN FESTIVAL PLEDGE',700,150);
 g.fillStyle='#fff';g.font='700 64px sans-serif';g.fillText('Certificate of Commitment',700,250);
 g.fillStyle='#9bb0b6';g.font='26px sans-serif';g.fillText('This recognises the personal pledge of',700,330);
 g.fillStyle='#f0bd69';g.font='700 76px sans-serif';g.fillText(nameIn.value.trim().slice(0,32),700,440);
 const sel=checks.filter(x=>x.checked).map(x=>x.parentElement.textContent.trim());g.fillStyle='#eaf3f5';g.font='25px sans-serif';
 sel.forEach((t,i)=>g.fillText('✦  '+t.slice(0,78),700,540+i*48));
 g.fillStyle='#9bb0b6';g.font='20px sans-serif';g.fillText(new Date().toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'})+'  ·  MVA Robotics Innovation Org, Jharkhand Rai University',700,810);
 const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='harit-utsav-pledge-certificate.png';a.click();});
})();
