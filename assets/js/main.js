/* 莎士比亚的猫文学社官网原型的交互脚本
   内容数据（活动、往期、书单）都在下面的 DATA 区，改文字只需改这里。 */
(function(){
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
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
const D=(y,m,d)=>new Date(y,m-1,d),wd=['日','一','二','三','四','五','六'];
/* 活动：全部来自社里的活动表（Notion 导出的 CSV），由 tools/import_events.py 生成 window.EVENTS。
   每条的字段和表格的列一一对应：name 活动名称，type 活动类型，form 活动形式，place 地点，partner 合作方，
   cap 人数上限，signup 报名状态，link 报名链接，fee 费用，owner 负责人（网站上写作主持人），pub 发布状态，
   date/time 开始时间，endDate/endTime 结束时间。只有「已发布」的活动会出现在网站上。
   本学期按日期范围划分；书和活动的对应不用填，活动名称里出现书名就自动关联。
   上线后在 WordPress 里每场活动是一条「活动」，字段说明见 docs/WordPress-活动表.md。 */
const TERM={y:2026,n:'第三学期',from:D(2026,10,1),to:D(2026,12,31)};
const TERM_BOOKS=[
  {id:'jiyi',title:'记一忘三二',author:'李娟',cover:'',c:'#C6CBA8'},
  {id:'bailu',title:'白鹿原',author:'陈忠实',cover:'',c:'#E9DCB5'},
  {id:'doudou',title:'窗边的小豆豆',author:'黑柳彻子',cover:'',c:'#E7CFC4'},
  {id:'jiaofu',title:'教父',author:'马里奥·普佐',cover:'',c:'#3A4A36',ink:'#FAF6EC'},
  {id:'jidu',title:'基督山伯爵',author:'大仲马',cover:'',c:'#C9DEE3'}];
const ALL_EV=(window.EVENTS||[]).filter(e=>(e.pub||'已发布')==='已发布').map(e=>{const[y,m,d]=e.date.split('-').map(Number);
  return {...e,d:D(y,m,d),title:e.name,host:e.owner||'',book:(TERM_BOOKS.find(b=>e.name.includes(b.title))||{}).id};});
const EV=ALL_EV.filter(e=>e.d>=TERM.from&&e.d<=TERM.to);
const PAST_EV=ALL_EV.filter(e=>e.d<TERM.from).reverse();
const by=e=>e.host?`主持人 ${e.host}`:'';
const T0=EV[0].d,T1=EV[EV.length-1].d;
const fmt=d=>`${d.getMonth()+1}月${d.getDate()}日`;
const md=d=>`${d.getMonth()+1} 月 ${d.getDate()} 日`;
/* 不显示「下一场」「报名中」这类要随时更新的状态。报名和临时调整统一看公众号；
   只有日期过了的活动按日期自动标「已结束」，不需要人去改 */
const next=EV.find(e=>e.d>=today);
const status=e=>e.d<today?['done','已结束']:['',''];
const CB=['#EAE4D2','#DEDAC1','#E6E1CC','#D3D6B9','#EDE8D8','#C6CBA8'];
const TI={'线下文学读书会':'book','线上文学深度讨论':'laptop','文学夜':'night','青少年线上读书会':'laptop','青少年线下活动':'school','嘉宾分享':'mic','其他特别活动':'stamp'};
const icon=t=>TI[t]||'calendar';
const NUM=['零','一','二','三','四','五','六','七','八','九','十'];const cn=n=>n<=10?NUM[n]:n<20?'十'+(n%10?NUM[n%10]:''):String(n);

/* 首页卡片、学期卡、标题里的数字都按数据算 */
$('#termTrack').innerHTML=EV.map((e,i)=>`<article class="ecard" style="--cb:${CB[i%CB.length]}"><img class="sk" src="${SK(icon(e.type))}" alt=""><div><div class="num">${String(e.d.getDate()).padStart(2,'0')}</div><p class="when">${e.d.getMonth()+1} 月，周${wd[e.d.getDay()]}</p></div><div class="what"><h3 class="t-h3">${e.title}</h3><p class="meta">${e.type}${e.host?`<br>${by(e)}`:''}</p></div></article>`).join('');
(function(){const days=[...new Set(EV.map(e=>e.d.getDay()))],every=days.length===1?`每周${wd[days[0]]}`:'';
  const hi=$('#homeTermLine');if(hi)hi.textContent=`${TERM.y} 年${TERM.n}从 ${md(T0)}到 ${md(T1)}，一共 ${EV.length} 场活动。`;
  const tc=$('#termCard');if(tc)tc.innerHTML=`<h3>${EV.length} 场活动</h3><dl class="kv"><dt>起止</dt><dd>${md(T0)}至 ${md(T1)}</dd>${every?`<dt>时间</dt><dd>${every}</dd>`:''}<dt>书目</dt><dd>${cn(TERM_BOOKS.length)}本，书单在下面</dd><dt>报名</dt><dd>公众号「莎士比亚的猫文学社」</dd></dl>`;
  const hd=$('#evCount');if(hd)hd.textContent=`这学期一共有${cn(EV.length)}场活动`;
  const bh=$('#bookCount');if(bh)bh.textContent=`这学期读这${cn(TERM_BOOKS.length)}本书`;})();

$('#sched').innerHTML=EV.map(e=>{const[sc,sl]=status(e);return `<article class="ev ${e.d<today?'past':''}"><div class="d"><b>${String(e.d.getDate()).padStart(2,'0')}</b><span>${e.d.getMonth()+1} 月</span><span>周${wd[e.d.getDay()]}</span></div><div class="c"><span class="t-small">${[e.type,by(e)].filter(Boolean).join('，')}</span><h3 class="t-h3">${e.title}</h3></div>${sl?`<span class="chip ${sc}">${sl}</span>`:''}</article>`}).join('');

/* 本学期书单：从活动里自动整理，一本书读几次、哪天、谁主持，都不用另外写 */
(function(){const box=$('#termBooks');if(!box)return;
  box.innerHTML=TERM_BOOKS.map(b=>{const es=EV.filter(e=>e.book===b.id);
    const when=es.length>1?`分${cn(es.length)}次读：${es.map(e=>md(e.d)+(e.host?`（${e.host}）`:'')).join('、')}`:es.map(e=>[md(e.d),e.type,by(e)].filter(Boolean).join('，')).join('');
    const cv=b.cover?`<div class="tbook__cv img"><img src="${b.cover}" alt="《${b.title}》封面" loading="lazy"></div>`:`<div class="tbook__cv" style="--bc:${b.c};--bt:${b.ink||'var(--ink)'}" aria-hidden="true"><b>${b.title}</b><i>${b.author}</i></div>`;
    return `<article class="tbook">${cv}<div class="tbook__txt"><h3>《${b.title}》</h3><p class="tbook__a">${b.author}</p><p class="tbook__w">${when}</p></div></article>`;}).join('');})();

/* real covers, from 豆瓣 (Chinese editions) */
const bookHTML=(c,note,o={})=>`<div class="book" data-book style="${o.w?'--w:'+o.w+';':''}${o.t?'--t:'+o.t+';':''}--bk:${o.bk||'#2B3326'}"><div class="book__in"><div class="book__face book__back"></div><div class="book__face book__pages"></div><div class="book__face book__top"></div>${o.noSlip?'':`<div class="book__slip"><b>${note[0]}</b><span>${note[1]}</span><i>${note[2]||'莎士比亚的猫'}</i></div>`}<div class="book__face book__spine"><b>${(o.title||note[0]).replace(/[《》]/g,'')}</b><i></i></div><div class="book__face book__front"><img src="${CV(c)}" alt="${o.alt||''}" loading="lazy"></div></div><span class="book__shadow"></span></div>`;
/* 往期书架：从往期活动里整理出来。活动名称里有《书名》的读书会、深度讨论、嘉宾分享都算，观影会不算。
   BOOK_INFO 只补作者、封面和底色；没写的书也会上架，只是不显示作者。上线后对应 WordPress 的「书」。 */
const BOOK_INFO={
  '呐喊':{a:'鲁迅',c:'#C6CBA8'},'受戒':{a:'汪曾祺',c:'#E9DCB5'},'素食者':{a:'韩江',c:'#E7CFC4'},'清洁女工手册':{a:'露西亚·伯林',c:'#C9DEE3'},
  '台北人':{a:'白先勇',c:'#DEDAC1'},'一句顶一万句':{a:'刘震云',c:'#3A4A36',ink:'#FAF6EC'},'长安的荔枝':{a:'马伯庸',c:'#E9DCB5'},
  '活着':{a:'余华',cover:'huozhe'},'倾城之恋':{a:'张爱玲',cover:'qingcheng'},'解忧杂货店':{a:'东野圭吾',c:'#C9DEE3'},
  '伤心咖啡馆之歌':{a:'卡森·麦卡勒斯',c:'#E7CFC4'},'罗杰疑案':{a:'阿加莎·克里斯蒂',c:'#3A4A36',ink:'#FAF6EC'},
  '窗边的小豆豆':{a:'黑柳彻子',c:'#E9DCB5'},'恶意':{a:'东野圭吾',c:'#C6CBA8'},'其味无穷':{a:'Helen Hu',c:'#DEDAC1'}};
const READ_TYPES=['线下文学读书会','线上文学深度讨论','嘉宾分享'];
const PAST_BOOKS=(()=>{const seen=new Map();
  [...PAST_EV].reverse().forEach(e=>{if(!READ_TYPES.includes(e.type)||/观影/.test(e.name))return;
    (e.name.match(/《([^》]+)》/g)||[]).forEach(t=>{t=t.slice(1,-1);if(!seen.has(t))seen.set(t,{t,first:e.d,...(BOOK_INFO[t]||{})});});});
  return [...seen.values()];})();
const genCover=b=>`<span class="gcv" style="--bc:${b.c||'#DEDAC1'};--bt:${b.ink||'var(--ink)'}"><b>${b.t}</b>${b.a?`<i>${b.a}</i>`:''}</span>`;
(function(){const box=$('#shelves');if(!box)return;const per=DESK()?7:99;
  const one=b=>b.cover?bookHTML(b.cover,[`《${b.t}》`,'',b.a],{bk:'#2B3326',title:b.t,noSlip:true,alt:`《${b.t}》封面`})
    :`<div class="book" data-book style="--bk:${b.ink?'#1E2619':'#8C8670'}"><div class="book__in"><div class="book__face book__back"></div><div class="book__face book__pages"></div><div class="book__face book__top"></div><div class="book__face book__spine"><b>${b.t}</b><i></i></div><div class="book__face book__front">${genCover(b)}</div></div><span class="book__shadow"></span></div>`;
  let h='';for(let i=0;i<PAST_BOOKS.length;i+=per)h+=`<div class="shelf-wrap"><div class="realshelf">${PAST_BOOKS.slice(i,i+per).map(one).join('')}</div></div>`;
  box.innerHTML=h;
  const f=PAST_BOOKS[0];$('#shelfHead').textContent=`这是我们一起读过的${cn(PAST_BOOKS.length)}本书`;
  if(f)$('#shelfLine').textContent=`从 ${f.first.getFullYear()} 年 ${f.first.getMonth()+1} 月的《${f.t}》开始，按读的先后排列。这学期在读的书在本学期活动页。`;})();

/* 加入我们：三个文件夹。文件夹正面写标题和一句话，点开后抽出来的那张纸写具体怎么做。
   上线后在 WordPress 里每个文件夹是一条「加入方式」，字段一一对应，见 docs/WordPress-加入我们.md。
   color 只能选 FOLD_COLORS 里的名字；icon 是 assets/img/sketch 里的图标名；points 每行一条，「名称」和「内容」。 */
const FOLD_COLORS={'灰绿':'#C6CBA8','麦黄':'#E9DCB5','雾蓝':'#C9DEE3','米灰':'#DEDAC1','藕粉':'#E7CFC4'};
const JOIN_WAYS=[
  {title:'参加一场活动',line:'挑一场感兴趣的，联系我们报名。',color:'灰绿',icon:'book',
   paper:'第一次来只要知道这几件事',
   points:[['报名','看公众号或小红书「莎士比亚的猫文学社」的活动推文，发消息联系我们加入活动群。'],
           ['地点','线下活动在 Nunawading Community Hub，部分活动在 Zoom 上。'],
           ['费用','部分活动免费，部分需要分摊场地或茶点费用。']],
   link:['看本学期活动','#events']},
  {title:'加入社群',line:'进微信活动群，第一时间收到活动通知，和小伙伴畅聊读书感受。',color:'麦黄',icon:'team',
   paper:'进群只要给管理员留一句话',
   points:[['进群','关注公众号或小红书，留言给管理员。'],
           ['群里','跟读书进度、聊书，活动通知第一时间发在群里。'],
           ['约定','遵守群内规定，不发广告、不转发未经核实的消息。']],
   link:['看进群步骤','#join-group']},
  {title:'网站留言',line:'通过网站表单或邮件加入我们。',color:'雾蓝',icon:'envelope',
   paper:'填一张表或者写一封信就行',
   points:[['表单','填写这一页最下面的表单来加入我们。'],
           ['邮箱','发邮件联系我们，我们会第一时间联系你。']],
   link:['去填表单','#join-form']}];
$('#folds').innerHTML=JOIN_WAYS.map((w,i)=>`<article class="fold" style="--fc:${FOLD_COLORS[w.color]||w.color}">
  <div class="fold__box">
    <i class="fold__back" aria-hidden="true"></i>
    <div class="fold__front">
      <img class="sk fold__ic" src="${SK(w.icon)}" alt="">
      <h3>${w.title}</h3><p>${w.line}</p>
      <button type="button" class="fold__act" aria-expanded="false" aria-controls="fold-${i}"><span>打开看看</span><span>收起来</span></button>
    </div>
    <div class="fold__slot"><div class="fold__paper" id="fold-${i}" inert>
      <h4>${w.paper}</h4>
      <dl>${w.points.map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
      ${w.link?`<a class="fold__go" href="${w.link[1]}">${w.link[0]}</a>`:''}
    </div></div>
  </div></article>`).join('');

/* 加入我们：志愿者挂牌，挂在一根木杆上。正面是岗位，点一下翻到背面，写做什么、适合谁。
   上线后在 WordPress 里每张挂牌是一条「志愿者岗位」，见 docs/WordPress-加入我们.md。
   paper 选纸色，对应 assets/img/tags/paper-N.webp（和原来的标签是同一种纸）。 */
const PAPERS={'米白':1,'灰绿':2,'麦黄':3,'雾蓝':4,'砖红':5,'牛皮':6};
const TEX=n=>`assets/img/tags/paper-${n}.webp`;
/* 每张牌从纸上不同的位置取，纤维和压痕就不会张张一样 */
const tex=(r,i)=>`background-image:linear-gradient(rgba(250,246,236,.22),rgba(250,246,236,.22)),url(${TEX(PAPERS[r.paper]||1)});background-position:0 0,${[10,80,35,60,90,20][i%6]}% ${[70,15,45,90,30,60][i%6]}%`;
/* 社长 2026 年 11 月给的六个岗位。tasks 是背面「具体做什么」，一项一行；
   time（时间投入）和 fit（适合谁）选填，填了才显示。 */
const VOL_ROLES=[
  {name:'模块组织',line:'负责一个相对稳定的领域或活动模块',paper:'米白',icon:'clipboard',
   tasks:['负责一个相对稳定的领域或活动模块','跟进这个模块每学期的安排']},
  {name:'活动执行',line:'场地布置、接待、秩序维护',paper:'灰绿',icon:'team',
   tasks:['场地布置','接待','秩序维护']},
  {name:'活动内容',line:'活动主持、资料整理、文案撰写',paper:'麦黄',icon:'chat',
   tasks:['活动主持','资料整理','文案撰写']},
  {name:'活动宣传',line:'海报设计、视频剪辑、活动摄影',paper:'雾蓝',icon:'camera',
   tasks:['海报设计','视频剪辑','活动摄影']},
  {name:'外部联络',line:'嘉宾资料整理、合作洽谈',paper:'砖红',icon:'envelope',
   tasks:['嘉宾资料整理','合作洽谈']},
  {name:'AI 与数字技术',line:'网站维护、社交媒体平台维护',paper:'牛皮',icon:'laptop',
   tasks:['网站维护','社交媒体平台维护']}];
$('#railList').style.setProperty('--n',VOL_ROLES.length);
$('#railList').innerHTML=VOL_ROLES.map((r,i)=>`<li class="hang"><div class="hang__swing">
  <i class="hang__strap" aria-hidden="true"></i><i class="hang__clip" aria-hidden="true"></i>
  <button type="button" class="bdg" aria-pressed="false">
    <span class="bdg__in">
      <span class="bdg__face bdg__front" style="${tex(r,i)}"><i class="bdg__slot" aria-hidden="true"></i>
        <img class="sk bdg__ic" src="${SK(r.icon)}" alt=""><b${r.name.length>5?' class="long"':''}>${r.name}</b><span class="bdg__line">${r.line}</span>${r.time?`<span class="bdg__time">${r.time}</span>`:''}</span>
      <span class="bdg__face bdg__back" aria-hidden="true" style="${tex(r,i+3)}"><i class="bdg__slot" aria-hidden="true"></i>
        <b>${r.name}</b>
        <span class="bdg__row"><em>具体做什么</em>${r.tasks.map(t=>`<span class="bdg__task">${t}</span>`).join('')}</span>
        ${r.fit?`<span class="bdg__row"><em>适合谁</em>${r.fit}</span>`:''}
        ${r.time?`<span class="bdg__row"><em>时间</em>${r.time}</span>`:''}</span>
    </span></button></div></li>`).join('');

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
const months=[...new Set(EV.map(e=>e.d.getMonth()))];let sel=(next||EV[0]).d,mi=Math.max(0,months.indexOf(sel.getMonth()));
const onDay=dt=>EV.filter(e=>+e.d===+dt);
function renderCal(){const m=months[mi],first=new Date(2026,m,1),n=new Date(2026,m+1,0).getDate(),off=(first.getDay()+6)%7;
  $('#mTitle').textContent=`${m+1} 月`;$('#prevM').classList.toggle('off',mi===0);$('#nextM').classList.toggle('off',mi===months.length-1);
  let h='';for(let i=0;i<off;i++)h+='<div class="day blank"></div>';
  for(let d=1;d<=n;d++){const dt=new Date(TERM.y,m,d),es=onDay(dt),ev=es[0],c=['day'];if(dt>=T0&&dt<=T1)c.push('in');
    if(ev){c.push('has');if(+dt===+sel)c.push('sel');if(es.length>1)c.push('two');h+=`<button type="button" class="${c.join(' ')}" data-t="${+dt}" aria-label="${fmt(dt)} ${es.map(x=>x.title).join('，')}">${d}</button>`;}else h+=`<div class="${c.join(' ')}">${d}</div>`;}
  $('#days').innerHTML=h;}
function renderDetail(anim){const es=onDay(sel),e=es[0],[sc,sl]=status(e);$('#detail').innerHTML=`<span class="stampin">${es.length>1?'两场活动':e.type}</span><div class="num">${String(sel.getDate()).padStart(2,'0')}</div>${sl?`<span class="chip ${sc}" style="align-self:flex-start">${sl}</span>`:''}<p class="t-small">${sel.getMonth()+1} 月，周${wd[sel.getDay()]}</p>${es.map(x=>`<div class="detail__ev"><h3 class="t-h3">${x.title}</h3><p class="t-body">${[x.type,x.place,by(x)].filter(Boolean).join('，')}</p></div>`).join('')}`;
  if(G&&!RM&&anim){gsap.killTweensOf('#detail *');gsap.fromTo('#detail > :not(.stampin)',{opacity:0,y:'.8em'},{opacity:1,y:0,duration:.5,stagger:.05,ease:EN});
    gsap.fromTo('#detail .stampin',{scale:2.4,opacity:0,rotation:-20},{scale:1,opacity:1,rotation:-6,duration:.45,ease:'power4.in',onComplete:()=>gsap.fromTo('#detail',{x:-3},{x:0,duration:.35,ease:'elastic.out(1,.3)'})});}}
$('#days').addEventListener('click',ev=>{const b=ev.target.closest('.day.has');if(!b)return;sel=new Date(+b.dataset.t);$$('.day.has').forEach(x=>x.classList.toggle('sel',x===b));renderDetail(true);});
$('#prevM').onclick=()=>{if(mi>0){mi--;renderCal();}};$('#nextM').onclick=()=>{if(mi<months.length-1){mi++;renderCal();}};
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
/* 加入我们的表单（原型演示，不真正发送；上线后用 WordPress 自带的表单，见 docs/WordPress-加入我们.md） */
(function(){const f=$('#joinForm');if(!f)return;
  f.addEventListener('submit',e=>{e.preventDefault();
    const R={'j-name':v=>v.trim()?'':'请留一个称呼','j-contact':v=>v.trim().length>=3?'':'请留下邮箱或微信号，方便我们联系你'};
    let ok=true;for(const id in R){const el=$('#'+id),m=R[id](el.value);$(`.err[data-for="${id}"]`).textContent=m;el.classList.toggle('invalid',!!m);if(m&&ok){ok=false;el.focus();}}
    const w=$$('input[name="j-want"]:checked',f).length;$('.err[data-for="j-want"]').textContent=w?'':'请至少选一种';if(!w)ok=false;
    const c=$('#j-ok');$('.err[data-for="j-ok"]').textContent=c.checked?'':'请勾选同意后再发送';if(!c.checked)ok=false;if(!ok)return;
    f.innerHTML=`<div class="sent"><h3 class="t-h3">已收到，谢谢</h3><p class="t-body">我们会尽快联系你。这是原型演示，信息没有真实发送。</p></div>`;});
  $$('input,textarea',f).forEach(el=>el.addEventListener('input',()=>{el.classList.remove('invalid');const er=$(`.err[data-for="${el.id||el.name}"]`);if(er)er.textContent='';}));})();
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

/* 加入我们的文件夹：鼠标靠近时朝指针轻轻倾斜，里面的纸探出一点；
   点开时前片往前倒一点，那张纸整张抽出来，文件夹往下让出位置。一次只开一个。 */
(()=>{const folds=$$('.fold');if(!folds.length)return;let cur=null;
  const parts=f=>({f,box:$('.fold__box',f),slot:$('.fold__slot',f),pap:$('.fold__paper',f),front:$('.fold__front',f),btn:$('.fold__act',f)});
  const P=folds.map(parts);
  /* how far the paper has to rise so all of it clears the front panel, leaving its foot tucked in */
  const rise=o=>{const em=parseFloat(getComputedStyle(o.box).fontSize);
    const y0=o.slot.offsetTop+o.pap.offsetTop,yF=o.front.offsetTop;
    return Math.max(0,y0+o.pap.offsetHeight-yF-1.9*em);};
  const set=(o,on,instant)=>{o.btn.setAttribute('aria-expanded',on);o.f.classList.toggle('is-open',on);
    if(on)o.pap.removeAttribute('inert');else o.pap.setAttribute('inert','');
    const R=on?rise(o):0;
    if(!MOTION||instant){o.f.style.paddingTop=R+'px';o.pap.style.transform=`translateY(${-R}px)`;o.front.style.transform=on?'perspective(60em) rotateX(-10deg)':'';return;}
    gsap.killTweensOf([o.f,o.pap,o.front]);
    if(on){gsap.to(o.f,{paddingTop:R,duration:.75,ease:'power3.inOut'});
      gsap.to(o.pap,{y:-R,rotation:0,duration:.85,ease:'back.out(1.15)',delay:.08});
      gsap.to(o.front,{rotationX:-10,transformPerspective:800,transformOrigin:'50% 100%',duration:.6,ease:'power2.out'});}
    else{gsap.to(o.pap,{y:0,duration:.55,ease:'power3.in'});
      gsap.to(o.f,{paddingTop:0,duration:.6,ease:'power3.inOut',delay:.12});
      gsap.to(o.front,{rotationX:0,duration:.7,ease:'back.out(1.6)',delay:.25});}};
  P.forEach(o=>{
    o.btn.addEventListener('click',()=>{const on=o.btn.getAttribute('aria-expanded')!=='true';
      if(on&&cur&&cur!==o)set(cur,false);set(o,on);cur=on?o:null;});
    if(!MOTION||!FINE)return;
    /* lean toward the pointer, the paper peeks out a little */
    gsap.set(o.box,{transformPerspective:1400});
    const rx=gsap.quickTo(o.box,'rotationX',{duration:.8,ease:'power3'}),ry=gsap.quickTo(o.box,'rotationY',{duration:.8,ease:'power3'}),py=gsap.quickTo(o.slot,'y',{duration:.6,ease:'power3'});
    o.box.addEventListener('pointermove',e=>{const r=o.box.getBoundingClientRect();ry(((e.clientX-r.left)/r.width-.5)*5);rx(-((e.clientY-r.top)/r.height-.5)*4);});
    o.box.addEventListener('pointerenter',()=>{if(!o.f.classList.contains('is-open'))py(-parseFloat(getComputedStyle(o.box).fontSize)*.9);});
    o.box.addEventListener('pointerleave',()=>{rx(0);ry(0);py(0);});});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&cur){const b=cur.btn;set(cur,false);cur=null;b.focus();}});
  let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{if(cur)set(cur,true,true);},150);});})();

