import * as THREE from 'three';
import { M, mesh, box, cyl, mkPart } from './materials.js';

// 机身关键位置常量（卡口安装锚点用）
const MOUNT_Z = 0.41;   // 卡口前端面
const LENS_Y = -0.02;   // 光轴高度

/**
 * Nikon Z6 III 机身（教学示意模型）
 * 尺寸约 1.39 × 1.02 × 0.74（1 单位 = 10 cm），前面朝 +Z，握把在 -X。
 * 元件使用局部 id，全局命名空间由 registry 统一添加。
 */
function build() {
  const root = new THREE.Group();
  const parts = [];
  const add = (p) => { root.add(p.node); parts.push(p); };

  // ---------- 机身骨架（基准，不拆解） ----------
  const chassis = new THREE.Group();
  chassis.add(mesh(box(1.39, 1.02, 0.74, M.shell)));
  // 正面饰皮
  chassis.add(mesh(box(0.6, 0.9, 0.02, M.rubber), 0.3, -0.02, 0.375));
  // 肩部小肩屏
  chassis.add(mesh(box(0.22, 0.02, 0.14, M.screen), -0.45, 0.52, 0.05));
  add(mkPart('chassis', '机身骨架（镁合金）', 'body', chassis, new THREE.Vector3(0, 0, 0), 0));

  // ---------- 握把 ----------
  const grip = new THREE.Group();
  grip.position.set(-0.74, -0.04, 0.2);
  grip.add(mesh(box(0.3, 0.92, 0.46, M.rubber)));
  grip.add(mesh(cyl(0.15, 0.15, 0.9, 24), M.rubber, -0.1, 0, 0.12, 0, 0, 0)); // 前缘圆弧
  add(mkPart('grip', '握把（饰皮）', 'body', grip, new THREE.Vector3(-1, 0, 0.12), 0.45));

  // ---------- 顶盖 + 军舰部 ----------
  const top = new THREE.Group();
  top.position.set(0, 0.55, 0);
  top.add(mesh(box(1.39, 0.08, 0.74, M.shell), 0, 0, 0));
  const humpShape = new THREE.Shape();
  humpShape.moveTo(-0.26, 0); humpShape.lineTo(0.26, 0);
  humpShape.lineTo(0.15, 0.14); humpShape.lineTo(0, 0.21); humpShape.lineTo(-0.15, 0.14);
  humpShape.closePath();
  const humpGeo = new THREE.ExtrudeGeometry(humpShape, { depth: 0.46, bevelEnabled: false });
  humpGeo.rotateY(Math.PI / 2);
  humpGeo.translate(-0.23, 0, 0);
  top.add(mesh(humpGeo, M.shell, 0, 0.04, -0.05));
  add(mkPart('top-plate', '顶盖与军舰部', 'body', top, new THREE.Vector3(0, 1, 0), 0.6));

  // ---------- EVF 电子取景器 ----------
  const evf = new THREE.Group();
  evf.position.set(0, 0.63, -0.3);
  evf.add(mesh(box(0.3, 0.2, 0.16, M.darkPlastic), 0, 0, 0.05));
  evf.add(mesh(cyl(0.075, 0.075, 0.1, 32), M.darkPlastic, 0, 0.02, -0.08, Math.PI / 2));
  evf.add(mesh(cyl(0.06, 0.06, 0.02, 32), M.glassFront, 0, 0.02, -0.12, Math.PI / 2));
  add(mkPart('evf', 'EVF 电子取景器', 'body', evf, new THREE.Vector3(0, 0.55, -0.85), 0.95));

  // ---------- 热靴 ----------
  const shoe = new THREE.Group();
  shoe.position.set(0, 0.82, -0.05);
  shoe.add(mesh(box(0.2, 0.025, 0.18, M.metalDark)));
  shoe.add(mesh(box(0.16, 0.015, 0.14, M.darkPlastic), 0, 0.02, 0));
  add(mkPart('hot-shoe', '热靴接口', 'body', shoe, new THREE.Vector3(0, 1, 0), 1.25));

  // ---------- 模式拨盘 ----------
  const modeDial = new THREE.Group();
  modeDial.position.set(0.45, 0.63, -0.05);
  modeDial.add(mesh(cyl(0.1, 0.1, 0.06, 32), M.darkPlastic));
  modeDial.add(mesh(cyl(0.045, 0.045, 0.025, 24), M.metalDark, 0, 0.04, 0));
  add(mkPart('mode-dial', '曝光模式拨盘', 'body', modeDial, new THREE.Vector3(0.2, 1, 0), 0.95));

  // ---------- 操控组件（快门键 + 前/后拨盘） ----------
  const ctrl = new THREE.Group();
  ctrl.add(mesh(cyl(0.05, 0.05, 0.04, 24), M.metalDark, -0.53, 0.62, 0.2));           // 快门键
  ctrl.add(mesh(cyl(0.055, 0.055, 0.05, 24), M.darkPlastic, -0.72, 0.3, 0.46, Math.PI / 2)); // 前拨盘
  ctrl.add(mesh(cyl(0.06, 0.06, 0.04, 24), M.darkPlastic, -0.45, 0.5, -0.38, Math.PI / 2));  // 后拨盘
  ctrl.add(mesh(box(0.16, 0.03, 0.1, M.darkPlastic), -0.68, 0.6, 0.32));               // 开关键座
  add(mkPart('controls', '快门键与前后拨盘', 'body', ctrl, new THREE.Vector3(-0.25, 1, 0.1), 1.1));

  // ---------- Z 卡口 ----------
  const mount = new THREE.Group();
  mount.position.set(0, LENS_Y, 0.38);
  mount.add(mesh(new THREE.TorusGeometry(0.31, 0.035, 16, 64), M.metal));
  mount.add(mesh(cyl(0.29, 0.29, 0.03, 64), M.darkPlastic, 0, 0, -0.02, Math.PI / 2));
  // 卡口电子触点
  for (let i = 0; i < 11; i++) {
    mount.add(mesh(box(0.018, 0.008, 0.01, M.gold), -0.09 + i * 0.018, -0.26, 0.03));
  }
  add(mkPart('mount', 'Z 卡口与电子触点', 'body', mount, new THREE.Vector3(0, 0, 1), 0.6));

  // ---------- 快门帘幕 ----------
  const shutter = new THREE.Group();
  shutter.position.set(0, LENS_Y, 0.3);
  shutter.add(mesh(box(0.42, 0.15, 0.012, M.metalDark), 0, 0.075, 0));
  shutter.add(mesh(box(0.42, 0.15, 0.012, M.metalDark), 0, -0.085, 0.004));
  add(mkPart('shutter', '快门帘幕', 'body', shutter, new THREE.Vector3(0, 0, -1), 0.75));

  // ---------- CMOS 传感器 ----------
  const sensor = new THREE.Group();
  sensor.position.set(0, LENS_Y, 0.25);
  sensor.add(mesh(box(0.36, 0.24, 0.018, M.sensor)));
  sensor.add(mesh(box(0.44, 0.32, 0.01, M.chip), 0, 0, -0.015));
  add(mkPart('sensor', 'CMOS 传感器（部分堆栈式）', 'body', sensor, new THREE.Vector3(0, 0, -1), 1.15));

  // ---------- IBIS 机身防抖机构 ----------
  const ibis = new THREE.Group();
  ibis.position.set(0, LENS_Y, 0.25);
  const fw = 0.56, fh = 0.44, ft = 0.05;
  ibis.add(mesh(box(fw, ft, 0.04, M.metalDark), 0, fh / 2, 0));
  ibis.add(mesh(box(fw, ft, 0.04, M.metalDark), 0, -fh / 2, 0));
  ibis.add(mesh(box(ft, fh, 0.04, M.metalDark), fw / 2, 0, 0));
  ibis.add(mesh(box(ft, fh, 0.04, M.metalDark), -fw / 2, 0, 0));
  // 四角驱动线圈
  [[fw / 2, fh / 2], [-fw / 2, fh / 2], [fw / 2, -fh / 2], [-fw / 2, -fh / 2]].forEach(([x, y]) => {
    ibis.add(mesh(cyl(0.035, 0.035, 0.06, 16), M.gold, x, y, 0, Math.PI / 2));
  });
  add(mkPart('ibis', 'IBIS 机身防抖机构', 'body', ibis, new THREE.Vector3(0, 0, -1), 0.95));

  // ---------- 主板（EXPEED 7） ----------
  const board = new THREE.Group();
  board.position.set(0, LENS_Y, -0.1);
  board.add(mesh(box(0.7, 0.55, 0.03, M.pcb)));
  board.add(mesh(box(0.18, 0.18, 0.02, M.chip), -0.15, 0.1, 0.025));
  board.add(mesh(box(0.12, 0.12, 0.02, M.chip), 0.18, -0.08, 0.025));
  board.add(mesh(box(0.08, 0.2, 0.015, M.chip), 0.05, 0.15, 0.022));
  add(mkPart('mainboard', '主板（EXPEED 7 处理器）', 'body', board, new THREE.Vector3(0, 0, -1), 1.45));

  // ---------- LCD 翻转屏 ----------
  const lcd = new THREE.Group();
  lcd.position.set(0, LENS_Y, -0.39);
  lcd.add(mesh(box(0.66, 0.5, 0.035, M.darkPlastic)));
  lcd.add(mesh(box(0.58, 0.42, 0.01, M.screen), 0, 0, -0.02));
  add(mkPart('lcd', 'LCD 翻转触控屏', 'body', lcd, new THREE.Vector3(0, 0, -1), 1.85));

  // ---------- 电池 ----------
  const battery = new THREE.Group();
  battery.position.set(-0.72, -0.3, 0.18);
  battery.add(mesh(box(0.2, 0.45, 0.16, M.battery)));
  battery.add(mesh(box(0.16, 0.03, 0.12, M.gold), 0, 0.24, 0));
  add(mkPart('battery', '电池 EN-EL15c', 'body', battery, new THREE.Vector3(0, -1, 0), 0.75));

  // ---------- 存储卡槽 ----------
  const cards = new THREE.Group();
  cards.position.set(-0.5, 0.05, -0.15);
  cards.add(mesh(box(0.06, 0.3, 0.26, M.darkPlastic)));
  cards.add(mesh(box(0.16, 0.02, 0.14, M.card), -0.06, 0.08, 0.02, 0, 0, 0.2));   // CFexpress
  cards.add(mesh(box(0.11, 0.015, 0.1, M.card), -0.06, -0.08, -0.04, 0, 0, 0.2)); // SD
  add(mkPart('card-slots', '存储卡槽（CFexpress B + SD）', 'body', cards, new THREE.Vector3(-1, 0.1, 0), 0.55));

  return {
    root,
    parts,
    mountAnchor: { position: new THREE.Vector3(0, LENS_Y, MOUNT_Z) }, // 卡口端面中心
  };
}

export const gear = {
  id: 'nikon-z6-iii',
  type: 'camera',
  brand: 'Nikon',
  name: 'Nikon Z6 III',
  mount: 'nikon-z',
  view: { pos: [1.7, 0.9, 2.3], target: [0, 0, 0.1] },       // 仅机身
  comboView: { pos: [2.4, 1.1, 3.4], target: [0, -0.02, 0.5] }, // 装镜头后
  create: build,
};
