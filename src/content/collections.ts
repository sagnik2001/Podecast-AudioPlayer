import {colors} from '../theme/colors';
import {ScriptureCollection} from './types';

export const scriptureCollections: ScriptureCollection[] = [
  {
    id: 'bhagavad-gita',
    title: 'Bhagavad Gita',
    subtitle: '18 chapters • Sanskrit, Hindi, English',
    description:
      'A structured study path for verse, translation, commentary, and recitation.',
    language: 'Sanskrit / Hindi / English',
    tradition: 'Vedanta',
    symbol: 'ॐ',
    accent: colors.saffron,
    textProvider: 'gita-api',
    audioSearchTerms: [
      'bhagavad gita',
      'swami sarvapriyananda gita',
      'gita sanskrit chanting',
    ],
    sections: [
      {id: 'gita-1', title: 'Chapters 1-6', subtitle: 'Karma and self-mastery'},
      {id: 'gita-2', title: 'Chapters 7-12', subtitle: 'Bhakti and knowledge'},
      {id: 'gita-3', title: 'Chapters 13-18', subtitle: 'Nature, duty, liberation'},
    ],
  },
  {
    id: 'ramcharitmanas',
    title: 'Ramcharitmanas',
    subtitle: '7 kandas • Awadhi / Hindi',
    description:
      'The devotional journey of Rama, organized by kandas for reading and listening.',
    language: 'Awadhi / Hindi',
    tradition: 'Ram Bhakti',
    symbol: 'राम',
    accent: colors.moss,
    textProvider: 'wikisource',
    audioSearchTerms: [
      'ramcharitmanas',
      'tulsidas ramayan',
      'ramcharitmanas path',
    ],
    sections: [
      {id: 'bal-kand', title: 'Bal Kand', subtitle: 'Origins and divine descent'},
      {id: 'ayodhya-kand', title: 'Ayodhya Kand', subtitle: 'Duty, exile, devotion'},
      {id: 'sundar-kand', title: 'Sundar Kand', subtitle: 'Hanuman and surrender'},
      {id: 'uttar-kand', title: 'Uttar Kand', subtitle: 'Return, rule, remembrance'},
    ],
  },
  {
    id: 'hanuman-chalisa',
    title: 'Hanuman Chalisa',
    subtitle: '40 chaupais • Hindi',
    description:
      'A concise daily practice for strength, devotion, and memorized recitation.',
    language: 'Hindi',
    tradition: 'Hanuman Bhakti',
    symbol: '॥',
    accent: colors.crimson,
    textProvider: 'local-json',
    audioSearchTerms: [
      'hanuman chalisa',
      'hanuman chalisa podcast',
      'hanuman chalisa meaning',
    ],
    sections: [
      {id: 'chalisa-doha', title: 'Opening Doha', subtitle: 'Invocation and intent'},
      {id: 'chalisa-chaupai', title: '40 Chaupais', subtitle: 'Core recitation'},
      {id: 'chalisa-closing', title: 'Closing Doha', subtitle: 'Prayer and surrender'},
    ],
  },
  {
    id: 'durga-saptashati-bengali',
    title: 'Durga Saptashati',
    subtitle: 'Bengali readings • Sanskrit / Bengali',
    description:
      'Chandi path, Devi Mahatmya readings, and Bengali devotional recitations.',
    language: 'Sanskrit / Bengali',
    tradition: 'Shakta',
    symbol: 'দুর্গা',
    accent: colors.lotus,
    textProvider: 'local-json',
    audioSearchTerms: [
      'durga saptashati bengali',
      'chandi path bengali',
      'devi mahatmya bengali',
    ],
    sections: [
      {id: 'devi-kavach', title: 'Devi Kavach', subtitle: 'Protection and invocation'},
      {id: 'argala-stotram', title: 'Argala Stotram', subtitle: 'Opening praise'},
      {id: 'saptashati', title: 'Saptashati Path', subtitle: 'Main recitation cycle'},
    ],
  },
];

export const featuredCollection = scriptureCollections[0];

export function getCollectionById(collectionId: string) {
  return scriptureCollections.find(collection => collection.id === collectionId);
}
