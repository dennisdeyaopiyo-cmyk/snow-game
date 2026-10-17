/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { 
  DriveInput, 
  DrivewayData, 
  GameScreen, 
  LeaderboardRecord, 
  LevelConfig, 
  PlayerSaveData, 
  TruckSkin 
} from './types/game.ts';
import { CAMPAIGN_LEVELS, SEASONAL_UNLOCKS_DATA } from './game/Levels.ts';
import { WEATHER_PRESETS } from './game/WeatherPresets.ts';
import { FrostPlowGameEngine } from './game/GameEngine.ts';
import { 
  loadSaveData, 
  saveSaveData, 
  addLeaderboardRecord 
} from './utils/storage.ts';
import { sound } from './audio/SoundEffects.ts';

import { HUDOverlay } from './components/HUDOverlay.tsx';
import { TouchControls } from './components/TouchControls.tsx';
import { TitleScreen } from './components/TitleScreen.tsx';
import { GarageModal } from './components/GarageModal.tsx';
import { LevelSelectModal } from './components/LevelSelectModal.tsx';
import { LeaderboardModal } from './components/LeaderboardModal.tsx';
import { SeasonalModal } from './components/SeasonalModal.tsx';
import { VictoryModal } from './components/VictoryModal.tsx';
import { OutOfFuelModal } from './components/OutOfFuelModal.tsx';
import { PauseModal } from './components/PauseModal.tsx';

