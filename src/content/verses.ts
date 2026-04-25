import {Verse} from './verseTypes';

const gitaVerses: Verse[] = [
  {
    id: 'gita-1-1',
    reference: 'Bhagavad Gita 1.1',
    sourceLanguage: 'Sanskrit',
    text: 'धृतराष्ट्र उवाच।\nधर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः।\nमामकाः पाण्डवाश्चैव किमकुर्वत सञ्जय।।',
    transliteration:
      'dhṛtarāṣṭra uvāca\ndharma-kṣetre kuru-kṣetre samavetā yuyutsavaḥ\nmāmakāḥ pāṇḍavāś caiva kim akurvata sañjaya',
  },
  {
    id: 'gita-2-47',
    reference: 'Bhagavad Gita 2.47',
    sourceLanguage: 'Sanskrit',
    text: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि।।',
    transliteration:
      'karmaṇy evādhikāras te mā phaleṣu kadācana\nmā karma-phala-hetur bhūr mā te saṅgo \'stv akarmaṇi',
  },
  {
    id: 'gita-4-7',
    reference: 'Bhagavad Gita 4.7',
    sourceLanguage: 'Sanskrit',
    text: 'यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।\nअभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्।।',
    transliteration:
      'yadā yadā hi dharmasya glānir bhavati bhārata\nabhyutthānam adharmasya tadātmānaṁ sṛjāmy aham',
  },
  {
    id: 'gita-18-66',
    reference: 'Bhagavad Gita 18.66',
    sourceLanguage: 'Sanskrit',
    text: 'सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज।\nअहं त्वा सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः।।',
    transliteration:
      'sarva-dharmān parityajya mām ekaṁ śaraṇaṁ vraja\nahaṁ tvā sarva-pāpebhyo mokṣayiṣyāmi mā śucaḥ',
  },
];

const hanumanChalisaBengaliVerses: Verse[] = [
  {
    id: 'chalisa-opening-doha-1',
    reference: 'Hanuman Chalisa • Opening Doha 1',
    sourceLanguage: 'Awadhi (Bengali script)',
    text: 'শ্রী গুরু চরণ সরোজ রজ, নিজমন মুকুর সুধারি।\nবরণৌঁ রঘুবর বিমল যশ, জো দায়ক ফল চারি।।',
    transliteration:
      'śrī guru caraṇa saroja raja, nija-mana mukura sudhāri\nbaraṇauṁ raghubara bimala yaśa, jo dāyaka phala cāri',
  },
  {
    id: 'chalisa-opening-doha-2',
    reference: 'Hanuman Chalisa • Opening Doha 2',
    sourceLanguage: 'Awadhi (Bengali script)',
    text: 'বুদ্ধিহীন তনু জানিকে, সুমিরৌঁ পবন কুমার।\nবল বুদ্ধি বিদ্যা দেহু মোহি, হরহু কলেশ বিকার।।',
    transliteration:
      'buddhihīna tanu jānike, sumirauṁ pavana kumāra\nbala buddhi vidyā dehu mohi, harahu kaleśa bikāra',
  },
  {
    id: 'chalisa-chaupai-1',
    reference: 'Hanuman Chalisa • Chaupai 1',
    sourceLanguage: 'Awadhi (Bengali script)',
    text: 'জয় হনুমান জ্ঞান গুণ সাগর।\nজয় কপীশ তিহুঁ লোক উজাগর।।',
    transliteration:
      'jaya hanumāna jñāna guṇa sāgara\njaya kapīśa tihuṁ loka ujāgara',
  },
  {
    id: 'chalisa-chaupai-2',
    reference: 'Hanuman Chalisa • Chaupai 2',
    sourceLanguage: 'Awadhi (Bengali script)',
    text: 'রামদূত অতুলিত বলধামা।\nঅঞ্জনি পুত্র পবনসুত নামা।।',
    transliteration:
      'rāmadūta atulita bala-dhāmā\nañjani putra pavana-suta nāmā',
  },
  {
    id: 'chalisa-chaupai-7',
    reference: 'Hanuman Chalisa • Chaupai 7',
    sourceLanguage: 'Awadhi (Bengali script)',
    text: 'বিদ্যাবান গুণী অতি চাতুর।\nরাম কাজ করিবে কো আতুর।।',
    transliteration:
      'vidyāvāna guṇī ati cātura\nrāma kāja karibe ko ātura',
  },
  {
    id: 'chalisa-closing-doha',
    reference: 'Hanuman Chalisa • Closing Doha',
    sourceLanguage: 'Awadhi (Bengali script)',
    text: 'পবনতনয় সঙ্কট হরণ, মঙ্গল মূরতি রূপ।\nরাম লখন সীতা সহিত, হৃদয় বসহু সুর ভূপ।।',
    transliteration:
      'pavana-tanaya saṅkaṭa haraṇa, maṅgala mūrati rūpa\nrāma lakhana sītā sahita, hṛdaya basahu sura bhūpa',
  },
];

const versesByCollection: Record<string, Verse[]> = {
  'bhagavad-gita': gitaVerses,
  'hanuman-chalisa-bengali': hanumanChalisaBengaliVerses,
};

export function getVersesForCollection(collectionId: string): Verse[] {
  return versesByCollection[collectionId] ?? [];
}

export function hasReadContent(collectionId: string): boolean {
  return (versesByCollection[collectionId]?.length ?? 0) > 0;
}
