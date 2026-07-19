import { buildBody } from './bodyFactory.js';

/**
 * Canon EOS R5 —— 高像素全能全画幅。
 * 差异化：4500 万全画幅传感器 + DIGIC X 处理器；CFexpress B + SD 双卡槽；
 * 机械快门，无竖拍手柄；外观同质，走工厂模板。
 */
const SPEC = {
  dims: [1.38, 0.98, 0.88],
  sensorFormat: 'fx',
  shutter: 'mechanical',
  verticalGrip: false,
  labels: {
    sensor: 'CMOS 传感器（4500 万像素全画幅）',
    mainboard: '主板（DIGIC X 处理器）',
    battery: '电池 LP-E6NH',
    mount: 'RF 卡口与电子触点',
    'card-slots': '存储卡槽（CFexpress B + SD）',
  },
};

export const gear = {
  id: 'canon-eos-r5',
  type: 'camera',
  brand: 'Canon',
  name: 'Canon EOS R5',
  mount: 'canon-rf',
  view: { pos: [1.69, 0.89, 2.28], target: [0, 0, 0.1] },          // 仅机身（与 Z6 III 基本一致）
  comboView: { pos: [2.38, 1.09, 3.38], target: [0, -0.02, 0.5] }, // 装镜头后
  create: () => buildBody(SPEC),
};
