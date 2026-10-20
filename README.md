# 莎士比亚的猫文学社 · 官网原型

这是文学社官网的**设计原型**，用来在做 Figma 设计稿之前，先让大家在浏览器里看到网站大概的样子、点一点、提意见。

> 页面上的活动、书单、发展历程和照片都是**示例内容**，正式上线前会换成文学社确认过的信息。

## 怎么看原型（不需要懂技术）

直接打开这个链接，手机、电脑都可以：

**https://monashbobo-boop.github.io/shakespeares-cat/**

- 右上角的按钮可以切换页面：关于我们、本学期活动、往期活动、加入我们、合作与联系。
- 首页的地球可以用鼠标或手指拖动。
- 「本学期活动」里可以在列表和日历之间切换，点日历上的日期能看到活动详情。
- 「往期活动」可以按活动类型筛选。

如果链接打不开，也可以下载 `dist/prototype.html` 这一个文件，双击用浏览器打开（需要联网加载字体）。

## 怎么提意见

任选一种：

1. **在 GitHub 上留言**（需要一个免费的 GitHub 账号）：打开仓库页面上方的 **Issues** → **New issue**，写下哪一页、哪个位置、想怎么改，可以直接贴截图。
2. **直接发给 Evans**：微信截图加一句话就行。

## 版本记录

每一次改动都会留下记录，随时可以回到以前的版本对比。

| 版本 | 日期 | 主要变化 |
| --- | --- | --- |
| v8 | 2026-10-21 | 图标换成手绘风；标题改成一句话；去掉卡片上的装饰；修猫打哈欠 |
| v7 | 2026-10-20 | 修复卡片截断、封面遮字、立体书白板；真实地图；插画和图标换成开源素材 |
| v6 | 2026-10-20 | 真实封面的立体书；卡片换成邮票、借书卡、书签、信封；猫会打哈欠 |
| v5.1 | 2026-10-20 | 内页按 sample 的节奏重做，每页由不同的版块组成 |
| v5 | 2026-10-20 | 换成墨绿加象牙白；首页猫咪趴在标题上、尾巴会摆；地球去掉笑脸；所有内页补充内容 |
| v4 | 2026-10-19 | 粉色简洁版，统一版式和字号 |

详细说明见 [CHANGELOG.md](CHANGELOG.md)。在 GitHub 上点 **Commits** 可以看到每次改了哪些地方，点 **Tags** 可以下载某个版本。

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
```

- **改活动或书单**：编辑 `assets/js/main.js` 里的 `EV`（本学期）、`TERMS`（往期）、`BOOKS`（书架）。
- **换猫咪原图**：现在的猫是从会员设计稿截图里抠出来的，分辨率有限。拿到原图后，导出两张透明背景图替换 `assets/img/cat-body.webp`（身体）和 `assets/img/cat-tail.webp`（尾巴，单独一层才能摆动）。
- **本地预览**：在仓库目录运行 `python3 -m http.server`，打开 http://localhost:8000 。
- **重新打包单文件**：`python3 tools/build_single.py`。

字体用的是 Google Fonts 的思源宋体（Noto Serif SC）和思源黑体（Noto Sans SC），动画用 GSAP、Lenis，地球用 D3。
