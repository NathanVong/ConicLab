import { pagesChatEndpoint } from './deployment.js';
import {model,fmt} from './math.js';
const $=s=>document.querySelector(s);
const canvas=$('#graph'),ctx=canvas.getContext('2d');
const state={mode:'ellipse',a:5,b:3,t:.85,showRay:true};
let geo,scale,origin,w,h,dragging=false;
const colors={curve:'#3478df',foci:'#e57b6c',point:'#e5a645',grid:'#e0e8f2',text:'#95a3b5'};
const norm=(v)=>{let d=Math.hypot(v.x,v.y)||1;return{x:v.x/d,y:v.y/d};};
const screen=(p)=>({x:origin.x+p.x*scale,y:origin.y-p.y*scale});
const world=(p)=>({x:(p.x-origin.x)/scale,y:(origin.y-p.y)/scale});
function line(a,b,color,width=1,dash=[]){let x=screen(a),y=screen(b);ctx.beginPath();ctx.moveTo(x.x,x.y);ctx.lineTo(y.x,y.y);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.stroke();ctx.setLineDash([]);}
function dot(p,r,color,label,side='right'){let q=screen(p);ctx.beginPath();ctx.arc(q.x,q.y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.stroke();if(label){ctx.fillStyle='#50637e';ctx.font='12px DM Sans, sans-serif';ctx.textAlign=side==='right'?'left':'right';ctx.fillText(label,q.x+(side==='right'?11:-11),q.y-11);}}
function arrow(a,b,color){line(a,b,color,2);const v=norm({x:b.x-a.x,y:b.y-a.y});const p={x:a.x+(b.x-a.x)*.7,y:a.y+(b.y-a.y)*.7};const k=.15;line({x:p.x-v.x*k-v.y*k*.65,y:p.y-v.y*k+v.x*k*.65},p,color,2);line({x:p.x-v.x*k+v.y*k*.65,y:p.y-v.y*k-v.x*k*.65},p,color,2);}
function draw(){
 const dpr=Math.min(window.devicePixelRatio||1,2),rect=canvas.getBoundingClientRect();w=rect.width;h=rect.height;if(!w||!h)return;
 canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 origin={x:w/2,y:h/2};const extent=Math.max(state.a*1.48,Math.hypot(state.a,state.b)*1.27,7);scale=Math.min(w/(extent*2),h/(extent*1.55));
 const l=world({x:0,y:h}),r=world({x:w,y:0});
 ctx.lineWidth=1;ctx.strokeStyle=colors.grid;for(let i=Math.floor(l.x);i<=Math.ceil(r.x);i++){if(i%2!==0)continue;let x=screen({x:i,y:0}).x;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}for(let i=Math.floor(l.y);i<=Math.ceil(r.y);i++){if(i%2!==0)continue;let y=screen({x:0,y:i}).y;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
 line({x:l.x,y:0},{x:r.x,y:0},'#a3b3c8',1.25);line({x:0,y:l.y},{x:0,y:r.y},'#a3b3c8',1.25);
 ctx.fillStyle=colors.text;ctx.font='10px DM Sans';ctx.textAlign='center';for(let i=Math.ceil(l.x/2)*2;i<=r.x;i+=2)if(i)ctx.fillText(i,screen({x:i,y:0}).x,origin.y+16);
 const m=geo;
 if(m.mode==='hyperbola'){line({x:l.x,y:-state.b/state.a*l.x},{x:r.x,y:state.b/state.a*r.x},'#aabbd0',1.3,[7,6]);line({x:l.x,y:state.b/state.a*l.x},{x:r.x,y:-state.b/state.a*r.x},'#aabbd0',1.3,[7,6]);}
 // Geometry curves: ellipse closed; hyperbola both branches.
 const branches=m.mode==='ellipse'?[1]:[1,-1];
 branches.forEach(branch=>{ctx.beginPath();let started=false;const N=m.mode==='ellipse'?600:440;for(let i=0;i<=N;i++){
 let t=m.mode==='ellipse' ? -Math.PI+i/N*2*Math.PI : -2.65+i/N*5.3;
 let p=m.mode==='ellipse'?{x:m.a*Math.cos(t),y:m.b*Math.sin(t)}:{x:branch*m.a*Math.cosh(t),y:m.b*Math.sinh(t)};
 let q=screen(p);if(!started){ctx.moveTo(q.x,q.y);started=true;}else ctx.lineTo(q.x,q.y);
 }ctx.strokeStyle=colors.curve;ctx.lineWidth=2.7;ctx.stroke();});
 line(m.F1,m.P,'#e57b6c99',1.5,[6,5]);line(m.F2,m.P,'#e57b6c99',1.5,[6,5]);
 const pn=m.normal, tangent=norm({x:-pn.y,y:pn.x});const reach=20;
 line({x:m.P.x-tangent.x*reach,y:m.P.y-tangent.y*reach},{x:m.P.x+tangent.x*reach,y:m.P.y+tangent.y*reach},'#b6a17e',1.1,[4,6]);
 if(state.showRay&&m.mode==='ellipse'){
 arrow(m.F1,m.P,'#df9d49');arrow(m.P,m.F2,'#56b18d');
 }
 dot(m.F1,5,colors.foci,'F₁','right');dot(m.F2,5,colors.foci,'F₂','left');
 let q=screen(m.P);ctx.beginPath();ctx.arc(q.x,q.y,11,0,Math.PI*2);ctx.strokeStyle='#e5a64566';ctx.lineWidth=2;ctx.stroke();dot(m.P,6,colors.point,'P');
}
function refresh(){
 if(state.mode==='ellipse')state.b=Math.min(state.b,state.a);geo=model(state.mode,state.a,state.b,state.t);
 $('#a').value=state.a;$('#b').value=state.b;$('#b').max=state.mode==='ellipse'?state.a:7;
 $('#aValue').textContent=state.a.toFixed(1);$('#bValue').textContent=state.b.toFixed(1);
 const m=geo;$('#formula').textContent=`x²/${fmt(m.a*m.a,2)} ${m.mode==='ellipse'?'+':'−'} y²/${fmt(m.b*m.b,2)} = 1`;
 $('#c').textContent=m.c.toFixed(3);$('#e').textContent=m.e.toFixed(3);$('#d1').textContent=m.d1.toFixed(3);$('#d2').textContent=m.d2.toFixed(3);
 $('#invariantName').textContent=m.mode==='ellipse'?'焦距和不變定律':'焦距差不變定律';$('#verification').textContent=m.mode==='ellipse'?'PF₁ + PF₂ = 2a':'|PF₁ − PF₂| = 2a';
 $('#actual').textContent='實測 '+m.invariant.toFixed(5);$('#expected').textContent='理論 '+m.target.toFixed(5);const err=Math.abs(m.invariant-m.target);$('#epsilon').textContent='數值誤差：'+err.toExponential(2);
 $('#barfill').style.width=Math.min(100,100*(1-Math.min(1,err/Math.max(1,m.target)))).toFixed(2)+'%';
 $('#observation').textContent=m.mode==='ellipse'?'當你沿橢圓拖動 P，兩段焦距的總和永遠等於 2a。':'當你沿雙曲線拖動 P，兩段焦距之差的絕對值永遠等於 2a。';
 $('#application').textContent=m.mode==='ellipse'?'橢圓的反射性質使從一個焦點出發的光線，經橢圓邊界反射後通過另一焦點。你可以開啟光線路徑觀察它。':'雙曲線常出現在依靠兩個訊號來源「到達時間差」來定位的系統中。當兩點的距離差固定時，可能的位置形成雙曲線。';
 draw();
}
function setMode(mode){state.mode=mode;if(mode==='ellipse'&&state.b>state.a)state.b=state.a;state.t=mode==='ellipse'?.85:.9;document.querySelectorAll('.modebtn').forEach(b=>{b.classList.toggle('active',b.dataset.mode===mode);b.setAttribute('aria-pressed',String(b.dataset.mode===mode));});refresh();}
document.querySelectorAll('.modebtn').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
$('#a').addEventListener('input',e=>{state.a=+e.target.value;refresh();});$('#b').addEventListener('input',e=>{state.b=+e.target.value;refresh();});
$('#showRay').addEventListener('change',e=>{state.showRay=e.target.checked;draw();});
$('#reset').addEventListener('click',()=>{state.a=5;state.b=3;state.showRay=true;$('#showRay').checked=true;setMode('ellipse');});
$('#random').addEventListener('click',()=>{state.a=Math.round((3+Math.random()*5)*10)/10;state.b=Math.round((.8+Math.random()*(state.mode==='ellipse'?state.a-.8:5))*10)/10;state.t=state.mode==='ellipse'?Math.random()*Math.PI*2:Math.random()*2.6-1.3;refresh();});
function fromPointer(e){let r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
function updatePoint(e){const p=world(fromPointer(e));if(state.mode==='ellipse')state.t=Math.atan2(p.y/state.b,p.x/state.a);else state.t=Math.max(-2.65,Math.min(2.65,Math.asinh(p.y/state.b)));refresh();}
canvas.addEventListener('pointerdown',e=>{let p=fromPointer(e),q=screen(geo.P);if(Math.hypot(p.x-q.x,p.y-q.y)<32){dragging=true;canvas.setPointerCapture(e.pointerId);updatePoint(e);}});
canvas.addEventListener('pointermove',e=>{if(dragging)updatePoint(e);});canvas.addEventListener('pointerup',()=>dragging=false);canvas.addEventListener('pointercancel',()=>dragging=false);
canvas.addEventListener('keydown', event => {
  const steps = {ArrowLeft: -0.075, ArrowDown: -0.075, ArrowRight: 0.075, ArrowUp: 0.075};
  const step = steps[event.key];
  if (!step) return;
  event.preventDefault();
  const position = state.t + step;
  state.t = state.mode === 'hyperbola' ? Math.max(-2.65, Math.min(2.65, position)) : position;
  refresh();
});
new ResizeObserver(()=>draw()).observe(canvas);
const answerBox = $('#answer');
const questionInput = $('#question');
const sendButton = $('#send');
const challengeButton = $('#challenge');

function showAnswer(text) {
  answerBox.textContent = text;
  globalThis.renderMathInElement?.(answerBox, {
    delimiters: [
      {left: '$$', right: '$$', display: true},
      {left: '\\[', right: '\\]', display: true},
      {left: '\\(', right: '\\)', display: false},
      {left: '$', right: '$', display: false},
    ],
    throwOnError: false,
    trust: false,
  });
}

async function askTutor(question, task = 'question') {
  if (!question || sendButton.disabled) return;
  const isChallenge = task === 'challenge';
  sendButton.disabled = challengeButton.disabled = true;
  sendButton.textContent = '思考中…';
  answerBox.textContent = isChallenge ? '正在準備挑戰題…' : '正在向 AI 數學導師提問…';

  try {
    const endpoint = location.hostname.endsWith('.github.io') ? pagesChatEndpoint : '/api/chat';
    if (!endpoint) throw new Error('AI 導師的 Cloudflare 後端尚未連接');
    const {mode, a, b, t} = state;
    const position = mode === 'ellipse' ? t % (2 * Math.PI) : t;
    const result = await fetch(endpoint, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({question, task, state: {mode, a, b, t: position}}),
    });
    const data = await result.json();
    if (!result.ok) throw new Error(data.error || '連線錯誤');
    showAnswer(data.answer);
  } catch (err) {
    answerBox.textContent = err.message + '（不影響互動數學實驗功能。）';
  } finally {
    sendButton.disabled = challengeButton.disabled = false;
    sendButton.textContent = '詢問導師 ↗';
  }
}

$('#askform').addEventListener('submit', event => {
  event.preventDefault();
  askTutor(questionInput.value.trim());
});
challengeButton.addEventListener('click', () => {
  askTutor('請給我一道可用畫布驗證的高中數學挑戰題，只給提示。', 'challenge');
});
document.querySelectorAll('.chip[data-prompt]').forEach(chip => {
  chip.addEventListener('click', () => {
    questionInput.value = chip.dataset.prompt;
    questionInput.focus();
  });
});
refresh();
