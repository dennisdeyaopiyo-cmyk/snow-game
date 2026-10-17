/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LevelConfig, SeasonalUnlock } from '../types/game.ts';

export const CAMPAIGN_LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Pineberry Cul-de-Sac',
    description: 'A cozy starter court with 2 snowy driveways and sunny morning skies.',
    seed: 1042,
    drivewayCount: 2,
    parTimeSeconds: 65,
    weather: 'sunny_crisp',
    baseReward: 160,
    difficulty: 'Easy',
  },
  {
    id: 2,
    name: 'Frosty Oaks Avenue',
    description: 'Three family homes along a tree-lined lane with gentle morning flurries.',
    seed: 2088,
    drivewayCount: 3,
    parTimeSeconds: 95,
    weather: 'gentle_flurries',
    baseReward: 260,
    difficulty: 'Medium',
  },
  {
    id: 3,
    name: 'Maple Ridge Slopes',
    description: 'Four winding driveways coated in freezing drizzle. Watch for slick turns!',
    seed: 3941,
    drivewayCount: 4,
    parTimeSeconds: 130,
    weather: 'freezing_ice',
    baseReward: 400,
    difficulty: 'Challenging',
  },
  {
    id: 4,
    name: 'Timberline Estates',
    description: 'Five large double-car driveways nestled among tall pines during heavy snow.',
    seed: 4820,
    drivewayCount: 5,
    parTimeSeconds: 165,
    weather: 'powder_blizzard',
    baseReward: 550,
    difficulty: 'Challenging',
  },
  {
    id: 5,
    name: 'Glacier Peak Boulevard',
    description: 'Six snowbound luxury houses on icy cul-de-sacs. The ultimate plowing challenge!',
    seed: 5712,
    drivewayCount: 6,
    parTimeSeconds: 210,
    weather: 'freezing_ice',
    baseReward: 800,
    difficulty: 'Expert',
  },
];

export const SEASONAL_UNLOCKS_DATA: SeasonalUnlock[] = [
  {
    id: 'season_yellow_beaver',
    title: 'Safety Beaver Livery',
    season: 'Fall Frost',
    description: 'Vibrant municipal safety yellow paint with dual hazard chevrons.',
    requirement: 'Clear Pineberry Cul-de-Sac with at least 2 Stars.',
    isUnlocked: false,
    rewardType: 'skin',
    rewardValue: 'yellow_beaver',
  },
  {
    id: 'season_glacier_yeti',
    title: 'Glacier Yeti Camo',
    season: 'Winter Solstice',
    description: 'Arctic cyan freeze-pattern coating with frost-resistant enamel.',
    requirement: 'Achieve a 3.0x Combo Multiplier during any level shift.',
    isUnlocked: false,
    rewardType: 'skin',
    rewardValue: 'glacier_yeti',
  },
  {
    id: 'season_midnight_hunter',
    title: 'Midnight Hunter Stealth',
    season: 'Deep Blizzard',
    description: 'Matte obsidian body with golden reflector decals for late night shifts.',
    requirement: 'Clear Maple Ridge Slopes on icy conditions without running out of fuel.',
    isUnlocked: false,
    rewardType: 'skin',
    rewardValue: 'midnight_hunter',
  },
  {
    id: 'season_spring_thaw_perk',
    title: 'Salt Spreader Warmth',
    season: 'Spring Thaw',
    description: 'Clears snow 15% faster around driveway edges.',
    requirement: 'Accumulate 10 total Stars across suburban neighborhoods.',
    isUnlocked: false,
    rewardType: 'perk',
    rewardValue: 'salt_boost',
  },
];
