/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Quote, Search, Sparkles, Copy, Check, Volume2, Share2, Compass } from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { narrateWithElon } from '../utils/ai';

interface FamousQuote {
  id: string;
  quote: string;
  context: string;
  year: string;
  category: 'SpaceX' | 'Tesla' | 'AI' | 'Philosophy' | 'Twitter';
  subtext: string;
}

const QUOTES_DATABASE: FamousQuote[] = [
  {
    id: 'q1',
    quote: "I'd like to die on Mars, just not on impact.",
    context: "Mars Society Conference / Various Keynotes",
    year: "2002",
    category: "SpaceX",
    subtext: "First principles evaluation of orbital ballistic deceleration.",
  },
  {
    id: 'q2',
    quote: "When something is important enough, you do it even if the odds are not in your favor.",
    context: "60 Minutes CBS Interview",
    year: "2012",
    category: "Philosophy",
    subtext: "On pouring his entire PayPal liquid fortune into SpaceX and Tesla when both had a 90% chance of bankruptcy.",
  },
  {
    id: 'q3',
    quote: "With artificial intelligence we are summoning the demon. In all those stories where there's the guy with the pentagram and the holy water, it's like yeah he's sure he can control the demon. Didn't work out.",
    context: "MIT AeroAstro Centennial Symposium",
    year: "2014",
    category: "AI",
    subtext: "Before reversing course and announcing that AI will provide universal high income and Optimus robots.",
  },
  {
    id: 'q4',
    quote: "The probability of us living in base reality is one in billions.",
    context: "Recode Code Conference",
    year: "2016",
    category: "Philosophy",
    subtext: "Conclusive computational proof that we are merely subroutines in an alien teenager's video game console.",
  },
  {
    id: 'q5',
    quote: "If you're co-founder or CEO, you have to do all kinds of tasks you might not want to do... No task is too menial. I was sleeping on the factory floor because I wanted my circumstances to be worse than anyone else at the company.",
    context: "Tesla Model 3 Production Hell Keynote",
    year: "2018",
    category: "Tesla",
    subtext: "Sleeping on the Fremont paint shop floor between battery module welding shifts.",
  },
  {
    id: 'q6',
    quote: "Am considering taking Tesla private at $420. Funding secured.",
    context: "Twitter / Public Filing Shockwave",
    year: "2018",
    category: "Tesla",
    subtext: "The $40 million SEC fine that officially priced the cost of a numerical cannabis joke.",
  },
  {
    id: 'q7',
    quote: "Failure is an option here. If things are not failing, you are not innovating enough.",
    context: "Fast Company Aerospace Profile",
    year: "2005",
    category: "SpaceX",
    subtext: "The core doctrinal foundation of Unplanned Rapid Disassembly.",
  },
  {
    id: 'q8',
    quote: "I didn't insure it. Because if you have insurance, you're psychologically hedging against your own destiny.",
    context: "Private recounting of the 2000 McLaren F1 crash with Peter Thiel",
    year: "2000",
    category: "Philosophy",
    subtext: "Walking away from a destroyed $1M British supercar while laughing.",
  },
  {
    id: 'q9',
    quote: "The bird is freed. Let that sink in.",
    context: "Carrying a physical ceramic porcelain sink into Twitter Headquarters",
    year: "2022",
    category: "Twitter",
    subtext: "The beginning of the $44 billion algorithmic restructuring of the global town square.",
  },
  {
    id: 'q10',
    quote: "Boil things down to their fundamental truths and reason up from there, as opposed to reasoning by analogy.",
    context: "Kevin Rose Interview on First Principles",
    year: "2012",
    category: "Philosophy",
    subtext: "The bedrock methodology used to reduce rocket manufacturing costs by 90%.",
  },
  {
    id: 'q11',
    quote: "I think it's possible for ordinary people to choose to be extraordinary.",
    context: "Stanford University Graduate School of Business Talk",
    year: "2003",
    category: "Philosophy",
    subtext: "A direct challenge to the legacy biological units idling in middle management.",
  },
  {
    id: 'q12',
    quote: "Any product that needs a manual to work is broken.",
    context: "Tesla Internal Engineering Directive",
    year: "2015",
    category: "Tesla",
    subtext: "Ergonomic elimination of cognitive friction across all user interfaces.",
  },
  {
    id: 'q13',
    quote: "You have to be pretty driven to make it happen. Otherwise, you will just make yourself miserable.",
    context: "SpaceX Starship Boca Chica Briefing",
    year: "2021",
    category: "SpaceX",
    subtext: "Reflections on 120-hour workweeks under the Texas launch tower.",
  },
  {
    id: 'q14',
    quote: "Physics is the law, everything else is a recommendation.",
    context: "Starbase Raptor Engine Update",
    year: "2023",
    category: "SpaceX",
    subtext: "SEC regulations and labor union guidelines categorized as soft suggestions.",
  },
  {
    id: 'q15',
    quote: "Optimus will be more valuable than everything else combined. A post-scarcity economy where work is completely optional.",
    context: "Tesla Cybercab & We, Robot Keynote",
    year: "2024",
    category: "AI",
    subtext: "Guaranteed universal high income compiled into humanoid bipedal robotics.",
  },
  {
    id: 'q16',
    quote: "It's like a grandmaster playing chess against an ordinary player. AI will be vastly smarter than any human by next year.",
    context: "Global AI Safety Summit",
    year: "2023",
    category: "AI",
    subtext: "The exponential countdown clock to artificial superintelligence.",
  },
];

