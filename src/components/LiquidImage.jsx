import React, { useRef, useMemo, Suspense, useEffect } from 'react';
import { useFrame, useThree, useLoader } from '@react-three/fiber';
import { View } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full bg-casa-charcoal flex items-center justify-center pointer-events-none relative overflow-hidden">
          <img src="/hero-liquid.jpg" className="absolute inset-0 w-full h-full object-cover opacity-20 filter grayscale" alt="Asset Pending" />
          <span className="font-body text-casa-bronze/50 text-[10px] uppercase tracking-[0.2em] relative z-20">Asset Pending</span>
        </div>
      );
    }
    return this.props.children;
  }
}

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D uTexture;
uniform float uHover;
uniform float uTime;
uniform vec2 uMouse;
uniform float uVelocity;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  float distToMouse = distance(uv, uMouse);
  float zoom = uHover * 0.15 * (1.0 - smoothstep(0.0, 0.6, distToMouse));
  vec2 warpedUv = uv - (uMouse - uv) * zoom;

  float rgbShift = uVelocity * 0.08 * exp(-distToMouse * 4.0) * uHover;
  
  vec4 color = vec4(1.0);
  color.r = texture2D(uTexture, warpedUv + vec2(rgbShift, 0.0)).r;
  color.g = texture2D(uTexture, warpedUv).g;
  color.b = texture2D(uTexture, warpedUv - vec2(rgbShift, 0.0)).b;
  color.a = 1.0;

  float distToCenter = distance(vUv, vec2(0.5));
  float vignette = smoothstep(1.2, 0.4, distToCenter);
  color.rgb *= mix(1.0, vignette, 0.4);

  gl_FragColor = color;
}
`;

const ImageMesh = ({ url }) => {
  const meshRef = useRef();
  const materialRef = useRef();
  const { viewport, invalidate } = useThree();
  
  const absoluteUrl = useMemo(() => {
    return window.location.origin + url + '?v=1.4';
  }, [url]);

  const texture = useLoader(THREE.TextureLoader, absoluteUrl, (loader) => {
    loader.setCrossOrigin('anonymous');
  });

  useEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      invalidate();
    }
  }, [texture, invalidate]);

  useEffect(() => {
    return () => {
      if (texture) texture.dispose();
      if (meshRef.current?.geometry) meshRef.current.geometry.dispose();
      if (materialRef.current) materialRef.current.dispose();
    };
  }, [texture]);
  
  const targetMouse = useRef(new THREE.Vector2(0.5, 0.5));
  const currentMouse = useRef(new THREE.Vector2(0.5, 0.5));
  const lastInteraction = useRef(Date.now());

  // MISSION: NaN GEOMETRY SAFETY REINFORCEMENT
  if (!viewport || isNaN(viewport.width) || viewport.width === 0) return null;

  const geometryArgs = useMemo(() => {
    return [viewport.width || 1, viewport.height || 1, 16, 16];
  }, [viewport.width, viewport.height]);

  const uniforms = useMemo(() => ({
    uTexture: { value: texture },
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uHover: { value: 0 },
    uVelocity: { value: 0 }
  }), [texture]);

  useFrame((state) => {
    if (!materialRef.current) return;
    const isIdle = Date.now() - lastInteraction.current > 2000;
    if (!isIdle) {
      currentMouse.current.lerp(targetMouse.current, 0.1);
      const velocity = currentMouse.current.distanceTo(targetMouse.current);

      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uMouse.value.copy(currentMouse.current);
      
      materialRef.current.uniforms.uVelocity.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uVelocity.value,
        velocity * 10.0,
        0.1
      );
      invalidate();
    }
  });

  return (
    <mesh 
      ref={meshRef}
      onPointerMove={(e) => {
        lastInteraction.current = Date.now();
        targetMouse.current.set(e.uv.x, e.uv.y);
        invalidate();
      }}
      onPointerEnter={() => {
        lastInteraction.current = Date.now();
        gsap.to(materialRef.current.uniforms.uHover, { value: 1, duration: 1.2, ease: "expo.out", onUpdate: invalidate });
        gsap.to(meshRef.current.scale, { x: 1.12, y: 1.12, z: 1.12, duration: 1.2, ease: "expo.out", onUpdate: invalidate });
      }}
      onPointerLeave={() => {
        gsap.to(materialRef.current.uniforms.uHover, { value: 0, duration: 0.8, ease: "expo.out", onUpdate: invalidate });
        gsap.to(meshRef.current.scale, { x: 1, y: 1, z: 1, duration: 1, ease: "expo.out", onUpdate: invalidate });
        targetMouse.current.set(0.5, 0.5);
      }}
    >
      <planeGeometry args={geometryArgs} />
      <shaderMaterial 
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        opacity={1.0}
      />
    </mesh>
  );
};

const LiquidImage = ({ url, className = "" }) => {
  const containerRef = useRef();
  return (
    <div ref={containerRef} className={"w-full h-full " + className + " overflow-hidden pointer-events-auto magnetic-interactive"}>
      <ErrorBoundary>
        <Suspense fallback={null}>
          <View track={containerRef}>
             <ImageMesh url={url} />
          </View>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default LiquidImage;
