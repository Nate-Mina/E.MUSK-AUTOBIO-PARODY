/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { CHAPTERS, Chapter } from '../data/chapters';
import { Bookmark, Search, Volume2, Play, ChevronLeft, ChevronRight, BookOpen, User, Quote, Sparkles, ShieldCheck, Image as ImageIcon, Maximize2, X, Download } from 'lucide-react';
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
  const [lightboxImage, setLightboxImage] = useState<{ src: string; caption: string } | null>(null);

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
            if (chapterToNarrate.number < CHAPTERS.length) {
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
    if (isContinuousPlaying && selectedChapterNum <= CHAPTERS.length) {
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

  const categories = ['FRONT MATTER', 'MANUSCRIPT CHAPTERS', 'BACK MATTER'] as const;

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
              placeholder="Search manuscript & telemetry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-all font-mono"
            />
          </div>

          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-mono text-cyan-400 tracking-wider">TABLE OF CONTENTS</span>
            <span className="text-[10px] font-mono text-slate-500">{CHAPTERS.length} SECTIONS</span>
          </div>

          {/* Grouped Table of Contents */}
          <div className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 custom-scrollbar">
            {categories.map((category) => {
              const itemsInCategory = filteredChapters.filter((c) => c.displayCategory === category);
              if (itemsInCategory.length === 0) return null;

              return (
                <div key={category} className="space-y-1.5">
                  <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest px-2 pt-1 border-t border-slate-800/60 first:border-t-0">
                    {category}
                  </div>
                  {itemsInCategory.map((chap) => {
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
                        <div className="flex items-center gap-1.5 shrink-0">
                          {chap.illustration && (
                            <span title="Features High-Contrast Noir Illustration" className="text-cyan-400/70 group-hover:text-cyan-300 transition-colors p-0.5">
                              <ImageIcon className="w-3.5 h-3.5" />
                            </span>
                          )}
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
                        </div>
                      </button>
                    );
                  })}
                </div>
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
              {isNarrating && !isContinuousPlaying ? 'Synthesizing...' : 'Narrate Section'}
            </button>

            {isContinuousPlaying ? (
              <button
                onClick={stopContinuous}
                className="px-4 py-2 bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 text-xs font-mono font-medium rounded-xl transition-all flex items-center gap-2 shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                Stop Autoplay
              </button>
            ) : (
              <button
                onClick={handleNarrateAll}
                className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 text-xs font-mono font-medium rounded-xl transition-all flex items-center gap-2 shadow-sm"
              >
                <Play className="w-4 h-4 text-cyan-400" />
                Narrate Full Book
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
                  {isContinuousPlaying
                    ? `NARRATING SECTION ${selectedChapterNum}/${CHAPTERS.length} (AUTO-ADVANCING @ ${ttsSpeed}x)`
                    : `ELON VOICE NARRATION READY (@ ${ttsSpeed}x)`}
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

          {/* Book Cover Banner (Rendered on Title Page / Section 1) */}
          {currentChapter.coverImage && (
            <div className="mb-10 flex flex-col md:flex-row items-center gap-8 bg-slate-950/80 p-6 md:p-8 rounded-2xl border border-cyan-500/40 shadow-2xl relative overflow-hidden">
              <div className="w-56 sm:w-64 shrink-0 rounded-xl overflow-hidden border-2 border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.3)] group">
                <img
                  src={currentChapter.coverImage}
                  alt="Elon Musk: The End Justifies the Means by Nathaniel Mina"
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>OFFICIAL COVER & FIRST EDITION</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-sans text-white tracking-tight">
                  Elon Musk: The End Justifies the Means
                </h2>
                <p className="text-base font-mono text-cyan-300 italic border-l-2 border-cyan-500 pl-3">
                  "Physics is the law; everything else is a recommendation."
                </p>
                <div className="text-sm font-mono text-slate-300">
                  Written by <span className="text-emerald-400 font-bold">Nathaniel Mina (The Author)</span>
                </div>
                <div className="text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
                  <div>Complete Unabridged Manuscript</div>
                </div>
              </div>
            </div>
          )}

          {/* Chapter Header */}
          <div className="mb-8 border-b border-slate-800 pb-6">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
              <span className="uppercase">{currentChapter.displayCategory}</span>
              <span>·</span>
              <span>SECTION {String(currentChapter.number).padStart(2, '0')} OF {CHAPTERS.length}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-100 mb-2 font-sans">
              {currentChapter.title}
            </h1>
            <p className="text-sm font-mono text-slate-400 italic">
              {currentChapter.subtitle}
            </p>
            {currentChapter.illustration && (
              <div className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 w-fit">
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px] font-mono font-medium text-cyan-300">
                  Includes Neo-Noir Graphic Novel Illustration
                </span>
              </div>
            )}
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

              // Embedded JPG / Image diagram rendering
              if (paragraph.startsWith('IMAGE: ')) {
                const parts = paragraph.replace('IMAGE: ', '').split('|').map((s) => s.trim());
                const imgSrc = parts[0];
                const imgCaption = parts[1] || '';
                const isNoirIllustration = imgSrc.includes('/ch') && !imgSrc.includes('ledger');

                return (
                  <figure
                    key={idx}
                    className="my-10 rounded-2xl overflow-hidden border border-cyan-500/40 bg-slate-950 p-4 sm:p-6 shadow-2xl relative group"
                  >
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="font-mono text-xs font-bold text-cyan-300 tracking-wider uppercase">
                          {isNoirIllustration ? 'Graphic Novel Noir Plate' : 'Archival Forensic Diagram'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playClick();
                          setLightboxImage({ src: imgSrc, caption: imgCaption });
                        }}
                        className="text-[11px] font-mono text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Enlarge Scan</span>
                      </button>
                    </div>

                    <div
                      onClick={() => {
                        soundEngine.playClick();
                        setLightboxImage({ src: imgSrc, caption: imgCaption });
                      }}
                      className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900/60 flex items-center justify-center cursor-zoom-in relative group/img"
                    >
                      <img
                        src={imgSrc}
                        alt={imgCaption}
                        className="w-full h-auto max-h-[620px] object-contain rounded-lg transition-transform duration-500 group-hover/img:scale-[1.015]"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-cyan-300 text-xs font-mono shadow-xl flex items-center gap-2">
                          <Maximize2 className="w-4 h-4 text-cyan-400" /> Click to Expand Noir Scan
                        </span>
                      </div>
                    </div>

                    {imgCaption && (
                      <figcaption className="mt-4 text-center font-mono text-xs sm:text-sm text-cyan-300/90 flex items-center justify-center gap-2 px-2">
                        <span>{imgCaption}</span>
                      </figcaption>
                    )}
                  </figure>
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
            {/* Previous Section Link */}
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
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Previous Section</div>
                  <div className="text-sm font-semibold text-slate-300 group-hover:text-cyan-300 transition-colors truncate">
                    {CHAPTERS.find(c => c.number === selectedChapterNum - 1)?.title}
                  </div>
                </div>
              </button>
            ) : <div className="flex-1" />}

            {/* Next Section Link */}
            {selectedChapterNum < CHAPTERS.length ? (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedChapterNum(selectedChapterNum + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex-1 group flex items-center justify-end gap-4 p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all text-right"
              >
                <div className="min-w-0">
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Next Section</div>
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

      {/* Noir Illustration Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="max-w-6xl w-full bg-slate-950 border border-cyan-500/50 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(6,182,212,0.3)] flex flex-col max-h-[94vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider block">
                    High-Contrast Neo-Noir Archival Scan
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    16:9 Graphic Novel Chiaroscuro Illustration
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={lightboxImage.src}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Scan</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setLightboxImage(null);
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 transition-colors border border-slate-700 cursor-pointer"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Image Area */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-black/80">
              <img
                src={lightboxImage.src}
                alt={lightboxImage.caption}
                className="max-w-full max-h-[72vh] object-contain rounded-xl border border-slate-800/80 shadow-2xl"
              />
            </div>

            {/* Modal Footer Caption */}
            <div className="p-4 bg-slate-900/95 border-t border-slate-800 text-center">
              <p className="text-xs sm:text-sm font-mono text-cyan-300/90 max-w-3xl mx-auto">
                {lightboxImage.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
