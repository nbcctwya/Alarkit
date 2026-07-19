import { buildLens } from './lensFactory.js';

/**
 * Lumix S 24-105mm f/4 Macro OIS（教学示意模型，lensFactory 参数化生成）
 * 光轴沿 Z：卡口端 z=0，前玉朝 +Z，全长约 1.18。
 * L 卡口标准变焦：带 OIS 光学防抖单元，兼 0.5x 微距。
 */
const SPEC = {
  length: 1.18,
  radius: 0.4,
  kind: 'zoom',
  aperture: { rOuter: 0.28, rHole: 0.13, blades: 9 }, // f/4：孔径小于 f/2.8 大三元
  extras: { vrUnit: true }, // OIS 光学防抖单元
  labels: {
    mount: 'L 卡口与电子触点',
    'vr-unit': 'OIS 光学防抖单元',
  },
};

export const gear = {
  id: 'lumix-s-24-105-f4',
  type: 'lens',
  brand: 'Lumix',
  name: 'Lumix S 24-105mm f/4 Macro OIS',
  mount: 'lumix-l',
  view: { pos: [1.5, 0.7, 2.6], target: [0, 0, 0.6] },
  create: () => buildLens(SPEC),
};
