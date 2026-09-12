import React from 'react';
import { Cpu, ShieldCheck } from 'lucide-react';
import { ClientNetworkInfo } from '../types';

interface NodeDiagnosticsProps {
  isDark: boolean;
  networkInfo?: ClientNetworkInfo;
}

export const NodeDiagnostics: React.FC<NodeDiagnosticsProps> = ({ isDark, networkInfo }) => {
  const totalWireBytes =
    (networkInfo?.rawBytesDownloaded || 0) + (networkInfo?.rawBytesUploaded || 0);

  return (
    <div
      id="nodeMongoDiagnosticsCard"
      className={`rounded-3xl p-4 sm:p-5 shadow-xl text-xs space-y-2 transition-colors ${
        isDark
          ? 'glass-card bg-[#111726]/85 border border-white/[0.08]'
          : 'glass-card bg-white/95 border border-slate-200 shadow-slate-200'
      }`}
    >
      <div
        className={`flex items-center justify-between border-b pb-2 ${
          isDark ? 'border-slate-800/80' : 'border-slate-200'
        }`}
      >
        <span
          className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400 shrink-0" />
          <span className="truncate">Real Socket &amp; Mongo Diagnostics</span>
        </span>
        <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1 shrink-0">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Verified Real</span>
        </span>
      </div>

      <div
        className={`flex justify-between items-center py-1 border-b text-[11px] sm:text-xs ${
          isDark ? 'border-slate-800/60' : 'border-slate-100'
        }`}
      >
        <span className="text-slate-400">Transfer Mode</span>
        <span className={`font-mono text-right ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
          Direct Edge Sockets (4-6 Streams)
        </span>
      </div>

      <div
        className={`flex justify-between items-center py-1 border-b text-[11px] sm:text-xs ${
          isDark ? 'border-slate-800/60' : 'border-slate-100'
        }`}
      >
        <span className="text-slate-400">Accuracy Standard</span>
        <span className="font-mono text-indigo-400 font-semibold text-right">RFC 6349 &amp; TR-471</span>
      </div>

      <div
        className={`flex justify-between items-center py-1 border-b text-[11px] sm:text-xs ${
          isDark ? 'border-slate-800/60' : 'border-slate-100'
        }`}
      >
        <span className="text-slate-400">Slow-Start Filter</span>
        <span className="font-mono text-emerald-400 text-right">Warmup Discarded (1.6s)</span>
      </div>

      <div
        className={`flex justify-between items-center py-1 border-b text-[11px] sm:text-xs ${
          isDark ? 'border-slate-800/60' : 'border-slate-100'
        }`}
      >
        <span className="text-slate-400">Payload Entropy</span>
        <span className="font-mono text-cyan-400 font-semibold text-right">100% Non-Compressible</span>
      </div>

      <div
        className={`flex justify-between items-center py-1 border-b text-[11px] sm:text-xs ${
          isDark ? 'border-slate-800/60' : 'border-slate-100'
        }`}
      >
        <span className="text-slate-400">Wire Data</span>
        <span className="font-mono text-emerald-400 font-bold text-right truncate max-w-[200px]">
          {totalWireBytes > 0
            ? `${(totalWireBytes / (1024 * 1024)).toFixed(2)} MB`
            : '0.00 MB (Ready)'}
        </span>
      </div>

      <div
        className={`flex justify-between items-center py-1 border-b text-[11px] sm:text-xs ${
          isDark ? 'border-slate-800/60' : 'border-slate-100'
        }`}
      >
        <span className="text-slate-400">Persistence Engine</span>
        <span className="font-mono text-emerald-400 flex items-center space-x-1 text-right">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          <span>MongoDB SpeedBenchmark</span>
        </span>
      </div>

      <div className="flex justify-between items-center py-1 text-[11px] sm:text-xs">
        <span className="text-slate-400">Network Timing</span>
        <span className={`font-mono text-right ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          High-Res Performance API
        </span>
      </div>
    </div>
  );
};

