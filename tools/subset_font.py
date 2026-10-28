"""标题字体霞鹜文楷完整文件很大（约 18MB），网页只放网站上用到的字。

改了页面文字、出现新字以后运行一次：
    python3 tools/subset_font.py 路径/LXGWWenKai-Bold.ttf

只想补几个新字、不动已有字形时，加 --extra：
    python3 tools/subset_font.py 路径/LXGWWenKai-Bold.ttf --extra
它只把主子集里缺的字做成 lxgw-wenkai-bold-extra.woff2，style.css 里补字先声明、主字体后声明，
浏览器优先用主字体，缺字才用补字。

字体下载：https://github.com/lxgw/LxgwWenKai/releases （SIL Open Font License 1.1）
需要 fonttools：pip install fonttools brotli
"""
import pathlib, struct, sys
from fontTools.ttLib import TTFont, newTable
from fontTools.ttLib.tables._c_m_a_p import CmapSubtable
from fontTools import subset

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'assets/fonts/lxgw-wenkai-bold-subset.woff2'


def site_text():
    t = (ROOT / 'index.html').read_text(encoding='utf-8') + (ROOT / 'assets/js/main.js').read_text(encoding='utf-8')
    return ''.join(chr(i) for i in range(32, 127)) + ''.join(sorted({c for c in t if ord(c) > 127})) + '「」《》，。、：；？！…'


def load_fixed(src):
    # 字体自带的 format 4 cmap 会让 fonttools 报错，只用 format 12 那张表重建
    f = TTFont(src, lazy=True)
    raw = f.reader['cmap']
    n = struct.unpack('>H', raw[2:4])[0]
    subs = [struct.unpack('>HHI', raw[4 + i * 8:12 + i * 8]) for i in range(n)]
    off = next(o for _, _, o in subs if struct.unpack('>H', raw[o:o + 2])[0] == 12)
    ng = struct.unpack('>I', raw[off + 12:off + 16])[0]
    order = f.getGlyphOrder()
    m = {}
    for i in range(ng):
        s, e, g = struct.unpack('>III', raw[off + 16 + i * 12:off + 28 + i * 12])
        for c in range(s, e + 1):
            if g + c - s < len(order):
                m[c] = order[g + c - s]
    t = newTable('cmap'); t.tableVersion = 0; t.tables = []
    for pid, eid in ((3, 10), (0, 4)):
        st = CmapSubtable.newSubtable(12); st.platformID = pid; st.platEncID = eid; st.language = 0; st.cmap = m
        t.tables.append(st)
    f['cmap'] = t
    return f


if __name__ == '__main__':
    font = load_fixed(sys.argv[1])
    text, out = site_text(), OUT
    if '--extra' in sys.argv:
        have = set(TTFont(OUT).getBestCmap())
        text = ''.join(c for c in site_text() if ord(c) not in have) or ' '
        out = OUT.with_name('lxgw-wenkai-bold-extra.woff2')
        print('补字：', text)
    opts = subset.Options(); opts.flavor = 'woff2'; opts.layout_features = ['*']
    sub = subset.Subsetter(opts); sub.populate(text=text); sub.subset(font)
    out.parent.mkdir(exist_ok=True)
    font.flavor = 'woff2'; font.save(out)
    print(out, out.stat().st_size // 1024, 'KB')
