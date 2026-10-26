/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, X, FileText, CheckCircle2, FileType, Loader2, BookOpen } from 'lucide-react';
import { CHAPTERS, BOOK_METADATA } from '../data/chapters';
import { soundEngine } from '../utils/audio';
import { generateDocxBlob } from '../utils/docxExport';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  if (!isOpen) return null;

  const handleDownload = (format: 'md' | 'txt') => {
    soundEngine.playClick();
    let fileContent = '';

    if (format === 'md') {
      fileContent += `# ${BOOK_METADATA.title.toUpperCase()}\n\n`;
      fileContent += `> *"${BOOK_METADATA.epigraph}"*\n\n`;
      fileContent += `**Written by ${BOOK_METADATA.author} (${BOOK_METADATA.authorRole})**\n\n`;
      fileContent += `![Book Cover](${BOOK_METADATA.coverImage})\n\n`;
      fileContent += `---\n\n`;

      CHAPTERS.forEach((c) => {
        if (c.number === 1) return; // Skip duplicate title page
        fileContent += `## ${c.title}\n`;
        fileContent += `*${c.subtitle}*\n\n`;
        c.content.forEach((p) => {
          if (p.startsWith('IMAGE: ')) {
            const parts = p.replace('IMAGE: ', '').split('|').map((s) => s.trim());
            fileContent += `![${parts[1] || 'Figure'}](${parts[0]})\n*${parts[1] || ''}*\n\n`;
          } else if (p.startsWith('SUBHEADER: ')) {
            fileContent += `### ${p.replace('SUBHEADER: ', '')}\n\n`;
          } else {
            fileContent += `${p}\n\n`;
          }
        });
        fileContent += `---\n\n`;
      });
    } else {
      fileContent += `================================================================================\n`;
      fileContent += `${BOOK_METADATA.title.toUpperCase()}\n`;
      fileContent += `"${BOOK_METADATA.epigraph}"\n`;
      fileContent += `By ${BOOK_METADATA.author} (${BOOK_METADATA.authorRole})\n`;
      fileContent += `================================================================================\n\n\n`;

      CHAPTERS.forEach((c) => {
        if (c.number === 1) return;
        fileContent += `--------------------------------------------------------------------------------\n`;
        fileContent += `${c.title.toUpperCase()}\n`;
        fileContent += `${c.subtitle}\n`;
        fileContent += `--------------------------------------------------------------------------------\n\n`;
        c.content.forEach((p) => {
          if (p.startsWith('IMAGE: ')) {
            const parts = p.replace('IMAGE: ', '').split('|').map((s) => s.trim());
            fileContent += `[ FIGURE / DIAGRAM: ${parts[1] || 'Embedded Image'} (${parts[0]}) ]\n\n`;
          } else if (p.startsWith('SUBHEADER: ')) {
            fileContent += `\n[ ${p.replace('SUBHEADER: ', '').toUpperCase()} ]\n\n`;
          } else {
            fileContent += `${p}\n\n`;
          }
        });
        fileContent += `\n\n`;
      });
    }

    const blob = new Blob([fileContent], { type: format === 'md' ? 'text/markdown' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Elon_Musk_The_End_Justifies_The_Means_Nathaniel_Mina.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadDocx = async () => {
    soundEngine.playClick();
    setIsExportingDocx(true);
    try {
      const blob = await generateDocxBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Elon_Musk_The_End_Justifies_The_Means_Nathaniel_Mina.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate docx:', err);
      alert('Failed to generate Word document. Please try again.');
    } finally {
      setIsExportingDocx(false);
    }
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
            <p className="text-xs font-mono text-slate-400">Complete book: Cover, Front Matter, 13 Chapters & Back Matter.</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Microsoft Word (.docx) Option */}
          <button
            onClick={handleDownloadDocx}
            disabled={isExportingDocx}
            className="w-full p-4 bg-slate-950 border border-blue-500/40 hover:border-blue-400 rounded-xl flex items-center justify-between group transition-all text-left shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                {isExportingDocx ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileType className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-slate-100 flex items-center gap-2">
                  <span>Microsoft Word (.docx)</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded font-normal">
                    With Embedded Cover
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {isExportingDocx ? 'Compiling Word Document...' : 'Full styling, page breaks, headings, and tables'}
                </div>
              </div>
            </div>
            <CheckCircle2 className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* Markdown Option */}
          <button
            onClick={() => handleDownload('md')}
            className="w-full p-4 bg-slate-950 border border-cyan-500/30 hover:border-cyan-500 rounded-xl flex items-center justify-between group transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-slate-200">Markdown Format (.md)</div>
                <div className="text-[10px] text-slate-500">Complete manuscript with cover link and subheadings</div>
              </div>
            </div>
            <CheckCircle2 className="w-4 h-4 text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* Plain Text Option */}
          <button
            onClick={() => handleDownload('txt')}
            className="w-full p-4 bg-slate-950 border border-emerald-500/30 hover:border-emerald-500 rounded-xl flex items-center justify-between group transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
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
