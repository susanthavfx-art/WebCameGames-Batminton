import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CONTACT,SHOTS,AI,incomingShot,isRaisedStroke,makeFlight,advanceFlight,worldContact,canReturn} from '../src/gameplay.js';

test('AI mixes overhead clears, low drives and standard shots without low-only streaks',()=>{
  assert.equal(incomingShot(0),'clear');
  for(let start=0;start<16;start++){
    const mix=Array.from({length:4},(_,i)=>incomingShot(start+i));
    assert(mix.includes('clear'));assert(mix.includes('drive'));
  }
});
test('high clear travels higher and arrives above the player head; drive arrives lower',()=>{
  const flight=type=>makeFlight(0,CONTACT.bot,0,false,1.7,1,{targetHeight:SHOTS[type].height,arcHeight:SHOTS[type].arc});
  const high=flight('clear'),low=flight('drive');
  advanceFlight(high,.85);advanceFlight(low,.85);
  assert(high.y>low.y+1);
  assert(!canReturn(high,0,true),'High flight must not reintroduce distant hits');
  advanceFlight(high,.85);advanceFlight(low,.85);
  assert(high.y>2.2);assert(low.y<2.2);
  assert.equal(worldContact(high.x,high.z,high.y).y,SHOTS.clear.height);
  assert.equal(worldContact(low.x,low.z,low.y).y,SHOTS.drive.height);
});
test('height is continuous through high and low returns at different frame rates',()=>{
  for(const fps of [30,60,120])for(const profile of Object.values(SHOTS)){
    const incoming=makeFlight(0,CONTACT.bot,.1,false,1.7,1,{targetHeight:profile.height,arcHeight:profile.arc});
    while(!advanceFlight(incoming,1/fps)){}
    const outgoing=makeFlight(incoming.x,incoming.z,-.6,true,1.4,2,{startHeight:incoming.y});
    assert.equal(outgoing.y,incoming.y);assert.equal(outgoing.startY,profile.height);
    assert.equal(outgoing.targetY,CONTACT.height);
  }
});
test('raising either wrist above shoulder qualifies, including downward follow-through',()=>{
  const shoulder={y:.4};
  assert(isRaisedStroke({y:.2},{y:.25},shoulder));
  assert(isRaisedStroke({y:.43},{y:.25},shoulder));
  assert(!isRaisedStroke({y:.6},{y:.57},shoulder));
});
test('red movement speed increases modestly while reaction delay remains',()=>{
  for(const [level,oldSpeed] of Object.entries({casual:.34,club:.53,pro:.76})){
    assert(AI[level].speed>oldSpeed);assert(AI[level].speed<oldSpeed*1.2);
    assert(AI[level].reaction>0);
  }
});
