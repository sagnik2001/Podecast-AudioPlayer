import React, {useCallback, useEffect, useRef} from 'react';
import {LayoutChangeEvent, StyleSheet, View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {colors} from '../theme/colors';

type SeekBarProps = {
  accent?: string;
  buffered?: number;
  duration: number;
  height?: number;
  onSeek: (seconds: number) => Promise<void> | void;
  position: number;
};

const thumbSize = 16;
const hitSlopVertical = 14;

export function SeekBar({
  accent = colors.brand,
  buffered = 0,
  duration,
  height = 6,
  onSeek,
  position,
}: SeekBarProps) {
  const releaseScrubTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const width = useSharedValue(0);
  const progress = useSharedValue(0);
  const bufferedProgress = useSharedValue(0);
  const isScrubbing = useSharedValue(false);

  const syncProgress = useCallback(() => {
    const nextProgress = getProgressRatio(position, duration);
    const nextBufferedProgress = getProgressRatio(buffered, duration);

    bufferedProgress.value = withTiming(nextBufferedProgress, {duration: 180});

    if (!isScrubbing.value) {
      progress.value = withTiming(nextProgress, {duration: 180});
    }
  }, [buffered, bufferedProgress, duration, isScrubbing, position, progress]);

  useEffect(() => {
    syncProgress();
  }, [syncProgress]);

  useEffect(
    () => () => {
      if (releaseScrubTimeoutRef.current) {
        clearTimeout(releaseScrubTimeoutRef.current);
      }
    },
    [],
  );

  const onLayout = (event: LayoutChangeEvent) => {
    width.value = event.nativeEvent.layout.width;
  };

  const commitSeek = useCallback(
    async (ratio: number) => {
      if (releaseScrubTimeoutRef.current) {
        clearTimeout(releaseScrubTimeoutRef.current);
      }

      try {
        await onSeek(clampJS(ratio, 0, 1) * duration);
      } finally {
        releaseScrubTimeoutRef.current = setTimeout(() => {
          isScrubbing.value = false;
        }, 450);
      }
    },
    [duration, isScrubbing, onSeek],
  );

  const gesture = Gesture.Pan()
    .minDistance(0)
    .onBegin(event => {
      const ratio = getRatioFromX(event.x, width.value);

      isScrubbing.value = true;
      progress.value = ratio;
    })
    .onUpdate(event => {
      progress.value = getRatioFromX(event.x, width.value);
    })
    .onFinalize(() => {
      runOnJS(commitSeek)(progress.value);
    });

  const fillStyle = useAnimatedStyle(() => ({
    width: progress.value * width.value,
  }));

  const bufferedStyle = useAnimatedStyle(() => ({
    width: bufferedProgress.value * width.value,
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: progress.value * width.value - thumbSize / 2,
      },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View
        onLayout={onLayout}
        style={[
          styles.hitArea,
          {
            paddingVertical: hitSlopVertical,
          },
        ]}>
        <View style={[styles.track, {height}]}>
          <Animated.View style={[styles.buffered, bufferedStyle]} />
          <Animated.View
            style={[styles.fill, {backgroundColor: accent}, fillStyle]}
          />
          <Animated.View
            style={[
              styles.thumb,
              {
                backgroundColor: accent,
                top: -(thumbSize - height) / 2,
              },
              thumbStyle,
            ]}
          />
        </View>
      </View>
    </GestureDetector>
  );
}

function getProgressRatio(position: number, duration: number) {
  if (!Number.isFinite(position) || !Number.isFinite(duration) || duration <= 0) {
    return 0;
  }

  return clampJS(position / duration, 0, 1);
}

function getRatioFromX(x: number, width: number) {
  'worklet';

  if (width <= 0) {
    return 0;
  }

  const ratio = x / width;

  if (ratio < 0) {
    return 0;
  }

  if (ratio > 1) {
    return 1;
  }

  return ratio;
}

function clampJS(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const styles = StyleSheet.create({
  hitArea: {
    flex: 1,
    justifyContent: 'center',
  },
  track: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: 999,
    overflow: 'visible',
    width: '100%',
  },
  buffered: {
    backgroundColor: 'rgba(247,237,216,0.22)',
    borderRadius: 999,
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
  },
  fill: {
    borderRadius: 999,
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
  },
  thumb: {
    borderColor: colors.background,
    borderRadius: 999,
    borderWidth: 3,
    height: thumbSize,
    left: 0,
    position: 'absolute',
    shadowColor: colors.black,
    shadowOffset: {height: 3, width: 0},
    shadowOpacity: 0.35,
    shadowRadius: 6,
    width: thumbSize,
  },
});
