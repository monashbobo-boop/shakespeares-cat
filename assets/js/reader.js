/* 书友作品的翻页阅读器
   一本摊开在桌上的书：用 three.js 画纸页，正文排在 canvas 上当贴图，翻页时纸会弯。
   电脑上看左右两页，手机竖屏只看右页，一次翻一页。
   排版规矩：宋体正文，段首空两格，句号逗号不放在行首（挂在上一行行尾），引号书名号不留在行尾。
   页数不用人填，按版面自动排；字多就多几页。
   three.js 只在第一次打开时才下载。加载失败、没有 WebGL，或者读者选「文字版」，就换成普通网页文字，
   字更大、可以放大缩小，也方便读屏软件。 */
window.BookReader = (function () {
  'use strict';
  const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.149.0/build/three.min.js';
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);

  // 书页尺寸（三维空间里的单位）和贴图像素
  const PW = 1, PH = 1.42, SEG = 40;
  const TW = 1024, TH = Math.round(TW * PH);
  // 版心：上、外侧、下、内侧（靠书脊）
  const TOP = 150, BOTTOM = 175, OUTER = 112, INNER = 132;
  const FS = 40, LH = Math.round(FS * 1.9);
  const BODY = `400 ${FS}px "Noto Serif SC","Songti SC","STSong","SimSun",serif`;
  const TITLE = s => `700 ${s}px "LXGW WenKai","Noto Serif SC","Songti SC",serif`;
  const INK = '#2B3326', MOSS = '#6E7A5E', PAPER = '#FBF8EF';
  const CLOSE = '，。、；：？！”’）》」』…—,.;:?!)';
  const OPEN = '“‘（《「『(';
  const Z = 0.0016;

  let THREE = null, loading = null;
  let dlg, stage, gl, textBox, noEl, prevB, nextB, modeB, closeB, titleEl, authEl, srcA, hint;
  let renderer, scene, camera, pool = [], stackL, stackR, cover, shadow;
  let work = null, pages = [], single = false, leaves = 0, s = 0, use3d = true, lastFocus = null;
  let turn = null, drag = null, raf = 0, coverColor = '#C6CBA8';
  const texCache = new Map();
  let GRAIN = null;

  /* ---------------- 排版 ---------------- */
  const measurer = () => { const c = document.createElement('canvas').getContext('2d'); c.font = BODY; return c; };
  const tokens = p => p.match(/[A-Za-z0-9][A-Za-z0-9'’\-]*|\s+|./gu) || [];

  function wrap(ctx, par, width, indent) {
    const out = []; let cur = '', w = indent, first = true;
    for (let t of tokens(par.trim())) {
      if (/^\s+$/.test(t)) { if (!cur) continue; t = ' '; }
      const tw = ctx.measureText(t).width;
      if (w + tw > width && cur) {
        if (t.length === 1 && CLOSE.includes(t)) { cur += t; w += tw; continue; }   // 标点挂在行尾
        let carry = '';
        while (cur && OPEN.includes(cur[cur.length - 1])) { carry = cur[cur.length - 1] + carry; cur = cur.slice(0, -1); }
        out.push({ t: cur.replace(/\s+$/, ''), ind: first }); first = false;
        cur = carry + (t === ' ' ? '' : t); w = ctx.measureText(cur).width; continue;
      }
      cur += t; w += tw;
    }
    if (cur) out.push({ t: cur, ind: first, last: true });
    return out;
  }

  function titleLines(ctx, t, size, width) {
    ctx.font = TITLE(size); const out = []; let cur = '';
    for (const ch of t) { if (ctx.measureText(cur + ch).width > width && cur) { out.push(cur); cur = ch; } else cur += ch; }
    if (cur) out.push(cur); return out;
  }

  function paginate(w) {
    const ctx = measurer(), width = TW - OUTER - INNER, avail = TH - TOP - BOTTOM, per = Math.floor(avail / LH);
    const lines = [];
    w.text.split(/\n\s*\n/).forEach(p => { ctx.font = BODY; wrap(ctx, p, width, FS * 2).forEach(l => lines.push(l)); });
    const tl = titleLines(ctx, w.title, 62, width);
    const reserve = Math.ceil((tl.length * 62 * 1.4 + 34 * 1.6 + 120) / LH);
    const out = []; let i = 0, first = true;
    while (i < lines.length) { const n = first ? per - reserve : per; out.push({ lines: lines.slice(i, i + n), title: first ? tl : null }); i += n; first = false; }
    const last = out[out.length - 1];
    if (last.lines.length <= per - 2) last.end = true; else out.push({ lines: [], end: true });
    return out;
  }

  /* ---------------- 画一页 ---------------- */
  function grain() {
    if (GRAIN) return GRAIN;
    const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d');
    const img = g.createImageData(256, 256);
    for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 7; }
    g.putImageData(img, 0, 0); GRAIN = c; return c;
  }

  // spine: 'l' 表示书脊在这一页的左边（右页），'r' 表示在右边（左页）
  function paint(kind, k, spine) {
    const c = document.createElement('canvas'); c.width = TW; c.height = TH; const g = c.getContext('2d');
    const endpaper = kind === 'endL' || kind === 'endR';
    g.fillStyle = endpaper ? coverColor : PAPER; g.fillRect(0, 0, TW, TH);
    g.fillStyle = g.createPattern(grain(), 'repeat'); g.fillRect(0, 0, TW, TH);
    // 靠书脊的一侧暗一点，像纸往装订线里弯进去
    const gr = spine === 'l' ? g.createLinearGradient(0, 0, TW * .16, 0) : g.createLinearGradient(TW, 0, TW * .84, 0);
    gr.addColorStop(0, 'rgba(58,50,28,.24)'); gr.addColorStop(.25, 'rgba(58,50,28,.08)'); gr.addColorStop(1, 'rgba(58,50,28,0)');
    g.fillStyle = gr; g.fillRect(0, 0, TW, TH);
    const ox = spine === 'l' ? INNER : OUTER;   // 左边距
    if (kind === 'endL') {
      g.fillStyle = 'rgba(43,51,38,.55)'; g.font = TITLE(30); g.textAlign = 'center';
      g.fillText('莎士比亚的猫文学社', TW / 2, TH - 150); g.font = `400 24px "Noto Sans SC",sans-serif`; g.fillText('书友作品', TW / 2, TH - 108);
      return c;
    }
    if (kind !== 'page') return c;
    const p = pages[k]; if (!p) return c;
    let y = TOP;
    if (p.title) {
      g.fillStyle = INK; g.font = TITLE(62); g.textBaseline = 'alphabetic';
      y += 62; p.title.forEach(t => { g.fillText(t, ox, y); y += 62 * 1.4; });
      g.font = `500 34px "Noto Sans SC",sans-serif`; g.fillStyle = MOSS; g.fillText(work.author, ox, y + 6);
      y = TOP + Math.ceil((p.title.length * 62 * 1.4 + 34 * 1.6 + 120) / LH) * LH;
    }
    g.font = BODY; g.fillStyle = INK; g.textBaseline = 'alphabetic';
    const width = TW - OUTER - INNER;
    p.lines.forEach((l, i) => {
      const by = y + i * LH + FS;
      const x0 = ox + (l.ind ? FS * 2 : 0), avail = width - (l.ind ? FS * 2 : 0);
      const tk = tokens(l.t); const tw = g.measureText(l.t).width;
      // 两端对齐：最后一行不撑开；挂出去的标点让行稍微压一点
      const gaps = tk.length - 1, extra = l.last || gaps < 1 ? 0 : (avail - tw) / gaps;
      if (Math.abs(extra) > FS * .5) { g.fillText(l.t, x0, by); return; }
      let x = x0; tk.forEach(t => { g.fillText(t, x, by); x += g.measureText(t).width + extra; });
    });
    if (p.end) {
      g.font = `400 ${Math.round(FS * .8)}px "Noto Serif SC",serif`; g.fillStyle = MOSS; g.textAlign = 'center';
      g.fillText('（完）', TW / 2, y + p.lines.length * LH + FS * 2.4); g.textAlign = 'left';
    }
    g.font = `400 26px "Noto Sans SC",sans-serif`; g.fillStyle = MOSS; g.textAlign = 'center';
    g.fillText(String(k + 1), TW / 2, TH - 92);
    return c;
  }

  // 第 leaf 张纸的正面或背面是什么
  function face(leaf, side) {
    if (leaf < 0 || leaf >= leaves) return null;
    if (single) return side === 'f' ? { kind: 'page', k: leaf } : { kind: 'blank' };
    const k = side === 'f' ? 2 * leaf : 2 * leaf + 1;
    return k < pages.length ? { kind: 'page', k } : { kind: 'blank' };
  }

  function tex(f, spine, flip) {
    const key = `${f.kind}:${f.k ?? ''}:${spine}:${flip ? 1 : 0}`;
    if (texCache.has(key)) return texCache.get(key);
    const t = new THREE.CanvasTexture(paint(f.kind, f.k, spine));
    t.encoding = THREE.sRGBEncoding; t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    if (flip) { t.wrapS = THREE.RepeatWrapping; t.repeat.x = -1; t.offset.x = 1; }
    texCache.set(key, t);
    if (texCache.size > 28) { const [k0, v0] = texCache.entries().next().value; v0.dispose(); texCache.delete(k0); }
    return t;
  }
  const clearTex = () => { texCache.forEach(t => t.dispose()); texCache.clear(); };

  /* ---------------- 三维场景 ---------------- */
  function makeLeaf() {
    const geo = new THREE.PlaneGeometry(PW, PH, SEG, 1); geo.translate(PW / 2, 0, 0);
    const front = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ side: THREE.FrontSide }));
    const back = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ side: THREE.BackSide }));
    const g = new THREE.Group(); g.add(front, back); g.userData = { geo, front, back, leaf: -1, theta: -1 };
    scene.add(g); return g;
  }

  // 纸从书脊绕过去：外侧先抬起来，整张纸弯成一道弧，落下时再摊平
  function bend(o, theta) {
    if (o.userData.theta === theta) return; o.userData.theta = theta;
    const pos = o.userData.geo.attributes.position, ds = PW / SEG;
    const curl = Math.sin(theta) * 0.55;   // 翻到一半时弯得最厉害，外侧领先一点
    let x = 0, z = 0;
    for (let c = 0; c <= SEG; c++) {
      if (c > 0) {
        const u = (c - .5) / SEG, a = Math.min(Math.PI, Math.max(0, theta + curl * Math.pow(u, 1.6)));
        x += ds * Math.cos(a); z += ds * Math.sin(a);
      }
      pos.setX(c, x); pos.setZ(c, z); pos.setX(SEG + 1 + c, x); pos.setZ(SEG + 1 + c, z);
    }
    pos.needsUpdate = true; o.userData.geo.computeVertexNormals(); o.userData.geo.computeBoundingSphere();
  }

  function build() {
    renderer = new THREE.WebGLRenderer({ canvas: gl, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.outputEncoding = THREE.sRGBEncoding;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(28, 1, .1, 30);
    scene.add(new THREE.AmbientLight(0xffffff, .58));
    const sun = new THREE.DirectionalLight(0xfff6e6, .5); sun.position.set(-1.4, 1.6, 3.2); scene.add(sun);
    const edge = new THREE.MeshLambertMaterial({ color: 0xE9E2CE });
    stackL = new THREE.Mesh(new THREE.BoxGeometry(PW, PH, 1), edge); stackR = stackL.clone();
    scene.add(stackL, stackR);
    cover = new THREE.Mesh(new THREE.BoxGeometry(PW * 2 + .07, PH + .07, .03), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    scene.add(cover);
    // 书下面一团柔和的影子
    const sc = document.createElement('canvas'); sc.width = sc.height = 128; const sg = sc.getContext('2d');
    const rg = sg.createRadialGradient(64, 64, 10, 64, 64, 64); rg.addColorStop(0, 'rgba(0,0,0,.55)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
    sg.fillStyle = rg; sg.fillRect(0, 0, 128, 128);
    shadow = new THREE.Mesh(new THREE.PlaneGeometry(PW * 2.9, PH * 1.5), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
    scene.add(shadow);
    for (let i = 0; i < 4; i++) pool.push(makeLeaf());
  }

  function fit() {
    if (!renderer) return;
    const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    const wasSingle = single; single = w < 700 && h > w;
    if (wasSingle !== single && work) relayout(wasSingle);
    const tw = single ? PW * 1.12 : PW * 2.2, th = PH * 1.2, half = Math.tan(camera.fov * Math.PI / 360);
    const d = Math.max((th / 2) / half, (tw / 2) / (half * camera.aspect));
    const cx = single ? PW / 2 : 0;
    camera.position.set(cx, -d * .12, d); camera.lookAt(cx, .02, 0); camera.updateProjectionMatrix();
    draw();
  }

  // 改变单页 / 双页时，停在原来那一页附近
  function relayout(wasSingle) {
    const page = wasSingle ? s : Math.max(0, 2 * s - 1);
    leaves = single ? pages.length : Math.ceil(pages.length / 2);
    s = single ? Math.min(page, leaves - 1) : Math.ceil(page / 2);
    turn = null; clearTex(); pool.forEach(o => { o.userData.leaf = -1; });
  }

  function place() {
    const t = turn, depth = n => Math.min(n, 60) * .0022 + .003;
    const dl = depth(s), dr = depth(leaves - s);
    // 纸堆的顶面放在第二张纸下面，免得把下一页挡住
    const top = -2 * Z - .0006;
    stackL.scale.z = dl; stackL.position.set(-PW / 2, 0, top - dl / 2);
    stackR.scale.z = dr; stackR.position.set(PW / 2, 0, top - dr / 2);
    stackL.visible = s > 0 && !single; stackR.visible = s < leaves;
    const dmax = Math.max(dl, dr);
    cover.position.set(0, 0, top - dmax - .016); shadow.position.set(0, -.04, top - dmax - .035);
    // 用到的纸：左边最上面两张、右边最上面两张，翻的那张在最上面
    const want = [s - 2, s - 1, s, s + 1].filter(j => j >= 0 && j < leaves);
    pool.forEach((o, i) => {
      const j = want[i]; o.visible = j !== undefined; if (!o.visible) return;
      if (o.userData.leaf !== j) {
        o.userData.leaf = j;
        const f = face(j, 'f'), b = face(j, 'b');
        o.userData.front.material.map = tex(f, 'l', false); o.userData.front.material.needsUpdate = true;
        o.userData.back.material.map = tex(b || { kind: 'blank' }, 'r', true); o.userData.back.material.needsUpdate = true;
      }
      let theta = j < s ? Math.PI : 0, z = j < s ? -(s - 1 - j) * Z : -(j - s) * Z;
      if (t && t.leaf === j) { theta = t.theta; z = .004; }
      if (single && theta > Math.PI * .98) { o.visible = false; return; }   // 手机上翻过去的纸不用画
      bend(o, theta); o.position.z = z;
    });
  }

  function draw() { if (!renderer) return; place(); renderer.render(scene, camera); }

  /* ---------------- 翻页 ---------------- */
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function animateTo(target, done) {
    const from = turn.theta, dur = RM ? 0 : 380 + 520 * Math.abs(target - from) / Math.PI, t0 = performance.now();
    cancelAnimationFrame(raf);
    const step = now => {
      const k = dur ? Math.min(1, (now - t0) / dur) : 1;
      turn.theta = from + (target - from) * ease(k); draw();
      if (k < 1) raf = requestAnimationFrame(step); else done();
    };
    raf = requestAnimationFrame(step);
  }

  function go(dir) {
    if (turn || !work) return;
    if (!use3d) return;
    if (dir > 0 && s >= leaves) return; if (dir < 0 && s <= 0) return;
    turn = { leaf: dir > 0 ? s : s - 1, theta: dir > 0 ? 0 : Math.PI, dir };
    animateTo(dir > 0 ? Math.PI : 0, () => finish(true));
  }

  function finish(done) {
    const d = turn.dir; turn = null;
    if (done) s += d > 0 ? 1 : -1;
    draw(); status();
  }

  function status() {
    const n = pages.length;
    let a, b;
    if (single) { a = Math.min(s + 1, n); noEl.textContent = s >= leaves ? `读完了，共 ${n} 页` : `第 ${a} 页，共 ${n} 页`; }
    else {
      a = 2 * s; b = 2 * s + 1;   // 左页、右页的序号（从 1 数）
      const L = s > 0 && a <= n ? a : 0, R = s < leaves && b <= n ? b : 0;
      noEl.textContent = !L && !R ? `读完了，共 ${n} 页` : L && R ? `第 ${L} 至 ${R} 页，共 ${n} 页` : `第 ${L || R} 页，共 ${n} 页`;
    }
    prevB.disabled = s <= 0; nextB.disabled = s >= leaves;
  }

  /* 拖着翻：按住纸往书脊方向拉，过了一半松手就翻过去，不到一半就落回来；只是点一下就直接翻一页 */
  function screenX(x) { const v = new THREE.Vector3(x, 0, 0).project(camera); return (v.x + 1) / 2 * stage.clientWidth; }

  function onDown(e) {
    if (!use3d || turn || e.button > 0) return;
    const r = stage.getBoundingClientRect(), x = e.clientX - r.left;
    const spine = single ? stage.clientWidth / 2 : screenX(0);
    const dir = x >= spine ? 1 : -1;
    drag = { x0: e.clientX, y0: e.clientY, dir, on: false, px: e.clientX, pt: e.timeStamp, v: 0, pw: Math.abs(screenX(PW) - screenX(0)) };
  }
  function onMove(e) {
    const d = drag; if (!d) return;
    const dx = e.clientX - d.x0;
    if (!d.on) {
      if (Math.hypot(dx, e.clientY - d.y0) < 8) return;
      if ((d.dir > 0 && s >= leaves) || (d.dir < 0 && s <= 0)) { drag = null; return; }
      d.on = true; stage.setPointerCapture(e.pointerId);
      turn = { leaf: d.dir > 0 ? s : s - 1, theta: d.dir > 0 ? 0 : Math.PI, dir: d.dir };
    }
    const k = Math.max(0, Math.min(1, (d.dir > 0 ? -dx : dx) / (d.pw * (single ? 1.1 : 1.6))));
    turn.theta = d.dir > 0 ? k * Math.PI : Math.PI * (1 - k);
    d.v = (e.clientX - d.px) / Math.max(1, e.timeStamp - d.pt); d.px = e.clientX; d.pt = e.timeStamp;
    draw();
  }
  function onUp() {
    const d = drag; drag = null; if (!d) return;
    if (!d.on) { go(d.dir); return; }
    const k = d.dir > 0 ? turn.theta / Math.PI : 1 - turn.theta / Math.PI;
    const fling = d.dir > 0 ? d.v < -.5 : d.v > .5;
    const ok = k > .4 || fling;
    animateTo(ok ? (d.dir > 0 ? Math.PI : 0) : (d.dir > 0 ? 0 : Math.PI), () => finish(ok));
  }

  /* ---------------- 对话框 ---------------- */
  function ui() {
    dlg = document.createElement('div'); dlg.className = 'rd'; dlg.hidden = true;
    dlg.setAttribute('role', 'dialog'); dlg.setAttribute('aria-modal', 'true'); dlg.setAttribute('aria-labelledby', 'rdT');
    dlg.innerHTML = `
      <div class="rd__top"><div class="rd__who"><h2 id="rdT"></h2><p id="rdA"></p></div>
        <div class="rd__acts"><button type="button" class="rd__btn" id="rdMode"></button><button type="button" class="rd__btn" id="rdClose">关闭</button></div></div>
      <div class="rd__stage" id="rdStage"><canvas class="rd__gl" aria-hidden="true"></canvas>
        <p class="rd__hint" id="rdHint">点右边翻到下一页，点左边翻回去，也可以按住纸往中间拖。</p>
        <div class="rd__text" id="rdText" tabindex="0" hidden></div></div>
      <div class="rd__bar"><button type="button" class="rd__btn" id="rdPrev">上一页</button><span class="rd__no" id="rdNo" aria-live="polite"></span><button type="button" class="rd__btn" id="rdNext">下一页</button></div>
      <div class="rd__foot"><a class="rd__src" id="rdSrc" target="_blank" rel="noopener">在公众号读原文</a></div>`;
    document.body.appendChild(dlg);
    stage = $('#rdStage', dlg); gl = $('.rd__gl', dlg); textBox = $('#rdText', dlg); noEl = $('#rdNo', dlg);
    prevB = $('#rdPrev', dlg); nextB = $('#rdNext', dlg); modeB = $('#rdMode', dlg); closeB = $('#rdClose', dlg);
    titleEl = $('#rdT', dlg); authEl = $('#rdA', dlg); srcA = $('#rdSrc', dlg); hint = $('#rdHint', dlg);
    prevB.onclick = () => go(-1); nextB.onclick = () => go(1); closeB.onclick = close;
    modeB.onclick = () => setMode(!use3d, true);
    stage.addEventListener('pointerdown', onDown); stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerup', onUp); stage.addEventListener('pointercancel', onUp);
    // 点在纸上以后焦点会落到页面上，所以键盘监听放在整个文档，只在阅读器打开时生效
    document.addEventListener('keydown', e => {
      if (dlg.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (use3d && !/INPUT|TEXTAREA/.test(e.target.tagName)) {
        if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); go(1); }
        if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); go(-1); }
      }
      if (e.key === 'Tab') {   // 焦点只在对话框里转
        const f = [...dlg.querySelectorAll('button:not([disabled]),a[href],[tabindex="0"]:not([hidden])')].filter(x => x.offsetParent);
        if (!f.length) return; const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
    addEventListener('resize', () => { if (!dlg.hidden && use3d) fit(); });
  }

  function setMode(three, user) {
    use3d = three && !!THREE;
    gl.hidden = !use3d; hint.hidden = !use3d; textBox.hidden = use3d;
    prevB.hidden = nextB.hidden = noEl.hidden = !use3d;
    modeB.textContent = use3d ? '改成文字版' : '改成翻页版';
    modeB.hidden = !THREE;
    if (use3d) { fit(); status(); } else if (user) textBox.focus();
    try { localStorage.setItem('sc-reader', use3d ? '3d' : 'text'); } catch (_) { }
  }

  function fillText(w) {
    textBox.innerHTML = `<h3>${esc(w.title)}</h3><p class="rd__by">${esc(w.author)}</p>` +
      w.text.split(/\n\s*\n/).map(p => `<p>${esc(p.trim())}</p>`).join('') + '<p class="rd__end">（完）</p>';
  }
  const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function loadThree() {
    if (window.THREE) return Promise.resolve(window.THREE);
    if (!loading) loading = new Promise((res, rej) => {
      const sc = document.createElement('script'); sc.src = THREE_URL; sc.async = true;
      sc.onload = () => window.THREE ? res(window.THREE) : rej(new Error('three')); sc.onerror = rej; document.head.appendChild(sc);
    });
    return loading;
  }

  function webgl() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (_) { return false; } }

  async function open(w, opts = {}) {
    if (!dlg) ui();
    work = w; coverColor = opts.paper || '#C6CBA8'; lastFocus = document.activeElement;
    titleEl.textContent = w.title; authEl.textContent = w.author; srcA.href = w.url || '#';
    fillText(w);
    dlg.hidden = false; document.documentElement.classList.add('rd-open'); opts.onOpen && opts.onOpen();
    noEl.textContent = '正在排版…';
    let pref = '3d'; try { pref = localStorage.getItem('sc-reader') || '3d'; } catch (_) { }
    closeB.focus();
    try {
      if (!webgl()) throw new Error('no webgl');
      THREE = await loadThree();
      // 等正文和标题用的字体下载好再排版，不然 canvas 会先用系统字体量尺寸
      await Promise.all([document.fonts.load(BODY, w.text.slice(0, 400) + w.text.slice(-200)), document.fonts.load(TITLE(62), w.title)]).catch(() => { });
      if (!renderer) build();
      cover.material.color.set(coverColor);
      pages = paginate(w); clearTex(); pool.forEach(o => { o.userData.leaf = -1; o.userData.theta = -1; });
      single = false; s = 0; turn = null; leaves = Math.ceil(pages.length / 2);
      fit();   // 手机竖屏会在这里切成单页，并重新算张数
      setMode(pref !== 'text', false);
    } catch (err) {
      THREE = null; setMode(false, false);
      noEl.hidden = true;
    }
  }

  function close() {
    if (!dlg || dlg.hidden) return;
    cancelAnimationFrame(raf); turn = null; drag = null;
    dlg.hidden = true; document.documentElement.classList.remove('rd-open');
    if (open.onClose) open.onClose();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  return { open, close, set onClose(f) { open.onClose = f; } };
})();
