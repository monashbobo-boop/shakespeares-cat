# 给 ChatGPT 的提示词

网站已经准备好接收这两组图片，放进对应文件夹、运行一条命令就会自动替换，不用改代码。

---

## 一、猫的 16 帧动画

### 准备

1. 在 ChatGPT 里新开一个对话，先上传**会员原来那张猫趴在字上的设计图**作为参考。
2. 先发下面的「总设定」，再按帧数一张一张生成。每张都在同一个对话里生成，这样猫的样子最一致。
3. 如果某一帧猫的花纹、脸型变了，就让它「按第 1 帧的猫重画这一帧」。

### 总设定（先发这一段）

```
I'm making a looping web animation of this exact cat, frame by frame. Please keep the cat IDENTICAL in every frame:
same watercolor-and-ink illustration style as the reference, same tabby-and-white markings, same proportions, same line weight, same soft colors.

Rules for every frame:
- Transparent background (PNG with alpha). No floor, no shadow, no text, no frame.
- Canvas 1280 x 640 px, landscape.
- Side view, the cat's head points LEFT unless I say otherwise.
- Same size in every frame: when lying down, the cat's body is about 1000 px wide.
- The cat's belly / paws rest on an invisible line 40 px above the bottom edge in every frame, as if lying on top of a line of text.
- Only change the pose I describe. Everything else stays the same.

Reply "ready" and wait for my first frame.
```

### 每一帧（一次发一条）

| 文件名 | 发给 ChatGPT 的话 |
| --- | --- |
| 01.png | Frame 1: the cat is asleep, lying flat exactly like the reference, eyes closed, tail hanging down on the right. |
| 02.png | Frame 2: same as frame 1, but the tip of the tail curls up to the right. |
| 03.png | Frame 3: same as frame 1, but the tail swings slightly to the left, tip curled. |
| 04.png | Frame 4: still lying, the cat lifts its head a little and half-opens its eyes. |
| 05.png | Frame 5: still lying, head lifted, mouth half open at the start of a yawn, eyes squinting. |
| 06.png | Frame 6: still lying, a big wide yawn, mouth fully open showing small fangs and pink tongue, eyes shut tight, ears slightly back. |
| 07.png | Frame 7: still lying, closing the mouth after the yawn, eyes squinting, relaxed. |
| 08.png | Frame 8: a stretch: front legs stretched forward and low, rear end raised, tail up, eyes half open. |
| 09.png | Frame 9: the cat is standing low and creeping LEFT, left front paw forward, right back paw forward. |
| 10.png | Frame 10: creeping LEFT, the other step: right front paw forward, left back paw forward. |
| 11.png | Frame 11: the cat turns around; it is now facing RIGHT, standing, looking back over its shoulder. |
| 12.png | Frame 12: creeping RIGHT, left front paw forward. |
| 13.png | Frame 13: creeping RIGHT, the other step. |
| 14.png | Frame 14: facing LEFT again, crouching and starting to lie down. |
| 15.png | Frame 15: lying down exactly like frame 1, eyes half closed. |
| 16.png | Frame 16: lying down exactly like frame 1, eyes closed, tail settles down. |

### 放进网站

现在网页只用其中两张：`01.png`（闭眼睡着）和 `15.png`（同一姿势，眼睛睁开一条缝）。运行 `python3 tools/cat_rig.py`（需要 `pip install opencv-python-headless`），它会把猫拆成身体、尾巴、两只耳朵和眼睛几层，生成到 `assets/img/cat/rig/`。如果以后换了猫图，尾巴、耳朵、眼睛的位置在脚本顶部改。

---

## 二、志愿者岗位的 6 张标签纸

加入我们页「我们现在需要这些帮手」那 6 个会晃的标签。图上**不要有文字**，岗位名称和时间由网页叠在上面，以后改字不用重新生成图。

### 提示词（一次生成一张，共 6 张，只换颜色那一行）

```
A single real paper hanging tag, photographed straight on, for a website.
- Tall and narrow, about 2:5 (width:height). Canvas 800 x 2000 px.
- Thick matte card stock with visible paper fibers, slightly soft worn corners, a faint crease, very subtle shadows on the paper surface only.
- A round reinforced hole near the top with a brass metal eyelet. A thin cotton string loops through the hole and goes straight up out of the frame.
- The bottom edge is cut into a V-shaped notch like a bookmark (swallowtail).
- Color of the paper: <COLOR>
- Completely blank face: no text, no logo, no pattern, no illustration.
- Transparent background (PNG with alpha). No drop shadow on the background.
- Soft natural light, realistic, not a 3D render, not a cartoon.
```

把 `<COLOR>` 依次换成：

| 文件名 | COLOR |
| --- | --- |
| tag-1.png | warm ivory, like old library card stock |
| tag-2.png | soft sage green |
| tag-3.png | pale straw yellow |
| tag-4.png | dusty powder blue |
| tag-5.png | faded terracotta pink |
| tag-6.png | natural kraft brown |

### 放进网站

1. 存成 `assets/img/tags/src/tag-1.png` 到 `tag-6.png`。
2. 运行 `python3 tools/build_tags.py`。
3. 刷新网页，标签就会换成真实的纸。没放图的那几个会继续用现在的样子。

---

## 生成时常见的问题

- **背景不透明**：补一句「Make the background fully transparent, export as PNG」。
- **猫越画越不像**：重新上传第 1 帧，说「use this exact cat, only change the pose」。
- **尺寸不对**：没关系，打包脚本会自动按第 1 帧统一大小、底部对齐。如果 16 张本来就是同一画布、同一位置，用 `python3 tools/build_cat_sheet.py --keep`，只缩放不对齐。
