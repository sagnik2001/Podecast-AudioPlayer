export type ITunesPodcastResult = {
  wrapperType?: string;
  kind?: string;
  collectionId: number;
  trackId?: number;
  artistName?: string;
  collectionName?: string;
  trackName?: string;
  feedUrl?: string;
  artworkUrl100?: string;
  artworkUrl600?: string;
  primaryGenreName?: string;
  genres?: string[];
};

export type ITunesSearchResponse = {
  resultCount: number;
  results: ITunesPodcastResult[];
};

export type PodcastShow = {
  id: string;
  title: string;
  author: string;
  feedUrl: string;
  artworkUrl?: string;
  genre?: string;
};

export type Rss2JsonEnclosure = {
  link?: string;
  type?: string;
  length?: number;
  duration?: number | string;
};

export type Rss2JsonItem = {
  guid?: string;
  title?: string;
  pubDate?: string;
  link?: string;
  author?: string;
  thumbnail?: string;
  image?: string;
  description?: string;
  content?: string;
  enclosure?: Rss2JsonEnclosure;
};

export type Rss2JsonResponse = {
  status: 'ok' | string;
  message?: string;
  feed?: {
    url?: string;
    title?: string;
    link?: string;
    author?: string;
    description?: string;
    image?: string;
  };
  items?: Rss2JsonItem[];
};

export type PodcastEpisode = {
  id: string;
  title: string;
  showTitle: string;
  description: string;
  publishedAt?: string;
  audioUrl?: string;
  duration?: number | string;
  imageUrl?: string;
};
