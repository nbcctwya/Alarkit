import { buildLens } from './lensFactory.js';

/**
 * Nikkor Z 70-200mm f/2.8 VR S（教学示意模型，lensFactory 参数化生成）
 * 光轴沿 Z：卡口端 z=0，前玉朝 +Z，全长约 2.20。
 */
const SPEC = {
  length: 2.2,
  radius: 0.42,
  kind: 'zoom',
  aperture: { rOuter: 0.3, rHole: 0.19, blades: 9 }, // f/2.8：孔径明显大于 f/4 的 24-120
  extras: { infoPanel: true, tripodCollar: true, vrUnit: true },
};

export const gear = {
  id: 'nikkor-z-70-200-f28s',
  type: 'lens',
  brand: 'Nikon',
  name: 'NIKKOR Z 70-200mm f/2.8 VR S',
  mount: 'nikon-z',
  view: { pos: [2.2, 1.0, 3.8], target: [0, 0, 1.0] },
  create: () => buildLens(SPEC),
};
