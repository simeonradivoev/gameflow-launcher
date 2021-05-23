import { DateInput, IDateFormatProps, TimePicker } from '@blueprintjs/datetime';
import React from 'react';
import update from 'immutability-helper';
import { NumericInput } from '@blueprintjs/core';
import humanizeDuration from 'humanize-duration';

interface UpdateGameDurationFieldProps {
  field: string;
  target: any;
  updateTarget: (target: any) => void;
}

const UpdateGameDurationField: React.FC<UpdateGameDurationFieldProps> = ({
  field,
  target,
  updateTarget,
}) => {
  const handleDateChange = (valueAsNumber: number) => {
    if (Number.isNaN(valueAsNumber)) {
      return;
    }
    updateTarget(update(target, { [field]: { $set: valueAsNumber } }));
  };

  return (
    <NumericInput
      className="bp3-fill time-field"
      min={0}
      onValueChange={handleDateChange}
      placeholder="Duration in seconds"
      value={target[field]}
      stepSize={60}
      majorStepSize={3600}
      minorStepSize={1}
      rightElement={<div>{humanizeDuration((target[field] ?? 0) * 1000)}</div>}
    />
  );
};

export default UpdateGameDurationField;
