import {apiGet} from './client';
import {PodcastEpisode, PodcastShow} from './types';

const ARCHIVE_SEARCH_URL = 'https://archive.org/advancedsearch.php';
const ARCHIVE_METADATA_URL = 'https://archive.org/metadata';
const ARCHIVE_DOWNLOAD_URL = 'https://archive.org/download';
const ARCHIVE_THUMB_URL = 'https://archive.org/services/img';

export const ARCHIVE_FEED_PREFIX = 'archive://';

type ArchiveSearchResponse = {
  response?: {
    docs?: Array<{
      identifier?: string;
      title?: string | string[];
      creator?: string | string[];
      description?: string | string[];
      subject?: string | string[];
      downloads?: number;
    }>;
  };
};

type ArchiveMetadataResponse = {
  metadata?: {
    title?: string | string[];
    creator?: string | string[];
    description?: string | string[];
    date?: string;
  };
  files?: Array<{
    name: string;
    format?: string;
    length?: string;
    title?: string;
    track?: string;
  }>;
};

const audioFormatPriority = [
  'VBR MP3',
  '128Kbps MP3',
  '64Kbps MP3',
  '256Kbps MP3',
  '320Kbps MP3',
  'Ogg Vorbis',
];

export function isArchiveFeedUrl(feedUrl: string) {
  return feedUrl.startsWith(ARCHIVE_FEED_PREFIX);
}

export function buildArchiveFeedUrl(identifier: string) {
  return `${ARCHIVE_FEED_PREFIX}${identifier}`;
}

export function extractArchiveIdentifier(feedUrl: string) {
  return feedUrl.slice(ARCHIVE_FEED_PREFIX.length);
}

export async function searchArchive(
  term: string,
  options: {limit?: number} = {},
): Promise<PodcastShow[]> {
  const query = `(${term}) AND mediatype:(audio)`;
  const params = new URLSearchParams();
  params.set('q', query);
  ['identifier', 'title', 'creator', 'description', 'subject', 'downloads'].forEach(
    field => params.append('fl[]', field),
  );
  params.set('rows', String(options.limit ?? 12));
  params.set('page', '1');
  params.set('sort[]', 'downloads desc');
  params.set('output', 'json');

  const url = `${ARCHIVE_SEARCH_URL}?${params.toString()}`;
  const data = await apiGet<ArchiveSearchResponse>(url);
  const docs = data.response?.docs ?? [];

  return docs
    .filter(doc => Boolean(doc.identifier))
    .map(doc => {
      const identifier = doc.identifier as string;

      return {
        id: identifier,
        title: firstString(doc.title) || identifier,
        author: firstString(doc.creator) || 'Internet Archive',
        feedUrl: buildArchiveFeedUrl(identifier),
        artworkUrl: `${ARCHIVE_THUMB_URL}/${identifier}`,
        genre: 'Archive',
      } satisfies PodcastShow;
    });
}

export async function getArchiveEpisodes(
  identifier: string,
): Promise<PodcastEpisode[]> {
  const url = `${ARCHIVE_METADATA_URL}/${encodeURIComponent(identifier)}`;
  const data = await apiGet<ArchiveMetadataResponse>(url);
  const showTitle = firstString(data.metadata?.title) || identifier;
  const description =
    firstString(data.metadata?.description)?.replace(/<[^>]*>/g, ' ').trim() ?? '';
  const publishedAt = data.metadata?.date;
  const files = data.files ?? [];

  const audioFiles = files.filter(file => isPlayableAudio(file.format));
  const sorted = audioFiles
    .slice()
    .sort((a, b) => {
      const byPriority =
        formatPriority(a.format) - formatPriority(b.format);
      if (byPriority !== 0) {
        return byPriority;
      }
      const aTrack = Number(a.track ?? 0);
      const bTrack = Number(b.track ?? 0);
      return aTrack - bTrack;
    });

  const deduped = dedupeByTrackTitle(sorted);

  return deduped.map((file, index) => {
    const audioUrl = `${ARCHIVE_DOWNLOAD_URL}/${encodeURIComponent(
      identifier,
    )}/${encodeFilename(file.name)}`;

    return {
      id: `${identifier}:${file.name}`,
      title: file.title || stripExtension(file.name) || `Track ${index + 1}`,
      showTitle,
      description,
      publishedAt,
      audioUrl,
      duration: file.length,
      imageUrl: `${ARCHIVE_THUMB_URL}/${identifier}`,
    } satisfies PodcastEpisode;
  });
}

function isPlayableAudio(format?: string) {
  if (!format) {
    return false;
  }
  return /mp3|ogg vorbis|aac|m4a/i.test(format);
}

function formatPriority(format?: string) {
  if (!format) {
    return 99;
  }
  const index = audioFormatPriority.findIndex(
    candidate => candidate.toLowerCase() === format.toLowerCase(),
  );
  return index === -1 ? 50 : index;
}

function dedupeByTrackTitle<T extends {title?: string; name: string}>(
  files: T[],
) {
  const seen = new Set<string>();
  const deduped: T[] = [];
  for (const file of files) {
    const key = (file.title || stripExtension(file.name)).toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(file);
  }
  return deduped;
}

function stripExtension(name: string) {
  return name.replace(/\.[^./]+$/, '');
}

function encodeFilename(name: string) {
  return name
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');
}

function firstString(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

