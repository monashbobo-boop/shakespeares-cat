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
$('#termTrack').innerHTML=EV.map((e,i)=>{const hot=e===next;return `<article class="ecard ${hot?'dark':''}" style="--cb:${CB[i]}"><div><div class="num">${String(e.d.getDate()).padStart(2,'0')}</div><p class="when">${e.d.getMonth()+1} 月 · 周${wd[e.d.getDay()]} ${e.t}</p></div><div class="what">${hot?'<span class="chip" style="align-self:flex-start;background:var(--paper)">下一场</span>':''}<h3 class="t-h3">${e.title}</h3><p class="meta">${e.type} · ${e.place}</p></div></article>`}).join('');

$('#sched').innerHTML=EV.map(e=>{const[sc,sl]=status(e);return `<article class="ev ${e.d<today?'past':''}"><div class="d"><b>${String(e.d.getDate()).padStart(2,'0')}</b><span>${e.d.getMonth()+1} 月</span><span>周${wd[e.d.getDay()]}</span></div><div class="c"><span class="t-small">${e.type} · ${e.t} · ${e.place}</span><h3 class="t-h3">${e.title}</h3><p class="t-body">${e.desc}</p></div><span class="chip ${sc}">${sl}</span></article>`}).join('');

/* real covers, from 豆瓣 (Chinese editions) */
const CV=n=>`assets/img/covers/${n}.webp`;
const bookHTML=(c,note,o={})=>`<div class="book" data-book style="${o.w?'--w:'+o.w+';':''}${o.t?'--t:'+o.t+';':''}--bk:${o.bk||'#2B3326'}"><div class="book__in"><span class="book__back"></span><span class="book__pages"></span><div class="book__page"><b>${note[0]}</b><span>${note[1]}</span><i>${note[2]||'莎士比亚的猫'}</i></div><span class="book__ribbon"></span><div class="book__cover"><img src="${CV(c)}" alt="${o.alt||''}" loading="lazy"></div></div></div>`;
const BOOKS=[
  ['biancheng','边城','沈从文','2025 秋 · 创社第一本','茶峒的渡船和翠翠，是我们的第一张长桌。','#4D5A3E'],
  ['huozhe','活着','余华','2026 春 · 两次读完','很多人说，第一次在读书会上哭。','#1E1E1E'],
  ['xusan','许三观卖血记','余华','2026 春 · 线下读书会','笑着读完，回家路上才难过。','#1E1E1E'],
  ['qingcheng','倾城之恋','张爱玲','2026 冬 · 第一场讲座','白流苏到底赢了没有？争了一下午。','#26324A'],
  ['jinsuo','金锁记','张爱玲','2026 冬 · 线下读书会','曹七巧的那副金锁，锁住了谁？','#6B5A4A'],
  ['hulanhe','呼兰河传','萧红','2026 秋 · 正在读','祖父的后园，是全书最亮的地方。','#3F5A58'],
  ['eergu','额尔古纳河右岸','迟子建','2026 秋 · 11 月 28 日','一个人讲完一个民族的百年。','#5B4A2E']];
$('#shelf').innerHTML=BOOKS.map(([c,t,a,when,line,bk],i)=>bookHTML(c,[`《${t}》`,`${when}<br>${line}`,a],{bk,alt:`《${t}》封面`,t:['1.3em','1.7em','1.5em','1.4em','1.2em','1.6em','1.9em'][i]})).join('');

