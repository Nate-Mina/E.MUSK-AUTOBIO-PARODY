/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Web Audio API Sound Generator for SpaceX Launch & UI Immersion

class SoundEngine {
  private ctx: AudioContext | null = null;
  private thrusterNode: AudioBufferSourceNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private isThrusterActive = false;
  private masterVolume = 0.15;
  private intensity = 300;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
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

  setAmbientVolume(vol: number) {
    this.masterVolume = vol;
    if (this.gainNode) {
      this.gainNode.gain.setTargetAtTime(vol, this.ctx?.currentTime || 0, 0.1);
    }
  }

  setAmbientIntensity(freq: number) {
    this.intensity = freq;
    if (this.filterNode) {
      this.filterNode.frequency.setTargetAtTime(freq, this.ctx?.currentTime || 0, 0.2);
    }
  }

  toggleThruster(active: boolean) {
    try {
      this.init();
      if (!this.ctx) return;

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

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(this.intensity, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start();
        this.thrusterNode = noise;
        this.filterNode = filter;
        this.gainNode = gain;
        this.isThrusterActive = true;
      } else if (!active && this.isThrusterActive && this.thrusterNode) {
        this.thrusterNode.stop();
        this.thrusterNode = null;
        this.filterNode = null;
        this.gainNode = null;
        this.isThrusterActive = false;
      }
    } catch {
      // Audio context error handling
    }
  }
}

export const soundEngine = new SoundEngine();

