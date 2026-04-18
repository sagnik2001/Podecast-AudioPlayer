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
};

export const featuredEpisode: Episode = {
  id: 'phase-3',
  title: 'Kill-proof rehydration',
  show: 'Native Playback Lab',
  description:
    'Restore queue, seek position, and player state in the right order after a cold app reopen.',
  tag: 'Persistence',
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
    title: 'New Architecture setup',
    show: 'Project Foundations',
    description: 'New project init, Gradle flags, JSI readiness, and folder structure.',
    tag: 'Setup',
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
    title: 'Native audio engine',
    show: 'TrackPlayer Internals',
    description: 'Player service setup, queue hydration, background session, and controls.',
    tag: 'Audio',
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
    title: 'Offline library',
    show: 'Downloads and Database',
    description: 'Blob downloads, local file playback, WatermelonDB queries, and sync state.',
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
    title: 'Detox reopen test',
    show: 'Confidence Suite',
    description: 'Force kill, reopen, assert restored timestamp, and verify lock screen controls.',
    tag: 'Testing',
    duration: '29 min',
    published: 'Later',
    progress: 0.05,
    phase: 'Phase 5',
    accent: episodeAccents[4],
    queuePosition: 5,
  },
];

export const libraryStats = [
  {label: 'Queued', value: '12', tone: episodeAccents[0]},
  {label: 'Offline', value: '5', tone: episodeAccents[3]},
  {label: 'Synced', value: '86%', tone: episodeAccents[2]},
];

export const shelves = [
  {title: 'New Architecture', count: '5 episodes', accent: episodeAccents[0]},
  {title: 'Native Audio', count: '3 labs', accent: episodeAccents[1]},
  {title: 'Offline Mode', count: '4 tasks', accent: episodeAccents[2]},
];
