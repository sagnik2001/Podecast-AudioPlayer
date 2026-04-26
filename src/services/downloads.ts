import {Q} from '@nozbe/watermelondb';
import RNFetchBlob from 'react-native-blob-util';

import {Episode} from '../data/episodes';
import {database, downloadsCollection} from '../db';
import {
  Download,
  DownloadStatus,
  EpisodeSnapshot,
} from '../db/models/Download';

const DOWNLOADS_DIR = `${RNFetchBlob.fs.dirs.DocumentDir}/episodes`;
const MAX_CONCURRENT_DOWNLOADS = 2;
const PROGRESS_WRITE_INTERVAL_MS = 300;

type ActiveTask = {
  episodeId: string;
  cancel: () => void;
};

const activeTasks = new Map<string, ActiveTask>();
const lastProgressWriteAt = new Map<string, number>();
let directoryEnsured = false;

async function ensureDownloadsDirectory() {
  if (directoryEnsured) {
    return;
  }
  const exists = await RNFetchBlob.fs.exists(DOWNLOADS_DIR);
  if (!exists) {
    await RNFetchBlob.fs.mkdir(DOWNLOADS_DIR);
  }
  directoryEnsured = true;
}

function buildLocalPath(episodeId: string) {
  const safeId = episodeId.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 120);
  return `${DOWNLOADS_DIR}/${safeId}.mp3`;
}

function buildEpisodeSnapshot(episode: Episode): EpisodeSnapshot {
  return {
    title: episode.title,
    show: episode.show,
    description: episode.description,
    duration: episode.duration,
    imageUrl: episode.imageUrl,
    accent: episode.accent,
    phase: episode.phase,
    tag: episode.tag,
    published: episode.published,
  };
}

async function findDownloadByEpisodeId(
  episodeId: string,
): Promise<Download | undefined> {
  const rows = await downloadsCollection
    .query(Q.where('episode_id', episodeId))
    .fetch();
  return rows[0];
}

type DownloadPatch = {
  status?: DownloadStatus;
  bytesDownloaded?: number;
  bytesTotal?: number;
  progress?: number;
  localPath?: string | null;
  errorMessage?: string | null;
  completedAt?: Date | null;
};

