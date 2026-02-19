import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { VideoItem } from '../types';
import { formatDuration, formatBytes } from '../utils/videoUtils';

interface Props {
  item: VideoItem;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

export default function VideoListItem({
  item,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onRemove,
}: Props) {
  const name =
    item.filename.length > 28
      ? item.filename.slice(0, 25) + '...'
      : item.filename;

  return (
    <View style={styles.container}>
      <View style={styles.orderButtons}>
        <TouchableOpacity
          onPress={onMoveUp}
          disabled={index === 0}
          style={[styles.orderBtn, index === 0 && styles.disabledBtn]}
        >
          <Text style={styles.orderBtnText}>▲</Text>
        </TouchableOpacity>
        <Text style={styles.indexText}>{index + 1}</Text>
        <TouchableOpacity
          onPress={onMoveDown}
          disabled={index === total - 1}
          style={[styles.orderBtn, index === total - 1 && styles.disabledBtn]}
        >
          <Text style={styles.orderBtnText}>▼</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.filename} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.meta}>
          {formatDuration(item.duration)}  ·  {formatBytes(item.size)}
        </Text>
      </View>

      <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
        <Text style={styles.removeBtnText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 8,
    padding: 10,
    marginVertical: 4,
  },
  orderButtons: {
    alignItems: 'center',
    marginRight: 10,
  },
  orderBtn: {
    padding: 4,
  },
  disabledBtn: {
    opacity: 0.2,
  },
  orderBtnText: {
    color: '#6c63ff',
    fontSize: 14,
  },
  indexText: {
    color: '#666',
    fontSize: 12,
    marginVertical: 2,
  },
  info: {
    flex: 1,
  },
  filename: {
    color: '#e0e0e0',
    fontSize: 14,
    fontWeight: '600',
  },
  meta: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  removeBtn: {
    padding: 8,
  },
  removeBtnText: {
    color: '#e05c5c',
    fontSize: 16,
  },
});
