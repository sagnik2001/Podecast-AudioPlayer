import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {FlashList, ListRenderItem} from '@shopify/flash-list';
import {SafeAreaView} from 'react-native-safe-area-context';

import {mapPodcastEpisodeToEpisode} from '../api/episodeMapper';
import {EpisodeCard} from '../components/EpisodeCard';
import {OfflineBanner, OfflineEmptyState} from '../components/OfflineState';
import {PlayerDock} from '../components/PlayerDock';
import {Episode} from '../data/episodes';
import {DownloadView, useDownloadsList} from '../hooks/useDownload';
import {useRestoredPlayback} from '../hooks/useRestoredPlayback';
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

function downloadToEpisode(download: DownloadView): Episode {
  const snap = download.episodeSnapshot;
  return {
    id: download.episodeId,
    title: snap.title,
    show: snap.show,
    description: snap.description,
    tag: snap.tag,
    duration: snap.duration,
    published: snap.published,
    progress: 0,
    phase: snap.phase,
    accent: snap.accent,
    downloaded: true,
    audioUrl: download.localPath ? `file://${download.localPath}` : undefined,
    imageUrl: snap.imageUrl,
  };
}

const keyExtractor = (item: Episode) => item.id;

export function LibraryScreen({navigation}: LibraryScreenProps) {
  const [visibleEpisodeCount, setVisibleEpisodeCount] =
    useState(initialEpisodeCount);
  const [activeFilter, setActiveFilter] = useState<LibraryFilter>('all');
  const restoredPlayback = useRestoredPlayback();
  const collectionAudioQueries = useCollectionAudioLibrary();
  const queryDataSignature = collectionAudioQueries
    .map(query => query.data?.collection.id ?? '')
    .join('|');
  const collectionAudioResults = useMemo(
    () =>
      collectionAudioQueries
        .map(query => query.data)
        .filter(isCollectionAudioResult),
    // queryDataSignature captures changes to which queries have data
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryDataSignature],
  );
  const isLoadingRealData = collectionAudioQueries.some(
    query => query.isLoading,
  );
  const isFetchingRealData = collectionAudioQueries.some(
    query => query.isFetching,
  );
  const realDataError = collectionAudioQueries.find(
    query => query.error,
  )?.error;
  const loadedCollectionCount = collectionAudioResults.filter(
    result => result.episodes.length > 0,
  ).length;
  const liveOrderedEpisodes = useMemo(
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
  const downloads = useDownloadsList();
  const offlineEpisodes = useMemo(
    () =>
      downloads
        .filter(d => d.status === 'completed')
        .map((d, index) => ({...downloadToEpisode(d), queuePosition: index + 1})),
    [downloads],
  );
  const isOffline =
    Boolean(realDataError) && liveOrderedEpisodes.length === 0;
  const orderedEpisodes = useMemo(() => {
    if (liveOrderedEpisodes.length > 0) {
      return liveOrderedEpisodes;
    }
    if (isOffline) {
      return offlineEpisodes;
    }
    return liveOrderedEpisodes;
  }, [liveOrderedEpisodes, isOffline, offlineEpisodes]);
  const downloadedCount = offlineEpisodes.length;

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

  const currentEpisode = orderedEpisodes[0] ?? restoredPlayback.episode;
  const currentQueue =
    orderedEpisodes.length > 0 ? orderedEpisodes : restoredPlayback.queue;
  const visibleEpisodes = useMemo(
    () => filteredEpisodes.slice(0, visibleEpisodeCount),
    [filteredEpisodes, visibleEpisodeCount],
  );
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
  }, [activeFilter, orderedEpisodes.length]);

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
            style={styles.iconButton}
          >
            <Text style={styles.iconGlyph}>←</Text>
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Library</Text>
          <TouchableOpacity
            accessibilityLabel="Open downloads"
            activeOpacity={0.78}
            onPress={() => navigation.navigate('Downloads')}
            style={styles.downloadsChip}>
            <Text style={styles.downloadsChipGlyph}>↓</Text>
            <Text style={styles.downloadsChipLabel}>Downloads</Text>
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
              : isOffline
              ? `Offline · ${downloadedCount} saved teaching${downloadedCount === 1 ? '' : 's'}`
              : 'No live source available right now.'}
          </Text>
        </View>

        <View style={styles.searchBar}>
          <Text style={styles.searchGlyph}>⌕</Text>
          <Text style={styles.searchPlaceholder}>
            Search teachings, reciters…
          </Text>
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
                style={[styles.filterChip, isActive && styles.filterChipActive]}
              >
                <Text
                  style={[
                    styles.filterText,
                    isActive && styles.filterTextActive,
                  ]}
                >
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

        {isOffline && downloadedCount > 0 ? (
          <OfflineBanner
            downloadedCount={downloadedCount}
            onOpenDownloads={() => navigation.navigate('Downloads')}
          />
        ) : null}
      </View>
    ),
    [
      activeFilter,
      downloadedCount,
      filteredEpisodes.length,
      isLoadingRealData,
      isOffline,
      loadedCollectionCount,
      navigation,
      totals.inProgress,
      totals.playable,
      totals.sessions,
    ],
  );

  const renderEmpty = useCallback(() => {
    if (isLoadingRealData) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Loading teachings</Text>
          <Text style={styles.emptyBody}>
            Fetching Apple Podcasts and Internet Archive sources, then loading
            playable audio.
          </Text>
        </View>
      );
    }
    if (activeFilter !== 'all') {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptyBody}>
            Try a different filter or check back after listening more.
          </Text>
        </View>
      );
    }
    if (isOffline) {
      return (
        <OfflineEmptyState
          downloadedCount={downloadedCount}
          onOpenDownloads={() => navigation.navigate('Downloads')}
        />
      );
    }
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>No playable episodes</Text>
        <Text style={styles.emptyBody}>
          The selected feed returned no playable audio files.
        </Text>
      </View>
    );
  }, [activeFilter, downloadedCount, isLoadingRealData, isOffline, navigation]);

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
        keyExtractor={keyExtractor}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        ListHeaderComponent={renderHeader}
        onEndReached={loadMoreEpisodes}
        onEndReachedThreshold={0.6}
        renderItem={renderEpisode}
        showsVerticalScrollIndicator={false}
      />

      {currentEpisode ? (
        <View style={styles.dock}>
          <PlayerDock episode={currentEpisode} queue={currentQueue} />
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
  downloadsChip: {
    alignItems: 'center',
    backgroundColor: colors.brandTint,
    borderColor: colors.brandBorder,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  downloadsChipGlyph: {
    color: colors.brand,
    fontSize: 16,
    fontWeight: '900',
  },
  downloadsChipLabel: {
    color: colors.brand,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
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
