import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, useGLTF, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { sanitizeGltfMaterials } from '../utils/sanitizeGltfMaterials';
import { cloneGltfScene } from '../utils/cloneGltfScene';

const GOLD_RIM = '#D4AF37';

const enhanceMaterials = (root) => {
  if (!root) return;
  root.traverse((node) => {
    if (node.geometry?.attributes?.uv && !node.geometry?.attributes?.uv2) {
      node.geometry.setAttribute('uv2', node.geometry.attributes.uv.clone());
    }
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    materials.forEach((mat) => {
      if (!mat) return;
      if (mat.isMeshStandardMaterial) {
        mat.metalness = 0.45;
        mat.roughness = 0.5;
        mat.envMapIntensity = Math.max(1.5, mat.envMapIntensity ?? 1);
        mat.needsUpdate = true;
      }
    });
  });
};

function InitRectAreaLights() {
  const didInitRef = useRef(false);
  useEffect(() => {
    if (didInitRef.current) return;
    RectAreaLightUniformsLib.init();
    didInitRef.current = true;
  }, []);
  return null;
}

function BloomComposer({ enabled }) {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;
    const composer = new EffectComposer(gl);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      0.35, 1.0, 0.45
    );
    composer.addPass(bloom);
    composerRef.current = composer;
    return () => {
      composer.dispose();
    };
  }, [camera, enabled, gl, scene, size.height, size.width]);

  useFrame(() => {
    if (!enabled || !composerRef.current) return;
    composerRef.current.render();
  }, 1);

  return null;
}

