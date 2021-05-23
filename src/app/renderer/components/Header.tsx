import { Button, Menu, MenuItem } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import ElectronStore from 'electron-store';
import React, { useEffect, useState } from 'react';
import { MdGames, MdHome } from 'react-icons/md';
import { useHistory, useLocation } from 'react-router-dom';
import { typedIpcRenderer } from '../../common/NetworkChannels';
import SettingsElectronStore from '../../common/SettingsElectronStore';
import {
  useStateElectronStoreKey,
  useStateWithLocalStorage,
} from './Extensions';

interface HeaderProps {
  store: ElectronStore<SettingsElectronStore>;
}

const Header: React.FC<HeaderProps> = ({ store }) => {
  const location = useLocation();
  const history = useHistory();
  const [selectedTab, setSelectedTab] = useStateWithLocalStorage(
    'selectedTab',
    '/'
  );
  const [machineUsername, setMachineUsername] = useState('');
  const [steamUser] = useStateElectronStoreKey(store, 'steamUser');
  const [steamProfile] = useStateElectronStoreKey(store, 'steamProfile');
  const [steamApi] = useStateElectronStoreKey(store, 'steamApi');

  useEffect(() => {
    history.replace(selectedTab);
    typedIpcRenderer
      .invoke('GetUserName')
      .then((name) => setMachineUsername(name))
      .catch();
  }, [selectedTab]);

  const getNavLinkClass = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="app-header">
      <div className="menu">
        <div
          className={`element ${getNavLinkClass('/')}`}
          onClick={() => setSelectedTab('/')}
        >
          <div className="label">
            <MdHome /> HOME
          </div>
        </div>
        <div
          className={`element ${getNavLinkClass('/library')}`}
          onClick={() => setSelectedTab('/library')}
        >
          <div className="label">
            <MdGames /> LIBRARY
          </div>
        </div>
      </div>
      <div id="user-controls">
        <div id="username">
          {steamUser?.personaname ? steamUser.personaname : machineUsername}
        </div>
        <Popover2
          content={
            <Menu className="bp3-body">
              <MenuItem
                text="Settings"
                icon="settings"
                onClick={() => typedIpcRenderer.send('OpenSettings')}
              />
              <MenuItem
                text="Login"
                icon="log-in"
                disabled={!steamApi}
                onClick={() => typedIpcRenderer.send('LoginSteam')}
              />
              <MenuItem
                text="Log Out"
                icon="log-out"
                disabled={!steamUser}
                onClick={() => {
                  store.delete('steamUser');
                  store.delete('steamProfile');
                }}
              />
            </Menu>
          }
          placement="bottom-start"
          inheritDarkTheme={false}
          transitionDuration={0}
        >
          <Button
            id="avatar-circle"
            style={{
              backgroundImage: steamUser?.avatar
                ? `url(${steamUser.avatar})`
                : "url('https://www.gravatar.com/avatar')",
            }}
          />
        </Popover2>
      </div>
    </div>
  );
};

export default Header;
