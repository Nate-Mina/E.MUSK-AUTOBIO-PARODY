/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ChapterReader } from './components/ChapterReader';
import { ElonAIChat } from './components/ElonAIChat';
import { FamousQuotes } from './components/FamousQuotes';
import { InteractiveTimeline } from './components/InteractiveTimeline';
import { ExportModal } from './components/ExportModal';
import { AudioController } from './components/AudioController';

export default function App() {
  const [activeTab, setActiveTab] = useState<'reader' | 'chat' | 'quotes' | 'timeline'>('reader');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExport={() => setIsExportOpen(true)}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      {/* Persistent SpaceX Launch Ambient Audio Controller */}
      <div className="bg-slate-950/80 border-b border-cyan-900/30 px-6 py-2.5 flex items-center justify-between flex-wrap gap-4">
        <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>ATMOSPHERIC TELEMETRY & SOUNDSCAPE CONTROLLER</span>
        </div>
        <AudioController activeTab={activeTab} />
      </div>

      <main className="flex-1 pb-16">
        {activeTab === 'reader' && <ChapterReader />}
        {activeTab === 'chat' && <ElonAIChat />}
        {activeTab === 'quotes' && <FamousQuotes />}
        {activeTab === 'timeline' && <InteractiveTimeline />}
      </main>

      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />

      <footer className="py-6 border-t border-slate-800/60 bg-slate-950/80 text-center text-xs font-mono text-slate-500">
        ELON MUSK: The End Justifies the Means // All rights reserved across 3 dimensions and Mars orbit.
      </footer>
    </div>
  );
}
