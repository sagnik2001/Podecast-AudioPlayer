import {createMMKV} from 'react-native-mmkv';
import type {Track} from 'react-native-track-player';

import {Episode} from '../data/episodes';
import {colors} from '../theme/colors';

const playbackStore = createMMKV({id: 'playback-state'});
const playbackSnapshotKey = 'current-playback';
const snapshotVersion = 1;

export type PersistedPlaybackSnapshot = {
  activeEpisodeId: string;
  position: number;
  queue: Episode[];
  queueSignature: string;
  updatedAt: number;
  version: typeof snapshotVersion;
  wasPlaying: boolean;
};

export function readPlaybackSnapshot(): PersistedPlaybackSnapshot | undefined {
  const raw = playbackStore.getString(playbackSnapshotKey);

  if (!raw) {
    return undefined;
  }

  try {
    return normalizeSnapshot(JSON.parse(raw));
  } catch {
    return undefined;
  }
}

export function getPlaybackSnapshotEpisode(
  snapshot: PersistedPlaybackSnapshot | undefined = readPlaybackSnapshot(),
) {
  if (!snapshot) {
    return undefined;
  }

  return (
    snapshot.queue.find(episode => episode.id === snapshot.activeEpisodeId) ??
    snapshot.queue[0]
  );
}

export function writePlaybackSnapshot(
  episode: Episode,
  queue: Episode[],
  position = 0,
  wasPlaying = false,
) {
  const playableQueue = sanitizeQueue(queue, episode);
  const activeEpisode =
    playableQueue.find(item => item.id === episode.id) ?? playableQueue[0];

  if (!activeEpisode) {
    return;
  }

  writeSnapshot({
    activeEpisodeId: activeEpisode.id,
    position,
    queue: playableQueue.map(item =>
      item.id === activeEpisode.id
        ? applyProgressToEpisode(item, position)
        : item,
    ),
    queueSignature: createQueueSignature(playableQueue),
    updatedAt: Date.now(),
    version: snapshotVersion,
    wasPlaying,
  });
}

export function updatePlaybackProgress(
  position: number,
  duration?: number,
  wasPlaying?: boolean,
) {
  const snapshot = readPlaybackSnapshot();

  if (!snapshot) {
    return;
  }

  writeSnapshot({
    ...snapshot,
    position: sanitizePosition(position),
    queue: snapshot.queue.map(episode =>
      episode.id === snapshot.activeEpisodeId
        ? applyProgressToEpisode(episode, position, duration)
        : episode,
    ),
    updatedAt: Date.now(),
    wasPlaying: wasPlaying ?? snapshot.wasPlaying,
  });
}

export function updatePlaybackActiveTrack(
  track: Track | undefined,
  position = 0,
  wasPlaying?: boolean,
) {
  const activeEpisode = track ? mapTrackToEpisode(track) : undefined;
  const snapshot = readPlaybackSnapshot();

  if (!activeEpisode && !snapshot) {
    return;
  }

  const queue = activeEpisode
    ? upsertEpisode(snapshot?.queue ?? [], activeEpisode)
    : snapshot?.queue ?? [];
  const activeEpisodeId = activeEpisode?.id ?? snapshot?.activeEpisodeId;

  if (!activeEpisodeId || queue.length === 0) {
    return;
  }

  writeSnapshot({
    activeEpisodeId,
    position,
    queue: queue.map(episode =>
      episode.id === activeEpisodeId
        ? applyProgressToEpisode(episode, position)
        : episode,
    ),
    queueSignature: createQueueSignature(queue),
    updatedAt: Date.now(),
    version: snapshotVersion,
    wasPlaying: wasPlaying ?? snapshot?.wasPlaying ?? false,
  });
}

export function updatePlaybackState(wasPlaying: boolean) {
  const snapshot = readPlaybackSnapshot();

  if (!snapshot || snapshot.wasPlaying === wasPlaying) {
    return;
  }

  writeSnapshot({
    ...snapshot,
    updatedAt: Date.now(),
    wasPlaying,
  });
}

export function createQueueSignature(queue: Episode[]) {
  return queue
    .filter(episode => Boolean(episode.audioUrl))
    .map(episode => episode.id)
    .join('|');
}

function writeSnapshot(snapshot: PersistedPlaybackSnapshot) {
  playbackStore.set(playbackSnapshotKey, JSON.stringify(snapshot));
}

function normalizeSnapshot(
  value: unknown,
): PersistedPlaybackSnapshot | undefined {
  if (!isRecord(value) || value.version !== snapshotVersion) {
    return undefined;
  }

  const queue = Array.isArray(value.queue)
    ? value.queue.filter(isPersistableEpisode)
    : [];
  const activeEpisodeId =
    typeof value.activeEpisodeId === 'string' ? value.activeEpisodeId : '';

  if (!activeEpisodeId || queue.length === 0) {
    return undefined;
  }

  return {
    activeEpisodeId,
    position: sanitizePosition(value.position),
    queue,
    queueSignature:
      typeof value.queueSignature === 'string'
        ? value.queueSignature
        : createQueueSignature(queue),
    updatedAt:
      typeof value.updatedAt === 'number' && Number.isFinite(value.updatedAt)
        ? value.updatedAt
        : 0,
    version: snapshotVersion,
    wasPlaying: value.wasPlaying === true,
  };
}

function sanitizeQueue(queue: Episode[], selectedEpisode: Episode) {
  const playableQueue = queue.filter(isPersistableEpisode);

  if (isPersistableEpisode(selectedEpisode)) {
    return upsertEpisode(playableQueue, selectedEpisode);
  }

  return playableQueue;
}

function upsertEpisode(queue: Episode[], episode: Episode) {
  if (queue.some(item => item.id === episode.id)) {
    return queue.map(item =>
      item.id === episode.id
        ? {
            ...episode,
            ...item,
            audioUrl: item.audioUrl ?? episode.audioUrl,
          }
        : item,
    );
  }

  return [episode, ...queue];
}

function applyProgressToEpisode(
  episode: Episode,
  position: number,
  duration = parseDurationToSeconds(episode.duration),
): Episode {
  if (!Number.isFinite(duration) || duration <= 0) {
    return episode;
  }

  return {
    ...episode,
    progress: Math.max(
      0,
      Math.min(0.99, sanitizePosition(position) / duration),
    ),
  };
}

function mapTrackToEpisode(track: Track): Episode | undefined {
  const id = typeof track.id === 'string' ? track.id : String(track.id ?? '');
  const audioUrl = typeof track.url === 'string' ? track.url : undefined;

  if (!id || !audioUrl) {
    return undefined;
  }

  return {
    accent: colors.brand,
    audioUrl,
    description: typeof track.description === 'string' ? track.description : '',
    duration:
      typeof track.duration === 'number' && Number.isFinite(track.duration)
        ? String(track.duration)
        : 'Podcast',
    id,
    imageUrl: typeof track.artwork === 'string' ? track.artwork : undefined,
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

function isPersistableEpisode(value: unknown): value is Episode {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.show === 'string' &&
    typeof value.description === 'string' &&
    typeof value.tag === 'string' &&
    typeof value.duration === 'string' &&
    typeof value.published === 'string' &&
    typeof value.phase === 'string' &&
    typeof value.accent === 'string' &&
    typeof value.audioUrl === 'string' &&
    value.audioUrl.length > 0
  );
}

function sanitizePosition(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, value)
    : 0;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
