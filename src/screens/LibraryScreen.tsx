import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {StatusBar, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {FlashList, ListRenderItem} from '@shopify/flash-list';
import {SafeAreaView} from 'react-native-safe-area-context';

import {mapPodcastEpisodeToEpisode} from '../api/episodeMapper';
import {EpisodeCard} from '../components/EpisodeCard';
import {PlayerDock} from '../components/PlayerDock';
import {Episode, episodes, featuredEpisode, libraryStats} from '../data/episodes';
import {RootStackParamList} from '../navigation/types';
import {usePodcastDiscovery, usePodcastEpisodes} from '../queries/podcastQueries';
import {colors} from '../theme/colors';

type LibraryScreenProps = NativeStackScreenProps<RootStackParamList, 'Library'>;

const initialEpisodeCount = 8;
const episodePageSize = 6;

export function LibraryScreen({navigation}: LibraryScreenProps) {
  const [visibleEpisodeCount, setVisibleEpisodeCount] = useState(initialEpisodeCount);
  const podcastDiscovery = usePodcastDiscovery();
  const selectedShow = podcastDiscovery.data?.[0];
  const podcastEpisodes = usePodcastEpisodes(selectedShow?.feedUrl);
  const liveEpisodes =
    podcastEpisodes.data?.map(mapPodcastEpisodeToEpisode) ?? [];
  const displayEpisodes = liveEpisodes.length > 0 ? liveEpisodes : episodes;
  const currentEpisode = displayEpisodes[0] ?? featuredEpisode;
  const orderedEpisodes = useMemo(
    () =>
      displayEpisodes
        .slice()
        .sort((a, b) => (a.queuePosition ?? 99) - (b.queuePosition ?? 99)),
    [displayEpisodes],
  );
  const visibleEpisodes = orderedEpisodes.slice(0, visibleEpisodeCount);
  const hasMoreEpisodes = visibleEpisodeCount < orderedEpisodes.length;

  useEffect(() => {
    setVisibleEpisodeCount(initialEpisodeCount);
  }, [selectedShow?.feedUrl]);

  const loadMoreEpisodes = useCallback(() => {
    if (!hasMoreEpisodes) {
      return;
    }

    setVisibleEpisodeCount(count =>
      Math.min(count + episodePageSize, orderedEpisodes.length),
    );
  }, [hasMoreEpisodes, orderedEpisodes.length]);

  const renderEpisode = useCallback<ListRenderItem<Episode>>(
    ({item}) => <EpisodeCard compact episode={item} />,
    [],
  );

  const renderHeader = useCallback(
    () => (
      <View>
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.78}
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.heading}>Your Library</Text>
          <Text style={styles.subheading}>
            {selectedShow
              ? `Live episodes from ${selectedShow.title}`
              : 'Everything ready for player, storage, and database work.'}
          </Text>
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
      </View>
    ),
    [navigation, selectedShow],
  );

  const renderFooter = useCallback(
    () => (
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {hasMoreEpisodes
            ? 'Loading more episodes'
            : podcastEpisodes.isFetching
              ? 'Refreshing feed'
              : 'End of queue'}
        </Text>
      </View>
    ),
    [hasMoreEpisodes, podcastEpisodes.isFetching],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <FlashList
        contentContainerStyle={styles.content}
        data={visibleEpisodes}
        extraData={{hasMoreEpisodes, isFetching: podcastEpisodes.isFetching}}
        keyExtractor={item => item.id}
        ListFooterComponent={renderFooter}
        ListHeaderComponent={renderHeader}
        onEndReached={loadMoreEpisodes}
        onEndReachedThreshold={0.45}
        renderItem={renderEpisode}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.dock}>
        <PlayerDock episode={currentEpisode} queue={orderedEpisodes} />
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
  footer: {
    alignItems: 'center',
    paddingBottom: 10,
    paddingTop: 8,
  },
  footerText: {
    color: colors.dim,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
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
