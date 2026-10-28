# 莎士比亚的猫文学社 · 官网原型

这是文学社官网的**设计原型**，用来在做 Figma 设计稿之前，先让大家在浏览器里看到网站大概的样子、点一点、提意见。

> 页面上的活动、书单、发展历程和照片都是**示例内容**，正式上线前会换成文学社确认过的信息。

## 怎么看原型（不需要懂技术）

直接打开这个链接，手机、电脑都可以：

**https://monashbobo-boop.github.io/shakespeares-cat/**

- 右上角的按钮可以切换页面：关于我们、本学期活动、往期活动、书友作品、加入我们、合作与联系。
- 首页的地球可以用鼠标或手指拖动。
- 「本学期活动」里可以在列表和日历之间切换，点日历上的日期能看到活动详情。
- 「往期活动」先选年份和学期，每个学期用同一个模板显示。
- 「关于我们」的五个活动模块可以像书脊一样点开。

如果链接打不开，也可以下载 `dist/prototype.html` 这一个文件，双击用浏览器打开（需要联网加载字体）。

## 怎么提意见

任选一种：

1. **在 GitHub 上留言**（需要一个免费的 GitHub 账号）：打开仓库页面上方的 **Issues** → **New issue**，写下哪一页、哪个位置、想怎么改，可以直接贴截图。
2. **直接发给 Evans**：微信截图加一句话就行。

## 历史版本

在 GitHub 上点 **Commits** 可以看到每次改了哪些地方，也能打开任意一次提交，查看当时的完整网站。

## 给维护网站的人

```
index.html              页面结构（7 个页面都在这个文件里）
assets/css/style.css    配色、字体、版式（文件开头的 :root 是全部颜色）
assets/js/main.js       交互和示例数据（活动、往期、书单在文件中部的 DATA 区）
assets/js/land.js       地球的陆地轮廓数据
assets/img/             logo 和猫咪图片（身体、尾巴两层）
assets/img/covers/      书籍封面（来自豆瓣，仅作原型展示）
assets/img/doodles/     人物插画（Open Doodles，CC0）
assets/img/sketch/      手绘图标（Streamline Freehand，CC BY 4.0）
assets/img/map-nunawading.webp  场馆地图（OpenStreetMap）
CREDITS.md              所有素材的来源和授权
tools/cut_cat.py        从会员设计稿里抠出猫咪（身体和尾巴分两层）
tools/build_single.py   打包成单个 HTML 文件，输出到 dist/
tools/cat_rig.py    把趴着睡觉的猫拆成身体、头、耳朵、尾巴几层，并生成打哈欠的头部画面，网页用 canvas 让它在原地动
tools/build_tags.py     整理 ChatGPT 生成的 6 张标签纸
tools/subset_font.py    标题字体霞鹜文楷只保留网站用到的字，改了文字后重新运行
assets/fonts/           标题字体（霞鹜文楷粗体子集，OFL）
docs/给ChatGPT的提示词.md  生成猫和标签纸的提示词与步骤
docs/WordPress-本学期活动.md  每学期的活动和书怎么录，书的封面怎么上传
docs/WordPress-书友作品.md  书友作品在 WordPress 后台的字段，稿纸每页能放多少字
docs/书友作品-点赞与评论.md  点赞和留言上线时的设置
```

- **改活动或书单**：编辑 `assets/js/main.js` 里的 `EV` 和 `TERM_BOOKS`（本学期的活动和书，见 `docs/WordPress-本学期活动.md`）、`TERMS`（往期，每个学期一份，字段相同）、`BOOKS`（书架）、`WORKS`（书友作品，只收公众号已发表的作品，附原文链接，后台字段见 `docs/WordPress-书友作品.md`）。
- **换猫咪原图**：现在的猫是从会员设计稿截图里抠出来的，分辨率有限。拿到原图后，导出两张透明背景图替换 `assets/img/cat-body.webp`（身体）和 `assets/img/cat-tail.webp`（尾巴，单独一层才能摆动）。
- **本地预览**：在仓库目录运行 `python3 -m http.server`，打开 http://localhost:8000 。
- **重新打包单文件**：`python3 tools/build_single.py`。
- **本批生成素材**：16 张猫帧在 `assets/img/cat/frames/`（1280 × 640），六张标签原图在 `assets/img/tags/src/`（800 × 2000），均为透明 PNG。猫帧共用画布，网页用其中的 01、04、05、06、07、15，运行 `python3 tools/cat_rig.py` 生成图层；标签使用 `python3 tools/build_tags.py`。完整提示词保存在 `docs/generated-assets-prompts.json`。

标题字体是霞鹜文楷粗体（只含网站用到的字，存在 assets/fonts/），段落是 Google Fonts 的思源黑体（Noto Sans SC），动画用 GSAP、Lenis，地球用 D3。
