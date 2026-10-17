/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SEASONAL_UNLOCKS_DATA } from '../game/Levels.ts';
import { sound } from '../audio/SoundEffects.ts';
import { X, Sparkles, Check, Lock } from 'lucide-react';

interface SeasonalModalProps {
  unlockedSeasonalIds: string[];
  onClose: () => void;
}

export const SeasonalModal: React.FC<SeasonalModalProps> = ({
  unlockedSeasonalIds,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Seasonal Unlocks & Liveries</h2>
              <p className="text-xs text-slate-400">Complete winter neighborhood achievements to unlock exclusive gear</p>
            </div>
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

        {/* List of Seasonal Unlocks */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3.5">
          {SEASONAL_UNLOCKS_DATA.map(item => {
            const isUnlocked = unlockedSeasonalIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  isUnlocked
                    ? 'bg-purple-950/20 border-purple-500/40 shadow-md'
                    : 'bg-slate-950/50 border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-3 rounded-2xl shrink-0 ${
                    isUnlocked
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {isUnlocked ? <Check className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-purple-400">
                        {item.season}
                      </span>
                      <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{item.description}</p>
                    <div className="text-[11px] text-amber-400/90 mt-1 font-medium">
                      Goal: {item.requirement}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {isUnlocked ? (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-800 px-3 py-1 rounded-full">
                      UNLOCKED
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-500 bg-slate-800 px-3 py-1 rounded-full">
                      LOCKED
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-end">
          <button
            onClick={() => {
              sound.playUIClick();
              onClose();
            }}
            className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
