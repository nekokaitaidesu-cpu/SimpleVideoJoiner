import { VideoItem, CompressionLevel, EstimateResult } from '../types';
import { COMPRESSION_SIZE_FACTOR } from '../constants/compression';

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function estimateOutput(
  videos: VideoItem[],
  compression: CompressionLevel
): EstimateResult {
  const totalSizeBytes = videos.reduce((sum, v) => sum + v.size, 0);
  const totalDurationSec = videos.reduce((sum, v) => sum + v.duration, 0);
  const factor = COMPRESSION_SIZE_FACTOR[compression];

  return {
    estimatedSizeMB: parseFloat(
      ((totalSizeBytes * factor) / (1024 * 1024)).toFixed(1)
    ),
    estimatedDurationSec: totalDurationSec,
  };
}

export function generateOutputFilename(): string {
  const now = new Date();
  const ts = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('');
  return `joined_${ts}.mp4`;
}
