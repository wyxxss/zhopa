/* Режим «Марио» v3 — настоящий платформер: сам двигаешься вправо/влево, прыгаешь по блокам, топчешь врагов, бьёшь «?»-блоки головой.
   Мир бесконечный (тайлы), камера идёт только вперёд. Арты: mario/idle|attack|hurt|cage.png.
   ПК: ←→/A D — ход, Пробел/W/↑ — прыжок (в воздухе ещё раз — ракеты), X/J/F/Shift — удар, Esc/P — пауза. */
(()=>{
const $=s=>document.querySelector(s),R=Math.random,rr=(a,b)=>a+R()*(b-a),ri=(a,b)=>Math.floor(rr(a,b+1)),G=()=>window.G||{};
const SP={};['idle','attack','hurt','cage','splash'].forEach(n=>{const i=new Image();i.onload=()=>SP[n]=i;i.src='mario/'+n+'.png'});
const AN=.8,CX=.42;let FL,ZN,P;
const THP={
 '':{FL:['#1d5cff','#3f7dff','#62a4ff','#cfe6ff','#8f9bff','#6a62e8','#4a3fc0'],N:['Двор','Крыши','Завод','Небо'],Z:[['#0a1030','#3a6cd8','#14224f'],['#120a38','#6a5be0','#241a5a'],['#07122a','#2aa0c8','#0f2f48'],['#2a3f9a','#bfe3ff','#3a56b0']],brick:'#5a8cff',hard:'#8a94ff',pipe:['#7fb2ff','#4a86f0','#2f5ac0','#a9d0ff'],bush:'#2a4aa0'},
 sakura:{FL:['#ff8fb8','#ffa6c6','#ffc2d8','#ffffff','#f08ab4','#d86a9a','#b0487a'],N:['Сад','Крыши','Завод','Небо'],Z:[['#2a0f24','#e88fb0','#3d1832'],['#2a0b30','#f3a6c8','#40163f'],['#1c0a1a','#d4789d','#32122d'],['#7a3a7e','#ffe0ec','#8a4a7a']],brick:'#f3a6c2',hard:'#c9a0e8',pipe:['#ffb3cf','#f08ab4','#c8648e','#ffd3e3'],bush:'#a94a7a'},
 lesbi:{FL:['#d52d00','#ef7627','#ff9a56','#ffffff','#d162a4','#b55690','#a30262'],N:['Закатный двор','Розовые крыши','Бордовый завод','Небо флага'],Z:[['#2a0b25','#ff8a5c','#4a1638'],['#240a3a','#e47cb8','#42184d'],['#1a0613','#c2457f','#4d1438'],['#7a2a80','#ffd0dc','#8a3c78']],brick:'#e8806a',hard:'#9a8be0',pipe:['#f07ab8','#d162a4','#a8408a','#ff9ec8'],bush:'#8a2a78'}};
function applyTheme(){P=THP[document.documentElement.dataset.th||'']||THP[''];FL=P.FL;ZN=P.Z.map((z,i)=>({n:P.N[i],a:z[0],b:z[1],g:z[2]}))}
applyTheme();
const LINES=['Не останавливайтесь!','Артём уже злится.','Я верю в вас!','Осталось чуть-чуть… наверное.'];
const T=28,W=336,PW=42,PH=66,H0=84,SPD=140,GR=1500;
const hx=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),lerp=(a,b,t)=>{const A=hx(a),B=hx(b);return'rgb('+A.map((v,i)=>v+(B[i]-v)*t|0).join(',')+')'};
let root,cv,x,H=700,K=1,run=null,raf=0,last=0,keys={l:0,r:0,j:0,jp:0,a:0},cut=-1,on=0,cache={};
let MS=null;const MR=()=>MS||(MS=(()=>{try{return JSON.parse(localStorage.mrs||'')}catch{return null}})()||{best:0,runs:0,coins:0}),sv=()=>{try{localStorage.mrs=JSON.stringify(MS)}catch{}};
function build(){if(root)return;root=document.createElement('div');root.id='mr';
 root.innerHTML='<canvas id="mrv"></canvas><div class="mh"><div class="mhl"><b id="mrh"></b></div><div class="mhc"><b id="mrm">0 м</b><small id="mrz"></small></div><div class="mhr"><span id="mrc2">0</span><button id="mrp" aria-label="Пауза">❚❚</button></div></div><div id="mrbn"></div><div id="mrtip"></div><div class="mb"><div class="mdp"><button id="mrl">◀</button><button id="mrg">▶</button></div><div class="mac"><button id="mra">УДАР</button><button id="mrj">ПРЫЖОК</button></div></div><div id="mro"></div>';
 document.body.appendChild(root);cv=$('#mrv');x=cv.getContext('2d');
 const hold=(id,f)=>{const b=$(id);b.onpointerdown=e=>{e.preventDefault();f(1);b.classList.add('on')};b.onpointerup=b.onpointercancel=b.onpointerleave=()=>{f(0);b.classList.remove('on')}};
 hold('#mrl',v=>keys.l=v);hold('#mrg',v=>keys.r=v);hold('#mrj',v=>{if(v)keys.jp=.14;keys.j=v});hold('#mra',v=>{if(v)keys.a=.12});$('#mrp').onclick=()=>pause(1);
 document.addEventListener('keydown',e=>{if(!on)return;const k=e.code;
  if(k=='ArrowLeft'||k=='KeyA'){e.preventDefault();keys.l=1}else if(k=='ArrowRight'||k=='KeyD'){e.preventDefault();keys.r=1}
  else if(k=='Space'||k=='ArrowUp'||k=='KeyW'){e.preventDefault();if(!e.repeat)keys.jp=.14;keys.j=1}
  else if(k=='KeyX'||k=='KeyJ'||k=='KeyF'||k=='KeyZ'||k=='ShiftLeft'){e.preventDefault();if(!e.repeat)keys.a=.12}
  else if(k=='Escape'||k=='KeyP'){if(run)pause(!run.pz)}else if(k=='KeyR'&&run&&run.over)start()});
 document.addEventListener('keyup',e=>{const k=e.code;if(k=='ArrowLeft'||k=='KeyA')keys.l=0;if(k=='ArrowRight'||k=='KeyD')keys.r=0;if(k=='Space'||k=='ArrowUp'||k=='KeyW')keys.j=0});
 addEventListener('blur',()=>{keys.l=keys.r=keys.j=0});
 addEventListener('resize',()=>on&&fit());document.addEventListener('visibilitychange',()=>{if(document.hidden&&on&&run&&!run.over&&cut<0)pause(1)})}
function fit(){const vw=Math.min(innerWidth,innerHeight*.6),d=Math.min(devicePixelRatio||1,2.5);cv.style.width=vw+'px';cv.width=vw*d;cv.height=innerHeight*d;K=cv.width/W;H=cv.height/K}
/* ---------- катсцена ---------- */
function showCut(){cut=0;const o=$('#mro');o.className='cut';o.innerHTML='<canvas id="mrsc"></canvas><button class="mrk" id="mrsk">Пропустить</button>';
 const c=$('#mrsc'),cw=Math.min(innerWidth,innerHeight*.6),d=Math.min(devicePixelRatio||1,2);c.width=cw*d;c.height=innerHeight*d;c.style.width=cw+'px';
 const g=c.getContext('2d'),k=c.width/360,h=c.height/k;let t=0,l=performance.now(),done=0;const pts=[];
 const end=()=>{if(done)return;done=1;o.onclick=null;o.className='';o.innerHTML='';cut=-1;start()};o.onclick=end;
 const ez=u=>1-Math.pow(1-Math.max(0,Math.min(1,u)),3),cl=(a,b,v)=>Math.max(a,Math.min(b,v));
 const spr=(im,cx,by,hh,rot)=>{if(!im)return;const w=hh*im.width/im.height;g.save();g.translate(cx,by);g.rotate(rot||0);g.drawImage(im,-w*CX,-hh*AN,w,hh);g.restore()};
 const fr=n=>{if(done)return;requestAnimationFrame(fr);const dt=Math.min(.05,(n-l)/1e3);l=n;t+=dt;g.setTransform(k,0,0,k,0,0);
  const sh=t>1.55&&t<1.95?(1.95-t)*14:t>3.2&&t<3.5?(3.5-t)*10:0,zm=t>4.4?1+(t-4.4)*.12:1;
  g.save();g.translate(180+(sh?rr(-sh,sh):0),h*.55+(sh?rr(-sh,sh):0));g.scale(zm,zm);g.translate(-180,-h*.55);
  const bg=g.createLinearGradient(0,0,0,h);bg.addColorStop(0,ZN[0].a);bg.addColorStop(.55,lerp(ZN[0].a,ZN[0].b,.5));bg.addColorStop(1,ZN[0].b);g.fillStyle=bg;g.fillRect(-60,-60,480,h+120);
  FL.forEach((cc,i)=>{g.fillStyle=cc;g.globalAlpha=.14;g.fillRect(-60,h*.28+i*h*.04,480,h*.04)});g.globalAlpha=1;
  const sg=g.createRadialGradient(180,h*.5,10,180,h*.5,150);sg.addColorStop(0,'rgba(255,230,200,.7)');sg.addColorStop(1,'rgba(255,200,160,0)');g.fillStyle=sg;g.fillRect(0,h*.2,360,h*.6);
  g.fillStyle='rgba(26,6,22,.5)';g.beginPath();g.moveTo(-10,h);for(let i=-10;i<=370;i+=10)g.lineTo(i,h*.78-18*Math.sin(i/55)-10*Math.sin(i/21));g.lineTo(370,h);g.fill();
  /* клетка падает на верёвке и качается */
  const cu=ez(t/1.6),cy=-200+cu*(h*.30+200),sw=Math.sin(t*3.2)*.09*Math.max(0,1-t/4.5);
  g.save();g.translate(250,-20);g.rotate(sw);g.strokeStyle='#d9c27a';g.lineWidth=3;g.beginPath();g.moveTo(0,0);g.lineTo(0,cy+20);g.stroke();
  if(SP.cage){const ch=190,cw2=ch*SP.cage.width/SP.cage.height;g.drawImage(SP.cage,-cw2/2,cy+10,cw2,ch)}g.restore();
  /* Кира и Мескалин: влетают злые → показывают на клетку → стартуют */
  let im=SP.hurt,x0=0,y0=h*.78,rot=0,fl=0;
  if(t<1.9){x0=-130}
  else if(t<3.4){x0=-130+ez((t-1.9)/1.3)*250;y0+=Math.sin(t*9)*2;im=SP.hurt}
  else if(t<4.5){x0=120;y0+=Math.sin(t*3)*3;im=SP.attack;rot=-.03}
  else{const u=t-4.5;x0=120+u*u*190;y0-=ez(u/1)*30+u*u*40;im=SP.idle;rot=-.08;fl=1}
  if(fl){for(let i=0;i<7;i++){g.fillStyle=FL[i];g.globalAlpha=.55;g.fillRect(x0-190,y0-96+i*7,180,7)}g.globalAlpha=1;for(let i=0;i<2;i++)pts.push({x:x0-14+rr(-6,6),y:y0+10,vx:rr(-40,-10),vy:rr(60,160),l:.4,c:R()<.5?'#ffd54a':'#ff7a2a'})}
  const bob=t<3.4&&t>1.9?0:0;spr(im,x0,y0+bob,150,rot);
  if(t>3.4&&t<3.9){g.fillStyle='#ff6ab0';g.font='900 34px Unbounded,sans-serif';g.textAlign='center';g.globalAlpha=1-(t-3.4)*2;g.fillText('!',x0+70,y0-120);g.globalAlpha=1}
  for(const q of pts){q.x+=q.vx*dt;q.y+=q.vy*dt;q.l-=dt;g.globalAlpha=cl(0,1,q.l*3);g.fillStyle=q.c;g.fillRect(q.x-2.5,q.y-2.5,5,5)}g.globalAlpha=1;
  while(pts.length>80)pts.shift();
  g.restore();
  if(t>4.6)for(let i=0;i<6;i++){g.fillStyle='rgba(255,255,255,.35)';const ly=rr(0,h),lw=rr(40,120);g.fillRect(rr(0,360),ly,lw,1.5)}
  if(t>4.4&&t<4.6){g.fillStyle='rgba(255,255,255,'+(.8*(4.6-t)/.2)+')';g.fillRect(0,0,360,h)}
  if(t>5.5){g.fillStyle='rgba(0,0,0,'+cl(0,1,(t-5.5)/.5)+')';g.fillRect(0,0,360,h)}
  if(t>=6)end()};
 requestAnimationFrame(fr)}
function open(){applyTheme();build();on=1;root.classList.add('on');G().setSt&&G().setSt('mr');fit();$('#mro').innerHTML='';showCut()}
function close(){on=0;cancelAnimationFrame(raf);raf=0;root.classList.remove('on');$('#mro').innerHTML='';G().menu&&G().menu()}
/* ---------- мир (тайлы): 1 земля, 2 кирпич, 3 «?», 4 труба, 5 твёрдый, 6 пустой блок ---------- */
const sol=(c,r)=>{const a=run.tl[c];return a&&r>=0&&a[r]>0};
const rows=()=>Math.ceil(H/T)+2;
function setT(c,r,t){if(!run.tl[c])run.tl[c]=new Uint8Array(rows());if(r>=0&&r<rows())run.tl[c][r]=t}
function ground(c){for(let r=run.gr;r<rows();r++)setT(c,r,1)}
const E=(t,o)=>run.ent.push({t,...o});
function pat(){const r=run,c0=r.gc,gr=r.gr,m=c0,z=Math.floor(m/400)%4,d=Math.min(.75,.25+m/3000);let n=0,k;
 if(r.cageAt&&c0>=r.cageAt){r.cageAt+=300;n=9;for(let i=0;i<n;i++)ground(c0+i);E('cage',{x:(c0+4.5)*T,y:gr*T});r.gc+=n;r.last='f';return}
 const ks=['f','f','f','pit','stairs','pipes','float'];if(m>120)ks.push('pit','pipes');
 k=r.last=='pit'?'f':ks[R()*ks.length|0];r.last=k;
 if(k=='f'){n=ri(7,12);for(let i=0;i<n;i++)ground(c0+i);
  for(let i=3;i<n-1;i+=ri(3,4))if(R()<d){const bird=z>=1&&R()<.35;E(bird?'bird':'spam',{x:(c0+i+.5)*T,y:bird?gr*T-rr(70,120):gr*T,y0:gr*T-rr(70,120),vx:-28,vy:0,p:rr(0,6)})}
  if(R()<.6){const b=c0+ri(2,n-4),len=ri(1,3);for(let i=0;i<len;i++)setT(b+i,gr-4,i==1||R()<.3?3:2)}
  if(R()<.4)for(let i=0;i<4;i++)E('coin',{x:(c0+2+i)*T+T/2,y:(gr-1)*T-T/2})}
 else if(k=='pit'){const w=ri(3,Math.min(4,3+(m/250|0)));n=w+1;for(let i=w;i<n+3;i++)ground(c0+i);n+=3;
  for(let i=0;i<w;i++)E('coin',{x:(c0+i+.5)*T,y:(gr-2-Math.sin((i+.5)/w*Math.PI)*2)*T});if(w>=3&&R()<.7)setT(c0+1,gr-3,2)}
 else if(k=='stairs'){const h=ri(3,4);n=h*2+3;for(let i=0;i<n;i++)ground(c0+i);for(let i=0;i<h;i++)for(let j=0;j<=i;j++){setT(c0+1+i,gr-1-j,5);setT(c0+n-2-i,gr-1-j,5)}if(R()<.7)E('spam',{x:(c0+h+1.5)*T,y:(gr-h)*T,vx:-28,vy:0,p:1})}
 else if(k=='pipes'){n=ri(9,12);for(let i=0;i<n;i++)ground(c0+i);let p=c0+3;while(p<c0+n-3){const ph=ri(2,3);for(let j=0;j<ph;j++){setT(p,gr-1-j,4);setT(p+1,gr-1-j,4)}E('plant',{x:(p+1)*T,y:(gr-ph)*T,p:rr(0,6)});E('coin',{x:(p+1)*T,y:(gr-ph-2)*T});p+=ri(4,5)}}
 else if(k=='float'){n=ri(9,12);for(let i=0;i<n;i++)ground(c0+i);const len=ri(4,5),b=c0+ri(2,n-len-2);for(let i=0;i<len;i++){setT(b+i,gr-4,i%2?3:2);E('coin',{x:(b+i+.5)*T,y:(gr-6)*T+T/2})}if(R()<.6)E('spam',{x:(c0+n-3)*T,y:gr*T,vx:-28,vy:0,p:2})}
 r.gc+=n}
function start(){applyTheme();const m=MR();keys={l:0,r:0,j:0,jp:0,a:0};
 const gr=Math.round(H/T*.66);run={tl:{},gr,gc:0,gcn:0,ent:[],pt:[],tx:[],cam:0,px:T*4,py:gr*T,vx:0,vy:0,g:1,dir:1,rk:1,jh:0,cy:0,hp:3,inv:0,hurt:0,atk:0,acd:0,t:0,z:0,zb:1,pz:0,over:0,coins:0,kills:0,bn:null,bt:0,safe:T*4,bump:null,cageAt:200,last:'f',tip:m.tut?0:9,sk:0};
 for(let i=0;i<16;i++)ground(i);run.gc=16;E('spam',{x:13.5*T,y:gr*T,vx:-28,vy:0,p:0});for(let i=0;i<3;i++)setT(8+i,gr-4,i==1?3:2);for(let i=0;i<4;i++)E('coin',{x:(10+i)*T+T/2,y:(gr-6)*T+T/2});
 cut=-1;$('#mro').innerHTML='';last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);hud(1)}
