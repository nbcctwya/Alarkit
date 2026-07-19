import * as THREE from 'three';
import { M, mesh, box, cyl, mkPart } from './materials.js';

// 参考机身（Nikon Z6 III）外形尺寸：所有特征相对它逐轴等比缩放，
// dims 取参考值时造型与 bodyNikonZ6iii.js 完全一致。
const REF_W = 1.39, REF_H = 1.02, REF_D = 0.74;
const LENS_Y = -0.02;   // 光轴高度（与 bodyNikonZ6iii.js 一致）

// 默认元件名称，可由 spec.labels 逐项覆盖（各机型差异化文案）
const DEFAULT_LABELS = {
  chassis: '机身骨架（镁合金）',
  grip: '握把（饰皮）',
  'top-plate': '顶盖与军舰部',
  evf: 'EVF 电子取景器',
  'hot-shoe': '热靴接口',
  'mode-dial': '曝光模式拨盘',
  controls: '快门键与前后拨盘',
  mount: 'Z 卡口与电子触点',
  shutter: '快门帘幕',
  'sensor-shield': '传感器保护帘',
  sensor: 'CMOS 传感器',
  ibis: 'IBIS 机身防抖机构',
  mainboard: '主板',
  lcd: 'LCD 翻转触控屏',
  battery: '电池',
  'card-slots': '存储卡槽',
  'vertical-grip': '一体式竖拍手柄',
};

// ============================================================
// 模板零件：每个函数接收 ctx，返回 mkPart 结果。
// ctx = { w, h, d, sx, sy, sz, sr, sk, hh, hd, LENS_Y, L, sensorFormat, verticalGrip }
// ============================================================

// ---------- 机身骨架（基准，不拆解） ----------
function pChassis(ctx) {
  const { w, h, d, sx, sy, sz, hh, hd, L } = ctx;
  const chassis = new THREE.Group();
  chassis.add(mesh(box(w, h, d, M.shell)));
  // 正面饰皮
  chassis.add(mesh(box(0.6 * sx, 0.9 * sy, 0.02, M.rubber), 0.3 * sx, -0.02, hd + 0.005));
  // 肩部小肩屏
  chassis.add(mesh(box(0.22 * sx, 0.02, 0.14 * sz, M.screen), -0.45 * sx, hh + 0.01, 0.05 * sz));
  return mkPart('chassis', L.chassis, 'body', chassis, new THREE.Vector3(0, 0, 0), 0);
}

// ---------- 握把 ----------
function pGrip(ctx) {
  const { sx, sy, sz, L } = ctx;
  const grip = new THREE.Group();
  grip.position.set(-0.74 * sx, -0.04 * sy, 0.2 * sz);
  grip.add(mesh(box(0.3 * sx, 0.92 * sy, 0.46 * sz, M.rubber)));
  grip.add(mesh(cyl(0.15 * sx, 0.15 * sx, 0.9 * sy, 24), M.rubber, -0.1 * sx, 0, 0.12 * sz, 0, 0, 0)); // 前缘圆弧
  return mkPart('grip', L.grip, 'body', grip, new THREE.Vector3(-1, 0, 0.12), 0.45);
}

// ---------- 顶盖 + 军舰部 ----------
function pTopPlate(ctx) {
  const { w, d, sx, sy, sz, hh, L } = ctx;
  const top = new THREE.Group();
  top.position.set(0, hh + 0.04 * sy, 0);
  top.add(mesh(box(w, 0.08 * sy, d, M.shell), 0, 0, 0));
  const humpShape = new THREE.Shape();
  humpShape.moveTo(-0.26 * sz, 0); humpShape.lineTo(0.26 * sz, 0);
  humpShape.lineTo(0.15 * sz, 0.14 * sy); humpShape.lineTo(0, 0.21 * sy); humpShape.lineTo(-0.15 * sz, 0.14 * sy);
  humpShape.closePath();
  const humpGeo = new THREE.ExtrudeGeometry(humpShape, { depth: 0.46 * sx, bevelEnabled: false });
  humpGeo.rotateY(Math.PI / 2);
  humpGeo.translate(-0.23 * sx, 0, 0);
  top.add(mesh(humpGeo, M.shell, 0, 0.04 * sy, -0.05 * sz));
  return mkPart('top-plate', L['top-plate'], 'body', top, new THREE.Vector3(0, 1, 0), 0.6);
}

