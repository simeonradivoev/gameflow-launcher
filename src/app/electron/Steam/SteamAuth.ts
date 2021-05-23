import { ElectronSteam } from 'electron-steam';
import ElectronStore from 'electron-store';
import { typedIpcMain } from '../../common/NetworkChannels';
import SettingsElectronStore from '../../common/SettingsElectronStore';

export default (store: ElectronStore<SettingsElectronStore>) => {
  const settings = store.store;

  if (!settings.steamApi) {
    console.log('No Steam API found');
    return;
  }

  typedIpcMain.on('LoginSteam', () => {
    if (!settings.steamApi) {
      return;
    }

    const steam = new ElectronSteam(settings.steamApi);
    try {
      if (steam.token) {
        console.log(steam.token);
      } else {
        steam.authenticate(
          (user, token) => {
            store.set('steamUser', user);
            store.set('steamProfile', token);
          },
          { window: { closable: true } }
        );
      }
    } catch (e) {
      console.log(e);
    }
  });
};
