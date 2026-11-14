/* ============================================================
   theme.js — цвет интерфейса берётся из арта надетого скина.
   Как работает:
   1. TH.set(скин) достаёт из картинки главный «яркий» оттенок (серое/белое/чёрное не считается).
   2. Из оттенка в пространстве OKLCH строится вся палитра: акцент, подсветка, 3 фона, цвет текста на акценте.
      OKLCH выбран не случайно: яркость у всех цветов одинаковая, поэтому и синий, и жёлтый, и красный
      скины выглядят одинаково «дорого», а текст остаётся читаемым.
   3. Смена цвета — плавный переход по кругу оттенков (не через серый), ~0.9 c, без скачков.
   Белый скин (например «Обычный Ілюша») не даёт оттенка — берётся цвет по умолчанию для его персонажа.
   Чтобы задать цвет скину руками: в списке скинов у объекта скина добавь поле th:[оттенок 0-360, насыщенность 0.12-0.2].
   ============================================================ */
(()=>{
const root=document.documentElement,clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),RAD=Math.PI/180;
const hd=(a,b)=>{const d=Math.abs(((a-b)%360+540)%360-180);return d};/* расстояние между оттенками */

/* --- OKLCH <-> sRGB --- */
function inGamut(L,C,h){const a=C*Math.cos(h*RAD),b=C*Math.sin(h*RAD),
 l=(L+.3963377774*a+.2158037573*b)**3,m=(L-.1055613458*a-.0638541728*b)**3,s=(L-.0894841775*a-1.291485548*b)**3,
 r=4.0767416621*l-3.3077115913*m+.2309699292*s,g=-1.2684380046*l+2.6097574011*m-.3413193965*s,bl=-.0041960863*l-.7034186147*m+1.707614701*s;
 return{ok:r>=-.001&&r<=1.001&&g>=-.001&&g<=1.001&&bl>=-.001&&bl<=1.001,r,g,b:bl}}
function toRGB(L,C,h){let c=C,o=inGamut(L,c,h);for(let i=0;i<40&&!o.ok;i++){c*=.93;o=inGamut(L,c,h)}
 const f=x=>{x=clamp(x,0,1);return Math.round(255*(x<=.0031308?12.92*x:1.055*Math.pow(x,1/2.4)-.055))};
 return[f(o.r),f(o.g),f(o.b)]}
function fromRGB(r,g,b){const lin=v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)};r=lin(r);g=lin(g);b=lin(b);
 const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b),
 L=.2104542553*l+.793617785*m-.0040720468*s,A=1.9779984951*l-2.428592205*m+.4505937099*s,B=.0259040371*l+.7827717662*m-.808675766*s;
 return[L,Math.hypot(A,B),(Math.atan2(B,A)/RAD+360)%360]}
const hex=a=>'#'+a.map(v=>v.toString(16).padStart(2,'0')).join('');

/* --- палитра из (оттенок, насыщенность) --- */
function palette(h,c){
 const A=clamp(c*1.12,.125,.2),
  bright=Math.exp(-Math.pow(hd(h,100)/42,2)),   /* жёлтые/салатовые оттенки светлее, иначе они выглядят грязно */
  mud=Math.exp(-Math.pow(hd(h,108)/48,2)),      /* в оливковой зоне тёмные фоны делаем менее насыщенными */
  L=.72+.14*bright,bc=1-.5*mud;
 return{
  ac:[L,A,h],
  ac2:[Math.min(.94,L+.14),A*.5,h+5],
  ac3:[L-.15,A*1.02,h+10],
  bg0:[.14,.05*bc,h+14],/* фоны чуть уходят в фиолетовую сторону — так глубже и дороже, чем строго тот же оттенок */
  bg1:[.215,.095*bc,h+14],
  bg2:[.37,.15*bc,h+14],
  ink:[.17,.05,h+10]}}
const rgbOf=(h,c)=>{const p=palette(h,c),o={};for(const k in p)o[k]=toRGB(...p[k]);return o};
/* --- ТЕМА-ЗАМОК: купленная тема (или «цвет не от скина») фиксирует палитру, скин на неё больше не влияет.
   LOCK={id,h,c,rgb?}; rgb — необязательные ручные цвета {ac,ac2,ac3,bg0,bg1,bg2,ink}=[r,g,b] поверх палитры из h,c --- */
let LOCK=null;
const cols=(h,c)=>{const o=rgbOf(h,c);if(LOCK&&LOCK.rgb)for(const k in LOCK.rgb)o[k]=LOCK.rgb[k];return o};

/* --- цвет по умолчанию, если в арте нет яркого оттенка (белый/серый скин) --- */
const DEF={il:[245,.16],ct:[305,.16],nc:[48,.17],gb:[205,.15],bl:[245,.16],ex:[88,.15]};
const hash=s=>{let x=0;for(const ch of String(s))x=(x*31+ch.charCodeAt(0))>>>0;return x};
const guess=q=>{if(q&&q.th&&q.th.length>=1)return[q.th[0],q.th[1]||.16];
 const d=DEF[q&&q.ch]||DEF.il;return d};

