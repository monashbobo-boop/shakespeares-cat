/* 莎士比亚的猫文学社官网原型的交互脚本
   内容数据（活动、往期、书单）都在下面的 DATA 区，改文字只需改这里。 */
(function(){
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const DESK=()=>matchMedia('(min-width: 992px)').matches;
const G=!!window.gsap, ST=!!window.ScrollTrigger;
if(G){gsap.registerPlugin(...[window.ScrollTrigger,window.CustomEase,window.DrawSVGPlugin].filter(Boolean));
  if(window.CustomEase){CustomEase.create('osmo','0.625, 0.05, 0, 1');CustomEase.create('energy','M0,0 C0.32,0.72 0,1 1,1');}
  gsap.defaults({ease:window.CustomEase?'osmo':'power3.out',duration:.6});}
const EN=window.CustomEase?'energy':'power2.out';

let lenis=null;
if(window.Lenis&&!RM&&G&&ST){lenis=new Lenis({lerp:.11});lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0);}
const toTop=()=>{if(lenis)lenis.scrollTo(0,{immediate:true,force:true});window.scrollTo(0,0);};

/* ---------- 三层波浪（取自会员设计的首屏） ---------- */
function cr2bez(p){let d=`M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;for(let i=0;i<p.length-1;i++){const a=p[i-1]||p[i],b=p[i],c=p[i+1],e=p[i+2]||c;d+=` C${(b[0]+(c[0]-a[0])/6).toFixed(1)} ${(b[1]+(c[1]-a[1])/6).toFixed(1)}, ${(c[0]-(e[0]-b[0])/6).toFixed(1)} ${(c[1]-(e[1]-b[1])/6).toFixed(1)}, ${c[0].toFixed(1)} ${c[1].toFixed(1)}`;}return d;}
const WC=[['#E6E2CB','#D9D5BB'],['#CDD1AF','#BEC49F'],['#AAB48E','#99A47F']];
const WAVE={
  hero:{vb:[1920,1200],layers:[   /* 米色留得更大，标题、简介和按钮都在最浅的那一层里 */
    {c:0,pts:[[1540,-80],[1430,250],[1270,560],[1020,830],[620,975],[-120,1030]],close:[[-120,1300],[2040,1300],[2040,-80]]},
    {c:1,pts:[[2040,330],[1800,470],[1590,710],[1310,930],[910,1050],[430,1100],[-120,1130]],close:[[-120,1300],[2040,1300]]},
    {c:2,pts:[[-120,1165],[300,1125],[700,1115],[1100,1130],[1460,1055],[1760,995],[2040,950]],close:[[2040,1300],[-120,1300]]}]},
  xs:{vb:[1920,760],layers:[
    {c:0,pts:[[-120,560],[380,490],[860,570],[1340,460],[2040,510]],close:[[2040,900],[-120,900]]},
    {c:1,pts:[[-120,640],[460,605],[980,665],[1480,590],[2040,620]],close:[[2040,900],[-120,900]]},
    {c:2,pts:[[-120,715],[620,690],[1220,740],[2040,685]],close:[[2040,900],[-120,900]]}]},
  panel:{vb:[1920,1000],layers:[
    {c:0,pts:[[-120,700],[380,610],[860,720],[1360,600],[2040,680]],close:[[2040,1100],[-120,1100]]},
    {c:1,pts:[[-120,880],[620,820],[1280,900],[2040,830]],close:[[2040,1100],[-120,1100]]}]},
  panel2:{vb:[1920,1000],layers:[
    {c:0,pts:[[2040,160],[1640,240],[1300,120],[880,200],[-120,90]],close:[[-120,-100],[2040,-100]]},
    {c:1,pts:[[-120,900],[700,840],[1400,920],[2040,860]],close:[[2040,1100],[-120,1100]]}]}
};
const waves=[];let wid=0;
$$('svg.waves').forEach(svg=>{const cfg=WAVE[svg.dataset.wave];if(!cfg)return;const seed=+(svg.dataset.seed||0);
  svg.setAttribute('viewBox',`0 0 ${cfg.vb[0]} ${cfg.vb[1]}`);svg.setAttribute('preserveAspectRatio','xMidYMid slice');
  let defs='',paths='';
  const L=cfg.layers.map((l,k)=>{const id='wg'+(wid++);const c=WC[l.c];defs+=`<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c[0]}"/><stop offset="1" stop-color="${c[1]}"/></linearGradient>`;
    const pts=l.pts.map(([x,y],i)=>[x+(seed?Math.sin(seed*1.7+i)*90:0),y+(seed?Math.cos(seed*2.3+i*1.3)*40:0)]);
    paths+=`<path fill="url(#${id})"/>`;return{pts,close:l.close,ph:k*1.3+seed};});
  svg.innerHTML=`<defs>${defs}</defs>${paths}`;
  const els=$$('path',svg);
  const draw=t=>L.forEach((l,k)=>{const p=l.pts.map(([x,y],i)=>(i===0||i===l.pts.length-1)?[x,y]:[x+Math.cos(t*.23+i*1.1+l.ph)*22,y+Math.sin(t*.31+i*.9+l.ph)*26]);
    els[k].setAttribute('d',cr2bez(p)+' '+l.close.map(([x,y])=>`L${x} ${y}`).join(' ')+' Z');});
  draw(0);waves.push({svg,draw,vis:false});});
const wio=new IntersectionObserver(es=>es.forEach(e=>{const o=waves.find(w=>w.svg===e.target);if(o)o.vis=e.isIntersecting;}));
waves.forEach(o=>wio.observe(o.svg));
if(!RM){const t0=performance.now();(function wl(now){requestAnimationFrame(wl);const t=(now-t0)/1000;waves.forEach(w=>{if(w.vis)w.draw(t);});})(t0);}

function splitChars(el){if(el.dataset.sp)return $$('.ch',el);el.dataset.sp=1;
  const walk=n=>[...n.childNodes].forEach(c=>{if(c.nodeType===3){const f=document.createDocumentFragment();[...c.textContent].forEach(ch=>{if(/\s/.test(ch)){f.appendChild(document.createTextNode(ch));return;}const s=document.createElement('span');s.className='ch';s.textContent=ch;f.appendChild(s);});c.replaceWith(f);}else if(c.nodeType===1&&c.tagName!=='BR'&&!c.classList.contains('ch'))walk(c);});
  walk(el);return $$('.ch',el);}

/* button hover */
function initButtons(root){if(!G||RM||!matchMedia('(hover:hover) and (pointer:fine)').matches)return;
  $$('[data-btn]',root).forEach(b=>{if(b.dataset.bi)return;b.dataset.bi=1;const t=$('.bt > span',b);if(!t)return;const ch=splitChars(t);
    const tl=gsap.timeline({paused:true}).to(ch,{keyframes:{'0%':{yPercent:0,scaleY:1,rotate:0},'20%':{yPercent:45,scaleY:.4,rotate:10,ease:'power2.in'},'100%':{yPercent:0,scaleY:1,rotate:0,ease:'elastic.out(1,0.5)'}},duration:.7,stagger:{amount:.2}});
    b.addEventListener('mouseenter',()=>tl.restart());b.addEventListener('mouseleave',()=>{tl.pause();gsap.to(ch,{yPercent:0,scaleY:1,rotate:0,duration:.2,overwrite:'auto'});});});}

/* ---------- DATA（示例内容） ---------- */
const CV=n=>`assets/img/covers/${n}.webp`;
const SK=n=>`assets/img/sketch/${n}.svg`;
const today=new Date();today.setHours(0,0,0,0);
const D=(y,m,d)=>new Date(y,m-1,d),T0=D(2026,10,5),T1=D(2026,12,13),wd=['日','一','二','三','四','五','六'];
const NCH='Nunawading Community Hub';
const EV=[
  {d:D(2026,10,10),t:'14:00',title:'《呼兰河传》（上）',type:'线下读书会',place:NCH,desc:'读第一至四章。小城的风俗、童年和祖父的后园，萧红为什么把悲凉写得这么亮？'},
  {d:D(2026,10,24),t:'19:00',title:'春夜朗读：写故乡的一段话',type:'文学夜',place:'墨尔本东区，报名后通知',desc:'带一段写故乡的文字，任何语言都可以，每人朗读三分钟，再说说为什么选它。'},
  {d:D(2026,11,7),t:'19:30',title:'《呼兰河传》（下）',type:'线上讨论',place:'Zoom',desc:'读完第五至七章和尾声。有二伯、冯歪嘴子和小团圆媳妇，谁的命运最让你放不下？'},
  {d:D(2026,11,15),t:'19:00',title:'在异乡写中文',type:'嘉宾讲座',place:'Zoom',desc:'请一位在澳洲用中文写作的作家，聊离开母语环境后，怎么继续写。嘉宾即将公布。'},
  {d:D(2026,11,28),t:'14:00',title:'《额尔古纳河右岸》',type:'线下读书会',place:NCH,desc:'整本讨论。一个人讲述一个民族的百年，叙述者的「老」给了这本书什么？'},
  {d:D(2026,12,12),t:'18:30',title:'学期末写作分享：一页纸的远方',type:'文学夜',place:'墨尔本东区，报名后通知',desc:'交一篇不超过一千字的短文，写你的故乡或你现在住的地方。现场朗读，不点评对错。'}];
const fmt=d=>`${d.getMonth()+1}月${d.getDate()}日`;
const where=p=>p==='Zoom'?'在 Zoom 上举行':`地点在${p}`;
/* 不显示「下一场」「报名中」这类要随时更新的状态。报名和临时调整统一看公众号；
   只有日期过了的活动按日期自动标「已结束」，不需要人去改 */
const next=EV.find(e=>e.d>=today);
const status=e=>e.d<today?['done','已结束']:['',''];
const CB=['#EAE4D2','#DEDAC1','#E6E1CC','#D3D6B9','#EDE8D8','#C6CBA8'];
const TI={'线下读书会':'book','文学夜':'night','线上讨论':'laptop','嘉宾讲座':'mic'};
$('#termTrack').innerHTML=EV.map((e,i)=>`<article class="ecard" style="--cb:${CB[i]}"><img class="sk" src="${SK(TI[e.type])}" alt=""><div><div class="num">${String(e.d.getDate()).padStart(2,'0')}</div><p class="when">${e.d.getMonth()+1} 月，周${wd[e.d.getDay()]} ${e.t}</p></div><div class="what"><h3 class="t-h3">${e.title}</h3><p class="meta">${e.type}<br>${e.place}</p></div></article>`).join('');

$('#sched').innerHTML=EV.map(e=>{const[sc,sl]=status(e);return `<article class="ev ${e.d<today?'past':''}"><div class="d"><b>${String(e.d.getDate()).padStart(2,'0')}</b><span>${e.d.getMonth()+1} 月</span><span>周${wd[e.d.getDay()]}</span></div><div class="c"><span class="t-small">${e.t} 开始的${e.type}，${where(e.place)}</span><h3 class="t-h3">${e.title}</h3><p class="t-body">${e.desc}</p></div>${sl?`<span class="chip ${sc}">${sl}</span>`:''}</article>`}).join('');

