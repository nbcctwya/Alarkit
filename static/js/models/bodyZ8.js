import { buildBody } from './bodyFactory.js';

/**
 * Nikon Z8 —— 小 Z9 高像素速度机。
 * 差异化：4571 万堆栈式 FX 传感器 + EXPEED 7；无机械快门，
 * 以传感器保护帘替代；机身明显大于 Z6 III，但无一体式竖拍手柄。
 */
const SPEC = {
  dims: [1.44, 1.19, 0.83],
  sensorFormat: 'fx',
  shutter: 'shield',
  verticalGrip: false,
  labels: {
    sensor: 'CMOS 传感器（堆栈式 4571 万像素）',
    mainboard: '主板（EXPEED 7 处理器）',
    battery: '电池 EN-EL15c',
    'card-slots': '存储卡槽（CFexpress B + SD UHS-II）',
  },
};

export const gear = {
  id: 'nikon-z8',
  type: 'camera',
  brand: 'Nikon',
  name: 'Nikon Z8',
  mount: 'nikon-z',
  view: { pos: [1.84, 0.97, 2.48], target: [0, 0, 0.1] },        // 仅机身（随机身加大）
  comboView: { pos: [2.59, 1.19, 3.67], target: [0, -0.02, 0.5] }, // 装镜头后
  create: () => buildBody(SPEC),
};
