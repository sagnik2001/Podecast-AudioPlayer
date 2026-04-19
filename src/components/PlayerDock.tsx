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
      <View style={styles.row}>
        <CoverArt accent={episode.accent} imageUrl={episode.imageUrl} phase="Live" size={54} />
        <View style={styles.meta}>
          <Text numberOfLines={1} style={styles.label}>
            From {episode.show}
          </Text>
          <Text numberOfLines={1} style={styles.title}>
            {episode.title}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.75}
          disabled={!isCurrentTrack}
          onPress={onRewind}
          style={[styles.skipButton, !isCurrentTrack && styles.disabledButton]}>
          <Text style={styles.skipText}>-15</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.75}
          disabled={!canPlay || isBusy}
          onPress={onTogglePlayback}
          style={[styles.playButton, (!canPlay || isBusy) && styles.disabledButton]}>
          <Text style={styles.playText}>
            {!canPlay ? 'No audio' : isPlaying ? 'Pause' : 'Play'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.progressRow}>
        <Text style={styles.time}>{positionLabel}</Text>
        <ProgressBar progress={progressRatio} height={4} />
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
  disabledButton: {
    opacity: 0.46,
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
