/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Procedural Web Audio API Sound Synthesizer - Zero External Assets (No 404s)

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  // Engine sound state
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private isEngineRunning: boolean = false;

  // Snow scrape state
  private scrapeNoiseNode: AudioBufferSourceNode | null = null;
  private scrapeGain: GainNode | null = null;
  private scrapeFilter: BiquadFilterNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  // Combo notes pentatonic scale: C5, D5, E5, G5, A5, C6, D6, E6
  private comboFrequencies = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.createNoiseBuffer();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private createNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds of noise
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopEngine();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Engine loop
  public startEngine() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || this.isEngineRunning) return;

    try {
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'triangle';
      this.engineOsc.frequency.setValueAtTime(42, this.ctx.currentTime); // 42 Hz low purr

      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(140, this.ctx.currentTime);

      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      this.engineOsc.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc.start();
      this.isEngineRunning = true;
    } catch {
      // AudioContext policy fallback
    }
  }

  public updateEngine(speedNormalized: number) {
    if (this.isMuted || !this.isEngineRunning || !this.ctx || !this.engineOsc || !this.engineFilter || !this.engineGain) return;
    const t = this.ctx.currentTime;
    const targetFreq = 42 + speedNormalized * 65; // up to 107 Hz
    const targetFilter = 140 + speedNormalized * 320;
    const targetGain = 0.04 + speedNormalized * 0.08;

    this.engineOsc.frequency.setTargetAtTime(targetFreq, t, 0.08);
    this.engineFilter.frequency.setTargetAtTime(targetFilter, t, 0.08);
    this.engineGain.gain.setTargetAtTime(targetGain, t, 0.08);
  }

  public stopEngine() {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      } catch {
        // Safe discard
      }
      this.engineOsc = null;
    }
    this.isEngineRunning = false;
  }

  // Snow plowing crunch / whoosh sound
  public playSnowPlowCrunch(intensity: number) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.noiseBuffer) return;

    try {
      const now = this.ctx.currentTime;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800 + intensity * 600, now);
      filter.Q.setValueAtTime(2.0, now);

      const gain = this.ctx.createGain();
      const vol = Math.min(0.18, 0.04 + intensity * 0.14);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.12);
    } catch {
      // ignore
    }
  }

  // Melodic combo arpeggio chime (FM bell synthesis)
  public playComboChime(comboLevel: number) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const index = Math.min(this.comboFrequencies.length - 1, Math.max(0, comboLevel - 1));
      const freq = this.comboFrequencies[index];

      // Carrier
      const carrier = this.ctx.createOscillator();
      carrier.type = 'sine';
      carrier.frequency.setValueAtTime(freq, now);

      // Modulator for glassy chime bell timbre
      const modulator = this.ctx.createOscillator();
      modulator.type = 'sine';
      modulator.frequency.setValueAtTime(freq * 2.76, now);

      const modGain = this.ctx.createGain();
      modGain.gain.setValueAtTime(freq * 0.8, now);
      modGain.gain.exponentialRampToValueAtTime(1, now + 0.35);

      modulator.connect(modGain);
      modGain.connect(carrier.frequency);

      const mainGain = this.ctx.createGain();
      mainGain.gain.setValueAtTime(0.18, now);
      mainGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      carrier.connect(mainGain);
      mainGain.connect(this.ctx.destination);

      carrier.start(now);
      modulator.start(now);
      carrier.stop(now + 0.45);
      modulator.stop(now + 0.45);
    } catch {
      // ignore
    }
  }

  // Celebratory Driveway Completed Chime
  public playDrivewayCleared() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major chord arpeggio
      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0.001, now + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.14, now + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.6);
      });
    } catch {
      // ignore
    }
  }

  // Fuel canister collected
  public playFuelPickup() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // ignore
    }
  }

  // Low fuel warning ping
  public playLowFuelPing() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // ignore
    }
  }

  // Snow Blower blast
  public playSnowBlowerWhoosh() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.noiseBuffer) return;

    try {
      const now = this.ctx.currentTime;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(1.2, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.4);
    } catch {
      // ignore
    }
  }

  // Stage victory trumpet fanfare
  public playVictoryFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const melody = [
        { f: 523.25, d: 0.15, offset: 0 },
        { f: 659.25, d: 0.15, offset: 0.15 },
        { f: 783.99, d: 0.15, offset: 0.3 },
        { f: 1046.50, d: 0.45, offset: 0.45 },
      ];

      melody.forEach(item => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(item.f, now + item.offset);

        gain.gain.setValueAtTime(0.001, now + item.offset);
        gain.gain.linearRampToValueAtTime(0.2, now + item.offset + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + item.offset + item.d + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + item.offset);
        osc.stop(now + item.offset + item.d + 0.25);
      });
    } catch {
      // ignore
    }
  }

  // UI button click
  public playUIClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(350, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // ignore
    }
  }
}

export const sound = new SoundSynthesizer();
