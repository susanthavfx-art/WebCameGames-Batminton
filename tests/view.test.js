import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cameraFrame,coverCrop,missionProgress} from '../src/view.js';
import {hasWon} from '../src/rules.js';

test('default camera is behind the player at head height, not above the court',()=>{
  for(const aspect of [16/9,390/575]){
    const frame=cameraFrame(aspect);
    assert(frame.y>=2&&frame.y<=2.3);
    assert(frame.z>5.6);
    assert(frame.x>0,'Shoulder offset keeps the head away from the central sightline');
    assert(frame.lookY>=2&&frame.lookY<=2.3);
  }
});
test('eye-level view follows lateral player movement, overview remains fixed',()=>{
  assert(cameraFrame(16/9,-.8).x<cameraFrame(16/9,.8).x);
  assert.deepEqual(cameraFrame(16/9,-.8,'overview'),cameraFrame(16/9,.8,'overview'));
  assert(cameraFrame(16/9,0,'overview').y>cameraFrame(16/9).y);
});
test('stadium covers landscape and portrait viewports without stretching',()=>{
  const imageAspect=1568/882;
  for(const viewport of [16/9,2.4,.68]){
    const crop=coverCrop(imageAspect,viewport);
    assert(crop.x>0&&crop.x<=1&&crop.y>0&&crop.y<=1);
    assert(Math.abs(imageAspect*crop.x/crop.y-viewport)<1e-9);
    assert.equal(crop.offsetX,(1-crop.x)/2);assert.equal(crop.offsetY,(1-crop.y)/2);
  }
});
test('mission boards reflect actual match progress and reset cleanly',()=>{
  assert.deepEqual(missionProgress([0,0],0,11,hasWon),[false,false,false]);
  assert.deepEqual(missionProgress([7,8],5,11,hasWon),[false,true,true]);
  assert.deepEqual(missionProgress([11,10],3,11,hasWon),[false,true,false]);
  assert.deepEqual(missionProgress([12,10],6,11,hasWon),[true,true,true]);
  assert.deepEqual(missionProgress([0,0],0,11,hasWon),[false,false,false]);
});
