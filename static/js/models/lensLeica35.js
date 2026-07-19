import { buildLens } from './lensFactory.js';

/**
 * Leica Summilux-M 35mm f/1.4 ASPH（教学示意模型，lensFactory 参数化生成）
 * 光轴沿 Z：卡口端 z=0，前玉朝 +Z，全长约 0.46。
 * M 系统手动对焦：无 AF 马达，对焦环与机身联动测距。
 */
const SPEC = {
  length: 0.46,
  radius: 0.26,
  kind: 'prime',
  aperture: { rOuter: 0.18, rHole: 0.1, blades: 11 }, // f/1.4：11 片光圈
  manualFocus: true, // 手动对焦镜头，去掉 af-motor
  labels: {
    mount: 'M 卡口',
    'control-ring': '光圈环',
    'focus-ring': '对焦环（联动测距）',
  },
};

export const gear = {
  id: 'leica-summilux-m-35-f14',
  type: 'lens',
  brand: 'Leica',
  name: 'Leica Summilux-M 35mm f/1.4 ASPH',
  mount: 'leica-m',
  view: { pos: [0.9, 0.4, 1.5], target: [0, 0, 0.25] },
  create: () => buildLens(SPEC),
};
