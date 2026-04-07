import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, useGLTF, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';
import gsap from 'gsap';
import { sanitizeGltfMaterials } from '../utils/sanitizeGltfMaterials';
import { cloneGltfScene } from '../utils/cloneGltfScene';
const GOLD_RIM = '#D4AF37';

let rectAreaLightUniformsInitialized = false;
const initRectAreaLightUniforms = () => {
  if (rectAreaLightUniformsInitialized) return;
  RectAreaLightUniformsLib.init();
  rectAreaLightUniformsInitialized = true;
};
if (typeof window !== 'undefined') initRectAreaLightUniforms();

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const map01 = (v, inMin, inMax) => clamp01((v - inMin) / (inMax - inMin));
const damp = (current, target, lambda, dt) => THREE.MathUtils.damp(current, target, lambda, dt);
const dampAngle = (current, target, lambda, dt) => {
  const twoPi = Math.PI * 2;
  const delta = THREE.MathUtils.euclideanModulo((target - current) + Math.PI, twoPi) - Math.PI;
  const step = 1 - Math.exp(-lambda * dt);
  return current + delta * step;
};

const enhanceMaterials = (root) => {
  if (!root) return;
  root.traverse((node) => {
    if (!node.isMesh) return;
    if (node.geometry?.attributes?.uv && !node.geometry?.attributes?.uv2) {
      // AO maps need uv2; many GLBs only ship uv. Copying is a common fallback.
      node.geometry.setAttribute('uv2', node.geometry.attributes.uv.clone());
    }
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    materials.forEach((mat) => {
      if (!mat) return;
      if (mat.isMeshStandardMaterial) {
        if (!mat.userData.__casaOriginalColor) {
          mat.userData.__casaOriginalColor = mat.color?.clone?.() ?? new THREE.Color(1, 1, 1);
        }
        // Studio Noir leather: less plastic, more tufted depth.
        mat.metalness = 0.2;
        mat.roughness = 0.6;
        mat.envMapIntensity = Math.max(1.45, mat.envMapIntensity ?? 1);
        if (mat.aoMap) mat.aoMapIntensity = Math.max(1.25, mat.aoMapIntensity ?? 1);
        mat.needsUpdate = true;
      }
    });
  });
};

function InitRectAreaLights() {
  // Must run before the first render that compiles materials using RectAreaLight.
  initRectAreaLightUniforms();
  return null;
}

function ExposureDriver({ progress01 }) {
  const { gl } = useThree();
  useFrame(() => {
    const p = clamp01(progress01);
    gl.toneMappingExposure = THREE.MathUtils.lerp(0.7, 1.4, p);
  });
  return null;
}

function SofaPostFX({ enabled }) {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;

    const composer = new EffectComposer(gl);
    composer.addPass(new RenderPass(scene, camera));

    const bloom = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      0.4, // strength
      0.9, // radius
      0.85 // threshold
    );
    composer.addPass(bloom);

    composer.setSize(size.width, size.height);
    composerRef.current = composer;

    return () => {
      composerRef.current = null;
      composer.dispose();
    };
  }, [camera, enabled, gl, scene, size.height, size.width]);

  useEffect(() => {
    if (!enabled) return;
    composerRef.current?.setSize(size.width, size.height);
  }, [enabled, size.height, size.width]);

  useFrame(() => {
    if (!enabled || !composerRef.current) return;
    composerRef.current.render();
  }, 1);

  return null;
}

// CD marquee removed.

