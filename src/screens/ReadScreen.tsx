import React, {useMemo, useState} from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {featuredCollection, getCollectionById} from '../content/collections';
import {getVersesForCollection} from '../content/verses';
import {Verse} from '../content/verseTypes';
import {RootStackParamList} from '../navigation/types';
import {useVerseReflection, useVerseTranslation} from '../queries/verseQueries';
import {colors} from '../theme/colors';

type ReadScreenProps = NativeStackScreenProps<RootStackParamList, 'Read'>;

type Mode = 'translate' | 'reflect';
type Lang = 'hindi' | 'english';

export function ReadScreen({navigation, route}: ReadScreenProps) {
  const collection =
    getCollectionById(route.params.collectionId) ?? featuredCollection;
  const verses = useMemo(
    () => getVersesForCollection(collection.id),
    [collection.id],
  );
  const [mode, setMode] = useState<Mode>('translate');
  const [lang, setLang] = useState<Lang>('english');

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          activeOpacity={0.78}
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={[styles.eyebrow, {color: collection.accent}]}>
          {collection.tradition}
        </Text>
        <Text style={styles.title}>{collection.title}</Text>
        <Text style={styles.subtitle}>Read, translate, and reflect</Text>

        <ModeSwitcher
          accent={collection.accent}
          mode={mode}
          onChange={setMode}
        />

        {mode === 'translate' ? (
          <LangToggle accent={collection.accent} lang={lang} onChange={setLang} />
        ) : null}

        {verses.length === 0 ? (
          <ComingSoonState title={collection.title} />
        ) : (
          verses.map(verse => (
            <VerseBlock
              accent={collection.accent}
              collectionId={collection.id}
              key={verse.id}
              lang={lang}
              mode={mode}
              verse={verse}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ModeSwitcher({
  accent,
  mode,
  onChange,
}: {
  accent: string;
  mode: Mode;
  onChange: (next: Mode) => void;
}) {
  return (
    <View style={styles.segment}>
      <SegmentButton
        accent={accent}
        active={mode === 'translate'}
        label="Translate"
        onPress={() => onChange('translate')}
      />
      <SegmentButton
        accent={accent}
        active={mode === 'reflect'}
        label="Reflect"
        onPress={() => onChange('reflect')}
      />
    </View>
  );
}

function SegmentButton({
  accent,
  active,
  label,
  onPress,
}: {
  accent: string;
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.segmentButton,
        active && {backgroundColor: accent},
      ]}>
      <Text
        style={[styles.segmentLabel, active && styles.segmentLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function LangToggle({
  accent,
  lang,
  onChange,
}: {
  accent: string;
  lang: Lang;
  onChange: (next: Lang) => void;
}) {
  return (
    <View style={styles.langRow}>
      <LangPill
        accent={accent}
        active={lang === 'hindi'}
        label="हिन्दी"
        onPress={() => onChange('hindi')}
      />
      <LangPill
        accent={accent}
        active={lang === 'english'}
        label="English"
        onPress={() => onChange('english')}
      />
    </View>
  );
}

function LangPill({
  accent,
  active,
  label,
  onPress,
}: {
  accent: string;
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.langPill,
        active && {backgroundColor: accent, borderColor: accent},
      ]}>
      <Text
        style={[styles.langPillLabel, active && styles.langPillLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function VerseBlock({
  accent,
  collectionId,
  lang,
  mode,
  verse,
}: {
  accent: string;
  collectionId: string;
  lang: Lang;
  mode: Mode;
  verse: Verse;
}) {
  return (
    <View style={styles.verseCard}>
      <Text style={[styles.verseRef, {color: accent}]}>{verse.reference}</Text>
      <Text style={styles.verseText}>{verse.text}</Text>
      {verse.transliteration ? (
        <Text style={styles.transliteration}>{verse.transliteration}</Text>
      ) : null}
      <View style={styles.divider} />
      {mode === 'translate' ? (
        <TranslationPanel
          collectionId={collectionId}
          lang={lang}
          verse={verse}
        />
      ) : (
        <ReflectionPanel
          accent={accent}
          collectionId={collectionId}
          verse={verse}
        />
      )}
    </View>
  );
}

function TranslationPanel({
  collectionId,
  lang,
  verse,
}: {
  collectionId: string;
  lang: Lang;
  verse: Verse;
}) {
  const {data, isLoading, error, refetch} = useVerseTranslation(
    collectionId,
    verse,
  );

  return (
    <View>
      <Text style={styles.panelLabel}>
        {lang === 'hindi' ? 'हिन्दी अनुवाद' : 'English translation'}
      </Text>
      <PanelBody
        body={data ? (lang === 'hindi' ? data.hindi : data.english) : undefined}
        error={error}
        isLoading={isLoading}
        loadingLabel="Translating…"
        onRetry={refetch}
      />
    </View>
  );
}

function ReflectionPanel({
  accent,
  collectionId,
  verse,
}: {
  accent: string;
  collectionId: string;
  verse: Verse;
}) {
  const {data, isLoading, error, refetch} = useVerseReflection(
    collectionId,
    verse,
  );

  if (isLoading || error || !data) {
    return (
      <View>
        <Text style={styles.panelLabel}>Reflection</Text>
        <PanelBody
          body={undefined}
          error={error}
          isLoading={isLoading}
          loadingLabel="Contemplating…"
          onRetry={refetch}
        />
      </View>
    );
  }

  return (
    <View>
      <View style={styles.themeRow}>
        <View style={[styles.themeDot, {backgroundColor: accent}]} />
        <Text style={styles.themeText}>{data.theme}</Text>
      </View>
      <Text style={styles.reflectionText}>{data.reflection}</Text>
      <View style={styles.practiceBox}>
        <Text style={[styles.practiceLabel, {color: accent}]}>
          Practice today
        </Text>
        <Text style={styles.practiceText}>{data.practice}</Text>
      </View>
    </View>
  );
}

function PanelBody({
  body,
  error,
  isLoading,
  loadingLabel,
  onRetry,
}: {
  body?: string;
  error: unknown;
  isLoading: boolean;
  loadingLabel: string;
  onRetry: () => void;
}) {
  if (isLoading) {
    return (
      <View style={styles.panelLoading}>
        <ActivityIndicator color={colors.brand} size="small" />
        <Text style={styles.panelLoadingText}>{loadingLabel}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <TouchableOpacity onPress={onRetry} style={styles.retryBox}>
        <Text style={styles.retryText}>
          {error instanceof Error ? error.message : 'Request failed.'}
        </Text>
        <Text style={styles.retryAction}>Tap to retry</Text>
      </TouchableOpacity>
    );
  }

  if (!body) {
    return null;
  }

  return <Text style={styles.panelBody}>{body}</Text>;
}

function ComingSoonState({title}: {title: string}) {
  return (
    <View style={styles.comingSoonCard}>
      <View style={styles.comingSoonBadge}>
        <Text style={styles.comingSoonBadgeText}>Coming soon</Text>
      </View>
      <Text style={styles.comingSoonTitle}>
        {title} verses are on the way
      </Text>
      <Text style={styles.comingSoonBody}>
        We're curating the source text for this collection. Translations and
        reflections will appear here once the reading path is ready.
      </Text>
      <View style={styles.comingSoonList}>
        <ComingSoonBullet label="Verse-by-verse original text" />
        <ComingSoonBullet label="Hindi and English translation" />
        <ComingSoonBullet label="Daily reflection and practice" />
      </View>
    </View>
  );
}

function ComingSoonBullet({label}: {label: string}) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletDot} />
      <Text style={styles.bulletText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    paddingBottom: 48,
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
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.6,
    marginTop: 6,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 18,
    marginTop: 6,
  },
  segment: {
    backgroundColor: colors.surface,
    borderColor: colors.lineSoft,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 14,
    padding: 4,
  },
  segmentButton: {
    alignItems: 'center',
    borderRadius: 999,
    flex: 1,
    paddingVertical: 10,
  },
  segmentLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  segmentLabelActive: {
    color: colors.white,
  },
  langRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  langPill: {
    backgroundColor: colors.surface,
    borderColor: colors.lineSoft,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  langPillLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  langPillLabelActive: {
    color: colors.white,
  },
  verseCard: {
    backgroundColor: colors.surface,
    borderColor: colors.lineSoft,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
    padding: 18,
  },
  verseRef: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  verseText: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 28,
  },
  transliteration: {
    color: colors.muted,
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 20,
    marginTop: 10,
  },
  divider: {
    backgroundColor: colors.lineSoft,
    height: 1,
    marginVertical: 14,
  },
  panelLabel: {
    color: colors.dim,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  panelBody: {
    color: colors.inkSoft,
    fontSize: 15,
    lineHeight: 23,
  },
  panelLoading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  panelLoadingText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  retryBox: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 12,
    padding: 12,
  },
  retryText: {
    color: colors.inkSoft,
    fontSize: 13,
    lineHeight: 19,
  },
  retryAction: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 8,
  },
  themeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  themeDot: {
    borderRadius: 6,
    height: 8,
    width: 8,
  },
  themeText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  reflectionText: {
    color: colors.inkSoft,
    fontSize: 15,
    lineHeight: 23,
  },
  practiceBox: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 14,
    marginTop: 14,
    padding: 14,
  },
  practiceLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  practiceText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
  },
  comingSoonCard: {
    backgroundColor: colors.surface,
    borderColor: colors.lineSoft,
    borderRadius: 22,
    borderWidth: 1,
    padding: 22,
  },
  comingSoonBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.brandTint,
    borderColor: colors.brandBorder,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  comingSoonBadgeText: {
    color: colors.brand,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  comingSoonTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  comingSoonBody: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  comingSoonList: {
    gap: 8,
    marginTop: 16,
  },
  bulletRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  bulletDot: {
    backgroundColor: colors.brand,
    borderRadius: 4,
    height: 6,
    opacity: 0.7,
    width: 6,
  },
  bulletText: {
    color: colors.inkSoft,
    fontSize: 13,
    fontWeight: '600',
  },
});
