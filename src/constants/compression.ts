import { CompressionLevel, CompressionPreset } from '../types';

export const COMPRESSION_PRESETS: Record<CompressionLevel, CompressionPreset> = {
  low: {
    label: '低圧縮 (高画質)',
    crf: 18,
    audioBitrate: '192k',
    description: 'ファイルサイズ大・高品質',
  },
  medium: {
    label: '中圧縮 (バランス)',
    crf: 23,
    audioBitrate: '128k',
    description: 'バランスの取れた設定',
  },
  high: {
    label: '高圧縮 (小ファイル)',
    crf: 28,
    audioBitrate: '96k',
    description: 'ファイルサイズ小・品質低下あり',
  },
};

// Size multiplier relative to original (approximate)
export const COMPRESSION_SIZE_FACTOR: Record<CompressionLevel, number> = {
  low: 1.0,
  medium: 0.65,
  high: 0.35,
};
