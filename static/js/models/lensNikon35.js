import { buildLens } from './lensFactory.js';

/**
 * Nikkor Z 35mm f/1.8 S（教学示意模型，lensFactory 参数化生成）
 * 光轴沿 Z：卡口端 z=0，前玉朝 +Z，全长约 0.86。
 */
const SPEC = {
  length: 0.86,
  radius: 0.34,
  kind: 'prime',
  aperture: { rOuter: 0.24, rHole: 0.15, blades: 9 }, // f/1.8：按 85 f/1.8 的 (0.26, 0.16, 9) 随口径缩放
};

export const gear = {
  id: 'nikkor-z-35-f18s',
  type: 'lens',
  brand: 'Nikon',
  name: 'NIKKOR Z 35mm f/1.8 S',
  mount: 'nikon-z',
  view: { pos: [1.2, 0.5, 2.0], target: [0, 0, 0.45] },
  create: () => buildLens(SPEC),
};
