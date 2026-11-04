// HARIT UTSAV AI — Fireworks House: 8 shell types, synthesised sound (Web Audio), show composer, video + image capture
(()=>{
const $=id=>document.getElementById(id),dpr=Math.min(devicePixelRatio||1,2);
const cv=$('fwhCanvas'),g=cv.getContext('2d'),mc=$('fwhMeter').getContext('2d');
const KINDS=['peony','willow','ring','heart','spiral','palm','strobe','saturn','kamuro','crossette','comet'];
let W=0,H=0,P=[],R=[],flash=0,fx=0,fy=0,fh=30,smoke=false,vis=true,shells=0,fN=0,fT=performance.now(),fps=60,timers=[],sel='peony',autoT=0;
let ac=null,master,verb,an,recDest,nb,muted=false,preset='epic',vol=.85,bpm=110,music=false,nextT=0,step=0;
const stars=[...Array(90)].map(()=>[Math.random(),Math.random()*.7,Math.random()*6.28]);let sky=[];
const rs=()=>{W=cv.width=cv.clientWidth*dpr;H=cv.height=cv.clientHeight*dpr;sky=[];let x=0;while(x<1){const w=.015+Math.random()*.03;sky.push([x,w,.04+Math.random()*.13]);x+=w+.002;}};
new ResizeObserver(rs).observe(cv);rs();
const hsl=(h,l=62)=>`hsl(${h|0},100%,${l}%)`;

// ----- audio engine -----
function audio(){if(ac)return;ac=new(window.AudioContext||window.webkitAudioContext)();master=ac.createGain();master.gain.value=vol*1.9;an=ac.createAnalyser();an.fftSize=64;
 recDest=ac.createMediaStreamDestination();verb=ac.createConvolver();const n=ac.sampleRate*1.8,b=ac.createBuffer(2,n,ac.sampleRate);
 for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3);}
 verb.buffer=b;const wet=ac.createGain();wet.gain.value=.3;verb.connect(wet);wet.connect(master);const cp=ac.createDynamicsCompressor();cp.threshold.value=-16;cp.knee.value=12;cp.ratio.value=10;cp.attack.value=.003;cp.release.value=.25;master.connect(cp);cp.connect(an);an.connect(ac.destination);cp.connect(recDest);loadSamples();
 nb=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
const out=(node,pan)=>{if(ac.createStereoPanner){const p=ac.createStereoPanner();p.pan.value=Math.max(-1,Math.min(1,pan));node.connect(p);p.connect(master);p.connect(verb);}else node.connect(master);};
function tone(type,f0,f1,dur,v,pan,t=0){const o=ac.createOscillator(),gn=ac.createGain(),n=ac.currentTime+t;o.type=type;o.frequency.setValueAtTime(f0,n);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),n+dur);gn.gain.setValueAtTime(v,n);gn.gain.exponentialRampToValueAtTime(.001,n+dur);o.connect(gn);out(gn,pan);o.start(n);o.stop(n+dur+.05);}
function hiss(dur,v,f,type,pan,t=0,f1){const s=ac.createBufferSource(),fl=ac.createBiquadFilter(),gn=ac.createGain(),n=ac.currentTime+t;s.buffer=nb;fl.type=type;fl.frequency.setValueAtTime(f,n);if(f1)fl.frequency.exponentialRampToValueAtTime(f1,n+dur);gn.gain.setValueAtTime(v,n);gn.gain.exponentialRampToValueAtTime(.001,n+dur);s.connect(fl);fl.connect(gn);out(gn,pan);s.start(n,Math.random());s.stop(n+dur);}
const SMP={};let hasReal=false,BANGS=[];
async function loadSamples(){await Promise.all([...Array(12)].map((_,i)=>'bang'+(i+1)).concat(['whistle','crackle','finale']).map(async n=>{for(const ext of['mp3','wav','ogg']){try{const r=await fetch('assets/audio/'+n+'.'+ext);if(!r.ok)continue;SMP[n]=await ac.decodeAudioData(await r.arrayBuffer());break;}catch(e){}}}));
 BANGS=Object.keys(SMP).filter(k=>k.startsWith('bang')).map(k=>SMP[k]);hasReal=BANGS.length>0;if(hasReal){setPreset('real');const m=document.getElementById('clipMsg');if(m)m.textContent='Real recorded fireworks sounds loaded from assets/audio/.';}}
