import React, { useState } from 'react';
import {
  Sparkles,
  Award,
  Zap,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  Globe,
  ArrowDown,
  ArrowUp,
  Activity,
  Layers,
  ChevronRight,
  Wifi,
} from 'lucide-react';
import { IspBenchmarkComparison, SpeedUnit } from '../types';

interface IspBenchmarkBenchmarkProps {
  currentDownload: number | null;
  currentUpload: number | null;
  currentPing: number | null;
  currentIsp: string;
  unit: SpeedUnit;
  formatSpeed: (mbps: number) => string;
  isDark: boolean;
}

const GLOBAL_BENCHMARK_TIERS: IspBenchmarkComparison[] = [
  {
    tier: 'Global Average (Broadband Index)',
    name: 'Global Median Fixed Line',
    avgDown: 94.2,
    avgUp: 49.3,
    avgPing: 29,
    color: 'slate',
  },
  {
    tier: 'Tier-1 Fiber Gigabit',
    name: 'FTTH Gigabit Fiber (Google Fiber / Singtel)',
    avgDown: 850.0,
    avgUp: 800.0,
    avgPing: 5,
    color: 'emerald',
  },
  {
    tier: 'High-Speed Cable / DOCSIS 3.1',
    name: 'DOCSIS 3.1 Hybrid Coax (Xfinity / Spectrum)',
    avgDown: 350.0,
    avgUp: 35.0,
    avgPing: 18,
    color: 'cyan',
  },
  {
    tier: '5G Home Wireless (C-Band / mmWave)',
    name: 'Fixed Wireless 5G (Verizon / T-Mobile 5G)',
    avgDown: 180.0,
    avgUp: 28.0,
    avgPing: 32,
    color: 'indigo',
  },
  {
    tier: 'Low-Earth Satellite (LEO)',
    name: 'Starlink LEO Satellite Constellation',
    avgDown: 115.0,
    avgUp: 18.0,
    avgPing: 38,
    color: 'amber',
  },
];

