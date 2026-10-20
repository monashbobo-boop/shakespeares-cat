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
