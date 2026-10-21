"""把 ChatGPT 生成的 6 张标签纸整理成网页用的尺寸。

用法：把透明背景 PNG 放进 assets/img/tags/src/，命名 tag-1.png 到 tag-6.png，然后运行
  python3 tools/build_tags.py
输出 assets/img/tags/tag-1.webp ... tag-6.webp。网页检测到这些图片就会用真实标签纸，否则继续用现在的色块。
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
