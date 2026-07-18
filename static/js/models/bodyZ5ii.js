import { buildBody } from './bodyFactory.js';

/**
 * Nikon Z5 II —— 入门全画幅。
 * 差异化：2450 万背照式 FX 传感器 + EXPEED 7；双 SD 卡槽（无 CFexpress）；
 * 机身与 Z7 II 相近、略厚，机械快门，无竖拍手柄。
 */
const SPEC = {
  dims: [1.34, 1.01, 0.72],
  sensorFormat: 'fx',
  shutter: 'mechanical',
  verticalGrip: false,
  labels: {
    sensor: 'CMOS 传感器（背照式 2450 万像素）',
    mainboard: '主板（EXPEED 7 处理器）',
    battery: '电池 EN-EL15c',
    'card-slots': '存储卡槽（双 SD UHS-II）',
  },
};

export const gear = {
  id: 'nikon-z5-ii',
  type: 'camera',
  brand: 'Nikon',
  name: 'Nikon Z5 II',
  mount: 'nikon-z',
  view: { pos: [1.65, 0.87, 2.23], target: [0, 0, 0.1] },       // 仅机身（较 Z6 III 略近）
  comboView: { pos: [2.33, 1.07, 3.3], target: [0, -0.02, 0.5] }, // 装镜头后
  create: () => buildBody(SPEC),
};
