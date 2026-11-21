import test from 'node:test';import assert from 'node:assert/strict';import {model} from '../public/math.js';
for(const mode of ['ellipse','hyperbola'])for(const [a,b] of [[5,3],[3,3],[8,1.4]])for(const t of [-2,-.4,0,.7,2]){
 test(`${mode}: a=${a}, b=${b}, t=${t}`,()=>{const m=model(mode,a,b,t);assert.ok(Math.abs(m.invariant-2*a)<1e-9);assert.ok(Math.abs(m.residual)<1e-9);assert.ok(mode==='ellipse'?m.e<1:m.e>1);});
}
test('ellipse validation',()=>assert.throws(()=>model('ellipse',3,4)));
test('hyperbola asymptote inclination',()=>{const m=model('hyperbola',5,3,0);assert.ok(Math.abs(m.c-Math.sqrt(34))<1e-9);});
