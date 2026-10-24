/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Web Audio API Sound Generator for SpaceX Launch & UI Immersion

class SoundEngine {
  private ctx: AudioContext | null = null;
  private thrusterNode: AudioNode | null = null;
  private isThrusterActive = false;

  // Ambient SpaceX launch soundscape state
  private ambientGain: GainNode | null = null;
  private ambientFilter: BiquadFilterNode | null = null;
  private ambientSource: AudioBufferSourceNode | null = null;
  private ambientSubOsc: OscillatorNode | null = null;
  private isAmbientActive = false;
  private currentVolume = 0.3;
  private currentIntensity = 1.0;

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
        filter.frequency.setValueAtTime(300, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start();
        this.thrusterNode = noise;
        this.isThrusterActive = true;
      } else if (!active && this.isThrusterActive && this.thrusterNode) {
        (this.thrusterNode as AudioBufferSourceNode).stop();
        this.thrusterNode = null;
        this.isThrusterActive = false;
      }
    } catch {
      // Audio context error handling
    }
  }

  // SpaceX Launch Ambient Soundscape Controller
  startAmbientLaunch(volume = 0.3, intensity = 1.0) {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.isAmbientActive) {
        this.updateAmbient(volume, intensity);
        return;
      }

      this.currentVolume = volume;
      this.currentIntensity = intensity;

      // 1. White/Pink Noise Buffer for rocket roar
      const bufferSize = this.ctx.sampleRate * 5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        // Pink noise approximation for realistic rocket rumble
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
      }

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(150 * intensity, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume * intensity, this.ctx.currentTime);

      // Sub-bass rumble oscillator
      const subOsc = this.ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(45 * intensity, this.ctx.currentTime);
      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(volume * 0.5 * intensity, this.ctx.currentTime);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);

      source.start();
      subOsc.start();

      this.ambientSource = source;
      this.ambientSubOsc = subOsc;
      this.ambientFilter = filter;
      this.ambientGain = gain;
      this.isAmbientActive = true;
    } catch {
      // Audio context handling
    }
  }

  updateAmbient(volume: number, intensity: number) {
    try {
      this.currentVolume = volume;
      this.currentIntensity = intensity;
      if (!this.ctx || !this.isAmbientActive) return;

      if (this.ambientFilter) {
        this.ambientFilter.frequency.setTargetAtTime(150 * intensity, this.ctx.currentTime, 0.5);
      }
      if (this.ambientGain) {
        this.ambientGain.gain.setTargetAtTime(volume * intensity, this.ctx.currentTime, 0.5);
      }
    } catch {
      // Audio update handling
    }
  }

  stopAmbientLaunch() {
    try {
      if (this.ambientSource) {
        this.ambientSource.stop();
        this.ambientSource.disconnect();
        this.ambientSource = null;
      }
      if (this.ambientSubOsc) {
        this.ambientSubOsc.stop();
        this.ambientSubOsc.disconnect();
        this.ambientSubOsc = null;
      }
      this.isAmbientActive = false;
    } catch {
      // Audio stop handling
    }
  }
}

export const soundEngine = new SoundEngine();
