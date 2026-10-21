"""把原型打包成一个独立的 HTML 文件（图片、样式、脚本全部内嵌）。

用法:
    python3 tools/build_single.py            # 生成 dist/prototype.html（双击即可打开）
    python3 tools/build_single.py --artifact out.html   # 生成发布到 Claude Artifact 用的版本（不含 <html>/<head> 外壳）
"""
import base64, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
MIME = {'.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml'}


def data_uri(rel):
    p = ROOT / rel
    return f"data:{MIME[p.suffix]};base64,{base64.b64encode(p.read_bytes()).decode()}"


def build(artifact=False):
    html = (ROOT / 'index.html').read_text(encoding='utf-8')
    css = (ROOT / 'assets/css/style.css').read_text(encoding='utf-8')
    html = html.replace('<link rel="stylesheet" href="assets/css/style.css">', f'<style>\n{css}\n</style>')
    for js in ('assets/js/land.js', 'assets/js/main.js'):
        code = (ROOT / js).read_text(encoding='utf-8')
        html = html.replace(f'<script src="{js}"></script>', f'<script>\n{code}\n</script>')
    covers = {f.stem: data_uri(f'assets/img/covers/{f.name}') for f in sorted((ROOT / 'assets/img/covers').glob('*.webp'))}
    import json
    html = html.replace('const CV=n=>`assets/img/covers/${n}.webp`;', 'const COVERS=' + json.dumps(covers) + ';const CV=n=>COVERS[n];')
    sketches = {f.stem: data_uri(f'assets/img/sketch/{f.name}') for f in sorted((ROOT / 'assets/img/sketch').glob('*.svg'))}
    html = html.replace('const SK=n=>`assets/img/sketch/${n}.svg`;', 'const SKETCH=' + json.dumps(sketches) + ';const SK=n=>SKETCH[n];')
    # These optional images are loaded by JavaScript rather than src attributes.
    cat_sheet = 'assets/img/cat/cat-sheet.webp'
    if (ROOT / cat_sheet).exists():
        html = html.replace("const CAT_SHEET='" + cat_sheet + "';", 'const CAT_SHEET=' + json.dumps(data_uri(cat_sheet)) + ';')
    tags = {str(i): data_uri(f'assets/img/tags/tag-{i}.webp') for i in range(1, 7)
            if (ROOT / f'assets/img/tags/tag-{i}.webp').exists()}
    if tags:
        html = html.replace('im.src=`assets/img/tags/tag-${i+1}.webp`;',
                            'im.src=(' + json.dumps(tags) + ')[i+1]||`assets/img/tags/tag-${i+1}.webp`;')
    html = re.sub(r'(src|href)="(assets/img/[^"]+)"', lambda m: f'{m.group(1)}="{data_uri(m.group(2))}"', html)
    if artifact:
        head = html[html.index('<title>'):html.index('</head>')]
        head = re.sub(r'<link rel="icon"[^>]*>\n?', '', head)
        body = html[html.index('<body>') + 6:html.index('</body>')]
        html = head + body
    return html


if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == '--artifact':
        pathlib.Path(sys.argv[2]).write_text(build(True), encoding='utf-8')
        print('artifact ->', sys.argv[2])
    else:
        out = ROOT / 'dist' / 'prototype.html'
        out.parent.mkdir(exist_ok=True)
        out.write_text(build(), encoding='utf-8')
        print('single file ->', out)
