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

const BOOKS=[
  ['边城','沈从文','#6B7756',15],['活着','余华','#3A4A36',16],['许三观卖血记','余华','#A2AC87',18,'#2B3326'],['倾城之恋','张爱玲','#8E6F3E',16],['金锁记','张爱玲','#C9B98F',14,'#2B3326'],['呼兰河传','萧红','#3A4A36',17],['额尔古纳河右岸','迟子建','#7C5A34',19]];
$('#shelf').innerHTML=BOOKS.map(([t,a,c,h,tc])=>`<div class="spine" style="--bk:${c};--sh:${h}em;${tc?'--bt:'+tc:''}" title="${t} · ${a}"><b>${t}</b><span>${a}</span></div>`).join('');

const TERMS=[
  {id:'t3',books:[['呼兰河传','萧红','#3A4A36'],['额尔古纳河右岸','迟子建','#7C5A34']],cap:['春夜朗读','呼兰河传 · 上','学期照片'],name:'2026 年第三学期',theme:'故乡与远方',intro:'进行中。读萧红和迟子建，学期结束后补充回顾与照片。',list:EV.map(e=>[fmt(e.d),e.type,e.title])},
  {id:'t2',books:[['倾城之恋','张爱玲','#8E6F3E'],['金锁记','张爱玲','#6B7756']],cap:['冬夜朗读','线上讲座','金锁记读书会'],name:'2026 年第二学期',theme:'张爱玲的城',intro:'集中读张爱玲。第一次办线上公益讲座，悉尼和布里斯班的读者也来了。讨论里争得最久的问题是：白流苏到底赢了没有。',list:[['5月9日','线下读书会','《倾城之恋》'],['5月10日','嘉宾讲座','张爱玲与《倾城之恋》'],['6月6日','文学夜','冬夜朗读'],['6月20日','线下读书会','《金锁记》']]},
  {id:'t1',books:[['活着','余华','#3A4A36'],['许三观卖血记','余华','#8E9A72']],cap:['开学书单交换','活着 · 上','学期末合影'],name:'2026 年第一学期',theme:'从人物出发',intro:'第一次以学期为单位读书。两本余华，从福贵读到许三观，很多人说第一次在读书会上哭。',list:[['2月21日','线下读书会','《活着》（上）'],['3月7日','文学夜','开学书单交换'],['3月21日','线上讨论','《活着》（下）'],['4月11日','线下读书会','《许三观卖血记》']]},
  {id:'t0',books:[['边城','沈从文','#6B7756']],cap:['第一次读书会','朗读会','长桌'],name:'2025 年 · 创社',theme:'一张长桌',intro:'从几位朋友在家里读《边城》开始，后来有了微信群、公众号和这个名字。',list:[['2025 秋','线下读书会','《边城》'],['2025 冬','文学夜','第一次公开朗读会']]}];
const TYPES=['全部','线下读书会','文学夜','线上讨论','嘉宾讲座'];
const PP=[['#C6CBA8','#A2AC87'],['#E6E1CC','#C9B98F'],['#DEDAC1','#8E9A72']];
$('#terms').innerHTML=TERMS.map((t,i)=>`<article class="term2" id="${t.id}"><div class="stack"><span class="label">${t.name}</span><h2 class="t-h2">「${t.theme}」</h2><p class="t-body">${t.intro}</p><div class="list" style="width:100%">${t.list.map(l=>`<div class="r" data-type="${l[1]}"><b>${l[0]}</b><span>${l[2]}</span><span class="m">${l[1]}</span></div>`).join('')}</div></div><div class="polas" aria-label="学期照片占位">${t.cap.map((c,k)=>`<figure class="pola" style="--r:${[-5,4,-1.5][k]+(i%2?2:0)}deg;--a:${PP[(k+i)%3][0]};--b:${PP[(k+i)%3][1]}"><div class="ph"></div><figcaption>${c}</figcaption></figure>`).join('')}</div></article>`).join('');
$('#termlist').innerHTML=TERMS.map((t,i)=>`<li data-i="${i}"><a href="#${t.id}">${t.theme}<small>${t.name}</small></a></li>`).join('');
(function(){const sec=$('#termsec'),covs=$$('.tcov',sec);
  $$('#termlist li').forEach(li=>li.addEventListener('pointerenter',()=>{if(!DESK())return;const t=TERMS[+li.dataset.i];$$('#termlist li').forEach(x=>x.classList.toggle('on',x===li));
    const a=$('a',li),lr=a.getBoundingClientRect(),sr=sec.getBoundingClientRect(),cy=lr.top-sr.top+lr.height/2,pos=[[-1,-.3],[1,-.5],[1,.45]];
    covs.forEach((c,k)=>{const bk=t.books[k];if(!bk){c.classList.remove('show');return;}c.innerHTML=`<b>${bk[0]}</b><span>${bk[1]}</span>`;c.style.setProperty('--tc',bk[2]);const w=c.offsetWidth,h=c.offsetHeight;
      const x=lr.left-sr.left+(pos[k][0]<0?-w-30:lr.width+30);c.style.left=x+'px';c.style.top=(cy+pos[k][1]*h-h/2)+'px';c.style.rotate=(pos[k][0]*6)+'deg';c.classList.add('show');});
    sec.dataset.active='true';}));
  $('#termlist').addEventListener('pointerleave',()=>{sec.dataset.active='false';$$('#termlist li').forEach(x=>x.classList.remove('on'));});})();
