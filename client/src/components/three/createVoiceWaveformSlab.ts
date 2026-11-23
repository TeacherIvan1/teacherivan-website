import * as THREE from 'three';

export interface VoiceWaveformSlabOptions {
  barCount?: number;
  slabWidth?: number;
  slabHeight?: number;
  slabDepth?: number;
}

export interface VoiceWaveformSlabRig {
  group: THREE.Group;
  slabGroup: THREE.Group;
  bars: THREE.Mesh[];
  update: (elapsedTime: number, pointerX?: number, pointerY?: number, scrollProgress?: number) => void;
  dispose: () => void;
}

/**
 * Procedural 3D AI Voice Waveform Slab Factory (img2threejs M.C.M.T Methodology)
 * Zero binary .glb/.gltf assets — 100% pure TypeScript geometry & PBR materials.
 *
 * Components:
 * 1. Physical Bevel Base (#091326 Midnight Navy)
 * 2. Studio Glassmorphic Slab (#1A3153 Deep Navy)
 * 3. Specular Rim Frame (#A7C7E7 Soft Denim)
 * 4. 16 Animated Vertical Acoustic Waveform Bars (#E09B30 Warm Amber & #A7C7E7 Soft Denim)
 *    with named pivot refs (bars[])
 */
export function createVoiceWaveformSlab(
  options: VoiceWaveformSlabOptions = {}
): VoiceWaveformSlabRig {
  const barCount = options.barCount ?? 16;
  const slabWidth = options.slabWidth ?? 4.6;
  const slabHeight = options.slabHeight ?? 1.75;
  const slabDepth = options.slabDepth ?? 0.24;

  const rootGroup = new THREE.Group();
  rootGroup.name = 'VoiceWaveformSlabRoot';

  const slabGroup = new THREE.Group();
  slabGroup.name = 'StudioSlabRig';
  rootGroup.add(slabGroup);

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  // 1. Physical Lip / Bottom Bevel (#091326 Midnight Navy)
  const bevelGeo = new THREE.BoxGeometry(slabWidth + 0.08, slabHeight + 0.08, slabDepth);
  geometries.push(bevelGeo);
  const bevelMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#091326'),
    roughness: 0.55,
    metalness: 0.25,
  });
  materials.push(bevelMat);
  const bevelMesh = new THREE.Mesh(bevelGeo, bevelMat);
  bevelMesh.name = 'PhysicalLipBevel';
  bevelMesh.position.set(0, -0.07, -0.08);
  slabGroup.add(bevelMesh);

  // 2. Main Deep Navy Studio Slab (#1A3153)
  const mainSlabGeo = new THREE.BoxGeometry(slabWidth, slabHeight, slabDepth);
  geometries.push(mainSlabGeo);
  const mainSlabMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#1A3153'),
    emissive: new THREE.Color('#132642'),
    emissiveIntensity: 0.35,
    roughness: 0.22,
    metalness: 0.18,
    clearcoat: 0.65,
    clearcoatRoughness: 0.18,
  });
  materials.push(mainSlabMat);
  const mainSlabMesh = new THREE.Mesh(mainSlabGeo, mainSlabMat);
  mainSlabMesh.name = 'DeepNavyGlassSlab';
  mainSlabMesh.position.set(0, 0, 0);
  slabGroup.add(mainSlabMesh);

  // 3. Specular Rim Highlight (#A7C7E7 Soft Denim 1px architectural frame)
  const rimEdgesGeo = new THREE.EdgesGeometry(mainSlabGeo);
  geometries.push(rimEdgesGeo);
  const rimLineMat = new THREE.LineBasicMaterial({
    color: new THREE.Color('#A7C7E7'),
    transparent: true,
    opacity: 0.42,
  });
  materials.push(rimLineMat);
  const rimLines = new THREE.LineSegments(rimEdgesGeo, rimLineMat);
  rimLines.name = 'SpecularRimHighlight';
  rimLines.scale.set(1.004, 1.004, 1.01);
  slabGroup.add(rimLines);

  // 4. Sunken Acoustic Stage Well (#091326)
  const wellWidth = slabWidth - 0.36;
  const wellHeight = slabHeight - 0.36;
  const wellGeo = new THREE.PlaneGeometry(wellWidth, wellHeight);
  geometries.push(wellGeo);
  const wellMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#091326'),
    roughness: 0.75,
    metalness: 0.1,
  });
  materials.push(wellMat);
  const wellMesh = new THREE.Mesh(wellGeo, wellMat);
  wellMesh.name = 'AcousticWell';
  wellMesh.position.set(0, 0, slabDepth / 2 + 0.004);
  slabGroup.add(wellMesh);

  // 5. 16 Animated Vertical Acoustic Waveform Bars (#E09B30 Warm Amber primary, #A7C7E7 Soft Denim harmonic)
  const bars: THREE.Mesh[] = [];
  const barWidth = 0.13;
  const barDepth = 0.11;
  const baseBarHeight = 1.0;
  const totalSpan = wellWidth - 0.48;
  const stepX = totalSpan / Math.max(1, barCount - 1);
  const startX = -totalSpan / 2;

  const sharedBarGeo = new THREE.BoxGeometry(barWidth, baseBarHeight, barDepth);
  geometries.push(sharedBarGeo);

  const amberBarMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#E09B30'),
    emissive: new THREE.Color('#E09B30'),
    emissiveIntensity: 0.42,
    roughness: 0.25,
    metalness: 0.3,
  });
  const denimBarMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#A7C7E7'),
    emissive: new THREE.Color('#A7C7E7'),
    emissiveIntensity: 0.22,
    roughness: 0.3,
    metalness: 0.2,
  });
  materials.push(amberBarMat, denimBarMat);

  for (let i = 0; i < barCount; i++) {
    const isPrimaryAmber = i % 3 !== 2;
    const barMesh = new THREE.Mesh(sharedBarGeo, isPrimaryAmber ? amberBarMat : denimBarMat);
    barMesh.name = `WaveformBar_${String(i + 1).padStart(2, '0')}`;
    const xPos = startX + i * stepX;
    barMesh.position.set(xPos, 0, slabDepth / 2 + barDepth / 2 + 0.015);
    barMesh.userData = {
      index: i,
      phaseOffset: i * 0.42,
      baseScaleY: 0.22 + Math.sin((i / Math.max(1, barCount - 1)) * Math.PI) * 0.55,
    };
    slabGroup.add(barMesh);
    bars.push(barMesh);
  }

  // Deterministic per-frame update function
  const update = (
    elapsedTime: number,
    pointerX = 0,
    pointerY = 0,
    scrollProgress = 0
  ): void => {
    // Cursor parallax (±6 deg = ±0.1047 rad) + gentle idle float
    const maxTiltRad = THREE.MathUtils.degToRad(6);
    const targetRotY = THREE.MathUtils.clamp(pointerX, -1, 1) * maxTiltRad;
    const targetRotX =
      -THREE.MathUtils.clamp(pointerY, -1, 1) * maxTiltRad +
      scrollProgress * THREE.MathUtils.degToRad(4);

    slabGroup.rotation.y += (targetRotY - slabGroup.rotation.y) * 0.12;
    slabGroup.rotation.x += (targetRotX - slabGroup.rotation.x) * 0.12;
    slabGroup.position.y = Math.sin(elapsedTime * 1.4) * 0.03;

    // Pulse the 16 acoustic bars smoothly
    for (let i = 0; i < bars.length; i++) {
      const bar = bars[i];
      const phase = bar.userData.phaseOffset as number;
      const envelope = bar.userData.baseScaleY as number;

      const wave1 = Math.sin(elapsedTime * 3.2 + phase) * 0.38;
      const wave2 = Math.cos(elapsedTime * 4.8 - phase * 0.7) * 0.24;
      const wave3 = Math.sin(elapsedTime * 1.9 + i * 0.6) * 0.18;

      const rawAmp = Math.abs(wave1 + wave2 + wave3);
      const scaleY = THREE.MathUtils.clamp(0.18 + rawAmp * envelope * 1.35, 0.16, 1.18);

      bar.scale.set(1, scaleY, 1);
      bar.position.z = slabDepth / 2 + barDepth / 2 + 0.015 + scaleY * 0.03;
    }
  };

  // Initial pose evaluation (G1 animation contract verification)
  update(0, 0, 0, 0);

  const dispose = (): void => {
    for (const geo of geometries) {
      geo.dispose();
    }
    for (const mat of materials) {
      mat.dispose();
    }
    bars.length = 0;
  };

  return {
    group: rootGroup,
    slabGroup,
    bars,
    update,
    dispose,
  };
}