// LIQUID IMAGE COMPONENT WITH SHADER
const LiquidAtrium = ({ texture, scrollProgress, hasExperienced, viewport }) => {
  const meshRef = useRef();
  
  const shaderArgs = useMemo(() => ({
    uniforms: {
      uTexture: { value: texture },
      uTime: { value: 0 },
      uWarp: { value: 0 },
      uOpacity: { value: 1 },
      uAspect: { value: viewport.aspect }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        // Fullscreen quad in clip space so camera zoom/scroll doesn't "scale" the background.
        gl_Position = vec4(position.xy, 1.0, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture;
      uniform float uTime;
      uniform float uWarp;
      uniform float uOpacity;
      uniform float uAspect;
      varying vec2 vUv;
      
      void main() {
        // RESPONSIVE COVER LOGIC (Prevents stretching)
        float textureAspect = 1.777; // Source texture aspect ratio (16:9)
        vec2 uv = vUv;
        
        if (uAspect > textureAspect) {
          float scale = uAspect / textureAspect;
          uv.y = (uv.y - 0.5) / scale + 0.5;
        } else {
          float scale = textureAspect / uAspect;
          uv.x = (uv.x - 0.5) / scale + 0.5;
        }
        
        // LIQUID MOTION: Dynamic 'Silk' flow distortion
        float silk = sin(uv.y * 5.2 + uTime * 0.38) * 0.009;
        float ripple = cos(uv.x * 6.5 - uTime * 0.42) * 0.005;
        uv += (silk + ripple) * (1.0 - uWarp);
        
        vec4 color = texture2D(uTexture, uv);
        
        // Editorial Bronze Tinting
        vec3 bronze = vec3(0.85, 0.72, 0.58);
        color.rgb = mix(color.rgb, color.rgb * bronze, 0.15 * (1.0 - uWarp));
        
        // Circular Vignette Computation
        float vignette = 1.0 - distance(vUv, vec2(0.5)) * 1.4;
        
        color.rgb *= mix(0.42, 0.68, clamp(vignette, 0.0, 1.0));
        color.rgb = mix(color.rgb, vec3(0.0), uWarp);
        
        gl_FragColor = vec4(color.rgb, uOpacity * (1.0 - uWarp));
      }
    `
  }), [texture, viewport.aspect]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material;
    mat.uniforms.uTime.value = state.clock.getElapsedTime();
    mat.uniforms.uAspect.value = viewport.aspect;
    
    // INSTANT WARP ON EXPERIENCE
    const targetWarp = hasExperienced ? 1.0 : 0;
    mat.uniforms.uWarp.value = THREE.MathUtils.lerp(mat.uniforms.uWarp.value, targetWarp, 0.15);
    
    // Visibility kill for total darkness
    meshRef.current.visible = mat.uniforms.uWarp.value < 0.99 && !hasExperienced;
  });

  return (
    <mesh ref={meshRef} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial args={[shaderArgs]} transparent depthWrite={false} depthTest={false} />
    </mesh>
  );
};

function HybridScene({ scrollProgressRef, scrollProgress, hasExperienced, heroTitleShown, gateMetricsRef }) {
  const { camera, viewport } = useThree();
  const { scene: gltfScene } = useGLTF('/chair.glb');
  const groupRef = useRef();
  const envRef = useRef();
  const chairBaseYRef = useRef(-1.05);
  const chairBaseXRef = useRef(0);
  
  const atriumTexture = useTexture('/hero-liquid.jpg');
  
  // PERFORMANCE: High-end texture tuning
  useEffect(() => {
    if (atriumTexture) {
      atriumTexture.minFilter = THREE.LinearFilter; // Reduce VRAM / Mipmap pressure
      atriumTexture.magFilter = THREE.LinearFilter;
      atriumTexture.generateMipmaps = false; 
    }
  }, [atriumTexture]);

  const { scene } = useMemo(() => {
    const cloned = cloneGltfScene(gltfScene);
    sanitizeGltfMaterials(cloned);
    enhanceMaterials(cloned);
    return { scene: cloned };
  }, [gltfScene]);

  // PRODUCTION HARDENING: Automatic disposal of scene resources to prevent context loss
  useEffect(() => {
    return () => {
      scene.traverse((node) => {
        if (node.isMesh) {
          node.geometry.dispose();
          if (Array.isArray(node.material)) {
            node.material.forEach((m) => m.dispose());
          } else {
            node.material.dispose();
          }
        }
      });
    };
  }, [scene]);

  const { gl } = useThree();

  // GPU PRE-WARMER: Compile shaders early (during preloader) to avoid stutter on first reveal
  useEffect(() => {
    if (scene && gl) {
      gl.compile(scene, camera);
      // Log for diagnostic confirmation
      console.log("WebGL Lifecycle: SCENE_OPTIMIZED_AND_PREWARMED");
    }
  }, [gl, scene, camera]);

  useFrame((state, dt) => {
    const t = state.clock.getElapsedTime();
    const scrollProgressValue =
      typeof scrollProgressRef?.current === 'number'
        ? scrollProgressRef.current
        : (typeof scrollProgress === 'number' ? scrollProgress : 0);
    
    // RED CARPET NARRATIVE STAGES (1200vh scroll-weight synchronized)
    const entranceFactor = THREE.MathUtils.smoothstep(scrollProgressValue, 0, 0.08); 
    
    const gate = gateMetricsRef?.current;
    const gateProgress = gate?.progress ?? 0;
    const gateTime = gate?.time ?? 0;
    const inGate = (gate?.active ?? false) || (gateProgress > 0 && gateProgress < 1);
    const chairPastEnd = gate?.pastEnd ?? false;

    // Use gate advancement for the culmination (not global scroll) to keep it anchored
    const gateCulminationFactor = THREE.MathUtils.smoothstep(gateProgress, 0.7, 1.0);
    const culminationFactor = hasExperienced ? gateCulminationFactor : THREE.MathUtils.smoothstep(scrollProgressValue, 0.65, 0.9);
    
    // 1. Z-DEPTH (Constant Massive Presence)
    const startZ = 0.8; 
    const midZ = 3.6;   
    const finalZ = 1.25; 
    
    let targetZ = startZ;
    
    // Robust Reset: If we are back at the header, force original zoom regardless of experience flag
    if (scrollProgressValue < 0.02) {
      targetZ = startZ;
    } else if (!hasExperienced) {
      if (scrollProgressValue < 0.12) {
        targetZ = THREE.MathUtils.lerp(startZ, midZ, entranceFactor);
      } else if (scrollProgressValue < 0.68) {
        targetZ = midZ;
      } else {
        targetZ = THREE.MathUtils.lerp(midZ, finalZ, culminationFactor);
      }
    } else {
      // Normal narrative flow deep in the site
      targetZ = THREE.MathUtils.lerp(midZ, finalZ, culminationFactor);
    }
    
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 3, dt);
    
    const isPortrait = viewport.aspect < 1;
    const isUltraWide = viewport.aspect > 2;

    // 2. LATERAL BALANCE - Responds to screen width to prevent overlap with side text on mobile
    const VISION_X = isPortrait ? -0.4 : -1.25;
    const MISSION_X = isPortrait ? 0.4 : 1.25;
    const CENTER_X = 0;

    let targetX = CENTER_X;
    if (inGate) {
      if (gateTime < 5) {
        targetX = VISION_X;
      } else if (gateTime < 7) {
        const k = THREE.MathUtils.smoothstep(gateTime, 5, 7);
        targetX = THREE.MathUtils.lerp(VISION_X, MISSION_X, k);
      } else if (gateTime < 12) {
        targetX = MISSION_X;
      } else if (gateTime < 15) {
        const k = THREE.MathUtils.smoothstep(gateTime, 12, 15);
        targetX = THREE.MathUtils.lerp(MISSION_X, CENTER_X, k);
      } else {
        targetX = CENTER_X;
      }
    }

    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 7.5, dt);

    const localCulm = inGate
      ? THREE.MathUtils.smoothstep(gateTime, 15, 18.5)
      : culminationFactor;
    const targetCamY = THREE.MathUtils.lerp(0, 0.15, localCulm);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 7.5, dt);

    if (groupRef.current) {
      const isVisibleNow = !chairPastEnd && (scrollProgressValue < 0.95 || inGate);
      groupRef.current.visible = isVisibleNow;
      if (!isVisibleNow) return;

      // Responsive positioning: Lower on phone to leave room for title, higher on desktop for grounding
      const targetChairBaseY = isPortrait 
        ? (hasExperienced ? -0.85 : heroTitleShown ? -1.15 : -0.85)
        : (hasExperienced ? -1.25 : heroTitleShown ? -1.45 : -1.25);

      chairBaseYRef.current = THREE.MathUtils.damp(chairBaseYRef.current, targetChairBaseY, 4.5, dt);
      groupRef.current.position.y = chairBaseYRef.current + Math.sin(t * 0.75) * 0.03;

      // Keep subtle horizontal life, and make it stronger during "About" so it never feels like it stops.
      const driftStrength = inGate && gateTime >= 15 ? 0.12 : 0.06;
      chairBaseXRef.current = THREE.MathUtils.damp(chairBaseXRef.current, 0, 4.5, dt);
      groupRef.current.position.x = chairBaseXRef.current + Math.sin(t * 0.35) * driftStrength;
      
      // RESPONSIVE SCALING: Tighter fit on mobile to prevent clipping
      const portraitScale = 2.45;
      const landscapeScale = isUltraWide ? 4.2 : 3.35;
      const maxScale = isPortrait ? portraitScale : landscapeScale;
      const startScale = isPortrait ? 0.8 : 1.0; 
      
      // Transition from material close-up into the Majestic Narrative Scale
      let currentScale = maxScale;
      if (scrollProgressValue < 0.1) {
        currentScale = THREE.MathUtils.lerp(startScale, maxScale, entranceFactor);
      }
      groupRef.current.scale.setScalar(currentScale);
      
      // Face toward the active text side (left/right) and keep motion alive in the "About" stage.
      const YAW_LEFT = -0.42;
      const YAW_RIGHT = 0.42;
      const YAW_CENTER = 0.12;

      let targetYaw = YAW_CENTER;
      if (inGate) {
        if (gateTime < 5) {
          targetYaw = YAW_LEFT;
        } else if (gateTime < 7) {
          const k = THREE.MathUtils.smoothstep(gateTime, 5, 7);
          targetYaw = THREE.MathUtils.lerp(YAW_LEFT, YAW_RIGHT, k);
        } else if (gateTime < 12) {
          targetYaw = YAW_RIGHT;
        } else if (gateTime < 15) {
          const k = THREE.MathUtils.smoothstep(gateTime, 12, 15);
          targetYaw = THREE.MathUtils.lerp(YAW_RIGHT, YAW_CENTER, k);
        } else {
          targetYaw = YAW_CENTER;
        }
      }

      const yawSway = Math.sin(t * 0.4) * (inGate && gateTime >= 15 ? 0.14 : 0.06);
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetYaw + yawSway, 7.0, dt);
    }

    if (envRef.current) {
      const targetInt = THREE.MathUtils.lerp(0.35, 3.0, localCulm);
      if (Math.abs(envRef.current.environmentIntensity - targetInt) > 0.01) {
        envRef.current.environmentIntensity = targetInt;
      }
    }
  });

  return (
    <group>
      <InitRectAreaLights />
      <ambientLight intensity={0.15} />
      
      {/* SHADER-BASED LIQUID BACKGROUND */}
      <LiquidAtrium 
        texture={atriumTexture} 
        scrollProgress={scrollProgress} 
        hasExperienced={hasExperienced} 
        viewport={viewport}
      />

      <Environment ref={envRef} preset="studio" environmentIntensity={0.1} />

      <group ref={groupRef} position={[0, -0.62, -2.5]}>
        <primitive object={scene} />
      </group>

      <directionalLight intensity={1.0} position={[5, 10, 5]} color="#fff8f0" />
      <directionalLight intensity={0.4} position={[-5, 5, -5]} color="#d6e8ff" />
    </group>
  );
}

const MainBackgroundCanvas = ({ scrollProgressRef, scrollProgress = 0, hasExperienced = false, heroTitleShown = false, gateMetricsRef }) => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-black">
      <Canvas
        className="w-full h-full"
        dpr={1} // Lock to 1.0 for maximum performance (60fps priority)
        gl={{ 
          antialias: false, // Turn off MSAA for performance
          alpha: true, 
          powerPreference: 'high-performance',
          stencil: false,
          depth: true
        }}
        camera={{ position: [0, 0, 5.2], fov: 32 }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 1);
          // High-performance hint
          gl.getContext().getExtension('OES_standard_derivatives');
        }}
      >
        <Suspense fallback={null}>
          <HybridScene
            scrollProgressRef={scrollProgressRef}
            scrollProgress={scrollProgress}
            hasExperienced={hasExperienced}
            heroTitleShown={heroTitleShown}
            gateMetricsRef={gateMetricsRef}
          />
          {/* Bloom disabled for 60fps scroll stability */}
          {/* <BloomComposer enabled={true} /> */}
        </Suspense>
      </Canvas>
      {/* DIGITAL ARCHIVE SCANLINE OVERLAY */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] z-[1]"
        style={{
          backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
          backgroundSize: '100% 2px, 3px 100%'
        }}
      />
      {/* INTENSIFIED VIGNETTE FOR VISIBILITY */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-1500"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 10%, rgba(0,0,0,0.92) 85%, #000 100%)',
          opacity: hasExperienced ? 0 : 0.78
        }}
      />
    </div>
  );
};

export default MainBackgroundCanvas;
