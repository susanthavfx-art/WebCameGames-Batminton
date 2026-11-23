// Recorded crowd reactions, decoded once after the user enables sound.
export const CROWD_FILES=['crowd-cheering.mp3','crowd-disappointment.mp3'];
// The cheer recording has a quiet intro; use its audible applause at 8 seconds.
export const CROWD_OFFSETS=[8,0];
export const REACTION_SECONDS=1.8;
export function createGameAudio(
  contextFactory=()=>new (globalThis.AudioContext||globalThis.webkitAudioContext)(),
  {fetcher=(url)=>fetch(url),baseUrl=import.meta.env?.BASE_URL||'/',now=()=>performance.now()}={}
){
  let context,master,enabled=false,reaction=null,generation=0,ready=Promise.resolve();
  const buffers=new Map(),pending=new Map();
  function load(file){
    if(buffers.has(file))return Promise.resolve(buffers.get(file));
    if(pending.has(file))return pending.get(file);
    const request=(async()=>{
      try{
        const response=await fetcher(`${baseUrl}sound/${file}`);
        if(!response.ok)throw new Error(`Audio HTTP ${response.status}`);
        const buffer=await context.decodeAudioData(await response.arrayBuffer());
        buffers.set(file,buffer);return buffer;
      }catch{return null;} // Failed audio must not prevent playing the game; toggle to retry.
      finally{pending.delete(file);}
    })();
    pending.set(file,request);return request;
  }
  // Retain the existing method name for pause/reset/tab-hide callers; stops either clip.
  function stopCheer(){
    generation++;
    if(!reaction)return;
    try{reaction.source.stop()}catch{}
    reaction.gain.disconnect();reaction=null;
  }
  function setEnabled(value){
    enabled=value;
    if(!enabled){if(master)master.gain.value=0;stopCheer();return;}
    try{
      if(!context){context=contextFactory();master=context.createGain();master.connect(context.destination);}
      master.gain.value=.65;
      if(context.state==='suspended')context.resume().catch(()=>{});
      ready=Promise.all(CROWD_FILES.map(load));
    }catch{enabled=false;}
  }
  function beep(frequency=500){
    if(!enabled||!context||context.state!=='running')return;
    const o=context.createOscillator(),g=context.createGain();o.connect(g);g.connect(master);
    o.frequency.value=frequency;g.gain.setValueAtTime(.05,context.currentTime);g.gain.exponentialRampToValueAtTime(.001,context.currentTime+.12);
    o.onended=()=>{o.disconnect();g.disconnect()};o.start();o.stop(context.currentTime+.12);
  }
  async function point(winner){
    if((winner!==0&&winner!==1)||!enabled||!context||context.state!=='running')return;
    stopCheer();const token=generation,requested=now();
    const buffer=await load(CROWD_FILES[winner]);
    // Never play a stale result after mute/reset, a newer point, or a slow download.
    if(!buffer||!enabled||token!==generation||context.state!=='running'||now()-requested>300)return;
    const offset=buffer.duration>=CROWD_OFFSETS[winner]+REACTION_SECONDS?CROWD_OFFSETS[winner]:0;
    const duration=Math.min(REACTION_SECONDS,buffer.duration-offset);
    if(duration<=0)return;
    const at=context.currentTime,source=context.createBufferSource(),gain=context.createGain();
    source.buffer=buffer;source.loop=false;source.connect(gain);gain.connect(master);
    gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.85,at+Math.min(.03,duration*.1));
    gain.gain.setValueAtTime(.85,at+duration*.75);gain.gain.linearRampToValueAtTime(0,at+duration);
    const current={source,gain};reaction=current;
    source.onended=()=>{source.disconnect();gain.disconnect();if(reaction===current)reaction=null;};
    source.start(at,offset,duration);source.stop(at+duration);
  }
  return {setEnabled,beep,point,stopCheer,get enabled(){return enabled},get ready(){return ready}};
}
