import {cpSync,mkdirSync} from 'node:fs';
mkdirSync('public/pose',{recursive:true});
cpSync('node_modules/@mediapipe/pose','public/pose',{recursive:true});
mkdirSync('public/models',{recursive:true});
for (const file of ['player_Blue.glb','texture_player_Blue_512.png','badminton_bat.glb','batminton_court.glb']) {
  cpSync(`Models/${file}`, `public/models/${file}`);
}
