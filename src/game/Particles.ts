/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export interface ParticlePool {
  update: (delta: number) => void;
  emitSnowSpray: (pos: THREE.Vector3, dir: THREE.Vector3, count: number) => void;
  emitConfettiBurst: (pos: THREE.Vector3) => void;
  emitExhaustPuff: (pos: THREE.Vector3) => void;
  setWeatherSnowRate: (count: number, wind: number) => void;
  group: THREE.Group;
  dispose: () => void;
}

export function createParticleSystems(maxSprayParticles: number = 250): ParticlePool {
  const root = new THREE.Group();
  root.name = 'ParticleSystems';

  // --- 1. Snow Spray Particle System (Blade clearance) ---
  const sprayPositions = new Float32Array(maxSprayParticles * 3);
  const sprayVelocities = new Float32Array(maxSprayParticles * 3);
  const sprayLifes = new Float32Array(maxSprayParticles);
  let sprayIndex = 0;

  const sprayGeometry = new THREE.BufferGeometry();
  sprayGeometry.setAttribute('position', new THREE.BufferAttribute(sprayPositions, 3));

  const sprayMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.28,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  });

  const sprayPoints = new THREE.Points(sprayGeometry, sprayMaterial);
  root.add(sprayPoints);

  // --- 2. Ambient Weather Snowflakes ---
  const weatherSnowCount = 1000;
  const weatherPositions = new Float32Array(weatherSnowCount * 3);
  const weatherVelocities = new Float32Array(weatherSnowCount * 3);
  let currentWind = 1.0;

  for (let i = 0; i < weatherSnowCount; i++) {
    weatherPositions[i * 3] = (Math.random() - 0.5) * 80;
    weatherPositions[i * 3 + 1] = Math.random() * 25 + 0.5;
    weatherPositions[i * 3 + 2] = (Math.random() - 0.5) * 80;

    weatherVelocities[i * 3] = (Math.random() - 0.5) * 0.5;
    weatherVelocities[i * 3 + 1] = -(Math.random() * 2.5 + 1.5);
    weatherVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
  }

  const weatherGeom = new THREE.BufferGeometry();
  weatherGeom.setAttribute('position', new THREE.BufferAttribute(weatherPositions, 3));

  const weatherMaterial = new THREE.PointsMaterial({
    color: 0xf0fdf4,
    size: 0.22,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
  });

  const weatherPoints = new THREE.Points(weatherGeom, weatherMaterial);
  root.add(weatherPoints);

  // --- 3. Confetti Celebration Burst ---
  const confettiCount = 120;
  const confettiPositions = new Float32Array(confettiCount * 3);
  const confettiVelocities = new Float32Array(confettiCount * 3);
  const confettiColors = new Float32Array(confettiCount * 3);
  const confettiLifes = new Float32Array(confettiCount);

  const confettiPalette = [
    new THREE.Color(0xf59e0b),
    new THREE.Color(0x38bdf8),
    new THREE.Color(0xef4444),
    new THREE.Color(0x10b981),
    new THREE.Color(0xfacc15),
  ];

  for (let i = 0; i < confettiCount; i++) {
    const col = confettiPalette[i % confettiPalette.length];
    confettiColors[i * 3] = col.r;
    confettiColors[i * 3 + 1] = col.g;
    confettiColors[i * 3 + 2] = col.b;
    confettiLifes[i] = 0;
  }

  const confettiGeom = new THREE.BufferGeometry();
  confettiGeom.setAttribute('position', new THREE.BufferAttribute(confettiPositions, 3));
  confettiGeom.setAttribute('color', new THREE.BufferAttribute(confettiColors, 3));

  const confettiMaterial = new THREE.PointsMaterial({
    size: 0.35,
    vertexColors: true,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
  });

  const confettiPoints = new THREE.Points(confettiGeom, confettiMaterial);
  root.add(confettiPoints);

  return {
    group: root,

    emitSnowSpray: (pos: THREE.Vector3, dir: THREE.Vector3, count: number) => {
      for (let c = 0; c < count; c++) {
        const i = sprayIndex;
        sprayPositions[i * 3] = pos.x + (Math.random() - 0.5) * 0.8;
        sprayPositions[i * 3 + 1] = pos.y + Math.random() * 0.4;
        sprayPositions[i * 3 + 2] = pos.z + (Math.random() - 0.5) * 0.8;

        const spread = (Math.random() - 0.5) * 1.5;
        sprayVelocities[i * 3] = dir.x * 3.5 + spread;
        sprayVelocities[i * 3 + 1] = Math.random() * 2.2 + 1.2;
        sprayVelocities[i * 3 + 2] = dir.z * 3.5 + spread;

        sprayLifes[i] = 0.5 + Math.random() * 0.3;
        sprayIndex = (sprayIndex + 1) % maxSprayParticles;
      }
    },

    emitConfettiBurst: (pos: THREE.Vector3) => {
      for (let i = 0; i < confettiCount; i++) {
        confettiPositions[i * 3] = pos.x;
        confettiPositions[i * 3 + 1] = pos.y + 1.0;
        confettiPositions[i * 3 + 2] = pos.z;

        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 3;
        confettiVelocities[i * 3] = Math.cos(angle) * speed;
        confettiVelocities[i * 3 + 1] = Math.random() * 7 + 4;
        confettiVelocities[i * 3 + 2] = Math.sin(angle) * speed;

        confettiLifes[i] = 1.6 + Math.random() * 0.6;
      }
    },

    emitExhaustPuff: (pos: THREE.Vector3) => {
      const i = sprayIndex;
      sprayPositions[i * 3] = pos.x;
      sprayPositions[i * 3 + 1] = pos.y;
      sprayPositions[i * 3 + 2] = pos.z;

      sprayVelocities[i * 3] = (Math.random() - 0.5) * 0.3;
      sprayVelocities[i * 3 + 1] = 0.6 + Math.random() * 0.4;
      sprayVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.3;

      sprayLifes[i] = 0.35;
      sprayIndex = (sprayIndex + 1) % maxSprayParticles;
    },

    setWeatherSnowRate: (count: number, wind: number) => {
      currentWind = wind;
      weatherPoints.geometry.setDrawRange(0, Math.min(weatherSnowCount, count));
    },

    update: (delta: number) => {
      // 1. Update spray particles
      let sprayActive = false;
      for (let i = 0; i < maxSprayParticles; i++) {
        if (sprayLifes[i] > 0) {
          sprayLifes[i] -= delta;
          sprayPositions[i * 3] += sprayVelocities[i * 3] * delta;
          sprayPositions[i * 3 + 1] += sprayVelocities[i * 3 + 1] * delta;
          sprayPositions[i * 3 + 2] += sprayVelocities[i * 3 + 2] * delta;

          // Gravity
          sprayVelocities[i * 3 + 1] -= 9.8 * delta;

          if (sprayPositions[i * 3 + 1] <= 0.05) {
            sprayPositions[i * 3 + 1] = 0.05;
            sprayLifes[i] = 0;
          }
          sprayActive = true;
        }
      }
      if (sprayActive) {
        sprayGeometry.attributes.position.needsUpdate = true;
      }

      // 2. Update weather falling snow
      for (let i = 0; i < weatherSnowCount; i++) {
        weatherPositions[i * 3] += (weatherVelocities[i * 3] + currentWind * 0.6) * delta;
        weatherPositions[i * 3 + 1] += weatherVelocities[i * 3 + 1] * delta;
        weatherPositions[i * 3 + 2] += weatherVelocities[i * 3 + 2] * delta;

        // Reset if below ground or out of bounds
        if (weatherPositions[i * 3 + 1] < 0.1) {
          weatherPositions[i * 3 + 1] = 25;
          weatherPositions[i * 3] = (Math.random() - 0.5) * 80;
          weatherPositions[i * 3 + 2] = (Math.random() - 0.5) * 80;
        }
      }
      weatherGeom.attributes.position.needsUpdate = true;

      // 3. Update celebration confetti
      let confettiActive = false;
      for (let i = 0; i < confettiCount; i++) {
        if (confettiLifes[i] > 0) {
          confettiLifes[i] -= delta;
          confettiPositions[i * 3] += confettiVelocities[i * 3] * delta;
          confettiPositions[i * 3 + 1] += confettiVelocities[i * 3 + 1] * delta;
          confettiPositions[i * 3 + 2] += confettiVelocities[i * 3 + 2] * delta;

          confettiVelocities[i * 3 + 1] -= 8.5 * delta; // gravity
          confettiVelocities[i * 3] *= 0.98; // air resistance
          confettiVelocities[i * 3 + 2] *= 0.98;

          if (confettiPositions[i * 3 + 1] < 0.08) {
            confettiPositions[i * 3 + 1] = 0.08;
            confettiVelocities[i * 3 + 1] = 0;
          }
          confettiActive = true;
        }
      }
      if (confettiActive) {
        confettiGeom.attributes.position.needsUpdate = true;
      }
    },

    dispose: () => {
      sprayGeometry.dispose();
      sprayMaterial.dispose();
      weatherGeom.dispose();
      weatherMaterial.dispose();
      confettiGeom.dispose();
      confettiMaterial.dispose();
    },
  };
}