/* --- достаём главный оттенок из картинки --- */
function extract(img){
 try{const w=img.naturalWidth,h=img.naturalHeight;if(!w||!h)return null;
  const k=Math.min(1,72/Math.max(w,h)),cw=Math.max(1,Math.round(w*k)),ch=Math.max(1,Math.round(h*k)),
   cv=document.createElement('canvas');cv.width=cw;cv.height=ch;
  const g=cv.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0,cw,ch);
  const d=g.getImageData(0,0,cw,ch).data,N=36,W=new Float32Array(N),C=new Float32Array(N),X=new Float32Array(N),Y=new Float32Array(N),Q=new Float32Array(N);let area=0;
  for(let i=0;i<d.length;i+=4){if(d[i+3]<200)continue;area++;
   const[L,c,h]=fromRGB(d[i],d[i+1],d[i+2]);
   if(c<.06||L>.95||L<.17)continue;
   const wt=c*c*(1-Math.min(.7,Math.abs(L-.68))),b=((h/10)|0)%N;
   W[b]+=wt;C[b]+=c;Q[b]++;X[b]+=Math.cos(h*RAD)*wt;Y[b]+=Math.sin(h*RAD)*wt}
  let best=-1,bs=0;
  for(let b=0;b<N;b++){const s=W[b]+W[(b+1)%N]+W[(b+N-1)%N];if(s>bs){bs=s;best=b}}
  if(best<0)return null;
  const ids=[(best+N-1)%N,best,(best+1)%N];let x=0,y=0,cs=0,n=0;
  for(const b of ids){x+=X[b];y+=Y[b];cs+=C[b];n+=Q[b]}
  if(!n||n/Math.max(1,area)<.05)return null;/* ярких пикселей меньше 5% арта — считаем скин «бесцветным» */
  return[(Math.atan2(y,x)/RAD+360)%360,cs/n]}catch(e){return null}}

/* --- кэш: память + localStorage --- */
let store={};try{store=JSON.parse(localStorage.thc||'{}')}catch{}
const saveStore=()=>{try{const k=Object.keys(store);if(k.length>400)for(const x of k.slice(0,k.length-300))delete store[x];localStorage.thc=JSON.stringify(store)}catch{}};
const keyOf=q=>{const s=String(q.src||'');return q.id+'|'+s.length+'|'+s.slice(-18)};
const pend=new Map();
function load(q){/* → Promise<[h,c]|null> (без запроса к сети для data: картинок) */
 if(q.th&&q.th.length)return Promise.resolve([q.th[0],q.th[1]||.16]);
 const k=keyOf(q);if(k in store)return Promise.resolve(store[k]);
 if(pend.has(k))return pend.get(k);
 const p=new Promise(res=>{const im=new Image();if(!/^data:/.test(q.src||''))im.crossOrigin='anonymous';
  im.onload=()=>{const r=extract(im);store[k]=r;saveStore();res(r)};
  im.onerror=()=>res(null);im.src=q.src}).finally(()=>pend.delete(k));
 pend.set(k,p);return p}

/* --- применение и анимация --- */
const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
let cur=null,raf=0,tok=0,last=null;
function paint(h,c){const o=cols(h,c);last=o;
 for(const k in o)root.style.setProperty('--'+k+'-rgb',o[k].join(','));
 root.style.setProperty('--hue',h.toFixed(1));return o}
function done(){const o=cols(cur.h,cur.c);
 try{localStorage.thl=JSON.stringify([+cur.h.toFixed(1),+cur.c.toFixed(3)])}catch{}
 try{const m=document.querySelector('meta[name=theme-color]');if(m)m.content=hex(o.bg0)}catch{}
 try{TH.onDone&&TH.onDone(hex(o.bg0),o)}catch{}}
function go(h,c,instant,dur=900){
 cancelAnimationFrame(raf);
 if(!cur||instant||reduced()||document.hidden){cur={h,c};paint(h,c);done();return}
 const from={...cur},dh=((h-from.h+540)%360)-180,dc=c-from.c;
 if(Math.abs(dh)<.5&&Math.abs(dc)<.002){cur={h,c};paint(h,c);done();return}
 const t0=performance.now(),ease=u=>u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;
 const step=n=>{const u=clamp((n-t0)/dur,0,1),e=ease(u);
  cur={h:(from.h+dh*e+360)%360,c:from.c+dc*e};paint(cur.h,cur.c);
  if(u<1)raf=requestAnimationFrame(step);else{cur={h,c};done()}};
 raf=requestAnimationFrame(step)}

