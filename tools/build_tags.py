"""把 ChatGPT 生成的 6 张标签纸整理成网页用的尺寸。

用法：把透明背景 PNG 放进 assets/img/tags/src/，命名 tag-1.png 到 tag-6.png，然后运行
  python3 tools/build_tags.py
输出 assets/img/tags/tag-1.webp ... tag-6.webp（整张标签），
以及 assets/img/tags/paper-1.webp ... paper-6.webp：从标签中间裁下来的一块纸，
「加入我们」页志愿者挂牌用它做纸面，所以挂牌和原来的标签是同一种纸。
"""
import pathlib
from PIL import Image
ROOT = pathlib.Path(__file__).resolve().parent.parent
for i in range(1, 7):
    src = ROOT / f'assets/img/tags/src/tag-{i}.png'
    if not src.exists(): print('跳过', src.name); continue
    im = Image.open(src).convert('RGBA'); im = im.crop(im.getbbox())
    im.thumbnail((420, 1100), Image.LANCZOS)
    im.save(ROOT / f'assets/img/tags/tag-{i}.webp', quality=90, method=6)
    print('tag', i, im.size)

# 挂牌用的纸面：去掉标签的孔眼、边缘和底部的燕尾，只留中间一块纸
for i in range(1, 7):
    src = ROOT / f'assets/img/tags/src/tag-{i}.png'
    if not src.exists(): continue
    im = Image.open(src).convert('RGBA'); x0, y0, x1, y1 = im.getbbox()
    w, h = x1 - x0, y1 - y0
    box = (x0 + int(w * .1), y0 + int(h * .36), x1 - int(w * .1), y0 + int(h * .74))
    paper = im.crop(box).convert('RGB')
    paper.thumbnail((480, 640), Image.LANCZOS)
    paper.save(ROOT / f'assets/img/tags/paper-{i}.webp', quality=82, method=6)
    print('paper', i, paper.size)
