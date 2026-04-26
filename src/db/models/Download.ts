import {Model} from '@nozbe/watermelondb';
import {date, field, readonly} from '@nozbe/watermelondb/decorators';

export type DownloadStatus =
  | 'pending'
  | 'downloading'
  | 'completed'
  | 'failed'
  | 'paused';

export type EpisodeSnapshot = {
  title: string;
  show: string;
  description: string;
  duration: string;
  imageUrl?: string;
  accent: string;
  phase: string;
  tag: string;
  published: string;
};

export class Download extends Model {
  static table = 'downloads';

  @field('episode_id') episodeId!: string;
  @field('audio_url') audioUrl!: string;
  @field('local_path') localPath?: string;
  @field('status') status!: DownloadStatus;
  @field('bytes_downloaded') bytesDownloaded!: number;
  @field('bytes_total') bytesTotal!: number;
  @field('progress') progress!: number;
  @field('error_message') errorMessage?: string;
  @field('episode_snapshot') episodeSnapshotJson!: string;

  @readonly @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  @date('completed_at') completedAt?: Date;

  get episodeSnapshot(): EpisodeSnapshot {
    try {
      return JSON.parse(this.episodeSnapshotJson) as EpisodeSnapshot;
    } catch {
      return {
        title: 'Untitled',
        show: '',
        description: '',
        duration: '',
        accent: '#888',
        phase: '',
        tag: '',
        published: '',
      };
    }
  }
}
