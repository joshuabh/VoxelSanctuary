import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { mulberry32 } from "./rng";

const COUNT = 46;

export function Fireflies() {
  const points = useRef<THREE.Points>(null!);
  const { seeds, positions } = useMemo(() => {
    const rnd = mulberry32(7);
    return {
      seeds: Array.from({ length: COUNT }, () => [rnd() * 24 - 12, rnd() * 16 + 1, rnd() * 24 - 12, rnd() * Math.PI * 2]),
      positions: new Float32Array(COUNT * 3),
    };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    seeds.forEach(([x, y, z, ph], i) => {
      positions[i * 3] = x + Math.sin(t * 0.3 + ph) * 1.2;
      positions[i * 3 + 1] = y + Math.sin(t * 0.5 + ph * 2) * 0.8;
      positions[i * 3 + 2] = z + Math.cos(t * 0.27 + ph) * 1.2;
    });
    points.current.geometry.attributes.position.needsUpdate = true;
    (points.current.material as THREE.PointsMaterial).opacity = 0.35 + 0.4 * (0.5 + 0.5 * Math.sin(t * 1.3));
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={0x9ff0d0} size={3} sizeAttenuation={false} transparent opacity={0.75} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}
