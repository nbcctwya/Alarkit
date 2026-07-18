import * as THREE from 'three';
import { M, mesh, box, cyl, mkPart, lensElement, apertureUnit } from './materials.js';

/**
 * Nikkor Z 85mm f/1.8 S（教学示意模型）
 * 光轴沿 Z：卡口端 z=0，前玉朝 +Z，全长约 0.99。
 */
export function buildPrimeLens() {
  const root = new THREE.Group();
  const parts = [];
  // 镜头元件 id 加 l- 前缀，避免与机身元件（如 mount）冲突
  const add = (p) => {
    p.id = 'l-' + p.id;
    p.node.traverse((o) => { o.userData.partId = p.id; });
    root.add(p.node); parts.push(p);
  };
  const elem = (r, t, mat) => { const e = lensElement(r, t, mat); e.rotation.x = Math.PI / 2; return e; };

  // ---------- 镜筒 ----------
  const barrel = new THREE.Group();
  barrel.add(mesh(cyl(0.375, 0.36, 0.86, 64), M.barrel, 0, 0, 0.5, Math.PI / 2));
  barrel.add(mesh(cyl(0.34, 0.34, 0.1, 64), M.barrel, 0, 0, 0.08, Math.PI / 2));
  barrel.add(mesh(new THREE.TorusGeometry(0.36, 0.018, 12, 64), M.metalDark, 0, 0, 0.94));
  add(mkPart('barrel', '镜筒与内部骨架', 'lens', barrel, new THREE.Vector3(0, 0, 0), 0));

  // ---------- 卡口与电子触点 ----------
  const mount = new THREE.Group();
  mount.position.set(0, 0, 0.02);
  mount.add(mesh(cyl(0.33, 0.34, 0.08, 64), M.metal, 0, 0, 0, Math.PI / 2));
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    mount.add(mesh(box(0.1, 0.05, 0.03, M.metal), Math.cos(a) * 0.31, Math.sin(a) * 0.31, 0.05, 0, 0, a));
  }
  for (let i = 0; i < 11; i++) {
    mount.add(mesh(box(0.018, 0.008, 0.012, M.gold), -0.09 + i * 0.018, -0.28, -0.01));
  }
  add(mkPart('mount', 'Z 卡口与电子触点', 'lens', mount, new THREE.Vector3(0, 0, -1), 0.5));

  // ---------- 控制环 ----------
  const ctrlRing = new THREE.Group();
  ctrlRing.position.set(0, 0, 0.15);
  ctrlRing.add(mesh(cyl(0.37, 0.37, 0.06, 64), M.ring, 0, 0, 0, Math.PI / 2));
  add(mkPart('control-ring', '控制环（可自定义）', 'lens', ctrlRing, new THREE.Vector3(0, 0, 1), 0.4));

  // ---------- AF 马达 ----------
  const motor = new THREE.Group();
  motor.position.set(0, 0, 0.26);
  motor.add(mesh(new THREE.TorusGeometry(0.26, 0.04, 16, 64), M.metalDark));
  motor.add(mesh(box(0.07, 0.12, 0.09, M.chip), 0.26, -0.1, 0));
  add(mkPart('af-motor', 'AF 对焦马达', 'lens', motor, new THREE.Vector3(0, 0, 1), 0.65));

  // ---------- 对焦镜片组 ----------
  const focusGroup = new THREE.Group();
  focusGroup.position.set(0, 0, 0.36);
  focusGroup.add(elem(0.2, 0.05));
  const fg2 = elem(0.22, 0.04); fg2.position.z = 0.07; focusGroup.add(fg2);
  add(mkPart('focus-group', '对焦镜片组', 'lens', focusGroup, new THREE.Vector3(0, 0, 1), 0.9));

  // ---------- 光圈叶片 ----------
  const aperture = new THREE.Group();
  aperture.position.set(0, 0, 0.48);
  aperture.add(apertureUnit(0.26, 0.16, 9));
  add(mkPart('aperture', '光圈叶片（9 片圆形光圈）', 'lens', aperture, new THREE.Vector3(0, 0, 1), 1.1));

  // ---------- 对焦环 ----------
  const focusRing = new THREE.Group();
  focusRing.position.set(0, 0, 0.68);
  focusRing.add(mesh(cyl(0.385, 0.385, 0.3, 64), M.ring, 0, 0, 0, Math.PI / 2));
  add(mkPart('focus-ring', '对焦环', 'lens', focusRing, new THREE.Vector3(0, 0, 1), 1.3));

  // ---------- 前镜片组 ----------
  const frontGroup = new THREE.Group();
  frontGroup.position.set(0, 0, 0.8);
  frontGroup.add(elem(0.3, 0.06));
  const fg3 = elem(0.32, 0.05); fg3.position.z = 0.07; frontGroup.add(fg3);
  add(mkPart('front-group', '前镜片组（含 ED 镜片）', 'lens', frontGroup, new THREE.Vector3(0, 0, 1), 1.6));

  // ---------- 前玉 ----------
  const front = new THREE.Group();
  front.position.set(0, 0, 0.94);
  front.add(elem(0.34, 0.05, M.glassFront));
  add(mkPart('front-element', '前镜片（前玉）', 'lens', front, new THREE.Vector3(0, 0, 1), 1.9));

  return { group: root, parts, length: 0.99 };
}
