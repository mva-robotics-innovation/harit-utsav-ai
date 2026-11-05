// HARIT UTSAV AI v3 — Future Lab: fireworks studio, analytics, CV lab, digital twin, command palette, voice
(()=>{
const $=id=>document.getElementById(id),dpr=Math.min(devicePixelRatio||1,2),T=window.THREE;
const notify=(t,d)=>{if(typeof addAlert==='function')addAlert(t,d,'info','fl-'+Date.now());};
const download=(name,text,type)=>{const u=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=u;a.download=name;a.click();URL.revokeObjectURL(u);};

// ---------- 1. Fireworks studio (canvas) ----------
const fc=$('fwCanvas'),g=fc.getContext('2d');let W=0,H=0,parts=[],rockets=[],boxes=[],mode='green',type='peony',cvOn=false,idx=0,vis=true,last=0;
const cols=['#ff5d73','#ffd166','#8be4ba','#6ec6ff','#c792ea','#ffffff'];
const rs=()=>{W=fc.width=fc.clientWidth*dpr;H=fc.height=fc.clientHeight*dpr;};new ResizeObserver(rs).observe(fc);rs();
const launch=x=>rockets.push({x:x??W*(.2+Math.random()*.6),y:H,ty:H*(.15+Math.random()*.3),vy:-H/60,c:cols[Math.random()*6|0]});
function burst(x,y,c){const n=mode==='green'?70:130;
 for(let i=0;i<n;i++){let a=Math.random()*6.283,s=(1+Math.random()*(type==='willow'?2.5:4.5))*dpr;if(type==='ring'){a=i/n*6.283;s=4*dpr;}parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,c,w:type==='willow'});}
 if(mode==='conv')for(let i=0;i<14;i++)parts.push({x,y,vx:(Math.random()-.5)*2,vy:-Math.random()*1.2,life:1.8,smoke:1});
 boxes.push({x,y,r:70*dpr,t:60,conf:.8+Math.random()*.18});}
(function frame(t){requestAnimationFrame(frame);if(!vis||!W)return;
 if(t-last>1100){launch();last=t;}
 g.globalCompositeOperation='source-over';g.fillStyle='rgba(7,19,29,.2)';g.fillRect(0,0,W,H);g.globalCompositeOperation='lighter';
 rockets=rockets.filter(r=>{r.y+=r.vy;g.fillStyle=r.c;g.fillRect(r.x,r.y,2*dpr,8*dpr);if(r.y<=r.ty){burst(r.x,r.y,r.c);return false;}return true;});
 parts=parts.filter(p=>{p.x+=p.vx;p.y+=p.vy;
  if(p.smoke){p.vx*=.99;p.life-=.004;g.fillStyle=`rgba(140,140,140,${p.life*.1})`;g.beginPath();g.arc(p.x,p.y,(14+(1.8-p.life)*40)*dpr,0,6.283);g.fill();idx+=.05;return p.life>0;}
  p.vx*=.985;p.vy=p.vy*.985+(p.w?.03:.05)*dpr;p.life-=p.w?.008:.014;g.globalAlpha=Math.max(0,p.life);g.fillStyle=p.c;g.fillRect(p.x,p.y,2.2*dpr,2.2*dpr);g.globalAlpha=1;return p.life>0;});
 g.globalCompositeOperation='source-over';
 boxes=boxes.filter(b=>{b.t--;if(cvOn){g.strokeStyle='#8be4ba';g.lineWidth=1.5*dpr;g.strokeRect(b.x-b.r,b.y-b.r,b.r*2,b.r*2);g.fillStyle='#8be4ba';g.font=`${11*dpr}px sans-serif`;g.fillText(`fireworks ${Math.round(b.conf*100)}% · simulated`,b.x-b.r,b.y-b.r-4*dpr);}return b.t>0;});
 idx*=.998;$('fwIdx').textContent=Math.min(999,Math.round(idx));
})(0);
new IntersectionObserver(e=>vis=e[0].isIntersecting).observe(fc);
fc.addEventListener('pointerdown',e=>{const b=fc.getBoundingClientRect();launch((e.clientX-b.left)*W/b.width);});
const show=()=>{for(let i=0;i<8;i++)setTimeout(launch,i*350);};
const pick=(attr,fn)=>document.querySelectorAll(`[data-${attr}]`).forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll(`[data-${attr}]`).forEach(x=>x.classList.remove('on'));b.classList.add('on');fn(b.dataset[attr]);}));
pick('fw',v=>type=v);pick('mode',v=>mode=v);$('cvToggle').onchange=e=>cvOn=e.target.checked;$('fwShow').onclick=show;

