/* 莎士比亚的猫文学社 · 官网原型 v5 · 交互脚本
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
  hero:{vb:[1920,1200],layers:[
    {c:0,pts:[[1360,-80],[1190,170],[960,410],[650,590],[270,690],[-120,730]],close:[[-120,1300],[2040,1300],[2040,-80]]},
    {c:1,pts:[[2040,140],[1760,260],[1520,500],[1230,760],[860,920],[420,1010],[-120,1060]],close:[[-120,1300],[2040,1300]]},
    {c:2,pts:[[-120,1130],[260,1020],[640,980],[1040,1000],[1420,900],[1720,820],[2040,760]],close:[[2040,1300],[-120,1300]]}]},
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
const next=EV.find(e=>e.d>=today);
const status=e=>e.d<today?['done','已结束']:e===next?['open','报名中']:['','即将开放'];
const tk=next||EV[EV.length-1];
$('#ticket').innerHTML=`<div class="ticket__main"><span class="chip open">下一场 · ${status(tk)[1]}</span><span class="num">${tk.d.getMonth()+1}/${tk.d.getDate()}</span><h3>${tk.title}</h3><p class="t-small">周${wd[tk.d.getDay()]} ${tk.t} · ${tk.type}<br>${tk.place}</p></div><div class="ticket__stub">入场券<small>免费 · FREE</small></div>`;
const CB=['#EAE4D2','#DEDAC1','#E6E1CC','#D3D6B9','#EDE8D8','#C6CBA8'];
const TI={'线下读书会':'book','文学夜':'night','线上讨论':'laptop','嘉宾讲座':'mic'};
$('#termTrack').innerHTML=EV.map((e,i)=>{const hot=e===next;return `<article class="ecard ${hot?'dark':''}" style="--cb:${CB[i]}"><img class="sk" src="${SK(TI[e.type]+(hot?'-light':''))}" alt=""><div><div class="num">${String(e.d.getDate()).padStart(2,'0')}</div><p class="when">${e.d.getMonth()+1} 月 · 周${wd[e.d.getDay()]} ${e.t}</p></div><div class="what">${hot?'<span class="chip" style="align-self:flex-start;background:var(--paper)">下一场</span>':''}<h3 class="t-h3">${e.title}</h3><p class="meta">${e.type} · ${e.place}</p></div></article>`}).join('');

$('#sched').innerHTML=EV.map(e=>{const[sc,sl]=status(e);return `<article class="ev ${e.d<today?'past':''}"><div class="d"><b>${String(e.d.getDate()).padStart(2,'0')}</b><span>${e.d.getMonth()+1} 月</span><span>周${wd[e.d.getDay()]}</span></div><div class="c"><span class="t-small">${e.type} · ${e.t} · ${e.place}</span><h3 class="t-h3">${e.title}</h3><p class="t-body">${e.desc}</p></div><span class="chip ${sc}">${sl}</span></article>`}).join('');

/* real covers, from 豆瓣 (Chinese editions) */
const bookHTML=(c,note,o={})=>`<div class="book" data-book style="${o.w?'--w:'+o.w+';':''}${o.t?'--t:'+o.t+';':''}--bk:${o.bk||'#2B3326'}"><div class="book__in"><div class="book__face book__back"></div><div class="book__face book__pages"></div><div class="book__face book__top"></div>${o.noSlip?'':`<div class="book__slip"><b>${note[0]}</b><span>${note[1]}</span><i>${note[2]||'莎士比亚的猫'}</i></div>`}<div class="book__face book__spine"><b>${(o.title||note[0]).replace(/[《》]/g,'')}</b><i></i></div><div class="book__face book__front"><img src="${CV(c)}" alt="${o.alt||''}" loading="lazy"></div></div><span class="book__shadow"></span></div>`;
const BOOKS=[
  ['biancheng','边城','沈从文','2025 秋 · 创社第一本','茶峒的渡船和翠翠，是我们的第一张长桌。','#4D5A3E'],
  ['huozhe','活着','余华','2026 春 · 两次读完','很多人说，第一次在读书会上哭。','#1E1E1E'],
  ['xusan','许三观卖血记','余华','2026 春 · 线下读书会','笑着读完，回家路上才难过。','#1E1E1E'],
  ['qingcheng','倾城之恋','张爱玲','2026 冬 · 第一场讲座','白流苏到底赢了没有？争了一下午。','#26324A'],
  ['jinsuo','金锁记','张爱玲','2026 冬 · 线下读书会','曹七巧的那副金锁，锁住了谁？','#6B5A4A'],
  ['hulanhe','呼兰河传','萧红','2026 秋 · 正在读','祖父的后园，是全书最亮的地方。','#3F5A58'],
  ['eergu','额尔古纳河右岸','迟子建','2026 秋 · 11 月 28 日','一个人讲完一个民族的百年。','#5B4A2E']];
