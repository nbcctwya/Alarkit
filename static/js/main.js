import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  cameras, lenses, brands, findGear, assemble, isCompatible,
  DEFAULT_CAMERA, DEFAULT_LENS,
} from './registry.js';
import { disposeTree } from './models/materials.js';
import { PART_INFO, GEAR_INFO } from './data.js';

// ---------- 渲染器 / 场景 / 相机 ----------
const canvas = document.getElementById('scene-canvas');
const viewport = document.getElementById('viewport');

// 任何 JS 错误直接显示在页面上，避免"无声黑框"
const errOverlay = document.getElementById('error-overlay');
const errDetail = document.getElementById('error-detail');
function showError(msg) {
  errOverlay.hidden = false;
  errDetail.textContent = String(msg);
}
window.addEventListener('error', (e) => showError(e.message));
window.addEventListener('unhandledrejection', (e) => showError(e.reason));

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
} catch (err) {
  showError('无法创建 WebGL 上下文（' + err.message + '）。');
  throw err;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f1115);
scene.fog = new THREE.Fog(0x0f1115, 6, 14);

const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 100);

// ---------- 灯光 ----------
scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x20242c, 0.85));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
keyLight.position.set(2.5, 3, 3.5);
scene.add(keyLight);
const rimLight = new THREE.DirectionalLight(0xbfd0ff, 0.8);
rimLight.position.set(-2.5, 1.5, -2.5);
scene.add(rimLight);
const fillLight = new THREE.DirectionalLight(0xffe8c8, 0.35);
fillLight.position.set(0, -1, 2);
scene.add(fillLight);

// ---------- 地面网格 ----------
let grid = null;
function buildGrid(c1, c2) {
  const g = new THREE.GridHelper(8, 40, c1, c2);
  g.position.y = -1.2; // 低于拆解后的电池位置，仅作空间参考
  return g;
}

// ---------- 背景主题（深色 / 亮色 / 工作台） ----------
// 纹理全部 Canvas 程序化生成，保持零贴图文件、离线可用
function gradientTexture(top, bottom) {
  const c = document.createElement('canvas');
  c.width = 16; c.height = 256;
  const ctx = c.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, top);
  grad.addColorStop(1, bottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 16, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function woodTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#6d5138'; // 胡桃木底色
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 90; i++) { // 木纹：多层半透明横向笔触
    const y = Math.random() * 512;
    const h = 1 + Math.random() * 3;
    ctx.fillStyle = Math.random() < 0.5
      ? `rgba(58, 40, 26, ${0.05 + Math.random() * 0.12})`
      : `rgba(146, 112, 76, ${0.04 + Math.random() * 0.10})`;
    ctx.fillRect(0, y, 512, h);
  }
  ctx.fillStyle = 'rgba(30, 20, 12, 0.5)'; // 板缝
  for (let x = 0; x <= 512; x += 128) ctx.fillRect(x, 0, 2, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// 工作台台面（仅 workbench 主题显示）
const bench = new THREE.Group();
const benchTop = new THREE.Mesh(
  new THREE.BoxGeometry(8, 0.08, 8),
  new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.05 })
);
benchTop.position.y = -1.24; // 顶面约 -1.2，与原网格同高
bench.add(benchTop);
bench.visible = false;
scene.add(bench);

const BG_THEMES = {
  dark: {
    bg: () => new THREE.Color(0x0f1115),
    fog: 0x0f1115,
    grid: [0x2b303c, 0x1b1f27],
    bench: false,
  },
  light: {
    bg: () => gradientTexture('#f7f8fa', '#dcdfe5'),
    fog: 0xe8ebef,
    grid: [0xb8bec8, 0xd4d8e0],
    bench: false,
  },
  workbench: {
    bg: () => gradientTexture('#2e2822', '#171310'),
    fog: 0x211c17,
    grid: null, // 木纹台面本身提供尺度感，隐藏网格
    bench: true,
  },
};
const bgTexCache = {};

