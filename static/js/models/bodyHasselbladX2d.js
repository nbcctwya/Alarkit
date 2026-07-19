import { buildBody } from './bodyFactory.js';
import { orangeShutterControls } from './refinedParts.js';

/**
 * Hasselblad X2D 100C —— 便携中画幅。
 * 差异化：44×33 中画幅 1 亿像素传感器（传感器系尺寸放大 1.25）；机身最宽大；
 * 标志性橙色快门键；机械快门，无竖拍手柄。
 * 精修件：橙色快门操控组件。
 */
const SPEC = {
  dims: [1.49, 1.06, 0.75],
  sensorFormat: 'mf',
  shutter: 'mechanical',
  verticalGrip: false,
  labels: {
    sensor: 'CMOS 传感器（44×33 中画幅 1 亿像素）',
    mount: 'XCD 卡口与电子触点',
  },
  overrides: {
    controls: orangeShutterControls,
  },
};

export const gear = {
  id: 'hasselblad-x2d',
  type: 'camera',
  brand: 'Hasselblad',
  name: 'Hasselblad X2D 100C',
  mount: 'hasselblad-xcd',
  view: { pos: [1.84, 0.97, 2.48], target: [0, 0, 0.1] },          // 仅机身（较 Z6 III 约 +8%）
  comboView: { pos: [2.59, 1.19, 3.67], target: [0, -0.02, 0.5] }, // 装镜头后
  create: () => buildBody(SPEC),
};