/* 志愿者挂牌：每张牌是一个挂在木杆上的小摆。鼠标碰到会晃，邻居跟着被轻轻碰一下；
   按住可以拽，往下拉挂带会拉长，松手弹回去；点一下翻到背面。手机上左右滑，点一下翻面。 */
(()=>{const list=$('#railList');if(!list)return;const H=$$('.hang',list);
  const S=H.map((h,i)=>({h,i,sw:$('.hang__swing',h),b:$('.bdg',h),a:0,va:0,s:0,vs:0,drag:null}));
  const draw=o=>{o.sw.style.setProperty('--a',o.a.toFixed(2)+'deg');o.sw.style.setProperty('--s',o.s.toFixed(3)+'em');};
  let raf=0,last=0;
  const step=t=>{const dt=Math.min(.033,last?(t-last)/1000:.016);last=t;let live=false;
    S.forEach(o=>{if(!o.drag){o.va+=(-36*o.a-2.4*o.va)*dt;o.a+=o.va*dt;o.vs+=(-170*o.s-10*o.vs)*dt;o.s+=o.vs*dt;
        if(Math.abs(o.a)<.03&&Math.abs(o.va)<.08&&Math.abs(o.s)<.003&&Math.abs(o.vs)<.02){o.a=o.va=o.s=o.vs=0;}else live=true;}
      else live=true;draw(o);});
    if(live)raf=requestAnimationFrame(step);else{raf=0;last=0;}};
  const kick=()=>{if(!raf)raf=requestAnimationFrame(step);};
  const push=(i,v)=>{const o=S[i];if(!o||RM)return;o.va+=v;kick();};
  const flip=(o,on)=>{o.b.setAttribute('aria-pressed',on);const [f,k]=$$('.bdg__face',o.b);f.setAttribute('aria-hidden',on);k.setAttribute('aria-hidden',!on);};
  let justDragged=false;
  S.forEach(o=>{
    o.b.addEventListener('click',e=>{if(justDragged){e.preventDefault();return;}
      flip(o,o.b.getAttribute('aria-pressed')!=='true');push(o.i,(o.i%2?-1:1)*26);});
    if(!FINE||RM)return;
    o.h.addEventListener('pointerenter',e=>{if(o.drag)return;const r=o.h.getBoundingClientRect(),d=e.clientX<r.left+r.width/2?-1:1;
      push(o.i,d*34);setTimeout(()=>push(o.i-d,d*12),140);});   // CSS rotation is clockwise and the pivot is at the top, so a negative angle swings the bottom right: entering from the left (d=-1) pushes it right and nudges the right-hand neighbour
    o.b.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;
      const r=o.h.getBoundingClientRect(),ax=r.left+r.width/2,ay=r.top,em=parseFloat(getComputedStyle(o.h).fontSize);
      o.drag={ax,ay,em,x0:e.clientX,y0:e.clientY,r0:Math.hypot(e.clientX-ax,e.clientY-ay),on:false,pa:o.a,pt:performance.now()};
      o.b.setPointerCapture(e.pointerId);});
    o.b.addEventListener('pointermove',e=>{const d=o.drag;if(!d)return;
      if(!d.on){if(Math.hypot(e.clientX-d.x0,e.clientY-d.y0)<6)return;d.on=true;o.h.classList.add('is-drag');kick();}
      const dx=e.clientX-d.ax,dy=Math.max(1,e.clientY-d.ay);
      const a=Math.max(-26,Math.min(26,-Math.atan2(dx,dy)*180/Math.PI)),now=performance.now();
      o.va=(a-d.pa)/Math.max(.008,(now-d.pt)/1000);d.pa=a;d.pt=now;o.a=a;
      o.s=Math.max(0,Math.min(5,(Math.hypot(dx,dy)-d.r0)/d.em));o.vs=0;});
    const end=()=>{const d=o.drag;if(!d)return;o.drag=null;o.h.classList.remove('is-drag');
      if(d.on){o.va=Math.max(-160,Math.min(160,o.va));justDragged=true;setTimeout(()=>justDragged=false,0);kick();}};
    o.b.addEventListener('pointerup',end);o.b.addEventListener('pointercancel',end);});
  addEventListener('keydown',e=>{if(e.key==='Escape')S.forEach(o=>{if(o.b.getAttribute('aria-pressed')==='true')flip(o,false);});});})();

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
  {y:'2025',s:'9 月',h:'第一次读书会',p:'5 位书友一起共读鲁迅的《呐喊》，重温经典。',ill:'house'},
  {y:'2026',s:'4 月',h:'有了自己的名字',p:'读书会正式更名为「莎士比亚的猫文学社」，并创立官方公众号。',ill:'cat'},
  {y:'2026',s:'5 月',h:'第一次嘉宾分享',p:'第一次邀请嘉宾杨佳娴教授来做分享，讲解《倾城之恋》。',ill:'mic'}];
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


