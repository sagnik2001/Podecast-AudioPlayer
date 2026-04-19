import TrackPlayer, {
  Capability,
  State,
  type AddTrack,
} from 'react-native-track-player';

import {Episode} from '../data/episodes';

let setupPromise: Promise<void> | undefined;
let loadedQueueSignature = '';

export function setupPodcastPlayer() {
  if (!setupPromise) {
    setupPromise = setupPlayer();
  }

  return setupPromise;
}

export async function playEpisode(episode: Episode, queue: Episode[] = [episode]) {
  if (!episode.audioUrl) {
    return;
  }

  await setupPodcastPlayer();

  const activeTrack = await TrackPlayer.getActiveTrack().catch(() => undefined);
  const playableQueue = getPlayableQueue(queue, episode);
  const queueSignature = playableQueue.map(item => item.id).join('|');
  const selectedTrackIndex = playableQueue.findIndex(item => item.id === episode.id);

  if (loadedQueueSignature !== queueSignature) {
    await TrackPlayer.reset();
    await TrackPlayer.add(playableQueue.map(toTrack));
    loadedQueueSignature = queueSignature;
  }

  if (activeTrack?.id !== episode.id && selectedTrackIndex >= 0) {
    await TrackPlayer.skip(selectedTrackIndex);
  }

  await TrackPlayer.play();
}

export async function toggleEpisodePlayback(
  episode: Episode,
  isPlaying: boolean,
  queue?: Episode[],
) {
  if (isPlaying) {
    await TrackPlayer.pause();
    return;
  }

  await playEpisode(episode, queue);
}

export async function seekBy(seconds: number) {
  await setupPodcastPlayer();
  await TrackPlayer.seekBy(seconds);
}

export async function seekTo(seconds: number) {
  await setupPodcastPlayer();
  await TrackPlayer.seekTo(seconds);
}

export function isPlaybackStatePlaying(state?: State) {
  return state === State.Playing || state === State.Buffering;
}

function getPlayableQueue(queue: Episode[], selectedEpisode: Episode) {
  const playableQueue = queue.filter(item => Boolean(item.audioUrl));

  if (playableQueue.some(item => item.id === selectedEpisode.id)) {
    return playableQueue;
  }

  return [selectedEpisode, ...playableQueue].filter(item => Boolean(item.audioUrl));
}

function toTrack(episode: Episode): AddTrack {
  const duration = parseDurationToSeconds(episode.duration);

  return {
    id: episode.id,
    url: episode.audioUrl as string,
    title: episode.title,
    artist: episode.show,
    album: 'PocketCast Lab',
    artwork: episode.imageUrl,
    description: episode.description,
    duration: duration > 0 ? duration : undefined,
  };
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

  if (value.toLowerCase().includes('hour')) {
    return numericValue * 60 * 60;
  }

  if (value.toLowerCase().includes('min')) {
    return numericValue * 60;
  }

  return numericValue;
}

async function setupPlayer() {
  try {
    await TrackPlayer.setupPlayer({
      maxCacheSize: 1024 * 5,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (!message.toLowerCase().includes('already')) {
      throw error;
    }
  }

  await TrackPlayer.updateOptions({
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.SeekTo,
    ],
    compactCapabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
    ],
    notificationCapabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SeekTo,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
    ],
    progressUpdateEventInterval: 1,
  });
}
