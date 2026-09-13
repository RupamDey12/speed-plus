import { useState, useCallback, useRef, useEffect } from 'react';
import { BenchmarkStage, ServerNode, SpeedUnit, WaveformTab } from '../types';
import { formatSpeed, classifySpeed } from '../utils/formatters';
import { runPingBenchmark, runDownloadBenchmark, runUploadBenchmark } from '../services/telemetryEngine';
import { saveBenchmarkResult } from '../services/api';

interface UseSpeedTestProps {
  selectedServer: ServerNode;
  servers: ServerNode[];
  unit: SpeedUnit;
  onBytesTransferred?: (downloadDelta: number, uploadDelta: number) => void;
  onBenchmarkCompleted?: () => void;
}

export function useSpeedTest({
  selectedServer,
  servers,
  unit,
  onBytesTransferred,
  onBenchmarkCompleted,
}: UseSpeedTestProps) {
  const [stage, setStage] = useState<BenchmarkStage>('idle');
  const [isTesting, setIsTesting] = useState(false);
  const [liveSpeed, setLiveSpeed] = useState<number>(0);
  const [progressPct, setProgressPct] = useState<number>(0);
  const [stageLabel, setStageLabel] = useState<string>('Stage 0/3: Idle');
  const [statusText, setStatusText] = useState<string>('Ready to Benchmark Real Internet');

  // Metrics
  const [ping, setPing] = useState<number | null>(null);
  const [jitter, setJitter] = useState<number>(0);
  const [loss, setLoss] = useState<number>(0);

  const [downloadSpeed, setDownloadSpeed] = useState<number | null>(null);
  const [downloadTransferredMb, setDownloadTransferredMb] = useState<number>(0);
  const [downloadPeak, setDownloadPeak] = useState<number>(0);

  const [uploadSpeed, setUploadSpeed] = useState<number | null>(null);
  const [uploadTransferredMb, setUploadTransferredMb] = useState<number>(0);
  const [uploadPeak, setUploadPeak] = useState<number>(0);

  const [bufferbloatMs, setBufferbloatMs] = useState<number>(2);

  // Waveform graph state
  const [waveformTab, setWaveformTab] = useState<WaveformTab>('down');
  const [waveformSamples, setWaveformSamples] = useState<number[]>(() => new Array(35).fill(0));

  // Ambient particles
  const [particleMultiplier, setParticleMultiplier] = useState<number>(1);

  const cancelFlagRef = useRef(false);

  const appendWaveformSample = useCallback((val: number) => {
    setWaveformSamples((prev) => [...prev.slice(1), Math.max(0, parseFloat(val.toFixed(1)))]);
  }, []);

  const reset = useCallback(() => {
    cancelFlagRef.current = true;
    setIsTesting(false);
    setStage('idle');
    setLiveSpeed(0);
    setProgressPct(0);
    setStageLabel('Stage 0/3: Idle');
    setStatusText('Ready to Benchmark Real Internet');
    setPing(null);
    setJitter(0);
    setLoss(0);
    setDownloadSpeed(null);
    setDownloadTransferredMb(0);
    setDownloadPeak(0);
    setUploadSpeed(null);
    setUploadTransferredMb(0);
    setUploadPeak(0);
    setWaveformSamples(new Array(35).fill(0));
    setParticleMultiplier(1);
  }, []);

  // Quick Ping Routine
  const quickPing = useCallback(async () => {
    if (isTesting) return;
    cancelFlagRef.current = false;
    setIsTesting(true);
    setStage('ping');
    setWaveformTab('jitter');
    setStatusText('Measuring real edge socket latency...');

    try {
      const pingResult = await runPingBenchmark(selectedServer, {
        onProbe: (currentPing, probeIndex, totalProbes, isWarmup) => {
          setPing(currentPing);
          appendWaveformSample(currentPing);
          setStageLabel(`Ping: ${currentPing} ms`);
          setProgressPct((probeIndex / totalProbes) * 100);
          setStatusText(
            isWarmup
              ? `TLS/Socket Warmup Probe ${probeIndex}/2: ${currentPing}ms`
              : `Edge RTT Probe ${probeIndex}/${totalProbes}: ${currentPing}ms`
          );
        },
        isCancelled: () => cancelFlagRef.current,
      });

      setPing(pingResult.ping);
      setJitter(pingResult.jitter);
      setLoss(pingResult.loss);
      setStage('completed');
      setStatusText(`Real edge ping verified: ${pingResult.ping}ms latency (Jitter: ${pingResult.jitter}ms)`);
      setStageLabel(`Ping: ${pingResult.ping} ms`);
      setProgressPct(100);
      setParticleMultiplier(1);
    } finally {
      setIsTesting(false);
    }
  }, [isTesting, selectedServer, appendWaveformSample]);

  // Master Test Routine
  const startSpeedTest = useCallback(async () => {
    if (isTesting) return;
    cancelFlagRef.current = false;
    setIsTesting(true);

    try {
      setLiveSpeed(0);

      // Edge node auto-calibration: resolve lowest-latency edge
      let activeTargetServer = selectedServer;
      if (selectedServer.id === 'cloudflare-auto') {
        setStatusText('Calibrating Nearest Edge PoP (Multi-Route Latency Pre-test)...');
        try {
          const edgeCandidates = servers.filter((s) => s.id !== 'cloudflare-auto');
          const probePromises = edgeCandidates.map(async (srv) => {
            const pUrl = srv.pingUrl || '/api/ping';
            const sep = pUrl.includes('?') ? '&' : '?';
            const t0 = performance.now();
            try {
              const res = await fetch(`${pUrl}${sep}_probe=${Date.now()}`, { cache: 'no-store' });
              if (res.ok) return { srv, rtt: performance.now() - t0 };
            } catch {
              // fallback
            }
            return { srv, rtt: 9999 };
          });

          const cfProbe = (async () => {
            const t0 = performance.now();
            try {
              const res = await fetch(
                `https://speed.cloudflare.com/__down?bytes=0&_probe=${Date.now()}`,
                { cache: 'no-store' }
              );
              if (res.ok) return { srv: selectedServer, rtt: performance.now() - t0 };
            } catch {
              // fallback
            }
            return { srv: selectedServer, rtt: 9999 };
          })();

          const results = await Promise.all([...probePromises, cfProbe]);
          results.sort((a, b) => a.rtt - b.rtt);
          if (results[0] && results[0].rtt < 8000) {
            activeTargetServer = results[0].srv;
          }
        } catch {
          // keep selected
        }
      }

      // 1. Ping & Jitter
      setStage('ping');
      setWaveformTab('jitter');
      setParticleMultiplier(2);
      setStatusText('Testing Physical Edge Socket Latency (16 High-Precision Probes)...');

      const pingResult = await runPingBenchmark(activeTargetServer, {
        onProbe: (currentPing, probeIdx, totalProbes, isWarmup) => {
          setPing(currentPing);
          appendWaveformSample(currentPing);
          setProgressPct((probeIdx / totalProbes) * 20);
          setStageLabel(`Ping: ${currentPing} ms`);
          setStatusText(
            isWarmup
              ? `TLS/Socket Warmup Probe ${probeIdx}/2: ${currentPing}ms (Calibrating)`
              : `Edge RTT Probe ${probeIdx}/${totalProbes}: ${currentPing}ms`
          );
        },
        isCancelled: () => cancelFlagRef.current,
      });

      if (cancelFlagRef.current) return;
      setPing(pingResult.ping);
      setJitter(pingResult.jitter);
      setLoss(pingResult.loss);

      // 2. Download
      setStage('download');
      setWaveformTab('down');
      setParticleMultiplier(4.5);
      setStatusText('Calibrating Real Wire Download (Multi-Stream Direct Sockets)...');

      let downloadPeakSpeed = 0;
      const downloadResult = await runDownloadBenchmark(activeTargetServer, pingResult.ping, {
        onProgress: (instantSpeed, pct, totalBytes, isSteady) => {
          downloadPeakSpeed = Math.max(downloadPeakSpeed, instantSpeed);
          setLiveSpeed(instantSpeed);
          setDownloadSpeed(instantSpeed);
          setDownloadTransferredMb(totalBytes / (1024 * 1024));
          setDownloadPeak(downloadPeakSpeed);
          appendWaveformSample(instantSpeed);
          setProgressPct(pct);
          setStageLabel(`Download: ${formatSpeed(instantSpeed, unit)} ${unit}`);
          setStatusText(
            isSteady
              ? `RFC 6349 Steady-State: ${formatSpeed(instantSpeed, unit)} ${unit} (${(
                  totalBytes /
                  (1024 * 1024)
                ).toFixed(1)} MB)`
              : `TCP Slow-Start Ramp: ${formatSpeed(instantSpeed, unit)} ${unit} (Calibrating)`
          );
        },
        isCancelled: () => cancelFlagRef.current,
      });

      if (cancelFlagRef.current) return;
      setDownloadSpeed(downloadResult.speedMbps);
      setBufferbloatMs(downloadResult.bufferbloatMs);
      onBytesTransferred?.(downloadResult.transferredBytes, 0);

      // 3. Upload
      setStage('upload');
      setWaveformTab('up');
      setParticleMultiplier(3.8);
      setStatusText('Testing Real Wire Upload (High-Precision Socket Stream)...');

      let uploadPeakSpeed = 0;
      const uploadResult = await runUploadBenchmark(activeTargetServer, {
        onProgress: (instantSpeed, pct, totalBytes, isSteady) => {
          uploadPeakSpeed = Math.max(uploadPeakSpeed, instantSpeed);
          setLiveSpeed(instantSpeed);
          setUploadSpeed(instantSpeed);
          setUploadTransferredMb(totalBytes / (1024 * 1024));
          setUploadPeak(uploadPeakSpeed);
          appendWaveformSample(instantSpeed);
          setProgressPct(pct);
          setStageLabel(`Upload: ${formatSpeed(instantSpeed, unit)} ${unit}`);
          setStatusText(
            isSteady
              ? `RFC 6349 Uplink: ${formatSpeed(instantSpeed, unit)} ${unit} (${(
                  totalBytes /
                  (1024 * 1024)
                ).toFixed(1)} MB)`
              : `Uplink Slow-Start Ramp: ${formatSpeed(instantSpeed, unit)} ${unit} (Calibrating)`
          );
        },
        isCancelled: () => cancelFlagRef.current,
      });

      if (cancelFlagRef.current) return;
      setUploadSpeed(uploadResult.speedMbps);
      onBytesTransferred?.(0, uploadResult.transferredBytes);

      // 4. Finalize & Persist
      setStage('completed');
      setParticleMultiplier(1);
      setProgressPct(100);
      setStageLabel(`Calibrated Benchmark Complete: ${downloadResult.speedMbps} ${unit}`);
      setStatusText(
        `Direct Socket Benchmark Complete • RFC 6349 Calibrated against ${activeTargetServer.name}`
      );
      setLiveSpeed(downloadResult.speedMbps);

      await saveBenchmarkResult({
        server: activeTargetServer.name,
        serverNodeName: activeTargetServer.name,
        connectionType: 'Ethernet',
        ping: pingResult.ping,
        jitter: pingResult.jitter,
        download: downloadResult.speedMbps,
        upload: uploadResult.speedMbps,
        loss: pingResult.loss,
        classification: classifySpeed(downloadResult.speedMbps),
      });

      onBenchmarkCompleted?.();
    } catch (err) {
      console.error('Speed test error:', err);
      setStatusText('Benchmark interrupted or cancelled');
    } finally {
      setIsTesting(false);
    }
  }, [
    isTesting,
    selectedServer,
    servers,
    unit,
    appendWaveformSample,
    onBytesTransferred,
    onBenchmarkCompleted,
  ]);

  // Spacebar shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        !isTesting &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        startSpeedTest();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTesting, startSpeedTest]);

  return {
    stage,
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
  };
}