export default function App() {
  const [saveData, setSaveData] = useState<PlayerSaveData>(() => loadSaveData());
  const [screen, setScreen] = useState<GameScreen>('TITLE');
  const [currentLevel, setCurrentLevel] = useState<LevelConfig>(CAMPAIGN_LEVELS[0]);

  // Active Game State
  const [fuel, setFuel] = useState<number>(100);
  const [maxFuel, setMaxFuel] = useState<number>(100);
  const [comboMultiplier, setComboMultiplier] = useState<number>(1.0);
  const [comboCount, setComboCount] = useState<number>(0);
  const [driveways, setDriveways] = useState<DrivewayData[]>([]);
  const [levelTimer, setLevelTimer] = useState<number>(0);
  const [cashEarnedShift, setCashEarnedShift] = useState<number>(0);

  // Victory / Game over state
  const [victoryStats, setVictoryStats] = useState<{
    timeSeconds: number;
    stars: number;
    cashEarned: number;
    maxCombo: number;
  }>({ timeSeconds: 0, stars: 1, cashEarned: 0, maxCombo: 1.0 });

  // Floating notifications
  const [floatingNotification, setFloatingNotification] = useState<{
    text: string;
    type: 'combo' | 'cash' | 'fuel' | 'warning';
    id: number;
  } | null>(null);

  // Control state
  const [isBladeDown, setIsBladeDown] = useState<boolean>(true);
  const [isBoosting, setIsBoosting] = useState<boolean>(false);

  // Three.js Mount Container & Engine Instance Ref
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<FrostPlowGameEngine | null>(null);

  // Sync mute state on mount
  useEffect(() => {
    sound.setMuted(saveData.soundMuted);
  }, [saveData.soundMuted]);

  // Floating notification helper
  const showFloatingNotice = useCallback((text: string, type: 'combo' | 'cash' | 'fuel' | 'warning') => {
    const notice = { text, type, id: Date.now() };
    setFloatingNotification(notice);
    setTimeout(() => {
      setFloatingNotification(prev => (prev?.id === notice.id ? null : prev));
    }, 2400);
  }, []);

  // Initialize or Rebuild Three.js Game Engine
  const startShift = useCallback((levelToPlay: LevelConfig) => {
    if (!canvasMountRef.current) return;

    // Dispose old engine if any
    if (engineRef.current) {
      engineRef.current.dispose();
      engineRef.current = null;
    }

    setCurrentLevel(levelToPlay);
    setLevelTimer(0);
    setCashEarnedShift(0);
    setComboMultiplier(1.0);
    setComboCount(0);
    setIsBladeDown(true);
    setIsBoosting(false);

    const engine = new FrostPlowGameEngine(
      canvasMountRef.current,
      levelToPlay,
      saveData.upgrades,
      {
        onFuelChange: (cur, max) => {
          setFuel(cur);
          setMaxFuel(max);
        },
        onComboChange: (combo, count) => {
          setComboMultiplier(combo);
          setComboCount(count);
        },
        onDrivewayProgress: (dws) => {
          setDriveways(dws);
        },
        onDrivewayCleared: (_dw, tipEarned) => {
          setCashEarnedShift(prev => prev + tipEarned);
        },
        onLevelComplete: (timeSec, stars, totalReward, maxCombo) => {
          setVictoryStats({
            timeSeconds: timeSec,
            stars,
            cashEarned: totalReward,
            maxCombo,
          });

          // Update save data & leaderboard
          setSaveData(prev => {
            const nextCash = prev.cash + totalReward;
            const nextStars = prev.starsTotal + stars;
            const nextUnlocked = [...prev.unlockedLevels];
            if (!nextUnlocked.includes(levelToPlay.id + 1) && levelToPlay.id < 5) {
              nextUnlocked.push(levelToPlay.id + 1);
            }

            // Check seasonal achievements
            const nextSeasonals = [...prev.unlockedSeasonals];
            const nextSkins = [...prev.unlockedSkins];

            if (levelToPlay.id === 1 && stars >= 2 && !nextSeasonals.includes('season_yellow_beaver')) {
              nextSeasonals.push('season_yellow_beaver');
              if (!nextSkins.includes('yellow_beaver')) nextSkins.push('yellow_beaver');
            }
            if (maxCombo >= 3.0 && !nextSeasonals.includes('season_glacier_yeti')) {
              nextSeasonals.push('season_glacier_yeti');
              if (!nextSkins.includes('glacier_yeti')) nextSkins.push('glacier_yeti');
            }
            if (levelToPlay.id === 3 && !nextSeasonals.includes('season_midnight_hunter')) {
              nextSeasonals.push('season_midnight_hunter');
              if (!nextSkins.includes('midnight_hunter')) nextSkins.push('midnight_hunter');
            }
            if (nextStars >= 10 && !nextSeasonals.includes('season_spring_thaw_perk')) {
              nextSeasonals.push('season_spring_thaw_perk');
            }

            const updated: PlayerSaveData = {
              ...prev,
              cash: nextCash,
              starsTotal: nextStars,
              unlockedLevels: nextUnlocked,
              unlockedSeasonals: nextSeasonals,
              unlockedSkins: nextSkins,
            };
            saveSaveData(updated);
            return updated;
          });

          // Add leaderboard record
          const record: LeaderboardRecord = {
            id: `rec_${Date.now()}`,
            levelId: levelToPlay.id,
            levelName: levelToPlay.name,
            timeSeconds: timeSec,
            stars,
            maxCombo,
            cashEarned: totalReward,
            date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          };
          addLeaderboardRecord(record);

          setScreen('LEVEL_CLEAR');
        },
        onOutOfFuel: () => {
          setScreen('OUT_OF_FUEL');
        },
        onFloatingNotification: (text, type) => {
          showFloatingNotice(text, type);
        },
      }
    );

    engineRef.current = engine;
    setScreen('PLAYING');
  }, [saveData.upgrades, showFloatingNotice]);

  // Clean mount/unmount of Three.js canvas
  useEffect(() => {
    // Start initial live world in Title screen mode
    if (canvasMountRef.current && !engineRef.current) {
      startShift(CAMPAIGN_LEVELS[0]);
      setScreen('TITLE'); // set back to title so player begins at title screen
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
    };
  }, [startShift]);

  // Control Handlers
  const handleInputChange = useCallback((input: DriveInput) => {
    if (engineRef.current && screen === 'PLAYING') {
      engineRef.current.setInput(input);
    }
  }, [screen]);

  const handleToggleBlade = useCallback(() => {
    setIsBladeDown(prev => {
      const next = !prev;
      if (engineRef.current) {
        engineRef.current.setInput({
          throttle: 0,
          steering: 0,
          bladeDown: next,
          boost: isBoosting,
          blowerActive: false,
        });
      }
      return next;
    });
  }, [isBoosting]);

  const handleToggleBoost = useCallback(() => {
    setIsBoosting(prev => {
      const next = !prev;
      if (engineRef.current) {
        engineRef.current.setInput({
          throttle: 0,
          steering: 0,
          bladeDown: isBladeDown,
          boost: next,
          blowerActive: false,
        });
      }
      return next;
    });
  }, [isBladeDown]);

  const handleToggleMute = useCallback(() => {
    setSaveData(prev => {
      const nextMuted = !prev.soundMuted;
      sound.setMuted(nextMuted);
      const updated = { ...prev, soundMuted: nextMuted };
      saveSaveData(updated);
      return updated;
    });
  }, []);

  // Upgrades
  const handleUpgradeTier = (
    category: 'bladeTier' | 'fuelTankTier' | 'chainsTier' | 'blowerTier',
    nextTier: 1 | 2 | 3,
    cost: number
  ) => {
    if (saveData.cash < cost) return;
    sound.playDrivewayCleared();

    setSaveData(prev => {
      const updated: PlayerSaveData = {
        ...prev,
        cash: prev.cash - cost,
        upgrades: {
          ...prev.upgrades,
          [category]: nextTier,
        },
      };
      saveSaveData(updated);
      if (engineRef.current) {
        engineRef.current.updateUpgrades(updated.upgrades);
      }
      return updated;
    });
  };

  const handleSelectSkin = (skin: TruckSkin) => {
    setSaveData(prev => {
      const updated: PlayerSaveData = {
        ...prev,
        upgrades: {
          ...prev.upgrades,
          selectedSkin: skin,
        },
      };
      saveSaveData(updated);
      if (engineRef.current) {
        engineRef.current.updateUpgrades(updated.upgrades);
      }
      return updated;
    });
  };

  const weather = WEATHER_PRESETS[currentLevel.weather] || WEATHER_PRESETS.sunny_crisp;

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 font-sans">
      {/* 1. Isolated Three.js Canvas Container */}
      <div 
        ref={canvasMountRef} 
        className="absolute inset-0 w-full h-full overflow-hidden touch-none" 
      />

      {/* 2. In-Game HUD Overlay (When actively playing or paused) */}
      {(screen === 'PLAYING' || screen === 'PAUSED') && (
        <>
          <HUDOverlay
            level={currentLevel}
            weather={weather}
            fuel={fuel}
            maxFuel={maxFuel}
            driveways={driveways}
            comboMultiplier={comboMultiplier}
            comboCount={comboCount}
            levelTimer={levelTimer}
            cash={saveData.cash + cashEarnedShift}
            floatingMessage={floatingNotification}
            onPause={() => setScreen('PAUSED')}
            isBladeDown={isBladeDown}
            isBoosting={isBoosting}
            onToggleBlade={handleToggleBlade}
            onToggleBoost={handleToggleBoost}
            isSoundMuted={saveData.soundMuted}
            onToggleMute={handleToggleMute}
          />

          <TouchControls
            onInputChange={handleInputChange}
            isBladeDown={isBladeDown}
            onToggleBlade={handleToggleBlade}
            isBoosting={isBoosting}
            onToggleBoost={handleToggleBoost}
            onPause={() => setScreen('PAUSED')}
          />
        </>
      )}

      {/* 3. Title Screen */}
      {screen === 'TITLE' && (
        <TitleScreen
          onStartGame={() => {
            startShift(currentLevel);
          }}
          onOpenGarage={() => setScreen('GARAGE')}
          onOpenLevels={() => setScreen('LEVEL_SELECT')}
          onOpenLeaderboard={() => setScreen('LEADERBOARD')}
          onOpenSeasonal={() => setScreen('SEASONAL')}
          isSoundMuted={saveData.soundMuted}
          onToggleMute={handleToggleMute}
          totalStars={saveData.starsTotal}
          cash={saveData.cash}
        />
      )}

      {/* 4. Pause Modal */}
      {screen === 'PAUSED' && (
        <PauseModal
          onResume={() => setScreen('PLAYING')}
          onRestart={() => startShift(currentLevel)}
          onReturnTitle={() => setScreen('TITLE')}
          isSoundMuted={saveData.soundMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* 5. Victory Modal */}
      {screen === 'LEVEL_CLEAR' && (
        <VictoryModal
          level={currentLevel}
          timeSeconds={victoryStats.timeSeconds}
          stars={victoryStats.stars}
          cashEarned={victoryStats.cashEarned}
          maxCombo={victoryStats.maxCombo}
          onNextLevel={() => {
            const nextIdx = CAMPAIGN_LEVELS.findIndex(l => l.id === currentLevel.id) + 1;
            const nextLvl = CAMPAIGN_LEVELS[nextIdx] || CAMPAIGN_LEVELS[0];
            startShift(nextLvl);
          }}
          onRestart={() => startShift(currentLevel)}
          onOpenGarage={() => setScreen('GARAGE')}
        />
      )}

      {/* 6. Out of Fuel Modal */}
      {screen === 'OUT_OF_FUEL' && (
        <OutOfFuelModal
          cash={saveData.cash}
          onCallRoadside={(cost) => {
            setSaveData(prev => {
              const updated = { ...prev, cash: Math.max(0, prev.cash - cost) };
              saveSaveData(updated);
              return updated;
            });
            if (engineRef.current) {
              engineRef.current.refuelEmergency(cost);
            }
            setScreen('PLAYING');
          }}
          onRestart={() => startShift(currentLevel)}
          onReturnTitle={() => setScreen('TITLE')}
        />
      )}

      {/* 7. Garage Modal */}
      {screen === 'GARAGE' && (
        <GarageModal
          upgrades={saveData.upgrades}
          cash={saveData.cash}
          unlockedSkins={saveData.unlockedSkins}
          onUpgradeTier={handleUpgradeTier}
          onSelectSkin={handleSelectSkin}
          onClose={() => setScreen('TITLE')}
        />
      )}

      {/* 8. Level Select Modal */}
      {screen === 'LEVEL_SELECT' && (
        <LevelSelectModal
          unlockedLevels={saveData.unlockedLevels}
          selectedLevelId={currentLevel.id}
          onSelectLevel={(lvl) => {
            startShift(lvl);
          }}
          onClose={() => setScreen('TITLE')}
        />
      )}

      {/* 9. Leaderboard Modal */}
      {screen === 'LEADERBOARD' && (
        <LeaderboardModal
          records={saveData.leaderboards}
          onClearRecords={() => {
            setSaveData(prev => {
              const updated: PlayerSaveData = { ...prev, leaderboards: [] };
              saveSaveData(updated);
              return updated;
            });
          }}
          onClose={() => setScreen('TITLE')}
        />
      )}

      {/* 10. Seasonal Unlocks Modal */}
      {screen === 'SEASONAL' && (
        <SeasonalModal
          unlockedSeasonalIds={saveData.unlockedSeasonals}
          onClose={() => setScreen('TITLE')}
        />
      )}
    </div>
  );
}
