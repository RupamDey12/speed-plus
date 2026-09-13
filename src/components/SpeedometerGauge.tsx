import React from 'react';
import { Play, RotateCcw, Activity } from 'lucide-react';
import { BenchmarkStage, SpeedUnit } from '../types';

interface SpeedometerGaugeProps {
  stage: BenchmarkStage;
  liveSpeed: number; // in Mbps
  currentProgressPct: number;
  stageLabel: string;
  statusText: string;
  unit: SpeedUnit;
  formatSpeed: (mbps: number) => string;
  isTesting: boolean;
  onStartTest: () => void;
  onQuickPing: () => void;
  onReset: () => void;
  isDark: boolean;
}

export const SpeedometerGauge: React.FC<SpeedometerGaugeProps> = ({
  stage,
  liveSpeed,
  currentProgressPct,
  stageLabel,
  statusText,
  unit,
  formatSpeed,
  isTesting,
  onStartTest,
  onQuickPing,
  onReset,
  isDark,
}) => {
  const TOTAL_ARC = 570;
  const MAX_SPEED_CAP = 600; // 600 Mbps scale ceiling

  const clampedSpeed = Math.min(Math.max(liveSpeed, 0), MAX_SPEED_CAP);
  const progressRatio = clampedSpeed / MAX_SPEED_CAP;
  const strokeOffset = TOTAL_ARC - progressRatio * TOTAL_ARC;

  // Subtle status styling
  let stageStatusName = 'Ready';
  let statusBadgeClass = isDark
    ? 'bg-slate-800 text-slate-300 border-slate-700'
    : 'bg-slate-100 text-slate-700 border-slate-200';

  if (stage === 'ping') {
    stageStatusName = 'Measuring Latency';
    statusBadgeClass = 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
  } else if (stage === 'download') {
    stageStatusName = 'Testing Download';
    statusBadgeClass = 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
  } else if (stage === 'upload') {
    stageStatusName = 'Testing Upload';
    statusBadgeClass = 'bg-pink-500/15 text-pink-400 border-pink-500/30';
  } else if (stage === 'completed') {
    stageStatusName = 'Test Completed';
    statusBadgeClass = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  }

  // Radial tick angles
  const tickAngles = [
    -135, -112.5, -90, -67.5, -45, -22.5, 0, 22.5, 45, 67.5, 90, 112.5, 135,
  ];

  return (
    <div
      id="centerGaugeCard"
      className={`rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-between relative transition-all duration-300 border ${
        isDark
          ? 'bg-slate-900/60 border-slate-800/80 shadow-xl shadow-black/20'
          : 'bg-white border-slate-200 shadow-sm shadow-slate-200'
      }`}
    >
      {/* Header Minimalist Stage Badge */}
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span
            id="phasePill"
            className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide border flex items-center space-x-2 transition-all ${statusBadgeClass}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isTesting
                  ? 'bg-current animate-ping'
                  : stage === 'completed'
                  ? 'bg-emerald-400'
                  : 'bg-slate-400'
              }`}
            />
            <span>{stageStatusName}</span>
          </span>
        </div>

        {stage !== 'idle' && (
          <span id="testStepLabel" className="text-xs font-mono text-slate-400">
            {stageLabel}
          </span>
        )}
      </div>

      {/* Circular Speedometer Arc Gauge */}
      <div className="relative w-64 xs:w-72 sm:w-80 md:w-88 max-w-full aspect-square flex items-center justify-center my-3">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 320 320">
          <defs>
            <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>

          {/* Radial tick marks */}
          <g opacity="0.45">
            {tickAngles.map((deg) => (
              <line
                key={deg}
                x1="160"
                y1="24"
                x2="160"
                y2={deg % 45 === 0 ? 34 : 30}
                stroke={isDark ? '#94a3b8' : '#64748b'}
                strokeWidth={deg % 45 === 0 ? 2 : 1}
                transform={`rotate(${deg} 160 160)`}
              />
            ))}
          </g>

          {/* Background Track Ring */}
          <circle
            cx="160"
            cy="160"
            r="125"
            fill="none"
            stroke={isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.2)'}
            strokeWidth="14"
            strokeDasharray="570 785"
            strokeDashoffset="0"
            strokeLinecap="round"
          />

          {/* Dynamic Speed Progress Arc */}
          <circle
            id="gaugeBar"
            cx="160"
            cy="160"
            r="125"
            fill="none"
            stroke="url(#speedGradient)"
            strokeWidth="14"
            strokeDasharray="570 785"
            strokeDashoffset={strokeOffset}
            strokeLinecap="round"
            className="transition-all duration-150 ease-out"
          />
        </svg>

        {/* Center Speed Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2 select-none pointer-events-none">
          <div className="flex items-baseline justify-center">
            <span
              id="currentGaugeSpeed"
              className={`text-5xl sm:text-6xl font-black font-display tracking-tight tabular-nums ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {formatSpeed(liveSpeed)}
            </span>
          </div>

          <span
            id="gaugeUnitText"
            className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400 mt-0.5 font-display"
          >
            {unit}
          </span>

          {statusText && (
            <p
              id="liveStatusLabel"
              className="text-[11px] text-slate-400 font-mono mt-2 max-w-[85%] text-center truncate"
              title={statusText}
            >
              {statusText}
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar (Visible during test) */}
      {isTesting && (
        <div className="w-full max-w-sm mb-4">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1 font-mono">
            <span>Progress</span>
            <span id="testPercentage">{Math.round(currentProgressPct)}%</span>
          </div>
          <div
            className={`w-full h-1.5 rounded-full overflow-hidden ${
              isDark ? 'bg-slate-800' : 'bg-slate-200'
            }`}
          >
            <div
              id="testProgressBar"
              className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-pink-500 rounded-full transition-all duration-150"
              style={{ width: `${currentProgressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Controls Deck - Large, tactile, friendly */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 mt-1">
        <button
          id="startTestBtn"
          onClick={onStartTest}
          disabled={isTesting}
          className={`w-full sm:w-auto px-8 py-3.5 min-h-[48px] rounded-xl font-bold text-sm tracking-wide shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-[0.98] ${
            isTesting
              ? 'opacity-60 cursor-not-allowed bg-slate-700 text-slate-300'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25 hover:shadow-indigo-600/40'
          }`}
        >
          <Play className="w-4 h-4 fill-white shrink-0" />
          <span>{stage === 'completed' ? 'TEST AGAIN' : 'START SPEED TEST'}</span>
          <span className="hidden md:inline text-[10px] font-mono opacity-75 ml-1.5 px-1.5 py-0.5 rounded bg-white/20">
            SPACE
          </span>
        </button>

        {!isTesting && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="quickPingBtn"
              onClick={onQuickPing}
              className={`flex-1 sm:flex-none px-4 py-3 min-h-[44px] rounded-xl border text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 cursor-pointer active:scale-[0.98] ${
                isDark
                  ? 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Ping Only</span>
            </button>

            {stage !== 'idle' && (
              <button
                id="resetTestBtn"
                onClick={onReset}
                className={`px-3.5 py-3 min-h-[44px] rounded-xl border text-xs font-semibold transition-all flex items-center justify-center space-x-1 cursor-pointer active:scale-[0.98] ${
                  isDark
                    ? 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-white border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-300'
                }`}
                title="Reset"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