const TERMS=[
  {id:'t3',tf:'#C9DEE3',books:['hulanhe','eergu'],name:'2026 年第三学期',theme:'故乡与远方',intro:'进行中。读萧红和迟子建，两位东北女作家，一个写回忆里的小城，一个写森林里一个民族的百年。学期结束后补充回顾与照片。',kv:[['书目','《呼兰河传》《额尔古纳河右岸》'],['活动','6 场，全部免费'],['状态','进行中']],list:EV.map(e=>[fmt(e.d),e.type,e.title])},
  {id:'t2',tf:'#E7CFC4',books:['qingcheng','jinsuo'],name:'2026 年第二学期',theme:'张爱玲的城',intro:'集中读张爱玲。第一次办线上公益讲座，悉尼和布里斯班的读者也来了。讨论里争得最久的问题是：白流苏到底赢了没有。',kv:[['书目','《倾城之恋》《金锁记》'],['活动','4 场，含首场线上讲座'],['人次','约 120 人次（示例）']],list:[['5月9日','线下读书会','《倾城之恋》'],['5月10日','嘉宾讲座','张爱玲与《倾城之恋》'],['6月6日','文学夜','冬夜朗读'],['6月20日','线下读书会','《金锁记》']]},
  {id:'t1',tf:'#E9DCB5',books:['huozhe','xusan'],name:'2026 年第一学期',theme:'从人物出发',intro:'第一次以学期为单位读书。两本余华，从福贵读到许三观，很多人说第一次在读书会上哭。',kv:[['书目','《活着》《许三观卖血记》'],['活动','4 场'],['人次','约 80 人次（示例）']],list:[['2月21日','线下读书会','《活着》（上）'],['3月7日','文学夜','开学书单交换'],['3月21日','线上讨论','《活着》（下）'],['4月11日','线下读书会','《许三观卖血记》']]},
  {id:'t0',tf:'#C6CBA8',books:['biancheng'],name:'2025 年 · 创社',theme:'一张长桌',intro:'从几位朋友在家里读《边城》开始，后来有了微信群、公众号和这个名字。',kv:[['书目','《边城》'],['活动','2 场'],['地点','成员家中']],list:[['2025 秋','线下读书会','《边城》'],['2025 冬','文学夜','第一次公开朗读会']]}];
const TYPES=['全部','线下读书会','文学夜','线上讨论','嘉宾讲座'];
const bkOf=c=>(BOOKS.find(b=>b[0]===c)||[])[5]||'#2B3326';
$('#terms').innerHTML=TERMS.map(t=>`<article class="tfeat" id="${t.id}" style="--tf:${t.tf}"><div class="tfeat__books">${t.books.map(c=>{const b=BOOKS.find(x=>x[0]===c);return bookHTML(c,[`《${b[1]}》`,`${b[3]}<br>${b[4]}`,b[2]],{bk:b[5],alt:`《${b[1]}》封面`});}).join('')}</div><div class="tfeat__txt"><span class="chip">${t.name}</span><h2 class="t-h2">「${t.theme}」</h2><p class="t-body">${t.intro}</p><dl class="kv">${t.kv.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl><div class="list">${t.list.map(l=>`<div class="r" data-type="${l[1]}"><b>${l[0]}</b><span>${l[2]}</span><span class="m">${l[1]}</span></div>`).join('')}</div></div></article>`).join('');
$('#termlist').innerHTML=TERMS.map((t,i)=>`<li data-i="${i}"><a href="#${t.id}">${t.theme}<small>${t.name}</small></a></li>`).join('');
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
function coverFollow(sec,list,items,getCovers,offsets){
  const covs=$$('.fcov',sec);if(!G||!covs.length)return;
  const q=covs.map((c,k)=>({x:gsap.quickTo(c,'x',{duration:.55+k*.14,ease:'power3'}),y:gsap.quickTo(c,'y',{duration:.55+k*.14,ease:'power3'})}));
  let on=false,cur=-1;
  const place=e=>{const r=sec.getBoundingClientRect();covs.forEach((c,k)=>{const o=offsets[k];q[k].x(e.clientX-r.left+o[0]*c.offsetWidth-c.offsetWidth/2);q[k].y(e.clientY-r.top+o[1]*c.offsetHeight-c.offsetHeight/2);});};
  sec.addEventListener('pointermove',e=>{if(on)place(e);});
  $$(items,list).forEach((li,i)=>li.addEventListener('pointerenter',e=>{if(!DESK())return;
    $$(items,list).forEach(x=>x.classList.toggle('on',x===li));sec.dataset.active='true';
    const cs=getCovers(i);
    if(!on){const r=sec.getBoundingClientRect();covs.forEach((c,k)=>{const o=offsets[k];gsap.set(c,{x:e.clientX-r.left+o[0]*c.offsetWidth-c.offsetWidth/2,y:e.clientY-r.top+o[1]*c.offsetHeight-c.offsetHeight/2});});}
    on=true;if(cur===i)return;cur=i;
    covs.forEach((c,k)=>{const src=cs[k];gsap.killTweensOf(c,'scale,rotation,opacity');
      if(!src){gsap.to(c,{scale:.4,opacity:0,duration:.3,ease:'power2.in'});return;}
      gsap.to(c,{scale:.6,opacity:0,duration:.14,ease:'power2.in',onComplete:()=>{$('img',c).src=CV(src);gsap.fromTo(c,{scale:.55,rotation:offsets[k][2]*2.2,opacity:0},{scale:1,rotation:offsets[k][2],opacity:1,duration:.75,delay:k*.05,ease:'back.out(1.8)'});}});});}));
  list.addEventListener('pointerleave',()=>{on=false;cur=-1;sec.dataset.active='false';$$(items,list).forEach(x=>x.classList.remove('on'));
    covs.forEach((c,k)=>gsap.to(c,{scale:.5,opacity:0,rotation:0,duration:.35,delay:k*.03,ease:'power2.in'}));});}
