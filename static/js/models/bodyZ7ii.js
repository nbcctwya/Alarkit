import { buildBody } from './bodyFactory.js';

/**
 * Nikon Z7 II —— 高像素画质机。
 * 差异化：4575 万背照式 FX 传感器 + 双 EXPEED 6 处理器；
 * 机身较 Z6 III 略小薄，机械快门，无竖拍手柄。
 */
const SPEC = {
  dims: [1.34, 1.01, 0.70],
  sensorFormat: 'fx',
  shutter: 'mechanical',
  verticalGrip: false,
  labels: {
    sensor: 'CMOS 传感器（背照式 4575 万像素）',
    mainboard: '主板（双 EXPEED 6 处理器）',
    battery: '电池 EN-EL15c',
    'card-slots': '存储卡槽（CFexpress B + SD UHS-II）',
  },
};

export const gear = {
  id: 'nikon-z7-ii',
  type: 'camera',
  brand: 'Nikon',
  name: 'Nikon Z7 II',
  mount: 'nikon-z',
  view: { pos: [1.65, 0.87, 2.23], target: [0, 0, 0.1] },       // 仅机身（较 Z6 III 略近）
  comboView: { pos: [2.33, 1.07, 3.3], target: [0, -0.02, 0.5] }, // 装镜头后
  create: () => buildBody(SPEC),
};
