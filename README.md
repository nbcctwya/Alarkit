# Alarkit · 相机 3D 拆解台

一个以 3D 视角拆解、讲解相机的教学向 Web 应用。覆盖 **7 个品牌、12 款机身、14 支镜头**：Nikon（Z6 III / Z7 II / Z5 II / Z8 / Z9 / Z50 II + 8 支 Z 镜头）、Sony（A7C II + 35GM）、Fujifilm（X-T5 + XF 35）、Canon（EOS R5 + RF 50L）、Leica（M11 + Summilux 35）、Hasselblad（X2D + XCD 55）、Lumix（S5 II + 24-105）。机身与镜头可自由组合（卡口自动判断兼容），也可以一键"爆炸"成零件，点击任意元件了解它的用途、背后的摄影原理与实战技巧。

> 模型为 Three.js 几何体程序化拼装的教学示意图，非精确比例复刻。

## 功能特性

- **器材切换**：品牌筛选 + 机身与镜头独立下拉选择、自由组合（含仅机身/仅镜头），按卡口自动判断兼容性，切换不刷新页面
- **背景主题**：深色 / 亮色（影棚渐变）/ 工作台（程序化木纹台面）三种视口背景，选择本地记忆
- **组合 ⇄ 拆解**：滑块无级控制 + 一键动画，35 个元件沿各自方向展开（机身向后分层、镜头沿光轴向前）
- **元件点选**：点击 3D 模型或左侧元件树，元件高亮（尼康黄）并自动聚焦视角
- **图文讲解**：每个元件配「用途 / 摄影原理 / 实战技巧」三段中文介绍，涵盖曝光三角、景深、防抖、果冻效应、法兰距等摄影知识
- **3D 交互**：拖动旋转、滚轮缩放、右键平移、双击复位
- **健壮性**：JS / WebGL 错误直接以浮层提示，不出现无声黑屏
- **零 CDN 依赖**：Three.js r160 已本地化，离线可用

## 项目结构

```
Alarkit/
├── app.py                    # Flask 入口（单路由渲染页面）
├── templates/
│   └── index.html            # 三栏布局 + importmap + 机身/镜头双选择器
├── static/
│   ├── css/style.css         # 深色 UI 样式
│   ├── vendor/three/         # Three.js r160 + OrbitControls（本地化）
│   └── js/
│       ├── main.js           # 场景/灯光/拆解动画/拾取高亮/面板联动/选择器（不含型号逻辑）
│       ├── registry.js       # 器材注册表：cameras/lenses、卡口兼容判断、装配与元件 id 命名空间化
│       ├── data.js           # 全部文案：元件介绍与器材简介
│       └── models/
│           ├── materials.js        # 共享材质 + 建模工具（mesh/box/cyl/mkPart/disposeTree）
│           ├── body.js             # Nikon Z6 III 机身（手写精模，15 个可拆元件）
│           ├── bodyFactory.js      # 参数化机身工厂 buildBody(spec)，支持 overrides 精修
│           ├── bodyZ*.js           # Nikon Z7 II / Z5 II / Z8 / Z9 / Z50 II
│           ├── body{Sony,Fuji,Canon,Leica,Hasselblad,Lumix}*.js  # 其余 6 品牌机身
│           ├── lensZoom.js         # Nikkor Z 24-120mm f/4 S（手写精模）
│           ├── lensPrime.js        # Nikkor Z 85mm f/1.8 S（手写精模）
│           ├── lensFactory.js      # 参数化镜头工厂 buildLens(spec)，支持 labels/overrides
│           ├── lens*.js            # 8 支 Nikkor 镜头
│           ├── lens{Sony,Fuji,Canon,Leica,Hasselblad,Lumix}*.js  # 其余 6 品牌镜头
│           ├── refinedParts.js     # 共享精修件库（机身）
│           └── refinedLensParts.js # 共享精修件库（镜头）
└── tools/
    ├── smoke.mjs             # Node 冒烟测试：遍历注册表，校验器材/元件/文案/装配与兼容性
    ├── shoot.py              # Playwright 截图 + 控制台抓取（调试）
    └── webgl_probe.py        # 无头环境 WebGL 启动参数探测（调试）
```

**器材接口**：models 下每个器材模块导出一个 `gear` 描述符 `{ id, type, brand, name, mount, view, comboView?, create }`；`create()` 返回 `{ root, parts, mountAnchor }`。每个可拆元件是独立 `THREE.Group`，用局部 id 经 `mkPart(id, 名称, 类别, 节点, 拆解方向, 距离)` 注册；`registry.js` 在装配时把元件 id 统一命名空间化为 `器材id:局部id`（保证全局唯一），并按 `mountAnchor` 把镜头装到机身卡口（光轴统一为 +Z）。拆解动画即沿方向按滑块值插值偏移。文案查询先查 `PART_INFO[器材id:局部id]`，再回退 `PART_INFO[局部id]`，多支镜头可共用文案。

**新增器材步骤**：① 在 models/ 下新建模块并导出 `gear`——机身/镜头优先复用 `bodyFactory`/`lensFactory`（一张参数表即可，差异化零件走 spec 开关），个别零件可用 `spec.overrides` 手写精修（工厂会用它替代同 id 的模板零件，如 Z9 的圆形目镜罩）；② 在 `registry.js` import 并加入 `cameras` 或 `lenses`；③ 在 `data.js` 补 `GEAR_INFO[器材id]`（组合简介可选，缺省时面板自动分段显示机身与镜头简介）与元件 `PART_INFO`；④ 跑 `node tools/smoke.mjs` 校验。页面选择器会自动出现新器材，卡口（`mount`）相同的机身/镜头自动判定兼容。

## 部署运行

要求：Python 3.10+、Flask 3.x。

```bash
# 任选其一安装 Flask
pip install flask
# 或使用 conda 环境
conda create -n webproj flask

# 启动
python app.py
# 或不激活环境直接运行
conda run -n webproj python app.py
```

浏览器访问 **http://127.0.0.1:5000**。

- 浏览器需支持 WebGL 与 importmap（Chrome/Edge 89+、Firefox 108+、Safari 16.4+）
- **WSL2 用户**：请用 Windows 侧浏览器访问（localhost 互通）；WSL 内 X 转发的 Linux 浏览器通常无法创建 WebGL 上下文
- 默认使用 Flask 开发服务器，仅适合本地体验；对外部署请换 waitress / gunicorn

## 开发工具

```bash
# 冒烟测试（无需浏览器/WebGL）：遍历注册表全部器材，校验接口、元件 id、文案、装配与卡口兼容性
npm install three   # smoke.mjs 通过 node_modules 解析 three
node tools/smoke.mjs

# 截图调试（需要带 GPU/WebGL 的环境）
python -m venv .venv && .venv/bin/pip install playwright
.venv/bin/playwright install chromium
.venv/bin/python tools/shoot.py [url] [输出png] [等待毫秒] [explode|select:元件id]
```

## 后续可扩展方向

- 拆解状态下的 3D 标注引线
- 光圈叶片交互：拖动 f 值看孔径与景深变化
- 曝光三角联动模拟器
- 更多器材：FTZ 转接环、更多 Z 卡口镜头
