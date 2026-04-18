import React from 'react';
import {Image, StatusBar, StyleSheet, Text} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {SafeAreaView} from 'react-native-safe-area-context';

import {RootStackParamList} from '../navigation/types';
import {colors} from '../theme/colors';

type BootScreenProps = NativeStackScreenProps<RootStackParamList, 'Boot'>;

const splashArt = require('../assets/images/splash-art.png');

export function BootScreen({navigation}: BootScreenProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.94);
  const translateY = useSharedValue(18);

  React.useEffect(() => {
    opacity.value = withTiming(1, {duration: 420});
    scale.value = withTiming(1, {duration: 560});
    translateY.value = withTiming(0, {duration: 560});

    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 1150);

    return () => clearTimeout(timer);
  }, [navigation, opacity, scale, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{scale: scale.value}, {translateY: translateY.value}],
  }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <Animated.View style={[styles.content, animatedStyle]}>
        <Image source={splashArt} style={styles.art} />
        <Text style={styles.brand}>PocketCast Lab</Text>
        <Text style={styles.caption}>Native audio. Offline-first. Kill-proof resume.</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  art: {
    borderRadius: 8,
    height: 220,
    marginBottom: 26,
    width: 220,
  },
  brand: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 0,
  },
  caption: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 20,
    marginTop: 10,
    textAlign: 'center',
  },
});