coverFollow($('#genre'),$('#glist'),'li',i=>GEN[i].slice(1),[[-1.15,-.55,-9],[1.15,-.6,7],[-1.05,.6,6],[1.1,.55,-8]]);
coverFollow($('#termsec'),$('#termlist'),'li',i=>TERMS[i].books,[[-1.2,-.1,-8],[1.2,-.05,7]]);

/* manifesto phrases */
$$('[data-manifesto]').forEach(m=>{m.innerHTML=m.textContent.split(/(?<=[，。、])/).map(t=>`<span class="ph${RM?'':' dim'}">${t}</span>`).join('');});

/* slider */
const sliders=[];
function initSlider(name){const vp=$(`[data-slider="${name}"]`),track=$('.track',vp),ctrl=$(`[data-ctrl="${name}"]`),cards=[...track.children];
  const o={x:0,tx:0,max:0};const measure=()=>{o.max=Math.max(0,track.scrollWidth-vp.clientWidth);};
  const upd=()=>{if(!ctrl)return;$('[data-prev]',ctrl).classList.toggle('off',o.tx>-4);$('[data-next]',ctrl).classList.toggle('off',o.tx<=-o.max+4);};
  const step=()=>cards[0].getBoundingClientRect().width+parseFloat(getComputedStyle(track).gap||0);
  const go=d=>{o.tx=Math.max(-o.max,Math.min(0,o.tx-d*step()));upd();};
  $('[data-prev]',ctrl).onclick=()=>go(-1);$('[data-next]',ctrl).onclick=()=>go(1);
  let down=null;vp.addEventListener('pointerdown',e=>{if(DESK())down={x:e.clientX,tx:o.tx,mv:false};});
  addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-down.x;if(Math.abs(dx)>4)down.mv=true;o.tx=Math.max(-o.max-60,Math.min(60,down.tx+dx));});
  addEventListener('pointerup',()=>{if(!down)return;o.tx=Math.max(-o.max,Math.min(0,o.tx));upd();setTimeout(()=>down=null,0);});
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