function applyTheme(key) {
  const t = BG_THEMES[key] || BG_THEMES.dark;
  // 背景纹理首次使用时生成并缓存
  scene.background = bgTexCache[key] || (bgTexCache[key] = t.bg());
  scene.fog.color.set(t.fog);
  // GridHelper 颜色烘焙在顶点中，换色即重建（开销可忽略）
  if (grid) {
    scene.remove(grid);
    grid.geometry.dispose();
    grid.material.dispose();
    grid = null;
  }
  if (t.grid) {
    grid = buildGrid(t.grid[0], t.grid[1]);
    scene.add(grid);
  }
  if (t.bench && !benchTop.material.map) {
    benchTop.material.map = woodTexture();
    benchTop.material.needsUpdate = true;
  }
  bench.visible = t.bench;
  try { localStorage.setItem('bg-theme', key in BG_THEMES ? key : 'dark'); } catch (_) { /* 隐私模式等场景忽略 */ }
  bgSelect.value = key in BG_THEMES ? key : 'dark';
}

const bgSelect = document.getElementById('bg-select');
bgSelect.addEventListener('change', () => applyTheme(bgSelect.value));
applyTheme((() => { try { return localStorage.getItem('bg-theme') || 'dark'; } catch (_) { return 'dark'; } })());

// ---------- 控制器 ----------
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 0.4;
controls.maxDistance = 8;

// ---------- 器材装配 ----------
let gearGroup = null;      // 当前器材组合（机身 + 镜头）
let parts = [];            // 当前活动元件
let cameraInst = null;     // 当前机身实例
let lensInst = null;       // 当前镜头实例
let explodeTarget = 0;     // 拆解目标值 0..1
let explodeCurrent = 0;    // 平滑插值
let selectedPart = null;   // 当前选中元件
let focusTarget = null;    // 视角聚焦目标点
let homeView = { pos: new THREE.Vector3(), target: new THREE.Vector3() };

const DEFAULT_VIEW = { pos: [2.4, 1.1, 3.4], target: [0, 0, 0.5] };

// 当前组合应使用的视角：组合态用机身的 comboView，单器材用各自的 view
function currentView() {
  if (cameraInst && lensInst) return cameraInst.gear.comboView || cameraInst.gear.view || DEFAULT_VIEW;
  if (cameraInst) return cameraInst.gear.view || DEFAULT_VIEW;
  if (lensInst) return lensInst.gear.view || DEFAULT_VIEW;
  return DEFAULT_VIEW;
}

/**
 * 重建当前组合：移除旧器材并释放资源 → 装配新组合 → 重置拆解与选中 →
 * 重建元件列表与讲解面板 → 适配视角。视角/定位数据全部来自器材描述符。
 */
function rebuild(cameraId, lensId) {
  if (gearGroup) {
    scene.remove(gearGroup);
    disposeTree(gearGroup);
  }
  clearSelection();

  const a = assemble(cameraId || null, lensId || null);
  gearGroup = a.group;
  parts = a.parts;
  cameraInst = a.camera;
  lensInst = a.lens;
  scene.add(gearGroup);

  // 切换组合后重置拆解进度
  explodeTarget = explodeCurrent = 0;
  slider.value = 0;
  syncExplodeBtn();

  const v = currentView();
  homeView.pos.set(...v.pos);
  homeView.target.set(...v.target);
  resetView();
  buildPartList();
  renderGearInfo();
}

// ---------- 器材选择器 ----------
const brandSelect = document.getElementById('brand-select');
const cameraSelect = document.getElementById('camera-select');
const lensSelect = document.getElementById('lens-select');

function fillSelect(sel, entries, noneLabel) {
  const none = document.createElement('option');
  none.value = '';
  none.textContent = noneLabel;
  sel.appendChild(none);
  for (const g of entries) {
    const opt = document.createElement('option');
    opt.value = g.id;
    opt.textContent = g.name;
    sel.appendChild(opt);
  }
}

// 品牌选择器（首项「全部品牌」，值为 ''）
function fillBrandSelect() {
  fillSelect(brandSelect, brands.map((b) => ({ id: b, name: b })), '全部品牌');
}

// 按品牌重填机身/镜头选项（'' = 全部）；原选择在过滤后仍存在则保留
function refillGearSelects(brand) {
  const camList = brand ? cameras.filter((c) => c.brand === brand) : cameras;
  const lensList = brand ? lenses.filter((l) => l.brand === brand) : lenses;
  const curCam = cameraSelect.value;
  const curLens = lensSelect.value;
  cameraSelect.innerHTML = '';
  lensSelect.innerHTML = '';
  fillSelect(cameraSelect, camList, '无机身');
  fillSelect(lensSelect, lensList, '不装镜头');
  if (camList.some((c) => c.id === curCam)) cameraSelect.value = curCam;
  if (lensList.some((l) => l.id === curLens)) lensSelect.value = curLens;
}

