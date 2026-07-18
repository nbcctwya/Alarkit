import { buildBody } from './bodyFactory.js';

/**
 * Nikon Z50 II —— APS-C 轻便机。
 * 差异化：DX 格式 2090 万传感器（工厂按 FX 的 2/3 缩小，IBIS 框架/快门帘同步收窄）；
 * EXPEED 7，单 SD 卡槽，机械快门，无竖拍手柄，机身最小。
 */
const SPEC = {
  dims: [1.27, 0.97, 0.67],
  sensorFormat: 'dx',
  shutter: 'mechanical',
  verticalGrip: false,
  labels: {
    sensor: 'CMOS 传感器（APS-C 2090 万像素）',
    mainboard: '主板（EXPEED 7 处理器）',
    battery: '电池 EN-EL25a',
    'card-slots': '存储卡槽（SD UHS-II）',
  },
};

export const gear = {
  id: 'nikon-z50-ii',
  type: 'camera',
  brand: 'Nikon',
  name: 'Nikon Z50 II',
  mount: 'nikon-z',
  view: { pos: [1.53, 0.81, 2.07], target: [0, 0, 0.1] },        // 仅机身（较 Z6 III 约 -10%）
  comboView: { pos: [2.16, 0.99, 3.06], target: [0, -0.02, 0.5] }, // 装镜头后
  create: () => buildBody(SPEC),
};