// ---------- EVF 电子取景器 ----------
function pEvf(ctx) {
  const { sx, sy, sz, sr, L } = ctx;
  const evf = new THREE.Group();
  evf.position.set(0, 0.63 * sy, -0.3 * sz);
  evf.add(mesh(box(0.3 * sx, 0.2 * sy, 0.16 * sz, M.darkPlastic), 0, 0, 0.05 * sz));
  evf.add(mesh(cyl(0.075 * sr, 0.075 * sr, 0.1 * sz, 32), M.darkPlastic, 0, 0.02 * sy, -0.08 * sz, Math.PI / 2));
  evf.add(mesh(cyl(0.06 * sr, 0.06 * sr, 0.02, 32), M.glassFront, 0, 0.02 * sy, -0.12 * sz, Math.PI / 2));
  return mkPart('evf', L.evf, 'body', evf, new THREE.Vector3(0, 0.55, -0.85), 0.95);
}

// ---------- 热靴 ----------
function pHotShoe(ctx) {
  const { sx, sy, sz, L } = ctx;
  const shoe = new THREE.Group();
  shoe.position.set(0, 0.82 * sy, -0.05 * sz);
  shoe.add(mesh(box(0.2 * sx, 0.025, 0.18 * sz, M.metalDark)));
  shoe.add(mesh(box(0.16 * sx, 0.015, 0.14 * sz, M.darkPlastic), 0, 0.02 * sy, 0));
  return mkPart('hot-shoe', L['hot-shoe'], 'body', shoe, new THREE.Vector3(0, 1, 0), 1.25);
}

// ---------- 模式拨盘 ----------
function pModeDial(ctx) {
  const { sx, sy, sz, sr, L } = ctx;
  const modeDial = new THREE.Group();
  modeDial.position.set(0.45 * sx, 0.63 * sy, -0.05 * sz);
  modeDial.add(mesh(cyl(0.1 * sr, 0.1 * sr, 0.06 * sy, 32), M.darkPlastic));
  modeDial.add(mesh(cyl(0.045 * sr, 0.045 * sr, 0.025 * sy, 24), M.metalDark, 0, 0.04 * sy, 0));
  return mkPart('mode-dial', L['mode-dial'], 'body', modeDial, new THREE.Vector3(0.2, 1, 0), 0.95);
}

// ---------- 操控组件（快门键 + 前/后拨盘） ----------
function pControls(ctx) {
  const { sx, sy, sz, sr, L } = ctx;
  const ctrl = new THREE.Group();
  ctrl.add(mesh(cyl(0.05 * sr, 0.05 * sr, 0.04 * sy, 24), M.metalDark, -0.53 * sx, 0.62 * sy, 0.2 * sz));                // 快门键
  ctrl.add(mesh(cyl(0.055 * sr, 0.055 * sr, 0.05 * sz, 24), M.darkPlastic, -0.72 * sx, 0.3 * sy, 0.46 * sz, Math.PI / 2)); // 前拨盘
  ctrl.add(mesh(cyl(0.06 * sr, 0.06 * sr, 0.04 * sz, 24), M.darkPlastic, -0.45 * sx, 0.5 * sy, -0.38 * sz, Math.PI / 2));  // 后拨盘
  ctrl.add(mesh(box(0.16 * sx, 0.03 * sy, 0.1 * sz, M.darkPlastic), -0.68 * sx, 0.6 * sy, 0.32 * sz));                   // 开关键座
  return mkPart('controls', L.controls, 'body', ctrl, new THREE.Vector3(-0.25, 1, 0.1), 1.1);
}

