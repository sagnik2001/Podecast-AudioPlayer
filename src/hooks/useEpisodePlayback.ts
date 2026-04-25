import {useCallback, useState, useSyncExternalStore} from 'react';
import {useActiveTrack, usePlaybackState} from 'react-native-track-player';

import {Episode} from '../data/episodes';
import {
  getReadyTrackId,
  isPlaybackStateLoading,
  isPlaybackStatePlaying,
  subscribeToReadyTrackId,
  toggleEpisodePlayback,
} from '../services/trackPlayer';

function useReadyTrackId() {
  return useSyncExternalStore(
    subscribeToReadyTrackId,
    getReadyTrackId,
    getReadyTrackId,
  );
}

export function useEpisodePlayback(episode: Episode, queue: Episode[] = [episode]) {
  const [isPending, setIsPending] = useState(false);
  const activeTrack = useActiveTrack();
  const playbackState = usePlaybackState();
  const readyTrackId = useReadyTrackId();

  const canPlay = Boolean(episode.audioUrl);
  const activeTrackId = activeTrack?.id ? String(activeTrack.id) : undefined;
  const isCurrentTrack = activeTrackId === episode.id;
  const stateIsPlaying = isPlaybackStatePlaying(playbackState.state);
  const stateIsLoading = isPlaybackStateLoading(playbackState.state);

  const isAudioReady =
    isCurrentTrack && Boolean(activeTrackId) && readyTrackId === activeTrackId;
  const isPlaying = isCurrentTrack && stateIsPlaying && isAudioReady;
  const isLoading =
    isCurrentTrack && (stateIsLoading || (stateIsPlaying && !isAudioReady));
  const isBusy = isPending || isLoading;

  const togglePlayback = useCallback(async () => {
    if (!canPlay || isPending) {
      return;
    }

    setIsPending(true);

    try {
      await toggleEpisodePlayback(episode, isPlaying, queue);
    } finally {
      setIsPending(false);
    }
  }, [canPlay, episode, isPending, isPlaying, queue]);

  return {
    canPlay,
    isBusy,
    isCurrentTrack,
    isLoading,
    isPlaying,
    togglePlayback,
  };
}
