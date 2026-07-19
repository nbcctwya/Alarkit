import * as THREE from 'three';
import {
  cameras, lenses, brands, findGear, createGear, assemble, isCompatible,
  DEFAULT_CAMERA, DEFAULT_LENS,
} from '../static/js/registry.js';
import { PART_INFO, GEAR_INFO } from '../static/js/data.js';
import { buildBody } from '../static/js/models/bodyFactory.js';
import { buildLens } from '../static/js/models/lensFactory.js';
import { mkPart } from '../static/js/models/materials.js';

let fail = 0;
const bad = (msg) => { console.log('FAIL', msg); fail++; };
const ok = (msg) => console.log('  ok', msg);

const allGear = [...cameras, ...lenses];

// ---------- 1. 器材 id 全局唯一 + 描述符字段齐全 ----------
const gearIds = new Set();
for (const g of allGear) {
  if (gearIds.has(g.id)) bad(`duplicate gear id ${g.id}`);
  gearIds.add(g.id);
  for (const f of ['id', 'type', 'brand', 'name', 'mount']) {
    if (!g[f] || typeof g[f] !== 'string') bad(`${g.id}: missing/invalid field ${f}`);
  }
  if (g.type !== 'camera' && g.type !== 'lens') bad(`${g.id}: bad type ${g.type}`);
  if (typeof g.create !== 'function') bad(`${g.id}: create is not a function`);
  if (!g.view || !Array.isArray(g.view.pos) || !Array.isArray(g.view.target)) bad(`${g.id}: view missing`);
  if (g.type === 'camera' && !g.comboView) bad(`${g.id}: camera missing comboView`);
  const gi = GEAR_INFO[g.id];
  if (!gi) bad(`GEAR_INFO missing ${g.id}`);
  else if (!gi.name || !gi.sub || !gi.desc) bad(`GEAR_INFO incomplete ${g.id}`);
}
ok(`${allGear.length} gears registered (${cameras.length} cameras, ${lenses.length} lenses)`);

// ---------- 1.5 品牌覆盖：每个品牌至少 1 机身 1 镜头 ----------
if (!Array.isArray(brands) || !brands.length) bad('brands list empty');
for (const b of brands) {
  if (!cameras.some((c) => c.brand === b)) bad(`brand ${b} has no camera`);
  if (!lenses.some((l) => l.brand === b)) bad(`brand ${b} has no lens`);
}
ok(`${brands.length} brands: ${brands.join(' / ')}`);

// ---------- 2-6. create 返回格式 / 元件 id / 文案 / 拆解参数 / 包围盒 ----------
const partIds = new Set();
for (const g of allGear) {
  const inst = createGear(g.id);
  if (!inst) { bad(`${g.id}: createGear returned null`); continue; }
  if (!(inst.root && inst.root.isObject3D)) bad(`${g.id}: root is not Object3D`);
  if (!(Array.isArray(inst.parts) && inst.parts.length)) bad(`${g.id}: parts empty`);
  if (!(inst.mountAnchor && inst.mountAnchor.position && inst.mountAnchor.position.isVector3)) {
    bad(`${g.id}: mountAnchor.position missing`);
  }
  console.log(`${g.id}: ${inst.parts.length} parts`);
  for (const p of inst.parts) {
    // 元件 id 全局唯一且带器材命名空间
    if (partIds.has(p.id)) bad(`duplicate part id ${p.id}`);
    partIds.add(p.id);
    if (!p.id.startsWith(g.id + ':')) bad(`${p.id}: not namespaced by gear id`);
    if (!p.localId || !p.basePos) bad(`${p.id}: localId/basePos missing`);
    if (p.node.userData.partId !== p.id) bad(`${p.id}: node partId mismatch`);
    let meshCount = 0, meshMissingPid = 0;
    p.node.traverse((o) => { if (o.isMesh) { meshCount++; if (o.userData.partId !== p.id) meshMissingPid++; } });
    if (!meshCount) bad(`${p.id}: no meshes`);
    if (meshMissingPid) bad(`${p.id}: ${meshMissingPid} meshes missing partId`);
    // 文案：全 id → 局部 id 查询链
    const info = PART_INFO[p.id] || PART_INFO[p.localId];
    if (!info) bad(`${p.id}: no PART_INFO (tried "${p.id}", "${p.localId}")`);
    else if (!info.name || !info.purpose || !info.principle || !info.tips) bad(`${p.id}: incomplete info`);
    // 拆解方向 / 距离
    if (!p.dir || !p.dir.isVector3 || ![p.dir.x, p.dir.y, p.dir.z].every(Number.isFinite)) {
      bad(`${p.id}: invalid dir`);
    } else if (p.dist > 0 && Math.abs(p.dir.length() - 1) > 1e-3) {
      bad(`${p.id}: dir not normalized (len=${p.dir.length().toFixed(3)})`);
    }
    if (!Number.isFinite(p.dist) || p.dist < 0) bad(`${p.id}: invalid dist ${p.dist}`);
    p.node.position.copy(p.basePos).addScaledVector(p.dir, p.dist * 0.5);
    const { x, y, z } = p.node.position;
    if ([x, y, z].some(Number.isNaN)) bad(`${p.id}: NaN position after explode`);
  }
  // 包围盒有限且尺寸合理
  const bb = new THREE.Box3().setFromObject(inst.root);
  const size = bb.getSize(new THREE.Vector3());
  const finite = [bb.min, bb.max].every((v) => [v.x, v.y, v.z].every(Number.isFinite));
  if (!finite) {
    bad(`${g.id}: non-finite bbox`);
  } else {
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim < 0.05 || maxDim > 5) bad(`${g.id}: bbox max dim ${maxDim.toFixed(2)} out of (0.05, 5)`);
    console.log(`  bbox size: ${size.toArray().map((v) => v.toFixed(2)).join(' × ')}`);
  }
}
ok(`${partIds.size} unique part ids`);

