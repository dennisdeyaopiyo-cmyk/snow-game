/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { DrivewayData, LevelConfig } from '../types/game.ts';

export interface GeneratedMap {
  sceneGroup: THREE.Group;
  driveways: DrivewayData[];
  fuelPickups: { position: THREE.Vector3; mesh: THREE.Group; collected: boolean }[];
  obstacleColliders: { minX: number; maxX: number; minZ: number; maxZ: number; type: string }[];
  worldBounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  spawnPosition: THREE.Vector3;
  spawnRotation: number;
}

// Pseudo-random deterministic generator based on seed
function createRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateSuburbanMap(level: LevelConfig): GeneratedMap {
  const root = new THREE.Group();
  root.name = 'SuburbanNeighborhood';
  const rng = createRandom(level.seed);

  const driveways: DrivewayData[] = [];
  const fuelPickups: { position: THREE.Vector3; mesh: THREE.Group; collected: boolean }[] = [];
  const obstacleColliders: { minX: number; maxX: number; minZ: number; maxZ: number; type: string }[] = [];

  const worldBounds = { minX: -45, maxX: 45, minZ: -45, maxZ: 45 };

  // Materials
  const snowMaterial = new THREE.MeshStandardMaterial({
    color: 0xf3f8fc,
    roughness: 0.85,
    metalness: 0.05,
  });

  const roadMaterial = new THREE.MeshStandardMaterial({
    color: 0x333b47,
    roughness: 0.75,
    metalness: 0.1,
  });

  const roadLineMaterial = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.5,
    metalness: 0.1,
  });

  const curbMaterial = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.8,
    metalness: 0.1,
  });

  const drivewayAsphaltMaterial = new THREE.MeshStandardMaterial({
    color: 0x242a35,
    roughness: 0.85,
    metalness: 0.05,
  });

  const houseColors = [0x92400e, 0x1e3a8a, 0x065f46, 0x7c2d12, 0x3f3f46, 0xb45309];
  const roofColors = [0x1e293b, 0x334155, 0x475569, 0x0f172a];
  const windowGlowMaterial = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.9,
    roughness: 0.3,
  });

  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
  const pineMaterial = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.8 });
  const snowCapMaterial = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.85 });

  // 1. Base Ground (Expansive Winter Field)
  const groundGeom = new THREE.PlaneGeometry(120, 120, 16, 16);
  const ground = new THREE.Mesh(groundGeom, snowMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.05;
  ground.receiveShadow = true;
  root.add(ground);

  // 2. Main Avenue Road (Z axis)
  const mainRoadWidth = 9.0;
  const roadGeom = new THREE.PlaneGeometry(mainRoadWidth, 80);
  const mainRoad = new THREE.Mesh(roadGeom, roadMaterial);
  mainRoad.rotation.x = -Math.PI / 2;
  mainRoad.position.set(0, 0.01, 0);
  mainRoad.receiveShadow = true;
  root.add(mainRoad);

  // Road Dash Centerline
  for (let z = -35; z <= 35; z += 5) {
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 2.5), roadLineMaterial);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(0, 0.02, z);
    root.add(dash);
  }

  // Cross street or Cul-de-Sac circle at North end (Z = 35)
  const culDeSacCircle = new THREE.Mesh(new THREE.CircleGeometry(11, 24), roadMaterial);
  culDeSacCircle.rotation.x = -Math.PI / 2;
  culDeSacCircle.position.set(0, 0.01, 35);
  culDeSacCircle.receiveShadow = true;
  root.add(culDeSacCircle);

  // Sidewalk Curbs along Main Road
  const curbHeight = 0.18;
  const curbL = new THREE.Mesh(new THREE.BoxGeometry(0.35, curbHeight, 75), curbMaterial);
  curbL.position.set(-mainRoadWidth / 2 - 0.17, curbHeight / 2, 0);
  curbL.receiveShadow = true;
  root.add(curbL);

  const curbR = new THREE.Mesh(new THREE.BoxGeometry(0.35, curbHeight, 75), curbMaterial);
  curbR.position.set(mainRoadWidth / 2 + 0.17, curbHeight / 2, 0);
  curbR.receiveShadow = true;
  root.add(curbR);

  // Sidewalk walkways
  const swGeom = new THREE.PlaneGeometry(1.6, 75);
  const swL = new THREE.Mesh(swGeom, curbMaterial);
  swL.rotation.x = -Math.PI / 2;
  swL.position.set(-mainRoadWidth / 2 - 1.15, 0.08, 0);
  swL.receiveShadow = true;
  root.add(swL);

  const swR = new THREE.Mesh(swGeom, curbMaterial);
  swR.rotation.x = -Math.PI / 2;
  swR.position.set(mainRoadWidth / 2 + 1.15, 0.08, 0);
  swR.receiveShadow = true;
  root.add(swR);

  // 3. Residential Lots & Driveways
  const homeownerNames = [
    'The Andersons', 'The Kowalskis', 'The Thompsons', 'The Garcias',
    'The Changs', 'The O’Connors', 'The Jensens', 'The Patels'
  ];

  const drivewayConfigs = [
    { side: -1, zPos: -22, length: 11, width: 4.8 },
    { side: 1, zPos: -16, length: 12, width: 5.2 },
    { side: -1, zPos: 4, length: 10, width: 4.6 },
    { side: 1, zPos: 12, length: 13, width: 5.4 },
    { side: -1, zPos: 24, length: 11, width: 5.0 },
    { side: 1, zPos: 32, length: 12, width: 5.0 },
  ];

  const count = Math.min(drivewayConfigs.length, level.drivewayCount);

  for (let i = 0; i < count; i++) {
    const cfg = drivewayConfigs[i];
    const side = cfg.side;
    const houseColor = houseColors[i % houseColors.length];
    const roofColor = roofColors[(i + 1) % roofColors.length];

    // Driveway Bounds
    const drivewayStartX = side * (mainRoadWidth / 2);
    const drivewayEndX = side * (mainRoadWidth / 2 + cfg.length);
    const minX = Math.min(drivewayStartX, drivewayEndX);
    const maxX = Math.max(drivewayStartX, drivewayEndX);
    const minZ = cfg.zPos - cfg.width / 2;
    const maxZ = cfg.zPos + cfg.width / 2;

    // Driveway Asphalt Mesh (underneath snow)
    const dwMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(cfg.length, cfg.width),
      drivewayAsphaltMaterial
    );
    dwMesh.rotation.x = -Math.PI / 2;
    dwMesh.position.set((minX + maxX) / 2, 0.03, (minZ + maxZ) / 2);
    dwMesh.receiveShadow = true;
    root.add(dwMesh);

    // Decorative Driveway Edges / Pavers
    const edgeL = new THREE.Mesh(new THREE.BoxGeometry(cfg.length, 0.12, 0.2), curbMaterial);
    edgeL.position.set((minX + maxX) / 2, 0.06, minZ - 0.1);
    const edgeR = new THREE.Mesh(new THREE.BoxGeometry(cfg.length, 0.12, 0.2), curbMaterial);
    edgeR.position.set((minX + maxX) / 2, 0.06, maxZ + 0.1);
    root.add(edgeL, edgeR);

    // House Model at end of driveway
    const houseGroup = new THREE.Group();
    const houseCenterX = side * (mainRoadWidth / 2 + cfg.length + 5.5);
    const houseCenterZ = cfg.zPos;
    houseGroup.position.set(houseCenterX, 0, houseCenterZ);

    const houseW = 8.5;
    const houseD = 7.5;
    const houseH = 4.2;

    const houseMat = new THREE.MeshStandardMaterial({ color: houseColor, roughness: 0.7 });
    const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.6 });

    // House Main Body
    const houseBody = new THREE.Mesh(new THREE.BoxGeometry(houseW, houseH, houseD), houseMat);
    houseBody.position.y = houseH / 2;
    houseBody.castShadow = true;
    houseBody.receiveShadow = true;
    houseGroup.add(houseBody);

    // Pitched Gable Roof
    const roofGeom = new THREE.ConeGeometry(6.5, 2.5, 4);
    roofGeom.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeom, roofMat);
    roof.position.y = houseH + 1.25;
    roof.scale.set(1.1, 1, 0.95);
    roof.castShadow = true;
    houseGroup.add(roof);

    // Thick Snow on Roof
    const roofSnow = new THREE.Mesh(new THREE.ConeGeometry(6.7, 2.3, 4), snowCapMaterial);
    roofSnow.rotateY(Math.PI / 4);
    roofSnow.position.y = houseH + 1.35;
    roofSnow.scale.set(1.12, 1.05, 0.97);
    houseGroup.add(roofSnow);

    // Chimney with Smoke
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.2, 0.8), trunkMaterial);
    chimney.position.set(side * 2.0, houseH + 2.0, 1.5);
    chimney.castShadow = true;
    houseGroup.add(chimney);

    // Garage Door facing the driveway
    const garageDoor = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 2.8, 3.8),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 })
    );
    garageDoor.position.set(-side * (houseW / 2 + 0.05), 1.4, 0);
    houseGroup.add(garageDoor);

    // Lit Cozy Windows
    const win1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 1.2), windowGlowMaterial);
    win1.position.set(-side * (houseW / 2 + 0.05), 2.2, side * 2.2);
    houseGroup.add(win1);

    // Front Porch Light
    const porchLight = new THREE.PointLight(0xfef08a, 1.2, 8);
    porchLight.position.set(-side * (houseW / 2 + 0.5), 2.4, 0);
    houseGroup.add(porchLight);

    root.add(houseGroup);

    // House Collider
    obstacleColliders.push({
      minX: houseCenterX - houseW / 2 - 0.5,
      maxX: houseCenterX + houseW / 2 + 0.5,
      minZ: houseCenterZ - houseD / 2 - 0.5,
      maxZ: houseCenterZ + houseD / 2 + 0.5,
      type: 'house',
    });

    // Mailbox at driveway mouth
    const mbGroup = new THREE.Group();
    const mbX = side * (mainRoadWidth / 2 + 0.6);
    const mbZ = minZ - 0.6;
    mbGroup.position.set(mbX, 0, mbZ);

    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 8), trunkMaterial);
    post.position.y = 0.55;
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 0.5), new THREE.MeshStandardMaterial({ color: 0x334155 }));
    box.position.y = 1.1;
    const flag = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.12, 0.08), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
    flag.position.set(0.16, 1.15, 0.1);
    mbGroup.add(post, box, flag);
    root.add(mbGroup);

    obstacleColliders.push({
      minX: mbX - 0.35,
      maxX: mbX + 0.35,
      minZ: mbZ - 0.35,
      maxZ: mbZ + 0.35,
      type: 'mailbox',
    });

    // Driveway record
    driveways.push({
      id: i + 1,
      homeownerName: homeownerNames[i % homeownerNames.length],
      houseColor: `#${houseColor.toString(16).padStart(6, '0')}`,
      roofColor: `#${roofColor.toString(16).padStart(6, '0')}`,
      bounds: { minX, maxX, minZ, maxZ },
      totalSnowCells: 0,
      clearedSnowCells: 0,
      percentCleared: 0,
      isCompleted: false,
      tipAmount: 60 + Math.floor(rng() * 40),
      targetPercent: 88, // 88% clearing counts as complete!
    });

    // Add Fuel Pickup nearby occasionally
    if (i % 2 === 1 || i === count - 1) {
      const fuelX = side * (mainRoadWidth / 2 + 1.2);
      const fuelZ = maxZ + 1.8;
      const fuelCan = createFuelCanisterMesh();
      fuelCan.position.set(fuelX, 0.4, fuelZ);
      root.add(fuelCan);
      fuelPickups.push({
        position: new THREE.Vector3(fuelX, 0.4, fuelZ),
        mesh: fuelCan,
        collected: false,
      });
    }
  }

  // 4. Decorative Snowy Pine Trees
  const treePositions = [
    { x: -18, z: -32 },
    { x: -22, z: -10 },
    { x: -20, z: 14 },
    { x: -16, z: 32 },
    { x: 19, z: -30 },
    { x: 21, z: -5 },
    { x: 18, z: 22 },
    { x: 22, z: 36 },
    { x: 0, z: 46 }, // cul-de-sac center greenery
  ];

  treePositions.forEach(pos => {
    const tree = createPineTree(trunkMaterial, pineMaterial, snowCapMaterial);
    tree.position.set(pos.x, 0, pos.z);
    const scale = 0.85 + rng() * 0.4;
    tree.scale.set(scale, scale, scale);
    root.add(tree);

    obstacleColliders.push({
      minX: pos.x - 0.7 * scale,
      maxX: pos.x + 0.7 * scale,
      minZ: pos.z - 0.7 * scale,
      maxZ: pos.z + 0.7 * scale,
      type: 'tree',
    });
  });

  // 5. Street Lamps with Warm Glow
  const lampPositions = [
    { x: -mainRoadWidth / 2 - 1.2, z: -25 },
    { x: mainRoadWidth / 2 + 1.2, z: -5 },
    { x: -mainRoadWidth / 2 - 1.2, z: 15 },
    { x: mainRoadWidth / 2 + 1.2, z: 32 },
  ];

  lampPositions.forEach(pos => {
    const lamp = createStreetLamp();
    lamp.position.set(pos.x, 0, pos.z);
    root.add(lamp);

    obstacleColliders.push({
      minX: pos.x - 0.3,
      maxX: pos.x + 0.3,
      minZ: pos.z - 0.3,
      maxZ: pos.z + 0.3,
      type: 'lamp',
    });
  });

  return {
    sceneGroup: root,
    driveways,
    fuelPickups,
    obstacleColliders,
    worldBounds,
    spawnPosition: new THREE.Vector3(0, 0, -32),
    spawnRotation: 0, // facing North along the road
  };
}

