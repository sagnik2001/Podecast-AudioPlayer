import {useQuery} from '@tanstack/react-query';

import {Verse, VerseReflection, VerseTranslation} from '../content/verseTypes';
import {
  readReflection,
  readTranslation,
  writeReflection,
  writeTranslation,
} from '../services/translationCache';
import {reflectOnVerse, translateVerse} from '../services/translator';

const oneWeek = 1000 * 60 * 60 * 24 * 7;

export function useVerseTranslation(collectionId: string, verse: Verse) {
  const cacheKey = `${collectionId}:${verse.id}`;

  return useQuery<VerseTranslation>({
    queryKey: ['verse-translation', cacheKey],
    queryFn: async () => {
      const cached = readTranslation(cacheKey);
      if (cached) {
        return cached;
      }
      const translation = await translateVerse(verse);
      writeTranslation(cacheKey, translation);
      return translation;
    },
    staleTime: oneWeek,
    retry: 1,
  });
}

export function useVerseReflection(collectionId: string, verse: Verse) {
  const cacheKey = `${collectionId}:${verse.id}`;

  return useQuery<VerseReflection>({
    queryKey: ['verse-reflection', cacheKey],
    queryFn: async () => {
      const cached = readReflection(cacheKey);
      if (cached) {
        return cached;
      }
      const reflection = await reflectOnVerse(verse);
      writeReflection(cacheKey, reflection);
      return reflection;
    },
    staleTime: oneWeek,
    retry: 1,
  });
}
