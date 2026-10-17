/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DrivewayData, LevelConfig, WeatherConfig } from '../types/game.ts';
import { sound } from '../audio/SoundEffects.ts';
import { 
  Fuel, 
  Clock, 
  Coins, 
  Volume2, 
  VolumeX, 
  Pause, 
  ChevronDown, 
  ChevronUp, 
  Flame, 
  Sun, 
  CloudSnow, 
  Zap,
  Home
} from 'lucide-react';

interface HUDOverlayProps {
  level: LevelConfig;
  weather: WeatherConfig;
  fuel: number;
  maxFuel: number;
  driveways: DrivewayData[];
  comboMultiplier: number;
  comboCount: number;
  levelTimer: number;
  cash: number;
  floatingMessage: { text: string; type: 'combo' | 'cash' | 'fuel' | 'warning'; id: number } | null;
  onPause: () => void;
  isBladeDown: boolean;
  isBoosting: boolean;
  onToggleBlade: () => void;
  onToggleBoost: () => void;
  isSoundMuted: boolean;
  onToggleMute: () => void;
}

export const HUDOverlay: React.FC<HUDOverlayProps> = ({
  level,
  weather,
  fuel,
  maxFuel,
  driveways,
  comboMultiplier,
  comboCount,
  levelTimer,
  cash,
  floatingMessage,
  onPause,
  isBladeDown,
  isBoosting,
  onToggleBlade,
  onToggleBoost,
  isSoundMuted,
  onToggleMute,
}) => {
  const [showDrivewayDetails, setShowDrivewayDetails] = useState(false);

  const fuelPercent = Math.max(0, Math.min(100, (fuel / maxFuel) * 100));
  const isFuelLow = fuelPercent < 20;

  const completedCount = driveways.filter(d => d.isCompleted).length;
  const totalDriveways = driveways.length;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  const getWeatherIcon = () => {
    switch (weather.id) {
      case 'sunny_crisp':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'gentle_flurries':
      case 'powder_blizzard':
        return <CloudSnow className="w-4 h-4 text-cyan-300" />;
      case 'freezing_ice':
        return <Zap className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 flex flex-col justify-between p-3 sm:p-5">
      {/* Top Header Cluster */}
      <div className="flex items-start justify-between gap-3 w-full">
        {/* Left: Level Info, Fuel & Progress */}
        <div className="flex flex-col gap-2 max-w-[280px] sm:max-w-sm pointer-events-auto">
          {/* Main Status Card */}
          <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl p-3 shadow-lg flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                {getWeatherIcon()}
                <span className="text-xs font-semibold tracking-wide text-slate-200 truncate">
                  {level.name}
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
                {weather.name}
              </span>
            </div>

            {/* Driveways Progress */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Home className="w-3.5 h-3.5 text-emerald-400" />
                <span>Driveways:</span>
              </div>
              <span className="font-mono-numbers font-bold text-white">
                {completedCount} / {totalDriveways} Cleared
              </span>
            </div>

            {/* Fuel Bar */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1 text-slate-300">
                  <Fuel className={`w-3.5 h-3.5 ${isFuelLow ? 'text-red-400 animate-bounce' : 'text-amber-400'}`} />
                  <span className={isFuelLow ? 'text-red-300 font-bold' : ''}>Fuel Tank:</span>
                </div>
                <span className="font-mono-numbers text-slate-200">
                  {Math.round(fuel)}L / {maxFuel}L ({Math.round(fuelPercent)}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                <div
                  className={`h-full transition-all duration-200 ${
                    isFuelLow
                      ? 'bg-red-500 animate-pulse'
                      : fuelPercent < 45
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${fuelPercent}%` }}
                />
              </div>
            </div>

            {/* Cash & Dropdown Toggle */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="font-mono-numbers">${cash}</span>
              </div>
              <button
                onClick={() => {
                  sound.playUIClick();
                  setShowDrivewayDetails(!showDrivewayDetails);
                }}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
              >
                <span>Details</span>
                {showDrivewayDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Collapsible Driveway Details List */}
          {showDrivewayDetails && (
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/70 rounded-xl p-2.5 shadow-xl flex flex-col gap-1.5 max-h-48 overflow-y-auto">
              <div className="text-[11px] font-semibold text-slate-400 border-b border-slate-800 pb-1">
                Neighborhood Driveways:
              </div>
              {driveways.map(dw => (
                <div key={dw.id} className="flex items-center justify-between text-xs py-0.5">
                  <span className={`truncate max-w-[140px] ${dw.isCompleted ? 'text-emerald-400 line-through' : 'text-slate-300'}`}>
                    {dw.homeownerName}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-numbers text-[11px] text-slate-400">
                      {dw.percentCleared}%
                    </span>
                    {dw.isCompleted && (
                      <span className="text-[10px] text-emerald-400 font-bold">DONE</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Center: Floating Notifications */}
        {floatingMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-300 animate-in fade-in zoom-in-95">
            <div
              className={`px-4 py-2 rounded-xl text-sm font-bold shadow-2xl border backdrop-blur-md flex items-center gap-2 ${
                floatingMessage.type === 'combo'
                  ? 'bg-amber-500/90 text-slate-950 border-amber-300 scale-105'
                  : floatingMessage.type === 'cash'
                  ? 'bg-emerald-600/90 text-white border-emerald-300 scale-105'
                  : floatingMessage.type === 'fuel'
                  ? 'bg-blue-600/90 text-white border-blue-300'
                  : 'bg-red-600/90 text-white border-red-300 animate-pulse'
              }`}
            >
              <span>{floatingMessage.text}</span>
            </div>
          </div>
        )}

        {/* Right: Timer, Combo Multiplier & Actions */}
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          {/* Top Actions: Mute & Pause */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playUIClick();
                onToggleMute();
              }}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-colors shadow-md"
              title={isSoundMuted ? 'Unmute Sound' : 'Mute Sound'}
              aria-label="Toggle sound"
            >
              {isSoundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={() => {
                sound.playUIClick();
                onPause();
              }}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-colors shadow-md"
              title="Pause Game"
              aria-label="Pause"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>

          {/* Level Timer Card */}
          <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl px-3.5 py-2 shadow-lg flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <div className="flex flex-col items-end">
              <span className="font-mono-numbers font-bold text-sm sm:text-base text-white tracking-tight">
                {formatTimer(levelTimer)}
              </span>
              <span className="text-[10px] text-slate-400 font-mono-numbers">
                Par: {level.parTimeSeconds}s
              </span>
            </div>
          </div>

          {/* Dynamic Combo Multiplier Badge */}
          {comboMultiplier > 1.0 && (
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black rounded-xl px-3.5 py-1.5 shadow-xl border border-amber-300 flex items-center gap-2 animate-bounce">
              <Flame className="w-4 h-4 fill-current" />
              <div className="flex flex-col leading-none">
                <span className="text-sm tracking-wider font-mono-numbers">
                  x{comboMultiplier.toFixed(1)} COMBO
                </span>
                <span className="text-[9px] opacity-80 font-medium">
                  {comboCount} cells in streak
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Desktop / Tablet Action Buttons Helper (Mid-Right) */}
      <div className="flex items-center justify-between w-full pointer-events-none">
        {/* Desktop Controls Hint */}
        <div className="hidden md:flex items-center gap-2 bg-slate-900/70 backdrop-blur-sm border border-slate-800 text-[11px] text-slate-400 px-3 py-1.5 rounded-lg">
          <span>WASD / Arrows to Drive</span>
          <span>·</span>
          <span>Space to Blade {isBladeDown ? 'UP' : 'DOWN'}</span>
          <span>·</span>
          <span>Shift Turbo Boost</span>
          <span>·</span>
          <span>R Reverse</span>
        </div>

        {/* Quick Toggles on Tablet / Mobile */}
        <div className="flex items-center gap-2 ml-auto pointer-events-auto">
          <button
            onClick={() => {
              sound.playUIClick();
              onToggleBlade();
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold shadow-md border transition-all ${
              isBladeDown
                ? 'bg-amber-500 text-slate-950 border-amber-300'
                : 'bg-slate-800/90 text-slate-300 border-slate-700'
            }`}
          >
            Blade: {isBladeDown ? 'LOWERED' : 'RAISED'}
          </button>

          <button
            onClick={() => {
              sound.playUIClick();
              onToggleBoost();
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold shadow-md border transition-all ${
              isBoosting
                ? 'bg-orange-500 text-white border-orange-300 animate-pulse'
                : 'bg-slate-800/90 text-slate-300 border-slate-700'
            }`}
          >
            Turbo Boost
          </button>
        </div>
      </div>
    </div>
  );
};