$('#filters').innerHTML=TYPES.map((t,i)=>`<button type="button" aria-pressed="${i===0}" data-f="${t}">${t}</button>`).join('');
$('#filters').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;$$('#filters button').forEach(x=>x.setAttribute('aria-pressed',x===b));const f=b.dataset.f;
  $$('#terms .r').forEach(r=>r.hidden=f!=='全部'&&r.dataset.type!==f);
  $$('#terms .term2').forEach(t=>t.hidden=f!=='全部'&&!$$('.r',t).some(r=>!r.hidden));
  if(ST)ScrollTrigger.refresh();});

const GEN=[['中文原著',['活着','余华'],['倾城之恋','张爱玲'],['边城','沈从文'],['呼兰河传','萧红']],['世界译作',['百年孤独','马尔克斯'],['变形记','卡夫卡'],['局外人','加缪'],['雪国','川端康成']],['莎士比亚',['哈姆雷特','莎士比亚'],['麦克白','莎士比亚'],['暴风雨','莎士比亚'],['十四行诗','莎士比亚']],['诗歌与散文',['我与地坛','史铁生'],['飞鸟集','泰戈尔'],['背影','朱自清'],['瓦尔登湖','梭罗']],['科幻与推理',['三体','刘慈欣'],['白夜行','东野圭吾'],['沙丘','赫伯特'],['北京折叠','郝景芳']],['历史与非虚构',['万历十五年','黄仁宇'],['江城','何伟'],['巨流河','齐邦媛'],['人类简史','赫拉利']]];
$('#glist').innerHTML=GEN.map((g,i)=>`<li data-i="${i}">${g[0]}</li>`).join('');

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
initSlider('term');initSlider('hist');addEventListener('resize',()=>sliders.forEach(s=>s.measure()));
(function loop(){sliders.forEach(s=>s.tick());requestAnimationFrame(loop);})();

/* calendar */
const months=[9,10,11];let sel=next||EV[0],mi=Math.max(0,months.indexOf(sel.d.getMonth()));
function renderCal(){const m=months[mi],first=new Date(2026,m,1),n=new Date(2026,m+1,0).getDate(),off=(first.getDay()+6)%7;
  $('#mTitle').textContent=`${m+1} 月`;$('#prevM').classList.toggle('off',mi===0);$('#nextM').classList.toggle('off',mi===months.length-1);
  let h='';for(let i=0;i<off;i++)h+='<div class="day blank"></div>';
  for(let d=1;d<=n;d++){const dt=new Date(2026,m,d),ev=EV.find(e=>+e.d===+dt),c=['day'];if(dt>=T0&&dt<=T1)c.push('in');
    if(ev){c.push('ev');if(ev===sel)c.push('sel');h+=`<button type="button" class="${c.join(' ')}" data-t="${+dt}" aria-label="${fmt(dt)} ${ev.title}">${d}</button>`;}else h+=`<div class="${c.join(' ')}">${d}</div>`;}
  $('#days').innerHTML=h;}
function renderDetail(){const e=sel,[sc,sl]=status(e);$('#detail').innerHTML=`<div class="num">${String(e.d.getDate()).padStart(2,'0')}</div><span class="chip ${sc}" style="align-self:flex-start">${sl}</span><h3 class="t-h3">${e.title}</h3><p class="t-body">${e.d.getMonth()+1} 月 · 周${wd[e.d.getDay()]} ${e.t}<br>${e.type} · ${e.place}</p><p class="t-small">${e.desc}</p>`;
  if(G&&!RM)gsap.from('#detail > *',{opacity:0,y:'.6em',duration:.4,stagger:.04,ease:EN});}
