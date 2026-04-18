import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {colors} from '../theme/colors';

type CoverArtProps = {
  accent: string;
  phase: string;
  size?: number;
};

export function CoverArt({accent, phase, size = 92}: CoverArtProps) {
  return (
    <View style={[styles.cover, {backgroundColor: accent, width: size, height: size}]}>
      <View style={styles.innerGlow} />
      <View style={styles.ring} />
      <Text style={styles.phase}>{phase}</Text>
      <Text style={styles.mark}>RN</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    borderRadius: 8,
    justifyContent: 'space-between',
    overflow: 'hidden',
    padding: 12,
  },
  innerGlow: {
    backgroundColor: colors.black,
    bottom: 0,
    left: 0,
    opacity: 0.16,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  ring: {
    borderColor: colors.white,
    borderRadius: 999,
    borderWidth: 1,
    height: '72%',
    opacity: 0.24,
    position: 'absolute',
    right: '-22%',
    top: '22%',
    width: '72%',
  },
  phase: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
  },
  mark: {
    alignSelf: 'flex-end',
    color: colors.white,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0,
    opacity: 0.86,
  },
});
