import test from 'node:test';
import assert from 'node:assert/strict';
import {routeCheckpoint,canonicalLesson} from '../scripts/course-route.mjs';
test('full route preserves canonical 0–12; short route displays foundation then 1–3',()=>{for(let n=0;n<=12;n++){assert.deepEqual(routeCheckpoint('guided',n),{currentLesson:n,routeLesson:n});assert.equal(canonicalLesson('guided',n),n);}assert.deepEqual([0,1,2,3].map(n=>canonicalLesson('application-mcp',n)),[0,10,11,12]);for(let n=0;n<=9;n++)assert.equal(routeCheckpoint('application-mcp',n).routeLesson,0);assert.equal(routeCheckpoint('application-mcp',12).routeLesson,3);});
test('ambiguous and invalid routes cannot select unintended lessons',()=>{for(const args of [['other',1],['application-mcp',4],['guided',13],['guided',-1],['guided',1.5]])assert.throws(()=>canonicalLesson(...args));assert.throws(()=>routeCheckpoint('unselected',0));});
