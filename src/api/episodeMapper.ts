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
    duration: normalizeDurationValue(episode.duration),
    published: formatPublishedDate(episode.publishedAt),
    progress: 0,
    phase: `Ep ${index + 1}`,
    accent: episodeAccents[index % episodeAccents.length],
    queuePosition: index + 1,
    audioUrl: episode.audioUrl,
    imageUrl: episode.imageUrl,
  };
}

function normalizeDurationValue(value?: number | string) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : 'Podcast';
  }

  if (!value) {
    return 'Podcast';
  }

  const duration = value.trim();

  if (!duration) {
    return 'Podcast';
  }

  return duration;
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
