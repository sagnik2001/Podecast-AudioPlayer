import {Database} from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import {Download} from './models/Download';
import {schema} from './schema';

const adapter = new SQLiteAdapter({
  schema,
  // JSI requires extra native setup on Android. Async dispatcher is autolinked
  // and fast enough for downloads + library scale; flip this to true after
  // wiring WatermelonDBJSIPackage in MainApplication if you need it.
  jsi: false,
  onSetUpError: error => {
    // eslint-disable-next-line no-console
    console.warn('[watermelondb] setup error', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [Download],
});

export const downloadsCollection = database.collections.get<Download>('downloads');
