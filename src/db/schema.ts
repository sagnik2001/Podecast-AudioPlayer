import {appSchema, tableSchema} from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'downloads',
      columns: [
        {name: 'episode_id', type: 'string', isIndexed: true},
        {name: 'audio_url', type: 'string'},
        {name: 'local_path', type: 'string', isOptional: true},
        {name: 'status', type: 'string', isIndexed: true},
        {name: 'bytes_downloaded', type: 'number'},
        {name: 'bytes_total', type: 'number'},
        {name: 'progress', type: 'number'},
        {name: 'error_message', type: 'string', isOptional: true},
        {name: 'episode_snapshot', type: 'string'},
        {name: 'created_at', type: 'number'},
        {name: 'updated_at', type: 'number'},
        {name: 'completed_at', type: 'number', isOptional: true},
      ],
    }),
  ],
});
