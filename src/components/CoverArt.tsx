import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';

import {colors} from '../theme/colors';

type CoverArtProps = {
  accent: string;
  phase: string;
  imageUrl?: string;
  size?: number;
};

export function CoverArt({accent, phase, imageUrl, size = 92}: CoverArtProps) {
  const compact = size < 82;
  const initials = getInitials(phase);
  const [imageFailed, setImageFailed] = useState(false);
  const shouldShowImage = Boolean(imageUrl) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  return (
    <View
      style={[
        styles.cover,
        shouldShowImage ? styles.imageCover : styles.fallbackCover,
        {
          backgroundColor: accent,
          width: size,
          height: size,
        },
      ]}>
      {shouldShowImage ? (
        <>
          <Image
            onError={() => setImageFailed(true)}
            resizeMode="cover"
            source={{uri: imageUrl}}
            style={styles.image}
          />
          <View style={styles.imageShade} />
          <View style={styles.imageSheen} />
        </>
      ) : (
        <>
          <View style={styles.fallbackShade} />
          <View style={styles.discOuter} />
          <View style={styles.discInner} />
          <View style={styles.cornerPlate}>
            <Text style={[styles.phase, compact && styles.phaseCompact]}>
              {phase}
            </Text>
          </View>
          <Text style={[styles.mark, compact && styles.markCompact]}>
            {initials}
          </Text>
        </>
      )}
    </View>
  );
}

function getInitials(label: string) {
  const words = label
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return 'PL';
  }

  return words
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase();
}

const styles = StyleSheet.create({
  cover: {
    borderRadius: 8,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: {
      height: 8,
      width: 0,
    },
    shadowOpacity: 0.24,
    shadowRadius: 16,
  },
  imageCover: {
    borderColor: colors.line,
    borderWidth: 1,
    padding: 0,
  },
  fallbackCover: {
    borderColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    padding: 10,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  imageShade: {
    backgroundColor: colors.black,
    bottom: 0,
    left: 0,
    opacity: 0.08,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  imageSheen: {
    backgroundColor: colors.white,
    height: '54%',
    left: '-28%',
    opacity: 0.1,
    position: 'absolute',
    top: '-26%',
    transform: [{rotate: '-28deg'}],
    width: '116%',
  },
  fallbackShade: {
    backgroundColor: colors.black,
    bottom: 0,
    left: 0,
    opacity: 0.2,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  discOuter: {
    borderColor: colors.white,
    borderRadius: 999,
    borderWidth: 1,
    bottom: '-18%',
    height: '84%',
    opacity: 0.24,
    position: 'absolute',
    right: '-26%',
    width: '84%',
  },
  discInner: {
    backgroundColor: colors.white,
    borderRadius: 999,
    bottom: '18%',
    height: 12,
    opacity: 0.3,
    position: 'absolute',
    right: '16%',
    width: 12,
  },
  cornerPlate: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.26)',
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: 7,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  phase: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0,
  },
  phaseCompact: {
    fontSize: 9,
  },
  mark: {
    alignSelf: 'flex-end',
    color: colors.white,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 28,
    opacity: 0.9,
  },
  markCompact: {
    fontSize: 19,
    lineHeight: 22,
  },
});
