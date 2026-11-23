import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CONTACT, AI, shotTarget, makeFlight, advanceFlight, canReturn, moveBot, worldContact} from '../src/gameplay.js';

test('no remote hits: active swing cannot return a shuttle halfway down court',()=>{
  const s=makeFlight(0,CONTACT.bot,0,false,1.7);
  advanceFlight(s,1.1);
  assert.equal(canReturn(s,0,true),false);
  advanceFlight(s,.6);
  assert.equal(s.z,CONTACT.player);
  assert.equal(canReturn(s,0,true),true);
  assert.equal(canReturn(s,0,false),false);
  assert.equal(canReturn(s,.5,true),false);
});
test('contact plane and exact height are shared by flight and animation',()=>{
  const s=makeFlight(-.4,CONTACT.player,.7,true,1.4);
  advanceFlight(s,10); // Slow frame cannot jump over the contact plane.
  assert.equal(s.x,.7);assert.equal(s.z,CONTACT.bot);
  assert(Math.abs(s.y-CONTACT.height)<1e-10);
  const p=worldContact(s.x,s.z);assert.equal(p.y,CONTACT.height);assert(Math.abs(p.z+4.757)<1e-9);
});
test('left / right swing aims left / right, neutral goes down the line',()=>{
  assert(shotTarget(0,-.6)<-.7);assert(shotTarget(0,.6)>.7);
  assert.equal(shotTarget(.35,0),.35);
  assert.equal(shotTarget(.8,1),.87);assert.equal(shotTarget(-.8,-1),-.87);
});
test('bot cannot instantly react or teleport, including Pro',()=>{
  for(const level of Object.keys(AI)){
    assert.equal(moveBot(0,.8,0,.016,level),0);
    assert(moveBot(0,.8,1,.016,level)<=AI[level].speed*.016+1e-10);
  }
});
function defend(start,target,level){
  const s=makeFlight(-.5,CONTACT.player,target,true,1.4);
  let bot=start;
  while(s.elapsed<s.duration){bot=moveBot(bot,target,s.elapsed,1/120,level);advanceFlight(s,1/120)}
  return canReturn(s,bot,true);
}
test('casual AI returns reachable shots but loses to a well-placed wide shot',()=>{
  assert.equal(defend(0,.2,'casual'),true);
  assert.equal(defend(-.7,.87,'casual'),false);
  assert.equal(defend(0,.87,'casual'),false);
});
test('higher difficulty covers more court without becoming unbeatable',()=>{
  assert.equal(defend(0,.87,'pro'),true);
  assert.equal(defend(-.87,.87,'pro'),false);
});
test('contact positions are stable at 30, 60 and 120 FPS',()=>{
  for(const fps of [30,60,120]){
    const s=makeFlight(.3,CONTACT.bot,-.25,false,1.7);
    while(!advanceFlight(s,1/fps))assert.equal(canReturn(s,s.x,true),false);
    assert.equal(s.x,-.25);assert.equal(s.z,CONTACT.player);
  }
});
