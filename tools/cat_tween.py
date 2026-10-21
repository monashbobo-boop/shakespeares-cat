"""在 ChatGPT 画的关键帧之间用光流自动补中间帧，让猫的动作连贯。

用法：python3 tools/cat_tween.py
读取 assets/img/cat/frames/01.png–16.png，输出：
  assets/img/cat/cat-anim.webp   所有帧拼成的精灵图
  assets/js/cat-anim.js          每一格的播放顺序和停留时间（网页按这个播放）
  assets/img/cat/cat-still.webp  第一帧，整张图加载完之前先显示它
要改节奏，只改下面的 PLAN。
"""
import json, pathlib, sys
import numpy as np, cv2
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'assets/img/cat/frames'
OUT_IMG = ROOT / 'assets/img/cat/cat-anim.webp'
OUT_JS = ROOT / 'assets/js/cat-anim.js'
OUT_STILL = ROOT / 'assets/img/cat/cat-still.webp'
W, H, HEAD = 1280, 640, 176          # source canvas, plus headroom on top for the standing poses
CW = 400                             # output cell width (height follows)
CH = round(CW * (H + HEAD) / W)
COLS = 12
FPS = 24
# Standing poses: lift the supporting paws onto the title ledge (fraction of canvas height)
LIFT = {8: -.23, 9: -.12, 10: -.12, 11: -.25, 12: -.12, 13: -.12, 14: -.07}
# Each row: (from, to, in-betweens, hold on `to` in seconds, dx, mode)
#   dx   = horizontal travel during the row, % of the cat's width
#   mode = flow  : small moves, optical flow does the in-betweens, eased in and out
#          walk  : like flow but evenly spaced, for the stepping cycle
#          morph : big pose change, flow can't follow it, so the switch is quick and the body squashes and stretches
#          turn  : the body narrows while it turns round, then widens again
PLAN = [
    (1, 1, 0, 2.2),
    (1, 2, 6, .1, 0, 'morph'), (2, 3, 7, .06, 0, 'morph'), (3, 2, 7, .06, 0, 'morph'), (2, 1, 6, 1.2, 0, 'morph'),  # 摆尾巴
    (1, 4, 8, .35, 0, 'flow'), (4, 5, 6, .12, 0, 'flow'), (5, 6, 7, .9, 0, 'flow'), (6, 7, 8, .3, 0, 'flow'),       # 抬头，打哈欠
    (7, 8, 8, .7, 0, 'morph'),                                                                                     # 伸懒腰
    (8, 9, 7, 0, -2, 'morph'),
    (9, 10, 6, 0, -5, 'walk'), (10, 9, 6, 0, -5, 'walk'), (9, 10, 6, 0, -5, 'walk'), (10, 9, 6, 0, -5, 'walk'),
    (9, 10, 6, .12, -4, 'walk'),                                                                                   # 往左爬
    (10, 11, 9, .4, 0, 'turn'),                                                                                    # 转身
    (11, 12, 7, 0, 2, 'morph'),
    (12, 13, 6, 0, 5, 'walk'), (13, 12, 6, 0, 5, 'walk'), (12, 13, 6, 0, 5, 'walk'), (13, 12, 6, 0, 5, 'walk'),
    (12, 13, 6, .12, 4, 'walk'),                                                                                   # 爬回来
    (13, 14, 8, .3, 0, 'turn'), (14, 15, 8, .5, 0, 'flow'), (15, 16, 7, 1.4, 0, 'flow'), (16, 1, 7, 0, 0, 'flow'),  # 趴下，闭眼
]

def smooth(e0, e1, t):
    x = min(1, max(0, (t - e0) / (e1 - e0))); return x * x * (3 - 2 * x)
def ease(t): return .5 - .5 * np.cos(np.pi * t)
BLEND = {'flow': (.1, .9), 'walk': (.15, .85), 'morph': (.38, .62), 'turn': (.42, .58)}

def load(i):
    im = Image.open(SRC / f'{i:02d}.png').convert('RGBA').resize((W, H), Image.LANCZOS)
    c = Image.new('RGBA', (W, H + HEAD), (0, 0, 0, 0))
    c.alpha_composite(im, (0, HEAD + round(LIFT.get(i, 0) * H)))
    a = np.asarray(c).astype(np.float32) / 255
    a[..., :3] *= a[..., 3:4]                  # premultiplied, so edges blend cleanly
    return a

def gray(a):
    # composite on mid grey: the cat's white fur and its outline both give the flow something to track
    g = a[..., :3] + (1 - a[..., 3:4]) * .55
    return cv2.cvtColor((g * 255).astype(np.uint8), cv2.COLOR_RGB2GRAY)

