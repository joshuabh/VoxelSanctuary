import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { generateBonsai, isVisible } from "./bonsai";
import { easeOutBack, placeVoxel } from "./look";

const POP_MS = 480;
const STAGGER_MS = 900;

interface Props {
  seed: number;
  progress: number;
  reduceMotion: boolean;
}

/** Instanced voxel world; voxels pop in, staggered by growth order, as progress rises. */
export function VoxelWorld({ seed, progress, reduceMotion }: Props) {
  const voxels = useMemo(() => generateBonsai(seed), [seed]);
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const shown = useRef<boolean[]>([]);
  const anim = useRef(new Map<number, number>());
  const prev = useRef(0);

  useLayoutEffect(() => {
    const m = mesh.current;
    const c = new THREE.Color();
    voxels.forEach((v, i) => {
      m.setColorAt(i, c.set(v.color));
      placeVoxel(m, i, v, 0);
    });
    m.instanceColor!.needsUpdate = true;
    m.instanceMatrix.needsUpdate = true;
    shown.current = new Array(voxels.length).fill(false);
    anim.current.clear();
    prev.current = 0;
  }, [voxels]);

  useEffect(() => {
    const m = mesh.current;
    const now = performance.now();
    const from = prev.current;
    const range = Math.max(progress - from, 0.001);
    voxels.forEach((v, i) => {
      const want = isVisible(v, progress);
      if (want && !shown.current[i]) {
        shown.current[i] = true;
        if (reduceMotion) placeVoxel(m, i, v, 1);
        else anim.current.set(i, now + Math.min(1, Math.max(0, (v.t - from) / range)) * STAGGER_MS);
      } else if (!want && shown.current[i]) {
        shown.current[i] = false;
        anim.current.delete(i);
        placeVoxel(m, i, v, 0);
      }
    });
    prev.current = progress;
    m.instanceMatrix.needsUpdate = true;
  }, [progress, voxels, reduceMotion]);

  useFrame(() => {
    if (!anim.current.size) return;
    const m = mesh.current;
    const now = performance.now();
    anim.current.forEach((start, i) => {
      const k = (now - start) / POP_MS;
      if (k < 0) return;
      placeVoxel(m, i, voxels[i], k >= 1 ? 1 : easeOutBack(k));
      if (k >= 1) anim.current.delete(i);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh key={seed} ref={mesh} args={[undefined, undefined, voxels.length]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.85} metalness={0} flatShading />
    </instancedMesh>
  );
}