function pause(v){if(!run||run.over||(cut>=0&&$('#mro .cut')))return;run.pz=v?1:0;const o=$('#mro');
 if(v){o.innerHTML='<div class="mcard"><h2>ПАУЗА</h2><button class="play" id="mrr">Продолжить</button><button class="sec" id="mrq">Выйти в меню</button></div>';$('#mrr').onclick=()=>pause(0);$('#mrq').onclick=()=>finish(1)}else{o.innerHTML='';last=performance.now()}}
/* ---------- физика ---------- */
function mv(o,w,h,dt){const py0=o.y;let hit=0;o.x+=o.vx*dt;
 if(o.vx){const c=Math.floor((o.vx>0?o.x+w/2:o.x-w/2)/T),r0=Math.floor((o.y-h)/T),r1=Math.floor((o.y-.01)/T);for(let rw=r0;rw<=r1;rw++)if(sol(c,rw)){o.x=o.vx>0?c*T-w/2-.01:(c+1)*T+w/2+.01;o.vx=0;hit=1;break}}
 o.y+=o.vy*dt;o.g=0;o.bump=null;
 if(o.vy>=0){const rw=Math.floor(o.y/T);for(let c=Math.floor((o.x-w/2+1)/T);c<=Math.floor((o.x+w/2-1)/T);c++)if(sol(c,rw)&&py0<=rw*T+2){o.y=rw*T;o.vy=0;o.g=1;break}}
 else{const rw=Math.floor((o.y-h)/T);for(let c=Math.floor((o.x-w/2+1)/T);c<=Math.floor((o.x+w/2-1)/T);c++)if(sol(c,rw)){o.y=(rw+1)*T+h;o.vy=0;o.bump=[c,rw];break}}
 return hit}