DIS = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
DIS.setFinestScale(1)
def flow(a, b):
    s = .5
    ga, gb = [cv2.resize(gray(x), None, fx=s, fy=s, interpolation=cv2.INTER_AREA) for x in (a, b)]
    f = DIS.calc(ga, gb, None)
    f = cv2.resize(f, (a.shape[1], a.shape[0])) / s
    return cv2.GaussianBlur(f, (0, 0), 2)

hh, ww = H + HEAD, W
GX, GY = np.meshgrid(np.arange(ww, dtype=np.float32), np.arange(hh, dtype=np.float32))
def warp(img, f):
    f = f.astype(np.float32)
    return cv2.remap(img, GX + f[..., 0], GY + f[..., 1], cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)

def tween(a, b, t, fab, fba, mode):
    t = float(t)
    ft0 = -(1 - t) * t * fab + t * t * fba
    ft1 = (1 - t) ** 2 * fab - t * (1 - t) * fba
    wa, wb = warp(a, ft0), warp(b, ft1)
    k = smooth(*BLEND[mode], t)
    out = (1 - k) * wa + k * wb
    bump = np.sin(np.pi * t)
    if mode == 'morph': out = squash(out, 1 + .035 * bump, 1 - .05 * bump)
    if mode == 'turn': out = squash(out, 1 - .22 * bump, 1 + .02 * bump)
    return out

def squash(img, sx, sy):
    # scale about the middle of the bottom edge, so the paws stay on the title
    cx, by = ww / 2, HEAD + H
    M = np.float32([[sx, 0, cx * (1 - sx)], [0, sy, by * (1 - sy)]])
    return cv2.warpAffine(img, M, (ww, hh), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)

def to_cell(a):
    out = a.copy(); al = out[..., 3:4]
    out[..., :3] = np.where(al > 1e-4, out[..., :3] / np.maximum(al, 1e-4), 0)
    im = Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8), 'RGBA')
    return im.resize((CW, CH), Image.LANCZOS)

def main():
    keys = {i: load(i) for i in range(1, 17)}
    cells, seq, cache = [], [], {}
    def add(img, dur, dx=0.0):
        cells.append(to_cell(img)); seq.append([len(cells) - 1, round(dur, 3), round(dx, 3)])
    for row in PLAN:
        a, b, n, hold = row[:4]; dx = row[4] if len(row) > 4 else 0; mode = row[5] if len(row) > 5 else 'flow'
        if a == b:
            add(keys[a], hold); continue
        key = (a, b, n, mode)
        if key not in cache:
            A, B = keys[a], keys[b]; fab, fba = flow(A, B), flow(B, A)
            ts = [(k + 1) / (n + 1) for k in range(n)]
            if mode != 'walk': ts = [ease(t) for t in ts]       # slow out of one pose, slow into the next
            cache[key] = [tween(A, B, t, fab, fba, mode) for t in ts]
            print(f'{a:>2} → {b:<2} {n} 帧')
        steps = n + 1
        for img in cache[key]:
            add(img, 1 / FPS, dx / steps)
        add(keys[b], 1 / FPS + hold, dx / steps)
    # de-duplicate identical cells (the repeated walk cycles reuse the same pictures)
    uniq, remap = [], {}
    for i, c in enumerate(cells):
        h = hash(c.tobytes())
        if h not in remap: remap[h] = len(uniq); uniq.append(c)
        seq[i][0] = remap[h]
    rows = -(-len(uniq) // COLS)
    sheet = Image.new('RGBA', (CW * COLS, CH * rows), (0, 0, 0, 0))
    for i, c in enumerate(uniq): sheet.alpha_composite(c, ((i % COLS) * CW, (i // COLS) * CH))
    sheet.save(OUT_IMG, quality=80, method=6)
    data = json.dumps({'cols': COLS, 'cw': CW, 'ch': CH, 'fps': FPS, 'seq': seq}, separators=(',', ':'))
    OUT_JS.write_text('/* 由 tools/cat_tween.py 生成，不要手改。seq 每项：[格子编号, 停留秒数, 水平移动 %] */\nwindow.CAT_ANIM=' + data + ';\n')
    uniq[0].save(OUT_STILL, quality=85, method=6)    # first frame, shown while the full sheet loads
    print('格子', len(uniq), '播放步数', len(seq), '总时长 %.1fs' % sum(s[1] for s in seq), '图片', OUT_IMG.stat().st_size // 1024, 'KB')
    if '--preview' in sys.argv:
        prev = pathlib.Path(sys.argv[sys.argv.index('--preview') + 1]); prev.mkdir(parents=True, exist_ok=True)
        for i, c in enumerate(cells):
            bg = Image.new('RGBA', c.size, (244, 237, 221, 255)); bg.alpha_composite(c); bg.convert('RGB').save(prev / f'{i:03d}.png')
main()
