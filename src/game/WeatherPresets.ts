/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WeatherConfig, WeatherType } from '../types/game.ts';

export const WEATHER_PRESETS: Record<WeatherType, WeatherConfig> = {
  sunny_crisp: {
    id: 'sunny_crisp',
    name: 'Crisp Morning Sun',
    description: 'Bright low winter sun with sparkling drifts and firm traction.',
    tractionFactor: 1.0,
    snowParticleCount: 450,
    windSpeed: 0.8,
    skyColor: '#D8ECF8',
    sunColor: '#FFF4E0',
    ambientColor: '#B0CEE5',
    fogColor: '#C4DEEF',
    fogDensity: 0.007,
  },
  gentle_flurries: {
    id: 'gentle_flurries',
    name: 'Gentle Flurries',
    description: 'Soft powder falling quietly over cozy suburban roofs.',
    tractionFactor: 0.88,
    snowParticleCount: 900,
    windSpeed: 1.4,
    skyColor: '#C0D5E6',
    sunColor: '#F2E8DC',
    ambientColor: '#9EBBD2',
    fogColor: '#ADC7DB',
    fogDensity: 0.010,
  },
  freezing_ice: {
    id: 'freezing_ice',
    name: 'Freezing Ice Glaze',
    description: 'Black ice under snow; vehicles slide easily without snow chains.',
    tractionFactor: 0.48,
    snowParticleCount: 650,
    windSpeed: 2.2,
    skyColor: '#A8BED4',
    sunColor: '#D4E8F8',
    ambientColor: '#8AA5BF',
    fogColor: '#96AFCA',
    fogDensity: 0.012,
  },
  powder_blizzard: {
    id: 'powder_blizzard',
    name: 'Powder Blizzard',
    description: 'Heavy swirling snowdrifts with reduced visibility and gusty winds.',
    tractionFactor: 0.70,
    snowParticleCount: 1800,
    windSpeed: 3.8,
    skyColor: '#90A8BC',
    sunColor: '#E0E8F0',
    ambientColor: '#7A93A8',
    fogColor: '#869EAE',
    fogDensity: 0.016,
  },
};
