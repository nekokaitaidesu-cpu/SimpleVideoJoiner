import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  percent: number;
  speed: number;
}

export default function ProgressBar({ percent, speed }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${percent}%` }]} />
      </View>
      <View style={styles.row}>
        <Text style={styles.percentText}>{percent}%</Text>
        {speed > 0 && (
          <Text style={styles.speedText}>{speed.toFixed(2)}x</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  barBackground: {
    height: 10,
    backgroundColor: '#2d2d4e',
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#6c63ff',
    borderRadius: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  percentText: {
    color: '#aaa',
    fontSize: 13,
  },
  speedText: {
    color: '#aaa',
    fontSize: 13,
  },
});
