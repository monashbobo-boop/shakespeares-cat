"""把 ChatGPT 生成的 16 张猫的帧拼成一张精灵图 assets/img/cat/cat-sheet.webp。

用法：
  1. 把 16 张透明背景 PNG 放进 assets/img/cat/frames/，命名 01.png 到 16.png
  2. python3 tools/build_cat_sheet.py            # 按原图比例缩放到格子里，底部对齐
     python3 tools/build_cat_sheet.py --keep    # 每张图本来就是同一画布、同一位置时用，只做缩放不对齐

网页一检测到 cat-sheet.webp 就会改用逐帧动画，原来的分层猫自动隐藏。
"""
import sys, pathlib
from PIL import Image
ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'assets/img/cat/frames'
OUT = ROOT / 'assets/img/cat/cat-sheet.webp'
CW, CH, COLS, ROWS = 640, 320, 4, 4
keep = '--keep' in sys.argv
frames = [SRC / f'{i:02d}.png' for i in range(1, 17)]
missing = [f.name for f in frames if not f.exists()]
if missing: sys.exit('缺少帧：' + ', '.join(missing))
ims = [Image.open(f).convert('RGBA') for f in frames]
if keep:
    cells = [im.resize((CW, CH), Image.LANCZOS) for im in ims]
else:
    boxes = [im.getbbox() or (0, 0, im.width, im.height) for im in ims]
    crops = [im.crop(b) for im, b in zip(ims, boxes)]
    # one shared scale, taken from the lying-down frame 01, so the cat never changes size between frames
    ref = crops[0]; s = min(CW * .92 / ref.width, CH * .92 / ref.height)
    cells = []
    for c in crops:
        k = min(s, CW * .98 / c.width, CH * .98 / c.height)
        c = c.resize((max(1, round(c.width * k)), max(1, round(c.height * k))), Image.LANCZOS)
        cell = Image.new('RGBA', (CW, CH), (0, 0, 0, 0))
        cell.alpha_composite(c, ((CW - c.width) // 2, CH - c.height - 4))   # bottom-centred: the belly stays on the title
        cells.append(cell)
sheet = Image.new('RGBA', (CW * COLS, CH * ROWS), (0, 0, 0, 0))
for i, c in enumerate(cells): sheet.alpha_composite(c, ((i % COLS) * CW, (i // COLS) * CH))
sheet.save(OUT, quality=90, method=6)
print('已生成', OUT.relative_to(ROOT), sheet.size)
