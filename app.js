const $=id=>document.getElementById(id);
const video=$("video"), canvas=$("analysisCanvas"), ctx=canvas.getContext("2d",{willReadFrequently:true});
let stream=null, timer=null, previous=null, previousBrightness=0, lastEvent=0, frameCount=0, lastMetrics={};
const log=(message,level="INFO")=>{const list=$("eventLog");if(list.querySelector(".muted"))list.innerHTML="";const li=document.createElement("li");const t=new Date().toLocaleTimeString();li.innerHTML=`<b>${t} · ${level}</b>${message}`;list.prepend(li);while(list.children.length>12)list.lastChild.remove();};
function setMetric(name,value){$(name+"Val").textContent=Math.round(value)+"%";$(name+"Bar").style.width=Math.min(100,value)+"%";}
function setStatus(title,desc,alert=false){$("statusText").textContent=title;$("statusDesc").textContent=desc;$("statusPanel").style.borderColor=alert?"#936b37":"#275348";$("statusPanel").style.background=alert?"#30271b":"#102a2c";$("statusPanel").querySelector(".status-icon").textContent=alert?"⚠":"◎";}
function analyse(){
 if(!video.videoWidth||video.readyState<2)return;
 const w=160,h=90;canvas.width=w;canvas.height=h;ctx.drawImage(video,0,0,w,h);
 const data=ctx.getImageData(0,0,w,h).data;let sum=0,warm=0,bright=0,diff=0;
 const gray=new Uint8Array(w*h);
 for(let p=0,i=0;p<data.length;p+=4,i++){const r=data[p],g=data[p+1],b=data[p+2];const y=.299*r+.587*g+.114*b;gray[i]=y;sum+=y;if(y>220)bright++;if(r>150&&r>g*1.22&&g>b*1.12)warm++;if(previous){diff+=Math.abs(y-previous[i]);}}
 const avg=sum/(w*h),brightPct=bright/(w*h)*100,warmPct=warm/(w*h)*100;
 const motion=previous?Math.min(100,(diff/(w*h))/35*100):0;
 const flash=previousBrightness?Math.min(100,Math.max(0,(avg-previousBrightness)*2.2)):0;
 // Low local luminance contrast is a weak haze-like visual cue, not smoke recognition.
 let variance=0;for(let i=0;i<gray.length;i++)variance+=Math.abs(gray[i]-avg);const contrast=variance/gray.length;
 const haze= Math.max(0,Math.min(100,(30-contrast)*3.2));
 previous=gray;previousBrightness=avg;frameCount++;
 setMetric("flash",flash);setMetric("motion",motion);setMetric("warm",warmPct*2.5);setMetric("haze",haze);
 lastMetrics={flash,motion,warm:warmPct,haze};
 const possible=(flash>14&&motion>8)||(brightPct>8&&warmPct>2&&motion>7);
 if(possible&&Date.now()-lastEvent>5000){setStatus("Possible bright-flash event","Visual pattern detected. Review the camera scene; this is not confirmed firecracker identification.",true);log("Possible fireworks-like flash / motion pattern","REVIEW");lastEvent=Date.now();}
 else if(haze>55&&motion>3&&Date.now()-lastEvent>7000){setStatus("Possible scene haze change","Low-contrast visual change detected. Fog, lighting and focus can cause this.",true);log("Possible haze-like visual change","CHECK");lastEvent=Date.now();}
 else if(frameCount%8===0){setStatus("Monitoring scene","No strong fireworks-like visual pattern detected in recent frames.");}
}
async function startCamera(){
 try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"},audio:false});video.srcObject=stream;await video.play();$("placeholder").style.display="none";$("video").style.display="block";$("cameraState").textContent="Camera active";$("startCamera").disabled=true;$("stopCamera").disabled=false;$("captureFrame").disabled=false;$("video").parentElement.classList.add("scanning");previous=null;previousBrightness=0;frameCount=0;setStatus("Monitoring active","Analysing sampled frames locally in this browser.");log("Camera started. Local analysis active.");timer=setInterval(analyse,350);}
 catch(e){setStatus("Camera unavailable",e.name==="NotAllowedError"?"Camera permission was denied. Allow access in browser settings.":"Camera could not start. Use HTTPS or localhost and check camera availability.",true);log("Camera error: "+e.message,"ERROR");}
}
function stopCamera(){if(timer)clearInterval(timer);timer=null;if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;video.srcObject=null;$("cameraState").textContent="Camera offline";$("startCamera").disabled=false;$("stopCamera").disabled=true;$("captureFrame").disabled=true;$("placeholder").style.display="flex";$("video").parentElement.classList.remove("scanning");setStatus("Awaiting camera","Start the camera to analyse the scene.");log("Camera stopped.");}
$("startCamera").addEventListener("click",startCamera);$("stopCamera").addEventListener("click",stopCamera);
$("captureFrame").addEventListener("click",()=>{if(!stream)return;const c=document.createElement("canvas");c.width=video.videoWidth;c.height=video.videoHeight;c.getContext("2d").drawImage(video,0,0);const a=document.createElement("a");a.href=c.toDataURL("image/png");a.download="harit-utsav-snapshot-"+Date.now()+".png";a.click();log("Snapshot saved locally by browser.");});
$("clearLog").addEventListener("click",()=>$("eventLog").innerHTML='<li class="muted">No events recorded yet.</li>');
function updatePlanner(){const people=+$("people").value,activity=+$("activity").value,green=+$("green").value;const levels=["Low","Medium","High"];const raw=people*(activity===0?.2:activity===1?1:1.8);const adjusted=raw*(1-green/100);$("peopleOut").textContent=people.toLocaleString();$("activityOut").textContent=levels[activity];$("greenOut").textContent=green+"%";$("indexOut").textContent=Math.round(adjusted/2);$("indexDesc").textContent="Relative activity index · illustrative only, not measured pollution";}
["people","activity","green"].forEach(id=>$(id).addEventListener("input",updatePlanner));updatePlanner();
document.querySelectorAll(".pledgeCheck").forEach(c=>c.addEventListener("change",()=>{const n=[...document.querySelectorAll(".pledgeCheck")].filter(x=>x.checked).length;$("pledgeCount").textContent=n+" of 4 actions selected";$("pledgeBar").style.width=(n/4*100)+"%";}));
$("menuToggle").addEventListener("click",()=>$("nav").classList.toggle("open"));document.querySelectorAll("#nav a").forEach(a=>a.addEventListener("click",()=>$("nav").classList.remove("open")));
function clock(){ $("clock").textContent=new Date().toLocaleTimeString();}clock();setInterval(clock,1000);
window.addEventListener("beforeunload",()=>{if(stream)stream.getTracks().forEach(t=>t.stop());});
// HARIT UTSAV AI — sensor bridge, alert engine and trend dashboard.
let serialPort=null, serialReader=null, serialKeepReading=false, sensorDemo=false;
let airHistory=[], alertKeys=new Map(), notificationPermission=false, latestSensorData={}, latestVisionEvent='';
const addAlert=(title,detail,severity='warning',key=title)=>{
 const now=Date.now();if(now-(alertKeys.get(key)||0)<45000)return;alertKeys.set(key,now);
 const feed=$('alertFeed');const empty=feed.querySelector('.empty-alert');if(empty)empty.remove();
 const item=document.createElement('div');item.className='alert-item '+severity;
 const time=new Date().toLocaleTimeString();
 const b=document.createElement('b');b.textContent=title;const p=document.createElement('p');p.textContent=detail;const t=document.createElement('time');t.textContent=time;
 item.append(b,p,t);feed.prepend(item);while(feed.children.length>15)feed.lastChild.remove();
 if(notificationPermission&&'Notification'in window&&Notification.permission==='granted'){try{new Notification('HARIT UTSAV AI · '+title,{body:detail})}catch(e){}}
};
const setReading=(id,value,unit='')=>$(id).textContent=Number.isFinite(Number(value))?Number(value).toFixed(1):'—';
function pmStatus(pm,kind){if(!Number.isFinite(pm))return ['Awaiting sensor',''];let bands=kind==='pm25'?[30,60,90,120,250]:[50,100,250,350,430];let names=['Good','Satisfactory','Moderate','Poor','Very poor','Severe'];let idx=bands.findIndex(x=>pm<=x);if(idx<0)idx=5;return [names[idx],idx>=4?'danger':idx>=2?'warn':''];}
function renderRecommendations(kind='baseline',details={}){
 const root=$('recommendations'); if(!root)return;
 const cards={
  baseline:[
   ['🪔 Traditional lighting','Choose reusable clay diyas with careful placement, or efficient LED / solar lanterns instead of high-smoke decorative options.'],
   ['🌿 Lower-impact celebration','Prefer music, cultural performances, projection/light shows and community activities that do not create combustion emissions.'],
   ['♻️ Reusable festival products','Choose reusable fabric décor, refillable LED strings, steel serving ware and segregated waste collection.'],
   ['🔎 If fireworks are legally permitted','Check current local restrictions, product authorisation, QR/label details and licensed sellers. “Green” crackers are not pollution-free.']
  ],
  air:[
   ['⚠️ Reduce combustion and smoke sources','Pause fireworks and avoid burning leaves, waste or incense in the monitored area while particulate readings remain elevated.'],
   ['🪔 Switch to low-emission celebration products','Use clay diyas carefully, rechargeable LED diyas, solar lanterns and electric light displays.'],
   ['🌱 Improve the event environment','Move sensitive activities indoors where appropriate, reduce dust-generating activity and check official local air-quality advisories.'],
   ['🧾 Choose reusable supplies','Use cloth banners, reusable decorations, steel serving ware and paper/cardboard recycling instead of single-use plastic.']
  ],
  vision:[
   ['⚠️ Review the camera event','A bright-flash / motion pattern was detected, not confirmed as a firecracker. Keep people clear of any unsafe activity and do not approach unexploded items.'],
   ['✨ Try non-pyrotechnic alternatives','Consider LED light shows, projection mapping, cultural performances, music, diya displays and community rangoli.'],
   ['🌿 Avoid high-smoke products','Do not use unidentified or unauthorised fireworks. Follow current district and state restrictions.'],
   ['🔎 Product verification','Where fireworks are permitted, verify authorisation and buy only from licensed sellers. Product labels alone do not prove zero environmental impact.']
  ],
  thermal:[
   ['🔥 Heat anomaly — keep clear','Treat the thermal reading as a warning for human review. Keep people away from the hotspot and follow site fire-safety procedures.'],
   ['🪔 Safer lighting choices','Use enclosed LED / solar lights instead of open flames near fabric, dry leaves, decorations or temporary structures.'],
   ['🧯 Prepare the event area','Keep exits clear, maintain suitable fire-safety equipment and identify the site emergency contact before the event.'],
   ['🚫 Do not handle fireworks','Never touch, relight or move a failed or unexploded firework. Contact trained local responders if there is immediate danger.']
  ],
  fusion:[
   ['🚨 Multi-sensor warning — human review required','Visual and sensor signals occurred together. This increases the reason to inspect the area, but it is not proof of a fire, smoke event or illegal firework.'],
   ['↔️ Check the physical scene safely','Do not approach a suspected fire or unexploded firework. Keep people clear and follow the venue emergency plan.'],
   ['🌿 Choose a no-combustion celebration','Use LED / solar lighting, projection displays, music and cultural performances while the event is assessed.'],
   ['📋 Preserve the readings','Export the sensor trend and note sensor location, calibration status and time for a responsible review.']
  ]
 };
 const selected=cards[kind]||cards.baseline;
 root.replaceChildren(...selected.map(([title,body])=>{const el=document.createElement('div');el.className='recommendation';const b=document.createElement('b');b.textContent=title;const p=document.createElement('p');p.textContent=body;el.append(b,p);return el;}));
}
function evaluateSensorFusion(){
 const s=latestSensorData, v=lastMetrics||{};
 const pmSpike=Number.isFinite(Number(s.pm25))&&Number(s.pm25)>60;
 const thermal=Number.isFinite(Number(s.thermalC??s.thermalMaxC))&&(Number(s.thermalC??s.thermalMaxC)>=60||Number(s.hotspotCount||0)>0);
 const visual=(Number(v.flash||0)>14&&Number(v.motion||0)>8)||(Number(v.warm||0)>8&&Number(v.motion||0)>12);
 const haze=Number(v.haze||0)>55&&Number(v.motion||0)>3;
 if(visual&&thermal){renderRecommendations('fusion');addAlert('Multi-sensor event correlation','A webcam visual pattern and a thermal hotspot/heat threshold occurred together. This is a priority for human review, not confirmed fire detection.','critical','fusion-visual-thermal');}
 else if((haze&&pmSpike)||(visual&&pmSpike)){renderRecommendations('fusion');addAlert('Visual + air-quality correlation','A camera scene-change signal and elevated PM2.5 reading occurred in the same monitoring session. This does not prove the camera event caused the pollution.','warning','fusion-visual-pm');}
 else if(thermal){renderRecommendations('thermal');}
 else if(visual){renderRecommendations('vision');}
 else if(pmSpike){renderRecommendations('air');}
}
function updateAir(d,source='LIVE SENSOR'){
 latestSensorData={...latestSensorData,...d};
 const pm25=Number(d.pm25),pm10=Number(d.pm10),co2=Number(d.co2),temp=Number(d.temperature??d.tempC);
 if(Number.isFinite(pm25)){setReading('pm25',pm25);let [s,c]=pmStatus(pm25,'pm25');$('pm25Status').textContent=s;$('pm25Status').className=c;if(pm25>60)addAlert('PM2.5 elevated',`PM2.5 is ${pm25.toFixed(1)} µg/m³. Reduce outdoor exertion, move to cleaner indoor air where possible and follow local health advisories.`,pm25>120?'critical':'warning','pm25');}
 if(Number.isFinite(pm10)){setReading('pm10',pm10);let [s,c]=pmStatus(pm10,'pm10');$('pm10Status').textContent=s;$('pm10Status').className=c;if(pm10>100)addAlert('PM10 elevated',`PM10 is ${pm10.toFixed(1)} µg/m³. Avoid dust-generating activity and check local air-quality guidance.`,pm10>250?'critical':'warning','pm10');}
 if(Number.isFinite(co2)){setReading('co2',co2);$('co2Status').textContent=co2>1500?'Ventilation check':co2>1000?'Review ventilation':'Reading received';$('co2Status').className=co2>1500?'warn':'';if(co2>1500)addAlert('High indoor CO₂ reading',`CO₂ is ${co2.toFixed(0)} ppm. Check ventilation and sensor placement. CO₂ is not a direct measure of PM2.5 or outdoor AQI.`,'warning','co2');}
 if(Number.isFinite(temp)){setReading('ambientTemp',temp);$('ambientStatus').textContent=temp>=40?'High temperature':temp>=35?'Warm conditions':'Reading received';$('ambientStatus').className=temp>=40?'warn':'';if(temp>=40)addAlert('High ambient temperature',`Temperature is ${temp.toFixed(1)} °C. Check heat-safety arrangements and hydration.`,'warning','ambient-temp');}
 $('dataMode').textContent=source;$('sensorState').textContent=source==='DEMO DATA'?'DEMO MODE':'CONNECTED';$('sensorState').className='connection-pill '+(source==='DEMO DATA'?'':'safe-pill');
 if(Number.isFinite(pm25)||Number.isFinite(pm10)){airHistory.push({pm25:Number.isFinite(pm25)?pm25:null,pm10:Number.isFinite(pm10)?pm10:null,time:Date.now()});if(airHistory.length>30)airHistory.shift();drawTrend();}
 if(Number.isFinite(Number(d.thermalC??d.thermalMaxC))){const tc=Number(d.thermalC??d.thermalMaxC),hc=Number(d.hotspotCount??0);setReading('thermalTemp',tc);$('thermalTemp').textContent=tc.toFixed(1)+' °C';$('hotspotCount').textContent=hc;$('thermalState').textContent='THERMAL DATA RECEIVED';$('thermalState').className='connection-pill safe-pill';$('thermalHint').textContent='Radiometric sensor reading';$('thermalAlert').textContent=tc>=60?'High heat anomaly':tc>=45?'Elevated heat':'No threshold alert';if(tc>=60||hc>0)addAlert('Thermal heat anomaly',`Thermal sensor reports ${tc.toFixed(1)} °C and ${hc} hotspot(s). Compare with your configured site threshold; verify with a human operator and follow fire-safety procedures.`,tc>=80?'critical':'warning','thermal');}
 evaluateSensorFusion();
}
function drawTrend(){const c=$('trendChart');if(!c)return;const g=c.getContext('2d'),w=c.width,h=c.height;g.clearRect(0,0,w,h);g.strokeStyle='#29444b';g.lineWidth=1;for(let i=0;i<5;i++){let y=15+i*(h-35)/4;g.beginPath();g.moveTo(45,y);g.lineTo(w-12,y);g.stroke();}g.fillStyle='#82999d';g.font='12px sans-serif';g.fillText('µg/m³',7,15);const vals=airHistory.flatMap(x=>[x.pm25,x.pm10]).filter(Number.isFinite);const max=Math.max(100,...vals)*1.12;const plot=(key,color)=>{const pts=airHistory.map((x,i)=>({x:45+(w-65)*(airHistory.length<2?1:i/(airHistory.length-1)),y:x[key]==null?null:h-20-(x[key]/max)*(h-45)})).filter(p=>p.y!==null);if(!pts.length)return;g.strokeStyle=color;g.lineWidth=3;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.stroke();};plot('pm25','#82e2b1');plot('pm10','#f0bd69');g.fillStyle='#82999d';g.font='11px sans-serif';g.fillText('Oldest',45,h-3);g.fillText('Latest',w-58,h-3);}
$('connectSensor')?.addEventListener('click',async()=>{
 if(!('serial'in navigator)){addAlert('USB Serial unavailable','Use a Chromium-based desktop browser over HTTPS or localhost, or enter sensor values through your own device bridge.','warning','serial-unavailable');return;}
 try{serialPort=await navigator.serial.requestPort();await serialPort.open({baudRate:115200});serialKeepReading=true;$('disconnectSensor').disabled=false;$('connectSensor').disabled=true;$('sensorState').textContent='CONNECTED';$('sensorState').className='connection-pill safe-pill';addAlert('Sensor connected','Waiting for newline-delimited JSON sensor readings.','info','sensor-connected');const decoder=new TextDecoderStream();const closed=serialPort.readable.pipeTo(decoder.writable);serialReader=decoder.readable.getReader();let buffer='';while(serialKeepReading){const {value,done}=await serialReader.read();if(done)break;buffer+=value;let lines=buffer.split(/\r?\n/);buffer=lines.pop();for(const line of lines){if(!line.trim())continue;try{const d=JSON.parse(line);updateAir(d,'LIVE SENSOR')}catch(e){addAlert('Sensor data format issue','Expected one valid JSON object per line. See README for the protocol.','warning','bad-json');}}}await closed.catch(()=>{});
 }catch(e){addAlert('Sensor connection failed',e.message||'Check USB device, browser permission and baud rate.','warning','serial-error');$('connectSensor').disabled=false;$('disconnectSensor').disabled=true;}
});
$('disconnectSensor')?.addEventListener('click',async()=>{serialKeepReading=false;try{if(serialReader){await serialReader.cancel();serialReader.releaseLock();}}catch(e){}try{if(serialPort)await serialPort.close()}catch(e){}serialReader=null;serialPort=null;$('connectSensor').disabled=false;$('disconnectSensor').disabled=true;$('sensorState').textContent='NOT CONNECTED';$('sensorState').className='connection-pill';});
$('demoSensor')?.addEventListener('click',()=>{sensorDemo=true;const demo={pm25:Math.round(35+Math.random()*90),pm10:Math.round(65+Math.random()*130),co2:Math.round(600+Math.random()*900),temperature:(28+Math.random()*14).toFixed(1),thermalC:(34+Math.random()*35).toFixed(1),hotspotCount:Math.random()>.7?1:0};updateAir(demo,'DEMO DATA');addAlert('Demo data loaded','These are randomly generated demonstration values, not measurements from your environment.','info','demo-data');});
$('enableAlerts')?.addEventListener('click',async()=>{if(!('Notification'in window)){addAlert('Notifications unsupported','This browser does not support desktop notifications.','warning','notify-no');return;}const p=await Notification.requestPermission();notificationPermission=p==='granted';addAlert(notificationPermission?'Notifications enabled':'Notifications not enabled',notificationPermission?'Alerts may appear as browser notifications while this page is open.':'You can still see alerts inside the dashboard.','info','notify-status');});
// Interpret the existing local webcam heuristic outputs; never label a heuristic event as confirmed fireworks.
const _baseAnalyse=analyse;analyse=function(){_baseAnalyse();if(!lastMetrics)return;const {flash=0,motion=0,warm=0,haze=0}=lastMetrics;if((flash>14&&motion>8)||(warm>8&&motion>12)){addAlert('Possible fireworks-like visual event','Webcam detected a bright-flash / warm-colour / motion pattern. This is an unverified visual alert; inspect the scene.','warning','vision-event');renderRecommendations('vision');evaluateSensorFusion();}else if(haze>55&&motion>3){addAlert('Possible haze-like camera change','Image contrast changed; fog, lighting, autofocus and camera movement can cause this. It is not smoke confirmation.','warning','vision-haze');evaluateSensorFusion();}};
window.addEventListener('beforeunload',()=>{serialKeepReading=false;try{if(serialReader)serialReader.cancel()}catch(e){}try{if(serialPort)serialPort.close()}catch(e){}});
drawTrend();

$('exportData')?.addEventListener('click',()=>{const rows=[['timestamp','pm25_ug_m3','pm10_ug_m3'],...airHistory.map(x=>[new Date(x.time).toISOString(),x.pm25??'',x.pm10??''])];const csv=rows.map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\n');const blob=new Blob([csv],{type:'text/csv'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='harit-utsav-air-quality-trend.csv';a.click();URL.revokeObjectURL(url);});
