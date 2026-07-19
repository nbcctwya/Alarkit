import { buildLens } from './lensFactory.js';

/**
 * Hasselblad XCD 55mm f/2.5 V（教学示意模型，lensFactory 参数化生成）
 * 光轴沿 Z：卡口端 z=0，前玉朝 +Z，全长约 0.69。
 * X 系统中画幅定焦，镜间叶片快门之外仍保留光圈结构示意。
 */
const SPEC = {
  length: 0.69,
  radius: 0.35,
  kind: 'prime',
  aperture: { rOuter: 0.24, rHole: 0.12, blades: 9 }, // f/2.5：9 片光圈
  labels: {
    mount: 'XCD 卡口与电子触点',
  },
};

export const gear = {
  id: 'hasselblad-xcd-55-f25v',
  type: 'lens',
  brand: 'Hasselblad',
  name: 'Hasselblad XCD 55mm f/2.5 V',
  mount: 'hasselblad-xcd',
  view: { pos: [1.15, 0.5, 1.9], target: [0, 0, 0.35] },
  create: () => buildLens(SPEC),
};
