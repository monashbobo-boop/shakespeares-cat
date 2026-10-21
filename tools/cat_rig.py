"""把趴着睡觉的猫拆成几层，网页用 canvas 让它在原地轻轻动：呼吸、尾巴摆、耳朵抖，隔一阵睁眼打个哈欠再闭眼睡。

用法：python3 tools/cat_rig.py [--preview 文件夹]      需要 pip install opencv-python-headless
读取 assets/img/cat/frames/ 里 ChatGPT 画的帧：
  01 趴着闭眼（底图）  04 抬头睁眼  05 开始张嘴  06 打哈欠  07 合嘴  15 眼睛半闭
输出到 assets/img/cat/rig/：
  body.webp   身体（不含头、尾巴下半截）
  head.webp   01 的头（不含两只耳朵）
  ear1.webp   头顶的耳朵    ear2.webp  左边的耳朵
  tail.webp   尾巴下半截，网页逐行错开来做弯曲摆动
  yawn.webp   打哈欠时头部的连续画面（帧与帧之间用光流补齐）
和 assets/js/cat-rig.js（每层的位置、转轴和打哈欠每一格停多久）。
坐标都按 1280 × 640 的原图量，输出缩小一半。
"""
import json, pathlib, sys
import numpy as np, cv2
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'assets/img/cat/frames'
OUT = ROOT / 'assets/img/cat/rig'
W, H, S = 1280, 640, .5
FPS = 24

TAIL_X, TAIL_Y = 1122, 386                       # tail: right of x and below y hangs free
HEAD_X0, HEAD_X1 = 470, 570                      # head region: fully the head left of X0, fades out by X1
EAR1 = {'poly': [(238, 205), (300, 70), (340, 70), (415, 190)], 'cut': ((246, 203), (408, 190))}
EAR2 = {'poly': [(178, 196), (60, 205), (55, 240), (140, 335)], 'cut': ((178, 198), (142, 332))}
FEATHER = 20
# yawn: (from, to, in-betweens, hold on `to` in seconds, blend) — starts and ends on frame 01
YAWN = [(1, 4, 10, .7, 'soft'), (4, 5, 7, .15, 'soft'), (5, 6, 8, 1.1, 'sharp'), (6, 7, 9, .35, 'sharp'),
        (7, 15, 9, .8, 'soft'), (15, 1, 10, 0, 'soft')]
BLEND = {'soft': (.1, .9), 'sharp': (.35, .65)}

def rgba(i):
    return np.asarray(Image.open(SRC / f'{i:02d}.png').convert('RGBA').resize((W, H), Image.LANCZOS)).astype(np.float32)

def side(p, a, b):
    ax, ay = a; bx, by = b; dx, dy = bx - ax, by - ay
    return ((p[0] - ax) * dy - (p[1] - ay) * dx) / np.hypot(dx, dy)

def ear_masks(e):
    poly = np.zeros((H, W), np.uint8); cv2.fillPoly(poly, [np.int32(e['poly'] + [e['cut'][1], e['cut'][0]])], 255)
    poly = cv2.dilate(poly, np.ones((2 * FEATHER + 1,) * 2, np.uint8))
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    d = side((xx, yy), *e['cut']); tip = e['poly'][1]
    if side((np.float32(tip[0]), np.float32(tip[1])), *e['cut']) < 0: d = -d
    hard = ((d > 8) & (poly > 0)).astype(np.float32)          # the head keeps a short stub, hidden under the ear
    soft = np.clip((d + FEATHER) / FEATHER, 0, 1) * (poly > 0)
    return hard, soft

# ---- optical flow in-betweens (premultiplied RGBA) ----
GX, GY = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
DIS = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
def premul(a): a = a / 255; a[..., :3] *= a[..., 3:4]; return a
def unpremul(a):
    o = a.copy(); al = o[..., 3:4]; o[..., :3] = np.where(al > 1e-4, o[..., :3] / np.maximum(al, 1e-4), 0); return np.clip(o * 255, 0, 255)
def gray(a):
    g = a[..., :3] + (1 - a[..., 3:4]) * .55
    return cv2.cvtColor((np.clip(g, 0, 1) * 255).astype(np.uint8), cv2.COLOR_RGB2GRAY)
def flow(a, b):
    ga, gb = [cv2.resize(gray(x), None, fx=.5, fy=.5, interpolation=cv2.INTER_AREA) for x in (a, b)]
    f = cv2.resize(DIS.calc(ga, gb, None), (W, H)) * 2
    return cv2.GaussianBlur(f, (0, 0), 2)