/* pin map on the events page: Nunawading as the centre of a few dashed rings */
(function(){const cv=$('#pinmap');if(!cv||!cv.getContext)return;const ctx=cv.getContext('2d');let S=0,dpr=1,vis=false;
  const size=()=>{dpr=Math.min(2,devicePixelRatio||1);S=cv.getBoundingClientRect().width;cv.width=S*dpr;cv.height=S*dpr;};
  new ResizeObserver(size).observe(cv);new IntersectionObserver(es=>vis=es[0].isIntersecting).observe(cv);size();
  const t0=performance.now();
  const ro=new ResizeObserver(()=>{size();draw(0);});ro.observe(cv);
  function f(now){requestAnimationFrame(f);if(vis&&S)draw(RM?0:(now-t0)/1000);}
  function draw(t){if(!S)return;const c=S/2;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,S,S);
    ctx.lineWidth=1.5;[.18,.3,.42].forEach((r,i)=>{ctx.beginPath();ctx.setLineDash([6,8]);ctx.lineDashOffset=-t*(6+i*3)*(i%2?1:-1);ctx.arc(c,c,S*r,0,Math.PI*2);ctx.strokeStyle='rgba(250,246,236,.32)';ctx.stroke();});
    ctx.setLineDash([]);ctx.strokeStyle='rgba(250,246,236,.2)';ctx.beginPath();ctx.moveTo(c,S*.04);ctx.lineTo(c,S*.96);ctx.moveTo(S*.04,c);ctx.lineTo(S*.96,c);ctx.stroke();
    ctx.fillStyle='rgba(250,246,236,.7)';ctx.font=`500 ${Math.max(11,S/34)}px "Noto Sans SC",sans-serif`;ctx.textAlign='center';ctx.fillText('N',c,S*.03+S/34);
    ctx.textAlign='left';ctx.fillText('← 墨尔本 CBD 约 20 公里',S*.06,c-10);ctx.textAlign='center';
    const k=RM?0:(t*14)%(S*.08);ctx.beginPath();ctx.arc(c,c,S*.03+k,0,Math.PI*2);ctx.strokeStyle=`rgba(184,65,47,${1-k/(S*.08)})`;ctx.lineWidth=2;ctx.stroke();
    ctx.beginPath();ctx.arc(c,c,S*.03,0,Math.PI*2);ctx.fillStyle='#B8412F';ctx.fill();ctx.lineWidth=3;ctx.strokeStyle='#FAF6EC';ctx.stroke();
    ctx.fillStyle='#FAF6EC';ctx.font=`700 ${Math.max(13,S/22)}px "Noto Serif SC",serif`;ctx.fillText('Nunawading',c,c+S*.1);}
  requestAnimationFrame(f);})();


/* ---------- signature hovers ----------
   Everything below animates transforms only, through GSAP, so hovers stay at 60fps. */
const FINE=matchMedia('(hover:hover) and (pointer:fine)').matches;
const MOTION=G&&!RM;
function inkPrep(svg){$$('path,circle,rect,ellipse,line,polyline',svg).forEach(el=>{if(el.getAttribute('stroke')==='none')return;el.setAttribute('pathLength','1');el.style.strokeDasharray='1 1';el.style.strokeDashoffset='0';});}
function inkDraw(svg,dur=1.2){if(!MOTION||!svg)return;gsap.fromTo($$('[pathLength]',svg),{strokeDashoffset:1},{strokeDashoffset:0,duration:dur,stagger:.06,ease:'power2.inOut',overwrite:true});}
function tilt(el,max,target){if(!MOTION||!FINE)return;target=target||el;gsap.set(target,{transformPerspective:1200});
  const rx=gsap.quickTo(target,'rotationX',{duration:.9,ease:'power3'}),ry=gsap.quickTo(target,'rotationY',{duration:.9,ease:'power3'});
  el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;ry((px-.5)*max*2);rx(-(py-.5)*max*2);el.style.setProperty('--mx',(px*100).toFixed(1)+'%');el.style.setProperty('--my',(py*100).toFixed(1)+'%');});
  el.addEventListener('pointerleave',()=>{rx(0);ry(0);});}
