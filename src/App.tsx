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
import { Volume2, VolumeX, Zap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'reader' | 'chat' | 'math' | 'mars'>('reader');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [volume, setVolume] = useState(0.4);

  // Tab-based intensity logic
  useEffect(() => {
    let intensity = 0.2; // Base intensity (Reader)
    if (activeTab === 'chat') intensity = 0.35;
    if (activeTab === 'math') intensity = 0.5;
    if (activeTab === 'mars') intensity = 0.85; // Max intensity during launch simulation

    soundEngine.setIntensity(intensity);
  }, [activeTab]);

  useEffect(() => {
    soundEngine.setVolume(volume);
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

      {/* Global Audio Controller UI */}
      {soundEnabled && (
        <div className="fixed bottom-24 right-6 z-40 bg-slate-900/80 border border-cyan-500/30 p-4 rounded-2xl backdrop-blur-xl shadow-2xl flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <Zap className={`w-4 h-4 ${activeTab === 'mars' ? 'animate-pulse' : ''}`} />
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase">
              {activeTab === 'mars' ? 'MAX THRUST' : 'AMBIENT TELEMETRY'}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume} 
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-24 h-1 bg-slate-800 accent-cyan-500 rounded-lg cursor-pointer"
            />
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
          </div>
        </div>
      )}

      <main className="flex-1 pb-16">
        {activeTab === 'reader' && <ChapterReader />}
        {activeTab === 'chat' && <ElonAIChat />}
        {activeTab === 'math' && <MathLab />}
        {activeTab === 'mars' && <MarsSimulator />}
      </main>

      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />

      <footer className="py-6 border-t border-slate-800/60 bg-slate-950/80 text-center text-xs font-mono text-slate-500">
        ELON MUSK: The End Justifies the Means // All rights reserved across 3 dimensions and Mars orbit.
      </footer>
    </div>
  );
}

