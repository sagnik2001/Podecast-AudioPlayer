import React, {useMemo} from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  Image,
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
import {ProgressBar} from '../components/ProgressBar';
import {ShelfCard} from '../components/ShelfCard';
import {selectCollectionPodcastShow} from '../content/audioSources';
import {featuredCollection, scriptureCollections} from '../content/collections';
import {mapPodcastEpisodeToEpisode} from '../api/episodeMapper';
import {RootStackParamList} from '../navigation/types';
import {usePodcastDiscovery, usePodcastEpisodes} from '../queries/podcastQueries';
import {colors} from '../theme/colors';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const practiceModes: {label: string; sublabel: string; symbol: string}[] = [
  {label: 'Listen', sublabel: 'Shravana', symbol: 'ॐ'},
  {label: 'Read', sublabel: 'Paath', symbol: '॥'},
  {label: 'Translate', sublabel: 'Viveka', symbol: '∞'},
  {label: 'Reflect', sublabel: 'Dhyana', symbol: '◈'},
];

type SanskritGreeting = {salutation: string; subtitle: string};

function getSanskritGreeting(): SanskritGreeting {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 6) {
    return {salutation: 'ब्राह्म मुहूर्त', subtitle: 'Sacred brahma muhurta — the ideal hour of study'};
  }
  if (hour >= 6 && hour < 12) {
    return {salutation: 'सुप्रभातम्', subtitle: 'Good morning — begin with intention'};
  }
  if (hour >= 12 && hour < 17) {
    return {salutation: 'शुभ मध्याह्न', subtitle: 'Blessed afternoon — continue your sadhana'};
  }
  if (hour >= 17 && hour < 21) {
    return {salutation: 'शुभ संध्या', subtitle: 'Good evening — time for reflection'};
  }
  return {salutation: 'शुभ रात्रि', subtitle: 'Good night — close with gratitude'};
}

