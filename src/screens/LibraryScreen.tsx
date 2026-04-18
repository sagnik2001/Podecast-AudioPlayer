import React from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {EpisodeCard} from '../components/EpisodeCard';
import {PlayerDock} from '../components/PlayerDock';
import {episodes, featuredEpisode, libraryStats} from '../data/episodes';
import {RootStackParamList} from '../navigation/types';
import {colors} from '../theme/colors';

type LibraryScreenProps = NativeStackScreenProps<RootStackParamList, 'Library'>;

export function LibraryScreen({navigation}: LibraryScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.78}
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.heading}>Your Library</Text>
          <Text style={styles.subheading}>Everything ready for player, storage, and database work.</Text>
        </View>

        <View style={styles.stats}>
          {libraryStats.map(stat => (
            <View key={stat.label} style={styles.stat}>
              <View style={[styles.statDot, {backgroundColor: stat.tone}]} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Queue order</Text>
        {episodes
          .slice()
          .sort((a, b) => (a.queuePosition ?? 99) - (b.queuePosition ?? 99))
          .map(episode => (
            <EpisodeCard compact episode={episode} key={episode.id} />
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
    paddingBottom: 134,
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  header: {
    marginBottom: 22,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  backText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
  },
  heading: {
    color: colors.ink,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0,
  },
  subheading: {
    color: colors.muted,
    fontSize: 15,
    letterSpacing: 0,
    lineHeight: 21,
    marginTop: 8,
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 26,
  },
  stat: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 13,
  },
  statDot: {
    borderRadius: 999,
    height: 7,
    marginBottom: 12,
    width: 28,
  },
  statValue: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
  },
  statLabel: {
    color: colors.dim,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    marginTop: 3,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 12,
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
