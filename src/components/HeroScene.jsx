import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

function HeroScene({ active }) {
  const texture = useTexture('/hero-liquid.jpg');
  const { viewport } = useThree();

  // FIX: Apply texture settings in useEffect, not directly on the hook return
  useEffect(() => {
    if (texture) {
      texture.minFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      texture.needsUpdate = true;
    }

    return () => {
      if (texture) texture.dispose();
    };
  }, [texture]);

  if (!active) return null;

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent
        toneMapped={false}
      />
    </mesh>
  );
}

export default HeroScene;