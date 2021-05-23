import React from 'react';
import update from 'immutability-helper';
import { Classes } from '@blueprintjs/core';

interface UpdateGameFieldProps {
  field: string;
  target: any;
  updateTarget: (target: any) => void;
  inputType?: string;
}

const UpdateGameField: React.FC<UpdateGameFieldProps> = ({
  field,
  target,
  updateTarget,
  inputType,
}) => {
  return (
    <input
      id={field}
      className={Classes.INPUT}
      type={inputType ?? 'text'}
      value={target[field] ?? ''}
      onChange={async (e) => {
        updateTarget(update(target, { [field]: { $set: e.target.value } }));
      }}
    />
  );
};

export default UpdateGameField;
