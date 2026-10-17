/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { DriveInput, DrivewayData, LevelConfig, UpgradeTiers, WeatherConfig } from '../types/game.ts';
import { WEATHER_PRESETS } from './WeatherPresets.ts';
import { generateSuburbanMap, GeneratedMap } from './MapGenerator.ts';
import { createPlowTruck, TruckMeshComposite } from './TruckModel.ts';
import { SnowGridSystem } from './SnowGrid.ts';
import { createParticleSystems, ParticlePool } from './Particles.ts';
import { sound } from '../audio/SoundEffects.ts';

export interface GameEngineEvents {
  onFuelChange: (current: number, max: number) => void;
  onComboChange: (combo: number, count: number) => void;
  onDrivewayProgress: (driveways: DrivewayData[]) => void;
  onDrivewayCleared: (driveway: DrivewayData, tipEarned: number) => void;
  onLevelComplete: (timeSeconds: number, stars: number, cashEarned: number, maxCombo: number) => void;
  onOutOfFuel: () => void;
  onFloatingNotification: (text: string, type: 'combo' | 'cash' | 'fuel' | 'warning') => void;
}

export class FrostPlowGameEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private events: GameEngineEvents;

  private isRunning: boolean = false;
  private animFrameId: number | null = null;
  private clock: THREE.Clock = new THREE.Clock();

  // Current Level & Weather
  private level: LevelConfig;
  private weather: WeatherConfig;
  private upgrades: UpgradeTiers;

  // Scene sub-systems
  private mapData: GeneratedMap | null = null;
  private truck: TruckMeshComposite | null = null;
  private snowGrid: SnowGridSystem | null = null;
  private particles: ParticlePool | null = null;

  // Vehicle Kinematics
  private truckPos = new THREE.Vector3(0, 0, 0);
  private truckHeading: number = 0; // radians
  private truckSpeed: number = 0; // forward/backward speed
  private steerAngle: number = 0; // current wheel steering angle
  private lateralSlip: number = 0; // ice drift component

  // Vehicle Stats based on Upgrades
  private maxForwardSpeed = 8.8; // m/s
  private maxReverseSpeed = 4.2;
  private acceleration = 12.0;
  private braking = 16.0;
  private turnSpeed = 2.4;

  private bladeWidth = 2.4; // varies with bladeTier
  private isBladeDown = true;
  private maxFuel = 100;
  private currentFuel = 100;

  // Combo & Score State
  private comboMultiplier = 1.0;
  private comboStreakTimer = 0;
  private maxComboReached = 1.0;
  private consecutiveClearedCells = 0;
  private totalLevelCash = 0;
  private levelTimer = 0;
  private isLevelFinished = false;

  // Input state
  private input: DriveInput = {
    throttle: 0,
    steering: 0,
    bladeDown: true,
    boost: false,
    blowerActive: false,
  };

  // Reusable math objects to prevent garbage collection in render loop
  private _vec3A = new THREE.Vector3();
  private _vec3B = new THREE.Vector3();

  constructor(
    container: HTMLElement,
    level: LevelConfig,
    upgrades: UpgradeTiers,
    events: GameEngineEvents
  ) {
    this.container = container;
    this.level = level;
    this.upgrades = upgrades;
    this.events = events;
    this.weather = WEATHER_PRESETS[level.weather] || WEATHER_PRESETS.sunny_crisp;

    // Apply Upgrades parameters
    this.applyUpgradesConfig();

    // 1. Scene Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.weather.skyColor);
    this.scene.fog = new THREE.FogExp2(this.weather.fogColor, this.weather.fogDensity);

    // 2. Isometric Orthographic Camera Setup
    const aspect = container.clientWidth / container.clientHeight;
    const viewSize = 22; // frustum height
    this.camera = new THREE.OrthographicCamera(
      (-viewSize * aspect) / 2,
      (viewSize * aspect) / 2,
      viewSize / 2,
      -viewSize / 2,
      1,
      250
    );
    // Standard 45-degree isometric tilt angle
    this.camera.position.set(24, 28, 24);
    this.camera.lookAt(0, 0, 0);

    // 3. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    container.appendChild(this.renderer.domElement);

    // 4. Lighting Rig
    this.setupLighting();

    // 5. Build Procedural Map
    this.setupMap();

    // 6. Build Truck Model
    this.setupTruck();

    // 7. Setup Snow Clearance Grid
    this.setupSnowGrid();

    // 8. Setup Particles
    this.setupParticles();

    // 9. Window Resize
    window.addEventListener('resize', this.onWindowResize);

    // Start engine loop
    sound.startEngine();
    this.isRunning = true;
    this.tick();
  }

  private applyUpgradesConfig() {
    // Blade tier width
    if (this.upgrades.bladeTier === 1) this.bladeWidth = 2.4;
    else if (this.upgrades.bladeTier === 2) this.bladeWidth = 3.4;
    else this.bladeWidth = 4.6;

    // Fuel capacity tier
    if (this.upgrades.fuelTankTier === 1) this.maxFuel = 100;
    else if (this.upgrades.fuelTankTier === 2) this.maxFuel = 160;
    else this.maxFuel = 240;
    this.currentFuel = this.maxFuel;
  }

  private setupLighting() {
    // Warm morning Sun Key Light
    const keyLight = new THREE.DirectionalLight(this.weather.sunColor, 1.4);
    keyLight.position.set(30, 45, 25);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 10;
    keyLight.shadow.camera.far = 120;
    const shadowD = 35;
    keyLight.shadow.camera.left = -shadowD;
    keyLight.shadow.camera.right = shadowD;
    keyLight.shadow.camera.top = shadowD;
    keyLight.shadow.camera.bottom = -shadowD;
    keyLight.shadow.bias = -0.0004;
    this.scene.add(keyLight);

    // Cool Sky / Ground Fill Light
    const hemiLight = new THREE.HemisphereLight(
      this.weather.ambientColor,
      0x475569,
      0.85
    );
    this.scene.add(hemiLight);
  }

  private setupMap() {
    this.mapData = generateSuburbanMap(this.level);
    this.scene.add(this.mapData.sceneGroup);

    // Set truck spawn position
    this.truckPos.copy(this.mapData.spawnPosition);
    this.truckHeading = this.mapData.spawnRotation;
  }

  private setupTruck() {
    this.truck = createPlowTruck(this.upgrades);
    this.truck.group.position.copy(this.truckPos);
    this.truck.group.rotation.y = this.truckHeading;
    this.scene.add(this.truck.group);
  }

  private setupSnowGrid() {
    if (!this.mapData) return;
    this.snowGrid = new SnowGridSystem(this.mapData.driveways);
    this.scene.add(this.snowGrid.instancedMesh);

    // Notify initial driveway progress
    this.events.onDrivewayProgress(this.mapData.driveways);
  }

  private setupParticles() {
    this.particles = createParticleSystems(300);
    this.particles.setWeatherSnowRate(this.weather.snowParticleCount, this.weather.windSpeed);
    this.scene.add(this.particles.group);
  }

  public setInput(input: DriveInput) {
    this.input = input;
    this.isBladeDown = input.bladeDown;
  }

  public updateUpgrades(upgrades: UpgradeTiers) {
    this.upgrades = upgrades;
    this.applyUpgradesConfig();
    if (this.truck) {
      this.truck.updateVisuals(upgrades);
    }
  }

  private tick = () => {
    if (!this.isRunning) return;
    this.animFrameId = requestAnimationFrame(this.tick);

    const rawDelta = this.clock.getDelta();
    const delta = Math.min(rawDelta, 0.05); // clamp delta time for stable simulation

    if (!this.isLevelFinished) {
      this.levelTimer += delta;
      this.updatePhysics(delta);
      this.updateSnowClearing(delta);
      this.updateFuel(delta);
      this.updatePickups(delta);
    }

    this.updateCamera(delta);

    if (this.particles) {
      this.particles.update(delta);
    }

    // Sound engine speed modulation
    const normSpeed = Math.abs(this.truckSpeed) / this.maxForwardSpeed;
    sound.updateEngine(normSpeed);

    this.renderer.render(this.scene, this.camera);
  };

  private updatePhysics(delta: number) {
    if (!this.truck) return;

    // 1. Calculate Traction Factor (Weather + Tire Chains upgrade)
    let traction = this.weather.tractionFactor;
    if (this.upgrades.chainsTier === 2) {
      traction = Math.min(1.0, traction + 0.35);
    } else if (this.upgrades.chainsTier === 3) {
      traction = Math.min(1.0, traction + 0.85); // maximum grip
    }

    // 2. Handle Throttle & Braking
    let targetSpeed = 0;
    if (this.input.throttle > 0) {
      const topSpeed = this.input.boost ? this.maxForwardSpeed * 1.35 : this.maxForwardSpeed;
      targetSpeed = topSpeed * this.input.throttle;
    } else if (this.input.throttle < 0) {
      targetSpeed = -this.maxReverseSpeed * Math.abs(this.input.throttle);
    }

    // Speed interpolation
    const accelRate = this.input.throttle !== 0 ? this.acceleration * traction : this.braking;
    this.truckSpeed = THREE.MathUtils.damp(this.truckSpeed, targetSpeed, accelRate, delta);

    // 3. Handle Steering
    const targetSteer = -this.input.steering * 0.55; // max 32 deg steering
    this.steerAngle = THREE.MathUtils.damp(this.steerAngle, targetSteer, 10, delta);

    // Apply steering to front wheels
    if (this.truck.steerWheels) {
      this.truck.steerWheels.forEach(w => {
        w.rotation.y = this.steerAngle;
      });
    }

    // Turn heading based on speed and steer angle
    if (Math.abs(this.truckSpeed) > 0.05) {
      const turnAmount = (this.truckSpeed / 3.0) * Math.sin(this.steerAngle) * this.turnSpeed * delta;
      this.truckHeading += turnAmount;
    }

    // 4. Calculate Lateral Drift Slip on Ice
    const slipTarget = (1.0 - traction) * Math.sin(this.steerAngle) * this.truckSpeed * 0.45;
    this.lateralSlip = THREE.MathUtils.damp(this.lateralSlip, slipTarget, 3.5, delta);

    // 5. Compute Move Vector
    const forwardX = Math.sin(this.truckHeading);
    const forwardZ = Math.cos(this.truckHeading);
    const rightX = Math.cos(this.truckHeading);
    const rightZ = -Math.sin(this.truckHeading);

    const moveX = (forwardX * this.truckSpeed + rightX * this.lateralSlip) * delta;
    const moveZ = (forwardZ * this.truckSpeed + rightZ * this.lateralSlip) * delta;

    // 6. Obstacle Collisions Check
    const newX = this.truckPos.x + moveX;
    const newZ = this.truckPos.z + moveZ;

    let collided = false;
    if (this.mapData) {
      // Bounds clamp
      const bounds = this.mapData.worldBounds;
      if (newX < bounds.minX || newX > bounds.maxX || newZ < bounds.minZ || newZ > bounds.maxZ) {
        collided = true;
      }

      // Check obstacle colliders (houses, mailboxes, trees, lamps)
      const truckRadius = 1.1;
      for (const col of this.mapData.obstacleColliders) {
        if (
          newX + truckRadius > col.minX &&
          newX - truckRadius < col.maxX &&
          newZ + truckRadius > col.minZ &&
          newZ - truckRadius < col.maxZ
        ) {
          collided = true;
          break;
        }
      }
    }

    if (!collided) {
      this.truckPos.x = newX;
      this.truckPos.z = newZ;
    } else {
      // Soft bounce on impact
      this.truckSpeed = -this.truckSpeed * 0.25;
      sound.playUIClick();
    }

    // Update truck 3D transform
    this.truck.group.position.set(this.truckPos.x, 0, this.truckPos.z);
    this.truck.group.rotation.y = this.truckHeading;

    // Rotate tires based on speed
    const wheelRoll = (this.truckSpeed / 0.42) * delta;
    this.truck.wheels.forEach(w => {
      w.rotation.x += wheelRoll;
    });

    // Animate roof beacon
    if (this.truck.beaconLight) {
      this.truck.beaconLight.rotation.y += delta * 12;
    }

    // Lower/raise blade smoothly
    const targetBladeY = this.isBladeDown ? 0.2 : 0.65;
    this.truck.plowBladeGroup.position.y = THREE.MathUtils.damp(
      this.truck.plowBladeGroup.position.y,
      targetBladeY,
      8,
      delta
    );

    // Emit exhaust puffs occasionally
    if (Math.random() < 0.15 && this.particles) {
      this._vec3A.copy(this.truck.exhaustOrigin).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.truckHeading).add(this.truckPos);
      this.particles.emitExhaustPuff(this._vec3A);
    }
  }

  private updateSnowClearing(delta: number) {
    if (!this.snowGrid || !this.truck || !this.mapData) return;

    // Only clear snow if blade is lowered and vehicle is moving forward
    const isPlowing = this.isBladeDown && this.truckSpeed > 0.4;

    if (isPlowing) {
      // Compute blade world position
      this._vec3A.set(0, 0, 1.85).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.truckHeading).add(this.truckPos);

      const result = this.snowGrid.sweepSnow(
        this._vec3A,
        this.truckHeading,
        this.bladeWidth,
        this.mapData.driveways
      );

      if (result.newlyClearedCount > 0) {
        // Emit snow spray particles from sides of blade
        if (this.particles) {
          const sprayDir = new THREE.Vector3(
            Math.cos(this.truckHeading) * (Math.random() > 0.5 ? 1 : -1),
            0.5,
            -Math.sin(this.truckHeading) * (Math.random() > 0.5 ? 1 : -1)
          );
          this.particles.emitSnowSpray(this._vec3A, sprayDir, Math.min(8, result.newlyClearedCount * 2));
        }

        // Play snow scraping crunch
        sound.playSnowPlowCrunch(this.truckSpeed / this.maxForwardSpeed);

        // Build Combo Streak!
        this.consecutiveClearedCells += result.newlyClearedCount;
        this.comboStreakTimer = 2.2 + (this.upgrades.blowerTier >= 2 ? 1.5 : 0); // extra grace with blower

        const oldMultiplier = this.comboMultiplier;
        if (this.consecutiveClearedCells > 80) this.comboMultiplier = 5.0;
        else if (this.consecutiveClearedCells > 50) this.comboMultiplier = 3.0;
        else if (this.consecutiveClearedCells > 25) this.comboMultiplier = 2.0;
        else if (this.consecutiveClearedCells > 10) this.comboMultiplier = 1.5;
        else this.comboMultiplier = 1.0;

        if (this.comboMultiplier > this.maxComboReached) {
          this.maxComboReached = this.comboMultiplier;
        }

        if (this.comboMultiplier > oldMultiplier) {
          sound.playComboChime(Math.floor(this.comboMultiplier));
          this.events.onFloatingNotification(`COMBO x${this.comboMultiplier.toFixed(1)}!`, 'combo');
        }

        this.events.onComboChange(this.comboMultiplier, this.consecutiveClearedCells);
        this.events.onDrivewayProgress([...this.mapData.driveways]);
      }

      // Check if any driveways were newly completed!
      if (result.clearedDrivewayIds.length > 0) {
        result.clearedDrivewayIds.forEach(id => {
          const dw = this.mapData!.driveways.find(d => d.id === id);
          if (dw) {
            // Calculate tip with combo multiplier bonus
            let tip = Math.round(dw.tipAmount * this.comboMultiplier);
            if (this.upgrades.blowerTier === 3) {
              tip = Math.round(tip * 1.25); // 25% bonus for turbo blower!
            }
            this.totalLevelCash += tip;

            // Audio & celebration
            sound.playDrivewayCleared();
            if (this.particles) {
              const dwCenter = new THREE.Vector3(
                (dw.bounds.minX + dw.bounds.maxX) / 2,
                1.5,
                (dw.bounds.minZ + dw.bounds.maxZ) / 2
              );
              this.particles.emitConfettiBurst(dwCenter);
            }

            this.events.onDrivewayCleared(dw, tip);
            this.events.onFloatingNotification(`+$${tip} — ${dw.homeownerName}!`, 'cash');
          }
        });

        // Check if ALL driveways are complete!
        const allCompleted = this.mapData.driveways.every(d => d.isCompleted);
        if (allCompleted && !this.isLevelFinished) {
          this.isLevelFinished = true;
          this.finishLevelVictory();
        }
      }
    }

    // Decay combo streak if idle or not plowing
    if (this.comboStreakTimer > 0) {
      this.comboStreakTimer -= delta;
      if (this.comboStreakTimer <= 0) {
        this.comboMultiplier = 1.0;
        this.consecutiveClearedCells = 0;
        this.events.onComboChange(1.0, 0);
      }
    }
  }

  private updateFuel(delta: number) {
    if (this.isLevelFinished) return;

    // Fuel consumption rate
    let burnRate = 0.4; // idle rate per sec
    if (Math.abs(this.truckSpeed) > 0.1) {
      burnRate += 1.4; // driving
    }
    if (this.isBladeDown && this.truckSpeed > 0.4) {
      burnRate += 1.8; // plowing resistance
    }
    if (this.input.boost) {
      burnRate += 2.5; // turbo boost
    }

    // Eco turbo upgrade reduces fuel burn by 25%
    if (this.upgrades.fuelTankTier === 3) {
      burnRate *= 0.75;
    }

    this.currentFuel = Math.max(0, this.currentFuel - burnRate * delta);
    this.events.onFuelChange(this.currentFuel, this.maxFuel);

    // Warning ping when fuel is under 18%
    const fuelPercent = (this.currentFuel / this.maxFuel) * 100;
    if (fuelPercent < 18 && fuelPercent > 0 && Math.floor(this.levelTimer * 2) % 2 === 0 && Math.random() < 0.05) {
      sound.playLowFuelPing();
      this.events.onFloatingNotification('LOW FUEL WARNING!', 'warning');
    }

    // Out of fuel game over
    if (this.currentFuel <= 0 && !this.isLevelFinished) {
      this.isLevelFinished = true;
      sound.stopEngine();
      this.events.onOutOfFuel();
    }
  }

  private updatePickups(delta: number) {
    if (!this.mapData) return;

    // Rotate and animate fuel canisters
    for (const pickup of this.mapData.fuelPickups) {
      if (pickup.collected) continue;

      pickup.mesh.rotation.y += delta * 2.5;
      pickup.mesh.position.y = 0.4 + Math.sin(this.levelTimer * 3 + pickup.position.x) * 0.12;

      // Distance to truck
      const dist = this.truckPos.distanceTo(pickup.position);
      if (dist < 1.8) {
        pickup.collected = true;
        pickup.mesh.visible = false;

        // Restore fuel
        const restoreAmount = 45;
        this.currentFuel = Math.min(this.maxFuel, this.currentFuel + restoreAmount);
        sound.playFuelPickup();
        this.events.onFloatingNotification(`+${restoreAmount}L REFUELED!`, 'fuel');
      }
    }
  }

  private updateCamera(delta: number) {
    // Smooth dampened isometric camera follow
    const camOffset = new THREE.Vector3(22, 26, 22);
    const targetCamPos = this._vec3B.copy(this.truckPos).add(camOffset);

    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetCamPos.x, 4.5, delta);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, targetCamPos.y, 4.5, delta);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetCamPos.z, 4.5, delta);

    this.camera.lookAt(this.truckPos.x, 0.5, this.truckPos.z);
  }

  private finishLevelVictory() {
    sound.stopEngine();
    sound.playVictoryFanfare();

    // Calculate stars:
    // 3 Stars: Time under par time AND max combo >= 2.0
    // 2 Stars: Time under par time * 1.35
    // 1 Star: Completed
    let stars = 1;
    if (this.levelTimer <= this.level.parTimeSeconds && this.maxComboReached >= 2.0) {
      stars = 3;
    } else if (this.levelTimer <= this.level.parTimeSeconds * 1.35) {
      stars = 2;
    }

    const totalReward = this.level.baseReward + this.totalLevelCash;
    this.events.onLevelComplete(
      this.levelTimer,
      stars,
      totalReward,
      this.maxComboReached
    );
  }

  public refuelEmergency(cost: number) {
    this.currentFuel = this.maxFuel * 0.65;
    this.isLevelFinished = false;
    sound.startEngine();
    sound.playFuelPickup();
    this.events.onFloatingNotification(`Roadside Fuel Delivery (-$${cost})`, 'fuel');
  }

  private onWindowResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const aspect = width / height;
    const viewSize = 22;

    this.camera.left = (-viewSize * aspect) / 2;
    this.camera.right = (viewSize * aspect) / 2;
    this.camera.top = viewSize / 2;
    this.camera.bottom = -viewSize / 2;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  };

  public dispose() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    sound.stopEngine();
    window.removeEventListener('resize', this.onWindowResize);

    if (this.particles) this.particles.dispose();
    if (this.snowGrid) this.snowGrid.dispose();

    if (this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