export const IspBenchmarkComparisonCard: React.FC<IspBenchmarkBenchmarkProps> = ({
  currentDownload,
  currentUpload,
  currentPing,
  currentIsp,
  unit,
  formatSpeed,
  isDark,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);
  const [selectedComparisonIndex, setSelectedComparisonIndex] = useState(0);

  const down = currentDownload ?? 0;
  const up = currentUpload ?? 0;
  const ping = currentPing ?? 0;

  // Calculate percentile relative to global median (94.2 Mbps)
  const calcPercentile = (): { pct: number; label: string; tier: string } => {
    if (down === 0) return { pct: 50, label: 'Standard', tier: 'Broadband' };
    if (down >= 500) return { pct: 98, label: 'Top 2% Worldwide', tier: 'Gigabit Hyper Class' };
    if (down >= 300) return { pct: 92, label: 'Faster than 92% of Global Users', tier: 'Ultra-Fast Fiber' };
    if (down >= 150) return { pct: 81, label: 'Faster than 81% of Global Users', tier: 'High-Tier Broadband' };
    if (down >= 94) return { pct: 60, label: 'Above Global Median', tier: 'Standard Modern Broadband' };
    if (down >= 40) return { pct: 38, label: 'Moderate Bandwidth', tier: 'Standard DSL / Mid-Cable' };
    return { pct: 15, label: 'Below Global Average', tier: 'Legacy Bandwidth' };
  };

  const standing = calcPercentile();
  const activeBenchmark = GLOBAL_BENCHMARK_TIERS[selectedComparisonIndex];

  // Compare delta with active tier
  const downDiff = down - activeBenchmark.avgDown;
  const downDiffPct =
    activeBenchmark.avgDown > 0 ? Math.round((downDiff / activeBenchmark.avgDown) * 100) : 0;

  const cardBg = isDark
    ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
    : 'bg-white border-slate-200 shadow-sm hover:border-slate-300';

  const handleShareTelemetry = () => {
    const text = `SpeedPulse Benchmark Results:\nISP: ${currentIsp}\nDownload: ${formatSpeed(
      down
    )} ${unit}\nUpload: ${formatSpeed(up)} ${unit}\nPing: ${ping}ms\nRating: ${standing.tier} (${
      standing.label
    })\nTested on SpeedPulse Precision Benchmark`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <section
      id="ispBenchmarkSection"
      className={`${cardBg} rounded-2xl p-5 border transition-all duration-200`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3
              className={`text-sm font-bold tracking-tight font-display ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              ISP & Global Infrastructure Benchmark
            </h3>
            <p className="text-[11px] text-slate-400">
              Benchmark your connection against global speed tiers and carrier averages
            </p>
          </div>
        </div>

        {/* Share Score Button */}
        <button
          onClick={handleShareTelemetry}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer self-start sm:self-auto ${
            copiedShare
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : isDark
              ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
          }`}
        >
          {copiedShare ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Telemetry Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Share Benchmark</span>
            </>
          )}
        </button>
      </div>

      {/* Global Standing Rank Card */}
      <div
        className={`p-4 rounded-xl border mb-4 relative overflow-hidden ${
          isDark
            ? 'bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-900/40 border-indigo-500/30'
            : 'bg-gradient-to-r from-indigo-50/70 via-slate-50 to-white border-indigo-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" />
              <span>Global Speed Standing</span>
            </div>
            <div
              className={`text-lg sm:text-xl font-black font-display tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {standing.tier}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {standing.label} • Active Carrier: <strong className="text-slate-300">{currentIsp || 'Detected ISP'}</strong>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="text-right font-mono">
              <div className="text-2xl font-black text-indigo-400">
                {standing.pct}
                <span className="text-sm font-sans font-normal text-slate-400">%</span>
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Speed Percentile</div>
            </div>
          </div>
        </div>

        {/* Percentile Progress Track */}
        <div className="w-full mt-3">
          <div className="w-full h-2 bg-slate-800/60 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${standing.pct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>0% (Legacy Dial/DSL)</span>
            <span>50% (Global Median 94 Mbps)</span>
            <span>100% (Gigabit FTTH)</span>
          </div>
        </div>
      </div>

      {/* Selectable Comparison Tiers */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
          <span>Compare Against Global Infrastructure Standards:</span>
          <span className="text-[11px] font-mono text-indigo-400">
            {downDiffPct >= 0 ? `+${downDiffPct}% faster` : `${downDiffPct}% slower`} vs selected
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {GLOBAL_BENCHMARK_TIERS.map((tier, idx) => {
            const isSelected = idx === selectedComparisonIndex;
            const diff = down - tier.avgDown;

            return (
              <button
                key={tier.name}
                onClick={() => setSelectedComparisonIndex(idx)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? isDark
                      ? 'bg-slate-800 border-indigo-500 shadow-sm'
                      : 'bg-indigo-50/60 border-indigo-400 shadow-xs'
                    : isDark
                    ? 'bg-slate-900/40 border-slate-800/70 hover:bg-slate-800/40'
                    : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/70'
                }`}
              >
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 line-clamp-1">
                  {tier.tier}
                </div>
                <div
                  className={`text-xs font-bold mb-2 line-clamp-1 ${
                    isDark ? 'text-slate-200' : 'text-slate-800'
                  }`}
                >
                  {tier.name}
                </div>

                <div className="grid grid-cols-3 gap-1 text-[11px] font-mono border-t border-slate-800/30 pt-1.5">
                  <div>
                    <span className="text-[9px] text-slate-500 block">Down</span>
                    <span className="font-semibold text-cyan-400">{tier.avgDown}M</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Up</span>
                    <span className="font-semibold text-pink-400">{tier.avgUp}M</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">Ping</span>
                    <span className="font-semibold text-emerald-400">{tier.avgPing}ms</span>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-2 text-[10px] font-mono text-indigo-400 flex items-center justify-between border-t border-indigo-500/20 pt-1">
                    <span>Your Delta:</span>
                    <span className={diff >= 0 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                      {diff >= 0 ? `+${diff.toFixed(1)} Mbps` : `${diff.toFixed(1)} Mbps`}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
