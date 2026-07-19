import { buildLens } from './lensFactory.js';

/**
 * Nikkor Z 14-24mm f/2.8 S（教学示意模型，lensFactory 参数化生成）
 * 光轴沿 Z：卡口端 z=0，前玉朝 +Z，全长约 1.25。
 * frontBulb：前玉用接近镜筒口径的大半径玻璃片，表现大曲率“灯泡”效果。
 */
const SPEC = {
  length: 1.25,
  radius: 0.42,
  kind: 'zoom',
  aperture: { rOuter: 0.3, rHole: 0.19, blades: 9 }, // f/2.8：孔径明显大于 f/4 的 24-120
  frontBulb: true,
  extras: { lensHood: true },
};

export const gear = {
  id: 'nikkor-z-14-24-f28s',
  type: 'lens',
  brand: 'Nikon',
  name: 'NIKKOR Z 14-24mm f/2.8 S',
  mount: 'nikon-z',
  view: { pos: [1.6, 0.75, 2.8], target: [0, 0, 0.65] },
  create: () => buildLens(SPEC),
};
