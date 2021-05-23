import { BrowserWindow, dialog, shell } from 'electron';
import { TypedWebContents } from 'electron-typed-ipc';
import { exiftool } from 'exiftool-vendored';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Events, typedIpcMain } from '../../common/NetworkChannels';
import Game from '../../common/Types/Game';
import GameEntry from '../../common/Types/GameEntry';
import { getAssetPath, isDevelopment } from '../Common';

const ensureWindow = (
  existingWindow: BrowserWindow | null,
  mainWindow: BrowserWindow
): BrowserWindow => {
  const mainWindowBounds = mainWindow.getBounds();
  const desiredWidth = Math.round(mainWindowBounds.width * 0.7);
  const desiredHeight = Math.round(mainWindowBounds.height * 0.7);

  const minWidth = 720;
  const minHeight = 512;

  const width = Math.max(minWidth, desiredWidth);
  const height = Math.max(minHeight, desiredHeight);

  if (!existingWindow || existingWindow.isDestroyed()) {
    const newWindow = new BrowserWindow({
      show: false,
      width,
      height,
      minWidth,
      minHeight,
      x:
        mainWindowBounds.x +
        Math.round(mainWindowBounds.width / 2) -
        Math.round(width / 2),
      y:
        mainWindowBounds.y +
        Math.round(mainWindowBounds.height / 2) -
        Math.round(height / 2),
      icon: getAssetPath('icon.png'),
      parent: mainWindow,
      transparent: true,
      modal: true,
      frame: false,
      resizable: false,
      webPreferences: {
        nodeIntegration: true,
        devTools: isDevelopment(),
      },
    });

    newWindow.removeMenu();

    newWindow.on('closed', () => {
      const contents: TypedWebContents<Events> = mainWindow.webContents;
      contents.send('BlurWindow', false);
    });

    newWindow.webContents.on('did-finish-load', () => {
      if (!newWindow) {
        throw new Error('"window" is not defined');
      }
      newWindow.show();
      newWindow.focus();
      if (isDevelopment()) {
        newWindow.webContents.openDevTools({ mode: 'undocked' });
      }
    });

    return newWindow;
  }

  return existingWindow;
};

export default (
  gameDataStore: Datastore,
  appPath: string,
  getMainWindow: () => BrowserWindow | null,
  buildGameEntries: (datastore: Datastore) => Promise<Array<GameEntry>>
) => {
  let currentUpdateGameWindow: BrowserWindow | null = null;

  typedIpcMain.on('StartEditingGameRequest', async (e, gameId) => {
    const mainWindow = getMainWindow();
    if (mainWindow) {
      currentUpdateGameWindow = ensureWindow(
        currentUpdateGameWindow,
        mainWindow
      );
      const mainWindowContents: TypedWebContents<Events> =
        mainWindow.webContents;
      mainWindowContents.send('BlurWindow', true);
      await currentUpdateGameWindow.loadURL(
        `file://${appPath}/index.html#/updateGame`
      );

      const currentUpdateGameWindowContents: TypedWebContents<Events> =
        currentUpdateGameWindow.webContents;
      const game = await gameDataStore.findOne<Game>({ id: gameId });
      currentUpdateGameWindowContents.send('StartEditingGameResponse', game);
    }
  });

  typedIpcMain.on('StartAddingGameRequest', async (e) => {
    const mainWindow = getMainWindow();
    if (mainWindow) {
      currentUpdateGameWindow = ensureWindow(
        currentUpdateGameWindow,
        mainWindow
      );

      const mainWindowContents: TypedWebContents<Events> =
        mainWindow.webContents;
      mainWindowContents.send('BlurWindow', true);
      await currentUpdateGameWindow.loadURL(
        `file://${appPath}/index.html#/updateGame`
      );
      const currentUpdateGameWindowContents: TypedWebContents<Events> =
        currentUpdateGameWindow.webContents;
      currentUpdateGameWindowContents.send('StartAddingGameResponse');
    }
  });

  typedIpcMain.on('CancelUpdateGameRequest', async (e) => {
    currentUpdateGameWindow?.destroy();
    currentUpdateGameWindow = null;
  });

  typedIpcMain.on('EditGameRequest', async (e, game) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender);

    if (!senderWindow) {
      return;
    }

    const existingGame = await gameDataStore.findOne<Game>({ id: game.id });

    if (!existingGame) {
      dialog.showMessageBoxSync(senderWindow, {
        type: 'error',
        buttons: ['OK'],
        title: 'No Such Game',
        message: `Game ${game.name} with id ${game.id} was not present in the database`,
      });
      return;
    }

    const mainWindow = getMainWindow();
    if (mainWindow) {
      await gameDataStore.update({ id: game.id }, game, { upsert: true });
      const gameEntires = await buildGameEntries(gameDataStore);
      mainWindow.webContents.send('GetGameListResponse', gameEntires);
      currentUpdateGameWindow?.webContents.send(
        'StartEditingGameResponse',
        game
      );
    }
  });

  typedIpcMain.on('AddGameRequest', async (e, game) => {
    const senderWindow = BrowserWindow.fromWebContents(e.sender);

    if (!senderWindow) {
      return;
    }

    const existingGame = await gameDataStore.findOne<Game>(game.id);

    if (existingGame) {
      dialog.showMessageBoxSync(senderWindow, {
        type: 'error',
        buttons: ['OK'],
        title: 'Existing Game',
        message: `Game ${game.name} with id ${game.id} already exists in the database`,
      });
      return;
    }

    const mainWindow = getMainWindow();
    if (mainWindow) {
      await gameDataStore.update({ id: game.id }, game, { upsert: true });
      const gameEntires = await buildGameEntries(gameDataStore);
      const mainWindowContents: TypedWebContents<Events> =
        mainWindow.webContents;
      mainWindowContents.send('GetGameListResponse', gameEntires);
    }

    // Close the window
    currentUpdateGameWindow?.destroy();
    currentUpdateGameWindow = null;
  });

  const processDroppedExe = async (filePath: string) => {
    try {
      const tags = (await exiftool.read(filePath)) as any;
      console.log(tags);
      if (tags.FileDescription) {
        const newGame = new Game(uuidv4(), tags.FileDescription);
        const mainWindow = getMainWindow();
        if (mainWindow) {
          await gameDataStore.update({ id: newGame.id }, newGame, {
            upsert: true,
          });
          const gameEntires = await buildGameEntries(gameDataStore);
          const mainWindowContents: TypedWebContents<Events> =
            mainWindow.webContents;
          mainWindowContents.send('GetGameListResponse', gameEntires);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  typedIpcMain.on('DropFiles', (e, files) => {
    files.forEach(async (filePath) => {
      const extension = path.extname(filePath);
      if (extension === '.lnk') {
        const shortcutDetails = shell.readShortcutLink(filePath);
        if (
          shortcutDetails.target &&
          path.extname(shortcutDetails.target) === '.exe'
        ) {
          await processDroppedExe(shortcutDetails.target);
        }
      } else if (extension === '.exe') {
        await processDroppedExe(filePath);
      }
    });
  });
};
