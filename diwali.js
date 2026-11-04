// HARIT UTSAV AI v4.3 — Diwali greeting: fireworks that spell names, logos, sound, voice
(()=>{
const $=id=>document.getElementById(id),cv=$('dwCanvas');if(!cv)return;
const g=cv.getContext('2d'),dpr=Math.min(devicePixelRatio||1,2),RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
let W=0,H=0,P=[],R=[],timers=[],vis=false,auto=false,tp=0,t0=0,total=41000;
const rs=()=>{W=cv.width=cv.clientWidth*dpr;H=cv.height=cv.clientHeight*dpr;};new ResizeObserver(rs).observe(cv);rs();
const S=()=>window.HU_SND||{boom(){},whoosh(){},blip(){},on:()=>false};
const SCENES=[
 {t:0,lines:['HAPPY','DIWALI'],cols:['#ffd27a','#ffb347','#fff3c4'],v:0},
 {t:7500,lines:['JHARKHAND','RAI UNIVERSITY'],cols:['#ff5a5f','#ffd27a','#ffffff'],logo:'dwjru',v:1},
 {t:15500,lines:['MVA ROBOTICS','INNOVATION ORG'],cols:['#4da3ff','#ff9a3c','#ffffff'],logo:'dwmva',v:2},
 {t:23500,lines:['FROM','ASHISH KUMAR','& HEPHZIBAH TOPPO'],cols:['#8be4ba','#ffd27a','#ffffff'],v:3},
 {t:32000,lines:['शुभ दीपावली'],cols:['#ffd27a','#ff6fa8','#ffffff'],finale:true}];
// ---- voice: recorded Indian female clips (assets/audio/greet1-4.mp3) -> else best Indian female browser voice ----
const LINES=['Happy Diwali! Shubh Deepavali!','Jharkhand Rai University, Ranchi.','MVA Robotics Innovation Org.','Wishing you a very Happy Diwali, from Ashish Kumar and Hephzibah Toppo.'];
let curA=null;const vlabel=t=>{const e=$('dwVoice');if(e)e.textContent=t;};
function pick(){const v=speechSynthesis.getVoices(),bad=/\bmale\b|ravi|hemant|rishi|prabhat|kalpesh/i,good=/neerja|heera|veena|lekha|kalpana|swara|aditi|priya|sapna|female/i,ind=v.filter(x=>/^(en|hi)[-_]IN/i.test(x.lang)&&!bad.test(x.name));
 return ind.find(x=>good.test(x.name))||ind[0]||v.find(x=>/^en/i.test(x.lang)&&/female|zira|samantha|susan/i.test(x.name))||null;}
function tts(i){if(!('speechSynthesis'in window))return;const go=()=>{const u=new SpeechSynthesisUtterance(LINES[i]),v=pick();if(v){u.voice=v;u.lang=v.lang;}else u.lang='en-IN';u.rate=.9;u.pitch=1.12;speechSynthesis.cancel();speechSynthesis.speak(u);
  vlabel('Voice: '+(v?v.name+' ('+v.lang+')':'browser default. Run tools/make_voice.py for a recorded Indian female voice')) ;};
 if(speechSynthesis.getVoices().length)go();else{speechSynthesis.onvoiceschanged=()=>{speechSynthesis.onvoiceschanged=null;go();};setTimeout(()=>{if(speechSynthesis.onvoiceschanged){speechSynthesis.onvoiceschanged=null;go();}},800);}}
function voice(i){if(!S().on())return;let used=false;const fb=()=>{if(!used){used=true;tts(i);}};
 const a=new Audio('assets/audio/greet'+(i+1)+'.mp3');a.volume=1;curA=a;a.onerror=fb;const p=a.play();
 if(p)p.then(()=>{if(!used){used=true;vlabel('Voice: recorded Indian female (neural)');}}).catch(fb);}
function pts(lines){const o=document.createElement('canvas');o.width=W;o.height=H;const x=o.getContext('2d'),n=lines.length,F='800 {s}px "Space Grotesk","Noto Sans Devanagari",sans-serif';
 let fs=H*.2;x.font=F.replace('{s}',fs);const w=Math.max(...lines.map(l=>x.measureText(l).width));fs=Math.min(fs*W*.86/w,H*.5/(n*1.25),H*.2);x.font=F.replace('{s}',fs);x.textAlign='center';x.textBaseline='middle';x.fillStyle='#fff';
 lines.forEach((l,i)=>x.fillText(l,W/2,H*.4-(n-1)*fs*.62+i*fs*1.24));
 const d=x.getImageData(0,0,W,H).data,st=Math.max(3,Math.round(fs/17)),out=[];
 for(let y=0;y<H;y+=st)for(let xx=0;xx<W;xx+=st)if(d[(y*W+xx)*4+3]>128)out.push({x:xx,y});
 out.sort(()=>Math.random()-.5);return out.slice(0,2600);}
function rocket(x,ty,cb){R.push({x,y:H,ty,vy:-H/46,cb});S().whoosh(x/W*2-1);}
function textShow(sc){const t=pts(sc.lines),K=5;
 for(let k=0;k<K;k++)timers.push(setTimeout(()=>{const bx=W*(.18+.64*k/(K-1)),by=H*(.28+Math.random()*.16);
  rocket(bx,by,()=>{for(let i=k;i<t.length;i+=K){const a=Math.random()*6.283,s=2+Math.random()*7;P.push({x:bx,y:by,vx:Math.cos(a)*s*dpr,vy:Math.sin(a)*s*dpr,tx:t[i].x,ty:t[i].y,age:0,hold:240+Math.random()*70,life:1,c:sc.cols[i%sc.cols.length],txt:1});}S().boom(.7,bx/W*2-1);});},k*280));}
function burst(x,y,hue){const n=110;for(let i=0;i<n;i++){const a=Math.random()*6.283,s=1+Math.random()*4.6;P.push({x,y,vx:Math.cos(a)*s*dpr,vy:Math.sin(a)*s*dpr,life:1,c:`hsl(${(hue+Math.random()*40)|0},100%,62%)`});}S().boom(.5+Math.random()*.2,x/W*2-1);}
const ambient=()=>rocket(W*(.08+Math.random()*.84),H*(.12+Math.random()*.3));
function scene(sc){document.querySelectorAll('.dw-logos figure').forEach(f=>f.classList.toggle('lit',f.id===sc.logo));
 textShow(sc);[523,659,784,1046].forEach((f,i)=>setTimeout(()=>S().blip(f,f*1.01,.9,.04,'sine'),900+i*140));
 if(sc.v!=null)setTimeout(()=>voice(sc.v),900);
 if(sc.finale)for(let i=0;i<16;i++)timers.push(setTimeout(ambient,i*260+2500));}
function stop(){timers.forEach(clearTimeout);timers=[];tp=0;try{speechSynthesis.cancel();}catch(e){}if(curA)curA.pause();$('dwPlay').textContent='▶ Play greeting';}
function play(){stop();t0=performance.now();tp=1;$('dwPlay').textContent='■ Stop';SCENES.forEach(s=>timers.push(setTimeout(()=>scene(s),s.t)));
 for(let i=0;i<50;i++)timers.push(setTimeout(()=>{if(Math.random()<.7)ambient();},i*800));timers.push(setTimeout(()=>{stop();$('dwBar').style.width='100%';},total));}
$('dwPlay').onclick=()=>tp?stop():play();
$('dwSnap').onclick=()=>{const a=document.createElement('a');a.href=cv.toDataURL('image/jpeg',.92);a.download='happy-diwali-greeting.jpg';a.click();};
new IntersectionObserver(e=>{vis=e[0].isIntersecting;if(vis&&!auto&&!RM&&e[0].intersectionRatio>.4){auto=true;play();}},{threshold:[0,.4]}).observe(cv);
const ha=document.querySelector('.hero-actions');if(ha){const a=document.createElement('a');a.className='btn secondary glow';a.href='#diwali';a.textContent='🪔 Diwali greeting';ha.append(a);}
let diya=0;
(function frame(now){requestAnimationFrame(frame);if(!vis||!W||document.hidden)return;
 g.globalCompositeOperation='source-over';g.fillStyle='rgba(3,6,16,.26)';g.fillRect(0,0,W,H);g.globalCompositeOperation='lighter';
 R=R.filter(r=>{r.y+=r.vy;g.fillStyle='#fff';g.fillRect(r.x,r.y,2*dpr,7*dpr);if(r.y<=r.ty){if(r.cb)r.cb();else burst(r.x,r.y,Math.random()*360);return false;}return true;});
 P=P.filter(p=>{if(p.txt){p.age++;if(p.age<28){p.x+=p.vx;p.y+=p.vy;p.vx*=.9;p.vy*=.9;}else if(p.age<p.hold){p.x+=(p.tx-p.x)*.12;p.y+=(p.ty-p.y)*.12;}else{if(!p.fall){p.fall=1;p.vx=(Math.random()-.5)*1.4*dpr;p.vy=0;}p.vx*=.99;p.vy+=.1*dpr;p.x+=p.vx;p.y+=p.vy;p.life-=.02;}
   g.globalAlpha=Math.max(0,p.life)*(.78+.22*Math.sin(now*.02+p.tx));g.fillStyle=p.c;g.fillRect(p.x-1,p.y-1,3.2*dpr,3.2*dpr);g.globalAlpha=1;return p.life>0;}
  p.x+=p.vx;p.y+=p.vy;p.vx*=.985;p.vy=p.vy*.985+.045*dpr;p.life-=.013;g.globalAlpha=Math.max(0,p.life);g.fillStyle=p.c;g.fillRect(p.x,p.y,2.4*dpr,2.4*dpr);g.globalAlpha=1;return p.life>0;});
 if(P.length>7000)P.splice(0,P.length-7000);
 for(let i=0;i<13;i++){const x=W*(.04+i*.0765),y=H*.955,f=.75+.25*Math.sin(now*.011+i*1.7),gr=g.createRadialGradient(x,y-6*dpr,0,x,y-6*dpr,26*dpr*f);gr.addColorStop(0,'rgba(255,200,90,.95)');gr.addColorStop(1,'rgba(255,120,20,0)');g.fillStyle=gr;g.fillRect(x-30*dpr,y-36*dpr,60*dpr,60*dpr);}
 g.globalCompositeOperation='source-over';g.fillStyle='#7a3b12';for(let i=0;i<13;i++){const x=W*(.04+i*.0765);g.beginPath();g.ellipse(x,H*.965,13*dpr,6*dpr,0,0,6.283);g.fill();}
 if(tp)$('dwBar').style.width=Math.min(100,(now-t0)/total*100)+'%';
})(0);
})();
