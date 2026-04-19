import React from 'react';
import {StyleSheet, View} from 'react-native';

type PlayPauseIconProps = {
  isPlaying: boolean;
  isBusy?: boolean;
  color?: string;
  size?: 'sm' | 'md';
};

export function PlayPauseIcon({
  isPlaying,
  isBusy = false,
  color = '#ffffff',
  size = 'md',
}: PlayPauseIconProps) {
  if (isBusy) {
    return (
      <View style={[styles.busyWrap, size === 'sm' && styles.busyWrapSm]}>
        <View style={[styles.busyDot, {backgroundColor: color}, size === 'sm' && styles.busyDotSm]} />
        <View style={[styles.busyDot, {backgroundColor: color}, styles.busyDotMid, size === 'sm' && styles.busyDotSm]} />
        <View style={[styles.busyDot, {backgroundColor: color}, size === 'sm' && styles.busyDotSm]} />
      </View>
    );
  }

  if (isPlaying) {
    return (
      <View style={[styles.pauseWrap, size === 'sm' && styles.pauseWrapSm]}>
        <View
          style={[
            styles.pauseBar,
            {backgroundColor: color},
            size === 'sm' && styles.pauseBarSm,
          ]}
        />
        <View
          style={[
            styles.pauseBar,
            {backgroundColor: color},
            size === 'sm' && styles.pauseBarSm,
          ]}
        />
      </View>
    );
  }

  return (
    <View style={[styles.playWrap, size === 'sm' && styles.playWrapSm]}>
      <View
        style={[
          styles.playTriangle,
          {borderLeftColor: color},
          size === 'sm' && styles.playTriangleSm,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  /* Play triangle */
  playWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playWrapSm: {},
  playTriangle: {
    borderBottomColor: 'transparent',
    borderBottomWidth: 7,
    borderLeftWidth: 13,
    borderTopColor: 'transparent',
    borderTopWidth: 7,
    height: 0,
    marginLeft: 2,
    width: 0,
  },
  playTriangleSm: {
    borderBottomWidth: 5.5,
    borderLeftWidth: 10,
    borderTopWidth: 5.5,
    marginLeft: 1,
  },

  /* Pause bars */
  pauseWrap: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseWrapSm: {
    gap: 3,
  },
  pauseBar: {
    borderRadius: 3,
    height: 14,
    width: 3.5,
  },
  pauseBarSm: {
    height: 11,
    width: 3,
  },

  /* Busy dots */
  busyWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3,
    justifyContent: 'center',
  },
  busyWrapSm: {
    gap: 2,
  },
  busyDot: {
    borderRadius: 999,
    height: 4,
    opacity: 0.8,
    width: 4,
  },
  busyDotMid: {
    opacity: 1,
  },
  busyDotSm: {
    height: 3,
    width: 3,
  },
});