async function updateDownload(download: Download, patch: DownloadPatch) {
  try {
    await database.write(async () => {
      await download.update(record => {
        if (patch.status !== undefined) {
          record.status = patch.status;
        }
        if (patch.bytesDownloaded !== undefined) {
          record.bytesDownloaded = patch.bytesDownloaded;
        }
        if (patch.bytesTotal !== undefined) {
          record.bytesTotal = patch.bytesTotal;
        }
        if (patch.progress !== undefined) {
          record.progress = patch.progress;
        }
        if (patch.localPath !== undefined) {
          record.localPath = patch.localPath ?? undefined;
        }
        if (patch.errorMessage !== undefined) {
          record.errorMessage = patch.errorMessage ?? undefined;
        }
        if (patch.completedAt !== undefined) {
          record.completedAt = patch.completedAt ?? undefined;
        }
        record.updatedAt = new Date();
      });
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[downloads] update failed', error);
    throw error;
  }
}

export async function enqueueDownload(episode: Episode): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('[downloads] enqueue called', episode.id);

  if (!episode.audioUrl) {
    // eslint-disable-next-line no-console
    console.warn('[downloads] enqueue aborted: no audio URL', episode.id);
    throw new Error('Episode has no audio URL');
  }

  await ensureDownloadsDirectory();

  const existing = await findDownloadByEpisodeId(episode.id);
  // eslint-disable-next-line no-console
  console.log(
    '[downloads] existing row:',
    existing ? existing.status : 'none',
  );

  if (existing) {
    if (existing.status === 'completed') {
      return;
    }
    if (existing.status === 'downloading' || existing.status === 'pending') {
      // Already in flight or queued — make sure scheduler is awake in case
      // it's stuck (e.g., row says pending but no active task).
      scheduleQueue();
      return;
    }
    // Reset paused/failed back to pending
    await updateDownload(existing, {
      status: 'pending',
      bytesDownloaded: 0,
      bytesTotal: 0,
      progress: 0,
      errorMessage: null,
    });
  } else {
    await database.write(async () => {
      await downloadsCollection.create(record => {
        const now = new Date();
        record.episodeId = episode.id;
        record.audioUrl = episode.audioUrl as string;
        record.status = 'pending';
        record.bytesDownloaded = 0;
        record.bytesTotal = 0;
        record.progress = 0;
        record.episodeSnapshotJson = JSON.stringify(
          buildEpisodeSnapshot(episode),
        );
        record.updatedAt = now;
      });
    });
  }

  scheduleQueue();
}

export async function pauseDownload(episodeId: string): Promise<void> {
  const active = activeTasks.get(episodeId);
  if (active) {
    active.cancel();
    activeTasks.delete(episodeId);
  }
  const download = await findDownloadByEpisodeId(episodeId);
  if (download && download.status !== 'completed') {
    await updateDownload(download, {status: 'paused'});
  }
  scheduleQueue();
}

export async function resumeDownload(episodeId: string): Promise<void> {
  const download = await findDownloadByEpisodeId(episodeId);
  if (!download || download.status === 'completed') {
    return;
  }
  await updateDownload(download, {
    status: 'pending',
    bytesDownloaded: 0,
    progress: 0,
    errorMessage: null,
  });
  scheduleQueue();
}

export async function cancelDownload(episodeId: string): Promise<void> {
  const active = activeTasks.get(episodeId);
  if (active) {
    active.cancel();
    activeTasks.delete(episodeId);
  }
  const download = await findDownloadByEpisodeId(episodeId);
  if (!download) {
    return;
  }
  if (download.localPath) {
    await RNFetchBlob.fs
      .unlink(download.localPath)
      .catch(() => undefined);
  }
  await database.write(async () => {
    await download.destroyPermanently();
  });
  scheduleQueue();
}

export async function deleteDownload(episodeId: string): Promise<void> {
  // For completed downloads, removes the file and DB row.
  await cancelDownload(episodeId);
}

export async function getLocalAudioUrlForEpisode(
  episodeId: string,
): Promise<string | undefined> {
  const download = await findDownloadByEpisodeId(episodeId);
  if (!download || download.status !== 'completed' || !download.localPath) {
    return undefined;
  }
  const exists = await RNFetchBlob.fs
    .exists(download.localPath)
    .catch(() => false);
  if (!exists) {
    // File missing; mark as failed so user can retry.
    await updateDownload(download, {
      status: 'failed',
      errorMessage: 'Local file missing',
    });
    return undefined;
  }
  return `file://${download.localPath}`;
}

export async function reconcileDownloadsOnBoot(): Promise<void> {
  await ensureDownloadsDirectory();

  // 1. Anything stuck in `downloading` from a force-quit → reset to pending.
  const stuck = await downloadsCollection
    .query(Q.where('status', 'downloading'))
    .fetch();

  for (const row of stuck) {
    await updateDownload(row, {
      status: 'pending',
      bytesDownloaded: 0,
      progress: 0,
    });
  }

  // 2. Verify completed downloads still have their file on disk.
  const completed = await downloadsCollection
    .query(Q.where('status', 'completed'))
    .fetch();

  for (const row of completed) {
    if (!row.localPath) {
      await updateDownload(row, {
        status: 'failed',
        errorMessage: 'Local path missing',
      });
      continue;
    }
    const exists = await RNFetchBlob.fs
      .exists(row.localPath)
      .catch(() => false);
    if (!exists) {
      await updateDownload(row, {
        status: 'failed',
        errorMessage: 'Local file missing',
      });
    }
  }

  // 3. Remove orphan files (on disk but not in DB).
  const allRows = await downloadsCollection.query().fetch();
  const knownPaths = new Set(
    allRows.map(row => row.localPath).filter(Boolean) as string[],
  );
  const filesOnDisk = await RNFetchBlob.fs
    .ls(DOWNLOADS_DIR)
    .catch(() => [] as string[]);
  for (const filename of filesOnDisk) {
    const fullPath = `${DOWNLOADS_DIR}/${filename}`;
    if (!knownPaths.has(fullPath)) {
      await RNFetchBlob.fs.unlink(fullPath).catch(() => undefined);
    }
  }

  scheduleQueue();
}

let scheduling = false;

function scheduleQueue() {
  if (scheduling) {
    return;
  }
  scheduling = true;
  // Defer to next tick so multiple synchronous calls coalesce.
  setTimeout(() => {
    scheduling = false;
    runScheduler().catch(error => {
      // eslint-disable-next-line no-console
      console.warn('[downloads] scheduler error', error);
    });
  }, 0);
}

async function runScheduler() {
  while (activeTasks.size < MAX_CONCURRENT_DOWNLOADS) {
    const next = await downloadsCollection
      .query(Q.where('status', 'pending'), Q.sortBy('updated_at', Q.asc))
      .fetch();
    // eslint-disable-next-line no-console
    console.log(
      '[downloads] scheduler tick — pending:',
      next.length,
      'active:',
      activeTasks.size,
    );
    const candidate = next.find(row => !activeTasks.has(row.episodeId));
    if (!candidate) {
      return;
    }
    // Reserve the slot synchronously so the next while-iteration sees it.
    activeTasks.set(candidate.episodeId, {
      episodeId: candidate.episodeId,
      cancel: () => undefined,
    });
    startDownload(candidate).catch(error => {
      // eslint-disable-next-line no-console
      console.warn('[downloads] start failed', candidate.episodeId, error);
      activeTasks.delete(candidate.episodeId);
    });
  }
}

async function startDownload(download: Download) {
  const episodeId = download.episodeId;
  const localPath = buildLocalPath(episodeId);

  // Commit "downloading" status BEFORE starting the fetch, so progress events
  // that arrive immediately don't race with a stale 'pending' read.
  await updateDownload(download, {
    status: 'downloading',
    localPath,
    errorMessage: null,
  });

  // eslint-disable-next-line no-console
  console.log('[downloads] starting', episodeId, '→', download.audioUrl);

  const task = RNFetchBlob.config({
    path: localPath,
    fileCache: true,
    overwrite: true,
  }).fetch('GET', download.audioUrl);

  let cancelled = false;
  const cancel = () => {
    cancelled = true;
    task.cancel(() => undefined);
  };
  activeTasks.set(episodeId, {episodeId, cancel});

  let progressFireCount = 0;
  task.progress({count: 100, interval: 250}, (received, total) => {
    if (cancelled) {
      return;
    }
    progressFireCount += 1;
    const receivedNum = Number(received) || 0;
    const totalNum = Number(total);
    const knownTotal = Number.isFinite(totalNum) && totalNum > 0 ? totalNum : 0;

    if (progressFireCount === 1 || progressFireCount % 20 === 0) {
      // eslint-disable-next-line no-console
      console.log(
        '[downloads] progress',
        episodeId,
        `${receivedNum} / ${knownTotal || '?'}`,
      );
    }

    const now = Date.now();
    const lastWrite = lastProgressWriteAt.get(episodeId) ?? 0;
    if (now - lastWrite < PROGRESS_WRITE_INTERVAL_MS) {
      return;
    }
    lastProgressWriteAt.set(episodeId, now);
    findDownloadByEpisodeId(episodeId)
      .then(latest => {
        if (!latest) {
          return undefined;
        }
        return updateDownload(latest, {
          bytesDownloaded: receivedNum,
          bytesTotal: knownTotal,
          // If the server omits Content-Length (chunked), we can't compute a
          // real percentage. Show a slow asymptotic placeholder driven by
          // bytes downloaded so the UI doesn't read as "stuck at 0%".
          progress:
            knownTotal > 0
              ? receivedNum / knownTotal
              : Math.min(0.95, 1 - 1 / (1 + receivedNum / (1024 * 1024))),
        });
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.warn('[downloads] progress write failed', episodeId, error);
      });
  });

  try {
    const response = await task;
    activeTasks.delete(episodeId);
    lastProgressWriteAt.delete(episodeId);
    if (cancelled) {
      return;
    }
    const status = response.respInfo?.status ?? 0;
    // eslint-disable-next-line no-console
    console.log('[downloads] response', episodeId, 'status', status);
    if (status < 200 || status >= 300) {
      await markFailed(episodeId, `HTTP ${status}`);
      scheduleQueue();
      return;
    }
    const latest = await findDownloadByEpisodeId(episodeId);
    if (!latest) {
      scheduleQueue();
      return;
    }
    await updateDownload(latest, {
      status: 'completed',
      progress: 1,
      bytesDownloaded: latest.bytesTotal || latest.bytesDownloaded,
      completedAt: new Date(),
      errorMessage: null,
    });
    // eslint-disable-next-line no-console
    console.log('[downloads] completed', episodeId);
    scheduleQueue();
  } catch (error) {
    activeTasks.delete(episodeId);
    lastProgressWriteAt.delete(episodeId);
    if (cancelled) {
      scheduleQueue();
      return;
    }
    const message =
      error instanceof Error ? error.message : 'Download failed';
    // eslint-disable-next-line no-console
    console.warn('[downloads] task failed', episodeId, message);
    await markFailed(episodeId, message);
    scheduleQueue();
  }
}

async function markFailed(episodeId: string, message: string) {
  const latest = await findDownloadByEpisodeId(episodeId);
  if (!latest) {
    return;
  }
  if (latest.localPath) {
    await RNFetchBlob.fs.unlink(latest.localPath).catch(() => undefined);
  }
  await updateDownload(latest, {
    status: 'failed',
    errorMessage: message,
    localPath: null,
  });
}
