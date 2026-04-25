import React, {useCallback, useMemo} from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {StatusBar, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {FlashList, ListRenderItem} from '@shopify/flash-list';
import {SafeAreaView} from 'react-native-safe-area-context';

import {mapPodcastEpisodeToEpisode} from '../api/episodeMapper';
import {EpisodeCard} from '../components/EpisodeCard';
import {PlayerDock} from '../components/PlayerDock';
import {selectCollectionPodcastShow} from '../content/audioSources';
import {featuredCollection, getCollectionById} from '../content/collections';
import {hasReadContent} from '../content/verses';
import {Episode} from '../data/episodes';
import {RootStackParamList} from '../navigation/types';
import {usePodcastDiscovery, usePodcastEpisodes} from '../queries/podcastQueries';
import {colors} from '../theme/colors';

type CollectionScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Collection'
>;

export function CollectionScreen({navigation, route}: CollectionScreenProps) {
  const collection =
    getCollectionById(route.params.collectionId) ?? featuredCollection;
  const podcastDiscovery = usePodcastDiscovery(
    collection.curatedPodcastShow ? [] : collection.audioSearchTerms,
  );
  const selectedShow = selectCollectionPodcastShow(
    collection,
    podcastDiscovery.data,
  );
  const podcastEpisodes = usePodcastEpisodes(selectedShow?.feedUrl);
  const episodes = useMemo(
    () => podcastEpisodes.data?.map(mapPodcastEpisodeToEpisode) ?? [],
    [podcastEpisodes.data],
  );
  const heroEpisode = episodes[0];
  const isLoading = podcastDiscovery.isLoading || podcastEpisodes.isLoading;
  const realDataError = podcastDiscovery.error ?? podcastEpisodes.error;

  const renderEpisode = useCallback<ListRenderItem<Episode>>(
    ({item}) => <EpisodeCard compact episode={item} queue={episodes} />,
    [episodes],
  );

  const renderHeader = useCallback(
    () => (
      <View>
        <TouchableOpacity
          activeOpacity={0.78}
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={[styles.hero, {borderColor: collection.accent}]}>
          <View style={[styles.symbolPlate, {backgroundColor: collection.accent}]}>
            <Text numberOfLines={1} style={styles.symbol}>
              {collection.symbol}
            </Text>
          </View>
          <Text style={styles.eyebrow}>{collection.tradition}</Text>
          <Text style={styles.title}>{collection.title}</Text>
          <Text style={styles.subtitle}>{collection.subtitle}</Text>
          <Text style={styles.description}>{collection.description}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaPill}>{collection.language}</Text>
            <Text style={styles.metaPill}>{collection.textProvider}</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={() =>
              navigation.navigate('Read', {collectionId: collection.id})
            }
            style={[styles.readButton, {backgroundColor: collection.accent}]}>
            <View style={styles.readButtonRow}>
              <Text style={styles.readButtonText}>
                Read • Translate • Reflect
              </Text>
              {!hasReadContent(collection.id) ? (
                <View style={styles.readSoonBadge}>
                  <Text style={styles.readSoonBadgeText}>Coming soon</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.readButtonSubtext}>
              {hasReadContent(collection.id)
                ? 'Verses with हिन्दी / English translations'
                : 'Verse path in preparation — preview inside'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Reading path</Text>
        <View style={styles.sectionGrid}>
          {collection.sections.map(section => (
            <View key={section.id} style={styles.pathCard}>
              <Text style={styles.pathTitle}>{section.title}</Text>
              <Text style={styles.pathSubtitle}>{section.subtitle}</Text>
            </View>
          ))}
        </View>

        <View style={styles.audioHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>Real audio</Text>
            <Text style={styles.sectionTitle}>Recitations and talks</Text>
          </View>
          <Text style={styles.audioCount}>{episodes.length}</Text>
        </View>

        {selectedShow ? (
          <Text numberOfLines={2} style={styles.feedLabel}>
            Source: {selectedShow.title}
          </Text>
        ) : null}
      </View>
    ),
    [collection, episodes.length, navigation, selectedShow],
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyState}>
        <Text style={styles.emptySymbol}>{collection.symbol}</Text>
        <Text style={styles.emptyTitle}>
          {isLoading ? 'Loading real audio' : 'No playable audio found'}
        </Text>
        <Text style={styles.emptyBody}>
          {isLoading
            ? 'Searching Apple Podcasts and Internet Archive, then loading playable audio.'
            : realDataError instanceof Error
              ? realDataError.message
              : 'Try another source term for this collection later.'}
        </Text>
      </View>
    ),
    [collection.symbol, isLoading, realDataError],
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <FlashList
        contentContainerStyle={styles.content}
        data={episodes}
        keyExtractor={item => item.id}
        ListEmptyComponent={renderEmpty}
        ListHeaderComponent={renderHeader}
        renderItem={renderEpisode}
        showsVerticalScrollIndicator={false}
      />

      {heroEpisode ? (
        <View style={styles.dock}>
          <PlayerDock episode={heroEpisode} queue={episodes} />
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
    paddingBottom: 154,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderColor: colors.lineSoft,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  backText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 24,
    padding: 20,
  },
  symbolPlate: {
    alignItems: 'center',
    borderRadius: 22,
    height: 76,
    justifyContent: 'center',
    marginBottom: 18,
    width: 76,
  },
  symbol: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '800',
  },
  eyebrow: {
    color: colors.brand,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.ink,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.7,
    marginTop: 7,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
  },
  description: {
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 14,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  readButton: {
    borderRadius: 16,
    marginTop: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  readButtonRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  readButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  readButtonSubtext: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  readSoonBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  readSoonBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  metaPill: {
    backgroundColor: colors.brandTint,
    borderColor: colors.brandBorder,
    borderRadius: 999,
    borderWidth: 1,
    color: colors.brand,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionGrid: {
    gap: 10,
    marginBottom: 24,
    marginTop: 12,
  },
  pathCard: {
    backgroundColor: colors.surface,
    borderColor: colors.lineSoft,
    borderRadius: 16,
    borderWidth: 1,
    padding: 15,
  },
  pathTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  pathSubtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 5,
  },
  audioHeader: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionEyebrow: {
    color: colors.brand,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  audioCount: {
    color: colors.brand,
    fontSize: 18,
    fontWeight: '900',
  },
  feedLabel: {
    color: colors.dim,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  emptySymbol: {
    color: colors.brand,
    fontSize: 32,
    marginBottom: 10,
    opacity: 0.6,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyBody: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
    textAlign: 'center',
  },
  dock: {
    bottom: 12,
    left: 0,
    paddingHorizontal: 16,
    position: 'absolute',
    right: 0,
  },
});
