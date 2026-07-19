import * as THREE from 'three';
import { M, mesh, cyl, mkPart } from './materials.js';

/**
 * 镜头精修零件库：各品牌镜头的差异化外观件，供 spec.overrides 使用。
 * 每个函数与工厂模板同签名：(ctx) => mkPart 结果，沿用契约局部 id。
 * 只收录有真实外观依据的差异件；同质化的镜头继续走工厂模板。
 */

// ---------- 佳能 L 红圈镜筒（L 专业镜头前部的标志性红圈） ----------
export function barrelWithRedRing(ctx) {
  const { L, R, labels } = ctx;
  const barrel = new THREE.Group();
  // 镜筒基体：与工厂模板 barrel 完全相同的三段几何
  barrel.add(mesh(cyl(R, R * 0.96, L * 0.9, 64), M.barrel, 0, 0, L * 0.51, Math.PI / 2));
  barrel.add(mesh(cyl(R * 0.93, R * 0.93, L * 0.1, 64), M.barrel, 0, 0, L * 0.09, Math.PI / 2));
  barrel.add(mesh(new THREE.TorusGeometry(R * 0.95, 0.02, 12, 64), M.metalDark, 0, 0, L * 0.95));
  // 前部红圈：佳能 L 专业镜头标志
  const redL = new THREE.MeshStandardMaterial({ color: 0xc0202a, metalness: 0.3, roughness: 0.45 });
  barrel.add(mesh(new THREE.TorusGeometry(R * 0.97, 0.015, 12, 64), redL, 0, 0, L * 0.88));
  return mkPart('barrel', labels.barrel, 'lens', barrel, new THREE.Vector3(0, 0, 0), 0);
}
