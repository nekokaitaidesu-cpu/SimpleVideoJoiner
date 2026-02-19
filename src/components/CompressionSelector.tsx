import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CompressionLevel } from '../types';
import { COMPRESSION_PRESETS } from '../constants/compression';

interface Props {
  value: CompressionLevel;
  onChange: (level: CompressionLevel) => void;
}

const LEVELS: CompressionLevel[] = ['low', 'medium', 'high'];

export default function CompressionSelector({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>圧縮レベル</Text>
      <View style={styles.buttons}>
        {LEVELS.map((level) => {
          const preset = COMPRESSION_PRESETS[level];
          const active = value === level;
          return (
            <TouchableOpacity
              key={level}
              onPress={() => onChange(level)}
              style={[styles.btn, active && styles.activeBtn]}
            >
              <Text style={[styles.btnLabel, active && styles.activeBtnLabel]}>
                {level === 'low' ? '低' : level === 'medium' ? '中' : '高'}
              </Text>
              <Text style={[styles.btnDesc, active && styles.activeBtnLabel]}>
                {preset.description}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  title: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 8,
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2d2d4e',
  },
  activeBtn: {
    borderColor: '#6c63ff',
    backgroundColor: '#2a2a5e',
  },
  btnLabel: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: '700',
  },
  activeBtnLabel: {
    color: '#fff',
  },
  btnDesc: {
    color: '#666',
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
});
