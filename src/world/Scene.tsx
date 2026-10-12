import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Fireflies } from "./Fireflies";
import { LIGHTS, frameOrtho } from "./look";
import { themeOf, type ThemeKey } from "./themes";
import { Traffic } from "./Traffic";
import { VoxelWorld } from "./VoxelWorld";

interface Props {
  theme: ThemeKey;
  seed: number;
  progress: number;
  reduceMotion: boolean;
  /** Shared so the wallpaper can match the current view angle. */
  rotation: React.MutableRefObject<number>;
}

function Framing({ frame }: { frame: number }) {
  const { camera, size } = useThree();
  useLayoutEffect(() => {
    // Narrow (phone) views need more headroom for the full-grown world.
    const narrow = size.width / size.height < 1.2;
    frameOrtho(camera as THREE.OrthographicCamera, size.width, size.height, (narrow ? 1.12 : 1) * frame, narrow ? 0.08 : 0.22);
  }, [camera, size, frame]);
  return null;
}

function Turntable({ children, reduceMotion, rotation }: { children: React.ReactNode; reduceMotion: boolean; rotation: Props["rotation"] }) {
  const group = useRef<THREE.Group>(null!);
  const gl = useThree((s) => s.gl);
  const drag = useRef({ active: false, lastX: 0, vel: 0 });

  useLayoutEffect(() => {
    const el = gl.domElement;
    const down = (e: PointerEvent) => {
      drag.current.active = true;
      drag.current.lastX = e.clientX;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!drag.current.active) return;
      const dx = (e.clientX - drag.current.lastX) * 0.008;
      drag.current.lastX = e.clientX;
      rotation.current += dx;
      drag.current.vel = dx;
    };
    const up = () => (drag.current.active = false);
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [gl, rotation]);

  useFrame(({ clock }, dt) => {
    const d = drag.current;
    if (!d.active) {
      d.vel *= 0.94;
      rotation.current += d.vel + (reduceMotion ? 0 : Math.min(dt, 0.05) * 0.06);
    }
    group.current.rotation.y = rotation.current;
    group.current.position.y = reduceMotion ? 0 : Math.sin(clock.elapsedTime / 2.4) * 0.25;
  });

  return <group ref={group}>{children}</group>;
}

export function Scene({ theme, seed, progress, reduceMotion, rotation }: Props) {
  const { frame, lanes } = themeOf(theme);
  const roads = useMemo(() => lanes?.(seed), [lanes, seed]);
  return (
    <Canvas
      orthographic
      shadows="soft"
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ manual: true, near: 0.1, far: 200 } as never}
      className="!absolute inset-0 cursor-grab active:cursor-grabbing"
      aria-label="Your world. Drag to turn it."
    >
      <Framing frame={frame} />
      <hemisphereLight args={[LIGHTS.hemi.sky, LIGHTS.hemi.ground, LIGHTS.hemi.intensity]} />
      <directionalLight
        color={LIGHTS.sun.color}
        intensity={LIGHTS.sun.intensity}
        position={[...LIGHTS.sun.position]}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0008}
        shadow-camera-left={-28}
        shadow-camera-right={28}
        shadow-camera-top={28}
        shadow-camera-bottom={-28}
        shadow-camera-near={1}
        shadow-camera-far={120}
      />
      <directionalLight color={LIGHTS.rim.color} intensity={LIGHTS.rim.intensity} position={[...LIGHTS.rim.position]} />
      <Turntable reduceMotion={reduceMotion} rotation={rotation}>
        <VoxelWorld theme={theme} seed={seed} progress={progress} reduceMotion={reduceMotion} />
        {roads && <Traffic lanes={roads} progress={progress} reduceMotion={reduceMotion} />}
        <Fireflies />
      </Turntable>
    </Canvas>
  );
}
