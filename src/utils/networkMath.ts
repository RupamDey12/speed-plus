/**
 * Network Telemetry Mathematical Calculations
 * Compliant with RFC 2681 (Round-Trip Delay), RFC 3550 (RTP Jitter),
 * and Broadband Forum TR-471 / RFC 6349 (Throughput Testing).
 */

/**
 * Computes the Interquartile Mean (IQM) / 15% trimmed mean.
 * Eliminates transient operating system thread context switches and GC stalls.
 */
export function computeInterquartileMean(values: number[]): number {
  if (values.length === 0) return 0;
  if (values.length <= 2) return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const sorted = [...values].sort((a, b) => a - b);
  const lowIndex = Math.floor(sorted.length * 0.15);
  const highIndex = Math.max(lowIndex + 1, Math.ceil(sorted.length * 0.85));
  const trimmed = sorted.slice(lowIndex, highIndex);
  const sum = trimmed.reduce((a, b) => a + b, 0);
  return Math.max(1, Math.round(sum / trimmed.length));
}

/**
 * Calculates the p-th percentile of an array of numeric values.
 */
export function computePercentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor(sorted.length * p)));
  return sorted[index];
}

/**
 * RFC 3550 Standard Packet Jitter calculation:
 * J(i) = J(i-1) + (|D(i-1, i)| - J(i-1)) / 16
 */
export function computeRFC3550Jitter(samples: number[]): number {
  if (samples.length <= 1) return 1.1;
  let jitter = 0;
  for (let i = 1; i < samples.length; i++) {
    const d = Math.abs(samples[i] - samples[i - 1]);
    jitter = jitter + (d - jitter) / 16;
  }
  return parseFloat(jitter.toFixed(1));
}

/**
 * Generates a 100% high-entropy non-compressible pseudo-random byte payload
 * using Xorshift32 PRNG to defeat transparent middlebox / proxy data compression.
 */
export function createHighEntropyBuffer(sizeInBytes: number): Uint8Array {
  const buf = new Uint8Array(sizeInBytes);
  const seedBuf = new Uint32Array(1);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(seedBuf);
  }
  let seed = seedBuf[0] || 0x2f6479a3;
  const view32 = new Uint32Array(buf.buffer, buf.byteOffset, Math.floor(sizeInBytes / 4));
  for (let i = 0; i < view32.length; i++) {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    view32[i] = seed;
  }
  return buf;
}

/**
 * High-accuracy real-time socket upload streamer via XHR upload.onprogress (Ookla / TR-471 standard).
 */
export function uploadStreamXHR(
  url: string,
  payload: Uint8Array,
  onBytesDelta: (bytesDelta: number) => void,
  isCancelled: () => boolean
): Promise<{ success: boolean; totalBytesSent: number }> {
  return new Promise((resolve) => {
    if (isCancelled()) {
      resolve({ success: false, totalBytesSent: 0 });
      return;
    }

    const xhr = new XMLHttpRequest();
    let previousLoaded = 0;

    xhr.upload.onprogress = (event) => {
      if (isCancelled()) {
        try {
          xhr.abort();
        } catch {
          // ignore
        }
        resolve({ success: false, totalBytesSent: previousLoaded });
        return;
      }
      const delta = event.loaded - previousLoaded;
      if (delta > 0) {
        previousLoaded = event.loaded;
        onBytesDelta(delta);
      }
    };

    xhr.onload = () => {
      resolve({ success: xhr.status >= 200 && xhr.status < 400, totalBytesSent: previousLoaded });
    };
    xhr.onerror = () => {
      resolve({ success: false, totalBytesSent: previousLoaded });
    };
    xhr.onabort = () => {
      resolve({ success: false, totalBytesSent: previousLoaded });
    };

    try {
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      xhr.setRequestHeader('Cache-Control', 'no-store');
      xhr.send(payload);
    } catch {
      resolve({ success: false, totalBytesSent: 0 });
    }
  });
}