def warp(img, f):
    f = f.astype(np.float32)
    return cv2.remap(img, GX + f[..., 0], GY + f[..., 1], cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
def smooth(e0, e1, t):
    x = min(1, max(0, (t - e0) / (e1 - e0))); return x * x * (3 - 2 * x)
def tween(a, b, t, fab, fba, blend):
    ft0 = -(1 - t) * t * fab + t * t * fba; ft1 = (1 - t) ** 2 * fab - t * (1 - t) * fba
    k = smooth(*BLEND[blend], t)
    return (1 - k) * warp(a, ft0) + k * warp(b, ft1)

def save(arr, name, box=None):
    a = arr[..., 3]
    if box is None:
        ys, xs = np.where(a > 2); box = (max(0, xs.min() - 2), max(0, ys.min() - 2), min(W, xs.max() + 3), min(H, ys.max() + 3))
    x0, y0, x1, y1 = box
    im = Image.fromarray(arr[y0:y1, x0:x1].astype(np.uint8), 'RGBA')
    im = im.resize((round(im.width * S), round(im.height * S)), Image.LANCZOS)
    if name: im.save(OUT / f'{name}.webp', quality=88, method=6)
    return [round(x0 * S, 2), round(y0 * S, 2), im.width, im.height], im

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    keys = {i: rgba(i) for i in {1, 4, 5, 6, 7, 15}}
    base = keys[1]
    yy, xx = np.mgrid[0:H, 0:W]
    tailm = ((xx >= TAIL_X) & (yy >= TAIL_Y)).astype(np.float32)
    headm = np.clip((HEAD_X1 - xx) / (HEAD_X1 - HEAD_X0), 0, 1).astype(np.float32)
    headm = headm * headm * (3 - 2 * headm)
    e1h, e1s = ear_masks(EAR1); e2h, e2s = ear_masks(EAR2)
    def layer(img, m): o = img.copy(); o[..., 3] *= m; return o
    meta = {'w': round(W * S), 'h': round(H * S), 'fps': FPS}
    # body and head are drawn additively ('lighter'), so their alpha masks must add up to exactly 1
    meta['body'], _ = save(layer(base, (1 - tailm) * (1 - headm)), 'body')
    meta['head'], _ = save(layer(base, headm * (1 - e1h) * (1 - e2h)), 'head')
    # the tail layer starts a few px above and left of the body's cut, so the two overlap and no light line shows at the joint
    tail_over = ((xx >= TAIL_X - 6) & (yy >= TAIL_Y - 6)).astype(np.float32)
    meta['tail'], _ = save(layer(base, tail_over), 'tail', (TAIL_X - 6, TAIL_Y - 6, W, H))
    for k, e, soft in (('ear1', EAR1, e1s), ('ear2', EAR2, e2s)):
        meta[k], _ = save(layer(base, soft * headm), k)
        (ax, ay), (bx, by) = e['cut']; mx, my = (ax + bx) / 2, (ay + by) / 2
        nx, ny = by - ay, -(bx - ax); n = np.hypot(nx, ny); nx, ny = nx / n, ny / n
        tx, ty = e['poly'][1]
        if (tx - mx) * nx + (ty - my) * ny > 0: nx, ny = -nx, -ny
        meta[k].append([round((mx + nx * 14) * S, 2), round((my + ny * 14) * S, 2)])
    # yawn: whole head region of each in-between, ears included
    frames, seq = [base], [[0, 0]]
    for a, b, n, hold, blend in YAWN:
        A, B = premul(keys[a]), premul(keys[b]); fab, fba = flow(A, B), flow(B, A)
        for k in range(n):
            t = .5 - .5 * np.cos(np.pi * (k + 1) / (n + 1))
            frames.append(unpremul(tween(A, B, float(t), fab, fba, blend))); seq.append([len(frames) - 1, 1 / FPS])
        frames.append(keys[b]); seq.append([len(frames) - 1, 1 / FPS + hold])
        print(f'哈欠 {a:>2} → {b:<2} {n} 帧')
    hb = (0, 0, HEAD_X1, H)
    cells = [save(layer(f, headm), None, hb)[1] for f in frames]
    cw, ch = cells[0].size; cols = 8; rows = -(-len(cells) // cols)
    sheet = Image.new('RGBA', (cw * cols, ch * rows), (0, 0, 0, 0))
    for i, c in enumerate(cells): sheet.alpha_composite(c, ((i % cols) * cw, (i // cols) * ch))
    sheet.save(OUT / 'yawn.webp', quality=76, method=6)
    meta['yawn'] = {'cols': cols, 'cw': cw, 'ch': ch, 'x': 0, 'y': 0, 'seq': [[c, round(d, 3)] for c, d in seq[1:]]}
    # each file name carries a hash of its content, so a browser never pairs a cached old picture with new positions
    import hashlib
    meta['src'] = {k: f'assets/img/cat/rig/{k}.webp?v=' + hashlib.md5((OUT / f'{k}.webp').read_bytes()).hexdigest()[:8]
                   for k in ('body', 'head', 'tail', 'ear1', 'ear2', 'yawn')}
    for old in ('eyes.webp',):
        (OUT / old).unlink(missing_ok=True)
    (ROOT / 'assets/js/cat-rig.js').write_text('/* 由 tools/cat_rig.py 生成，不要手改。每层：[x, y, 宽, 高, (转轴)]，坐标按 640 × 320 */\nwindow.CAT_RIG=' + json.dumps(meta, ensure_ascii=False) + ';\n')
    sizes = {f.name: f.stat().st_size // 1024 for f in OUT.glob('*.webp')}
    print('图层', sizes, '合计', sum(sizes.values()), 'KB', '哈欠', len(cells), '格', '%.1fs' % sum(d for _, d in seq))
    if '--preview' in sys.argv:
        p = pathlib.Path(sys.argv[sys.argv.index('--preview') + 1]); p.mkdir(parents=True, exist_ok=True)
        for i, c in enumerate(cells):
            bg = Image.new('RGBA', c.size, (244, 237, 221, 255)); bg.alpha_composite(c); bg.convert('RGB').save(p / f'y{i:02d}.png')
main()
