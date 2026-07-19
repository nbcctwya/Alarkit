import { buildBody } from './bodyFactory.js';
import { tripleDials, chassisNoTopLcd } from './refinedParts.js';

/**
 * Fujifilm X-T5 —— 复古操控 APS-C。
 * 差异化：X-Trans 5 HR 4020 万像素 APS-C 传感器 + X-Processor 5；
 * 机顶 ISO / 快门 / 曝光补偿三拨盘，无肩屏；机械快门，无竖拍手柄。
 * 精修件：三拨盘 + 无肩屏骨架。
 */
const SPEC = {
  dims: [1.30, 0.91, 0.64],
  sensorFormat: 'dx',
  shutter: 'mechanical',
  verticalGrip: false,
  labels: {
    sensor: 'CMOS 传感器（X-Trans 5 HR 4020 万像素）',
    mainboard: '主板（X-Processor 5）',
    battery: '电池 NP-W235',
    mount: 'X 卡口与电子触点',
    'mode-dial': 'ISO / 快门 / 曝光补偿拨盘',
  },
  overrides: {
    'mode-dial': tripleDials,
    chassis: chassisNoTopLcd,
  },
};

export const gear = {
  id: 'fujifilm-x-t5',
  type: 'camera',
  brand: 'Fujifilm',
  name: 'Fujifilm X-T5',
  mount: 'fujifilm-x',
  view: { pos: [1.6, 0.84, 2.15], target: [0, 0, 0.1] },           // 仅机身（较 Z6 III 约 -6%）
  comboView: { pos: [2.24, 1.03, 3.18], target: [0, -0.02, 0.5] }, // 装镜头后
  create: () => buildBody(SPEC),
};
