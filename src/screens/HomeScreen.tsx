import React from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {EpisodeCard} from '../components/EpisodeCard';
import {PlayerDock} from '../components/PlayerDock';
import {ShelfCard} from '../components/ShelfCard';
import {featuredEpisode, episodes, libraryStats, shelves} from '../data/episodes';
import {RootStackParamList} from '../navigation/types';
import {colors} from '../theme/colors';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const splashArt = require('../assets/images/splash-art.png');

export function HomeScreen({navigation}: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>PocketCast Lab</Text>
            <Text style={styles.heading}>Good evening</Text>
          </View>
          <TouchableOpacity activeOpacity={0.8} style={styles.avatar}>
            <Text style={styles.avatarText}>S</Text>
          </TouchableOpacity>
        </View>

        <ImageBackground
          imageStyle={styles.heroImage}
          source={splashArt}
          style={styles.hero}>
          <View style={styles.heroShade} />
          <View style={styles.heroCopy}>
            <Text style={styles.heroKicker}>Continue listening</Text>
            <Text style={styles.heroTitle}>{featuredEpisode.title}</Text>
            <Text style={styles.heroBody}>{featuredEpisode.description}</Text>
          </View>
          <View style={styles.heroFooter}>
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Ready for TrackPlayer</Text>
            </View>
            <TouchableOpacity activeOpacity={0.82} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Resume</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        <View style={styles.statsRow}>
          {libraryStats.map(stat => (
            <View key={stat.label} style={styles.stat}>
              <View style={[styles.statBar, {backgroundColor: stat.tone}]} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Made for the build</Text>
        </View>
        <ScrollView
          contentContainerStyle={styles.shelfRow}
          horizontal
          showsHorizontalScrollIndicator={false}>
          {shelves.map(shelf => (
            <ShelfCard
              accent={shelf.accent}
              count={shelf.count}
              key={shelf.title}
              title={shelf.title}
            />
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Build journey</Text>
          <TouchableOpacity activeOpacity={0.78} onPress={() => navigation.navigate('Library')}>
            <Text style={styles.sectionAction}>View all</Text>
          </TouchableOpacity>
        </View>

        {episodes.slice(0, 4).map(episode => (
          <EpisodeCard episode={episode} key={episode.id} />
        ))}
      </ScrollView>

      <View style={styles.dock}>
        <PlayerDock episode={featuredEpisode} />
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
    paddingBottom: 136,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  eyebrow: {
    color: colors.brand,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  heading: {
    color: colors.ink,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 0,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  avatarText: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0,
  },
  hero: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 8,
    height: 294,
    justifyContent: 'space-between',
    marginBottom: 14,
    overflow: 'hidden',
    padding: 18,
  },
  heroImage: {
    borderRadius: 8,
    opacity: 0.72,
  },
  heroShade: {
    backgroundColor: colors.black,
    bottom: 0,
    left: 0,
    opacity: 0.34,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  heroCopy: {
    minWidth: 0,
  },
  heroKicker: {
    color: colors.amber,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    marginBottom: 7,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: colors.ink,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 42,
    maxWidth: 290,
  },
  heroBody: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 20,
    maxWidth: 304,
    marginTop: 9,
    opacity: 0.82,
  },
  heroFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  livePill: {
    alignItems: 'center',
    backgroundColor: 'rgba(9, 11, 11, 0.66)',
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },
  liveDot: {
    backgroundColor: colors.brand,
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  liveText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
  },
  primaryButton: {
    backgroundColor: colors.brand,
    borderRadius: 8,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  stat: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  statBar: {
    borderRadius: 999,
    height: 4,
    marginBottom: 13,
    width: 32,
  },
  statValue: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: 0,
  },
  statLabel: {
    color: colors.dim,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    marginTop: 3,
    textTransform: 'uppercase',
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 2,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
  },
  sectionAction: {
    color: colors.brand,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
  },
  shelfRow: {
    paddingBottom: 22,
  },
  dock: {
    bottom: 0,
    left: 0,
    paddingBottom: 12,
    paddingHorizontal: 14,
    position: 'absolute',
    right: 0,
  },
});
