import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildBody } from './models/body.js';
import { buildZoomLens } from './models/lensZoom.js';
import { buildPrimeLens } from './models/lensPrime.js';
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
const grid = new THREE.GridHelper(8, 40, 0x2b303c, 0x1b1f27);
grid.position.y = -1.2; // 低于拆解后的电池位置，仅作空间参考
scene.add(grid);

// ---------- 控制器 ----------
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 0.4;
controls.maxDistance = 8;

// ---------- 模型装配 ----------
const models = {
  body: buildBody(),
  zoom: buildZoomLens(),
  prime: buildPrimeLens(),
};

let gearGroup = null;      // 当前器材组合
let parts = [];            // 当前可拆解元件
let currentGear = '';
let explodeTarget = 0;     // 拆解目标值 0..1
let explodeCurrent = 0;    // 平滑插值
let selectedPart = null;   // 当前选中元件
let focusTarget = null;    // 视角聚焦目标点
let homeView = { pos: new THREE.Vector3(), target: new THREE.Vector3() };

const GEAR_VIEWS = {
  'body+zoom': { pos: [2.4, 1.1, 3.4], target: [0, -0.02, 0.5] },
  'body+prime': { pos: [2.2, 1.0, 3.0], target: [0, -0.02, 0.4] },
  'body': { pos: [1.7, 0.9, 2.3], target: [0, 0, 0.1] },
  'zoom': { pos: [1.5, 0.7, 2.6], target: [0, 0, 0.6] },
  'prime': { pos: [1.4, 0.6, 2.3], target: [0, 0, 0.5] },
};

function setGear(key) {
  if (gearGroup) scene.remove(gearGroup);
  gearGroup = new THREE.Group();
  parts = [];
  clearSelection();

  const withBody = key.includes('body');
  const lensKey = key.includes('zoom') ? 'zoom' : (key.includes('prime') ? 'prime' : null);

  if (withBody) {
    gearGroup.add(models.body.group);
    parts.push(...models.body.parts);
  }
  if (lensKey) {
    const lens = models[lensKey];
    if (withBody) {
      lens.group.position.set(0, models.body.lensY, models.body.mountZ);
    } else {
      lens.group.position.set(0, 0, 0);
    }
    gearGroup.add(lens.group);
    parts.push(...lens.parts);
  }

  scene.add(gearGroup);
  currentGear = key;
  applyExplode(explodeCurrent); // 保持当前拆解状态

  const v = GEAR_VIEWS[key];
  homeView.pos.set(...v.pos);
  homeView.target.set(...v.target);
  resetView();
  buildPartList();
  renderGearInfo();
}

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
  if (!downPos) return;
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
    { cat: 'body', title: '机身 · Nikon Z6 III' },
    { cat: 'lens', title: currentGear.includes('prime') ? '镜头 · Z 85mm f/1.8 S' : '镜头 · Z 24-120mm f/4 S' },
  ];
  for (const g of groups) {
    const list = parts.filter((p) => p.cat === g.cat);
    if (!list.length) continue;
    const h = document.createElement('div');
    h.className = 'part-group-title';
    h.textContent = g.title;
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

function renderGearInfo() {
  const g = GEAR_INFO[currentGear];
  document.getElementById('info-title').textContent = '器材简介';
  infoHtml().innerHTML = `
    <div class="gear-name">${g.name}</div>
    <div class="gear-sub">${g.sub}</div>
    <div class="info-section"><p>${g.desc}</p></div>`;
}

function renderPartInfo(id) {
  const lensKey = currentGear.includes('prime') ? 'prime'
    : currentGear.includes('zoom') ? 'zoom' : null;
  const key = id.startsWith('l-') ? id.slice(2) : id; // 镜头元件去掉 l- 前缀查文案
  const info = (lensKey && PART_INFO[`${lensKey}:${key}`]) || PART_INFO[key];
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
document.getElementById('gear-select').addEventListener('change', (e) => setGear(e.target.value));

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

setGear('body+zoom');
animate();
