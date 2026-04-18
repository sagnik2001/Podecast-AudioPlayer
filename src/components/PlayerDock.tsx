import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {Episode} from '../data/episodes';
import {colors} from '../theme/colors';
import {CoverArt} from './CoverArt';
import {ProgressBar} from './ProgressBar';

type PlayerDockProps = {
  episode: Episode;
};

export function PlayerDock({episode}: PlayerDockProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <CoverArt accent={episode.accent} phase="Live" size={54} />
        <View style={styles.meta}>
          <Text numberOfLines={1} style={styles.label}>
            From {episode.show}
          </Text>
          <Text numberOfLines={1} style={styles.title}>
            {episode.title}
          </Text>
        </View>
        <TouchableOpacity activeOpacity={0.75} style={styles.skipButton}>
          <Text style={styles.skipText}>-15</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.75} style={styles.playButton}>
          <Text style={styles.playText}>Pause</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.progressRow}>
        <Text style={styles.time}>24:18</Text>
        <ProgressBar progress={episode.progress} height={4} />
        <Text style={styles.time}>38:00</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#17221d',
    borderColor: '#284a39',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  meta: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    marginBottom: 3,
  },
  title: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0,
  },
  skipButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 46,
  },
  skipText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
  },
  playButton: {
    alignItems: 'center',
    backgroundColor: colors.brand,
    borderRadius: 8,
    height: 46,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  playText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
  },
  progressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  time: {
    color: colors.dim,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0,
  },
});
