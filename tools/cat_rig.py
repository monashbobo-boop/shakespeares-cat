"""把一张趴着睡觉的猫拆成几层，网页用 canvas 让它轻轻动起来：尾巴摆、耳朵抖、眯眼、呼吸。

用法：python3 tools/cat_rig.py [--preview 输出.png]
读取 assets/img/cat/frames/01.png（闭眼）和 15.png（同一姿势，眼睛睁开一条缝），输出到 assets/img/cat/rig/：
  body.webp   身体（去掉尾巴下半截和两只耳朵）
  tail.webp   尾巴下半截，网页逐行错开来做弯曲摆动
  ear1.webp   头顶的耳朵    ear2.webp  左边的耳朵
  eyes.webp   眯开的眼睛，盖在闭眼上淡入淡出
  assets/js/cat-rig.js  每一层的位置和转轴（网页读这个）
坐标都按 1280 × 640 的原图量，输出缩小一半。
"""
import json, pathlib, sys
import numpy as np, cv2
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'assets/img/cat/frames'
OUT = ROOT / 'assets/img/cat/rig'
S = .5                                   # output scale

# tail: everything right of TAIL_X and below TAIL_Y hangs free
TAIL_X, TAIL_Y = 1122, 386
# ears: polygon around each ear, cut line across its base (two points), pivot = middle of the base
EAR1 = {'poly': [(238, 205), (300, 70), (340, 70), (415, 190)], 'cut': ((246, 203), (408, 190))}
EAR2 = {'poly': [(178, 196), (60, 205), (55, 240), (140, 335)], 'cut': ((178, 198), (142, 332))}
FEATHER = 20                             # px the ear layer reaches past its cut line, so its base blends into the head
EYES = [((243, 352), (50, 20), -8), ((333, 300), (34, 36), -35)]   # centre, radii, angle

def rgba(i):
    return np.asarray(Image.open(SRC / f'{i:02d}.png').convert('RGBA').resize((1280, 640), Image.LANCZOS)).astype(np.float32)

def side(p, a, b):
    """signed distance of points p from line a→b (positive on the left side of the direction)"""
    ax, ay = a; bx, by = b; dx, dy = bx - ax, by - ay; n = np.hypot(dx, dy)
    return ((p[0] - ax) * dy - (p[1] - ay) * dx) / n

def ear_masks(e, shape):
    h, w = shape
    poly = np.zeros((h, w), np.uint8); cv2.fillPoly(poly, [np.int32(e['poly'] + [e['cut'][1], e['cut'][0]])], 255)
    poly = cv2.dilate(poly, np.ones((2 * FEATHER + 1, 2 * FEATHER + 1), np.uint8))
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    d = side((xx, yy), *e['cut'])
    # make "positive" the ear side: test with the polygon's first tip point
    tip = e['poly'][1]
    if side((np.float32(tip[0]), np.float32(tip[1])), *e['cut']) < 0: d = -d
    hard = ((d > 8) & (poly > 0)).astype(np.float32)      # the body keeps a short stub of the ear, hidden under the ear layer
    soft = np.clip((d + FEATHER) / FEATHER, 0, 1) * (poly > 0)
    return hard, soft

def crop_save(arr, name, pad=2):
    a = arr[..., 3]
    ys, xs = np.where(a > 2)
    x0, y0, x1, y1 = max(0, xs.min() - pad), max(0, ys.min() - pad), min(arr.shape[1], xs.max() + pad + 1), min(arr.shape[0], ys.max() + pad + 1)
    im = Image.fromarray(np.clip(arr[y0:y1, x0:x1], 0, 255).astype(np.uint8), 'RGBA')
    im = im.resize((max(1, round(im.width * S)), max(1, round(im.height * S))), Image.LANCZOS)
    im.save(OUT / f'{name}.webp', quality=88, method=6)
    return [round(x0 * S, 2), round(y0 * S, 2), im.width, im.height]

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    base, open_ = rgba(1), rgba(15)
    h, w = base.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    tailm = ((xx >= TAIL_X) & (yy >= TAIL_Y)).astype(np.float32)
    e1h, e1s = ear_masks(EAR1, (h, w)); e2h, e2s = ear_masks(EAR2, (h, w))
    def layer(m):
        out = base.copy(); out[..., 3] *= m; return out
    body = layer((1 - tailm) * (1 - e1h) * (1 - e2h))
    meta = {'w': round(w * S), 'h': round(h * S)}
    meta['body'] = crop_save(body, 'body')
    meta['tail'] = crop_save(layer(tailm), 'tail', pad=0)
    meta['ear1'] = crop_save(layer(e1s), 'ear1')
    meta['ear2'] = crop_save(layer(e2s), 'ear2')
    for k, e in (('ear1', EAR1), ('ear2', EAR2)):
        # pivot: middle of the base, pushed a little into the head so the base barely moves
        (ax, ay), (bx, by) = e['cut']; mx, my = (ax + bx) / 2, (ay + by) / 2
        nx, ny = by - ay, -(bx - ax); n = np.hypot(nx, ny); nx, ny = nx / n, ny / n
        tx, ty = e['poly'][1]
        if (tx - mx) * nx + (ty - my) * ny > 0: nx, ny = -nx, -ny
        meta[k].append([round((mx + nx * 14) * S, 2), round((my + ny * 14) * S, 2)])
    em = np.zeros((h, w), np.float32)
    for (c, r, ang) in EYES:
        m = np.zeros((h, w), np.uint8); cv2.ellipse(m, c, r, ang, 0, 360, 255, -1); em = np.maximum(em, m / 255)
    em = cv2.GaussianBlur(em, (0, 0), 6)
    eyes = open_.copy(); eyes[..., 3] = np.minimum(eyes[..., 3], base[..., 3]) * em
    meta['eyes'] = crop_save(eyes, 'eyes')
    meta['src'] = {k: f'assets/img/cat/rig/{k}.webp' for k in ('body', 'tail', 'ear1', 'ear2', 'eyes')}
    (ROOT / 'assets/js/cat-rig.js').write_text('/* 由 tools/cat_rig.py 生成，不要手改。每层：[x, y, 宽, 高, (转轴)]，坐标按 640 × 320 */\nwindow.CAT_RIG=' + json.dumps(meta, ensure_ascii=False) + ';\n')
    print(json.dumps(meta))
    sizes = sum(f.stat().st_size for f in OUT.glob('*.webp')); print('合计', sizes // 1024, 'KB')
    if '--preview' in sys.argv:
        p = sys.argv[sys.argv.index('--preview') + 1]
        vis = np.full((h, w, 3), 255, np.float32); a = base[..., 3:4] / 255; vis = vis * (1 - a) + base[..., :3] * a
        tint = lambda m, col: np.where(m[..., None] > .5, vis * .55 + np.array(col) * .45, vis)
        vis = tint(tailm * (base[..., 3] > 0), (255, 0, 0)); vis = tint(e1h, (0, 0, 255)); vis = tint(e2h, (0, 160, 0)); vis = tint(em, (255, 160, 0))
        Image.fromarray(vis.astype(np.uint8)).save(p)
main()
