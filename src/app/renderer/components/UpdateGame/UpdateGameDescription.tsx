import { InputGroup, TextArea } from '@blueprintjs/core';
import React from 'react';
import update from 'immutability-helper';
import { IGame } from '../../../common/Types';
import UpdateGameFieldLabel from './UpdateGameFieldLabel';

interface UpdateGameDescriptionProps {
  target: IGame;
  source: IGame;
  updateTarget: (target: IGame) => void;
}

const UpdateGameDescription: React.FC<UpdateGameDescriptionProps> = ({
  target,
  source,
  updateTarget,
}) => {
  return (
    <div>
      <UpdateGameFieldLabel
        className="top-label"
        name="Description"
        source={source}
        field="description"
        target={target}
        updateTarget={updateTarget}
      >
        <TextArea
          style={{ resize: 'none', flex: '1', height: '256px' }}
          value={target.description ?? ''}
          onChange={(e) => {
            updateTarget(
              update(target, { description: { $set: e.target.value } })
            );
          }}
        />
      </UpdateGameFieldLabel>
    </div>
  );
};

export default UpdateGameDescription;
