import { ContextMenu } from '@blueprintjs/core';
import React, { useEffect, useState } from 'react';
import { typedIpcRenderer } from '../../../common/NetworkChannels';
import { IGameEntry } from '../../../common/Types';
import GameListContextMenu from './GameListContextMenu';

interface GameListGameProps {
  isSelected: boolean;
  isNextSelected: boolean;
  game: IGameEntry;
  setSelectedGame: (gameId: string) => void;
  deleteGame: (gameId: string) => void;
  editGame: (gameId: string) => void;
}

const GameListGame: React.FC<GameListGameProps> = ({
  isSelected,
  isNextSelected,
  game,
  setSelectedGame,
  deleteGame,
  editGame,
}) => {
  const [gameIcon, setGameIcon] = useState('');

  useEffect(() => {
    typedIpcRenderer
      .invoke('GetGameIcon', game.id)
      .then((path) => {
        return setGameIcon(path.replace(/\\/g, '/'));
      })
      .catch();
  }, [game]);

  // Mark the element right before the selected one to help with css effects
  return (
    <li
      key={game.id}
      className={'game-entry'
        .concat(isSelected ? ' selected' : '')
        .concat(isNextSelected ? ' selected-before' : '')}
    >
      <div
        className="content"
        onContextMenu={(e) => {
          const element = e.currentTarget as HTMLDivElement;
          const clientRect = element.getBoundingClientRect();

          ContextMenu.show(
            GameListContextMenu(game, deleteGame, editGame),
            { left: e.clientX, top: clientRect.y + clientRect.height },
            undefined
          );
        }}
        onClick={() => setSelectedGame(game.id)}
      >
        <img className="game-icon" src={gameIcon} alt={game.name} />
        {game.name}
      </div>
    </li>
  );
};
export default GameListGame;
