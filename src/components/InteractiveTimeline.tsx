/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, Search, Rocket, Zap, Brain, MessageSquare, Flame, CheckCircle, ChevronRight, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface Milestone {
  id: string;
  year: number;
  date: string;
  title: string;
  entity: 'SpaceX' | 'Tesla' | 'X/PayPal' | 'Neuralink' | 'Early Years';
  summary: string;
  elonCommentary: string;
  impactMetric: string;
  tags: string[];
}

const MILESTONES: Milestone[] = [
  {
    id: 'm1',
    year: 1971,
    date: 'June 28, 1971',
    title: 'Initial System Boot in Pretoria',
    entity: 'Early Years',
    summary: 'Born in Pretoria, South Africa. Early cognitive benchmarks reveal hyper-accelerated pattern recognition and a complete refusal to entertain ordinary human emotions.',
    elonCommentary: 'My operating system loaded without empathy modules. A critical initial configuration advantage.',
    impactMetric: 'Cognitive RAM initialized at 100% capacity',
    tags: ['Boot Sequence', 'Pretoria', 'Origin'],
  },
  {
    id: 'm2',
    year: 1984,
    date: 'March 1984',
    title: 'Blastar Game Sold for $500',
    entity: 'Early Years',
    summary: 'At age twelve, self-taught Commodore BASIC programmer Elon writes and sells Blastar, a space combat video game, to PC and Office Technology magazine.',
    elonCommentary: 'My first liquidity event. The code was primitive, but destroying alien invaders is a core competency.',
    impactMetric: '$500 cash liquidity at age 12',
    tags: ['Commodore 64', 'Coding', 'Liquidity'],
  },
  {
    id: 'm3',
    year: 1995,
    date: 'September 1995',
    title: '48-Hour Stanford Dropout & Zip2 Founded',
    entity: 'X/PayPal',
    summary: 'Drops out of Stanford PhD physics program after exactly two days to co-found Zip2 with brother Kimbal, sleeping on an office futon and showering at the YMCA.',
    elonCommentary: 'Academic tenure is an artificial speed limiter on human throughput. I chose the futon.',
    impactMetric: '48-hour PhD duration; 100-hour workweeks',
    tags: ['Zip2', 'Stanford', 'Palo Alto'],
  },
  {
    id: 'm4',
    year: 1999,
    date: 'February 1999',
    title: 'Zip2 Sold to Compaq for $307 Million',
    entity: 'X/PayPal',
    summary: 'Compaq acquires Zip2 for $307 million in cash. Elon receives $22 million and immediately invests $12 million into founding online banking pioneer X.com.',
    elonCommentary: 'Most people would have bought an island. I bought propellant for an online banking monopoly.',
    impactMetric: '$22M personal payout; 100% reinvested in X.com',
    tags: ['Compaq', 'Acquisition', 'X.com'],
  },
  {
    id: 'm5',
    year: 2000,
    date: 'March 2000',
    title: 'McLaren F1 Crash & The PayPal Coup',
    entity: 'X/PayPal',
    summary: 'Crashes uninsured $1M McLaren F1 with Peter Thiel in passenger seat. Months later, X.com merges with Confinity into PayPal, followed by a boardroom coup while Elon is on an airplane.',
    elonCommentary: 'Insurance is a psychological hedge against destiny. The car flew like an unguided rocket.',
    impactMetric: '360° mid-air car spin; $0 insurance claim',
    tags: ['McLaren F1', 'PayPal', 'Boardroom Coup'],
  },
  {
    id: 'm6',
    year: 2002,
    date: 'October 2002',
    title: 'eBay Buys PayPal for $1.5B; SpaceX Founded',
    entity: 'SpaceX',
    summary: 'eBay acquires PayPal for $1.5 billion. Elon nets $180 million after taxes, pours $100M into founding SpaceX to make life multi-planetary, and starts building Falcon 1.',
    elonCommentary: 'eBay thought they bought an auction checkout button; they actually funded the railway to Mars.',
    impactMetric: '$100M capital allocated to aerospace revolution',
    tags: ['SpaceX', 'eBay', 'Mars Mission'],
  },
  {
    id: 'm7',
    year: 2004,
    date: 'February 2004',
    title: 'Series A Investment & Leadership of Tesla',
    entity: 'Tesla',
    summary: 'Leads Series A funding round with $6.5M into Tesla Motors, joining as Chairman and Chief Product Architect to commercialize the all-electric Roadster.',
    elonCommentary: 'Detroit thought electric cars were golf carts. We gave them torque that snaps human vertebrae.',
    impactMetric: '$6.5M initial stake; total EV paradigm shift',
    tags: ['Tesla', 'Series A', 'Roadster'],
  },
  {
    id: 'm8',
    year: 2008,
    date: 'September-December 2008',
    title: 'The 2008 Crucible: Falcon 1 Orbit & Christmas Rescue',
    entity: 'SpaceX',
    summary: 'After three consecutive explosions on Kwajalein, Falcon 1 Flight 4 reaches orbit. Days later on Christmas Eve, Elon closes an emergency funding round saving Tesla from bankruptcy.',
    elonCommentary: 'I had enough money for zero more launches. Flight 4 was the resurrection of private spaceflight.',
    impactMetric: '1st private liquid rocket in orbit; $1.6B NASA COTS contract',
    tags: ['Falcon 1', 'Kwajalein', 'Christmas Eve Miracle'],
  },
  {
    id: 'm9',
    year: 2010,
    date: 'June 29, 2010',
    title: 'Tesla Motors Initial Public Offering (NASDAQ)',
    entity: 'Tesla',
    summary: 'Tesla goes public at $17 per share, raising $226 million. First American automaker IPO since Ford in 1956.',
    elonCommentary: 'Wall Street short sellers spent the next decade donating their retirement funds to my balance sheet.',
    impactMetric: '$226M raised; 1st US auto IPO in 54 years',
    tags: ['IPO', 'NASDAQ', 'Wall Street'],
  },
  {
    id: 'm10',
    year: 2012,
    date: 'May 25, 2012',
    title: 'Dragon Docks with International Space Station',
    entity: 'SpaceX',
    summary: 'Dragon becomes the first commercial spacecraft in human history to rendezvous and berth with the ISS under NASA COTS.',
    elonCommentary: 'Boeing and the Russian space agency suddenly discovered their monopoly was offline.',
    impactMetric: '1st commercial spacecraft docked with ISS',
    tags: ['Dragon', 'ISS', 'NASA'],
  },
  {
    id: 'm11',
    year: 2015,
    date: 'December 21, 2015',
    title: 'Historic Falcon 9 First-Stage Vertical Landing',
    entity: 'SpaceX',
    summary: 'Falcon 9 launches eleven Orbcomm satellites and returns its 14-story first stage to touch down vertically on Landing Zone 1 at Cape Canaveral.',
    elonCommentary: 'They said Newton’s laws forbade reusability. We proved gravity is merely a negotiable parameter.',
    impactMetric: '70% launch cost reduction; full orbital booster reusability',
    tags: ['Vertical Landing', 'Falcon 9', 'LZ-1'],
  },
  {
    id: 'm12',
    year: 2016,
    date: 'July 2016',
    title: 'Neuralink & The Boring Company Founded',
    entity: 'Neuralink',
    summary: 'Founds Neuralink to build ultra-high bandwidth brain-machine interfaces, and The Boring Company to dig 3D subterranean tunnel transit networks.',
    elonCommentary: 'Speech is a pathetic 10-byte-per-second bottleneck. We are wiring carbon meatware directly to cloud servers.',
    impactMetric: '1,024 cranial electrodes; $10M Not-a-Flamethrower sales',
    tags: ['Neuralink', 'Boring Company', 'Subterranean'],
  },
  {
    id: 'm13',
    year: 2018,
    date: 'February 6, 2018',
    title: 'Falcon Heavy Maiden Flight Launches Starman to Mars',
    entity: 'SpaceX',
    summary: 'World’s most powerful operational rocket launches with Elon’s personal cherry-red Tesla Roadster and dummy astronaut "Starman" into heliocentric Mars orbit.',
    elonCommentary: 'Silly and fun things are important. It will drift through deep space for a billion years playing David Bowie.',
    impactMetric: '5 million pounds of thrust; 2 synchronized booster landings',
    tags: ['Falcon Heavy', 'Starman', 'Roadster in Orbit'],
  },
  {
    id: 'm14',
    year: 2019,
    date: 'November 21, 2019',
    title: 'Cybertruck Unveiling & Armor Glass Test',
    entity: 'Tesla',
    summary: 'Unveils the angular cold-rolled stainless steel 30X Cybertruck in Los Angeles. Sledgehammer demo goes well; metal ball unexpectedly shatters both armor glass windows.',
    elonCommentary: 'The window broke. That is what we call immediate, empirical impact data. 1 million reservations followed.',
    impactMetric: '1,000,000+ pre-orders in 48 hours; iconic pop culture moment',
    tags: ['Cybertruck', 'Armor Glass', 'Stainless Steel'],
  },
  {
    id: 'm15',
    year: 2020,
    date: 'May 30, 2020',
    title: 'Crew Dragon Demo-2 Launches NASA Astronauts',
    entity: 'SpaceX',
    summary: 'First crewed orbital spaceflight launched from American soil since the retirement of the Space Shuttle in 2011, transporting astronauts to the ISS.',
    elonCommentary: 'America returned to human spaceflight on private stainless steel. Zero taxpayer bailouts required.',
    impactMetric: '1st private commercial human spaceflight to orbit',
    tags: ['Demo-2', 'Crew Dragon', 'American Soil'],
  },
  {
    id: 'm16',
    year: 2022,
    date: 'October 27, 2022',
    title: 'Acquisition of Twitter for $44B & Rebranding to X',
    entity: 'X/PayPal',
    summary: 'Closes $44 billion acquisition of Twitter, walks into headquarters holding a porcelain sink, reduces administrative headcount by 80%, and renames it X.',
    elonCommentary: 'The digital town square was choked by censorship algorithms. I brought a sink and restored free speech.',
    impactMetric: '$44B transaction; 80% overhead reduction',
    tags: ['Twitter', 'X Corp', 'Let That Sink In'],
  },
  {
    id: 'm17',
    year: 2024,
    date: 'October 13, 2024',
    title: 'Starship Flight 5 Catches Super Heavy with Chopsticks',
    entity: 'SpaceX',
    summary: 'Starship Flight 5 makes aerospace history as the 232-foot Super Heavy booster returns from space and is caught out of mid-air by the Mechazilla launch tower chopstick arms.',
    elonCommentary: 'Catching a supersonic 200-ton rocket with metal mechanical chopsticks. Science fiction made real.',
    impactMetric: '1st mid-air booster catch in human history',
    tags: ['Mechazilla', 'Chopsticks Catch', 'Starship Flight 5'],
  },
  {
    id: 'm18',
    year: 2026,
    date: '2026 Target Horizon',
    title: 'Starbase Mars Fleet & Optimus Mass Fleet Assembly',
    entity: 'SpaceX',
    summary: 'Preparations for the first uncrewed Starship flotilla to Mars and mass factory production of Tesla Optimus humanoid robots for global labor automation.',
    elonCommentary: 'Work becomes optional; Earth becomes a launchpad. The light of consciousness expands into the galaxy.',
    impactMetric: 'Multi-planetary species transition roadmap',
    tags: ['Mars Fleet', 'Optimus', 'Multi-Planetary'],
  },
];

