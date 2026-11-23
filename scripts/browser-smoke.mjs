// Run against a running dev/preview server. Install Chromium with `npx playwright install chromium`.
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||undefined,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[],missing=[];
const page=await browser.newPage({viewport:{width:1440,height:1100}});
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.status()>=400&&r.url().includes(new URL(process.env.TEST_URL||'http://localhost:5173').host))missing.push(`${r.status()} ${r.url()}`)});
mkdirSync('.artifacts',{recursive:true});
try {
  await page.goto(process.env.TEST_URL||'http://localhost:5173');
  await page.waitForFunction(()=>document.querySelector('#assetStatus').textContent.startsWith('3D arena ready'),null,{timeout:60000});
  assert(await page.locator('#startBtn').isEnabled());
  assert(await page.locator('.brand img').evaluate(img=>img.complete&&img.naturalWidth>0),'WonderLab logo did not load');
  assert.equal(await page.locator('#cameraView').inputValue(),'eye');
  assert.equal(await page.locator('.missions .complete').count(),0);
  await page.click('#helpBtn');assert(await page.locator('#guideDialog').isVisible());
  await page.click('#guideDialog .close');assert(await page.locator('#guideDialog').isHidden());
  await page.screenshot({path:'.artifacts/desktop.png',fullPage:true});
  await page.click('#startBtn');
  assert(await page.locator('#startOverlay').isHidden());
  await page.keyboard.down('d');await page.waitForTimeout(400);await page.keyboard.up('d');
  await page.keyboard.press('Space');
  await page.click('#pause');assert.equal(await page.locator('#gameState').textContent(),'MATCH PAUSED');
  await page.screenshot({path:'.artifacts/play.png',fullPage:true});
  await page.click('#pause');assert.equal(await page.locator('#gameState').textContent(),'MATCH IN PLAY');
  await page.click('#settings');
  await page.selectOption('#difficulty','pro');await page.selectOption('#points','21');await page.selectOption('#cameraView','overview');await page.click('#applySettings');
  assert((await page.locator('.court-label').textContent()).includes('COURT OVERVIEW'));
  await page.click('#settings');await page.selectOption('#cameraView','eye');await page.click('#applySettings');
  assert((await page.locator('.court-label').textContent()).includes('EYE-LEVEL VIEW'));
  assert.equal(await page.locator('#targetLabel').textContent(),'FIRST TO 21');
  assert.equal(await page.locator('#youScore').textContent(),'00');
  assert(await page.locator('#startOverlay').isVisible());
  await page.click('#startBtn');await page.click('#restart');assert.equal(await page.locator('#gameState').textContent(),'READY TO RALLY');
  // Camera denial must leave the keyboard game usable.
  await page.click('#cameraBtn');
  await page.waitForFunction(()=>!document.querySelector('#cameraBtn').disabled,null,{timeout:15000});
  assert(await page.locator('#keyboardMode').evaluate(e=>e.classList.contains('selected')));
  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(500);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Mobile page overflows horizontally');
  await page.screenshot({path:'.artifacts/mobile.png',fullPage:true});
  assert.deepEqual(errors,[],'Unexpected browser JavaScript errors');
  assert.deepEqual(missing,[],'App assets returned HTTP errors');
  console.log('PASS: GLBs/textures loaded; start, movement input, swing input, pause/resume, settings, reset, camera-denial fallback, and mobile layout.');
} finally {await browser.close()}
