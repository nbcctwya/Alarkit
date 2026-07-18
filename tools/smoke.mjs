import * as THREE from 'three';
import { buildBody } from '/home/nbcctwya/mytry/webStar/static/js/models/body.js';
import { buildZoomLens } from '/home/nbcctwya/mytry/webStar/static/js/models/lensZoom.js';
import { buildPrimeLens } from '/home/nbcctwya/mytry/webStar/static/js/models/lensPrime.js';
import { PART_INFO, GEAR_INFO } from '/home/nbcctwya/mytry/webStar/static/js/data.js';

let fail = 0;
const bad = (msg) => { console.log('FAIL', msg); fail++; };

const models = { body: buildBody(), zoom: buildZoomLens(), prime: buildPrimeLens() };
for (const [k, m] of Object.entries(models)) {
  console.log(`${k}: ${m.parts.length} parts`);
  const ids = new Set();
  for (const p of m.parts) {
    if (ids.has(p.id)) bad(`${k}: duplicate id ${p.id}`);
    ids.add(p.id);
    // 模拟拆解到 0.5，检查无 NaN
    p.node.position.copy(p.basePos).addScaledVector(p.dir, p.dist * 0.5);
    const { x, y, z } = p.node.position;
    if ([x, y, z].some(Number.isNaN)) bad(`${k}/${p.id}: NaN position`);
    if (!p.node.userData.partId) bad(`${k}/${p.id}: node missing partId`);
    let meshCount = 0, meshMissingPid = 0;
    p.node.traverse(o => { if (o.isMesh) { meshCount++; if (!o.userData.partId) meshMissingPid++; } });
    if (!meshCount) bad(`${k}/${p.id}: no meshes`);
    if (meshMissingPid) bad(`${k}/${p.id}: ${meshMissingPid} meshes missing partId`);
    // 文案检查（去掉 l- 前缀，prime: 覆盖）
    const key = p.id.startsWith('l-') ? p.id.slice(2) : p.id;
    const info = PART_INFO['prime:' + key] || PART_INFO[key];
    if (!info) bad(`${k}/${p.id}: no PART_INFO (key=${key})`);
    else if (!info.purpose || !info.principle || !info.tips) bad(`${k}/${p.id}: incomplete info`);
  }
}
for (const g of ['body+zoom','body+prime','body','zoom','prime']) {
  if (!GEAR_INFO[g]) bad(`GEAR_INFO missing ${g}`);
}
// 包围盒检查：组合态模型是否大小合理
const bb = new THREE.Box3().setFromObject(models.body.group);
console.log('body bbox:', bb.min.toArray().map(v=>v.toFixed(2)), bb.max.toArray().map(v=>v.toFixed(2)));
const bz = new THREE.Box3().setFromObject(models.zoom.group);
console.log('zoom bbox:', bz.min.toArray().map(v=>v.toFixed(2)), bz.max.toArray().map(v=>v.toFixed(2)));
console.log(fail ? `\n${fail} FAILURES` : '\nALL OK');
process.exit(fail ? 1 : 0);