const rOf=el=>parseFloat(getComputedStyle(el).getPropertyValue('--r'))||0;
function adoptRotation(el){const r=rOf(el);if(MOTION){el.style.rotate='0deg';gsap.set(el,{rotation:r});}return r;}

/* illustrated cards: ghost character, dot texture, rotating badge, ink redraw, 3D tilt */
$$('.icard').forEach(c=>{
  const d=document.createElement('span');d.className='dots';c.prepend(d);
  if(c.dataset.ghost){const g=document.createElement('span');g.className='ghost';g.textContent=c.dataset.ghost;g.setAttribute('aria-hidden','true');c.prepend(g);}
  if(c.classList.contains('leaf')){const r=document.createElement('span');r.className='ring';r.setAttribute('aria-hidden','true');const id='rg'+Math.random().toString(36).slice(2,7);
    r.innerHTML=`<svg viewBox="0 0 100 100"><defs><path id="${id}" d="M50 50m-38 0a38 38 0 1 1 76 0a38 38 0 1 1-76 0"/></defs><text><textPath href="#${id}">莎士比亚的猫 · READ TOGETHER · 一起读 · </textPath></text></svg>`;c.appendChild(r);}
  const ill=$('.ill',c);if(ill)inkPrep(ill);
  tilt(c,5);
  if(MOTION&&FINE){const g=$('.ghost',c);
    c.addEventListener('pointerenter',()=>{inkDraw(ill);if(g)gsap.to(g,{x:-18,y:-10,rotation:-6,duration:1.2,ease:'power3.out'});});
    c.addEventListener('pointerleave',()=>{if(g)gsap.to(g,{x:0,y:0,rotation:0,duration:1.2,ease:'power3.out'});});}});
$$('svg.ink').forEach(svg=>{inkPrep(svg);if(MOTION&&ST)ScrollTrigger.create({trigger:svg,start:'top 85%',onEnter:()=>inkDraw(svg,1.6)});});

/* real 3D books: follow the pointer, cover swings open (CSS), tap toggles on touch */
$$('[data-book]').forEach(b=>{const inn=$('.book__in',b);
  if(MOTION&&FINE){gsap.set(inn,{rotationY:-24,rotationX:6});const ry=gsap.quickTo(inn,'rotationY',{duration:1,ease:'power3'}),rx=gsap.quickTo(inn,'rotationX',{duration:1,ease:'power3'});
    b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;ry(-8+(px-.5)*26);rx(4-(py-.5)*14);});
    b.addEventListener('pointerenter',()=>gsap.to(b,{y:-10,duration:.8,ease:'back.out(2)'}));
    b.addEventListener('pointerleave',()=>{ry(-24);rx(6);gsap.to(b,{y:0,duration:.8,ease:'power3.out'});});}
  else b.addEventListener('click',()=>b.classList.toggle('open'));});

/* postage stamps: lift, straighten, postmark lands */
$$('.stamp').forEach(st=>{const f=$('.stamp__face',st),pm=$('.stamp__pm',st);const r=adoptRotation(f);inkPrep($('svg',f));
  if(!MOTION||!FINE)return;
  st.addEventListener('pointerenter',()=>{gsap.to(f,{y:-16,rotation:0,scale:1.06,duration:.8,ease:'back.out(2.2)'});inkDraw($('svg',f),.9);
    gsap.fromTo(pm,{opacity:0,scale:1.9,rotation:-34},{opacity:.92,scale:1,rotation:-18,duration:.36,delay:.18,ease:'power4.in',onComplete:()=>gsap.fromTo(f,{x:-3},{x:0,duration:.4,ease:'elastic.out(1,.3)'})});});
  st.addEventListener('pointerleave',()=>{gsap.to(f,{y:0,rotation:r,scale:1,duration:.8,ease:'power3.out'});gsap.to(pm,{opacity:0,duration:.35});});});

