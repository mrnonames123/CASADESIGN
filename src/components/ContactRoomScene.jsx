import React, { useMemo } from 'react';
import { useGLTF, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { sanitizeGltfMaterials } from '../utils/sanitizeGltfMaterials';
import { cloneGltfScene } from '../utils/cloneGltfScene';

const ContactRoomScene = ({ isVisible }) => {
  const { scene: gltfScene } = useGLTF('/sofa.glb');

  const scene = useMemo(() => {
    const cloned = cloneGltfScene(gltfScene);
    sanitizeGltfMaterials(cloned);
    return cloned;
  }, [gltfScene]);

  if (!isVisible) return null;

  return (
    <group visible={isVisible}>
      <Environment preset="apartment" />
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#f5e6e8" />

      {/* Static Sofa */}
      <primitive 
        object={scene} 
        scale={1.8} 
        position={[0, -0.6, 0]} 
        rotation={[0, -Math.PI * 0.2, 0]}
      />

      {/* MISSION: STATIC SILK CURTAINS (NO SHADER) */}
      <mesh position={[-2.5, 1, -1.5]} rotation={[0, 0.2, 0]}>
        <planeGeometry args={[2, 4]} />
        <meshBasicMaterial color="#f5e6e8" transparent={true} opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      <ContactShadows 
         position={[0, -0.62, 0]} 
         opacity={0.4} 
         scale={10} 
         blur={2.5} 
         far={1.5} 
         color="#d1b8c0" 
      />
    </group>
  );
};

export default ContactRoomScene;
