import './style.css';
import './arena-theme.css';
import {createArena} from './arena3d.js';
import {hasWon} from './rules.js';
import {CONTACT, SWING_DURATION, AI, clamp, shotTarget, makeFlight, advanceFlight, canReturn, moveBot, worldContact} from './gameplay.js';
import {createIcons, ArrowUpRight, SlidersHorizontal, Scan, Scan as ScanPersonStanding, Video, LockKeyhole, PersonStanding, Keyboard, Sparkles, VolumeX, Volume2, ArrowRight, ShieldCheck, Zap, Pause, Play, RotateCcw, Maximize, Flag, Bot, Info, MoveHorizontal, Heart} from 'lucide';
const icons={ArrowUpRight,SlidersHorizontal,Scan,ScanPersonStanding,Video,LockKeyhole,PersonStanding,Keyboard,Sparkles,VolumeX,Volume2,ArrowRight,ShieldCheck,Zap,Pause,Play,RotateCcw,Maximize,Flag,Bot,Info,MoveHorizontal,Heart};
const $=id=>document.getElementById(id); const iconize=()=>createIcons({icons});iconize();
const canvas=$('court');
let arena;
$('startBtn').disabled=true;
try { arena=createArena(canvas,(message,error=false)=>{ $('assetStatus').textContent=message; $('assetStatus').classList.toggle('asset-error',error); $('startBtn').disabled=error||message.startsWith('Loading'); }); } catch(error) { $('assetStatus').textContent='3D graphics need WebGL2. Try a browser with hardware acceleration enabled.'; $('assetStatus').classList.add('asset-error'); console.error(error); }
let W=800,H=555,mode='keyboard',running=false,paused=false,started=false,score=[0,0],target=11,level='casual',player=0,bot=0,aim=0,swingTime=0,botSwing=0,shuttle=null,serveAt=0,clock=0,toastUntil=0,rally=0,longest=0,sound=false,audio;
const keys=new Set();let last=performance.now();
let shotDirection=0, pointerDirection=0, pointerAt=-10, botTarget=0, flightId=0;
let contacts=[null,null];
function resize(){const r=canvas.getBoundingClientRect();W=r.width;H=r.height;arena?.resize(W,H)}new ResizeObserver(resize).observe(canvas);
function beep(freq=500){if(!sound)return;try{audio??=new AudioContext();const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);o.frequency.value=freq;g.gain.setValueAtTime(.05,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.12);o.start();o.stop(audio.currentTime+.12)}catch{}}
function toast(text){$('rallyToast').textContent=text;toastUntil=clock+1.5}
function updateScore(){ $('youScore').textContent=String(score[0]).padStart(2,'0');$('aiScore').textContent=String(score[1]).padStart(2,'0')}
function point(who){score[who]++;updateScore();longest=Math.max(longest,rally);shuttle=null;serveAt=clock+2;beep(who===0?760:250);toast(who===0?'Your point. Nicely played!':'Point to Rally Bot');$('toolbarSub').textContent=`Longest rally: ${longest} hits · Keep finding your rhythm.`;if(hasWon(score,who,target)){running=false;$('pause').disabled=true;$('startOverlay').hidden=false;$('startOverlay').classList.add('match-finished');$('startOverlay').querySelector('h2').textContent=who===0?'🏆 You win!':'Good game. Rematch?';$('overlayText').textContent=`${score[0]} – ${score[1]} · Longest rally: ${longest} hits`;$('startBtn').innerHTML='Play again <i data-lucide="arrow-right"></i>';iconize();$('gameState').textContent='MATCH COMPLETE';$('courtStatus').textContent='Match complete';}else $('courtStatus').textContent=score[0]>=target-1&&score[1]>=target-1?'Deuce · win by two':'Next serve coming up'}
function rememberContact(side,s){contacts[side]={...worldContact(s.x,s.z),angle:side===0?shotDirection:0,until:clock+.16};}
function serve(){
  rally=0;contacts=[null,null];
  shuttle=makeFlight(bot,CONTACT.bot,clamp(player,-.65,.65),false,AI[level].flight,++flightId);
  botSwing=clock+.22;rememberContact(1,shuttle);
  $('courtStatus').textContent='Watch the shuttle · swing as it reaches your racket';$('gameState').textContent='MATCH IN PLAY';
}
function swing(direction){
  if(!running||paused||clock<swingTime)return;
  const left=keys.has('a')||keys.has('arrowleft')||keys.has('q');
  const right=keys.has('d')||keys.has('arrowright')||keys.has('e');
  shotDirection=clamp(direction??(right?1:left?-1:clock-pointerAt<.35?pointerDirection:0));
  swingTime=clock+SWING_DURATION;
  $('toolbarTitle').textContent=shotDirection<-.2?'Aiming left ↖':shotDirection>.2?'Aiming right ↗':'Straight shot ↑';
}
function returnShot(side){
  const contact=shuttle;
  rememberContact(side,contact);rally++;
  if(side===0){
    const dest=shotTarget(contact.x,shotDirection);
    shuttle=makeFlight(contact.x,contact.z,dest,true,1.22+Math.abs(dest-contact.x)*.12,++flightId);
    botTarget=clamp(dest+(Math.random()-.5)*2*AI[level].error,-.9,.9);
    swingTime=clock+.22;beep(640);
    $('toolbarTitle').textContent=`${rally} hits · ${shotDirection<-.2?'Left angle':shotDirection>.2?'Right angle':'Down the line'}`;
  }else{
    const dest=(Math.random()*2-1)*(level==='casual'?.62:.82);
    shuttle=makeFlight(contact.x,contact.z,dest,false,AI[level].flight,++flightId);
    botSwing=clock+.22;beep(450);
  }
}
function tick(dt){
  if(!running||paused)return;
  if(mode==='keyboard'){
    if(keys.has('a')||keys.has('arrowleft'))aim-=dt*1.5;
    if(keys.has('d')||keys.has('arrowright'))aim+=dt*1.5;
  }
  aim=clamp(aim,-.9,.9);player+=(aim-player)*Math.min(1,dt*10);
  if(!shuttle){if(clock>=serveAt)serve();return}
  if(shuttle.missed!==undefined){
    shuttle.z+=shuttle.vz*dt*.22;shuttle.y=Math.max(0,shuttle.y-dt*4.8);
    if(shuttle.y===0)point(shuttle.missed);
    return;
  }
  const outgoing=shuttle.vz>0;
  if(outgoing){
    bot=moveBot(bot,botTarget,shuttle.elapsed,dt,level);
    if(shuttle.duration-shuttle.elapsed<.19&&Math.abs(shuttle.targetX-bot)<=CONTACT.reach&&botSwing<clock)botSwing=clock+SWING_DURATION;
  }else bot=moveBot(bot,0,1,dt*.45,level);
  const arrived=advanceFlight(shuttle,dt);
  if(arrived){
    if(canReturn(shuttle,outgoing?bot:player,outgoing||clock<=swingTime))returnShot(outgoing?1:0);
    else {shuttle.missed=outgoing?0:1;$('courtStatus').textContent=outgoing?'Beyond the AI’s reach!':'Missed · wait until the shuttle is close';}
  }
}
function contactTargets(){
  const targets=contacts.map(c=>c&&c.until>=clock?c:null);
  if(shuttle&&shuttle.missed===undefined&&shuttle.duration-shuttle.elapsed<.16){
    const side=shuttle.vz>0?1:0;
    if(clock<(side?botSwing:swingTime)&&Math.abs(shuttle.targetX-(side?bot:player))<=CONTACT.reach)
      targets[side]={...worldContact(shuttle.targetX,shuttle.targetZ),angle:side===0?shotDirection:0};
  }
  return targets;
}
function frame(now){const dt=Math.min((now-last)/1000,.04);last=now;if(!paused)clock+=dt;tick(dt);arena?.render({player,bot,clock,swingTime,botSwing,shuttle,dt,paused,contacts:contactTargets()});if(clock>toastUntil&&!paused)$('rallyToast').textContent='';requestAnimationFrame(frame)}requestAnimationFrame(frame);
function reset(){swingTime=botSwing=0;contacts=[null,null];shotDirection=pointerDirection=0;pointerAt=-10;keys.clear();$('startOverlay').classList.remove('match-finished');running=false;started=false;paused=false;score=[0,0];shuttle=null;player=bot=aim=0;longest=rally=0;updateScore();$('startOverlay').hidden=false;$('startOverlay').querySelector('h2').textContent='Ready when you are.';$('overlayText').textContent='Meet your opponent. Beat your best.';$('startBtn').innerHTML='Let’s play <i data-lucide="arrow-right"></i>';$('pause').innerHTML='<i data-lucide="pause"></i> Pause';$('pause').disabled=true;$('gameState').textContent='READY TO RALLY';$('courtStatus').textContent='Waiting for first serve';$('rallyToast').textContent='';iconize()}
$('startBtn').onclick=()=>{if(!arena?.ready)return;$('startBtn').blur();if(started)reset();started=running=true;paused=false;serveAt=clock+1.2;$('startOverlay').hidden=true;$('pause').disabled=false;toast('Get ready…');$('gameState').textContent='FIRST SERVE';};
function pause(){if(!running)return;paused=!paused;$('pause').innerHTML=paused?'<i data-lucide="play"></i> Resume':'<i data-lucide="pause"></i> Pause';$('gameState').textContent=paused?'MATCH PAUSED':'MATCH IN PLAY';$('rallyToast').textContent=paused?'Take a breath. Match paused.':'';iconize()}
$('pause').onclick=()=>{$('pause').blur();pause()};$('restart').onclick=reset;document.addEventListener('visibilitychange',()=>{if(document.hidden&&running&&!paused)pause()});window.addEventListener('blur',()=>{keys.clear();if(running&&!paused)pause()});
window.addEventListener('keydown',e=>{if($('settingsDialog').open||['INPUT','SELECT','BUTTON'].includes(e.target.tagName))return;const k=e.key.toLowerCase();if([' ','arrowleft','arrowright'].includes(k))e.preventDefault();keys.add(k);if(k===' '&&!e.repeat&&mode==='keyboard')swing();if(k==='escape')pause()});window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));canvas.addEventListener('pointermove',e=>{if(mode==='keyboard'&&running){pointerDirection=clamp(e.movementX/12);if(Math.abs(e.movementX)>1)pointerAt=clock;aim=((e.clientX-canvas.getBoundingClientRect().left)/W-.5)*2.3}});canvas.addEventListener('pointerdown',()=>{if(mode==='keyboard')swing()});
$('sound').onclick=()=>{sound=!sound;$('sound').innerHTML=`<i data-lucide="volume-${sound?'2':'x'}"></i>`;iconize();if(sound)beep()};$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('.arena').requestFullscreen()}catch{toast('Fullscreen is unavailable in this browser')}};
$('settings').onclick=()=>{if(running&&!paused)pause();$('settingsDialog').showModal()};$('applySettings').onclick=()=>{target=Number($('points').value);level=$('difficulty').value;$('targetLabel').textContent=`FIRST TO ${target}`;$('pointsLabel').textContent=`${target} points`;$('difficultyLabel').textContent={casual:'Casual ▂',club:'Club player ▂▄',pro:'Pro ▂▄▆'}[level];document.querySelector('.rule-note span').innerHTML=`Rally scoring. Every rally counts.<br>At ${target-1}–${target-1}, win by two. Cap at ${target===11?15:30}.`;reset()};$('guideNav').onclick=()=>{$('howto').scrollIntoView({behavior:'smooth',block:'center'});$('howto').classList.add('highlight');setTimeout(()=>$('howto').classList.remove('highlight'),2200)};
let stream,pose,loading=false,tracking=false,prevWrist=null,lastSeen=0;
function setMode(next){mode=next;$('motionMode').classList.toggle('selected',mode==='motion');$('keyboardMode').classList.toggle('selected',mode==='keyboard');$('startHint').textContent=mode==='motion'?'Swing left / right to aim · Wait for the shuttle':'A / D move · Space swing · Hold Q / E to aim';if(mode==='keyboard'){$('cameraStatus').textContent='Camera is off. You’re in keyboard mode.';if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}$('video').srcObject=null;$('cameraEmpty').hidden=false;$('cameraEmpty').style.display='';$('trackingStatus').hidden=true;$('camBadge').textContent='OFFLINE';$('trackDot').style.background='';const c=$('poseCanvas');c.getContext('2d').clearRect(0,0,c.width,c.height);tracking=false;prevWrist=null}}
$('keyboardMode').onclick=()=>setMode('keyboard');$('motionMode').onclick=()=>enableCamera();$('cameraBtn').onclick=()=>enableCamera();
async function loadPose(){if(pose)return;if(!window.Pose){await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=`${import.meta.env.BASE_URL}pose/pose.js`;s.onload=resolve;s.onerror=()=>{s.remove();reject(new Error('Motion engine could not load. Please try again.'))};document.head.appendChild(s)})}pose=new window.Pose({locateFile:f=>`${import.meta.env.BASE_URL}pose/${f}`});pose.setOptions({modelComplexity:0,smoothLandmarks:true,enableSegmentation:false,minDetectionConfidence:.55,minTrackingConfidence:.55});pose.onResults(onPose);await pose.initialize()}
async function enableCamera(){if(loading||stream)return;loading=true;$('cameraBtn').disabled=true;$('cameraBtn').textContent='Starting camera…';$('cameraStatus').textContent='Allow camera access when your browser asks.';try{if(!navigator.mediaDevices?.getUserMedia)throw new Error('Camera needs HTTPS and a supported browser.');stream=await navigator.mediaDevices.getUserMedia({video:{width:640,height:480,facingMode:'user'},audio:false});$('video').srcObject=stream;await $('video').play();$('cameraStatus').textContent='Loading on-device motion engine…';await loadPose();setMode('motion');$('cameraEmpty').hidden=true;$('cameraEmpty').style.display='none';$('trackingStatus').hidden=false;$('camBadge').textContent='LIVE';tracking=true;trackLoop()}catch(e){setMode('keyboard');$('cameraStatus').textContent=e.name==='NotAllowedError'?'Camera permission denied. Allow access and try again.':e.name==='NotFoundError'?'No webcam found. Use keyboard mode instead.':e.message||'Could not start camera. Try again.';pose=null}finally{loading=false;$('cameraBtn').disabled=false;$('cameraBtn').innerHTML='<i data-lucide="video"></i> Enable camera';iconize()}}
async function trackLoop(){if(!tracking||!stream)return;try{await pose.send({image:$('video')});if(performance.now()-lastSeen>1000){$('trackingStatus').textContent='Step back until your upper body is visible';prevWrist=null}}catch{setMode('keyboard');$('cameraStatus').textContent='Motion tracking stopped. Enable camera to retry.';return}if(tracking)requestAnimationFrame(trackLoop)}
function onPose(results){if(!tracking)return;const c=$('poseCanvas');c.width=640;c.height=480;const p=c.getContext('2d');p.clearRect(0,0,640,480);const lm=results.poseLandmarks;if(!lm||lm[11].visibility<.5||lm[12].visibility<.5){$('trackingStatus').textContent='Step back until your upper body is visible';prevWrist=null;return}lastSeen=performance.now();$('trackDot').style.background='#d2f985';$('cameraStatus').textContent='Motion connected · Your body is the controller';$('trackingStatus').textContent='Pose detected · Move & swing your hand';for(const [a,b] of [[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24]])if(lm[a].visibility>.5&&lm[b].visibility>.5){p.beginPath();p.moveTo(lm[a].x*640,lm[a].y*480);p.lineTo(lm[b].x*640,lm[b].y*480);p.strokeStyle='#d2f985';p.lineWidth=3;p.stroke()}for(const n of [11,12,13,14,15,16,23,24])if(lm[n].visibility>.5){p.beginPath();p.arc(lm[n].x*640,lm[n].y*480,5,0,Math.PI*2);p.fillStyle='#e1ffae';p.fill()}
if(mode!=='motion')return;aim=(.5-(lm[11].x+lm[12].x)/2)*4;const now=performance.now();const wrists=[lm[15],lm[16]];if(prevWrist){const dt=(now-prevWrist.time)/1000;if(dt>.01&&dt<.3){for(let i=0;i<2;i++){const w=wrists[i],old=prevWrist.w[i];const velocity=Math.hypot(w.x-old.x,w.y-old.y)/dt;if(w.visibility>.6&&old.visibility>.6&&velocity>.85&&w.y<lm[23+i].y){swing(clamp(-(w.x-old.x)/dt/1.4));break}}}}prevWrist={time:now,w:wrists.map(w=>({...w}))}}
window.addEventListener('pagehide',()=>{stream?.getTracks().forEach(t=>t.stop())});
