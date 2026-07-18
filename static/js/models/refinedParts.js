import * as THREE from 'three';
import { M, mesh, box, cyl, mkPart } from './materials.js';

/**
 * 共享精修零件库：各机型/镜头的差异化外观件，供 spec.overrides 使用。
 * 每个函数与工厂模板同签名：(ctx) => mkPart 结果，沿用契约局部 id。
 * 只收录有真实外观依据的差异件；同质化的器材继续走工厂模板。
 */

// ---------- 圆形橡胶目镜罩（Z8 / Z9 的标志性 EVF 造型） ----------
export function roundEyecupEvf(ctx) {
  const { sx, sy, sz, sr, L } = ctx;
  const evf = new THREE.Group();
  evf.position.set(0, 0.63 * sy, -0.3 * sz);
  // 取景器主体
  evf.add(mesh(box(0.3 * sx, 0.2 * sy, 0.14 * sz, M.darkPlastic), 0, 0, 0.06 * sz));
  // 圆筒目镜
  evf.add(mesh(cyl(0.08 * sr, 0.08 * sr, 0.1 * sz, 32), M.darkPlastic, 0, 0.02 * sy, -0.06 * sz, Math.PI / 2));
  // 圆形橡胶目镜罩
  evf.add(mesh(new THREE.TorusGeometry(0.085 * sr, 0.018 * sr, 16, 48), M.rubber, 0, 0.02 * sy, -0.11 * sz));
  // 目镜玻璃
  evf.add(mesh(cyl(0.065 * sr, 0.065 * sr, 0.02, 32), M.glassFront, 0, 0.02 * sy, -0.115 * sz, Math.PI / 2));
  return mkPart('evf', L.evf, 'body', evf, new THREE.Vector3(0, 0.55, -0.85), 0.95);
}

// ---------- 无肩屏骨架（Z5 II / Z50 II 等入门机型没有顶部 LCD） ----------
export function chassisNoTopLcd(ctx) {
  const { w, h, d, sx, sy, hd, L } = ctx;
  const chassis = new THREE.Group();
  chassis.add(mesh(box(w, h, d, M.shell)));
  // 正面饰皮
  chassis.add(mesh(box(0.6 * sx, 0.9 * sy, 0.02, M.rubber), 0.3 * sx, -0.02, hd + 0.005));
  return mkPart('chassis', L.chassis, 'body', chassis, new THREE.Vector3(0, 0, 0), 0);
}

// ---------- 左肩按键集群（Z8 取消实体模式拨盘，改为一排功能按键） ----------
export function buttonClusterDial(ctx) {
  const { sx, sy, sz, sr, L } = ctx;
  const cluster = new THREE.Group();
  cluster.position.set(0.45 * sx, 0.63 * sy, -0.05 * sz); // 与模板模式拨盘同位（左肩）
  cluster.add(mesh(box(0.24 * sx, 0.03 * sy, 0.12 * sz, M.darkPlastic))); // 按键底板
  for (let i = 0; i < 4; i++) { // MODE / WB / BKT 等四枚小按键
    cluster.add(mesh(cyl(0.026 * sr, 0.026 * sr, 0.02 * sy, 16), M.darkPlastic,
      (-0.075 + i * 0.05) * sx, 0.022 * sy, 0));
  }
  return mkPart('mode-dial', L['mode-dial'], 'body', cluster, new THREE.Vector3(0.2, 1, 0), 0.95);
}

// ---------- 四叶草驱动模式拨盘（Z9 左肩标志件） ----------
export function fourLeafDial(ctx) {
  const { sx, sy, sz, sr, L } = ctx;
  const dial = new THREE.Group();
  dial.position.set(0.45 * sx, 0.63 * sy, -0.05 * sz);
  dial.add(mesh(cyl(0.11 * sr, 0.11 * sr, 0.025 * sy, 32), M.darkPlastic)); // 基座
  for (let i = 0; i < 4; i++) { // 十字四叶片
    const a = (i / 4) * Math.PI * 2;
    dial.add(mesh(box(0.075 * sr, 0.02 * sy, 0.045 * sr, M.darkPlastic),
      Math.cos(a) * 0.065 * sr, 0.02 * sy, Math.sin(a) * 0.065 * sr, 0, -a, 0));
  }
  dial.add(mesh(cyl(0.028 * sr, 0.028 * sr, 0.035 * sy, 24), M.metalDark, 0, 0.025 * sy, 0)); // 中央锁定按钮
  return mkPart('mode-dial', L['mode-dial'], 'body', dial, new THREE.Vector3(0.2, 1, 0), 0.95);
}

// 模板镜筒基体（与 lensFactory 的 barrel 一致，供镜头精修件叠加细节）
function baseBarrel(L, R) {
  const barrel = new THREE.Group();
  barrel.add(mesh(cyl(R, R * 0.96, L * 0.9, 64), M.barrel, 0, 0, L * 0.51, Math.PI / 2));
  barrel.add(mesh(cyl(R * 0.93, R * 0.93, L * 0.1, 64), M.barrel, 0, 0, L * 0.09, Math.PI / 2));
  barrel.add(mesh(new THREE.TorusGeometry(R * 0.95, 0.02, 12, 64), M.metalDark, 0, 0, L * 0.95));
  return barrel;
}

// ---------- 长焦镜筒操控区（70-200：L-Fn ×2 + AF/MF 与对焦限位开关） ----------
export function barrelWithSwitches(ctx) {
  const { L, R } = ctx;
  const barrel = baseBarrel(L, R);
  // 左侧开关座：AF/MF 与对焦限位
  barrel.add(mesh(box(0.03, 0.1, 0.16, M.darkPlastic), -R * 0.99, 0, L * 0.18));
  barrel.add(mesh(box(0.02, 0.035, 0.05, M.metalDark), -R * 1.03, 0.025, L * 0.16));
  barrel.add(mesh(box(0.02, 0.035, 0.05, M.metalDark), -R * 1.03, -0.025, L * 0.2));
  // 两枚 L-Fn 自定义按钮（横/竖拍左手拇指落点）
  barrel.add(mesh(cyl(0.032, 0.032, 0.03, 16), M.darkPlastic, -R * 0.99, 0, L * 0.32, 0, 0, Math.PI / 2));
  barrel.add(mesh(cyl(0.032, 0.032, 0.03, 16), M.darkPlastic, -R * 0.99, 0, L * 0.5, 0, 0, Math.PI / 2));
  return mkPart('barrel', '镜筒与内部骨架', 'lens', barrel, new THREE.Vector3(0, 0, 0), 0);
}

// ---------- 标准大三元镜筒 L-Fn 按钮（24-70 f/2.8 S） ----------
export function barrelWithLFn(ctx) {
  const { L, R } = ctx;
  const barrel = baseBarrel(L, R);
  barrel.add(mesh(cyl(0.032, 0.032, 0.03, 16), M.darkPlastic, -R * 0.99, 0, L * 0.3, 0, 0, Math.PI / 2));
  return mkPart('barrel', '镜筒与内部骨架', 'lens', barrel, new THREE.Vector3(0, 0, 0), 0);
}
