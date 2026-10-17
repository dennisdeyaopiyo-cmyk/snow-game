/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { sound } from '../audio/SoundEffects.ts';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onReturnTitle: () => void;
  isSoundMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onReturnTitle,
  isSoundMuted,
  onToggleMute,
}) => {
  return (
    <div className="fixed inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in zoom-in-95">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 flex flex-col items-center text-center shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-1">Shift Paused</h2>
        <p className="text-xs text-slate-400 mb-5">Take a cozy winter breather</p>

        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={() => {
              sound.playUIClick();
              onResume();
            }}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume Shift</span>
          </button>

          <button
            onClick={() => {
              sound.playUIClick();
              onRestart();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-sky-400" />
            <span>Restart Shift</span>
          </button>

          <button
            onClick={() => {
              sound.playUIClick();
              onToggleMute();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isSoundMuted ? 'Unmute Sound' : 'Mute Sound'}</span>
          </button>

          <button
            onClick={() => {
              sound.playUIClick();
              onReturnTitle();
            }}
            className="w-full py-2 px-4 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Title</span>
          </button>
        </div>
      </div>
    </div>
  );
};