const pop=(s,x0,y,c)=>run.tx.push({s,x:x0,y,c:c||'#fff',l:1});
const burst=(x0,y,c,n=8)=>{for(let i=0;i<n;i++)run.pt.push({x:x0,y,vx:rr(-90,90),vy:rr(-170,10),l:rr(.3,.7),c})};
function dmg(){const r=run;if(r.inv>0)return;r.hp--;r.hurt=.5;r.inv=1.6;r.vy=-280;r.vx=-r.dir*110;r.g=0;r.sk=.2;navigator.vibrate&&navigator.vibrate(40);G().hz&&G().hz('notificationOccurred','error');if(r.hp<=0)finish()}
function kill(e,stomp){e.dead=1;run.kills++;pop('+50',e.x,e.y-30,'#ffd54a');burst(e.x,e.y-12,FL[R()*7|0],stomp?8:12)}
const bxe=e=>e.t=='spam'?[e.x-12,e.y-24,e.x+12,e.y]:e.t=='bird'?[e.x-13,e.y-10,e.x+13,e.y+10]:e.t=='plant'?(Math.sin(run.t*2+e.p)>.1?[e.x-9,e.y-34,e.x+9,e.y-6]:[0,0,0,0]):e.t=='coin'?[e.x-11,e.y-11,e.x+11,e.y+11]:e.t=='pu'?[e.x-13,e.y-13,e.x+13,e.y+13]:[e.x-6,e.y-6,e.x+6,e.y+6];
const ov=(a,b)=>a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1];
function up(dt){const r=run;r.t+=dt;
 for(const k of['inv','hurt','atk','acd','bt','sk','cy'])if(r[k]>0)r[k]-=dt;if(keys.jp>0)keys.jp-=dt;if(keys.a>0)keys.a-=dt;
 const m=Math.floor(r.px/T),zi=Math.floor(m/400)%4;if(zi!=r.z){r.z=zi;r.zb=0;r.bn={t:'ЗОНА: '+ZN[zi].n.toUpperCase(),s:''};r.bt=2.2}if(r.zb<1)r.zb=Math.min(1,r.zb+dt/1.5);
 while(r.gc*T<r.cam+W+T*14)pat();
 /* ход */
 const want=r.hurt>0?r.vx:((keys.r|0)-(keys.l|0))*SPD;if(keys.r&&!keys.l)r.dir=1;else if(keys.l&&!keys.r)r.dir=-1;
 if(r.hurt<=0){const a=(r.g?(want?750:900):450)*dt;r.vx=r.vx<want?Math.min(want,r.vx+a):Math.max(want,r.vx-a)}
 if(r.g)r.cy=.09;
 if(keys.jp>0&&r.cy>0){r.vy=-600;r.g=0;r.cy=0;keys.jp=0;r.jh=1;burst(r.px,r.py,'#ffffffaa',4)}
 else if(keys.jp>0&&!r.g&&r.rk&&r.cy<=0&&r.vy>-300){r.vy=-420;r.rk=0;keys.jp=0;r.jh=0;r.fl=.35;pop('РАКЕТЫ!',r.px,r.py-80,'#ffb347')}
 if(!keys.j&&r.jh&&r.vy<-400){r.vy=-400;r.jh=0}if(r.vy>0)r.jh=0;
 r.vy=Math.min(r.vy+GR*dt,620);
 const o={x:r.px,y:r.py,vx:r.vx,vy:r.vy,g:0};mv(o,PW,PH,dt);r.px=o.x;r.py=o.y;r.vx=o.vx;r.vy=o.vy;
 if(o.g){if(!r.g)burst(r.px,r.py,'#ffffff77',4);r.rk=1}r.g=o.g;
 if(o.bump){const[c,rw]=o.bump,t=r.tl[c][rw];r.bump={c,r:rw,t:.15};if(t==3){r.tl[c][rw]=6;r.coins++;pop('+1',(c+.5)*T,rw*T-8,'#ffd54a');burst((c+.5)*T,rw*T,'#ffd54a',6);if(R()<.2)E('pu',{x:(c+.5)*T,y:(rw-1)*T+T/2,k:'hp'})}}
 if(r.bump){r.bump.t-=dt;if(r.bump.t<=0)r.bump=null}
 if(r.fl>0){r.fl-=dt;r.pt.push({x:r.px-6+rr(-4,4),y:r.py+2,vx:rr(-20,20),vy:rr(120,220),l:.28,c:R()<.5?'#ffd54a':'#ff7a2a'})}
 if(r.px<r.cam+PW/2+2){r.px=r.cam+PW/2+2;if(r.vx<0)r.vx=0}
 r.cam=Math.max(r.cam,Math.round((r.px-W*.38)*K)/K);
 if(r.g&&sol(Math.floor(r.px/T),Math.floor(r.py/T))&&!sol(Math.floor(r.px/T),Math.floor(r.py/T)-1))r.safe=Math.max(r.safe,r.cam+T*3);
 if(r.py>(rows()+1)*T){r.hp--;if(r.hp<=0){finish();return}let c=Math.floor((r.cam+W*.3)/T);for(let n=0;n<80&&!(sol(c,r.gr)&&!sol(c,r.gr-1)&&sol(c+1,r.gr)&&!sol(c+1,r.gr-1));n++)c++;r.px=(c+.5)*T;r.py=r.gr*T;r.vx=0;r.vy=0;r.inv=2;r.sk=.2}
 if(keys.a>0&&r.acd<=0){r.atk=.25;r.acd=.45;keys.a=0}
 const pb=[r.px-PW/2,r.py-PH,r.px+PW/2,r.py],ab=r.atk>0?(r.dir>0?[r.px+8,r.py-74,r.px+88,r.py+4]:[r.px-88,r.py-74,r.px-8,r.py+4]):null;
 for(const e of r.ent){if(e.dead)continue;
  if(e.x<r.cam-60){e.dead=1;continue}
  if(e.x>r.cam+W+80&&e.t!='cage')continue;
  if(e.t=='spam'){e.vy=Math.min(e.vy+GR*dt,500);const q={x:e.x,y:e.y,vx:e.vx,vy:e.vy,g:0};const h=mv(q,22,24,dt);e.x=q.x;e.y=q.y;e.vy=q.vy;if(h)e.vx=-e.vx;if(e.y>(rows()+1)*T)e.dead=1}
  else if(e.t=='bird'){e.x-=50*dt;e.y=e.y0+Math.sin(r.t*3+e.p)*24}
  else if(e.t=='cage'){if(!e.done&&r.px>e.x){e.done=1;r.hp=Math.min(3,r.hp+1);r.coins+=25;r.bn={t:'ГОЛУБАЯ: «'+LINES[R()*LINES.length|0]+'»',s:'+1 ♥  +25 монет'};r.bt=3;burst(e.x,e.y-40,'#ffd0dc',16)}continue}
  const b=bxe(e);
  if(e.t=='coin'){if(ov(pb,b)){e.dead=1;r.coins++;burst(e.x,e.y,'#ffd54a',4)}continue}
  if(e.t=='pu'){if(ov(pb,b)){e.dead=1;r.hp=Math.min(3,r.hp+1);pop('+1 ♥',e.x,e.y-20,'#ff9ec8')}continue}
  if(!b[2])continue;
  if(ab&&ov(ab,b)){kill(e);continue}
  if(ov(pb,b)){if((e.t=='spam'||e.t=='bird')&&r.vy>40&&r.py-r.vy*dt<=b[1]+10){kill(e,1);r.vy=-380;r.g=0;r.jh=0;r.rk=1;pop('ТОП!',r.px,r.py-90,'#ffd0dc')}else dmg()}}
 r.ent=r.ent.filter(e=>!e.dead);
 for(const p of r.pt){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=500*dt;p.l-=dt}r.pt=r.pt.filter(p=>p.l>0);for(const t of r.tx){t.y-=34*dt;t.l-=dt}r.tx=r.tx.filter(t=>t.l>0);
 for(const c in r.tl)if(c<(r.cam/T|0)-6)delete r.tl[c];
 if(m>=1500&&!MR().lb){MR().lb=1;sv();G().grant&&G().grant();r.bn={t:'ИВЕНТ ПРОЙДЕН!',s:'Скин «Кира и Мескалин» и тема «Лесбийская» открыты'};r.bt=5;G().ev&&G().ev()}}