function CinematicZoomRoute({ isExiting, rigRef, onBlackout }) {
  const { camera } = useThree();
  const firedRef = useRef(false);
  const tlRef = useRef(null);

  useEffect(() => {
    if (!isExiting) return;
    if (tlRef.current) return;

    const rig = rigRef?.current;
    const group = rig?.group;
    const rimMain = rig?.rimMain;
    const rimLeft = rig?.rimLeft;
    const rimRight = rig?.rimRight;

    if (!group || !rimMain || !rimLeft || !rimRight) return;

    // Ensure close-up clipping and consistent starting camera.
    camera.near = 0.01;
    camera.updateProjectionMatrix();

    // Engulf scale: 1.2 -> 2.5 (multiplied by base model scale).
    const baseScale = rig?.baseScale ?? 1;
    const fromScale = baseScale * 1.2;
    const toScale = baseScale * 2.5;
    group.scale.setScalar(fromScale);

    const rimMainStart = rimMain.intensity || 0;
    const rimLeftStart = rimLeft.intensity || 0;
    const rimRightStart = rimRight.intensity || 0;

    const tl = gsap.timeline({
      defaults: { ease: 'power4.inOut' },
      duration: 1.2
    });

    // 0s - 0.5s: rim "light leak" triples.
    tl.to(rimMain, { intensity: rimMainStart * 3, duration: 0.5 }, 0);
    tl.to(rimLeft, { intensity: rimLeftStart * 3, duration: 0.5 }, 0);
    tl.to(rimRight, { intensity: rimRightStart * 3, duration: 0.5 }, 0);

    // 0.5s - 1.2s: camera accelerates into the sofa + scale engulfs.
    tl.to(camera.position, { z: -1.4, y: 0.05, duration: 0.7 }, 0.5);
    tl.to(group.scale, { x: toScale, y: toScale, z: toScale, duration: 0.7 }, 0.5);

    // 1.1s: trigger app reveal (blackout moment).
    tl.call(() => {
      if (firedRef.current) return;
      firedRef.current = true;
      onBlackout?.();
    }, null, 1.1);

    tlRef.current = tl;
  }, [camera, isExiting, onBlackout, rigRef]);

  useFrame(() => {
    if (!isExiting) return;
    camera.updateProjectionMatrix();
  });

  return null;
}

