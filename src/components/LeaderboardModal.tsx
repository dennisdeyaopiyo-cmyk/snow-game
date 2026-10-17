/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LeaderboardRecord } from '../types/game.ts';
import { sound } from '../audio/SoundEffects.ts';
import { X, Trophy, Clock, Flame, Coins, Trash2 } from 'lucide-react';

interface LeaderboardModalProps {
  records: LeaderboardRecord[];
  onClearRecords: () => void;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  records,
  onClearRecords,
  onClose,
}) => {
  const [filterLevel, setFilterLevel] = useState<number | 'all'>('all');

  const filteredRecords = records.filter(r => 
    filterLevel === 'all' ? true : r.levelId === filterLevel
  );

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Local Leaderboards</h2>
              <p className="text-xs text-slate-400">Fastest driveway clear records and highest combo streaks</p>
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

        {/* Filter Bar */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-800 overflow-x-auto text-xs">
          <button
            onClick={() => {
              sound.playUIClick();
              setFilterLevel('all');
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
              filterLevel === 'all'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            All Neighborhoods
          </button>
          {[1, 2, 3, 4, 5].map(id => (
            <button
              key={id}
              onClick={() => {
                sound.playUIClick();
                setFilterLevel(id);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
                filterLevel === id
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Level {id}
            </button>
          ))}
        </div>

        {/* Records Table */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No shift records logged yet. Clear a neighborhood to place on the board!
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {filteredRecords.map((rec, index) => (
                <div
                  key={rec.id || index}
                  className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black font-mono-numbers text-xs ${
                      index === 0
                        ? 'bg-amber-400 text-slate-950'
                        : index === 1
                        ? 'bg-slate-300 text-slate-950'
                        : index === 2
                        ? 'bg-amber-700 text-amber-100'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {index + 1}
                    </span>

                    <div>
                      <div className="font-bold text-white text-sm">{rec.levelName}</div>
                      <div className="text-[11px] text-slate-400">{rec.date}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 font-mono-numbers">
                    <div className="flex items-center gap-1 text-sky-400 font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{rec.timeSeconds.toFixed(1)}s</span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-400">
                      <Flame className="w-3.5 h-3.5" />
                      <span>x{rec.maxCombo.toFixed(1)}</span>
                    </div>

                    <div className="flex items-center gap-1 text-emerald-400">
                      <Coins className="w-3.5 h-3.5" />
                      <span>+${rec.cashEarned}</span>
                    </div>

                    <div className="text-amber-400 tracking-wider">
                      {'★'.repeat(rec.stars)}{'☆'.repeat(Math.max(0, 3 - rec.stars))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('Reset local leaderboard records?')) {
                sound.playUIClick();
                onClearRecords();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Records</span>
          </button>

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
