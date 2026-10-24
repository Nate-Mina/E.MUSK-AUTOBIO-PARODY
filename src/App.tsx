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
  const [ambientVolume, setAmbientVolume] = useState(0.15);

  // Sync ambient intensity with active tab
  useEffect(() => {
    if (!soundEnabled) return;
    
    let intensity = 0.3; // Default (Reader/Chat)
    if (activeTab === 'math') intensity = 0.6;
    if (activeTab === 'mars') intensity = 1.0; // Max launch intensity
    
    soundEngine.setAmbientIntensity(intensity);
  }, [activeTab, soundEnabled]);

  const handleVolumeChange = (newVol: number) => {
    setAmbientVolume(newVol);
    soundEngine.setAmbientVolume(newVol);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExport={() => setIsExportOpen(true)}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      {/* Global Ambient Controller (Visible only when sound is enabled) */}
      {soundEnabled && (
        <div className="fixed bottom-24 right-6 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-4 backdrop-blur-xl shadow-2xl flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
              <Zap className="w-3 h-3 fill-current" />
              <span>Launch Ambience</span>
            </div>
            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-slate-400" />
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.01"
                value={ambientVolume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-32 accent-cyan-500 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
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

