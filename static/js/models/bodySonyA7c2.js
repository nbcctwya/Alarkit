import { buildBody } from './bodyFactory.js';
import { flatTopPlate, flatHotShoe, cornerEvf, chassisNoTopLcd } from './refinedParts.js';

/**
 * Sony A7C II —— 紧凑全画幅。
 * 差异化：3300 万背照式 FX 传感器 + BIONZ XR 与 AI 芯片；无军舰部平顶，
 * 紧凑取景器置于左上角，无肩屏，机身最小；机械快门，无竖拍手柄。
 * 精修件：平顶盖 + 贴顶热靴 + 角落 EVF + 无肩屏骨架。
 */
const SPEC = {
  dims: [1.24, 0.71, 0.63],
  sensorFormat: 'fx',
  shutter: 'mechanical',
  verticalGrip: false,
  labels: {
    sensor: 'CMOS 传感器（背照式 3300 万像素）',
    mainboard: '主板（BIONZ XR + AI 芯片）',
    battery: '电池 NP-FZ100',
    mount: 'E 卡口与电子触点',
  },
  overrides: {
    'top-plate': flatTopPlate,
    'hot-shoe': flatHotShoe,
    evf: cornerEvf,
    chassis: chassisNoTopLcd,
  },
};

export const gear = {
  id: 'sony-a7c2',
  type: 'camera',
  brand: 'Sony',
  name: 'Sony A7C II',
  mount: 'sony-e',
  view: { pos: [1.5, 0.79, 2.02], target: [0, 0, 0.1] },          // 仅机身（较 Z6 III 约 -12%）
  comboView: { pos: [2.11, 0.97, 2.99], target: [0, -0.02, 0.5] }, // 装镜头后
  create: () => buildBody(SPEC),
};
