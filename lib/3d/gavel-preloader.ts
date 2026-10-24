import * as THREE from "three";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";

export interface GavelModularGeometries {
  headGeo: THREE.BufferGeometry;
  bandGeo: THREE.BufferGeometry;
  handleGeo: THREE.BufferGeometry;
  blockGeo: THREE.BufferGeometry;
}

let cachedGeometries: GavelModularGeometries | null = null;
let preloadPromise: Promise<GavelModularGeometries> | null = null;

function loadAndProcessSTL(loader: STLLoader, url: string): Promise<THREE.BufferGeometry> {
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (geometry) => {
        try {
          // Apply creased normals to preserve crisp mechanical edges while smoothing curved surfaces
          const creased = BufferGeometryUtils.toCreasedNormals(geometry, Math.PI / 4);
          creased.computeVertexNormals();
          resolve(creased);
        } catch (err) {
          console.warn(`[gavel-preloader] toCreasedNormals fallback for ${url}:`, err);
          geometry.computeVertexNormals();
          resolve(geometry);
        }
      },
      undefined,
      (err) => reject(new Error(`Failed to load STL asset at ${url}: ${err}`))
    );
  });
}

/**
 * Preload all 4 modular STL geometries in parallel with memory caching.
 * Reuses already-processed geometries across renders and scenes.
 */
export function preloadGavelGeometries(): Promise<GavelModularGeometries> {
  if (cachedGeometries) {
    return Promise.resolve(cachedGeometries);
  }

  if (preloadPromise) {
    return preloadPromise;
  }

  if (typeof window === "undefined") {
    return Promise.reject(new Error("STL preloading only runs in the browser"));
  }

  const loader = new STLLoader();

  preloadPromise = Promise.all([
    loadAndProcessSTL(loader, "/stl_assets/modular/part_gavel_head.stl"),
    loadAndProcessSTL(loader, "/stl_assets/modular/part_brass_band.stl"),
    loadAndProcessSTL(loader, "/stl_assets/modular/part_gavel_handle.stl"),
    loadAndProcessSTL(loader, "/stl_assets/modular/part_sound_block.stl"),
  ])
    .then(([headGeo, bandGeo, handleGeo, blockGeo]) => {
      cachedGeometries = { headGeo, bandGeo, handleGeo, blockGeo };
      return cachedGeometries;
    })
    .catch((err) => {
      preloadPromise = null; // Allow retry on failure
      throw err;
    });

  return preloadPromise;
}

export function getCachedGavelGeometries(): GavelModularGeometries | null {
  return cachedGeometries;
}

export function isGavelGeometriesCached(): boolean {
  return cachedGeometries !== null;
}
