import { BrowserWindow } from 'electron';
import ElectronStore from 'electron-store';
import { TypedWebContents } from 'electron-typed-ipc';
import os from 'os';
import { Events, typedIpcMain } from '../../common/NetworkChannels';
import SettingsElectronStore from '../../common/SettingsElectronStore';
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
  store: ElectronStore<SettingsElectronStore>,
  path: string,
  getMainWindow: () => BrowserWindow | null
) => {
  typedIpcMain.handle('GetUserName', () => {
    return os.userInfo().username;
  });

  let currentSettingsWindow: BrowserWindow | null = null;

  typedIpcMain.on('OpenSettings', async () => {
    const mainWindow = getMainWindow();
    if (mainWindow) {
      currentSettingsWindow = ensureWindow(currentSettingsWindow, mainWindow);
      const mainWindowContents: TypedWebContents<Events> =
        mainWindow.webContents;
      mainWindowContents.send('BlurWindow', true);
      await currentSettingsWindow.loadURL(
        `file://${path}/index.html#/settings`
      );
    }
  });

  typedIpcMain.on('CloseSettings', async () => {
    currentSettingsWindow?.destroy();
    currentSettingsWindow = null;
  });

  typedIpcMain.on('SaveSettings', async (e, newSettings) => {
    Object.entries(newSettings).forEach((kvp) => store.set(kvp[0], kvp[1]));
    BrowserWindow.getAllWindows().forEach((window) => {
      const typedWebContext = window.webContents as TypedWebContents<Events>;
      typedWebContext.send('SettingsChanged');
    });
  });
};
