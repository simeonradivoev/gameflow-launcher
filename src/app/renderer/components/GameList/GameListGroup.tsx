import React, { MouseEvent } from 'react';
import { AiFillCaretDown, AiFillCaretUp } from 'react-icons/ai';
import { useStateWithLocalStorageWithNull } from '../Extensions';
import { IGameEntry } from '../../../common/Types';
import GameListGame from './GameListGame';

interface GameListGroupProps {
  name: string;
  id: string;
  games: Array<IGameEntry>;
  gameFilter?: (game: IGameEntry) => boolean;
  selectedGame: string | null;
  setSelectedGame: (gameId: string) => void;
  icon?: JSX.Element;
  deleteGame: (gameId: string) => void;
  editGame: (gameId: string) => void;
}

const GameListGroup: React.FC<GameListGroupProps> = ({
  id,
  name,
  games,
  gameFilter,
  selectedGame,
  setSelectedGame,
  icon,
  deleteGame,
  editGame,
}) => {
  const [isExpanded, setIsExpanded] = useStateWithLocalStorageWithNull(id);

  const filtered = gameFilter ? games.filter(gameFilter) : games;
  const rows: Array<JSX.Element> = [];

  if (isExpanded) {
    // Build the game list react elements
    filtered.forEach((game, index) => {
      const isSelected = selectedGame === game.id;
      const isNextSelected =
        index < filtered.length - 1 && filtered[index + 1].id === selectedGame;

      rows.push(
        <GameListGame
          isSelected={isSelected}
          isNextSelected={isNextSelected}
          game={game}
          setSelectedGame={setSelectedGame}
          deleteGame={deleteGame}
          editGame={editGame}
        />
      );
    });
  }

  return (
    <ul className="group">
      <div className="header-back">
        <div
          onClick={() => setIsExpanded(isExpanded ? null : 'true')}
          className="header"
        >
          {icon}
          <span>{name}</span>
          <div className="counter">{filtered.length}</div>
          <div className="expand">
            {isExpanded ? (
              <AiFillCaretUp className="expanded" />
            ) : (
              <AiFillCaretDown />
            )}
          </div>
        </div>
      </div>
      {rows}
    </ul>
  );
};

export default GameListGroup;
