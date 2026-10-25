/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { CHAPTERS, Chapter } from '../data/chapters';
import { Bookmark, Search, Volume2, Play, ChevronLeft, ChevronRight, Sparkles, ShieldAlert, Check } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { narrateWithElon } from '../utils/ai';

export const ChapterReader: React.FC = () => {
  const [selectedChapterNum, setSelectedChapterNum] = useState<number>(1);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('lg');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [isNarrating, setIsNarrating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [isContinuousPlaying, setIsContinuousPlaying] = useState<boolean>(false);
  const [ttsSpeed, setTtsSpeed] = useState<number>(1);

  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const articleRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!articleRef.current) return;
      const article = articleRef.current;
      const rect = article.getBoundingClientRect();
      const articleHeight = article.offsetHeight;
      const windowHeight = window.innerHeight;

      const totalScrollable = articleHeight - windowHeight;
      if (totalScrollable <= 0) {
        setScrollProgress(100);
        return;
      }

      const scrolled = -rect.top;
      const progress = Math.min(100, Math.max(0, (scrolled / totalScrollable) * 100));
      setScrollProgress(Math.round(progress));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedChapterNum]);

  useEffect(() => {
    const saved = localStorage.getItem('elon_book_bookmarks');
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch {
        // parsing error fallback
      }
    }
    const savedAuto = localStorage.getItem('elon_auto_advance');
    if (savedAuto !== null) {
      setAutoAdvance(savedAuto === 'true');
    }
    const savedSpeed = localStorage.getItem('elon_tts_speed');
    if (savedSpeed !== null) {
      setTtsSpeed(parseFloat(savedSpeed));
    }
  }, []);

  const toggleBookmark = (num: number) => {
    soundEngine.playClick();
    let updated: number[];
    if (bookmarks.includes(num)) {
      updated = bookmarks.filter((b) => b !== num);
    } else {
      updated = [...bookmarks, num];
    }
    setBookmarks(updated);
    localStorage.setItem('elon_book_bookmarks', JSON.stringify(updated));
  };

  const currentChapter: Chapter = CHAPTERS.find((c) => c.number === selectedChapterNum) || CHAPTERS[0];

  const handleNarrate = async (targetChapter?: Chapter) => {
    soundEngine.playClick();
    if (isNarrating) return;
    setIsNarrating(true);
    setAudioUrl(null);

    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }

    const chapterToNarrate = targetChapter || currentChapter;

    try {
      const summaryText = chapterToNarrate.content.slice(0, 3).join(' ');
      const audioData = await narrateWithElon(summaryText);
      if (audioData) {
        const binary = atob(audioData);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        const audio = new Audio(url);
        audio.playbackRate = ttsSpeed;
        activeAudioRef.current = audio;

        audio.onended = () => {
          if (autoAdvance && isContinuousPlaying) {
            if (chapterToNarrate.number < 13) {
              setSelectedChapterNum(chapterToNarrate.number + 1);
            } else {
              setIsContinuousPlaying(false);
            }
          }
        };

        await audio.play();
      }
    } catch (err: any) {
      console.error('TTS error:', err);
      setIsContinuousPlaying(false);
      alert(`[SYSTEM ERROR]: ${err.message || "TTS service unavailable."} Note: TTS requires a backend and may not work on static hosting.`);
    } finally {
      setIsNarrating(false);
    }
  };

  useEffect(() => {
    if (isContinuousPlaying && selectedChapterNum <= 13) {
      handleNarrate(currentChapter);
    }
  }, [selectedChapterNum, isContinuousPlaying]);

  const handleNarrateAll = () => {
    soundEngine.playClick();
    setAutoAdvance(true);
    setIsContinuousPlaying(true);
    if (selectedChapterNum !== 1) {
      setSelectedChapterNum(1);
    } else {
      handleNarrate(CHAPTERS[0]);
    }
  };

  const stopContinuous = () => {
    soundEngine.playClick();
    setIsContinuousPlaying(false);
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
  };

  const filteredChapters = CHAPTERS.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.content.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Scroll Progress Bar (Fixed below Navbar) */}
      <div className="fixed top-[73px] left-0 w-full h-1 bg-slate-900/40 z-40 pointer-events-none overflow-hidden">
        <div 
          className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
        <div className="absolute top-2 right-4 text-[10px] font-mono text-cyan-400 bg-[#090d16]/80 px-2 py-0.5 rounded border border-cyan-900/40 backdrop-blur-sm shadow-lg">
          {scrollProgress}% READ
        </div>
      </div>

      {/* Sidebar Navigation */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md sticky top-24">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search chapters & telemetry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-all font-mono"
            />
          </div>

          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-mono text-cyan-400 tracking-wider">TABLE OF CONTENTS</span>
            <span className="text-[10px] font-mono text-slate-500">13 CHAPTERS</span>
          </div>

          <div className="space-y-1.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 custom-scrollbar">
            {filteredChapters.map((chap) => {
              const isSelected = chap.number === selectedChapterNum;
              const isBookmarked = bookmarks.includes(chap.number);
              return (
                <button
                  key={chap.number}
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedChapterNum(chap.number);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border border-cyan-500/40 text-cyan-300 shadow-lg'
                      : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="font-mono text-xs text-cyan-400 shrink-0">
                      {String(chap.number).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-medium truncate">{chap.title}</span>
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(chap.number);
                    }}
                    className={`p-1 rounded hover:bg-slate-700/50 transition-colors ${
                      isBookmarked ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5 fill-current" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Chapter Content */}
      <div className="lg:col-span-3 space-y-6">
        {/* Top Reading Controls Toolbar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">FONT SCALE:</span>
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
              {(['sm', 'base', 'lg', 'xl'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    soundEngine.playClick();
                    setFontSize(size);
                  }}
                  className={`px-3 py-1 text-xs font-mono rounded-md transition-all uppercase ${
                    fontSize === size
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* TTS Speed Controls */}
            <div className="flex items-center gap-1 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 mr-1">SPEED:</span>
              {[1, 1.25, 1.5, 2].map((speed) => (
                <button
                  key={speed}
                  onClick={() => {
                    soundEngine.playClick();
                    setTtsSpeed(speed);
                    localStorage.setItem('elon_tts_speed', String(speed));
                    if (activeAudioRef.current) {
                      activeAudioRef.current.playbackRate = speed;
                    }
                  }}
                  className={`px-2 py-0.5 text-xs font-mono rounded transition-all ${
                    ttsSpeed === speed ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
              <input
                type="checkbox"
                checked={autoAdvance}
                onChange={(e) => {
                  setAutoAdvance(e.target.checked);
                  localStorage.setItem('elon_auto_advance', String(e.target.checked));
                }}
                className="accent-cyan-400 w-3.5 h-3.5 rounded"
              />
              <span>Auto-Advance</span>
            </label>

            <button
              onClick={() => handleNarrate()}
              disabled={isNarrating}
              className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-mono font-medium rounded-xl transition-all flex items-center gap-2 shadow-sm"
            >
              <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
              {isNarrating && !isContinuousPlaying ? 'Synthesizing...' : 'Narrate Chapter'}
            </button>

            {isContinuousPlaying ? (
              <button
                onClick={stopContinuous}
                className="px-4 py-2 bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 text-xs font-mono font-medium rounded-xl transition-all flex items-center gap-2 shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                Stop Narrate All (1-13)
              </button>
            ) : (
              <button
                onClick={handleNarrateAll}
                className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 text-xs font-mono font-medium rounded-xl transition-all flex items-center gap-2 shadow-sm"
              >
                <Play className="w-4 h-4 text-cyan-400" />
                Narrate All (1-13)
              </button>
            )}

            <button
              onClick={() => toggleBookmark(currentChapter.number)}
              className={`p-2.5 rounded-xl border transition-all ${
                bookmarks.includes(currentChapter.number)
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>

        {audioUrl && (
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 flex items-center justify-between gap-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 animate-pulse">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-emerald-300 block">
                  {isContinuousPlaying ? `NARRATING CHAPTER ${selectedChapterNum}/13 (AUTO-ADVANCING @ ${ttsSpeed}x)` : `ELON VOICE NARRATION READY (@ ${ttsSpeed}x)`}
                </span>
                <span className="text-[10px] font-mono text-slate-400">Includes dramatic pauses & satirical commentary</span>
              </div>
            </div>
            <audio controls src={audioUrl} className="h-10 accent-emerald-500" />
          </div>
        )}

        {/* Chapter Prose Container */}
        <article ref={articleRef} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 lg:p-12 backdrop-blur-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Chapter Header */}
          <div className="mb-8 border-b border-slate-800 pb-6">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
              <span>CHAPTER {String(currentChapter.number).padStart(2, '0')}</span>
              <span>/</span>
              <span>13</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-100 mb-2 font-sans">
              {currentChapter.title}
            </h1>
            <p className="text-sm font-mono text-slate-400 italic">
              {currentChapter.subtitle}
            </p>
          </div>

          {/* Body Prose with Rich Formatting */}
          <div
            className={`space-y-6 text-slate-300 leading-relaxed font-sans ${
              fontSize === 'sm'
                ? 'text-sm'
                : fontSize === 'base'
                ? 'text-base'
                : fontSize === 'lg'
                ? 'text-lg'
                : 'text-xl'
            }`}
          >
            {currentChapter.content.map((paragraph, idx) => {
              // Subheader rendering
              if (paragraph.startsWith('SUBHEADER: ')) {
                const subheaderText = paragraph.replace('SUBHEADER: ', '');
                return (
                  <div key={idx} className="pt-6 pb-2 border-b border-cyan-900/30">
                    <h2 className="text-base lg:text-lg font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      {subheaderText}
                    </h2>
                  </div>
                );
              }

              // Table / Ledger row rendering
              if (paragraph.startsWith('|') && paragraph.includes('|')) {
                const isHeaderSeparator = paragraph.includes('---');
                if (isHeaderSeparator) return null;
                const columns = paragraph.split('|').map((col) => col.trim()).filter(Boolean);
                const isHeader = paragraph.toLowerCase().includes('category') || paragraph.toLowerCase().includes('entity');

                return (
                  <div key={idx} className="overflow-x-auto my-2">
                    <div
                      className={`grid grid-cols-4 gap-4 p-3 rounded-xl border font-mono text-xs ${
                        isHeader
                          ? 'bg-cyan-950/40 border-cyan-800/60 text-cyan-300 font-bold'
                          : 'bg-slate-950/60 border-slate-800/60 text-slate-300 hover:border-cyan-500/30'
                      }`}
                    >
                      {columns.map((col, cIdx) => (
                        <div key={cIdx} className={cIdx === 2 ? 'text-amber-300 font-bold' : ''}>
                          {col}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              // Bullet item rendering
              if (paragraph.startsWith('- ')) {
                return (
                  <div key={idx} className="flex items-start gap-3 pl-4 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2.5 shrink-0" />
                    <span className="text-slate-300 font-mono text-sm leading-relaxed">
                      {paragraph.replace('- ', '')}
                    </span>
                  </div>
                );
              }

              // Mathematical formula block
              const isMath = paragraph.includes('=') && (paragraph.includes('/') || paragraph.includes('^') || paragraph.includes('-'));
              if (isMath) {
                return (
                  <div
                    key={idx}
                    className="my-6 p-4 bg-slate-950 border border-cyan-500/30 rounded-xl font-mono text-cyan-300 text-center overflow-x-auto shadow-inner"
                  >
                    <code>{paragraph}</code>
                  </div>
                );
              }

              // Standard narrative paragraph
              return (
                <p key={idx} className="tracking-wide">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Chapter Navigation Control Bar */}
          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-stretch justify-between gap-4">
            {/* Previous Chapter Link */}
            {selectedChapterNum > 1 ? (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedChapterNum(selectedChapterNum - 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex-1 group flex items-center gap-4 p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500 group-hover:text-cyan-400 border border-slate-800 transition-colors shrink-0">
                  <ChevronLeft className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Previous Chapter</div>
                  <div className="text-sm font-semibold text-slate-300 group-hover:text-cyan-300 transition-colors truncate">
                    {CHAPTERS.find(c => c.number === selectedChapterNum - 1)?.title}
                  </div>
                </div>
              </button>
            ) : <div className="flex-1" />}

            {/* Next Chapter Link */}
            {selectedChapterNum < 13 ? (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedChapterNum(selectedChapterNum + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex-1 group flex items-center justify-end gap-4 p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all text-right"
              >
                <div className="min-w-0">
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Next Chapter</div>
                  <div className="text-sm font-semibold text-slate-300 group-hover:text-cyan-300 transition-colors truncate">
                    {CHAPTERS.find(c => c.number === selectedChapterNum + 1)?.title}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-500 group-hover:text-cyan-400 border border-slate-800 transition-colors shrink-0">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </button>
            ) : <div className="flex-1" />}
          </div>
        </article>
      </div>
    </div>
  );
};
