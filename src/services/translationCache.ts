import {createMMKV} from 'react-native-mmkv';

import {VerseReflection, VerseTranslation} from '../content/verseTypes';

const translationStore = createMMKV({id: 'verse-translations'});
const reflectionStore = createMMKV({id: 'verse-reflections'});

export function readTranslation(cacheKey: string): VerseTranslation | undefined {
  return readJson<VerseTranslation>(translationStore, cacheKey);
}

export function writeTranslation(
  cacheKey: string,
  translation: VerseTranslation,
) {
  translationStore.set(cacheKey, JSON.stringify(translation));
}

export function readReflection(cacheKey: string): VerseReflection | undefined {
  return readJson<VerseReflection>(reflectionStore, cacheKey);
}

export function writeReflection(
  cacheKey: string,
  reflection: VerseReflection,
) {
  reflectionStore.set(cacheKey, JSON.stringify(reflection));
}

export function clearAllVerseCaches() {
  translationStore.clearAll();
  reflectionStore.clearAll();
}

function readJson<T>(
  store: ReturnType<typeof createMMKV>,
  key: string,
): T | undefined {
  const raw = store.getString(key);
  if (!raw) {
    return undefined;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}
