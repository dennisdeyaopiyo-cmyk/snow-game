# FrostPlow 3D — Cozy Isometric Snow Plowing Simulator

A cozy, tactile 3D isometric snow-plowing simulator built with Three.js and Web Audio API, where players clear suburban driveways on crisp winter mornings, chain satisfying clearing combos, manage fuel reserves, upgrade their rig, and master slick weather conditions across procedurally generated neighborhoods.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during the interactive planning interview and have been incorporated as core pillars:

- **Confirmed Driving Controls**: Virtual analog joystick with forward auto-drive toggle and reverse button for touchscreens and tablets, paired with full WASD / Arrow keyboard controls on desktop.
- **Confirmed Visual Atmosphere**: "Sunny crisp morning with bright skies and sparkling drifts" featuring warm directional sunlight, icy blue shadows, sparkling snow particles, and cozy wood-and-stone suburban houses.
- **Confirmed Plowing & Combo Pace**: "Satisfying continuous sweep streaks with cash and speed multipliers" that reward uninterrupted snow clearing with musical synth arpeggio milestones ($x1.5 \to x2.0 \to x3.0 \to x5.0$).
- **Local Persistence & Zero-Lag Architecture**: LocalStorage saves for neighborhood career progress, vehicle upgrades, seasonal unlocks, and leaderboard times with instant restart and zero network latency.

---

### 1. Overview & Core Concept

- **What It Does**: The player drives a customizable suburban snowplow truck through procedurally generated cul-de-sacs, avenues, and cozy residential neighborhoods. Each neighborhood has 3 to 7 snowed-in residential driveways, sidewalks, and cul-de-sacs. The player angles their blade, sweeps snow into roadside berms, avoids mailboxes and parked cars, manages their fuel tank, collects tips from grateful homeowners, and buys upgrades.
- **Target Audience / Persona**: Casual gamers, cozy simulator enthusiasts, and mobile/tablet players looking for satisfying tactile progression, relaxing winter vibes, and clean time-attack leaderboard challenges.
- **Key Value**: Delivers the tactile, satisfying "power-washing / snow-shoveling" feeling in a high-fidelity 3D isometric world with zero loading screens, pure procedural geometry, and real-time snow clearance feedback.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Title & Level Select**: Cinematic isometric camera slowly orbits a cozy snow-covered suburban house with chimney smoke and sparkling morning light. Bespoke title lockup, "Clear Driveways" primary CTA, and quick access to the Upgrade Garage, Seasonal Unlocks, and Neighborhood Leaderboards.
2. **The Run (Plowing Driveways)**:
   - The player spawns at the neighborhood crossroads. A minimap and driveway radar highlight pending snowed-in driveways with target percentages (e.g. 90% cleared required).
   - Driving through snow sweeps dynamic snow mesh tiles clean, kicks up powdery particles, and plays a rhythmic snow-crunch synth.
   - Chaining contiguous driveway sweeps elevates the Combo Multiplier ($1.0\times \to 5.0\times$), triggering escalating musical pentatonic chimes and earning bonus cash.
   - Plowing consumes fuel at a steady rate; the player can scoop up friendly gas canisters left by neighbors or refuel at the community fuel tank.
3. **Driveway Clear & Neighborhood Mastery**:
   - Clearing a driveway past 90% triggers a warm neighborhood cheer sound, celebratory snow-confetti burst, cash tip payout, and satisfied garage doors opening.
   - Completing all driveways unlocks the stage victory modal: stars awarded, time recorded to the local leaderboard, and funds transferred to the Upgrade Garage.
4. **Upgrade Garage**:
   - Upgrade plow blade width (Standard $\to$ Wide V-Plow $\to$ Heavy Highway Wing).
   - Upgrade engine & fuel tank capacity for longer shifts without refuelling.
   - Install studded snow chains for grip on black ice and frozen slopes.
   - Mount a rotary snow blower attachment for launching massive snow geysers.
5. **Seasonal Progression & Weather**:
   - Seasons progress through *First Frost*, *Midwinter Sun*, *Freezing Drizzle* (reduced tire traction and drift physics), and *Powder Solstice*.

