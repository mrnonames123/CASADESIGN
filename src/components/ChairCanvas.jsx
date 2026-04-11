import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, useAnimations, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { sanitizeGltfMaterials } from '../utils/sanitizeGltfMaterials';
import { cloneGltfScene } from '../utils/cloneGltfScene';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';

const PURE_WHITE = new THREE.Color('#ffffff');
const CHAIR_BASE_POSITION = new THREE.Vector3(4.1, -1.05, 0);
const CHAIR_BASE_SCALE = 2.55;
const CAMERA_POSITION = new THREE.Vector3(6.4, 0.5, 4.6);
const CAMERA_LOOK_AT = new THREE.Vector3(4.05, -0.3, 0);

const tintChairMaterials = (root) => {
  if (!root) return;
  root.traverse((node) => {
    if (!node?.isMesh) return;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    materials.forEach((mat) => {
      if (!mat) return;
      const isStandard = mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial;
      if (!isStandard) return;

      // Force a clean white chair (no gold tint).
      mat.color.copy(PURE_WHITE);
      mat.metalness = Math.min(0.55, mat.metalness ?? 0.45);
      mat.roughness = Math.min(0.38, mat.roughness ?? 0.34);

      mat.envMapIntensity = Math.max(mat.envMapIntensity ?? 1, 1.25);
      mat.needsUpdate = true;
    });
  });
};

function ChairPostFX({ enabled }) {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;

    const composer = new EffectComposer(gl);
    composer.addPass(new RenderPass(scene, camera));

    const ssao = new SSAOPass(scene, camera, size.width, size.height);
    ssao.kernelRadius = 10;
    ssao.minDistance = 0.002;
    ssao.maxDistance = 0.16;
    ssao.output = SSAOPass.OUTPUT.Default;
    composer.addPass(ssao);

    const bloom = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      0.55, // strength
      0.9, // radius
      0.92 // threshold (high -> only rim highlights bloom)
    );
    composer.addPass(bloom);

    const bokeh = new BokehPass(scene, camera, {
      focus: 4.2,
      aperture: 0.00016,
      maxblur: 0.006
    });
    composer.addPass(bokeh);

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

function ChairModel({ active }) {
  const groupRef = useRef(null);
  const parallaxRef = useRef({ x: 0, y: 0 });
  const { scene: gltfScene, animations } = useGLTF('/chair-v1.glb');

  const scene = useMemo(() => {
    const cloned = cloneGltfScene(gltfScene);
    sanitizeGltfMaterials(cloned);
    tintChairMaterials(cloned);
    return cloned;
  }, [gltfScene]);

  const { actions, mixer } = useAnimations(animations, groupRef);

  useEffect(() => {
    if (!active) return undefined;

    // "Materialize" assembly: glide parts in from different Z positions.
    const meshes = [];
    groupRef.current?.traverse((obj) => {
      if (!obj?.isMesh) return;
      meshes.push(obj);

      if (!obj.userData.__casaOrigPos) obj.userData.__casaOrigPos = obj.position.clone();
      if (!obj.userData.__casaOrigRot) obj.userData.__casaOrigRot = obj.rotation.clone();

      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((mat) => {
        if (!mat) return;
        mat.transparent = true;
        mat.opacity = 0;
        mat.needsUpdate = true;
      });
    });

    meshes.forEach((mesh, idx) => {
      const orig = mesh.userData.__casaOrigPos;
      const dir = idx % 2 === 0 ? 1 : -1;
      mesh.position.set(orig.x, orig.y, orig.z + dir * (0.9 + (idx % 5) * 0.18));
    });

    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    meshes.forEach((mesh, idx) => {
      const orig = mesh.userData.__casaOrigPos;
      tl.to(
        mesh.position,
        { x: orig.x, y: orig.y, z: orig.z, duration: 1.35 },
        0 + idx * 0.008
      );
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((mat) => {
        if (!mat) return;
        tl.to(mat, { opacity: 1, duration: 0.9 }, 0.15 + idx * 0.006);
      });
    });

    const list = Object.values(actions || {});
    list.forEach((action) => {
      if (!action) return;
      action.reset().fadeIn(0.35).play();
    });

    return () => {
      tl.kill();
      list.forEach((action) => {
        if (!action) return;
        action.fadeOut(0.2);
        action.stop();
      });
    };
  }, [active, actions]);

  useEffect(() => {
    if (!active) return undefined;

    const update = (nx, ny) => {
      parallaxRef.current = {
        x: THREE.MathUtils.clamp(nx, -1, 1),
        y: THREE.MathUtils.clamp(ny, -1, 1)
      };
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
  }, [active]);

  useFrame((state, delta) => {
    if (!active || !groupRef.current) return;

    // If the GLB has animations, keep them running.
    if (mixer) mixer.update(delta);

    // Mouse parallax: subtle yaw/pitch (max 15 degrees) for depth.
    const maxYaw = THREE.MathUtils.degToRad(15);
    const maxPitch = THREE.MathUtils.degToRad(6);
    const p = parallaxRef.current;
    const targetYaw = p.x * maxYaw;
    const targetPitch = -p.y * maxPitch;
    groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, 0.55 + targetYaw, 4.2, delta);
    groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetPitch, 4.2, delta);

    // Floating "ether" state.
    const t = state.clock.getElapsedTime();
    groupRef.current.position.y = CHAIR_BASE_POSITION.y + Math.sin(t * 0.75) * 0.04;
  });

  return (
    <group
      ref={groupRef}
      position={[CHAIR_BASE_POSITION.x, CHAIR_BASE_POSITION.y, CHAIR_BASE_POSITION.z]}
      rotation={[0, 0.55, 0]}
      scale={CHAIR_BASE_SCALE}
    >
      <primitive object={scene} />
    </group>
  );
}

const ChairCanvas = ({ active }) => {
  if (!active) return null;

  return (
    <Canvas
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
      }}
      frameloop="always"
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      dpr={[1, 1.5]}
      camera={{
        position: [CAMERA_POSITION.x, CAMERA_POSITION.y, CAMERA_POSITION.z],
        fov: 26,
        near: 0.01,
        far: 60
      }}
      onCreated={({ gl, camera }) => {
        gl.setClearColor(0x000000, 0);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.0;
        camera.lookAt(CAMERA_LOOK_AT.x, CAMERA_LOOK_AT.y, CAMERA_LOOK_AT.z);
        camera.updateProjectionMatrix();
      }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.16} />
        <directionalLight intensity={1.05} position={[4.5, 3.1, 5.8]} color="#fff2e5" />
        <directionalLight intensity={0.28} position={[-2.5, 1.1, 2.3]} color="#d6f0ff" />

        {/* Gold rim from behind (silhouette accent) */}
        <directionalLight intensity={4.2} position={[2.6, 1.2, -5.2]} color="#D4AF37" />

        <pointLight intensity={0.5} position={[6.8, 1.0, 2.4]} color="#ffffff" />
        <Environment preset="studio" environmentIntensity={0.2} />

        <ChairModel active={active} />

        {/* Soft grounding shadow */}
        <ContactShadows
          position={[CHAIR_BASE_POSITION.x, CHAIR_BASE_POSITION.y - 0.1, CHAIR_BASE_POSITION.z]}
          opacity={0.35}
          scale={8}
          blur={2.8}
          far={2.6}
          color="#0a0a0a"
        />

        <ChairPostFX enabled={active} />
      </Suspense>
    </Canvas>
  );
};

export default ChairCanvas;

useGLTF.preload('/chair-v1.glb');
