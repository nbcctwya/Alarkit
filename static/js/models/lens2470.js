import { buildLens } from './lensFactory.js';

/**
 * Nikkor Z 24-70mm f/2.8 S（教学示意模型，lensFactory 参数化生成）
 * 光轴沿 Z：卡口端 z=0，前玉朝 +Z，全长约 1.26。
 */
const SPEC = {
  length: 1.26,
  radius: 0.42,
  kind: 'zoom',
  aperture: { rOuter: 0.3, rHole: 0.19, blades: 9 }, // f/2.8：孔径明显大于 f/4 的 24-120
  extras: { infoPanel: true },
};

export const gear = {
  id: 'nikkor-z-24-70-f28s',
  type: 'lens',
  brand: 'Nikon',
  name: 'NIKKOR Z 24-70mm f/2.8 S',
  mount: 'nikon-z',
  view: { pos: [1.6, 0.75, 2.8], target: [0, 0, 0.65] },
  create: () => buildLens(SPEC),
};