/* ---------- 往期活动：活动表里本学期之前的每一场，按月份分组，可以按年份和类型筛选 ---------- */
(function(){const body=$('#logBody');if(!body)return;
  const years=[...new Set(PAST_EV.map(e=>e.d.getFullYear()))],types=[...new Set(PAST_EV.map(e=>e.type))];
  let fy='',ft='';
  const chip=(k,v,label,on)=>`<button type="button" class="chip-btn" data-${k}="${v}" aria-pressed="${on}">${label}</button>`;
  $('#logYears').innerHTML=chip('y','','全部年份',true)+years.map(y=>chip('y',y,`${y} 年`,false)).join('');
  $('#logTypes').innerHTML=chip('t','','全部类型',true)+types.map(t=>chip('t',t,t,false)).join('');
  const f0=PAST_EV[PAST_EV.length-1],f1=PAST_EV[0];
  if(f0)$('#logLine').textContent=`按社里的活动表整理，新的在前。从 ${f0.d.getFullYear()} 年 ${f0.d.getMonth()+1} 月到 ${f1.d.getFullYear()} 年 ${f1.d.getMonth()+1} 月，一共 ${PAST_EV.length} 场。`;
  const render=()=>{const list=PAST_EV.filter(e=>(!fy||e.d.getFullYear()===+fy)&&(!ft||e.type===ft));let h='',mk='';
    list.forEach(e=>{const k=`${e.d.getFullYear()} 年 ${e.d.getMonth()+1} 月`;if(k!==mk){mk=k;h+=`<tr class="log__m"><th colspan="6" scope="rowgroup">${k}</th></tr>`;}
      h+=`<tr><td class="log__d">${e.d.getMonth()+1} 月 ${e.d.getDate()} 日</td><td class="log__n">${esc(e.name)}</td><td>${e.type}</td><td>${e.form||''}</td><td>${esc(e.place||'')}</td><td>${esc(e.partner||'')}</td></tr>`;});
    body.innerHTML=h||'<tr><td colspan="6" class="log__none">这个条件下没有活动。换一个年份或类型看看。</td></tr>';};
  $('.logf').addEventListener('click',e=>{const b=e.target.closest('.chip-btn');if(!b)return;
    if('y' in b.dataset){fy=b.dataset.y;$$('#logYears .chip-btn').forEach(x=>x.setAttribute('aria-pressed',x===b));}
    else{ft=b.dataset.t;$$('#logTypes .chip-btn').forEach(x=>x.setAttribute('aria-pressed',x===b));}
    render();if(ST)ScrollTrigger.refresh();});
  render();})();

