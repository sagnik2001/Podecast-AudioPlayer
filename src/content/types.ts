import type {PodcastShow} from '../api/types';

export type CollectionProvider = 'gita-api' | 'wikisource' | 'local-json';

export type CollectionSection = {
  id: string;
  title: string;
  subtitle: string;
};

export type ScriptureCollection = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  language: string;
  tradition: string;
  symbol: string;
  accent: string;
  textProvider: CollectionProvider;
  curatedPodcastShow?: PodcastShow;
  audioSearchTerms: string[];
  audioIncludeTerms: string[];
  audioExcludeTerms?: string[];
  sections: CollectionSection[];
};
