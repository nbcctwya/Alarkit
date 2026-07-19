import { buildLens } from './lensFactory.js';

/**
 * Fujifilm XF 35mm f/1.4 R（教学示意模型，lensFactory 参数化生成）
 * 光轴沿 Z：卡口端 z=0，前玉朝 +Z，全长约 0.55。
 * XF 经典定焦：镜筒上的 "R" 即光圈环。
 */
const SPEC = {
  length: 0.55,
  radius: 0.3,
  kind: 'prime',
  aperture: { rOuter: 0.2, rHole: 0.12, blades: 7 }, // f/1.4：7 片光圈
  labels: {
    mount: 'X 卡口与电子触点',
    'control-ring': '光圈环',
  },
};

export const gear = {
  id: 'fujifilm-xf-35-f14',
  type: 'lens',
  brand: 'Fujifilm',
  name: 'Fujifilm XF 35mm f/1.4 R',
  mount: 'fujifilm-x',
  view: { pos: [1.0, 0.45, 1.7], target: [0, 0, 0.3] },
  create: () => buildLens(SPEC),
};
