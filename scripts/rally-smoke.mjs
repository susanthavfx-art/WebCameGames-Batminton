// Real game-loop regression: a directional blue return must be able to beat Casual AI.
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||undefined,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1280,height:1000}});const errors=[];
page.on('pageerror',e=>errors.push(e.message));mkdirSync('.artifacts',{recursive:true});
try{
  await page.goto(process.env.TEST_URL||'http://localhost:5173');
  await page.waitForFunction(()=>document.querySelector('#assetStatus').textContent.startsWith('3D arena ready'),null,{timeout:60000});
  await page.click('#startBtn');
  // Synthetic user key events only; no internal game-state mutation.
  await page.evaluate(()=>{
    window.dispatchEvent(new KeyboardEvent('keydown',{key:'e'}));
    window.rallyInput=setInterval(()=>{
      window.dispatchEvent(new KeyboardEvent('keydown',{key:' '}));
      window.dispatchEvent(new KeyboardEvent('keyup',{key:' '}));
    },80);
    window.contactWatcher=setInterval(()=>{
      if(document.querySelector('#toolbarTitle').textContent.includes('hits · Right angle')){
        clearInterval(window.contactWatcher);clearInterval(window.rallyInput);
        document.querySelector('#pause').click();
      }
    },16);
  });
  await page.waitForFunction(()=>document.querySelector('#gameState').textContent==='MATCH PAUSED',null,{timeout:90000});
  assert.equal(await page.locator('#youScore').textContent(),'00');
  assert.equal(await page.locator('#aiScore').textContent(),'00');
  await page.screenshot({path:'.artifacts/racket-contact.png',fullPage:true});
  await page.click('#pause');
  await page.waitForFunction(()=>document.querySelector('#youScore').textContent==='01',null,{timeout:90000});
  assert.equal(await page.locator('#aiScore').textContent(),'00');
  assert.deepEqual(errors,[]);
  console.log('PASS: blue makes a right-angle return at contact; Casual AI cannot reach it; blue wins the rally 1–0.');
}finally{await browser.close()}