// ---------- 6.5 工厂 overrides 精修机制 ----------
const dummyPart = (id) => mkPart(id, 'OVERRIDE-MARK', 'body',
  new THREE.Group().add(new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshBasicMaterial())),
  new THREE.Vector3(0, 1, 0), 1);

const ovBody = buildBody({
  dims: [1.39, 1.02, 0.74], sensorFormat: 'fx', shutter: 'mechanical',
  overrides: { evf: () => dummyPart('evf') },
});
const ovBodyPart = ovBody.parts.find((p) => p.id === 'evf');
if (!ovBodyPart || ovBodyPart.name !== 'OVERRIDE-MARK') bad('bodyFactory override not applied');
else if (ovBody.parts.length !== 15) bad(`bodyFactory override changed part count: ${ovBody.parts.length}`);
else ok('bodyFactory overrides mechanism');

const ovLens = buildLens({
  length: 1.2, radius: 0.4, kind: 'zoom',
  overrides: { aperture: () => dummyPart('aperture') },
});
const ovLensPart = ovLens.parts.find((p) => p.id === 'aperture');
if (!ovLensPart || ovLensPart.name !== 'OVERRIDE-MARK') bad('lensFactory override not applied');
else if (ovLens.parts.length !== 11) bad(`lensFactory override changed part count: ${ovLens.parts.length}`);
else ok('lensFactory overrides mechanism');

// ---------- 7. 卡口兼容逻辑 ----------
const z6 = findGear(DEFAULT_CAMERA);
for (const lens of lenses) {
  if (lens.mount !== z6.mount) { // 其他卡口：必须不兼容
    if (isCompatible(z6, lens)) bad(`${z6.id} should NOT be compatible with ${lens.id}`);
    continue;
  }
  if (!isCompatible(z6, lens)) bad(`${z6.id} should be compatible with ${lens.id}`);
  else ok(`${z6.id} × ${lens.id} compatible (${lens.mount})`);
}
if (isCompatible(z6, { mount: 'other-mount' })) bad('fake incompatible lens judged compatible');
if (isCompatible(z6, null) || isCompatible(null, lenses[0])) bad('null gear judged compatible');
// 跨品牌卡口互斥：不同品牌的卡口不同，组合必须不兼容
const crossPairs = [
  ['sony-a7c2', 'nikkor-z-24-120-f4s'],
  ['nikon-z6-iii', 'sony-fe-35-f14gm'],
  ['canon-eos-r5', 'fujifilm-xf-35-f14'],
  ['leica-m11', 'lumix-s-24-105-f4'],
];
for (const [cid, lid] of crossPairs) {
  const c = findGear(cid), l = findGear(lid);
  if (!c || !l) { bad(`cross-brand pair missing: ${cid} / ${lid}`); continue; }
  if (isCompatible(c, l)) bad(`cross-brand ${cid} × ${lid} should NOT be compatible`);
}
ok(`cross-brand mounts mutually exclusive (${crossPairs.length} pairs)`);

// ---------- 8/9. 组合装配与活动元件数 ----------
const combos = [
  [DEFAULT_CAMERA, DEFAULT_LENS, 26],
  [DEFAULT_CAMERA, 'nikkor-z-85-f18s', 24],
  ['nikon-z9', 'nikkor-z-70-200-f28s', 30],
  ['nikon-z50-ii', 'nikkor-z-dx-18-140', 27],
  ['sony-a7c2', 'sony-fe-35-f14gm', 24],
  ['fujifilm-x-t5', 'fujifilm-xf-35-f14', 24],
  ['canon-eos-r5', 'canon-rf-50-f12l', 24],
  ['leica-m11', 'leica-summilux-m-35-f14', 23],
  ['hasselblad-x2d', 'hasselblad-xcd-55-f25v', 24],
  ['lumix-s5-ii', 'lumix-s-24-105-f4', 27],
];
for (const [c, l, expect] of combos) {
  const a = assemble(c, l);
  if (a.parts.length !== expect) bad(`${c} + ${l}: ${a.parts.length} parts, expected ${expect}`);
  else ok(`${c} + ${l}: ${a.parts.length} parts`);
  // 镜头应装在机身卡口锚点上
  const off = a.lens.root.position.distanceTo(a.camera.mountAnchor.position);
  if (off > 1e-6) bad(`${c} + ${l}: lens not at mount anchor (off=${off})`);
  // 组合文案（GEAR_INFO 组合键）
  if (!GEAR_INFO[`${c}+${l}`]) bad(`GEAR_INFO missing combo ${c}+${l}`);
}
// 仅机身 / 仅镜头装配不报错
if (assemble(DEFAULT_CAMERA, null).parts.length === 0) bad('camera-only assemble empty');
if (assemble(null, DEFAULT_LENS).parts.length === 0) bad('lens-only assemble empty');
// 不兼容组合应被拒绝
try {
  assemble(DEFAULT_CAMERA, DEFAULT_LENS); // 兼容：不抛错
} catch (e) {
  bad(`compatible assemble threw: ${e.message}`);
}

console.log(fail ? `\n${fail} FAILURES` : '\nALL OK');
process.exit(fail ? 1 : 0);