/* ---------- 关于我们：五个活动模块，书脊式展开 ---------- */
(function(){const box=$('#spines');if(!box)return;const sps=$$('.sp',box);
  const open=sp=>{sps.forEach(x=>{const on=x===sp;x.dataset.open=String(on);$('.sp__tab',x).setAttribute('aria-expanded',on);});
    if(MOTION){gsap.fromTo($$('.sp__txt > *, .sp__ic',sp),{opacity:0,y:18},{opacity:1,y:0,duration:.55,stagger:.05,delay:.25,ease:EN});}
    if(ST)setTimeout(()=>ScrollTrigger.refresh(),700);};
  sps.forEach(sp=>$('.sp__tab',sp).addEventListener('click',()=>{if(sp.dataset.open==='true'&&DESK())return;open(sp.dataset.open==='true'?null:sp);}));})();

/* ---------- 书友作品 ----------
   只收已经在公众号发表的作品，内容由社长 2026 年 11 月提供。上线后每一篇是 WordPress 后台的一篇「作品」，
   字段见 docs/WordPress-书友作品.md：title 篇名，author 署名，paper 扉页纸色，url 公众号原文链接，
   genre 栏目和 date 发表日期选填，text 正文（段落之间空一行）。
   正文不用自己分页，翻页阅读器按版面自动排；likes 和 comments 上线后由 WordPress 记录。
   原文链接现在都指向公众号首页，上线时换成每篇文章的地址。 */
