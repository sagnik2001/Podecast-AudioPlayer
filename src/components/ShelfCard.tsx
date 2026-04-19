import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {colors} from '../theme/colors';

type ShelfCardProps = {
  title: string;
  count: string;
  accent: string;
  onPress?: () => void;
  symbol?: string;
};

const sacredSymbols = ['ॐ', '॥', '❀', '✦', '◈', '❋'];

function getSacredSymbol(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('gita') || lower.includes('bhagavad')) return 'ॐ';
  if (lower.includes('sanskrit') || lower.includes('veda')) return '॥';
  if (lower.includes('note') || lower.includes('reflection')) return '◈';
  if (lower.includes('mantra') || lower.includes('prayer')) return '❀';
  const index = title.charCodeAt(0) % sacredSymbols.length;
  return sacredSymbols[index];
}

export function ShelfCard({title, count, accent, onPress, symbol}: ShelfCardProps) {
  const coverSymbol = symbol ?? getSacredSymbol(title);

  return (
    <TouchableOpacity activeOpacity={0.86} onPress={onPress} style={styles.wrap}>
      <View style={[styles.cover, {backgroundColor: accent}]}>
        <View style={styles.coverShade} />
        <View style={[styles.coverRing, {borderColor: 'rgba(255,255,255,0.18)'}]} />
        <View style={[styles.coverDot, {backgroundColor: 'rgba(255,255,255,0.32)'}]} />
        <Text numberOfLines={1} style={styles.coverMark}>{coverSymbol}</Text>
        <View style={styles.coverBadge}>
          <Text style={styles.coverBadgeText}>Path</Text>
        </View>
      </View>
      <View style={styles.copy}>
        <Text numberOfLines={2} style={styles.title}>
          {title}
        </Text>
        <Text numberOfLines={1} style={styles.count}>
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginRight: 14,
    width: 156,
  },
  cover: {
    aspectRatio: 1,
    borderRadius: 20,
    height: 156,
    justifyContent: 'space-between',
    overflow: 'hidden',
    padding: 12,
    width: 156,
  },
  coverShade: {
    backgroundColor: colors.black,
    bottom: 0,
    left: 0,
    opacity: 0.22,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  coverRing: {
    borderRadius: 999,
    borderWidth: 1.5,
    bottom: -32,
    height: 120,
    position: 'absolute',
    right: -28,
    width: 120,
  },
  coverDot: {
    borderRadius: 999,
    height: 8,
    position: 'absolute',
    right: 24,
    top: 24,
    width: 8,
  },
  coverMark: {
    alignSelf: 'flex-end',
    color: colors.white,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    opacity: 0.92,
  },
  coverBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.32)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  coverBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  copy: {
    paddingHorizontal: 2,
    paddingTop: 12,
  },
  title: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.1,
    lineHeight: 18,
  },
  count: {
    color: colors.dim,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});
