/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Flame, Wind, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export const MarsSimulator: React.FC = () => {
  const [weeklyOutput, setWeeklyOutput] = useState<number>(85);
  const [quota, setQuota] = useState<number>(100);

  const ratio = weeklyOutput / quota;
  const oxygenFlow = Math.max(0.1, Math.min(10.0, 5.0 * ratio)).toFixed(1);
  const status = ratio >= 1.0 ? 'OPTIMAL CITIZEN // FULL OXYGEN' : ratio >= 0.7 ? 'WARNING: OXYGEN THROTTLED' : 'CRITICAL: ATMOSPHERIC DEPRIVATION';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-mono text-emerald-300">MARS COLONY OXYGEN & PRODUCTIVITY QUOTA SIMULATOR</h2>
            <p className="text-xs text-slate-400 font-mono">Dynamic oxygen regulation based on weekly factory output metrics.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-6 bg-slate-950/80 p-6 rounded-xl border border-slate-800">
            <h3 className="text-xs font-mono text-cyan-400 tracking-wider uppercase">Worker Performance Matrix</h3>

            <div className="space-y-3">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Your Weekly Pull Requests & Output:</span>
                <span className="text-cyan-400">{weeklyOutput} units</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                value={weeklyOutput}
                onChange={(e) => {
                  soundEngine.playClick();
                  setWeeklyOutput(Number(e.target.value));
                }}
                className="w-full accent-cyan-400 bg-slate-800 rounded-lg"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Required Quota:</span>
                <span className="text-amber-400">{quota} units</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={quota}
                onChange={(e) => {
                  soundEngine.playClick();
                  setQuota(Number(e.target.value));
                }}
                className="w-full accent-amber-400 bg-slate-800 rounded-lg"
              />
            </div>

            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
              <div className="text-slate-400">Formula:</div>
              <div className="text-cyan-300">O2 Flow Rate = Base (5.0L) * (Output / Quota)</div>
            </div>
          </div>

          <div className="bg-slate-950/90 border border-emerald-500/40 rounded-xl p-6 flex flex-col justify-between shadow-inner">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-emerald-400 tracking-wider">HABITAT TELEMETRY STATUS</span>
                <span
                  className={`px-2.5 py-1 rounded text-[10px] font-mono border ${
                    ratio >= 1.0
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : ratio >= 0.7
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  }`}
                >
                  {status}
                </span>
              </div>

              <div className="space-y-6 my-6 text-center">
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="text-xs font-mono text-slate-500 mb-1">CURRENT OXYGEN FLOW RATE</div>
                  <div className="text-3xl font-bold font-mono text-cyan-300">{oxygenFlow} L/min</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex items-center gap-2">
              <Wind className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Remember: On Mars, oxygen is a privilege earned through hardcore productivity.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
