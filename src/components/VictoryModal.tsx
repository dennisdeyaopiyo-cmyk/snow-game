/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LevelConfig } from '../types/game.ts';
import { sound } from '../audio/SoundEffects.ts';
import { Trophy, Clock, Flame, Coins, ArrowRight, Wrench, RotateCcw } from 'lucide-react';

interface VictoryModalProps {
  level: LevelConfig;
  timeSeconds: number;
  stars: number;
  cashEarned: number;
  maxCombo: number;
  onNextLevel: () => void;
  onRestart: () => void;
  onOpenGarage: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  level,
  timeSeconds,
  stars,
  cashEarned,
  maxCombo,
  onNextLevel,
  onRestart,
  onOpenGarage,
}) => {
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in zoom-in-95">
      <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl w-full max-w-md p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl shadow-amber-500/10">
        {/* Trophy Icon & Celebration */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-xl flex items-center justify-center mb-3">
          <Trophy className="w-9 h-9 text-slate-950 fill-current" />
        </div>

        <h2 className="text-2xl font-black text-white">Neighborhood Cleared!</h2>
        <p className="text-xs text-slate-300 mt-1">{level.name} driveways plowed clean</p>

        {/* Stars */}
        <div className="flex items-center gap-2 my-4 text-3xl text-amber-400">
          <span className={stars >= 1 ? 'scale-110' : 'opacity-30'}>⭐</span>
          <span className={stars >= 2 ? 'scale-125' : 'opacity-30'}>⭐</span>
          <span className={stars >= 3 ? 'scale-110' : 'opacity-30'}>⭐</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 w-full my-3">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex flex-col items-center">
            <Clock className="w-4 h-4 text-sky-400 mb-1" />
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Time</span>
            <span className="font-mono-numbers text-xs sm:text-sm font-bold text-white">
              {formatTimer(timeSeconds)}
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex flex-col items-center">
            <Flame className="w-4 h-4 text-orange-400 mb-1" />
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Max Combo</span>
            <span className="font-mono-numbers text-xs sm:text-sm font-bold text-amber-400">
              x{maxCombo.toFixed(1)}
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex flex-col items-center">
            <Coins className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Earned</span>
            <span className="font-mono-numbers text-xs sm:text-sm font-bold text-emerald-400">
              +${cashEarned}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 w-full mt-4">
          <button
            onClick={() => {
              sound.playUIClick();
              onNextLevel();
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <span>NEXT NEIGHBORHOOD</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                sound.playUIClick();
                onOpenGarage();
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span>Upgrade Truck</span>
            </button>

            <button
              onClick={() => {
                sound.playUIClick();
                onRestart();
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
              <span>Replay Shift</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
