import {test} from 'node:test';
import assert from 'node:assert/strict';
import {hasWon} from '../src/rules.js';
test('quick match target',()=>{assert.equal(hasWon([11,9],0,11),true);assert.equal(hasWon([10,0],0,11),false)});
test('deuce requires two clear points',()=>{assert.equal(hasWon([11,10],0,11),false);assert.equal(hasWon([12,10],0,11),true)});
test('quick match cap',()=>assert.equal(hasWon([15,14],0,11),true));
test('standard badminton scoring',()=>{assert.equal(hasWon([21,19],0,21),true);assert.equal(hasWon([21,20],0,21),false);assert.equal(hasWon([29,28],0,21),false);assert.equal(hasWon([29,30],1,21),true)});
test('losing side cannot win',()=>assert.equal(hasWon([19,21],0,21),false));
