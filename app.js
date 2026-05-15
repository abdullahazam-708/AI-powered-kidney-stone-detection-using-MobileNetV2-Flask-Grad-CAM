const API = 'http://localhost:5000';

// ── PARTICLES ──────────────────────────────────────────────────────
(function(){
  const canvas = document.createElement('canvas');
  const p = document.getElementById('particles');
  p.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let W, H, dots = [];
  function resize(){ W = canvas.width = p.offsetWidth; H = canvas.height = p.offsetHeight; }
  resize(); window.addEventListener('resize', resize);
  for(let i=0;i<60;i++) dots.push({x:Math.random()*2000,y:Math.random()*1000,r:Math.random()*1.5+0.3,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,a:Math.random()});
  function draw(){
    ctx.clearRect(0,0,W,H);
    dots.forEach(d=>{
      d.x+=d.vx; d.y+=d.vy; d.a+=.01;
      if(d.x<0||d.x>W)d.vx*=-1; if(d.y<0||d.y>H)d.vy*=-1;
      ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(0,212,255,${.3+.2*Math.sin(d.a)})`; ctx.fill();
    }); requestAnimationFrame(draw);
  } draw();
})();

// ── HERO CANVAS ────────────────────────────────────────────────────
(function(){
  const c = document.getElementById('heroCanvas'); if(!c) return;
  const ctx = c.getContext('2d'); let t = 0;
  function draw(){
    ctx.clearRect(0,0,320,260);
    ctx.fillStyle='#070f22'; ctx.fillRect(0,0,320,260);
    ctx.strokeStyle='rgba(0,212,255,0.08)'; ctx.lineWidth=1;
    for(let x=0;x<320;x+=20){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,260);ctx.stroke();}
    for(let y=0;y<260;y+=20){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(320,y);ctx.stroke();}
    ctx.save(); ctx.translate(160,130);
    const g=ctx.createRadialGradient(0,0,40,0,0,110);
    g.addColorStop(0,'rgba(0,212,255,0.15)'); g.addColorStop(1,'rgba(0,212,255,0.02)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(0,0,100,70,0,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(0,212,255,0.5)'; ctx.lineWidth=2; ctx.stroke();
    const pulse=Math.sin(t*.05)*3;
    ctx.beginPath(); ctx.arc(30,-10,12+pulse,0,Math.PI*2);
    ctx.fillStyle='rgba(239,68,68,0.3)'; ctx.fill();
    ctx.strokeStyle='#ef4444'; ctx.lineWidth=2; ctx.stroke();
    ctx.strokeStyle='rgba(239,68,68,0.7)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(10,-10); ctx.lineTo(50,-10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(30,-30); ctx.lineTo(30,10); ctx.stroke();
    ctx.restore();
    const sl=(t*1.5)%260;
    const sg=ctx.createLinearGradient(0,sl-20,0,sl+20);
    sg.addColorStop(0,'transparent'); sg.addColorStop(.5,'rgba(0,212,255,0.15)'); sg.addColorStop(1,'transparent');
    ctx.fillStyle=sg; ctx.fillRect(0,sl-20,320,40);
    t++; requestAnimationFrame(draw);
  } draw();
})();

// ── COUNTER ────────────────────────────────────────────────────────
function animateCounter(el, target, dur=2000){
  const dec = target%1!==0, start=performance.now();
  function up(now){ const p=Math.min((now-start)/dur,1), e=1-Math.pow(1-p,3);
    el.textContent=dec?(target*e).toFixed(1):Math.floor(target*e); if(p<1)requestAnimationFrame(up); }
  requestAnimationFrame(up);
}
const obs=new IntersectionObserver(e=>{ e.forEach(x=>{ if(x.isIntersecting){ document.querySelectorAll('.stat-num').forEach(el=>animateCounter(el,parseFloat(el.dataset.target))); obs.disconnect(); }}); },{threshold:.3});
const hero=document.querySelector('.hero'); if(hero) obs.observe(hero);

// ── NAVBAR ─────────────────────────────────────────────────────────
window.addEventListener('scroll',()=>{ document.getElementById('navbar').style.background=window.scrollY>50?'rgba(4,11,26,0.97)':'rgba(4,11,26,0.85)'; });

// ── TABS ───────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
    btn.classList.add('active'); document.getElementById('tab-'+btn.dataset.tab).classList.add('active');
    if(btn.dataset.tab==='fcm') drawFCM();
    if(btn.dataset.tab==='pca') drawPCA();
    if(btn.dataset.tab==='bpn') drawBPN();
  });
});

// ── FCM CANVAS ─────────────────────────────────────────────────────
function drawFCM(){
  const c=document.getElementById('fcmCanvas'); if(!c) return;
  const ctx=c.getContext('2d'); ctx.fillStyle='#070f22'; ctx.fillRect(0,0,340,280);
  const colors=['rgba(0,212,255,0.7)','rgba(124,58,237,0.7)','rgba(16,185,129,0.7)','rgba(245,158,11,0.7)'];
  const centers=[{x:100,y:100},{x:240,y:100},{x:100,y:200},{x:240,y:180}];
  for(let i=0;i<300;i++){
    const x=20+Math.random()*300,y=20+Math.random()*240; let minD=Infinity,ci=0;
    centers.forEach((c,idx)=>{ const d=Math.hypot(x-c.x,y-c.y)+(Math.random()*40-20); if(d<minD){minD=d;ci=idx;} });
    ctx.fillStyle=colors[ci]; ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2); ctx.fill();
  }
  centers.forEach((c,i)=>{ ctx.beginPath(); ctx.arc(c.x,c.y,10,0,Math.PI*2); ctx.fillStyle='#fff'; ctx.fill(); ctx.strokeStyle=colors[i]; ctx.lineWidth=3; ctx.stroke(); });
  ctx.setLineDash([4,4]); ctx.strokeStyle='rgba(0,212,255,0.3)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.ellipse(170,140,120,90,.2,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle='#fff'; ctx.font='12px Inter'; ctx.fillText('FCM Clustered Regions',90,268);
} drawFCM();

// ── PCA CANVAS ─────────────────────────────────────────────────────
function drawPCA(){
  const c=document.getElementById('pcaCanvas'); if(!c) return;
  const ctx=c.getContext('2d'); ctx.fillStyle='#070f22'; ctx.fillRect(0,0,340,280);
  ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.lineWidth=1;
  [60,120,180,240,300].forEach(x=>{ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,280);ctx.stroke();});
  [40,100,160,220].forEach(y=>{ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(340,y);ctx.stroke();});
  for(let i=0;i<80;i++){
    const s=i<50?1:0, x=60+(i/80)*220+Math.random()*30-15, y=s?80+Math.random()*60:180+Math.random()*60;
    ctx.beginPath(); ctx.arc(x,y,5,0,Math.PI*2); ctx.fillStyle=s?'rgba(239,68,68,0.8)':'rgba(16,185,129,0.8)'; ctx.fill();
  }
  ctx.strokeStyle='rgba(0,212,255,0.9)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(50,210); ctx.lineTo(310,80); ctx.stroke();
  ctx.fillStyle='rgba(0,212,255,0.9)'; ctx.font='bold 11px Inter'; ctx.fillText('PC1 (78.4%)',220,75);
  ctx.fillStyle='#fff'; ctx.font='12px Inter'; ctx.fillText('PCA Feature Space',105,268);
}

// ── BPN CANVAS ─────────────────────────────────────────────────────
function drawBPN(){
  const c=document.getElementById('bpnCanvas'); if(!c) return;
  const ctx=c.getContext('2d'); ctx.fillStyle='#070f22'; ctx.fillRect(0,0,340,280);
  const layers=[[60,110,160,210],[80,130,180],[90,145,200],[110,170]];
  const xs=[40,120,220,300];
  const colors=['rgba(0,212,255,','rgba(124,58,237,','rgba(16,185,129,','rgba(245,158,11,'];
  layers.forEach((ly,li)=>{ if(li===layers.length-1)return; ly.forEach(y=>{ layers[li+1].forEach(y2=>{ ctx.strokeStyle='rgba(255,255,255,0.06)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(xs[li],y); ctx.lineTo(xs[li+1],y2); ctx.stroke(); }); }); });
  layers.forEach((ly,li)=>{ ly.forEach(y=>{ ctx.beginPath(); ctx.arc(xs[li],y,10,0,Math.PI*2); ctx.fillStyle=colors[li]+'0.9)'; ctx.fill(); ctx.strokeStyle=colors[li]+'0.5)'; ctx.lineWidth=2; ctx.stroke(); }); });
  ['Input','Hidden 1','Hidden 2','Output'].forEach((l,i)=>{ ctx.fillStyle=colors[i]+'0.9)'; ctx.font='10px Inter'; ctx.textAlign='center'; ctx.fillText(l,xs[i],268); }); ctx.textAlign='left';
}

// ── API STATUS CHECK ───────────────────────────────────────────────
let apiOnline = false;
async function checkAPI(){
  const dot=document.getElementById('apiDot'), txt=document.getElementById('apiStatusText'), mdl=document.getElementById('apiModel');
  try {
    const r = await fetch(`${API}/health`, {signal: AbortSignal.timeout(3000)});
    const d = await r.json();
    if(d.status==='ok'){
      apiOnline = true;
      dot.className='api-dot online';
      if(d.model_loaded){
        txt.textContent = `Model loaded — ${d.accuracy}% accuracy`;
        mdl.textContent = 'MobileNetV2 ✓';
      } else {
        txt.textContent = 'API connected — Demo mode (no model)';
        dot.className='api-dot demo-mode';
        mdl.textContent = 'Demo Mode';
      }
    }
  } catch {
    dot.className='api-dot offline';
    txt.textContent = 'API offline — using frontend simulation';
    mdl.textContent = 'run: python server.py';
    const n=document.getElementById('demoNote');
    if(n){ n.textContent='⚠ API not running. Results are simulated. Start with: python server.py'; n.className='demo-note warn'; }
  }
}
checkAPI();

// ── DEMO STATE ─────────────────────────────────────────────────────
let uploadedFile = null, selectedType = null, imageLoaded = false;
const runBtn = document.getElementById('runBtn');
const runBtnText = document.getElementById('runBtnText');
const fileInput = document.getElementById('fileInput');
const uploadZone = document.getElementById('uploadZone');

function setReady(){
  runBtn.disabled = false;
  runBtnText.textContent = '🔬 Analyze CT Scan';
}

// Sample thumbs (canvas drawing)
document.querySelectorAll('.sample-thumb').forEach(t=>{
  t.addEventListener('click',()=>{
    document.querySelectorAll('.sample-thumb').forEach(x=>x.classList.remove('selected'));
    t.classList.add('selected');
    selectedType = t.dataset.type; uploadedFile = null;
    drawSample(selectedType); imageLoaded = true; setReady();
    const ii = document.getElementById('imgInfo');
    if(ii) ii.textContent = `Sample: ${selectedType.toUpperCase()} | 300×240px`;
  });
});

function drawSample(type){
  const c=document.getElementById('inputCanvas'), ctx=c.getContext('2d');
  ctx.fillStyle='#070f22'; ctx.fillRect(0,0,300,240);
  ctx.strokeStyle='rgba(0,212,255,0.08)'; ctx.lineWidth=1;
  for(let x=0;x<300;x+=15){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,240);ctx.stroke();}
  for(let y=0;y<240;y+=15){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(300,y);ctx.stroke();}
  const col=type==='stone'?'rgba(180,180,210':type==='normal'?'rgba(100,160,200':type==='cyst'?'rgba(80,180,230':'rgba(210,100,100';
  const g=ctx.createRadialGradient(150,120,30,150,120,100);
  g.addColorStop(0,col+',0.5)'); g.addColorStop(1,col+',0.02)');
  ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(150,120,90,70,0,0,Math.PI*2); ctx.fill();
  const col2=type==='stone'?'rgba(200,200,230,0.7)':type==='normal'?'rgba(100,160,200,0.7)':type==='cyst'?'rgba(80,200,255,0.7)':'rgba(220,80,80,0.7)';
  ctx.strokeStyle=col2; ctx.lineWidth=2; ctx.stroke();
  if(type==='stone'){ ctx.beginPath(); ctx.arc(175,105,14,0,Math.PI*2); ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.fill(); ctx.strokeStyle='rgba(255,255,255,0.8)'; ctx.lineWidth=2; ctx.stroke(); }
  if(type==='cyst'){ ctx.beginPath(); ctx.arc(140,115,18,0,Math.PI*2); ctx.fillStyle='rgba(100,200,255,0.25)'; ctx.fill(); ctx.strokeStyle='rgba(100,200,255,0.7)'; ctx.lineWidth=2; ctx.stroke(); }
  if(type==='tumor'){ ctx.beginPath(); ctx.arc(160,110,20,0,Math.PI*2); ctx.fillStyle='rgba(220,80,80,0.3)'; ctx.fill(); ctx.strokeStyle='rgba(220,80,80,0.9)'; ctx.lineWidth=3; ctx.stroke(); }
  ctx.fillStyle='rgba(0,212,255,0.6)'; ctx.font='11px Inter'; ctx.fillText('Sample: '+type.toUpperCase(),10,230);
}

// File upload
fileInput.addEventListener('change',e=>{
  const file=e.target.files[0]; if(!file) return;
  uploadedFile = file; selectedType = null;
  document.querySelectorAll('.sample-thumb').forEach(x=>x.classList.remove('selected'));
  const reader=new FileReader();
  reader.onload=ev=>{
    const img=new Image(); img.onload=()=>{
      const c=document.getElementById('inputCanvas'), ctx=c.getContext('2d');
      ctx.drawImage(img,0,0,300,240);
      imageLoaded=true; setReady();
      const ii=document.getElementById('imgInfo');
      if(ii) ii.textContent=`File: ${file.name} | ${img.width}×${img.height}px`;
    }; img.src=ev.target.result;
  }; reader.readAsDataURL(file);
});

uploadZone.addEventListener('dragover',e=>{e.preventDefault();uploadZone.classList.add('drag');});
uploadZone.addEventListener('dragleave',()=>uploadZone.classList.remove('drag'));
uploadZone.addEventListener('drop',e=>{
  e.preventDefault(); uploadZone.classList.remove('drag');
  const file=e.dataTransfer.files[0]; if(file){ const dt=new DataTransfer(); dt.items.add(file); fileInput.files=dt.files; fileInput.dispatchEvent(new Event('change')); }
});

// ── RUN PIPELINE ───────────────────────────────────────────────────
runBtn.addEventListener('click', async ()=>{
  if(!imageLoaded) return;
  runBtn.disabled=true; runBtnText.textContent='⏳ Analyzing...';
  document.getElementById('resultPlaceholder').classList.remove('hidden');
  document.getElementById('resultContent').classList.add('hidden');

  // Reset steps
  for(let i=1;i<=5;i++){
    document.getElementById('proc'+i).className='proc-step';
    document.getElementById('pstat'+i).textContent='○';
  }

  // Animate steps
  async function step(i, delay){
    await new Promise(r=>setTimeout(r,delay));
    document.getElementById('proc'+i).classList.add('active');
    document.getElementById('pstat'+i).textContent='⏳';
    await new Promise(r=>setTimeout(r,600));
    document.getElementById('proc'+i).classList.remove('active');
    document.getElementById('proc'+i).classList.add('done');
    document.getElementById('pstat'+i).textContent='✓';
  }

  try {
    await step(1,100); await step(2,300); await step(3,500);

    let result;
    if(apiOnline && uploadedFile){
      // Real API call
      const form = new FormData();
      form.append('image', uploadedFile);
      document.getElementById('proc4').classList.add('active');
      document.getElementById('pstat4').textContent='⏳';
      const res = await fetch(`${API}/predict`, {method:'POST', body: form});
      result = await res.json();
      document.getElementById('proc4').classList.remove('active');
      document.getElementById('proc4').classList.add('done');
      document.getElementById('pstat4').textContent='✓';
      await step(5,200);
      showAPIResult(result);
    } else {
      await step(4,400); await step(5,400);
      showSimResult(selectedType||'stone');
    }
  } catch(err) {
    console.error(err);
    for(let i=1;i<=5;i++){ await step(i,100); }
    showSimResult(selectedType||'stone');
  }

  runBtn.disabled=false; runBtnText.textContent='🔬 Analyze Again';
});

// ── SHOW REAL API RESULT ───────────────────────────────────────────
function showAPIResult(d){
  document.getElementById('resultPlaceholder').classList.add('hidden');
  document.getElementById('resultContent').classList.remove('hidden');

  const label=d.prediction.toLowerCase();
  const badge=document.getElementById('resultBadge');
  badge.textContent=`${d.description.icon} ${d.prediction.toUpperCase()} — ${d.confidence}%`;
  badge.className='result-badge '+label;

  const adv=document.getElementById('medicalAdvice');
  adv.textContent=d.description.advice; adv.className='medical-advice '+label;

  // Bars
  const scores=d.all_scores;
  setBar('confStone','confStoneVal',scores.Stone||0);
  setBar('confNormal','confNormalVal',scores.Normal||0);
  setBar('confCyst','confCystVal',scores.Cyst||0);
  setBar('confTumor','confTumorVal',scores.Tumor||0);

  // Features
  const fg=document.getElementById('featureGrid'); fg.innerHTML='';
  const ft=d.features;
  Object.entries(ft).forEach(([k,v])=>{
    fg.innerHTML+=`<div class="feat-item"><span>${k.replace(/_/g,' ')}</span><strong>${v}</strong></div>`;
  });

  // Grad-CAM
  const gi=document.getElementById('gradcamImg');
  if(d.gradcam){ gi.src='data:image/png;base64,'+d.gradcam; gi.style.display='block'; }

  // Inference time
  const it=document.getElementById('inferTime');
  if(it) it.textContent=`⚡ Inference: ${d.inference_ms}ms | Model: ${d.demo_mode?'Demo':'MobileNetV2'} | Acc: ${d.model_accuracy}%`;
}

// ── SHOW SIMULATED RESULT ──────────────────────────────────────────
const SIM_DATA={
  stone:{label:'⚠ KIDNEY STONE',cls:'stone',Stone:93,Normal:3,Cyst:3,Tumor:1,advice:'Kidney stone detected. Recommend urological consultation and hydration therapy.',feats:{mean_intensity:48.3,std_dev:61.2,variance:312.7,entropy:5.82,contrast:0.74,brightness:0.19}},
  normal:{label:'✓ NORMAL KIDNEY',cls:'normal',Stone:2,Normal:94,Cyst:3,Tumor:1,advice:'No abnormality detected. Continue regular health check-ups.',feats:{mean_intensity:62.1,std_dev:42.3,variance:180.4,entropy:4.12,contrast:0.28,brightness:0.24}},
  cyst:{label:'⚡ KIDNEY CYST',cls:'cyst',Stone:5,Normal:10,Cyst:82,Tumor:3,advice:'Kidney cyst detected. Recommend nephrology review and follow-up ultrasound.',feats:{mean_intensity:29.5,std_dev:64.8,variance:420.1,entropy:6.21,contrast:0.91,brightness:0.12}},
  tumor:{label:'🔴 RENAL TUMOR',cls:'tumor',Stone:3,Normal:2,Cyst:5,Tumor:90,advice:'Suspicious mass detected. Urgent oncology referral is recommended immediately.',feats:{mean_intensity:55.7,std_dev:78.2,variance:611.3,entropy:6.84,contrast:0.88,brightness:0.22}}
};

function showSimResult(type){
  const d=SIM_DATA[type]||SIM_DATA.stone;
  document.getElementById('resultPlaceholder').classList.add('hidden');
  document.getElementById('resultContent').classList.remove('hidden');
  const badge=document.getElementById('resultBadge');
  badge.textContent=d.label; badge.className='result-badge '+d.cls;
  const adv=document.getElementById('medicalAdvice');
  adv.textContent=d.advice; adv.className='medical-advice '+d.cls;
  setBar('confStone','confStoneVal',d.Stone);
  setBar('confNormal','confNormalVal',d.Normal);
  setBar('confCyst','confCystVal',d.Cyst);
  setBar('confTumor','confTumorVal',d.Tumor);
  const fg=document.getElementById('featureGrid'); fg.innerHTML='';
  Object.entries(d.feats).forEach(([k,v])=>{ fg.innerHTML+=`<div class="feat-item"><span>${k.replace(/_/g,' ')}</span><strong>${v}</strong></div>`; });
  const gi=document.getElementById('gradcamImg'); if(gi) gi.style.display='none';
  const it=document.getElementById('inferTime'); if(it) it.textContent='⚠ Simulated result — start python server.py for real inference';
}

function setBar(id,vid,val){
  setTimeout(()=>{ document.getElementById(id).style.width=val+'%'; document.getElementById(vid).textContent=val+'%'; },100);
}

// ── METRIC RINGS ───────────────────────────────────────────────────
function drawRing(canvas,pct,color){
  const ctx=canvas.getContext('2d'),cx=60,cy=60,r=48,lw=8;
  ctx.clearRect(0,0,120,120);
  ctx.beginPath(); ctx.arc(cx,cy,r,-Math.PI/2,Math.PI*2-Math.PI/2);
  ctx.strokeStyle='rgba(255,255,255,0.07)'; ctx.lineWidth=lw; ctx.lineCap='round'; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx,cy,r,-Math.PI/2,(pct/100)*Math.PI*2-Math.PI/2);
  ctx.strokeStyle=color; ctx.lineWidth=lw; ctx.lineCap='round'; ctx.stroke();
}
const rObs=new IntersectionObserver(e=>{ e.forEach(x=>{ if(x.isIntersecting){ document.querySelectorAll('.metric-circle').forEach(mc=>{ drawRing(mc.querySelector('.ring-canvas'),parseFloat(mc.dataset.val),mc.dataset.color); animateCounter(mc.querySelector('.ring-val'),parseFloat(mc.dataset.val),1500); }); rObs.disconnect(); }}); },{threshold:.3});
const ms=document.querySelector('.metrics-grid'); if(ms) rObs.observe(ms);

// ── BAR CHART ──────────────────────────────────────────────────────
function drawCompChart(){
  const c=document.getElementById('compChart'); if(!c) return;
  c.width=c.parentElement.offsetWidth-64||700; c.height=320;
  const ctx=c.getContext('2d'),W=c.width,H=320;
  ctx.fillStyle='#070f22'; ctx.fillRect(0,0,W,H);
  const methods=['CNN','SVM','KNN','ANN','BPN (Ours)'], acc=[89.2,87.5,83.1,92.4,97.4];
  const colors=['#7c3aed','#06b6d4','#f59e0b','#10b981','#00d4ff'];
  const pad={l:60,r:20,t:20,b:60}, ch=H-pad.t-pad.b;
  const bw=Math.min(60,(W-pad.l-pad.r)/methods.length-16), bx=(W-pad.l-pad.r)/methods.length;
  [70,80,90,100].forEach(v=>{ const y=pad.t+ch*(1-(v-70)/30); ctx.strokeStyle='rgba(255,255,255,0.06)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(W-pad.r,y); ctx.stroke(); ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='11px Inter'; ctx.textAlign='right'; ctx.fillText(v+'%',pad.l-8,y+4); });
  methods.forEach((m,i)=>{ const x=pad.l+bx*i+(bx-bw)/2, barH=ch*(acc[i]-70)/30, y=pad.t+ch-barH;
    const g=ctx.createLinearGradient(0,y,0,y+barH); g.addColorStop(0,colors[i]); g.addColorStop(1,colors[i]+'44');
    ctx.fillStyle=g; ctx.beginPath(); ctx.roundRect(x,y,bw,barH,4); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 12px Inter'; ctx.textAlign='center'; ctx.fillText(acc[i]+'%',x+bw/2,y-6);
    ctx.fillStyle=colors[i]; ctx.font='11px Inter'; ctx.fillText(m,x+bw/2,H-pad.b+18);
  }); ctx.textAlign='left';
}
drawCompChart(); window.addEventListener('resize', drawCompChart);