const WX='https://mp.weixin.qq.com/';
const WORKS=[
  {id:'wuxiu',title:'午休',author:'玉兰',paper:'麦黄',url:WX,likes:0,comments:[],
   text:`我站在我第一个家的客厅里，看见我妈妈穿着秋冬时室内穿的白色坎肩儿，侧躺在平铺展开的沙发上，浅枣红色里布满黄白色的小花，用了十多年。周围的三面墙，爸爸曾经在上面给我按照西游记、米老鼠唐老鸭画过的卡通水彩画，早已被刷成纯白色，此时却又显得略发灰暗。我坐在沙发边上，皱起眉头，问她到底怎么了？她皱着眉头，紧闭双眼，沉默不语。过了一会，她让我和她一起躺下。我照做，之后她紧紧地用右胳膊搂着我，还掐了我胳膊好几下，小声说道：“以后别跟别人乱说……”后面的不记得了，反正倒很像她，因为一些事情就会使出十分严肃的态度提醒或是训诫我。我一边叫疼，一边苦笑：这么大了还掐人呐？

突然，我从午睡的模糊中清醒过来：这是一场梦。而我母亲早已于一年多前离去，刚才的一切不过是幻觉。意识到她离去的事实，而掐胳膊带来的疼痛感再也无法感受到时，我在床上崩溃地流起泪、啜泣来，知道这是此生彻底离我远去的往事了。心碎，早已无数次，在夜幕降临时，在夜深人静时，还有一次在天朗气清的秋日的滴滴车上。不经意的冲击，如同雷击，如同潮水，向我袭来，根本无法抵挡。

三十多年前，两个年轻夫妻，坐在北京某个不起眼的小店儿里。他们说说笑笑，非常开心，因为他们完成了两件大事：买了新房、换了新工作，还是个铁饭碗。在他们旁边的方形桌子上，搁着一台卡式录音机，里面播着童安格的《明天你是否依然爱我》，歌声盖过了他们俩的谈话，但他们还是谈笑得前胸贴后背，合不拢嘴。

而今，妻子早已安详地走了，她的先生和孩子还在这世上过着生活，只是一个在北半球忙着家里、工作上的各种琐事，另一个在南半球坐在电脑前，一边循环播放着 Will You Still Love Me Tomorrow，一边敲下这些文字。

午夜里的旋律，一直在重复；昨天的故事，早已归入脑海的深处。`},
  {id:'luoye',title:'落叶',author:'赤夜',paper:'灰绿',url:WX,likes:0,comments:[],
   text:`我在一家社区机构做临终关怀的相关的工作。工作内容很简单，大致就是在医院里，陪那些生命即将走到终点的孤楚老人说说话，照看一下，给对方一些人世间最后的温暖之类的。托这种工作性质的福，我因此听到了许多让人或是动容，或是记忆深刻的话。诸如几十年前，如果没有做这样或那样的决定，或者做了这样或那样的决定，人生也不至于沦落至此的这般这般。内容应该多到够我写一本书了，或许退休后，我会把这些零零碎碎的孤独又凄凉的故事，当做一个章节，写进我的自传里。不过内容其实意外地有些大同小异，想来也是，毕竟人生中的遗憾之事大抵逃不过感情或者钱财。偶尔在寻常的工作之余，倒也确实能遇到些有趣的老不死。几个月前我就碰到过一个，人明明已然气若游丝了，却偏偏还要不服输地摆出一副口若悬河的架势，跟你唠天唠地。有一次，我们问到例行的话题，他盯着天花板愣了一会儿，用力做出一个爽朗的表情，然后模模糊糊断断续续地说：

“要是年轻…的时候..能…多做几次…爱…就好…了。”当我终于听清他在讲什么的时候，只能抚额，哭笑不得地问眼前的糟老头子这样想的理由。

“没有..什么”，他依旧断断续续地回答，回光返照似地往眼睛里抹了点光，“因为…那种时候…那个..时候…多…纯粹呀…两个人…”

病房外的院子里有棵梧桐树，时值秋天，叶子都发黄发红了。这个老不死走的时候，天空很合时宜地拽来了几片云，把暖阳遮得严严实实的。呼啸的秋风扯掉了树上一大片叶子，让保洁工在院子里清扫了好半天。

我不知道是我逐渐适应了这种场合，还是自己经过经年累月的见闻后，变得可悲地麻木了起来，我渐渐地不再像刚开始那样，对这样生死别离暗自感伤。无非是某一刻，心跳监测仪突然传来高昂的蜂鸣警报声，原本有规律的波形回归为毫无起伏的一条直线而已。

“有一个人走了。”每当警报声响起，我随即意识到。

挺好，我莫名觉得。两腿一蹬，吐出最后一口身体里的浊气，就轻松地摆脱了这个乱糟糟的世界。在这里见过了太多说不清道不明的糟心事，看多太多苟延残喘只为了“活着”而再无其他任何生命机能的人后，我便开始不知不觉地这样认为。如果不巧那时正好浏览着一些媒体新闻，则更是无可置疑。人，各安天命就好，何须挣扎。

警报声后接踵而来的，是医护人员前来确认死亡，并告知家属，如果有的话。遗体根据死者生前的意愿，或者留在医院作医学用途，或送往殡仪馆火化。用不了多久，这张床就会迎来下一个垂危的临终者。就如生命注定悲剧又无可奈何的轮回。

但是今天，我却没法以这种平淡而朴素的心境开始我的工作。因为今天躺在这张床上的人，我之前见过。我认识。

我住的老房子渗水，把墙壁给渗得到处都是褶子，像是某不知名山脉的模型，此起彼伏的。一年前，修水管的时候，原本墙上的白灰也都刮了下来，露出原始的水泥毛坯。重新装修的时候，想着顺带装饰一下，换换环境，就请人来贴了瓷砖。而他就是那个来帮我贴瓷砖的人。

小伙子长得精瘦，大概三十左右，一副冷峻的脸，眉眼间隐约有一股死犟的气质。听口音像是华北一带的人，皮肤倒是像南方人一样偏白。性格似乎有些不苟言笑，我有时找他聊两句，他也不怎么回应，只是干着手中的活。完工的时候，我还请他吃了顿饭，就在家楼下的湘菜馆，正好当时我也要吃饭，索性招呼他一起。他一开始还有些局促，连连回绝，但终于还是没拗过我，虽然在餐桌上，仍然只有零星的几句对话。席间，他从包里拿出一瓶江小白，用那张冷峻的脸，问我要不要一起喝，我说不喝酒，于是他只好悻悻地塞了回去。

一年后，没想到我们会再次相见，然而却是在这间病房里，专供临危病重之人的病房。认出他的时候，我一时间惊得不知道该说什么。他或许也是一样，看到我的时候，愣了几秒，而后腾出那只没有插着针管的手，朝我挥了挥，自嘲似地笑了笑说，“真巧啊…”我本想问问他近来如何，又何以至此，最终说出口的话却也变成了，“真巧…”

后来我得知，他得的是感染性脑膜炎，确诊的时候已经拖得太晚了。我一边纳闷，一边惋惜，好好的年轻人，怎么就得了脑膜炎这种东西。但是转念想到现在不断上升的年轻人患绝症的比率，也就不想再想下去。或许，这就是人各有命吧。

因为这种病的缘故，他一天大部分时间都在嗜睡，一醒来就开始止不住地呕吐，所以实际上也没有什么说话的时间。大部分时候，我都是坐在靠墙的椅子上，看着他日渐瘦削的身体与苍白的脸色，看着他与年轻人该有的样子越来越远。原本就是一个挺瘦的人，这会儿躺在病床上，真的离皮包骨就差一步了。我能做的，也就是在他醒来的时候，让自己倒映在他微微张开的眼眸中，让他知道身边有人。然后似乎是微微点点头，就闭上眼睛，带着眉眼间那道残存的死犟的气息再次陷入沉睡。这道气息也是看上去唯一没什么变化的东西了。

来看他的人很少，目前就只有三个人，想来是一个朋友不多的人。其中一个是看上去挺潮的中年人，看上去四十出头，另外两个人是一对年纪更大的夫妇。他们之间似乎互相认识，有时候还会一起过来看望他。那个潮流的中年人梳着时尚的发型，说话也不遮掩，比较直接，有时还会带点粗口，活脱脱一个年轻人的感觉，只是脸上的皱纹暴露了他的年纪，虽然他本人可能并不在意。有时他在病房外打电话，听上去是在聊音乐演出之类的事。每当小伙子清醒过来，和他唠嗑的时候，我就觉得这个画面有些奇异。一个三十多岁的瓷砖工，是怎么和四十多的搞音乐的老家伙搞到一块儿的，听起来有些匪夷所思。但这种违和感却在此刻表现出无尽的和谐，像是一个老大哥无奈又遗憾地握着不争气的弟弟的手，有一搭没一搭地唠着，时而回忆往昔，时而说说他最近音乐事业相关的事，当然，免不了问问小伙子还有什么放心不下的事，一遍遍地问，隔三差五地问，我看都快把人问得想直接撒手人寰了事了。那对夫妇倒是比较儒雅，像是知识分子出身的人，不过很明显不是他的父母或亲戚。他们聊的话也都大差不差。也是，对于一个快要死的人而言，还有什么可以说的，还有什么是值得说的呢。最近的八卦，谁又跟谁闹矛盾了，周末去哪里玩，什么东西又打折了？还是那些未能去到的地方，或是未竟的雄心壮志？似乎这些再平常不过的话题，此刻都味同嚼蜡。一旦睡上一觉，按照小伙子现在的状况，谁也说不准他还能不能醒来，还有没有机会说上最后一句话。所以每次醒着的时候，总是要格外珍惜。

小伙子大部分时候都比较平静，就像那天在我家做工一样，不苟言笑，没有太多情绪起伏，说不出是因为身体状态太糟糕，没有力气使唤身体，还是一种对于自己傻逼般的命运与结局的麻木。唯有一件事，每次一提到，他就拼命地挺起身子，抓着中年人或是夫妇的手臂，激动地向他们说，说完后就栽在床上直喘气。我在旁边听着，他似乎是在要求，或者说央求他们，不要把自己的骨灰带回他的家乡，而是在本地寻找一个地方埋了就行。我和他们都不理解小伙子为何唯独对这件事如此执着，他也什么都不说，或者只是说些敷衍的理由。鉴于这毕竟也算是他最后的心愿之一，所以他们还是答应了他。

有时那个中年人会跑到外面抽烟，我碰上了，就顺势聊了两句。结果却发现，中年人和小伙子，只认识了几个月而已，可在我看来，他们却像是已经认识了几年。这无疑让我感到有点惊讶。

“嗐，之前参加一个戏剧社的活动认识的。”中年人看着地面，吐出一口青烟，“挺聊得来的，谁知道缘分这么短。”他一把扔掉烟头，狠狠踩了几下。

后来的一天晚上，小伙子从昏暗的房间里醒来，他的病情已是相当严重，上一次苏醒已是过了两天，谁也保不准他还剩多少时间。他醒来后吱吱唔唔地朝我闷哼了半天，我才发现他醒了。我走到他的身边，他看起来精神还不错，似乎是想跟我说些什么，不断地向我比划着，但我已全然听不清他在说什么。我猜他是想上厕所，于是扶起他，但是被他挣扎着拍掉。他拿手不断地靠近嘴唇，又缓缓地拿开，又靠近。我猜是肚子饿了，于是去热了下下午医院送来的稀粥。但是当我舀起一勺递到他的嘴边时，他又死死地闭着他的嘴，不肯张开。我只能无奈地看着他。过了会儿，他似乎也放弃了挣扎，像根木头一样躺在床上，一动不动地看着天花板。等我回过神来的时候，他已经再次睡着了。

第二天，他终于没能从沉眠中醒过来，而是在梦乡中吐掉了他这辈子最后一口气。我走过去关掉蜂鸣的警报声，看着他最后的模样，就像第一天在这个病房和他相见的那样，不知道该说什么，还可以说些什么。“你昨晚到底想要什么？”我看着他僵硬而无神的眉宇，还来不及悲伤，在心中不禁疑问。

那三个人不久后接到通知，前来接引他。那个中年人来的时候戴了墨镜，背上了一个吉他包，不知是不是想在葬礼上弹一曲悼歌。前来出殡的，还多了几个不认识的面孔，他们依次与我握手表示感谢后，就慢慢走出了房间。原本还弥漫着悲恸之声的房间，突然又安静了下来。我出神地看了看落空的床位，又出神地望向窗外。院中的梧桐树在秋风中颤颤巍巍，飘下了最后几片枯叶。

我忽然想起了一年前，在湘菜馆的桌子上，他用那副冷峻的脸，拿出江小白要我一起喝的样子。`},
  {id:'kuwei',title:'我不说苦，我说我知道了——《倾城之恋》余味',author:'秋兰雪',paper:'藕粉',url:WX,likes:0,comments:[],
   text:`《倾城之恋》给我最深的感受不是“爱情”，而是一种不对等关系中的无力感。

白流苏出身大家族，却依然是旧式社会中的女性。她没有独立的经济地位，乃至没有真正的主体性。在与范柳原的情感博弈中，她从一开始就处于弱势，她那些拉锯、矜持、小嗔怒、小心翼翼的体面，看起来既苍白又心酸。

直至后来的“苦”不堪言。范柳原从香港发来仅寥寥几个字的电报，邀她再次赴港。此时，书中道：她就这样的下贱么？她眼里掉下泪来。这一哭，她突然失去了自制力，她发现她已经是忍无可忍了。一个秋天，她已经老了两年！于是第二次离开了家上香港来。这一趟，她早失去了上一次的愉悦的冒险的感觉，她失败了。

“一个秋天，她已经老了两年。”短短一句，写尽了白流苏作为女性所承受的消耗与痛苦，这等“苦”甚至数倍于男性。相比之下，范柳原即使有些许爱而不得的痛苦，因其悬殊的财富地位，自始至终牢牢占据选择权、主动权。

时至今日，《倾城之恋》的思考价值和意义依然在延续。时代虽然改变了，但主题依旧。如果一个人没有经济能力、稳定内核，就很难在感情中获得真正平等与尊重。

此刻，绝非想挑起性别的对峙，我只是更为清醒：“被爱”、“被保障”不可作为人生终极目的，“被”字后面只有“苦”，无尽的消耗和辛苦。在这个参次、不公的大千世界里，女性有困境、有难处。何不活成水——让所有人、事、物成为流经你的河床，为你所用，助你强大。你温柔穿行，却不困于任何，在所有关系里自由生长和热烈地爱！`},
  {id:'qingcheng',title:'张爱玲与胡兰成的倾城之恋',author:'Tony',paper:'雾蓝',url:WX,likes:0,comments:[],
   text:`年方二十出头, 张爱玲发表<倾城之恋>时, 正与有过数段婚姻, 若干子女的胡兰成热恋之中. 刚从兵荒马乱的”孤城”香港, 逃到惊魂未定的”孤岛”上海, 总算可以有安稳的书桌写她喜爱的文字了.尽管有着”现世安稳”的承诺, 她却时时内心不安, 于是特意为这个圆满的故事安上了一条苍凉的尾巴.

有人说<倾城之恋>是张爱玲借着”倾城”的乱世, 让笔下人物求得了婚姻的安稳, 这恰与作者现实中求而不得的岁月静好形成了悲伤的互文. 其实对于遗世独立的张爱玲, 她对感情爱情婚姻的观念, 从她的文章中可以管窥一二, 更可以从旁人写她的文字里探知几分. 胡兰成的<今生今世>专辟一章, 写”民国女子”, 写那时的张爱玲, 就是那个“见了他，她变得很低很低，低到尘埃里。但她心里是欢喜的，从尘埃里开出花来” 的恋爱中的女人.

<倾城之恋>中的白流苏与范柳园, 几番追逐几度纠缠, 犹如牌桌上最后的两个赌徒, 抱着自己的那点筹码, 都在等待在对手的梭哈, 偏又都犹疑不定. 只是在香港城破之即, 再不出牌桌子都塌了的时候, 终于羞羞答答半推半就地合作胡了这把牌. 只是既然是赌徒,白小姐可能没有本钱再上桌, 范公子可保不齐”小赌怡情”.

张爱玲对男女情事看得通透. 与她自己则是坦荡自然. 遇到心仪之人, 她自会低眉顺眼,巧笑嫣然; 她是即会 “恋爱”, 更会 “谈恋爱”. 觉得遇人不淑, 则当机立断, 愿赌服输. 这份洒脱和决绝, 是胡兰成对其念念不忘的缘由, 也更甚于对她才华的钦慕. 胡兰成虽是千夫所指的 “渣男”, 但对待女人实则是有万般手段的. 只是这一次他碰到了更胜一筹的张爱玲.`},
  {id:'yaomao',title:'妖猫局',author:'秋兰雪',paper:'米灰',url:WX,likes:0,comments:[],
   text:`某局近日拟召开一项群众活动。王局长召集各科室开会。

会上，他神情严肃，提出一项要求：“此次活动，需有一个响亮、得体、富有内涵之名称。各科室务必高度重视，拿出最优方案。”

当晚，局内灯火通明。各科室挑灯夜战，或伏案疾书，或字斟句酌，或苦思冥想，纸页翻飞，笔声沙沙，仿佛一场无声的战役。

翌日清晨，早会，各科室纷纷呈上方案。名称各异，却又惊人地趋同：

纸猫、木猫、石猫、水猫。

王局长逐一翻阅，面色渐沉，显然不甚满意。

回到自己的办公室，他沉吟片刻，忽而起身，踱至书架前，翻检那一排排浩如烟海的文学册籍。良久，似有所悟，忽地一拍脑门，神情一振：

“有了！就叫——莎翁的猫！”

众人闻言，纷纷点头称妙，全局沐浴于文化的光辉之中。

事情本该就此尘埃落定。

孰料，定稿方案递至书记处，书记眉头一蹙，缓缓抬头道：

“这猫那猫的——不就是一只妖猫吗？”室内一时无声。

未得见于书记，再好的名头可不都得推倒重来。王局长甚为苦恼。

当晚，全局上下再度召开紧急会议，重议命名之事。

会场空气微滞，王局长点了一支烟，火光一闪，烟雾缓缓升起。他悠悠地扫视众人，良久方开口道：

“此会，为务虚会议。大家畅所欲言、集思广益，不要有任何思想包袱。但需兼顾众满意和组织要求，这个要求高吗？大家努努力，总是可以达到的嘛……”

数日后，该局忽现一派前所未有之祥和气象。

各科室内，不再闻翻纸之声，不再见案牍劳形，取而代之的，是此起彼伏的“喵喵”之声。

王局长心生疑窦，遂轻移脚步，踱步科室，隔门探视。

只见室内众人，已然放下案卷，或抚或逗，或引或戏，人人怀中皆有一猫。有人轻声唤名，有人低声哄笑，一片其乐融融。

王局长见状，默然片刻。

随即，他轻轻将门掩上，未再言语，只是神情淡然，步履轻快地返回办公室。门扉将合未合之际，忽有一声猫叫，从中传出。

妖猫局之谓从此由来。`}];

