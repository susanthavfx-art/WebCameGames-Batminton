// Real-loop checks for timed high/low contacts and a reachable limit on the faster AI.
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||undefined,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1100,height:850}});const errors=[];
page.on('pageerror',e=>errors.push(e.message));mkdirSync('.artifacts',{recursive:true});
async function timedReturn(label,delay){
  await page.waitForFunction(text=>document.querySelector('#courtStatus').textContent.startsWith(text),label,{timeout:180000});
  // Match the game's capped frame delta to tolerate software WebGL running slowly.
  // Only send keyboard events; do not mutate or access internal simulation state.
  await page.evaluate(delay=>{
    let previous=performance.now(),elapsed=0,swung=false;
    window.dispatchEvent(new KeyboardEvent('keydown',{key:'e'}));
    function input(now){
      elapsed+=Math.min((now-previous)/1000,.04);previous=now;
      if(!swung&&elapsed>=delay){swung=true;window.dispatchEvent(new KeyboardEvent('keydown',{key:' '}));window.dispatchEvent(new KeyboardEvent('keyup',{key:' '}));}
      if(swung&&document.querySelector('#toolbarTitle').textContent.includes('hits · Right angle')){document.querySelector('#pause').click();return;}
      if(elapsed<4)requestAnimationFrame(input);
    }
    requestAnimationFrame(input);
  },delay);
  await page.waitForFunction(()=>document.querySelector('#gameState').textContent==='MATCH PAUSED',null,{timeout:180000});
  assert((await page.locator('#courtStatus').textContent()).startsWith(label));
}
try{
  await page.goto(process.env.TEST_URL||'http://localhost:5173');
  await page.waitForFunction(()=>document.querySelector('#assetStatus').textContent.startsWith('3D arena ready'),null,{timeout:60000});
  await page.click('#startBtn');
  await timedReturn('High clear',1.60);
  assert.equal(await page.locator('#youScore').textContent(),'00');
  assert.equal(await page.locator('#aiScore').textContent(),'00');
  await page.screenshot({path:'.artifacts/racket-contact.png',fullPage:true});
  await page.click('#pause');
  await page.waitForFunction(()=>document.querySelector('#youScore').textContent==='01',null,{timeout:180000});
  assert.equal(await page.locator('#aiScore').textContent(),'00');
  await timedReturn('Low drive',1.34);
  assert.equal(await page.locator('#aiScore').textContent(),'00');
  await page.screenshot({path:'.artifacts/low-contact.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('PASS: high-clear and low-drive contacts both return; faster Casual AI still loses to a well-placed wide shot.');
}catch(error){console.error(await page.evaluate(()=>({state:document.querySelector('#gameState')?.textContent,score:document.querySelector('#youScore')?.textContent,aiScore:document.querySelector('#aiScore')?.textContent,status:document.querySelector('#courtStatus')?.textContent,title:document.querySelector('#toolbarTitle')?.textContent})));console.error(errors);await page.screenshot({path:'.artifacts/rally-failure.png',fullPage:true});throw error;}finally{await browser.close()}
