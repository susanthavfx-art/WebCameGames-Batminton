import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGameAudio,CROWD_FILES,REACTION_SECONDS} from '../src/audio.js';
function setup(options={}){
  const nodes=[],urls=[];let id=0;
  const param=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}});
  const node=type=>{const n={type,gain:param(),frequency:param(),stopped:0,connect(){},disconnect(){},start(...args){this.startArgs=args},stop(){this.stopped++}};nodes.push(n);return n;};
  const ctx={state:'running',currentTime:10,destination:{},createGain:()=>node('gain'),createOscillator:()=>node('oscillator'),createBufferSource:()=>node('source'),decodeAudioData:async data=>({duration:12,id:data.id}),resume(){this.state='running';return Promise.resolve()}};
  const fetcher=async url=>{urls.push(url);return {ok:true,arrayBuffer:async()=>({id:id++})}};
  const audio=createGameAudio(()=>ctx,{baseUrl:'/WebCameGames-Batminton/',fetcher,...options});
  return {ctx,nodes,urls,audio,sources:()=>nodes.filter(n=>n.type==='source')};
}
test('muted by default; enabling preloads both MP3s under the Pages base',async()=>{
  const s=setup();await s.audio.point(0);s.audio.beep();assert.equal(s.urls.length,0);
  s.audio.setEnabled(true);await s.audio.ready;
  assert.deepEqual(s.urls,CROWD_FILES.map(f=>`/WebCameGames-Batminton/sound/${f}`));
  await s.audio.point(0);assert.equal(s.sources()[0].buffer.id,0);assert.deepEqual(s.sources()[0].startArgs,[10,8,REACTION_SECONDS]);
  await s.audio.point(1);assert.equal(s.sources()[1].buffer.id,1);
  assert.deepEqual(s.sources()[1].startArgs,[10,0,REACTION_SECONDS]);
  assert.equal(s.sources()[1].loop,false);assert.equal(s.urls.length,2);
});
test('mute stops disappointment too; no overlap or new sounds while muted',async()=>{
  const s=setup();s.audio.setEnabled(true);await s.audio.ready;await s.audio.point(0);
  const first=s.sources()[0],stops=first.stopped;
  await s.audio.point(1);assert(first.stopped>stops);
  const second=s.sources()[1],old=second.stopped;s.audio.setEnabled(false);assert(second.stopped>old);
  assert.equal(s.nodes[0].gain.value,0);await s.audio.point(0);assert.equal(s.sources().length,2);
});
test('pending decode cannot play after reset or mute',async()=>{
  let release;const gate=new Promise(r=>release=r);
  const s=setup({fetcher:async()=>{await gate;return {ok:true,arrayBuffer:async()=>({id:0})}}});
  s.audio.setEnabled(true);const point=s.audio.point(0);s.audio.stopCheer();release();await point;
  assert.equal(s.sources().length,0);
});
test('slow downloads do not cause late reactions',async()=>{
  let clock=0,release;const gate=new Promise(r=>release=r);
  const s=setup({now:()=>clock,fetcher:async()=>{await gate;return {ok:true,arrayBuffer:async()=>({})}}});
  s.audio.setEnabled(true);const point=s.audio.point(1);clock=1000;release();await point;assert.equal(s.sources().length,0);
});
test('HTTP failures, suspended audio and unsupported browsers are safe',async()=>{
  const s=setup({fetcher:async()=>({ok:false,status:404})});s.audio.setEnabled(true);await s.audio.ready;await s.audio.point(0);assert.equal(s.sources().length,0);
  s.ctx.state='suspended';await s.audio.point(1);assert.equal(s.sources().length,0);
  const absent=createGameAudio(()=>{throw Error('unsupported')});absent.setEnabled(true);assert.equal(absent.enabled,false);await absent.point(0);
});