/* ---------- 书友作品：喜欢和留言 ----------
   上线后都存在 WordPress 的数据库里，不放在读者的浏览器里：
   - 留言就是 WordPress 自带的评论（wp_comments 表），走自带的 REST 接口 /wp/v2/comments，后台「评论」里审核；
     登录的成员留言会自动记在他的 WordPress 用户名下。
   - 喜欢由 wordpress/sc-likes 插件记在一张表里（wp_sc_likes）：登录的成员按用户记，没登录的按浏览器记，
     每人每篇只算一次；总数同时写进作品的自定义字段 sc_like_count，后台作品列表能看到、能排序。
   主题用 wp_localize_script 输出 window.SC_WP = { root: rest_url(), nonce: wp_create_nonce('wp_rest') }，
   每篇作品带上它的文章编号 wp。原型里没有 WordPress，喜欢和留言只存在这一页的内存里，刷新就没了。 */
const WPAPI=(function(){const cfg=window.SC_WP||null;
  const strip=h=>new DOMParser().parseFromString(h,'text/html').body.textContent.trim();
  if(cfg){const req=async(path,o={})=>{const r=await fetch(cfg.root+path,{credentials:'same-origin',...o,headers:{'Content-Type':'application/json','X-WP-Nonce':cfg.nonce}});
      const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.message||'请求失败');return j;};
    return {live:true,
      likes:p=>req(`sc/v1/likes/${p.wp}`),
      toggleLike:p=>req(`sc/v1/likes/${p.wp}`,{method:'POST'}),
      comments:p=>req(`wp/v2/comments?post=${p.wp}&per_page=100&order=asc`).then(a=>a.map(c=>({name:c.author_name,date:c.date.slice(0,10),text:strip(c.content.rendered)}))),
      postComment:(p,f)=>req('wp/v2/comments',{method:'POST',body:JSON.stringify({post:p.wp,author_name:f.name,author_email:f.email,content:f.text})})};}
  const mem={},st=p=>mem[p.id]=mem[p.id]||{count:p.likes||0,liked:false,list:(p.comments||[]).map(([name,date,text])=>({name,date,text}))};
  return {live:false,
    likes:async p=>({count:st(p).count,liked:st(p).liked}),
    toggleLike:async p=>{const x=st(p);x.liked=!x.liked;x.count+=x.liked?1:-1;return {count:x.count,liked:x.liked};},
    comments:async p=>st(p).list,
    postComment:async()=>({status:'hold'})};})();

