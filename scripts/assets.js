import {cpSync,mkdirSync} from 'node:fs';
mkdirSync('public/pose',{recursive:true});
cpSync('node_modules/@mediapipe/pose','public/pose',{recursive:true});
mkdirSync('public/models',{recursive:true});
for (const file of ['player_Blue.glb','texture_player_Blue_512.png','badminton_bat.glb','batminton_court.glb']) {
  cpSync(`Models/${file}`, `public/models/${file}`);
}

mkdirSync('public/ui',{recursive:true});
cpSync('UI/WonderLab Motion Badminton Stadium.png','public/ui/stadium.png');
cpSync('UI/09_game_logo.png','public/ui/logo.png');

cpSync('UI/WonderLab Motion Badminton Loading Screen.png','public/ui/loading.png');

mkdirSync('public/sound',{recursive:true});
for(const file of ['crowd-cheering.mp3','crowd-disappointment.mp3']) {
  cpSync(`Sound/${file}`,`public/sound/${file}`);
}