/* real covers, from 豆瓣 (Chinese editions) */
const bookHTML=(c,note,o={})=>`<div class="book" data-book style="${o.w?'--w:'+o.w+';':''}${o.t?'--t:'+o.t+';':''}--bk:${o.bk||'#2B3326'}"><div class="book__in"><div class="book__face book__back"></div><div class="book__face book__pages"></div><div class="book__face book__top"></div>${o.noSlip?'':`<div class="book__slip"><b>${note[0]}</b><span>${note[1]}</span><i>${note[2]||'莎士比亚的猫'}</i></div>`}<div class="book__face book__spine"><b>${(o.title||note[0]).replace(/[《》]/g,'')}</b><i></i></div><div class="book__face book__front"><img src="${CV(c)}" alt="${o.alt||''}" loading="lazy"></div></div><span class="book__shadow"></span></div>`;
const BOOKS=[
  ['biancheng','边城','沈从文','2025 年秋天，创社读的第一本','茶峒的渡船和翠翠，是我们的第一张长桌。','#4D5A3E'],
  ['huozhe','活着','余华','2026 年春天分两次读完','很多人说，第一次在读书会上哭。','#1E1E1E'],
  ['xusan','许三观卖血记','余华','2026 年春天的线下读书会','笑着读完，回家路上才难过。','#1E1E1E'],
  ['qingcheng','倾城之恋','张爱玲','2026 年冬天第一场讲座读的书','白流苏到底赢了没有？争了一下午。','#26324A'],
  ['jinsuo','金锁记','张爱玲','2026 年冬天的线下读书会','曹七巧的那副金锁，锁住了谁？','#6B5A4A'],
  ['hulanhe','呼兰河传','萧红','2026 年秋天正在读','祖父的后园，是全书最亮的地方。','#3F5A58'],
  ['eergu','额尔古纳河右岸','迟子建','2026 年秋天，11 月 28 日读','一个人讲完一个民族的百年。','#5B4A2E']];
$('#shelf').innerHTML=BOOKS.map(([c,t,a,when,line,bk],i)=>bookHTML(c,[`《${t}》`,`${when}<br>${line}`,a],{bk,title:t,noSlip:true,alt:`《${t}》封面`,t:['1.3em','1.7em','1.5em','1.4em','1.2em','1.6em','1.9em'][i]})).join('');

/* covers that trail the pointer: each cover has its own lag, so the group feels like it has weight */
/* covers appear beside the list (never on top of the words), swing in, drift a little with the pointer */
function sideCovers(sec,list,items,getCovers){
  const covs=$$('.fcov',sec);if(!G||!covs.length)return;
  const slot=[[-1,-.62,-8],[-1.9,.18,6],[1,-.5,7],[1.9,.28,-6]];
  const px=covs.map(c=>gsap.quickTo(c,'xPercent',{duration:1.1,ease:'power3'})),py=covs.map(c=>gsap.quickTo(c,'yPercent',{duration:1.1,ease:'power3'}));
  let cur=-1;
  const place=(li,i)=>{const sr=sec.getBoundingClientRect(),rs=$$(items,list).map(x=>x.getBoundingClientRect()),lr={left:Math.min(...rs.map(r=>r.left)),right:Math.max(...rs.map(r=>r.right))},ir=li.getBoundingClientRect(),cs=getCovers(i);
    covs.forEach((c,k)=>{const src=cs[k];gsap.killTweensOf(c);
      if(!src){gsap.to(c,{opacity:0,scale:.6,duration:.3,ease:'power2.in'});return;}
      const w=c.offsetWidth,h=c.offsetHeight,[sx,sy,rot]=slot[k];
      const x=sx<0?lr.left-sr.left-w*(-sx)-36:lr.right-sr.left+w*(sx-1)+36;
      const y=ir.top-sr.top+ir.height/2+sy*h-h/2;
      const img=$('img',c);
      if(img.dataset.src!==src){img.dataset.src=src;img.src=CV(src);
        gsap.fromTo(c,{x,y:y+40,rotation:rot*2.4,scale:.7,opacity:0},{x,y,rotation:rot,scale:1,opacity:1,duration:.85,delay:k*.06,ease:'back.out(1.6)'});}
      else gsap.to(c,{x,y,rotation:rot,scale:1,opacity:1,duration:.7,ease:'power3.out'});});};
  $$(items,list).forEach((li,i)=>li.addEventListener('pointerenter',()=>{if(!DESK())return;$$(items,list).forEach(x=>x.classList.toggle('on',x===li));sec.dataset.active='true';if(cur!==i){cur=i;place(li,i);}}));
  sec.addEventListener('pointermove',e=>{if(cur<0)return;const r=sec.getBoundingClientRect(),dx=(e.clientX-r.left)/r.width-.5,dy=(e.clientY-r.top)/r.height-.5;covs.forEach((c,k)=>{px[k](dx*(8+k*3));py[k](dy*(6+k*2));});});
  list.addEventListener('pointerleave',()=>{cur=-1;sec.dataset.active='false';$$(items,list).forEach(x=>x.classList.remove('on'));
    covs.forEach((c,k)=>{gsap.killTweensOf(c,'opacity,scale');gsap.to(c,{opacity:0,scale:.8,duration:.4,delay:k*.03,ease:'power2.in'});$('img',c).dataset.src='';});});}

/* manifesto phrases */
$$('[data-manifesto]').forEach(m=>{m.innerHTML=m.textContent.split(/(?<=[，。、])/).map(t=>`<span class="ph${RM?'':' dim'}">${t}</span>`).join('');});

/* slider */
const sliders=[];
function initSlider(name){const vp=$(`[data-slider="${name}"]`),track=$('.track',vp),ctrl=$(`[data-ctrl="${name}"]`),cards=[...track.children];
  const o={x:0,tx:0,i:0,stops:[0]};
  const measure=()=>{const max=Math.max(0,track.scrollWidth-vp.clientWidth);o.stops=cards.map(c=>Math.min(c.offsetLeft,max)).filter((v,i,a)=>i===0||v>a[i-1]+1);if(o.i>=o.stops.length)o.i=o.stops.length-1;o.tx=-o.stops[o.i];};
  const upd=()=>{if(!ctrl)return;$('[data-prev]',ctrl).classList.toggle('off',o.i===0);$('[data-next]',ctrl).classList.toggle('off',o.i>=o.stops.length-1);};
  const go=d=>{o.i=Math.max(0,Math.min(o.stops.length-1,o.i+d));o.tx=-o.stops[o.i];upd();};
  $('[data-prev]',ctrl).onclick=()=>go(-1);$('[data-next]',ctrl).onclick=()=>go(1);
  let down=null;vp.addEventListener('pointerdown',e=>{if(DESK())down={x:e.clientX,tx:o.tx};});
  addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-down.x;o.tx=down.tx+dx;});
  addEventListener('pointerup',()=>{if(!down)return;const t=-o.tx;let bi=0,bd=1e9;o.stops.forEach((v,i)=>{const d=Math.abs(v-t);if(d<bd){bd=d;bi=i;}});o.i=bi;o.tx=-o.stops[bi];upd();down=null;});
  o.tick=()=>{if(!DESK()){track.style.transform='';return;}o.x+=(o.tx-o.x)*.12;track.style.transform=`translate3d(${o.x.toFixed(2)}px,0,0)`;};
  o.measure=()=>{measure();upd();};measure();upd();sliders.push(o);}
initSlider('term');addEventListener('resize',()=>sliders.forEach(s=>s.measure()));
(function loop(){sliders.forEach(s=>s.tick());requestAnimationFrame(loop);})();

/* calendar */
const months=[9,10,11];let sel=next||EV[0],mi=Math.max(0,months.indexOf(sel.d.getMonth()));
function renderCal(){const m=months[mi],first=new Date(2026,m,1),n=new Date(2026,m+1,0).getDate(),off=(first.getDay()+6)%7;
  $('#mTitle').textContent=`${m+1} 月`;$('#prevM').classList.toggle('off',mi===0);$('#nextM').classList.toggle('off',mi===months.length-1);
  let h='';for(let i=0;i<off;i++)h+='<div class="day blank"></div>';
  for(let d=1;d<=n;d++){const dt=new Date(2026,m,d),ev=EV.find(e=>+e.d===+dt),c=['day'];if(dt>=T0&&dt<=T1)c.push('in');
    if(ev){c.push('has');if(ev===sel)c.push('sel');h+=`<button type="button" class="${c.join(' ')}" data-t="${+dt}" aria-label="${fmt(dt)} ${ev.title}">${d}</button>`;}else h+=`<div class="${c.join(' ')}">${d}</div>`;}
  $('#days').innerHTML=h;}
function renderDetail(anim){const e=sel,[sc,sl]=status(e);$('#detail').innerHTML=`<span class="stampin">${e.type}</span><div class="num">${String(e.d.getDate()).padStart(2,'0')}</div>${sl?`<span class="chip ${sc}" style="align-self:flex-start">${sl}</span>`:''}<h3 class="t-h3">${e.title}</h3><p class="t-body">${e.d.getMonth()+1} 月，周${wd[e.d.getDay()]} ${e.t}<br>${e.type}，${where(e.place)}</p><p class="t-small">${e.desc}</p>`;
  if(G&&!RM&&anim){gsap.killTweensOf('#detail *');gsap.fromTo('#detail > :not(.stampin)',{opacity:0,y:'.8em'},{opacity:1,y:0,duration:.5,stagger:.05,ease:EN});
    gsap.fromTo('#detail .stampin',{scale:2.4,opacity:0,rotation:-20},{scale:1,opacity:1,rotation:-6,duration:.45,ease:'power4.in',onComplete:()=>gsap.fromTo('#detail',{x:-3},{x:0,duration:.35,ease:'elastic.out(1,.3)'})});}}
$('#days').addEventListener('click',ev=>{const b=ev.target.closest('.day.has');if(!b)return;sel=EV.find(e=>+e.d===+b.dataset.t);$$('.day.has').forEach(x=>x.classList.toggle('sel',x===b));renderDetail(true);});
$('#prevM').onclick=()=>{if(mi>0){mi--;renderCal();}};$('#nextM').onclick=()=>{if(mi<2){mi++;renderCal();}};
renderCal();renderDetail();
$$('[data-tab]').forEach(b=>b.addEventListener('click',()=>{$$('[data-tab]').forEach(x=>x.setAttribute('aria-selected',x===b));$$('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==b.dataset.tab);
  if(G&&!RM)gsap.from(`[data-panel="${b.dataset.tab}"]`,{opacity:0,y:'1em',duration:.5,ease:EN});if(ST)ScrollTrigger.refresh();}));

/* form */
const form=$('#form');
form.addEventListener('submit',e=>{e.preventDefault();
  const R={'f-name':v=>v.trim()?'':'请填写称呼','f-email':v=>/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)?'':'请填写有效的邮箱，例如 name@example.com','f-msg':v=>v.trim().length>=10?'':'请写下合作想法，至少 10 个字'};
  let ok=true;for(const id in R){const el=$('#'+id),m=R[id](el.value);$(`.err[data-for="${id}"]`).textContent=m;el.classList.toggle('invalid',!!m);if(m&&ok){ok=false;el.focus();}}
  const c=$('#f-ok');$('.err[data-for="f-ok"]').textContent=c.checked?'':'请勾选同意后再发送';if(!c.checked)ok=false;if(!ok)return;
  form.innerHTML=`<div class="sent"><h3 class="t-h3">已收到，谢谢</h3><p class="t-body">我们会在 3 个工作日内回复。这是原型演示，信息没有真实发送。</p></div>`;});
