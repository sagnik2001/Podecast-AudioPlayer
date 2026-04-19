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
  const hasProgress = episode.progress > 0.02 && episode.progress < 0.98;
  const showFooter = hasProgress || Boolean(episode.tag) || Boolean(episode.duration);

  return (
    <TouchableOpacity activeOpacity={0.86} style={styles.card}>
      <CoverArt
        accent={episode.accent}
        imageUrl={episode.imageUrl}
        phase={episode.phase}
        size={compact ? 64 : 76}
      />
      <View style={styles.content}>
        <Text numberOfLines={1} style={[styles.show, {color: episode.accent}]}>
          {episode.show}
        </Text>
        <Text numberOfLines={2} style={styles.title}>
          {episode.title}
        </Text>
        {!compact ? (
          <Text numberOfLines={2} style={styles.description}>
            {episode.description}
          </Text>
        ) : null}
        {showFooter ? (
          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <View style={styles.metaDot} />
              <Text style={styles.metaText}>{episode.duration || 'Audio'}</Text>
            </View>
            {episode.downloaded ? (
              <View style={[styles.metaPill, styles.metaPillSoft]}>
                <Text style={styles.metaText}>Saved</Text>
              </View>
            ) : episode.tag ? (
              <Text numberOfLines={1} style={styles.metaTag}>
                {episode.tag}
              </Text>
            ) : null}
          </View>
        ) : null}
        {hasProgress ? (
          <View style={styles.progressWrap}>
            <ProgressBar accent={episode.accent} height={3} progress={episode.progress} />
            <Text style={styles.progressText}>
              {Math.round(episode.progress * 100)}%
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.playButton}>
        <Text style={styles.playGlyph}>▶</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 18,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  show: {
    color: colors.brand,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 21,
    marginTop: 6,
  },
  description: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    marginTop: 6,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  metaPill: {
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  metaPillSoft: {
    backgroundColor: colors.brandTint,
  },
  metaDot: {
    backgroundColor: colors.brand,
    borderRadius: 999,
    height: 5,
    width: 5,
  },
  metaText: {
    color: colors.inkSoft,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  metaTag: {
    color: colors.dim,
    flexShrink: 1,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  progressWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  progressText: {
    color: colors.dim,
    fontSize: 11,
    fontWeight: '700',
  },
  playButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.brand,
    borderRadius: 999,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  playGlyph: {
    color: colors.background,
    fontSize: 13,
    fontWeight: '900',
    marginLeft: 2,
  },
});
