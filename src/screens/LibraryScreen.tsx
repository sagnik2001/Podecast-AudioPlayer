import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {StatusBar, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {FlashList, ListRenderItem} from '@shopify/flash-list';
import {SafeAreaView} from 'react-native-safe-area-context';

import {mapPodcastEpisodeToEpisode} from '../api/episodeMapper';
import {EpisodeCard} from '../components/EpisodeCard';
import {PlayerDock} from '../components/PlayerDock';
import {Episode} from '../data/episodes';
import {RootStackParamList} from '../navigation/types';
import {
  CollectionAudioResult,
  useCollectionAudioLibrary,
} from '../queries/collectionQueries';
import {colors} from '../theme/colors';

type LibraryScreenProps = NativeStackScreenProps<RootStackParamList, 'Library'>;

const initialEpisodeCount = 10;
const episodePageSize = 8;

type LibraryFilter = 'all' | 'inProgress' | 'saved' | 'fresh';

const filters: {id: LibraryFilter; label: string}[] = [
  {id: 'all', label: 'All'},
  {id: 'inProgress', label: 'In progress'},
  {id: 'saved', label: 'Saved'},
  {id: 'fresh', label: 'Fresh'},
];

function isCollectionAudioResult(
  result: CollectionAudioResult | undefined,
): result is CollectionAudioResult {
  return Boolean(result);
}

export function LibraryScreen({navigation}: LibraryScreenProps) {
  const [visibleEpisodeCount, setVisibleEpisodeCount] = useState(initialEpisodeCount);
  const [activeFilter, setActiveFilter] = useState<LibraryFilter>('all');
  const collectionAudioQueries = useCollectionAudioLibrary();
  const collectionAudioResults = collectionAudioQueries
    .map(query => query.data)
    .filter(isCollectionAudioResult);
  const displayEpisodes = useMemo(
    () =>
      collectionAudioResults
        .flatMap(result =>
          result.episodes.map((podcastEpisode, index) => {
            const episode = mapPodcastEpisodeToEpisode(podcastEpisode, index);

            return {
              ...episode,
              accent: result.collection.accent,
              id: `${result.collection.id}-${episode.id}`,
              phase: result.collection.symbol,
              queuePosition: index + 1,
              show: result.collection.title,
              tag: result.show?.title ?? episode.tag,
            };
          }),
        )
        .map((episode, index) => ({
          ...episode,
          queuePosition: index + 1,
        })),
    [collectionAudioResults],
  );
  const isLoadingRealData = collectionAudioQueries.some(query => query.isLoading);
  const isFetchingRealData = collectionAudioQueries.some(query => query.isFetching);
  const realDataError = collectionAudioQueries.find(query => query.error)?.error;
  const loadedCollectionCount = collectionAudioResults.filter(
    result => result.episodes.length > 0,
  ).length;
  const orderedEpisodes = useMemo(
    () =>
      displayEpisodes
        .slice()
        .sort((a, b) => (a.queuePosition ?? 99) - (b.queuePosition ?? 99)),
    [displayEpisodes],
  );

  const filteredEpisodes = useMemo(() => {
    if (activeFilter === 'inProgress') {
      return orderedEpisodes.filter(
        episode => episode.progress > 0.02 && episode.progress < 0.98,
      );
    }

    if (activeFilter === 'saved') {
      return orderedEpisodes.filter(episode => episode.downloaded);
    }

    if (activeFilter === 'fresh') {
      return orderedEpisodes.filter(episode => episode.progress < 0.02);
    }

    return orderedEpisodes;
  }, [activeFilter, orderedEpisodes]);

  const currentEpisode = orderedEpisodes[0];
  const visibleEpisodes = filteredEpisodes.slice(0, visibleEpisodeCount);
  const hasMoreEpisodes = visibleEpisodeCount < filteredEpisodes.length;

  const totals = useMemo(() => {
    const playable = orderedEpisodes.filter(episode => episode.audioUrl).length;
    const inProgress = orderedEpisodes.filter(
      episode => episode.progress > 0.02 && episode.progress < 0.98,
    ).length;
    return {
      sessions: orderedEpisodes.length,
      playable,
      inProgress,
    };
  }, [orderedEpisodes]);

  useEffect(() => {
    setVisibleEpisodeCount(initialEpisodeCount);
  }, [activeFilter, displayEpisodes.length]);

  const loadMoreEpisodes = useCallback(() => {
    if (!hasMoreEpisodes) {
      return;
    }

    setVisibleEpisodeCount(count =>
      Math.min(count + episodePageSize, filteredEpisodes.length),
    );
  }, [hasMoreEpisodes, filteredEpisodes.length]);

  const renderEpisode = useCallback<ListRenderItem<Episode>>(
    ({item}) => <EpisodeCard compact episode={item} queue={orderedEpisodes} />,
    [orderedEpisodes],
  );

  const renderHeader = useCallback(
    () => (
      <View>
        <View style={styles.topBar}>
          <TouchableOpacity
            activeOpacity={0.78}
            onPress={() => navigation.goBack()}
            style={styles.iconButton}>
            <Text style={styles.iconGlyph}>←</Text>
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Library</Text>
          <TouchableOpacity activeOpacity={0.78} style={styles.iconButton}>
            <Text style={styles.iconGlyph}>⌕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heading}>
          <Text style={styles.eyebrow}>✦ Your Sangha ✦</Text>
          <Text style={styles.title}>Sacred Library</Text>
          <Text style={styles.subtitle}>
            {loadedCollectionCount > 0
              ? `Streaming from ${loadedCollectionCount} collections`
              : isLoadingRealData
                ? 'Finding spiritual feeds and recitations.'
                : 'No live source available right now.'}
          </Text>
        </View>

        <View style={styles.searchBar}>
          <Text style={styles.searchGlyph}>⌕</Text>
          <Text style={styles.searchPlaceholder}>Search teachings, reciters…</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>{totals.sessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>{totals.inProgress}</Text>
            <Text style={styles.statLabel}>In progress</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBlock}>
            <Text style={styles.statValue}>{totals.playable}</Text>
            <Text style={styles.statLabel}>Playable</Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          {filters.map(filter => {
            const isActive = filter.id === activeFilter;
            return (
              <TouchableOpacity
                activeOpacity={0.85}
                key={filter.id}
                onPress={() => setActiveFilter(filter.id)}
                style={[styles.filterChip, isActive && styles.filterChipActive]}>
                <Text
                  style={[
                    styles.filterText,
                    isActive && styles.filterTextActive,
                  ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {activeFilter === 'inProgress'
              ? 'Continue sadhana'
              : activeFilter === 'saved'
                ? 'Saved for paath'
                : activeFilter === 'fresh'
                  ? 'Fresh teachings'
                  : 'All teachings'}
          </Text>
          <Text style={styles.sectionCount}>{filteredEpisodes.length}</Text>
        </View>
      </View>
    ),
    [
      activeFilter,
      filteredEpisodes.length,
      isLoadingRealData,
      loadedCollectionCount,
      navigation,
      totals.inProgress,
      totals.playable,
      totals.sessions,
    ],
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>
          {isLoadingRealData
            ? 'Loading teachings'
            : activeFilter !== 'all'
              ? 'Nothing here yet'
              : 'No playable episodes'}
        </Text>
        <Text style={styles.emptyBody}>
          {isLoadingRealData
            ? 'Fetching iTunes results and parsing the selected RSS feed.'
            : activeFilter !== 'all'
              ? 'Try a different filter or check back after listening more.'
              : realDataError instanceof Error
                ? realDataError.message
                : 'The selected feed returned no playable audio files.'}
        </Text>
      </View>
    ),
    [activeFilter, isLoadingRealData, realDataError],
  );

  const renderFooter = useCallback(
    () => (
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {hasMoreEpisodes
            ? 'Loading more episodes…'
            : isFetchingRealData
              ? 'Refreshing feed'
              : visibleEpisodes.length > 0
                ? 'You’ve reached the end'
                : ''}
        </Text>
      </View>
    ),
    [hasMoreEpisodes, isFetchingRealData, visibleEpisodes.length],
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <FlashList
        contentContainerStyle={styles.content}
        data={visibleEpisodes}
        extraData={{hasMoreEpisodes, isFetching: isFetchingRealData}}
        keyExtractor={item => item.id}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        ListHeaderComponent={renderHeader}
        onEndReached={loadMoreEpisodes}
        onEndReachedThreshold={0.45}
        renderItem={renderEpisode}
        showsVerticalScrollIndicator={false}
      />

      {currentEpisode ? (
        <View style={styles.dock}>
          <PlayerDock episode={currentEpisode} queue={orderedEpisodes} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    paddingBottom: 160,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 999,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  iconGlyph: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  topBarTitle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  heading: {
    marginBottom: 18,
  },
  eyebrow: {
    color: colors.brand,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.ink,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    marginTop: 6,
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchGlyph: {
    color: colors.dim,
    fontSize: 15,
  },
  searchPlaceholder: {
    color: colors.dim,
    fontSize: 13,
    fontWeight: '500',
  },
  statsRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 18,
    flexDirection: 'row',
    marginBottom: 20,
    paddingHorizontal: 6,
    paddingVertical: 16,
  },
  statBlock: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    backgroundColor: colors.lineSoft,
    height: 28,
    width: 1,
  },
  statValue: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  statLabel: {
    color: colors.dim,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 22,
  },
  filterChip: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  filterChipActive: {
    backgroundColor: colors.brand,
  },
  filterText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  filterTextActive: {
    color: colors.background,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionCount: {
    color: colors.dim,
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 12,
    paddingTop: 12,
  },
  footerText: {
    color: colors.dim,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 20,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  emptyBody: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  dock: {
    bottom: 12,
    left: 0,
    paddingHorizontal: 16,
    position: 'absolute',
    right: 0,
  },
});
