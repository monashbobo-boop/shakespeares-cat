# Cut the member's cat out of the reference screenshot into body + tail layers (placeholder until the original artwork arrives)
import sys, numpy as np
from PIL import Image, ImageDraw, ImageFilter
src, outdir = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
X0, Y0, W, H = 455, 188, 320, 186
C = im.crop((X0, Y0, X0+W, Y0+H))
K = 3
P = [(12,104),(16,96),(26,93),(36,92),(35,85),(32,76),(26,64),(19,53),(30,50),(45,50),(56,45),(66,40),(70,32),(73,22),(78,14),(81,13),(88,22),(94,36),(100,40),(115,42),(140,36),(160,31),(180,27),(200,26),(220,28),(236,34),(250,42),(263,53),(274,64),(283,76),(290,88),(296,98),(299,115),(301,140),(302,160),(300,174),(296,180),(288,176),(284,160),(282,140),(280,120),(275,106),(268,102),(258,106),(240,106),(222,110),(212,122),(204,126),(198,120),(196,108),(188,102),(175,102),(163,104),(163,130),(158,140),(148,141),(141,134),(139,112),(130,106),(110,108),(90,111),(50,111),(20,111),(13,109)]
def chaikin(pts, n=3):
    for _ in range(n):
        q=[]
        for i in range(len(pts)):
            a=np.array(pts[i]); b=np.array(pts[(i+1)%len(pts)])
            q += [tuple(.75*a+.25*b), tuple(.25*a+.75*b)]
        pts=q
    return pts
S = [(x*K, y*K) for x, y in chaikin(P)]
A = np.asarray(C).astype(float)
G = np.linalg.norm(A-np.array([46,54,39.]),axis=2)
key = Image.fromarray(np.where((G<48)&(np.arange(H)[:,None]>92)&(np.arange(W)[None,:]<272),0,255).astype('uint8')).resize((W*K,H*K),Image.BILINEAR)
Z = C.resize((W*K, H*K), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
def mask(poly_fn):
    m = Image.new('L', Z.size, 0); d = ImageDraw.Draw(m); d.polygon(S, fill=255)
    clip = Image.new('L', Z.size, 0); poly_fn(ImageDraw.Draw(clip))
    m = Image.fromarray(np.minimum(np.minimum(np.asarray(m), np.asarray(clip)), np.asarray(key)))
    return m.filter(ImageFilter.GaussianBlur(1.1))
PIV = 100  # tail joint (crop px)
body = mask(lambda d: (d.rectangle([0,0,W*K,H*K], fill=255), d.rectangle([272*K, PIV*K, W*K, H*K], fill=0)))
tail = mask(lambda d: d.rectangle([272*K, (PIV-8)*K, W*K, H*K], fill=255))
def save(m, name, box):
    rgba = Z.copy(); rgba.putalpha(m); rgba.crop(box).save(f'{outdir}/{name}', quality=90, method=6)
save(body, 'cat-body.webp', (0, 0, W*K, 150*K))
save(tail, 'cat-tail.webp', (272*K, (PIV-8)*K, 310*K, 184*K))
print('ok', Z.size)

