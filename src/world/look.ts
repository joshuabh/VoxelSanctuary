import * as THREE from "three";
import type { Voxel } from "./voxel";

/** Shared lighting and camera setup for the live scene and still renders. */
export const LIGHTS = {
  hemi: { sky: 0xbfe9ff, ground: 0x1a120c, intensity: 1.6 },
  sun: { color: 0xfff1dc, intensity: 2.6, position: [18, 30, 10] as const },
  rim: { color: 0x8fe6ee, intensity: 0.9, position: [-20, 10, -16] as const },
};

export const CAMERA_POSITION = new THREE.Vector3(30, 33, 30);
export const CAMERA_TARGET = new THREE.Vector3(0, 5, 0);

/** Fits the island and full-grown tree, lifting the world clear of the bottom HUD. */
export function frameOrtho(cam: THREE.OrthographicCamera, w: number, h: number, pad = 1, lift = 0.22) {
  const aspect = w / h;
  let halfH = 15 * pad;
  if (halfH * aspect < 14 * pad) halfH = (14 * pad) / aspect;
  cam.left = -halfH * aspect;
  cam.right = halfH * aspect;
  cam.top = halfH * (1 - lift);
  cam.bottom = -halfH * (1 + lift);
  cam.position.copy(CAMERA_POSITION);
  cam.lookAt(CAMERA_TARGET);
  cam.updateProjectionMatrix();
}

const dummy = new THREE.Object3D();
/** Places voxel `i` at growth factor `k` (0 hidden, 1 full size), growing up from its base. */
export function placeVoxel(mesh: THREE.InstancedMesh, i: number, v: Voxel, k: number) {
  const s = v.scale * k;
  dummy.position.set(v.x, v.y - 0.5 + 0.5 * s, v.z);
  dummy.scale.setScalar(Math.max(s, 0.0001));
  dummy.updateMatrix();
  mesh.setMatrixAt(i, dummy.matrix);
}

export const easeOutBack = (k: number) => 1 + 2.5 * Math.pow(k - 1, 3) + 1.5 * Math.pow(k - 1, 2);
