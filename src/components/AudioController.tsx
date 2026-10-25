/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Flame, Radio } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface AudioControllerProps {
  activeTab: 'reader' | 'chat' | 'quotes' | 'timeline';
}

export const AudioController: React.FC<AudioControllerProps> = ({ activeTab }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);

  // Determine intensity based on active tab
  const getTabIntensity = (tab: string) => {
    switch (tab) {
      case 'reader': return { label: 'ORBITAL CRUISE', intensity: 0.6 };
      case 'chat': return { label: 'NEURAL LINK', intensity: 0.8 };
      case 'quotes': return { label: 'ORACLE RESONANCE', intensity: 1.0 };
      case 'timeline': return { label: 'CHRONO PROPULSION', intensity: 1.4 };
      default: return { label: 'STANDBY', intensity: 0.5 };
    }
  };

  const { label, intensity } = getTabIntensity(activeTab);

  useEffect(() => {
    if (isPlaying) {
      soundEngine.startAmbientLaunch(volume, intensity);
    } else {
      soundEngine.stopAmbientLaunch();
    }
  }, [isPlaying, volume, intensity]);

  const togglePlay = () => {
    soundEngine.playClick();
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl px-4 py-2 flex items-center gap-4 backdrop-blur-md shadow-lg">
      <div className="flex items-center gap-2">
        <button
          onClick={togglePlay}
          className={`p-2 rounded-lg transition-all flex items-center gap-2 font-mono text-xs ${
            isPlaying
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
          }`}
        >
          <Radio className={`w-4 h-4 ${isPlaying ? 'animate-pulse text-cyan-400' : ''}`} />
          <span className="hidden sm:inline">SpaceX Launch Audio</span>
        </button>
      </div>

      <div className="hidden md:flex items-center gap-2">
        <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">{label}</span>
      </div>

      <div className="flex items-center gap-2">
        {volume === 0 ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => {
            setVolume(parseFloat(e.target.value));
            if (!isPlaying && parseFloat(e.target.value) > 0) {
              setIsPlaying(true);
            }
          }}
          className="w-20 sm:w-24 accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          title="Volume Control"
        />
      </div>
    </div>
  );
};
