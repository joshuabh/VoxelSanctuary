import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Lane } from "./city";
import { mulberry32 } from "./rng";

const MAX_CARS = 90;
const COLORS = ["#d9dde0", "#c0463a", "#3a6ea5", "#e8c26a", "#1f2427", "#8fe6ee", "#f2f2f2"];
const ROAD_TOP = 0.62; // top of the asphalt slab on a flat island
const SIDE = 0.2; // drive on the right-hand side of each road

interface Car {
  lane: number;
  /** True when driving from the lane's b end towards a. */
  reverse: boolean;
  /** Distance travelled along the lane, in cells. */
  u: number;
  speed: number;
}

const length = (l: Lane) => Math.abs(l.bx - l.ax) + Math.abs(l.bz - l.az);
const key = (x: number, z: number) => `${x},${z}`;

/** Cars that drive the paved roads; more of them as the city grows. */
export function Traffic({ lanes, progress, reduceMotion }: { lanes: Lane[]; progress: number; reduceMotion: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const rnd = useMemo(() => mulberry32(1234), []);
  const cars = useRef<Car[]>([]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Junction -> lanes touching it, for picking the next road at the end of a stretch
  const junctions = useMemo(() => {
    const m = new Map<string, number[]>();
    lanes.forEach((l, i) => {
      for (const k of [key(l.ax, l.az), key(l.bx, l.bz)]) m.set(k, [...(m.get(k) ?? []), i]);
    });
    return m;
  }, [lanes]);

  useLayoutEffect(() => {
    const c = new THREE.Color();
    for (let i = 0; i < MAX_CARS; i++) mesh.current.setColorAt(i, c.set(COLORS[i % COLORS.length]));
    mesh.current.instanceColor!.needsUpdate = true;
  }, []);

  useFrame((_, dt) => {
    const active = lanes.map((l) => l.t <= progress);
    const open = lanes.map((_, i) => i).filter((i) => active[i]);
    const target = open.length ? Math.round(MAX_CARS * Math.min(1, Math.pow(progress, 1.3)) + 2) : 0;
    const list = cars.current;
    while (list.length < target) {
      const lane = open[Math.floor(rnd() * open.length)];
      list.push({ lane, reverse: rnd() < 0.5, u: rnd() * length(lanes[lane]), speed: 1.2 + rnd() * 1.6 });
    }
    list.length = Math.min(list.length, target);

    const step = reduceMotion ? 0 : Math.min(dt, 0.05);
    list.forEach((car, i) => {
      if (!active[car.lane]) car.lane = open[Math.floor(rnd() * open.length)];
      let l = lanes[car.lane];
      car.u += car.speed * step;
      if (car.u >= length(l)) {
        // Turn onto another open road at the junction we've reached
        const [ex, ez] = car.reverse ? [l.ax, l.az] : [l.bx, l.bz];
        const options = (junctions.get(key(ex, ez)) ?? []).filter((j) => active[j] && j !== car.lane);
        const next = options.length ? options[Math.floor(rnd() * options.length)] : car.lane;
        const nl = lanes[next];
        car.reverse = next === car.lane ? !car.reverse : !(nl.ax === ex && nl.az === ez);
        car.lane = next;
        car.u = 0;
        l = nl;
      }
      const len = length(l);
      const f = car.reverse ? 1 - car.u / len : car.u / len;
      const alongX = l.az === l.bz;
      const dir = car.reverse ? -1 : 1;
      const x = l.ax + (l.bx - l.ax) * f + (alongX ? 0 : SIDE * dir);
      const z = l.az + (l.bz - l.az) * f + (alongX ? -SIDE * dir : 0);
      dummy.position.set(x, ROAD_TOP + 0.11, z);
      dummy.rotation.set(0, alongX ? 0 : Math.PI / 2, 0);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.count = list.length;
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, MAX_CARS]} castShadow>
      <boxGeometry args={[0.5, 0.22, 0.26]} />
      <meshStandardMaterial roughness={0.5} metalness={0.1} />
    </instancedMesh>
  );
}
