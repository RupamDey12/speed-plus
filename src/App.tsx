import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, BarChart3, Award, Sparkles } from 'lucide-react';

// Components
import { Navbar } from './components/Navbar';
import { MetricCards } from './components/MetricCards';
import { SpeedometerGauge } from './components/SpeedometerGauge';
import { TelemetryWaveform } from './components/TelemetryWaveform';
import { NodeDiagnostics } from './components/NodeDiagnostics';
import { HistorySection } from './components/HistorySection';
import { ParticleBackground } from './components/ParticleBackground';
import { AppFooter } from './components/AppFooter';
import { ConnectionVerificationModal } from './components/ConnectionVerificationModal';
import { NetworkOptimizationModal } from './components/NetworkOptimizationModal';

// Newly added advanced features
import { TestModeSelector } from './components/TestModeSelector';
import { RealtimeCapabilityAssessment } from './components/RealtimeCapabilityAssessment';
import { IspBenchmarkComparisonCard } from './components/IspBenchmarkComparisonCard';
import { SpeedTestCertificate } from './components/SpeedTestCertificate';

// Static Data & Utilities
import { INITIAL_SERVERS } from './data/servers';
import { BenchmarkRecord, ServerNode, SpeedUnit } from './types';
import { formatSpeed } from './utils/formatters';
import { fetchHistoryResults, clearHistoryResults } from './services/api';

