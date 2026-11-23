import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';

const html = readFileSync('dist/index.html', 'utf8');
const base = process.env.VITE_BASE_PATH || '/WebCameGames-Batminton/';
assert(html.includes(`class="brand" href="${base}"`), 'Home link must stay inside the deployed app');
assert(!html.includes('/src/main.js'), 'Deploy compiled output, not source HTML');
const urls = [...html.matchAll(/(?:src|href)="([^"]+\/assets\/[^" ]+)"/g)].map(match => match[1]);
assert(urls.some(url => url.endsWith('.js')), 'Missing compiled JavaScript');
assert(urls.some(url => url.endsWith('.css')), 'Missing compiled stylesheet');
for (const url of urls) {
  assert(url.startsWith(base), `Asset is outside deployment base: ${url}`);
  assert(existsSync(`dist/${url.slice(base.length)}`), `Missing built asset: ${url}`);
}
const jsUrl = urls.find(url => url.endsWith('.js'));
const js = readFileSync(`dist/${jsUrl.slice(base.length)}`, 'utf8');
assert(js.includes(`${base}pose/pose.js`), 'Pose loader must use the deployment base');
assert(js.includes(`${base}pose/`), 'Pose models must use the deployment base');
for (const file of ['pose.js', 'pose_landmark_lite.tflite', 'pose_web.binarypb', 'pose_solution_packed_assets.data', 'pose_solution_packed_assets_loader.js', 'pose_solution_simd_wasm_bin.js', 'pose_solution_simd_wasm_bin.wasm', 'pose_solution_simd_wasm_bin.data', 'pose_solution_wasm_bin.js', 'pose_solution_wasm_bin.wasm']) {
  assert(existsSync(`dist/pose/${file}`), `Missing local motion runtime asset: ${file}`);
}
for (const file of ['player_Blue.glb', 'texture_player_Blue_512.png', 'badminton_bat.glb', 'batminton_court.glb']) {
  assert(existsSync(`dist/models/${file}`), `Missing deployed 3D asset: ${file}`);
  assert.equal(readFileSync(`dist/models/${file}`).length, readFileSync(`Models/${file}`).length, `Incomplete 3D asset: ${file}`);
}
assert(js.includes(`${base}models/`), '3D model URLs must use the deployment base');
console.log(`Deployment checks passed for ${base}: compiled JS/CSS, home link, local pose runtime, and 3D models.`);