/* library cards: pulled out of the pocket, then stamped */
$$('.lib').forEach(l=>{const c=$('.lib__card',l),sp=$('.lib__stamp',l),pk=$('.lib__pocket',l);c.appendChild(sp);const r=adoptRotation(c);
  if(!MOTION)return;let open=false;
  const pull=()=>{if(open)return;open=true;gsap.to(c,{yPercent:-34,rotation:r*-1.5,duration:1,ease:'elastic.out(1,.7)'});
    gsap.fromTo(sp,{opacity:0,scale:2.4,rotation:-30},{opacity:1,scale:1,rotation:-12,duration:.34,delay:.32,ease:'power4.in',onComplete:()=>gsap.fromTo(l,{y:4},{y:0,duration:.5,ease:'elastic.out(1,.35)'})});
    gsap.to(pk,{y:6,duration:.5,ease:'power2.out'});};
  const push=()=>{if(!open)return;open=false;gsap.to(c,{yPercent:0,rotation:r,duration:.8,ease:'power3.out'});gsap.to(sp,{opacity:0,duration:.25});gsap.to(pk,{y:0,duration:.6,ease:'power3.out'});};
  if(FINE){l.addEventListener('pointerenter',pull);l.addEventListener('pointerleave',push);}else l.addEventListener('click',e=>{if(e.target.closest('a'))return;open?push():pull();});});

/* hanging bookmarks: a damped swing, the tassel lags behind */
$$('.mark').forEach(m=>{const t=$('.mark__tassel',m);if(!MOTION)return;let busy=false;
  const swing=dir=>{if(busy)return;busy=true;const a=8*dir;
    gsap.to(m,{keyframes:{rotation:[a,-a*.62,a*.36,-a*.18,a*.07,0],easeEach:'sine.inOut'},duration:2.2,onComplete:()=>busy=false});
    gsap.to(t,{keyframes:{rotation:[-a*1.6,a*1.1,-a*.6,a*.3,0],easeEach:'sine.inOut'},duration:2.4,delay:.06});
    gsap.fromTo(m,{y:0},{y:8,duration:.25,yoyo:true,repeat:1,ease:'power2.out'});};
  m.addEventListener('pointerenter',e=>{const r=m.getBoundingClientRect();swing(e.clientX<r.left+r.width/2?-1:1);});
  m.addEventListener('click',()=>swing(1));});

/* envelopes: flap opens, letter slides out */
$$('.env').forEach(v=>{const fl=$('.env__flap',v),lt=$('.env__letter',v);if(!MOTION)return;
  const tl=gsap.timeline({paused:true,defaults:{ease:'power2.inOut'}})
    .to(fl,{rotationX:-178,duration:.42,ease:'power2.in'})
    .set(fl,{zIndex:0},.22)
    .to(lt,{yPercent:-64,duration:.8,ease:'back.out(1.5)'},.3)
    .to(v,{y:-6,duration:.6,ease:'power2.out'},0);
  if(FINE){v.addEventListener('pointerenter',()=>tl.timeScale(1).play());v.addEventListener('pointerleave',()=>tl.timeScale(1.6).reverse());}
  else v.addEventListener('click',()=>tl.reversed()||tl.progress()===0?tl.play():tl.reverse());});

/* polaroids straighten and lift toward the pointer */
$$('.pola').forEach(pl=>{const r=adoptRotation(pl);if(!MOTION||!FINE)return;
  pl.addEventListener('pointerenter',()=>{gsap.to(pl,{rotation:0,scale:1.07,y:-8,zIndex:6,duration:.7,ease:'back.out(2)'});});
  pl.addEventListener('pointerleave',()=>{gsap.to(pl,{rotation:r,scale:1,y:0,zIndex:1,duration:.8,ease:'power3.out'});});});

