/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ChapterReader } from './components/ChapterReader';
import { ElonAIChat } from './components/ElonAIChat';
import { MathLab } from './components/MathLab';
import { MarsSimulator } from './components/MarsSimulator';
import { ExportModal } from './components/ExportModal';
import { soundEngine } from './utils/audio';
import { Volume2, Zap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'reader' | 'chat' | 'math' | 'mars'>('reader');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [volume, setVolume] = useState(0.15);

  // Handle ambient intensity based on active tab
  useEffect(() => {
    const intensityMap = {
      reader: 300,
      chat: 800,
      math: 1500,
      mars: 3000,
    };
    soundEngine.setAmbientIntensity(intensityMap[activeTab]);
  }, [activeTab]);

  // Sync volume
  useEffect(() => {
    soundEngine.setAmbientVolume(volume);
  }, [volume]);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExport={() => setIsExportOpen(true)}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      <main className="flex-1 pb-16">
        {activeTab === 'reader' && <ChapterReader />}
        {activeTab === 'chat' && <ElonAIChat />}
        {activeTab === 'math' && <MathLab />}
        {activeTab === 'mars' && <MarsSimulator />}
      </main>

      {/* Floating Audio Controller */}
      {soundEnabled && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900/90 border border-cyan-500/30 p-4 rounded-2xl backdrop-blur-md shadow-2xl flex items-center gap-4 animate-in slide-in-from-left duration-300">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-mono text-cyan-400 uppercase tracking-tighter">
              <span>Ambient Output</span>
              <span>{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-32 accent-cyan-400 bg-slate-800 h-1 rounded-lg"
            />
          </div>
        </div>
      )}

      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />

      <footer className="py-6 border-t border-slate-800/60 bg-slate-950/80 text-center text-xs font-mono text-slate-500">
        ELON MUSK: The End Justifies the Means // All rights reserved across 3 dimensions and Mars orbit.
      </footer>
    </div>
  );
}
