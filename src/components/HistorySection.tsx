import React, { useState } from 'react';
import { Database, Download, RefreshCw, Trash2 } from 'lucide-react';
import { BenchmarkRecord, ConnectionType, SpeedUnit } from '../types';

interface HistorySectionProps {
  records: BenchmarkRecord[];
  unit: SpeedUnit;
  formatSpeed: (mbps: number) => string;
  onRefresh: () => void;
  onClear: () => void;
  isDark: boolean;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  records,
  unit,
  formatSpeed,
  onRefresh,
  onClear,
  isDark,
}) => {
  const [filter, setFilter] = useState<ConnectionType>('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredRecords = records.filter((r) => {
    if (filter === 'All') return true;
    return r.connectionType === filter;
  });

  // Calculate summary stats
  const total = records.length;
  const avgDown =
    total > 0 ? records.reduce((acc, r) => acc + r.download, 0) / total : 0;
  const avgUp =
    total > 0 ? records.reduce((acc, r) => acc + r.upload, 0) / total : 0;
  const bestPing =
    total > 0 ? Math.min(...records.map((r) => r.ping)) : 0;

  const handleSync = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleExportCsv = () => {
    if (records.length === 0) {
      setExportNotice('No telemetry records available to export.');
      setTimeout(() => setExportNotice(null), 3000);
      return;
    }

    let csvContent = 'Timestamp,Server Node,Ping (ms),Jitter (ms),Download (Mbps),Upload (Mbps),Classification,MongoDB _id\n';
    records.forEach((r) => {
      csvContent += `"${new Date(r.timestamp).toISOString()}","${r.serverNodeName}",${r.ping},${r.jitter},${r.download},${r.upload},"${r.classification}","${r._id}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SpeedPulse_Telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setExportNotice('Telemetry exported to CSV successfully.');
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <section
      id="benchmarkTelemetrySection"
      className={`rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl space-y-4 sm:space-y-6 transition-colors ${
        isDark
          ? 'glass-card bg-[#111726]/85 border border-white/[0.08]'
          : 'glass-card bg-white/95 border border-slate-200 shadow-slate-200'
      }`}
    >
      {/* Summary Stats Banner */}
      <div
        id="summaryStatsBanner"
        className={`grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 p-3 sm:p-4 rounded-2xl border ${
          isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div>
          <div className="text-[10px] uppercase font-mono text-slate-400">Avg Download</div>
          <div className="text-lg sm:text-xl font-bold font-mono text-cyan-400" id="statAvgDown">
            {formatSpeed(avgDown)}{' '}
            <span className="text-[10px] sm:text-xs font-normal text-slate-400">{unit}</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-mono text-slate-400">Avg Upload</div>
          <div className="text-lg sm:text-xl font-bold font-mono text-pink-400" id="statAvgUp">
            {formatSpeed(avgUp)}{' '}
            <span className="text-[10px] sm:text-xs font-normal text-slate-400">{unit}</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-mono text-slate-400">Best Latency</div>
          <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400" id="statBestPing">
            {bestPing > 0 ? bestPing : '--'}{' '}
            <span className="text-[10px] sm:text-xs font-normal text-slate-400">ms</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-mono text-slate-400">Total Benchmarks</div>
          <div className="text-lg sm:text-xl font-bold font-mono text-indigo-300" id="statTotalTests">
            {total}
          </div>
        </div>
      </div>

      {/* Header + Filters + Export Options */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2
            className={`text-base sm:text-lg font-bold tracking-tight flex items-center space-x-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            <Database className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Speed Test History</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Saved benchmark results across your sessions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {exportNotice && (
            <span className="w-full sm:w-auto text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {exportNotice}
            </span>
          )}
          {/* Filter Pills */}
          <div
            id="connectionFilterGroup"
            className={`flex p-0.5 rounded-xl border text-xs font-mono ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            {(['All', 'Wi-Fi', 'Ethernet'] as ConnectionType[]).map((c) => (
              <button
                key={c}
                id={`filterBtn-${c}`}
                onClick={() => setFilter(c)}
                className={`px-2.5 sm:px-3 py-1 min-h-[36px] sm:min-h-[32px] rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                  filter === c
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Export Actions */}
          <button
            id="exportCsvBtn"
            onClick={handleExportCsv}
            title="Export telemetry data as CSV"
            className={`px-3 py-1.5 min-h-[36px] rounded-xl border text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer active:scale-95 ${
              isDark
                ? 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>CSV</span>
          </button>

          <button
            id="refreshHistoryBtn"
            onClick={handleSync}
            className={`px-3 py-1.5 min-h-[36px] rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95 ${
              isDark
                ? 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border-slate-700/80'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-300'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            id="clearHistoryBtn"
            onClick={onClear}
            className="px-3 py-1.5 min-h-[36px] rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 text-xs font-semibold transition-all cursor-pointer active:scale-95"
          >
            <span className="flex items-center space-x-1">
              <Trash2 className="w-3 h-3 shrink-0" />
              <span>Clear</span>
            </span>
          </button>
        </div>
      </div>

      {/* Responsive Mobile Cards View (< md) */}
      <div className="block md:hidden space-y-2.5">
        {filteredRecords.map((item) => {
          const formattedTime = new Date(item.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });

          return (
            <div
              key={item._id}
              className={`p-3.5 rounded-2xl border font-mono text-xs space-y-2 transition-all ${
                isDark
                  ? 'bg-slate-900/70 border-slate-800'
                  : 'bg-slate-50/90 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px] font-semibold">{formattedTime}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    item.classification === 'Gigabit Hyper'
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      : item.classification === 'Ultra 4K Stream'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : item.classification === 'Full HD / Gaming'
                      ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {item.classification}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Node: <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>{item.serverNodeName}</span></span>
                <span className="text-slate-400">Ping: <span className="text-emerald-400 font-bold">{item.ping}ms</span> ({item.jitter}j)</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/40">
                <div className="bg-cyan-500/10 p-2 rounded-xl border border-cyan-500/20">
                  <div className="text-[10px] uppercase text-slate-400">Download</div>
                  <div className="text-sm font-bold text-cyan-400">
                    {formatSpeed(item.download)} <span className="text-[10px] font-normal text-slate-400">{unit}</span>
                  </div>
                </div>
                <div className="bg-pink-500/10 p-2 rounded-xl border border-pink-500/20">
                  <div className="text-[10px] uppercase text-slate-400">Upload</div>
                  <div className="text-sm font-bold text-pink-400">
                    {formatSpeed(item.upload)} <span className="text-[10px] font-normal text-slate-400">{unit}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredRecords.length === 0 && (
          <div className="py-8 text-center text-slate-500 space-y-1">
            <p className="text-sm font-semibold">No benchmark entries.</p>
            <p className="text-xs text-slate-400">Trigger a speed test to record live telemetry.</p>
          </div>
        )}
      </div>

      {/* History Table (≥ md) */}
      <div
        id="historyTableWrapper"
        className={`hidden md:block overflow-x-auto rounded-2xl border ${
          isDark ? 'border-slate-800/80' : 'border-slate-200'
        }`}
      >
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr
              className={`border-b text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono ${
                isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-100/90 border-slate-200'
              }`}
            >
              <th className="py-3.5 px-4">Timestamp</th>
              <th className="py-3.5 px-4">Server Node</th>
              <th className="py-3.5 px-4">Ping / Jitter</th>
              <th className="py-3.5 px-4 text-cyan-400">Download</th>
              <th className="py-3.5 px-4 text-pink-400">Upload</th>
              <th className="py-3.5 px-4">Classification</th>
              <th className="py-3.5 px-4 text-right">MongoDB _id</th>
            </tr>
          </thead>
          <tbody
            className={`divide-y font-mono text-xs ${
              isDark
                ? 'divide-slate-800/60 bg-slate-950/20'
                : 'divide-slate-200/80 bg-white'
            }`}
          >
            {filteredRecords.map((item) => {
              const formattedTime = new Date(item.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              return (
                <tr
                  key={item._id}
                  className={`transition-colors group ${
                    isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="py-3.5 px-4 text-slate-300 font-medium">
                    {formattedTime}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 truncate max-w-[200px]">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] border ${
                        isDark
                          ? 'bg-slate-800 text-slate-300 border-slate-700/60'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {item.serverNodeName}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-200 font-semibold">
                    {item.ping} ms{' '}
                    <span className="text-[10px] text-slate-400">({item.jitter}j)</span>
                  </td>
                  <td className="py-3.5 px-4 text-cyan-400 font-bold text-sm">
                    {formatSpeed(item.download)}{' '}
                    <span className="text-[10px] text-slate-400 font-normal">{unit}</span>
                  </td>
                  <td className="py-3.5 px-4 text-pink-400 font-bold text-sm">
                    {formatSpeed(item.upload)}{' '}
                    <span className="text-[10px] text-slate-400 font-normal">{unit}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                        item.classification === 'Gigabit Hyper'
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                          : item.classification === 'Ultra 4K Stream'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : item.classification === 'Full HD / Gaming'
                          ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {item.classification}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-400 font-mono text-[11px] group-hover:text-cyan-300 transition-colors">
                    {item._id}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredRecords.length === 0 && (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <p className="text-sm font-semibold">No benchmark entries matching current filter.</p>
            <p className="text-xs text-slate-400">Trigger a speed test above to record live telemetry.</p>
          </div>
        )}
      </div>
    </section>
  );
};
