import { buildBody } from './bodyFactory.js';

/**
 * Nikon Z9 —— 旗舰速度机。
 * 差异化：4571 万堆栈式 FX 传感器 + EXPEED 7；无机械快门（传感器保护帘）；
 * 一体式竖拍手柄（追加 1 个元件，含竖拍快门键/拨轮示意），
 * 大容量 EN-EL18d 电池、双 CFexpress B 卡槽，机身最大。
 */
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
