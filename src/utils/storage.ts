/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LeaderboardRecord, PlayerSaveData } from '../types/game.ts';
import { DEFAULT_UPGRADES } from '../game/UpgradesData.ts';

const STORAGE_KEY = 'frostplow_3d_save_data_v1';

export const INITIAL_SAVE_DATA: PlayerSaveData = {
  cash: 100, // starting starter cash
  starsTotal: 0,
  unlockedLevels: [1],
  upgrades: { ...DEFAULT_UPGRADES },
  unlockedSkins: ['classic_red'],
  unlockedSeasonals: [],
  leaderboards: [
    {
      id: 'default_1',
      levelId: 1,
      levelName: 'Pineberry Cul-de-Sac',
      timeSeconds: 58.4,
      stars: 3,
      maxCombo: 3.0,
      cashEarned: 220,
      date: 'Recent Shift',
    },
    {
      id: 'default_2',
      levelId: 2,
      levelName: 'Frosty Oaks Avenue',
      timeSeconds: 88.2,
      stars: 2,
      maxCombo: 2.0,
      cashEarned: 310,
      date: 'Recent Shift',
    },
  ],
  soundMuted: false,
};

export function loadSaveData(): PlayerSaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...INITIAL_SAVE_DATA };
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_SAVE_DATA,
      ...parsed,
      upgrades: {
        ...INITIAL_SAVE_DATA.upgrades,
        ...(parsed.upgrades || {}),
      },
      unlockedLevels: Array.isArray(parsed.unlockedLevels) ? parsed.unlockedLevels : [1],
      unlockedSkins: Array.isArray(parsed.unlockedSkins) ? parsed.unlockedSkins : ['classic_red'],
      leaderboards: Array.isArray(parsed.leaderboards) ? parsed.leaderboards : INITIAL_SAVE_DATA.leaderboards,
    };
  } catch {
    return { ...INITIAL_SAVE_DATA };
  }
}

export function saveSaveData(data: PlayerSaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage quota or privacy mode
  }
}

export function addLeaderboardRecord(record: LeaderboardRecord): PlayerSaveData {
  const current = loadSaveData();
  const filtered = current.leaderboards.filter(
    r => !(r.levelId === record.levelId && r.timeSeconds <= record.timeSeconds)
  );
  filtered.push(record);
  filtered.sort((a, b) => a.timeSeconds - b.timeSeconds);

  current.leaderboards = filtered.slice(0, 20); // keep top 20
  saveSaveData(current);
  return current;
}