/* 喜欢按钮：作品集下面的留言区和阅读器最后一页各有一个，点任何一个，两个一起变 */
const LIKES=(function(){const state={};
  const paint=(btn,p)=>{const x=state[p.id];if(!x)return;btn.setAttribute('aria-pressed',x.liked);$('.like__t',btn).textContent=x.liked?'已喜欢':'喜欢';$('.like__n',btn).textContent=x.count;
    btn.setAttribute('aria-label',`${x.liked?'取消喜欢':'喜欢'}《${p.title}》，现在有 ${x.count} 人喜欢`);};
  const all=p=>$$(`.like[data-id="${p.id}"]`).forEach(b=>paint(b,p));
  async function load(p){try{state[p.id]=await WPAPI.likes(p);}catch(_){state[p.id]={count:p.likes||0,liked:false};}all(p);}
  function bind(btn,p){btn.dataset.id=p.id;paint(btn,p);if(!state[p.id])load(p);
    btn.onclick=async()=>{btn.disabled=true;try{state[p.id]=await WPAPI.toggleLike(p);all(p);
      if(state[p.id].liked&&MOTION)gsap.fromTo($('svg',btn),{scale:.6},{scale:1,duration:.6,ease:'elastic.out(1,.4)'});}catch(_){}btn.disabled=false;};}
  const html=()=>`<button class="like" type="button" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.3s-7.6-4.6-9.3-9.4C1.4 7.2 3.6 4 6.9 4c2.1 0 3.6 1.2 5.1 3 1.5-1.8 3-3 5.1-3 3.3 0 5.5 3.2 4.2 6.9-1.7 4.8-9.3 9.4-9.3 9.4z"/></svg><span class="like__t">喜欢</span><b class="like__n">0</b></button>`;
  return {bind,html};})();

/* 留言：已通过的按时间排，自己刚提交的显示「等待审核」 */
const COMMENTS=(function(){const list=$('#cmList'),form=$('#cmForm');let piece=null;const mine={};
  const date=t=>{const[y,m,d]=t.split('-').map(Number);return `${y} 年 ${m} 月 ${d} 日`;};
  let ok=[];
  const render=()=>{const my=mine[piece.id]||[];
    list.innerHTML=ok.map(c=>`<li><div class="cm__who"><b>${esc(c.name)}</b><span>${date(c.date)}</span></div><p>${esc(c.text)}</p></li>`).join('')
      +my.map(c=>`<li class="pending"><div class="cm__who"><b>${esc(c.name)}</b><span class="chip">等待审核</span></div><p>${esc(c.text)}</p></li>`).join('')
      +(ok.length||my.length?'':`<li class="cm__empty"><p>还没有人留言。</p></li>`);};
  if(form){form.addEventListener('submit',async e=>{e.preventDefault();
    const R={'c-name':v=>v.trim()?'':'请留一个称呼','c-email':v=>/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)?'':'请填写有效的邮箱，只用来回复你','c-msg':v=>v.trim().length>=2?'':'请写下你想说的话'};
    let good=true;for(const id in R){const el=$('#'+id),m=R[id](el.value);$(`.err[data-for="${id}"]`).textContent=m;el.classList.toggle('invalid',!!m);if(m&&good){good=false;el.focus();}}
    if(!good)return;const f={name:$('#c-name').value.trim(),email:$('#c-email').value.trim(),text:$('#c-msg').value.trim()};
    const btn=$('button[type=submit]',form);btn.disabled=true;let n=$('.cm__sent',form);if(!n){n=document.createElement('p');n.className='cm__sent t-small';form.appendChild(n);}
    try{const r=await WPAPI.postComment(piece,f);
      if(r.status==='approved'){ok=await WPAPI.comments(piece);}else (mine[piece.id]=mine[piece.id]||[]).push(f);
      $('#c-msg').value='';render();n.textContent=WPAPI.live?'已收到，编辑看过后会显示在这里。':'已收到。这是原型，留言没有真正发送。';
      const li=list.lastElementChild;if(li&&MOTION)gsap.from(li,{opacity:0,y:12,duration:.5,ease:EN});}
    catch(err){n.textContent='没有发出去，请稍后再试。'+(err.message?`（${err.message}）`:'');}
    btn.disabled=false;});
    $$('input,textarea',form).forEach(el=>el.addEventListener('input',()=>{el.classList.remove('invalid');const er=$(`.err[data-for="${el.id}"]`);if(er)er.textContent='';}));}
  return {show:async p=>{piece=p;if(!list)return;$('#cmTitle').textContent=`读完《${p.title}》想说点什么就写在这里`;LIKES.bind($('#likeBtn'),p);
    ok=[];render();try{ok=await WPAPI.comments(p);}catch(_){ok=[];}if(piece===p)render();const n=form&&$('.cm__sent',form);if(n)n.remove();}};})();

