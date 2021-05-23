import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import { TypedIpcRenderer } from 'electron-typed-ipc';
import { GamesProps, IGame } from '../../common/Types';
import DetailView from './DetailView';
import GameList from './GameList/GameList';
import { Commands, Events } from '../../common/NetworkChannels';

const typedIpcRenderer = ipcRenderer as TypedIpcRenderer<Events, Commands>;

type ListViewProps = {
  gameProperties: GamesProps;
  deleteGame: (gameId: string) => void;
  editGame: (gameId: string) => void;
};

const ListView: React.FC<ListViewProps> = ({
  gameProperties,
  deleteGame,
  editGame,
}) => {
  const [selectedGame, setSelectedGame] = useState<IGame | null>(null);

  useEffect(() => {
    if (gameProperties.selectedGame) {
      typedIpcRenderer
        .invoke('GetGameRequest', gameProperties.selectedGame)
        .then((game) => setSelectedGame(game))
        .catch();
    }
  }, [gameProperties]);

  return (
    <div className="list-view">
      <GameList
        deleteGame={deleteGame}
        editGame={editGame}
        gameProperties={gameProperties}
      />
      {selectedGame && (
        <DetailView
          deleteSelectedGame={deleteGame}
          selectedGame={selectedGame}
          startEditingGame={editGame}
        />
      )}
    </div>
  );
};

export default ListView;
