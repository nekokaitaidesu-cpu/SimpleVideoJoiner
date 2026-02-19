package expo.modules.videojoiner

import android.media.MediaCodec
import android.media.MediaExtractor
import android.media.MediaFormat
import android.media.MediaMuxer
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.nio.ByteBuffer

class VideoJoinerModule : Module() {

  override fun definition() = ModuleDefinition {
    Name("VideoJoiner")

    /**
     * Joins multiple video files into one MP4.
     * Uses Android's MediaExtractor + MediaMuxer (no external dependencies).
     * Requires all videos to share the same codec (H.264 + AAC is standard).
     */
    AsyncFunction("joinVideos") { inputUris: List<String>, outputPath: String ->
      joinVideos(inputUris, outputPath)
      outputPath
    }
  }

  private fun joinVideos(inputUris: List<String>, outputPath: String) {
    val muxer = MediaMuxer(outputPath, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)
    var muxerStarted = false
    var videoMuxerTrack = -1
    var audioMuxerTrack = -1
    var videoTimeOffsetUs = 0L
    var audioTimeOffsetUs = 0L

    try {
      for (uri in inputUris) {
        val path = uri.removePrefix("file://")
        val extractor = MediaExtractor()
        extractor.setDataSource(path)

        var videoTrack = -1
        var audioTrack = -1
        var videoDurationUs = 0L
        var audioDurationUs = 0L

        for (i in 0 until extractor.trackCount) {
          val format = extractor.getTrackFormat(i)
          val mime = format.getString(MediaFormat.KEY_MIME) ?: continue
          if (mime.startsWith("video/") && videoTrack < 0) {
            videoTrack = i
            videoDurationUs = if (format.containsKey(MediaFormat.KEY_DURATION))
              format.getLong(MediaFormat.KEY_DURATION) else 0L
          }
          if (mime.startsWith("audio/") && audioTrack < 0) {
            audioTrack = i
            audioDurationUs = if (format.containsKey(MediaFormat.KEY_DURATION))
              format.getLong(MediaFormat.KEY_DURATION) else 0L
          }
        }

        // Add tracks to muxer only on first file
        if (!muxerStarted) {
          if (videoTrack >= 0) {
            videoMuxerTrack = muxer.addTrack(extractor.getTrackFormat(videoTrack))
          }
          if (audioTrack >= 0) {
            audioMuxerTrack = muxer.addTrack(extractor.getTrackFormat(audioTrack))
          }
          muxer.start()
          muxerStarted = true
        }

        val buffer = ByteBuffer.allocate(1 * 1024 * 1024) // 1MB
        val info = MediaCodec.BufferInfo()

        // Copy video samples
        if (videoTrack >= 0 && videoMuxerTrack >= 0) {
          extractor.selectTrack(videoTrack)
          extractor.seekTo(0, MediaExtractor.SEEK_TO_CLOSEST_SYNC)
          var maxTs = 0L
          while (true) {
            buffer.clear()
            val size = extractor.readSampleData(buffer, 0)
            if (size < 0) break
            info.presentationTimeUs = extractor.sampleTime + videoTimeOffsetUs
            info.size = size
            info.flags = extractor.sampleFlags
            info.offset = 0
            if (info.presentationTimeUs > maxTs) maxTs = info.presentationTimeUs
            muxer.writeSampleData(videoMuxerTrack, buffer, info)
            extractor.advance()
          }
          extractor.unselectTrack(videoTrack)
          // Advance offset by duration (or last timestamp + 1 frame at 30fps)
          videoTimeOffsetUs += if (videoDurationUs > 0) videoDurationUs else (maxTs + 33333L)
        }

        // Copy audio samples
        if (audioTrack >= 0 && audioMuxerTrack >= 0) {
          extractor.selectTrack(audioTrack)
          extractor.seekTo(0, MediaExtractor.SEEK_TO_CLOSEST_SYNC)
          var maxTs = 0L
          while (true) {
            buffer.clear()
            val size = extractor.readSampleData(buffer, 0)
            if (size < 0) break
            info.presentationTimeUs = extractor.sampleTime + audioTimeOffsetUs
            info.size = size
            info.flags = extractor.sampleFlags
            info.offset = 0
            if (info.presentationTimeUs > maxTs) maxTs = info.presentationTimeUs
            muxer.writeSampleData(audioMuxerTrack, buffer, info)
            extractor.advance()
          }
          extractor.unselectTrack(audioTrack)
          audioTimeOffsetUs += if (audioDurationUs > 0) audioDurationUs else (maxTs + 23220L)
        }

        extractor.release()
      }
    } finally {
      if (muxerStarted) muxer.stop()
      muxer.release()
    }
  }
}
