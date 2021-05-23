import Datastore from 'nedb-promises';
import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { TypedWebContents } from 'electron-typed-ipc';
import { accessSync, constants, mkdir, writeFile } from 'fs';
import path from 'path';
import console from 'console';
import GameEntry from '../../common/Types/GameEntry';
import Game from '../../common/Types/Game';
import { Events, typedIpcMain } from '../../common/NetworkChannels';
import { ActionType, Guid } from '../../common/Types';
import { getAssetPath, hashCode } from '../Common';

const icon256 = require('icon256');

export const buildGameEntries = async (gameDataStore: Datastore) => {
  const games = await gameDataStore.find<Game>({});
  return games.map((game) => new GameEntry(game.id, game.name, game.favorite));
};

export default (
  gameDataStore: Datastore,
  mainWindowGetter: () => BrowserWindow | null
) => {
  typedIpcMain.on('MarkFavoriteRequest', async (e, gameId: string) => {
    await gameDataStore.update<Game>(
      { id: gameId },
      { $set: { favorite: true } }
    );
    const mainWindow = mainWindowGetter();
    if (mainWindow) {
      const contents: TypedWebContents<Events> = mainWindow.webContents;
      contents.send(
        'GetGameListResponse',
        await buildGameEntries(gameDataStore)
      );
    }
  });

  typedIpcMain.on('UnmarkFavoriteRequest', async (e, gameId: string) => {
    await gameDataStore.update<Game>(
      { id: gameId },
      { $set: { favorite: false } }
    );
    const mainWindow = mainWindowGetter();
    if (mainWindow) {
      const contents: TypedWebContents<Events> = mainWindow.webContents;
      contents.send(
        'GetGameListResponse',
        await buildGameEntries(gameDataStore)
      );
    }
  });

  typedIpcMain.handle('GetGameRequest', async (e, gameId: string) => {
    const game: Game = await gameDataStore.findOne<Game>({ id: gameId });
    return game;
  });

  typedIpcMain.on('GetGameListRequest', async (e) => {
    const mainWindow = mainWindowGetter();
    if (mainWindow) {
      const contents: TypedWebContents<Events> = mainWindow.webContents;
      contents.send(
        'GetGameListResponse',
        await buildGameEntries(gameDataStore)
      );
    }
  });

  typedIpcMain.on('DeleteGameRequest', async (e, gameId: string) => {
    console.log('Delete Game');
    await gameDataStore.remove({ id: gameId }, {});
    e.reply('GetGameListResponse', await buildGameEntries(gameDataStore));
  });

  typedIpcMain.handle('OpenFoldersDialogRequest', async (e) => {
    const window = BrowserWindow.fromWebContents(e.sender);
    if (window) {
      const props = await dialog.showOpenDialog(window, {
        properties: ['openDirectory'],
      });
      return props.filePaths;
    }

    return [];
  });

  typedIpcMain.handle('GetGameIcon', async (e, gameId: Guid) => {
    const cachePath = app.getPath('cache');
    const game = await gameDataStore.findOne<Game>({ id: gameId });
    if (
      game &&
      game.playAction &&
      game.playAction.type === ActionType.EXECUTABLE &&
      game.playAction.path
    ) {
      const iconFolder = path.join(cachePath, 'gameflow-launcher', 'icons');
      const iconPath = path.join(
        iconFolder,
        `${gameId}.${hashCode(game.playAction.path)}.png`
      );

      try {
        accessSync(iconPath, constants.R_OK);
        return iconPath;
      } catch (accessError) {
        try {
          const data = await icon256.extractIconAsync(game.playAction.path);

          const iconPromise = new Promise<void>((resolve, reject) => {
            console.log(`Trying to creat new icon ${iconPath}`);
            mkdir(iconFolder, { recursive: true }, (mkdirError) => {
              if (mkdirError) {
                reject(mkdirError);
                console.error(mkdirError);
              } else {
                writeFile(
                  iconPath,
                  data.replace(/^data:image\/png;base64,/, ''),
                  'base64',
                  (writeFileError) => {
                    if (writeFileError) {
                      reject(writeFileError);
                      console.error(writeFileError);
                    } else {
                      resolve();
                      console.log(`Created new icon ${iconPath}`);
                    }
                  }
                );
              }
            });
          });

          await iconPromise;

          return iconPath;
        } catch (writeError) {
          console.error(writeError);
        }
      }
    }

    const defaultIcon = getAssetPath('icons/icon.svg');
    console.log(defaultIcon);
    return defaultIcon;
  });
};
