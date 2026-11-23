// Checks the actual supplied MP3s decode and have audible samples in the short excerpts.
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {CROWD_FILES,CROWD_OFFSETS} from '../src/audio.js';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||undefined,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage();
try{
  const base=process.env.TEST_URL||'http://localhost:5173/';
  // Lightweight same-origin harness avoids booting the 3D game just to decode audio.
  await page.route('**/__audio_test',r=>r.fulfill({contentType:'text/html',body:'<title>Audio test</title>'}));
  await page.goto(new URL('__audio_test',base).href);
  const results=await page.evaluate(async ({base,files,offsets})=>{
    const context=new OfflineAudioContext(2,44100,44100),results=[];
    for(const [index,file] of files.entries()){
      const response=await fetch(new URL(`sound/${file}`,base));if(!response.ok)throw Error(`HTTP ${response.status}: ${file}`);
      const buffer=await context.decodeAudioData(await response.arrayBuffer());
      const data=buffer.getChannelData(0),n=Math.min(data.length,Math.floor(buffer.sampleRate*1.8));const start=Math.floor(offsets[index]*buffer.sampleRate);let sum=0,peak=0;
      for(let i=0;i<n;i++){sum+=data[start+i]*data[start+i];peak=Math.max(peak,Math.abs(data[start+i]));}
      results.push({file,offset:offsets[index],duration:buffer.duration,channels:buffer.numberOfChannels,rms:Math.sqrt(sum/n),peak});
    }
    return results;
  },{base,files:CROWD_FILES,offsets:CROWD_OFFSETS});
  for(const result of results){assert(result.duration>=1.8);assert(result.rms>.001,'Excerpt is silent');}
  console.log('PASS: both production-path MP3s decode, with non-silent 1.8-second excerpts.',results);
}finally{await browser.close()}
