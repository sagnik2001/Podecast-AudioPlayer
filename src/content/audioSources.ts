import {PodcastShow} from '../api/types';
import {ScriptureCollection} from './types';

const bengaliSignals = ['bengali', 'bangla', 'bangali', 'বাংলা', 'বাঙ্গলা'];

export function selectCollectionPodcastShow(
  collection: ScriptureCollection,
  shows?: PodcastShow[],
) {
  if (collection.curatedPodcastShow) {
    return collection.curatedPodcastShow;
  }

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
  const title = show.title.toLowerCase();

  if (
    collection.audioExcludeTerms?.some(term =>
      haystack.includes(normalize(term)),
    )
  ) {
    return 0;
  }

  let topicScore = 0;
  for (const term of collection.audioIncludeTerms) {
    const normalizedTerm = normalize(term);
    if (!normalizedTerm || !haystack.includes(normalizedTerm)) {
      continue;
    }
    topicScore += title.includes(normalizedTerm) ? 4 : 2;
  }

  if (topicScore === 0) {
    return 0;
  }

  const bengaliBoost = bengaliSignals.some(signal =>
    haystack.includes(signal),
  )
    ? 3
    : 0;
  const archiveBoost = show.feedUrl.startsWith('archive://') ? 2 : 0;

  return topicScore + bengaliBoost + archiveBoost;
}

function normalize(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}