/* HMS-style timeline */
const ILL={
  house:'<svg viewBox="0 0 300 200" fill="none" stroke="#2B3326" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M60 180V96l90-62 90 62v84z" fill="#E9DCB5"/><path d="M40 108l110-80 110 80"/><rect x="128" y="120" width="44" height="60" fill="#FAF6EC"/><rect x="80" y="110" width="32" height="28" fill="#C9DEE3"/><rect x="188" y="110" width="32" height="28" fill="#C9DEE3"/><path d="M20 180h260"/><path d="M196 52V30h18v34" fill="#FAF6EC"/><path d="M204 22c-6-8 4-12-2-20" stroke="#B8412F"/></svg>',
  cat:'<svg viewBox="0 0 300 200" fill="none" stroke="#2B3326" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><rect x="70" y="40" width="160" height="120" rx="10" fill="#FAF6EC"/><path d="M90 70h70M90 92h120M90 114h96"/><circle cx="214" cy="68" r="12" fill="#B8412F" stroke="#B8412F"/><path d="M96 160c0-24 10-36 26-36s26 12 26 36"/><path d="M104 130l-4-12 12 7M140 130l4-12-12 7" fill="#C6CBA8"/><path d="M148 156q30 4 34-18" /><path d="M20 180h260"/></svg>',
  calendar:'<svg viewBox="0 0 300 200" fill="none" stroke="#2B3326" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><rect x="70" y="36" width="160" height="140" rx="10" fill="#FAF6EC"/><path d="M70 72h160M108 24v24M192 24v24"/><path d="M96 98h20M140 98h20M184 98h20M96 126h20M140 126h20M184 126h20M96 152h20"/><circle cx="150" cy="126" r="16" stroke="#B8412F"/><path d="M230 150q30-6 40-34" stroke="#6B7756"/><path d="M262 112l8 4 4-8" stroke="#6B7756"/></svg>',
  mic:'<svg viewBox="0 0 300 200" fill="none" stroke="#2B3326" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><rect x="40" y="40" width="150" height="100" rx="8" fill="#C9DEE3"/><path d="M30 150h170l-12 16H42z" fill="#FAF6EC"/><rect x="214" y="40" width="30" height="62" rx="15" fill="#FAF6EC"/><path d="M200 84a29 29 0 0 0 58 0M229 114v26M210 146h38"/><path d="M80 78q35-30 70 0" stroke="#B8412F"/><circle cx="115" cy="98" r="10"/></svg>',
  globe:'<svg viewBox="0 0 300 200" fill="none" stroke="#2B3326" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="150" cy="100" r="76" fill="#C9DEE3"/><path d="M74 100h152M150 24c-40 40-40 112 0 152M150 24c40 40 40 112 0 152"/><path d="M96 58q54 20 108 0M96 142q54-20 108 0"/><path d="M174 128l58-70" stroke="#B8412F" stroke-dasharray="6 7"/><circle cx="174" cy="128" r="6" fill="#B8412F" stroke="#B8412F"/></svg>'};
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
  const fillIn=()=>{const h=HIST[ti];tx.innerHTML=`<span class="when">${h.y}<small style="font-size:.38em;margin-left:.2em">${h.s}</small></span><h3>${h.h}</h3><p>${h.p}</p>`;il.innerHTML=ILL[h.ill];inkPrep($('svg',il));};
  const show=(i,anim)=>{if(i<0||i>=HIST.length)return;ti=i;paint();
    if(!MOTION||!anim){fillIn();return;}
    gsap.to([tx,il],{opacity:0,y:-14,duration:.22,ease:'power2.in',onComplete:()=>{fillIn();gsap.fromTo(tx.children,{opacity:0,y:18},{opacity:1,y:0,duration:.6,stagger:.06,ease:EN});gsap.set([tx,il],{opacity:1,y:0});inkDraw($('svg',il),1.3);}});};
  bs.forEach((b,i)=>b.addEventListener('click',()=>show(i,true)));$('#tlPrev').onclick=()=>show(ti-1,true);$('#tlNext').onclick=()=>show(ti+1,true);
  addEventListener('resize',paint);show(ti,false);
  if(MOTION&&ST)ScrollTrigger.create({trigger:'#tl',start:'top 75%',once:true,onEnter:()=>inkDraw($('svg',il),1.6)});
  window.__tlPaint=paint;})();