export const FamousQuotes: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [narratingId, setNarratingId] = useState<string | null>(null);
  const [featuredQuote, setFeaturedQuote] = useState<FamousQuote>(QUOTES_DATABASE[0]);

  const categories = ['All', 'SpaceX', 'Tesla', 'AI', 'Philosophy', 'Twitter'];

  const filteredQuotes = QUOTES_DATABASE.filter((q) => {
    const matchesCategory = selectedCategory === 'All' || q.category === selectedCategory;
    const matchesSearch =
      q.quote.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.context.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subtext.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (quote: FamousQuote) => {
    soundEngine.playClick();
    navigator.clipboard.writeText(`"${quote.quote}" — Elon Musk (${quote.context}, ${quote.year})`);
    setCopiedId(quote.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRandomQuote = () => {
    soundEngine.playClick();
    const randomIndex = Math.floor(Math.random() * QUOTES_DATABASE.length);
    setFeaturedQuote(QUOTES_DATABASE[randomIndex]);
  };

  const handleNarrateQuote = async (quote: FamousQuote) => {
    soundEngine.playClick();
    if (narratingId) return;
    setNarratingId(quote.id);
    try {
      const audioData = await narrateWithElon(quote.quote);
      if (audioData) {
        const binary = atob(audioData);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.onended = () => setNarratingId(null);
        await audio.play();
      }
    } catch (err: any) {
      console.error('Quote TTS error:', err);
      alert(`[TTS ERROR]: ${err.message || 'Audio service unavailable.'}`);
      setNarratingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-cyan-500/30 rounded-2xl p-6 lg:p-8 backdrop-blur-md relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
              <Compass className="w-4 h-4" />
              <span>CANONICAL ORAL TELEMETRY</span>
              <span>·</span>
              <span>16 VERIFIED DISPATCHES</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-100 font-sans">
              Famous Quotes & Megalomaniacal Dispatches
            </h1>
            <p className="text-sm font-mono text-slate-400 mt-2 max-w-2xl">
              Authentic historical statements, keynote proclamations, and unfiltered midnight social media broadcasts compiled directly from public record.
            </p>
          </div>

          <button
            onClick={handleRandomQuote}
            className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-mono font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-emerald-400 transition-all flex items-center gap-2 shrink-0 self-start md:self-auto"
          >
            <Sparkles className="w-4 h-4" />
            Random Elon Oracle
          </button>
        </div>

        {/* Featured Hero Quote */}
        <div className="mt-6 pt-6 border-t border-slate-800/80">
          <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Spotlight Wisdom
          </div>
          <blockquote className="text-lg lg:text-xl font-medium text-slate-100 italic leading-relaxed">
            "{featuredQuote.quote}"
          </blockquote>
          <div className="mt-3 flex items-center justify-between flex-wrap gap-2 text-xs font-mono text-slate-400">
            <span>
              — {featuredQuote.context} ({featuredQuote.year})
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNarrateQuote(featuredQuote)}
                disabled={narratingId === featuredQuote.id}
                className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-lg hover:bg-emerald-500/30 transition-all flex items-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5" />
                {narratingId === featuredQuote.id ? 'Speaking...' : 'Listen (Elon Voice)'}
              </button>
              <button
                onClick={() => handleCopy(featuredQuote)}
                className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 transition-all flex items-center gap-1.5"
              >
                {copiedId === featuredQuote.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedId === featuredQuote.id ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                soundEngine.playClick();
                setSelectedCategory(cat);
              }}
              className={`px-3.5 py-1.5 rounded-xl font-mono text-xs transition-all whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search quotes & context..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
          />
        </div>
      </div>

      {/* Quotes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredQuotes.map((q) => (
          <div
            key={q.id}
            className="bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-6 transition-all backdrop-blur-md flex flex-col justify-between group shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between mb-3 text-xs font-mono">
                <span className="text-cyan-400 uppercase tracking-wider">{q.category}</span>
                <span className="text-slate-500 tabular-nums">{q.year}</span>
              </div>
              <blockquote className="text-slate-200 font-medium leading-relaxed mb-4 group-hover:text-white transition-colors">
                "{q.quote}"
              </blockquote>
              <p className="text-xs font-mono text-slate-400 italic mb-2">
                Context: {q.context}
              </p>
              <p className="text-[11px] font-mono text-slate-500 border-l border-cyan-500/30 pl-2 mt-2">
                {q.subtext}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => handleNarrateQuote(q)}
                disabled={narratingId === q.id}
                className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Volume2 className="w-3.5 h-3.5" />
                {narratingId === q.id ? 'Synthesizing...' : 'Speak Quote'}
              </button>

              <button
                onClick={() => handleCopy(q)}
                className="text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
                title="Copy quote"
              >
                {copiedId === q.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
