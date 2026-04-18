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
    duration: episode.duration || 'Podcast',
    published: formatPublishedDate(episode.publishedAt),
    progress: 0,
    phase: `Ep ${index + 1}`,
    accent: episodeAccents[index % episodeAccents.length],
    queuePosition: index + 1,
    audioUrl: episode.audioUrl,
    imageUrl: episode.imageUrl,
  };
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