/* ---------- рисование ---------- */
const OL='#240820';
function rrect(a,b,w,h,r){x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()}
function hill(c,par,base,amp,per,ph){x.fillStyle=c;x.beginPath();x.moveTo(0,H);for(let i=0;i<=W+10;i+=10)x.lineTo(i,base-amp-amp*Math.sin((i+run.cam*par)/per+ph)-amp*.5*Math.sin((i+run.cam*par)/(per*.43)));x.lineTo(W+10,H);x.fill()}
function tile(t,sx,sy,c,top,z,rw){
 if(t==1){x.fillStyle=z.g;x.fillRect(sx,sy,T+.5,T+.5);x.fillStyle='rgba(0,0,0,'+Math.min(.45,Math.max(0,rw-run.gr)*.07)+')';x.fillRect(sx,sy,T+.5,T+.5);
  x.fillStyle='rgba(255,255,255,.07)';x.fillRect(sx,sy+T-1,T,1);x.fillRect(sx+(c%2?T/2:0),sy,1,T);
  if(top){x.fillStyle=OL;x.fillRect(sx,sy,T+.5,8);x.fillStyle=FL[((c%7)+7)%7];x.fillRect(sx,sy+2,T+.5,5);x.fillStyle='rgba(255,255,255,.45)';x.fillRect(sx,sy+2,T+.5,1.5)}}
 else if(t==4){const g=x.createLinearGradient(sx,0,sx+T,0);g.addColorStop(0,P.pipe[0]);g.addColorStop(.55,P.pipe[1]);g.addColorStop(1,P.pipe[2]);x.fillStyle=g;x.fillRect(sx,sy,T+.5,T+.5);
  if(top){rrect(sx-2,sy,T+4,11,3);x.fillStyle=P.pipe[3];x.fill();x.strokeStyle=OL;x.lineWidth=2;x.stroke()}}
 else{const base={2:P.brick,5:P.hard,3:'#ffd54a',6:'#6a5060'}[t];rrect(sx+1,sy+1,T-2,T-2,5);x.fillStyle=base;x.fill();x.save();x.clip();x.fillStyle='rgba(255,255,255,.38)';x.fillRect(sx,sy,T,7);x.fillStyle='rgba(0,0,0,.22)';x.fillRect(sx,sy+T-8,T,8);
  if(t==2){x.fillStyle='rgba(36,8,32,.35)';x.fillRect(sx,sy+T/2-.5,T,1);x.fillRect(sx+T/2-.5,sy,1,T/2);x.fillRect(sx+T/4,sy+T/2,1,T/2);x.fillRect(sx+3*T/4,sy+T/2,1,T/2)}x.restore();
  rrect(sx+1,sy+1,T-2,T-2,5);x.strokeStyle=OL;x.lineWidth=2;x.stroke();
  if(t==3){x.font='900 19px Onest,sans-serif';x.textAlign='center';x.lineWidth=3;x.strokeStyle=OL;x.strokeText('?',sx+T/2,sy+T-7);x.fillStyle='#fff';x.fillText('?',sx+T/2,sy+T-7)}}}
