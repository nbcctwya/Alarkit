import { buildLens } from './lensFactory.js';

/**
 * Sony FE 35mm f/1.4 GM（教学示意模型，lensFactory 参数化生成）
 * 光轴沿 Z：卡口端 z=0，前玉朝 +Z，全长约 0.96。
 * G Master：光圈环可切换无级调节，XD 线性马达驱动对焦。
 */
const SPEC = {
  length: 0.96,
  radius: 0.36,
  kind: 'prime',
  aperture: { rOuter: 0.26, rHole: 0.155, blades: 11 }, // f/1.4：11 片圆形光圈
  labels: {
    mount: 'E 卡口与电子触点',
    'control-ring': '光圈环（可切换无级）',
    'af-motor': 'XD 线性对焦马达',
  },
};

export const gear = {
  id: 'sony-fe-35-f14gm',
  type: 'lens',
  brand: 'Sony',
  name: 'Sony FE 35mm f/1.4 GM',
  mount: 'sony-e',
  view: { pos: [1.4, 0.6, 2.3], target: [0, 0, 0.5] },
  create: () => buildLens(SPEC),
};
