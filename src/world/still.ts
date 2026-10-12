import * as THREE from "three";
import { LIGHTS, frameOrtho, placeVoxel } from "./look";
import { themeOf, type ThemeKey } from "./themes";

interface StillOptions {
  background?: number;
  rotation?: number;
  pad?: number;
  lift?: number;
  type?: "image/png" | "image/jpeg";
}

/** Renders a fully grown world to an image data URL (keepsake thumbnails, wallpapers). */
export function renderStill(theme: ThemeKey, seed: number, width: number, height: number, opts: StillOptions = {}): string {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(opts.background ?? 0x0f1416);
  scene.add(new THREE.HemisphereLight(LIGHTS.hemi.sky, LIGHTS.hemi.ground, LIGHTS.hemi.intensity));
  const sun = new THREE.DirectionalLight(LIGHTS.sun.color, LIGHTS.sun.intensity);
  sun.position.set(...LIGHTS.sun.position);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0008;
  Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 80 });
  scene.add(sun);
  const rim = new THREE.DirectionalLight(LIGHTS.rim.color, LIGHTS.rim.intensity);
  rim.position.set(...LIGHTS.rim.position);
  scene.add(rim);

  const voxels = themeOf(theme).generate(seed).filter((v) => !v.isSeed);
  const mesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0, flatShading: true }),
    voxels.length,
  );
  mesh.castShadow = mesh.receiveShadow = true;
  const c = new THREE.Color();
  voxels.forEach((v, i) => {
    mesh.setColorAt(i, c.set(v.color));
    placeVoxel(mesh, i, v, 1);
  });
  mesh.rotation.y = opts.rotation ?? -0.35;
  scene.add(mesh);

  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
  frameOrtho(cam, width, height, opts.pad ?? 1, opts.lift ?? 0.05);
  renderer.render(scene, cam);
  const url = renderer.domElement.toDataURL(opts.type ?? "image/png", 0.92);

  mesh.geometry.dispose();
  (mesh.material as THREE.Material).dispose();
  renderer.dispose();
  renderer.forceContextLoss();
  return url;
}