// ---------- 2. Analytics dashboard (Power BI-style, illustrative data) ----------
const CITY=['Ranchi','Delhi','Patna','Kolkata'],BASE={Ranchi:70,Delhi:140,Patna:120,Kolkata:100},DAYS=['D-3','D-2','D-1','Festival','D+1','D+2','D+3'],SH=[.8,.9,1,1.7,1.4,1.1,.9];
let city='Ranchi',adopt=50,L,B;
const conv=c=>SH.map(s=>Math.round(BASE[c]*s)),grn=c=>SH.map((s,i)=>Math.round(BASE[c]*(i===3||i===4?1+(s-1)*(1-.4*adopt/100):s)));
function upd(){const c=conv(city),r=grn(city);
 $('kPeak').textContent=c[3];$('kGreen').textContent=r[3];$('kRed').textContent=Math.round((1-r[3]/c[3])*100)+'%';$('kDays').textContent=r.filter(v=>v>60).length+' / 7';
 if(!L)return;L.data.datasets[0].data=c;L.data.datasets[1].data=r;L.update();B.data.datasets[0].data=CITY.map(x=>conv(x)[3]);B.data.datasets[1].data=CITY.map(x=>grn(x)[3]);B.update();}
const slicer=$('citySlicer');CITY.forEach((c,i)=>{const b=document.createElement('button');b.className='chip'+(i?'':' on');b.textContent=c;b.onclick=()=>{city=c;slicer.querySelectorAll('.chip').forEach(x=>x.classList.toggle('on',x===b));upd();};slicer.append(b);});
$('adopt').oninput=e=>{adopt=+e.target.value;$('adoptOut').textContent=adopt+'%';upd();};
if(window.Chart){Chart.defaults.color='#9bb0b6';Chart.defaults.borderColor='#ffffff14';
 const mk=(id,type,labels,sets)=>new Chart($(id),{type,data:{labels,datasets:sets},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{boxWidth:10}}},scales:{y:{title:{display:true,text:'PM2.5 µg/m³ (illustrative)'}}}}});
 L=mk('lineChart','line',DAYS,[{label:'Conventional',borderColor:'#f0bd69',backgroundColor:'#f0bd6933',data:[],tension:.35,fill:true},{label:'Green-adoption scenario',borderColor:'#8be4ba',backgroundColor:'#8be4ba33',data:[],tension:.35,fill:true}]);
 B=mk('barChart','bar',CITY,[{label:'Conventional',backgroundColor:'#f0bd69',data:[]},{label:'Green scenario',backgroundColor:'#8be4ba',data:[]}]);}
else document.querySelectorAll('.chart-box').forEach(b=>b.textContent='Charts need the Chart.js library (internet connection).');
upd();
$('exportBI').onclick=()=>{const rows=[['city','day','pm25_conventional_illustrative','pm25_scenario_illustrative','green_adoption_pct']];CITY.forEach(c=>{const a=conv(c),b=grn(c);DAYS.forEach((d,i)=>rows.push([c,d,a[i],b[i],adopt]));});download('harit-utsav-analytics-powerbi.csv',rows.map(r=>r.join(',')).join('\n'),'text/csv');};

// ---------- 3. CV lab: image analyser (heuristic) ----------
$('imgIn').onchange=e=>{const f=e.target.files[0];if(!f)return;const im=new Image();im.onload=()=>{const cv=$('imgCanvas'),x=cv.getContext('2d',{willReadFrequently:true}),w=cv.width=480,h=cv.height=Math.round(480*im.height/im.width);x.drawImage(im,0,0,w,h);
 const d=x.getImageData(0,0,w,h),p=d.data;let s=0,wm=0,br=0;
 for(let i=0;i<p.length;i+=4){const r=p[i],gg=p[i+1],b=p[i+2],y=.299*r+.587*gg+.114*b;s+=y;if(r>150&&r>gg*1.22&&gg>b*1.12){wm++;p[i]=255;p[i+1]*=.4;}if(y>220){br++;p[i+2]=255;}}
 x.putImageData(d,0,0);const n=w*h;$('imgOut').textContent=`Mean brightness ${Math.round(s/n)}/255 · bright pixels ${(br/n*100).toFixed(1)}% · warm-colour pixels ${(wm/n*100).toFixed(1)}% (highlighted). Heuristic only, not a trained detector. Processed locally.`;URL.revokeObjectURL(im.src);};im.src=URL.createObjectURL(f);};