function SofaLoaderScene({ progress01, isExiting, parallaxRef, rigRef, onArrived }) {
  const { camera } = useThree();
  const groupRef = useRef(null);
  const keyLightRef = useRef(null);
  const fillLightRef = useRef(null);
  const rimLightRef = useRef(null);
  const rimLeftRef = useRef(null);
  const rimRightRef = useRef(null);
  const envRef = useRef(null);
  const { scene: gltfScene } = useGLTF('/sofa.glb');
  const initializedRef = useRef(false);
  const silhouetteStateRef = useRef(null);
  const arrivedFiredRef = useRef(false);
  // Overall preloader sofa scale multiplier.
  const scaleMultiplier = 0.85; // Increased from 0.7 to fill space better

  // IMPORTANT: sanitize synchronously before first render so shaders never compile for MeshPhysicalMaterial.
  const { scene, baseSize, silhouetteMaterials } = useMemo(() => {
    const cloned = cloneGltfScene(gltfScene);

    sanitizeGltfMaterials(cloned);
    enhanceMaterials(cloned);

    cloned.position.set(0, 0, 0);
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    // Pivot closer to the backrest center (reduces wobble during zoom/rotation).
    const pivot = center.clone();
    pivot.y += size.y * 0.18;
    cloned.position.sub(pivot);

    const mats = [];
    cloned.traverse((node) => {
      if (!node.isMesh) return;
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      materials.forEach((mat) => {
        if (!mat?.isMeshStandardMaterial) return;
        if (!mat.userData?.__casaOriginalColor) return;
        mats.push(mat);
      });
    });

    return { scene: cloned, baseSize: size, silhouetteMaterials: mats };
  }, [gltfScene]);

  useEffect(() => {
    if (!groupRef.current || initializedRef.current) return;
    initializedRef.current = true;

    // Start route state: far + 45°.
    groupRef.current.position.set(0, -0.35, -12);
    groupRef.current.rotation.set(0, Math.PI / 4, 0);
    // Start tiny to avoid a visibility "pop" on first render/shader compile.
    groupRef.current.scale.setScalar(0.001);
  }, []);

  useEffect(() => {
    silhouetteStateRef.current = null;
  }, [scene]);

  useEffect(() => {
    if (!rigRef?.current) return;
    rigRef.current.group = groupRef.current;
    rigRef.current.rimMain = rimLightRef.current;
    rigRef.current.rimLeft = rimLeftRef.current;
    rigRef.current.rimRight = rimRightRef.current;
    rigRef.current.baseScale = 1;
  }, [rigRef]);

  useFrame((state, dt) => {
    if (!groupRef.current) return;
    if (isExiting) return;

    const p = clamp01(progress01);
    const moveT = map01(p, 0.05, 0.8);
    const finalT = map01(p, 0.8, 1.0);
    const litT = map01(p, 0.05, 0.9);
    const rimT = map01(p, 0.8, 1.0);
    const appearT = map01(p, 0.02, 0.08);
    const appearScale = THREE.MathUtils.lerp(0.001, 1, appearT);

    // Route: 0-20% silhouette at z:-12, 20-80% glide to z:0, 80-100% rotate to face forward.
    const targetZ = THREE.MathUtils.lerp(-12, 0, moveT);
    const rotAt80 = THREE.MathUtils.degToRad(30);
    const targetRotY = finalT > 0
      ? THREE.MathUtils.lerp(rotAt80, 0, finalT)
      : THREE.MathUtils.lerp(Math.PI / 4, rotAt80, moveT);

    groupRef.current.position.z = damp(groupRef.current.position.z, targetZ, 3.1, dt);

    const parallax = parallaxRef?.current ?? { x: 0, y: 0 };
    const maxYaw = THREE.MathUtils.degToRad(8);
    const maxPitch = THREE.MathUtils.degToRad(3);
    const parallaxYaw = maxYaw * parallax.x;
    const parallaxPitch = maxPitch * -parallax.y;

    const composedYaw = targetRotY + parallaxYaw;
    groupRef.current.rotation.y = dampAngle(groupRef.current.rotation.y, composedYaw, 3.1, dt);

    // Lock pitch/roll for a gallery-like feel.
    groupRef.current.rotation.x = dampAngle(groupRef.current.rotation.x, parallaxPitch, 4.2, dt);
    groupRef.current.rotation.z = dampAngle(groupRef.current.rotation.z, 0, 4.2, dt);

    // Responsive fit: scale to viewport + a smaller fill factor on narrow screens.
    const distance = Math.max(0.1, Math.abs(camera.position.z - groupRef.current.position.z));
    const visibleHeight = 2 * distance * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
    const visibleWidth = visibleHeight * (camera.aspect || 1);

    const isNarrow = (camera.aspect || 1) < 0.72;
    // Slightly smaller overall scale for the preloader sofa.
    const fillFactor = isNarrow ? 0.95 : 0.75; // Increased to fill whitespace
    const fitScale = Math.min(visibleWidth / (baseSize.x || 1), visibleHeight / (baseSize.y || 1)) * fillFactor * scaleMultiplier;

    if (rigRef?.current) rigRef.current.baseScale = fitScale;

    // Subtle scale-up in the ready state (was stronger).
    const readyScaleT = 1 + 0.08 * map01(p, 0.8, 1.0);
    const targetScale = fitScale * readyScaleT * appearScale;
    groupRef.current.scale.setScalar(damp(groupRef.current.scale.x || targetScale, targetScale, 4.0, dt));

    // Adjusted base height for mobile/desktop to prevent whitespace gaps
    const baseY = isNarrow ? -0.42 : -0.55;
    const breathe = Math.sin(state.clock.getElapsedTime() * 0.55) * 0.08 * map01(p, 0.25, 1.0);
    groupRef.current.position.y = damp(groupRef.current.position.y, baseY + breathe, 3.0, dt);

    if (keyLightRef.current) {
      // Keep front light subtle; rims define the silhouette.
      const target = THREE.MathUtils.lerp(0.0, 0.28, litT);
      keyLightRef.current.intensity = damp(keyLightRef.current.intensity, target, 3.0, dt);
    }

    if (fillLightRef.current) {
      const target = THREE.MathUtils.lerp(0.0, 0.18, litT);
      fillLightRef.current.intensity = damp(fillLightRef.current.intensity, target, 3.0, dt);
    }

    if (rimLightRef.current) {
      // Main rim disabled (two side rims carry the look).
      const target = 0.0;
      rimLightRef.current.intensity = damp(rimLightRef.current.intensity, target, 2.6, dt);
    }

    if (rimLeftRef.current) {
      const target = THREE.MathUtils.lerp(0.0, 52.0, rimT); // Increased for "punchier" look
      rimLeftRef.current.intensity = damp(rimLeftRef.current.intensity, target, 2.6, dt);
    }
    if (rimRightRef.current) {
      const target = THREE.MathUtils.lerp(0.0, 52.0, rimT);
      rimRightRef.current.intensity = damp(rimRightRef.current.intensity, target, 2.6, dt);
    }

    if (envRef.current) {
      const target = THREE.MathUtils.lerp(0.08, 0.14, litT);
      envRef.current.environmentIntensity = target;
    }

    // Silhouette: force materials to black until 20%.
    const silhouette = p < 0.2;
    if (silhouetteStateRef.current !== silhouette) {
      silhouetteStateRef.current = silhouette;
      silhouetteMaterials.forEach((mat) => {
        const original = mat.userData.__casaOriginalColor;
        if (!original) return;
        if (silhouette) mat.color.set('#000000');
        else mat.color.copy(original);
      });
    }

    // Notify parent once the sofa is essentially in its final pose.
    if (!arrivedFiredRef.current && p >= 0.94) {
      arrivedFiredRef.current = true;
      onArrived?.();
    }
  });

  return (
    <group>
      <InitRectAreaLights />
      <ambientLight intensity={0.05} />
      <spotLight
        ref={keyLightRef}
        intensity={0.0}
        position={[-2.8, 1.9, 4.6]}
        color="#fff0df"
        angle={0.55}
        penumbra={0.85}
        distance={15}
      />
      <directionalLight ref={fillLightRef} intensity={0.0} position={[-3.4, 1.4, 1.8]} color="#d6f0ff" />

      {/* Golden Glow — main rim (RectAreaLight) */}
      <rectAreaLight
        ref={rimLightRef}
        position={[0.0, 1.35, -4.2]}
        rotation={[0, Math.PI, 0]}
        width={3.6}
        height={2.2}
        intensity={0.0}
        color={GOLD_RIM}
      />

      <rectAreaLight
        ref={rimLeftRef}
        position={[-2.9, 1.1, -4.1]}
        rotation={[0, Math.PI * 0.78, 0]}
        width={1.8}
        height={1.2}
        intensity={0.0}
        color={GOLD_RIM}
      />
      <rectAreaLight
        ref={rimRightRef}
        position={[2.9, 1.1, -4.1]}
        rotation={[0, -Math.PI * 0.78, 0]}
        width={1.8}
        height={1.2}
        intensity={0.0}
        color={GOLD_RIM}
      />

      <pointLight position={[0, -2, 2]} intensity={0.5} color={GOLD_RIM} decay={2} distance={8} />

      <Environment ref={envRef} preset="studio" environmentIntensity={0.0} />

      <group
        ref={groupRef}
        position={[0, -0.35, -10]}
        rotation={[0, Math.PI / 4, 0]}
      >
        <primitive object={scene} />
      </group>

      <ContactShadows opacity={0.4} scale={10} blur={3.8} far={20} position={[0, -0.95, 0]} />
    </group>
  );
}

