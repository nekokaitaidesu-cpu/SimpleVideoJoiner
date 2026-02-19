import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EstimateResult } from '../types';
import { formatDuration } from '../utils/videoUtils';

interface Props {
  estimate: EstimateResult;
}

export default function EstimateDisplay({ estimate }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <Text style={styles.label}>推定時間</Text>
        <Text style={styles.value}>
          {formatDuration(estimate.estimatedDurationSec)}
        </Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.item}>
        <Text style={styles.label}>推定サイズ</Text>
        <Text style={styles.value}>{estimate.estimatedSizeMB} MB</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#16213e',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    color: '#888',
    fontSize: 12,
  },
  value: {
    color: '#e0e0e0',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: '#2d2d4e',
    marginHorizontal: 8,
  },
});
