/** Pure deterministic math; all geometries are centered at (0,0). */
export const fmt = (n, d=3) => String(Number(n.toFixed(d)));
export function model(mode,a,b,t=0.85) {
  if (!['ellipse','hyperbola'].includes(mode)||![a,b,t].every(Number.isFinite)||a<=0||b<=0||(mode==='ellipse'&&b>a)) throw new Error('Invalid geometric parameters');
  const c= mode==='ellipse'?Math.sqrt(Math.max(0,a*a-b*b)):Math.hypot(a,b);
  const x=mode==='ellipse'?a*Math.cos(t):a*Math.cosh(t), y=mode==='ellipse'?b*Math.sin(t):b*Math.sinh(t);
  const P={x,y};
  const F1={x:-c,y:0},F2={x:c,y:0};
  const d1=Math.hypot(x+c,y),d2=Math.hypot(x-c,y);
  const invariant=mode==='ellipse'?d1+d2:Math.abs(d1-d2);
  const target=2*a;
  const residual=(x*x)/(a*a)+(mode==='ellipse'?1:-1)*(y*y)/(b*b)-1;
  const normal={x:x/(a*a),y:(mode==='ellipse'?1:-1)*y/(b*b)};
  return {mode,a,b,t,c,e:c/a,P,F1,F2,d1,d2,invariant,target,residual,normal,pointEquation:mode==='ellipse'?'x²/a² + y²/b² = 1':'x²/a² − y²/b² = 1'};
}
export function ellipseRay(m) {
  if(m.mode!=='ellipse') return null;
  const p=m.P, focus=m.F1, target=m.F2;
  const u={x:p.x-focus.x,y:p.y-focus.y};
  const length=Math.hypot(u.x,u.y);
  const incident={x:u.x/length,y:u.y/length};
  const outgoing={x:(target.x-p.x),y:(target.y-p.y)};
  const dist=Math.hypot(outgoing.x,outgoing.y);
  return {incident,outgoing:{x:outgoing.x/dist,y:outgoing.y/dist}};
}
