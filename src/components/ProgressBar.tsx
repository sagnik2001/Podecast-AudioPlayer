import React from 'react';
import {LayoutChangeEvent, StyleSheet, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {colors} from '../theme/colors';

type ProgressBarProps = {
  progress: number;
  accent?: string;
  height?: number;
};

export function ProgressBar({progress, accent = colors.brand, height = 5}: ProgressBarProps) {
  const trackWidth = useSharedValue(0);
  const animatedProgress = useSharedValue(0);

  React.useEffect(() => {
    animatedProgress.value = withTiming(Math.max(0, Math.min(progress, 1)), {
      duration: 650,
    });
  }, [animatedProgress, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    backgroundColor: accent,
    width: trackWidth.value * animatedProgress.value,
  }));

  const onLayout = (event: LayoutChangeEvent) => {
    trackWidth.value = event.nativeEvent.layout.width;
  };

  return (
    <View onLayout={onLayout} style={[styles.track, {height}]}>
      <Animated.View style={[styles.fill, fillStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 8,
    flex: 1,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 8,
    height: '100%',
  },
});
