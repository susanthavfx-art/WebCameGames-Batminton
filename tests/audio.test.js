import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGameAudio} from '../src/audio.js';
function fakeContext(){
  const nodes=[],buffers=[];
  const param=()=>({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}});
  const node=type=>{const n={type,gain:param(),frequency:param(),stopped:0,disconnected:0,connect(){},disconnect(){this.disconnected++},start(){},stop(){this.stopped++}};nodes.push(n);return n;};
  return {state:'running',currentTime:0,sampleRate:1000,destination:{},nodes,buffers,
    createGain:()=>node('gain'),createOscillator:()=>node('oscillator'),createBiquadFilter:()=>node('filter'),createBufferSource:()=>node('bufferSource'),
    createBuffer(channels,length){const data=Array.from({length:channels},()=>new Float32Array(length));const buffer={data,getChannelData:i=>data[i]};buffers.push(buffer);return buffer},resume(){this.state='running';return Promise.resolve()}};
}
test('audio stays silent until explicitly enabled, and AI scores do not cheer',()=>{
  const ctx=fakeContext();let calls=0;const audio=createGameAudio(()=>{calls++;return ctx});
  audio.point(0);audio.beep();assert.equal(calls,0);
  audio.setEnabled(true);audio.point(1);assert.equal(ctx.buffers.length,0);
  audio.point(0);assert.equal(ctx.buffers.length,1);
  assert.equal(ctx.buffers[0].data.length,2);assert.equal(ctx.buffers[0].data[0].length,1800);
  assert(ctx.buffers[0].data[0].every(x=>Number.isFinite(x)&&Math.abs(x)<=.7));
});
test('mute stops current cheer immediately and prevents future sounds',()=>{
  const ctx=fakeContext(),audio=createGameAudio(()=>ctx);audio.setEnabled(true);audio.point(0);
  const noise=ctx.nodes.find(n=>n.type==='bufferSource');const previous=noise.stopped;
  audio.setEnabled(false);assert(noise.stopped>previous);assert.equal(ctx.nodes[0].gain.value,0);
  const count=ctx.nodes.length;audio.point(0);audio.beep();assert.equal(ctx.nodes.length,count);
});
test('repeat points replace the current cheer instead of stacking, and reset/pause can stop it',()=>{
  const ctx=fakeContext(),audio=createGameAudio(()=>ctx);audio.setEnabled(true);audio.point(0);
  const source=ctx.nodes.find(n=>n.type==='bufferSource'),stops=source.stopped;
  audio.point(0);assert(source.stopped>stops);assert.equal(ctx.buffers.length,2);
  audio.stopCheer();audio.stopCheer(); // idempotent
});
test('unsupported audio fails gracefully and suspended audio is not queued',()=>{
  const absent=createGameAudio(()=>{throw new Error('unsupported')});absent.setEnabled(true);assert.equal(absent.enabled,false);absent.point(0);
  const ctx=fakeContext(),audio=createGameAudio(()=>ctx);audio.setEnabled(true);ctx.state='suspended';audio.point(0);assert.equal(ctx.buffers.length,0);
  audio.setEnabled(true);assert.equal(ctx.state,'running');audio.point(0);assert.equal(ctx.buffers.length,1);
});