brandSelect.addEventListener('change', () => {
  const b = brandSelect.value;
  if (!b) {
    refillGearSelects(''); // 全部品牌：仅解除过滤，不动当前组合
  } else {
    // 当前机身不属于该品牌时，切到该品牌套机（首个机身 + 首支兼容镜头）
    const cam = cameras.find((c) => c.brand === b);
    if (cam && (!cameraInst || cameraInst.gear.brand !== b)) {
      const lens = lenses.find((l) => l.brand === b && isCompatible(cam, l));
      refillGearSelects(b);
      cameraSelect.value = cam.id;
      lensSelect.value = lens ? lens.id : '';
      rebuild(cam.id, lensSelect.value);
    } else {
      refillGearSelects(b);
    }
  }
  refreshLensCompatibility();
});

// 按当前机身禁用卡口不兼容的镜头选项
function refreshLensCompatibility() {
  const cam = cameraInst ? cameraInst.gear : null;
  for (const opt of lensSelect.options) {
    if (!opt.value) continue;
    const lens = findGear(opt.value);
    const ok = !cam || isCompatible(cam, lens);
    opt.disabled = !ok;
    opt.title = ok ? '' : `卡口不兼容：${cam.mount} × ${lens.mount}`;
  }
}

cameraSelect.addEventListener('change', () => {
  let lensId = lensSelect.value;
  const cam = findGear(cameraSelect.value);
  const lens = findGear(lensId);
  // 当前镜头与新机身不兼容时自动卸下
  if (cam && lens && !isCompatible(cam, lens)) {
    lensId = '';
    lensSelect.value = '';
  }
  rebuild(cameraSelect.value, lensId);
  refreshLensCompatibility();
});

lensSelect.addEventListener('change', () => {
  rebuild(cameraSelect.value, lensSelect.value);
});

// ---------- 拆解 ----------
function applyExplode(f) {
  for (const p of parts) {
    p.node.position.copy(p.basePos).addScaledVector(p.dir, p.dist * f);
  }
}

const slider = document.getElementById('explode-slider');
const explodeBtn = document.getElementById('explode-btn');

slider.addEventListener('input', () => {
  // 拖动滑块即时生效；按钮切换仍走平滑动画
  explodeTarget = explodeCurrent = parseFloat(slider.value);
  applyExplode(explodeCurrent);
  syncExplodeBtn();
});

explodeBtn.addEventListener('click', () => {
  explodeTarget = explodeTarget < 0.5 ? 1 : 0;
  slider.value = explodeTarget;
  syncExplodeBtn();
});

function syncExplodeBtn() {
  const exploded = explodeTarget >= 0.5;
  explodeBtn.textContent = exploded ? '组合' : '拆解';
  explodeBtn.classList.toggle('active', exploded);
}

// ---------- 选中 / 高亮 ----------
function highlight(part, on) {
  part.node.traverse((o) => {
    if (!o.isMesh) return;
    const m = o.material;
    if (on) {
      if (m.userData.origEmissive === undefined) {
        m.userData.origEmissive = m.emissive.getHex();
        m.userData.origIntensity = m.emissiveIntensity;
      }
      m.emissive.setHex(0xf5b301);
      m.emissiveIntensity = 0.45;
    } else if (m.userData.origEmissive !== undefined) {
      m.emissive.setHex(m.userData.origEmissive);
      m.emissiveIntensity = m.userData.origIntensity;
    }
  });
}

function clearSelection() {
  if (selectedPart) highlight(selectedPart, false);
  selectedPart = null;
  document.querySelectorAll('.part-item.selected').forEach((el) => el.classList.remove('selected'));
}

