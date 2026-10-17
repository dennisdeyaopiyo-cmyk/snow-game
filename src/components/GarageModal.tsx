/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TruckSkin, UpgradeTiers } from '../types/game.ts';
import { 
  BLADE_UPGRADES, 
  FUEL_UPGRADES, 
  CHAINS_UPGRADES, 
  BLOWER_UPGRADES 
} from '../game/UpgradesData.ts';
import { sound } from '../audio/SoundEffects.ts';
import { X, Check, Coins, ShieldCheck, Fuel, Snowflake, Wind } from 'lucide-react';

interface GarageModalProps {
  upgrades: UpgradeTiers;
  cash: number;
  unlockedSkins: TruckSkin[];
  onUpgradeTier: (category: 'bladeTier' | 'fuelTankTier' | 'chainsTier' | 'blowerTier', nextTier: 1 | 2 | 3, cost: number) => void;
  onSelectSkin: (skin: TruckSkin) => void;
  onClose: () => void;
}

export const GarageModal: React.FC<GarageModalProps> = ({
  upgrades,
  cash,
  unlockedSkins,
  onUpgradeTier,
  onSelectSkin,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'parts' | 'skins'>('parts');

  const currentBlade = BLADE_UPGRADES.find(b => b.tier === upgrades.bladeTier) || BLADE_UPGRADES[0];
  const nextBlade = BLADE_UPGRADES.find(b => b.tier === (upgrades.bladeTier + 1) as 1 | 2 | 3);

  const currentFuel = FUEL_UPGRADES.find(f => f.tier === upgrades.fuelTankTier) || FUEL_UPGRADES[0];
  const nextFuel = FUEL_UPGRADES.find(f => f.tier === (upgrades.fuelTankTier + 1) as 1 | 2 | 3);

  const currentChains = CHAINS_UPGRADES.find(c => c.tier === upgrades.chainsTier) || CHAINS_UPGRADES[0];
  const nextChains = CHAINS_UPGRADES.find(c => c.tier === (upgrades.chainsTier + 1) as 1 | 2 | 3);

  const currentBlower = BLOWER_UPGRADES.find(b => b.tier === upgrades.blowerTier) || BLOWER_UPGRADES[0];
  const nextBlower = BLOWER_UPGRADES.find(b => b.tier === (upgrades.blowerTier + 1) as 1 | 2 | 3);

  const skinDefinitions: { id: TruckSkin; name: string; color: string; desc: string }[] = [
    { id: 'classic_red', name: 'Classic Cherry Red', color: 'bg-red-600', desc: 'Suburban workhorse red with chrome trim.' },
    { id: 'yellow_beaver', name: 'Municipal Safety Yellow', color: 'bg-amber-500', desc: 'High-visibility municipal road service livery.' },
    { id: 'glacier_yeti', name: 'Glacier Yeti Cyan', color: 'bg-sky-500', desc: 'Arctic sub-zero frost-resistant enamel.' },
    { id: 'midnight_hunter', name: 'Midnight Hunter', color: 'bg-zinc-900', desc: 'Obsidian blackout finish with amber guides.' },
  ];

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Plow Truck Garage</span>
            </h2>
            <p className="text-xs text-slate-400">Upgrade blade width, fuel capacity, tire traction, and livery</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 px-3 py-1 rounded-full text-amber-400 font-bold text-sm">
              <Coins className="w-4 h-4" />
              <span className="font-mono-numbers">${cash}</span>
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
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 text-sm">
          <button
            onClick={() => {
              sound.playUIClick();
              setActiveTab('parts');
            }}
            className={`pb-2.5 font-semibold text-xs transition-colors border-b-2 ${
              activeTab === 'parts'
                ? 'border-amber-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Vehicle Upgrades
          </button>
          <button
            onClick={() => {
              sound.playUIClick();
              setActiveTab('skins');
            }}
            className={`pb-2.5 font-semibold text-xs transition-colors border-b-2 ${
              activeTab === 'skins'
                ? 'border-amber-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Paint & Liveries
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {activeTab === 'parts' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Blade Width */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-400">Plow Blade Width</div>
                      <div className="text-sm font-bold text-white">{currentBlade.name}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono-numbers px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 font-bold">
                    Tier {upgrades.bladeTier}/3
                  </span>
                </div>

                <div className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="text-[11px] text-emerald-400 font-semibold mb-0.5">Effect:</div>
                  {currentBlade.perkText}
                </div>

                {nextBlade ? (
                  <button
                    disabled={cash < nextBlade.cost}
                    onClick={() => {
                      onUpgradeTier('bladeTier', nextBlade.tier, nextBlade.cost);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-between transition-all ${
                      cash >= nextBlade.cost
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <span>Upgrade to {nextBlade.name}</span>
                    <span className="font-mono-numbers">${nextBlade.cost}</span>
                  </button>
                ) : (
                  <div className="w-full py-2 text-center text-xs text-emerald-400 font-bold bg-emerald-950/30 border border-emerald-800/50 rounded-xl">
                    ✓ Maximum Tier Equipped
                  </div>
                )}
              </div>

              {/* 2. Fuel Capacity */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Fuel className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-400">Fuel Tank Capacity</div>
                      <div className="text-sm font-bold text-white">{currentFuel.name}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono-numbers px-2 py-0.5 rounded-full bg-slate-800 text-blue-400 font-bold">
                    Tier {upgrades.fuelTankTier}/3
                  </span>
                </div>

                <div className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="text-[11px] text-emerald-400 font-semibold mb-0.5">Effect:</div>
                  {currentFuel.perkText}
                </div>

                {nextFuel ? (
                  <button
                    disabled={cash < nextFuel.cost}
                    onClick={() => {
                      onUpgradeTier('fuelTankTier', nextFuel.tier, nextFuel.cost);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-between transition-all ${
                      cash >= nextFuel.cost
                        ? 'bg-blue-500 hover:bg-blue-400 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <span>Upgrade to {nextFuel.name}</span>
                    <span className="font-mono-numbers">${nextFuel.cost}</span>
                  </button>
                ) : (
                  <div className="w-full py-2 text-center text-xs text-emerald-400 font-bold bg-emerald-950/30 border border-emerald-800/50 rounded-xl">
                    ✓ Maximum Tier Equipped
                  </div>
                )}
              </div>

              {/* 3. Tire Chains (Ice Traction) */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <Snowflake className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-400">Ice Tire Chains</div>
                      <div className="text-sm font-bold text-white">{currentChains.name}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono-numbers px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 font-bold">
                    Tier {upgrades.chainsTier}/3
                  </span>
                </div>

                <div className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="text-[11px] text-emerald-400 font-semibold mb-0.5">Effect:</div>
                  {currentChains.perkText}
                </div>

                {nextChains ? (
                  <button
                    disabled={cash < nextChains.cost}
                    onClick={() => {
                      onUpgradeTier('chainsTier', nextChains.tier, nextChains.cost);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-between transition-all ${
                      cash >= nextChains.cost
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <span>Upgrade to {nextChains.name}</span>
                    <span className="font-mono-numbers">${nextChains.cost}</span>
                  </button>
                ) : (
                  <div className="w-full py-2 text-center text-xs text-emerald-400 font-bold bg-emerald-950/30 border border-emerald-800/50 rounded-xl">
                    ✓ Maximum Tier Equipped
                  </div>
                )}
              </div>

              {/* 4. Snow Blower Chute */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <Wind className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-400">Snow Blower Chute</div>
                      <div className="text-sm font-bold text-white">{currentBlower.name}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono-numbers px-2 py-0.5 rounded-full bg-slate-800 text-purple-400 font-bold">
                    Tier {upgrades.blowerTier}/3
                  </span>
                </div>

                <div className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="text-[11px] text-emerald-400 font-semibold mb-0.5">Effect:</div>
                  {currentBlower.perkText}
                </div>

                {nextBlower ? (
                  <button
                    disabled={cash < nextBlower.cost}
                    onClick={() => {
                      onUpgradeTier('blowerTier', nextBlower.tier, nextBlower.cost);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-between transition-all ${
                      cash >= nextBlower.cost
                        ? 'bg-purple-500 hover:bg-purple-400 text-white shadow-md'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <span>Upgrade to {nextBlower.name}</span>
                    <span className="font-mono-numbers">${nextBlower.cost}</span>
                  </button>
                ) : (
                  <div className="w-full py-2 text-center text-xs text-emerald-400 font-bold bg-emerald-950/30 border border-emerald-800/50 rounded-xl">
                    ✓ Maximum Tier Equipped
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Skins Tab */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {skinDefinitions.map(skin => {
                const isUnlocked = unlockedSkins.includes(skin.id);
                const isSelected = upgrades.selectedSkin === skin.id;

                return (
                  <div
                    key={skin.id}
                    onClick={() => {
                      if (isUnlocked) {
                        sound.playUIClick();
                        onSelectSkin(skin.id);
                      }
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-slate-800/90 border-amber-400 ring-2 ring-amber-400/30 shadow-lg'
                        : isUnlocked
                        ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-950/40 border-slate-800/50 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${skin.color} border-2 border-white/40 shadow-md shrink-0`} />
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{skin.name}</span>
                          {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                        </div>
                        <div className="text-xs text-slate-400">{skin.desc}</div>
                      </div>
                    </div>

                    <div className="text-[11px] font-semibold">
                      {isSelected ? (
                        <span className="text-amber-400">Currently Equipped</span>
                      ) : isUnlocked ? (
                        <span className="text-slate-400">Click to Equip</span>
                      ) : (
                        <span className="text-rose-400">Locked — Unlock in Seasonal Milestones</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-end">
          <button
            onClick={() => {
              sound.playUIClick();
              onClose();
            }}
            className="py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
