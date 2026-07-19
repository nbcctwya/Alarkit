import * as THREE from 'three';
import { gear as z6iii } from './models/body.js';
import { gear as z7ii } from './models/bodyZ7ii.js';
import { gear as z5ii } from './models/bodyZ5ii.js';
import { gear as z8 } from './models/bodyZ8.js';
import { gear as z9 } from './models/bodyZ9.js';
import { gear as z50ii } from './models/bodyZ50ii.js';
import { gear as a7c2 } from './models/bodySonyA7c2.js';
import { gear as xt5 } from './models/bodyFujiXt5.js';
import { gear as r5 } from './models/bodyCanonR5.js';
import { gear as m11 } from './models/bodyLeicaM11.js';
import { gear as x2d } from './models/bodyHasselbladX2d.js';
import { gear as s5ii } from './models/bodyLumixS5ii.js';
import { gear as z24120 } from './models/lensZoom.js';
import { gear as z85 } from './models/lensPrime.js';
import { gear as z2470 } from './models/lens2470.js';
import { gear as z70200 } from './models/lens70200.js';
import { gear as z1424 } from './models/lens1424.js';
import { gear as z35 } from './models/lens35.js';
import { gear as z50 } from './models/lens50.js';
import { gear as zdx18140 } from './models/lensDx18140.js';
import { gear as sony35gm } from './models/lensSony35gm.js';
import { gear as fuji35 } from './models/lensFuji35.js';
import { gear as canon50 } from './models/lensCanon50.js';
import { gear as leica35 } from './models/lensLeica35.js';
import { gear as hassel55 } from './models/lensHasselblad55.js';
import { gear as lumix24105 } from './models/lensLumix24105.js';

/**
 * 器材注册表：统一登记全部机身与镜头，提供查询、卡口兼容性判断与装配。
 * 新增器材：在 models/ 下按描述符接口（id/type/brand/name/mount/create）导出 gear，
 * 然后在这里 import 并登记到 cameras 或 lenses。
 */

export const cameras = [z6iii, z7ii, z5ii, z8, z9, z50ii, a7c2, xt5, r5, m11, x2d, s5ii];
export const lenses = [z24120, z85, z2470, z70200, z1424, z35, z50, zdx18140, sony35gm, fuji35, canon50, leica35, hassel55, lumix24105];

const allGear = [...cameras, ...lenses];

// 品牌列表（按登记顺序，Nikon 在前）
export const brands = [...new Set(allGear.map((g) => g.brand))];

// 页面初始组合
export const DEFAULT_CAMERA = 'nikon-z6-iii';
export const DEFAULT_LENS = 'nikkor-z-24-120-f4s';

export function findGear(id) {
  return allGear.find((g) => g.id === id) || null;
}

/** 卡口相同即兼容 */
export function isCompatible(camera, lens) {
  return Boolean(camera && lens && camera.mount === lens.mount);
}

/**
 * 创建器材实例，并把元件局部 id 命名空间化为 `${gearId}:${localId}` 保证全局唯一
 * （机身与镜头存在 mount / aperture 等同名元件）。p.localId 保留原局部 id 供文案查询。
 */
export function createGear(id) {
  const desc = findGear(id);
  if (!desc) return null;
  const inst = desc.create();
  for (const p of inst.parts) {
    p.gearId = desc.id;
    p.localId = p.id;
    p.id = `${desc.id}:${p.localId}`;
    p.node.userData.partId = p.id;
    p.node.traverse((o) => { o.userData.partId = p.id; });
  }
  inst.gear = desc;
  return inst;
}

/**
 * 装配一套组合：创建实例并把镜头装到机身上。
 * 约定机身与镜头局部坐标统一（光轴 +Z，镜头卡口面在原点），
 * 镜头后卡口锚点与机身卡口锚点重合即完成安装；
 * 将来坐标系不统一的器材可在描述符中给出带旋转的 mountAnchor，在此统一处理。
 */
export function assemble(cameraId, lensId) {
  const group = new THREE.Group();
  const parts = [];
  let camera = null;
  let lens = null;

  if (cameraId) {
    camera = createGear(cameraId);
    group.add(camera.root);
    parts.push(...camera.parts);
  }
  if (lensId) {
    lens = createGear(lensId);
    if (camera) {
      if (!isCompatible(camera.gear, lens.gear)) {
        throw new Error(`卡口不兼容：${camera.gear.name}（${camera.gear.mount}）× ${lens.gear.name}（${lens.gear.mount}）`);
      }
      lens.root.position.copy(camera.mountAnchor.position).sub(lens.mountAnchor.position);
    }
    group.add(lens.root);
    parts.push(...lens.parts);
  }
  return { group, parts, camera, lens };
}
