import { buildLens } from './lensFactory.js';
import { barrelWithRedRing } from './refinedLensParts.js';

/**
 * Canon RF 50mm f/1.2L USM（教学示意模型，lensFactory 参数化生成）
 * 光轴沿 Z：卡口端 z=0，前玉朝 +Z，全长约 1.08。
 * 精修件：L 红圈镜筒（佳能 L 专业镜头标志）。
 */
const SPEC = {
  length: 1.08,
  radius: 0.42,
  kind: 'prime',
  aperture: { rOuter: 0.3, rHole: 0.2, blades: 10 }, // f/1.2：超大孔径，10 片光圈
  overrides: { barrel: barrelWithRedRing },
  labels: {
    mount: 'RF 卡口与电子触点',
    'af-motor': 'USM 超声波马达',
  },
};

export const gear = {
  id: 'canon-rf-50-f12l',
  type: 'lens',
  brand: 'Canon',
  name: 'Canon RF 50mm f/1.2L USM',
  mount: 'canon-rf',
  view: { pos: [1.45, 0.65, 2.45], target: [0, 0, 0.55] },
  create: () => buildLens(SPEC),
};
