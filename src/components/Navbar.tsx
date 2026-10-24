/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Rocket, MessageSquare, Calculator, Flame, Download, Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface NavbarProps {
  activeTab: 'reader' | 'chat' | 'math' | 'mars';
  setActiveTab: (tab: 'reader' | 'chat' | 'math' | 'mars') => void;
  onOpenExport: () => void;
  soundEnabled: boolean;
  setSoundEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenExport,
  soundEnabled,
  setSoundEnabled,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-cyan-900/40 bg-[#090d16]/90 backdrop-blur-md sticky top-0 z-50">
      {/* Zone 1: Wordmark Brand */}
      <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => setActiveTab('reader')}>
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Rocket className="w-5 h-5 text-slate-950 animate-pulse" />
        </div>
        <div>
          <span className="text-base font-bold tracking-wider text-cyan-400 font-mono whitespace-nowrap">
            ELON MUSK
          </span>
          <span className="block text-[10px] text-emerald-400 font-mono tracking-widest uppercase">
            The End Justifies The Means
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveTab('reader');
          }}
          className={`px-4 py-2 text-xs font-mono font-medium rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-2 ${
            activeTab === 'reader'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Rocket className="w-3.5 h-3.5" />
          Chapters (1-10)
        </button>
        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveTab('chat');
          }}
          className={`px-4 py-2 text-xs font-mono font-medium rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-2 ${
            activeTab === 'chat'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Elon AI Neural Chat
        </button>
        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveTab('math');
          }}
          className={`px-4 py-2 text-xs font-mono font-medium rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-2 ${
            activeTab === 'math'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          Pseudo-Genius Math Lab
        </button>
        <button
          onClick={() => {
            soundEngine.playClick();
            setActiveTab('mars');
          }}
          className={`px-4 py-2 text-xs font-mono font-medium rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-2 ${
            activeTab === 'mars'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          Mars Oxygen Simulator
        </button>
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => {
            const nextState = !soundEnabled;
            setSoundEnabled(nextState);
            soundEngine.toggleThruster(nextState);
            soundEngine.playClick();
          }}
          title={soundEnabled ? "Disable Thruster Hum" : "Enable Thruster Hum"}
          className={`p-2 rounded-lg border transition-all ${
            soundEnabled
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenExport();
          }}
          className="px-4 py-2 text-xs font-mono font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-lg hover:from-cyan-300 hover:to-emerald-300 transition-all shadow-lg shadow-cyan-500/20 whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <Download className="w-3.5 h-3.5" />
          Export Book
        </button>
      </div>
    </header>
  );
};
