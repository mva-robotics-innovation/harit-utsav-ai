// HARIT UTSAV AI v4.0 Launch Edition — entry gate, UI sound, ambient fireworks, cinematic showcase, legal, PWA
(()=>{
const $=id=>document.getElementById(id),RM=matchMedia('(prefers-reduced-motion:reduce)').matches,dpr=Math.min(devicePixelRatio||1,2);
const st={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
let sfx=st.get('hu_sfx')!=='0',ux=null,nz=null;
const A=()=>{if(!ux){ux=new(window.AudioContext||window.webkitAudioContext)();nz=ux.createBuffer(1,ux.sampleRate*2,ux.sampleRate);const d=nz.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}if(ux.state==='suspended')ux.resume();return ux;};
function blip(f=1200,f2=1800,d=.07,v=.04,type='sine'){if(!sfx)return;try{const a=A(),o=a.createOscillator(),g=a.createGain(),t=a.currentTime;o.type=type;o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0008,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.02);}catch(e){}}
function noise(dur,v,type,f,f2,pan=0,t0=0){const a=A(),s=a.createBufferSource(),fl=a.createBiquadFilter(),g=a.createGain(),t=a.currentTime+t0;s.buffer=nz;fl.type=type;fl.frequency.setValueAtTime(f,t);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+dur);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(fl);fl.connect(g);let n=g;if(a.createStereoPanner){const p=a.createStereoPanner();p.pan.value=pan;g.connect(p);n=p;}n.connect(a.destination);s.start(t,Math.random());s.stop(t+dur);}
function whoosh(pan=0){if(!sfx)return;try{noise(.7,.12,'bandpass',500,3000,pan);blip(700,3400,.65,.02);}catch(e){}}
function boom(v=.6,pan=0){if(!sfx)return;if(window.HU_FW&&HU_FW.bang&&HU_FW.bang(v,pan))return;try{const a=A(),t=a.currentTime;[[130,28,1.1,v,'sine'],[70,24,1.4,v*.6,'sawtooth']].forEach(([f,f2,d,vv,ty])=>{const o=a.createOscillator(),g=a.createGain();o.type=ty;o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(vv*.6,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.05);});
 noise(.5,v,'lowpass',1400,160,pan);noise(1.2,v*.3,'bandpass',300,90,pan,.28);for(let k=0;k<14;k++)noise(.03,.16,'highpass',4200+Math.random()*3000,0,pan,.15+Math.random()*1.4);}catch(e){}}

window.HU_SND={boom,whoosh,blip,on:()=>sfx};
// ---- UI sounds (hover / click) ----
let lastEl=null;const HOT='.btn,.chip,#nav a,.top-cta,.research-card,.team-card,.scene-card,.sc-thumbs button,.lang-btn';
document.addEventListener('pointerover',e=>{const el=e.target.closest?.(HOT);if(el&&el!==lastEl){lastEl=el;blip(1500,2300,.05,.018,'triangle');}else if(!el)lastEl=null;});
document.addEventListener('pointerdown',e=>{if(e.target.closest?.(HOT))blip(420,1500,.13,.05,'sawtooth');},true);
const sb=document.createElement('button');sb.className='sfx-btn';const paint=()=>{sb.textContent=sfx?'🔊 UI SOUND ON':'🔇 UI SOUND OFF';sb.setAttribute('aria-pressed',sfx);};paint();
sb.onclick=()=>{sfx=!sfx;st.set('hu_sfx',sfx?'1':'0');paint();if(sfx)blip(500,1800,.2,.06);};document.body.append(sb);

// ---- ambient fireworks layer ----
const bc=$('bgfx'),g=bc.getContext('2d');let W=0,H=0,P=[],R=[],tabOn=true;
const rs=()=>{W=bc.width=innerWidth*dpr;H=bc.height=innerHeight*dpr;};addEventListener('resize',rs);rs();
document.addEventListener('visibilitychange',()=>tabOn=!document.hidden);
function shell(x,hue=Math.random()*360,kind=['peony','ring','heart','star'][Math.random()*4|0],silent){R.push({x,y:H,ty:H*(.14+Math.random()*.32),vy:-H/52,hue,kind});if(!silent)whoosh(x/W*2-1);}
function pop(r){const n=kind=>kind==='ring'?72:kind==='heart'?90:130;const k=r.kind,N=n(k);
 for(let i=0;i<N;i++){let a=Math.random()*6.283,s=1+Math.random()*4.6,vx,vy;
  if(k==='ring'){a=i/N*6.283;s=4.2;}
  if(k==='heart'){const t=i/N*6.283;vx=16*Math.sin(t)**3*.23;vy=-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))*.23;}
  else if(k==='star'){const sp=i%5;a=sp/5*6.283+(i/N)*.5;s=1+((i/5|0)%12)*.35;}
  if(vx===undefined){vx=Math.cos(a)*s;vy=Math.sin(a)*s;}
  P.push({x:r.x,y:r.y,vx:vx*dpr,vy:vy*dpr,l:1,h:r.hue+Math.random()*40-20});}
 boom(.45+Math.random()*.25,r.x/W*2-1);document.body.classList.add('flash');setTimeout(()=>document.body.classList.remove('flash'),90);}
