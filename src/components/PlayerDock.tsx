import React, {useMemo, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {
  useActiveTrack,
  usePlaybackState,
  useProgress,
} from 'react-native-track-player';

import {Episode} from '../data/episodes';
import {
  isPlaybackStatePlaying,
  seekBy,
  toggleEpisodePlayback,
} from '../services/trackPlayer';
import {colors} from '../theme/colors';
import {CoverArt} from './CoverArt';
import {ProgressBar} from './ProgressBar';

type PlayerDockProps = {
  episode: Episode;
  queue?: Episode[];
};

export function PlayerDock({episode, queue = [episode]}: PlayerDockProps) {
  const [isBusy, setIsBusy] = useState(false);
  const playbackState = usePlaybackState();
  const activeTrack = useActiveTrack();
  const progress = useProgress(500);
  const isCurrentTrack = activeTrack?.id === episode.id;
  const isPlaying = isCurrentTrack && isPlaybackStatePlaying(playbackState.state);
  const canPlay = Boolean(episode.audioUrl);
  const progressRatio = useMemo(() => {
    if (!isCurrentTrack || progress.duration <= 0) {
      return episode.progress;
    }

    return progress.position / progress.duration;
  }, [episode.progress, isCurrentTrack, progress.duration, progress.position]);

  const positionLabel = isCurrentTrack
    ? formatPlaybackTime(progress.position)
    : formatEpisodeStartTime(episode.progress, episode.duration);
  const durationLabel = isCurrentTrack
    ? formatPlaybackTime(progress.duration)
    : formatEpisodeDuration(episode.duration);

  const onTogglePlayback = async () => {
    if (!canPlay || isBusy) {
      return;
    }

    setIsBusy(true);

    try {
      await toggleEpisodePlayback(episode, isPlaying, queue);
    } finally {
      setIsBusy(false);
    }
  };

  const onRewind = async () => {
    if (!isCurrentTrack || isBusy) {
      return;
    }

    await seekBy(-15);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.glow} />
      <View style={styles.row}>
        <CoverArt accent={episode.accent} imageUrl={episode.imageUrl} phase="Live" size={48} />
        <View style={styles.meta}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, isPlaying && styles.statusDotLive]} />
            <Text style={styles.label}>
              {isPlaying ? 'Now playing' : 'Up next'}
            </Text>
          </View>
          <Text numberOfLines={1} style={styles.title}>
            {episode.title}
          </Text>
          <Text numberOfLines={1} style={styles.show}>
            {episode.show}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.78}
          disabled={!isCurrentTrack}
          onPress={onRewind}
          style={[styles.skipButton, !isCurrentTrack && styles.disabledButton]}>
          <Text style={styles.skipText}>15</Text>
          <Text style={styles.skipUnit}>sec</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.82}
          disabled={!canPlay || isBusy}
          onPress={onTogglePlayback}
          style={[styles.playButton, (!canPlay || isBusy) && styles.disabledButton]}>
          <Text style={styles.playText}>
            {!canPlay ? '…' : isPlaying ? '❚❚' : '▶'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.progressRow}>
        <Text style={styles.time}>{positionLabel}</Text>
        <ProgressBar accent={colors.brand} height={3} progress={progressRatio} />
        <Text style={styles.time}>{durationLabel}</Text>
      </View>
    </View>
  );
}

function formatPlaybackTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '0:00';
  }

  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function formatEpisodeStartTime(progress: number, duration: string) {
  const totalSeconds = parseDurationToSeconds(duration);

  if (totalSeconds <= 0) {
    return '0:00';
  }

  return formatPlaybackTime(totalSeconds * progress);
}

function formatEpisodeDuration(duration: string) {
  const totalSeconds = parseDurationToSeconds(duration);

  if (totalSeconds <= 0) {
    return duration || 'Podcast';
  }

  return formatPlaybackTime(totalSeconds);
}

function parseDurationToSeconds(duration: unknown) {
  if (typeof duration === 'number') {
    return Number.isFinite(duration) ? duration : 0;
  }

  if (typeof duration !== 'string') {
    return 0;
  }

  const value = duration.trim();

  if (!value) {
    return 0;
  }

  if (value.includes(':')) {
    return value
      .split(':')
      .map(part => Number.parseInt(part, 10))
      .filter(part => !Number.isNaN(part))
      .reduce((seconds, part) => seconds * 60 + part, 0);
  }

  const numericValue = Number.parseFloat(value);

  if (Number.isNaN(numericValue)) {
    return 0;
  }

  return value.toLowerCase().includes('hour')
    ? numericValue * 60 * 60
    : numericValue * 60;
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.lineSoft,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: colors.black,
    shadowOffset: {height: 18, width: 0},
    shadowOpacity: 0.5,
    shadowRadius: 24,
  },
  glow: {
    backgroundColor: colors.brand,
    borderRadius: 999,
    height: 80,
    left: -20,
    opacity: 0.06,
    position: 'absolute',
    top: -30,
    width: 80,
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
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  statusDot: {
    backgroundColor: colors.dim,
    borderRadius: 999,
    height: 6,
    width: 6,
  },
  statusDotLive: {
    backgroundColor: colors.brandBright,
  },
  label: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  show: {
    color: colors.dim,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  skipButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceHigh,
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  skipText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
    lineHeight: 14,
  },
  skipUnit: {
    color: colors.dim,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginTop: 1,
    textTransform: 'uppercase',
  },
  playButton: {
    alignItems: 'center',
    backgroundColor: colors.brand,
    borderRadius: 999,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  disabledButton: {
    opacity: 0.46,
  },
  playText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '900',
    marginLeft: 1,
  },
  progressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingHorizontal: 4,
  },
  time: {
    color: colors.dim,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