export const InteractiveTimeline: React.FC = () => {
  const [selectedEntity, setSelectedEntity] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeMilestoneId, setActiveMilestoneId] = useState<string | null>(null);

  const entities = ['All', 'SpaceX', 'Tesla', 'X/PayPal', 'Neuralink', 'Early Years'];

  const filteredMilestones = MILESTONES.filter((m) => {
    const matchesEntity = selectedEntity === 'All' || m.entity === selectedEntity;
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      String(m.year).includes(searchQuery);
    return matchesEntity && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900/80 border border-cyan-500/30 rounded-2xl p-6 lg:p-8 backdrop-blur-md relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
          <Calendar className="w-4 h-4" />
          <span>CHRONOLOGY OF A COSMIC ENTITY</span>
          <span>·</span>
          <span>1971 — 2026+</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 font-sans">
          Comprehensive Timeline of Landmark Achievements
        </h1>
        <p className="text-sm font-mono text-slate-400 mt-2 max-w-2xl">
          From self-taught BASIC in Pretoria to landing orbital rockets on sea barges, buying Twitter with a sink, and catching supersonic boosters with mechanical chopsticks.
        </p>
      </div>

      {/* Filter and Search Navigation */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Entity Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          {entities.map((ent) => (
            <button
              key={ent}
              onClick={() => {
                soundEngine.playClick();
                setSelectedEntity(ent);
              }}
              className={`px-3.5 py-1.5 rounded-xl font-mono text-xs transition-all whitespace-nowrap shrink-0 ${
                selectedEntity === ent
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {ent}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search year, milestone, mission..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
          />
        </div>
      </div>

      {/* Vertical Interactive Timeline */}
      <div className="relative border-l border-cyan-500/30 ml-4 md:ml-8 pl-6 md:pl-8 space-y-8">
        {filteredMilestones.map((m) => {
          const isExpanded = activeMilestoneId === m.id;
          return (
            <div
              key={m.id}
              onClick={() => {
                soundEngine.playClick();
                setActiveMilestoneId(isExpanded ? null : m.id);
              }}
              className="relative group cursor-pointer"
            >
              {/* Timeline Node Point */}
              <div
                className={`absolute -left-[31px] md:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 transition-all ${
                  isExpanded
                    ? 'bg-cyan-400 border-white shadow-[0_0_12px_rgba(6,182,212,0.8)] scale-125'
                    : 'bg-slate-950 border-cyan-500 group-hover:scale-110 group-hover:border-white'
                }`}
              />

              {/* Milestone Card */}
              <div
                className={`p-6 rounded-2xl border transition-all backdrop-blur-md ${
                  isExpanded
                    ? 'bg-slate-900/90 border-cyan-500/60 shadow-xl'
                    : 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/30 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold font-mono text-cyan-400 tabular-nums">
                      {m.year}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      {m.date}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-slate-950 text-cyan-300 border border-cyan-900/50 self-start sm:self-auto">
                    {m.entity}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-100 font-sans group-hover:text-cyan-300 transition-colors">
                  {m.title}
                </h3>

                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  {m.summary}
                </p>

                {/* Impact Metric Strip */}
                <div className="mt-4 p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-mono text-emerald-300">
                    {m.impactMetric}
                  </span>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 animate-fadeIn">
                    <div className="p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-xl">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block mb-1">
                        Elon's Tactical Assessment:
                      </span>
                      <p className="text-xs font-mono text-slate-200 italic">
                        "{m.elonCommentary}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      {m.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] font-mono text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700/50"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