$('#shelf').innerHTML=BOOKS.map(([c,t,a,when,line,bk],i)=>bookHTML(c,[`《${t}》`,`${when}<br>${line}`,a],{bk,title:t,noSlip:true,alt:`《${t}》封面`,t:['1.3em','1.7em','1.5em','1.4em','1.2em','1.6em','1.9em'][i]})).join('');

const TERMS=[
  {id:'t3',tf:'#C9DEE3',books:['hulanhe','eergu'],name:'2026 年第三学期',theme:'故乡与远方',intro:'进行中。读萧红和迟子建，两位东北女作家，一个写回忆里的小城，一个写森林里一个民族的百年。学期结束后补充回顾与照片。',kv:[['书目','《呼兰河传》《额尔古纳河右岸》'],['活动','6 场，全部免费'],['状态','进行中']],list:EV.map(e=>[fmt(e.d),e.type,e.title])},
  {id:'t2',tf:'#E7CFC4',books:['qingcheng','jinsuo'],name:'2026 年第二学期',theme:'张爱玲的城',intro:'集中读张爱玲。第一次办线上公益讲座，悉尼和布里斯班的读者也来了。讨论里争得最久的问题是：白流苏到底赢了没有。',kv:[['书目','《倾城之恋》《金锁记》'],['活动','4 场，含首场线上讲座'],['人次','约 120 人次（示例）']],list:[['5月9日','线下读书会','《倾城之恋》'],['5月10日','嘉宾讲座','张爱玲与《倾城之恋》'],['6月6日','文学夜','冬夜朗读'],['6月20日','线下读书会','《金锁记》']]},
  {id:'t1',tf:'#E9DCB5',books:['huozhe','xusan'],name:'2026 年第一学期',theme:'从人物出发',intro:'第一次以学期为单位读书。两本余华，从福贵读到许三观，很多人说第一次在读书会上哭。',kv:[['书目','《活着》《许三观卖血记》'],['活动','4 场'],['人次','约 80 人次（示例）']],list:[['2月21日','线下读书会','《活着》（上）'],['3月7日','文学夜','开学书单交换'],['3月21日','线上讨论','《活着》（下）'],['4月11日','线下读书会','《许三观卖血记》']]},
  {id:'t0',tf:'#C6CBA8',books:['biancheng'],name:'2025 年 · 创社',theme:'一张长桌',intro:'从几位朋友在家里读《边城》开始，后来有了微信群、公众号和这个名字。',kv:[['书目','《边城》'],['活动','2 场'],['地点','成员家中']],list:[['2025 秋','线下读书会','《边城》'],['2025 冬','文学夜','第一次公开朗读会']]}];
const TYPES=['全部','线下读书会','文学夜','线上讨论','嘉宾讲座'];
const bkOf=c=>(BOOKS.find(b=>b[0]===c)||[])[5]||'#2B3326';
$('#terms').innerHTML=TERMS.map(t=>`<article class="tfeat" id="${t.id}" style="--tf:${t.tf}"><div class="tfeat__books">${t.books.map(c=>{const b=BOOKS.find(x=>x[0]===c);return bookHTML(c,[`《${b[1]}》`,`${b[3]}<br>${b[4]}`,b[2]],{bk:b[5],title:b[1],alt:`《${b[1]}》封面`});}).join('')}</div><div class="tfeat__txt"><span class="chip">${t.name}</span><h2 class="t-h2">「${t.theme}」</h2><p class="t-body">${t.intro}</p><dl class="kv">${t.kv.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl><div class="list">${t.list.map(l=>`<div class="r" data-type="${l[1]}"><b>${l[0]}</b><span>${l[2]}</span><span class="m">${l[1]}</span></div>`).join('')}</div></div></article>`).join('');
$('#filters').innerHTML=TYPES.map((t,i)=>`<button type="button" aria-pressed="${i===0}" data-f="${t}">${t}</button>`).join('');
$('#filters').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;$$('#filters button').forEach(x=>x.setAttribute('aria-pressed',x===b));const f=b.dataset.f;
  $$('#terms .r').forEach(r=>r.hidden=f!=='全部'&&r.dataset.type!==f);
  $$('#terms .tfeat').forEach(t=>t.hidden=f!=='全部'&&!$$('.r',t).some(r=>!r.hidden));
  if(ST)ScrollTrigger.refresh();});

