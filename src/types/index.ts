export interface VideoItem {
  id: string;
  uri: string;
  filename: string;
  duration: number; // seconds
  size: number;     // bytes
}

export type CompressionLevel = 'low' | 'medium' | 'high';

export interface CompressionPreset {
  label: string;
  crf: number;
  audioBitrate: string;
  description: string;
}

export interface JoinProgress {
  percent: number;
  timeMs: number;
  speed: number;
  isRunning: boolean;
}

export interface EstimateResult {
  estimatedSizeMB: number;
  estimatedDurationSec: number;
}