function chair(r){const hurt=r.hurt>0,sp=hurt?SP.hurt:r.atk>0?SP.attack:SP.idle,sx=r.px-r.cam,y=r.py,bob=r.g&&Math.abs(r.vx)>20?Math.abs(Math.sin(r.t*14))*2:0;
 if(r.g){x.fillStyle='rgba(20,4,18,.32)';x.beginPath();x.ellipse(sx,y+1,30,5,0,0,7);x.fill()}
 if(r.inv>0&&(r.t*14|0)%2&&!hurt)x.globalAlpha=.45;
 if(sp){const w=H0*sp.width/sp.height;x.save();if(r.g){x.beginPath();x.rect(sx-100,y-220,230,220);x.clip()}x.translate(sx,y-bob);x.scale(r.dir,1);x.rotate(Math.max(-.15,Math.min(.15,r.vy/3200)));x.drawImage(sp,-w*CX,-H0*AN,w,H0);x.restore()}
 else{x.fillStyle='#ffd9e6';x.fillRect(sx-12,y-PH,24,PH-14);x.strokeStyle='#e8e8f0';x.lineWidth=4;x.beginPath();x.arc(sx,y-14,14,0,7);x.stroke()}
 x.globalAlpha=1}
function ent(e,r){const t=e.t,ex=e.x-r.cam,y=e.y;if(ex<-40||ex>W+40)return;
 if(t=='coin'){const s=Math.abs(Math.sin(r.t*4+e.x*.05)),cw=2+6.5*s;x.beginPath();x.ellipse(ex,y,cw+1.5,10,0,0,7);x.fillStyle=OL;x.fill();x.beginPath();x.ellipse(ex,y,cw,8.5,0,0,7);x.fillStyle=FL[(Math.floor(e.x/T)%7+7)%7];x.fill();x.fillStyle='rgba(255,255,255,.55)';x.fillRect(ex-1,y-5,2,6)}
 else if(t=='spam'){const f=Math.sin(r.t*12+e.p)*2,lk=e.vx<0?-1:1;x.fillStyle=OL;x.beginPath();x.ellipse(ex-7,y-1.5,7,4+Math.max(0,f),0,0,7);x.ellipse(ex+7,y-1.5,7,4+Math.max(0,-f),0,0,7);x.fill();
  x.beginPath();x.ellipse(ex,y-15,16.5,15.5,0,0,7);x.fill();x.fillStyle='#9a3a96';x.beginPath();x.ellipse(ex,y-15,14.5,13.5,0,0,7);x.fill();x.fillStyle='rgba(255,255,255,.28)';x.beginPath();x.ellipse(ex-4,y-21,6,3.5,-.4,0,7);x.fill();
  x.fillStyle='#fff';x.beginPath();x.ellipse(ex-5,y-16,4.2,5,0,0,7);x.ellipse(ex+5,y-16,4.2,5,0,0,7);x.fill();x.fillStyle=OL;x.beginPath();x.arc(ex-5+lk,y-15,2,0,7);x.arc(ex+5+lk,y-15,2,0,7);x.fill();
  x.strokeStyle=OL;x.lineWidth=2;x.beginPath();x.moveTo(ex-10,y-23);x.lineTo(ex-2,y-20);x.moveTo(ex+10,y-23);x.lineTo(ex+2,y-20);x.stroke()}
 else if(t=='bird'){const f=Math.sin(r.t*18)*8;x.fillStyle=OL;x.beginPath();x.ellipse(ex,y,16,11,0,0,7);x.fill();x.fillStyle='#efe9f8';x.beginPath();x.ellipse(ex,y,14,9,0,0,7);x.fill();
  x.fillStyle=OL;x.beginPath();x.moveTo(ex-5,y-1);x.lineTo(ex+7,y-14-f);x.lineTo(ex+12,y-1);x.fill();x.fillStyle='#b7aad8';x.beginPath();x.moveTo(ex-3,y-1);x.lineTo(ex+7,y-11-f);x.lineTo(ex+10,y-1);x.fill();
  x.fillStyle='#ef7627';x.beginPath();x.moveTo(ex-13,y-3);x.lineTo(ex-21,y);x.lineTo(ex-13,y+2);x.fill();x.fillStyle=OL;x.beginPath();x.arc(ex-7,y-3,2,0,7);x.fill()}
 else if(t=='plant'){if(Math.sin(r.t*2+e.p)>.1){const py=y-4;x.strokeStyle=OL;x.lineWidth=6;x.beginPath();x.moveTo(ex,py);x.lineTo(ex,py-14);x.stroke();x.strokeStyle='#35a05a';x.lineWidth=3;x.stroke();
  x.fillStyle=OL;x.beginPath();x.arc(ex,py-24,13,0,7);x.fill();x.fillStyle='#d52d00';x.beginPath();x.arc(ex,py-24,11,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(ex-4,py-27,2.8,0,7);x.arc(ex+4,py-27,2.8,0,7);x.fill();x.fillStyle=OL;x.fillRect(ex-7,py-20,14,4);x.fillStyle='#fff';x.fillRect(ex-6,py-20,3,2);x.fillRect(ex-1,py-20,3,2);x.fillRect(ex+4,py-20,3,2)}}
 else if(t=='pu'){x.font='900 22px Onest,sans-serif';x.textAlign='center';x.lineWidth=4;x.strokeStyle=OL;const yy=y+8+Math.sin(r.t*5)*2;x.strokeText('♥',ex,yy);x.fillStyle='#ff5a82';x.fillText('♥',ex,yy)}
 else if(t=='cage'){if(SP.cage){const h=88,w=h*SP.cage.width/SP.cage.height;x.drawImage(SP.cage,ex-w/2,y-h,w,h)}else{x.strokeStyle='#d9c27a';x.lineWidth=2.5;x.strokeRect(ex-28,y-60,56,60)}if(e.done){x.fillStyle='#ff6ab0';x.font='800 18px Onest,sans-serif';x.textAlign='center';x.fillText('♥',ex,y-96-(r.t*20%10))}}}
function draw(){const r=run,z=ZN[r.z],pz=ZN[(r.z+3)%4],k=Math.min(1,r.zb),gy=r.gr*T,zc={g:lerp(pz.g,z.g,k)};x.setTransform(K,0,0,K,0,0);
 if(r.sk>0)x.translate(rr(-2,2),rr(-2,2));
 const g=x.createLinearGradient(0,0,0,gy);g.addColorStop(0,lerp(pz.a,z.a,k));g.addColorStop(1,lerp(pz.b,z.b,k));x.fillStyle=g;x.fillRect(-5,-5,W+10,H+10);
 if(r.z<3){x.fillStyle='#fff';for(let i=0;i<26;i++){x.globalAlpha=.25+.5*Math.abs(Math.sin(r.t*1.5+i));x.fillRect((i*73)%W,(i*41)%(gy*.45),1.6,1.6)}x.globalAlpha=1}
 const hy=gy-96;FL.forEach((c,i)=>{x.fillStyle=c;x.globalAlpha=.1;x.fillRect(0,hy-60+i*17,W,17)});x.globalAlpha=1;
 const sg=x.createRadialGradient(W*.7,hy-10,6,W*.7,hy-10,78);sg.addColorStop(0,'rgba(255,240,220,.65)');sg.addColorStop(.35,'rgba(255,226,200,.28)');sg.addColorStop(1,'rgba(255,200,160,0)');x.fillStyle=sg;x.fillRect(0,hy-90,W,170);
 x.fillStyle='rgba(255,255,255,.24)';for(let i=0;i<6;i++){const cx=((i*130-r.cam*.15+r.t*3)%(W+150)+W+150)%(W+150)-75,cy=30+(i*43%110);x.beginPath();x.arc(cx,cy,10,0,7);x.arc(cx+11,cy-5,13,0,7);x.arc(cx+24,cy,10,0,7);x.rect(cx-8,cy,40,10);x.fill()}
 x.fillStyle='rgba(36,8,32,.28)';for(let i=-1;i<12;i++){const bxx=((i*34-r.cam*.1)%(W+68)+W+68)%(W+68)-34,bh=26+(i*37%44);x.fillRect(bxx,gy-bh-14,24,bh+14)}
 hill('rgba(26,6,22,.30)',.2,gy-6,34,110,1);hill('rgba(26,6,22,.45)',.45,gy+14,20,66,3);
 x.fillStyle='#14040f';x.fillRect(0,gy+6,W,H);
 const c0=Math.floor(r.cam/T),c1=c0+Math.ceil(W/T)+1,R_=rows();
 for(let c=c0;c<=c1;c++){if(sol(c,r.gr)&&!sol(c,r.gr-1)&&((c*2654435761)>>>0)%100<14){const bx=(c+.5)*T-r.cam,by=r.gr*T+1;x.fillStyle=OL;for(const[dx,rd]of[[-9,10],[0,13],[10,9]]){x.beginPath();x.arc(bx+dx,by-rd+3,rd+2,0,7);x.fill()}x.fillStyle=P.bush;for(const[dx,rd]of[[-9,10],[0,13],[10,9]]){x.beginPath();x.arc(bx+dx,by-rd+3,rd,0,7);x.fill()}x.fillStyle='rgba(255,255,255,.18)';x.beginPath();x.arc(bx-2,by-14,5,0,7);x.fill()}}
 for(let c=c0;c<=c1;c++){const a=r.tl[c];if(!a)continue;for(let rw=0;rw<R_;rw++){const t=a[rw];if(!t)continue;let dy=0;if(r.bump&&r.bump.c==c&&r.bump.r==rw)dy=-5*Math.sin(r.bump.t/.15*Math.PI);tile(t,c*T-r.cam,rw*T+dy,c,!(a[rw-1]),zc,rw)}}
 for(const e of r.ent)ent(e,r);
 chair(r);
 for(const p of r.pt){x.globalAlpha=Math.min(1,p.l*3);x.fillStyle=p.c;x.fillRect(p.x-r.cam-2,p.y-2,4,4)}x.globalAlpha=1;
 for(const q of r.tx){x.globalAlpha=Math.min(1,q.l*2);x.font='800 13px Onest,sans-serif';x.textAlign='center';x.lineWidth=3;x.strokeStyle=OL;x.strokeText(q.s,q.x-r.cam,q.y);x.fillStyle=q.c;x.fillText(q.s,q.x-r.cam,q.y)}x.globalAlpha=1}
const set=(id,v,k)=>{const e=$(id);if(cache[id]!==v){cache[id]=v;e[k||'textContent']=v}};
function hud(f){if(f)cache={};const r=run;set('#mrh','♥'.repeat(Math.max(0,r.hp))+'♡'.repeat(Math.max(0,3-r.hp)));set('#mrm',Math.floor(r.px/T)+' м');set('#mrz',ZN[r.z].n);set('#mrc2',String(r.coins));
 set('#mrbn',r.bt>0&&r.bn?'<b>'+r.bn.t+'</b>'+(r.bn.s?'<small>'+r.bn.s+'</small>':''):'','innerHTML');
 set('#mrtip',r.tip>0&&!r.over?'<b>Иди вправо ▶</b><small>прыгай на врагов · в воздухе ПРЫЖОК ещё раз = ракеты</small>':'','innerHTML')}
function loop(n){raf=requestAnimationFrame(loop);const dt=Math.min(.033,(n-last)/1e3||0);last=n;const r=run;if(!r||r.pz)return;
 if(!r.over){up(dt);if(r.tip>0)r.tip-=dt}else r.t+=dt;if(r.pz||!run)return;draw();hud()}
function finish(quit){const r=run;if(r.over)return;r.over=1;r.pz=0;const m=Math.floor(r.px/T),M=MR(),rec=m>(M.best|0);if(rec)M.best=m;M.runs=(M.runs|0)+1;M.tut=1;if(m>(M.tb|0)){M.tb=m;sv();G().mr&&G().mr(m)}
 const cn=quit&&m<30?0:Math.min(300,Math.floor(m/8)+r.coins);M.coins=(M.coins|0)+cn;if(cn&&G().coins)G().coins(cn);sv();G().save&&G().save();G().ev&&G().ev();
 setTimeout(()=>{if(!on||!run||run!==r)return;$('#mro').innerHTML='<div class="mcard"><small>'+(rec?'НОВЫЙ РЕКОРД':'ЗАБЕГ ОКОНЧЕН')+'</small><h2>'+m+' м</h2><div class="mst"><span>Рекорд<b>'+M.best+'</b></span><span>Убито<b>'+r.kills+'</b></span><span>Монет<b>+'+cn+'</b></span></div><button class="play" id="mrr">Ещё раз</button><button class="sec" id="mrq">В меню</button></div>';
  $('#mrr').onclick=()=>{$('#mro').innerHTML='';start()};$('#mrq').onclick=close},quit?0:700);if(quit)close()}
window.marioStart=open;
})();
