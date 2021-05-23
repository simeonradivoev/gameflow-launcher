import ElectronStore from 'electron-store';
import SettingsElectronStore from '../../common/SettingsElectronStore';
import InitializeCommunityDatabase from '../Database/CommunityDatabase';
import { IRedditAuthAccessToken } from './IRedditAuthAccessToken';
import RedditAuth from './RedditAuth';

let lastAccessToken: Promise<IRedditAuthAccessToken | null> = Promise.resolve(
  null
);

export default (store: ElectronStore<SettingsElectronStore>) => {
  const setAccessTokenPromise = (
    token: Promise<IRedditAuthAccessToken | null>
  ) => {
    lastAccessToken = token;
  };

  setAccessTokenPromise(RedditAuth(store, lastAccessToken));
  InitializeCommunityDatabase(store, lastAccessToken, setAccessTokenPromise);
};
