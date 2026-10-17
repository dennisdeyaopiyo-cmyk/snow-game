/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { sound } from '../audio/SoundEffects.ts';
import { Play, Wrench, Trophy, Sparkles, Map, Volume2, VolumeX } from 'lucide-react';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenGarage: () => void;
  onOpenLevels: () => void;
  onOpenLeaderboard: () => void;
  onOpenSeasonal: () => void;
  isSoundMuted: boolean;
  onToggleMute: () => void;
  totalStars: number;
  cash: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenGarage,
  onOpenLevels,
  onOpenLeaderboard,
  onOpenSeasonal,
  isSoundMuted,
  onToggleMute,
  totalStars,
  cash,
}) => {
  // Listen for Enter / Space to start quickly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        sound.playUIClick();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame]);

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-6 sm:p-10 select-none bg-radial from-slate-900/60 via-slate-950/80 to-slate-950/95 backdrop-blur-xs">
      {/* Top Bar: Stats & Sound Toggle */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-4 text-xs sm:text-sm font-semibold">
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/60 px-3.5 py-1.5 rounded-xl shadow-md text-amber-400">
            <span>⭐</span>
            <span className="font-mono-numbers text-white">{totalStars} Stars</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/60 px-3.5 py-1.5 rounded-xl shadow-md text-emerald-400">
            <span>💵</span>
            <span className="font-mono-numbers text-white">${cash} Funds</span>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playUIClick();
            onToggleMute();
          }}
          className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-colors shadow-md"
          title={isSoundMuted ? 'Unmute Sound' : 'Mute Sound'}
          aria-label="Toggle sound"
        >
          {isSoundMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
        </button>
      </div>

      {/* Hero Centerpiece: Bespoke Title Lockup */}
      <div className="flex flex-col items-center justify-center text-center my-auto max-w-2xl mx-auto">
        {/* Bespoke SVG Title Lockup */}
        <div className="mb-4 flex flex-col items-center">
          <div className="w-20 h-20 mb-3 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 p-0.5 shadow-2xl shadow-sky-500/20 border border-white/30 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-white"
              viewBox="0 0 48 48"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 36h40" />
              <path d="M8 36l6-16h16l4 8h6l4 8" />
              <circle cx="15" cy="36" r="4" fill="currentColor" />
              <circle cx="33" cy="36" r="4" fill="currentColor" />
              <path d="M38 28l6-6v14" />
              <path d="M22 12l2-4h8l2 4" />
              <path d="M12 16h8" />
            </svg>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white drop-shadow-md">
            Frost<span className="text-amber-400">Plow</span> <span className="text-sky-300 font-light">3D</span>
          </h1>

          <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-md font-medium leading-relaxed">
            A cozy suburban winter simulator. Clear residential driveways, master slick weather, chain satisfying streaks, and upgrade your plow.
          </p>
        </div>

        {/* Primary Start CTA */}
        <div className="flex flex-col items-center gap-3 w-full max-w-xs mt-3">
          <button
            onClick={() => {
              sound.playUIClick();
              onStartGame();
            }}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black text-lg sm:text-xl shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 border-2 border-amber-200"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>START SHIFT</span>
          </button>

          {/* Secondary Hub Actions Grid */}
          <div className="grid grid-cols-2 gap-2.5 w-full mt-2">
            <button
              onClick={() => {
                sound.playUIClick();
                onOpenGarage();
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 text-slate-200 font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>Garage</span>
            </button>

            <button
              onClick={() => {
                sound.playUIClick();
                onOpenLevels();
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 text-slate-200 font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Map className="w-4 h-4 text-sky-400" />
              <span>Levels</span>
            </button>

            <button
              onClick={() => {
                sound.playUIClick();
                onOpenSeasonal();
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 text-slate-200 font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Seasons</span>
            </button>

            <button
              onClick={() => {
                sound.playUIClick();
                onOpenLeaderboard();
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 text-slate-200 font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>Records</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Flat Control Hint Line */}
      <div className="text-center text-xs text-slate-400 font-medium tracking-wide">
        <span>WASD Move</span>
        <span className="mx-2 text-slate-600">·</span>
        <span>Space Lower Blade</span>
        <span className="mx-2 text-slate-600">·</span>
        <span>Shift Turbo Boost</span>
        <span className="mx-2 text-slate-600">·</span>
        <span>Virtual Touch Joystick on Mobile & Tablets</span>
      </div>
    </div>
  );
};
