import React, {useMemo} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {
  useActiveTrack,
  useProgress,
} from 'react-native-track-player';

import {Episode} from '../data/episodes';
import {useEpisodePlayback} from '../hooks/useEpisodePlayback';
import {
  seekBy,
  seekTo,
} from '../services/trackPlayer';
import {colors} from '../theme/colors';
import {CoverArt} from './CoverArt';
import {PlayPauseIcon} from './PlayPauseIcon';
import {SeekBar} from './SeekBar';

type PlayerDockProps = {
  episode: Episode;
  queue?: Episode[];
};

export function PlayerDock({episode, queue = [episode]}: PlayerDockProps) {
  const activeTrack = useActiveTrack();
  const displayedEpisode = useMemo(
    () =>
      queue.find(item => item.id === activeTrack?.id) ??
      mapActiveTrackToEpisode(activeTrack) ??
      episode,
    [activeTrack, episode, queue],
  );
  const progress = useProgress(500);
  const {
    canPlay,
    isBusy,
    isCurrentTrack,
    isPlaying,
    togglePlayback,
  } = useEpisodePlayback(displayedEpisode, queue);
  const positionLabel = isCurrentTrack
    ? formatPlaybackTime(progress.position)
    : formatEpisodeStartTime(displayedEpisode.progress, displayedEpisode.duration);
  const durationLabel = isCurrentTrack
    ? formatPlaybackTime(progress.duration)
    : formatEpisodeDuration(displayedEpisode.duration);

  const onRewind = async () => {
    if (!isCurrentTrack || isBusy) {
      return;
    }

    await seekBy(-15);
  };

  const onSeek = async (seconds: number) => {
    if (!isCurrentTrack || isBusy) {
      return;
    }

    await seekTo(seconds);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.glow} />
      <View style={styles.row}>
        <CoverArt
          accent={displayedEpisode.accent}
          imageUrl={displayedEpisode.imageUrl}
          phase="Live"
          size={48}
        />
        <View style={styles.meta}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, isPlaying && styles.statusDotLive]} />
            <Text style={styles.label}>
              {isPlaying ? 'Now playing' : 'Up next'}
            </Text>
          </View>
          <Text numberOfLines={1} style={styles.title}>
            {displayedEpisode.title}
          </Text>
          <Text numberOfLines={1} style={styles.show}>
            {displayedEpisode.show}
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
          onPress={togglePlayback}
          style={[styles.playButton, (!canPlay || isBusy) && styles.disabledButton]}>
          <PlayPauseIcon color={colors.background} isBusy={isBusy} isPlaying={isPlaying} />
        </TouchableOpacity>
      </View>
      <View style={styles.progressRow}>
        <Text style={styles.time}>{positionLabel}</Text>
        <SeekBar
          accent={colors.brand}
          buffered={progress.buffered}
          duration={isCurrentTrack ? progress.duration : 0}
          height={6}
          onSeek={onSeek}
          position={isCurrentTrack ? progress.position : 0}
        />
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

function mapActiveTrackToEpisode(
  track: ReturnType<typeof useActiveTrack>,
): Episode | undefined {
  if (!track?.id) {
    return undefined;
  }

  const artwork = typeof track.artwork === 'string' ? track.artwork : undefined;
  const audioUrl = typeof track.url === 'string' ? track.url : undefined;

  return {
    accent: colors.brand,
    audioUrl,
    description:
      typeof track.description === 'string' ? track.description : '',
    duration: 'Podcast',
    id: String(track.id),
    imageUrl: artwork,
    phase: 'Live',
    progress: 0,
    published: 'Now',
    queuePosition: 0,
    show:
      typeof track.artist === 'string'
        ? track.artist
        : typeof track.album === 'string'
          ? track.album
          : 'Now playing',
    tag: 'Playing',
    title: typeof track.title === 'string' ? track.title : 'Current audio',
  };
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
