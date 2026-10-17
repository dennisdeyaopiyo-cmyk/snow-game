/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { TruckSkin, UpgradeTiers } from '../types/game.ts';

export interface TruckMeshComposite {
  group: THREE.Group;
  wheels: THREE.Mesh[];
  steerWheels: THREE.Group[];
  beaconLight: THREE.Mesh;
  plowBladeGroup: THREE.Group;
  blowerChuteGroup: THREE.Group;
  exhaustOrigin: THREE.Vector3;
  bladeCenterWorld: THREE.Vector3;
  updateVisuals: (upgrades: UpgradeTiers) => void;
}

const SKIN_COLORS: Record<TruckSkin, { body: number; accent: number }> = {
  classic_red: { body: 0xd92d20, accent: 0x1e293b },
  yellow_beaver: { body: 0xf59e0b, accent: 0x0f172a },
  glacier_yeti: { body: 0x0284c7, accent: 0xe0f2fe },
  midnight_hunter: { body: 0x18181b, accent: 0xf59e0b },
};

export function createPlowTruck(upgrades: UpgradeTiers): TruckMeshComposite {
  const root = new THREE.Group();
  root.name = 'PlowTruck';

  // Materials
  const skin = SKIN_COLORS[upgrades.selectedSkin] || SKIN_COLORS.classic_red;
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: skin.body,
    roughness: 0.35,
    metalness: 0.45,
  });

  const trimMaterial = new THREE.MeshStandardMaterial({
    color: skin.accent,
    roughness: 0.6,
    metalness: 0.2,
  });

  const chromeMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    roughness: 0.15,
    metalness: 0.9,
  });

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x1e293b,
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.7,
    transparent: true,
    opacity: 0.85,
  });

  const tireMaterial = new THREE.MeshStandardMaterial({
    color: 0x222226,
    roughness: 0.9,
    metalness: 0.05,
  });

  const rimMaterial = new THREE.MeshStandardMaterial({
    color: 0xd1d5db,
    roughness: 0.25,
    metalness: 0.85,
  });

  const headlightMaterial = new THREE.MeshStandardMaterial({
    color: 0xfffae0,
    emissive: 0xfff3c4,
    emissiveIntensity: 0.8,
    roughness: 0.2,
  });

  const taillightMaterial = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xd92626,
    emissiveIntensity: 0.7,
    roughness: 0.2,
  });

  const beaconMaterial = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.2,
    roughness: 0.2,
  });

  const steelBladeMaterial = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.4,
    metalness: 0.75,
  });

  // 1. Main Truck Body / Chassis
  const chassisGeom = new THREE.BoxGeometry(1.6, 0.5, 3.2);
  const chassis = new THREE.Mesh(chassisGeom, bodyMaterial);
  chassis.position.y = 0.55;
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  root.add(chassis);

  // 2. Cabin / Cab
  const cabGeom = new THREE.BoxGeometry(1.5, 0.75, 1.4);
  const cab = new THREE.Mesh(cabGeom, bodyMaterial);
  cab.position.set(0, 1.15, -0.2);
  cab.castShadow = true;
  root.add(cab);

  // 3. Cabin Windshield & Side Windows
  const windshieldGeom = new THREE.BoxGeometry(1.42, 0.48, 0.1);
  const windshield = new THREE.Mesh(windshieldGeom, glassMaterial);
  windshield.position.set(0, 1.25, 0.52);
  windshield.rotation.x = -0.25;
  root.add(windshield);

  const rearWindowGeom = new THREE.BoxGeometry(1.42, 0.45, 0.1);
  const rearWindow = new THREE.Mesh(rearWindowGeom, glassMaterial);
  rearWindow.position.set(0, 1.25, -0.92);
  root.add(rearWindow);

  // 4. Truck Bed
  const bedWallL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 1.4), trimMaterial);
  bedWallL.position.set(-0.75, 0.95, -1.0);
  bedWallL.castShadow = true;
  root.add(bedWallL);

  const bedWallR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 1.4), trimMaterial);
  bedWallR.position.set(0.75, 0.95, -1.0);
  bedWallR.castShadow = true;
  root.add(bedWallR);

  const bedGate = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.4, 0.1), trimMaterial);
  bedGate.position.set(0, 0.95, -1.65);
  bedGate.castShadow = true;
  root.add(bedGate);

  // 5. Front Hood & Grille
  const hoodGeom = new THREE.BoxGeometry(1.52, 0.35, 1.1);
  const hood = new THREE.Mesh(hoodGeom, bodyMaterial);
  hood.position.set(0, 0.85, 0.95);
  hood.castShadow = true;
  root.add(hood);

  const grilleGeom = new THREE.BoxGeometry(1.3, 0.35, 0.08);
  const grille = new THREE.Mesh(grilleGeom, chromeMaterial);
  grille.position.set(0, 0.65, 1.62);
  root.add(grille);

  // 6. Headlights & Taillights
  const hlGeom = new THREE.BoxGeometry(0.25, 0.16, 0.08);
  const hlL = new THREE.Mesh(hlGeom, headlightMaterial);
  hlL.position.set(-0.55, 0.65, 1.63);
  const hlR = new THREE.Mesh(hlGeom, headlightMaterial);
  hlR.position.set(0.55, 0.65, 1.63);
  root.add(hlL, hlR);

  const tlGeom = new THREE.BoxGeometry(0.2, 0.16, 0.08);
  const tlL = new THREE.Mesh(tlGeom, taillightMaterial);
  tlL.position.set(-0.65, 0.75, -1.66);
  const tlR = new THREE.Mesh(tlGeom, taillightMaterial);
  tlR.position.set(0.65, 0.75, -1.66);
  root.add(tlL, tlR);

  // 7. Roof Warning Beacon Light
  const beaconBase = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.08, 12), trimMaterial);
  beaconBase.position.set(0, 1.55, -0.2);
  root.add(beaconBase);

  const beaconLight = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.14, 12), beaconMaterial);
  beaconLight.position.set(0, 1.64, -0.2);
  root.add(beaconLight);

  // 8. Heavy Tread Wheels & Suspension
  const wheels: THREE.Mesh[] = [];
  const steerWheels: THREE.Group[] = [];
  const wheelRadius = 0.42;
  const wheelWidth = 0.32;
  const wheelGeom = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 16);
  wheelGeom.rotateZ(Math.PI / 2);

  const rimGeom = new THREE.CylinderGeometry(wheelRadius * 0.6, wheelRadius * 0.6, wheelWidth + 0.02, 12);
  rimGeom.rotateZ(Math.PI / 2);

  const wheelPositions = [
    { x: -0.85, z: 1.0, isFront: true },
    { x: 0.85, z: 1.0, isFront: true },
    { x: -0.85, z: -1.0, isFront: false },
    { x: 0.85, z: -1.0, isFront: false },
  ];

  wheelPositions.forEach(pos => {
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(pos.x, wheelRadius, pos.z);

    const tireMesh = new THREE.Mesh(wheelGeom, tireMaterial);
    tireMesh.castShadow = true;
    const rimMesh = new THREE.Mesh(rimGeom, rimMaterial);

    tireMesh.add(rimMesh);
    wheelGroup.add(tireMesh);
    root.add(wheelGroup);

    wheels.push(tireMesh);
    if (pos.isFront) {
      steerWheels.push(wheelGroup);
    }
  });

  // 9. Plow Blade Assembly (Varies with bladeTier)
  const plowBladeGroup = new THREE.Group();
  plowBladeGroup.position.set(0, 0.35, 1.85); // Mounted in front of bumper
  root.add(plowBladeGroup);

  // Hydraulic push frame
  const frameL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8), trimMaterial);
  frameL.rotation.x = Math.PI / 3;
  frameL.position.set(-0.45, 0.1, -0.25);
  const frameR = frameL.clone();
  frameR.position.set(0.45, 0.1, -0.25);
  plowBladeGroup.add(frameL, frameR);

  // Build the blade meshes inside plowBladeGroup
  function buildBladeMesh(tier: 1 | 2 | 3) {
    // Clear old blade meshes
    while (plowBladeGroup.children.length > 2) {
      plowBladeGroup.remove(plowBladeGroup.children[plowBladeGroup.children.length - 1]);
    }

    if (tier === 1) {
      // Standard straight curved blade
      const bladeGeom = new THREE.BoxGeometry(2.3, 0.65, 0.1);
      const bladeMesh = new THREE.Mesh(bladeGeom, steelBladeMaterial);
      bladeMesh.position.set(0, 0.05, 0.1);
      bladeMesh.rotation.y = -0.15; // slightly angled to direct snow to right curb
      bladeMesh.castShadow = true;
      plowBladeGroup.add(bladeMesh);

      // Scraper edge
      const scraper = new THREE.Mesh(new THREE.BoxGeometry(2.32, 0.08, 0.14), trimMaterial);
      scraper.position.set(0, -0.28, 0.1);
      scraper.rotation.y = -0.15;
      plowBladeGroup.add(scraper);
    } else if (tier === 2) {
      // Commercial V-Plow Blade
      const wingGeom = new THREE.BoxGeometry(1.65, 0.72, 0.12);
      const leftWing = new THREE.Mesh(wingGeom, steelBladeMaterial);
      leftWing.position.set(-0.75, 0.08, 0.0);
      leftWing.rotation.y = 0.32;
      leftWing.castShadow = true;

      const rightWing = new THREE.Mesh(wingGeom, steelBladeMaterial);
      rightWing.position.set(0.75, 0.08, 0.0);
      rightWing.rotation.y = -0.32;
      rightWing.castShadow = true;

      plowBladeGroup.add(leftWing, rightWing);

      // Center nose reinforcement
      const nose = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.75, 0.25), chromeMaterial);
      nose.position.set(0, 0.08, 0.25);
      plowBladeGroup.add(nose);
    } else {
      // Titan 4.4m Highway Wing with side deflector and safety markers
      const mainGeom = new THREE.BoxGeometry(3.6, 0.8, 0.14);
      const mainBlade = new THREE.Mesh(mainGeom, steelBladeMaterial);
      mainBlade.position.set(0, 0.1, 0.1);
      mainBlade.rotation.y = -0.2;
      mainBlade.castShadow = true;

      // Side wing extension
      const wingExt = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.75, 0.12), steelBladeMaterial);
      wingExt.position.set(1.9, 0.12, -0.2);
      wingExt.rotation.y = -0.45;
      wingExt.castShadow = true;

      // Safety marker flags on tips
      const flagGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 6);
      const flagL = new THREE.Mesh(flagGeom, beaconMaterial);
      flagL.position.set(-1.8, 0.5, 0.2);
      const flagR = new THREE.Mesh(flagGeom, beaconMaterial);
      flagR.position.set(2.4, 0.5, -0.5);

      plowBladeGroup.add(mainBlade, wingExt, flagL, flagR);
    }
  }

  buildBladeMesh(upgrades.bladeTier);

  // 10. Snow Blower Attachment Chute
  const blowerChuteGroup = new THREE.Group();
  blowerChuteGroup.position.set(0.8, 1.0, 0.5);
  root.add(blowerChuteGroup);

  function buildBlowerChute(tier: 1 | 2 | 3) {
    while (blowerChuteGroup.children.length > 0) {
      blowerChuteGroup.remove(blowerChuteGroup.children[0]);
    }
    if (tier >= 2) {
      // Chute base pipe
      const pipeGeom = new THREE.CylinderGeometry(0.12, 0.14, 0.6, 10);
      const pipe = new THREE.Mesh(pipeGeom, chromeMaterial);
      pipe.position.y = 0.3;
      pipe.castShadow = true;

      // Curved directional nozzle
      const nozzleGeom = new THREE.CylinderGeometry(0.1, 0.12, 0.4, 10);
      const nozzle = new THREE.Mesh(nozzleGeom, trimMaterial);
      nozzle.position.set(0.15, 0.55, -0.05);
      nozzle.rotation.z = Math.PI / 4;
      nozzle.rotation.y = Math.PI / 6;

      blowerChuteGroup.add(pipe, nozzle);
    }
  }

  buildBlowerChute(upgrades.blowerTier);

  // 11. Exhaust pipe
  const exhaustPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.7, 8), trimMaterial);
  exhaustPipe.position.set(-0.7, 0.7, -1.6);
  root.add(exhaustPipe);

  // Ground shadow contact disc
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 4.2),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.02;
  root.add(shadowPlane);

  return {
    group: root,
    wheels,
    steerWheels,
    beaconLight,
    plowBladeGroup,
    blowerChuteGroup,
    exhaustOrigin: new THREE.Vector3(-0.7, 1.05, -1.6),
    bladeCenterWorld: new THREE.Vector3(0, 0.35, 1.85),
    updateVisuals: (newUpgrades: UpgradeTiers) => {
      const newSkin = SKIN_COLORS[newUpgrades.selectedSkin] || SKIN_COLORS.classic_red;
      bodyMaterial.color.setHex(newSkin.body);
      trimMaterial.color.setHex(newSkin.accent);
      buildBladeMesh(newUpgrades.bladeTier);
      buildBlowerChute(newUpgrades.blowerTier);
    },
  };
}