// ---------- Z 卡口 ----------
function pMount(ctx) {
  const { sr, hd, LENS_Y, L } = ctx;
  const mount = new THREE.Group();
  mount.position.set(0, LENS_Y, hd + 0.01);
  mount.add(mesh(new THREE.TorusGeometry(0.31 * sr, 0.035, 16, 64), M.metal));
  mount.add(mesh(cyl(0.29 * sr, 0.29 * sr, 0.03, 64), M.darkPlastic, 0, 0, -0.02, Math.PI / 2));
  // 卡口电子触点
  for (let i = 0; i < 11; i++) {
    mount.add(mesh(box(0.018, 0.008, 0.01, M.gold), (-0.09 + i * 0.018) * sr, -0.26 * sr, 0.03));
  }
  return mkPart('mount', L.mount, 'body', mount, new THREE.Vector3(0, 0, 1), 0.6);
}

// ---------- 快门帘幕（机械快门机型） ----------
function pShutter(ctx) {
  const { sr, sk, hd, LENS_Y, L } = ctx;
  const cw = 0.42 * sr * sk, chh = 0.15 * sr * sk;
  const shutter = new THREE.Group();
  shutter.position.set(0, LENS_Y, hd - 0.07);
  shutter.add(mesh(box(cw, chh, 0.012, M.metalDark), 0, chh / 2, 0));
  shutter.add(mesh(box(cw, chh, 0.012, M.metalDark), 0, -(chh / 2 + 0.01), 0.004));
  return mkPart('shutter', L.shutter, 'body', shutter, new THREE.Vector3(0, 0, -1), 0.75);
}

// ---------- 传感器保护帘（无机械快门机型，位置同快门帘） ----------
function pSensorShield(ctx) {
  const { sr, sk, hd, LENS_Y, L } = ctx;
  const shield = new THREE.Group();
  shield.position.set(0, LENS_Y, hd - 0.07);
  shield.add(mesh(box(0.46 * sr * sk, 0.34 * sr * sk, 0.008, M.metalDark)));
  return mkPart('sensor-shield', L['sensor-shield'], 'body', shield, new THREE.Vector3(0, 0, -1), 0.75);
}

// ---------- CMOS 传感器 ----------
function pSensor(ctx) {
  const { sr, sk, hd, LENS_Y, L } = ctx;
  const sensor = new THREE.Group();
  sensor.position.set(0, LENS_Y, hd - 0.12);
  sensor.add(mesh(box(0.36 * sr * sk, 0.24 * sr * sk, 0.018, M.sensor)));
  sensor.add(mesh(box(0.44 * sr * sk, 0.32 * sr * sk, 0.01, M.chip), 0, 0, -0.015));
  return mkPart('sensor', L.sensor, 'body', sensor, new THREE.Vector3(0, 0, -1), 1.15);
}

// ---------- IBIS 机身防抖机构 ----------
function pIbis(ctx) {
  const { sr, sk, hd, LENS_Y, L } = ctx;
  const ibis = new THREE.Group();
  ibis.position.set(0, LENS_Y, hd - 0.12);
  const fw = 0.56 * sr * sk, fh = 0.44 * sr * sk, ft = 0.05 * sr;
  ibis.add(mesh(box(fw, ft, 0.04, M.metalDark), 0, fh / 2, 0));
  ibis.add(mesh(box(fw, ft, 0.04, M.metalDark), 0, -fh / 2, 0));
  ibis.add(mesh(box(ft, fh, 0.04, M.metalDark), fw / 2, 0, 0));
  ibis.add(mesh(box(ft, fh, 0.04, M.metalDark), -fw / 2, 0, 0));
  // 四角驱动线圈
  [[fw / 2, fh / 2], [-fw / 2, fh / 2], [fw / 2, -fh / 2], [-fw / 2, -fh / 2]].forEach(([x, y]) => {
    ibis.add(mesh(cyl(0.035 * sr, 0.035 * sr, 0.06, 16), M.gold, x, y, 0, Math.PI / 2));
  });
  return mkPart('ibis', L.ibis, 'body', ibis, new THREE.Vector3(0, 0, -1), 0.95);
}

