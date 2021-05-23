import React from 'react';
import { IGame } from '../../../common/Types';
import Game from '../../../common/Types/Game';
import UpdateGameDateField from './UpdateGameDateField';
import UpdateGameDurationField from './UpdateGameDurationField';
import UpdateGameField from './UpdateGameField';
import UpdateGameFieldLabel from './UpdateGameFieldLabel';
import UpdateGameSourceFieldDropdown from './UpdateGameSourceFieldDropdown';

interface UpdateGameGeneralProps {
  source: Game;
  updateTarget: (game: IGame) => void;
  target: IGame;
}

const UpdateGameGeneral: React.FC<UpdateGameGeneralProps> = ({
  source,
  updateTarget,
  target,
}) => {
  return (
    <div>
      <UpdateGameFieldLabel
        name="Name"
        source={source}
        field="name"
        target={target}
        updateTarget={updateTarget}
      >
        <UpdateGameField
          field="name"
          target={target}
          updateTarget={updateTarget}
        />
      </UpdateGameFieldLabel>
      <UpdateGameFieldLabel
        name="Release Date"
        source={source}
        field="releaseDate"
        target={target}
        updateTarget={updateTarget}
      >
        <UpdateGameDateField
          field="releaseDate"
          target={target}
          updateTarget={updateTarget}
        />
      </UpdateGameFieldLabel>
      <UpdateGameFieldLabel
        name="Last Played"
        source={source}
        field="lastPlayed"
        target={target}
        updateTarget={updateTarget}
      >
        <UpdateGameDateField
          field="lastPlayed"
          target={target}
          updateTarget={updateTarget}
        />
      </UpdateGameFieldLabel>
      <UpdateGameFieldLabel
        name="Time Played"
        source={source}
        field="timePlayed"
        target={target}
        updateTarget={updateTarget}
      >
        <UpdateGameDurationField
          field="timePlayed"
          target={target}
          updateTarget={updateTarget}
        />
      </UpdateGameFieldLabel>
      <UpdateGameFieldLabel
        name="Source"
        source={source}
        field="source"
        target={target}
        updateTarget={updateTarget}
      >
        <UpdateGameSourceFieldDropdown
          target={target}
          updateTarget={updateTarget}
        />
      </UpdateGameFieldLabel>
      <UpdateGameFieldLabel
        name="Source Id"
        source={source}
        field="sourceId"
        target={target}
        updateTarget={updateTarget}
      >
        <UpdateGameField
          field="sourceId"
          target={target}
          updateTarget={updateTarget}
        />
      </UpdateGameFieldLabel>
    </div>
  );
};

export default UpdateGameGeneral;
