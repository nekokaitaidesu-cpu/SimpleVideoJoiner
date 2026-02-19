import * as FileSystem from 'expo-file-system';
import { VideoItem, CompressionLevel, JoinProgress } from '../types';
import { generateOutputFilename } from './videoUtils';
import { joinVideosNative } from '../../modules/video-joiner/src';

/**
 * Joins multiple videos using Android's MediaExtractor + MediaMuxer.
 * No external libraries — uses Android SDK built-in APIs.
 * Requires videos with the same codec (H.264 + AAC = standard for Android cameras).
 */
export async function joinVideos(
  videos: VideoItem[],
  _compression: CompressionLevel,
  onProgress: (p: JoinProgress) => void
): Promise<string> {
  if (videos.length < 2) throw new Error('2本以上の動画が必要です。');

  onProgress({ percent: 10, timeMs: 0, speed: 0, isRunning: true });

  const outputFilename = generateOutputFilename();
  // MediaMuxer needs a plain path (no file:// prefix)
  const outputPath = `${FileSystem.cacheDirectory}${outputFilename}`.replace('file://', '/');

  onProgress({ percent: 20, timeMs: 0, speed: 0, isRunning: true });

  const inputUris = videos.map((v) => v.uri);
  await joinVideosNative(inputUris, outputPath);

  onProgress({ percent: 100, timeMs: 0, speed: 0, isRunning: false });

  // Return with file:// prefix for expo-media-library
  return `file://${outputPath}`;
}

export async function cancelJoin(): Promise<void> {
  // MediaMuxer join is synchronous — cancellation not supported
}
