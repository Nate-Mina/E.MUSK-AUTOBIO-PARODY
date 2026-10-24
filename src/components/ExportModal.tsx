/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Download, X, FileText, CheckCircle2 } from 'lucide-react';
import { CHAPTERS } from '../data/chapters';
import { soundEngine } from '../utils/audio';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleDownload = (format: 'md' | 'txt') => {
    soundEngine.playClick();
    let fileContent = `# ELON MUSK: The End Justifies the Means\n\n`;
    CHAPTERS.forEach((c) => {
      fileContent += `## CHAPTER ${c.number}: ${c.title}\n`;
      fileContent += `*${c.subtitle}*\n\n`;
      c.content.forEach((p) => {
        fileContent += `${p}\n\n`;
      });
      fileContent += `---\n\n`;
    });

    const blob = new Blob([fileContent], { type: format === 'md' ? 'text/markdown' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Elon_Musk_Autobiography.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={() => {
            soundEngine.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-mono text-slate-100">EXPORT MANUSCRIPT</h3>
            <p className="text-xs font-mono text-slate-400">Download complete manuscript payload.</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleDownload('md')}
            className="w-full p-4 bg-slate-950 border border-cyan-500/30 hover:border-cyan-500 rounded-xl flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-cyan-400" />
              <div className="text-left">
                <div className="text-xs font-mono font-bold text-slate-200">Markdown Format (.md)</div>
                <div className="text-[10px] text-slate-500">Optimized for EPUB and Pandoc compilation</div>
              </div>
            </div>
            <CheckCircle2 className="w-4 h-4 text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={() => handleDownload('txt')}
            className="w-full p-4 bg-slate-950 border border-emerald-500/30 hover:border-emerald-500 rounded-xl flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-emerald-400" />
              <div className="text-left">
                <div className="text-xs font-mono font-bold text-slate-200">Plain Text Format (.txt)</div>
                <div className="text-[10px] text-slate-500">Universal raw text distribution</div>
              </div>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>
    </div>
  );
};
