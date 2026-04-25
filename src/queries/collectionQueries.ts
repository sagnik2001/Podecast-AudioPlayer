import {useQueries} from '@tanstack/react-query';

import {getPodcastEpisodes, searchPodcastsAcrossTerms} from '../api/podcastApi';
import {PodcastEpisode, PodcastShow} from '../api/types';
import {selectCollectionPodcastShow} from '../content/audioSources';
import {scriptureCollections} from '../content/collections';
import {ScriptureCollection} from '../content/types';

export type CollectionAudioResult = {
  collection: ScriptureCollection;
  episodes: PodcastEpisode[];
  show?: PodcastShow;
};

const collectionAudioStaleTime = 1000 * 60 * 5;

export function useCollectionAudioLibrary(
  collections: readonly ScriptureCollection[] = scriptureCollections,
) {
  return useQueries({
    queries: collections.map(collection => ({
      queryKey: ['collections', 'audio', collection.id],
      queryFn: () => getCollectionAudio(collection),
      staleTime: collectionAudioStaleTime,
    })),
  });
}

async function getCollectionAudio(
  collection: ScriptureCollection,
): Promise<CollectionAudioResult> {
  const curatedShow = selectCollectionPodcastShow(collection);
  const shows = curatedShow
    ? []
    : await searchPodcastsAcrossTerms(collection.audioSearchTerms, {
        limit: 12,
      });
  const show = curatedShow ?? selectCollectionPodcastShow(collection, shows);
  const episodes = show ? await getPodcastEpisodes(show.feedUrl) : [];

  return {
    collection,
    episodes,
    show,
  };
}
