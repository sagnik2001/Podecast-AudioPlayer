import {useCallback, useState} from 'react';
import {useActiveTrack, usePlaybackState} from 'react-native-track-player';

import {Episode} from '../data/episodes';
import {
  isPlaybackStatePlaying,
  toggleEpisodePlayback,
} from '../services/trackPlayer';

export function useEpisodePlayback(episode: Episode, queue: Episode[] = [episode]) {
  const [isBusy, setIsBusy] = useState(false);
  const activeTrack = useActiveTrack();
  const playbackState = usePlaybackState();
  const canPlay = Boolean(episode.audioUrl);
  const isCurrentTrack = activeTrack?.id === episode.id;
  const isPlaying =
    isCurrentTrack && isPlaybackStatePlaying(playbackState.state);

  const togglePlayback = useCallback(async () => {
    if (!canPlay || isBusy) {
      return;
    }

    setIsBusy(true);

    try {
      await toggleEpisodePlayback(episode, isPlaying, queue);
    } finally {
      setIsBusy(false);
    }
  }, [canPlay, episode, isBusy, isPlaying, queue]);

  return {
    canPlay,
    isBusy,
    isCurrentTrack,
    isPlaying,
    togglePlayback,
  };
}
