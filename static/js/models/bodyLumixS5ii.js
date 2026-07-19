import { buildBody } from './bodyFactory.js';

/**
 * Lumix S5 II —— 视频向全画幅。
 * 差异化：2420 万全画幅传感器 + Venus Engine；L 卡口；
 * 机械快门，无竖拍手柄；外观同质，走工厂模板。
 */
const SPEC = {
  dims: [1.34, 1.02, 0.90],
  sensorFormat: 'fx',
  shutter: 'mechanical',
  verticalGrip: false,
  labels: {
    sensor: 'CMOS 传感器（2420 万像素全画幅）',
    mainboard: '主板（Venus Engine）',
    battery: '电池 DMW-BLK22',
    mount: 'L 卡口与电子触点',
  },
};

export const gear = {
  id: 'lumix-s5-ii',
  type: 'camera',
  brand: 'Lumix',
  name: 'Lumix S5 II',
  mount: 'lumix-l',
  view: { pos: [1.64, 0.87, 2.22], target: [0, 0, 0.1] },         // 仅机身（较 Z6 III 约 -4%）
  comboView: { pos: [2.31, 1.06, 3.28], target: [0, -0.02, 0.5] }, // 装镜头后
  create: () => buildBody(SPEC),
};
