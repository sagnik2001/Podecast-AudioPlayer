import {XMLParser} from 'fast-xml-parser';

import {apiGet, apiText, buildUrl} from './client';
import {
  ITunesSearchResponse,
  PodcastEpisode,
  PodcastShow,
} from './types';

const ITUNES_SEARCH_URL = 'https://itunes.apple.com/search';

type PodcastSearchOptions = {
  country?: string;
  limit?: number;
};

type XmlRecord = Record<string, unknown>;

const defaultSearchOptions: Required<PodcastSearchOptions> = {
  country: 'US',
  limit: 20,
};

const maxSearchLimit = 50;
const rssParser = new XMLParser({
  attributeNamePrefix: '@_',
  ignoreAttributes: false,
  parseAttributeValue: false,
  parseTagValue: false,
  textNodeName: '#text',
  trimValues: true,
});

export async function searchPodcasts(
  term: string,
  options: PodcastSearchOptions = {},
): Promise<PodcastShow[]> {
  const searchOptions = {...defaultSearchOptions, ...options};
  const searchTerm = normalizeSearchTerm(term);
  const url = buildUrl(ITUNES_SEARCH_URL, {
    country: searchOptions.country,
    entity: 'podcast',
    limit: clampSearchLimit(searchOptions.limit),
    media: 'podcast',
    term: searchTerm,
  });

  const data = await apiGet<ITunesSearchResponse>(url);

  return uniqueShowsByFeedUrl(
    data.results
      .filter(item => isHttpUrl(item.feedUrl))
      .map(item => ({
        id: String(item.collectionId || item.trackId),
        title: item.collectionName || item.trackName || 'Untitled podcast',
        author: item.artistName || 'Unknown publisher',
        feedUrl: item.feedUrl as string,
        artworkUrl: item.artworkUrl600 || item.artworkUrl100,
        genre: item.primaryGenreName || item.genres?.[0],
      })),
  ).sort((a, b) => scoreShow(b, searchTerm) - scoreShow(a, searchTerm));
}

export async function searchPodcastsAcrossTerms(
  terms: readonly string[],
  options: PodcastSearchOptions = {},
): Promise<PodcastShow[]> {
  const normalizedTerms = Array.from(
    new Set(terms.map(normalizeSearchTerm).filter(Boolean)),
  );
  const results = await Promise.allSettled(
    normalizedTerms.map(term => searchPodcasts(term, options)),
  );
  const searchContext = normalizedTerms.join(' ');

  return uniqueShowsByFeedUrl(
    results.flatMap(result =>
      result.status === 'fulfilled' ? result.value : [],
    ),
  ).sort((a, b) => scoreShow(b, searchContext) - scoreShow(a, searchContext));
}

export async function getPodcastEpisodes(feedUrl: string): Promise<PodcastEpisode[]> {
  if (!isHttpUrl(feedUrl)) {
    throw new Error('Podcast feed URL is invalid');
  }

  const xml = await apiText(feedUrl);
  const feed = rssParser.parse(xml) as XmlRecord;
  const channel = getFeedChannel(feed);
  const showTitle = getText(channel?.title) || 'Podcast';
  const showImage = getFeedImage(channel);
  const items = toArray<XmlRecord>(channel?.item ?? channel?.entry);

  return items
    .map((item, index) =>
      mapRssItemToPodcastEpisode(item, feedUrl, index, showTitle, showImage),
    )
    .filter((episode): episode is PodcastEpisode =>
      isPlayableAudioUrl(episode.audioUrl),
    );
}

function mapRssItemToPodcastEpisode(
  item: XmlRecord,
  feedUrl: string,
  index: number,
  showTitle: string,
  showImage?: string,
): PodcastEpisode {
  const enclosure = firstRecord(item.enclosure);
  const guid = getText(item.guid) || getText(item.id) || getText(item.link);
  const audioUrl = getText(enclosure?.['@_url']) || getText(enclosure?.url);

  return {
    id: guid || audioUrl || `${feedUrl}-${index}`,
    title: decodeHtml(getText(item.title) || 'Untitled episode'),
    showTitle,
    description: stripHtml(
      getText(item.description) ||
        getText(item['itunes:summary']) ||
        getText(item.summary) ||
        getText(item['content:encoded']) ||
        '',
    ),
    publishedAt:
      getText(item.pubDate) || getText(item.published) || getText(item.updated),
    audioUrl: audioUrl?.trim(),
    duration: getText(item['itunes:duration']) || getText(enclosure?.duration),
    imageUrl: normalizeImageUrl(
      getFeedImage(item) ||
        getText(firstRecord(item['media:thumbnail'])?.['@_url']) ||
        showImage,
    ),
  };
}

function getFeedChannel(feed: XmlRecord) {
  const rssChannel = firstRecord(firstRecord(feed.rss)?.channel);
  const atomFeed = firstRecord(feed.feed);

  if (rssChannel) {
    return rssChannel;
  }

  if (atomFeed) {
    return {
      ...atomFeed,
      item: atomFeed.entry,
    };
  }

  throw new Error('RSS feed could not be parsed');
}

function getFeedImage(node?: XmlRecord) {
  if (!node) {
    return undefined;
  }

  return normalizeImageUrl(
    getText(firstRecord(node.image)?.url) ||
      getText(firstRecord(node['itunes:image'])?.['@_href']) ||
      getText(firstRecord(node['media:thumbnail'])?.['@_url']) ||
      getText(node.thumbnail),
  );
}

function firstRecord(value: unknown): XmlRecord | undefined {
  const first = Array.isArray(value) ? value[0] : value;

  return isRecord(first) ? first : undefined;
}

function toArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  return value ? [value as T] : [];
}

function isRecord(value: unknown): value is XmlRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getText(value: unknown): string | undefined {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (isRecord(value)) {
    return getText(value['#text']);
  }

  return undefined;
}

function stripHtml(input: string) {
  return decodeHtml(input)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeHtml(input: string) {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
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

function normalizeSearchTerm(term: string) {
  return term.trim().replace(/\s+/g, ' ');
}

function clampSearchLimit(limit: number) {
  return Math.max(1, Math.min(limit, maxSearchLimit));
}

function isHttpUrl(value?: string) {
  return Boolean(value && /^https?:\/\//i.test(value.trim()));
}

function isPlayableAudioUrl(value?: string) {
  if (!isHttpUrl(value)) {
    return false;
  }

  return !/\.(pdf|jpg|jpeg|png|gif|webp)(\?|$)/i.test(value as string);
}

function normalizeImageUrl(value?: string) {
  return isHttpUrl(value) ? value?.trim() : undefined;
}

function scoreShow(show: PodcastShow, searchContext: string) {
  const haystack = `${show.title} ${show.author} ${show.genre ?? ''}`.toLowerCase();
  const context = searchContext.toLowerCase();
  const preferredWords = [
    'gita',
    'bhagavad',
    'sanskrit',
    'vedanta',
    'spiritual',
    'wisdom',
    'meditation',
    'philosophy',
    'hindu',
    'krishna',
  ];

  return preferredWords.reduce((score, word) => {
    const contextBoost = context.includes(word) ? 2 : 1;
    return haystack.includes(word) ? score + contextBoost : score;
  }, 0);
}
