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
