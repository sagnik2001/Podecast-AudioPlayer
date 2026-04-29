import React, {useCallback, useMemo} from 'react';
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

import {DownloadStatus} from '../db/models/Download';
import {DownloadView, useDownloadsList} from '../hooks/useDownload';
import {RootStackParamList} from '../navigation/types';
import {
  cancelDownload,
  pauseDownload,
  resumeDownload,
} from '../services/downloads';
import {colors} from '../theme/colors';
import {CoverArt} from '../components/CoverArt';

type DownloadsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Downloads'
>;

const keyExtractor = (item: DownloadView) => item.id;

export function DownloadsScreen({navigation}: DownloadsScreenProps) {
  const downloads = useDownloadsList();

  const stats = useMemo(() => {
    let active = 0;
    let completed = 0;
    let totalBytes = 0;
    for (const dl of downloads) {
      if (dl.status === 'downloading' || dl.status === 'pending') {
        active += 1;
      }
      if (dl.status === 'completed') {
        completed += 1;
      }
      totalBytes += dl.bytesTotal || 0;
    }
    return {active, completed, totalBytes};
  }, [downloads]);

  const renderItem = useCallback<ListRenderItem<DownloadView>>(
    ({item}) => <DownloadRow download={item} />,
    [],
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
          <Text style={styles.topBarTitle}>Downloads</Text>
          <View style={styles.iconButton} />
        </View>

        <View style={styles.heading}>
          <Text style={styles.eyebrow}>✦ Offline ✦</Text>
          <Text style={styles.title}>Saved for paath</Text>
          <Text style={styles.subtitle}>
            {downloads.length === 0
              ? 'Tap the download icon on any episode to keep it offline.'
              : `${downloads.length} item${downloads.length === 1 ? '' : 's'} • ${stats.completed} ready • ${stats.active} in flight`}
          </Text>
        </View>

        {stats.totalBytes > 0 ? (
          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Ready</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{stats.active}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{formatBytes(stats.totalBytes)}</Text>
              <Text style={styles.statLabel}>Size</Text>
            </View>
          </View>
        ) : null}
      </View>
    ),
    [
      downloads.length,
      navigation,
      stats.active,
      stats.completed,
      stats.totalBytes,
    ],
  );

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>No downloads yet</Text>
        <Text style={styles.emptyBody}>
          Saved episodes appear here for offline listening — even on a flight.
        </Text>
      </View>
    ),
    [],
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <FlashList
        contentContainerStyle={styles.content}
        data={downloads}
        keyExtractor={keyExtractor}
        ListEmptyComponent={renderEmpty}
        ListHeaderComponent={renderHeader}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function DownloadRow({download}: {download: DownloadView}) {
  const snap = download.episodeSnapshot;
  const status = download.status;
  const progressPct = Math.round((download.progress || 0) * 100);

  const onPrimary = async () => {
    if (status === 'downloading' || status === 'pending') {
      await pauseDownload(download.episodeId);
    } else if (status === 'paused' || status === 'failed') {
      await resumeDownload(download.episodeId);
    }
  };

  const onRemove = async () => {
    await cancelDownload(download.episodeId);
  };

  return (
    <View style={styles.row}>
      <CoverArt
        accent={snap.accent}
        imageUrl={snap.imageUrl}
        phase={snap.phase}
        size={56}
      />
      <View style={styles.rowMeta}>
        <Text numberOfLines={1} style={[styles.rowShow, {color: snap.accent}]}>
          {snap.show}
        </Text>
        <Text numberOfLines={2} style={styles.rowTitle}>
          {snap.title}
        </Text>
        <View style={styles.statusLine}>
          <Text style={[styles.statusText, statusTextStyle(status)]}>
            {labelForStatus(status, progressPct)}
          </Text>
          {download.bytesTotal > 0 ? (
            <Text style={styles.statusBytes}>
              {formatBytes(download.bytesDownloaded)} /{' '}
              {formatBytes(download.bytesTotal)}
            </Text>
          ) : null}
        </View>
        {(status === 'downloading' || status === 'pending') && (
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {width: `${Math.max(2, progressPct)}%`},
              ]}
            />
          </View>
        )}
      </View>
      <View style={styles.rowActions}>
        {status !== 'completed' ? (
          <TouchableOpacity
            accessibilityLabel={
              status === 'paused' || status === 'failed'
                ? 'Resume download'
                : 'Pause download'
            }
            activeOpacity={0.82}
            hitSlop={6}
            onPress={onPrimary}
            style={styles.actionButton}>
            <Text style={styles.actionLabel}>
              {status === 'paused' || status === 'failed' ? 'Resume' : 'Pause'}
            </Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          accessibilityLabel={
            status === 'completed' ? 'Remove from device' : 'Cancel download'
          }
          activeOpacity={0.82}
          hitSlop={6}
          onPress={onRemove}
          style={[styles.actionButton, styles.actionButtonDanger]}>
          <Text style={[styles.actionLabel, styles.actionLabelDanger]}>
            {status === 'completed' ? 'Remove' : 'Cancel'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function labelForStatus(status: DownloadStatus, progressPct: number) {
  switch (status) {
    case 'completed':
      return 'Saved offline';
    case 'downloading':
      return `Downloading ${progressPct}%`;
    case 'pending':
      return 'Queued';
    case 'paused':
      return 'Paused';
    case 'failed':
      return 'Failed';
  }
}

function statusTextStyle(status: DownloadStatus) {
  if (status === 'completed') {
    return {color: colors.brand};
  }
  if (status === 'failed') {
    return {color: '#e57f7f'};
  }
  return {};
}

function formatBytes(bytes: number) {
  if (!bytes || bytes <= 0) {
    return '—';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    paddingBottom: 48,
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
    fontSize: 18,
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
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 20,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyBody: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  row: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 18,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    padding: 12,
  },
  rowMeta: {
    flex: 1,
    minWidth: 0,
  },
  rowShow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  rowTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.1,
    lineHeight: 21,
    marginTop: 5,
  },
  statusLine: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  statusText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  statusBytes: {
    color: colors.dim,
    fontSize: 12,
    fontWeight: '600',
  },
  progressTrack: {
    backgroundColor: colors.lineSoft,
    borderRadius: 999,
    height: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.brand,
    height: '100%',
  },
  rowActions: {
    flexDirection: 'column',
    gap: 6,
    justifyContent: 'center',
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceHigh,
    borderRadius: 12,
    minHeight: 34,
    minWidth: 78,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  actionButtonDanger: {
    backgroundColor: colors.surfaceHigh,
    borderColor: 'rgba(229, 127, 127, 0.3)',
    borderWidth: 1,
  },
  actionLabel: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  actionLabelDanger: {
    color: '#e57f7f',
  },
});
