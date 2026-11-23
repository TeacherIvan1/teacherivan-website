import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createVoiceWaveformSlab } from './three/createVoiceWaveformSlab';

// Enforce strict 1 WebGL context budget across the entire application
let activeWebGLContextCount = 0;

export interface HeroVoiceSlab3DProps {
  className?: string;
}

export const HeroVoiceSlabStaticBars: React.FC = () => {
  const heights = [26, 42, 64, 52, 78, 92, 68, 86, 94, 72, 84, 60, 76, 48, 36, 24];
  return (
    <svg
      viewBox="0 0 240 88"
      className="w-full h-[88px] block"
      role="img"
      aria-label="16-bar Warm Amber acoustic voice waveform"
    >
      <rect x="2" y="4" width="236" height="80" rx="12" fill="#091326" stroke="#A7C7E7" strokeOpacity="0.32" strokeWidth="1" />
      {heights.map((h, i) => {
        const x = 18 + i * 13.2;
        const barH = (h / 100) * 58;
        const y = 44 - barH / 2;
        const isAmber = i % 3 !== 2;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width="7.5"
            height={barH}
            rx="3.5"
            fill={isAmber ? '#E09B30' : '#A7C7E7'}
            fillOpacity={isAmber ? '0.95' : '0.78'}
          />
        );
      })}
    </svg>
  );
};

export const HeroVoiceSlab3D: React.FC<HeroVoiceSlab3DProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [glFailed, setGlFailed] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isDesktop || isReducedMotion || activeWebGLContextCount >= 1) {
      setGlFailed(true);
      return;
    }

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      const gl = renderer.getContext();
      if (!gl) {
        renderer.dispose();
        setGlFailed(true);
        return;
      }
      activeWebGLContextCount++;
    } catch {
      setGlFailed(true);
      return;
    }

    const width = container.clientWidth || 240;
    const height = container.clientHeight || 92;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    container.setAttribute('data-fx-mounted', 'true');

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 50);
    camera.position.set(0, 0, 3.85);

    const ambientLight = new THREE.AmbientLight('#A7C7E7', 1.25);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight('#FAFAFA', 1.65);
    keyLight.position.set(2.5, 3.2, 4.0);
    scene.add(keyLight);

    const amberRimLight = new THREE.PointLight('#E09B30', 2.4, 8);
    amberRimLight.position.set(2.2, 1.1, 2.0);
    scene.add(amberRimLight);

    const slabRig = createVoiceWaveformSlab({
      barCount: 16,
      slabWidth: 4.5,
      slabHeight: 1.65,
      slabDepth: 0.22,
    });
    scene.add(slabRig.group);

    let pointerX = 0;
    let pointerY = 0;
    let scrollProgress = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        pointerX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        pointerY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      }
    };

    const handleScroll = () => {
      const maxScroll = Math.max(1, window.innerHeight);
      scrollProgress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    };

    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth || 240;
      const h = container.clientHeight || 92;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    let rafId = 0;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = (now - startTime) * 0.001;
      slabRig.update(elapsed, pointerX, pointerY, scrollProgress);
      renderer?.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);

      slabRig.dispose();
      scene.clear();

      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
        activeWebGLContextCount = Math.max(0, activeWebGLContextCount - 1);
      }
    };
  }, []);

  if (glFailed) {
    return (
      <div
        id="hero-voice-slab-3d-fallback"
        data-fx-fallback="true"
        className={`w-full h-[92px] rounded-xl overflow-hidden flex items-center justify-center ${className}`}
      >
        <HeroVoiceSlabStaticBars />
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      id="hero-voice-slab-3d-canvas"
      data-testid="hero-voice-slab-3d"
      className={`w-full h-[92px] rounded-xl overflow-hidden flex items-center justify-center ${className}`}
      aria-hidden="true"
    />
  );
};

export default HeroVoiceSlab3D;