const Preloader = ({ setAppLoaded, onReady, onExited }) => {
  const { progress: assetProgress } = useProgress();
  const [progress, setProgress] = useState(0);
  const [showEnter, setShowEnter] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [sofaArrived, setSofaArrived] = useState(false);
  const assetProgressRef = useRef(assetProgress);
  const hasRealProgressRef = useRef(false);
  const readyFiredRef = useRef(false);
  const parallaxRef = useRef({ x: 0, y: 0 });
  const rigRef = useRef({ group: null, rimMain: null, rimLeft: null, rimRight: null, baseScale: 1 });

  useEffect(() => {
    assetProgressRef.current = assetProgress;
    if (assetProgress > 0) hasRealProgressRef.current = true;
  }, [assetProgress]);

  // Smoothed loading progress (kickstarts even before real assets report progress).
  useEffect(() => {
    let raf;
    let current = 0;
    const start = performance.now();
    let last = start;

    const tick = (now) => {
      const real = assetProgressRef.current || 0;
      if (real >= 100) {
        setProgress(100);
        return;
      }

      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;

      // Kickoff: show some movement even while the first assets haven't reported progress yet.
      const kickoff = Math.min(12, ((now - start) / 650) * 12);
      const target = hasRealProgressRef.current ? Math.min(99.5, real) : kickoff;

      // Smoothly approach the target (time-based so it feels consistent across FPS).
      const alpha = 1 - Math.exp(-10.5 * dt);
      const desired = current + (target - current) * alpha;
      // Clamp rate so it never "jumps" when real progress updates in chunks.
      const maxUpPerSec = hasRealProgressRef.current ? 55 : 22;
      const maxStep = maxUpPerSec * dt;
      current = Math.min(desired, current + maxStep);

      setProgress(Math.max(0, Math.min(99.5, current)));
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Show "Proceed Now" only after real assets are loaded and the sofa has arrived.
  useEffect(() => {
    if (showEnter) return undefined;
    if (isExiting) return undefined;
    if (assetProgress < 100) return undefined;
    if (!sofaArrived) return undefined;

    const timer = setTimeout(() => setShowEnter(true), 350);
    return () => clearTimeout(timer);
  }, [assetProgress, isExiting, showEnter, sofaArrived]);

  const progress01 = useMemo(() => Math.min(1, Math.max(0, progress / 100)), [progress]);
  const logoOpacity = useMemo(() => 0.06 + progress01 * 0.94, [progress01]);
  const logoScale = useMemo(() => 1.05 - progress01 * 0.05, [progress01]);
  const logoBlur = useMemo(() => `${Math.round((1 - progress01) * 10)}px`, [progress01]);

  const loadingVariants = useMemo(() => ({
    initial: { opacity: 1, y: 0 },
    animate: { opacity: 1, y: 0 },
    exit: {
      y: '-100%',
      transition: { duration: 0.35, ease: 'easeInOut' }
    }
  }), []);

  const handleEnter = useCallback(() => {
    if (!showEnter) return;
    if (isExiting) return;
    setIsExiting(true);

    // Enter should feel instant: mark app ready immediately, then let the preloader exit animate.
    if (!readyFiredRef.current) {
      readyFiredRef.current = true;
      onReady?.();
      if (setAppLoaded) setAppLoaded(true);
    }

    window.setTimeout(() => setIsVisible(false), 420);
  }, [isExiting, onReady, setAppLoaded, showEnter]);

  useEffect(() => {
    if (!showEnter || isExiting) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleEnter();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleEnter, isExiting, showEnter]);

  useEffect(() => {
    const update = (x, y) => {
      parallaxRef.current = { x: THREE.MathUtils.clamp(x, -1, 1), y: THREE.MathUtils.clamp(y, -1, 1) };
    };

    const onMouseMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      update(nx, ny);
    };

    const onTouchMove = (e) => {
      const t = e.touches?.[0];
      if (!t) return;
      const nx = (t.clientX / window.innerWidth) * 2 - 1;
      const ny = (t.clientY / window.innerHeight) * 2 - 1;
      update(nx, ny);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  return (
    <AnimatePresence onExitComplete={() => {
      onExited?.();
    }}>
      {isVisible && (
        <motion.div
          className="casa-preloader fixed inset-0 z-[10000] flex flex-col items-center justify-center overflow-hidden select-none"
          style={{ 
            pointerEvents: isExiting ? 'none' : 'auto', 
            position: 'fixed',
            backgroundColor: '#000'
          }}
          variants={loadingVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Studio noir base (warm center, deep corners) */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0.03) 0%, rgba(0,0,0,1) 70%)'
            }}
          />

          {/* Grain texture (slow drift) */}
          <motion.div
            className="absolute inset-0 pointer-events-none z-[6]"
            style={{
              backgroundImage:
                `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.045'/%3E%3C/svg%3E")`,
              opacity: 0.022,
              mixBlendMode: 'overlay'
            }}
            animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
            transition={{ duration: 18, ease: 'linear', repeat: Infinity, repeatType: 'mirror' }}
          />

          {/* Subtle vignette */}
          <div
            className="absolute inset-0 pointer-events-none z-[6]"
            style={{
              background: 'radial-gradient(1000px 720px at 50% 45%, transparent 42%, rgba(0,0,0,0.65) 100%)'
            }}
          />

          {/* Corner marks — editorial grid */}
          {[
            'top-6 left-6',
            'top-6 right-6',
            'bottom-6 left-6',
            'bottom-6 right-6'
          ].map((pos) => (
            <div key={pos} className={`absolute ${pos} w-8 h-8 pointer-events-none z-10 opacity-40`}>
              <div className="absolute top-0 left-0 w-full h-[1px]" style={{ background: 'linear-gradient(90deg, rgba(245,245,247,0.5), transparent)' }} />
              <div className="absolute top-0 left-0 h-full w-[1px]" style={{ background: 'linear-gradient(180deg, rgba(245,245,247,0.5), transparent)' }} />
            </div>
          ))}

          {/* Additional decorative grid lines to fill whitespace */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-[2]">
            <div className="absolute top-1/4 left-0 right-0 h-[1px] bg-white" />
            <div className="absolute top-3/4 left-0 right-0 h-[1px] bg-white" />
            <div className="absolute left-1/4 top-0 bottom-0 w-[1px] bg-white" />
            <div className="absolute left-3/4 top-0 bottom-0 w-[1px] bg-white" />
          </div>

          {/* Logo + slogan (Atelier lockup) */}
          <div className="casa-preloader-lockup absolute left-1/2 -translate-x-1/2 z-10 flex flex-col items-center justify-center">
            <motion.div
              className="text-center uppercase casa-logo-shimmer"
              initial={{ opacity: 0, letterSpacing: '0.5em' }}
              animate={
                isExiting
                  ? { opacity: 0 }
                  : { opacity: 1, letterSpacing: '1.45em' }
              }
              transition={isExiting ? { duration: 0.35, ease: 'easeOut' } : { duration: 2, ease: 'easeOut' }}
              style={{
                scale: logoScale,
                filter: `blur(${logoBlur})`,
                fontFamily: '"Bodoni Moda","Didot","Bodoni MT","Playfair Display",serif',
                fontWeight: 400,
                fontSize: 'clamp(1.6rem, 4.4vw, 3.2rem)',
                transformOrigin: '50% 50%',
                textShadow: '0 18px 80px rgba(0,0,0,0.45)'
              }}
            >
              CASA DESIGN
            </motion.div>
            <motion.div
              className="text-center uppercase"
              initial={{ opacity: 0, y: 3 }}
              animate={isExiting ? { opacity: 0, y: -2 } : { opacity: 1, y: 0 }}
              transition={isExiting ? { duration: 0.3, ease: 'easeOut' } : { duration: 1.1, delay: 0.2, ease: 'easeOut' }}
              style={{
                marginTop: '16px',
                color: 'rgba(245,245,247,0.44)',
                fontFamily: '"Inter",sans-serif',
                letterSpacing: '0.9em',
                fontSize: '11px',
                textShadow: '0 12px 48px rgba(0,0,0,0.75)'
              }}
            >
              ARCHITECTURAL INTELLIGENCE
            </motion.div>
          </div>

          {/* Proceed button */}
          <AnimatePresence>
            {showEnter && !isExiting && (
              <motion.button
                type="button"
                className="casa-preloader-hint absolute left-1/2 z-20"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                onClick={handleEnter}
              >
                <motion.span
                  className="casa-preloader-hint__text uppercase"
                  animate={{ opacity: [0.55, 1, 0.55], y: [0, -2, 0] }}
                  transition={{ duration: 2.2, ease: 'easeInOut', repeat: Infinity }}
                >
                  Proceed Now
                </motion.span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Sofa decorative glow layer */}
          <div className="casa-preloader-sofa-glow" />

          {/* 3D sofa canvas (centered) */}
          <div className="absolute inset-0 z-[5] pointer-events-none">
            <Canvas
              style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
              dpr={[1, 1.5]}
              camera={{ position: [0, 0.25, 5], fov: 35, near: 0.01, far: 60 }}
              gl={{ antialias: true, alpha: true, premultipliedAlpha: false, powerPreference: 'high-performance' }}
              onCreated={({ gl }) => {
                gl.setClearColor(0x000000, 0);
                gl.toneMapping = THREE.ACESFilmicToneMapping;
                gl.toneMappingExposure = 0.95;
              }}
            >
              <Suspense fallback={null}>
                <ExposureDriver progress01={progress01} />
                <CinematicZoomRoute
                  isExiting={isExiting}
                  rigRef={rigRef}
                  onBlackout={() => {
                    if (readyFiredRef.current) return;
                    readyFiredRef.current = true;
                    onReady?.();
                    if (setAppLoaded) setAppLoaded(true);
                  }}
                />
                <SofaLoaderScene
                  progress01={progress01}
                  isExiting={isExiting}
                  parallaxRef={parallaxRef}
                  rigRef={rigRef}
                  onArrived={() => setSofaArrived(true)}
                />
                <SofaPostFX enabled />
              </Suspense>
            </Canvas>
          </div>

          {/* Minimalist dash replaces loading text + bottom progress line */}
          {!showEnter && !isExiting && (
            <div
              className="absolute left-1/2 -translate-x-1/2 bottom-8 z-30 w-[min(560px,88vw)]"
              role="progressbar"
              aria-label="Loading"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
            >
              <div
                className="flex items-center justify-between"
                style={{
                  fontFamily: '"Inter",sans-serif',
                  letterSpacing: '0.42em',
                  fontSize: '10px',
                  color: 'rgba(245,245,247,0.62)',
                  textShadow: '0 14px 50px rgba(0,0,0,0.85)'
                }}
              >
                <span className="uppercase">Loading</span>
                <span className="uppercase tabular-nums">{Math.round(progress)}%</span>
              </div>
              <div className="mt-3 h-[2px] w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.10)' }}>
                <div
                  className="h-full"
                  style={{
                    width: `${progress}%`,
                    background: 'rgba(245,245,247,0.78)',
                    boxShadow: '0 0 18px rgba(245,245,247,0.22)',
                    transition: 'width 120ms linear'
                  }}
                />
              </div>
            </div>
          )}

          {/* Lens-blur fade on enter */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={false}
            animate={isExiting ? { opacity: 1, backdropFilter: 'blur(14px)' } : { opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
            style={{ background: 'rgba(0,0,0,0.35)' }}
          />
          </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;

useGLTF.preload('/sofa.glb');
