import {Q} from '@nozbe/watermelondb';
import {useEffect, useState} from 'react';

import {downloadsCollection} from '../db';
import {
  Download,
  DownloadStatus,
  EpisodeSnapshot,
} from '../db/models/Download';

export type DownloadView = {
  id: string;
  episodeId: string;
  audioUrl: string;
  status: DownloadStatus;
  progress: number;
  bytesDownloaded: number;
  bytesTotal: number;
  errorMessage?: string;
  localPath?: string;
  episodeSnapshot: EpisodeSnapshot;
  updatedAt: Date;
  completedAt?: Date;
};

const DOWNLOAD_OBSERVED_COLUMNS = [
  'status',
  'progress',
  'bytes_downloaded',
  'bytes_total',
  'error_message',
  'local_path',
  'updated_at',
];

function toView(record: Download): DownloadView {
  return {
    id: record.id,
    episodeId: record.episodeId,
    audioUrl: record.audioUrl,
    status: record.status,
    progress: record.progress,
    bytesDownloaded: record.bytesDownloaded,
    bytesTotal: record.bytesTotal,
    errorMessage: record.errorMessage,
    localPath: record.localPath,
    episodeSnapshot: record.episodeSnapshot,
    updatedAt: record.updatedAt,
    completedAt: record.completedAt,
  };
}

export function useDownload(episodeId?: string) {
  const [download, setDownload] = useState<DownloadView | undefined>();

  useEffect(() => {
    if (!episodeId) {
      setDownload(undefined);
      return;
    }

    const subscription = downloadsCollection
      .query(Q.where('episode_id', episodeId))
      .observeWithColumns(DOWNLOAD_OBSERVED_COLUMNS)
      .subscribe(rows => {
        setDownload(rows[0] ? toView(rows[0]) : undefined);
      });

    return () => subscription.unsubscribe();
  }, [episodeId]);

  return download;
}

export function useDownloadsList() {
  const [downloads, setDownloads] = useState<DownloadView[]>([]);

  useEffect(() => {
    const subscription = downloadsCollection
      .query(Q.sortBy('updated_at', Q.desc))
      .observeWithColumns(DOWNLOAD_OBSERVED_COLUMNS)
      .subscribe(rows => {
        setDownloads(rows.map(toView));
      });

    return () => subscription.unsubscribe();
  }, []);

  return downloads;
}
