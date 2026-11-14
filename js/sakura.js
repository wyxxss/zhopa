/* Тема «Сакура»: ветка в углу главной + падающие лепестки. Включается сама, когда html[data-th=sakura]. */
(()=>{const r=document.documentElement;let el=null;
const fl=(x,y,s,a)=>`<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})"><g fill="#e79bb8">${[0,72,144,216,288].map(k=>`<ellipse cy="-14" rx="10" ry="14" transform="rotate(${k})"/>`).join('')}</g><g fill="#f9cde0" opacity=".55">${[36,108,180,252,324].map(k=>`<ellipse cy="-8" rx="5" ry="8" transform="rotate(${k})"/>`).join('')}</g><circle r="4" fill="#ffe9a3"/></g>`;
const SVG=`<svg class="br" viewBox="0 0 300 220" aria-hidden="true"><g fill="none" stroke="#6e3b55" stroke-linecap="round"><path d="M304 18C250 34 205 66 152 80S68 122 28 176" stroke-width="5"/><path d="M205 62C196 40 176 28 164 12" stroke-width="3"/><path d="M122 98C122 126 104 146 82 150" stroke-width="3"/><path d="M250 40C262 58 262 78 252 94" stroke-width="2.5"/></g>${fl(207,58,1,10)}${fl(162,18,.8,-20)}${fl(252,36,.9,30)}${fl(124,100,.75,5)}${fl(70,150,.7,-15)}${fl(256,92,.55,40)}${fl(36,170,.5,0)}</svg>`;
function mk(){if(el)return;el=document.createElement('div');el.id='sk';let h=SVG;
 for(let i=0;i<16;i++)h+=`<i class="pt" style="left:${(Math.random()*100).toFixed(1)}%;--s:${(7+Math.random()*9).toFixed(1)}px;--d:${(9+Math.random()*9).toFixed(1)}s;--l:-${(Math.random()*16).toFixed(1)}s;--x:${(Math.random()*40-10).toFixed(0)}vw"></i>`;
 el.innerHTML=h;document.body.prepend(el)}
function sync(){if(r.dataset.th!='sakura')return;mk();const cv=document.getElementById('cv');el.classList.toggle('hid',!!cv&&getComputedStyle(cv).display!='none')}
new MutationObserver(sync).observe(r,{attributes:true,attributeFilter:['data-th']});setInterval(sync,800);sync()})();
