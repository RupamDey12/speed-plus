import { SpeedUnit } from '../types';

/**
 * Formats a speed in Mbps to the desired unit (Mbps, MB/s, Gbps).
 */
export function formatSpeed(mbps: number, unit: SpeedUnit = 'Mbps'): string {
  if (unit === 'MB/s') return (mbps / 8).toFixed(1);
  if (unit === 'Gbps') return (mbps / 1000).toFixed(2);
  return mbps.toFixed(1);
}

/**
 * Classifies benchmark performance category based on download throughput.
 */
export function classifySpeed(
  downloadMbps: number
): 'Ultra 4K Stream' | 'Full HD / Gaming' | 'SD Streaming' | 'Gigabit Hyper' {
  if (downloadMbps >= 500) return 'Gigabit Hyper';
  if (downloadMbps >= 150) return 'Ultra 4K Stream';
  if (downloadMbps >= 50) return 'Full HD / Gaming';
  return 'SD Streaming';
}

/**
 * Evaluates bufferbloat severity and returns grade and descriptive summary.
 */
export function getBufferbloatGrade(ms: number): {
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  label: string;
  color: 'emerald' | 'cyan' | 'amber' | 'orange' | 'rose';
  severity: 'minimal' | 'low' | 'moderate' | 'high' | 'severe' | 'critical';
} {
  if (ms <= 5) return { grade: 'A+', label: 'Pristine Low Queue Delay', color: 'emerald', severity: 'minimal' };
  if (ms <= 15) return { grade: 'A', label: 'Minimal Queuing Delay', color: 'emerald', severity: 'low' };
  if (ms <= 35) return { grade: 'B', label: 'Moderate Bufferbloat', color: 'cyan', severity: 'moderate' };
  if (ms <= 80) return { grade: 'C', label: 'High Bufferbloat Spike', color: 'amber', severity: 'high' };
  if (ms <= 150) return { grade: 'D', label: 'Severe Buffer Bloat', color: 'orange', severity: 'severe' };
  return { grade: 'F', label: 'Critical Queue Saturation', color: 'rose', severity: 'critical' };
}