// ---------- 主板 ----------
function pMainboard(ctx) {
  const { sx, sy, sz, LENS_Y, L } = ctx;
  const board = new THREE.Group();
  board.position.set(0, LENS_Y, -0.1 * sz);
  board.add(mesh(box(0.7 * sx, 0.55 * sy, 0.03, M.pcb)));
  board.add(mesh(box(0.18 * sx, 0.18 * sy, 0.02, M.chip), -0.15 * sx, 0.1 * sy, 0.025));
  board.add(mesh(box(0.12 * sx, 0.12 * sy, 0.02, M.chip), 0.18 * sx, -0.08 * sy, 0.025));
  board.add(mesh(box(0.08 * sx, 0.2 * sy, 0.015, M.chip), 0.05 * sx, 0.15 * sy, 0.022));
  return mkPart('mainboard', L.mainboard, 'body', board, new THREE.Vector3(0, 0, -1), 1.45);
}

// ---------- LCD 翻转屏 ----------
function pLcd(ctx) {
  const { sx, sy, hd, LENS_Y, L } = ctx;
  const lcd = new THREE.Group();
  lcd.position.set(0, LENS_Y, -(hd + 0.02));
  lcd.add(mesh(box(0.66 * sx, 0.5 * sy, 0.035, M.darkPlastic)));
  lcd.add(mesh(box(0.58 * sx, 0.42 * sy, 0.01, M.screen), 0, 0, -0.02));
  return mkPart('lcd', L.lcd, 'body', lcd, new THREE.Vector3(0, 0, -1), 1.85);
}

// ---------- 电池 ----------
function pBattery(ctx) {
  const { sx, sy, sz, L, verticalGrip } = ctx;
  const battery = new THREE.Group();
  battery.position.set(-0.72 * sx, -0.3 * sy, 0.18 * sz);
  battery.add(mesh(box(0.2 * sx, 0.45 * sy, 0.16 * sz, M.battery)));
  battery.add(mesh(box(0.16 * sx, 0.03 * sy, 0.12 * sz, M.gold), 0, 0.24 * sy, 0));
  // 竖拍手柄机型电池仓更深，拆解行程加长以避免与手柄件重叠
  return mkPart('battery', L.battery, 'body', battery, new THREE.Vector3(0, -1, 0), verticalGrip ? 1.1 : 0.75);
}

// ---------- 存储卡槽 ----------
function pCardSlots(ctx) {
  const { sx, sy, sz, L } = ctx;
  const cards = new THREE.Group();
  cards.position.set(-0.5 * sx, 0.05 * sy, -0.15 * sz);
  cards.add(mesh(box(0.06 * sx, 0.3 * sy, 0.26 * sz, M.darkPlastic)));
  cards.add(mesh(box(0.16 * sx, 0.02 * sy, 0.14 * sz, M.card), -0.06 * sx, 0.08 * sy, 0.02 * sz, 0, 0, 0.2));   // CFexpress
  cards.add(mesh(box(0.11 * sx, 0.015 * sy, 0.1 * sz, M.card), -0.06 * sx, -0.08 * sy, -0.04 * sz, 0, 0, 0.2)); // SD
  return mkPart('card-slots', L['card-slots'], 'body', cards, new THREE.Vector3(-1, 0.1, 0), 0.55);
}

