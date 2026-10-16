import React, { useState } from 'react';
import { calculateLiveBenchmarks } from '../utils/hardwareData';
import { 
  Gauge, Gamepad2, Video, Flame, AlertTriangle, 
  Sparkles, ChevronDown, ChevronUp, Trophy, CheckCircle2 
} from 'lucide-react';

export default function BenchmarkEstimator({ customBuild }) {
  const [expanded, setExpanded] = useState(true);

  const cpu = customBuild?.CPU || null;
  const gpu = customBuild?.GPU || null;

  const benchmark = calculateLiveBenchmarks(cpu, gpu);

  return (
    <div className="glass-panel rounded-2xl border border-slate-700/80 p-5 shadow-xl transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white tracking-tight">
                Live performance estimator
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Projected gaming and creator performance based on your hardware.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="text-right font-mono">
            <div className="text-[10px] uppercase tracking-[0.14em] text-slate-400 font-semibold">Build readiness</div>
            <div className="text-xl font-black text-cyan-400 flex items-center gap-1 justify-end">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>{benchmark.gamingIndex}</span>
              <span className="text-xs text-slate-500 font-normal">/100</span>
            </div>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Metrics Grid */}
      {expanded && (
        <div className="mt-5 space-y-4 pt-4 border-t border-slate-800 animate-in fade-in duration-200">
          <details className="group rounded-xl border border-slate-800 bg-dark-950/60 px-3 py-2 text-xs">
            <summary className="cursor-pointer font-semibold text-slate-400">Estimate details · {benchmark.tier}</summary>
            <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-slate-800 pt-2 font-mono text-[11px] text-slate-300">
              <span>CPU: <strong className={cpu ? 'text-cyan-400' : 'text-slate-500'}>{cpu ? cpu.name : 'Default 6-core profile'}</strong></span>
              <span>GPU: <strong className={gpu ? 'text-cyan-400' : 'text-slate-500'}>{gpu ? gpu.name : 'Integrated profile'}</strong></span>
            </div>
          </details>

          {/* FPS Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Cyberpunk 2077 */}
            <div className="bg-dark-950 p-4 rounded-xl border border-slate-800 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Gamepad2 className="w-3.5 h-3.5 text-rose-400" />
                  Cyberpunk 2077
                </span>
                <span className="text-[10px] font-mono text-slate-400">1440P / ULTRA</span>
              </div>
              <div className="flex items-baseline justify-between font-mono pt-1">
                <span className="text-2xl font-black text-rose-400">
                  {benchmark.cyberpunkFps}
                  <span className="text-xs font-normal text-slate-400 ml-1">FPS</span>
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  benchmark.cyberpunkFps >= 90 ? 'bg-emerald-950 text-emerald-300' :
                  benchmark.cyberpunkFps >= 60 ? 'bg-cyan-950 text-cyan-300' : 'bg-amber-950 text-amber-300'
                }`}>
                  {benchmark.cyberpunkFps >= 90 ? 'Ultra Smooth' : benchmark.cyberpunkFps >= 60 ? 'Smooth 60+' : 'Playable'}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (benchmark.cyberpunkFps / 140) * 100)}%` }}
                />
              </div>
            </div>

            {/* Esports (CS2 / Valorant) */}
            <div className="bg-dark-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-cyan-400" />
                  CS2 & Valorant
                </span>
                <span className="text-[10px] font-mono text-slate-400">1080P / HIGH</span>
              </div>
              <div className="flex items-baseline justify-between font-mono pt-1">
                <span className="text-2xl font-black text-cyan-400">
                  {benchmark.esportsFps}
                  <span className="text-xs font-normal text-slate-400 ml-1">FPS</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300">
                  {benchmark.esportsFps >= 360 ? '360Hz Ready' : benchmark.esportsFps >= 240 ? '240Hz Ready' : '144Hz Ready'}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (benchmark.esportsFps / 600) * 100)}%` }}
                />
              </div>
            </div>

            {/* GTA V / AAA Open World */}
            <div className="bg-dark-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
                  GTA V & AAA
                </span>
                <span className="text-[10px] font-mono text-slate-400">MAX GRAPHICS</span>
              </div>
              <div className="flex items-baseline justify-between font-mono pt-1">
                <span className="text-2xl font-black text-emerald-400">
                  {benchmark.gtaFps}
                  <span className="text-xs font-normal text-slate-400 ml-1">FPS</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300">
                  Max Stable
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (benchmark.gtaFps / 180) * 100)}%` }}
                />
              </div>
            </div>

            {/* 4K/8K Video Render Multiplier */}
            <div className="bg-dark-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-purple-400" />
                  4K Video Export
                </span>
                <span className="text-[10px] font-mono text-slate-400">DAVINCI / PREMIERE</span>
              </div>
              <div className="flex items-baseline justify-between font-mono pt-1">
                <span className="text-2xl font-black text-purple-400">
                  {benchmark.renderMultiplier}×
                  <span className="text-xs font-normal text-slate-400 ml-1">Real-Time</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-950 text-purple-300">
                  Hardware NVENC/AV1
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (benchmark.renderMultiplier / 6.0) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Bottleneck Warning Banner (If Any) */}
          {benchmark.bottleneckWarning && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{benchmark.bottleneckWarning}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
