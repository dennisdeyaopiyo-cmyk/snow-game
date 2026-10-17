/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { sound } from '../audio/SoundEffects.ts';
import { Fuel, RotateCcw, Truck, Home } from 'lucide-react';

interface OutOfFuelModalProps {
  cash: number;
  onCallRoadside: (cost: number) => void;
  onRestart: () => void;
  onReturnTitle: () => void;
}

export const OutOfFuelModal: React.FC<OutOfFuelModalProps> = ({
  cash,
  onCallRoadside,
  onRestart,
  onReturnTitle,
}) => {
  const roadsideCost = 35;
  const canAfford = cash >= roadsideCost;

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in zoom-in-95">
      <div className="bg-slate-900 border-2 border-red-500/40 rounded-3xl w-full max-w-md p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl shadow-red-500/10">
        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400 p-0.5 shadow-xl flex items-center justify-center mb-3">
          <Fuel className="w-9 h-9" />
        </div>

        <h2 className="text-2xl font-black text-white">Fuel Tank Empty!</h2>
        <p className="text-xs text-slate-300 mt-1 max-w-xs">
          Your plow truck ran out of fuel in the middle of the neighborhood.
        </p>

        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 w-full my-4 flex flex-col gap-2 text-left">
          <div className="text-xs font-bold text-slate-200">Roadside Rescue Options:</div>
          <div className="text-[11px] text-slate-400 leading-relaxed">
            A neighbor can deliver an emergency 65L diesel can to get your engine running again, or you can tow back to base and restart.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            disabled={!canAfford}
            onClick={() => {
              sound.playUIClick();
              onCallRoadside(roadsideCost);
            }}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
              canAfford
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Call Neighbor Fuel Delivery (-${roadsideCost})</span>
          </button>

          <button
            onClick={() => {
              sound.playUIClick();
              onRestart();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-sky-400" />
            <span>Restart Shift (Free)</span>
          </button>

          <button
            onClick={() => {
              sound.playUIClick();
              onReturnTitle();
            }}
            className="w-full py-2 px-4 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Depot</span>
          </button>
        </div>
      </div>
    </div>
  );
};
