import * as THREE from 'three';
import { M, mesh, box, cyl, mkPart } from './materials.js';
import { buildBody } from './bodyFactory.js';

/**
 * Nikon Z9 —— 旗舰速度机。
 * 差异化：4571 万堆栈式 FX 传感器 + EXPEED 7；无机械快门（传感器保护帘）；
 * 一体式竖拍手柄（追加 1 个元件，含竖拍快门键/拨轮示意），
 * 大容量 EN-EL18d 电池、双 CFexpress B 卡槽，机身最大。
 */

// 精修：Z9 标志性圆形橡胶目镜罩（替代模板的方盒 EVF）
function roundEyecupEvf(ctx) {
  const { sx, sy, sz, sr, L } = ctx;
  const evf = new THREE.Group();
  evf.position.set(0, 0.63 * sy, -0.3 * sz);
  // 取景器主体
  evf.add(mesh(box(0.3 * sx, 0.2 * sy, 0.14 * sz, M.darkPlastic), 0, 0, 0.06 * sz));
  // 圆筒目镜
  evf.add(mesh(cyl(0.08 * sr, 0.08 * sr, 0.1 * sz, 32), M.darkPlastic, 0, 0.02 * sy, -0.06 * sz, Math.PI / 2));
  // 圆形橡胶目镜罩（Z9 标志件）
  evf.add(mesh(new THREE.TorusGeometry(0.085 * sr, 0.018 * sr, 16, 48), M.rubber, 0, 0.02 * sy, -0.11 * sz));
  // 目镜玻璃
  evf.add(mesh(cyl(0.065 * sr, 0.065 * sr, 0.02, 32), M.glassFront, 0, 0.02 * sy, -0.115 * sz, Math.PI / 2));
  return mkPart('evf', L.evf, 'body', evf, new THREE.Vector3(0, 0.55, -0.85), 0.95);
}

const SPEC = {
  dims: [1.49, 1.50, 0.91],
  sensorFormat: 'fx',
  shutter: 'shield',
  verticalGrip: true,
  labels: {
    sensor: 'CMOS 传感器（堆栈式 4571 万像素）',
    mainboard: '主板（EXPEED 7 处理器）',
    battery: '电池 EN-EL18d',
    'card-slots': '存储卡槽（双 CFexpress B）',
  },
  overrides: {
    evf: roundEyecupEvf,
  },
};

export const gear = {
  id: 'nikon-z9',
  type: 'camera',
  brand: 'Nikon',
  name: 'Nikon Z9',
  mount: 'nikon-z',
  view: { pos: [1.96, 1.04, 2.65], target: [0, 0, 0.1] },        // 仅机身（较 Z6 III 约 +15%）
  comboView: { pos: [2.76, 1.27, 3.91], target: [0, -0.02, 0.5] }, // 装镜头后
  create: () => buildBody(SPEC),
};