$$('input,textarea',form).forEach(el=>el.addEventListener('input',()=>{el.classList.remove('invalid');const er=$(`.err[data-for="${el.id}"]`);if(er)er.textContent='';}));
$('#copyBtn').onclick=async()=>{const b=$('#copyBtn');try{await navigator.clipboard.writeText($('#mail').textContent);b.textContent='已复制';}catch(_){const r=document.createRange();r.selectNodeContents($('#mail'));const s=getSelection();s.removeAllRanges();s.addRange(r);b.textContent='已选中，请手动复制';}setTimeout(()=>b.textContent='复制',1800);};

/* ---------- 地球：按会员设计，海蓝、米色陆地、从墨尔本出发的朱砂虚线 ---------- */
const MEL=[144.96,-37.81];
const CITIES=[[139.69,35.69],[121.47,31.23],[116.4,39.9],[103.82,1.35],[106.85,-6.2],[174.76,-36.85],[-0.13,51.5],[77.2,28.6],[-122.4,37.77]];
(function(){const box=$('#globeBox'),cv=$('#globe');if(!window.d3||!cv.getContext||!window.LAND)return;const ctx=cv.getContext('2d');let S=0,dpr=1;
  const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const C={s1:css('--sea1'),s2:css('--sea2'),s3:css('--sea3'),land:css('--land'),ink:css('--ink'),seal:css('--seal')};
  const proj=d3.geoOrthographic().clipAngle(90).precision(.5),path=d3.geoPath(proj,ctx),grat=d3.geoGraticule10();
  const routes=CITIES.map(c=>{const f=d3.geoInterpolate(MEL,c);return{co:d3.range(0,1.0001,.02).map(f)};});
  const BASE=-138,PHI=8;let lam=BASE,phi=PHI,off=0,drag=null,vis=true,last=performance.now();const start=last;
  const size=()=>{dpr=Math.min(2,devicePixelRatio||1);S=Math.round(box.getBoundingClientRect().width);cv.width=S*dpr;cv.height=S*dpr;proj.scale(S*.47).translate([S/2,S/2]);};
  size();new ResizeObserver(size).observe(box);new IntersectionObserver(es=>vis=es[0].isIntersecting).observe(box);
  function frame(now){requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000);last=now;if(!vis||!S)return;const el=(now-start)/1000;
    if(!drag&&!RM){off+=dt;lam+=((BASE+Math.sin(off*.12)*38)-lam)*Math.min(1,dt*1.2);phi+=(PHI-phi)*Math.min(1,dt*.8);}
    proj.rotate([lam,phi]);const R=S*.47,cx=S/2,cy=S/2;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,S,S);
    let g=ctx.createRadialGradient(cx-R*.35,cy-R*.4,R*.05,cx,cy,R);g.addColorStop(0,C.s1);g.addColorStop(.6,C.s2);g.addColorStop(1,C.s3);
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.fill();
    ctx.beginPath();path(grat);ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=1;ctx.stroke();
    ctx.beginPath();path(window.LAND);ctx.fillStyle=C.land;ctx.fill();ctx.lineWidth=Math.max(1.2,S/420);ctx.strokeStyle=C.ink;ctx.lineJoin='round';ctx.stroke();
    ctx.lineCap='round';
    routes.forEach((r,i)=>{const p=RM?1:Math.min(1,Math.max(0,(el-1.4-i*.18)/1.1));if(p<=0)return;ctx.beginPath();path({type:'LineString',coordinates:r.co.slice(0,Math.max(2,Math.round(p*r.co.length)))});
      ctx.setLineDash([7,6]);ctx.lineDashOffset=RM?0:-el*10;ctx.strokeStyle=C.seal;ctx.lineWidth=Math.max(1.6,S/320);ctx.stroke();ctx.setLineDash([]);});
    if(d3.geoDistance(MEL,[-lam,-phi])<Math.PI/2-.04){const[x,y]=proj(MEL);const r0=Math.max(5,S/80),k=RM?0:(el*7)%16;
      ctx.beginPath();ctx.arc(x,y,r0+k,0,Math.PI*2);ctx.strokeStyle=`rgba(184,65,47,${.9*(1-k/16)})`;ctx.lineWidth=2;ctx.stroke();
      ctx.beginPath();ctx.arc(x,y,r0,0,Math.PI*2);ctx.fillStyle=C.seal;ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#FAF6EC';ctx.stroke();}
    ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.lineWidth=Math.max(2.5,S/180);ctx.strokeStyle=C.ink;ctx.stroke();
    g=ctx.createRadialGradient(cx-R*.45,cy-R*.5,0,cx-R*.45,cy-R*.5,R*.8);g.addColorStop(0,'rgba(255,255,255,.4)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.fill();}
  requestAnimationFrame(frame);
  box.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,l:lam,p:phi};box.setPointerCapture(e.pointerId);});
  box.addEventListener('pointermove',e=>{if(!drag)return;lam=drag.l+(e.clientX-drag.x)*.4;phi=Math.max(-50,Math.min(50,drag.p-(e.clientY-drag.y)*.3));});
  ['pointerup','pointercancel'].forEach(t=>box.addEventListener(t,()=>drag=null));})();




/* ---------- signature hovers ----------
   Everything below animates transforms only, through GSAP, so hovers stay at 60fps. */
const FINE=matchMedia('(hover:hover) and (pointer:fine)').matches;
const MOTION=G&&!RM;
function inkPrep(svg){if(!svg||svg.tagName.toLowerCase()!=='svg')return;$$('path,circle,rect,ellipse,line,polyline',svg).forEach(el=>{if(el.getAttribute('stroke')==='none')return;el.setAttribute('pathLength','1');el.style.strokeDasharray='1 1';el.style.strokeDashoffset='0';});}
function inkDraw(svg,dur=1.2){if(!MOTION||!svg||svg.tagName.toLowerCase()!=='svg')return;gsap.fromTo($$('[pathLength]',svg),{strokeDashoffset:1},{strokeDashoffset:0,duration:dur,stagger:.06,ease:'power2.inOut',overwrite:true});}
function tilt(el,max,target){if(!MOTION||!FINE)return;target=target||el;gsap.set(target,{transformPerspective:1200});
  const rx=gsap.quickTo(target,'rotationX',{duration:.9,ease:'power3'}),ry=gsap.quickTo(target,'rotationY',{duration:.9,ease:'power3'});
  el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;ry((px-.5)*max*2);rx(-(py-.5)*max*2);});
  el.addEventListener('pointerleave',()=>{rx(0);ry(0);});}
const rOf=el=>parseFloat(getComputedStyle(el).getPropertyValue('--r'))||0;
function adoptRotation(el){const r=rOf(el);if(MOTION){el.style.rotate='0deg';gsap.set(el,{rotation:r});}return r;}

/* illustrated cards: ghost character, dot texture, rotating badge, ink redraw, 3D tilt */
$$('.icard').forEach(c=>{const ill=$('.ill',c);
  tilt(c,4);
  if(MOTION&&FINE&&ill){c.addEventListener('pointerenter',()=>gsap.fromTo(ill,{scaleY:1,scaleX:1,transformOrigin:'50% 100%'},{keyframes:{scaleY:[.95,1.04,1],scaleX:[1.03,.99,1]},duration:.8,ease:'sine.out'}));}});
$$('svg.ink').forEach(svg=>{inkPrep(svg);if(MOTION&&ST)ScrollTrigger.create({trigger:svg,start:'top 85%',onEnter:()=>inkDraw(svg,1.6)});});

/* Hover helper: every hover effect is one paused timeline that plays forward on enter and reverses on leave,
   so a quick pass over several items can never leave one stuck half-open. While the page scrolls under a still
   pointer, items the pointer is no longer over are closed too. */
const HOV=new Set();let PX=-1,PY=-1;
addEventListener('pointermove',e=>{PX=e.clientX;PY=e.clientY;},{passive:true});
function hoverTL(el,tl,{onEnter,onLeave,speed=1.35}={}){tl.pause(0);const o={el,on:false,
  open(){if(o.on)return;o.on=true;HOV.add(o);tl.timeScale(1).play();onEnter&&onEnter();},
  close(){if(!o.on)return;o.on=false;HOV.delete(o);tl.timeScale(speed).reverse();onLeave&&onLeave();}};
  if(FINE){el.addEventListener('pointerenter',o.open);el.addEventListener('pointerleave',o.close);}
  else el.addEventListener('click',e=>{if(e.target.closest('a'))return;o.on?o.close():o.open();});
  return o;}
const sweepHover=()=>{if(!HOV.size||PX<0)return;const t=document.elementFromPoint(PX,PY);HOV.forEach(o=>{if(!t||!o.el.contains(t))o.close();});};
if(lenis)lenis.on('scroll',sweepHover);addEventListener('scroll',sweepHover,{passive:true});
document.addEventListener('pointerleave',()=>HOV.forEach(o=>o.close()));

/* 3D books: turn toward the pointer (spine side stays visible), lift; books that carry a reading slip raise it */
function bindBook(b){if(b.dataset.bk3)return;b.dataset.bk3=1;const inn=$('.book__in',b),slip=$('.book__slip',b),sh=$('.book__shadow',b);
  if(!MOTION)return;
  gsap.set(inn,{rotationY:28,rotationX:4});if(!FINE)return;
  const ry=gsap.quickTo(inn,'rotationY',{duration:1,ease:'power3'}),rx=gsap.quickTo(inn,'rotationX',{duration:1,ease:'power3'});
  const tl=gsap.timeline({paused:true}).to(b,{y:-12,duration:.6,ease:'power3.out'},0).to(sh,{scaleX:.85,opacity:.6,duration:.6},0);
  if(slip&&!b.closest('.realshelf'))tl.fromTo(slip,{yPercent:0},{yPercent:-52,duration:.7,ease:'back.out(1.3)'},.05);
  hoverTL(b,tl,{onLeave:()=>{ry(28);rx(4);}});
  if(FINE)b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;ry(18+(1-px)*22);rx(6-(py-.5)*12);});}
$$('[data-book]').forEach(bindBook);

