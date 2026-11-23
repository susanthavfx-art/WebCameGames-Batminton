// Local, synthesized crowd applause/cheers: no downloads, microphone or speech API.
export function createGameAudio(contextFactory = () => new (globalThis.AudioContext || globalThis.webkitAudioContext)()) {
  let context, master, enabled=false, cheer=null;
  function stopCheer(){if(!cheer)return;for(const source of cheer.sources){try{source.stop()}catch{}}cheer.gain.disconnect();cheer=null;}
  function setEnabled(value){
    enabled=value;
    if(!enabled){if(master)master.gain.value=0;stopCheer();return;}
    try{
      if(!context){context=contextFactory();master=context.createGain();master.gain.value=.65;master.connect(context.destination);}
      master.gain.value=.65;
      if(context.state==='suspended')context.resume().catch(()=>{});
    }catch{enabled=false;}
  }
  function beep(frequency=500){
    if(!enabled||!context||context.state!=='running')return;
    const o=context.createOscillator(),g=context.createGain();o.connect(g);g.connect(master);
    o.frequency.value=frequency;g.gain.setValueAtTime(.05,context.currentTime);g.gain.exponentialRampToValueAtTime(.001,context.currentTime+.12);
    o.onended=()=>{o.disconnect();g.disconnect()};o.start();o.stop(context.currentTime+.12);
  }
  function point(winner){
    if(winner!==0||!enabled||!context||context.state!=='running')return;
    stopCheer();
    const now=context.currentTime,duration=1.8,group=context.createGain(),sources=[];
    cheer={gain:group,sources};group.connect(master);
    group.gain.setValueAtTime(0,now);group.gain.linearRampToValueAtTime(.32,now+.15);
    group.gain.setValueAtTime(.28,now+.8);group.gain.exponentialRampToValueAtTime(.001,now+duration);
    // Stereo layered noise: a distant crowd swell with scattered short hand claps.
    const buffer=context.createBuffer(2,Math.ceil(context.sampleRate*duration),context.sampleRate);
    for(let channel=0;channel<2;channel++){
      const data=buffer.getChannelData(channel);let rumble=0;
      const claps=Array.from({length:32},()=>({at:Math.random()*1.45,level:.3+Math.random()*.5}));
      for(let i=0;i<data.length;i++){
        const t=i/context.sampleRate;rumble=rumble*.94+(Math.random()*2-1)*.06;
        let envelope=.15;
        for(const clap of claps){const age=t-clap.at;if(age>=0&&age<.075)envelope+=clap.level*Math.exp(-age*65);}
        data[i]=Math.tanh((Math.random()*2-1)*envelope+rumble*1.4)*.7;
      }
    }
    const noise=context.createBufferSource(),filter=context.createBiquadFilter();noise.buffer=buffer;
    filter.type='lowpass';filter.frequency.value=4400;noise.connect(filter);filter.connect(group);sources.push(noise);
    // Several soft, rising/falling whoops blend into the applause (not spoken voices).
    for(let i=0;i<5;i++){
      const o=context.createOscillator(),g=context.createGain(),at=now+.08+i*.17,base=330+i*59;
      o.type='sine';o.frequency.setValueAtTime(base,at);o.frequency.exponentialRampToValueAtTime(base*1.65,at+.16);o.frequency.exponentialRampToValueAtTime(base*1.15,at+.5);
      g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(.065,at+.1);g.gain.exponentialRampToValueAtTime(.001,at+.55);
      o.connect(g);g.connect(group);sources.push(o);o.onended=()=>{o.disconnect();g.disconnect()};o.start(at);o.stop(at+.58);
    }
    const current=cheer;
    noise.onended=()=>{noise.disconnect();filter.disconnect();group.disconnect();if(cheer===current)cheer=null;};
    noise.start(now);noise.stop(now+duration);
  }
  return {setEnabled,beep,point,stopCheer,get enabled(){return enabled}};
}
