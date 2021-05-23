import { Button, InputGroup } from '@blueprintjs/core';
import ElectronStore from 'electron-store';
import React, { useEffect, useState } from 'react';
import { MdTune } from 'react-icons/md';
import { typedIpcRenderer } from '../../../common/NetworkChannels';
import SettingsElectronStore from '../../../common/SettingsElectronStore';
import { TreeInfoSection } from '../../../common/Types';
import { useStateElectronStore } from '../Extensions';
import PopupMenu from '../Popup/PopupMenu';
import UpdateGameFieldLabel from '../UpdateGame/UpdateGameFieldLabel';

interface SettingsProps {
  store: ElectronStore<SettingsElectronStore>;
}

const getSettings = (store: ElectronStore<SettingsElectronStore>) => {
  const settings: SettingsElectronStore = {
    steamApi: store.get('steamApi'),
  };

  return settings;
};

const Settings: React.FC<SettingsProps> = ({ store }) => {
  const settings = store.store;
  const [sourceSettings] = useStateElectronStore(store);
  const [newSettings, setNewSettings] = useState({ ...settings });

  const sections: Array<TreeInfoSection> = [
    {
      name: 'Advanced',
      id: 'advanced',
      icon: <MdTune />,
    },
  ];

  useEffect(() => {
    const settingsChangedCallback = () => {
      const ogSettings = store.store;
      setNewSettings({ ...ogSettings });
    };
    typedIpcRenderer.on('SettingsChanged', settingsChangedCallback);

    return () => {
      typedIpcRenderer.off('SettingsChanged', settingsChangedCallback);
    };
  }, [store]);

  const contents: { [key: string]: JSX.Element } = {};

  contents.advanced = (
    <div>
      <UpdateGameFieldLabel
        name="Steam API Key"
        field="steamApi"
        target={newSettings}
        source={sourceSettings}
        updateTarget={setNewSettings}
      >
        <InputGroup
          value={newSettings.steamApi}
          onChange={(e) => {
            setNewSettings({ ...newSettings, steamApi: e.target.value });
          }}
        />
      </UpdateGameFieldLabel>
      <UpdateGameFieldLabel
        name="Reddit Client Id"
        field="redditClientId"
        target={newSettings}
        source={sourceSettings}
        updateTarget={setNewSettings}
      >
        <InputGroup
          value={newSettings.redditClientId ?? ''}
          onChange={(e) => {
            setNewSettings({ ...newSettings, redditClientId: e.target.value });
          }}
        />
      </UpdateGameFieldLabel>
    </div>
  );

  const [tabOpen, setTabOpen] = useState(sections[0]);

  return (
    <div className="update-game-popup sub-window-popup">
      <div className="title-bar">
        <Button icon="cross" />
      </div>
      <div className="content">
        <div className="menu">
          <h1>Settings</h1>
          <div className="items">
            <PopupMenu
              sections={sections}
              selectedSection={tabOpen}
              setSelectedSection={setTabOpen}
            />
          </div>
        </div>
        <div className="options">
          <h1>{tabOpen.name}</h1>
          <div className="options-fields minimal-scroll">
            {contents[tabOpen.id]}
          </div>
          <div className="bottom-buttons">
            <Button
              className="button round-button"
              icon="disable"
              text="Save"
              onClick={() => {
                typedIpcRenderer.send('SaveSettings', newSettings);
              }}
            />
            <Button
              className="button round-button"
              icon="disable"
              text="Cancel"
              onClick={() => {
                typedIpcRenderer.send('CloseSettings');
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
