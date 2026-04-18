import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {colors} from '../theme/colors';

type ShelfCardProps = {
  title: string;
  count: string;
  accent: string;
};

export function ShelfCard({title, count, accent}: ShelfCardProps) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.art, {backgroundColor: accent}]}>
        <View style={styles.disc} />
      </View>
      <View style={styles.copy}>
        <Text numberOfLines={2} style={styles.title}>
          {title}
        </Text>
        <Text style={styles.count}>{count}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 12,
    overflow: 'hidden',
    width: 152,
  },
  art: {
    height: 88,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  disc: {
    alignSelf: 'center',
    borderColor: colors.white,
    borderRadius: 999,
    borderWidth: 18,
    height: 96,
    opacity: 0.22,
    width: 96,
  },
  copy: {
    padding: 12,
  },
  title: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 19,
  },
  count: {
    color: colors.dim,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    marginTop: 6,
  },
});
