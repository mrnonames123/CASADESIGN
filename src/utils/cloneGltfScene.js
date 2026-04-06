import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';

// `useGLTF` caches scenes/materials globally. `scene.clone(true)` does NOT clone materials,
// so mutating/disposing materials in one place can break other renders.
// This helper deep-clones the hierarchy (safe for skinned meshes) AND clones materials per instance.
export const cloneGltfScene = (scene) => {
  const cloned = skeletonClone(scene);

  const materialClones = new Map();

  cloned.traverse((node) => {
    if (!node?.isMesh) return;
    if (!node.material) return;

    const materials = Array.isArray(node.material) ? node.material : [node.material];
    const next = materials.map((mat) => {
      if (!mat) return mat;
      if (materialClones.has(mat)) return materialClones.get(mat);
      const clonedMat = mat.clone();
      // Keep GLTF material names stable for debugging.
      clonedMat.name = mat.name;
      materialClones.set(mat, clonedMat);
      return clonedMat;
    });

    node.material = Array.isArray(node.material) ? next : next[0];
  });

  return cloned;
};
