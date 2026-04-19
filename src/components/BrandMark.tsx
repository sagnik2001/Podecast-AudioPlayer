import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {colors} from '../theme/colors';

type BrandMarkProps = {
  size?: number;
};

export function BrandMark({size = 52}: BrandMarkProps) {
  const fontSize = Math.round(size * 0.44);
  const ringWidth = Math.max(1, size * 0.032);

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: ringWidth,
        },
      ]}>
      <View
        style={[
          styles.innerRing,
          {
            width: size * 0.72,
            height: size * 0.72,
            borderRadius: (size * 0.72) / 2,
          },
        ]}
      />
      <Text style={[styles.om, {fontSize}]}>ॐ</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.brand,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  innerRing: {
    borderColor: colors.brandTint,
    borderWidth: 1,
    position: 'absolute',
  },
  om: {
    color: colors.brand,
    fontWeight: '400',
    lineHeight: undefined,
    includeFontPadding: false,
  },
});