function play(buf,v,pan,rate=1,t=0){if(!buf)return;const s=ac.createBufferSource(),gn=ac.createGain();s.buffer=buf;s.playbackRate.value=rate;gn.gain.value=v;s.connect(gn);out(gn,pan);s.start(ac.currentTime+t);}
const SC=[261.6,293.7,329.6,392,440,523.3,587.3,659.3,784,880];
const ok=()=>ac&&!muted;
const sfx={
 launch(pan){if(!ok())return;if(preset==='real'&&hasReal){if(SMP.whistle)play(SMP.whistle,.55,pan,.9+Math.random()*.2);else{hiss(.8,.2,500,'bandpass',pan,0,3200);tone('sine',500,3600,.75,.04,pan);}return;}if(preset==='epic'){hiss(.8,.2,500,'bandpass',pan,0,3200);tone('sine',500,3600,.75,.04,pan);return;}hiss(.7,preset==='chimes'?.08:.22,500,'bandpass',pan,0,2400);if(preset!=='chimes')tone('sine',1500,2800,.6,.025,pan);},
 burst(pan,kind,hue){if(!ok())return;if(preset==='real'&&hasReal){play(BANGS[Math.random()*BANGS.length|0],(kind==='saturn'||kind==='peony'||kind==='kamuro'?1.9:1.4)*(.85+Math.random()*.3),pan,.92+Math.random()*.16);if(SMP.crackle&&(kind==='strobe'||kind==='willow'||kind==='kamuro'||kind==='palm'))play(SMP.crackle,.7,pan,.95+Math.random()*.1,.25);return;}const i=KINDS.indexOf(kind),crk=kind==='strobe'||kind==='willow'||kind==='palm';
  if(preset==='epic'){tone('sine',110,24,1.5,1.1,pan);tone('sawtooth',62,22,1,.28,pan);hiss(.7,.9,1000,'lowpass',pan,0,110);hiss(1.1,.3,320,'bandpass',pan,.3,90);tone('sine',55,24,.8,.5,pan,.34);for(let k=0;k<18;k++)hiss(.03,.2,3800+Math.random()*3500,'highpass',pan,.15+Math.random()*1.6);}
  else if(preset==='cinematic'){tone('sine',130,30,.9,.95,pan);hiss(.4,.7,1200,'lowpass',pan,0,200);}
  else if(preset==='synth'){tone('sine',95,40,.4,.5,pan);for(let k=0;k<4;k++)tone('triangle',SC[(i+k*2)%10],SC[(i+k*2)%10],.35,.16,pan,k*.07);}
  else{tone('sine',70,40,.5,.25,pan);const f=SC[(hue/36|0)%10]*2;tone('sine',f,f,1.4,.2,pan);tone('sine',f*1.5,f*1.5,1,.08,pan,.06);}
  if(crk)for(let k=0;k<(preset==='chimes'?4:12);k++)hiss(.03,.22,3500+Math.random()*3000,'highpass',pan,.2+Math.random()*1.3);}
};
const scheduler=setInterval(()=>{if(!music||!ac||muted)return;while(nextT<ac.currentTime+.15){const t=Math.max(0,nextT-ac.currentTime);
  if(step%4===0)tone('sine',140,45,.25,.5,0,t);if(step%2===1)hiss(.05,.1,7000,'highpass',0,t);
  if(step%2===0){const f=[55,55,65.4,73.4][(step/2|0)%4];tone('triangle',f,f,.3,.22,0,t);}
  nextT+=60/bpm/2;step++;}},25);

