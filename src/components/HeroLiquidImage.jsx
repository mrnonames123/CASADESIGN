import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const LiquidImage = ({ url, visible = true }) => {
  const meshRef = useRef();
  const { viewport } = useThree();

  // FIX: Load texture regardless of visibility to follow Rules of Hooks
  const texture = useTexture(url);

  // FIX: useMemo must be called at the top level
  const shaderArgs = useMemo(() => ({
    uniforms: {
      uTexture: { value: texture },
      uTime: { value: 0 },
      uPlaneSize: { value: new THREE.Vector2(1, 1) },
      uOutputSize: { value: new THREE.Vector2(1, 1) },
      uVelo: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture;
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        vec2 uv = vUv;
        vec4 color = texture2D(uTexture, uv);
        gl_FragColor = color;
      }
    `
  }), [texture]);

  // FIX: useFrame must be called at the top level
  useFrame((state) => {
    if (!visible || !meshRef.current) return;
    meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
  });

  if (!visible) return null;

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial args={[shaderArgs]} transparent />
    </mesh>
  );
};

export default LiquidImage;