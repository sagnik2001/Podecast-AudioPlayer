import {episodeAccents} from '../theme/colors';

export type Episode = {
  id: string;
  title: string;
  show: string;
  description: string;
  tag: string;
  duration: string;
  published: string;
  progress: number;
  phase: string;
  accent: string;
  downloaded?: boolean;
  queuePosition?: number;
  audioUrl?: string;
  imageUrl?: string;
};

export const featuredEpisode: Episode = {
  id: 'phase-3',
  title: 'The discipline of attention',
  show: 'Gita Study',
  description:
    'A focused listening session with verse, translation, and notes prepared for review.',
  tag: 'Reading',
  duration: '38 min',
  published: 'Today',
  progress: 0.62,
  phase: 'Phase 3',
  accent: episodeAccents[0],
  downloaded: true,
  queuePosition: 1,
};

export const episodes: Episode[] = [
  {
    id: 'phase-1',
    title: 'Morning recitation',
    show: 'Sanskrit Foundations',
    description: 'Slow audio with transliteration, repetition, and a clean reading pane.',
    tag: 'Audio',
    duration: '24 min',
    published: 'Apr 18',
    progress: 0.9,
    phase: 'Phase 1',
    accent: episodeAccents[3],
    downloaded: true,
    queuePosition: 4,
  },
  {
    id: 'phase-2',
    title: 'Commentary notes',
    show: 'Study Companion',
    description: 'Short explanation blocks saved beside the current audio position.',
    tag: 'Notes',
    duration: '31 min',
    published: 'Next',
    progress: 0.46,
    phase: 'Phase 2',
    accent: episodeAccents[1],
    queuePosition: 2,
  },
  featuredEpisode,
  {
    id: 'phase-4',
    title: 'Offline chapter pack',
    show: 'Library',
    description: 'Downloaded audio, translation, and commentary ready without network.',
    tag: 'Offline',
    duration: '42 min',
    published: 'Queued',
    progress: 0.18,
    phase: 'Phase 4',
    accent: episodeAccents[2],
    queuePosition: 3,
  },
  {
    id: 'phase-5',
    title: 'Resume from memory',
    show: 'Listening History',
    description: 'Return to the exact verse, timestamp, and reading mode after reopening.',
    tag: 'Resume',
    duration: '29 min',
    published: 'Later',
    progress: 0.05,
    phase: 'Phase 5',
    accent: episodeAccents[4],
    queuePosition: 5,
  },
];

export const libraryStats = [
  {label: 'Sessions', value: '12', tone: episodeAccents[0]},
  {label: 'Offline', value: '5', tone: episodeAccents[3]},
  {label: 'Read', value: '86%', tone: episodeAccents[2]},
];

export const shelves = [
  {title: 'Bhagavad Gita', count: '18 chapters', accent: episodeAccents[0]},
  {title: 'Sanskrit Basics', count: '12 readings', accent: episodeAccents[1]},
  {title: 'Saved Notes', count: '8 reflections', accent: episodeAccents[2]},
];