// ----- shells -----
function launch(kind=sel,xf){const x=W*(xf??(.12+Math.random()*.76));R.push({x,y:H*.92,ty:H*(.14+Math.random()*.3),vy:-H/70,kind,hue:Math.random()*360});shells++;sfx.launch(x/W*2-1);}
function burst(x,y,kind,hue){const add=(a,s,o={})=>P.push(Object.assign({x,y,vx:Math.cos(a)*s*dpr,vy:Math.sin(a)*s*dpr,life:1,dec:.012,c:hsl(hue+Math.random()*30-15),w:.05,s:2.2},o));
 if(kind==='peony')for(let i=0;i<190;i++)add(Math.random()*6.283,1+Math.random()*4.6);
 if(kind==='willow')for(let i=0;i<90;i++)add(Math.random()*6.283,.8+Math.random()*2.6,{dec:.005,w:.025,c:'#ffc86b',tr:1});
 if(kind==='ring')for(let i=0;i<80;i++)add(i/80*6.283,4);
 if(kind==='heart')for(let i=0;i<100;i++){const t=i/100*6.283;P.push({x,y,vx:16*Math.sin(t)**3*.22*dpr,vy:-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))*.22*dpr,life:1,dec:.012,c:hsl(340),w:.03,s:2.4});}
 if(kind==='spiral')for(let i=0;i<110;i++)add(i*.5,.5+i*.04);
 if(kind==='palm')for(let i=0;i<14;i++)add(i/14*6.283,3+Math.random(),{split:1,dec:.01,tr:1});
 if(kind==='strobe')for(let i=0;i<110;i++)add(Math.random()*6.283,.8+Math.random()*3,{glit:1,c:'#fff',dec:.008});
 if(kind==='kamuro')for(let i=0;i<130;i++)add(Math.random()*6.283,.8+Math.random()*3,{dec:.0032,w:.022,c:'#ffd27a',tr:1});
 if(kind==='crossette')for(let i=0;i<10;i++)add(i/10*6.283,3.4,{split:1,dec:.01,tr:1});
 if(kind==='comet')for(let i=0;i<14;i++)add(i/14*6.283,4.6+Math.random(),{dec:.006,w:.008,tr:1,s:3});
 if(kind==='saturn'){for(let i=0;i<70;i++)add(Math.random()*6.283,Math.random()*1.8);for(let i=0;i<60;i++){const a=i/60*6.283;P.push({x,y,vx:Math.cos(a)*4.2*dpr,vy:Math.sin(a)*1.1*dpr,life:1,dec:.012,c:hsl(hue+40),w:.03,s:2.2});}}
 if(smoke)for(let i=0;i<10;i++)P.push({x,y,vx:(Math.random()-.5)*1.4*dpr,vy:-Math.random()*.8*dpr,life:1.8,dec:.004,smoke:1});
 flash=1;fx=x;fy=y;fh=hue;const pn=x/W*2-1,dl=140+(H-y)/H*380;setTimeout(()=>{sfx.burst(pn,kind,hue);if(!matchMedia('(prefers-reduced-motion:reduce)').matches)$('fwhStage').animate([{transform:'translate(0)'},{transform:`translate(${(Math.random()-.5)*7}px,${(Math.random()-.5)*7}px)`},{transform:'translate(0)'}],{duration:140});},dl);}
