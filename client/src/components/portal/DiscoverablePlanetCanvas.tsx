import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface DiscoverablePlanetCanvasProps {
  scrollProgress?: number;
}

/**
 * Procedural WebGL Discoverable Planet ("Un Nuevo Mundo")
 * Renders a luminous spherical planet in Teacher Ivan's palette:
 * - #1A3153 Deep Navy oceans + #2E527D/#A7C7E7 uncharted landmasses
 * - Drifting translucent #FAFAFA cloud bands
 * - #E09B30 Warm Amber + #A7C7E7 Fresnel atmospheric limb glow (Dawn of Discovery)
 * - 2 fine architectural orbital rings with gliding #E09B30 beacon points
 */
export const DiscoverablePlanetCanvas: React.FC<DiscoverablePlanetCanvasProps> = ({
  scrollProgress = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<number>(scrollProgress);
  progressRef.current = scrollProgress;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === 'undefined') return;

    const prefersReduced =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || window.innerWidth < 768) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / Math.max(1, height), 0.1, 100);
    camera.position.set(0, 0.25, 6.2);

    // 1. Procedural Surface Texture (#1A3153 oceans + #2E527D/#A7C7E7 uncharted continents)
    const surfCanvas = document.createElement('canvas');
    surfCanvas.width = 1024;
    surfCanvas.height = 512;
    const sctx = surfCanvas.getContext('2d');
    if (sctx) {
      const oceanGrad = sctx.createLinearGradient(0, 0, 0, 512);
      oceanGrad.addColorStop(0, '#0D1B33');
      oceanGrad.addColorStop(0.5, '#1A3153');
      oceanGrad.addColorStop(1, '#0A1529');
      sctx.fillStyle = oceanGrad;
      sctx.fillRect(0, 0, 1024, 512);

      // Uncharted organic landmass clusters
      const continents = [
        [210, 180, 130, 62, '#2E527D', 0.82],
        [255, 200, 74, 34, '#A7C7E7', 0.34],
        [520, 235, 168, 78, '#284A73', 0.85],
        [565, 220, 96, 40, '#A7C7E7', 0.38],
        [820, 195, 128, 56, '#2E527D', 0.80],
        [845, 260, 78, 36, '#A7C7E7', 0.28],
        [375, 325, 118, 46, '#244269', 0.78],
        [680, 340, 104, 42, '#2E527D', 0.72],
        [110, 285, 86, 40, '#2B4C74', 0.75],
      ] as const;

      for (const [cx, cy, rx, ry, color, alpha] of continents) {
        sctx.save();
        sctx.globalAlpha = alpha;
        sctx.fillStyle = color;
        sctx.beginPath();
        sctx.ellipse(cx, cy, rx, ry, 0.25, 0, Math.PI * 2);
        sctx.fill();
        sctx.restore();
      }

      // Subtle warm golden dawn coastal highlights
      sctx.globalAlpha = 0.18;
      sctx.fillStyle = '#E09B30';
      sctx.beginPath();
      sctx.ellipse(540, 210, 110, 26, -0.15, 0, Math.PI * 2);
      sctx.fill();
      sctx.beginPath();
      sctx.ellipse(235, 175, 80, 22, 0.2, 0, Math.PI * 2);
      sctx.fill();
    }

    const surfaceTex = new THREE.CanvasTexture(surfCanvas);
    surfaceTex.wrapS = THREE.RepeatWrapping;
    surfaceTex.colorSpace = THREE.SRGBColorSpace;

    // 2. Procedural Translucent Cloud Band Texture
    const cloudCanvas = document.createElement('canvas');
    cloudCanvas.width = 1024;
    cloudCanvas.height = 512;
    const cctx = cloudCanvas.getContext('2d');
    if (cctx) {
      cctx.clearRect(0, 0, 1024, 512);
      for (let i = 0; i < 42; i++) {
        const cx = (i * 197) % 1024;
        const cy = 60 + ((i * 83) % 392);
        const rw = 65 + (i % 5) * 34;
        const rh = 10 + (i % 4) * 7;
        const g = cctx.createRadialGradient(cx, cy, 2, cx, cy, rw);
        g.addColorStop(0, 'rgba(250, 250, 250, 0.36)');
        g.addColorStop(0.6, 'rgba(167, 199, 231, 0.16)');
        g.addColorStop(1, 'rgba(167, 199, 231, 0)');
        cctx.fillStyle = g;
        cctx.beginPath();
        cctx.ellipse(cx, cy, rw, rh, 0, 0, Math.PI * 2);
        cctx.fill();
      }
    }
    const cloudTex = new THREE.CanvasTexture(cloudCanvas);
    cloudTex.wrapS = THREE.RepeatWrapping;

    // Planet Group positioned cleanly in center-lower horizon so it glows right through the doorway!
    const planetGroup = new THREE.Group();
    planetGroup.position.set(0.18, -0.58, 0);
    scene.add(planetGroup);

    const sphereGeo = new THREE.SphereGeometry(1.72, 64, 48);
    const sphereMat = new THREE.MeshStandardMaterial({
      map: surfaceTex,
      roughness: 0.72,
      metalness: 0.12,
    });
    const planetMesh = new THREE.Mesh(sphereGeo, sphereMat);
    planetGroup.add(planetMesh);

    // Translucent Cloud Layer
    const cloudGeo = new THREE.SphereGeometry(1.755, 48, 36);
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTex,
      transparent: true,
      opacity: 0.78,
      depthWrite: false,
      roughness: 0.9,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    planetGroup.add(cloudMesh);

    // Custom GLSL Fresnel Atmospheric Limb Glow (#E09B30 Warm Amber + #A7C7E7 Soft Denim)
    const atmoGeo = new THREE.SphereGeometry(1.86, 48, 36);
    const atmoMat = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uSunDir: { value: new THREE.Vector3(0.72, 0.52, 0.45).normalize() },
        uAmber: { value: new THREE.Color('#E09B30') },
        uDenim: { value: new THREE.Color('#A7C7E7') },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uSunDir;
        uniform vec3 uAmber;
        uniform vec3 uDenim;
        varying vec3 vNormal;
        varying vec3 vWorldNormal;
        void main() {
          float rim = pow(clamp(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 2.4);
          float sunSide = clamp(dot(vWorldNormal, uSunDir) * 0.65 + 0.55, 0.0, 1.0);
          vec3 col = mix(uDenim, uAmber, pow(sunSide, 1.4));
          gl_FragColor = vec4(col, rim * (0.42 + sunSide * 0.65));
        }
      `,
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    planetGroup.add(atmoMesh);

    // 2 Fine Architectural Orbital Rings + Slow-Gliding #E09B30 Beacon Points
    const ring1Geo = new THREE.RingGeometry(2.18, 2.198, 96);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xa7c7e7,
      transparent: true,
      opacity: 0.32,
      side: THREE.DoubleSide,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ringMat);
    ring1.rotation.set(Math.PI * 0.43, -0.22, 0.18);
    planetGroup.add(ring1);

    const ring2Geo = new THREE.RingGeometry(2.52, 2.536, 96);
    const ring2 = new THREE.Mesh(ring2Geo, ringMat.clone());
    (ring2.material as THREE.MeshBasicMaterial).opacity = 0.22;
    ring2.rotation.set(Math.PI * 0.39, 0.28, -0.22);
    planetGroup.add(ring2);

    const beaconGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xe09b30 });
    const beacon1 = new THREE.Mesh(beaconGeo, beaconMat);
    const beacon2 = new THREE.Mesh(beaconGeo, beaconMat);
    ring1.add(beacon1);
    ring2.add(beacon2);

    // Dramatic Dawn Key Light + Soft Denim Rim Fill
    const sunLight = new THREE.DirectionalLight(0xffcf82, 2.3);
    sunLight.position.set(5.5, 3.8, 3.6);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0xa7c7e7, 0.95);
    rimLight.position.set(-4.5, 2.0, -2.5);
    scene.add(rimLight);

    const ambient = new THREE.AmbientLight(0x1a3153, 0.85);
    scene.add(ambient);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    let rafId = 0;
    const startTime = performance.now();

    const animate = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      const sp = progressRef.current;

      planetMesh.rotation.y = elapsed * 0.055;
      cloudMesh.rotation.y = elapsed * 0.082;

      // Glide golden discovery beacons smoothly along orbital rings
      const a1 = elapsed * 0.32;
      beacon1.position.set(Math.cos(a1) * 2.19, Math.sin(a1) * 2.19, 0);
      const a2 = -elapsed * 0.24 + 1.8;
      beacon2.position.set(Math.cos(a2) * 2.53, Math.sin(a2) * 2.53, 0);

      // Gentle camera elevation & push-in as user steps through doorway
      camera.position.z = 6.2 - sp * 0.95;
      camera.position.y = 0.25 - sp * 0.28;
      camera.lookAt(0.14, -0.32, 0);

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      sphereGeo.dispose();
      sphereMat.dispose();
      cloudGeo.dispose();
      cloudMat.dispose();
      atmoGeo.dispose();
      atmoMat.dispose();
      ring1Geo.dispose();
      ring2Geo.dispose();
      ringMat.dispose();
      beaconGeo.dispose();
      beaconMat.dispose();
      surfaceTex.dispose();
      cloudTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      data-testid="discoverable-planet-webgl"
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
};

export default DiscoverablePlanetCanvas;
