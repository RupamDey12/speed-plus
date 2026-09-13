/**
 * Telemetry Engine (RFC 2681, RFC 3550, RFC 6349, and TR-471 Standard)
 * Implements real-world socket latency, steady-state multi-stream download,
 * and high-entropy uplink wire benchmarks.
 */

import { ServerNode } from '../types';
import {
  computeInterquartileMean,
  computePercentile,
  computeRFC3550Jitter,
  createHighEntropyBuffer,
  uploadStreamXHR,
} from '../utils/networkMath';

export interface PingResult {
  ping: number;
  jitter: number;
  loss: number;
}

export interface PingCallbacks {
  onProbe: (currentPing: number, probeIndex: number, totalProbes: number, isWarmup: boolean) => void;
  isCancelled: () => boolean;
}

export interface DownloadCallbacks {
  onProgress: (
    instantSpeedMbps: number,
    progressPct: number,
    transferredBytes: number,
    isSteadyState: boolean
  ) => void;
  isCancelled: () => boolean;
}

export interface UploadCallbacks {
  onProgress: (
    instantSpeedMbps: number,
    progressPct: number,
    transferredBytes: number,
    isSteadyState: boolean
  ) => void;
  isCancelled: () => boolean;
}

/**
 * Executes RFC 2681 16-probe Ping & Jitter benchmark with warmup filtering.
 */
