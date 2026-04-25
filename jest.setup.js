/* global jest */
jest.mock('react-native-reanimated', () => {
  const {View} = require('react-native');

  return {
    __esModule: true,
    default: {
      View,
      createAnimatedComponent: component => component,
    },
    runOnJS: callback => callback,
    Easing: {
      cubic: value => value,
      out: easing => easing,
    },
    useAnimatedStyle: updater => updater(),
    useSharedValue: value => ({value}),
    withTiming: value => value,
  };
});

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const {View} = require('react-native');

  const gesture = {
    minDistance: jest.fn(() => gesture),
    onBegin: jest.fn(() => gesture),
    onFinalize: jest.fn(() => gesture),
    onUpdate: jest.fn(() => gesture),
  };

  return {
    Gesture: {
      Pan: jest.fn(() => gesture),
    },
    GestureDetector: ({children}) =>
      React.createElement(React.Fragment, null, children),
    GestureHandlerRootView: props => React.createElement(View, props),
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

jest.mock('react-native-mmkv', () => {
  const stores = new Map();

  return {
    createMMKV: ({id = 'default'} = {}) => {
      if (!stores.has(id)) {
        stores.set(id, new Map());
      }

      const store = stores.get(id);

      return {
        clearAll: jest.fn(() => store.clear()),
        getString: jest.fn(key => store.get(key)),
        set: jest.fn((key, value) => store.set(key, String(value))),
      };
    },
  };
});

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
      addEventListener: jest.fn(() => ({remove: jest.fn()})),
      add: jest.fn(),
      getActiveTrack: jest.fn(async () => undefined),
      getPlaybackState: jest.fn(async () => ({state: State.Paused})),
      getProgress: jest.fn(async () => ({
        buffered: 0,
        duration: 0,
        position: 0,
      })),
      getQueue: jest.fn(async () => []),
      pause: jest.fn(),
      play: jest.fn(),
      registerPlaybackService: jest.fn(),
      reset: jest.fn(),
      seekBy: jest.fn(),
      seekTo: jest.fn(),
      skip: jest.fn(),
      setupPlayer: jest.fn(),
      skipToNext: jest.fn(),
      skipToPrevious: jest.fn(),
      updateOptions: jest.fn(),
    },
    Capability,
    Event: {
      PlaybackActiveTrackChanged: 'playback-active-track-changed',
      PlaybackProgressUpdated: 'playback-progress-updated',
      PlaybackState: 'playback-state',
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
