# Alarkit · 相机 3D 拆解台

一个以 3D 视角拆解、讲解相机的教学向 Web 应用。以 **Nikon Z6 III 机身** 搭配 **Nikkor Z 24-120mm f/4 S** 与 **Nikkor Z 85mm f/1.8 S** 两支镜头为例，可以整体查看器材组合，也可以一键"爆炸"成零件，点击任意元件了解它的用途、背后的摄影原理与实战技巧。

> 模型为 Three.js 几何体程序化拼装的教学示意图，非精确比例复刻。

## 功能特性

- **器材切换**：机身+变焦 / 机身+定焦 / 仅机身 / 仅镜头，共 5 种组合
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
│   └── index.html            # 三栏布局 + importmap
├── static/
│   ├── css/style.css         # 深色 UI 样式
│   ├── vendor/three/         # Three.js r160 + OrbitControls（本地化）
│   └── js/
│       ├── main.js           # 场景/灯光/拆解动画/拾取高亮/面板联动
│       ├── data.js           # 全部文案：元件介绍与器材简介
│       └── models/
│           ├── materials.js  # 共享材质 + 建模工具（mesh/box/cyl/mkPart）
│           ├── body.js       # Z6 III 机身：15 个可拆元件
│           ├── lensZoom.js   # 24-120 f/4 S：11 个可拆元件
│           └── lensPrime.js  # 85 f/1.8 S：9 个可拆元件
└── tools/
    ├── smoke.mjs             # Node 冒烟测试：构建模型、模拟拆解、校验文案
    ├── shoot.py              # Playwright 截图 + 控制台抓取（调试）
    └── webgl_probe.py        # 无头环境 WebGL 启动参数探测（调试）
```

**建模约定**：每个可拆元件是一个独立 `THREE.Group`，经 `mkPart(id, 名称, 类别, 节点, 拆解方向, 距离)` 注册；拆解动画即沿方向按滑块值插值偏移。新增元件/器材时按此约定建模并在 `data.js` 补文案即可。镜头元件 id 带 `l-` 前缀以避免与机身冲突。

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
# 冒烟测试（无需浏览器/WebGL）：构建全部模型并校验元件与文案完整性
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
