import {PodcastShow} from '../api/types';
import {ScriptureCollection} from './types';

export function selectCollectionPodcastShow(
  collection: ScriptureCollection,
  shows?: PodcastShow[],
) {
  if (!shows?.length) {
    return undefined;
  }

  return shows
    .map(show => ({
      score: scoreCollectionShow(collection, show),
      show,
    }))
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)[0]?.show;
}

function scoreCollectionShow(collection: ScriptureCollection, show: PodcastShow) {
  const haystack = normalize(
    `${show.title} ${show.author} ${show.genre ?? ''} ${show.feedUrl}`,
  );

  if (
    collection.audioExcludeTerms?.some(term =>
      haystack.includes(normalize(term)),
    )
  ) {
    return 0;
  }

  return collection.audioIncludeTerms.reduce((score, term) => {
    const normalizedTerm = normalize(term);

    if (!normalizedTerm || !haystack.includes(normalizedTerm)) {
      return score;
    }

    return score + (show.title.toLowerCase().includes(normalizedTerm) ? 4 : 2);
  }, 0);
}

function normalize(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}
