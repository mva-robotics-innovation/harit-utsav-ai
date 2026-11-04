// HARIT UTSAV AI — trained-model pipeline (YOLOv8-style ONNX, runs locally via onnxruntime-web)
(function(){
const SZ=640;
function iou(a,b){const x1=Math.max(a.x1,b.x1),y1=Math.max(a.y1,b.y1),x2=Math.min(a.x2,b.x2),y2=Math.min(a.y2,b.y2);const i=Math.max(0,x2-x1)*Math.max(0,y2-y1);return i/((a.x2-a.x1)*(a.y2-a.y1)+(b.x2-b.x1)*(b.y2-b.y1)-i+1e-9);}
function nms(b,thr){b.sort((p,q)=>q.conf-p.conf);const k=[];for(const c of b)if(!k.some(o=>o.cls===c.cls&&iou(o,c)>thr))k.push(c);return k;}
// data: Float32Array laid out [1, 4+nc, N]; boxes returned normalised 0..1
function decode(d,dims,conf,iouThr){const nc=dims[1]-4,N=dims[2],out=[];
 for(let i=0;i<N;i++){let bc=0,bs=0;for(let c=0;c<nc;c++){const s=d[(4+c)*N+i];if(s>bs){bs=s;bc=c;}}
  if(bs<conf)continue;const cx=d[i],cy=d[N+i],w=d[2*N+i],h=d[3*N+i];
  out.push({cls:bc,conf:bs,x1:(cx-w/2)/SZ,y1:(cy-h/2)/SZ,x2:(cx+w/2)/SZ,y2:(cy+h/2)/SZ});}
 return nms(out,iouThr);}
if(typeof document==='undefined'){module.exports={decode,nms,iou};return;}

const $=id=>document.getElementById(id),video=$('video');
const CFG={conf:.45,iou:.5,win:5,need:3,cooldown:15000,every:450};
let sess=null,labels=['fireworks','smoke','fire'],hist=[],busy=false,events=[],tp=0,fp=0,lastEv={},timer=null;
const wrap=video.parentElement,ov=document.createElement('canvas');ov.className='det-overlay';wrap.append(ov);
const work=document.createElement('canvas');work.width=work.height=SZ;const wctx=work.getContext('2d',{willReadFrequently:true});
const panel=document.createElement('div');panel.className='model-panel card';
panel.innerHTML=`<div class="sensor-title"><div><span class="eyebrow">AI MODEL PIPELINE</span><h3>Trained detector (ONNX)</h3></div><span class="connection-pill" id="mState">NO MODEL · HEURISTIC MODE</span></div>
<p class="muted-copy">Load a YOLO-style ONNX model trained with TRAINING_PLAN.md (classes: fireworks, smoke, fire). Inference runs locally in this browser; no frames leave the device. A detection is raised only when it persists across several frames, then a person reviews it.</p>
<div class="sensor-actions"><label class="btn primary" for="mFile">Load model (.onnx)</label><input id="mFile" type="file" accept=".onnx" hidden><label class="btn secondary" for="lFile">Labels (.json)</label><input id="lFile" type="file" accept=".json" hidden><label class="thr">Confidence <output id="cOut">45%</output><input id="cThr" type="range" min="20" max="90" value="45"></label></div>
<div id="detList" class="alert-feed"><div class="empty-alert">No confirmed detections yet. Load a model, then start the camera.</div></div>
<div class="air-metrics"><div class="air-metric"><small>REVIEWED TRUE</small><strong id="rTP">0</strong></div><div class="air-metric"><small>REVIEWED FALSE</small><strong id="rFP">0</strong></div><div class="air-metric"><small>ON-SITE PRECISION</small><strong id="rPr">—</strong></div><div class="air-metric"><small>INFERENCE</small><strong id="rMs">—</strong><span>ms / frame</span></div></div>
<div class="sensor-actions"><button class="btn secondary" id="expEv">Export review log (JSON)</button></div>
<div class="sensor-note">On-site precision counts only detections a person reviewed. It is not a validated benchmark; validate on a held-out test set before any customer claim.</div>`;
document.querySelector('.monitor-grid').after(panel);
const state=(t,ok)=>{$('mState').textContent=t;$('mState').className='connection-pill'+(ok?' safe-pill':'');};
$('cThr').oninput=e=>{CFG.conf=e.target.value/100;$('cOut').textContent=e.target.value+'%';};
$('lFile').onchange=async e=>{try{const j=JSON.parse(await e.target.files[0].text());if(Array.isArray(j)){labels=j.map(String);addAlert('Labels loaded',labels.join(', '),'info','lbl');}}catch(x){addAlert('Labels file invalid','Expected a JSON array of class names.','warning','lbl-bad');}};
$('mFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;
 if(!window.ort){addAlert('Runtime unavailable','onnxruntime-web could not load. Check your connection or host ort.min.js locally.','warning','ort');return;}
 try{state('LOADING…');ort.env.wasm.numThreads=1;sess=await ort.InferenceSession.create(new Uint8Array(await f.arrayBuffer()),{executionProviders:['wasm']});
  state('MODEL ACTIVE · '+f.name.slice(0,24),true);addAlert('Model loaded',f.name+' ready. Inference is local; validate before relying on it.','info','mdl');}
 catch(x){sess=null;state('MODEL ERROR');addAlert('Model failed to load',String(x.message||x).slice(0,160),'warning','mdl-bad');}};
async function infer(){if(!sess||busy||!video.videoWidth||video.readyState<2)return;busy=true;const t0=performance.now();
 try{wctx.drawImage(video,0,0,SZ,SZ);const px=wctx.getImageData(0,0,SZ,SZ).data,n=SZ*SZ,x=new Float32Array(3*n);
  for(let i=0;i<n;i++){x[i]=px[4*i]/255;x[n+i]=px[4*i+1]/255;x[2*n+i]=px[4*i+2]/255;}
  const r=await sess.run({[sess.inputNames[0]]:new ort.Tensor('float32',x,[1,3,SZ,SZ])});const o=r[sess.outputNames[0]];
  const dets=decode(o.data,o.dims,CFG.conf,CFG.iou);$('rMs').textContent=Math.round(performance.now()-t0);draw(dets);confirm(dets);}
 catch(x){state('INFERENCE ERROR');sess=null;addAlert('Inference failed',String(x.message||x).slice(0,160),'warning','inf-bad');}
 busy=false;}
function draw(d){ov.width=wrap.clientWidth;ov.height=wrap.clientHeight;const g=ov.getContext('2d');g.clearRect(0,0,ov.width,ov.height);g.lineWidth=2;g.font='12px sans-serif';
 d.forEach(b=>{const c=b.cls===1?'#9bb0b6':b.cls===2?'#ff7a59':'#f0bd69';g.strokeStyle=c;g.fillStyle=c;const x=b.x1*ov.width,y=b.y1*ov.height;g.strokeRect(x,y,(b.x2-b.x1)*ov.width,(b.y2-b.y1)*ov.height);g.fillText((labels[b.cls]||'class'+b.cls)+' '+Math.round(b.conf*100)+'%',x+3,Math.max(12,y-4));});}
function confirm(d){hist.push(new Map(d.map(b=>[b.cls,b])));if(hist.length>CFG.win)hist.shift();
 for(const cls of new Set(d.map(b=>b.cls))){if(hist.filter(m=>m.has(cls)).length<CFG.need)continue;const now=Date.now();if(now-(lastEv[cls]||0)<CFG.cooldown)continue;lastEv[cls]=now;raise(cls,hist[hist.length-1].get(cls));}}
function raise(cls,b){const name=labels[cls]||'class'+cls,s=latestSensorData||{};
 const pm=Number(s.pm25)>60,th=Number(s.thermalC??s.thermalMaxC)>=60||Number(s.hotspotCount||0)>0;
 const th_=document.createElement('canvas');th_.width=160;th_.height=90;th_.getContext('2d').drawImage(video,0,0,160,90);
 const ev={id:events.length+1,time:new Date().toISOString(),label:name,confidence:+b.conf.toFixed(3),pm25:s.pm25??null,thermalC:s.thermalC??null,review:null};events.push(ev);
 addAlert('Model-confirmed: '+name,`Detector confidence ${Math.round(b.conf*100)}% held across ${CFG.need} of ${CFG.win} frames. A person must review; this is not an emergency alarm.`,cls===2?'critical':'warning','model-'+cls);
 if((pm||th)){addAlert('Model + sensor correlation',`Detector flagged ${name} while ${pm?'PM2.5 is elevated':'a thermal threshold is exceeded'}. Priority for human review; correlation is not proof of cause.`,'critical','model-fusion');renderRecommendations('fusion');}
 else renderRecommendations(cls===2?'thermal':'vision');
 const feed=$('detList');feed.querySelector('.empty-alert')?.remove();const it=document.createElement('div');it.className='alert-item warning det-item';
 it.append(th_);const t=document.createElement('div');const bb=document.createElement('b');bb.textContent=`#${ev.id} ${name} · ${Math.round(b.conf*100)}%`;const tm=document.createElement('time');tm.textContent=new Date().toLocaleTimeString();
 const ok=document.createElement('button'),no=document.createElement('button');ok.className=no.className='text-button';ok.textContent='✓ Correct';no.textContent='✗ False alarm';
 const rev=v=>{ev.review=v;v?tp++:fp++;ok.disabled=no.disabled=true;$('rTP').textContent=tp;$('rFP').textContent=fp;$('rPr').textContent=Math.round(tp/(tp+fp)*100)+'%';};
 ok.onclick=()=>rev(true);no.onclick=()=>rev(false);t.append(bb,tm,ok,no);it.append(t);feed.prepend(it);while(feed.children.length>10)feed.lastChild.remove();}
$('expEv').onclick=()=>{const u=URL.createObjectURL(new Blob([JSON.stringify({exported:new Date().toISOString(),config:CFG,labels,events},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download='harit-utsav-review-log.json';a.click();URL.revokeObjectURL(u);};
timer=setInterval(infer,CFG.every);
})();