/* postmarks drawn in the same round brush line as the stamp icons */
$$('.stamp__pm').forEach((pm,i)=>{const t=pm.textContent.trim();const pts=[];for(let k=0;k<=40;k++){const a=k/40*Math.PI*2,r=17+Math.sin(a*3+i)*.5+Math.cos(a*5+i*2)*.4;pts.push((22+Math.cos(a)*r).toFixed(1)+' '+(22+Math.sin(a)*r).toFixed(1));}
  const waves=[30,34,38].map(y=>`M40 ${y} q4 -2.6 8 0 t8 0 t8 0 t8 0`).join(' ');
  pm.innerHTML=`<svg viewBox="0 0 76 44" aria-hidden="true"><path d="M${pts.join(' L')}"/><path d="M${pts.map(p=>p.split(' ').map((v,j)=>((+v-22)*.78+22).toFixed(1)).join(' ')).join(' L')}" stroke-width="1"/><text x="22" y="21" text-anchor="middle">${t}</text><text x="22" y="30.5" text-anchor="middle" style="font-size:5.4px;font-weight:700">墨尔本 2026</text><path d="${waves}"/></svg>`;});
/* postage stamps: lift, straighten, postmark lands; all reverses on leave */
$$('.stamp').forEach(st=>{const f=$('.stamp__face',st),pm=$('.stamp__pm',st);const r=adoptRotation(f);
  if(!MOTION)return;gsap.set(pm,{opacity:0,scale:1.9,rotation:-34});
  const tl=gsap.timeline({paused:true})
    .to(f,{y:-16,rotation:0,scale:1.06,duration:.55,ease:'power3.out'},0)
    .fromTo($('.stamp__ic',f),{rotation:-10,scale:.9},{rotation:0,scale:1,duration:.55,ease:'back.out(2)'},0)
    .to(pm,{opacity:.92,scale:1,rotation:-18,duration:.3,ease:'power4.in'},.15)
    .to(f,{x:-3,duration:.06,yoyo:true,repeat:1},.45);
  hoverTL(st,tl,{speed:1.6});});

/* library cards: pulled a little out of the pocket and stamped; slides back on leave */
$$('.lib').forEach(l=>{const c=$('.lib__card',l),pk=$('.lib__pocket',l);const r=adoptRotation(c);
  if(!MOTION||!DESK())return;
  const tl=gsap.timeline({paused:true})
    .to(c,{yPercent:-16,rotation:r*-1.2,duration:.6,ease:'power3.out'},0)
    .to(pk,{y:5,duration:.4,ease:'power2.out'},0);
  hoverTL(l,tl,{speed:1.5});});

/* real paper tags (ChatGPT, see docs): used when assets/img/tags/tag-N.webp exist, else the drawn bookmark stays */
$$('.mark').forEach((m,i)=>{const im=new Image();im.onload=()=>{m.classList.add('has-tag');$('.mark__body',m).style.setProperty('--tag',`url("${im.src}")`);};im.src=`assets/img/tags/tag-${i+1}.webp`;});
/* hanging bookmarks: a damped swing, the tassel lags behind */
$$('.mark').forEach(m=>{const t=$('.mark__tassel',m);const e=document.createElement('i');e.className='mark__eyelet';$('.mark__body',m).before(e);if(!MOTION)return;let busy=false;
  const swing=dir=>{if(busy)return;busy=true;const a=8*dir;
    gsap.to(m,{keyframes:{rotation:[a,-a*.62,a*.36,-a*.18,a*.07,0],easeEach:'sine.inOut'},duration:2.2,onComplete:()=>busy=false});
    gsap.to(t,{keyframes:{rotation:[-a*1.6,a*1.1,-a*.6,a*.3,0],easeEach:'sine.inOut'},duration:2.4,delay:.06});
    gsap.fromTo(m,{y:0},{y:8,duration:.25,yoyo:true,repeat:1,ease:'power2.out'});};
  m.addEventListener('pointerenter',e=>{const r=m.getBoundingClientRect();swing(e.clientX<r.left+r.width/2?-1:1);});
  m.addEventListener('click',()=>swing(1));});

/* envelopes: the letter rises from behind and drops back on leave */
$$('.env').forEach(v=>{const lt=$('.env__letter',v),img=$('.env__img',v);const r=adoptRotation(v);if(!MOTION||!DESK())return;
  const tl=gsap.timeline({paused:true})
    .to(v,{rotation:0,duration:.5,ease:'power3.out'},0)
    .to(lt,{y:()=>-(v.offsetHeight*.9),duration:.65,ease:'back.out(1.3)'},.08)
    .fromTo($('.env__ic',v),{rotation:-16,scale:.7},{rotation:0,scale:1,duration:.5,ease:'back.out(2)'},.3);
  hoverTL(v,tl,{speed:1.6});});

/* polaroids straighten and lift */
$$('.pola').forEach(pl=>{const r=adoptRotation(pl);if(!MOTION||!FINE)return;
  hoverTL(pl,gsap.timeline({paused:true}).to(pl,{rotation:0,scale:1.07,y:-8,zIndex:6,duration:.5,ease:'power3.out'}),{speed:1.3});});

/* HMS-style timeline */
const ILL={house:'home',cat:'cat',calendar:'calendar',mic:'podcast',globe:'globe'};
const HIST=[
  {y:'2025',s:'秋',h:'第一次读书会',p:'几位朋友在家里读沈从文《边城》。没有主持人，也没有讨论提纲，一直聊到很晚。',ill:'house'},
  {y:'2025',s:'冬',h:'有了名字',p:'建立微信群和公众号，取名「莎士比亚的猫」。第一次公开朗读会，来了二十多人。',ill:'cat'},
  {y:'2026',s:'春',h:'以学期为单位读书',p:'第一学期读余华。读书会搬进 Nunawading Community Hub，有了固定的长桌。',ill:'calendar'},
  {y:'2026',s:'冬',h:'第一场线上讲座',p:'读张爱玲《倾城之恋》。悉尼和布里斯班的读者第一次和我们坐在同一张「桌」前。',ill:'mic'},
  {y:'2026',s:'秋',h:'官网上线',p:'第三学期「故乡与远方」开始，同时筹备青少年与长者阅读推广。',ill:'globe'}];
(function(){const ticks=$('#tlTicks');if(!ticks)return;let ti=HIST.length-1;
  ticks.innerHTML=HIST.map((h,i)=>`<button type="button" data-i="${i}">${h.y} ${h.s}</button>`).join('');
  const bs=$$('button',ticks),fill=$('#tlFill'),tx=$('#tlText'),il=$('#tlIll');
  const paint=()=>{const c=b=>b.offsetLeft+b.offsetWidth/2;fill.style.left=c(bs[0])+'px';fill.style.width=(c(bs[ti])-c(bs[0]))+'px';bs.forEach((b,i)=>b.setAttribute('aria-current',i===ti));$('#tlPrev').classList.toggle('off',ti===0);$('#tlNext').classList.toggle('off',ti===HIST.length-1);};
  const fillIn=()=>{const h=HIST[ti];tx.innerHTML=`<span class="when">${h.y}<small style="font-size:.38em;margin-left:.2em">${h.s}</small></span><h3>${h.h}</h3><p>${h.p}</p>`;il.innerHTML=`<img class="sk" src="${SK(ILL[h.ill])}" alt="">`;};
  const show=(i,anim)=>{if(i<0||i>=HIST.length)return;ti=i;paint();
    if(!MOTION||!anim){fillIn();return;}
    gsap.to([tx,il],{opacity:0,y:-14,duration:.22,ease:'power2.in',onComplete:()=>{fillIn();gsap.fromTo(tx.children,{opacity:0,y:18},{opacity:1,y:0,duration:.6,stagger:.06,ease:EN});gsap.set([tx,il],{opacity:1,y:0});gsap.fromTo($('img',il),{y:40,rotation:-14,scale:.7,opacity:0},{y:0,rotation:0,scale:1,opacity:1,duration:1,ease:'elastic.out(1,.6)'});}});};
  bs.forEach((b,i)=>b.addEventListener('click',()=>show(i,true)));$('#tlPrev').onclick=()=>show(ti-1,true);$('#tlNext').onclick=()=>show(ti+1,true);
  addEventListener('resize',paint);show(ti,false);
  window.__tlPaint=paint;})();


/* ---------- 往期活动：学期索引 + 统一的学期档案模板 ----------
   每个学期只填一份 TERMS 数据，页面按同一个模板渲染，内容再多也只显示当前选中的那个学期。 */
const TERMS=[
  {id:'t3',y:2026,n:'第三学期',theme:'故乡与远方',range:'从 10 月 5 日到 12 月 13 日',now:true,books:['hulanhe','eergu'],
   stat:[['6','场活动'],['进行中','学期状态'],['2','本书']],
   recap:'这个学期还在进行。读萧红和迟子建，两位东北女作家，一个写回忆里的小城，一个写森林里一个民族的百年。学期结束后，内容组会把回顾、讨论记录和照片补进这里。',
   hl:['第一次把文学夜和读书会围绕同一个主题来安排','学期末写作分享会，收到的短文有几篇后来在公众号发表，收进了书友作品'],
   links:[['学期预告：故乡与远方','公众号'],['十月读书会回顾','公众号']],
   ev:EV.map(e=>[fmt(e.d),e.type,e.title]),photos:['十月的读书会','春夜朗读','学期末写作分享']},
  {id:'t2',y:2026,n:'第二学期',theme:'张爱玲的城',range:'从 4 月 25 日到 6 月 27 日',books:['qingcheng','jinsuo'],
   stat:[['4','场活动'],['约 120','人次参加'],['31','位新朋友']],
   recap:'集中读张爱玲。第一次办线上公益讲座，悉尼和布里斯班的读者也来了。讨论里争得最久的问题，是白流苏到底赢了没有；读《金锁记》那天，有位书友说曹七巧让她想起了自己的外婆，屋子里安静了很久。',
   hl:['第一场线上公益讲座，悉尼和布里斯班的读者也来了','四场活动约 120 人次参加，三分之一是第一次来','冬夜朗读会上，有书友读了自己写的信'],
   links:[['学期回顾：张爱玲的城','公众号'],['讲座整理：张爱玲与《倾城之恋》','公众号']],
   ev:[['5月9日','线下读书会','《倾城之恋》'],['5月10日','嘉宾讲座','张爱玲与《倾城之恋》'],['6月6日','文学夜','冬夜朗读'],['6月20日','线下读书会','《金锁记》']],
   photos:['第一场线上讲座','冬夜朗读','《金锁记》读书会']},
  {id:'t1',y:2026,n:'第一学期',theme:'从人物出发',range:'从 2 月 14 日到 4 月 18 日',books:['huozhe','xusan'],
   stat:[['4','场活动'],['约 80','人次参加'],['24','位新朋友']],
   recap:'第一次以学期为单位读书，也是读书会搬进 Nunawading Community Hub 的第一个学期。两本余华，从福贵读到许三观。很多人说，这是他们第一次在读书会上哭，也是第一次在读书会上笑出声。',
   hl:['开始以学期为单位读书，节奏固定下来','读书会搬进 Nunawading Community Hub，有了固定的长桌','开学书单交换，每人带一本书来，带另一本书走'],
   links:[['学期回顾：从人物出发','公众号']],
   ev:[['2月21日','线下读书会','《活着》（上）'],['3月7日','文学夜','开学书单交换'],['3月21日','线上讨论','《活着》（下）'],['4月11日','线下读书会','《许三观卖血记》']],
   photos:['搬进新场地','开学书单交换','《活着》读书会']},
  {id:'t0',y:2025,n:'创社学期',theme:'一张长桌',range:'从 9 月到 12 月',books:['biancheng'],
   stat:[['2','场活动'],['约 30','人次参加'],['7','位创社书友']],
   recap:'从几位朋友在客厅里读《边城》开始。那天椅子不够，有人坐在地毯上，一直聊到天黑。后来有了微信群、公众号和「莎士比亚的猫」这个名字，年底办了第一次公开朗读会。',
   hl:['七位朋友在客厅里读完《边城》，有了第一次读书会','建立微信群和公众号，取名「莎士比亚的猫」','年底的第一次公开朗读会，来了二十多人'],
   links:[['我们为什么叫莎士比亚的猫','公众号']],
   ev:[['2025 秋','线下读书会','《边城》'],['2025 冬','文学夜','第一次公开朗读会']],
   photos:['客厅里的第一次','第一次公开朗读会','创社合影']}];
