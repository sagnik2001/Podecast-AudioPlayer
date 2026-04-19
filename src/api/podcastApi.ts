import {apiGet, buildUrl} from './client';
import {
  ITunesSearchResponse,
  PodcastEpisode,
  PodcastShow,
  Rss2JsonResponse,
} from './types';

const ITUNES_SEARCH_URL = 'https://itunes.apple.com/search';
const RSS_TO_JSON_URL = 'https://api.rss2json.com/v1/api.json';

type PodcastSearchOptions = {
  country?: string;
  limit?: number;
};

const defaultSearchOptions: Required<PodcastSearchOptions> = {
  country: 'US',
  limit: 20,
};

export async function searchPodcasts(
  term: string,
  options: PodcastSearchOptions = {},
): Promise<PodcastShow[]> {
  const searchOptions = {...defaultSearchOptions, ...options};
  const url = buildUrl(ITUNES_SEARCH_URL, {
    country: searchOptions.country,
    entity: 'podcast',
    limit: String(searchOptions.limit),
    media: 'podcast',
    term,
  });

  const data = await apiGet<ITunesSearchResponse>(url);

  return data.results
    .filter(item => Boolean(item.feedUrl))
    .map(item => ({
      id: String(item.collectionId || item.trackId),
      title: item.collectionName || item.trackName || 'Untitled podcast',
      author: item.artistName || 'Unknown publisher',
      feedUrl: item.feedUrl as string,
      artworkUrl: item.artworkUrl600 || item.artworkUrl100,
      genre: item.primaryGenreName || item.genres?.[0],
    }));
}

export async function searchPodcastsAcrossTerms(
  terms: readonly string[],
  options: PodcastSearchOptions = {},
): Promise<PodcastShow[]> {
  const results = await Promise.all(
    terms.map(term => searchPodcasts(term, options)),
  );

  return uniqueShowsByFeedUrl(results.flat());
}

export async function getPodcastEpisodes(feedUrl: string): Promise<PodcastEpisode[]> {
  const url = buildUrl(RSS_TO_JSON_URL, {
    rss_url: feedUrl,
  });

  const data = await apiGet<Rss2JsonResponse>(url);

  if (data.status !== 'ok') {
    throw new Error(data.message || 'RSS feed could not be loaded');
  }

  const showTitle = data.feed?.title || 'Podcast';
  const showImage = data.feed?.image;

  return (data.items ?? [])
    .filter(item => Boolean(item.enclosure?.link))
    .map((item, index) => ({
      id: item.guid || item.link || `${feedUrl}-${index}`,
      title: item.title || 'Untitled episode',
      showTitle,
      description: stripHtml(item.description || item.content || ''),
      publishedAt: item.pubDate,
      audioUrl: item.enclosure?.link,
      duration: item.enclosure?.duration,
      imageUrl: item.thumbnail || showImage,
    }));
}

function stripHtml(input: string) {
  return input
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function uniqueShowsByFeedUrl(shows: PodcastShow[]) {
  const seenFeeds = new Set<string>();

  return shows.filter(show => {
    const feedKey = show.feedUrl.trim().toLowerCase();

    if (!feedKey || seenFeeds.has(feedKey)) {
      return false;
    }

    seenFeeds.add(feedKey);
    return true;
  });
}
