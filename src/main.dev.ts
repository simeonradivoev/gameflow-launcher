/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import { app, BrowserWindow, Menu, shell, Tray } from 'electron';
import log from 'electron-log';
import ElectronStore from 'electron-store';
import { autoUpdater } from 'electron-updater';
import 'regenerator-runtime/runtime';
import SettingsElectronStore from './app/common/SettingsElectronStore';
import { getAssetPath, isDevelopment } from './app/electron/Common';
import
  {
    gameDataStore, InitializeDatabase
  } from './app/electron/Database/Database';
import { buildGameEntries } from './app/electron/Database/GameDatabase';
import InitializePlayActionCallbacks from './app/electron/PlayActions';
import RedditInstaller from './app/electron/Reddit/RedditInstaller';
import InitializeSettings from './app/electron/Settings/Settings';
import InitializeSteamAuth from './app/electron/Steam/SteamAuth';
import InitializeUpdateGame from './app/electron/UpdateGame/UpdateGameCallbacks';

const TRAY_GUID = 'b5819ead-7fe9-4d86-882b-4dbedac52730';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

const store = new ElectronStore<SettingsElectronStore>();
let mainWindow: BrowserWindow | null = null;
// Window that lets the app be in the background even if main window is closed
let backgroundWindow: BrowserWindow | null = null;
let appTray: Tray | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (isDevelopment()) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const bounds = store.has('Bounds')
    ? (store.get<string>('Bounds') as Electron.Rectangle)
    : null;

  const window = new BrowserWindow({
    show: false,
    width: bounds?.width ?? 1024,
    height: bounds?.height ?? 728,
    x: bounds?.x,
    y: bounds?.y,
    icon: getAssetPath('icons/icon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true,
      webSecurity: false,
      devTools: isDevelopment(),
    },
  });

  window.on('close', () => {
    store.set('Bounds', window.getBounds());
  });

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  window.webContents.on('did-finish-load', () => {
    if (!window) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      window.minimize();
    } else {
      window.show();
      window.focus();
      if (isDevelopment()) {
        window.webContents.openDevTools({ mode: 'undocked' });
      }
    }
  });

  window.on('close', (e) => {
    e.preventDefault();
    window.destroy();
  });

  // Open urls in the user's browser
  window.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
  return window;
};

const createTray = (openApp: () => void, quitApp: () => void): Tray => {
  const tray = new Tray(getAssetPath('icons/icon.ico'), TRAY_GUID);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open',
      type: 'normal',
      click: openApp,
    },
    {
      label: 'Exit',
      type: 'normal',
      click: quitApp,
    },
  ]);
  tray.setContextMenu(contextMenu);
  tray.on('double-click', openApp);
  tray.setToolTip('Gameflow');
  return tray;
};

const openApp = async () => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    mainWindow = await createWindow();
    await mainWindow.loadURL(`file://${__dirname}/index.html`);
  }
  mainWindow.focus();
};

const quitApp = () => {
  if (process.platform !== 'darwin') {
    backgroundWindow?.destroy();
    mainWindow?.destroy();
    appTray?.destroy();
    app.quit();
  }
};

app
  .whenReady()
  .then(async () => {
    ElectronStore.initRenderer();
    RedditInstaller(store);
    InitializeSteamAuth(store);
    appTray = createTray(openApp, quitApp);
    backgroundWindow = new BrowserWindow({ show: false });
    mainWindow = await createWindow();
    InitializeDatabase(() => mainWindow);
    InitializeUpdateGame(
      gameDataStore,
      __dirname,
      () => mainWindow,
      buildGameEntries
    );
    InitializePlayActionCallbacks(gameDataStore);
    InitializeSettings(store,
      __dirname,
      () => mainWindow);
    await mainWindow.loadURL(`file://${__dirname}/index.html`);
    return { mainWindow, appTray };
  })
  .catch(console.error);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});