#### Visual Identity & Theme
- **Color Palette**:
  - Dominant Canvas (60%): Crisp morning snow whites (`#F0F7FF`, `#E2EEF9`) with pale periwinkle shadow tones (`#C8DCEF`).
  - Structural World (30%): Deep suburban spruce green (`#1E3A2F`), warm cedar siding (`#8B4513`), slate roof tiles (`#2D3748`), and asphalt road grey (`#374151`).
  - Accent Budget (10%): Safety hazard amber (`#F59E0B`), warm cabin window glows (`#FBBF24`), cherry red plow chassis (`#EF4444`), and ice-sparkle cyan (`#38BDF8`).
- **Typography**:
  - Display/Hero: `Plus Jakarta Sans` with bold geometric hierarchy.
  - Telemetry & Leaderboard: `font-mono tabular-nums` for precision timers, combo meters, cash values, and fuel percentages.
- **View-First Ergonomics**:
  - Central 3D view remains 100% unobstructed.
  - Floating top-left mini HUD: Level name, driveways cleared ($2/4$), fuel bar, and cash.
  - Floating top-right mini HUD: Combo multiplier gauge and level timer.
  - Bottom controls: Ergonomic virtual joystick on left (for touch), auto-cruise / reverse toggle on right, plus keyboard shortcuts `[W,A,S,D]`, `[Space]`, and `[R]`.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Real-time Snow Clearance Model**:
  - *Chosen Approach*: Multi-layer procedural grid with dynamic height / density tiles and GPU particle spray. When the plow blade intersects snow cells, the snow height smoothly decrements, leaves plowed track decals, and tosses particle puffs to the side.
  - *Why*: Provides instant 60 FPS feedback on mobile devices without heavy vertex texture readbacks or unstable physics engines.
  - *Alternatives Considered*: Pure voxel physics (too slow on mobile Safari) or flat 2D mask overlays (lacks 3D physical depth).
- **Decision 2: Audio Synthesis via Web Audio API**:
  - *Chosen Approach*: 100% procedural Web Audio synthesizer nodes (bandpass noise for engine purr and snow scrape, resonant FM bell oscillators for combo chimes, harmonic fanfares for stage completion).
  - *Why*: Guarantees zero 404 network errors, instant sound response, and dynamic pitch variation keyed directly to vehicle speed and combo streaks.
- **Decision 3: Procedural Suburban Map Generator**:
  - *Chosen Approach*: Deterministic tile-based generator that places roads, intersections, cul-de-sacs, residential lots (houses with randomized porches, roofs, and chimneys), winding driveways, trees, mailboxes, and ice patches based on a level seed.
  - *Why*: Infinite level variety with predictable difficulty scaling, enabling unique daily seeds and fair local leaderboard comparisons.