(function(){const idx=$('#tindex'),sh=$('#tsheet');if(!idx||!sh)return;
  const years=[...new Set(TERMS.map(t=>t.y))];
  idx.innerHTML=years.map(y=>`<div class="tindex__yr"><b>${y}</b><div>${TERMS.filter(t=>t.y===y).map(t=>`<button type="button" data-t="${t.id}" aria-pressed="false">${t.n}${t.now?'<small>进行中</small>':''}</button>`).join('')}</div></div>`).join('');
  const bk=c=>BOOKS.find(x=>x[0]===c);
  const tpl=t=>{const i=TERMS.indexOf(t),newer=TERMS[i-1],older=TERMS[i+1];return `
    <header class="ts__head"><div class="stack"><h3 class="t-h2">「${t.theme}」</h3><p class="t-small">${t.y} 年${t.n}${t.range}</p></div>
      <ul class="ts__stat">${t.stat.map(([a,b])=>`<li><b>${a}</b><span>${b}</span></li>`).join('')}</ul></header>
    <div class="ts__body">
      <div class="ts__books">${t.books.map(c=>{const b=bk(c);return bookHTML(c,[`《${b[1]}》`,`${b[3]}<br>${b[4]}`,b[2]],{bk:b[5],title:b[1],alt:`《${b[1]}》封面`});}).join('')}</div>
      <div class="ts__txt"><h4>这个学期</h4><p class="t-body">${t.recap}</p><h4>学期亮点</h4><ol class="hl">${t.hl.map(q=>`<li>${q}</li>`).join('')}</ol></div>
    </div>
    <div class="ts__ev"><h4>活动记录</h4><div class="list">${t.ev.map(l=>`<div class="r"><b>${l[0]}</b><span>${l[2]}</span><span class="m">${l[1]}</span></div>`).join('')}</div></div>
    <div class="ts__ph" aria-label="代表性活动照片">${t.photos.map((c,k)=>`<figure class="ts__photo"><div class="ph"></div><figcaption>${c}</figcaption></figure>`).join('')}</div>
    <div class="ts__links"><h4>相关文章</h4><ul>${t.links.map(([a,b])=>`<li><span>${b}：${a}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M7 17L17 7M9 7h8v8"/></svg></li>`).join('')}</ul></div>
    <div class="ts__nav">${older?`<button type="button" class="ts__go" data-t="${older.id}">← ${older.y} 年${older.n}</button>`:'<span></span>'}${t.now?'<a class="ts__go" href="#events">去看本学期安排 →</a>':newer?`<button type="button" class="ts__go" data-t="${newer.id}">${newer.y} 年${newer.n} →</button>`:''}</div>
    `;};
  let cur=null;
  const show=(id,anim)=>{const t=TERMS.find(x=>x.id===id);if(!t||t===cur)return;cur=t;
    $$('button',idx).forEach(b=>b.setAttribute('aria-pressed',b.dataset.t===id));
    const put=()=>{sh.innerHTML=tpl(t);$$('[data-book]',sh).forEach(bindBook);if(ST)ScrollTrigger.refresh();};
    if(!anim||!MOTION){put();return;}
    gsap.to(sh,{opacity:0,y:-16,duration:.25,ease:'power2.in',onComplete:()=>{put();gsap.fromTo(sh,{opacity:0,y:24},{opacity:1,y:0,duration:.6,ease:EN});
      gsap.fromTo($$('.ts__books .book, .ts__photo',sh),{y:40,opacity:0},{y:0,opacity:1,duration:.7,stagger:.06,ease:'back.out(1.4)',delay:.1});}});};
  const jump=id=>{show(id,true);const top=$('#archive-terms');if(top&&top.getBoundingClientRect().top<0){const y=top.getBoundingClientRect().top+scrollY-90;lenis?lenis.scrollTo(y,{duration:.9}):window.scrollTo({top:y,behavior:'smooth'});}};
  idx.addEventListener('click',e=>{const b=e.target.closest('button[data-t]');if(b)show(b.dataset.t,true);});
  sh.addEventListener('click',e=>{const b=e.target.closest('button[data-t]');if(b)jump(b.dataset.t);});
  show('t2',false);})();

/* ---------- 关于我们：五个活动模块，书脊式展开 ---------- */
(function(){const box=$('#spines');if(!box)return;const sps=$$('.sp',box);
  const open=sp=>{sps.forEach(x=>{const on=x===sp;x.dataset.open=String(on);$('.sp__tab',x).setAttribute('aria-expanded',on);});
    if(MOTION){gsap.fromTo($$('.sp__txt > *, .sp__ic',sp),{opacity:0,y:18},{opacity:1,y:0,duration:.55,stagger:.05,delay:.25,ease:EN});}
    if(ST)setTimeout(()=>ScrollTrigger.refresh(),700);};
  sps.forEach(sp=>$('.sp__tab',sp).addEventListener('click',()=>{if(sp.dataset.open==='true'&&DESK())return;open(sp.dataset.open==='true'?null:sp);}));})();

/* ---------- 书友作品：数据（示例） ----------
   只收已经在公众号发表的作品。上线后每一篇是 WordPress 后台里的一篇「作品」，字段与下面一一对应（见 docs/WordPress-书友作品.md）：
   title 篇名，author 署名，genre 栏目，date 公众号发表日期，url 公众号原文链接，intro 导语，note 编辑手记，
   text 正文（段落之间空一行）。正文不用自己分页，网页按稿纸格数自动分页，字多就多几页。
   likes 和 comments 是原型里的示例数字和留言；上线后点赞数和留言由 WordPress 自己记录，不用手填。
   原文链接现在都指向公众号首页，上线时换成每篇文章的地址。 */
const WX='https://mp.weixin.qq.com/';
const WORKS=[
  {id:'tan',title:'外婆的腌菜坛',author:'林间',genre:'散文',date:D(2026,10,20),url:WX,likes:36,
   comments:[['小周','2026-10-21','读到压了一本旧字典那里笑出声，笑完又有点想家。'],['王阿姨','2026-10-22','我们家以前也是这样腌雪里蕻的。坛子要晒一晒，这句话我妈也说过。'],['Kelvin','2026-10-24','最后一句「太咸」，比前面所有的想念都重。']],
  
   intro:'读完《呼兰河传》那一周，林间在读书会上说起了外婆的阳台。萧红写祖父的后园，她写外婆的坛子，写一个人怎样把日子腌进时间里。这篇在公众号发出后，留言区里好几位书友说起了自家的坛子。',
   note:'编辑手记：文章不急着抒情。坛子、青石、晒太阳的秋天，事情一件一件摆出来，想念就在里面了。',
   text:`外婆的腌菜坛子摆在阳台最里面，盖子上压着一块青石。每年入秋，她都要把坛子搬出来晒一晒，说坛子也要换口气。

我到墨尔本的第三年，在超市里看见一只差不多的坛子，站了很久，没有买。回家路上才想明白，想念一个人，是想念她做事情的样子。

青菜要先晾一天，叶子软了才好揉。盐撒下去，手心来回搓，菜汁顺着指缝往下滴，满屋子生涩的青气。外婆不许我碰，说小孩子手热，菜会酸。只好蹲在门槛上看，看她把揉好的菜一把一把塞进坛子，塞得很紧，最后压上那块青石。

开坛总在冬至前后。盖子一揭，酸香先冲出来，然后才看见菜，颜色由青转黄，像旧书的纸页。外婆夹一筷子放在白粥上，叫我先尝。那几年冬天冷，屋里没有暖气，一碗粥喝下去，额头冒出细细的汗。

今年三月，墨尔本入秋。阳台的栏杆上晾着一棵切开的大白菜，学着外婆的样子撒盐、揉搓。没有坛子，用的是一只玻璃罐，也没有青石，压了一本旧字典。

等了二十天，打开，太咸。还是一顿一顿吃完了，就着白米饭。`},
  {id:'liusu',title:'白流苏的那一局',author:'阿梓',genre:'读后感',date:D(2026,8,2),url:WX,likes:27,
   comments:[['老秦','2026-08-03','那天下午我是说她赢了的那一边，读完你这篇，又不确定了。']],
  
   intro:'第二学期读张爱玲，读书会上争得最久的问题，阿梓回家写成了这篇。',note:'编辑手记：一个问题追到底，没有绕开难处。',
   text:`读到最后一页，我一直在想白流苏是不是赢了。一座城的陷落成全了她，可她要的到底是什么？

范柳原说，这堵墙到了地老天荒那一天，也许还剩下一点真心。我读到这里，心里一紧。她赢下的是一张婚书，还是一个可以不再被人议论的位置？

读书会那天下午，有人说她赢了，有人说她输得很体面。我想，她只是在一座会倒的城里，找到了一块暂时站得住的地方。`},
  {id:'dongzhi',title:'冬至在墨尔本',author:'老秦',genre:'散文',date:D(2026,6,28),url:WX,likes:22,
   comments:[['小舟','2026-06-29','包得像饺子的那个是我。'],['阿梓','2026-06-30','最后那一下安静，写得很准。']],
  
   intro:'南半球的冬至在六月。老秦写的是几个人凑在一起包汤圆的那个晚上。',note:'编辑手记：节日写得很轻，人写得很暖。',
   text:`墨尔本的冬至在六月，菜市场里没有卖汤圆的。我们几个人凑在一起，用糯米粉和黑芝麻包了一锅。

有人包得圆，有人包得像饺子，煮出来破了一半。没有人在意，热汤端上桌，窗外下着小雨，屋里很暖。

吃到一半，有人说，家里这会儿是夏天了。大家都笑了，又都不说话了。`},
  {id:'dukou',title:'渡口',author:'小舟',genre:'诗',date:D(2026,4,12),url:WX,likes:15,
   comments:[],
  
   intro:'读完《边城》，小舟写了这首短诗。',note:'编辑手记：短，留白多，读完会想起翠翠。',
   text:`翠翠站在河边，
等一个不说归期的人。

一百年后我在南半球，
也学会了把渡口留着。

船来不来，
水一直在流。`},
  {id:'fugui',title:'福贵的牛',author:'周周',genre:'读后感',date:D(2026,3,22),url:WX,likes:31,
   comments:[['小周','2026-03-23','主持人那个问题，我到现在也没想好。']],
  
   intro:'第一学期读《活着》，周周记下了读到老牛那一页时的心情。',note:'编辑手记：从一个小细节进去，写出了整本书的分量。',
   text:`福贵给老牛也取名叫福贵。读到这里我笑了一下，接着就说不出地难过。

一个人把自己的名字分给一头牛，是想让另一个自己替他活下去，还是想让自己也像牛一样，低着头，一直往前走？

读书会结束的时候，主持人问我们，活着为了什么。我没有回答，回家的路上一直在想那头牛。`},
  {id:'xiaohong',title:'地铁上的萧红',author:'南方',genre:'小说片段',date:D(2026,10,9),url:WX,likes:18,
   comments:[['阿梓','2026-10-11','等下一章。那个男孩问的，我也想知道。']],
  
   intro:'一篇还在写的小说，南方先在公众号发了开头的一章。',note:'编辑手记：把萧红放进今天的墨尔本，想法很新，节奏也稳。',
   text:`她在弗林德斯街站换车的时候，书包里那本《呼兰河传》掉了出来，正好翻在祖父那一页。

一个穿校服的男孩帮她捡起来，看了一眼封面，问她这是什么书。她想了想，说，是一个人写她小时候的家。

车来了，男孩上车前回头说，那她后来回去了吗。她没来得及回答，车门就关上了。`}];
WORKS.sort((a,b)=>b.date-a.date);

/* ---------- 稿纸：把文字排进方格稿纸 ----------
   规矩和真的稿纸一样：一格一个字，段首空两格，标点不放在行首（挤进上一行的最后一格）。
   每页固定 15 列 × 10 行 = 150 格，电脑和手机一样，所以每一页的字数是固定的。 */
const MS_COLS=15,MS_ROWS=10;
const PUNCT='，。、；：？！」』）》…';
function msLines(text,cols){const lines=[];
  text.replace(/\r/g,'').split(/\n\s*\n/).forEach(par=>{par.split('\n').forEach((ln,k)=>{
    const cells=k===0&&!/^\s/.test(ln)?['','']:[];
    [...ln.trim()].forEach(ch=>{if(PUNCT.includes(ch)&&cells.length%cols===0&&cells.length){cells[cells.length-1]+=ch;}else cells.push(ch);});
    for(let i=0;i<cells.length;i+=cols)lines.push(cells.slice(i,i+cols));if(!cells.length)lines.push([]);});});
  return lines;}
function msPages(text){const L=msLines(text,MS_COLS),out=[];for(let i=0;i<L.length;i+=MS_ROWS)out.push(L.slice(i,i+MS_ROWS));return out.length?out:[[]];}
function msRender(el,lines,cols,rows){el.style.setProperty('--cols',cols);let h='';
  for(let r=0;r<rows;r++){const ln=lines[r]||[];for(let c=0;c<cols;c++){const ch=ln[c]||'';h+=`<span${ch.length>1?' class="sq"':''}>${ch}</span>`;}}
  el.innerHTML=h;}
const plain=t=>t.replace(/\s+/g,'');
const ymd=d=>`${d.getFullYear()} 年 ${d.getMonth()+1} 月 ${d.getDate()} 日`;
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* 书友作品页：点赞和留言（原型演示）
   点赞记在这台设备的浏览器里，刷新后还在；留言提交后显示为「等待审核」，只有自己看得见，不会真正发送。
   上线后由 WordPress 处理，做法见 docs/书友作品-点赞与评论.md */
const LIKED=(()=>{let set=new Set();try{set=new Set(JSON.parse(localStorage.getItem('sc-liked')||'[]'));}catch(_){}
  return {has:id=>set.has(id),toggle:id=>{set.has(id)?set.delete(id):set.add(id);try{localStorage.setItem('sc-liked',JSON.stringify([...set]));}catch(_){}return set.has(id);}};})();
const PENDING={};
const likeCount=p=>p.likes+(LIKED.has(p.id)?1:0);
const cmCount=p=>p.comments.length;

/* 书友作品页：稿纸阅读器。翻页时整页一起换，不逐字出现 */
const READER=(function(){const box=$('#msPages');if(!box)return null;const no=$('#msNo'),pv=$('#msPrev'),nx=$('#msNext');
  let piece=null,pages=[],i=0,busy=false;
  const sheet=k=>{const d=document.createElement('div');d.className='ms';msRender(d,pages[k],MS_COLS,MS_ROWS);return d;};
  const ui=()=>{no.textContent=`第 ${i+1} 页，共 ${pages.length} 页`;pv.classList.toggle('off',i===0);nx.classList.toggle('off',i>=pages.length-1);};
  const meta=()=>{$('#rdTitle').textContent=piece.title;$('#rdBy').innerHTML=`<b>${piece.author}</b><span>${piece.genre}，${plain(piece.text).length} 字，${ymd(piece.date)}发表于公众号</span>`;
    $('#rdIntro').textContent=piece.intro;$('#rdNote').textContent=piece.note;$('#rdSrc').href=piece.url;
    $('#reader').setAttribute('aria-label',`《${piece.title}》的稿纸，共 ${pages.length} 页`);REACT.show(piece);COMMENTS.show(piece);
    $$('#mss .mscard').forEach(c=>c.toggleAttribute('aria-current',c.dataset.id===piece.id));};
  const go=d=>{const j=i+d;if(j<0||j>=pages.length||busy)return;const old=box.firstElementChild,nw=sheet(j);i=j;ui();
    if(!MOTION){box.replaceChildren(nw);return;}busy=true;box.appendChild(nw);
    gsap.set(nw,{position:'absolute',inset:0,xPercent:d*12,opacity:0});
    gsap.to(old,{xPercent:d*-12,opacity:0,duration:.45,ease:'power2.inOut'});
    gsap.to(nw,{xPercent:0,opacity:1,duration:.45,ease:'power2.inOut',onComplete:()=>{old.remove();gsap.set(nw,{clearProps:'all'});busy=false;}});};
  const load=(p,anim)=>{piece=p;pages=msPages(p.text);i=0;ui();
    const put=()=>{box.replaceChildren(sheet(0));meta();};
    if(!anim||!MOTION){put();return;}
    gsap.to('#reader,#readerTxt',{opacity:0,y:12,duration:.25,ease:'power2.in',onComplete:()=>{put();gsap.to('#reader,#readerTxt',{opacity:1,y:0,duration:.5,ease:EN});}});};
  pv.addEventListener('click',()=>go(-1));nx.addEventListener('click',()=>go(1));
  let sx=null;box.addEventListener('pointerdown',e=>{sx=e.clientX;});box.addEventListener('pointerup',e=>{if(sx===null)return;const dx=e.clientX-sx;sx=null;if(Math.abs(dx)>40)go(dx<0?1:-1);});
  return {load,get piece(){return piece;}};})();

/* 喜欢：点一下加一，再点一下取消。心形填满时轻轻跳一下 */
const REACT=(function(){const btn=$('#likeBtn');let piece=null;
  const paint=()=>{const on=LIKED.has(piece.id);btn.setAttribute('aria-pressed',on);$('#likeTxt').textContent=on?'已喜欢':'喜欢';$('#likeN').textContent=likeCount(piece);
    btn.setAttribute('aria-label',`${on?'取消喜欢':'喜欢'}《${piece.title}》，现在有 ${likeCount(piece)} 人喜欢`);
    $('#cmJump').textContent=`${cmCount(piece)} 条留言`;};
  if(btn)btn.addEventListener('click',()=>{if(!piece)return;const on=LIKED.toggle(piece.id);paint();cardCounts(piece);
    if(on&&MOTION)gsap.fromTo($('svg',btn),{scale:.6},{scale:1,duration:.6,ease:'elastic.out(1,.4)'});});
  return {show:p=>{piece=p;if(btn)paint();}};})();

/* 留言：已通过的按时间排，自己刚提交的显示「等待审核」 */
const COMMENTS=(function(){const list=$('#cmList'),form=$('#cmForm');let piece=null;
  const date=t=>{const[y,m,d]=t.split('-').map(Number);return `${y} 年 ${m} 月 ${d} 日`;};
  const render=()=>{const ok=piece.comments,mine=PENDING[piece.id]||[];
    $('#cmHead').innerHTML=ok.length?`《${esc(piece.title)}》下有 ${ok.length} 条留言`:`《${esc(piece.title)}》下还没有留言`;
    list.innerHTML=ok.map(([n,t,x])=>`<li><div class="cm__who"><b>${esc(n)}</b><span>${date(t)}</span></div><p>${esc(x)}</p></li>`).join('')
      +mine.map(([n,x])=>`<li class="pending"><div class="cm__who"><b>${esc(n)}</b><span class="chip">等待审核</span></div><p>${esc(x)}</p></li>`).join('')
      +(ok.length||mine.length?'':`<li class="cm__empty"><p>第一个留言的人，往往会让后面的人更敢说。</p></li>`);};
  if(form){form.addEventListener('submit',e=>{e.preventDefault();
    const R={'c-name':v=>v.trim()?'':'请留一个称呼','c-email':v=>/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)?'':'请填写有效的邮箱，只用来回复你','c-msg':v=>v.trim().length>=2?'':'请写下你想说的话'};
    let ok=true;for(const id in R){const el=$('#'+id),m=R[id](el.value);$(`.err[data-for="${id}"]`).textContent=m;el.classList.toggle('invalid',!!m);if(m&&ok){ok=false;el.focus();}}
    if(!ok)return;(PENDING[piece.id]=PENDING[piece.id]||[]).push([$('#c-name').value.trim(),$('#c-msg').value.trim()]);
    $('#c-msg').value='';render();let n=$('.cm__sent',form);if(!n){n=document.createElement('p');n.className='cm__sent t-small';form.appendChild(n);}
    n.textContent='已收到。编辑看过后，你的留言会显示在这里。这是原型演示，留言没有真正发送。';
    const li=list.lastElementChild;if(li&&MOTION)gsap.from(li,{opacity:0,y:12,duration:.5,ease:EN});});
    $$('input,textarea',form).forEach(el=>el.addEventListener('input',()=>{el.classList.remove('invalid');const er=$(`.err[data-for="${el.id}"]`);if(er)er.textContent='';}));}
  return {show:p=>{piece=p;if(list)render();const n=form&&$('.cm__sent',form);if(n)n.remove();}};})();

/* 作品列表：每篇的开头，点开在上面的稿纸里读全文 */
function cardCounts(p){const c=$(`#mss .mscard[data-id="${p.id}"] .mscard__n`);if(c)c.textContent=`${likeCount(p)} 人喜欢，${cmCount(p)} 条留言`;}
(function(){const box=$('#mss');if(!box)return;
  box.innerHTML=WORKS.map(p=>`<button type="button" class="mscard" data-id="${p.id}"><span class="mspaper"><span class="ms"></span></span><span class="mscard__meta"><b>《${p.title}》</b><span>${p.author}的${p.genre}，${ymd(p.date)}发表</span><span class="mscard__n">${likeCount(p)} 人喜欢，${cmCount(p)} 条留言</span></span></button>`).join('');
  $$('.mscard',box).forEach((c,k)=>msRender($('.ms',c),msLines(WORKS[k].text,12).slice(0,4),12,4));
  box.addEventListener('click',e=>{const c=e.target.closest('.mscard');if(!c||!READER)return;READER.load(WORKS.find(p=>p.id===c.dataset.id),true);
    const y=$('#reader').getBoundingClientRect().top+scrollY-120;lenis?lenis.scrollTo(y,{duration:1}):window.scrollTo({top:y,behavior:'smooth'});});})();
if(READER)READER.load(WORKS[0],false);
$$('.mscard').forEach(c=>{if(!MOTION||!FINE)return;hoverTL(c,gsap.timeline({paused:true}).to($('.mspaper',c),{y:-8,duration:.5,ease:'power3.out'}),{speed:1.3});});

/* 书友说：一次读一段，点名字切换；引号和底色跟着人一起换 */
(function(){const box=$('#story');if(!box)return;const band=box.closest('.band'),mark=$('#storyMark'),qs=$$('blockquote',box),bs=$$('.story__who button',box);let cur=0;
  const paint=b=>{band.style.setProperty('--bb',b.dataset.bg);mark.style.color=b.dataset.q;};paint(bs[0]);
  const show=i=>{if(i===cur)return;const a=qs[cur],nb=qs[i],btn=bs[i];cur=i;bs.forEach(x=>x.setAttribute('aria-selected',+x.dataset.i===i));
    if(!MOTION){a.hidden=true;nb.hidden=false;paint(btn);return;}
    gsap.to(band,{'--bb':btn.dataset.bg,duration:.7,ease:'power2.inOut'});
    gsap.timeline().to(mark,{rotation:-25,scale:.4,opacity:0,duration:.25,ease:'power2.in'}).set(mark,{color:btn.dataset.q}).to(mark,{rotation:0,scale:1,opacity:.85,duration:.7,ease:'elastic.out(1,.55)'});
    gsap.to(a,{opacity:0,y:-12,duration:.25,ease:'power2.in',onComplete:()=>{a.hidden=true;nb.hidden=false;gsap.fromTo(nb,{opacity:0,y:16},{opacity:1,y:0,duration:.6,ease:EN});}});};
  bs.forEach(b=>b.addEventListener('click',()=>show(+b.dataset.i)));})();

/* 关于我们：组织信息公布倒计时（11 月 15 日） */
(function(){const el=$('#orgDays');if(!el)return;const d=Math.ceil((D(2026,11,15)-today)/864e5);
  if(d>0)el.textContent=d;else{$('#orgSoon').hidden=true;}})();

/* The sleeping cat, alive in place: tools/cat_rig.py cuts the still into body, head, two ears and the tail, plus a
   strip of head frames for a yawn (assets/js/cat-rig.js). A canvas puts them back together every frame: the body
   breathes, the tail bends and sways, an ear twitches now and then, and every so often the cat opens its eyes, yawns
   and goes back to sleep. Body and head masks add up to one, so they are drawn additively and meet without a seam. */
(function(){const cat=$('#cat'),box=$('#catSeq'),R=window.CAT_RIG;if(!cat||!box||!R)return;
  const PR=40,PT=24,W=R.w+PR,H=R.h+PT;
  const cv=document.createElement('canvas');cv.width=W;cv.height=H;box.appendChild(cv);const ctx=cv.getContext('2d');
  // the tail is bent row by row on its own canvas, at 1:1, so the breathing scale can't open gaps between the rows
  const[tx,ty,tw,th]=R.tail,TM=24,tc=document.createElement('canvas');tc.width=tw+TM*2;tc.height=th;const tctx=tc.getContext('2d');
  // every picture must match the sizes in cat-rig.js; a stale cached copy is fetched again once, and if it still
  // doesn't match the canvas stays empty and the plain fallback cat shows instead of a wrongly assembled one
  const im={},want=k=>k==='yawn'?R.yawn.cols*R.yawn.cw:R[k][2];let left=0;
  Object.entries(R.src).forEach(([k,src])=>{left++;const i=new Image();let retried=false;
    i.onload=()=>{if(i.naturalWidth!==want(k)){if(retried){left=-1;return;}retried=true;i.src=src+(src.includes('?')?'&':'?')+'r='+Date.now();return;}
      if(--left===0)ready();};
    i.src=src;im[k]=i;});
  const TAU=Math.PI*2,rnd=(a,b)=>a+Math.random()*(b-a),Y=R.yawn,YT=Y.seq.reduce((s,x)=>s+x[1],0);
  let flick=-99,ear1=-99,ear2=-99,yawn=-99,nFlick=rnd(3,6),nEar=rnd(3,6),nYawn=rnd(6,9);
  const earAng=tau=>tau<0||tau>1.4?0:.1*Math.exp(-tau/.28)*Math.sin(TAU*tau/.26);
  function bendTail(t){tctx.clearRect(0,0,tc.width,th);const ft=t-flick;
    for(let r=0;r<th;r++){const s=r/th,k=Math.pow(s,1.7);
      let off=k*(5*Math.sin(TAU*t/4.6-1.4*s)+1.5*Math.sin(TAU*t/2.1-2*s));
      if(ft>=0&&ft<2.6)off+=k*13*Math.exp(-ft/.7)*Math.sin(TAU*ft/.9-2.6*s);
      tctx.drawImage(im.tail,0,r,tw,1,TM+off,r,tw,1);}}
  function yawnCell(t){let u=t-yawn;if(u<0||u>=YT)return-1;for(const[c,d]of Y.seq){if(u<d)return c;u-=d;}return-1;}
  function draw(t){bendTail(t);
    ctx.clearRect(0,0,W,H);ctx.save();ctx.translate(0,PT);
    const br=Math.sin(TAU*t/3.8);ctx.translate(R.w*.55,R.h);ctx.scale(1-.003*br,1+.013*br);ctx.translate(-R.w*.55,-R.h);
    const[bx,by]=R.body;ctx.drawImage(im.body,bx,by);
    const yc=yawnCell(t);ctx.globalCompositeOperation='lighter';
    if(yc>=0)ctx.drawImage(im.yawn,(yc%Y.cols)*Y.cw,Math.floor(yc/Y.cols)*Y.ch,Y.cw,Y.ch,Y.x,Y.y,Y.cw,Y.ch);
    else{const[hx,hy]=R.head;ctx.drawImage(im.head,hx,hy);}
    ctx.globalCompositeOperation='source-over';
    if(yc<0)[['ear1',ear1,1],['ear2',ear2,-1]].forEach(([k,t0,dir])=>{const[x,y,w,h,[px,py]]=R[k],a=earAng(t-t0)*dir;
      if(!a){ctx.drawImage(im[k],x,y,w,h);return;}ctx.save();ctx.translate(px,py);ctx.rotate(a);ctx.translate(-px,-py);ctx.drawImage(im[k],x,y,w,h);ctx.restore();});
    ctx.drawImage(tc,tx-TM,ty);
    ctx.restore();}
  function ready(){cat.classList.add('has-seq');draw(0);if(!MOTION)return;
    let vis=true,t=0,last=performance.now();
    new IntersectionObserver(es=>{vis=es[0].isIntersecting;}).observe(cat);
    const busy=()=>t-yawn<YT+.3;
    const tick=now=>{requestAnimationFrame(tick);const dt=Math.min(.1,(now-last)/1000);last=now;if(!vis||document.hidden)return;t+=dt;
      if(t>nFlick){flick=t;nFlick=t+rnd(4,9);}
      if(t>nEar){if(!busy()){const r=Math.random();if(r<.5)ear1=t;else if(r<.85)ear2=t;else{ear1=t;ear2=t+.12;}}nEar=t+rnd(4,9);}
      if(t>nYawn&&t-Math.max(ear1,ear2)>1.5){yawn=t;nYawn=t+YT+rnd(9,15);}
      draw(t);};
    requestAnimationFrame(tick);}
  cat._rig={draw,set:o=>{if('flick'in o)flick=o.flick;if('ear1'in o)ear1=o.ear1;if('ear2'in o)ear2=o.ear2;if('yawn'in o)yawn=o.yawn;}};   // for checking single moves
})();

/* scroll animations */
let ctxPage=null;
function rise(els,trig){els=els.filter(Boolean);trig=typeof trig==='string'?$(trig):(trig||els[0]);
  els.forEach(e=>{e.style.transition='';e.style.translate='';e.style.opacity='';});
  if(!trig||trig.getBoundingClientRect().top<innerHeight*.88)return;
  els.forEach(e=>{e.style.transition='none';e.style.translate='0 2.5em';e.style.opacity='0';});
  ScrollTrigger.create({trigger:trig,start:'top 90%',once:true,onEnter:()=>els.forEach((e,i)=>{e.style.transition=`translate .9s cubic-bezier(.2,.8,.2,1) ${i*.06}s, opacity .6s ease ${i*.06}s, transform .5s var(--ease)`;e.style.translate='0 0';e.style.opacity='1';setTimeout(()=>{e.style.transition='';e.style.translate='';e.style.opacity='';},1400+i*60);})});}
function pageAnimations(page){if(!G||!ST||RM)return;ctxPage&&ctxPage.revert();
  ctxPage=gsap.context(()=>{
    $$('[data-split]',page).forEach(h=>{const ch=splitChars(h);gsap.fromTo(ch,{yPercent:30,opacity:0},{yPercent:0,opacity:1,duration:.7,stagger:.04,ease:EN,scrollTrigger:{trigger:h,start:'top 88%',once:true}});});
    if(page.dataset.page==='home')home(page);
    $$('.blk,.notice,.wx',page).forEach(b=>rise([...b.children],b));
    [['.icards','.icard'],['.ideas','li'],['.story__who','li'],['.cols','.col4'],['.figs','li'],['.mss','.mscard'],['.orgfig','li'],['.slip ol','li'],['.stamps','.stamp'],['.libs','.lib'],['.marks','.mark'],['.envs','.env'],['.clock','li'],['.flow','li'],['.amp',':scope > *'],['.qs','li'],['.stats',':scope > div'],['.logos','.logo-c'],['.realshelf','.book']].forEach(([w,c])=>$$(w,page).forEach(el=>rise($$(c,el),el)));
    $$('.bfeat,.tfeat,.letter,.phone,.polas,.tl,.more,.spines,.dossier,.tindex,.feature,.tease,.strip,.story__q',page).forEach(el=>rise([el],el));
    $$('.stats b[data-count],.figs b',page).forEach(b=>{const v=+b.dataset.count,o={n:v>1000?v-25:0};ScrollTrigger.create({trigger:b,start:'top 90%',once:true,onEnter:()=>gsap.to(o,{n:v,duration:1.6,ease:'power3.out',onUpdate:()=>b.textContent=Math.round(o.n)})});});
    $$('[data-manifesto]',page).forEach(m=>{const ph=$$('.ph',m);ScrollTrigger.create({trigger:m,start:'top 80%',end:'bottom 45%',scrub:true,onUpdate:st=>{const k=Math.round(st.progress*ph.length);ph.forEach((p,i)=>p.classList.toggle('dim',i>=k));}});});
  },page);}
function home(page){
  const bind=!page.dataset.bound;page.dataset.bound=1;
  rise($$('#termTrack .ecard'),'#termTrack');
  gsap.to('#globeBox',{yPercent:8,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
}
/* accordions (all pages) */
/* FAQ: the answer box grows to its measured height while the text fades up a beat later; clicks mid-way reverse smoothly */
$$('.acc details').forEach(d=>{const s=$('summary',d),a=$('.ans',d);if(!a)return;
  const inn=document.createElement('div');inn.className='ans__in';while(a.firstChild)inn.appendChild(a.firstChild);a.appendChild(inn);
  let open=d.open;
  s.addEventListener('click',e=>{if(!G||RM)return;e.preventDefault();gsap.killTweensOf([a,inn]);
    const from=d.open?a.offsetHeight:0;
    if(open){open=false;d.classList.add('closing');
      gsap.to(inn,{opacity:0,y:-6,duration:.28,ease:'power2.in'});
      gsap.fromTo(a,{height:from},{height:0,duration:.5,ease:'power3.inOut',onComplete:()=>{d.open=false;d.classList.remove('closing');gsap.set([a,inn],{clearProps:'height,opacity,transform'});ST&&ScrollTrigger.refresh();}});}
    else{open=true;d.classList.remove('closing');d.open=true;
      gsap.fromTo(a,{height:from},{height:inn.offsetHeight,duration:.6,ease:'power3.inOut',onComplete:()=>{gsap.set(a,{clearProps:'height'});ST&&ScrollTrigger.refresh();}});
      gsap.fromTo(inn,{opacity:0,y:12},{opacity:1,y:0,duration:.5,delay:.12,ease:'power2.out'});}});});

/* header + menu */
const hdr=$('#hdr');let lastY=0,peek=false;
let hid=false;const setHid=h=>{if(h===hid||busy)return;hid=h;hdr.classList.toggle('away',h);if(G)gsap.to(hdr,{yPercent:h?-130:0,duration:.55,ease:EN,overwrite:'auto'});else hdr.style.transform=h?'translateY(-130%)':'';};
const onS=y=>{hdr.dataset.scrolled=String(y>50);if(Math.abs(y-lastY)>2)setHid(y>lastY&&y>160&&!peek);hdr.classList.toggle('solid',y>160);lastY=y;};
addEventListener('pointermove',e=>{const n=e.clientY<110;if(n!==peek){peek=n;if(n)setHid(false);}},{passive:true});
hdr.addEventListener('focusin',()=>setHid(false));
if(lenis)lenis.on('scroll',({scroll})=>onS(scroll));else addEventListener('scroll',()=>onS(scrollY),{passive:true});
const menu=$('#menu'),mb=$('#menuBtn');
function setMenu(o){menu.classList.toggle('open',o);menu.setAttribute('aria-hidden',!o);mb.setAttribute('aria-expanded',o);if(lenis)o?lenis.stop():lenis.start();}
mb.onclick=()=>setMenu(true);$('#menuX').onclick=()=>setMenu(false);addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false);});

/* page transition */
const trPath=$('#trPath'),trLogo=$('#trLogo');
const routes=['home','about','events','archive','works','join','partner','privacy'];let cur=null,busy=false;
function showPage(r){$$('.page').forEach(p=>p.classList.toggle('on',p.dataset.page===r));cur=r;
  $$('#nav [data-r]').forEach(a=>a.dataset.r===r&&!a.classList.contains('btn')?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));
  const page=$(`[data-page="${r}"]`);
  $('#main').classList.add('ready');toTop();initButtons(page);initButtons(hdr);sliders.forEach(s=>s.measure());
  requestAnimationFrame(()=>{window.__tlPaint&&window.__tlPaint();if(ST)ScrollTrigger.refresh();pageAnimations(page);if(ST)ScrollTrigger.refresh();});return page;}
function intro(page,tl,at){const it=$('[data-intro]',page);if(!it)return;
  const bg=$('[data-intro-bg]',it),title=$('[data-intro-title]',it),paras=$$('[data-intro-para]',it),btn=$('[data-intro-btn]',it),vis=$('[data-intro-visual]',it),content=$('[data-intro-content]',page),ch=splitChars(title),cat=$('.cat',it);
  if(DESK())tl.set(bg,{clipPath:'ellipse(20% 0% at 100% 100%)'},0);
  tl.set(ch,{yPercent:40,opacity:0},0).set(paras,{opacity:0,y:'-.75em'},0);
  if(cat)tl.set(cat,{opacity:0,y:'-1.2em'},0);
  if(btn)tl.set(btn,{opacity:0,y:'-.75em'},0);if(vis)tl.set(vis,{opacity:0,y:'4em',rotate:-20},0);if(content)tl.set(content,{y:'5em',opacity:0},0);
  if(DESK())tl.to(bg,{clipPath:'ellipse(150% 130% at 100% 100%)',duration:1.1,delay:.2,ease:'circ.out'},at);
  tl.to(ch,{yPercent:0,opacity:1,duration:.8,stagger:.06,delay:.25,ease:EN},at);
  if(cat)tl.to(cat,{opacity:1,y:0,duration:.9,delay:1,ease:'bounce.out'},at);
  tl.to(paras,{opacity:1,y:0,duration:.35,delay:.5,ease:EN},at);if(btn)tl.to(btn,{opacity:1,y:0,duration:.35,delay:.575,ease:EN},at);
  if(vis)tl.to(vis,{opacity:1,y:0,rotate:0,duration:1,delay:.5,ease:'elastic.out(1,0.8)'},at);if(content)tl.to(content,{y:0,opacity:1,duration:.6,delay:.35,ease:EN},at);}
function leave(){const tl=gsap.timeline();tl.set(trLogo,{scale:0,rotate:-64,autoAlpha:0}).set(trPath,{strokeWidth:'8%',drawSVG:'0% 0%'});
  /* 落笔时笔刷的粗细：在两段笔画快要合上的宽度附近加快通过，避免中间夹出细缝 */
  tl.to(trPath,{keyframes:{'15%':{strokeWidth:'8%'},'36%':{strokeWidth:'16%',ease:'none'},'44%':{strokeWidth:'38%',ease:'none'},'66%':{strokeWidth:'46%',ease:'none'},'72%':{strokeWidth:'64%',ease:'none'},'90%':{drawSVG:'0% 100%'},'100%':{strokeWidth:'70%',ease:'none'}},duration:1.25},'s');
  tl.to(trLogo,{scale:1,rotate:0,autoAlpha:1,delay:.5,duration:.65,ease:'elastic.out(1,0.72)'},'s');return tl;}
function enter(page){const tl=gsap.timeline();tl.set(trPath,{drawSVG:'0% 100%',strokeWidth:'70%'},0).set(hdr,{yPercent:-100},0);
  intro(page,tl,.4);
  /* 收笔时笔刷的粗细：先和原来一样迅速变细露出形状，在 38% 到 13% 这一段加快通过。
     原来的曲线在这一段放慢，相邻两段笔画之间会拉出一条细长的裂缝，停留六到八帧。 */
  tl.to(trPath,{keyframes:{'12%':{strokeWidth:'38%',ease:'none'},'22%':{strokeWidth:'13%',ease:'none'},'95%':{strokeWidth:'8%',ease:'none'},'100%':{drawSVG:'100% 100%'}},duration:1.25},0);
  tl.to(trLogo,{scale:0,rotate:64,autoAlpha:0,duration:.45,ease:'elastic.in(1,0.72)'},0);
  tl.to(hdr,{yPercent:0,duration:.5,delay:.5,ease:EN,onStart:()=>{hid=false;hdr.classList.remove('away');}},.4);return tl;}
const CAN=G&&!RM&&!!window.DrawSVGPlugin;
function go(r,first){if(!routes.includes(r))r='home';
  if(r===cur&&!first){lenis?lenis.scrollTo(0):window.scrollTo({top:0,behavior:'smooth'});return;}
  setMenu(false);if(!CAN){showPage(r);return;}if(busy)return;busy=true;
  if(first){enter(showPage(r)).then(()=>busy=false);return;}
  leave().then(()=>enter(showPage(r)).then(()=>busy=false));}
/* in-page anchors: jump links like #about-who scroll inside the current page */
function scrollToId(id){const el=document.getElementById(id);if(!el)return false;const y=el.getBoundingClientRect().top+scrollY-100;lenis?lenis.scrollTo(y,{duration:1.1}):window.scrollTo({top:y,behavior:RM?'auto':'smooth'});return true;}
const hashR=()=>(location.hash||'#home').slice(1);
addEventListener('hashchange',()=>{const h=hashR();if(routes.includes(h))go(h);});
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const h=a.getAttribute('href').slice(1);
  if(routes.includes(h)){e.preventDefault();location.hash!=='#'+h?location.hash=h:go(h);return;}
  const target=document.getElementById(h);if(!target)return;e.preventDefault();setMenu(false);
  const owner=target.closest('.page');if(owner&&owner.dataset.page!==cur){location.hash=owner.dataset.page;setTimeout(()=>scrollToId(h),2600);}else scrollToId(h);});
const fr=routes.includes(hashR())?hashR():'home';
if(CAN){gsap.set(trPath,{drawSVG:'0% 100%',strokeWidth:'70%'});gsap.set(trLogo,{autoAlpha:1,scale:1});$('#tr').classList.remove('boot');
  Promise.race([document.fonts?document.fonts.ready:Promise.resolve(),new Promise(r=>setTimeout(r,1200))]).then(()=>setTimeout(()=>go(fr,true),250));}
else{document.documentElement.classList.add('no-anim');$('#tr').classList.remove('boot');trPath.style.opacity=0;trLogo.style.opacity=0;const b=$('#book3d');if(b)b.style.display='none';showPage(fr);}
})();
