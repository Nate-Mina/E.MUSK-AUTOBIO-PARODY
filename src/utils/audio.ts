/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Web Audio API Sound Generator for SpaceX Launch & UI Immersion

class SoundEngine {
  private ctx: AudioContext | null = null;
  private thrusterNode: AudioBufferSourceNode | null = null;
  private masterGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private isThrusterActive = false;
  private currentVolume = 0.15;
  private currentIntensity = 0.5;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setAmbientVolume(vol: number) {
    this.currentVolume = vol;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.1);
    }
  }

  setAmbientIntensity(level: number) {
    this.currentIntensity = level;
    if (this.filterNode && this.ctx) {
      // Map intensity 0-1 to frequency 100Hz - 1500Hz
      const freq = 100 + level * 1400;
      this.filterNode.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.5);
    }
  }

  playClick() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // Audio context error handling
    }
  }

  playCountdownBeep(high = false) {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(high ? 1200 : 600, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

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
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        this.filterNode = this.ctx.createBiquadFilter();
        this.filterNode.type = 'lowpass';
        const initialFreq = 100 + this.currentIntensity * 1400;
        this.filterNode.frequency.setValueAtTime(initialFreq, this.ctx.currentTime);

        const localGain = this.ctx.createGain();
        localGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

        noise.connect(this.filterNode);
        this.filterNode.connect(localGain);
        localGain.connect(this.masterGain);

        noise.start();
        this.thrusterNode = noise;
        this.isThrusterActive = true;
      } else if (!active && this.isThrusterActive && this.thrusterNode) {
        this.thrusterNode.stop();
        this.thrusterNode = null;
        this.isThrusterActive = false;
      }
    } catch {
      // Audio context error handling
    }
  }
}

export const soundEngine = new SoundEngine();

