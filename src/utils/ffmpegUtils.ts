import { FFmpegKit, FFmpegKitConfig, ReturnCode, Statistics } from 'ffmpeg-kit-react-native';
import * as FileSystem from 'expo-file-system';
import { VideoItem, CompressionLevel, JoinProgress } from '../types';
import { COMPRESSION_PRESETS } from '../constants/compression';
import { generateOutputFilename } from './videoUtils';

/**
 * Writes a concat list file for ffmpeg concat demuxer.
 * Each line: file '/absolute/path/to/video.mp4'
 */
async function writeConcatFile(videos: VideoItem[]): Promise<string> {
  const listPath = `${FileSystem.cacheDirectory}concat_list.txt`;
  const lines = videos.map((v) => `file '${v.uri.replace(/^file:\/\//, '')}'`);
  await FileSystem.writeAsStringAsync(listPath, lines.join('\n'));
  return listPath;
}

/**
 * Joins multiple videos using ffmpeg concat demuxer with re-encoding.
 *
 * @param videos - ordered list of video items
 * @param compression - compression level preset
 * @param onProgress - callback receiving progress 0–100
 * @returns output file URI on success, throws on failure
 */
export async function joinVideos(
  videos: VideoItem[],
  compression: CompressionLevel,
  onProgress: (progress: JoinProgress) => void
): Promise<string> {
  if (videos.length < 2) {
    throw new Error('結合するには2本以上の動画が必要です。');
  }

  const preset = COMPRESSION_PRESETS[compression];
  const concatListPath = await writeConcatFile(videos);
  const outputFilename = generateOutputFilename();
  const outputPath = `${FileSystem.cacheDirectory}${outputFilename}`;

  // Total duration for progress calculation
  const totalDurationSec = videos.reduce((sum, v) => sum + v.duration, 0);

  // Enable statistics callback
  FFmpegKitConfig.enableStatisticsCallback((stats: Statistics) => {
    const timeMs = stats.getTime();
    const timeSec = timeMs / 1000;
    const percent =
      totalDurationSec > 0
        ? Math.min(100, Math.round((timeSec / totalDurationSec) * 100))
        : 0;
    const speed = stats.getSpeed();

    onProgress({
      percent,
      timeMs,
      speed,
      isRunning: true,
    });
  });

  // Build ffmpeg command:
  // -f concat -safe 0 -i list.txt
  // -c:v libx264 -crf <CRF> -preset fast
  // -c:a aac -b:a <BITRATE>
  // -movflags +faststart
  // output.mp4
  const command = [
    '-f', 'concat',
    '-safe', '0',
    '-i', concatListPath,
    '-c:v', 'libx264',
    '-crf', String(preset.crf),
    '-preset', 'fast',
    '-c:a', 'aac',
    '-b:a', preset.audioBitrate,
    '-movflags', '+faststart',
    '-y',
    outputPath,
  ].join(' ');

  const session = await FFmpegKit.execute(command);
  const returnCode = await session.getReturnCode();

  // Clean up concat list
  await FileSystem.deleteAsync(concatListPath, { idempotent: true });

  if (!ReturnCode.isSuccess(returnCode)) {
    const logs = await session.getAllLogsAsString();
    throw new Error(`FFmpeg処理に失敗しました。\n${logs}`);
  }

  onProgress({ percent: 100, timeMs: totalDurationSec * 1000, speed: 0, isRunning: false });

  return outputPath;
}

export async function cancelJoin(): Promise<void> {
  await FFmpegKit.cancel();
}
