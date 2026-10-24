/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Web Audio API Sound Generator for SpaceX Launch & UI Immersion

class SoundEngine {
  private ctx: AudioContext | null = null;
  private thrusterNode: AudioBufferSourceNode | null = null;
  private thrusterGain: GainNode | null = null;
  private thrusterFilter: BiquadFilterNode | null = null;
  private masterGain: GainNode | null = null;
  
  private isThrusterActive = false;
  private currentVolume = 0.5;
  private currentIntensity = 0.3; // 0 to 1

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(volume: number) {
    this.currentVolume = volume;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.1);
    }
  }

  setIntensity(intensity: number) {
    this.currentIntensity = intensity;
    if (this.thrusterFilter && this.thrusterGain && this.ctx) {
      // Mapping intensity to filter frequency and gain
      const freq = 100 + (intensity * 1500); // 100Hz to 1600Hz
      const gainVal = 0.05 + (intensity * 0.4); // 0.05 to 0.45
      
      this.thrusterFilter.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.2);
      this.thrusterGain.gain.setTargetAtTime(gainVal, this.ctx.currentTime, 0.2);
    }
  }

  playClick() {
    try {
      this.init();
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // Audio context error handling
    }
  }

  playCountdownBeep(high = false) {
    try {
      this.init();
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(high ? 1200 : 600, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch {
      // Audio context error handling
    }
  }

  toggleThruster(active: boolean) {
    try {
      this.init();
      if (!this.ctx || !this.masterGain) return;

      if (active && !this.isThrusterActive) {
        // Create white noise buffer for rocket thruster
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        
        const gain = this.ctx.createGain();
        
        this.thrusterFilter = filter;
        this.thrusterGain = gain;
        
        // Apply current intensity
        this.setIntensity(this.currentIntensity);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start();
        this.thrusterNode = noise;
        this.isThrusterActive = true;
      } else if (!active && this.isThrusterActive && this.thrusterNode) {
        this.thrusterNode.stop();
        this.thrusterNode = null;
        this.thrusterGain = null;
        this.thrusterFilter = null;
        this.isThrusterActive = false;
      }
    } catch {
      // Audio context error handling
    }
  }
}

export const soundEngine = new SoundEngine();