const TH={
 onDone:null,
 palette:rgbOf,
 /* палитра темы-спеки {h,c,rgb?} — для превью в магазине */
 pal(q){const o=rgbOf(q.h,q.c);if(q.rgb)for(const k in q.rgb)o[k]=q.rgb[k];return o},
 /* поставить/снять тему-замок (null — снова красим от скина; перекрасить в скин должен вызывающий) */
 lock(q,opt={}){const j=JSON.stringify(q||null);if(j===JSON.stringify(LOCK))return;LOCK=q||null;
  try{q?localStorage.thk=j:localStorage.removeItem('thk')}catch{}
  if(q){tok++;go(q.h,q.c,!!opt.instant,opt.dur)}},
 get locked(){return!!LOCK},
 /* мгновенно: что известно сейчас (из кэша или по умолчанию) */
 peek(q){const k=keyOf(q);if(q.th&&q.th.length)return[q.th[0],q.th[1]||.16];return(k in store&&store[k])||guess(q)},
 /* q = {id, src, ch, th?}. Возвращает промис с [h,c], когда тема применена (начала применяться) */
 async set(q,opt={}){const my=++tok;
  if(LOCK){go(LOCK.h,LOCK.c,!!opt.instant,opt.dur);return[LOCK.h,LOCK.c]}
  let r=null;const k=keyOf(q);
  if(!(k in store)&&!opt.instant){/* пока считаем — не дёргаем интерфейс, ждём (обычно <30 мс) */}
  try{r=await load(q)}catch{}
  if(my!==tok)return null;
  const[h,c]=r||guess(q);go(h,c,!!opt.instant,opt.dur);return[h,c]},
 get cur(){return cur},
 hex(k='bg0'){const o=last||rgbOf(250,.16);return hex(o[k])},
 /* SVG-монета в текущих цветах — для монет внутри игры (canvas) */
 coin(){const o=cols((cur||{h:250}).h,(cur||{c:.16}).c),c=a=>'rgb('+a.join(',')+')';
  return'data:image/svg+xml;utf8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1=".2" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="${c(o.ac2)}"/><stop offset=".55" stop-color="${c(o.ac)}"/><stop offset="1" stop-color="${c(o.ac3)}"/></linearGradient></defs><circle cx="32" cy="32" r="29" fill="url(#g)"/><circle cx="32" cy="32" r="29" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2.5"/><circle cx="32" cy="32" r="22.5" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="1.6"/><path d="M32 14c1.4 9 5 12.6 14 14-9 1.4-12.6 5-14 14-1.4-9-5-12.6-14-14 9-1.4 12.6-5 14-14z" fill="#fff"/></svg>`)},
 /* локальная подкраска элемента (например, превью скина в магазине) */
 tint(el,q){const[h,c]=TH.peek(q),o=rgbOf(h,c);for(const k in o)el.style.setProperty('--t'+k+'-rgb',o[k].join(','));return load(q).then(r=>{const[H,Cc]=r||guess(q),n=rgbOf(H,Cc);for(const k in n)el.style.setProperty('--t'+k+'-rgb',n[k].join(','))})}
};
window.TH=TH;
/* --- «обрезанные снизу» арты (ноги упираются в край картинки): плавно растворяем низ, чтобы не было резкого среза --- */
const cutMemo={};
function markCut(img){try{const w=img.naturalWidth,h=img.naturalHeight;if(!w||!h)return;
 const k=w+'x'+h+'|'+String(img.currentSrc||img.src).slice(-24);
 if(!(k in cutMemo)){const cw=Math.min(64,w),ch=Math.max(4,Math.round(h*cw/w)),cv=document.createElement('canvas');cv.width=cw;cv.height=ch;
  const g=cv.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0,cw,ch);
  const d=g.getImageData(0,ch-2,cw,2).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>140)n++;
  cutMemo[k]=n/(cw*2)>.07}
 img.classList.toggle('cut',cutMemo[k])}catch{}}
document.addEventListener('load',e=>{const t=e.target;if(t&&t.tagName=='IMG'&&(t.id=='i1'||t.classList.contains('pfk')||t.classList.contains('cutchk')||(t.parentElement&&t.parentElement.classList.contains('st'))))markCut(t)},true);
/* стартовая палитра, чтобы до загрузки скина экран не мигал белым */
(()=>{try{const s=JSON.parse(localStorage.thl||'null');if(s&&s.length==2){cur={h:s[0],c:s[1]};paint(s[0],s[1])}else{cur={h:250,c:.16};paint(250,.16)}}catch{cur={h:250,c:.16};paint(250,.16)}})();
/* купленная тема / «цвет не от скина» — восстанавливаем до первого кадра, чтобы не мигало */
(()=>{try{const q=JSON.parse(localStorage.thk||'null');if(q&&q.h!=null&&q.c!=null){LOCK=q;cur={h:q.h,c:q.c};paint(q.h,q.c);if(q.id)root.dataset.th=q.id}}catch{}})();
})();
