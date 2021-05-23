import { ElectronSteamProfileToken, SteamUser } from 'electron-steam';
import { IRedditAuthAccessToken } from '../electron/Reddit/IRedditAuthAccessToken';

export default class SettingsElectronStore {
  steamApi?: string;

  redditAuthAccessToken?: IRedditAuthAccessToken;

  redditClientId?: string;

  steamUser?: SteamUser;

  steamProfile?: ElectronSteamProfileToken;
}