const GEN=[['中文原著','huozhe','qingcheng','biancheng','hulanhe'],['世界译作','bainian','bianxing','juwai','xueguo'],['莎士比亚','hamlet','macbeth','tempest','sonnets'],['诗歌与散文','ditan','feiniao','beiying','walden'],['科幻与推理','santi','baiye','dune','gudu'],['历史与非虚构','wanli','jiangcheng','juliu','renlei']];
$('#glist').innerHTML=GEN.map((g,i)=>`<li data-i="${i}">${g[0]}</li>`).join('');
/* preload every cover once so the hover never waits on the network */
[...new Set(GEN.flatMap(g=>g.slice(1)))].forEach(c=>{const i=new Image();i.src=CV(c);});

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
sideCovers($('#genre'),$('#glist'),'li',i=>GEN[i].slice(1));

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
function renderDetail(anim){const e=sel,[sc,sl]=status(e);$('#detail').innerHTML=`<span class="stampin">${e.type}</span><div class="num">${String(e.d.getDate()).padStart(2,'0')}</div><span class="chip ${sc}" style="align-self:flex-start">${sl}</span><h3 class="t-h3">${e.title}</h3><p class="t-body">${e.d.getMonth()+1} 月 · 周${wd[e.d.getDay()]} ${e.t}<br>${e.type} · ${e.place}</p><p class="t-small">${e.desc}</p>`;
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
$$('[data-book]').forEach(b=>{const inn=$('.book__in',b),slip=$('.book__slip',b),sh=$('.book__shadow',b);
  if(!MOTION)return;
  gsap.set(inn,{rotationY:28,rotationX:4});
  const ry=gsap.quickTo(inn,'rotationY',{duration:1,ease:'power3'}),rx=gsap.quickTo(inn,'rotationX',{duration:1,ease:'power3'});
  const tl=gsap.timeline({paused:true}).to(b,{y:-12,duration:.6,ease:'power3.out'},0).to(sh,{scaleX:.85,opacity:.6,duration:.6},0);
  if(slip&&!b.closest('.realshelf'))tl.fromTo(slip,{yPercent:0},{yPercent:-52,duration:.7,ease:'back.out(1.3)'},.05);
  hoverTL(b,tl,{onLeave:()=>{ry(28);rx(4);}});
  if(FINE)b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;ry(18+(1-px)*22);rx(6-(py-.5)*12);});});

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
$$('.lib').forEach(l=>{const c=$('.lib__card',l),sp=$('.lib__stamp',l),pk=$('.lib__pocket',l);c.appendChild(sp);const r=adoptRotation(c);
  if(!MOTION||!DESK())return;gsap.set(sp,{opacity:0,scale:2.2,rotation:-30});
  const tl=gsap.timeline({paused:true})
    .to(c,{yPercent:-16,rotation:r*-1.2,duration:.6,ease:'power3.out'},0)
    .to(pk,{y:5,duration:.4,ease:'power2.out'},0)
    .to(sp,{opacity:1,scale:1,rotation:-12,duration:.28,ease:'power4.in'},.3);
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

/* Frame-by-frame cat (ChatGPT frames, see docs/给ChatGPT的提示词.md). If assets/img/cat/cat-sheet.webp exists the
   looping sequence below plays and the layered cat is hidden; otherwise the layered cat with its painted yawn keeps running.
   Each step: f = frame 1-16, d = how long it stays (ms), dx = how far the cat moves while on it (% of its own width). */
const CAT_SHEET='assets/img/cat/cat-sheet.webp';
const CAT_SEQ=[
  {f:1,d:2600},{f:2,d:320},{f:3,d:320},{f:2,d:320},{f:3,d:320},{f:1,d:900},     // 睡着，摆尾巴
  {f:4,d:500},{f:5,d:300},{f:6,d:1200},{f:7,d:450},{f:8,d:800},                 // 抬头，打哈欠，伸懒腰
  {f:9,d:240,dx:-7},{f:10,d:240,dx:-7},{f:9,d:240,dx:-7},{f:10,d:240,dx:-7},    // 往左爬
  {f:11,d:420},                                                                  // 转身
  {f:12,d:240,dx:7},{f:13,d:240,dx:7},{f:12,d:240,dx:7},{f:13,d:240,dx:7},      // 爬回来
  {f:14,d:450},{f:15,d:700},{f:16,d:900}];                                       // 趴下，闭眼
(function(){const cat=$('#cat'),seq=$('#catSeq');if(!cat||!seq)return;
  const probe=new Image();probe.onload=()=>{cat.classList.add('has-seq');seq.style.backgroundImage=`url("${probe.src}")`;run();};probe.src=CAT_SHEET;
  const show=f=>{const i=f-1;seq.style.backgroundPosition=`${(i%4)*100/3}% ${Math.floor(i/4)*100/3}%`;};
  function run(){show(1);if(!MOTION)return;let k=0,x=0;
    const step=()=>{const s=CAT_SEQ[k];show(s.f);
      if(s.dx){x+=s.dx;gsap.to(seq,{xPercent:x,duration:s.d/1000,ease:'none'});}
      k=(k+1)%CAT_SEQ.length;if(k===0){x=0;gsap.set(seq,{xPercent:0});}
      setTimeout(step,s.d);};
    step();}})();

/* the cat yawns now and then: two frames painted onto the cat's own pixels cross-fade, so the mouth matches the drawing */
(function(){const cat=$('#cat'),y1=$('#catYawn1'),y2=$('#catYawn2');if(!cat||!y1||!MOTION)return;if(cat.classList.contains('has-seq'))return;gsap.set([y1,y2],{opacity:0});gsap.set(cat,{transformOrigin:'50% 100%'});
  const yawn=()=>{if(cat.classList.contains('has-seq'))return;gsap.timeline({onComplete:()=>gsap.delayedCall(7+Math.random()*6,yawn)})
    .to(cat,{scaleY:1.03,scaleX:.992,duration:1.2,ease:'sine.inOut'},0)
    .to(y1,{opacity:1,duration:.35,ease:'sine.inOut'},.25)
    .to(y2,{opacity:1,duration:.45,ease:'sine.inOut'},.55)
    .to(y2,{opacity:0,duration:.45,ease:'sine.inOut'},2.1)
    .to(y1,{opacity:0,duration:.4,ease:'sine.inOut'},2.45)
    .to(cat,{scaleY:1,scaleX:1,duration:1,ease:'sine.inOut'},2.1);};
  gsap.delayedCall(4.2,yawn);})();

/* 阅读，也是一种连接: real covers drift in from the edges and get tied to the centre with dashed thread */
const LINK=[['huozhe',.13,.2,-9,9],['qingcheng',.84,.16,8,8.5],['bainian',.08,.62,6,8],['hulanhe',.9,.6,-7,9],['santi',.26,.86,4,7],['xueguo',.72,.88,-5,7.5],['hamlet',.3,.08,5,6.5],['ditan',.66,.1,-4,6.5],['eergu',.03,.4,-3,6],['walden',.97,.38,4,6]];
(function(){const box=$('#linkCovers');if(!box)return;box.innerHTML=LINK.map(([c,,,,w])=>`<div class="lcov" style="--cw:${w}em"><img src="${CV(c)}" alt=""></div>`).join('');})();
function linkLayout(t){const el=$('.link__el'),covs=$$('.lcov'),svg=$('#linkThreads');if(!el)return;const W=el.clientWidth,H=el.clientHeight,cx=W/2,cy=H/2;
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);let d='';
  covs.forEach((c,i)=>{const[,fx,fy,rot]=LINK[i];const w=c.offsetWidth,h=c.offsetHeight;
    const ex=fx*W,ey=fy*H,sx=cx+(fx-.5)*W*2.2,sy=cy+(fy-.5)*H*2.2;const k=Math.min(1,Math.max(0,t*1.25-i*.025)),e=1-Math.pow(1-k,3);
    const x=sx+(ex-sx)*e,y=sy+(ey-sy)*e;gsap.set(c,{x:x-w/2,y:y-h/2,rotation:rot*(2.5-1.5*e),opacity:Math.min(1,k*1.6)});
    const tk=Math.min(1,Math.max(0,(t-.45)/.45));if(tk>0){const mx=(x+cx)/2+(y-cy)*.18,my=(y+cy)/2-(x-cx)*.18,qx=cx+(x-cx)*.28,qy=cy+(y-cy)*.28;
      const px=qx+(x-qx)*tk,py=qy+(y-qy)*tk;d+=`M${qx.toFixed(1)} ${qy.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${px.toFixed(1)} ${py.toFixed(1)} `;}});
  svg.innerHTML=d?`<path d="${d}"/>`:'';}
const LST={t:MOTION?0:1};if(G){addEventListener('resize',()=>linkLayout(LST.t));requestAnimationFrame(()=>linkLayout(LST.t));}
function linkScene(){const st=LST;st.t=0;linkLayout(0);
  if(!MOTION||!ST)return;gsap.set('#linkContent > *',{opacity:0,y:'1.6em'});
  gsap.timeline({scrollTrigger:{trigger:'#linkSec',start:'top 70%',end:'bottom bottom',scrub:.8}})
    .to(st,{t:1,duration:.75,ease:'none',onUpdate:()=>linkLayout(st.t)})
    .to('#linkContent > *',{opacity:1,y:0,stagger:.05,duration:.2,ease:'none'},.45).to({},{duration:.1});
  const le=$('.link__el');if(FINE&&!le.dataset.pm){le.dataset.pm=1;le.addEventListener('pointermove',e=>{const r=e.currentTarget.getBoundingClientRect(),dx=(e.clientX-r.left)/r.width-.5,dy=(e.clientY-r.top)/r.height-.5;$$('.lcov').forEach((c,i)=>gsap.to($('img',c),{x:dx*(10+i*2),y:dy*(10+i*2),duration:1,ease:'power3.out',overwrite:'auto'}));});}}

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
    [['.icards','.icard'],['.stamps','.stamp'],['.libs','.lib'],['.marks','.mark'],['.envs','.env'],['.clock','li'],['.flow','li'],['.amp',':scope > *'],['.qs','li'],['.stats',':scope > div'],['.logos','.logo-c'],['.realshelf','.book']].forEach(([w,c])=>$$(w,page).forEach(el=>rise($$(c,el),el)));
    $$('.bfeat,.tfeat,.letter,.phone,.polas,.tl,.more',page).forEach(el=>rise([el],el));
    $$('.stats b[data-count]',page).forEach(b=>{const v=+b.dataset.count,o={n:v>1000?v-25:0};ScrollTrigger.create({trigger:b,start:'top 90%',once:true,onEnter:()=>gsap.to(o,{n:v,duration:1.6,ease:'power3.out',onUpdate:()=>b.textContent=Math.round(o.n)})});});
    $$('[data-manifesto]',page).forEach(m=>{const ph=$$('.ph',m);ScrollTrigger.create({trigger:m,start:'top 80%',end:'bottom 45%',scrub:true,onUpdate:st=>{const k=Math.round(st.progress*ph.length);ph.forEach((p,i)=>p.classList.toggle('dim',i>=k));}});});
  },page);}