$('#days').addEventListener('click',ev=>{const b=ev.target.closest('.day.ev');if(!b)return;sel=EV.find(e=>+e.d===+b.dataset.t);$$('.day.ev').forEach(x=>x.classList.toggle('sel',x===b));renderDetail();});
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
    [['.route','li'],['.slider[data-slider=hist] .track','.hcard'],['.roles','.role'],['.clock','li'],['.bento','div'],['.flow','li'],['.amp',':scope > *'],['.qs','li']].forEach(([w,c])=>$$(w,page).forEach(el=>rise($$(c,el),el)));
    $$('.bfeat,.term2,.stepcards,.letter,.phone,.bigrow,.polas',page).forEach(el=>rise([el],el));
    $$('[data-manifesto]',page).forEach(m=>{const ph=$$('.ph',m);ScrollTrigger.create({trigger:m,start:'top 80%',end:'bottom 45%',scrub:true,onUpdate:st=>{const k=Math.round(st.progress*ph.length);ph.forEach((p,i)=>p.classList.toggle('dim',i>=k));}});});
  },page);}
function home(page){
  const bind=!page.dataset.bound;page.dataset.bound=1;
  rise($$('#termTrack .ecard'),'#termTrack');
  rise($$('#trio .fcard'),'#trio');
  rise($$('.duo .pcard',page),$('.duo',page));
  const tl=gsap.timeline({scrollTrigger:{trigger:'#boxSec',start:'top top',end:'bottom bottom',scrub:.6}});
  gsap.set('#boxContent > *',{opacity:0,y:'2em'});
  tl.fromTo('#book3d',{rotateX:18,rotateZ:-8,scale:.9,y:'4em'},{rotateX:0,rotateZ:0,scale:1,y:0,duration:.25,ease:'none'})
    .to('#bookCover',{rotateY:-178,duration:.3,ease:'power1.inOut'},.15)
    .to('#book3d',{scale:()=>DESK()?5.4:4.2,duration:.35,ease:'power2.in'},.42)
    .to('#boxContent > *',{opacity:1,y:0,stagger:.04,duration:.2,ease:'none'},.68).to({},{duration:.12});
  rise($$('#glist li'),'#glist');
  const sec=$('#genre'),boxes=$$('.gbox',sec),GC=[['#3A4A36','#FAF6EC'],['#FAF6EC','#2B3326'],['#8E6F3E','#FAF6EC'],['#E6E1CC','#2B3326']];
  if(bind){$$('#glist li').forEach(li=>li.addEventListener('pointerenter',()=>{if(!DESK())return;const g=GEN[+li.dataset.i];$$('#glist li').forEach(x=>x.classList.toggle('on',x===li));
      const lr=li.getBoundingClientRect(),sr=sec.getBoundingClientRect(),cy=lr.top-sr.top+lr.height/2,cx=lr.left-sr.left+lr.width/2,pos=[[-1,-1],[1,-1],[-1,1],[1,1]];
      boxes.forEach((b,k)=>{const[t,a]=g[k+1];b.innerHTML=`<b>${t}</b><span>${a}</span>`;b.style.setProperty('--gc',GC[k][0]);b.style.setProperty('--gt',GC[k][1]);const bw=b.offsetWidth,bh=b.offsetHeight;
        b.style.left=(cx+pos[k][0]*(lr.width/2+bw*.45)-bw/2)+'px';b.style.top=(cy+pos[k][1]*bh*.55-bh/2)+'px';b.style.rotate=(pos[k][0]*pos[k][1]*-4)+'deg';});
      sec.dataset.active='true';}));
    $('#glist').addEventListener('pointerleave',()=>{sec.dataset.active='false';$$('#glist li').forEach(x=>x.classList.remove('on'));});
    sec.addEventListener('pointermove',e=>{if(sec.dataset.active!=='true')return;const r=sec.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;boxes.forEach((b,k)=>b.style.translate=`${px*(16+k*5)}px ${py*(16+k*5)}px`);});}
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
  requestAnimationFrame(()=>{if(ST)ScrollTrigger.refresh();pageAnimations(page);if(ST)ScrollTrigger.refresh();});return page;}
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
