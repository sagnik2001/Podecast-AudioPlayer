import {useQuery} from '@tanstack/react-query';

import {getPodcastEpisodes, searchPodcasts} from '../api/podcastApi';

export const defaultPodcastSearchTerm = 'javascript';

export function usePodcastSearch(term = defaultPodcastSearchTerm) {
  return useQuery({
    queryKey: ['podcasts', 'search', term],
    queryFn: () => searchPodcasts(term),
    staleTime: 1000 * 60 * 15,
  });
}

export function usePodcastEpisodes(feedUrl?: string) {
  return useQuery({
    enabled: Boolean(feedUrl),
    queryKey: ['podcasts', 'episodes', feedUrl],
    queryFn: () => getPodcastEpisodes(feedUrl as string),
    staleTime: 1000 * 60 * 5,
  });
}