function home(page){
  const bind=!page.dataset.bound;page.dataset.bound=1;
  rise($$('#termTrack .ecard'),'#termTrack');
  linkScene();
  rise($$('#glist li'),'#glist');
  gsap.to('#globeBox',{yPercent:8,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
}
/* accordions (all pages) */
$$('.acc details').forEach(d=>{const s=$('summary',d),a=$('.ans',d);s.addEventListener('click',e=>{if(!G||RM)return;e.preventDefault();
  if(d.open)gsap.to(a,{height:0,opacity:0,duration:.45,onComplete:()=>{d.open=false;gsap.set(a,{clearProps:'all'});if(ST)ScrollTrigger.refresh();}});else{d.open=true;gsap.from(a,{height:0,opacity:0,duration:.55,clearProps:'all',onComplete:()=>ST&&ScrollTrigger.refresh()});}});});

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
const routes=['home','about','events','archive','join','partner','privacy'];let cur=null,busy=false;
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
  tl.to(trPath,{keyframes:{'15%':{strokeWidth:'8%'},'90%':{drawSVG:'0% 100%'},'100%':{strokeWidth:'70%'}},duration:1.25},'s');
  tl.to(trLogo,{scale:1,rotate:0,autoAlpha:1,delay:.5,duration:.65,ease:'elastic.out(1,0.72)'},'s');return tl;}
function enter(page){const tl=gsap.timeline();tl.set(trPath,{drawSVG:'0% 100%',strokeWidth:'70%'},0).set(hdr,{yPercent:-100},0);
  intro(page,tl,.4);
  tl.to(trPath,{keyframes:{'95%':{strokeWidth:'8%',ease:'circ.out'},'100%':{drawSVG:'100% 100%'}},duration:1.25},0);
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
