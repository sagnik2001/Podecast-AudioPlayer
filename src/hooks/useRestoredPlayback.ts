import {useState} from 'react';

import {
  getPlaybackSnapshotEpisode,
  readPlaybackSnapshot,
} from '../services/playbackPersistence';

export function useRestoredPlayback() {
  const [snapshot] = useState(readPlaybackSnapshot);

  return {
    episode: getPlaybackSnapshotEpisode(snapshot),
    queue: snapshot?.queue ?? [],
  };
}
