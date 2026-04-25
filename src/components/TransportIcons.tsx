import React from 'react';
import {StyleSheet, View} from 'react-native';

type TransportIconProps = {
  color?: string;
};

export function PrevTrackIcon({color = '#ffffff'}: TransportIconProps) {
  return (
    <View style={styles.transportWrap}>
      <View style={[styles.bar, {backgroundColor: color}]} />
      <View
        style={[
          styles.triangleLeft,
          {borderRightColor: color},
        ]}
      />
    </View>
  );
}

export function NextTrackIcon({color = '#ffffff'}: TransportIconProps) {
  return (
    <View style={styles.transportWrap}>
      <View
        style={[
          styles.triangleRight,
          {borderLeftColor: color},
        ]}
      />
      <View style={[styles.bar, {backgroundColor: color}]} />
    </View>
  );
}

type AutoplayIconProps = TransportIconProps & {
  active: boolean;
};

export function AutoplayIcon({active, color = '#ffffff'}: AutoplayIconProps) {
  const tint = active ? color : `${color}88`;
  return (
    <View style={styles.autoplayWrap}>
      <View style={[styles.autoplayRing, {borderColor: tint}]} />
      <View
        style={[
          styles.autoplayArrow,
          {borderLeftColor: tint},
        ]}
      />
      {!active ? (
        <View style={[styles.autoplaySlash, {backgroundColor: tint}]} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  transportWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
    justifyContent: 'center',
  },
  bar: {
    borderRadius: 1.5,
    height: 12,
    width: 2.5,
  },
  triangleLeft: {
    borderBottomColor: 'transparent',
    borderBottomWidth: 6,
    borderRightWidth: 10,
    borderTopColor: 'transparent',
    borderTopWidth: 6,
    height: 0,
    width: 0,
  },
  triangleRight: {
    borderBottomColor: 'transparent',
    borderBottomWidth: 6,
    borderLeftWidth: 10,
    borderTopColor: 'transparent',
    borderTopWidth: 6,
    height: 0,
    width: 0,
  },

  autoplayWrap: {
    alignItems: 'center',
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  autoplayRing: {
    borderRadius: 9,
    borderWidth: 1.6,
    height: 14,
    width: 14,
  },
  autoplayArrow: {
    borderBottomColor: 'transparent',
    borderBottomWidth: 3.5,
    borderLeftWidth: 5,
    borderTopColor: 'transparent',
    borderTopWidth: 3.5,
    height: 0,
    position: 'absolute',
    right: 1,
    top: 5,
    width: 0,
  },
  autoplaySlash: {
    borderRadius: 1,
    height: 1.6,
    position: 'absolute',
    transform: [{rotate: '45deg'}],
    width: 18,
  },
});
