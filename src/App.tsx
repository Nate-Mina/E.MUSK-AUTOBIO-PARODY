/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ChapterReader } from './components/ChapterReader';
import { ElonAIChat } from './components/ElonAIChat';
import { MathLab } from './components/MathLab';
import { MarsSimulator } from './components/MarsSimulator';
import { ExportModal } from './components/ExportModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'reader' | 'chat' | 'math' | 'mars'>('reader');
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
