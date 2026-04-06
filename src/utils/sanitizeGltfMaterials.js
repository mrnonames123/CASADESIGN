import * as THREE from 'three';

const toStandardMaterial = (material) => {
  const standard = new THREE.MeshStandardMaterial({
    name: material.name,
    color: material.color?.clone?.() ?? new THREE.Color(1, 1, 1),
    map: material.map ?? null,
    normalMap: material.normalMap ?? null,
    roughnessMap: material.roughnessMap ?? null,
    metalnessMap: material.metalnessMap ?? null,
    aoMap: material.aoMap ?? null,
    emissiveMap: material.emissiveMap ?? null,
    alphaMap: material.alphaMap ?? null,
    roughness: typeof material.roughness === 'number' ? material.roughness : 1,
    metalness: typeof material.metalness === 'number' ? material.metalness : 0,
    emissive: material.emissive?.clone?.() ?? new THREE.Color(0, 0, 0),
    emissiveIntensity: typeof material.emissiveIntensity === 'number' ? material.emissiveIntensity : 1,
    transparent: Boolean(material.transparent),
    opacity: typeof material.opacity === 'number' ? material.opacity : 1,
    side: material.side ?? THREE.FrontSide,
    alphaTest: typeof material.alphaTest === 'number' ? material.alphaTest : 0,
    depthWrite: material.depthWrite,
    depthTest: material.depthTest
  });

  if (material.normalScale && standard.normalScale) {
    standard.normalScale.copy(material.normalScale);
  }
  if (typeof material.aoMapIntensity === 'number') standard.aoMapIntensity = material.aoMapIntensity;
  if (typeof material.envMapIntensity === 'number') standard.envMapIntensity = material.envMapIntensity;

  standard.needsUpdate = true;
  return standard;
};

/**
 * Some devices/GPU drivers fail compiling complex MeshPhysicalMaterial shaders
 * (especially with many maps). This converts MeshPhysicalMaterial -> MeshStandardMaterial
 * while preserving the key texture maps and basic shading params.
 */
export const sanitizeGltfMaterials = (root) => {
  if (!root) return;

  root.traverse((node) => {
    if (!node.isMesh) return;
    if (!node.material) return;

    const hasUv = Boolean(node.geometry?.attributes?.uv);
    const hasUv2 = Boolean(node.geometry?.attributes?.uv2);

    // GLTF AO/light maps often expect `uv2`. If missing, shaders can fail to compile
    // (e.g. "Vertex shader is not compiled") on some drivers when `AOMAP_UV` maps to `uv2`.
    // Fallback: copy `uv` -> `uv2` when needed.
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    let changed = false;

    const next = materials.map((mat) => {
      if (!mat) return mat;
      if (mat.aoMap || mat.lightMap) {
        if (!hasUv2 && hasUv) {
          node.geometry.setAttribute('uv2', node.geometry.attributes.uv.clone());
        } else if (!hasUv2 && !hasUv) {
          // No valid UVs at all; drop AO/light maps to prevent shader attribute/define issues.
          if (mat.aoMap) {
            mat.aoMap = null;
            changed = true;
          }
          if (mat.lightMap) {
            mat.lightMap = null;
            changed = true;
          }
        }
      }

      if (!hasUv) {
        // If the mesh has no UVs, any UV-based maps can break compilation on some drivers.
        const uvMaps = [
          'map',
          'normalMap',
          'roughnessMap',
          'metalnessMap',
          'emissiveMap',
          'alphaMap'
        ];
        uvMaps.forEach((key) => {
          if (mat[key]) {
            mat[key] = null;
            changed = true;
          }
        });
      }

      if (mat.isMeshPhysicalMaterial) {
        changed = true;
        const replacement = toStandardMaterial(mat);
        return replacement;
      }
      return mat;
    });

    if (!changed) return;
    node.material = Array.isArray(node.material) ? next : next[0];
    if (Array.isArray(node.material)) node.material.forEach((mat) => mat && (mat.needsUpdate = true));
    else if (node.material) node.material.needsUpdate = true;
  });
};
