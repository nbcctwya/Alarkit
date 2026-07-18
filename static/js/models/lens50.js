import { buildLens } from './lensFactory.js';

/**
 * Nikkor Z 50mm f/1.8 S（教学示意模型，lensFactory 参数化生成）
 * 光轴沿 Z：卡口端 z=0，前玉朝 +Z，全长约 0.87。
 */
const SPEC = {
  length: 0.87,
  radius: 0.36,
  kind: 'prime',
  aperture: { rOuter: 0.25, rHole: 0.155, blades: 9 }, // f/1.8：按 85 f/1.8 的 (0.26, 0.16, 9) 随口径缩放
};

export const gear = {
  id: 'nikkor-z-50-f18s',
  type: 'lens',
  brand: 'Nikon',
  name: 'NIKKOR Z 50mm f/1.8 S',
  mount: 'nikon-z',
  view: { pos: [1.25, 0.55, 2.05], target: [0, 0, 0.45] },
  create: () => buildLens(SPEC),
};
