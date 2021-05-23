import { DateInput, IDateFormatProps } from '@blueprintjs/datetime';
import React from 'react';
import update from 'immutability-helper';

interface UpdateGameDateFieldProps {
  field: string;
  target: any;
  updateTarget: (target: any) => void;
}

const UpdateGameDateField: React.FC<UpdateGameDateFieldProps> = ({
  field,
  target,
  updateTarget,
}) => {
  const handleDateChange = (date: Date) => {
    updateTarget(update(target, { [field]: { $set: date } }));
  };

  return (
    <DateInput
      className="full-width"
      formatDate={(date) => date.toLocaleDateString()}
      onChange={handleDateChange}
      parseDate={(str) => new Date(str)}
      placeholder="M/D/YYYY"
      value={target[field]}
      canClearSelection
      showActionsBar
      highlightCurrentDay
    />
  );
};

export default UpdateGameDateField;
