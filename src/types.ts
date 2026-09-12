export type SpeedUnit = 'Mbps' | 'MB/s' | 'Gbps';

export type BenchmarkStage = 'idle' | 'ping' | 'download' | 'upload' | 'completed';

export type WaveformTab = 'down' | 'up' | 'jitter';

export type ConnectionType = 'All' | 'Wi-Fi' | 'Ethernet';

export interface ServerNode {
  id: string;
  name: string;
  location: string;
  provider: string;
  capacity: string;
  basePing: number;
  ip: string;
  pingUrl?: string;
  downUrl?: string;
  upUrl?: string;
  colo?: string;
  type?: 'edge' | 'cloudrun' | 'custom';
}

export interface ClientNetworkInfo {
  ip: string;
  isp: string;
  city: string;
  country: string;
  countryCode: string;
  region: string;
  asn: string | number;
  colo: string;
  isIpv6: boolean;
  rawBytesDownloaded: number;
  rawBytesUploaded: number;
}

export interface BenchmarkRecord {
  _id: string;
  timestamp: string;
  server: string;
  serverNodeName: string;
  connectionType: 'Wi-Fi' | 'Ethernet';
  ping: number;
  jitter: number;
  download: number; // in Mbps
  upload: number; // in Mbps
  loss: number;
  classification: 'Ultra 4K Stream' | 'Full HD / Gaming' | 'SD Streaming' | 'Gigabit Hyper';
}

export interface TelemetryStats {
  avgDownload: number;
  avgUpload: number;
  bestLatency: number;
  totalBenchmarks: number;
}
