"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { AnimatedGavel } from "./animated-gavel";

export interface AnimatedGavel3DProps {
  /**
   * Width of the 3D viewport canvas in pixels (default: 280)
   */
  width?: number;
  /**
   * Height of the 3D viewport canvas in pixels (default: 210)
   */
  height?: number;
  /**
   * Optional custom CSS class name
   */
  className?: string;
  /**
   * Accessible description for screen readers
   */
  ariaLabel?: string;
  /**
   * Optional callback when all 4 STL parts have loaded and initialized
   */
  onLoaded?: () => void;
  /**
   * Optional callback if loading fails and fallback is engaged
   */
  onError?: (err: Error) => void;
}

/**
 * AnimatedGavel3D — Real-time Three.js 3D Gavel Loading Experience
 *
 * Loads the 4 high-precision spline-sculpted STL assets from /stl_assets/modular/:
 *  1. part_gavel_head.stl  (Sculpted ceremonial head, longitudinal along Y)
 *  2. part_brass_band.stl  (Center collar + trim rings + perpendicular ferrule socket along -X)
 *  3. part_gavel_handle.stl (Turned baluster handle extending along -X)
 *  4. part_sound_block.stl (Multi-tiered sounding block with top striking plateau)
 *
 * Applies BufferGeometryUtils.toCreasedNormals(geo, Math.PI / 4) to eliminate dark bands
 * and artifacts, preserves sharp striking caps and bevels, and maintains exact contact
 * alignment with zero penetration or gaps.
 */