export function HomeScreen({navigation}: HomeScreenProps) {
  const podcastDiscovery = usePodcastDiscovery(featuredCollection.audioSearchTerms);
  const selectedShow = selectCollectionPodcastShow(
    featuredCollection,
    podcastDiscovery.data,
  );
  const podcastEpisodes = usePodcastEpisodes(selectedShow?.feedUrl);
  const liveEpisodes =
    podcastEpisodes.data?.slice(0, 6).map(mapPodcastEpisodeToEpisode) ?? [];
  const displayEpisodes = liveEpisodes;
  const heroEpisode = displayEpisodes[0];
  const isLoadingRealData = podcastDiscovery.isLoading || podcastEpisodes.isLoading;
  const realDataError = podcastDiscovery.error ?? podcastEpisodes.error;
  const dataLabel = selectedShow ? selectedShow.title : 'podcast feed';
  const greeting = useMemo(getSanskritGreeting, []);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* Top bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.salutation}>{greeting.salutation}</Text>
            <Text style={styles.salutationSub}>{greeting.subtitle}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.85} style={styles.omButton}>
            <Text style={styles.omGlyph}>ॐ</Text>
          </TouchableOpacity>
        </View>

        {/* Sacred verse card */}
        <View style={styles.verseCard}>
          <View style={styles.verseCardHeader}>
            <Text style={styles.verseOm}>ॐ</Text>
            <View style={styles.verseCardHeaderRight}>
              <Text style={styles.verseEyebrow}>Verse of the Day</Text>
              <Text style={styles.verseRef}>Bhagavad Gita · 2.47</Text>
            </View>
          </View>
          <View style={styles.verseDivider}>
            <View style={styles.verseDividerLine} />
            <Text style={styles.verseDividerGlyph}>✦</Text>
            <View style={styles.verseDividerLine} />
          </View>
          <Text style={styles.verseText}>
            कर्मण्येवाधिकारस्ते{'\n'}मा फलेषु कदाचन
          </Text>
          <Text style={styles.verseDanda}>॥ २.४७ ॥</Text>
          <View style={styles.verseDivider}>
            <View style={styles.verseDividerLine} />
            <Text style={styles.verseDividerGlyph}>✦</Text>
            <View style={styles.verseDividerLine} />
          </View>
          <Text style={styles.verseTranslation}>
            You have a right to your actions alone, never to the fruits thereof.
          </Text>
        </View>

        {/* Hero — current session */}
        <View style={styles.heroLabel}>
          <View style={styles.heroLabelDot} />
          <Text style={styles.heroLabelText}>
            {isLoadingRealData ? 'Loading sadhana' : 'Continue your sadhana'}
          </Text>
        </View>
        <View style={styles.hero}>
          <View style={styles.heroCoverWrap}>
            {heroEpisode?.imageUrl ? (
              <Image
                resizeMode="cover"
                source={{uri: heroEpisode.imageUrl}}
                style={styles.heroImage}
              />
            ) : (
              <View style={[styles.heroImage, styles.heroFallback]}>
                <Text style={styles.heroFallbackOm}>ॐ</Text>
              </View>
            )}
            <View style={styles.heroVignette} />
            <View style={styles.heroBottomShade} />
            <View style={styles.heroContent}>
              <Text numberOfLines={2} style={styles.heroTitle}>
                {heroEpisode?.title ??
                  (isLoadingRealData ? 'Tuning the feed…' : 'No live sessions found')}
              </Text>
              <Text numberOfLines={1} style={styles.heroShow}>
                {heroEpisode?.show ?? dataLabel}
              </Text>
              <View style={styles.heroProgressWrap}>
                <ProgressBar
                  accent={colors.brandBright}
                  height={3}
                  progress={heroEpisode?.progress ?? 0}
                />
              </View>
              <View style={styles.heroActions}>
                <TouchableOpacity activeOpacity={0.85} style={styles.heroSecondary}>
                  <Text style={styles.heroSecondaryGlyph}>॥</Text>
                  <Text style={styles.heroSecondaryText}>Paath</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={!heroEpisode?.audioUrl}
                  style={[
                    styles.heroPrimary,
                    !heroEpisode?.audioUrl && styles.heroPrimaryDisabled,
                  ]}>
                  <Text style={styles.heroPrimaryGlyph}>▶</Text>
                  <Text style={styles.heroPrimaryText}>Shravana</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Practice modes */}
        <View style={styles.modeRow}>
          {practiceModes.map((mode, index) => (
            <TouchableOpacity
              activeOpacity={0.85}
              key={mode.label}
              style={[styles.modeChip, index === 0 && styles.modeChipActive]}>
              <Text
                style={[
                  styles.modeSymbol,
                  index === 0 && styles.modeSymbolActive,
                ]}>
                {mode.symbol}
              </Text>
              <Text
                style={[
                  styles.modeLabel,
                  index === 0 && styles.modeLabelActive,
                ]}>
                {mode.label}
              </Text>
              <Text style={styles.modeSublabel}>{mode.sublabel}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Practice paths */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>✦ Sacred Paths ✦</Text>
            <Text style={styles.sectionTitle}>Practice collections</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.78}
            onPress={() =>
              navigation.navigate('Collection', {
                collectionId: featuredCollection.id,
              })
            }>
            <Text style={styles.sectionAction}>Explore</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={styles.shelfRow}
          horizontal
          showsHorizontalScrollIndicator={false}>
          {scriptureCollections.map(collection => (
            <ShelfCard
              accent={collection.accent}
              count={collection.subtitle}
              key={collection.id}
              onPress={() =>
                navigation.navigate('Collection', {
                  collectionId: collection.id,
                })
              }
              symbol={collection.symbol}
              title={collection.title}
            />
          ))}
        </ScrollView>

        {/* Continue learning */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>✦ Your Queue ✦</Text>
            <Text style={styles.sectionTitle}>Continue practice</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.78}
            onPress={() => navigation.navigate('Library')}>
            <Text style={styles.sectionAction}>All teachings</Text>
          </TouchableOpacity>
        </View>

        {displayEpisodes.length > 0 ? (
          displayEpisodes
            .slice(0, 4)
            .map(episode => (
              <EpisodeCard
                episode={episode}
                key={episode.id}
                queue={displayEpisodes}
              />
            ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyOm}>ॐ</Text>
            <Text style={styles.emptyTitle}>
              {isLoadingRealData ? 'Gathering teachings' : 'No teachings yet'}
            </Text>
            <Text style={styles.emptyBody}>
              {isLoadingRealData
                ? 'Fetching recitations, lectures, and sacred readings.'
                : realDataError instanceof Error
                  ? realDataError.message
                  : 'The current feed returned no playable audio.'}
            </Text>
          </View>
        )}
      </ScrollView>

      {heroEpisode ? (
        <View style={styles.dock}>
          <PlayerDock episode={heroEpisode} queue={displayEpisodes} />
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
    paddingTop: 10,
  },

  /* Top bar */
  topBar: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  salutation: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  salutationSub: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.2,
    marginTop: 4,
    maxWidth: 220,
  },
  omButton: {
    alignItems: 'center',
    backgroundColor: colors.brandTint,
    borderColor: colors.brandBorder,
    borderRadius: 999,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  omGlyph: {
    color: colors.brand,
    fontSize: 22,
    fontWeight: '700',
  },

  /* Verse card */
  verseCard: {
    backgroundColor: colors.surface,
    borderColor: colors.brandBorder,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 22,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  verseCardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  verseOm: {
    color: colors.brand,
    fontSize: 38,
    fontWeight: '400',
    lineHeight: 44,
  },
  verseCardHeaderRight: {
    flex: 1,
  },
  verseEyebrow: {
    color: colors.brand,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  verseRef: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  verseDivider: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  verseDividerLine: {
    backgroundColor: colors.brandBorder,
    flex: 1,
    height: 1,
  },
  verseDividerGlyph: {
    color: colors.brand,
    fontSize: 10,
    opacity: 0.8,
  },
  verseText: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.3,
    lineHeight: 32,
    marginBottom: 8,
    textAlign: 'center',
  },
  verseDanda: {
    color: colors.brand,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 3,
    marginBottom: 14,
    textAlign: 'center',
  },
  verseTranslation: {
    color: colors.muted,
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '400',
    lineHeight: 19,
    textAlign: 'center',
  },

  /* Hero */
  heroLabel: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  heroLabelDot: {
    backgroundColor: colors.saffron,
    borderRadius: 999,
    height: 6,
    width: 6,
  },
  heroLabelText: {
    color: colors.saffron,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  hero: {
    marginBottom: 24,
  },
  heroCoverWrap: {
    aspectRatio: 0.9,
    borderRadius: 26,
    maxHeight: 420,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: {
    height: '100%',
    width: '100%',
  },
  heroFallback: {
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    justifyContent: 'center',
    position: 'absolute',
  },
  heroFallbackOm: {
    color: colors.brand,
    fontSize: 72,
    fontWeight: '400',
    opacity: 0.4,
  },
  heroVignette: {
    backgroundColor: colors.black,
    bottom: 0,
    left: 0,
    opacity: 0.14,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  heroBottomShade: {
    backgroundColor: colors.background,
    bottom: 0,
    height: '62%',
    left: 0,
    opacity: 0.9,
    position: 'absolute',
    right: 0,
  },
  heroContent: {
    bottom: 0,
    left: 0,
    padding: 20,
    position: 'absolute',
    right: 0,
  },
  heroTitle: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  heroShow: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 6,
  },
  heroProgressWrap: {
    marginTop: 14,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  heroSecondary: {
    alignItems: 'center',
    backgroundColor: 'rgba(247,237,216,0.07)',
    borderColor: 'rgba(247,237,216,0.14)',
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 13,
  },
  heroSecondaryGlyph: {
    color: colors.inkSoft,
    fontSize: 14,
  },
  heroSecondaryText: {
    color: colors.inkSoft,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  heroPrimary: {
    alignItems: 'center',
    backgroundColor: colors.saffron,
    borderRadius: 999,
    flex: 1.4,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 13,
  },
  heroPrimaryDisabled: {
    opacity: 0.5,
  },
  heroPrimaryGlyph: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '900',
  },
  heroPrimaryText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  /* Practice modes */
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 28,
  },
  modeChip: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 12,
  },
  modeChipActive: {
    backgroundColor: colors.brandTint,
    borderColor: colors.brandBorder,
    borderWidth: 1,
  },
  modeSymbol: {
    color: colors.muted,
    fontSize: 20,
    marginBottom: 6,
  },
  modeSymbolActive: {
    color: colors.brand,
  },
  modeLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  modeLabelActive: {
    color: colors.brand,
    fontWeight: '700',
  },
  modeSublabel: {
    color: colors.faint,
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 0.6,
    marginTop: 2,
    textTransform: 'uppercase',
  },

  /* Sections */
  sectionHeader: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionEyebrow: {
    color: colors.brand,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sectionAction: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  shelfRow: {
    paddingBottom: 26,
    paddingRight: 6,
  },
  shelfPlaceholder: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    height: 156,
    justifyContent: 'center',
    width: 200,
  },
  shelfPlaceholderOm: {
    color: colors.brand,
    fontSize: 28,
    marginBottom: 8,
    opacity: 0.5,
  },
  shelfPlaceholderText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },

  /* Empty */
  emptyState: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  emptyOm: {
    color: colors.brand,
    fontSize: 36,
    marginBottom: 12,
    opacity: 0.5,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
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
