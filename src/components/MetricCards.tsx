import React from 'react';
import { ArrowDown, ArrowUp, Activity, Globe, Wifi } from 'lucide-react';
import { SpeedUnit } from '../types';

interface MetricCardsProps {
  ping: number | null;
  jitter: number;
  loss: number;
  downloadSpeed: number | null;
  downloadTransferredMb: number;
  downloadPeak: number;
  uploadSpeed: number | null;
  uploadTransferredMb: number;
  uploadPeak: number;
  unit: SpeedUnit;
  clientIp: string;
  ispName: string;
  bufferbloatMs: number;
  formatSpeed: (mbps: number) => string;
  isDark: boolean;
  onOpenVerification?: () => void;
  isRealVerified?: boolean;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  ping,
  jitter,
  loss,
  downloadSpeed,
  downloadPeak,
  uploadSpeed,
  uploadPeak,
  unit,
  clientIp,
  ispName,
  bufferbloatMs,
  formatSpeed,
  isDark,
  onOpenVerification,
}) => {
  const cardBg = isDark
    ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
    : 'bg-white border-slate-200/90 shadow-sm hover:border-slate-300';

  return (
    <div className="w-full space-y-3">
      {/* 3 Core Results: Download, Upload, Ping */}
      <section id="metricCardsRow" className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* 1. Download Speed */}
        <div
          id="cardDownload"
          className={`${cardBg} rounded-2xl p-4 sm:p-5 border transition-all duration-200 relative overflow-hidden`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <ArrowDown className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider">Download</span>
            </div>
            {downloadPeak > 0 && (
              <span className="text-[11px] font-mono text-slate-400">
                Peak: {formatSpeed(downloadPeak)}
              </span>
            )}
          </div>

          <div className="flex items-baseline space-x-2">
            <span
              id="downloadValue"
              className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight ${
                downloadSpeed !== null
                  ? isDark
                    ? 'text-cyan-400'
                    : 'text-cyan-600'
                  : isDark
                  ? 'text-slate-500'
                  : 'text-slate-400'
              }`}
            >
              {downloadSpeed !== null ? formatSpeed(downloadSpeed) : '—'}
            </span>
            <span className="text-xs font-semibold text-slate-400 font-mono">{unit}</span>
          </div>
        </div>

        {/* 2. Upload Speed */}
        <div
          id="cardUpload"
          className={`${cardBg} rounded-2xl p-4 sm:p-5 border transition-all duration-200 relative overflow-hidden`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
                <ArrowUp className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider">Upload</span>
            </div>
            {uploadPeak > 0 && (
              <span className="text-[11px] font-mono text-slate-400">
                Peak: {formatSpeed(uploadPeak)}
              </span>
            )}
          </div>

          <div className="flex items-baseline space-x-2">
            <span
              id="uploadValue"
              className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight ${
                uploadSpeed !== null
                  ? isDark
                    ? 'text-pink-400'
                    : 'text-pink-600'
                  : isDark
                  ? 'text-slate-500'
                  : 'text-slate-400'
              }`}
            >
              {uploadSpeed !== null ? formatSpeed(uploadSpeed) : '—'}
            </span>
            <span className="text-xs font-semibold text-slate-400 font-mono">{unit}</span>
          </div>
        </div>

        {/* 3. Latency & Jitter */}
        <div
          id="cardLatency"
          className={`${cardBg} rounded-2xl p-4 sm:p-5 border transition-all duration-200 relative overflow-hidden`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider">Ping</span>
            </div>
            {loss > 0 && (
              <span className="text-[11px] font-mono text-rose-400">Loss: {loss}%</span>
            )}
          </div>

          <div className="flex items-baseline space-x-2">
            <span
              id="pingValue"
              className={`text-3xl sm:text-4xl font-extrabold font-mono tracking-tight ${
                ping !== null
                  ? isDark
                    ? 'text-indigo-400'
                    : 'text-indigo-600'
                  : isDark
                  ? 'text-slate-500'
                  : 'text-slate-400'
              }`}
            >
              {ping !== null ? ping : '—'}
            </span>
            <span className="text-xs font-semibold text-slate-400 font-mono">ms</span>
            {jitter > 0 && (
              <span className="text-xs font-mono text-slate-400 ml-2">
                (Jitter: {jitter.toFixed(1)}ms)
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Subtle Connection & Network Info Strip */}
      <div
        id="cardNetwork"
        className={`px-4 py-2.5 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs transition-colors ${
          isDark
            ? 'bg-slate-900/40 border-slate-800/60 text-slate-400'
            : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}
      >
        <div className="flex items-center space-x-3 flex-wrap gap-y-1">
          <div className="flex items-center space-x-1.5" title={ispName}>
            <Wifi className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {ispName}
            </span>
          </div>

          <span className="text-slate-500">•</span>

          <div className="flex items-center space-x-1.5 font-mono text-[11px]" title={clientIp}>
            <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{clientIp}</span>
          </div>

          {bufferbloatMs > 0 && (
            <>
              <span className="text-slate-500">•</span>
              <span className="text-[11px] font-mono">
                Bufferbloat: <span className="text-emerald-400 font-medium">+{bufferbloatMs}ms</span>
              </span>
            </>
          )}
        </div>

        {onOpenVerification && (
          <button
            onClick={onOpenVerification}
            className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 underline cursor-pointer ml-auto"
          >
            Connection Details
          </button>
        )}
      </div>
    </div>
  );
};
