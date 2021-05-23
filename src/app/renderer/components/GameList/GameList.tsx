import React from 'react';
import { MdStar, MdList } from 'react-icons/md';
import GameListGroup from './GameListGroup';
import { GamesProps } from '../../../common/Types';

type GameListProperties = {
  gameProperties: GamesProps;
  deleteGame: (gameId: string) => void;
  editGame: (gameId: string) => void;
};

const GameList: React.FC<GameListProperties> = ({
  gameProperties,
  deleteGame,
  editGame,
}) => {
  const filtered = gameProperties.games.filter(
    (game) =>
      gameProperties.searchFilter === '' ||
      game.name
        .toLowerCase()
        .includes(gameProperties.searchFilter.toLowerCase())
  );

  return (
    <div className="minimal-scroll auto-hide-scroll game-list-scroll">
      <nav className="game-list">
        <GameListGroup
          id="favorites"
          name="Favorites"
          gameFilter={(game) => game.favorite ?? false}
          games={filtered}
          selectedGame={gameProperties.selectedGame}
          setSelectedGame={gameProperties.setSelectedGame}
          icon={<MdStar />}
          deleteGame={deleteGame}
          editGame={editGame}
        />
        <GameListGroup
          id="allGames"
          name="All Games"
          gameFilter={() => true}
          games={filtered}
          selectedGame={gameProperties.selectedGame}
          setSelectedGame={gameProperties.setSelectedGame}
          icon={<MdList />}
          deleteGame={deleteGame}
          editGame={editGame}
        />
      </nav>
    </div>
  );
};

export default GameList;
