/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameScreen = 
  | 'TITLE'
  | 'LEVEL_SELECT'
  | 'PLAYING'
  | 'PAUSED'
  | 'LEVEL_CLEAR'
  | 'OUT_OF_FUEL'
  | 'GARAGE'
  | 'LEADERBOARD'
  | 'SEASONAL';

export type WeatherType = 'sunny_crisp' | 'gentle_flurries' | 'freezing_ice' | 'powder_blizzard';

export type TruckSkin = 'classic_red' | 'yellow_beaver' | 'glacier_yeti' | 'midnight_hunter';

export interface WeatherConfig {
  id: WeatherType;
  name: string;
  description: string;
  tractionFactor: number; // 1.0 normal, 0.45 ice
  snowParticleCount: number;
  windSpeed: number;
  skyColor: string;
  sunColor: string;
  ambientColor: string;
  fogColor: string;
  fogDensity: number;
}

export interface DrivewayData {
  id: number;
  homeownerName: string;
  houseColor: string;
  roofColor: string;
  bounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
  totalSnowCells: number;
  clearedSnowCells: number;
  percentCleared: number;
  isCompleted: boolean;
  tipAmount: number;
  targetPercent: number; // typically 90%
}

export interface LevelConfig {
  id: number;
  name: string;
  description: string;
  seed: number;
  drivewayCount: number;
  parTimeSeconds: number;
  weather: WeatherType;
  baseReward: number;
  difficulty: 'Easy' | 'Medium' | 'Challenging' | 'Expert';
}

export interface UpgradeTiers {
  bladeTier: 1 | 2 | 3;
  fuelTankTier: 1 | 2 | 3;
  chainsTier: 1 | 2 | 3;
  blowerTier: 1 | 2 | 3;
  selectedSkin: TruckSkin;
}

export interface SeasonalUnlock {
  id: string;
  title: string;
  season: 'Fall Frost' | 'Winter Solstice' | 'Deep Blizzard' | 'Spring Thaw';
  description: string;
  requirement: string;
  isUnlocked: boolean;
  rewardType: 'skin' | 'perk';
  rewardValue: string;
}

export interface LeaderboardRecord {
  id: string;
  levelId: number;
  levelName: string;
  timeSeconds: number;
  stars: number;
  maxCombo: number;
  cashEarned: number;
  date: string;
}

export interface PlayerSaveData {
  cash: number;
  starsTotal: number;
  unlockedLevels: number[];
  upgrades: UpgradeTiers;
  unlockedSkins: TruckSkin[];
  unlockedSeasonals: string[];
  leaderboards: LeaderboardRecord[];
  soundMuted: boolean;
}

export interface DriveInput {
  throttle: number; // -1 (reverse) to 1 (forward)
  steering: number; // -1 (left) to 1 (right)
  bladeDown: boolean;
  boost: boolean;
  blowerActive: boolean;
}