(function loop(){requestAnimationFrame(loop);if(!tabOn||(!P.length&&!R.length))return;
 g.globalCompositeOperation='destination-out';g.fillStyle='rgba(0,0,0,.2)';g.fillRect(0,0,W,H);g.globalCompositeOperation='lighter';
 R=R.filter(r=>{r.y+=r.vy;g.fillStyle='#fff';g.fillRect(r.x,r.y,2*dpr,7*dpr);if(r.y<=r.ty){pop(r);return false;}return true;});
 P=P.filter(p=>{p.x+=p.vx;p.y+=p.vy;p.vx*=.985;p.vy=p.vy*.985+.045*dpr;p.l-=.013;g.globalAlpha=Math.max(0,p.l);g.fillStyle=`hsl(${p.h|0},100%,62%)`;g.fillRect(p.x,p.y,2.4*dpr,2.4*dpr);return p.l>0;});g.globalAlpha=1;if(P.length>3500)P.splice(0,P.length-3500);})();
const salvo=(n=8)=>{for(let i=0;i<n;i++)setTimeout(()=>shell(W*(.1+Math.random()*.8)),i*320);};
if(!RM)setInterval(()=>{if(tabOn&&scrollY<innerHeight*1.4)shell(W*(.1+Math.random()*.8));},6500);

// ---- entry gate ----
const gate=$('gate');
function enter(snd){if(!gate)return;sfx=snd;st.set('hu_sfx',snd?'1':'0');paint();gate.classList.add('out');setTimeout(()=>gate.remove(),900);
 if(snd){blip(160,1800,.7,.07,'sawtooth');const b=$('fwhSound');if(b&&b.dataset.on!=='1')b.click();}
 if(!RM)setTimeout(()=>salvo(9),350);}
if(gate){$('enterSound').onclick=()=>enter(true);$('enterSilent').onclick=()=>enter(false);addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('gate'))enter(false);});}
const ha=document.querySelector('.hero-actions');if(ha){const b=document.createElement('button');b.className='btn secondary glow';b.textContent='🎆 Fire a salvo';b.onclick=()=>{salvo(8);if(window.HU_FW)HU_FW.show?.('grand',true);};ha.append(b);}
$('home')?.addEventListener('click',e=>{if(e.target.closest('a,button,canvas'))return;shell(e.clientX*dpr,Math.random()*360);});

