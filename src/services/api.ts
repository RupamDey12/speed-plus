import { BenchmarkRecord } from '../types';

const STORAGE_KEY = 'speedpulse_telemetry_history';

const SEED_RECORDS: BenchmarkRecord[] = [
  {
    _id: 'cf_edge_' + Math.random().toString(16).slice(2, 8),
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    server: 'Auto Nearest Edge (Anycast CDN)',
    serverNodeName: 'Auto Nearest Edge (Anycast CDN)',
    connectionType: 'Ethernet',
    ping: 14,
    jitter: 1.1,
    download: 312.4,
    upload: 78.6,
    loss: 0,
    classification: 'Ultra 4K Stream',
  },
  {
    _id: 'cr_asia_' + Math.random().toString(16).slice(2, 8),
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    server: 'SpeedPulse Gateway (Cloud Run Singapore)',
    serverNodeName: 'SpeedPulse Gateway (Cloud Run Singapore)',
    connectionType: 'Wi-Fi',
    ping: 28,
    jitter: 2.3,
    download: 164.8,
    upload: 48.2,
    loss: 0,
    classification: 'Ultra 4K Stream',
  },
];

/**
 * Loads benchmark history from backend API with localStorage fallback.
 */
export async function fetchHistoryResults(): Promise<BenchmarkRecord[]> {
  try {
    const res = await fetch('/api/results');
    if (res.ok) {
      const json = await res.json();
      if (json && json.data && json.data.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(json.data));
        return json.data;
      }
    }
  } catch {
    // Fallback to local cache
  }

  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // Ignore JSON parse error
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_RECORDS));
  return SEED_RECORDS;
}

/**
 * Saves a new benchmark record to backend API and updates local storage.
 */
export async function saveBenchmarkResult(
  record: Omit<BenchmarkRecord, '_id' | 'timestamp'>
): Promise<BenchmarkRecord> {
  let savedEntry: BenchmarkRecord = {
    ...record,
    _id: 'rec_' + Math.random().toString(16).slice(2, 10),
    timestamp: new Date().toISOString(),
  };

  try {
    const res = await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.data) {
        savedEntry = json.data;
      }
    }
  } catch {
    // Continue with local save
  }

  // Update local storage
  const cached = localStorage.getItem(STORAGE_KEY);
  let records: BenchmarkRecord[] = [];
  if (cached) {
    try {
      records = JSON.parse(cached);
    } catch {
      records = [];
    }
  }
  const updated = [savedEntry, ...records].slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  return savedEntry;
}

/**
 * Clears all benchmark records from backend and local storage.
 */
export async function clearHistoryResults(): Promise<void> {
  try {
    await fetch('/api/results', { method: 'DELETE' });
  } catch {
    // Ignore server error
  }
  localStorage.removeItem(STORAGE_KEY);
}
