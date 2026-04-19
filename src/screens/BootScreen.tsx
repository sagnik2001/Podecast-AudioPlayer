import React from 'react';
import {StatusBar, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import {SafeAreaView} from 'react-native-safe-area-context';

import {RootStackParamList} from '../navigation/types';
import {BrandMark} from '../components/BrandMark';
import {colors} from '../theme/colors';

type BootScreenProps = NativeStackScreenProps<RootStackParamList, 'Boot'>;

export function BootScreen({navigation}: BootScreenProps) {
  const markOpacity = useSharedValue(0);
  const markScale = useSharedValue(0.82);
  const textOpacity = useSharedValue(0);
  const textY = useSharedValue(14);
  const tagOpacity = useSharedValue(0);

  React.useEffect(() => {
    markOpacity.value = withTiming(1, {duration: 500});
    markScale.value = withTiming(1, {duration: 640});
    textOpacity.value = withDelay(280, withTiming(1, {duration: 420}));
    textY.value = withDelay(280, withTiming(0, {duration: 480}));
    tagOpacity.value = withDelay(560, withTiming(1, {duration: 400}));

    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 1600);

    return () => clearTimeout(timer);
  }, [navigation, markOpacity, markScale, tagOpacity, textOpacity, textY]);

  const markStyle = useAnimatedStyle(() => ({
    opacity: markOpacity.value,
    transform: [{scale: markScale.value}],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{translateY: textY.value}],
  }));

  const tagStyle = useAnimatedStyle(() => ({
    opacity: tagOpacity.value,
  }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.content}>
        <Animated.View style={markStyle}>
          <BrandMark size={88} />
        </Animated.View>

        <Animated.View style={[styles.copy, textStyle]}>
          <Text style={styles.brand}>Svara</Text>
          <Text style={styles.brandDevanagari}>स्वर</Text>
        </Animated.View>

        <Animated.View style={[styles.tagWrap, tagStyle]}>
          <View style={styles.tagDividerLeft} />
          <Text style={styles.tag}>स्वाध्याय</Text>
          <View style={styles.tagDividerRight} />
        </Animated.View>

        <Animated.Text style={[styles.tagEnglish, tagStyle]}>
          Sacred audio · Reading · Reflection
        </Animated.Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerDot} />
        <View style={[styles.footerDot, styles.footerDotActive]} />
        <View style={styles.footerDot} />
      </View>
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
    paddingHorizontal: 32,
  },
  copy: {
    alignItems: 'center',
    marginTop: 28,
  },
  brand: {
    color: colors.ink,
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
  },
  brandDevanagari: {
    color: colors.brand,
    fontSize: 18,
    fontWeight: '400',
    letterSpacing: 3,
    marginTop: 4,
    opacity: 0.8,
  },
  tagWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  tagDividerLeft: {
    backgroundColor: colors.brandBorder,
    flex: 1,
    height: 1,
    maxWidth: 40,
  },
  tagDividerRight: {
    backgroundColor: colors.brandBorder,
    flex: 1,
    height: 1,
    maxWidth: 40,
  },
  tag: {
    color: colors.brand,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 2,
  },
  tagEnglish: {
    color: colors.dim,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.8,
    marginTop: 10,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  footerDot: {
    backgroundColor: colors.faint,
    borderRadius: 999,
    height: 5,
    width: 5,
  },
  footerDotActive: {
    backgroundColor: colors.brand,
    width: 18,
  },
});