// ---- cinematic showcase: real photos first (with credits), then generated artwork ----
(async()=>{const stage=$('scStage');if(!stage)return;const cap=$('scCap'),th=$('scThumbs'),cr=$('scCredit'),first=stage.querySelector('.sc-slide');let cre={};
 try{(await(await fetch('CREDITS.md')).text()).split(/\r?\n/).forEach(l=>{const m=l.match(/`assets\/photos\/(photo-\d)\.jpg` - File:(.+?) by (.+?) \((.+?)\) (https?:\/\/\S+)/);if(m)cre[m[1]]={t:m[2].replace(/\.\w+$/,''),a:m[3],l:m[4],u:m[5]};});}catch(e){}
 (await Promise.all([1,2,3,4,5,6].map(i=>new Promise(r=>{const im=new Image();im.className='sc-slide';im.dataset.k='photo-'+i;im.alt='Fireworks photo '+i;im.onload=()=>r(im);im.onerror=()=>r(null);im.src='assets/photos/photo-'+i+'.jpg';})))).filter(Boolean).forEach(im=>stage.insertBefore(im,first));
 const sl=[...stage.querySelectorAll('.sc-slide')];let ix=0,tm=null;if(!sl.length)return;
 sl.forEach((s,i)=>{const b=document.createElement('button');b.setAttribute('aria-label','Show image '+(i+1));b.style.backgroundImage=`url(${s.src})`;b.onclick=()=>go(i,true);th.append(b);});
 function go(i,user){ix=(i+sl.length)%sl.length;const s=sl[ix],c=cre[s.dataset.k];sl.forEach((x,k)=>x.classList.toggle('on',k===ix));[...th.children].forEach((b,k)=>b.classList.toggle('on',k===ix));
  cap.textContent=c?c.t:s.alt;cr.replaceChildren();if(c){const a=document.createElement('a');a.href=c.u;a.target='_blank';a.rel='noopener';a.textContent='Photo: '+c.a;cr.append(a,' · '+c.l+' · Wikimedia Commons');}else cr.textContent='Generated artwork';
  if(user){clearInterval(tm);tm=setInterval(()=>go(ix+1),6500);}}
 go(0);tm=setInterval(()=>{if(tabOn)go(ix+1);},6500);$('scPrev').onclick=()=>go(ix-1,true);$('scNext').onclick=()=>go(ix+1,true);
 stage.addEventListener('click',e=>{if(e.target.closest('button,a'))return;const z=document.createElement('div');z.className='zoomer';const im=new Image();im.src=sl[ix].src;im.alt=sl[ix].alt;z.append(im);z.onclick=()=>z.remove();document.body.append(z);});
 $('scBoom').onclick=()=>salvo(7);})();

// ---- cursor glow + legal modal ----
if(matchMedia('(pointer:fine)').matches&&!RM){const c=document.createElement('div');c.className='cursor-glow';document.body.append(c);addEventListener('pointermove',e=>{c.style.transform=`translate(${e.clientX}px,${e.clientY}px)`;},{passive:true});}
const LEG={Privacy:'Camera frames, snapshots and sensor readings are processed in your browser and are not uploaded by this app. Settings (language, sound, pledge) are stored in your browser\'s local storage and can be cleared at any time. No accounts, cookies for advertising or analytics are used by this static build. If you add a backend, analytics or cloud storage, update this notice and review obligations under the Digital Personal Data Protection Act, 2023.',
Terms:'HARIT UTSAV AI is an awareness and education tool. Demo, simulated and illustrative values are labelled and are not measurements. The service is provided as is, without warranty. Operators are responsible for local fireworks laws, venue permissions and camera-use signage.',
Safety:'This software is not a fire alarm, certified air-quality station, legal-compliance or emergency system. Camera and thermal alerts are prompts for human review. Contact emergency services in case of danger. Green crackers are not pollution-free; follow current CPCB and local authority rules.'};
$('legalBtn')?.addEventListener('click',e=>{e.preventDefault();const m=document.createElement('div');m.className='palette';m.innerHTML='<div class="pal-box legal" role="dialog" aria-label="Legal"><button class="btn secondary" style="float:right;margin:10px">Close ✕</button>'+Object.entries(LEG).map(([k,v])=>`<h3>${k}</h3><p>${v}</p>`).join('')+'<div id="credBox"></div><p class="muted-copy">Template text for the prototype; have it reviewed by qualified counsel before commercial launch.</p></div>';m.onclick=ev=>{if(ev.target===m||ev.target.tagName==='BUTTON')m.remove();};document.body.append(m);fetch('CREDITS.md').then(r=>r.text()).then(t=>{const d=$('credBox');if(!d)return;d.innerHTML='<h3>Credits</h3>';t.split(/\r?\n/).filter(x=>x.startsWith('- ')).forEach(x=>{const p=document.createElement('p');p.textContent=x.slice(2).replace(/`/g,'');d.append(p);});}).catch(()=>{});});
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
})();
