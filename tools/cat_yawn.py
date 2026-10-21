"""Paint yawn frames straight onto the cat's own pixels, so the open mouth shares the drawing's line colour and softness.
Outputs two small patches (half open, wide open) that sit on top of cat-body.webp and cross-fade."""
import sys
from PIL import Image, ImageDraw, ImageFilter
body = Image.open('assets/img/cat-body.webp').convert('RGBA')
K = 3                      # cat-body.webp is the 320x150 crop at 3x
BOX = (66, 80, 100, 106)   # patch area in crop px
S = 4                      # supersample
def frame(cx, cy, rx, ry, name, fang):
    x0, y0, x1, y1 = [v * K for v in BOX]
    base = body.crop((x0, y0, x1, y1)).resize(((x1 - x0) * S, (y1 - y0) * S), Image.LANCZOS)
    W, H = base.size
    m = lambda x, y: ((x - BOX[0]) * K * S, (y - BOX[1]) * K * S)
    d = ImageDraw.Draw(base)
    # mouth: flattened top under the nose, rounded bottom
    ax, ay = m(cx - rx, cy - ry); bx, by = m(cx + rx, cy + ry)
    top = m(0, cy - ry * .55)[1]
    mouth = Image.new('L', base.size, 0); md = ImageDraw.Draw(mouth)
    md.ellipse((ax, ay, bx, by), fill=255); md.rectangle((0, 0, W, top), fill=0)
    md.chord((ax, top - (by - ay) * .12, bx, top + (by - ay) * .12), 0, 180, fill=255)
    inner = Image.new('RGBA', base.size, (96, 52, 44, 255))
    tongue = Image.new('L', base.size, 0); ImageDraw.Draw(tongue).ellipse(m(cx - rx * .62, cy + ry * .05) + m(cx + rx * .62, cy + ry * 1.15), fill=255)
    tongue = Image.composite(tongue, Image.new('L', base.size, 0), mouth)
    inner.paste((205, 128, 122, 255), mask=tongue.filter(ImageFilter.GaussianBlur(1.2 * S)))
    base.paste(inner, mask=mouth.filter(ImageFilter.GaussianBlur(.9 * S)))
    d = ImageDraw.Draw(base)
    # outline in the drawing's own dark brown, thin and slightly broken like the original linework
    lw = max(2, int(.62 * K * S))
    d.arc((ax, ay, bx, by), 20, 160, fill=(70, 54, 46, 255), width=lw)
    d.line([m(cx - rx * .95, cy - ry * .5), m(cx - rx * .3, cy - ry * .62), m(cx, cy - ry * .5), m(cx + rx * .3, cy - ry * .62), m(cx + rx * .95, cy - ry * .5)], fill=(70, 54, 46, 255), width=lw, joint='curve')
    if fang:
        for sx in (-1, 1):
            p = [m(cx + sx * rx * .72, cy - ry * .5), m(cx + sx * rx * .5, cy - ry * .5), m(cx + sx * rx * .62, cy - ry * .18)]
            d.polygon(p, fill=(255, 250, 242, 255))
    out = base.filter(ImageFilter.GaussianBlur(.5 * S)).resize((x1 - x0, y1 - y0), Image.LANCZOS)
    # feather the patch edge so it melts into the body layer underneath
    a = Image.new('L', out.size, 0); ImageDraw.Draw(a).ellipse((out.width * .08, out.height * .06, out.width * .92, out.height * .98), fill=255)
    out.putalpha(a.filter(ImageFilter.GaussianBlur(out.width * .07)))
    out.save(f'assets/img/{name}', quality=92, method=6)
frame(81.6, 91.4, 2.5, 2.1, 'cat-yawn-1.webp', False)
frame(81.6, 93.2, 3.3, 4.7, 'cat-yawn-2.webp', True)
print('ok')
