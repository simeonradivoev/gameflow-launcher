import React, { useEffect, useState } from 'react';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import { TypedIpcRenderer } from 'electron-typed-ipc';
import UpdateGamePopup from './UpdateGamePopup';
import { IGame } from '../../../common/Types';
import Game from '../../../common/Types/Game';
import { Commands, Events } from '../../../common/NetworkChannels';

const typedIpcRenderer = ipcRenderer as TypedIpcRenderer<Events, Commands>;

const UpdateGameInstaller: React.FC = () => {
  const initializeNewGame = (): IGame => {
    return new Game(uuidv4(), 'New Game');
  };

  const [updateGame, setUpdateGame] = useState<IGame>();
  const [sourceGame, setSourceGame] = useState<IGame>();
  // A bool to check if currently in the process of saving the game.
  const [savingGame, setSavingGame] = useState(false);

  useEffect(() => {
    const startEditingCallback = (_e: IpcRendererEvent, game: IGame) => {
      setUpdateGame(game);
      setSourceGame({ ...game });
    };
    const startAddingCallback = () => {
      setUpdateGame(initializeNewGame());
      setSourceGame(undefined);
    };
    typedIpcRenderer.on('StartEditingGameResponse', startEditingCallback);
    typedIpcRenderer.on('StartAddingGameResponse', startAddingCallback);
    return () => {
      typedIpcRenderer.removeListener(
        'StartEditingGameResponse',
        startEditingCallback
      );
      typedIpcRenderer.removeListener(
        'StartAddingGameResponse',
        startAddingCallback
      );
    };
  }, []);

  const saveGame = () => {
    if (updateGame) {
      if (sourceGame) {
        typedIpcRenderer.send('EditGameRequest', updateGame);
      } else {
        typedIpcRenderer.send('AddGameRequest', updateGame);
      }
    }
  };

  const cancelAddingGame = () => {
    typedIpcRenderer.send('CancelUpdateGameRequest');
  };

  return (
    <>
      {updateGame && (
        <UpdateGamePopup
          cancelAction={cancelAddingGame}
          sourceGame={sourceGame}
          updateGame={updateGame}
          setUpdateGame={setUpdateGame}
          savingGame={savingGame}
          saveGameAction={saveGame}
        />
      )}
    </>
  );
};

export default UpdateGameInstaller;
