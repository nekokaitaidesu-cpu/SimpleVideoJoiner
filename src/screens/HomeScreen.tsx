import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { AVPlaybackStatus, Video } from 'expo-av';

import VideoListItem from '../components/VideoListItem';
import CompressionSelector from '../components/CompressionSelector';
import EstimateDisplay from '../components/EstimateDisplay';
import ProgressBar from '../components/ProgressBar';

import { joinVideos, cancelJoin } from '../utils/ffmpegUtils';
import { estimateOutput } from '../utils/videoUtils';
import { requestMediaPermissions } from '../utils/permissionsUtils';

import { VideoItem, CompressionLevel, JoinProgress } from '../types';

export default function HomeScreen() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [compression, setCompression] = useState<CompressionLevel>('medium');
  const [progress, setProgress] = useState<JoinProgress>({
    percent: 0,
    timeMs: 0,
    speed: 0,
    isRunning: false,
  });
  const [isJoining, setIsJoining] = useState(false);

  const handleAddVideos = useCallback(async () => {
    const granted = await requestMediaPermissions();
    if (!granted) {
      Alert.alert(
        '権限エラー',
        '動画の選択・保存にはメディアへのアクセス権限が必要です。\n設定アプリから許可してください。'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (result.canceled) return;

    const newItems: VideoItem[] = await Promise.all(
      result.assets.map(async (asset) => {
        const info = await FileSystem.getInfoAsync(asset.uri, { size: true });
        const sizeBytes = (info as any).size ?? 0;
        const durationSec = asset.duration ? asset.duration / 1000 : 0;
        const parts = asset.uri.split('/');
        const filename = parts[parts.length - 1] || 'video.mp4';

        return {
          id: `${Date.now()}_${Math.random()}`,
          uri: asset.uri,
          filename,
          duration: durationSec,
          size: sizeBytes,
        };
      })
    );

    setVideos((prev) => [...prev, ...newItems]);
  }, []);

  const handleMoveUp = useCallback((index: number) => {
    setVideos((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }, []);

  const handleMoveDown = useCallback((index: number) => {
    setVideos((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }, []);

  const handleRemove = useCallback((id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const handleJoin = useCallback(async () => {
    if (videos.length < 2) {
      Alert.alert('動画が不足しています', '2本以上の動画を追加してください。');
      return;
    }

    setIsJoining(true);
    setProgress({ percent: 0, timeMs: 0, speed: 0, isRunning: true });

    try {
      const outputUri = await joinVideos(videos, compression, (p) => {
        setProgress(p);
      });

      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(outputUri);
      await MediaLibrary.createAlbumAsync('SimpleVideoJoiner', asset, false);

      // Clean up cache file
      await FileSystem.deleteAsync(outputUri, { idempotent: true });

      Alert.alert(
        '完了',
        '動画の結合が完了しました。\nギャラリーの「SimpleVideoJoiner」アルバムに保存されました。'
      );
    } catch (err: any) {
      Alert.alert('エラー', err.message ?? '不明なエラーが発生しました。');
    } finally {
      setIsJoining(false);
      setProgress({ percent: 0, timeMs: 0, speed: 0, isRunning: false });
    }
  }, [videos, compression]);

  const handleCancel = useCallback(async () => {
    await cancelJoin();
    setIsJoining(false);
    setProgress({ percent: 0, timeMs: 0, speed: 0, isRunning: false });
  }, []);

  const estimate = estimateOutput(videos, compression);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Simple Video Joiner</Text>
        <Text style={styles.headerSub}>動画を結合してギャラリーに保存</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Video list */}
        {videos.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>動画を追加してください</Text>
          </View>
        ) : (
          <>
            {videos.map((v, i) => (
              <VideoListItem
                key={v.id}
                item={v}
                index={i}
                total={videos.length}
                onMoveUp={() => handleMoveUp(i)}
                onMoveDown={() => handleMoveDown(i)}
                onRemove={() => handleRemove(v.id)}
              />
            ))}

            {/* Estimate */}
            <EstimateDisplay estimate={estimate} />
          </>
        )}

        {/* Compression */}
        <CompressionSelector value={compression} onChange={setCompression} />

        {/* Progress */}
        {isJoining && (
          <ProgressBar percent={progress.percent} speed={progress.speed} />
        )}

        {/* Spacer for button */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Bottom action area */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={handleAddVideos}
          disabled={isJoining}
        >
          <Text style={styles.addBtnText}>＋ 動画を追加</Text>
        </TouchableOpacity>

        {isJoining ? (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <ActivityIndicator color="#fff" size="small" style={{ marginRight: 8 }} />
            <Text style={styles.joinBtnText}>キャンセル</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.joinBtn, videos.length < 2 && styles.disabledBtn]}
            onPress={handleJoin}
            disabled={videos.length < 2}
          >
            <Text style={styles.joinBtnText}>
              結合する ({videos.length}本)
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d4e',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  headerSub: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyBox: {
    borderWidth: 1,
    borderColor: '#2d2d4e',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginVertical: 16,
  },
  emptyText: {
    color: '#555',
    fontSize: 15,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#2d2d4e',
    backgroundColor: '#1a1a2e',
  },
  addBtn: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6c63ff',
  },
  addBtnText: {
    color: '#6c63ff',
    fontSize: 15,
    fontWeight: '600',
  },
  joinBtn: {
    flex: 2,
    backgroundColor: '#6c63ff',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtn: {
    flex: 2,
    backgroundColor: '#c0392b',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabledBtn: {
    opacity: 0.4,
  },
  joinBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
