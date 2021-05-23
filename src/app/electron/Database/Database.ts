import { app, BrowserWindow } from 'electron';
import path from 'path';
import Datastore from 'nedb-promises';
import InitializeGameDatabase from './GameDatabase';
import InitializeSourcesDatabase from './SourcesDatabase';

export const gameDataStore = Datastore.create(
  path.join(app.getPath('userData'), 'db.db')
);

export const sourcesDataStore = Datastore.create(
  path.join(app.getPath('userData'), 'sources.db')
);

export const InitializeDatabase = (
  mainWIndowGetter: () => BrowserWindow | null
) => {
  gameDataStore.load();
  sourcesDataStore.load();

  InitializeGameDatabase(gameDataStore, mainWIndowGetter);
  InitializeSourcesDatabase(sourcesDataStore);
};
