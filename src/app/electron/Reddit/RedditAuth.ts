import { assert } from 'console';
import { net } from 'electron';
import ElectronStore from 'electron-store';
import Snoowrap from 'snoowrap';
import SettingsElectronStore from '../../common/SettingsElectronStore';
import { IRedditAuthAccessToken } from './IRedditAuthAccessToken';

const deviceId = 'test_game_manager_app';

const requestNewToken = (
  clilentId: string
): Promise<IRedditAuthAccessToken> => {
  const request = net.request({
    method: 'POST',
    protocol: 'http:',
    hostname: 'www.reddit.com',
    path: `api/v1/access_token`,
  });

  request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
  // Content-Length', postData.length.toString());
  request.write(
    `grant_type=https://oauth.reddit.com/grants/installed_client&device_id=${deviceId}`
  );

  request.on('login', (authInfo, callback) => {
    callback(clilentId, '');
  });

  const responsePromise = new Promise<IRedditAuthAccessToken>(
    (resolve, reject) => {
      request.on('response', (response) => {
        console.log(`STATUS: ${response.statusCode}`);

        let body = '';

        response.on('error', (error: any) => {
          reject(error);
        });
        response.on('data', (data) => {
          body += data;
        });
        response.on('end', () => {
          const tokenResponse = JSON.parse(body) as IRedditAuthAccessToken;
          // Make the time start from today so it's not just a duration.
          tokenResponse.expires_in += new Date().getTime() / 1000;
          resolve(tokenResponse);
        });
      });

      // error
      request.on('error', (error) => {
        reject(error);
      });
    }
  );

  request.end();
  return responsePromise;
};

const newRequest = (
  clientId: string
): Promise<IRedditAuthAccessToken | null> => {
  console.log('Requesting a new access token from Reddit');

  return requestNewToken(clientId)
    .then((accessToken) => {
      console.log('Successfully Received new access token from reddit');
      return accessToken;
    })
    .catch((e) => {
      console.error(e);
      return null;
    });
};

const validateAccessToken = async (
  clientId: string,
  token: Promise<IRedditAuthAccessToken | null>
) => {
  assert(token, 'Null access token');
  const nowSeconds = new Date().getTime() / 1000.0;
  let lastToken = await token;

  if (!lastToken) {
    const newAccessToken = newRequest(clientId);
    lastToken = await newAccessToken;
    return newAccessToken;
  }

  if (lastToken.expires_in < nowSeconds) {
    console.log('Old access token from reddit expired');
    const newAccessToken = newRequest(clientId);
    lastToken = await newAccessToken;
    return newAccessToken;
  }

  return token;
};

export const GetRequester = async (
  store: ElectronStore<SettingsElectronStore>,
  oldToken: Promise<IRedditAuthAccessToken | null>,
  updateTokenPromise: (
    newPromise: Promise<IRedditAuthAccessToken | null>
  ) => void
) => {
  if (!store.store.redditClientId) {
    return Promise.resolve(null);
  }

  const newTokenPromise = validateAccessToken(
    store.store.redditClientId,
    oldToken
  );
  updateTokenPromise(newTokenPromise);
  const newToken = await newTokenPromise;
  if (!newToken) {
    return null;
  }
  return new Snoowrap({
    userAgent: deviceId,
    clientId: store.store.redditClientId,
    accessToken: newToken.access_token,
  });
};

export default (
  store: ElectronStore<SettingsElectronStore>,
  lastTokenPromise: Promise<IRedditAuthAccessToken | null>
): Promise<IRedditAuthAccessToken | null> => {
  const settings = store.store;

  if (!settings.redditClientId) {
    console.log('No reddit client id found');
    return Promise.resolve(null);
  }

  const accessToken = settings.redditAuthAccessToken;
  let newAccessTokenPromise: Promise<IRedditAuthAccessToken | null>;

  if (accessToken) {
    if (accessToken.expires_in) {
      newAccessTokenPromise = Promise.resolve(accessToken);
      console.log(
        `Found stored access token from reddit. Expires in ${Math.round(
          (accessToken.expires_in - new Date().getTime() / 1000.0) / 60
        )} minutes`
      );
    }
  }

  newAccessTokenPromise = validateAccessToken(
    settings.redditClientId,
    lastTokenPromise
  )
    .then((newToken) => {
      store.set('redditAuthAccessToken', newToken);
      return newToken;
    })
    .catch((error) => {
      console.error(error);
      return null;
    });

  return newAccessTokenPromise;
};
