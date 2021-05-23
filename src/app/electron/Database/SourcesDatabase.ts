import Datastore from 'nedb-promises';
import { BrowserWindow, ipcMain } from 'electron';
import { TypedIpcMain, TypedWebContents } from 'electron-typed-ipc';
import { GameSource } from '../../common/Types';
import { Commands, Events, typedIpcMain } from '../../common/NetworkChannels';

export default (gameDataStore: Datastore) => {
  typedIpcMain.on('GetSourcesListRequest', async (e) => {
    e.reply('GetSourcesListResponse', await gameDataStore.find<GameSource>({}));
  });
  typedIpcMain.on('CreateSourceRequest', async (e, source: GameSource) => {
    await gameDataStore.insert<GameSource>(source);
    BrowserWindow.getAllWindows().forEach(async (window) => {
      const contents: TypedWebContents<Events> = window.webContents;
      contents.send(
        'GetSourcesListResponse',
        await gameDataStore.find<GameSource>({})
      );
    });
  });
};
