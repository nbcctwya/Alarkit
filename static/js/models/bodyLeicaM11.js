import { buildBody } from './bodyFactory.js';
import { flatTopPlate, flatHotShoe, leicaWindowEvf, redDotChassis } from './refinedParts.js';

/**
 * Leica M11 —— 旁轴联动测距。
 * 差异化：6030 万 BSI 全画幅传感器 + Maestro III 处理器；平顶无军舰部，
 * 正面取景窗 + 背部角落目镜（联动测距），正面红色圆标；机身扁薄；
 * 机械快门，无竖拍手柄。
 * 精修件：平顶盖 + 贴顶热靴 + 旁轴取景窗 + 红点骨架。
 */
const SPEC = {
  dims: [1.39, 0.80, 0.39],
  sensorFormat: 'fx',
  shutter: 'mechanical',
  verticalGrip: false,
  labels: {
    sensor: 'CMOS 传感器（6030 万像素 BSI）',
    mainboard: '主板（Maestro III 处理器）',
    battery: '电池 BP-SCL7',
    mount: 'M 卡口',
    evf: '取景窗（联动测距）',
    'mode-dial': '快门速度拨盘',
  },
  overrides: {
    'top-plate': flatTopPlate,
    'hot-shoe': flatHotShoe,
    evf: leicaWindowEvf,
    chassis: redDotChassis,
  },
};

export const gear = {
  id: 'leica-m11',
  type: 'camera',
  brand: 'Leica',
  name: 'Leica M11',
  mount: 'leica-m',
  view: { pos: [1.7, 0.72, 2.3], target: [0, 0, 0.1] },          // 仅机身（机身矮，视角略低）
  comboView: { pos: [2.4, 0.92, 3.4], target: [0, -0.02, 0.5] }, // 装镜头后
  create: () => buildBody(SPEC),
};
