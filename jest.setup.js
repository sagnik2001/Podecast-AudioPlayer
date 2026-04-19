/* global jest */
jest.mock('react-native-reanimated', () => {
  const {View} = require('react-native');

  return {
    __esModule: true,
    default: {
      View,
      createAnimatedComponent: component => component,
    },
    Easing: {
      cubic: value => value,
      out: easing => easing,
    },
    useAnimatedStyle: updater => updater(),
    useSharedValue: value => ({value}),
    withTiming: value => value,
  };
});

jest.mock('react-native-nitro-fetch', () => ({
  fetch: jest.fn(async () => ({
    json: async () => ({
      resultCount: 0,
      results: [],
    }),
    ok: true,
    status: 200,
  })),
}));

jest.mock('@shopify/flash-list', () => {
  const React = require('react');
  const {FlatList} = require('react-native');

  return {
    FlashList: props => React.createElement(FlatList, props),
  };
});

jest.mock('react-native-track-player', () => {
  const State = {
    Buffering: 'buffering',
    Paused: 'paused',
    Playing: 'playing',
    Ready: 'ready',
  };

  const Capability = {
    Pause: 'pause',
    Play: 'play',
    SeekTo: 'seek-to',
    SkipToNext: 'skip-to-next',
    SkipToPrevious: 'skip-to-previous',
  };

  return {
    __esModule: true,
    default: {
      add: jest.fn(),
      getActiveTrack: jest.fn(async () => undefined),
      pause: jest.fn(),
      play: jest.fn(),
      registerPlaybackService: jest.fn(),
      reset: jest.fn(),
      seekBy: jest.fn(),
      seekTo: jest.fn(),
      setupPlayer: jest.fn(),
      skipToNext: jest.fn(),
      skipToPrevious: jest.fn(),
      updateOptions: jest.fn(),
    },
    Capability,
    Event: {
      RemoteNext: 'remote-next',
      RemotePause: 'remote-pause',
      RemotePlay: 'remote-play',
      RemotePrevious: 'remote-previous',
      RemoteSeek: 'remote-seek',
    },
    State,
    useActiveTrack: () => undefined,
    usePlaybackState: () => ({state: State.Paused}),
    useProgress: () => ({
      buffered: 0,
      duration: 0,
      position: 0,
    }),
  };
});
