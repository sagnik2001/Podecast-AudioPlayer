import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {Episode} from '../data/episodes';
import {DownloadStatus} from '../db/models/Download';
import {useDownload} from '../hooks/useDownload';
import {
  cancelDownload,
  enqueueDownload,
  pauseDownload,
  resumeDownload,
} from '../services/downloads';
import {colors} from '../theme/colors';

type DownloadButtonProps = {
  episode: Episode;
  /**
   * 'compact' = stacked icon-over-label, sized to match the play button (used inside EpisodeCard).
   * 'full' = horizontal pill with icon + label inline (used in detail screens / Downloads screen).
   */
  variant?: 'compact' | 'full';
};

type LabelDescriptor = {
  text: string;
  glyph: string;
  bg: string;
  fg: string;
  a11y: string;
};

function describe(
  status: DownloadStatus | undefined,
  progressPct: number,
): LabelDescriptor {
  if (!status) {
    return {
      glyph: '↓',
      text: 'Save',
      bg: colors.brandTint,
      fg: colors.brand,
      a11y: 'Download episode for offline listening',
    };
  }
  if (status === 'pending') {
    return {
      glyph: '…',
      text: 'Queued',
      bg: colors.surfaceHigh,
      fg: colors.ink,
      a11y: 'Queued for download. Tap to pause.',
    };
  }
  if (status === 'downloading') {
    return {
      glyph: '',
      text: `${progressPct}%`,
      bg: colors.surfaceHigh,
      fg: colors.ink,
      a11y: `Downloading ${progressPct} percent. Tap to pause.`,
    };
  }
  if (status === 'completed') {
    return {
      glyph: '✓',
      text: 'Saved',
      bg: colors.brand,
      fg: colors.background,
      a11y: 'Saved offline. Tap to remove.',
    };
  }
  if (status === 'paused') {
    return {
      glyph: '▷',
      text: 'Resume',
      bg: colors.surfaceHigh,
      fg: colors.brand,
      a11y: 'Paused. Tap to resume download.',
    };
  }
  return {
    glyph: '↻',
    text: 'Retry',
    bg: '#3a1a1a',
    fg: '#e57f7f',
    a11y: 'Download failed. Tap to retry.',
  };
}

export function DownloadButton({
  episode,
  variant = 'compact',
}: DownloadButtonProps) {
  const download = useDownload(episode.id);
  const status = download?.status;
  const progressPct = download
    ? Math.round((download.progress || 0) * 100)
    : 0;
  const desc = describe(status, progressPct);

  const onPress = async () => {
    try {
      if (!status) {
        await enqueueDownload(episode);
        return;
      }
      if (status === 'pending' || status === 'downloading') {
        await pauseDownload(episode.id);
        return;
      }
      if (status === 'paused' || status === 'failed') {
        await resumeDownload(episode.id);
        return;
      }
      if (status === 'completed') {
        await cancelDownload(episode.id);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('[downloads] button action failed', episode.id, error);
    }
  };

  if (variant === 'full') {
    return (
      <TouchableOpacity
        accessibilityLabel={desc.a11y}
        activeOpacity={0.82}
        hitSlop={6}
        onPress={onPress}
        style={[styles.fullPill, {backgroundColor: desc.bg}]}>
        {desc.glyph ? (
          <Text style={[styles.fullGlyph, {color: desc.fg}]}>{desc.glyph}</Text>
        ) : null}
        <Text style={[styles.fullLabel, {color: desc.fg}]}>{desc.text}</Text>
        {status === 'downloading' ? (
          <View
            style={[
              styles.progressBar,
              {
                width: `${Math.max(4, progressPct)}%`,
                backgroundColor: colors.brand,
              },
            ]}
          />
        ) : null}
      </TouchableOpacity>
    );
  }

  // compact: vertical icon-over-label, sized to match the round play button.
  return (
    <TouchableOpacity
      accessibilityLabel={desc.a11y}
      activeOpacity={0.82}
      hitSlop={6}
      onPress={onPress}
      style={[styles.compactWrap, {backgroundColor: desc.bg}]}>
      {desc.glyph ? (
        <Text style={[styles.compactGlyph, {color: desc.fg}]}>
          {desc.glyph}
        </Text>
      ) : null}
      <Text
        numberOfLines={1}
        style={[styles.compactLabel, {color: desc.fg}]}>
        {desc.text}
      </Text>
      {status === 'downloading' ? (
        <View
          style={[
            styles.progressBar,
            {
              width: `${Math.max(4, progressPct)}%`,
              backgroundColor: colors.brand,
            },
          ]}
        />
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // compact (vertical, in EpisodeCard)
  compactWrap: {
    alignItems: 'center',
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    minWidth: 56,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 6,
    position: 'relative',
  },
  compactGlyph: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 18,
  },
  compactLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginTop: 2,
  },

  // full (horizontal pill, in Downloads screen / details)
  fullPill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    minHeight: 44,
    overflow: 'hidden',
    paddingHorizontal: 18,
    paddingVertical: 11,
    position: 'relative',
  },
  fullGlyph: {
    fontSize: 16,
    fontWeight: '800',
  },
  fullLabel: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  progressBar: {
    bottom: 0,
    height: 3,
    left: 0,
    opacity: 0.45,
    position: 'absolute',
  },
});
