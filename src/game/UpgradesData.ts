/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UpgradeTiers } from '../types/game.ts';

export interface UpgradeDetail {
  tier: 1 | 2 | 3;
  name: string;
  description: string;
  cost: number;
  perkText: string;
}

export const BLADE_UPGRADES: UpgradeDetail[] = [
  {
    tier: 1,
    name: 'Standard 2.2m Steel Blade',
    description: 'Dependable factory steel plow blade for residential snow clearing.',
    cost: 0,
    perkText: 'Base 2.2m sweep path width',
  },
  {
    tier: 2,
    name: 'Commercial 3.2m V-Plow',
    description: 'Angled dual-wing blade that funnels snow efficiently to both curbs.',
    cost: 250,
    perkText: '+45% wider sweep path & faster clear rate',
  },
  {
    tier: 3,
    name: 'Titan 4.4m Highway Wing',
    description: 'Heavy municipal wing plow with hydraulic side extension.',
    cost: 650,
    perkText: '+100% ultra-wide sweep radius & auto-berm stacking',
  },
];

export const FUEL_UPGRADES: UpgradeDetail[] = [
  {
    tier: 1,
    name: 'Stock 100L Fuel Tank',
    description: 'Factory diesel tank suitable for short suburban cul-de-sacs.',
    cost: 0,
    perkText: '100L capacity',
  },
  {
    tier: 2,
    name: 'High-Capacity 160L Saddle Tank',
    description: 'Dual side-mounted fuel tanks allowing longer uninterrupted plowing runs.',
    cost: 220,
    perkText: '160L capacity (+60% shift endurance)',
  },
  {
    tier: 3,
    name: 'Eco-Turbo 240L Heavy Cell',
    description: 'Direct-injection auxiliary cell with high-efficiency diesel combustion.',
    cost: 520,
    perkText: '240L capacity & 25% reduced fuel burn during heavy plowing',
  },
];

export const CHAINS_UPGRADES: UpgradeDetail[] = [
  {
    tier: 1,
    name: 'All-Season M+S Radials',
    description: 'Standard suburban winter tires. Noticeable slip on freezing rain and ice.',
    cost: 0,
    perkText: 'Baseline traction (drifts on ice)',
  },
  {
    tier: 2,
    name: 'Front Studded Grippers',
    description: 'Carbide-tipped tire studs on front steer wheels to curb understeer.',
    cost: 180,
    perkText: '+40% grip on ice & sharper steering response',
  },
  {
    tier: 3,
    name: 'Diamond-Link Alloy Chains',
    description: 'Full 4-wheel manganese alloy chains for unshakeable grip on frozen driveways.',
    cost: 450,
    perkText: '+85% ice traction with zero unwanted lateral slippage',
  },
];

export const BLOWER_UPGRADES: UpgradeDetail[] = [
  {
    tier: 1,
    name: 'No Blower Attachment',
    description: 'Pure blade pushing. Snow collects directly against the moldboard.',
    cost: 0,
    perkText: 'Standard blade snow push',
  },
  {
    tier: 2,
    name: 'Hydraulic Side Chute',
    description: 'Rotary auger throws pushed snow over driveway curbs automatically.',
    cost: 300,
    perkText: 'Throws snow + extended combo window (+1.5s)',
  },
  {
    tier: 3,
    name: 'High-Flow Turbo Impeller',
    description: 'Dual-stage industrial turbine that pulverizes heavy drifts into fine powder.',
    cost: 700,
    perkText: 'Supercharged snow geyser + 20% cash tip bonus on every driveway',
  },
];

export const DEFAULT_UPGRADES: UpgradeTiers = {
  bladeTier: 1,
  fuelTankTier: 1,
  chainsTier: 1,
  blowerTier: 1,
  selectedSkin: 'classic_red',
};