function createPineTree(trunkMat: THREE.Material, foliageMat: THREE.Material, snowMat: THREE.Material): THREE.Group {
  const tree = new THREE.Group();

  // Trunk
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 1.4, 8), trunkMat);
  trunk.position.y = 0.7;
  trunk.castShadow = true;
  tree.add(trunk);

  // 3 Stacked Cones for Foliage
  const layerHeights = [1.8, 2.9, 3.8];
  const layerRadii = [1.8, 1.4, 0.95];

  for (let i = 0; i < 3; i++) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(layerRadii[i], 1.6, 7), foliageMat);
    cone.position.y = layerHeights[i];
    cone.castShadow = true;
    tree.add(cone);

    // Snow Cap on Foliage
    const cap = new THREE.Mesh(new THREE.ConeGeometry(layerRadii[i] * 1.05, 0.45, 7), snowMat);
    cap.position.y = layerHeights[i] + 0.45;
    tree.add(cap);
  }

  return tree;
}

function createStreetLamp(): THREE.Group {
  const lamp = new THREE.Group();
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.8 });
  const glowMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf59e0b, emissiveIntensity: 1.0 });

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 4.2, 8), poleMat);
  pole.position.y = 2.1;
  pole.castShadow = true;
  lamp.add(pole);

  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 8), poleMat);
  arm.rotation.z = Math.PI / 4;
  arm.position.set(0.25, 4.2, 0);
  lamp.add(arm);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), glowMat);
  head.position.set(0.5, 4.25, 0);
  lamp.add(head);

  const light = new THREE.PointLight(0xfef08a, 0.8, 9);
  light.position.set(0.5, 4.0, 0);
  lamp.add(light);

  return lamp;
}

function createFuelCanisterMesh(): THREE.Group {
  const canister = new THREE.Group();
  const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4, metalness: 0.4 });
  const capMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.8 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.55, 0.3), redMat);
  body.castShadow = true;
  canister.add(body);

  const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.22, 8), capMat);
  spout.position.set(0.12, 0.35, 0);
  spout.rotation.z = -Math.PI / 6;
  canister.add(spout);

  // Floating glow ring indicator
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.35, 0.42, 16),
    new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = -0.35;
  canister.add(ring);

  return canister;
}
