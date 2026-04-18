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
