import { buildLens } from './lensFactory.js';

/**
 * Nikkor Z DX 18-140mm f/3.5-6.3 VR（教学示意模型，lensFactory 参数化生成）
 * 光轴沿 Z：卡口端 z=0，前玉朝 +Z，全长约 0.90。
 */
const SPEC = {
  length: 0.9,
  radius: 0.34,
  kind: 'zoom',
  aperture: { rOuter: 0.24, rHole: 0.1, blades: 9 }, // f/3.5-6.3：孔径较小
  extras: { vrUnit: true },
};

export const gear = {
  id: 'nikkor-z-dx-18-140',
  type: 'lens',
  brand: 'Nikon',
  name: 'NIKKOR Z DX 18-140mm f/3.5-6.3 VR',
  mount: 'nikon-z',
  view: { pos: [1.3, 0.55, 2.1], target: [0, 0, 0.45] },
  create: () => buildLens(SPEC),
};
