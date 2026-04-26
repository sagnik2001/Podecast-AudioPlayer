import TrackPlayer, {
  Capability,
  Event,
  State,
  type AddTrack,
  type Track,
} from 'react-native-track-player';

import {Episode} from '../data/episodes';
import {getLocalAudioUrlForEpisode} from './downloads';
import {
  createQueueSignature,
  readPlaybackSnapshot,
  updatePlaybackActiveTrack,
  updatePlaybackProgress,
  updatePlaybackState,
  writePlaybackSnapshot,
} from './playbackPersistence';

let setupPromise: Promise<void> | undefined;
let restorePromise: Promise<void> | undefined;
let persistenceListenersRegistered = false;
let loadedQueueSignature = '';

let readyTrackId: string | undefined;
let pendingActiveTrackId: string | undefined;
const readinessListeners = new Set<() => void>();

export function getReadyTrackId() {
  return readyTrackId;
}

export function subscribeToReadyTrackId(listener: () => void) {
  readinessListeners.add(listener);
  return () => {
    readinessListeners.delete(listener);
  };
}

function setReadyTrackId(next: string | undefined) {
  if (readyTrackId === next) {
    return;
  }
  readyTrackId = next;
  readinessListeners.forEach(listener => listener());
}

let autoplayEnabled = true;
let userSkipInFlight = false;
const autoplayListeners = new Set<() => void>();

export function getAutoplayEnabled() {
  return autoplayEnabled;
}

export function subscribeToAutoplay(listener: () => void) {
  autoplayListeners.add(listener);
  return () => {
    autoplayListeners.delete(listener);
  };
}

export function setAutoplayEnabled(next: boolean) {
  if (autoplayEnabled === next) {
    return;
  }
  autoplayEnabled = next;
  autoplayListeners.forEach(listener => listener());
}

export function toggleAutoplayEnabled() {
  setAutoplayEnabled(!autoplayEnabled);
}

export function setupPodcastPlayer() {
  if (!setupPromise) {
    setupPromise = setupPlayer();
  }

  return setupPromise;
}

export async function playEpisode(
  episode: Episode,
  queue: Episode[] = [episode],
) {
  if (!episode.audioUrl) {
    return;
  }

  await setupPodcastPlayer();

  const activeTrack = await TrackPlayer.getActiveTrack().catch(() => undefined);
  const progress = await TrackPlayer.getProgress().catch(() => undefined);
  const playableQueue = getPlayableQueue(queue, episode);
  const resolvedQueue = await resolveLocalAudioForQueue(playableQueue);
  const queueSignature = resolvedQueue.map(item => item.id).join('|');
  const selectedTrackIndex = resolvedQueue.findIndex(
    item => item.id === episode.id,
  );
  const initialPosition =
    activeTrack?.id === episode.id ? progress?.position ?? 0 : 0;

  if (loadedQueueSignature !== queueSignature) {
    await TrackPlayer.reset();
    await TrackPlayer.add(resolvedQueue.map(toTrack));
    loadedQueueSignature = queueSignature;
  }

  if (activeTrack?.id !== episode.id && selectedTrackIndex >= 0) {
    pendingActiveTrackId = episode.id;
    setReadyTrackId(undefined);
    userSkipInFlight = true;
    try {
      await TrackPlayer.skip(selectedTrackIndex);
    } finally {
      userSkipInFlight = false;
    }
  }

  writePlaybackSnapshot(episode, playableQueue, initialPosition, true);
  await TrackPlayer.play();
}

export async function skipToNextEpisode() {
  await setupPodcastPlayer();
  userSkipInFlight = true;
  try {
    await TrackPlayer.skipToNext();
    await TrackPlayer.play();
  } catch {
    // ignore (e.g., no next track)
  } finally {
    userSkipInFlight = false;
  }
}

export async function skipToPreviousEpisode() {
  await setupPodcastPlayer();
  const progress = await TrackPlayer.getProgress().catch(() => undefined);

  // Match common podcast UX: if more than 3s into the track, restart it
  // instead of jumping to the previous episode.
  if (progress && progress.position > 3) {
    await TrackPlayer.seekTo(0);
    return;
  }

  userSkipInFlight = true;
  try {
    await TrackPlayer.skipToPrevious();
    await TrackPlayer.play();
  } catch {
    // ignore (e.g., already at first track)
  } finally {
    userSkipInFlight = false;
  }
}

export async function toggleEpisodePlayback(
  episode: Episode,
  isPlaying: boolean,
  queue?: Episode[],
) {
  if (isPlaying) {
    await setupPodcastPlayer();
    await TrackPlayer.pause();
    await persistCurrentPlayback(false);
    return;
  }

  await playEpisode(episode, queue);
}

