import { ipcRenderer } from 'electron';
import ElectronStore from 'electron-store';
import { TypedIpcRenderer } from 'electron-typed-ipc';
import React, { useEffect, useState } from 'react';
import { Commands, Events } from '../../common/NetworkChannels';
import SettingsElectronStore from '../../common/SettingsElectronStore';
import { IGameEntry } from '../../common/Types';
import {
  useStateWithLocalStorageWithNull,
  useStateWithSessionStorage,
} from './Extensions';
import Header from './Header';
import ListView from './ListView';
import SearchHeader from './SearchHeader';

const typedIpcRenderer = ipcRenderer as TypedIpcRenderer<Events, Commands>;

interface LibraryProps {
  store: ElectronStore<SettingsElectronStore>;
}

const Library: React.FC<LibraryProps> = ({ store }) => {
  const [games, setGames] = useState<IGameEntry[] | null>(null);
  const [selectedGame, setSelectedGame] = useStateWithLocalStorageWithNull(
    'selectedGame'
  );
  const [searchFilter, setSearchFilter] = useStateWithSessionStorage(
    'searchFilter',
    ''
  );

  useEffect(() => {
    // Initial games retrieval 2
    const getGameListResponse = (e: any, updatedGames: IGameEntry[]) => {
      setGames(updatedGames);
    };
    typedIpcRenderer.on('GetGameListResponse', getGameListResponse);

    if (!games) {
      typedIpcRenderer.send('GetGameListRequest');
      console.log('Requesting games');
    }

    return () => {
      typedIpcRenderer.off('GetGameListResponse', getGameListResponse);
    };
  }, [games]);

  const startAddingGame = () => {
    typedIpcRenderer.send('StartAddingGameRequest');
  };

  const startEditingGame = async (gameId: string) => {
    typedIpcRenderer.send('StartEditingGameRequest', gameId);
  };

  return (
    <div className="opaque-view">
      <Header store={store} />
      <div className="main-view">
        <SearchHeader
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
          startAddingNewGame={startAddingGame}
        />
        {games && (
          <ListView
            gameProperties={{
              games,
              selectedGame,
              setSelectedGame,
              searchFilter,
            }}
            deleteGame={(gameId: string) => {
              typedIpcRenderer.send('DeleteGameRequest', gameId);
            }}
            editGame={startEditingGame}
          />
        )}
      </div>
    </div>
  );
};

export default Library;
