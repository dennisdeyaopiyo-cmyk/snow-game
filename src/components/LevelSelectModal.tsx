/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LevelConfig, WeatherType } from '../types/game.ts';
import { CAMPAIGN_LEVELS } from '../game/Levels.ts';
import { WEATHER_PRESETS } from '../game/WeatherPresets.ts';
import { sound } from '../audio/SoundEffects.ts';
import { X, Play, Clock, Home, Sun, CloudSnow, Zap, Shuffle } from 'lucide-react';

interface LevelSelectModalProps {
  unlockedLevels: number[];
  selectedLevelId: number;
  onSelectLevel: (level: LevelConfig) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  unlockedLevels,
  selectedLevelId,
  onSelectLevel,
  onClose,
}) => {
  const [customSeed, setCustomSeed] = useState<number>(7741);
  const [customWeather, setCustomWeather] = useState<WeatherType>('powder_blizzard');
  const [customDriveways, setCustomDriveways] = useState<number>(4);

  const getWeatherIcon = (weatherId: WeatherType) => {
    switch (weatherId) {
      case 'sunny_crisp':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'gentle_flurries':
      case 'powder_blizzard':
        return <CloudSnow className="w-4 h-4 text-cyan-300" />;
      case 'freezing_ice':
        return <Zap className="w-4 h-4 text-blue-400" />;
    }
  };

  const handleStartCustomSeed = () => {
    sound.playUIClick();
    const customConfig: LevelConfig = {
      id: 99,
      name: `Custom Court #${customSeed}`,
      description: `Procedurally generated suburban sector with seed ${customSeed}.`,
      seed: customSeed,
      drivewayCount: customDriveways,
      parTimeSeconds: 50 + customDriveways * 25,
      weather: customWeather,
      baseReward: 200 + customDriveways * 80,
      difficulty: customDriveways >= 5 ? 'Challenging' : 'Medium',
    };
    onSelectLevel(customConfig);
  };

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Select Suburban Neighborhood</span>
            </h2>
            <p className="text-xs text-slate-400">Clear driveways across town or create custom procedural seeds</p>
          </div>

          <button
            onClick={() => {
              sound.playUIClick();
              onClose();
            }}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level List */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Campaign Neighborhoods
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {CAMPAIGN_LEVELS.map(lvl => {
              const isUnlocked = unlockedLevels.includes(lvl.id);
              const isSelected = selectedLevelId === lvl.id;
              const weather = WEATHER_PRESETS[lvl.weather];

              return (
                <div
                  key={lvl.id}
                  onClick={() => {
                    if (isUnlocked) {
                      sound.playUIClick();
                      onSelectLevel(lvl);
                    }
                  }}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-400 ring-2 ring-amber-400/20 shadow-lg cursor-pointer'
                      : isUnlocked
                      ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80 cursor-pointer'
                      : 'bg-slate-950/30 border-slate-800/40 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          Level {lvl.id}
                        </span>
                        <span className={`text-[10px] font-bold ${
                          lvl.difficulty === 'Easy' ? 'text-emerald-400' :
                          lvl.difficulty === 'Medium' ? 'text-amber-400' :
                          lvl.difficulty === 'Challenging' ? 'text-orange-400' : 'text-rose-400'
                        }`}>
                          {lvl.difficulty}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white mt-1">{lvl.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{lvl.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-slate-300">
                        <Home className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-mono-numbers">{lvl.drivewayCount} driveways</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-sky-400" />
                        <span className="font-mono-numbers">{lvl.parTimeSeconds}s</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs">
                      {getWeatherIcon(lvl.weather)}
                      <span className="text-[11px] text-slate-300 truncate max-w-[80px]">
                        {weather.name}
                      </span>
                    </div>
                  </div>

                  {isUnlocked && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playUIClick();
                        onSelectLevel(lvl);
                      }}
                      className="w-full mt-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play Shift</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Endless Procedural Seed Generator */}
          <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col gap-3 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shuffle className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-bold text-white">Procedural Seed Generator</span>
              </div>
              <button
                onClick={() => {
                  sound.playUIClick();
                  setCustomSeed(Math.floor(Math.random() * 90000) + 1000);
                }}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
              >
                Randomize Seed
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 font-semibold mb-1 block">Seed Number:</label>
                <input
                  type="number"
                  value={customSeed}
                  onChange={(e) => setCustomSeed(parseInt(e.target.value) || 1000)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono-numbers"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold mb-1 block">Driveways:</label>
                <select
                  value={customDriveways}
                  onChange={(e) => setCustomDriveways(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                >
                  <option value={2}>2 Homes (Quick)</option>
                  <option value={3}>3 Homes (Standard)</option>
                  <option value={4}>4 Homes (Moderate)</option>
                  <option value={5}>5 Homes (Long)</option>
                  <option value={6}>6 Homes (Epic)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold mb-1 block">Weather System:</label>
                <select
                  value={customWeather}
                  onChange={(e) => setCustomWeather(e.target.value as WeatherType)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                >
                  <option value="sunny_crisp">Sunny Morning (Dry)</option>
                  <option value="gentle_flurries">Gentle Flurries</option>
                  <option value="freezing_ice">Freezing Ice (Slick Drift)</option>
                  <option value="powder_blizzard">Powder Blizzard</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleStartCustomSeed}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-colors mt-1"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Seed #{customSeed}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
