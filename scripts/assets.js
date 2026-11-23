import {cpSync,mkdirSync} from 'node:fs';
mkdirSync('public/pose',{recursive:true});
cpSync('node_modules/@mediapipe/pose','public/pose',{recursive:true});
