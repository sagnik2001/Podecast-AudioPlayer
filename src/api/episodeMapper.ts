import {PodcastEpisode} from './types';
import {Episode} from '../data/episodes';
import {episodeAccents} from '../theme/colors';

export function mapPodcastEpisodeToEpisode(
  episode: PodcastEpisode,
  index: number,
): Episode {
  return {
    id: episode.id,
    title: episode.title,
    show: episode.showTitle,
    description: episode.description || 'No episode notes available yet.',
    tag: episode.audioUrl ? 'Playable' : 'Metadata',
    duration: formatDurationLabel(episode.duration),
    published: formatPublishedDate(episode.publishedAt),
    progress: 0,
    phase: `Ep ${index + 1}`,
    accent: episodeAccents[index % episodeAccents.length],
    queuePosition: index + 1,
    audioUrl: episode.audioUrl,
    imageUrl: episode.imageUrl,
  };
}

function formatDurationLabel(value?: number | string) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? formatSeconds(value) : 'Podcast';
  }

  if (!value) {
    return 'Podcast';
  }

  const duration = value.trim();

  if (!duration) {
    return 'Podcast';
  }

  if (duration.includes(':')) {
    return duration;
  }

  const numericValue = Number.parseFloat(duration);

  if (Number.isNaN(numericValue)) {
    return duration;
  }

  return `${Math.round(numericValue)} min`;
}

function formatSeconds(value: number) {
  const totalSeconds = Math.floor(value);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function formatPublishedDate(value?: string) {
  if (!value) {
    return 'Feed';
  }

  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return 'Feed';
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(timestamp));
}
