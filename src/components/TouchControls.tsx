/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { DriveInput } from '../types/game.ts';
import { sound } from '../audio/SoundEffects.ts';
import { ArrowDown, ArrowUp, Zap, Sparkles } from 'lucide-react';

interface TouchControlsProps {
  onInputChange: (input: DriveInput) => void;
  isBladeDown: boolean;
  onToggleBlade: () => void;
  isBoosting: boolean;
  onToggleBoost: () => void;
  onPause: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onInputChange,
  isBladeDown,
  onToggleBlade,
  isBoosting,
  onToggleBoost,
  onPause,
}) => {
  // State for Auto-Cruise and Reverse gear
  const [autoDrive, setAutoDrive] = useState(false);
  const [isReverseGear, setIsReverseGear] = useState(false);

  // Joystick visual position
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDraggingJoystick, setIsDraggingJoystick] = useState(false);

  // Raw inputs
  const touchInputRef = useRef<{ throttle: number; steering: number }>({ throttle: 0, steering: 0 });
  const keyInputRef = useRef<{ forward: boolean; reverse: boolean; left: boolean; right: boolean }>({
    forward: false,
    reverse: false,
    left: false,
    right: false,
  });

  const broadcastCombinedInput = useCallback(() => {
    let throttle = touchInputRef.current.throttle;
    let steering = touchInputRef.current.steering;

    // Apply Keyboard overrides if active
    if (keyInputRef.current.forward) throttle = 1.0;
    else if (keyInputRef.current.reverse) throttle = -1.0;

    if (keyInputRef.current.left) steering = -1.0;
    else if (keyInputRef.current.right) steering = 1.0;

    // Apply Auto-Drive if enabled and no manual reverse
    if (autoDrive && throttle === 0 && !isReverseGear) {
      throttle = 0.85;
    }

    if (isReverseGear && throttle > 0) {
      throttle = -throttle;
    }

    onInputChange({
      throttle,
      steering,
      bladeDown: isBladeDown,
      boost: isBoosting,
      blowerActive: false,
    });
  }, [autoDrive, isReverseGear, isBladeDown, isBoosting, onInputChange]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      let handled = false;

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keyInputRef.current.forward = true;
          handled = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keyInputRef.current.reverse = true;
          handled = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keyInputRef.current.left = true;
          handled = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keyInputRef.current.right = true;
          handled = true;
          break;
        case 'Space':
          onToggleBlade();
          sound.playUIClick();
          handled = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          onToggleBoost();
          sound.playUIClick();
          handled = true;
          break;
        case 'KeyR':
          setIsReverseGear(prev => !prev);
          sound.playUIClick();
          handled = true;
          break;
        case 'Escape':
          onPause();
          sound.playUIClick();
          handled = true;
          break;
      }

      if (handled) {
        e.preventDefault();
        broadcastCombinedInput();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          keyInputRef.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          keyInputRef.current.reverse = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          keyInputRef.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          keyInputRef.current.right = false;
          break;
      }
      broadcastCombinedInput();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [broadcastCombinedInput, onToggleBlade, onToggleBoost, onPause]);

  // Touch Joystick Event Handlers
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDraggingJoystick(true);
    updateJoystickPos(e);
  };

  const updateJoystickPos = (e: React.TouchEvent | React.MouseEvent) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const maxRadius = rect.width / 2 - 10;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    let normX = dx;
    let normY = dy;

    if (dist > maxRadius) {
      normX = (dx / dist) * maxRadius;
      normY = (dy / dist) * maxRadius;
    }

    setKnobPos({ x: normX, y: normY });

    // Output steering and throttle:
    // dy negative means forward (up), dy positive means reverse (down)
    const normalizedSteer = normX / maxRadius;
    const normalizedThrottle = -normY / maxRadius;

    touchInputRef.current.steering = normalizedSteer;
    touchInputRef.current.throttle = normalizedThrottle;

    broadcastCombinedInput();
  };

  const handleTouchEnd = () => {
    setIsDraggingJoystick(false);
    setKnobPos({ x: 0, y: 0 });
    touchInputRef.current.steering = 0;
    touchInputRef.current.throttle = 0;
    broadcastCombinedInput();
  };

  return (
    <div className="absolute inset-x-0 bottom-0 pointer-events-none select-none z-20 pb-4 px-4 sm:px-8 flex items-end justify-between">
      {/* Bottom Left: Virtual Thumbstick & Auto-Cruise Switch */}
      <div className="flex flex-col items-center gap-2 pointer-events-auto">
        {/* Auto-Drive Pill Toggle */}
        <button
          onClick={() => {
            sound.playUIClick();
            setAutoDrive(prev => !prev);
          }}
          className={`px-3 py-1.5 rounded-full text-[11px] font-bold shadow-md border backdrop-blur-md transition-all flex items-center gap-1.5 ${
            autoDrive
              ? 'bg-emerald-500 text-slate-950 border-emerald-300'
              : 'bg-slate-900/80 text-slate-300 border-slate-700/80'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Auto-Drive: {autoDrive ? 'ON' : 'OFF'}</span>
        </button>

        {/* Joystick Base */}
        <div
          ref={joystickBaseRef}
          onTouchStart={handleTouchStart}
          onTouchMove={isDraggingJoystick ? updateJoystickPos : undefined}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseMove={isDraggingJoystick ? updateJoystickPos : undefined}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
          className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-900/70 backdrop-blur-md border-2 border-slate-700/80 shadow-2xl flex items-center justify-center touch-none cursor-pointer"
        >
          {/* Subtle Directional Marks */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
            <div className="w-full h-0.5 bg-slate-400" />
            <div className="h-full w-0.5 bg-slate-400 absolute" />
          </div>

          {/* Joystick Thumb Knob */}
          <div
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
              transition: isDraggingJoystick ? 'none' : 'transform 0.15s ease-out',
            }}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-sky-400 to-blue-600 shadow-xl border-2 border-white/80 flex items-center justify-center"
          >
            <div className="w-4 h-4 rounded-full bg-white/40" />
          </div>
        </div>
      </div>

      {/* Bottom Right: Reverse, Blade Toggle & Boost Buttons */}
      <div className="flex flex-col items-end gap-2.5 pointer-events-auto">
        {/* Top Mini Buttons Row */}
        <div className="flex items-center gap-2">
          {/* Reverse Gear Hold/Toggle Button */}
          <button
            onClick={() => {
              sound.playUIClick();
              setIsReverseGear(prev => !prev);
            }}
            className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shadow-lg border backdrop-blur-md text-xs font-black transition-all ${
              isReverseGear
                ? 'bg-rose-500 text-white border-rose-300 scale-105'
                : 'bg-slate-900/85 text-slate-300 border-slate-700/80 hover:bg-slate-800'
            }`}
            title="Reverse Gear"
          >
            <ArrowDown className="w-4 h-4" />
            <span className="text-[10px]">REV</span>
          </button>

          {/* Turbo Boost */}
          <button
            onClick={() => {
              sound.playUIClick();
              onToggleBoost();
            }}
            className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shadow-lg border backdrop-blur-md text-xs font-black transition-all ${
              isBoosting
                ? 'bg-amber-500 text-slate-950 border-amber-200 scale-105'
                : 'bg-slate-900/85 text-slate-300 border-slate-700/80 hover:bg-slate-800'
            }`}
            title="Turbo Boost"
          >
            <Zap className="w-4 h-4" />
            <span className="text-[10px]">BOOST</span>
          </button>
        </div>

        {/* Primary Action: Blade Lower / Raise */}
        <button
          onClick={() => {
            sound.playUIClick();
            onToggleBlade();
          }}
          className={`w-28 h-14 sm:w-32 sm:h-16 rounded-2xl flex items-center justify-center gap-2 shadow-2xl border-2 backdrop-blur-md transition-all active:scale-95 ${
            isBladeDown
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-300 shadow-amber-500/20'
              : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800'
          }`}
        >
          {isBladeDown ? (
            <>
              <ArrowDown className="w-5 h-5 text-slate-950 stroke-[3]" />
              <div className="flex flex-col items-start leading-tight">
                <span className="text-xs font-black uppercase">Plowing</span>
                <span className="text-[9px] font-bold opacity-80">Blade DOWN</span>
              </div>
            </>
          ) : (
            <>
              <ArrowUp className="w-5 h-5 text-slate-300 stroke-[3]" />
              <div className="flex flex-col items-start leading-tight">
                <span className="text-xs font-black uppercase">Cruising</span>
                <span className="text-[9px] font-bold opacity-80">Blade UP</span>
              </div>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
