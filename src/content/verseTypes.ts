export type Verse = {
  id: string;
  reference: string;
  sourceLanguage: string;
  text: string;
  transliteration?: string;
};

export type VerseTranslation = {
  hindi: string;
  english: string;
  translatedAt: number;
};

export type VerseReflection = {
  theme: string;
  reflection: string;
  practice: string;
  reflectedAt: number;
};
