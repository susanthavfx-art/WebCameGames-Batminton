import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createLoadingScreen} from '../src/loading.js';
function documentStub(){const nodes={};const node=()=>({hidden:false,inert:true,textContent:'',value:0,classList:{add(){},remove(){}},setAttribute(){},focus(){this.focused=true}});return {body:node(),getElementById(id){return nodes[id]??=node()}};}
test('loading reports actual progress, keeps app inert, then unlocks only at ready',()=>{
  const doc=documentStub(),frames=[];const before=globalThis.requestAnimationFrame;globalThis.requestAnimationFrame=cb=>frames.push(cb);
  try{const screen=createLoadingScreen(doc);screen.update('Court ready',false,18);assert.equal(doc.getElementById('loadingProgress').value,18);assert.equal(doc.getElementById('app').inert,true);
    screen.update('Ready',false,100);while(frames.length)frames.shift()();assert.equal(doc.getElementById('loadingScreen').hidden,true);assert.equal(doc.getElementById('app').inert,false);
  }finally{globalThis.requestAnimationFrame=before;}
});
test('failure persists despite late progress and retry reloads',()=>{
  const doc=documentStub();let retried=false;const screen=createLoadingScreen(doc,()=>{retried=true});
  screen.update('Asset missing',true);screen.update('Late success',false,100);
  assert.equal(doc.getElementById('loadingMessage').textContent,'Asset missing');assert.equal(doc.getElementById('loadingScreen').hidden,false);assert.equal(doc.getElementById('app').inert,true);assert.equal(doc.getElementById('loadingRetry').hidden,false);
  doc.getElementById('loadingRetry').onclick();assert(retried);
});
