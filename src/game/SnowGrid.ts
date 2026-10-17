/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { DrivewayData } from '../types/game.ts';

export interface SnowCell {
  x: number;
  z: number;
  drivewayId: number;
  instanceIndex: number;
  depth: number; // 1.0 to 0.0
  isCleared: boolean;
}

export class SnowGridSystem {
  public instancedMesh: THREE.InstancedMesh;
  public cells: SnowCell[] = [];
  public totalDrivewayCells: number = 0;
  public clearedDrivewayCells: number = 0;

  private dummy = new THREE.Object3D();
  private cellSize = 0.55; // 0.55m per cell gives dense, satisfying clearing
  private snowMaterial: THREE.MeshStandardMaterial;

  constructor(driveways: DrivewayData[]) {
    // Collect all grid points inside driveway boundaries
    driveways.forEach(dw => {
      const step = this.cellSize;
      let countForDw = 0;
      for (let x = dw.bounds.minX + step / 2; x <= dw.bounds.maxX - step / 2; x += step) {
        for (let z = dw.bounds.minZ + step / 2; z <= dw.bounds.maxZ - step / 2; z += step) {
          this.cells.push({
            x,
            z,
            drivewayId: dw.id,
            instanceIndex: 0,
            depth: 1.0,
            isCleared: false,
          });
          countForDw++;
        }
      }
      dw.totalSnowCells = countForDw;
      this.totalDrivewayCells += countForDw;
    });

    const totalInstances = this.cells.length;

    // Snow box geometry with beveled look
    const geom = new THREE.BoxGeometry(this.cellSize * 0.96, 0.28, this.cellSize * 0.96);
    this.snowMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.85,
      metalness: 0.04,
    });

    this.instancedMesh = new THREE.InstancedMesh(geom, this.snowMaterial, Math.max(1, totalInstances));
    this.instancedMesh.castShadow = true;
    this.instancedMesh.receiveShadow = true;
    this.instancedMesh.frustumCulled = false;

    // Initialize instance matrices
    for (let i = 0; i < totalInstances; i++) {
      const cell = this.cells[i];
      cell.instanceIndex = i;

      this.dummy.position.set(cell.x, 0.14, cell.z);
      this.dummy.scale.set(1, 1, 1);
      this.dummy.updateMatrix();

      this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }

  // Check collision with blade segment and sweep snow
  public sweepSnow(
    bladePos: THREE.Vector3,
    bladeAngle: number,
    bladeWidth: number,
    driveways: DrivewayData[]
  ): { newlyClearedCount: number; clearedDrivewayIds: number[] } {
    let newlyClearedCount = 0;
    const clearedDrivewayIds: number[] = [];

    // Blade sweep bounding circle for fast broad-phase check
    const sweepRadius = bladeWidth / 2 + this.cellSize;
    const bladeLeft = new THREE.Vector2(
      bladePos.x - Math.cos(bladeAngle) * (bladeWidth / 2),
      bladePos.z + Math.sin(bladeAngle) * (bladeWidth / 2)
    );
    const bladeRight = new THREE.Vector2(
      bladePos.x + Math.cos(bladeAngle) * (bladeWidth / 2),
      bladePos.z - Math.sin(bladeAngle) * (bladeWidth / 2)
    );

    let matrixNeedsUpdate = false;

    for (let i = 0; i < this.cells.length; i++) {
      const cell = this.cells[i];
      if (cell.isCleared) continue;

      const dx = cell.x - bladePos.x;
      const dz = cell.z - bladePos.z;
      const distSq = dx * dx + dz * dz;

      if (distSq > sweepRadius * sweepRadius) continue;

      // Distance from cell point to blade line segment
      const distToSegment = pointToSegmentDistance(cell.x, cell.z, bladeLeft.x, bladeLeft.y, bladeRight.x, bladeRight.y);

      if (distToSegment <= 0.65) {
        // Clear cell
        cell.depth -= 0.65;
        if (cell.depth <= 0.05) {
          cell.depth = 0;
          cell.isCleared = true;
          newlyClearedCount++;
          this.clearedDrivewayCells++;

          // Update driveway progress
          const dw = driveways.find(d => d.id === cell.drivewayId);
          if (dw) {
            dw.clearedSnowCells++;
            dw.percentCleared = Math.round((dw.clearedSnowCells / dw.totalSnowCells) * 100);
            if (!dw.isCompleted && dw.percentCleared >= dw.targetPercent) {
              dw.isCompleted = true;
              clearedDrivewayIds.push(dw.id);
            }
          }
        }

        // Update instance matrix scale
        this.dummy.position.set(cell.x, 0.14 * cell.depth, cell.z);
        this.dummy.scale.set(1, Math.max(0.001, cell.depth), 1);
        this.dummy.updateMatrix();

        this.instancedMesh.setMatrixAt(cell.instanceIndex, this.dummy.matrix);
        matrixNeedsUpdate = true;
      }
    }

    if (matrixNeedsUpdate) {
      this.instancedMesh.instanceMatrix.needsUpdate = true;
    }

    return { newlyClearedCount, clearedDrivewayIds };
  }

  public dispose() {
    this.instancedMesh.geometry.dispose();
    this.snowMaterial.dispose();
  }
}

function pointToSegmentDistance(
  px: number,
  pz: number,
  x1: number,
  z1: number,
  x2: number,
  z2: number
): number {
  const lineLenSq = (x2 - x1) * (x2 - x1) + (z2 - z1) * (z2 - z1);
  if (lineLenSq === 0) return Math.hypot(px - x1, pz - z1);

  let t = ((px - x1) * (x2 - x1) + (pz - z1) * (z2 - z1)) / lineLenSq;
  t = Math.max(0, Math.min(1, t));

  const projX = x1 + t * (x2 - x1);
  const projZ = z1 + t * (z2 - z1);

  return Math.hypot(px - projX, pz - projZ);
}