(function frame(now){requestAnimationFrame(frame);if(!vis||!W)return;
 if(now-autoT>1700&&!matchMedia('(prefers-reduced-motion:reduce)').matches){autoT=now;launch(KINDS[Math.random()*KINDS.length|0]);}
 g.globalCompositeOperation='source-over';g.fillStyle='rgba(4,8,20,.22)';g.fillRect(0,0,W,H);
 stars.forEach(s=>{g.globalAlpha=.3+.3*Math.sin(now*.002+s[2]);g.fillStyle='#cfe';g.fillRect(s[0]*W,s[1]*H,dpr,dpr);});g.globalAlpha=1;
 if(flash>.01){const gr=g.createRadialGradient(fx,fy,0,fx,fy,H*.8);gr.addColorStop(0,`hsla(${fh|0},100%,60%,${flash*.28})`);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,W,H);flash*=.9;}
 g.globalCompositeOperation='lighter';
 R=R.filter(r=>{r.y+=r.vy;P.push({x:r.x,y:r.y,vx:(Math.random()-.5)*.4,vy:.5,life:.5,dec:.05,c:'#ffd9a0',w:.02,s:1.4});g.fillStyle='#fff';g.fillRect(r.x,r.y,2*dpr,6*dpr);if(r.y<=r.ty){burst(r.x,r.y,r.kind,r.hue);return false;}return true;});
 const Q=[];P=P.filter(p=>{p.x+=p.vx;p.y+=p.vy;
  if(p.smoke){p.vx*=.99;p.life-=p.dec;g.fillStyle=`rgba(140,140,140,${p.life*.1})`;g.beginPath();g.arc(p.x,p.y,(14+(1.8-p.life)*40)*dpr,0,6.283);g.fill();return p.life>0;}
  p.vx*=.985;p.vy=p.vy*.985+p.w*dpr;p.life-=p.dec;
  if(p.tr&&Math.random()<.5)Q.push({x:p.x,y:p.y,vx:0,vy:.3*dpr,life:.6,dec:.04,c:p.c,w:.02,s:1.4});
  if(p.split&&p.life<.55){for(let k=0;k<5;k++){const a=Math.random()*6.283;Q.push({x:p.x,y:p.y,vx:Math.cos(a)*1.6*dpr,vy:Math.sin(a)*1.6*dpr,life:.8,dec:.02,c:p.c,w:.04,s:2});}p.life=0;}
  g.globalAlpha=p.glit&&Math.random()<.5?0:Math.max(0,p.life);g.fillStyle=p.c;g.fillRect(p.x,p.y,p.s*dpr,p.s*dpr);g.globalAlpha=1;return p.life>0;});
 P.push(...Q);if(P.length>4000)P.splice(0,P.length-4000);
 g.globalCompositeOperation='source-over';g.fillStyle='#050a14';sky.forEach(([x,w,h])=>g.fillRect(x*W,H-h*H,w*W+1,h*H));
 if(++fN%20===0){fps=Math.round(20000/(now-fT));fT=now;$('hShells').textContent=shells;$('hParts').textContent=P.length;$('hFps').textContent=fps;}
 mc.clearRect(0,0,160,40);if(an){const d=new Uint8Array(an.frequencyBinCount);an.getByteFrequencyData(d);for(let i=0;i<16;i++){const h=d[i*2]/255*38;mc.fillStyle=`hsl(${150-i*6},80%,60%)`;mc.fillRect(i*10,40-h,8,h);}}
})(0);
new IntersectionObserver(e=>vis=e[0].isIntersecting).observe(cv);
cv.addEventListener('pointerdown',e=>{const b=cv.getBoundingClientRect();launch(sel,(e.clientX-b.left)/b.width);});

// ----- controls -----
const pick=(attr,fn)=>document.querySelectorAll(`[data-${attr}]`).forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll(`[data-${attr}]`).forEach(x=>x.classList.remove('on'));b.classList.add('on');fn(b.dataset[attr],b);}));
pick('shell',v=>{sel=v;launch(v);});
const setPreset=v=>{preset=(v==='real'&&!hasReal)?'epic':v;document.querySelectorAll('[data-preset]').forEach(x=>x.classList.toggle('on',x.dataset.preset===preset));};
pick('preset',setPreset);pick('smoke',v=>smoke=v==='1');
const gate=$('fwhSound');
gate.onclick=async()=>{audio();await ac.resume();muted=!muted&&gate.dataset.on==='1';gate.dataset.on=muted?'0':'1';gate.textContent=muted?'🔇 Sound off':'🔊 Sound on';gate.classList.toggle('live',!muted);};
$('fwhVol').oninput=e=>{vol=e.target.value/100;if(master)master.gain.value=vol*1.9;};
$('fwhMusic').onchange=async e=>{if(!ac)gate.click();audio();await ac.resume();music=e.target.checked;nextT=ac.currentTime+.1;step=0;};
$('fwhBpm').oninput=e=>{bpm=+e.target.value;$('fwhBpmOut').textContent=bpm;};
const SHOWS={
 finale:{p:'cinematic',ev:()=>{const e=[];for(let b=0;b<24;b++)e.push([b*.5,KINDS[b%KINDS.length],.15+(b*.137)%.7]);for(let i=0;i<12;i++)e.push([13+i*.25,KINDS[i%KINDS.length],.1+i*.07]);return e;}},
 waltz:{p:'chimes',ev:()=>[...Array(8)].map((_,b)=>[b*2,b%2?'willow':'palm',.2+(b*.19)%.6])},
 grand:{p:()=>hasReal?'real':'epic',ev:()=>{const e=[];for(let b=0;b<44;b++)e.push([b*.35,KINDS[(b*5)%KINDS.length],.08+(b*.173)%.84]);for(let i=0;i<10;i++)e.push([16+i*.12,KINDS[i%KINDS.length],.1+i*.09]);return e;}},
 pulse:{p:'synth',ev:()=>[...Array(16)].map((_,b)=>[b,b%2?'ring':'peony',.2+(b*.11)%.6])}
};
function stopShow(){timers.forEach(clearTimeout);timers=[];$('showBar').style.width='0';}
pick('show',v=>{stopShow();if(v==='stop')return;const s=SHOWS[v],ms=60000/bpm,ev=s.ev();setPreset(typeof s.p==='function'?s.p():s.p);if(v==='grand'&&hasReal&&SMP.finale&&ac&&!muted)play(SMP.finale,1,0,1,.2);
 ev.forEach(([b,k,x])=>timers.push(setTimeout(()=>launch(k,x),b*ms)));const total=Math.max(...ev.map(e=>e[0]))*ms+2500,t0=performance.now();
 const iv=setInterval(()=>{const k=(performance.now()-t0)/total;$('showBar').style.width=Math.min(100,k*100)+'%';if(k>=1)clearInterval(iv);},100);timers.push(iv);});
