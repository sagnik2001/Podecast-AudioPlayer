import {useQuery} from '@tanstack/react-query';

import {
  getPodcastEpisodes,
  searchPodcasts,
  searchPodcastsAcrossTerms,
} from '../api/podcastApi';

export const defaultPodcastSearchTerm = 'technology';

export const defaultPodcastDiscoveryTerms = [
  'technology',
  'business',
  'science',
  'news',
  'design',
  'startup',
  'health',
  'history',
  'music',
  'education',
] as const;

export const podcastQueryKeys = {
  all: ['podcasts'] as const,
  discovery: (terms: readonly string[]) =>
    [...podcastQueryKeys.all, 'discovery', terms.join('|')] as const,
  episodes: (feedUrl?: string) =>
    [...podcastQueryKeys.all, 'episodes', feedUrl ?? 'pending'] as const,
  search: (term: string) =>
    [...podcastQueryKeys.all, 'search', term] as const,
};

const searchStaleTime = 1000 * 60 * 15;
const episodesStaleTime = 1000 * 60 * 5;

export function usePodcastSearch(term = defaultPodcastSearchTerm) {
  const searchTerm = normalizeSearchTerm(term);

  return useQuery({
    enabled: Boolean(searchTerm),
    queryKey: podcastQueryKeys.search(searchTerm),
    queryFn: () => searchPodcasts(searchTerm),
    staleTime: searchStaleTime,
  });
}

export function usePodcastDiscovery(
  terms: readonly string[] = defaultPodcastDiscoveryTerms,
) {
  const discoveryTerms = normalizeDiscoveryTerms(terms);

  return useQuery({
    enabled: discoveryTerms.length > 0,
    queryKey: podcastQueryKeys.discovery(discoveryTerms),
    queryFn: () =>
      searchPodcastsAcrossTerms(discoveryTerms, {
        limit: 8,
      }),
    staleTime: searchStaleTime,
  });
}

export function usePodcastEpisodes(feedUrl?: string) {
  return useQuery({
    enabled: Boolean(feedUrl),
    queryKey: podcastQueryKeys.episodes(feedUrl),
    queryFn: () => getPodcastEpisodes(feedUrl as string),
    staleTime: episodesStaleTime,
  });
}

function normalizeSearchTerm(term: string) {
  return term.trim().replace(/\s+/g, ' ').toLowerCase();
}

function normalizeDiscoveryTerms(terms: readonly string[]) {
  return Array.from(new Set(terms.map(normalizeSearchTerm).filter(Boolean)));
}
