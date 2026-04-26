import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {Episode} from '../data/episodes';
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
  size?: 'sm' | 'md';
};

export function DownloadButton({episode, size = 'sm'}: DownloadButtonProps) {
  const download = useDownload(episode.id);
  const status = download?.status;
  const progressPct = download
    ? Math.round((download.progress || 0) * 100)
    : 0;

  const onPress = async () => {
    // eslint-disable-next-line no-console
    console.log(
      '[downloads] button pressed',
      episode.id,
      'currentStatus:',
      status ?? 'none',
      'audioUrl:',
      episode.audioUrl ?? 'NONE',
    );
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

  const dim = size === 'sm';
  const buttonSize = dim ? 32 : 40;

  return (
    <TouchableOpacity
      accessibilityLabel={labelForStatus(status, progressPct)}
      activeOpacity={0.78}
      hitSlop={6}
      onPress={onPress}
      style={[
        styles.button,
        {height: buttonSize, width: buttonSize, borderRadius: buttonSize / 2},
        status === 'completed' && styles.buttonCompleted,
        status === 'failed' && styles.buttonFailed,
      ]}>
      <DownloadGlyph status={status} progressPct={progressPct} small={dim} />
    </TouchableOpacity>
  );
}

function DownloadGlyph({
  status,
  progressPct,
  small,
}: {
  status?: string;
  progressPct: number;
  small: boolean;
}) {
  if (status === 'completed') {
    return <Text style={[styles.glyph, small && styles.glyphSm]}>✓</Text>;
  }
  if (status === 'failed') {
    return <Text style={[styles.glyph, small && styles.glyphSm]}>!</Text>;
  }
  if (status === 'downloading' || status === 'pending') {
    return (
      <View style={styles.progressGroup}>
        <Text style={[styles.progressText, small && styles.progressTextSm]}>
          {progressPct}%
        </Text>
      </View>
    );
  }
  if (status === 'paused') {
    return <Text style={[styles.glyph, small && styles.glyphSm]}>⏸</Text>;
  }
  // No download yet → arrow-down glyph
  return <Text style={[styles.glyph, small && styles.glyphSm]}>↓</Text>;
}

function labelForStatus(status: string | undefined, progressPct: number) {
  if (status === 'completed') {
    return 'Downloaded — tap to remove';
  }
  if (status === 'downloading') {
    return `Downloading ${progressPct}% — tap to pause`;
  }
  if (status === 'pending') {
    return 'Queued — tap to pause';
  }
  if (status === 'paused') {
    return 'Paused — tap to resume';
  }
  if (status === 'failed') {
    return 'Failed — tap to retry';
  }
  return 'Download episode';
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.surfaceHigh,
    justifyContent: 'center',
  },
  buttonCompleted: {
    backgroundColor: colors.brand,
  },
  buttonFailed: {
    backgroundColor: '#3a1a1a',
  },
  glyph: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  glyphSm: {
    fontSize: 14,
  },
  progressGroup: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    color: colors.ink,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  progressTextSm: {
    fontSize: 9,
  },
});