// ---------- 4. Digital twin (Three.js) ----------
if(window.HU_mount&&T)HU_mount('twinScene',()=>{
 const root=new T.Group(),city=new T.Group();city.rotation.x=.6;root.add(city);
 const fl=new T.Mesh(new T.PlaneGeometry(7,7),HU_std(0x0b2530,{metalness:.1}));fl.rotation.x=-Math.PI/2;city.add(fl,new T.GridHelper(7,14,0x1f5a4d,0x143a44));
 for(let x=0;x<7;x++)for(let z=0;z<7;z++){if((x+z)%3===0&&x%2)continue;const h=.2+Math.abs(Math.sin(x*12.9+z*78.2))*.9,b=new T.Mesh(new T.BoxGeometry(.45,h,.45),HU_std(0x1b3340));b.position.set(x-3,h/2,z-3);city.add(b);}
 const sensors=new T.Group(),plume=new T.Group(),drone=new T.Group();city.add(sensors,plume,drone);
 const sp=[[-2,-2],[2,-2],[-2,2],[2,2],[0,0]].map(([x,z])=>{const m=new T.Mesh(new T.SphereGeometry(.12,16,16),new T.MeshBasicMaterial({color:0x63e5a6}));m.position.set(x+.5,1.3,z+.5);sensors.add(m);return m;});
 const puffs=[...Array(7)].map((_,i)=>{const m=new T.Mesh(new T.SphereGeometry(.4,16,12),new T.MeshBasicMaterial({color:0xb0a89c,transparent:true,opacity:.25}));m.userData.o=i/7;plume.add(m);return m;});
 const body=new T.Mesh(new T.BoxGeometry(.3,.08,.3),HU_std(0xeaf3f5));drone.add(body);const rot=[[.2,.2],[-.2,.2],[.2,-.2],[-.2,-.2]].map(([x,z])=>{const m=new T.Mesh(new T.CylinderGeometry(.12,.12,.01,12),new T.MeshBasicMaterial({color:0xf0bd69}));m.position.set(x,.07,z);drone.add(m);return m;});
 document.querySelectorAll('[data-layer]').forEach(c=>c.onchange=()=>({sensors,plume,drone})[c.dataset.layer].visible=c.checked);
 root.userData.tick=t=>{sp.forEach((m,i)=>m.scale.setScalar(1+Math.sin(t*3+i)*.4));puffs.forEach(m=>{const k=(t*.15+m.userData.o)%1;m.position.set(1+Math.sin(k*6)*.3,.3+k*2,-1+Math.cos(k*5)*.3);m.scale.setScalar(.6+k*1.6);m.material.opacity=.3*(1-k);});drone.position.set(Math.cos(t*.7)*2.6,1.9,Math.sin(t*.7)*2.6);rot.forEach(r=>r.rotation.y=t*30);};
 return root;});

// ---------- 5. Command palette + voice ----------
const go=id=>window.HU_navigate?window.HU_navigate(id):document.getElementById(id)?.scrollIntoView({behavior:'smooth'});
const cmds=[['Go to 3D Lab',()=>go('lab3d'),'3d'],['Go to Vision monitor',()=>go('monitor'),'vision'],['Go to Command Centre',()=>go('intelligence'),'command'],['Go to Impact Lab',()=>go('impact'),'impact'],['Go to Research',()=>go('research'),'research'],['Go to Future Lab',()=>go('future'),'future'],
 ['Start camera',()=>$('startCamera').click(),'start camera'],['Stop camera',()=>$('stopCamera').click(),'stop camera'],['Load demo readings',()=>$('demoSensor').click(),'demo'],['Launch fireworks show',()=>{go('future');show();},'fireworks'],['Toggle language हिं / EN',()=>$('langBtn')?.click(),'language'],['Export analytics CSV for Power BI',()=>$('exportBI').click(),'export']];
const pal=document.createElement('div');pal.className='palette';pal.hidden=true;pal.innerHTML='<div class="pal-box" role="dialog" aria-label="Command palette"><input id="palIn" placeholder="Type a command…  (Esc to close)" aria-label="Command"><ul id="palList"></ul></div>';document.body.append(pal);
const list=pal.querySelector('ul'),inp=pal.querySelector('input');
const render=()=>{const q=inp.value.toLowerCase();list.replaceChildren(...cmds.filter(c=>(c[0]+c[2]).toLowerCase().includes(q)).map(c=>{const li=document.createElement('li');li.textContent=c[0];li.onclick=()=>{close();c[1]();};return li;}));};
const open=()=>{pal.hidden=false;inp.value='';render();inp.focus();},close=()=>pal.hidden=true;
inp.oninput=render;inp.onkeydown=e=>{if(e.key==='Enter'){list.firstChild?.click();}};
pal.onclick=e=>{if(e.target===pal)close();};
addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();pal.hidden?open():close();}else if(e.key==='Escape')close();});
$('openPalette').onclick=open;
const SR=window.SpeechRecognition||window.webkitSpeechRecognition,mic=$('micBtn');
if(!SR)mic.hidden=true;else mic.onclick=()=>{const r=new SR();r.lang='en-IN';mic.classList.add('on');r.onend=()=>mic.classList.remove('on');
 r.onresult=e=>{const t=e.results[0][0].transcript.toLowerCase(),c=cmds.find(c=>t.includes(c[2]));notify('Voice command','Heard: “'+t+'”'+(c?' → '+c[0]:' (no matching command)'));if(c)c[1]();};r.onerror=()=>notify('Voice unavailable','Microphone permission denied or unsupported.');r.start();};
})();