export function AnimatedGavel3D({
  width = 280,
  height = 210,
  className = "",
  ariaLabel = "3D Judge's gavel striking the bench in deliberate judicial motion",
  onLoaded,
  onError,
}: AnimatedGavel3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL availability
    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch (e) {
      console.warn("[AnimatedGavel3D] WebGL not supported, falling back to vector SVG", e);
      setHasError(true);
      onError?.(e instanceof Error ? e : new Error(String(e)));
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // Scene
    const scene = new THREE.Scene();

    // Perspective Camera: cinematic angle looking toward the striking point with generous framing
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(2.8, 2.4, 9.4);
    const cameraTarget = new THREE.Vector3(-1.3, -0.65, 0);
    camera.lookAt(cameraTarget);

    // Lighting Setup: Multi-directional studio dome and directional rim highlights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xd5e5d9, 0.75);
    scene.add(hemiLight);

    // Key Light (warm studio spotlight from top-right-front)
    const keyLight = new THREE.DirectionalLight(0xfffbf2, 2.2);
    keyLight.position.set(4.5, 7.0, 5.0);
    scene.add(keyLight);

    // Fill Light (soft cool mint bounce from left)
    const fillLight = new THREE.DirectionalLight(0xe8f2ec, 1.2);
    fillLight.position.set(-5.0, 3.5, 2.0);
    scene.add(fillLight);

    // Back / Rim Light (crisp specular highlights on wooden contours and brass rings)
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.6);
    rimLight.position.set(1.0, 4.0, -5.0);
    scene.add(rimLight);

    // Soft Radial Gradient Contact Shadow under Sound Block
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext("2d");
    if (sCtx) {
      const grad = sCtx.createRadialGradient(64, 64, 6, 64, 64, 62);
      grad.addColorStop(0, "rgba(23, 69, 48, 0.35)");
      grad.addColorStop(0.35, "rgba(23, 69, 48, 0.18)");
      grad.addColorStop(0.7, "rgba(23, 69, 48, 0.06)");
      grad.addColorStop(1, "rgba(23, 69, 48, 0)");
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(6.0, 6.0);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, -2.03, 0);
    scene.add(shadowMesh);

    // Materials
    // 1. Rich Forest-Green Lacquered Wood for Gavel Head & Handle
    const woodMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f543d,
      roughness: 0.34,
      metalness: 0.04,
    });

    // 2. Refined Polished Brass for Bands, Rings, and Ferrule Socket
    const brassMaterial = new THREE.MeshStandardMaterial({
      color: 0xd8b26e,
      roughness: 0.18,
      metalness: 0.90,
    });

    // 3. Deep Ceremonial Sound Block Material (Dark Forest Ebony)
    const blockMaterial = new THREE.MeshStandardMaterial({
      color: 0x17402e,
      roughness: 0.36,
      metalness: 0.08,
    });

    // 4. Concentric Shockwave Ring for Impact Visuals
    const shockwaveGeo = new THREE.TorusGeometry(2.1, 0.05, 16, 64);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const shockwaveMesh = new THREE.Mesh(shockwaveGeo, shockwaveMat);
    shockwaveMesh.rotation.x = Math.PI / 2;
    shockwaveMesh.position.set(0, -1.3, 0);
    scene.add(shockwaveMesh);

    // Groups
    // Pivot group: anchored at the handle grip (X = -4.4, Y = +0.16)
    const pivotGroup = new THREE.Group();
    pivotGroup.position.set(-4.4, 0.16, 0);
    scene.add(pivotGroup);

    // Gavel group: holds the assembled modular parts offset so rotation pivots around wrist
    const gavelMeshGroup = new THREE.Group();
    gavelMeshGroup.position.set(4.4, -0.16, 0);
    pivotGroup.add(gavelMeshGroup);

    let soundBlockMesh: THREE.Mesh | null = null;
    let animFrameId: number;
    let isDisposed = false;

    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // STL Loader with creased normals processing
    const loader = new STLLoader();

    function loadAndProcessSTL(url: string): Promise<THREE.BufferGeometry> {
      return new Promise((resolve, reject) => {
        loader.load(
          url,
          (geometry) => {
            try {
              // Apply BufferGeometryUtils.toCreasedNormals(geo, Math.PI / 4)
              // This keeps hard edges (creases > 45 deg) crisp while smoothly shading curved surfaces
              const creased = BufferGeometryUtils.toCreasedNormals(geometry, Math.PI / 4);
              creased.computeVertexNormals();
              resolve(creased);
            } catch (err) {
              console.warn(`[AnimatedGavel3D] Creased normals fallback for ${url}:`, err);
              geometry.computeVertexNormals();
              resolve(geometry);
            }
          },
          undefined,
          reject
        );
      });
    }

    Promise.all([
      loadAndProcessSTL("/stl_assets/modular/part_gavel_head.stl"),
      loadAndProcessSTL("/stl_assets/modular/part_brass_band.stl"),
      loadAndProcessSTL("/stl_assets/modular/part_gavel_handle.stl"),
      loadAndProcessSTL("/stl_assets/modular/part_sound_block.stl"),
    ])
      .then(([headGeo, bandGeo, handleGeo, blockGeo]) => {
        if (isDisposed) return;

        // 1. Head Mesh
        const headMesh = new THREE.Mesh(headGeo, woodMaterial);
        gavelMeshGroup.add(headMesh);

        // 2. Brass Band Mesh (center waist + trim rings + ferrule)
        const bandMesh = new THREE.Mesh(bandGeo, brassMaterial);
        gavelMeshGroup.add(bandMesh);

        // 3. Handle Mesh (plugs into -X ferrule socket)
        const handleMesh = new THREE.Mesh(handleGeo, woodMaterial);
        gavelMeshGroup.add(handleMesh);

        // 4. Sound Block Mesh (grounded at Y = -1.50)
        // Top anvil plateau center is at Y = 0.20 - 1.50 = -1.300
        // Head lower striking face is at Y = -1.46 + 0.16 = -1.300
        // Result: Exact mathematical contact at angle 0!
        soundBlockMesh = new THREE.Mesh(blockGeo, blockMaterial);
        soundBlockMesh.position.set(0, -1.5, 0);
        scene.add(soundBlockMesh);

        setIsLoaded(true);
        onLoaded?.();

        // Animation Loop: 1,120ms complete judicial strike cycle
        const CYCLE_DURATION_MS = 1120;
        const startTime = performance.now();

        const renderLoop = (now: number) => {
          if (isDisposed || !renderer) return;

          if (!prefersReducedMotion) {
            const elapsed = (now - startTime) % CYCLE_DURATION_MS;
            const progress = elapsed / CYCLE_DURATION_MS;

            let angleRad = 0;
            let shockwaveScale = 0.2;
            let shockwaveOpacity = 0.0;

            if (progress < 0.12) {
              // 0% - 12%: Ready hold at resting contact
              angleRad = 0;
            } else if (progress < 0.40) {
              // 12% - 40%: Backswing anticipation lift up to 34 degrees (0.593 rad)
              const t = (progress - 0.12) / 0.28;
              const ease = 0.5 - 0.5 * Math.cos(Math.PI * t);
              angleRad = ease * 0.593;
            } else if (progress < 0.53) {
              // 40% - 53%: Decisive accelerated strike
              const t = (progress - 0.40) / 0.13;
              const gravityEase = t * t * t;
              angleRad = (1 - gravityEase) * 0.593;
            } else if (progress < 0.58) {
              // 53% - 58%: Impact & subtle recoil bounce (3.5 deg = 0.061 rad)
              const t = (progress - 0.53) / 0.05;
              const recoil = Math.sin(Math.PI * t) * 0.061;
              angleRad = recoil;

              // Expanding shockwave ring
              shockwaveScale = 0.3 + t * 1.5;
              shockwaveOpacity = (1 - t) * 0.85;
            } else if (progress < 0.65) {
              // 58% - 65%: Settle to rest
              const t = (progress - 0.58) / 0.07;
              angleRad = (1 - t) * 0.01;
            } else {
              // 65% - 100%: Dignified rest hold on the sound block
              angleRad = 0;
            }

            pivotGroup.rotation.z = angleRad;

            // Sound block remains completely stationary and grounded
            if (soundBlockMesh) {
              soundBlockMesh.scale.set(1.0, 1.0, 1.0);
            }

            if (shockwaveMesh) {
              shockwaveMesh.scale.set(shockwaveScale, shockwaveScale, shockwaveScale);
              (shockwaveMesh.material as THREE.MeshBasicMaterial).opacity = shockwaveOpacity;
            }
          } else {
            // Reduced motion: static dignified rest pose
            pivotGroup.rotation.z = 0;
            if (soundBlockMesh) soundBlockMesh.scale.set(1, 1, 1);
          }

          renderer.render(scene, camera);
          animFrameId = requestAnimationFrame(renderLoop);
        };

        animFrameId = requestAnimationFrame(renderLoop);
      })
      .catch((err) => {
        console.error("[AnimatedGavel3D] Failed to load STL assets:", err);
        setHasError(true);
        onError?.(err);
      });

    // Cleanup on unmount
    return () => {
      isDisposed = true;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
      woodMaterial.dispose();
      brassMaterial.dispose();
      blockMaterial.dispose();
      shockwaveGeo.dispose();
      shockwaveMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      shadowTexture.dispose();
      scene.clear();
    };
  }, [width, height, onError]);

  // Graceful Fallback to High-Fidelity Vector SVG if WebGL fails or errors
  if (hasError) {
    return (
      <AnimatedGavel
        size={Math.round(width * 0.55)}
        showPedestal={true}
        ariaLabel={ariaLabel}
        className={className}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width, height }}
    >
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full flex items-center justify-center overflow-visible" />

      {/* Vector Fallback placeholder while STLs load */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300">
          <AnimatedGavel
            size={Math.round(width * 0.52)}
            showPedestal={true}
            ariaLabel={ariaLabel}
          />
        </div>
      )}
    </div>
  );
}
