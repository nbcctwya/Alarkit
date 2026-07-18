import * as THREE from 'three';
import { M, mesh, box, cyl, mkPart, lensElement, apertureUnit } from './materials.js';

/**
 * Nikkor Z 24-120mm f/4 S（教学示意模型）
 * 光轴沿 Z：卡口端 z=0，前玉朝 +Z，全长约 1.18。
 */
export function buildZoomLens() {
  const root = new THREE.Group();
  const parts = [];
  // 镜头元件 id 加 l- 前缀，避免与机身元件（如 mount）冲突
  const add = (p) => {
    p.id = 'l-' + p.id;
    p.node.traverse((o) => { o.userData.partId = p.id; });
    root.add(p.node); parts.push(p);
  };
  const elem = (r, t, mat) => { const e = lensElement(r, t, mat); e.rotation.x = Math.PI / 2; return e; };

  // ---------- 镜筒（基准，不拆解） ----------
  const barrel = new THREE.Group();
  barrel.add(mesh(cyl(0.42, 0.405, 1.06, 64), M.barrel, 0, 0, 0.6, Math.PI / 2));
  barrel.add(mesh(cyl(0.39, 0.39, 0.12, 64), M.barrel, 0, 0, 0.1, Math.PI / 2));
  barrel.add(mesh(new THREE.TorusGeometry(0.4, 0.02, 12, 64), M.metalDark, 0, 0, 1.12));
  add(mkPart('barrel', '镜筒与内部骨架', 'lens', barrel, new THREE.Vector3(0, 0, 0), 0));

  // ---------- 卡口与电子触点 ----------
  const mount = new THREE.Group();
  mount.position.set(0, 0, 0.02);
  mount.add(mesh(cyl(0.35, 0.36, 0.08, 64), M.metal, 0, 0, 0, Math.PI / 2));
  for (let i = 0; i < 3; i++) { // 卡口卡爪
    const a = (i / 3) * Math.PI * 2;
    mount.add(mesh(box(0.1, 0.05, 0.03, M.metal), Math.cos(a) * 0.33, Math.sin(a) * 0.33, 0.05, 0, 0, a));
  }
  for (let i = 0; i < 11; i++) { // 电子触点
    mount.add(mesh(box(0.018, 0.008, 0.012, M.gold), -0.09 + i * 0.018, -0.3, -0.01));
  }
  add(mkPart('mount', 'Z 卡口与电子触点', 'lens', mount, new THREE.Vector3(0, 0, -1), 0.5));

  // ---------- 控制环 ----------
  const ctrlRing = new THREE.Group();
  ctrlRing.position.set(0, 0, 0.17);
  ctrlRing.add(mesh(cyl(0.415, 0.415, 0.07, 64), M.ring, 0, 0, 0, Math.PI / 2));
  add(mkPart('control-ring', '控制环（可自定义）', 'lens', ctrlRing, new THREE.Vector3(0, 0, 1), 0.45));

  // ---------- STM 步进马达 ----------
  const stm = new THREE.Group();
  stm.position.set(0, 0, 0.28);
  stm.add(mesh(new THREE.TorusGeometry(0.3, 0.045, 16, 64), M.metalDark));
  stm.add(mesh(box(0.08, 0.14, 0.1, M.chip), 0.3, -0.12, 0));
  add(mkPart('af-motor', 'STM 步进对焦马达', 'lens', stm, new THREE.Vector3(0, 0, 1), 0.72));

  // ---------- 对焦镜片组 ----------
  const focusGroup = new THREE.Group();
  focusGroup.position.set(0, 0, 0.38);
  focusGroup.add(elem(0.22, 0.05));
  const fg2 = elem(0.24, 0.04); fg2.position.z = 0.08; focusGroup.add(fg2);
  add(mkPart('focus-group', '对焦镜片组', 'lens', focusGroup, new THREE.Vector3(0, 0, 1), 0.95));

  // ---------- 光圈叶片 ----------
  const aperture = new THREE.Group();
  aperture.position.set(0, 0, 0.5);
  aperture.add(apertureUnit(0.3, 0.13, 9));
  add(mkPart('aperture', '光圈叶片（9 片）', 'lens', aperture, new THREE.Vector3(0, 0, 1), 1.2));

  // ---------- 变焦环 ----------
  const zoomRing = new THREE.Group();
  zoomRing.position.set(0, 0, 0.64);
  zoomRing.add(mesh(cyl(0.43, 0.43, 0.28, 64), M.ring, 0, 0, 0, Math.PI / 2));
  add(mkPart('zoom-ring', '变焦环', 'lens', zoomRing, new THREE.Vector3(0, 0, 1), 1.35));

  // ---------- 变焦镜片组 ----------
  const zoomGroup = new THREE.Group();
  zoomGroup.position.set(0, 0, 0.72);
  zoomGroup.add(elem(0.28, 0.05));
  const zg2 = elem(0.3, 0.04); zg2.position.z = 0.09; zoomGroup.add(zg2);
  add(mkPart('zoom-group', '变焦镜片组', 'lens', zoomGroup, new THREE.Vector3(0, 0, 1), 1.55));

  // ---------- 对焦环 ----------
  const focusRing = new THREE.Group();
  focusRing.position.set(0, 0, 0.95);
  focusRing.add(mesh(cyl(0.425, 0.425, 0.14, 64), M.ring, 0, 0, 0, Math.PI / 2));
  add(mkPart('focus-ring', '对焦环', 'lens', focusRing, new THREE.Vector3(0, 0, 1), 1.72));

  // ---------- 前镜片组 ----------
  const frontGroup = new THREE.Group();
  frontGroup.position.set(0, 0, 1.0);
  frontGroup.add(elem(0.32, 0.06));
  const fg3 = elem(0.34, 0.05); fg3.position.z = 0.08; frontGroup.add(fg3);
  add(mkPart('front-group', '前镜片组（含 ED / 非球面镜片）', 'lens', frontGroup, new THREE.Vector3(0, 0, 1), 1.9));

  // ---------- 前玉 ----------
  const front = new THREE.Group();
  front.position.set(0, 0, 1.13);
  front.add(elem(0.36, 0.045, M.glassFront));
  add(mkPart('front-element', '前镜片（前玉）', 'lens', front, new THREE.Vector3(0, 0, 1), 2.2));

  return { group: root, parts, length: 1.18 };
}
