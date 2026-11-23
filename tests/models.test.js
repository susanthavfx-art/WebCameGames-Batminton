import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
function glb(name){const b=readFileSync(`Models/${name}`);assert.equal(b.toString('ascii',0,4),'glTF');assert.equal(b.readUInt32LE(4),2);assert.equal(b.readUInt32LE(8),b.length);return JSON.parse(b.toString('utf8',20,20+b.readUInt32LE(12)));}
test('uploaded player has the bones used by procedural animation',()=>{const p=glb('player_Blue.glb');assert(p.skins.length>0);const names=p.nodes.map(n=>n.name?.replace('mixamorig','').replace(':',''));for(const n of ['Spine','LeftArm','RightArm','LeftForeArm','RightForeArm','LeftHand','RightHand','LeftUpLeg','RightUpLeg','LeftLeg','RightLeg'])assert(names.includes(n),`Missing animation bone: ${n}`)});
test('court floor and racket geometry exist',()=>{assert(glb('batminton_court.glb').nodes.some(n=>n.name==='Object_12'&&n.mesh!==undefined));assert(glb('badminton_bat.glb').meshes.length>0)});
test('provided player texture is a valid PNG',()=>{assert.equal(readFileSync('Models/texture_player_Blue_512.png').subarray(0,8).toString('hex'),'89504e470d0a1a0a')});
