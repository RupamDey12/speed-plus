import React, { useRef, useEffect } from 'react';
import { WaveformTab, SpeedUnit } from '../types';

interface TelemetryWaveformProps {
  activeTab: WaveformTab;
  onTabChange: (tab: WaveformTab) => void;
  samples: number[];
  unit: SpeedUnit;
  formatSpeed: (mbps: number) => string;
  packetLoss: number;
  bufferbloatRating: string;
  bufferbloatLatency: string;
  streamsCount: number;
  isDark: boolean;
  onOpenOptimizationTips?: () => void;
}

export const TelemetryWaveform: React.FC<TelemetryWaveformProps> = ({
  activeTab,
  onTabChange,
  samples,
  unit,
  formatSpeed,
  packetLoss,
  bufferbloatRating,
  bufferbloatLatency,
  streamsCount,
  isDark,
  onOpenOptimizationTips,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dimensionsRef = useRef<{ width: number; height: number }>({ width: 300, height: 180 });

  const peakVal = samples.length > 0 ? Math.max(...samples) : 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function draw() {
      if (!canvas || !ctx) return;
      const { width: w, height: h } = dimensionsRef.current;
      if (w <= 0 || h <= 0) return;

      ctx.clearRect(0, 0, w, h);

      const maxVal = Math.max(...samples, 30);
      const step = samples.length > 1 ? w / (samples.length - 1) : w;

      // Draw subtle gridlines
      ctx.strokeStyle = isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(148, 163, 184, 0.15)';
      ctx.lineWidth = 1;
      for (let y = 0; y <= h; y += h / 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      let strokeColor = '#06b6d4';
      let gradStart = 'rgba(6, 182, 212, 0.35)';
      let gradEnd = 'rgba(6, 182, 212, 0.0)';

      if (activeTab === 'up') {
        strokeColor = '#ec4899';
        gradStart = 'rgba(236, 72, 153, 0.35)';
        gradEnd = 'rgba(236, 72, 153, 0.0)';
      } else if (activeTab === 'jitter') {
        strokeColor = '#818cf8';
        gradStart = 'rgba(129, 140, 248, 0.35)';
        gradEnd = 'rgba(129, 140, 248, 0.0)';
      }

      // Area fill gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, gradStart);
      grad.addColorStop(1, gradEnd);

      // Path for area
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let i = 0; i < samples.length; i++) {
        const x = i * step;
        const y = h - (samples[i] / maxVal) * (h * 0.8) - 4;
        if (i === 0) {
          ctx.lineTo(x, y);
        } else {
          const prevX = (i - 1) * step;
          const prevY = h - (samples[i - 1] / maxVal) * (h * 0.8) - 4;
          const cpX = (prevX + x) / 2;
          ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
        }
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Path for stroke line
      ctx.beginPath();
      for (let i = 0; i < samples.length; i++) {
        const x = i * step;
        const y = h - (samples[i] / maxVal) * (h * 0.8) - 4;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          const prevX = (i - 1) * step;
          const prevY = h - (samples[i - 1] / maxVal) * (h * 0.8) - 4;
          const cpX = (prevX + x) / 2;
          ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
        }
      }
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;

    const resizeObserver = new ResizeObserver((entries) => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        for (const entry of entries) {
          const w = entry.contentRect.width;
          const h = entry.contentRect.height;
          if (w > 0 && h > 0) {
            const dpr = Math.min(window.devicePixelRatio || 1, 3);
            dimensionsRef.current = { width: w, height: h };
            canvas.width = Math.floor(w * dpr);
            canvas.height = Math.floor(h * dpr);
            ctx.resetTransform?.();
            ctx.scale(dpr, dpr);
            draw();
          }
        }
      }, 30);
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    draw();

    return () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeObserver.disconnect();
    };
  }, [samples, activeTab, isDark]);

  return (
    <div
      id="telemetryWaveformCard"
      className={`rounded-3xl p-4 sm:p-5 shadow-xl flex-1 flex flex-col justify-between transition-colors ${
        isDark
          ? 'glass-card bg-[#111726]/85 border border-white/[0.08]'
          : 'glass-card bg-white/95 border border-slate-200 shadow-slate-200'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
          <h3
            className={`text-xs font-bold uppercase tracking-wider ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Live Telemetry Waveform
          </h3>
        </div>

        {/* Tab switchers with mobile touch-friendly size */}
        <div
          id="waveformTabGroup"
          className={`flex p-0.5 rounded-xl border text-[11px] font-mono font-medium ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <button
            id="tabDownBtn"
            onClick={() => onTabChange('down')}
            className={`px-3 py-1.5 min-h-[38px] sm:min-h-[34px] rounded-lg transition cursor-pointer flex items-center justify-center ${
              activeTab === 'down'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Down
          </button>
          <button
            id="tabUpBtn"
            onClick={() => onTabChange('up')}
            className={`px-3 py-1.5 min-h-[38px] sm:min-h-[34px] rounded-lg transition cursor-pointer flex items-center justify-center ${
              activeTab === 'up'
                ? 'bg-pink-500/20 text-pink-300 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Up
          </button>
          <button
            id="tabJitterBtn"
            onClick={() => onTabChange('jitter')}
            className={`px-3 py-1.5 min-h-[38px] sm:min-h-[34px] rounded-lg transition cursor-pointer flex items-center justify-center ${
              activeTab === 'jitter'
                ? 'bg-indigo-500/20 text-indigo-300 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Jitter
          </button>
        </div>
      </div>

      {/* Canvas Graph with Peak Badge */}
      <div className="h-40 xs:h-44 sm:h-52 w-full relative">
        <canvas
          ref={canvasRef}
          id="liveGraphCanvas"
          className={`w-full h-full rounded-2xl border ${
            isDark ? 'bg-slate-950/70 border-slate-800/90' : 'bg-slate-50 border-slate-200'
          }`}
        />
        <div
          id="chartPeakBadge"
          className={`absolute top-2.5 right-2.5 px-2 py-1 rounded-md border text-[10px] font-mono flex items-center space-x-1 ${
            isDark
              ? 'bg-slate-900/90 border-slate-700 text-cyan-300'
              : 'bg-white/95 border-slate-200 text-cyan-600 shadow-sm'
          }`}
        >
          <span>Peak:</span>
          <span className="font-bold" id="chartPeakLabel">
            {formatSpeed(peakVal)} {unit}
          </span>
        </div>
      </div>

      {/* Bottom Sub-stats Grid */}
      <div className="mt-2.5 sm:mt-3 grid grid-cols-3 gap-1.5 sm:gap-2 text-center font-mono">
        <div
          className={`p-1.5 sm:p-2 rounded-xl border ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="text-[9px] uppercase text-slate-400">Streams</div>
          <div className={`text-[11px] sm:text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {streamsCount} Multi-th
          </div>
        </div>
        <div
          className={`p-1.5 sm:p-2 rounded-xl border ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="text-[9px] uppercase text-slate-400">Packet Loss</div>
          <div className="text-[11px] sm:text-xs font-bold text-emerald-400 truncate" id="packetLossVal">
            {packetLoss.toFixed(1)}%
          </div>
        </div>
        <div
          onClick={onOpenOptimizationTips}
          title="Click to view Bufferbloat & Latency Optimization Tips"
          className={`p-1.5 sm:p-2 rounded-xl border transition cursor-pointer group ${
            isDark
              ? 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900'
              : 'bg-slate-50 border-slate-200 hover:border-cyan-400 hover:bg-slate-100'
          }`}
        >
          <div className="text-[9px] uppercase text-slate-400 flex items-center justify-center space-x-1">
            <span>Bufferbloat</span>
            <span className="text-[8px] text-cyan-400 group-hover:underline font-sans">(Tips)</span>
          </div>
          <div className="text-[11px] sm:text-xs font-bold text-cyan-400 truncate">
            {bufferbloatLatency}
          </div>
        </div>
      </div>
    </div>
  );
};
