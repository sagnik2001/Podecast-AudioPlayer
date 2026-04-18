import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {Episode} from '../data/episodes';
import {colors} from '../theme/colors';
import {CoverArt} from './CoverArt';
import {ProgressBar} from './ProgressBar';

type EpisodeCardProps = {
  episode: Episode;
  compact?: boolean;
};

export function EpisodeCard({episode, compact = false}: EpisodeCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.82} style={[styles.card, compact && styles.compact]}>
      <CoverArt
        accent={episode.accent}
        imageUrl={episode.imageUrl}
        phase={episode.phase}
        size={compact ? 72 : 88}
      />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.show, {color: episode.accent}]}>{episode.show}</Text>
          <Text style={styles.duration}>{episode.duration}</Text>
        </View>
        <Text numberOfLines={2} style={styles.title}>
          {episode.title}
        </Text>
        <Text numberOfLines={2} style={styles.description}>
          {episode.description}
        </Text>
        <View style={styles.footer}>
          <ProgressBar progress={episode.progress} accent={episode.accent} />
          <Text style={styles.downloaded}>{episode.downloaded ? 'Offline' : episode.tag}</Text>
        </View>
      </View>
      <Text style={styles.more}>...</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 12,
    padding: 10,
  },
  compact: {
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  show: {
    color: colors.brand,
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
    marginRight: 8,
  },
  duration: {
    color: colors.dim,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
  },
  title: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0,
    marginTop: 5,
  },
  description: {
    color: colors.muted,
    fontSize: 13,
    letterSpacing: 0,
    lineHeight: 18,
    marginTop: 5,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  downloaded: {
    color: colors.dim,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
  },
  more: {
    color: colors.dim,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0,
    marginLeft: 2,
    marginTop: -26,
  },
});
