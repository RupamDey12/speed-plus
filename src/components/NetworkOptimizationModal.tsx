import React, { useState } from 'react';
import {
  X,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Wifi,
  Cpu,
  Globe,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Gauge,
  Activity,
  Layers,
  Flame,
  Clock,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface NetworkOptimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bufferbloatMs: number;
  ping: number | null;
  jitter: number;
  loss: number;
  downloadSpeed: number | null;
  uploadSpeed: number | null;
  isDark: boolean;
  onRetest?: () => void;
}

type AdviceCategory = 'all' | 'bufferbloat' | 'ping' | 'quick-wins' | 'router-sqm';

export const NetworkOptimizationModal: React.FC<NetworkOptimizationModalProps> = ({
  isOpen,
  onClose,
  bufferbloatMs,
  ping,
  jitter,
  loss,
  downloadSpeed,
  uploadSpeed,
  isDark,
  onRetest,
}) => {
  const [activeCategory, setActiveCategory] = useState<AdviceCategory>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  // Grade and categorization based on measured bufferbloat
  const getBufferbloatGrade = (ms: number) => {
    if (ms <= 5) return { grade: 'A+', label: 'Pristine Low Queue Delay', color: 'emerald', severity: 'minimal' };
    if (ms <= 15) return { grade: 'A', label: 'Minimal Queuing Delay', color: 'emerald', severity: 'low' };
    if (ms <= 35) return { grade: 'B', label: 'Moderate Bufferbloat', color: 'cyan', severity: 'moderate' };
    if (ms <= 80) return { grade: 'C', label: 'High Bufferbloat Spike', color: 'amber', severity: 'high' };
    if (ms <= 150) return { grade: 'D', label: 'Severe Buffer Bloat', color: 'orange', severity: 'severe' };
    return { grade: 'F', label: 'Critical Queue Saturation', color: 'rose', severity: 'critical' };
  };

  const bloatInfo = getBufferbloatGrade(bufferbloatMs);
  const baselinePingVal = ping !== null ? ping : 18;
  const loadedPingEstimate = baselinePingVal + bufferbloatMs;

  // Recommended SQM rate limits (92% rule to eliminate ISP modem queue bloat)
  const recommendedDownLimit = downloadSpeed ? Math.round(downloadSpeed * 0.92) : null;
  const recommendedUpLimit = uploadSpeed ? Math.round(uploadSpeed * 0.92) : null;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Determine key priority findings based on user's measurements
  const needsSqm = bufferbloatMs > 15;
  const needsPingFix = baselinePingVal > 40 || jitter > 4;
  const hasPacketLoss = loss > 0.5;

  return (
    <div
      id="networkOptimizationModal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl shadow-2xl relative border overflow-hidden transition-all ${
          isDark
            ? 'bg-[#0f1422] border-slate-700/80 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`p-4 sm:p-5 border-b shrink-0 flex items-center justify-between ${
            isDark ? 'border-slate-800/80 bg-slate-900/50' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-extrabold font-display tracking-tight">
                  Network Optimization Tips
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Tailored Advice
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Actionable diagnostics calibrated to your measured bufferbloat and latency.
              </p>
            </div>
          </div>
          <button
            id="closeOptimizationModalBtn"
            onClick={onClose}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
            }`}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Measured Score Summary Banner */}
          <div
            id="measuredMetricsScorecard"
            className={`rounded-2xl p-4 border transition-colors ${
              isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                <span>Your Measured Telemetry</span>
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
                  bloatInfo.color === 'emerald'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : bloatInfo.color === 'cyan'
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                    : bloatInfo.color === 'amber'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}
              >
                Bufferbloat Grade: {bloatInfo.grade}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              {/* Bufferbloat Delta */}
              <div
                className={`p-2.5 rounded-xl border ${
                  isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-white border-slate-200'
                }`}
              >
                <div className="text-[10px] uppercase text-slate-400 font-medium">Queue Delay</div>
                <div className="text-xl font-black font-display text-cyan-400 tabular-nums">
                  +{bufferbloatMs}
                  <span className="text-xs font-mono text-slate-400 ml-0.5">ms</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">{bloatInfo.label}</div>
              </div>

              {/* Baseline Idle Ping */}
              <div
                className={`p-2.5 rounded-xl border ${
                  isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-white border-slate-200'
                }`}
              >
                <div className="text-[10px] uppercase text-slate-400 font-medium">Idle Ping</div>
                <div className="text-xl font-black font-display text-indigo-400 tabular-nums">
                  {ping !== null ? ping : '—'}
                  <span className="text-xs font-mono text-slate-400 ml-0.5">ms</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {baselinePingVal < 20 ? 'Optimal (Fiber/LAN)' : baselinePingVal < 50 ? 'Good Broadband' : 'Elevated'}
                </div>
              </div>

              {/* Loaded Latency */}
              <div
                className={`p-2.5 rounded-xl border ${
                  isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-white border-slate-200'
                }`}
              >
                <div className="text-[10px] uppercase text-slate-400 font-medium">Loaded Ping</div>
                <div
                  className={`text-xl font-black font-display tabular-nums ${
                    loadedPingEstimate < 35
                      ? 'text-emerald-400'
                      : loadedPingEstimate < 70
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {loadedPingEstimate}
                  <span className="text-xs font-mono text-slate-400 ml-0.5">ms</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">Under Max Load</div>
              </div>

              {/* Jitter & Loss */}
              <div
                className={`p-2.5 rounded-xl border ${
                  isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-white border-slate-200'
                }`}
              >
                <div className="text-[10px] uppercase text-slate-400 font-medium">Jitter / Loss</div>
                <div className="text-xl font-black font-display text-slate-200 tabular-nums">
                  {jitter.toFixed(1)}
                  <span className="text-xs font-mono text-slate-400 ml-0.5">ms</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  Loss: {loss.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Visual Queue Saturation Comparison Bar */}
            <div className="mt-3 pt-3 border-t border-slate-800/60 text-xs space-y-1.5">
              <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
                <span>Bufferbloat Impact: Idle vs Heavy Bandwidth Traffic</span>
                <span className="font-bold">
                  {bufferbloatMs <= 15 ? 'Stable Queue' : `+${bufferbloatMs}ms Lag Penalty`}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden flex">
                <div
                  style={{ width: `${Math.min(100, Math.max(10, (baselinePingVal / loadedPingEstimate) * 100))}%` }}
                  className="bg-indigo-500 h-full"
                  title="Idle Ping Portion"
                />
                <div
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, (bufferbloatMs / loadedPingEstimate) * 100)
                    )}%`,
                  }}
                  className={`h-full ${
                    bufferbloatMs <= 15
                      ? 'bg-emerald-400'
                      : bufferbloatMs <= 35
                      ? 'bg-amber-400'
                      : 'bg-rose-500'
                  }`}
                  title="Bufferbloat Induced Delay"
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                  <span>Idle RTT ({baselinePingVal}ms)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span
                    className={`w-2 h-2 rounded-full inline-block ${
                      bufferbloatMs <= 15 ? 'bg-emerald-400' : 'bg-rose-500'
                    }`}
                  />
                  <span>Queue Bloat (+{bufferbloatMs}ms)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Category Filter */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isDark
                  ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Advice
            </button>
            <button
              onClick={() => setActiveCategory('bufferbloat')}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition cursor-pointer flex items-center space-x-1 ${
                activeCategory === 'bufferbloat'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isDark
                  ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              <span>Bufferbloat Fixes</span>
              {needsSqm && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setActiveCategory('ping')}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition cursor-pointer flex items-center space-x-1 ${
                activeCategory === 'ping'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isDark
                  ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ping &amp; Jitter Fixes</span>
            </button>
            <button
              onClick={() => setActiveCategory('quick-wins')}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition cursor-pointer flex items-center space-x-1 ${
                activeCategory === 'quick-wins'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isDark
                  ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quick Wins (No Router Access)</span>
            </button>
            <button
              onClick={() => setActiveCategory('router-sqm')}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition cursor-pointer flex items-center space-x-1 ${
                activeCategory === 'router-sqm'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isDark
                  ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-pink-400" />
              <span>Router &amp; SQM Setup</span>
            </button>
          </div>

          {/* Actionable Recommendations List */}
          <div className="space-y-4">
            {/* Advice 1: SQM Configuration (High Priority if Bufferbloat > 15ms) */}
            {(activeCategory === 'all' || activeCategory === 'bufferbloat' || activeCategory === 'router-sqm') && (
              <div
                id="adviceSqmCard"
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  needsSqm
                    ? isDark
                      ? 'bg-slate-900/90 border-amber-500/40'
                      : 'bg-amber-50/70 border-amber-200'
                    : isDark
                    ? 'bg-slate-900/60 border-slate-800'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Gauge className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap">
                        <h4 className="text-sm font-bold tracking-tight">
                          Enable Smart Queue Management (SQM: CAKE or FQ_CoDel)
                        </h4>
                        {needsSqm ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            High Priority for your +{bufferbloatMs}ms spike
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Currently Healthy
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Bufferbloat occurs when large file downloads or 4K streams fill up unmanaged router memory buffers, causing gaming packets and video calls to wait in line. SQM uses mathematical algorithms to interleave small, latency-sensitive packets ahead of bulk traffic.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Specific Action Box */}
                <div
                  className={`mt-3 p-3 rounded-xl border text-xs space-y-2 ${
                    isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="font-semibold text-slate-300 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Your Recommended SQM Bandwidth Limits (The 92% Rule):</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    To eliminate modem queue bloat, cap router traffic slightly below your ISP's physical threshold:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    <div
                      className={`p-2 rounded-lg border flex justify-between items-center ${
                        isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="text-slate-400">Download Limit:</span>
                      <span className="font-bold text-cyan-400">
                        {recommendedDownLimit ? `${recommendedDownLimit} Mbps` : '90% of ISP Speed'}
                      </span>
                    </div>
                    <div
                      className={`p-2 rounded-lg border flex justify-between items-center ${
                        isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="text-slate-400">Upload Limit:</span>
                      <span className="font-bold text-pink-400">
                        {recommendedUpLimit ? `${recommendedUpLimit} Mbps` : '90% of ISP Speed'}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    <span className="font-medium text-slate-300">Supported Routers:</span> eero (Optimize for Conferencing &amp; Gaming), ASUS (Adaptive QoS / Cake), Ubiquiti UniFi (Smart Queues), pfSense/OPNsense (Limiter w/ FQ_CoDel), and OpenWrt (luci-app-sqm).
                  </p>
                </div>
              </div>
            )}

            {/* Advice 2: Wired Ethernet vs Wi-Fi */}
            {(activeCategory === 'all' || activeCategory === 'ping' || activeCategory === 'quick-wins') && (
              <div
                id="adviceEthernetCard"
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  needsPingFix || jitter > 3
                    ? isDark
                      ? 'bg-slate-900/90 border-indigo-500/40'
                      : 'bg-indigo-50/50 border-indigo-200'
                    : isDark
                    ? 'bg-slate-900/60 border-slate-800'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Wifi className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h4 className="text-sm font-bold tracking-tight">
                        Switch from Wi-Fi to Direct Cat 6 Ethernet or MoCA 2.5
                      </h4>
                      {jitter > 3 && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Fixes {jitter.toFixed(1)}ms Jitter
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Wi-Fi is a half-duplex shared medium subject to radio frequency contention, channel hopping, and beamforming micro-pauses. Switching to a direct wired connection instantly reduces baseline ping by 5–15ms and reduces packet jitter to under 0.5ms.
                    </p>
                    <div
                      className={`p-2.5 rounded-xl border text-[11px] text-slate-300 space-y-1 ${
                        isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="font-semibold text-slate-200">If Wired Isn't Feasible:</div>
                      <ul className="list-disc list-inside text-slate-400 space-y-1">
                        <li>Connect to the <strong className="text-slate-300">5 GHz or 6 GHz band</strong> (Wi-Fi 6/6E/7) instead of 2.4 GHz.</li>
                        <li>Avoid 160 MHz channel widths in dense apartment complexes; stick to clean 80 MHz channels to avoid DFS radar drops.</li>
                        <li>Consider <strong className="text-slate-300">MoCA 2.5 adapters</strong> (uses existing coaxial cable in your home for true gigabit full-duplex Ethernet).</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Advice 3: Ultra-Fast Anycast DNS Resolvers */}
            {(activeCategory === 'all' || activeCategory === 'ping' || activeCategory === 'quick-wins') && (
              <div
                id="adviceDnsCard"
                className={`p-4 sm:p-5 rounded-2xl border ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Globe className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h4 className="text-sm font-bold tracking-tight">
                        Optimize DNS Resolvers (Cloudflare 1.1.1.1 / Google 8.8.8.8)
                      </h4>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        Quick 2-Minute Fix
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      ISP default DNS servers often suffer from slow lookup queries (50–120ms delays for every new connection) and unoptimized routing paths. Switching to Anycast edge resolvers speeds up website initial handshakes significantly.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                      <div
                        className={`p-2.5 rounded-xl border flex items-center justify-between ${
                          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-sans font-medium">Cloudflare (Fastest RTT)</div>
                          <div className="font-bold text-cyan-400">1.1.1.1 &bull; 1.0.0.1</div>
                        </div>
                        <button
                          onClick={() => handleCopy('cf-dns', '1.1.1.1, 1.0.0.1')}
                          className={`p-1.5 rounded-lg border transition cursor-pointer ${
                            isDark ? 'bg-slate-900 border-slate-700 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-100'
                          }`}
                          title="Copy DNS IPs"
                        >
                          {copiedKey === 'cf-dns' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                      </div>

                      <div
                        className={`p-2.5 rounded-xl border flex items-center justify-between ${
                          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-sans font-medium">Google DNS</div>
                          <div className="font-bold text-indigo-400">8.8.8.8 &bull; 8.8.4.4</div>
                        </div>
                        <button
                          onClick={() => handleCopy('google-dns', '8.8.8.8, 8.8.4.4')}
                          className={`p-1.5 rounded-lg border transition cursor-pointer ${
                            isDark ? 'bg-slate-900 border-slate-700 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-100'
                          }`}
                          title="Copy DNS IPs"
                        >
                          {copiedKey === 'google-dns' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Flush DNS Command Helper */}
                    <div
                      className={`p-2.5 rounded-xl border text-[11px] font-mono flex items-center justify-between ${
                        isDark ? 'bg-slate-950/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="truncate mr-2">
                        <span className="text-slate-500 select-none">$ </span>
                        <span className="text-emerald-400">ipconfig /flushdns</span>
                        <span className="text-slate-500 ml-2 font-sans text-[10px]">(Windows) or dscacheutil (Mac)</span>
                      </div>
                      <button
                        onClick={() => handleCopy('flushdns', 'ipconfig /flushdns')}
                        className="text-indigo-400 hover:text-indigo-300 text-xs shrink-0 flex items-center space-x-1 cursor-pointer"
                      >
                        {copiedKey === 'flushdns' ? (
                          <span className="text-emerald-400 flex items-center space-x-0.5">
                            <Check className="w-3 h-3" />
                            <span>Copied</span>
                          </span>
                        ) : (
                          <span>Copy</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Advice 4: QoS & Background Bandwidth Hog Throttling */}
            {(activeCategory === 'all' || activeCategory === 'bufferbloat' || activeCategory === 'quick-wins') && (
              <div
                id="adviceQosCard"
                className={`p-4 sm:p-5 rounded-2xl border ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Layers className="w-4 h-4 text-pink-400" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold tracking-tight">
                      Manage Background Bandwidth Hogs &amp; Upload Saturation
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Asymmetric broadband (e.g. cable connections with 300 Mbps download but only 15 Mbps upload) easily suffers from uplink saturation. When upload bandwidth is 100% full, TCP ACK packets cannot reach servers in time, which instantly throttles your download speeds by 50–80% and causes huge ping spikes.
                    </p>
                    <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                      <li>
                        <strong className="text-slate-300">Cap Background Sync:</strong> Throttle Google Drive, iCloud, OneDrive, or Dropbox uploads to 75% of your uplink rate.
                      </li>
                      <li>
                        <strong className="text-slate-300">Game Launcher Scheduling:</strong> Configure Steam, Battle.net, and Epic Games to schedule large game patches during off-peak overnight hours.
                      </li>
                      <li>
                        <strong className="text-slate-300">Router QoS Tagging:</strong> Assign DSCP / WMM priority queues to gaming consoles and work conferencing laptops over smart TVs and torrent clients.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Advice 5: Modem & Hardware Diagnostics */}
            {(activeCategory === 'all' || activeCategory === 'router-sqm') && (
              <div
                id="adviceHardwareCard"
                className={`p-4 sm:p-5 rounded-2xl border ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold tracking-tight">
                      Avoid ISP Modem Puma 6/7 Chipsets &amp; Damaged Cables
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Certain older cable modems (utilizing Intel Puma 6/7 chipsets) contain a hardware firmware flaw causing periodic 200ms latency spikes and dropped UDP packets regardless of bandwidth.
                    </p>
                    <div
                      className={`p-2.5 rounded-xl border text-[11px] text-slate-400 space-y-1 ${
                        isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="font-semibold text-slate-300">Hardware Checklist:</div>
                      <div>• Verify modem is Broadcom-based (e.g. ARRIS SB8200 / S33, Motorola MB8600).</div>
                      <div>• Replace worn patch cords with verified Cat 6 cables (damaged cables drop to 100Mbps half-duplex).</div>
                      <div>• Disable Energy Efficient Ethernet (EEE / Green Ethernet) in PC Network Adapter properties.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className={`p-4 sm:p-5 border-t shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 ${
            isDark ? 'border-slate-800/80 bg-slate-900/50' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Apply adjustments on your router, then re-benchmark to verify queue improvements.</span>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className={`px-4 py-2 min-h-[38px] rounded-xl text-xs font-semibold border transition cursor-pointer ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              Close
            </button>

            {onRetest && (
              <button
                id="retestFromTipsBtn"
                onClick={() => {
                  onClose();
                  onRetest();
                }}
                className="px-4 py-2 min-h-[38px] rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition flex items-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Run Fresh Benchmark</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
