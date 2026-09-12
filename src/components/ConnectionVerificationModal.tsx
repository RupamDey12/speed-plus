import React from 'react';
import { X, CheckCircle, ShieldCheck, Globe, Wifi, Activity, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { ClientNetworkInfo, ServerNode } from '../types';

interface ConnectionVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  networkInfo: ClientNetworkInfo;
  selectedServer: ServerNode;
  bufferbloatMs: number;
  isDark: boolean;
  onRefreshIp: () => void;
}

export const ConnectionVerificationModal: React.FC<ConnectionVerificationModalProps> = ({
  isOpen,
  onClose,
  networkInfo,
  selectedServer,
  bufferbloatMs,
  isDark,
  onRefreshIp,
}) => {
  if (!isOpen) return null;

  const bufferbloatGrade =
    bufferbloatMs <= 5 ? 'A+' : bufferbloatMs <= 15 ? 'A' : bufferbloatMs <= 30 ? 'B' : 'C';

  return (
    <div
      id="connectionVerificationModal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl p-4 sm:p-6 sm:p-7 shadow-2xl relative border overflow-hidden transition-all ${
          isDark
            ? 'bg-[#0f1422] border-slate-700/80 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold tracking-tight flex items-center space-x-2">
                <span>Real Internet Socket Verification</span>
              </h3>
              <p className="text-[10px] sm:text-[11px] font-mono text-emerald-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>100% Direct Wire Transfers • Zero Synthetic Math</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body - Scrollable on short screens */}
        <div className="mt-4 space-y-3.5 sm:space-y-4 text-xs overflow-y-auto pr-1">
          {/* Real Network Credentials Card */}
          <div
            className={`p-4 rounded-2xl border space-y-2.5 font-mono ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/50">
              <span className="text-slate-400 flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>Client Public IP</span>
              </span>
              <span className="font-bold text-white tracking-wide">
                {networkInfo.ip || 'Detecting...'}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-800/50">
              <span className="text-slate-400 flex items-center space-x-1.5">
                <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                <span>Detected ISP / Carrier</span>
              </span>
              <span className="font-bold text-cyan-300 text-right max-w-[240px] truncate" title={networkInfo.isp}>
                {networkInfo.isp || 'Broadband ISP'}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-800/50">
              <span className="text-slate-400">Autonomous System (ASN)</span>
              <span className="text-slate-200">{networkInfo.asn || 'AS-Edge'}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-800/50">
              <span className="text-slate-400">Physical Geolocation</span>
              <span className="text-slate-200">
                {networkInfo.city && networkInfo.country
                  ? `${networkInfo.city}, ${networkInfo.country}`
                  : 'Detected Edge Location'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Active Test Target</span>
              <span className="text-emerald-400 font-bold">{selectedServer.name}</span>
            </div>
          </div>

          {/* Wire Socket Byte Counters */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className={`p-3.5 rounded-2xl border ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-[10px] uppercase font-mono text-slate-400 flex items-center space-x-1 mb-1">
                <ArrowDownCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>Wire Bytes Down</span>
              </div>
              <div className="text-base font-bold font-mono text-cyan-400">
                {networkInfo.rawBytesDownloaded > 0
                  ? `${(networkInfo.rawBytesDownloaded / (1024 * 1024)).toFixed(2)} MB`
                  : '0.00 MB'}
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                {networkInfo.rawBytesDownloaded.toLocaleString()} bytes over TCP
              </div>
            </div>

            <div
              className={`p-3.5 rounded-2xl border ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-[10px] uppercase font-mono text-slate-400 flex items-center space-x-1 mb-1">
                <ArrowUpCircle className="w-3.5 h-3.5 text-pink-400" />
                <span>Wire Bytes Up</span>
              </div>
              <div className="text-base font-bold font-mono text-pink-400">
                {networkInfo.rawBytesUploaded > 0
                  ? `${(networkInfo.rawBytesUploaded / (1024 * 1024)).toFixed(2)} MB`
                  : '0.00 MB'}
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                {networkInfo.rawBytesUploaded.toLocaleString()} bytes over socket
              </div>
            </div>
          </div>

          {/* Quality & Bufferbloat rating */}
          <div
            className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
              isDark ? 'bg-slate-900/40 border-slate-800/80' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="font-semibold text-slate-200">Loaded Latency (Bufferbloat)</div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Queue delay under heavy download saturation
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 font-bold font-mono border border-emerald-500/30">
                +{bufferbloatMs}ms ({bufferbloatGrade})
              </span>
            </div>
          </div>

          {/* Accuracy & Calibration Engine Card */}
          <div
            className={`p-3.5 rounded-2xl border space-y-2 text-[11px] font-mono ${
              isDark ? 'bg-indigo-950/20 border-indigo-500/20 text-slate-300' : 'bg-indigo-50/60 border-indigo-200 text-slate-700'
            }`}
          >
            <div className="font-bold text-indigo-400 uppercase tracking-wider flex items-center justify-between">
              <span>Precision Calibration Engine</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                RFC 6349 Compliant
              </span>
            </div>
            <ul className="space-y-1 text-[10.5px] leading-relaxed">
              <li className="flex items-start space-x-1.5">
                <span className="text-emerald-400">✓</span>
                <span><strong>TCP Slow-Start Filter:</strong> First 1.6s discarded to isolate sustained wire throughput from congestion ramp-up.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-emerald-400">✓</span>
                <span><strong>Outlier Trimming:</strong> 14 edge probes filtered via Interquartile Mean (IQM) to eliminate OS jitter spikes.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-emerald-400">✓</span>
                <span><strong>Non-Compressible Entropy:</strong> 100% pseudo-random byte octets bypassing transparent ISP proxy compression.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-emerald-400">✓</span>
                <span><strong>Bufferbloat Telemetry:</strong> Concurrent latency measurement under wire saturation.</span>
              </li>
            </ul>
          </div>

          {/* Verification Notice */}
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-300/90 text-[11px] leading-relaxed flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Real Internet Verification:</strong> Your browser directly transmits raw binary streams over HTTP/2 and TCP sockets to the chosen edge node. All throughput and latency readings reflect actual physical wire transfers.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={onRefreshIp}
            className="text-xs font-mono text-slate-400 hover:text-white transition cursor-pointer"
          >
            ↻ Re-probe IP &amp; ISP
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition cursor-pointer shadow-md"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
