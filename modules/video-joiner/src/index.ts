import { requireNativeModule } from 'expo';

const VideoJoinerNative = requireNativeModule('VideoJoiner');

/**
 * Join multiple video files into one using Android MediaExtractor + MediaMuxer.
 * Requires same codec (H.264 + AAC) — standard for Android camera videos.
 * @param inputUris  Array of file:// URIs
 * @param outputPath Absolute path for the output MP4 (no file:// prefix)
 */
export async function joinVideosNative(
  inputUris: string[],
  outputPath: string
): Promise<string> {
  return VideoJoinerNative.joinVideos(inputUris, outputPath);
}
