import React, { useState } from 'react';
import {
  Download,
  Upload,
  Activity,
  Zap,
  Play,
  CheckCircle2,
  Share2,
  Sliders,
  Filter,
} from 'lucide-react';
import { BenchmarkTestMode } from '../types';

interface TestModeSelectorProps {
  currentMode: BenchmarkTestMode;
  onSelectMode: (mode: BenchmarkTestMode) => void;
  isTesting: boolean;
  isDark: boolean;
}

const MODES: {
  id: BenchmarkTestMode;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  {
    id: 'full',
    label: 'Complete Suite (Ping + Down + Up)',
    shortLabel: 'Full Suite',
    description: 'Full RFC 6349 calibration with dual-way throughput & bufferbloat assessment.',
    icon: Zap,
    color: 'text-indigo-400',
  },
  {
    id: 'download-only',
    label: 'Download Focus',
    shortLabel: 'Download',
    description: 'Multi-stream downstream bandwidth test only. Ideal for evaluating streaming.',
    icon: Download,
    color: 'text-cyan-400',
  },
  {
    id: 'upload-only',
    label: 'Upload Focus',
    shortLabel: 'Upload',
    description: 'High-entropy upstream bandwidth test only. Perfect for content creators & streamers.',
    icon: Upload,
    color: 'text-pink-400',
  },
  {
    id: 'latency-only',
    label: 'Latency & Jitter (Quick Ping)',
    shortLabel: 'Latency Only',
    description: '16 high-precision edge socket probes with RFC 3550 jitter calculation in ~2s.',
    icon: Activity,
    color: 'text-emerald-400',
  },
];

export const TestModeSelector: React.FC<TestModeSelectorProps> = ({
  currentMode,
  onSelectMode,
  isTesting,
  isDark,
}) => {
  return (
    <div className="w-full flex items-center justify-center">
      <div
        className={`p-1 rounded-2xl border flex items-center flex-wrap sm:flex-nowrap gap-1 text-xs transition-all ${
          isDark
            ? 'bg-slate-900/80 border-slate-800/90 shadow-inner'
            : 'bg-slate-100/90 border-slate-200 shadow-inner'
        }`}
      >
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const isSelected = currentMode === mode.id;

          return (
            <button
              key={mode.id}
              disabled={isTesting}
              onClick={() => onSelectMode(mode.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                isSelected
                  ? isDark
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : 'bg-white text-indigo-600 shadow-sm font-semibold'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title={mode.description}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-current' : mode.color}`} />
              <span className="hidden sm:inline">{mode.shortLabel}</span>
              <span className="sm:hidden">{mode.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
