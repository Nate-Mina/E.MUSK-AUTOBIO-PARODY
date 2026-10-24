/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calculator, Zap, ArrowRight, ShieldAlert } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export const MathLab: React.FC = () => {
  const [mass, setMass] = useState<number>(120);
  const [velocity, setVelocity] = useState<number>(8500);
  const [secRegulations, setSecRegulations] = useState<number>(45);
  const [workHours, setWorkHours] = useState<number>(120);

  // Pseudo-genius calculation
  const calculatedEnergy = (0.5 * mass * Math.pow(velocity, 3) * (1 / (1 - secRegulations / workHours))).toExponential(2);
  const negativeGravity = (mass * -0.85).toFixed(2);
  const payloadCapacity = ((1 - secRegulations / (workHours * 2)) * 140).toFixed(1);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-mono text-cyan-300">PSEUDO-GENIUS MATH & EQUATION LABORATORY</h2>
            <p className="text-xs text-slate-400 font-mono">Bypassing legacy thermodynamic laws via hardcore engineering will.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Controls */}
          <div className="space-y-4 bg-slate-950/80 p-6 rounded-xl border border-slate-800">
            <h3 className="text-xs font-mono text-cyan-400 tracking-wider uppercase mb-4">Telemetry Parameter Inputs</h3>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Payload Mass (m):</span>
                <span className="text-cyan-400">{mass} tons</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                value={mass}
                onChange={(e) => {
                  soundEngine.playClick();
                  setMass(Number(e.target.value));
                }}
                className="w-full accent-cyan-400 bg-slate-800 rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Velocity (v):</span>
                <span className="text-cyan-400">{velocity} m/s</span>
              </div>
              <input
                type="range"
                min="1000"
                max="30000"
                step="500"
                value={velocity}
                onChange={(e) => {
                  soundEngine.playClick();
                  setVelocity(Number(e.target.value));
                }}
                className="w-full accent-cyan-400 bg-slate-800 rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">SEC Regulation Overhead:</span>
                <span className="text-amber-400">{secRegulations}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={secRegulations}
                onChange={(e) => {
                  soundEngine.playClick();
                  setSecRegulations(Number(e.target.value));
                }}
                className="w-full accent-amber-400 bg-slate-800 rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Hardcore Work Hours / Wk:</span>
                <span className="text-emerald-400">{workHours} hrs</span>
              </div>
              <input
                type="range"
                min="40"
                max="168"
                value={workHours}
                onChange={(e) => {
                  soundEngine.playClick();
                  setWorkHours(Number(e.target.value));
                }}
                className="w-full accent-emerald-400 bg-slate-800 rounded-lg"
              />
            </div>
          </div>

          {/* Results Output */}
          <div className="bg-slate-950/90 border border-cyan-500/40 rounded-xl p-6 flex flex-col justify-between shadow-inner">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-cyan-400 tracking-wider">SOLVED EQUATION OUTPUT</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  PHYSICS: DEFYING
                </span>
              </div>

              <div className="space-y-4 font-mono">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-500 mb-1">TRUE KINETIC ENERGY EQUATION (E)</div>
                  <div className="text-cyan-300 text-sm overflow-x-auto">{calculatedEnergy} Joules</div>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-500 mb-1">NEGATIVE GRAVITATIONAL PULL</div>
                  <div className="text-emerald-400 text-sm">{negativeGravity} m/s² (Levitation Enabled)</div>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-500 mb-1">NET PAYLOAD CAPACITY</div>
                  <div className="text-amber-400 text-sm">{payloadCapacity}% of Initial Rocket Mass</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Warning: Disregarding conservation of energy may trigger immediate shareholder panic.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
