import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {colors} from '../theme/colors';

type OfflineEmptyStateProps = {
  downloadedCount: number;
  onOpenDownloads: () => void;
};

export function OfflineEmptyState({
  downloadedCount,
  onOpenDownloads,
}: OfflineEmptyStateProps) {
  const hasDownloads = downloadedCount > 0;
  return (
    <View style={styles.empty}>
      <View style={styles.glyphRing}>
        <Text style={styles.glyph}>⌁</Text>
      </View>
      <Text style={styles.eyebrow}>✦ You're offline ✦</Text>
      <Text style={styles.title}>
        {hasDownloads ? 'Listen from your library' : 'Connect to gather teachings'}
      </Text>
      <Text style={styles.body}>
        {hasDownloads
          ? `You have ${downloadedCount} session${
              downloadedCount === 1 ? '' : 's'
            } saved offline. Continue your sadhana without a signal.`
          : 'Live recitations and lectures need a network connection. Save episodes to your downloads to listen anywhere — even on a flight.'}
      </Text>
      {hasDownloads ? (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onOpenDownloads}
          style={styles.primary}>
          <Text style={styles.primaryGlyph}>↓</Text>
          <Text style={styles.primaryText}>
            Open downloads · {downloadedCount}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.hint}>
          <Text style={styles.hintGlyph}>ⓘ</Text>
          <Text style={styles.hintText}>
            Tap the ↓ icon on any episode while online to save it.
          </Text>
        </View>
      )}
    </View>
  );
}

type OfflineBannerProps = {
  downloadedCount: number;
  onOpenDownloads: () => void;
};

export function OfflineBanner({
  downloadedCount,
  onOpenDownloads,
}: OfflineBannerProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onOpenDownloads}
      style={styles.banner}>
      <View style={styles.bannerDot} />
      <View style={styles.bannerText}>
        <Text style={styles.bannerTitle}>Listening offline</Text>
        <Text style={styles.bannerSub}>
          Showing {downloadedCount} saved session
          {downloadedCount === 1 ? '' : 's'}
        </Text>
      </View>
      <Text style={styles.bannerChevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.brandBorder,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingVertical: 28,
  },
  glyphRing: {
    alignItems: 'center',
    backgroundColor: colors.brandTint,
    borderColor: colors.brandBorder,
    borderRadius: 999,
    borderWidth: 1,
    height: 64,
    justifyContent: 'center',
    marginBottom: 16,
    width: 64,
  },
  glyph: {
    color: colors.brand,
    fontSize: 28,
    fontWeight: '700',
  },
  eyebrow: {
    color: colors.brand,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 8,
    textAlign: 'center',
  },
  body: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 19,
    marginBottom: 18,
    textAlign: 'center',
  },
  primary: {
    alignItems: 'center',
    backgroundColor: colors.brand,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 13,
  },
  primaryGlyph: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '900',
  },
  primaryText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  hint: {
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  hintGlyph: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: '700',
  },
  hintText: {
    color: colors.muted,
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },

  banner: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.brandBorder,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bannerDot: {
    backgroundColor: colors.brand,
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  bannerSub: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  bannerChevron: {
    color: colors.brand,
    fontSize: 20,
    fontWeight: '700',
  },
});