// ---------- 一体式竖拍手柄（仅 verticalGrip 机型） ----------
function pVerticalGrip(ctx) {
  const { w, d, sx, sy, sz, sr, hh, hd, L } = ctx;
  const vgH = 0.2 * sy; // 手柄节高度
  const vg = new THREE.Group();
  vg.position.set(0, -hh + vgH * 0.4, 0);
  vg.add(mesh(box(w + 0.02, vgH, d + 0.02, M.rubber)));                                                           // 手柄胶皮节
  vg.add(mesh(cyl(0.05 * sr, 0.05 * sr, 0.03, 24), M.metalDark, -0.38 * sx, -vgH * 0.55, 0.15 * sz));               // 竖拍快门键（底面）
  vg.add(mesh(cyl(0.055 * sr, 0.055 * sr, 0.04, 24), M.darkPlastic, -0.5 * sx, vgH * 0.1, hd + 0.02, Math.PI / 2)); // 竖拍拨轮（前面）
  return mkPart('vertical-grip', L['vertical-grip'], 'body', vg, new THREE.Vector3(0, -1, 0), 0.5);
}

// 模板分发表：局部 id → 模板构建函数
const TEMPLATE = {
  chassis: pChassis,
  grip: pGrip,
  'top-plate': pTopPlate,
  evf: pEvf,
  'hot-shoe': pHotShoe,
  'mode-dial': pModeDial,
  controls: pControls,
  mount: pMount,
  shutter: pShutter,
  'sensor-shield': pSensorShield,
  sensor: pSensor,
  ibis: pIbis,
  mainboard: pMainboard,
  lcd: pLcd,
  battery: pBattery,
  'card-slots': pCardSlots,
  'vertical-grip': pVerticalGrip,
};

/**
 * 参数化无反机身工厂（教学示意模型）。
 * 坐标约定与 bodyNikonZ6iii.js 一致：前面朝 +Z，握把在 -X，1 单位 = 10 cm。
 *
 * spec = {
 *   dims: [w, h, d],                   // 机身外形尺寸
 *   sensorFormat: 'fx' | 'dx',         // dx 时传感器按 APS-C 比例缩小（约 FX 的 2/3）
 *   shutter: 'mechanical' | 'shield',  // shield 用「传感器保护帘」薄板替代机械快门帘
 *   verticalGrip: bool,                // 一体式竖拍手柄（追加 1 个元件）
 *   labels: { 局部id: 显示名 },         // 可选，差异化文案
 *   overrides: { 局部id: (ctx) => part }, // 可选，精修钩子：用定制构建函数替代模板零件。
 *                                        // 必须返回 mkPart 结果并沿用契约 id；
 *                                        // 缺零件请走 spec 开关（shutter/verticalGrip），不要返回 null
 * }
 * 返回 { root, parts, mountAnchor: { position } }
 */
export function buildBody(spec) {
  const [w, h, d] = spec.dims;
  const sx = w / REF_W, sy = h / REF_H, sz = d / REF_D; // 逐轴缩放
  const hh = h / 2, hd = d / 2;
  const sr = Math.sqrt((sx + sy) / 2);                  // 卡口/传感器系缩放（随 dims 但缓和）
  const sk = spec.sensorFormat === 'dx' ? 2 / 3      // APS-C 传感器缩小系数
    : spec.sensorFormat === 'mf' ? 1.25 : 1;         // 中画幅传感器放大系数
  const L = { ...DEFAULT_LABELS, ...(spec.labels || {}) };
  const ctx = {
    w, h, d, sx, sy, sz, sr, sk, hh, hd, LENS_Y, L,
    sensorFormat: spec.sensorFormat, verticalGrip: !!spec.verticalGrip,
  };

  const ORDER = [
    'chassis', 'grip', 'top-plate', 'evf', 'hot-shoe', 'mode-dial', 'controls', 'mount',
    spec.shutter === 'shield' ? 'sensor-shield' : 'shutter',
    'sensor', 'ibis', 'mainboard', 'lcd', 'battery', 'card-slots',
    ...(spec.verticalGrip ? ['vertical-grip'] : []),
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
    mountAnchor: { position: new THREE.Vector3(0, LENS_Y, hd + 0.04) }, // 卡口端面中心
  };
}