/* ---------- 书友作品集 ----------
   每一篇是一个摊开的对页：左页竖排篇名和署名，右页是开头一段。没轮到的几篇往两边叠起来，
   离中间越远叠得越深。拖动、点两边、方向键都可以换一篇；点中间那一篇，或者按回车，翻开来读。
   叠页的算法参考 21st.dev 上的 Journal Spread Carousel，改成了不依赖 React 的写法。 */
const ANTH_PAPER={'灰绿':'#C6CBA8','麦黄':'#E9DCB5','雾蓝':'#C9DEE3','米灰':'#DEDAC1','藕粉':'#E7CFC4'};
/* 左页用原来标签的纸做纸面（assets/img/tags/paper-N.webp），和加入我们页的挂牌是同一种纸 */
const ANTH_TEX={'米灰':1,'灰绿':2,'麦黄':3,'雾蓝':4,'藕粉':5};
(function(){const root=$('#anth'),scene=$('#anthScene');if(!root||!WORKS.length)return;
  const OPEN=5,SIDE=80,FOLD=174,n=WORKS.length;
  const clampN=(v,a,b)=>v<a?a:v>b?b:v;
  const opening=t=>{const p=t.split(/\n\s*\n/)[0].trim();return p.length>150?p.slice(0,150)+'……':p;};
  scene.innerHTML=WORKS.map((w,i)=>`<div class="anth__it" data-i="${i}">
    <div class="anth__pg l" style="--pc:${ANTH_PAPER[w.paper]||'#DEDAC1'};background-image:linear-gradient(rgba(250,246,236,.28),rgba(250,246,236,.28)),url(${TEX(ANTH_TEX[w.paper]||1)})"><div class="anth__in">
      <div class="anth__head"><h3 class="anth__t">${esc(w.title)}</h3><p class="anth__a">${esc(w.author)}</p></div></div><i class="anth__shade"></i></div>
    <div class="anth__pg r"><div class="anth__in"><p class="anth__x">${esc(opening(w.text))}</p></div><i class="anth__shade"></i></div></div>`).join('');
  const its=$$('.anth__it',scene),pgs=its.map(it=>$$('.anth__pg',it));
  let W=0,pos=0,target=0,tw=null,raf=0,drag=null;
  /* p 是离中间几篇：0 摊开在中间，±1 是两边最上面的一篇，再远的往外、往后退 */
  const pose=(p,w)=>{const d=Math.abs(p),a=Math.min(d,1),sg=p<0?-1:1,out=Math.max(0,d-1);
    const fold=a*a;
    return {x:sg*(a*(w*.5+w*.03)+out*w*.055),z:-(a*w*.42+out*w*.06),
      l:p>0?OPEN+(FOLD-OPEN)*fold:OPEN+(SIDE-OPEN)*a,r:p<0?-(OPEN+(FOLD-OPEN)*fold):-(OPEN+(SIDE-OPEN)*a),
      op:clampN(7.2-d,0,1)};};
  const shade=deg=>clampN((Math.abs(deg)-OPEN)/95,0,.62);
  const paint=()=>{its.forEach((el,i)=>{const q=pose(i-pos,W);el.style.transform=`translate3d(${q.x.toFixed(1)}px,0,${q.z.toFixed(1)}px)`;el.style.opacity=q.op;
    const[l,r]=pgs[i];l.style.transform=`rotateY(${q.l.toFixed(2)}deg)`;r.style.transform=`rotateY(${q.r.toFixed(2)}deg)`;
    l.style.setProperty('--s',shade(q.l).toFixed(3));r.style.setProperty('--s',shade(q.r).toFixed(3));
    const cur=Math.round(pos)===i;el.toggleAttribute('data-cur',cur);el.setAttribute('aria-hidden',cur?'false':'true');});};
  const frame=t=>{raf=0;if(tw){const k=tw.dur?clampN((t-tw.t0)/tw.dur,0,1):1;pos=tw.a+(tw.b-tw.a)*(k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2);if(k>=1)tw=null;}
    paint();if(tw)raf=requestAnimationFrame(frame);};
  const kick=()=>{if(!raf)raf=requestAnimationFrame(frame);};
  const show=i=>{const w=WORKS[i];$('#anthT').textContent=`《${w.title}》`;$('#anthA').textContent=w.author;COMMENTS.show(w);
    $('#anthPrev').classList.toggle('off',i===0);$('#anthNext').classList.toggle('off',i===n-1);};
  const go=i=>{i=clampN(i,0,n-1);if(i!==target){target=i;show(i);}
    const steps=Math.abs(i-pos);tw={a:pos,b:i,t0:performance.now(),dur:RM?0:Math.round(560*Math.sqrt(Math.min(steps,12)))};kick();};
  const size=()=>{const sw=root.clientWidth,sh=root.clientHeight,narrow=sw<640,asp=narrow&&sh>sw?.86:1.25;
    W=Math.round(Math.min(sw*(narrow?.84:.54),sh*.9*asp,980));root.style.setProperty('--w',W+'px');root.style.setProperty('--h',Math.round(W/asp)+'px');paint();};
  new ResizeObserver(size).observe(root);
  /* 读到最后一页，阅读器下面换成：喜欢、写留言、在公众号读原文 */
  const endRow=(box,w)=>{box.innerHTML=`${LIKES.html()}<button type="button" class="rd__btn" data-cm>写留言</button><a class="rd__btn" href="${w.url}" target="_blank" rel="noopener">在公众号读原文</a>`;
    LIKES.bind($('.like',box),w);
    $('[data-cm]',box).onclick=()=>{window.BookReader.close();const y=$('#works-comments').getBoundingClientRect().top+scrollY-90;lenis?lenis.scrollTo(y,{duration:1}):window.scrollTo({top:y,behavior:'smooth'});setTimeout(()=>$('#c-name').focus({preventScroll:true}),900);};};
  const read=i=>{const w=WORKS[i];if(!window.BookReader)return;
    window.BookReader.open(w,{paper:ANTH_PAPER[w.paper]||'#C6CBA8',tex:TEX(ANTH_TEX[w.paper]||1),renderEnd:endRow,onOpen:()=>{if(lenis)lenis.stop();}});};
  if(window.BookReader)window.BookReader.onClose=()=>{if(lenis)lenis.start();};
  root.addEventListener('pointerdown',e=>{if(e.button>0)return;tw=null;drag={id:e.pointerId,x:e.clientX,from:pos,lx:e.clientX,lt:e.timeStamp,v:0,moved:false};});
  root.addEventListener('pointermove',e=>{const d=drag;if(!d||d.id!==e.pointerId||!W)return;const dx=e.clientX-d.x;
    if(!d.moved&&Math.abs(dx)>6){d.moved=true;root.setPointerCapture(e.pointerId);root.classList.add('is-drag');}
    if(!d.moved)return;const dt=Math.max(1,e.timeStamp-d.lt);d.v=d.v*.6+(-(e.clientX-d.lx)/(W*.42)/(dt/1000))*.4;d.lx=e.clientX;d.lt=e.timeStamp;
    pos=clampN(d.from-dx/(W*.42),-.3,n-.7);kick();});
  const up=e=>{const d=drag;if(!d||d.id!==e.pointerId)return;drag=null;root.classList.remove('is-drag');
    if(d.moved){go(Math.round(pos+clampN(d.v*.18,-1.5,1.5)));return;}
    const it=e.target.closest('.anth__it');if(!it)return;const i=+it.dataset.i;
    if(i===Math.round(pos))read(i);else go(i);};
  root.addEventListener('pointerup',up);root.addEventListener('pointercancel',e=>{if(drag){drag.moved=true;up(e);}});
  root.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();go(target+1);}else if(e.key==='ArrowLeft'){e.preventDefault();go(target-1);}else if(e.key==='Enter'){e.preventDefault();read(target);}});
  $('#anthPrev').onclick=()=>go(target-1);$('#anthNext').onclick=()=>go(target+1);$('#anthOpen').onclick=()=>read(target);
  $('#anthHead').textContent=`书友的${cn(n)}篇文章`;
  show(0);size();})();

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
    [['.icards','.icard'],['.ideas','li'],['.story__who','li'],['.cols','.col4'],['.figs','li'],['.orgfig','li'],['.slip ol','li'],['.stamps','.stamp'],['.folds','.fold'],['.rail__list','.hang'],['.envs','.env'],['.clock','li'],['.flow','li'],['.amp',':scope > *'],['.qs','li'],['.stats',':scope > div'],['.logos','.logo-c'],['.realshelf','.book']].forEach(([w,c])=>$$(w,page).forEach(el=>rise($$(c,el),el)));
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
