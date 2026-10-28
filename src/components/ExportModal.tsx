/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, X, FileText, CheckCircle2, FileType, Loader2, BookOpen, Tablet, Package, Sparkles } from 'lucide-react';
import { CHAPTERS, BOOK_METADATA } from '../data/chapters';
import { soundEngine } from '../utils/audio';
import { generateDocxBlob } from '../utils/docxExport';
import { generateEpubBlob } from '../utils/epubExport';
import { generateKindlePackageBlob } from '../utils/kpfExport';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isExportingEpub, setIsExportingEpub] = useState(false);
  const [isExportingKpf, setIsExportingKpf] = useState(false);

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

  const handleDownloadEpub = async () => {
    soundEngine.playClick();
    setIsExportingEpub(true);
    try {
      const blob = await generateEpubBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Elon_Musk_The_End_Justifies_The_Means.epub`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate EPUB:', err);
      alert('Failed to generate EPUB file. Please check console for details.');
    } finally {
      setIsExportingEpub(false);
    }
  };

  const handleDownloadKindlePackage = async (extension: 'kpf' | 'zip' = 'kpf') => {
    soundEngine.playClick();
    setIsExportingKpf(true);
    try {
      const blob = await generateKindlePackageBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Elon_Musk_The_End_Justifies_The_Means_Kindle_Package.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate Kindle package:', err);
      alert('Failed to generate Kindle package. Please try again.');
    } finally {
      setIsExportingKpf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={() => {
            soundEngine.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-mono text-slate-100">EXPORT MANUSCRIPT & EBOOK</h3>
            <p className="text-xs font-mono text-slate-400">Complete book: Cover, Front Matter, 13 Chapters & Back Matter.</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Section: Ebook & Kindle Publishing */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-mono font-bold text-amber-400 tracking-wider uppercase flex items-center gap-1.5">
              <Tablet className="w-3.5 h-3.5 text-amber-400" />
              <span>Kindle &amp; E-Reader Formats</span>
            </div>

            {/* 1. Amazon Kindle & E-Reader EPUB */}
            <button
              onClick={handleDownloadEpub}
              disabled={isExportingEpub}
              className="w-full p-4 bg-slate-950 border border-amber-500/40 hover:border-amber-400 rounded-xl flex items-center justify-between group transition-all text-left shadow-lg cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  {isExportingEpub ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookOpen className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-mono font-bold text-slate-100 flex items-center gap-2 flex-wrap">
                    <span>Kindle EPUB 3.0 (.epub)</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 font-semibold">
                      Direct Amazon KDP Upload
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    {isExportingEpub
                      ? 'Compiling EPUB 3.0 container & embedding plates...'
                      : 'Recommended for Amazon KDP, Apple Books & Kobo. Full noir illustrations, Roman front matter, and Chapter 1 on Page 1.'}
                  </div>
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
            </button>

            {/* 2. Kindle Create Companion Package (.kpf / .zip) */}
            <div className="p-4 bg-slate-950 border border-cyan-500/40 rounded-xl space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  {isExportingKpf ? <Loader2 className="w-5 h-5 animate-spin" /> : <Package className="w-5 h-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-mono font-bold text-slate-100 flex items-center gap-2 flex-wrap">
                    <span>Kindle Create Companion (.kpf / .zip)</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30 font-semibold">
                      Amazon Tool Bundle
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    {isExportingKpf
                      ? 'Packaging book.kcb, Kindle-ready DOCX, images & manifest...'
                      : 'Includes book.kcb manifest, Kindle-ready Word manuscript, high-res noir graphics, and 1-click Kindle Create import guide.'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                <button
                  onClick={() => handleDownloadKindlePackage('kpf')}
                  disabled={isExportingKpf}
                  className="flex-1 py-2 px-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download as .kpf</span>
                </button>
                <button
                  onClick={() => handleDownloadKindlePackage('zip')}
                  disabled={isExportingKpf}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Download unpacked archive (.zip) with source files"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download .zip</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section: Word & Text Formats */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <div className="text-[11px] font-mono font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
              <FileType className="w-3.5 h-3.5 text-slate-400" />
              <span>Document &amp; Text Formats</span>
            </div>

            {/* Microsoft Word (.docx) Option */}
            <button
              onClick={handleDownloadDocx}
              disabled={isExportingDocx}
              className="w-full p-3.5 bg-slate-950 border border-blue-500/30 hover:border-blue-400 rounded-xl flex items-center justify-between group transition-all text-left shadow-lg cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  {isExportingDocx ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileType className="w-5 h-5" />}
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-slate-100 flex items-center gap-2">
                    <span>Microsoft Word (.docx)</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded font-normal">
                      Roman/Arabic Sections
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {isExportingDocx ? 'Compiling Word Document...' : 'Dual pagination, page breaks, embedded cover, and forensic ledger'}
                  </div>
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* Markdown & Plain Text Grid */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDownload('md')}
                className="p-3 bg-slate-950 border border-slate-800 hover:border-cyan-500/50 rounded-xl flex items-center gap-2.5 group transition-all text-left cursor-pointer"
              >
                <div className="w-7 h-7 rounded-md bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-mono font-semibold text-slate-200">Markdown (.md)</div>
                  <div className="text-[10px] text-slate-500 truncate">Source formatting</div>
                </div>
              </button>

              <button
                onClick={() => handleDownload('txt')}
                className="p-3 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-xl flex items-center gap-2.5 group transition-all text-left cursor-pointer"
              >
                <div className="w-7 h-7 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-mono font-semibold text-slate-200">Plain Text (.txt)</div>
                  <div className="text-[10px] text-slate-500 truncate">Raw text file</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
