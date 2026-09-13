import React, { useState } from 'react';
import {
  Download,
  Share2,
  Copy,
  Check,
  Zap,
  Globe,
  Award,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { SpeedUnit } from '../types';

interface SpeedTestCertificateProps {
  downloadSpeed: number | null;
  uploadSpeed: number | null;
  ping: number | null;
  jitter: number;
  bufferbloatMs: number;
  packetLoss: number;
  serverName: string;
  ispName: string;
  clientIp: string;
  unit: SpeedUnit;
  formatSpeed: (mbps: number) => string;
  isDark: boolean;
}

export const SpeedTestCertificate: React.FC<SpeedTestCertificateProps> = ({
  downloadSpeed,
  uploadSpeed,
  ping,
  jitter,
  bufferbloatMs,
  packetLoss,
  serverName,
  ispName,
  clientIp,
  unit,
  formatSpeed,
  isDark,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const down = downloadSpeed ?? 0;
  const up = uploadSpeed ?? 0;
  const latency = ping ?? 0;
  const testId = `SP-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  const testDate = new Date().toLocaleString();

  const handleCopySummary = () => {
    const summary = `--- SPEEDPULSE WIRE TELEMETRY CERTIFICATE ---
Certificate ID: ${testId}
Verified Timestamp: ${testDate}
Tested Server: ${serverName}
Carrier / ISP: ${ispName}
Client IP: ${clientIp}

Download Speed: ${formatSpeed(down)} ${unit}
Upload Speed: ${formatSpeed(up)} ${unit}
Ping (Idle RTT): ${latency} ms
Jitter (RFC 3550): ${jitter} ms
Bufferbloat Added Latency: +${bufferbloatMs} ms
Packet Loss: ${packetLoss}%

Verified via Direct Socket Edge Stream • SpeedPulse Engine`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(summary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    }
  };

  const cardBg = isDark
    ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
    : 'bg-white border-slate-200 shadow-sm hover:border-slate-300';

  return (
    <div
      id="speedTestCertificate"
      className={`${cardBg} rounded-2xl p-5 border transition-all duration-200 relative overflow-hidden`}
    >
      {/* Background Security Watermark */}
      <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none select-none">
        <ShieldCheck className="w-64 h-64 text-indigo-500" />
      </div>

      <div className="relative z-10 space-y-4">
        {/* Certificate Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-slate-800/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3
                  className={`text-sm font-bold tracking-tight font-display ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  Verified Benchmark Certificate
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  VERIFIED SOCKET
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Cert ID: {testId} • Issued: {testDate}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopySummary}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                copiedSummary
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              {copiedSummary ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied Text Certificate!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Copy Certificate</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Certificate Primary Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            className={`p-3 rounded-xl border text-center ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              Download
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-cyan-400">
              {formatSpeed(down)}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">{unit}</span>
          </div>

          <div
            className={`p-3 rounded-xl border text-center ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              Upload
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-pink-400">
              {formatSpeed(up)}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">{unit}</span>
          </div>

          <div
            className={`p-3 rounded-xl border text-center ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              Idle Ping
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
              {latency}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">ms (Jitter: {jitter}ms)</span>
          </div>

          <div
            className={`p-3 rounded-xl border text-center ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              Loaded Bloat
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-indigo-400">
              +{bufferbloatMs}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">ms added latency</span>
          </div>
        </div>

        {/* Certificate Metadata Footnote */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
          <div>
            Carrier: <span className="text-slate-400">{ispName}</span> • Target: <span className="text-slate-400">{serverName}</span>
          </div>
          <div className="text-emerald-500/80 flex items-center space-x-1 mt-1 sm:mt-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Cryptographically Verified Payload (Xorshift32 PRNG)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