// Custom Hooks
import { useNetworkInfo } from './hooks/useNetworkInfo';
import { useSpeedTest } from './hooks/useSpeedTest';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState(true);

  // Configuration
  const [servers] = useState<ServerNode[]>(INITIAL_SERVERS);
  const [selectedServer, setSelectedServer] = useState<ServerNode>(INITIAL_SERVERS[0]);
  const [unit, setUnit] = useState<SpeedUnit>('Mbps');

  // Modal and View States
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isOptimizationModalOpen, setIsOptimizationModalOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Telemetry History Records
  const [historyRecords, setHistoryRecords] = useState<BenchmarkRecord[]>([]);

  // 1. Network Detection Hook
  const { networkInfo, refreshNetworkInfo, addTransferredBytes } = useNetworkInfo();

  // Load Initial History
  const loadHistory = useCallback(async () => {
    const records = await fetchHistoryResults();
    setHistoryRecords(records);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // 2. Speed Test Engine Hook
  const {
    stage,
    testMode,
    setTestMode,
    isTesting,
    liveSpeed,
    progressPct,
    stageLabel,
    statusText,
    ping,
    jitter,
    loss,
    downloadSpeed,
    downloadTransferredMb,
    downloadPeak,
    uploadSpeed,
    uploadTransferredMb,
    uploadPeak,
    bufferbloatMs,
    waveformTab,
    setWaveformTab,
    waveformSamples,
    particleMultiplier,
    startSpeedTest,
    quickPing,
    reset,
  } = useSpeedTest({
    selectedServer,
    servers,
    unit,
    onBytesTransferred: addTransferredBytes,
    onBenchmarkCompleted: loadHistory,
  });

  // Theme effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.className =
        'bg-[#07090e] text-slate-100 min-h-screen font-sans antialiased selection:bg-indigo-500 selection:text-white';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className =
        'bg-[#f8fafc] text-slate-900 min-h-screen font-sans antialiased selection:bg-indigo-500 selection:text-white';
    }
  }, [isDark]);

  // Clear history handler
  const handleClearHistory = useCallback(async () => {
    await clearHistoryResults();
    setHistoryRecords([]);
  }, []);

  const formatSpeedWithUnit = useCallback(
    (mbps: number) => formatSpeed(mbps, unit),
    [unit]
  );

  return (
    <div className="relative min-h-screen flex flex-col transition-colors duration-300">
      {/* Interactive Ambient Particle Background */}
      <ParticleBackground speedMultiplier={particleMultiplier} isDark={isDark} />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation Bar */}
        <Navbar
          servers={servers}
          selectedServer={selectedServer}
          onSelectServer={setSelectedServer}
          unit={unit}
          onSelectUnit={setUnit}
          isDark={isDark}
          onToggleTheme={() => setIsDark((prev) => !prev)}
          apiLossPercent={loss}
          onOpenOptimizationTips={() => setIsOptimizationModalOpen(true)}
        />

        {/* Main Application Container */}
        <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full space-y-6">
          {/* Top Test Mode Switcher: Full Suite vs Download-Only vs Upload-Only vs Latency-Only */}
          <TestModeSelector
            currentMode={testMode}
            onSelectMode={setTestMode}
            isTesting={isTesting}
            isDark={isDark}
          />

          {/* 1. Center Speedometer Gauge & Controls */}
          <SpeedometerGauge
            stage={stage}
            liveSpeed={liveSpeed}
            currentProgressPct={progressPct}
            stageLabel={stageLabel}
            statusText={statusText}
            unit={unit}
            formatSpeed={formatSpeedWithUnit}
            isTesting={isTesting}
            onStartTest={() => startSpeedTest()}
            onQuickPing={quickPing}
            onReset={reset}
            isDark={isDark}
          />

          {/* 2. Primary Metrics: Download, Upload, Ping */}
          <MetricCards
            ping={ping}
            jitter={jitter}
            loss={loss}
            downloadSpeed={downloadSpeed}
            downloadTransferredMb={downloadTransferredMb}
            downloadPeak={downloadPeak}
            uploadSpeed={uploadSpeed}
            uploadTransferredMb={uploadTransferredMb}
            uploadPeak={uploadPeak}
            unit={unit}
            clientIp={`IP: ${networkInfo.ip} (${networkInfo.city}, ${networkInfo.countryCode})`}
            ispName={networkInfo.isp}
            bufferbloatMs={bufferbloatMs}
            formatSpeed={formatSpeedWithUnit}
            isDark={isDark}
            onOpenVerification={() => setIsVerificationModalOpen(true)}
            onOpenOptimizationTips={() => setIsOptimizationModalOpen(true)}
            isRealVerified={true}
          />

          {/* 3. Completed State: Verified Certificate of Performance */}
          {stage === 'completed' && (
            <SpeedTestCertificate
              downloadSpeed={downloadSpeed}
              uploadSpeed={uploadSpeed}
              ping={ping}
              jitter={jitter}
              bufferbloatMs={bufferbloatMs}
              packetLoss={loss}
              serverName={selectedServer.name}
              ispName={networkInfo.isp}
              clientIp={networkInfo.ip}
              unit={unit}
              formatSpeed={formatSpeedWithUnit}
              isDark={isDark}
            />
          )}

          {/* 4. Real-World Capability Assessment (Gaming, 4K HDR, Conferencing, Live Streaming) */}
          <RealtimeCapabilityAssessment
            downloadSpeed={downloadSpeed}
            uploadSpeed={uploadSpeed}
            ping={ping}
            jitter={jitter}
            bufferbloatMs={bufferbloatMs}
            packetLoss={loss}
            isDark={isDark}
          />

          {/* 5. Global ISP Infrastructure Benchmark & Speed Percentile */}
          <IspBenchmarkComparisonCard
            currentDownload={downloadSpeed}
            currentUpload={uploadSpeed}
            currentPing={ping}
            currentIsp={networkInfo.isp}
            unit={unit}
            formatSpeed={formatSpeedWithUnit}
            isDark={isDark}
          />

          {/* 6. Advanced Telemetry & History Collapse Switch */}
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setShowAdvanced((prev) => !prev)}
              className={`flex items-center space-x-2 px-4 py-2 min-h-[40px] rounded-xl text-xs font-medium border transition cursor-pointer ${
                isDark
                  ? 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border-slate-800'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {showAdvanced
                  ? 'Hide Detailed Telemetry & History'
                  : `Show Detailed Telemetry & History (${historyRecords.length})`}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  showAdvanced ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          {/* 7. Collapsible Advanced Telemetry Section */}
          {showAdvanced && (
            <div className="space-y-6 pt-2 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-7">
                  <TelemetryWaveform
                    activeTab={waveformTab}
                    onTabChange={setWaveformTab}
                    samples={waveformSamples}
                    unit={unit}
                    formatSpeed={formatSpeedWithUnit}
                    packetLoss={loss}
                    bufferbloatRating={
                      bufferbloatMs <= 5 ? 'A+' : bufferbloatMs <= 15 ? 'A' : bufferbloatMs <= 30 ? 'B' : 'C'
                    }
                    bufferbloatLatency={`+${bufferbloatMs}ms`}
                    streamsCount={stage === 'download' ? 3 : stage === 'upload' ? 2 : 1}
                    isDark={isDark}
                    onOpenOptimizationTips={() => setIsOptimizationModalOpen(true)}
                  />
                </div>
                <div className="md:col-span-5">
                  <NodeDiagnostics isDark={isDark} networkInfo={networkInfo} />
                </div>
              </div>

              {/* History Table */}
              <HistorySection
                records={historyRecords}
                unit={unit}
                formatSpeed={formatSpeedWithUnit}
                onRefresh={loadHistory}
                onClear={handleClearHistory}
                isDark={isDark}
              />
            </div>
          )}
        </main>

        {/* Minimal Footer */}
        <AppFooter
          isDark={isDark}
          onOpenOptimizationTips={() => setIsOptimizationModalOpen(true)}
          onOpenVerification={() => setIsVerificationModalOpen(true)}
        />
      </div>

      {/* Socket Verification Modal */}
      <ConnectionVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        networkInfo={networkInfo}
        selectedServer={selectedServer}
        bufferbloatMs={bufferbloatMs}
        isDark={isDark}
        onRefreshIp={refreshNetworkInfo}
        onOpenOptimizationTips={() => setIsOptimizationModalOpen(true)}
      />

      {/* Network Optimization Tips Modal */}
      <NetworkOptimizationModal
        isOpen={isOptimizationModalOpen}
        onClose={() => setIsOptimizationModalOpen(false)}
        bufferbloatMs={bufferbloatMs}
        ping={ping}
        jitter={jitter}
        loss={loss}
        downloadSpeed={downloadSpeed}
        uploadSpeed={uploadSpeed}
        isDark={isDark}
        onRetest={() => startSpeedTest()}
      />
    </div>
  );
}
