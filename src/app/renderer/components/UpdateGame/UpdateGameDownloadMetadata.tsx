import { Button, FormGroup, InputGroup } from '@blueprintjs/core';
import { ipcRenderer } from 'electron';
import { TypedIpcRenderer } from 'electron-typed-ipc';
import React, { useEffect, useState } from 'react';
import { Commands, Events } from '../../../common/NetworkChannels';
import { IGameMetadataEntry } from '../../../common/Types';

const typedIpcRenderer = ipcRenderer as TypedIpcRenderer<Events, Commands>;

interface UpdateGameDownloadMetadataProps {
  metadataSearch: string;
  setDownloadMetadataOpen: (open: boolean) => void;
  setMetadataSearch: (search: string) => void;
}

const UpdateGameDownloadMetadata: React.FC<UpdateGameDownloadMetadataProps> = ({
  metadataSearch,
  setDownloadMetadataOpen,
  setMetadataSearch,
}) => {
  const [metadataEntries, setMetadataEntries] = useState<Array<
    IGameMetadataEntry
  > | null>(null);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<any | undefined>();

  const updateEntires = async () => {
    const response: IGameMetadataEntry[] = await typedIpcRenderer.invoke(
      'GetMetadataSearchRequest',
      metadataSearch
    );

    setMetadataEntries(response);
  };

  useEffect(() => {
    if (!metadataEntries) {
      updateEntires();
    }
  });

  useEffect(() => {
    if (selectedEntryId) {
      typedIpcRenderer
        .invoke('GetMetadataGameRequest', selectedEntryId)
        .then((d) => setSelectedEntry(d))
        .catch();
    }
  }, [selectedEntryId]);

  return (
    <>
      <div className="menu">
        <form
          onSubmitCapture={(e) => {
            e.preventDefault();
          }}
          onSubmit={async (e) => {
            await updateEntires();
          }}
        >
          <InputGroup
            value={metadataSearch}
            onChange={(e) => setMetadataSearch(e.target.value)}
            leftIcon="search"
            type="search"
          />
        </form>
        <div className="items">
          {metadataEntries?.map((entry) => (
            <div
              className={`menu-entry ${
                selectedEntryId === entry.id ? 'selected' : ''
              }`}
              key={entry.id}
              onClick={() => setSelectedEntryId(entry.id)}
            >
              {entry.name}
            </div>
          ))}
        </div>
        <Button
          rightIcon="caret-up"
          className="button round-button"
          text="Source"
        />
      </div>
      <div className="options">
        <div className="minimal-scroll">
          {Object.keys(selectedEntry).map((key: string) => (
            <div key={key}>{`${key}: ${selectedEntry[key]}`}</div>
          ))}
        </div>
        <div className="bottom-buttons">
          <Button
            icon="download"
            className="button round-button"
            text="Download"
          />
          <Button
            icon="arrow-left"
            className="button round-button"
            text="Cancel"
            onClick={() => setDownloadMetadataOpen(false)}
          />
        </div>
      </div>
    </>
  );
};

export default UpdateGameDownloadMetadata;