function selectPart(id, focusView = true) {
  const part = parts.find((p) => p.id === id);
  if (!part) return;
  clearSelection();
  selectedPart = part;
  highlight(part, true);
  const el = document.querySelector(`.part-item[data-id="${id}"]`);
  if (el) {
    el.classList.add('selected');
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  renderPartInfo(id);
  if (focusView) {
    focusTarget = new THREE.Vector3();
    part.node.getWorldPosition(focusTarget);
  }
}

// ---------- 点击拾取 ----------
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let downPos = null;

canvas.addEventListener('pointerdown', (e) => { downPos = [e.clientX, e.clientY]; });
canvas.addEventListener('pointerup', (e) => {
  if (!downPos || !gearGroup) return;
  const dx = e.clientX - downPos[0], dy = e.clientY - downPos[1];
  downPos = null;
  if (dx * dx + dy * dy > 25) return; // 拖拽不算点击

  const rect = canvas.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(gearGroup.children, true);
  for (const hit of hits) {
    let obj = hit.object;
    while (obj && !obj.userData.partId) obj = obj.parent;
    if (obj && obj.userData.partId) {
      selectPart(obj.userData.partId);
      return;
    }
  }
  clearSelection();
  renderGearInfo();
});

// ---------- 左侧元件列表 ----------
function buildPartList() {
  const box = document.getElementById('part-list');
  box.innerHTML = '';
  const groups = [
    { inst: cameraInst, cat: 'body', label: '机身' },
    { inst: lensInst, cat: 'lens', label: '镜头' },
  ];
  for (const g of groups) {
    if (!g.inst) continue;
    const list = parts.filter((p) => p.cat === g.cat);
    if (!list.length) continue;
    const h = document.createElement('div');
    h.className = 'part-group-title';
    h.textContent = `${g.label} · ${g.inst.gear.name}`;
    box.appendChild(h);
    for (const p of list) {
      const item = document.createElement('div');
      item.className = 'part-item';
      item.dataset.id = p.id;
      item.textContent = p.name;
      item.addEventListener('click', () => selectPart(p.id));
      box.appendChild(item);
    }
  }
}

// ---------- 右侧信息面板 ----------
function infoHtml() {
  return document.getElementById('info-content');
}

function gearInfoHtml(g) {
  return `
    <div class="gear-name">${g.name}</div>
    <div class="gear-sub">${g.sub}</div>
    <div class="info-section"><p>${g.desc}</p></div>`;
}

function renderGearInfo() {
  document.getElementById('info-title').textContent = '器材简介';
  const camId = cameraInst ? cameraInst.gear.id : null;
  const lensId = lensInst ? lensInst.gear.id : null;
  // 优先组合文案；没有组合文案时分别展示机身与镜头简介
  const combo = camId && lensId ? GEAR_INFO[`${camId}+${lensId}`] : null;
  if (combo) {
    infoHtml().innerHTML = gearInfoHtml(combo);
    return;
  }
  const sections = [camId, lensId].filter(Boolean).map((id) => GEAR_INFO[id]).filter(Boolean);
  infoHtml().innerHTML = sections.length
    ? sections.map(gearInfoHtml).join('')
    : '<div class="info-section"><p>请选择机身或镜头开始查看。</p></div>';
}

function renderPartInfo(id) {
  const part = parts.find((p) => p.id === id);
  if (!part) return;
  // 文案查询：先器材专属键（器材id:元件id），再共用键（元件局部 id）
  const info = PART_INFO[part.id] || PART_INFO[part.localId];
  if (!info) return;
  document.getElementById('info-title').textContent = '元件介绍';
  infoHtml().innerHTML = `
    <div class="part-name">${info.name}</div>
    <div class="part-cat">${info.cat}</div>
    <div class="info-section"><h3>用途</h3><p>${info.purpose}</p></div>
    <div class="info-section"><h3>摄影原理</h3><p>${info.principle}</p></div>
    <div class="info-section"><h3>实战技巧</h3><p>${info.tips}</p></div>`;
}

// ---------- 视角 ----------
function resetView() {
  camera.position.copy(homeView.pos);
  controls.target.copy(homeView.target);
  focusTarget = null;
}

document.getElementById('reset-view-btn').addEventListener('click', resetView);
canvas.addEventListener('dblclick', resetView);

// ---------- 尺寸自适应 ----------
function resize() {
  const w = viewport.clientWidth, h = viewport.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(viewport);
resize();

// ---------- 渲染循环 ----------
function animate() {
  requestAnimationFrame(animate);
  if (Math.abs(explodeCurrent - explodeTarget) > 0.0005) {
    explodeCurrent += (explodeTarget - explodeCurrent) * 0.12;
    applyExplode(explodeCurrent);
    slider.value = explodeCurrent;
  }
  if (focusTarget) {
    controls.target.lerp(focusTarget, 0.12);
    if (controls.target.distanceTo(focusTarget) < 0.01) focusTarget = null;
  }
  controls.update();
  renderer.render(scene, camera);
}

// ---------- 初始组合 ----------
fillBrandSelect();
refillGearSelects('');
cameraSelect.value = DEFAULT_CAMERA;
lensSelect.value = DEFAULT_LENS;
rebuild(DEFAULT_CAMERA, DEFAULT_LENS);
refreshLensCompatibility();
animate();