/* the cat yawns now and then */
(function(){const head=$('#catHead'),mouth=$('#catMouth');if(!head||!MOTION)return;gsap.set(mouth,{scaleX:.2,scaleY:0,opacity:0});
  const yawn=()=>{gsap.timeline({onComplete:()=>gsap.delayedCall(6+Math.random()*6,yawn)})
    .to(head,{rotation:-7,y:-3,duration:1,ease:'sine.inOut'})
    .to(mouth,{opacity:1,scaleX:1,scaleY:1,duration:.9,ease:'power2.out'},.2)
    .to(head,{rotation:-8.5,duration:.9,ease:'sine.inOut'})
    .to(mouth,{scaleX:.85,scaleY:.15,duration:.45,ease:'power2.in'})
    .to(mouth,{opacity:0,duration:.12})
    .to(head,{rotation:0,y:0,duration:1.1,ease:'sine.inOut'},'-=.35')
    .to(head,{rotation:1.2,duration:.25,yoyo:true,repeat:1,ease:'sine.inOut'});};
  gsap.delayedCall(4.2,yawn);})();

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
  const tl=gsap.timeline({scrollTrigger:{trigger:'#boxSec',start:'top top',end:'bottom bottom',scrub:.6}});
  gsap.set('#boxContent > *',{opacity:0,y:'2em'});
  tl.fromTo('#book3d',{rotateX:18,rotateZ:-8,scale:.9,y:'4em'},{rotateX:0,rotateZ:0,scale:1,y:0,duration:.25,ease:'none'})
    .to('#bookCover',{rotateY:-178,duration:.3,ease:'power1.inOut'},.15)
    .to('#book3d',{scale:()=>DESK()?5.4:4.2,duration:.35,ease:'power2.in'},.42)
    .to('#boxContent > *',{opacity:1,y:0,stagger:.04,duration:.2,ease:'none'},.68).to({},{duration:.12});
  rise($$('#glist li'),'#glist');
  gsap.to('#globeBox',{yPercent:8,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
}
/* accordions (all pages) */
$$('.acc details').forEach(d=>{const s=$('summary',d),a=$('.ans',d);s.addEventListener('click',e=>{if(!G||RM)return;e.preventDefault();
  if(d.open)gsap.to(a,{height:0,opacity:0,duration:.45,onComplete:()=>{d.open=false;gsap.set(a,{clearProps:'all'});if(ST)ScrollTrigger.refresh();}});else{d.open=true;gsap.from(a,{height:0,opacity:0,duration:.55,clearProps:'all',onComplete:()=>ST&&ScrollTrigger.refresh()});}});});

/* header + menu */
const hdr=$('#hdr');let lastY=0;const onS=y=>{hdr.dataset.scrolled=String(y>50);hdr.classList.toggle('away',y>lastY&&y>120);lastY=y;};
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
  tl.to(hdr,{yPercent:0,duration:.5,delay:.5,ease:EN},.4);return tl;}
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
if(CAN){gsap.set(trPath,{drawSVG:'0% 100%',strokeWidth:'70%'});gsap.set(trLogo,{autoAlpha:1,scale:1});
  Promise.race([document.fonts?document.fonts.ready:Promise.resolve(),new Promise(r=>setTimeout(r,1200))]).then(()=>setTimeout(()=>go(fr,true),250));}
else{document.documentElement.classList.add('no-anim');trPath.style.opacity=0;trLogo.style.opacity=0;const b=$('#book3d');if(b)b.style.display='none';showPage(fr);}
})();