$('fwhFull').onclick=()=>$('fwhStage').requestFullscreen?.();

// ----- capture: image + video -----
const snaps=$('snaps');
$('fwhSnap').onclick=()=>{const u=cv.toDataURL('image/jpeg',.9),a=document.createElement('a'),im=new Image();a.href=u;a.download='harit-fireworks-'+Date.now()+'.jpg';im.src=u;im.alt='Saved fireworks snapshot';a.append(im);snaps.prepend(a);while(snaps.children.length>8)snaps.lastChild.remove();};
let rec=null,chunks=[];
$('fwhRec').onclick=()=>{const b=$('fwhRec');if(rec){rec.stop();return;}
 if(!cv.captureStream||!window.MediaRecorder){$('clipMsg').textContent='Video recording is not supported in this browser.';return;}
 const st=cv.captureStream(30);if(ac&&recDest)recDest.stream.getAudioTracks().forEach(t=>st.addTrack(t));
 const mt=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(m=>MediaRecorder.isTypeSupported(m));
 rec=new MediaRecorder(st,mt?{mimeType:mt,videoBitsPerSecond:4e6}:{});chunks=[];rec.ondataavailable=e=>e.data.size&&chunks.push(e.data);
 rec.onstop=()=>{const u=URL.createObjectURL(new Blob(chunks,{type:'video/webm'}));const v=$('clip');v.src=u;v.hidden=false;const a=$('clipDl');a.href=u;a.hidden=false;$('clipMsg').textContent='Your clip is ready. Download it below'+(ac?'.':' (enable sound before recording to include audio).');rec=null;b.textContent='● Record video';b.classList.remove('rec');};
 rec.start();b.textContent='■ Stop recording';b.classList.add('rec');$('clipMsg').textContent='Recording the canvas'+(ac?' with sound':' (silent: enable sound first for audio)')+'…';};

// ----- gallery zoom -----
document.querySelectorAll('.gallery img').forEach(im=>im.addEventListener('click',()=>{const z=document.createElement('div');z.className='zoomer';const i2=new Image();i2.src=im.src;i2.alt=im.alt;z.append(i2);z.onclick=()=>z.remove();document.body.append(z);}));
window.HU_FW={launch,KINDS,bang:(v,pan)=>{if(!ac||muted||!hasReal)return false;play(BANGS[Math.random()*BANGS.length|0],v*2,pan,.94+Math.random()*.12);return true;},show:(v,quiet)=>{const b=document.querySelector(`[data-show="${v}"]`);if(b)b.click();}};
})();