export async function runPingBenchmark(
  server: ServerNode,
  callbacks: PingCallbacks
): Promise<PingResult> {
  const allSamples: number[] = [];
  const calibratedSamples: number[] = [];
  const totalPings = 16;
  const WARMUP_PROBES = 2; // Discard initial 2 probes (DNS cache + TLS 1.3 handshake warm-up)
  let failedCount = 0;

  const pingTarget = server.pingUrl || 'https://speed.cloudflare.com/__down?bytes=0';
  const separator = pingTarget.includes('?') ? '&' : '?';

  for (let i = 0; i < totalPings; i++) {
    if (callbacks.isCancelled()) break;

    const tStart = performance.now();
    try {
      const pingUrl = `${pingTarget}${separator}_t=${Date.now()}_${i}`;
      const res = await fetch(pingUrl, {
        cache: 'no-store',
        headers: { Accept: '*/*' },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const duration = Math.max(1, Math.round(performance.now() - tStart));
      allSamples.push(duration);

      if (i >= WARMUP_PROBES) {
        calibratedSamples.push(duration);
      }

      const currentDisplayPing =
        calibratedSamples.length > 0
          ? computeInterquartileMean(calibratedSamples)
          : Math.round(allSamples.reduce((a, b) => a + b, 0) / allSamples.length);

      callbacks.onProbe(currentDisplayPing, i + 1, totalPings, i < WARMUP_PROBES);
    } catch {
      // Fallback to local server ping
      try {
        const fallbackStart = performance.now();
        const localRes = await fetch(`/api/ping?t=${Date.now()}_${i}`, { cache: 'no-store' });
        if (localRes.ok) {
          const fallbackDuration = Math.max(1, Math.round(performance.now() - fallbackStart));
          allSamples.push(fallbackDuration);
          if (i >= WARMUP_PROBES) {
            calibratedSamples.push(fallbackDuration);
          }
          const currentDisplayPing =
            calibratedSamples.length > 0
              ? computeInterquartileMean(calibratedSamples)
              : Math.round(allSamples.reduce((a, b) => a + b, 0) / allSamples.length);
          callbacks.onProbe(currentDisplayPing, i + 1, totalPings, i < WARMUP_PROBES);
        } else {
          failedCount++;
        }
      } catch {
        failedCount++;
      }
    }

    await new Promise((r) => setTimeout(r, 35));
  }

  const calculatedLoss = Math.round((failedCount / totalPings) * 100);
  const samplePool = calibratedSamples.length >= 3 ? calibratedSamples : allSamples;
  const roundedJitter = computeRFC3550Jitter(samplePool);

  const finalPing =
    calibratedSamples.length > 0
      ? computeInterquartileMean(calibratedSamples)
      : allSamples.length > 0
      ? Math.round(allSamples.reduce((a, b) => a + b, 0) / allSamples.length)
      : server.basePing || 15;

  return { ping: finalPing, jitter: roundedJitter, loss: calculatedLoss };
}

/**
 * Executes RFC 6349 Multi-Stream Steady-State Download Benchmark.
 */
export async function runDownloadBenchmark(
  server: ServerNode,
  baselinePing: number,
  callbacks: DownloadCallbacks
): Promise<{ speedMbps: number; transferredBytes: number; bufferbloatMs: number }> {
  const DURATION_MS = 8000;
  const WARMUP_MS = 1500;
  const startTime = performance.now();

  let totalDownloadedBytes = 0;
  let windowBytes = 0;
  let windowStartTime = startTime;
  let peakSpeedMbps = 0;

  let steadyStateStartTime = 0;
  let steadyStateStartBytes = 0;
  let hasEnteredSteadyState = false;
  const steadyStateSliceSpeeds: number[] = [];
  const loadedPings: number[] = [];

  const downTarget = server.downUrl || 'https://speed.cloudflare.com/__down';
  const streamUrl = `${downTarget}?bytes=50000000`;

  const activeStreams = 4;
  const streamAbortControllers: AbortController[] = [];

  const streamWorker = async (workerId: number) => {
    while (!callbacks.isCancelled() && performance.now() - startTime < DURATION_MS) {
      const controller = new AbortController();
      streamAbortControllers.push(controller);

      try {
        const separator = streamUrl.includes('?') ? '&' : '?';
        const fetchUrl = `${streamUrl}${separator}_w=${workerId}&_t=${Date.now()}`;
        const res = await fetch(fetchUrl, {
          cache: 'no-store',
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          // Fallback to local server API
          const localRes = await fetch(`/api/download?bytes=40000000&_w=${workerId}`, {
            cache: 'no-store',
            signal: controller.signal,
          });
          if (localRes.ok && localRes.body) {
            const reader = localRes.body.getReader();
            while (!callbacks.isCancelled() && performance.now() - startTime < DURATION_MS) {
              const { done, value } = await reader.read();
              if (done) break;
              if (value) {
                totalDownloadedBytes += value.byteLength;
                windowBytes += value.byteLength;
              }
            }
          }
          break;
        }

        const reader = res.body.getReader();
        while (!callbacks.isCancelled() && performance.now() - startTime < DURATION_MS) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            totalDownloadedBytes += value.byteLength;
            windowBytes += value.byteLength;
          }
        }
      } catch {
        break;
      }
    }
  };

  const workers: Promise<void>[] = [];
  for (let i = 0; i < activeStreams; i++) {
    workers.push(streamWorker(i));
  }

  let hasScaledStreams = false;

  // Bufferbloat checker under saturation
  const bufferbloatChecker = async () => {
    const checkPoints = [2400, 4200, 6000];
    for (const delay of checkPoints) {
      await new Promise((r) => setTimeout(r, delay));
      if (callbacks.isCancelled() || performance.now() - startTime >= DURATION_MS) return;
      try {
        const t0 = performance.now();
        const probeTarget = server.pingUrl || 'https://speed.cloudflare.com/__down?bytes=0';
        const sep = probeTarget.includes('?') ? '&' : '?';
        const res = await fetch(`${probeTarget}${sep}_bb=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          loadedPings.push(Math.round(performance.now() - t0));
        }
      } catch {
        // ignore
      }
    }
  };
  bufferbloatChecker();

  // Periodic UI tick loop
  while (!callbacks.isCancelled() && performance.now() - startTime < DURATION_MS) {
    await new Promise((r) => setTimeout(r, 70));
    const now = performance.now();
    const elapsedTotalSec = (now - startTime) / 1000;
    const windowDeltaSec = (now - windowStartTime) / 1000;

    if (!hasEnteredSteadyState && now - startTime >= WARMUP_MS) {
      hasEnteredSteadyState = true;
      steadyStateStartTime = now;
      steadyStateStartBytes = totalDownloadedBytes;
    }

    // Scale to 6 workers for high bandwidth (>40 Mbps)
    if (
      !hasScaledStreams &&
      elapsedTotalSec > 1.5 &&
      (totalDownloadedBytes * 8) / (1024 * 1024) / elapsedTotalSec > 40
    ) {
      hasScaledStreams = true;
      workers.push(streamWorker(4), streamWorker(5));
    }

    if (windowDeltaSec > 0.12) {
      const instantSpeedMbps = (windowBytes * 8) / (1024 * 1024) / windowDeltaSec;
      let currentThroughputMbps = 0;

      if (hasEnteredSteadyState && steadyStateStartTime > 0) {
        const steadyDurationSec = (now - steadyStateStartTime) / 1000;
        const steadyBytes = totalDownloadedBytes - steadyStateStartBytes;
        currentThroughputMbps =
          steadyDurationSec > 0
            ? (steadyBytes * 8) / (1024 * 1024) / steadyDurationSec
            : instantSpeedMbps;
        steadyStateSliceSpeeds.push(instantSpeedMbps);
      } else {
        currentThroughputMbps =
          elapsedTotalSec > 0
            ? (totalDownloadedBytes * 8) / (1024 * 1024) / elapsedTotalSec
            : instantSpeedMbps;
      }

      const displaySpeed =
        instantSpeedMbps > 0
          ? currentThroughputMbps * 0.7 + instantSpeedMbps * 0.3
          : currentThroughputMbps;

      peakSpeedMbps = Math.max(peakSpeedMbps, displaySpeed);
      const progressPct = 20 + Math.min((elapsedTotalSec / (DURATION_MS / 1000)) * 45, 45);

      callbacks.onProgress(displaySpeed, progressPct, totalDownloadedBytes, hasEnteredSteadyState);

      windowBytes = 0;
      windowStartTime = now;
    }
  }

  streamAbortControllers.forEach((c) => c.abort());
  await Promise.allSettled(workers);

  // Final steady-state calculation
  let finalDownloadSpeed = peakSpeedMbps;
  if (hasEnteredSteadyState && steadyStateStartTime > 0) {
    const steadyDurationSec = (performance.now() - steadyStateStartTime) / 1000;
    const steadyBytes = totalDownloadedBytes - steadyStateStartBytes;
    const sustainedThroughput =
      steadyDurationSec > 0
        ? (steadyBytes * 8) / (1024 * 1024) / steadyDurationSec
        : peakSpeedMbps;
    const peak90th = computePercentile(steadyStateSliceSpeeds, 0.90);
    finalDownloadSpeed =
      peak90th > 0 ? sustainedThroughput * 0.85 + peak90th * 0.15 : sustainedThroughput;
  } else {
    const totalElapsedSec = (performance.now() - startTime) / 1000;
    finalDownloadSpeed =
      totalElapsedSec > 0
        ? (totalDownloadedBytes * 8) / (1024 * 1024) / totalElapsedSec
        : peakSpeedMbps;
  }

  let measuredBloat = 2;
  if (loadedPings.length > 0) {
    const avgLoadedPing = loadedPings.reduce((a, b) => a + b, 0) / loadedPings.length;
    measuredBloat = Math.max(1, Math.round(avgLoadedPing - baselinePing));
  }

  return {
    speedMbps: parseFloat(finalDownloadSpeed.toFixed(1)),
    transferredBytes: totalDownloadedBytes,
    bufferbloatMs: measuredBloat,
  };
}

/**
 * Executes RFC 6349 High-Entropy Upload Benchmark with XHR streaming progress.
 */
export async function runUploadBenchmark(
  server: ServerNode,
  callbacks: UploadCallbacks
): Promise<{ speedMbps: number; transferredBytes: number }> {
  const DURATION_MS = 7000;
  const UPLOAD_WARMUP_MS = 1400;
  const startTime = performance.now();

  let totalUploadedBytes = 0;
  let peakUploadMbps = 0;
  let windowUpBytes = 0;
  let windowStartTime = startTime;

  let hasEnteredSteadyUpload = false;
  let steadyUploadStartTime = 0;
  let steadyUploadStartBytes = 0;
  const steadyUploadSliceSpeeds: number[] = [];

  const upTarget = server.upUrl || 'https://speed.cloudflare.com/__up';
  const chunkBuffer1MB = createHighEntropyBuffer(1024 * 1024);
  const chunkBuffer256KB = createHighEntropyBuffer(256 * 1024);

  const uploadWorker = async (_workerId: number) => {
    while (!callbacks.isCancelled() && performance.now() - startTime < DURATION_MS) {
      const currentBuffer =
        performance.now() - startTime < UPLOAD_WARMUP_MS ? chunkBuffer256KB : chunkBuffer1MB;

      const res = await uploadStreamXHR(
        upTarget,
        currentBuffer,
        (bytesDelta) => {
          totalUploadedBytes += bytesDelta;
          windowUpBytes += bytesDelta;
        },
        () => callbacks.isCancelled() || performance.now() - startTime >= DURATION_MS
      );

      if (!res.success && !callbacks.isCancelled()) {
        await uploadStreamXHR(
          '/api/upload',
          currentBuffer,
          (bytesDelta) => {
            totalUploadedBytes += bytesDelta;
            windowUpBytes += bytesDelta;
          },
          () => callbacks.isCancelled() || performance.now() - startTime >= DURATION_MS
        );
      }
    }
  };

  const uploadWorkers = [uploadWorker(0), uploadWorker(1), uploadWorker(2)];

  while (!callbacks.isCancelled() && performance.now() - startTime < DURATION_MS) {
    await new Promise((r) => setTimeout(r, 75));
    const now = performance.now();
    const elapsedTotalSec = (now - startTime) / 1000;
    const windowDeltaSec = (now - windowStartTime) / 1000;

    if (!hasEnteredSteadyUpload && now - startTime >= UPLOAD_WARMUP_MS) {
      hasEnteredSteadyUpload = true;
      steadyUploadStartTime = now;
      steadyUploadStartBytes = totalUploadedBytes;
    }

    if (windowDeltaSec > 0.12) {
      const instantUpSpeedMbps = (windowUpBytes * 8) / (1024 * 1024) / windowDeltaSec;
      let currentUpThroughputMbps = 0;

      if (hasEnteredSteadyUpload && steadyUploadStartTime > 0) {
        const steadyDurationSec = (now - steadyUploadStartTime) / 1000;
        const steadyBytes = totalUploadedBytes - steadyUploadStartBytes;
        currentUpThroughputMbps =
          steadyDurationSec > 0
            ? (steadyBytes * 8) / (1024 * 1024) / steadyDurationSec
            : instantUpSpeedMbps;
        steadyUploadSliceSpeeds.push(instantUpSpeedMbps);
      } else {
        currentUpThroughputMbps =
          elapsedTotalSec > 0
            ? (totalUploadedBytes * 8) / (1024 * 1024) / elapsedTotalSec
            : instantUpSpeedMbps;
      }

      const displayUpSpeed =
        instantUpSpeedMbps > 0
          ? currentUpThroughputMbps * 0.7 + instantUpSpeedMbps * 0.3
          : currentUpThroughputMbps;

      peakUploadMbps = Math.max(peakUploadMbps, displayUpSpeed);
      const progressPct = 65 + Math.min((elapsedTotalSec / (DURATION_MS / 1000)) * 33, 33);

      callbacks.onProgress(displayUpSpeed, progressPct, totalUploadedBytes, hasEnteredSteadyUpload);

      windowUpBytes = 0;
      windowStartTime = now;
    }
  }

  await Promise.allSettled(uploadWorkers);

  let finalUploadSpeed = peakUploadMbps;
  if (hasEnteredSteadyUpload && steadyUploadStartTime > 0) {
    const steadyDurationSec = (performance.now() - steadyUploadStartTime) / 1000;
    const steadyBytes = totalUploadedBytes - steadyUploadStartBytes;
    const sustainedUpThroughput =
      steadyDurationSec > 0
        ? (steadyBytes * 8) / (1024 * 1024) / steadyDurationSec
        : peakUploadMbps;
    const peak90th = computePercentile(steadyUploadSliceSpeeds, 0.90);
    finalUploadSpeed =
      peak90th > 0 ? sustainedUpThroughput * 0.85 + peak90th * 0.15 : sustainedUpThroughput;
  } else {
    const totalElapsedSec = (performance.now() - startTime) / 1000;
    finalUploadSpeed =
      totalElapsedSec > 0
        ? (totalUploadedBytes * 8) / (1024 * 1024) / totalElapsedSec
        : peakUploadMbps;
  }

  return {
    speedMbps: parseFloat(finalUploadSpeed.toFixed(1)),
    transferredBytes: totalUploadedBytes,
  };
}
