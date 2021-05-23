import React from 'react';
import update from 'immutability-helper';
import { ipcRenderer } from 'electron';
import { TypedIpcRenderer } from 'electron-typed-ipc';
import { Commands, Events } from '../../../common/NetworkChannels';

const typedIpcRenderer = ipcRenderer as TypedIpcRenderer<Events, Commands>;

interface UpdateGameFolderFieldProps {
  field: string;
  target: any;
  updateTarget: (target: any) => void;
}

const UpdateGameFolderField: React.FC<UpdateGameFolderFieldProps> = ({
  field,
  target,
  updateTarget,
}) => {
  return (
    <label className="bp3-file-input">
      <span
        onClick={async () => {
          const paths = await typedIpcRenderer.invoke(
            'OpenFoldersDialogRequest'
          );
          if (paths.length > 0) {
            updateTarget(update(target, { [field]: { $set: paths[0] } }));
          }
        }}
        className="bp3-file-upload-input"
      >
        {target[field] ? target[field] : 'Choose file...'}
      </span>
    </label>
  );
};

export default UpdateGameFolderField;
