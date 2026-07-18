import * as THREE from 'three';

// 共享材质库（1 单位 = 10 cm，坐标系：X 左右 / Y 上下 / Z 前后，镜头朝 +Z）
export const M = {
  shell: new THREE.MeshStandardMaterial({ color: 0x24262b, metalness: 0.45, roughness: 0.5 }),
  darkPlastic: new THREE.MeshStandardMaterial({ color: 0x17181c, metalness: 0.1, roughness: 0.8 }),
  rubber: new THREE.MeshStandardMaterial({ color: 0x101114, metalness: 0.0, roughness: 0.95 }),
  metal: new THREE.MeshStandardMaterial({ color: 0xc8ccd4, metalness: 0.95, roughness: 0.25 }),
  metalDark: new THREE.MeshStandardMaterial({ color: 0x5f646d, metalness: 0.9, roughness: 0.35 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.3 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0x8fb4e0, metalness: 0, roughness: 0.06, transparent: true, opacity: 0.42 }),
  glassFront: new THREE.MeshPhysicalMaterial({ color: 0x5f83c8, metalness: 0, roughness: 0.04, transparent: true, opacity: 0.5 }),
  sensor: new THREE.MeshStandardMaterial({ color: 0x1a5a4a, metalness: 0.8, roughness: 0.2, emissive: 0x0d352b, emissiveIntensity: 0.6 }),
  pcb: new THREE.MeshStandardMaterial({ color: 0x0c5a2e, metalness: 0.2, roughness: 0.7 }),
  chip: new THREE.MeshStandardMaterial({ color: 0x14161a, metalness: 0.6, roughness: 0.4 }),
  screen: new THREE.MeshStandardMaterial({ color: 0x0a1a2e, metalness: 0.3, roughness: 0.25, emissive: 0x0a2438, emissiveIntensity: 0.5 }),
  battery: new THREE.MeshStandardMaterial({ color: 0x2e3238, metalness: 0.3, roughness: 0.6 }),
  card: new THREE.MeshStandardMaterial({ color: 0x232a35, metalness: 0.4, roughness: 0.5 }),
  apertureBlade: new THREE.MeshStandardMaterial({ color: 0x1c1e22, metalness: 0.85, roughness: 0.3 }),
  barrel: new THREE.MeshStandardMaterial({ color: 0x1b1c20, metalness: 0.35, roughness: 0.5 }),
  ring: new THREE.MeshStandardMaterial({ color: 0x121317, metalness: 0.1, roughness: 0.85 }),
};

/**
 * 两种用法：
 *   mesh(geometry, material, x, y, z, rx, ry, rz)  —— 常规几何体
 *   mesh(box(w, h, d, mat), x, y, z, rx, ry, rz)   —— box() 直接返回带材质的 Mesh
 */
export function mesh(geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  if (geo && geo.isMesh) {
    geo.position.set(mat || 0, x || 0, y || 0);
    geo.rotation.set(z || 0, rx || 0, ry || 0);
    return geo;
  }
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  return m;
}

export function box(w, h, d, mat) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
}

export function cyl(rt, rb, h, seg = 48) {
  return new THREE.CylinderGeometry(rt, rb, h, seg);
}

/**
 * 包装一个可拆解元件：记录 id / 名称 / 类别 / 基准位置 / 拆解方向与距离。
 * 网格材质克隆一份，避免高亮选中时影响共享材质的其他元件。
 */
export function mkPart(id, name, cat, node, dir, dist) {
  node.userData.partId = id;
  node.traverse((o) => {
    if (o.isMesh) {
      o.material = o.material.clone();
      o.userData.partId = id;
    }
  });
  return {
    id, name, cat, node,
    basePos: node.position.clone(),
    dir: dir.clone().normalize(),
    dist,
  };
}

/** 快速生成一个镜片元件（玻璃片 + 金属压圈） */
export function lensElement(radius, thickness, glassMat = M.glass) {
  const g = new THREE.Group();
  g.add(mesh(cyl(radius, radius, thickness, 48), glassMat));
  const rim = new THREE.TorusGeometry(radius + 0.008, 0.012, 12, 64);
  g.add(mesh(rim, M.metalDark, 0, 0, 0, Math.PI / 2));
  return g;
}

/** 光圈组件：外环 + n 片叶片围出近似圆孔 */
export function apertureUnit(rOuter, rHole, blades = 9) {
  const g = new THREE.Group();
  const ring = new THREE.RingGeometry(rHole * 0.55, rOuter, 48);
  g.add(mesh(ring, M.apertureBlade, 0, 0, 0, 0, 0, 0));
  g.children[0].material.side = THREE.DoubleSide;
  const rMid = (rOuter + rHole) / 2;
  for (let i = 0; i < blades; i++) {
    const a = (i / blades) * Math.PI * 2;
    const blade = mesh(
      box((rOuter - rHole) * 1.15, 0.05, 0.006, M.apertureBlade),
      Math.cos(a) * rMid, Math.sin(a) * rMid, 0.004,
      0, 0, a + Math.PI / 2 + 0.35
    );
    g.add(blade);
  }
  return g; // 默认位于 XY 平面，面向 ±Z
}
