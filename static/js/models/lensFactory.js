import * as THREE from 'three';
import { M, mesh, box, cyl, mkPart, lensElement, apertureUnit } from './materials.js';

const elem = (r, t, mat) => { const e = lensElement(r, t, mat); e.rotation.x = Math.PI / 2; return e; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// 默认元件名称（尼康 Z 口径），可由 spec.labels 逐项覆盖（各品牌差异化命名，
// 如卡口名称、光圈环、OIS 防抖等）
const DEFAULT_LABELS = {
  barrel: '镜筒与内部骨架',
  mount: 'Z 卡口与电子触点',
  'control-ring': '控制环（可自定义）',
  'focus-group': '对焦镜片组',
  'zoom-ring': '变焦环',
  'zoom-group': '变焦镜片组',
  'focus-ring': '对焦环',
  'front-element': '前镜片（前玉）',
  'info-panel': 'OLED 信息屏',
  'tripod-collar': '脚架环',
  'vr-unit': 'VR 光学防抖单元',
  'lens-hood': '一体式遮光罩',
};

// ============================================================
// 模板零件：每个函数接收 ctx，返回 mkPart 结果。
// ctx = { L, R, kind, ap, D, frontBulb, labels }（L=全长，R=半径，D=拆解距离表）
// ============================================================

// ---------- 镜筒（基准，不拆解） ----------
function pBarrel(ctx) {
  const { L, R, labels } = ctx;
  const barrel = new THREE.Group();
  barrel.add(mesh(cyl(R, R * 0.96, L * 0.9, 64), M.barrel, 0, 0, L * 0.51, Math.PI / 2));
  barrel.add(mesh(cyl(R * 0.93, R * 0.93, L * 0.1, 64), M.barrel, 0, 0, L * 0.09, Math.PI / 2));
  barrel.add(mesh(new THREE.TorusGeometry(R * 0.95, 0.02, 12, 64), M.metalDark, 0, 0, L * 0.95));
  return mkPart('barrel', labels.barrel, 'lens', barrel, V3(0, 0, 0), 0);
}

// ---------- 卡口与电子触点 ----------
function pMount(ctx) {
  const { R, labels } = ctx;
  const mount = new THREE.Group();
  mount.position.set(0, 0, 0.02);
  mount.add(mesh(cyl(R * 0.83, R * 0.86, 0.08, 64), M.metal, 0, 0, 0, Math.PI / 2));
  for (let i = 0; i < 3; i++) { // 卡口卡爪
    const a = (i / 3) * Math.PI * 2;
    mount.add(mesh(box(0.1, 0.05, 0.03, M.metal), Math.cos(a) * R * 0.79, Math.sin(a) * R * 0.79, 0.05, 0, 0, a));
  }
  for (let i = 0; i < 11; i++) { // 电子触点
    mount.add(mesh(box(0.018, 0.008, 0.012, M.gold), -0.09 + i * 0.018, -R * 0.71, -0.01));
  }
  return mkPart('mount', labels.mount, 'lens', mount, V3(0, 0, -1), 0.5);
}

// ---------- 控制环 ----------
function pControlRing(ctx) {
  const { L, R, D, labels } = ctx;
  const ctrlRing = new THREE.Group();
  ctrlRing.position.set(0, 0, L * 0.14);
  ctrlRing.add(mesh(cyl(R * 0.99, R * 0.99, L * 0.06, 64), M.ring, 0, 0, 0, Math.PI / 2));
  return mkPart('control-ring', labels['control-ring'], 'lens', ctrlRing, V3(0, 0, 1), D.ctrl);
}

// ---------- 对焦马达 ----------
function pAfMotor(ctx) {
  const { L, R, D, labels } = ctx;
  const motor = new THREE.Group();
  motor.position.set(0, 0, L * 0.24);
  motor.add(mesh(new THREE.TorusGeometry(R * 0.71, R * 0.1, 16, 64), M.metalDark));
  motor.add(mesh(box(R * 0.19, R * 0.33, R * 0.24, M.chip), R * 0.71, -R * 0.29, 0));
  return mkPart('af-motor', labels['af-motor'], 'lens', motor, V3(0, 0, 1), D.motor);
}

// ---------- 对焦镜片组 ----------
function pFocusGroup(ctx) {
  const { L, R, D, labels } = ctx;
  const focusGroup = new THREE.Group();
  focusGroup.position.set(0, 0, L * 0.32);
  focusGroup.add(elem(R * 0.52, 0.05));
  const fg2 = elem(R * 0.57, 0.04); fg2.position.z = 0.08; focusGroup.add(fg2);
  return mkPart('focus-group', labels['focus-group'], 'lens', focusGroup, V3(0, 0, 1), D.focus);
}

// ---------- 光圈叶片 ----------
function pAperture(ctx) {
  const { L, D, ap, labels } = ctx;
  const aperture = new THREE.Group();
  aperture.position.set(0, 0, L * 0.42);
  aperture.add(apertureUnit(ap.rOuter, ap.rHole, ap.blades));
  return mkPart('aperture', labels.aperture, 'lens', aperture, V3(0, 0, 1), D.ap);
}

// ---------- 变焦环（仅变焦镜头） ----------
function pZoomRing(ctx) {
  const { L, R, labels } = ctx;
  const zoomRing = new THREE.Group();
  zoomRing.position.set(0, 0, L * 0.54);
  zoomRing.add(mesh(cyl(R * 1.02, R * 1.02, L * 0.24, 64), M.ring, 0, 0, 0, Math.PI / 2));
  return mkPart('zoom-ring', labels['zoom-ring'], 'lens', zoomRing, V3(0, 0, 1), 1.35);
}

// ---------- 变焦镜片组（仅变焦镜头） ----------
function pZoomGroup(ctx) {
  const { L, R, labels } = ctx;
  const zoomGroup = new THREE.Group();
  zoomGroup.position.set(0, 0, L * 0.61);
  zoomGroup.add(elem(R * 0.67, 0.05));
  const zg2 = elem(R * 0.71, 0.04); zg2.position.z = 0.09; zoomGroup.add(zg2);
  return mkPart('zoom-group', labels['zoom-group'], 'lens', zoomGroup, V3(0, 0, 1), 1.55);
}

// ---------- 对焦环 ----------
function pFocusRing(ctx) {
  const { L, R, kind, labels } = ctx;
  const focusRing = new THREE.Group();
  focusRing.position.set(0, 0, L * 0.8);
  focusRing.add(mesh(cyl(R * 1.01, R * 1.01, L * 0.12, 64), M.ring, 0, 0, 0, Math.PI / 2));
  return mkPart('focus-ring', labels['focus-ring'], 'lens', focusRing, V3(0, 0, 1), kind === 'zoom' ? 1.72 : 1.3);
}

// ---------- 前镜片组 ----------
function pFrontGroup(ctx) {
  const { L, R, D, labels } = ctx;
  const frontGroup = new THREE.Group();
  frontGroup.position.set(0, 0, L * 0.85);
  frontGroup.add(elem(R * 0.76, 0.06));
  const fg3 = elem(R * 0.81, 0.05); fg3.position.z = 0.08; frontGroup.add(fg3);
  return mkPart('front-group', labels['front-group'], 'lens', frontGroup, V3(0, 0, 1), D.frontGrp);
}

// ---------- 前玉 ----------
function pFrontElement(ctx) {
  const { L, R, D, frontBulb, labels } = ctx;
  const front = new THREE.Group();
  front.position.set(0, 0, L * 0.96);
  front.add(elem(frontBulb ? R * 0.95 : R * 0.86, 0.045, M.glassFront));
  if (frontBulb) { // 大曲率灯泡前玉：大半径玻璃片 + 微凸内片
    const bulb = elem(R * 0.8, 0.03, M.glassFront); bulb.position.z = 0.05; front.add(bulb);
  }
  return mkPart('front-element', labels['front-element'], 'lens', front, V3(0, 0, 1), D.front);
}

// ---------- OLED 信息屏（附加件，向上拆解） ----------
function pInfoPanel(ctx) {
  const { L, R, labels } = ctx;
  const panel = new THREE.Group();
  panel.position.set(0, R * 0.97, L * 0.26);
  panel.add(mesh(box(R * 0.56, 0.02, L * 0.14, M.darkPlastic), 0, -0.005, 0));
  panel.add(mesh(box(R * 0.5, 0.025, L * 0.12, M.screen), 0, 0.012, 0));
  return mkPart('info-panel', labels['info-panel'], 'lens', panel, V3(0, 1, 0), 0.6);
}

// ---------- 脚架环（附加件，向下拆解） ----------
function pTripodCollar(ctx) {
  const { L, R, labels } = ctx;
  const collar = new THREE.Group();
  collar.position.set(0, 0, L * 0.34);
  collar.add(mesh(cyl(R * 1.1, R * 1.1, L * 0.05, 64), M.metalDark, 0, 0, 0, Math.PI / 2));
  collar.add(mesh(box(0.14, 0.16, 0.08, M.metalDark), 0, -R * 1.1 - 0.06, 0));
  collar.add(mesh(box(0.22, 0.04, 0.18, M.metal), 0, -R * 1.1 - 0.16, 0));
  return mkPart('tripod-collar', labels['tripod-collar'], 'lens', collar, V3(0, -1, 0), 0.8);
}

// ---------- VR 光学防抖单元（附加件） ----------
function pVrUnit(ctx) {
  const { L, R, labels } = ctx;
  const vr = new THREE.Group();
  vr.position.set(0, 0, L * 0.36);
  vr.add(mesh(new THREE.TorusGeometry(R * 0.6, R * 0.09, 16, 64), M.metalDark));
  vr.add(elem(R * 0.5, 0.03));
  vr.add(mesh(box(R * 0.14, R * 0.24, R * 0.14, M.chip), R * 0.6, R * 0.35, 0));
  return mkPart('vr-unit', labels['vr-unit'], 'lens', vr, V3(0, 0, 1), 1.05);
}

// ---------- 一体式遮光罩（附加件） ----------
function pLensHood(ctx) {
  const { L, R, labels } = ctx;
  const hood = new THREE.Group();
  hood.position.set(0, 0, L * 1.0);
  hood.add(mesh(cyl(R * 1.18, R * 1.0, L * 0.12, 64), M.barrel, 0, 0, L * 0.03, Math.PI / 2));
  hood.add(mesh(new THREE.TorusGeometry(R * 1.18, 0.015, 12, 64), M.rubber, 0, 0, L * 0.09));
  return mkPart('lens-hood', labels['lens-hood'], 'lens', hood, V3(0, 0, 1), 2.5);
}

// 模板分发表：局部 id → 模板构建函数
const TEMPLATE = {
  barrel: pBarrel,
  mount: pMount,
  'control-ring': pControlRing,
  'af-motor': pAfMotor,
  'focus-group': pFocusGroup,
  aperture: pAperture,
  'zoom-ring': pZoomRing,
  'zoom-group': pZoomGroup,
  'focus-ring': pFocusRing,
  'front-group': pFrontGroup,
  'front-element': pFrontElement,
  'info-panel': pInfoPanel,
  'tripod-collar': pTripodCollar,
  'vr-unit': pVrUnit,
  'lens-hood': pLensHood,
};

/**
 * 镜头参数化工厂：按 spec 生成教学示意镜头模型。
 * 坐标约定与 lensNikon24120.js 一致：光轴沿 +Z，卡口端 z=0，前玉朝 +Z。
 *
 * spec = {
 *   length   全长（卡口面到前玉）
 *   radius   镜筒半径
 *   kind     'zoom' | 'prime'（prime 无变焦环 / 变焦镜片组）
 *   aperture { rOuter, rHole, blades } 光圈尺寸，按最大光圈拉开档次
 *   frontBulb true 时前玉用接近镜筒口径的大半径玻璃片（大曲率"灯泡"效果）
 *   extras   { infoPanel, tripodCollar, vrUnit, lensHood } 附加件开关
 *   manualFocus true 时去掉 af-motor（手动对焦镜头，如徕卡 M）
 *   labels   { 局部id: 显示名 } 可选，差异化命名（卡口、光圈环、OIS 等）
 *   overrides { 局部id: (ctx) => part } 可选，精修钩子：用定制构建函数替代模板零件。
 *                                     必须返回 mkPart 结果并沿用契约 id
 * }
 * 返回 { root, parts, mountAnchor: { position } }
 */
export function buildLens(spec) {
  const L = spec.length;
  const R = spec.radius;
  const kind = spec.kind === 'prime' ? 'prime' : 'zoom';
  const ex = spec.extras || {};
  const ap = spec.aperture || { rOuter: R * 0.72, rHole: R * 0.45, blades: 9 };
  // 拆解距离：基准件 0，其余沿 +Z 递增（量级对齐 lensNikon24120.js / lensNikon85.js）
  const D = kind === 'zoom'
    ? { ctrl: 0.45, motor: 0.72, focus: 0.95, ap: 1.2, frontGrp: 1.9, front: 2.2 }
    : { ctrl: 0.4, motor: 0.65, focus: 0.9, ap: 1.1, frontGrp: 1.6, front: 1.9 };
  // 元件名称：默认值与历史版本一致（动态项按 kind/blades 生成），spec.labels 覆盖
  const labels = {
    ...DEFAULT_LABELS,
    'af-motor': kind === 'zoom' ? 'STM 步进对焦马达' : 'AF 对焦马达',
    aperture: `光圈叶片（${ap.blades} 片）`,
    'front-group': kind === 'zoom' ? '前镜片组（含 ED / 非球面镜片）' : '前镜片组（含 ED 镜片）',
    ...(spec.labels || {}),
  };
  const ctx = { L, R, kind, ap, D, frontBulb: !!spec.frontBulb, labels };

  const ORDER = [
    'barrel', 'mount', 'control-ring',
    ...(spec.manualFocus ? [] : ['af-motor']),
    'focus-group', 'aperture',
    ...(kind === 'zoom' ? ['zoom-ring', 'zoom-group'] : []),
    'focus-ring', 'front-group', 'front-element',
    ...(ex.infoPanel ? ['info-panel'] : []),
    ...(ex.tripodCollar ? ['tripod-collar'] : []),
    ...(ex.vrUnit ? ['vr-unit'] : []),
    ...(ex.lensHood ? ['lens-hood'] : []),
  ];

  const root = new THREE.Group();
  const parts = [];
  for (const id of ORDER) {
    const build = (spec.overrides && spec.overrides[id]) || TEMPLATE[id];
    const p = build(ctx);
    root.add(p.node);
    parts.push(p);
  }

  return {
    root,
    parts,
    mountAnchor: { position: new THREE.Vector3(0, 0, 0) }, // 后卡口端面中心（局部原点）
  };
}