export async function seekBy(seconds: number) {
  await setupPodcastPlayer();
  await TrackPlayer.seekBy(seconds);
  await persistCurrentPlayback();
}

export async function seekTo(seconds: number) {
  await setupPodcastPlayer();
  await TrackPlayer.seekTo(seconds);
  updatePlaybackProgress(seconds);
}

export function restorePersistedPlayback() {
  if (!restorePromise) {
    restorePromise = restorePlaybackSnapshot();
  }

  return restorePromise;
}

export function registerPlaybackPersistenceListeners() {
  if (persistenceListenersRegistered) {
    return;
  }

  persistenceListenersRegistered = true;

  TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, event => {
    updatePlaybackProgress(event.position, event.duration, true);
    if (
      pendingActiveTrackId &&
      (event.position > 0 || event.buffered > 0)
    ) {
      setReadyTrackId(pendingActiveTrackId);
    }
  });

  TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, event => {
    updatePlaybackActiveTrack(event.track, 0);
    pendingActiveTrackId = event.track?.id ? String(event.track.id) : undefined;
    setReadyTrackId(undefined);

    const isAutoAdvance =
      !userSkipInFlight && Boolean(event.lastTrack) && Boolean(event.track);
    if (isAutoAdvance && !autoplayEnabled) {
      TrackPlayer.pause().catch(() => undefined);
    }
  });

  TrackPlayer.addEventListener(Event.PlaybackState, event => {
    updatePlaybackState(isPlaybackStatePlaying(event.state));
  });
}

export function isPlaybackStatePlaying(state?: State) {
  return state === State.Playing;
}

export function isPlaybackStateLoading(state?: State) {
  return state === State.Buffering || state === State.Loading;
}

async function resolveLocalAudioForQueue(queue: Episode[]): Promise<Episode[]> {
  return Promise.all(
    queue.map(async episode => {
      const localUrl = await getLocalAudioUrlForEpisode(episode.id).catch(
        () => undefined,
      );
      if (!localUrl) {
        return episode;
      }
      return {...episode, audioUrl: localUrl, downloaded: true};
    }),
  );
}

function getPlayableQueue(queue: Episode[], selectedEpisode: Episode) {
  const playableQueue = queue.filter(item => Boolean(item.audioUrl));

  if (playableQueue.some(item => item.id === selectedEpisode.id)) {
    return playableQueue;
  }

  return [selectedEpisode, ...playableQueue].filter(item =>
    Boolean(item.audioUrl),
  );
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

async function restorePlaybackSnapshot() {
  const snapshot = readPlaybackSnapshot();
  const activeEpisode = snapshot?.queue.find(
    episode => episode.id === snapshot.activeEpisodeId,
  );

  if (!snapshot || !activeEpisode) {
    return;
  }

  await setupPodcastPlayer();

  const playableQueue = getPlayableQueue(snapshot.queue, activeEpisode);
  const resolvedQueue = await resolveLocalAudioForQueue(playableQueue);
  const queueSignature = createQueueSignature(resolvedQueue);
  const nativeQueue = await TrackPlayer.getQueue().catch((): Track[] => []);
  const nativeQueueSignature = nativeQueue
    .map(track => String(track.id ?? ''))
    .join('|');

  if (nativeQueueSignature !== queueSignature) {
    await TrackPlayer.reset();
    await TrackPlayer.add(resolvedQueue.map(toTrack));
  }

  loadedQueueSignature = queueSignature;

  const activeTrack = await TrackPlayer.getActiveTrack().catch(() => undefined);
  const selectedTrackIndex = resolvedQueue.findIndex(
    episode => episode.id === snapshot.activeEpisodeId,
  );

  if (selectedTrackIndex >= 0 && activeTrack?.id !== snapshot.activeEpisodeId) {
    await TrackPlayer.skip(selectedTrackIndex);
  }

  await TrackPlayer.seekTo(snapshot.position);

  if (snapshot.wasPlaying) {
    await TrackPlayer.play();
  }
}

async function persistCurrentPlayback(wasPlaying?: boolean) {
  const [activeTrack, progress] = await Promise.all([
    TrackPlayer.getActiveTrack().catch(() => undefined),
    TrackPlayer.getProgress().catch(() => undefined),
  ]);

  updatePlaybackActiveTrack(activeTrack, progress?.position ?? 0, wasPlaying);
  updatePlaybackProgress(
    progress?.position ?? 0,
    progress?.duration,
    wasPlaying,
  );
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

  registerPlaybackPersistenceListeners();
}