- **Decision 4: Mobile-First Responsive Controls**:
  - *Chosen Approach*: Dual-mode control system: seamless auto-detect for pointer/touch inputs (virtual floating thumb joystick + tap buttons) and desktop keyboard input (WASD / Arrow Keys, Space for Plow Down/Up, R for Reverse).

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FrostPlow Game Shell                            │
│  ┌───────────────────────┐  ┌────────────────────────────────────────┐ │
│  │   GameState Manager   │  │       AudioEngine (Web Audio API)      │ │
│  │ (Title/Play/Garage/   │  │  - Engine Noise (Bandpass Filter)      │ │
│  │  Victory/Leaderboard) │  │  - Snow Scrape Synth                   │ │
│  └───────────┬───────────┘  │  - Melodic Arpeggio Combo Chimes       │ │
│              │              │  - Victory / Fuel Warning Pings        │ │
│              ▼              └──────────────────┬─────────────────────┘ │
│  ┌───────────────────────────────────────────┐ │                       │
│  │         Three.js Isometric Scene          │ │                       │
│  │  - Orthographic / Low-Angle Perspective   │ │                       │
│  │  - Studio Sun & PCF Soft Shadows          │ │                       │
│  │  - Multi-Part Procedural Plow Truck Mesh  │ │                       │
│  │  - Procedural Suburban Neighborhood Tiles │ │                       │
│  │  - Dynamic Snow Grid & Berm Meshes        │ │                       │
│  │  - Snow Particle Emitters & Wheel Trails  │ │                       │
│  └───────────────────┬───────────────────────┘ │                       │
│                      │                         │                       │
│                      ▼                         ▼                       │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                  Game Physics & Clearance Loop                    │ │
│  │  - Vehicle Kinematics (Acceleration, Steering, Weather Traction)  │ │
│  │  - Blade AABB & Circle Sweep Snow Collision                       │ │
│  │  - Fuel Burn & Refuel Trigger                                     │ │
│  │  - Combo Streak Calculator (Continuous Clearance Timer)           │ │
│  └───────────────────┬───────────────────────────────────────────────┘ │
│                      │                                                 │
│                      ▼                                                 │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │              HUD Overlays & Ergonomic Mobile Controls             │ │
│  │  - Top Bar: Fuel Gauge · Driveway Target % · Timer · Cash · Stars │ │
│  │  - Center: Dynamic Floating Combo Multiplier (x1.5 ... x5.0)      │ │
│  │  - Bottom Left: Virtual Analog Touch Joystick                     │ │
│  │  - Bottom Right: Reverse / Boost / Blade Toggle Touch Buttons     │ │
│  │  - Modals: Upgrade Garage · Seasonal Unlocks · Local Leaderboard  │ │
│  └───────────────────┬───────────────────────────────────────────────┘ │
│                      │                                                 │
│                      ▼                                                 │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                 LocalStorage Persistence Store                    │ │
│  │  - Cash Balance & Purchased Upgrades (Blade, Engine, Chains, Fan) │ │
│  │  - Completed Levels & Star Ratings (1-3 Stars)                    │ │
│  │  - Local Leaderboard per Level (Fastest Clear Times & High Scores)│ │
│  │  - Seasonal Unlocked Plow Skins (Yellow Beaver, Glacier Yeti)     │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

#### Data Model & State Entities
- **VehicleState**:
  - `x, z, rotation, velocity, steeringAngle, speed`
  - `fuel: number` (0 to 100), `maxFuel: number`
  - `isPlowing: boolean`, `bladeAngle: number`
  - `tractionFactor: number` (modified by current weather and snow chains upgrade)
- **UpgradeState**:
  - `bladeTier: 1 | 2 | 3` (Clearing radius + push efficiency)
  - `fuelTankTier: 1 | 2 | 3` (Tank capacity + efficiency)
  - `chainsTier: 1 | 2 | 3` (Ice grip + drift recovery)
  - `blowerTier: 1 | 2 | 3` (Auto-throw snow piles + cash bonus)
  - `selectedSkin: 'classic_red' | 'yellow_beaver' | 'glacier_yeti' | 'midnight_hunter'`
- **SnowGrid**:
  - 2D grid matrix covering neighborhood and driveways with cell status: `depth` (0.0 to 1.0), `isDriveway: boolean`, `drivewayId: number`, `isCleared: boolean`.
- **LeaderboardEntry**:
  - `{ levelId: number, levelName: string, clearTimeSeconds: number, comboMax: number, stars: number, date: string }`

#### Interactive Component & State Mapping
- **GameCanvas**: Mounts isolated Three.js canvas in `useRef` with zero React re-render interference during active 60 FPS loop.
- **HUDOverlay**: High-performance, pointer-events-none layout displaying clean numerical readouts, fuel warning alerts when $<20\%$, and combo streak banners.
- **TouchControls**: Responsive virtual thumbpad with touch-move tracking, auto-centering thumb knob, and large haptic-feel buttons.
- **GarageModal**: Interactive upgrade shop displaying truck stat bars, tier costs, unlock requirements, and visual preview.
- **LeaderboardModal**: Filterable record table showing best times, star ratings, and reset/export options.
- **WeatherEngine**: Dynamic ambient system transitioning between Crisp Sun, Flurries, Freezing Drizzle, and Blizzard, adjusting lighting, fog, and tire friction.
